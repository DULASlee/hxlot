using System;
using Volo.Abp.Domain.Entities;

namespace SmartAbp.OpsManagement.Entities;

/// <summary>
/// 日志条目实体
/// 持久化到 PostgreSQL，同时索引到 Elasticsearch
/// </summary>
public class LogEntry : Entity<Guid>
{
    /// <summary>
    /// 时间戳
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// 日志级别 (Debug, Info, Warning, Error, Fatal)
    /// </summary>
    public string Level { get; set; } = string.Empty;

    /// <summary>
    /// 日志消息
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// 服务名称
    /// </summary>
    public string ServiceName { get; set; } = string.Empty;

    /// <summary>
    /// 实例ID
    /// </summary>
    public string? InstanceId { get; set; }

    /// <summary>
    /// 日志来源（类名/方法名）
    /// </summary>
    public string? Source { get; set; }

    /// <summary>
    /// 异常堆栈跟踪
    /// </summary>
    public string? Exception { get; set; }

    /// <summary>
    /// 跟踪ID（分布式追踪）
    /// </summary>
    public string? TraceId { get; set; }

    /// <summary>
    /// 请求路径
    /// </summary>
    public string? RequestPath { get; set; }

    /// <summary>
    /// 用户ID
    /// </summary>
    public string? UserId { get; set; }

    /// <summary>
    /// 额外元数据（JSON格式）
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// 是否已索引到 Elasticsearch
    /// </summary>
    public bool IsIndexed { get; set; }

    /// <summary>
    /// Elasticsearch 文档ID
    /// </summary>
    public string? ElasticsearchDocId { get; set; }

    /// <summary>
    /// 数据保留到期时间
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    protected LogEntry()
    {
    }

    public LogEntry(
        Guid id,
        DateTime timestamp,
        string level,
        string message,
        string serviceName,
        int retentionDays = 30)
        : base(id)
    {
        Timestamp = timestamp;
        Level = level;
        Message = message;
        ServiceName = serviceName;
        IsIndexed = false;
        ExpiresAt = DateTime.UtcNow.AddDays(retentionDays);
    }

    /// <summary>
    /// 标记为已索引
    /// </summary>
    public void MarkAsIndexed(string elasticsearchDocId)
    {
        IsIndexed = true;
        ElasticsearchDocId = elasticsearchDocId;
    }

    /// <summary>
    /// 检查是否已过期
    /// </summary>
    public bool IsExpired()
    {
        return ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
    }
}

