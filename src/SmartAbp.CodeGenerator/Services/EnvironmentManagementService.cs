using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 环境管理服务 - Day 10
    /// 提供多环境配置管理、环境对比等功能
    /// </summary>
    public class EnvironmentManagementService : ApplicationService
    {
        private readonly ILogger<EnvironmentManagementService> _logger;

        // 默认环境配置模板
        private readonly Dictionary<string, EnvironmentConfigDto> _defaultConfigs = new();

        public EnvironmentManagementService(ILogger<EnvironmentManagementService> logger)
        {
            _logger = logger;
            InitializeDefaultConfigs();
        }

        /// <summary>
        /// 获取所有支持的环境列表
        /// </summary>
        public Task<List<string>> GetEnvironmentsAsync()
        {
            _logger.LogInformation("🔍 获取环境列表");

            var environments = new List<string>
            {
                "Development",
                "Staging",
                "Production"
            };

            return Task.FromResult(environments);
        }

        /// <summary>
        /// 获取指定环境的配置
        /// </summary>
        public Task<EnvironmentConfigDto> GetEnvironmentConfigAsync(string environment)
        {
            _logger.LogInformation("🔍 获取环境配置: {Environment}", environment);

            if (!_defaultConfigs.ContainsKey(environment))
            {
                throw new InvalidOperationException($"不支持的环境类型: {environment}");
            }

            // 返回默认配置的深拷贝
            var config = CloneConfig(_defaultConfigs[environment]);
            return Task.FromResult(config);
        }

        /// <summary>
        /// 保存环境配置
        /// </summary>
        public Task<EnvironmentConfigDto> SaveEnvironmentConfigAsync(string environment, EnvironmentConfigDto config)
        {
            _logger.LogInformation("💾 保存环境配置: {Environment}", environment);

            // 验证配置
            ValidateConfig(config);

            // TODO: 实际项目中应该持久化到数据库或配置存储
            // 这里仅作为示例，返回配置本身
            config.Environment = environment;

            _logger.LogInformation("✅ 环境配置保存成功: {Environment}", environment);
            return Task.FromResult(config);
        }

        /// <summary>
        /// 对比两个环境的配置差异
        /// </summary>
        public Task<EnvironmentComparisonDto> CompareEnvironmentsAsync(string env1, string env2)
        {
            _logger.LogInformation("🔄 对比环境配置: {Env1} vs {Env2}", env1, env2);

            var config1 = _defaultConfigs[env1];
            var config2 = _defaultConfigs[env2];

            var comparison = new EnvironmentComparisonDto
            {
                Environment1 = env1,
                Environment2 = env2,
                Differences = new List<ConfigDifferenceDto>()
            };

            // 对比副本数
            if (config1.DefaultReplicas != config2.DefaultReplicas)
            {
                comparison.Differences.Add(new ConfigDifferenceDto
                {
                    Path = "DefaultReplicas",
                    Property = "副本数",
                    Value1 = config1.DefaultReplicas.ToString(),
                    Value2 = config2.DefaultReplicas.ToString(),
                    DifferenceType = "Modified"
                });
            }

            // 对比资源限制
            CompareResources(config1.Resources, config2.Resources, comparison);

            // 对比特性开关
            CompareFeatureFlags(config1.Features, config2.Features, comparison);

            // 对比部署策略
            CompareDeploymentStrategy(config1.DeploymentStrategy, config2.DeploymentStrategy, comparison);

            // 对比环境变量
            CompareEnvironmentVariables(config1.EnvironmentVariables, config2.EnvironmentVariables, comparison);

            comparison.TotalDifferences = comparison.Differences.Count;

            _logger.LogInformation("✅ 环境对比完成，发现 {Count} 个差异", comparison.TotalDifferences);
            return Task.FromResult(comparison);
        }

        /// <summary>
        /// 获取默认环境配置
        /// </summary>
        public Task<Dictionary<string, EnvironmentConfigDto>> GetDefaultConfigsAsync()
        {
            _logger.LogInformation("🔍 获取所有默认环境配置");
            return Task.FromResult(new Dictionary<string, EnvironmentConfigDto>(_defaultConfigs));
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Private Methods
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private void InitializeDefaultConfigs()
        {
            // Development环境配置
            _defaultConfigs["Development"] = new EnvironmentConfigDto
            {
                Environment = "Development",
                DefaultReplicas = 1,
                Resources = new ResourceLimitsDto
                {
                    CpuRequest = "100m",
                    CpuLimit = "500m",
                    MemoryRequest = "128Mi",
                    MemoryLimit = "512Mi",
                    StorageRequest = "1Gi",
                    StorageLimit = "5Gi"
                },
                Features = new FeatureFlagsDto
                {
                    EnableTelemetry = true,
                    EnableMetrics = true,
                    EnableTracing = true,
                    EnableLogging = true,
                    EnableHealthChecks = true,
                    EnableSwagger = true
                },
                DeploymentStrategy = new DeploymentStrategyConfigDto
                {
                    Type = "RollingUpdate",
                    MaxSurge = "1",
                    MaxUnavailable = "0"
                },
                EnableAutoScaling = false,
                EnvironmentVariables = new Dictionary<string, string>
                {
                    { "ASPNETCORE_ENVIRONMENT", "Development" },
                    { "LOG_LEVEL", "Debug" }
                }
            };

            // Staging环境配置
            _defaultConfigs["Staging"] = new EnvironmentConfigDto
            {
                Environment = "Staging",
                DefaultReplicas = 2,
                Resources = new ResourceLimitsDto
                {
                    CpuRequest = "200m",
                    CpuLimit = "1000m",
                    MemoryRequest = "256Mi",
                    MemoryLimit = "1Gi",
                    StorageRequest = "5Gi",
                    StorageLimit = "20Gi"
                },
                Features = new FeatureFlagsDto
                {
                    EnableTelemetry = true,
                    EnableMetrics = true,
                    EnableTracing = true,
                    EnableLogging = true,
                    EnableHealthChecks = true,
                    EnableSwagger = true
                },
                DeploymentStrategy = new DeploymentStrategyConfigDto
                {
                    Type = "RollingUpdate",
                    MaxSurge = "25%",
                    MaxUnavailable = "0"
                },
                EnableAutoScaling = true,
                AutoScaling = new AutoScalingConfigDto
                {
                    MinReplicas = 2,
                    MaxReplicas = 5,
                    TargetCPUUtilization = 70,
                    TargetMemoryUtilization = 80
                },
                EnvironmentVariables = new Dictionary<string, string>
                {
                    { "ASPNETCORE_ENVIRONMENT", "Staging" },
                    { "LOG_LEVEL", "Information" }
                }
            };

            // Production环境配置
            _defaultConfigs["Production"] = new EnvironmentConfigDto
            {
                Environment = "Production",
                DefaultReplicas = 3,
                Resources = new ResourceLimitsDto
                {
                    CpuRequest = "500m",
                    CpuLimit = "2000m",
                    MemoryRequest = "512Mi",
                    MemoryLimit = "2Gi",
                    StorageRequest = "10Gi",
                    StorageLimit = "50Gi"
                },
                Features = new FeatureFlagsDto
                {
                    EnableTelemetry = true,
                    EnableMetrics = true,
                    EnableTracing = true,
                    EnableLogging = true,
                    EnableHealthChecks = true,
                    EnableSwagger = false  // 生产环境关闭Swagger
                },
                DeploymentStrategy = new DeploymentStrategyConfigDto
                {
                    Type = "RollingUpdate",
                    MaxSurge = "25%",
                    MaxUnavailable = "0",
                    MinReadySeconds = 10,
                    ProgressDeadlineSeconds = 600
                },
                EnableAutoScaling = true,
                AutoScaling = new AutoScalingConfigDto
                {
                    MinReplicas = 3,
                    MaxReplicas = 20,
                    TargetCPUUtilization = 60,
                    TargetMemoryUtilization = 70
                },
                EnvironmentVariables = new Dictionary<string, string>
                {
                    { "ASPNETCORE_ENVIRONMENT", "Production" },
                    { "LOG_LEVEL", "Warning" }
                }
            };
        }

        private void ValidateConfig(EnvironmentConfigDto config)
        {
            if (config.DefaultReplicas < 1)
            {
                throw new ArgumentException("副本数不能小于1");
            }

            if (config.EnableAutoScaling && config.AutoScaling == null)
            {
                throw new ArgumentException("启用自动扩缩容时必须提供AutoScaling配置");
            }

            if (config.AutoScaling != null)
            {
                if (config.AutoScaling.MinReplicas > config.AutoScaling.MaxReplicas)
                {
                    throw new ArgumentException("MinReplicas不能大于MaxReplicas");
                }
            }
        }

        private EnvironmentConfigDto CloneConfig(EnvironmentConfigDto source)
        {
            var json = JsonSerializer.Serialize(source);
            return JsonSerializer.Deserialize<EnvironmentConfigDto>(json) ?? source;
        }

        private void CompareResources(ResourceLimitsDto res1, ResourceLimitsDto res2, EnvironmentComparisonDto comparison)
        {
            if (res1.CpuRequest != res2.CpuRequest)
            {
                comparison.Differences.Add(new ConfigDifferenceDto
                {
                    Path = "Resources.CpuRequest",
                    Property = "CPU请求",
                    Value1 = res1.CpuRequest,
                    Value2 = res2.CpuRequest
                });
            }

            if (res1.CpuLimit != res2.CpuLimit)
            {
                comparison.Differences.Add(new ConfigDifferenceDto
                {
                    Path = "Resources.CpuLimit",
                    Property = "CPU限制",
                    Value1 = res1.CpuLimit,
                    Value2 = res2.CpuLimit
                });
            }

            if (res1.MemoryRequest != res2.MemoryRequest)
            {
                comparison.Differences.Add(new ConfigDifferenceDto
                {
                    Path = "Resources.MemoryRequest",
                    Property = "内存请求",
                    Value1 = res1.MemoryRequest,
                    Value2 = res2.MemoryRequest
                });
            }

            if (res1.MemoryLimit != res2.MemoryLimit)
            {
                comparison.Differences.Add(new ConfigDifferenceDto
                {
                    Path = "Resources.MemoryLimit",
                    Property = "内存限制",
                    Value1 = res1.MemoryLimit,
                    Value2 = res2.MemoryLimit
                });
            }
        }

        private void CompareFeatureFlags(FeatureFlagsDto features1, FeatureFlagsDto features2, EnvironmentComparisonDto comparison)
        {
            if (features1.EnableSwagger != features2.EnableSwagger)
            {
                comparison.Differences.Add(new ConfigDifferenceDto
                {
                    Path = "Features.EnableSwagger",
                    Property = "Swagger开关",
                    Value1 = features1.EnableSwagger.ToString(),
                    Value2 = features2.EnableSwagger.ToString()
                });
            }

            if (features1.EnableTelemetry != features2.EnableTelemetry)
            {
                comparison.Differences.Add(new ConfigDifferenceDto
                {
                    Path = "Features.EnableTelemetry",
                    Property = "遥测开关",
                    Value1 = features1.EnableTelemetry.ToString(),
                    Value2 = features2.EnableTelemetry.ToString()
                });
            }
        }

        private void CompareDeploymentStrategy(DeploymentStrategyConfigDto strategy1, DeploymentStrategyConfigDto strategy2, EnvironmentComparisonDto comparison)
        {
            if (strategy1.Type != strategy2.Type)
            {
                comparison.Differences.Add(new ConfigDifferenceDto
                {
                    Path = "DeploymentStrategy.Type",
                    Property = "部署策略类型",
                    Value1 = strategy1.Type,
                    Value2 = strategy2.Type
                });
            }

            if (strategy1.MaxSurge != strategy2.MaxSurge)
            {
                comparison.Differences.Add(new ConfigDifferenceDto
                {
                    Path = "DeploymentStrategy.MaxSurge",
                    Property = "最大增量",
                    Value1 = strategy1.MaxSurge,
                    Value2 = strategy2.MaxSurge
                });
            }
        }

        private void CompareEnvironmentVariables(Dictionary<string, string> env1, Dictionary<string, string> env2, EnvironmentComparisonDto comparison)
        {
            var allKeys = env1.Keys.Union(env2.Keys).ToHashSet();

            foreach (var key in allKeys)
            {
                var hasKey1 = env1.ContainsKey(key);
                var hasKey2 = env2.ContainsKey(key);

                if (!hasKey1 && hasKey2)
                {
                    comparison.Differences.Add(new ConfigDifferenceDto
                    {
                        Path = $"EnvironmentVariables.{key}",
                        Property = "环境变量",
                        Value1 = null,
                        Value2 = env2[key],
                        DifferenceType = "Added"
                    });
                }
                else if (hasKey1 && !hasKey2)
                {
                    comparison.Differences.Add(new ConfigDifferenceDto
                    {
                        Path = $"EnvironmentVariables.{key}",
                        Property = "环境变量",
                        Value1 = env1[key],
                        Value2 = null,
                        DifferenceType = "Removed"
                    });
                }
                else if (hasKey1 && hasKey2 && env1[key] != env2[key])
                {
                    comparison.Differences.Add(new ConfigDifferenceDto
                    {
                        Path = $"EnvironmentVariables.{key}",
                        Property = "环境变量",
                        Value1 = env1[key],
                        Value2 = env2[key],
                        DifferenceType = "Modified"
                    });
                }
            }
        }
    }
}

