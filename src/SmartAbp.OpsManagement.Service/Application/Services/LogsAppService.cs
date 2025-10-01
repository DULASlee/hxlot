using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.OpsManagement.Contracts.Logs;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace SmartAbp.OpsManagement.Services;

/// <summary>
/// 日志管理应用服务
/// </summary>
public class LogsAppService : ApplicationService, ILogsAppService
{
    private readonly IElasticsearchService _elasticsearchService;
    private readonly ILogger<LogsAppService> _logger;

    public LogsAppService(
        IElasticsearchService elasticsearchService,
        ILogger<LogsAppService> logger)
    {
        _elasticsearchService = elasticsearchService;
        _logger = logger;
    }

    /// <summary>
    /// 搜索日志
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
            throw new BusinessException(
                OpsManagementErrorCodes.LogSearchFailed,
                "Failed to search logs. Please try again later.");
        }
    }

    /// <summary>
    /// 获取日志统计
    /// </summary>
    public async Task<LogStatisticsDto> GetLogStatisticsAsync(
        DateTime startTime,
        DateTime endTime,
        string? serviceName = null)
    {
        try
        {
            _logger.LogInformation(
                "Getting log statistics: {StartTime} - {EndTime}, Service={ServiceName}",
                startTime, endTime, serviceName);

            var searchRequest = new LogSearchRequest
            {
                StartTime = startTime,
                EndTime = endTime,
                ServiceName = serviceName,
                Skip = 0,
                Take = 0 // 只获取统计，不获取具体日志
            };

            var (total, _) = await _elasticsearchService.SearchLogsAsync(searchRequest);

            // 获取各级别日志数量
            var levelCounts = new Dictionary<string, long>();
            foreach (var level in new[] { "Debug", "Information", "Warning", "Error", "Critical" })
            {
                var levelRequest = new LogSearchRequest
                {
                    StartTime = startTime,
                    EndTime = endTime,
                    ServiceName = serviceName,
                    Level = level,
                    Skip = 0,
                    Take = 0
                };
                var (count, _) = await _elasticsearchService.SearchLogsAsync(levelRequest);
                levelCounts[level] = count;
            }

            var errorCount = levelCounts["Error"] + levelCounts["Critical"];
            var warningCount = levelCounts["Warning"];
            var errorRate = total > 0 ? (double)errorCount / total * 100 : 0;

            return new LogStatisticsDto
            {
                TotalCount = total,
                ErrorCount = errorCount,
                WarningCount = warningCount,
                ErrorRate = Math.Round(errorRate, 2),
                LevelCounts = levelCounts,
                ServiceCounts = new Dictionary<string, long>() // TODO: 实现服务维度统计
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get log statistics");
            throw new BusinessException(
                OpsManagementErrorCodes.LogStatisticsFailed,
                "Failed to get log statistics.");
        }
    }

    /// <summary>
    /// 索引日志到Elasticsearch
    /// </summary>
    public async Task<bool> IndexLogAsync(LogEntryDocument log)
    {
        Check.NotNull(log, nameof(log));

        try
        {
            return await _elasticsearchService.IndexLogAsync(log);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to index log");
            return false;
        }
    }

    /// <summary>
    /// 批量索引日志
    /// </summary>
    public async Task<bool> BulkIndexLogsAsync(List<LogEntryDocument> logs)
    {
        Check.NotNull(logs, nameof(logs));

        if (logs.Count == 0)
        {
            return true;
        }

        try
        {
            _logger.LogInformation("Bulk indexing {Count} logs", logs.Count);
            return await _elasticsearchService.BulkIndexLogsAsync(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to bulk index logs");
            return false;
        }
    }
}
