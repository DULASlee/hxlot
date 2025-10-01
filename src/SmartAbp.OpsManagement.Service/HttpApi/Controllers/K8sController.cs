using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.OpsManagement.Contracts.K8s;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.OpsManagement.HttpApi.Controllers
{
    [Route("api/ops/k8s")]
    public class K8sController : AbpController
    {
        private readonly IK8sMonitorAppService _k8sMonitorAppService;

        public K8sController(IK8sMonitorAppService k8sMonitorAppService)
        {
            _k8sMonitorAppService = k8sMonitorAppService;
        }

        [HttpGet("summary")] 
        public Task<K8sClusterSummaryDto> GetSummaryAsync()
        {
            return _k8sMonitorAppService.GetClusterSummaryAsync();
        }

        [HttpGet("namespaces/{namespaceName}/resources")] 
        public Task<System.Collections.Generic.List<K8sResourceDto>> GetNamespaceResourcesAsync(
            string namespaceName,
            [FromQuery] string? resourceType = null)
        {
            Check.NotNullOrWhiteSpace(namespaceName, nameof(namespaceName));
            return _k8sMonitorAppService.GetNamespaceResourcesAsync(namespaceName, resourceType);
        }

        [HttpGet("pods/{namespaceName}/{podName}/logs")] 
        public Task<string> GetPodLogsAsync(
            string namespaceName,
            string podName,
            [FromQuery] string? containerName = null,
            [FromQuery] int? tailLines = null,
            [FromQuery] bool follow = false)
        {
            var input = new PodLogQueryDto
            {
                Namespace = namespaceName,
                PodName = podName,
                ContainerName = containerName,
                TailLines = tailLines ?? 100,
                Follow = follow
            };

            return _k8sMonitorAppService.GetPodLogsAsync(input);
        }
    }
}
