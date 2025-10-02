using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace {{Namespace}}.Application.Services
{
    /// <summary>
    /// {{EntityName}}运维监控应用服务
    /// 提供APM性能监控、日志管理、资源监控和告警功能
    /// </summary>
    public class {{EntityName}}MonitoringAppService : ApplicationService, I{{EntityName}}MonitoringAppService
    {
        private readonly I{{EntityName}}Repository _repository;
        private readonly IPrometheusService _prometheusService;
        private readonly IElasticsearchService _elasticsearchService;
        private readonly IKubernetesMonitorService _k8sMonitorService;

        public {{EntityName}}MonitoringAppService(
            I{{EntityName}}Repository repository,
            IPrometheusService prometheusService,
            IElasticsearchService elasticsearchService,
            IKubernetesMonitorService k8sMonitorService)
        {
            _repository = repository;
            _prometheusService = prometheusService;
            _elasticsearchService = elasticsearchService;
            _k8sMonitorService = k8sMonitorService;
        }

        /// <summary>
        /// 获取性能指标
        /// </summary>
        public virtual async Task<PagedResultDto<PerformanceMetricDto>> GetMetricsAsync(GetMetricsInput input)
        {
            var query = _prometheusService.QueryMetrics(input.MetricName, input.StartTime, input.EndTime);
            var totalCount = await _prometheusService.CountMetricsAsync(query);
            var items = await _prometheusService.GetMetricsAsync(query, input.SkipCount, input.MaxResultCount);

            return new PagedResultDto<PerformanceMetricDto>(
                totalCount,
                ObjectMapper.Map<List<PerformanceMetric>, List<PerformanceMetricDto>>(items)
            );
        }

        /// <summary>
        /// 查询日志
        /// </summary>
        public virtual async Task<PagedResultDto<LogEntryDto>> QueryLogsAsync(QueryLogsInput input)
        {
            var searchResult = await _elasticsearchService.SearchLogsAsync(
                input.Query,
                input.Level,
                input.StartTime,
                input.EndTime,
                input.SkipCount,
                input.MaxResultCount
            );

            return new PagedResultDto<LogEntryDto>(
                searchResult.Total,
                ObjectMapper.Map<List<LogEntry>, List<LogEntryDto>>(searchResult.Items)
            );
        }

        /// <summary>
        /// 获取K8s资源状态
        /// </summary>
        public virtual async Task<K8sResourceStatusDto> GetK8sResourceStatusAsync(string resourceType, string resourceName)
        {
            var resource = await _k8sMonitorService.GetResourceAsync(resourceType, resourceName);
            return ObjectMapper.Map<K8sResource, K8sResourceStatusDto>(resource);
        }

        /// <summary>
        /// 获取告警列表
        /// </summary>
        public virtual async Task<PagedResultDto<AlertDto>> GetAlertsAsync(GetAlertsInput input)
        {
            var query = await _repository.GetQueryableAsync();
            
            // 过滤条件
            if (input.Level.HasValue)
            {
                query = query.Where(x => x.Level == input.Level.Value);
            }
            if (input.Status.HasValue)
            {
                query = query.Where(x => x.Status == input.Status.Value);
            }
            if (input.StartTime.HasValue)
            {
                query = query.Where(x => x.CreatedTime >= input.StartTime.Value);
            }

            var totalCount = await AsyncExecuter.CountAsync(query);
            var items = await AsyncExecuter.ToListAsync(
                query.Skip(input.SkipCount).Take(input.MaxResultCount)
            );

            return new PagedResultDto<AlertDto>(
                totalCount,
                ObjectMapper.Map<List<Alert>, List<AlertDto>>(items)
            );
        }

        /// <summary>
        /// 创建告警规则
        /// </summary>
        public virtual async Task<AlertRuleDto> CreateAlertRuleAsync(CreateAlertRuleDto input)
        {
            var alertRule = new AlertRule(
                GuidGenerator.Create(),
                input.Name,
                input.MetricName,
                input.Condition,
                input.Threshold,
                input.Duration,
                input.Severity
            );

            // 验证告警规则
            await ValidateAlertRuleAsync(alertRule);

            await _repository.InsertAsync(alertRule);
            await CurrentUnitOfWork.SaveChangesAsync();

            return ObjectMapper.Map<AlertRule, AlertRuleDto>(alertRule);
        }

        /// <summary>
        /// 验证告警规则
        /// </summary>
        private async Task ValidateAlertRuleAsync(AlertRule alertRule)
        {
            // 检查规则名称是否重复
            var exists = await _repository.AnyAsync(x => x.Name == alertRule.Name);
            if (exists)
            {
                throw new BusinessException({{Namespace}}DomainErrorCodes.AlertRuleNameAlreadyExists)
                    .WithData("Name", alertRule.Name);
            }

            // 验证指标名称是否有效
            var metricExists = await _prometheusService.MetricExistsAsync(alertRule.MetricName);
            if (!metricExists)
            {
                throw new BusinessException({{Namespace}}DomainErrorCodes.InvalidMetricName)
                    .WithData("MetricName", alertRule.MetricName);
            }
        }

        /// <summary>
        /// 获取系统健康状态
        /// </summary>
        public virtual async Task<SystemHealthDto> GetSystemHealthAsync()
        {
            var cpuUsage = await _prometheusService.GetCurrentCpuUsageAsync();
            var memoryUsage = await _prometheusService.GetCurrentMemoryUsageAsync();
            var diskUsage = await _prometheusService.GetCurrentDiskUsageAsync();
            var activeAlerts = await _repository.CountAsync(x => x.Status == AlertStatus.Active);

            return new SystemHealthDto
            {
                CpuUsage = cpuUsage,
                MemoryUsage = memoryUsage,
                DiskUsage = diskUsage,
                ActiveAlerts = activeAlerts,
                Status = DetermineHealthStatus(cpuUsage, memoryUsage, diskUsage, activeAlerts)
            };
        }

        private HealthStatus DetermineHealthStatus(double cpu, double memory, double disk, int alerts)
        {
            if (cpu > 90 || memory > 90 || disk > 90 || alerts > 10)
                return HealthStatus.Critical;
            if (cpu > 70 || memory > 70 || disk > 70 || alerts > 5)
                return HealthStatus.Warning;
            return HealthStatus.Healthy;
        }
    }
}

