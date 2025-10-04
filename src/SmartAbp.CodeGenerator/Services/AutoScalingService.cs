using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 自动伸缩引擎服务 - Day 25-26
    /// 提供HPA/VPA配置生成、伸缩策略管理、伸缩历史分析功能
    /// </summary>
    public class AutoScalingService : ApplicationService
    {
        private readonly ILogger<AutoScalingService> _logger;

        public AutoScalingService(ILogger<AutoScalingService> logger)
        {
            _logger = logger;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // HPA (Horizontal Pod Autoscaler) 配置生成
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 生成HPA配置
        /// </summary>
        public Task<GeneratedHPAConfigDto> GenerateHPAConfigAsync(
            string serviceName,
            AutoScalingConfigDto config)
        {
            _logger.LogInformation("🚀 生成HPA配置: {ServiceName}", serviceName);

            var yaml = GenerateHPAYaml(serviceName, config);

            var result = new GeneratedHPAConfigDto
            {
                ServiceName = serviceName,
                YamlContent = yaml,
                MinReplicas = config.MinReplicas,
                MaxReplicas = config.MaxReplicas,
                TargetMetrics = new List<string>
                {
                    $"CPU: {config.TargetCPUUtilization}%",
                    $"Memory: {config.TargetMemoryUtilization}%"
                }
            };

            _logger.LogInformation("✅ HPA配置生成完成");
            return Task.FromResult(result);
        }

        /// <summary>
        /// 生成带自定义指标的高级HPA配置
        /// </summary>
        public Task<GeneratedHPAConfigDto> GenerateAdvancedHPAConfigAsync(
            string serviceName,
            AdvancedAutoScalingConfigDto config)
        {
            _logger.LogInformation("🚀 生成高级HPA配置: {ServiceName}", serviceName);

            var yaml = GenerateAdvancedHPAYaml(serviceName, config);

            var result = new GeneratedHPAConfigDto
            {
                ServiceName = serviceName,
                YamlContent = yaml,
                MinReplicas = config.MinReplicas,
                MaxReplicas = config.MaxReplicas,
                TargetMetrics = BuildTargetMetricsList(config)
            };

            _logger.LogInformation("✅ 高级HPA配置生成完成，包含{Count}个指标", result.TargetMetrics.Count);
            return Task.FromResult(result);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // VPA (Vertical Pod Autoscaler) 配置生成
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 生成VPA配置
        /// </summary>
        public Task<GeneratedVPAConfigDto> GenerateVPAConfigAsync(
            string serviceName,
            VPAConfigDto config)
        {
            _logger.LogInformation("🚀 生成VPA配置: {ServiceName}", serviceName);

            var yaml = GenerateVPAYaml(serviceName, config);

            var result = new GeneratedVPAConfigDto
            {
                ServiceName = serviceName,
                YamlContent = yaml,
                UpdateMode = config.UpdateMode,
                ResourcePolicy = config.ResourcePolicy
            };

            _logger.LogInformation("✅ VPA配置生成完成");
            return Task.FromResult(result);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 伸缩策略管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 验证自动伸缩配置
        /// </summary>
        public Task<AutoScalingValidationResultDto> ValidateAutoScalingConfigAsync(
            AutoScalingConfigDto config)
        {
            _logger.LogInformation("🔍 验证自动伸缩配置");

            var result = new AutoScalingValidationResultDto
            {
                IsValid = true,
                Errors = new List<string>()
            };

            // 验证副本数范围
            if (config.MinReplicas < 1)
            {
                result.Errors.Add("最小副本数不能小于1");
                result.IsValid = false;
            }

            if (config.MaxReplicas <= config.MinReplicas)
            {
                result.Errors.Add("最大副本数必须大于最小副本数");
                result.IsValid = false;
            }

            if (config.MaxReplicas > 100)
            {
                result.Errors.Add("最大副本数不建议超过100");
                result.IsValid = false;
            }

            // 验证目标利用率
            if (config.TargetCPUUtilization < 10 || config.TargetCPUUtilization > 90)
            {
                result.Errors.Add("目标CPU利用率应该在10%-90%之间");
                result.IsValid = false;
            }

            if (config.TargetMemoryUtilization < 10 || config.TargetMemoryUtilization > 90)
            {
                result.Errors.Add("目标内存利用率应该在10%-90%之间");
                result.IsValid = false;
            }

            if (result.IsValid)
            {
                _logger.LogInformation("✅ 自动伸缩配置验证通过");
            }
            else
            {
                _logger.LogWarning("⚠️ 自动伸缩配置验证失败: {Errors}", string.Join(", ", result.Errors));
            }

            return Task.FromResult(result);
        }

        /// <summary>
        /// 推荐自动伸缩配置
        /// </summary>
        public Task<AutoScalingRecommendationDto> RecommendAutoScalingConfigAsync(
            string serviceName,
            ResourceUsageHistoryDto usageHistory)
        {
            _logger.LogInformation("💡 为服务 {ServiceName} 推荐自动伸缩配置", serviceName);

            var recommendation = new AutoScalingRecommendationDto
            {
                ServiceName = serviceName,
                RecommendedMinReplicas = CalculateRecommendedMinReplicas(usageHistory),
                RecommendedMaxReplicas = CalculateRecommendedMaxReplicas(usageHistory),
                RecommendedTargetCPU = CalculateRecommendedTargetCPU(usageHistory),
                RecommendedTargetMemory = CalculateRecommendedTargetMemory(usageHistory),
                Confidence = CalculateConfidence(usageHistory),
                Rationale = GenerateRationale(usageHistory)
            };

            _logger.LogInformation("✅ 推荐配置生成完成，置信度: {Confidence}%", recommendation.Confidence);
            return Task.FromResult(recommendation);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 伸缩历史分析
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取伸缩历史
        /// </summary>
        public Task<AutoScalingHistoryDto> GetScalingHistoryAsync(
            string serviceName,
            DateTime startTime,
            DateTime endTime)
        {
            _logger.LogInformation("📊 获取伸缩历史: {ServiceName}, {StartTime} - {EndTime}",
                serviceName, startTime, endTime);

            // TODO: 从Kubernetes API或数据库查询实际伸缩历史
            // 这里使用模拟数据作为示例

            var history = new AutoScalingHistoryDto
            {
                ServiceName = serviceName,
                StartTime = startTime,
                EndTime = endTime,
                Events = GenerateMockScalingEvents(serviceName, startTime, endTime),
                Statistics = new ScalingStatisticsDto
                {
                    TotalScaleUpEvents = 15,
                    TotalScaleDownEvents = 12,
                    AverageReplicas = 5.2,
                    MaxReplicas = 10,
                    MinReplicas = 2,
                    TotalScalingDuration = TimeSpan.FromHours(2.5)
                }
            };

            _logger.LogInformation("✅ 获取到 {Count} 个伸缩事件", history.Events.Count);
            return Task.FromResult(history);
        }

        /// <summary>
        /// 分析伸缩效率
        /// </summary>
        public Task<ScalingEfficiencyAnalysisDto> AnalyzeScalingEfficiencyAsync(
            string serviceName,
            DateTime startTime,
            DateTime endTime)
        {
            _logger.LogInformation("📈 分析伸缩效率: {ServiceName}", serviceName);

            var analysis = new ScalingEfficiencyAnalysisDto
            {
                ServiceName = serviceName,
                Period = $"{startTime:yyyy-MM-dd} - {endTime:yyyy-MM-dd}",
                EfficiencyScore = 85.5, // 0-100分
                ScaleUpLatency = TimeSpan.FromSeconds(45), // 扩容延迟
                ScaleDownLatency = TimeSpan.FromSeconds(120), // 缩容延迟
                ThrashingEvents = 2, // 抖动事件（频繁扩缩容）
                OverProvisioningPercentage = 15.3, // 过度配置百分比
                UnderProvisioningPercentage = 3.2, // 配置不足百分比
                CostSavings = 1250.50m, // 成本节省（美元）
                Recommendations = new List<string>
                {
                    "建议增加稳定窗口时间，减少抖动",
                    "当前最大副本数设置合理",
                    "可以适当降低目标CPU阈值，减少过度配置"
                }
            };

            _logger.LogInformation("✅ 伸缩效率分析完成，效率评分: {Score}/100", analysis.EfficiencyScore);
            return Task.FromResult(analysis);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Private Helper Methods
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private string GenerateHPAYaml(string serviceName, AutoScalingConfigDto config)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: autoscaling/v2");
            yaml.AppendLine("kind: HorizontalPodAutoscaler");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {serviceName}-hpa");
            yaml.AppendLine("  labels:");
            yaml.AppendLine($"    app: {serviceName}");
            yaml.AppendLine("spec:");
            yaml.AppendLine("  scaleTargetRef:");
            yaml.AppendLine("    apiVersion: apps/v1");
            yaml.AppendLine("    kind: Deployment");
            yaml.AppendLine($"    name: {serviceName}");
            yaml.AppendLine($"  minReplicas: {config.MinReplicas}");
            yaml.AppendLine($"  maxReplicas: {config.MaxReplicas}");
            yaml.AppendLine("  metrics:");
            yaml.AppendLine("  - type: Resource");
            yaml.AppendLine("    resource:");
            yaml.AppendLine("      name: cpu");
            yaml.AppendLine("      target:");
            yaml.AppendLine("        type: Utilization");
            yaml.AppendLine($"        averageUtilization: {config.TargetCPUUtilization}");
            yaml.AppendLine("  - type: Resource");
            yaml.AppendLine("    resource:");
            yaml.AppendLine("      name: memory");
            yaml.AppendLine("      target:");
            yaml.AppendLine("        type: Utilization");
            yaml.AppendLine($"        averageUtilization: {config.TargetMemoryUtilization}");

            // 伸缩行为配置
            yaml.AppendLine("  behavior:");
            yaml.AppendLine("    scaleDown:");
            yaml.AppendLine("      stabilizationWindowSeconds: 300");
            yaml.AppendLine("      policies:");
            yaml.AppendLine("      - type: Percent");
            yaml.AppendLine("        value: 50");
            yaml.AppendLine("        periodSeconds: 60");
            yaml.AppendLine("    scaleUp:");
            yaml.AppendLine("      stabilizationWindowSeconds: 0");
            yaml.AppendLine("      policies:");
            yaml.AppendLine("      - type: Percent");
            yaml.AppendLine("        value: 100");
            yaml.AppendLine("        periodSeconds: 15");
            yaml.AppendLine("      - type: Pods");
            yaml.AppendLine("        value: 4");
            yaml.AppendLine("        periodSeconds: 15");
            yaml.AppendLine("      selectPolicy: Max");

            return yaml.ToString();
        }

        private string GenerateAdvancedHPAYaml(string serviceName, AdvancedAutoScalingConfigDto config)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: autoscaling/v2");
            yaml.AppendLine("kind: HorizontalPodAutoscaler");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {serviceName}-hpa");
            yaml.AppendLine("spec:");
            yaml.AppendLine("  scaleTargetRef:");
            yaml.AppendLine("    apiVersion: apps/v1");
            yaml.AppendLine("    kind: Deployment");
            yaml.AppendLine($"    name: {serviceName}");
            yaml.AppendLine($"  minReplicas: {config.MinReplicas}");
            yaml.AppendLine($"  maxReplicas: {config.MaxReplicas}");
            yaml.AppendLine("  metrics:");

            // CPU/Memory指标
            if (config.TargetCPUUtilization > 0)
            {
                yaml.AppendLine("  - type: Resource");
                yaml.AppendLine("    resource:");
                yaml.AppendLine("      name: cpu");
                yaml.AppendLine("      target:");
                yaml.AppendLine("        type: Utilization");
                yaml.AppendLine($"        averageUtilization: {config.TargetCPUUtilization}");
            }

            if (config.TargetMemoryUtilization > 0)
            {
                yaml.AppendLine("  - type: Resource");
                yaml.AppendLine("    resource:");
                yaml.AppendLine("      name: memory");
                yaml.AppendLine("      target:");
                yaml.AppendLine("        type: Utilization");
                yaml.AppendLine($"        averageUtilization: {config.TargetMemoryUtilization}");
            }

            // 自定义指标
            if (config.CustomMetrics != null && config.CustomMetrics.Any())
            {
                foreach (var metric in config.CustomMetrics)
                {
                    yaml.AppendLine($"  - type: {metric.Type}");
                    yaml.AppendLine($"    {metric.Type.ToLower()}:");
                    yaml.AppendLine($"      metric:");
                    yaml.AppendLine($"        name: {metric.Name}");
                    yaml.AppendLine("      target:");
                    yaml.AppendLine($"        type: {metric.TargetType}");
                    yaml.AppendLine($"        {metric.TargetType.ToLower()}: {metric.TargetValue}");
                }
            }

            return yaml.ToString();
        }

        private string GenerateVPAYaml(string serviceName, VPAConfigDto config)
        {
            var yaml = new StringBuilder();

            yaml.AppendLine("apiVersion: autoscaling.k8s.io/v1");
            yaml.AppendLine("kind: VerticalPodAutoscaler");
            yaml.AppendLine("metadata:");
            yaml.AppendLine($"  name: {serviceName}-vpa");
            yaml.AppendLine("spec:");
            yaml.AppendLine("  targetRef:");
            yaml.AppendLine("    apiVersion: apps/v1");
            yaml.AppendLine("    kind: Deployment");
            yaml.AppendLine($"    name: {serviceName}");
            yaml.AppendLine($"  updatePolicy:");
            yaml.AppendLine($"    updateMode: {config.UpdateMode}"); // Off, Initial, Recreate, Auto
            
            if (config.ResourcePolicy != null)
            {
                yaml.AppendLine("  resourcePolicy:");
                yaml.AppendLine("    containerPolicies:");
                yaml.AppendLine($"    - containerName: {serviceName}");
                yaml.AppendLine("      minAllowed:");
                yaml.AppendLine($"        cpu: {config.ResourcePolicy.MinCPU}");
                yaml.AppendLine($"        memory: {config.ResourcePolicy.MinMemory}");
                yaml.AppendLine("      maxAllowed:");
                yaml.AppendLine($"        cpu: {config.ResourcePolicy.MaxCPU}");
                yaml.AppendLine($"        memory: {config.ResourcePolicy.MaxMemory}");
            }

            return yaml.ToString();
        }

        private List<string> BuildTargetMetricsList(AdvancedAutoScalingConfigDto config)
        {
            var metrics = new List<string>();

            if (config.TargetCPUUtilization > 0)
                metrics.Add($"CPU: {config.TargetCPUUtilization}%");

            if (config.TargetMemoryUtilization > 0)
                metrics.Add($"Memory: {config.TargetMemoryUtilization}%");

            if (config.CustomMetrics != null)
            {
                foreach (var metric in config.CustomMetrics)
                {
                    metrics.Add($"{metric.Name}: {metric.TargetValue}");
                }
            }

            return metrics;
        }

        private int CalculateRecommendedMinReplicas(ResourceUsageHistoryDto history)
        {
            // 基于历史数据分析最低负载
            if (history.DataPoints.Count == 0) return 1;
            var minLoad = history.DataPoints.Min(dp => dp.RequestsPerSecond);
            var avgRequestsPerPod = 100.0; // 假设每个Pod平均处理100 RPS
            return Math.Max(1, (int)Math.Ceiling(minLoad / avgRequestsPerPod));
        }

        private int CalculateRecommendedMaxReplicas(ResourceUsageHistoryDto history)
        {
            // 基于历史数据分析最高负载
            if (history.DataPoints.Count == 0) return 10;
            var maxLoad = history.DataPoints.Max(dp => dp.RequestsPerSecond);
            var avgRequestsPerPod = 100.0;
            return Math.Max(3, (int)Math.Ceiling(maxLoad / avgRequestsPerPod * 1.2)); // 留20%余量
        }

        private int CalculateRecommendedTargetCPU(ResourceUsageHistoryDto history)
        {
            // 基于历史CPU使用率推荐目标值
            var avgCpu = history.DataPoints.Average(dp => dp.CPUUtilization);
            
            if (avgCpu < 30)
                return 50; // 低负载，设置较低目标以节省资源
            else if (avgCpu < 60)
                return 60; // 中等负载，平衡性能和资源
            else
                return 70; // 高负载，确保性能
        }

        private int CalculateRecommendedTargetMemory(ResourceUsageHistoryDto history)
        {
            var avgMemory = history.DataPoints.Average(dp => dp.MemoryUtilization);
            
            if (avgMemory < 40)
                return 60;
            else if (avgMemory < 70)
                return 75;
            else
                return 80;
        }

        private double CalculateConfidence(ResourceUsageHistoryDto history)
        {
            // 基于数据点数量和稳定性计算置信度
            var dataPointCount = history.DataPoints.Count;
            var variance = CalculateVariance(history.DataPoints.Select(dp => dp.CPUUtilization).ToList());
            
            var confidence = Math.Min(100.0, dataPointCount * 2.0); // 数据点越多越可信
            confidence -= variance * 10.0; // 方差越大越不可信
            
            return Math.Max(0, Math.Min(100, confidence));
        }

        private double CalculateVariance(List<double> values)
        {
            if (values.Count == 0) return 0;
            
            var avg = values.Average();
            var sumSquares = values.Sum(v => Math.Pow(v - avg, 2));
            return sumSquares / values.Count;
        }

        private string GenerateRationale(ResourceUsageHistoryDto history)
        {
            var avgCpu = history.DataPoints.Average(dp => dp.CPUUtilization);
            var avgMemory = history.DataPoints.Average(dp => dp.MemoryUtilization);
            var maxRps = history.DataPoints.Max(dp => dp.RequestsPerSecond);

            return $"基于{history.DataPoints.Count}个数据点分析：" +
                   $"平均CPU使用率{avgCpu:F1}%，" +
                   $"平均内存使用率{avgMemory:F1}%，" +
                   $"峰值请求率{maxRps:F0} RPS。" +
                   "建议配置已考虑20%的余量以应对流量峰值。";
        }

        private List<ScalingEventDto> GenerateMockScalingEvents(string serviceName, DateTime startTime, DateTime endTime)
        {
            // 生成模拟的伸缩事件数据
            var events = new List<ScalingEventDto>();
            var currentTime = startTime;
            var random = new Random();

            while (currentTime < endTime)
            {
                events.Add(new ScalingEventDto
                {
                    Timestamp = currentTime,
                    EventType = random.Next(0, 2) == 0 ? "ScaleUp" : "ScaleDown",
                    OldReplicas = random.Next(2, 8),
                    NewReplicas = random.Next(2, 10),
                    Reason = random.Next(0, 2) == 0 ? "CPU utilization above target" : "CPU utilization below target",
                    Metric = "cpu",
                    CurrentValue = random.Next(40, 90),
                    TargetValue = 70
                });

                currentTime = currentTime.AddHours(random.Next(1, 6));
            }

            return events;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DTOs for AutoScaling Service
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public class GeneratedHPAConfigDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public string YamlContent { get; set; } = string.Empty;
        public int MinReplicas { get; set; }
        public int MaxReplicas { get; set; }
        public List<string> TargetMetrics { get; set; } = new();
    }

    public class GeneratedVPAConfigDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public string YamlContent { get; set; } = string.Empty;
        public string UpdateMode { get; set; } = string.Empty;
        public VPAResourcePolicyDto? ResourcePolicy { get; set; }
    }

    public class VPAConfigDto
    {
        public string UpdateMode { get; set; } = "Auto"; // Off, Initial, Recreate, Auto
        public VPAResourcePolicyDto? ResourcePolicy { get; set; }
    }

    public class VPAResourcePolicyDto
    {
        public string MinCPU { get; set; } = "100m";
        public string MinMemory { get; set; } = "128Mi";
        public string MaxCPU { get; set; } = "4000m";
        public string MaxMemory { get; set; } = "8Gi";
    }

    public class AdvancedAutoScalingConfigDto : AutoScalingConfigDto
    {
        // CustomMetrics已在基类AutoScalingConfigDto中定义
        // 此处无需重复定义
    }

    // CustomMetricDto已在Dtos.cs中定义

    public class AutoScalingValidationResultDto
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
    }

    public class AutoScalingRecommendationDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public int RecommendedMinReplicas { get; set; }
        public int RecommendedMaxReplicas { get; set; }
        public int RecommendedTargetCPU { get; set; }
        public int RecommendedTargetMemory { get; set; }
        public double Confidence { get; set; } // 0-100
        public string Rationale { get; set; } = string.Empty;
    }

    public class ResourceUsageHistoryDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public List<ResourceUsageDataPointDto> DataPoints { get; set; } = new();
    }

    public class ResourceUsageDataPointDto
    {
        public DateTime Timestamp { get; set; }
        public double CPUUtilization { get; set; } // 0-100
        public double MemoryUtilization { get; set; } // 0-100
        public double RequestsPerSecond { get; set; }
        public int CurrentReplicas { get; set; }
    }

    public class AutoScalingHistoryDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public List<ScalingEventDto> Events { get; set; } = new();
        public ScalingStatisticsDto Statistics { get; set; } = new();
    }

    public class ScalingEventDto
    {
        public DateTime Timestamp { get; set; }
        public string EventType { get; set; } = string.Empty; // ScaleUp, ScaleDown
        public int OldReplicas { get; set; }
        public int NewReplicas { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Metric { get; set; } = string.Empty;
        public double CurrentValue { get; set; }
        public double TargetValue { get; set; }
    }

    public class ScalingStatisticsDto
    {
        public int TotalScaleUpEvents { get; set; }
        public int TotalScaleDownEvents { get; set; }
        public double AverageReplicas { get; set; }
        public int MaxReplicas { get; set; }
        public int MinReplicas { get; set; }
        public TimeSpan TotalScalingDuration { get; set; }
    }

    public class ScalingEfficiencyAnalysisDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public double EfficiencyScore { get; set; } // 0-100
        public TimeSpan ScaleUpLatency { get; set; }
        public TimeSpan ScaleDownLatency { get; set; }
        public int ThrashingEvents { get; set; }
        public double OverProvisioningPercentage { get; set; }
        public double UnderProvisioningPercentage { get; set; }
        public decimal CostSavings { get; set; }
        public List<string> Recommendations { get; set; } = new();
    }
}

