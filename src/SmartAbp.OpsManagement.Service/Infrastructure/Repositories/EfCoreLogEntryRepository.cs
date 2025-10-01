using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;
using SmartAbp.OpsManagement.Entities;
using SmartAbp.OpsManagement.Domain.Repositories;
using SmartAbp.OpsManagement.Infrastructure.EntityFrameworkCore;

namespace SmartAbp.OpsManagement.Infrastructure.Repositories;

/// <summary>
/// 日志条目仓储 EF Core 实现
/// </summary>
public class EfCoreLogEntryRepository 
    : EfCoreRepository<OpsManagementDbContext, LogEntry, Guid>, ILogEntryRepository
{
    public EfCoreLogEntryRepository(
        IDbContextProvider<OpsManagementDbContext> dbContextProvider)
        : base(dbContextProvider)
    {
    }

    /// <summary>
    /// 批量插入日志条目
    /// </summary>
    public async Task BulkInsertAsync(
        List<LogEntry> logEntries,
        CancellationToken cancellationToken = default)
    {
        var dbContext = await GetDbContextAsync();
        await dbContext.LogEntries.AddRangeAsync(logEntries, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// 获取未索引到 Elasticsearch 的日志
    /// </summary>
    public async Task<List<LogEntry>> GetUnindexedLogsAsync(
        int maxCount = 1000,
        CancellationToken cancellationToken = default)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.LogEntries
            .Where(x => !x.IsIndexed)
            .OrderBy(x => x.Timestamp)
            .Take(maxCount)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// 删除过期的日志
    /// </summary>
    public async Task DeleteExpiredLogsAsync(
        DateTime beforeDate,
        CancellationToken cancellationToken = default)
    {
        var dbContext = await GetDbContextAsync();
        await dbContext.LogEntries
            .Where(x => x.ExpiresAt.HasValue && x.ExpiresAt.Value < beforeDate)
            .ExecuteDeleteAsync(cancellationToken);
    }

    /// <summary>
    /// 按服务名称和时间范围查询日志
    /// </summary>
    public async Task<List<LogEntry>> GetLogsByServiceAsync(
        string serviceName,
        DateTime startTime,
        DateTime endTime,
        int maxCount = 100,
        CancellationToken cancellationToken = default)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.LogEntries
            .Where(x => x.ServiceName == serviceName 
                && x.Timestamp >= startTime 
                && x.Timestamp <= endTime)
            .OrderByDescending(x => x.Timestamp)
            .Take(maxCount)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// 按日志级别统计
    /// </summary>
    public async Task<Dictionary<string, int>> GetLogCountByLevelAsync(
        DateTime startTime,
        DateTime endTime,
        CancellationToken cancellationToken = default)
    {
        var dbContext = await GetDbContextAsync();
        return await dbContext.LogEntries
            .Where(x => x.Timestamp >= startTime && x.Timestamp <= endTime)
            .GroupBy(x => x.Level)
            .Select(g => new { Level = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Level, x => x.Count, cancellationToken);
    }
}

