using System;
using Volo.Abp.Domain.Entities;

namespace SmartAbp.OpsManagement.Entities;

/// <summary>
/// Kubernetes资源快照实体
/// </summary>
public class K8sResourceSnapshot : Entity<Guid>
{
    /// <summary>
    /// 命名空间
    /// </summary>
    public string Namespace { get; set; } = "default";
    
    /// <summary>
    /// 资源类型
    /// </summary>
    public ResourceType Type { get; set; }
    
    /// <summary>
    /// 资源名称
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// 状态
    /// </summary>
    public ResourceStatus Status { get; set; }
    
    /// <summary>
    /// 资源指标（JSON格式）
    /// </summary>
    public string Metrics { get; set; } = "{}";
    
    /// <summary>
    /// 采集时间
    /// </summary>
    public DateTime CapturedAt { get; set; }
    
    /// <summary>
    /// 构造函数
    /// </summary>
    protected K8sResourceSnapshot()
    {
    }
    
    /// <summary>
    /// 创建K8S资源快照
    /// </summary>
    public K8sResourceSnapshot(
        Guid id,
        string @namespace,
        ResourceType type,
        string name,
        ResourceStatus status)
        : base(id)
    {
        Namespace = @namespace;
        Type = type;
        Name = name;
        Status = status;
        CapturedAt = DateTime.UtcNow;
    }
}

/// <summary>
/// 资源类型
/// </summary>
public enum ResourceType
{
    Pod = 1,
    Node = 2,
    Deployment = 3,
    Service = 4,
    StatefulSet = 5
}

/// <summary>
/// 资源状态
/// </summary>
public enum ResourceStatus
{
    Running = 1,
    Pending = 2,
    Failed = 3,
    Unknown = 4
}

