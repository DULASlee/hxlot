using System.Collections.Generic;
using System.Threading.Tasks;
using SmartAbp.OpsManagement.Contracts.K8s;

namespace SmartAbp.OpsManagement.Services;

/// <summary>
/// Kubernetes监控服务接口
/// </summary>
public interface IKubernetesMonitorService
{
    Task<K8sClusterSummaryDto> GetClusterSummaryAsync();
    Task<List<K8sResourceDto>> GetNamespaceResourcesAsync(string namespaceName, string? resourceType = null);
    Task<string> GetPodLogsAsync(string namespaceName, string podName, string? containerName = null, int? tailLines = 100);
}

