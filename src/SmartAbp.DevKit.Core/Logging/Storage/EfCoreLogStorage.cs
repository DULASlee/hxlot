using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Logging.Data;
using SmartAbp.DevKit.Core.Logging.Models;

namespace SmartAbp.DevKit.Core.Logging.Storage;

/// <summary>
/// 基于Entity Framework Core的日志存储实现（支持SQL Server和PostgreSQL）
/// </summary>
public class EfCoreLogStorage : ILogStorage
{
    private readonly IDbContextFactory<DevKitDbContext> _contextFactory;
    private readonly ILogger<EfCoreLogStorage> _logger;

    public EfCoreLogStorage(
        IDbContextFactory<DevKitDbContext> contextFactory,
        ILogger<EfCoreLogStorage> logger)
    {
        _contextFactory = contextFactory ?? throw new ArgumentNullException(nameof(contextFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// 批量写入日志（高性能，使用事务）
    /// </summary>
    public async Task WriteBatchAsync(List<LogEntry> entries)
    {
        if (entries == null || entries.Count == 0)
        {
            return;
        }

        try
        {
            await using var context = await _contextFactory.CreateDbContextAsync();

            // ✅ 修复：使用ExecutionStrategy包装事务，支持重试策略
            var strategy = context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                // 使用事务批量插入
                await using var transaction = await context.Database.BeginTransactionAsync();

                try
                {
                    // AddRange是EF Core优化过的批量插入
                    await context.Logs.AddRangeAsync(entries);

                    // SaveChanges会自动批量执行INSERT
                    await context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    _logger.LogDebug(
                        "Successfully wrote {Count} log entries to database",
                        entries.Count);
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to write {Count} log entries to database",
                entries.Count);
            throw;
        }
    }

    /// <summary>
    /// 查询日志
    /// </summary>
    public async Task<List<LogEntry>> QueryAsync(LogQueryFilter filter)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();

        var query = context.Logs.AsQueryable();

        // 应用过滤条件
        if (filter.StartTime.HasValue)
        {
            query = query.Where(l => l.Timestamp >= filter.StartTime.Value);
        }

        if (filter.EndTime.HasValue)
        {
            query = query.Where(l => l.Timestamp <= filter.EndTime.Value);
        }

        if (filter.Levels != null && filter.Levels.Any())
        {
            query = query.Where(l => filter.Levels.Contains(l.Level));
        }

        if (filter.Categories != null && filter.Categories.Any())
        {
            query = query.Where(l => filter.Categories.Contains(l.Category));
        }

        if (!string.IsNullOrEmpty(filter.OperationId))
        {
            query = query.Where(l => l.OperationId == filter.OperationId);
        }

        if (!string.IsNullOrEmpty(filter.SearchKeyword))
        {
            query = query.Where(l =>
                l.Message.Contains(filter.SearchKeyword) ||
                (l.Exception != null && l.Exception.Contains(filter.SearchKeyword)));
        }

        // 排序（最新的在前）
        query = query.OrderByDescending(l => l.Timestamp);

        // 分页
        query = query.Skip(filter.Skip).Take(filter.Take);

        return await query.ToListAsync();
    }

    /// <summary>
    /// 清理过期日志（删除超过指定天数的日志）
    /// </summary>
    public async Task<int> CleanupOldLogsAsync(int retentionDays)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();

        var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);

        // 使用ExecuteDelete进行批量删除（EF Core 7.0+高性能特性）
        var deletedCount = await context.Logs
            .Where(l => l.Timestamp < cutoffDate)
            .ExecuteDeleteAsync();

        _logger.LogInformation(
            "Cleaned up {Count} old log entries (older than {Days} days)",
            deletedCount,
            retentionDays);

        return deletedCount;
    }

    /// <summary>
    /// 获取日志统计信息
    /// </summary>
    public async Task<LogStatistics> GetStatisticsAsync()
    {
        await using var context = await _contextFactory.CreateDbContextAsync();

        var statistics = new LogStatistics
        {
            TotalLogs = await context.Logs.LongCountAsync(),
            ErrorLogs = await context.Logs.LongCountAsync(l => l.Level == "Error"),
            WarningLogs = await context.Logs.LongCountAsync(l => l.Level == "Warning"),
            OldestLogTime = await context.Logs
                .OrderBy(l => l.Timestamp)
                .Select(l => (DateTime?)l.Timestamp)
                .FirstOrDefaultAsync(),
            LatestLogTime = await context.Logs
                .OrderByDescending(l => l.Timestamp)
                .Select(l => (DateTime?)l.Timestamp)
                .FirstOrDefaultAsync()
        };

        // 获取数据库大小（SQL Server专用，PostgreSQL需要不同的查询）
        try
        {
            // 这里简化处理，实际项目中需要根据数据库类型使用不同的SQL
            statistics.DatabaseSizeMB = 0; // TODO: 实现数据库大小查询
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get database size");
        }

        return statistics;
    }
}

