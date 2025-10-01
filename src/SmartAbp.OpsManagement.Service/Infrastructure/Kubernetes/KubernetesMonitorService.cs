using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using k8s;
using k8s.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartAbp.OpsManagement.Contracts.K8s;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.OpsManagement.Infrastructure.Kubernetes;

/// <summary>
/// Kubernetes监控服务实现
/// </summary>
public class KubernetesMonitorService : IKubernetesMonitorService, ITransientDependency
{
    private readonly k8s.Kubernetes _client;
    private readonly ILogger<KubernetesMonitorService> _logger;
    private readonly string _clusterName;

    public KubernetesMonitorService(
        IConfiguration configuration,
        ILogger<KubernetesMonitorService> logger)
    {
        _logger = logger;
        _clusterName = configuration["Kubernetes:ClusterName"] ?? "default";

        // 使用InCluster配置或Kubeconfig
        var config = KubernetesClientConfiguration.IsInCluster()
            ? KubernetesClientConfiguration.InClusterConfig()
            : KubernetesClientConfiguration.BuildConfigFromConfigFile();

        _client = new k8s.Kubernetes(config);
    }

    /// <summary>
    /// 获取集群资源摘要
    /// </summary>
    public async Task<K8sClusterSummaryDto> GetClusterSummaryAsync()
    {
        try
        {
            _logger.LogInformation("Fetching Kubernetes cluster summary");

            var nodes = await _client.CoreV1.ListNodeAsync();
            var pods = await _client.CoreV1.ListPodForAllNamespacesAsync();
            var deployments = await _client.AppsV1.ListDeploymentForAllNamespacesAsync();
            var services = await _client.CoreV1.ListServiceForAllNamespacesAsync();

            var summary = new K8sClusterSummaryDto
            {
                ClusterName = _clusterName,
                Timestamp = DateTime.UtcNow,
                NodeCount = nodes.Items.Count,
                PodCount = pods.Items.Count,
                DeploymentCount = deployments.Items.Count,
                ServiceCount = services.Items.Count,
                RunningPods = pods.Items.Count(p => p.Status.Phase == "Running"),
                PendingPods = pods.Items.Count(p => p.Status.Phase == "Pending"),
                FailedPods = pods.Items.Count(p => p.Status.Phase == "Failed")
            };

            // 计算资源使用
            var readyNodes = nodes.Items.Count(n => 
                n.Status?.Conditions?.Any(c => c.Type == "Ready" && c.Status == "True") == true);
            summary.HealthyNodes = readyNodes;

            _logger.LogDebug("Cluster summary: {NodeCount} nodes, {PodCount} pods", 
                summary.NodeCount, summary.PodCount);

            return summary;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Kubernetes cluster summary");
            throw new InvalidOperationException("Unable to access Kubernetes cluster", ex);
        }
    }

    /// <summary>
    /// 获取命名空间资源列表
    /// </summary>
    public async Task<List<K8sResourceDto>> GetNamespaceResourcesAsync(
        string namespaceName,
        string? resourceType = null)
    {
        try
        {
            var resources = new List<K8sResourceDto>();

            // 获取Pods
            if (string.IsNullOrEmpty(resourceType) || resourceType == "Pod")
            {
                var pods = await _client.CoreV1.ListNamespacedPodAsync(namespaceName);
                resources.AddRange(pods.Items.Select(pod => new K8sResourceDto
                {
                    Name = pod.Metadata.Name,
                    Namespace = namespaceName,
                    ResourceType = "Pod",
                    Status = pod.Status.Phase,
                    CreatedAt = pod.Metadata.CreationTimestamp ?? DateTime.UtcNow,
                    Labels = pod.Metadata.Labels,
                    CpuRequest = pod.Spec.Containers
                        .Sum(c => ParseResourceQuantity(c.Resources?.Requests?["cpu"]?.ToString())),
                    MemoryRequest = pod.Spec.Containers
                        .Sum(c => ParseResourceQuantity(c.Resources?.Requests?["memory"]?.ToString()))
                }));
            }

            // 获取Deployments
            if (string.IsNullOrEmpty(resourceType) || resourceType == "Deployment")
            {
                var deployments = await _client.AppsV1.ListNamespacedDeploymentAsync(namespaceName);
                resources.AddRange(deployments.Items.Select(dep => new K8sResourceDto
                {
                    Name = dep.Metadata.Name,
                    Namespace = namespaceName,
                    ResourceType = "Deployment",
                    Status = $"{dep.Status.ReadyReplicas}/{dep.Status.Replicas}",
                    CreatedAt = dep.Metadata.CreationTimestamp ?? DateTime.UtcNow,
                    Labels = dep.Metadata.Labels
                }));
            }

            // 获取Services
            if (string.IsNullOrEmpty(resourceType) || resourceType == "Service")
            {
                var services = await _client.CoreV1.ListNamespacedServiceAsync(namespaceName);
                resources.AddRange(services.Items.Select(svc => new K8sResourceDto
                {
                    Name = svc.Metadata.Name,
                    Namespace = namespaceName,
                    ResourceType = "Service",
                    Status = svc.Spec.Type,
                    CreatedAt = svc.Metadata.CreationTimestamp ?? DateTime.UtcNow,
                    Labels = svc.Metadata.Labels
                }));
            }

            _logger.LogDebug("Retrieved {Count} resources from namespace {Namespace}", 
                resources.Count, namespaceName);

            return resources;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch namespace resources: {Namespace}", namespaceName);
            throw;
        }
    }

    /// <summary>
    /// 获取Pod日志
    /// </summary>
    public async Task<string> GetPodLogsAsync(
        string namespaceName,
        string podName,
        string? containerName = null,
        int? tailLines = 100)
    {
        try
        {
            var logStream = await _client.CoreV1.ReadNamespacedPodLogAsync(
                name: podName,
                namespaceParameter: namespaceName,
                container: containerName,
                tailLines: tailLines);

            using var reader = new System.IO.StreamReader(logStream);
            return await reader.ReadToEndAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch pod logs: {Namespace}/{Pod}", 
                namespaceName, podName);
            throw;
        }
    }

    private long ParseResourceQuantity(string? quantity)
    {
        if (string.IsNullOrWhiteSpace(quantity)) return 0;

        // 简单的资源量解析（实际应该使用ResourceQuantity类）
        var value = quantity.TrimEnd('m', 'M', 'i', 'G', 'K');
        return long.TryParse(value, out var result) ? result : 0;
    }
}

/// <summary>
/// Kubernetes监控服务接口
/// </summary>
public interface IKubernetesMonitorService
{
    Task<K8sClusterSummaryDto> GetClusterSummaryAsync();
    Task<List<K8sResourceDto>> GetNamespaceResourcesAsync(string namespaceName, string? resourceType = null);
    Task<string> GetPodLogsAsync(string namespaceName, string podName, string? containerName = null, int? tailLines = 100);
}

