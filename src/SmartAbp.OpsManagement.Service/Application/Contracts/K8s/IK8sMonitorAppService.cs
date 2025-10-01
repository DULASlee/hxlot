using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace SmartAbp.OpsManagement.Contracts.K8s;

/// <summary>
/// Kubernetes监控应用服务接口
/// </summary>
public interface IK8sMonitorAppService : IApplicationService
{
    /// <summary>
    /// 获取集群摘要
    /// </summary>
    Task<K8sClusterSummaryDto> GetClusterSummaryAsync();

    /// <summary>
    /// 获取命名空间资源
    /// </summary>
    Task<List<K8sResourceDto>> GetNamespaceResourcesAsync(string namespaceName, string? resourceType = null);

    /// <summary>
    /// 获取Pod日志
    /// </summary>
    Task<string> GetPodLogsAsync(PodLogQueryDto input);
}

