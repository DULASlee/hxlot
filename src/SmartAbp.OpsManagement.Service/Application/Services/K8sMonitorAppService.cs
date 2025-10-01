using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.OpsManagement.Contracts.K8s;
using Volo.Abp;
using Volo.Abp.Application.Services;

namespace SmartAbp.OpsManagement.Services;

/// <summary>
/// Kubernetes监控应用服务
/// </summary>
public class K8sMonitorAppService : ApplicationService, IK8sMonitorAppService
{
    private readonly IKubernetesMonitorService _k8sMonitorService;
    private readonly ILogger<K8sMonitorAppService> _logger;

    public K8sMonitorAppService(
        IKubernetesMonitorService k8sMonitorService,
        ILogger<K8sMonitorAppService> logger)
    {
        _k8sMonitorService = k8sMonitorService;
        _logger = logger;
    }

    /// <summary>
    /// 获取集群摘要
    /// </summary>
    public async Task<K8sClusterSummaryDto> GetClusterSummaryAsync()
    {
        try
        {
            _logger.LogInformation("Getting Kubernetes cluster summary");
            return await _k8sMonitorService.GetClusterSummaryAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get K8S cluster summary");
            throw new BusinessException(
                OpsManagementErrorCodes.K8sMonitorFailed,
                "Failed to get Kubernetes cluster summary.");
        }
    }

    /// <summary>
    /// 获取命名空间资源列表
    /// </summary>
    public async Task<List<K8sResourceDto>> GetNamespaceResourcesAsync(
        string namespaceName,
        string? resourceType = null)
    {
        Check.NotNullOrWhiteSpace(namespaceName, nameof(namespaceName));

        try
        {
            _logger.LogInformation(
                "Getting K8S resources: Namespace={Namespace}, Type={ResourceType}",
                namespaceName, resourceType);

            return await _k8sMonitorService.GetNamespaceResourcesAsync(
                namespaceName, 
                resourceType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get K8S namespace resources");
            throw new BusinessException(
                OpsManagementErrorCodes.K8sMonitorFailed,
                $"Failed to get resources for namespace '{namespaceName}'.");
        }
    }

    /// <summary>
    /// 获取Pod日志
    /// </summary>
    public async Task<string> GetPodLogsAsync(PodLogQueryDto input)
    {
        Check.NotNull(input, nameof(input));
        Check.NotNullOrWhiteSpace(input.Namespace, nameof(input.Namespace));
        Check.NotNullOrWhiteSpace(input.PodName, nameof(input.PodName));

        try
        {
            _logger.LogInformation(
                "Getting Pod logs: {Namespace}/{PodName}, Container={Container}, TailLines={TailLines}",
                input.Namespace, input.PodName, input.ContainerName, input.TailLines);

            return await _k8sMonitorService.GetPodLogsAsync(
                input.Namespace,
                input.PodName,
                input.ContainerName,
                input.TailLines);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get Pod logs");
            throw new BusinessException(
                OpsManagementErrorCodes.K8sMonitorFailed,
                $"Failed to get logs for Pod '{input.PodName}'.");
        }
    }
}
