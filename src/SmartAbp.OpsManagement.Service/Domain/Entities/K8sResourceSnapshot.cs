using System;
using Volo.Abp.Domain.Entities;

namespace SmartAbp.OpsManagement.Entities;

/// <summary>
/// Kubernetes资源快照实体
/// </summary>
public class K8sResourceSnapshot : Entity<Guid>
{
    /// <summary>
    /// 集群名称
    /// </summary>
    public string ClusterName { get; set; } = "default";
    
    /// <summary>
    /// 命名空间
    /// </summary>
    public string Namespace { get; set; } = "default";
    
    /// <summary>
    /// 资源类型
    /// </summary>
    public string ResourceType { get; set; } = string.Empty;
    
    /// <summary>
    /// 资源名称
    /// </summary>
    public string ResourceName { get; set; } = string.Empty;
    
    /// <summary>
    /// 状态
    /// </summary>
    public string Status { get; set; } = string.Empty;
    
    /// <summary>
    /// CPU使用率
    /// </summary>
    public double? CpuUsage { get; set; }
    
    /// <summary>
    /// 内存使用率
    /// </summary>
    public double? MemoryUsage { get; set; }
    
    /// <summary>
    /// Pod数量
    /// </summary>
    public int? PodCount { get; set; }
    
    /// <summary>
    /// 标签（JSON格式）
    /// </summary>
    public string Labels { get; set; } = "{}";
    
    /// <summary>
    /// 时间戳
    /// </summary>
    public DateTime Timestamp { get; set; }
    
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
        string clusterName,
        string @namespace,
        string resourceType,
        string resourceName,
        string status)
        : base(id)
    {
        ClusterName = clusterName;
        Namespace = @namespace;
        ResourceType = resourceType;
        ResourceName = resourceName;
        Status = status;
        Timestamp = DateTime.UtcNow;
    }
}

