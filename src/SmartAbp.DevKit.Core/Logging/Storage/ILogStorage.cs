using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartAbp.DevKit.Core.Logging.Models;

namespace SmartAbp.DevKit.Core.Logging.Storage;

/// <summary>
/// 日志存储接口
/// </summary>
public interface ILogStorage
{
    /// <summary>
    /// 批量写入日志
    /// </summary>
    /// <param name="entries">日志条目列表</param>
    Task WriteBatchAsync(List<LogEntry> entries);

    /// <summary>
    /// 查询日志
    /// </summary>
    /// <param name="filter">查询过滤器</param>
    /// <returns>日志列表</returns>
    Task<List<LogEntry>> QueryAsync(LogQueryFilter filter);

    /// <summary>
    /// 清理过期日志
    /// </summary>
    /// <param name="retentionDays">保留天数</param>
    /// <returns>删除的日志数量</returns>
    Task<int> CleanupOldLogsAsync(int retentionDays);

    /// <summary>
    /// 获取日志统计信息
    /// </summary>
    /// <returns>统计信息</returns>
    Task<LogStatistics> GetStatisticsAsync();
}

/// <summary>
/// 日志查询过滤器
/// </summary>
public class LogQueryFilter
{
    /// <summary>
    /// 开始时间
    /// </summary>
    public DateTime? StartTime { get; set; }

    /// <summary>
    /// 结束时间
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// 日志级别
    /// </summary>
    public List<string>? Levels { get; set; }

    /// <summary>
    /// 类别
    /// </summary>
    public List<string>? Categories { get; set; }

    /// <summary>
    /// 操作ID
    /// </summary>
    public string? OperationId { get; set; }

    /// <summary>
    /// 搜索关键词
    /// </summary>
    public string? SearchKeyword { get; set; }

    /// <summary>
    /// 跳过数量（分页）
    /// </summary>
    public int Skip { get; set; } = 0;

    /// <summary>
    /// 获取数量（分页）
    /// </summary>
    public int Take { get; set; } = 100;
}

/// <summary>
/// 日志统计信息
/// </summary>
public class LogStatistics
{
    /// <summary>
    /// 总日志数
    /// </summary>
    public long TotalLogs { get; set; }

    /// <summary>
    /// 错误日志数
    /// </summary>
    public long ErrorLogs { get; set; }

    /// <summary>
    /// 警告日志数
    /// </summary>
    public long WarningLogs { get; set; }

    /// <summary>
    /// 数据库大小（MB）
    /// </summary>
    public double DatabaseSizeMB { get; set; }

    /// <summary>
    /// 最早日志时间
    /// </summary>
    public DateTime? OldestLogTime { get; set; }

    /// <summary>
    /// 最新日志时间
    /// </summary>
    public DateTime? LatestLogTime { get; set; }
}

