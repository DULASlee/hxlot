using System;
using System.Collections.Generic;

namespace SmartAbp.OpsManagement.Contracts.K8s;

/// <summary>
/// K8S集群摘要DTO
/// </summary>
public class K8sClusterSummaryDto
{
    public string ClusterName { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public int NodeCount { get; set; }
    public int HealthyNodes { get; set; }
    public int PodCount { get; set; }
    public int RunningPods { get; set; }
    public int PendingPods { get; set; }
    public int FailedPods { get; set; }
    public int DeploymentCount { get; set; }
    public int ServiceCount { get; set; }
}

/// <summary>
/// K8S资源DTO
/// </summary>
public class K8sResourceDto
{
    public string Name { get; set; } = string.Empty;
    public string Namespace { get; set; } = string.Empty;
    public string ResourceType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public IDictionary<string, string>? Labels { get; set; }
    public long CpuRequest { get; set; }
    public long MemoryRequest { get; set; }
}

/// <summary>
/// Pod日志查询DTO
/// </summary>
public class PodLogQueryDto
{
    public string Namespace { get; set; } = string.Empty;
    public string PodName { get; set; } = string.Empty;
    public string? ContainerName { get; set; }
    public int TailLines { get; set; } = 100;
    public bool Follow { get; set; }
}

