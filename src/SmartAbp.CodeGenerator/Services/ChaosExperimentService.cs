using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 混沌工程实验服务
    /// 提供混沌实验配置验证和代码生成功能
    /// </summary>
    public class ChaosExperimentService
    {
        /// <summary>
        /// 验证混沌实验配置
        /// </summary>
        public async Task<ChaosExperimentValidationResultDto> ValidateExperimentAsync(ChaosExperimentDto experiment)
        {
            var result = new ChaosExperimentValidationResultDto
            {
                IsValid = true
            };

            // 1. 验证实验基本信息
            if (string.IsNullOrWhiteSpace(experiment.ExperimentName))
            {
                result.IsValid = false;
                result.Errors.Add("实验名称不能为空");
            }

            if (string.IsNullOrWhiteSpace(experiment.ServiceName))
            {
                result.IsValid = false;
                result.Errors.Add("服务名称不能为空");
            }

            // 2. 验证故障注入配置
            ValidateFaultInjection(experiment.FaultInjection, result);

            // 3. 验证实验调度
            ValidateSchedule(experiment.Schedule, result);

            // 4. 验证指标配置
            ValidateMetrics(experiment.Metrics, result);

            return await Task.FromResult(result);
        }

        /// <summary>
        /// 验证故障注入配置
        /// </summary>
        private void ValidateFaultInjection(FaultInjectionDto faultInjection, ChaosExperimentValidationResultDto result)
        {
            // 验证注入比例
            if (faultInjection.InjectionPercentage < 0 || faultInjection.InjectionPercentage > 100)
            {
                result.IsValid = false;
                result.Errors.Add("注入比例必须在0-100之间");
            }

            // 至少启用一种故障类型
            if (!faultInjection.Delay.Enabled && !faultInjection.Abort.Enabled)
            {
                result.IsValid = false;
                result.Errors.Add("至少需要启用一种故障类型（延迟或中止）");
            }

            // 验证延迟故障
            if (faultInjection.Delay.Enabled)
            {
                if (faultInjection.Delay.FixedDelayMs < 0)
                {
                    result.IsValid = false;
                    result.Errors.Add("延迟时间不能为负数");
                }

                if (faultInjection.Delay.FixedDelayMs > 300000)
                {
                    result.Warnings.Add("延迟时间超过5分钟，可能影响实验效果");
                }

                if (faultInjection.Delay.Percentage < 0 || faultInjection.Delay.Percentage > 100)
                {
                    result.IsValid = false;
                    result.Errors.Add("延迟注入比例必须在0-100之间");
                }
            }

            // 验证中止故障
            if (faultInjection.Abort.Enabled)
            {
                if (faultInjection.Abort.HttpStatusCode < 400 || faultInjection.Abort.HttpStatusCode > 599)
                {
                    result.Warnings.Add("建议使用4xx或5xx系列HTTP状态码");
                }

                if (faultInjection.Abort.Percentage < 0 || faultInjection.Abort.Percentage > 100)
                {
                    result.IsValid = false;
                    result.Errors.Add("中止注入比例必须在0-100之间");
                }
            }

            // 建议
            if (faultInjection.InjectionPercentage > 50)
            {
                result.Suggestions["InjectionPercentage"] = "建议注入比例不超过50%，以降低风险";
            }
        }

        /// <summary>
        /// 验证实验调度配置
        /// </summary>
        private void ValidateSchedule(ExperimentScheduleDto schedule, ChaosExperimentValidationResultDto result)
        {
            if (schedule.DurationMinutes <= 0)
            {
                result.IsValid = false;
                result.Errors.Add("实验持续时间必须大于0");
            }

            if (schedule.DurationMinutes > 1440)
            {
                result.Warnings.Add("实验持续时间超过24小时，建议缩短实验时间");
            }

            // 验证调度时间
            if (schedule.ScheduleType == "Scheduled")
            {
                if (schedule.StartTime == null)
                {
                    result.IsValid = false;
                    result.Errors.Add("调度模式下必须指定开始时间");
                }
                else if (schedule.StartTime < DateTime.UtcNow)
                {
                    result.Warnings.Add("开始时间早于当前时间");
                }
            }
        }

        /// <summary>
        /// 验证指标配置
        /// </summary>
        private void ValidateMetrics(ExperimentMetricsDto metrics, ChaosExperimentValidationResultDto result)
        {
            if (metrics.MonitoredMetrics == null || !metrics.MonitoredMetrics.Any())
            {
                result.Warnings.Add("未配置监控指标，建议至少监控响应时间和错误率");
            }

            // 验证阈值
            if (metrics.Thresholds != null && metrics.Thresholds.Any())
            {
                foreach (var threshold in metrics.Thresholds)
                {
                    if (threshold.Value < 0)
                    {
                        result.Warnings.Add($"阈值 {threshold.Key} 为负数，请检查配置");
                    }
                }
            }
        }

        /// <summary>
        /// 生成混沌实验配置
        /// </summary>
        public async Task<GeneratedChaosConfigDto> GenerateChaosConfigAsync(ChaosExperimentDto experiment)
        {
            var config = new GeneratedChaosConfigDto
            {
                IstioFaultInjectionYaml = GenerateIstioFaultInjection(experiment),
                KubernetesChaosYaml = GenerateKubernetesChaos(experiment),
                PrometheusAlertsYaml = GeneratePrometheusAlerts(experiment),
                GeneratedAt = DateTime.UtcNow
            };

            return await Task.FromResult(config);
        }

        /// <summary>
        /// 生成Istio故障注入YAML
        /// </summary>
        private string GenerateIstioFaultInjection(ChaosExperimentDto experiment)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: networking.istio.io/v1beta1");
            yaml.AppendLine("kind: VirtualService");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {experiment.ServiceName}-chaos-{experiment.ExperimentName.ToLower()}");
            yaml.AppendLine("  labels:");
            yaml.AppendLine("    app: chaos-experiment");
            yaml.AppendLine($"    experiment: {experiment.ExperimentName}");
            yaml.AppendLine("spec:");
            yaml.AppendLine("  hosts:");
            yaml.AppendLine($"    - {experiment.ServiceName}");
            yaml.AppendLine("  http:");
            yaml.AppendLine("  - fault:");

            // 延迟故障
            if (experiment.FaultInjection.Delay.Enabled)
            {
                yaml.AppendLine("      delay:");
                yaml.AppendLine($"        percentage:");
                yaml.AppendLine($"          value: {experiment.FaultInjection.Delay.Percentage}");
                yaml.AppendLine($"        fixedDelay: {experiment.FaultInjection.Delay.FixedDelayMs}ms");
            }

            // 中止故障
            if (experiment.FaultInjection.Abort.Enabled)
            {
                yaml.AppendLine("      abort:");
                yaml.AppendLine($"        percentage:");
                yaml.AppendLine($"          value: {experiment.FaultInjection.Abort.Percentage}");
                yaml.AppendLine($"        httpStatus: {experiment.FaultInjection.Abort.HttpStatusCode}");
            }

            yaml.AppendLine("    route:");
            yaml.AppendLine("    - destination:");
            yaml.AppendLine($"        host: {experiment.ServiceName}");

            return yaml.ToString();
        }

        /// <summary>
        /// 生成Kubernetes Chaos Mesh YAML
        /// </summary>
        private string GenerateKubernetesChaos(ChaosExperimentDto experiment)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: chaos-mesh.org/v1alpha1");
            yaml.AppendLine("kind: NetworkChaos");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {experiment.ExperimentName.ToLower()}-network");
            yaml.AppendLine("spec:");
            yaml.AppendLine("  selector:");
            yaml.AppendLine("    labelSelectors:");
            yaml.AppendLine($"      app: {experiment.ServiceName}");
            yaml.AppendLine("  mode: all");
            yaml.AppendLine("  action: delay");
            yaml.AppendLine("  delay:");
            yaml.AppendLine($"    latency: {experiment.FaultInjection.Delay.FixedDelayMs}ms");
            yaml.AppendLine("  duration: \"" + experiment.Schedule.DurationMinutes + "m\"");

            return yaml.ToString();
        }

        /// <summary>
        /// 生成Prometheus告警规则
        /// </summary>
        private string GeneratePrometheusAlerts(ChaosExperimentDto experiment)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: v1");
            yaml.AppendLine("kind: ConfigMap");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {experiment.ExperimentName.ToLower()}-alerts");
            yaml.AppendLine("data:");
            yaml.AppendLine("  alerts.yml: |");
            yaml.AppendLine("    groups:");
            yaml.AppendLine($"    - name: {experiment.ExperimentName}");
            yaml.AppendLine("      rules:");

            // 响应时间告警
            if (experiment.Metrics.Thresholds.ContainsKey("MaxResponseTimeMs"))
            {
                var threshold = experiment.Metrics.Thresholds["MaxResponseTimeMs"];
                yaml.AppendLine($"      - alert: HighResponseTime_{experiment.ExperimentName}");
                yaml.AppendLine($"        expr: http_request_duration_seconds > {threshold / 1000}");
                yaml.AppendLine("        for: 1m");
                yaml.AppendLine("        labels:");
                yaml.AppendLine("          severity: warning");
                yaml.AppendLine($"          experiment: {experiment.ExperimentName}");
                yaml.AppendLine("        annotations:");
                yaml.AppendLine($"          summary: Response time exceeds {threshold}ms");
            }

            // 错误率告警
            if (experiment.Metrics.Thresholds.ContainsKey("MaxErrorRate"))
            {
                var threshold = experiment.Metrics.Thresholds["MaxErrorRate"];
                yaml.AppendLine($"      - alert: HighErrorRate_{experiment.ExperimentName}");
                yaml.AppendLine($"        expr: rate(http_requests_total{{status=~\"5..\"}}) > {threshold}");
                yaml.AppendLine("        for: 1m");
                yaml.AppendLine("        labels:");
                yaml.AppendLine("          severity: critical");
                yaml.AppendLine($"          experiment: {experiment.ExperimentName}");
                yaml.AppendLine("        annotations:");
                yaml.AppendLine($"          summary: Error rate exceeds {threshold * 100}%");
            }

            return yaml.ToString();
        }
    }
}

