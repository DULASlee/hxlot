using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.OpsManagement.Contracts.Logs;
using SmartAbp.OpsManagement.Entities;
using SmartAbp.OpsManagement.Domain.Repositories;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace SmartAbp.OpsManagement.Services;

/// <summary>
/// 日志管理应用服务（增强版-双写）
/// 实现日志双写：PostgreSQL（持久化） + Elasticsearch（全文搜索）
/// </summary>
public class LogsAppServiceEnhanced : ApplicationService
{
    private readonly IElasticsearchService _elasticsearchService;
    private readonly ILogEntryRepository _logEntryRepository;
    private readonly ILogger<LogsAppServiceEnhanced> _logger;

    public LogsAppServiceEnhanced(
        IElasticsearchService elasticsearchService,
        ILogEntryRepository logEntryRepository,
        ILogger<LogsAppServiceEnhanced> logger)
    {
        _elasticsearchService = elasticsearchService;
        _logEntryRepository = logEntryRepository;
        _logger = logger;
    }

    /// <summary>
    /// 搜索日志（从 Elasticsearch）
    /// </summary>
    public async Task<PagedResultDto<LogEntryDto>> SearchLogsAsync(LogSearchRequest input)
    {
        Check.NotNull(input, nameof(input));

        try
        {
            _logger.LogInformation(
                "Searching logs: Service={ServiceName}, Level={Level}, Keyword={Keyword}",
                input.ServiceName, input.Level, input.Keyword);

            var (total, documents) = await _elasticsearchService.SearchLogsAsync(input);

            var dtos = documents.Select(doc => new LogEntryDto
            {
                Id = doc.Id,
                Timestamp = doc.Timestamp,
                ServiceName = doc.ServiceName,
                Level = doc.Level,
                Message = doc.Message,
                Exception = doc.Exception,
                TraceId = doc.TraceId,
                RequestPath = doc.RequestPath,
                Duration = doc.Duration
            }).ToList();

            return new PagedResultDto<LogEntryDto>(total, dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to search logs");
            throw new BusinessException("OpsManagement:LogSearchFailed", "Failed to search logs");
        }
    }

    /// <summary>
    /// 获取日志统计
    /// </summary>
    public async Task<LogStatisticsDto> GetStatisticsAsync(DateTime startTime, DateTime endTime)
    {
        try
        {
            // 从数据库获取统计（更可靠）
            var logCountByLevel = await _logEntryRepository.GetLogCountByLevelAsync(startTime, endTime);

            var total = (long)logCountByLevel.Values.Sum();
            var error = (long)(logCountByLevel.GetValueOrDefault("Error", 0) + logCountByLevel.GetValueOrDefault("Fatal", 0));
            var warn = (long)logCountByLevel.GetValueOrDefault("Warning", 0);

            var dto = new LogStatisticsDto
            {
                TotalCount = total,
                ErrorCount = error,
                WarningCount = warn,
                ErrorRate = total == 0 ? 0 : Math.Round((double)error / total, 4),
                LevelCounts = logCountByLevel.ToDictionary(k => k.Key, v => (long)v.Value)
            };
            return dto;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get log statistics");
            throw new BusinessException("OpsManagement:LogStatisticsFailed", "Failed to get log statistics");
        }
    }

    /// <summary>
    /// 索引日志（双写：数据库 + Elasticsearch）
    /// </summary>
    public async Task<bool> IndexLogAsync(LogEntryDocument document)
    {
        Check.NotNull(document, nameof(document));

        try
        {
            // 1. 先保存到数据库
            var logEntry = new LogEntry(
                Guid.NewGuid(),
                document.Timestamp,
                document.Level,
                document.Message,
                document.ServiceName,
                retentionDays: 30)
            {
                InstanceId = null,
                Source = null,
                Exception = document.Exception,
                TraceId = document.TraceId,
                RequestPath = document.RequestPath,
                UserId = document.UserId,
                Metadata = null
            };

            await _logEntryRepository.InsertAsync(logEntry, autoSave: true);

            // 2. 异步索引到 Elasticsearch
            try
            {
                document.Id = logEntry.Id.ToString();
                var ok = await _elasticsearchService.IndexLogAsync(document);
                
                // 标记为已索引
                if (ok)
                {
                    logEntry.MarkAsIndexed(logEntry.Id.ToString());
                }
                await _logEntryRepository.UpdateAsync(logEntry, autoSave: true);

                _logger.LogInformation("Log indexed successfully: {LogId}", logEntry.Id);
                return ok;
            }
            catch (Exception esEx)
            {
                // Elasticsearch 失败不影响数据库保存
                _logger.LogWarning(esEx, "Failed to index log to Elasticsearch, but saved to database: {LogId}", logEntry.Id);
                return true; // 仅数据库成功也视为操作成功
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to index log");
            throw new BusinessException("OpsManagement:LogIndexFailed", "Failed to index log");
        }
    }

    /// <summary>
    /// 批量索引日志（双写优化）
    /// </summary>
    public async Task<bool> BulkIndexLogsAsync(List<LogEntryDocument> documents)
    {
        Check.NotNull(documents, nameof(documents));

        if (documents.Count == 0)
        {
            return false;
        }

        try
        {
            // 1. 批量保存到数据库
            var logEntries = documents.Select(doc => new LogEntry(
                Guid.NewGuid(),
                doc.Timestamp,
                doc.Level,
                doc.Message,
                doc.ServiceName,
                retentionDays: 30)
            {
                InstanceId = null,
                Source = null,
                Exception = doc.Exception,
                TraceId = doc.TraceId,
                RequestPath = doc.RequestPath,
                UserId = doc.UserId,
                Metadata = null
            }).ToList();

            await _logEntryRepository.BulkInsertAsync(logEntries);

            // 2. 异步批量索引到 Elasticsearch
            try
            {
                for (int i = 0; i < documents.Count; i++)
                {
                    documents[i].Id = logEntries[i].Id.ToString();
                }

                var success = await _elasticsearchService.BulkIndexLogsAsync(documents);

                // 标记已索引的日志
                if (success)
                {
                    foreach (var entry in logEntries)
                    {
                        entry.MarkAsIndexed(entry.Id.ToString());
                    }
                    await _logEntryRepository.UpdateManyAsync(logEntries, autoSave: true);
                }

                _logger.LogInformation("Bulk indexed {TotalCount} logs", documents.Count);
                return success;
            }
            catch (Exception esEx)
            {
                _logger.LogWarning(esEx, "Failed to bulk index logs to Elasticsearch, but saved to database");
                return true; // 仅数据库成功也视为操作成功
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to bulk index logs");
            throw new BusinessException("OpsManagement:BulkLogIndexFailed", "Failed to bulk index logs");
        }
    }

    /// <summary>
    /// 同步未索引的日志到 Elasticsearch
    /// 后台任务定期调用
    /// </summary>
    public async Task<int> SyncUnindexedLogsAsync(int maxCount = 1000)
    {
        try
        {
            var unindexedLogs = await _logEntryRepository.GetUnindexedLogsAsync(maxCount);

            if (unindexedLogs.Count == 0)
            {
                return 0;
            }

            var documents = unindexedLogs.Select(log => new LogEntryDocument
            {
                Id = log.Id.ToString(),
                Timestamp = log.Timestamp,
                Level = log.Level,
                Message = log.Message,
                ServiceName = log.ServiceName,
                Exception = log.Exception,
                TraceId = log.TraceId,
                RequestPath = log.RequestPath,
                UserId = log.UserId
            }).ToList();

            var success = await _elasticsearchService.BulkIndexLogsAsync(documents);

            // 标记已索引
            if (success)
            {
                foreach (var log in unindexedLogs)
                {
                    log.MarkAsIndexed(log.Id.ToString());
                }
                await _logEntryRepository.UpdateManyAsync(unindexedLogs, autoSave: true);

                _logger.LogInformation("Synced {TotalCount} unindexed logs to Elasticsearch", unindexedLogs.Count);
            }

            return success ? unindexedLogs.Count : 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync unindexed logs");
            return 0;
        }
    }

    /// <summary>
    /// 清理过期日志
    /// 后台任务定期调用
    /// </summary>
    public async Task<int> CleanupExpiredLogsAsync()
    {
        try
        {
            var beforeDate = DateTime.UtcNow;
            await _logEntryRepository.DeleteExpiredLogsAsync(beforeDate);

            _logger.LogInformation("Cleaned up expired logs before {BeforeDate}", beforeDate);
            return 1;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cleanup expired logs");
            return 0;
        }
    }
}

