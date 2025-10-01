using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;
using SmartAbp.OpsManagement.Entities;

namespace SmartAbp.OpsManagement.Domain.Repositories;

/// <summary>
/// 日志条目仓储接口
/// </summary>
public interface ILogEntryRepository : IRepository<LogEntry, Guid>
{
    /// <summary>
    /// 批量插入日志条目
    /// </summary>
    Task BulkInsertAsync(
        List<LogEntry> logEntries,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// 获取未索引到 Elasticsearch 的日志
    /// </summary>
    Task<List<LogEntry>> GetUnindexedLogsAsync(
        int maxCount = 1000,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// 删除过期的日志
    /// </summary>
    Task DeleteExpiredLogsAsync(
        DateTime beforeDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// 按服务名称和时间范围查询日志
    /// </summary>
    Task<List<LogEntry>> GetLogsByServiceAsync(
        string serviceName,
        DateTime startTime,
        DateTime endTime,
        int maxCount = 100,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// 按日志级别统计
    /// </summary>
    Task<Dictionary<string, int>> GetLogCountByLevelAsync(
        DateTime startTime,
        DateTime endTime,
        CancellationToken cancellationToken = default);
}