/// <summary>
/// 性能日志存储接口
/// </summary>
public interface IPerformanceLogStorage
{
    /// <summary>
    /// 批量写入性能日志
    /// </summary>
    Task WriteBatchAsync(List<PerformanceLogEntry> entries);

    /// <summary>
    /// 查询性能日志
    /// </summary>
    Task<List<PerformanceLogEntry>> QueryAsync(PerformanceLogQueryFilter filter);

    /// <summary>
    /// 获取性能统计
    /// </summary>
    Task<PerformanceStatistics> GetStatisticsAsync(string? operationName = null);
}

/// <summary>
/// 性能日志查询过滤器
/// </summary>
public class PerformanceLogQueryFilter
{
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? OperationName { get; set; }
    public string? OperationId { get; set; }
    public int Skip { get; set; } = 0;
    public int Take { get; set; } = 100;
}

/// <summary>
/// 性能统计
/// </summary>
public class PerformanceStatistics
{
    public long TotalOperations { get; set; }
    public double AverageDurationMs { get; set; }
    public long MinDurationMs { get; set; }
    public long MaxDurationMs { get; set; }
    public double P50DurationMs { get; set; }  // 中位数
    public double P95DurationMs { get; set; }  // 95百分位
    public double P99DurationMs { get; set; }  // 99百分位
}

/// <summary>
/// 基于EF Core的性能日志存储实现
/// </summary>
public class EfCorePerformanceLogStorage : IPerformanceLogStorage
{
    private readonly IDbContextFactory<DevKitDbContext> _contextFactory;
    private readonly ILogger<EfCorePerformanceLogStorage> _logger;

    public EfCorePerformanceLogStorage(
        IDbContextFactory<DevKitDbContext> contextFactory,
        ILogger<EfCorePerformanceLogStorage> logger)
    {
        _contextFactory = contextFactory;
        _logger = logger;
    }

    public async Task WriteBatchAsync(List<PerformanceLogEntry> entries)
    {
        if (entries == null || entries.Count == 0)
        {
            return;
        }

        try
        {
            await using var context = await _contextFactory.CreateDbContextAsync();
            await context.PerformanceLogs.AddRangeAsync(entries);
            await context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write performance logs");
            throw;
        }
    }

    public async Task<List<PerformanceLogEntry>> QueryAsync(PerformanceLogQueryFilter filter)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();

        var query = context.PerformanceLogs.AsQueryable();

        if (filter.StartTime.HasValue)
        {
            query = query.Where(l => l.Timestamp >= filter.StartTime.Value);
        }

        if (filter.EndTime.HasValue)
        {
            query = query.Where(l => l.Timestamp <= filter.EndTime.Value);
        }

        if (!string.IsNullOrEmpty(filter.OperationName))
        {
            query = query.Where(l => l.OperationName == filter.OperationName);
        }

        if (!string.IsNullOrEmpty(filter.OperationId))
        {
            query = query.Where(l => l.OperationId == filter.OperationId);
        }

        query = query.OrderByDescending(l => l.Timestamp);
        query = query.Skip(filter.Skip).Take(filter.Take);

        return await query.ToListAsync();
    }

    public async Task<PerformanceStatistics> GetStatisticsAsync(string? operationName = null)
    {
        await using var context = await _contextFactory.CreateDbContextAsync();

        var query = context.PerformanceLogs.AsQueryable();

        if (!string.IsNullOrEmpty(operationName))
        {
            query = query.Where(l => l.OperationName == operationName);
        }

        var statistics = new PerformanceStatistics
        {
            TotalOperations = await query.LongCountAsync(),
            AverageDurationMs = await query.AverageAsync(l => (double)l.DurationMs),
            MinDurationMs = await query.MinAsync(l => l.DurationMs),
            MaxDurationMs = await query.MaxAsync(l => l.DurationMs)
        };

        // 计算百分位数（需要加载到内存）
        var durations = await query
            .OrderBy(l => l.DurationMs)
            .Select(l => l.DurationMs)
            .ToListAsync();

        if (durations.Any())
        {
            statistics.P50DurationMs = GetPercentile(durations, 50);
            statistics.P95DurationMs = GetPercentile(durations, 95);
            statistics.P99DurationMs = GetPercentile(durations, 99);
        }

        return statistics;
    }

    private static double GetPercentile(List<long> sortedValues, int percentile)
    {
        if (sortedValues.Count == 0)
        {
            return 0;
        }

        var index = (int)Math.Ceiling(sortedValues.Count * percentile / 100.0) - 1;
        index = Math.Max(0, Math.Min(index, sortedValues.Count - 1));
        return sortedValues[index];
    }
}

