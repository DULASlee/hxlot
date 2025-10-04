using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 成本估算服务 - Day 28-29
    /// 提供云资源成本估算、成本优化建议、多云成本对比功能
    /// </summary>
    public class CostEstimationService : ApplicationService
    {
        private readonly ILogger<CostEstimationService> _logger;

        // 云服务商定价配置（示例价格，实际应从配置或API获取）
        private readonly Dictionary<string, CloudPricingDto> _cloudPricing;

        public CostEstimationService(ILogger<CostEstimationService> logger)
        {
            _logger = logger;
            _cloudPricing = InitializeCloudPricing();
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 成本估算
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 估算服务成本
        /// </summary>
        public Task<ServiceCostEstimationDto> EstimateServiceCostAsync(
            string serviceName,
            ServiceResourceConfigDto resourceConfig,
            string cloudProvider = "Azure")
        {
            _logger.LogInformation("💰 估算服务成本: {ServiceName} on {CloudProvider}", 
                serviceName, cloudProvider);

            if (!_cloudPricing.ContainsKey(cloudProvider))
            {
                throw new ArgumentException($"不支持的云服务商: {cloudProvider}");
            }

            var pricing = _cloudPricing[cloudProvider];
            var estimation = CalculateServiceCost(resourceConfig, pricing);

            var result = new ServiceCostEstimationDto
            {
                ServiceName = serviceName,
                CloudProvider = cloudProvider,
                MonthlyCost = estimation.MonthlyCost,
                AnnualCost = estimation.AnnualCost,
                CostBreakdown = estimation.CostBreakdown,
                Currency = "USD"
            };

            _logger.LogInformation("✅ 成本估算完成: ${MonthlyCost}/月", result.MonthlyCost);
            return Task.FromResult(result);
        }

        /// <summary>
        /// 估算整个解决方案的成本
        /// </summary>
        public Task<SolutionCostEstimationDto> EstimateSolutionCostAsync(
            string solutionName,
            List<ServiceResourceConfigDto> services,
            string cloudProvider = "Azure")
        {
            _logger.LogInformation("💰 估算解决方案成本: {SolutionName} ({ServiceCount}个服务)", 
                solutionName, services.Count);

            var serviceCosts = new List<ServiceCostEstimationDto>();
            decimal totalMonthlyCost = 0;

            foreach (var service in services)
            {
                var serviceCost = EstimateServiceCostAsync(
                    service.ServiceName, 
                    service, 
                    cloudProvider).Result;
                serviceCosts.Add(serviceCost);
                totalMonthlyCost += serviceCost.MonthlyCost;
            }

            var result = new SolutionCostEstimationDto
            {
                SolutionName = solutionName,
                CloudProvider = cloudProvider,
                ServiceCount = services.Count,
                TotalMonthlyCost = totalMonthlyCost,
                TotalAnnualCost = totalMonthlyCost * 12,
                ServiceCosts = serviceCosts,
                Currency = "USD"
            };

            _logger.LogInformation("✅ 解决方案成本估算完成: ${TotalMonthlyCost}/月", 
                result.TotalMonthlyCost);
            return Task.FromResult(result);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 多云成本对比
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 对比多个云服务商的成本
        /// </summary>
        public Task<MultiCloudCostComparisonDto> CompareMultiCloudCostAsync(
            string solutionName,
            List<ServiceResourceConfigDto> services,
            List<string> cloudProviders)
        {
            _logger.LogInformation("🔄 对比多云成本: {SolutionName}", solutionName);

            var comparisons = new List<CloudProviderCostDto>();

            foreach (var provider in cloudProviders)
            {
                var estimation = EstimateSolutionCostAsync(solutionName, services, provider).Result;
                comparisons.Add(new CloudProviderCostDto
                {
                    Provider = provider,
                    MonthlyCost = estimation.TotalMonthlyCost,
                    AnnualCost = estimation.TotalAnnualCost
                });
            }

            // 找出最便宜的方案
            var cheapest = comparisons.OrderBy(c => c.MonthlyCost).First();
            var mostExpensive = comparisons.OrderBy(c => c.MonthlyCost).Last();
            var savingsPercentage = mostExpensive.MonthlyCost > 0
                ? ((mostExpensive.MonthlyCost - cheapest.MonthlyCost) / mostExpensive.MonthlyCost) * 100
                : 0;

            var result = new MultiCloudCostComparisonDto
            {
                SolutionName = solutionName,
                Comparisons = comparisons,
                CheapestProvider = cheapest.Provider,
                CheapestMonthlyCost = cheapest.MonthlyCost,
                MostExpensiveProvider = mostExpensive.Provider,
                MostExpensiveMonthlyCost = mostExpensive.MonthlyCost,
                PotentialSavingsPercentage = savingsPercentage,
                PotentialMonthlySavings = mostExpensive.MonthlyCost - cheapest.MonthlyCost,
                PotentialAnnualSavings = (mostExpensive.MonthlyCost - cheapest.MonthlyCost) * 12
            };

            _logger.LogInformation("✅ 多云成本对比完成，选择{Provider}可节省{Savings}%",
                cheapest.Provider, savingsPercentage);
            return Task.FromResult(result);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 成本优化建议
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 生成成本优化建议
        /// </summary>
        public Task<CostOptimizationRecommendationDto> GenerateOptimizationRecommendationsAsync(
            string serviceName,
            ServiceResourceConfigDto currentConfig,
            ResourceUsageHistoryDto usageHistory)
        {
            _logger.LogInformation("💡 生成成本优化建议: {ServiceName}", serviceName);

            var recommendations = new List<CostOptimizationItemDto>();

            // 分析1: 资源过度配置
            var avgCpuUtilization = usageHistory.DataPoints.Average(dp => dp.CPUUtilization);
            var avgMemoryUtilization = usageHistory.DataPoints.Average(dp => dp.MemoryUtilization);

            if (avgCpuUtilization < 30)
            {
                var potentialSavings = CalculateCPUReductionSavings(currentConfig);
                recommendations.Add(new CostOptimizationItemDto
                {
                    Category = "资源优化",
                    Priority = "高",
                    Title = "CPU资源过度配置",
                    Description = $"平均CPU使用率仅{avgCpuUtilization:F1}%，建议降低CPU配置",
                    CurrentValue = $"{currentConfig.CpuRequest} / {currentConfig.CpuLimit}",
                    RecommendedValue = $"{ReduceCPU(currentConfig.CpuRequest)} / {ReduceCPU(currentConfig.CpuLimit)}",
                    PotentialMonthlySavings = potentialSavings,
                    Impact = "低",
                    ImplementationEffort = "简单"
                });
            }

            if (avgMemoryUtilization < 40)
            {
                var potentialSavings = CalculateMemoryReductionSavings(currentConfig);
                recommendations.Add(new CostOptimizationItemDto
                {
                    Category = "资源优化",
                    Priority = "中",
                    Title = "内存资源过度配置",
                    Description = $"平均内存使用率仅{avgMemoryUtilization:F1}%，建议降低内存配置",
                    CurrentValue = $"{currentConfig.MemoryRequest} / {currentConfig.MemoryLimit}",
                    RecommendedValue = $"{ReduceMemory(currentConfig.MemoryRequest)} / {ReduceMemory(currentConfig.MemoryLimit)}",
                    PotentialMonthlySavings = potentialSavings,
                    Impact = "低",
                    ImplementationEffort = "简单"
                });
            }

            // 分析2: 实例类型优化
            recommendations.Add(new CostOptimizationItemDto
            {
                Category = "实例优化",
                Priority = "中",
                Title = "使用Spot实例",
                Description = "对于非关键工作负载，使用Spot实例可节省70%成本",
                CurrentValue = "按需实例",
                RecommendedValue = "Spot实例（带故障转移）",
                PotentialMonthlySavings = CalculateSpotInstanceSavings(currentConfig),
                Impact = "中",
                ImplementationEffort = "中等"
            });

            // 分析3: 存储优化
            if (currentConfig.StorageSize > 100)
            {
                recommendations.Add(new CostOptimizationItemDto
                {
                    Category = "存储优化",
                    Priority = "低",
                    Title = "存储层级优化",
                    Description = "将冷数据迁移到低成本存储层",
                    CurrentValue = "高性能SSD",
                    RecommendedValue = "分层存储（热数据SSD + 冷数据HDD）",
                    PotentialMonthlySavings = CalculateStorageTieringSavings(currentConfig),
                    Impact = "低",
                    ImplementationEffort = "复杂"
                });
            }

            // 分析4: 预留实例
            recommendations.Add(new CostOptimizationItemDto
            {
                Category = "承诺折扣",
                Priority = "高",
                Title = "购买预留实例",
                Description = "对于稳定工作负载，购买1年或3年预留实例可节省40-60%成本",
                CurrentValue = "按需计费",
                RecommendedValue = "1年预留实例",
                PotentialMonthlySavings = CalculateReservedInstanceSavings(currentConfig),
                Impact = "无",
                ImplementationEffort = "简单"
            });

            var totalPotentialSavings = recommendations.Sum(r => r.PotentialMonthlySavings);

            var result = new CostOptimizationRecommendationDto
            {
                ServiceName = serviceName,
                CurrentMonthlyCost = CalculateCurrentMonthlyCost(currentConfig),
                RecommendationCount = recommendations.Count,
                TotalPotentialMonthlySavings = totalPotentialSavings,
                TotalPotentialAnnualSavings = totalPotentialSavings * 12,
                OptimizedMonthlyCost = CalculateCurrentMonthlyCost(currentConfig) - totalPotentialSavings,
                SavingsPercentage = (totalPotentialSavings / CalculateCurrentMonthlyCost(currentConfig)) * 100,
                Recommendations = recommendations.OrderByDescending(r => r.PotentialMonthlySavings).ToList()
            };

            _logger.LogInformation("✅ 成本优化建议生成完成，可节省{Percentage:F1}%成本",
                result.SavingsPercentage);
            return Task.FromResult(result);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 成本趋势分析
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取成本趋势
        /// </summary>
        public Task<CostTrendDto> GetCostTrendAsync(
            string serviceName,
            DateTime startDate,
            DateTime endDate,
            string cloudProvider = "Azure")
        {
            _logger.LogInformation("📈 获取成本趋势: {ServiceName}, {StartDate} - {EndDate}",
                serviceName, startDate, endDate);

            // TODO: 从实际计费API获取数据
            // 这里使用模拟数据作为示例

            var dataPoints = GenerateMockCostTrendData(startDate, endDate);

            var result = new CostTrendDto
            {
                ServiceName = serviceName,
                CloudProvider = cloudProvider,
                StartDate = startDate,
                EndDate = endDate,
                DataPoints = dataPoints,
                TotalCost = dataPoints.Sum(dp => dp.Cost),
                AverageDailyCost = dataPoints.Average(dp => dp.Cost),
                PeakDailyCost = dataPoints.Max(dp => dp.Cost),
                LowestDailyCost = dataPoints.Min(dp => dp.Cost)
            };

            _logger.LogInformation("✅ 成本趋势分析完成，总成本: ${TotalCost}", result.TotalCost);
            return Task.FromResult(result);
        }

        /// <summary>
        /// 预测未来成本
        /// </summary>
        public Task<CostForecastDto> ForecastCostAsync(
            string serviceName,
            CostTrendDto historicalTrend,
            int forecastDays = 30)
        {
            _logger.LogInformation("🔮 预测未来成本: {ServiceName}, 预测{Days}天",
                serviceName, forecastDays);

            // 简单线性回归预测
            var forecast = PerformLinearRegression(historicalTrend.DataPoints, forecastDays);

            var result = new CostForecastDto
            {
                ServiceName = serviceName,
                ForecastStartDate = historicalTrend.EndDate.AddDays(1),
                ForecastEndDate = historicalTrend.EndDate.AddDays(forecastDays),
                ForecastDataPoints = forecast,
                EstimatedMonthlyCost = forecast.Sum(dp => dp.Cost),
                Confidence = CalculateForecastConfidence(historicalTrend.DataPoints),
                Trend = DetermineTrend(historicalTrend.DataPoints)
            };

            _logger.LogInformation("✅ 成本预测完成，预计月成本: ${EstimatedMonthlyCost}",
                result.EstimatedMonthlyCost);
            return Task.FromResult(result);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 成本分配与标签
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 按标签分配成本
        /// </summary>
        public Task<CostAllocationDto> AllocateCostByTagsAsync(
            List<ServiceCostEstimationDto> serviceCosts,
            string tagKey)
        {
            _logger.LogInformation("🏷️ 按标签分配成本: {TagKey}", tagKey);

            // TODO: 实际实现需要从服务配置中读取标签
            // 这里使用模拟数据

            var allocations = new Dictionary<string, decimal>
            {
                { "Team-Backend", serviceCosts.Where(s => s.ServiceName.Contains("api")).Sum(s => s.MonthlyCost) },
                { "Team-Frontend", serviceCosts.Where(s => s.ServiceName.Contains("web")).Sum(s => s.MonthlyCost) },
                { "Team-Data", serviceCosts.Where(s => s.ServiceName.Contains("db")).Sum(s => s.MonthlyCost) }
            };

            var result = new CostAllocationDto
            {
                TagKey = tagKey,
                TotalCost = allocations.Values.Sum(),
                Allocations = allocations.Select(kvp => new AllocationItemDto
                {
                    TagValue = kvp.Key,
                    Cost = kvp.Value,
                    Percentage = (kvp.Value / allocations.Values.Sum()) * 100
                }).OrderByDescending(a => a.Cost).ToList()
            };

            _logger.LogInformation("✅ 成本分配完成");
            return Task.FromResult(result);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Private Helper Methods
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private Dictionary<string, CloudPricingDto> InitializeCloudPricing()
        {
            return new Dictionary<string, CloudPricingDto>
            {
                ["Azure"] = new CloudPricingDto
                {
                    Provider = "Azure",
                    ComputePricePerVCPUPerHour = 0.096m,
                    MemoryPricePerGBPerHour = 0.0124m,
                    StoragePricePerGBPerMonth = 0.18m,
                    NetworkPricePerGB = 0.087m
                },
                ["AWS"] = new CloudPricingDto
                {
                    Provider = "AWS",
                    ComputePricePerVCPUPerHour = 0.0464m,
                    MemoryPricePerGBPerHour = 0.00516m,
                    StoragePricePerGBPerMonth = 0.10m,
                    NetworkPricePerGB = 0.09m
                },
                ["GCP"] = new CloudPricingDto
                {
                    Provider = "GCP",
                    ComputePricePerVCPUPerHour = 0.033m,
                    MemoryPricePerGBPerHour = 0.0044m,
                    StoragePricePerGBPerMonth = 0.17m,
                    NetworkPricePerGB = 0.12m
                },
                ["Aliyun"] = new CloudPricingDto
                {
                    Provider = "Aliyun",
                    ComputePricePerVCPUPerHour = 0.025m,
                    MemoryPricePerGBPerHour = 0.0031m,
                    StoragePricePerGBPerMonth = 0.08m,
                    NetworkPricePerGB = 0.07m
                }
            };
        }

        private (decimal MonthlyCost, decimal AnnualCost, List<CostBreakdownItemDto> CostBreakdown) 
            CalculateServiceCost(ServiceResourceConfigDto config, CloudPricingDto pricing)
        {
            var hoursPerMonth = 730; // 平均每月小时数
            var breakdown = new List<CostBreakdownItemDto>();

            // 1. 计算Compute成本
            var cpuCores = ParseCPU(config.CpuLimit);
            var computeCost = cpuCores * pricing.ComputePricePerVCPUPerHour * hoursPerMonth * config.Replicas;
            breakdown.Add(new CostBreakdownItemDto
            {
                Category = "计算资源",
                Description = $"{cpuCores} vCPU x {config.Replicas}副本 x {hoursPerMonth}小时",
                MonthlyCost = computeCost
            });

            // 2. 计算Memory成本
            var memoryGB = ParseMemory(config.MemoryLimit);
            var memoryCost = memoryGB * pricing.MemoryPricePerGBPerHour * hoursPerMonth * config.Replicas;
            breakdown.Add(new CostBreakdownItemDto
            {
                Category = "内存资源",
                Description = $"{memoryGB} GB x {config.Replicas}副本 x {hoursPerMonth}小时",
                MonthlyCost = memoryCost
            });

            // 3. 计算Storage成本
            var storageCost = config.StorageSize * pricing.StoragePricePerGBPerMonth;
            breakdown.Add(new CostBreakdownItemDto
            {
                Category = "存储资源",
                Description = $"{config.StorageSize} GB SSD",
                MonthlyCost = storageCost
            });

            // 4. 计算Network成本（估算）
            var estimatedNetworkGB = config.Replicas * 100; // 假设每个副本每月100GB流量
            var networkCost = estimatedNetworkGB * pricing.NetworkPricePerGB;
            breakdown.Add(new CostBreakdownItemDto
            {
                Category = "网络流量",
                Description = $"{estimatedNetworkGB} GB出站流量",
                MonthlyCost = networkCost
            });

            var totalMonthlyCost = breakdown.Sum(b => b.MonthlyCost);
            var totalAnnualCost = totalMonthlyCost * 12;

            return (totalMonthlyCost, totalAnnualCost, breakdown);
        }

        private decimal ParseCPU(string cpu)
        {
            // 解析CPU配置字符串（如 "500m" -> 0.5, "2" -> 2.0）
            if (cpu.EndsWith("m"))
            {
                return decimal.Parse(cpu.TrimEnd('m')) / 1000;
            }
            return decimal.Parse(cpu);
        }

        private decimal ParseMemory(string memory)
        {
            // 解析Memory配置字符串（如 "512Mi" -> 0.5, "2Gi" -> 2.0）
            if (memory.EndsWith("Mi"))
            {
                return decimal.Parse(memory.Replace("Mi", "")) / 1024;
            }
            else if (memory.EndsWith("Gi"))
            {
                return decimal.Parse(memory.Replace("Gi", ""));
            }
            return decimal.Parse(memory);
        }

        private string ReduceCPU(string cpu)
        {
            var value = ParseCPU(cpu);
            var reduced = value * 0.7m; // 降低30%
            return cpu.EndsWith("m") 
                ? $"{(int)(reduced * 1000)}m" 
                : reduced.ToString("F1");
        }

        private string ReduceMemory(string memory)
        {
            var value = ParseMemory(memory);
            var reduced = value * 0.75m; // 降低25%
            return memory.EndsWith("Mi")
                ? $"{(int)(reduced * 1024)}Mi"
                : $"{reduced:F1}Gi";
        }

        private decimal CalculateCPUReductionSavings(ServiceResourceConfigDto config)
        {
            var currentCost = ParseCPU(config.CpuLimit) * 0.096m * 730 * config.Replicas;
            return currentCost * 0.3m; // 30%节省
        }

        private decimal CalculateMemoryReductionSavings(ServiceResourceConfigDto config)
        {
            var currentCost = ParseMemory(config.MemoryLimit) * 0.0124m * 730 * config.Replicas;
            return currentCost * 0.25m; // 25%节省
        }

        private decimal CalculateSpotInstanceSavings(ServiceResourceConfigDto config)
        {
            var computeCost = ParseCPU(config.CpuLimit) * 0.096m * 730 * config.Replicas;
            return computeCost * 0.7m; // 70%节省
        }

        private decimal CalculateStorageTieringSavings(ServiceResourceConfigDto config)
        {
            return config.StorageSize * 0.18m * 0.5m; // 假设50%数据可迁移到低成本层
        }

        private decimal CalculateReservedInstanceSavings(ServiceResourceConfigDto config)
        {
            var totalCost = CalculateCurrentMonthlyCost(config);
            return totalCost * 0.4m; // 40%节省（1年预留）
        }

        private decimal CalculateCurrentMonthlyCost(ServiceResourceConfigDto config)
        {
            var pricing = _cloudPricing["Azure"];
            var (monthlyCost, _, _) = CalculateServiceCost(config, pricing);
            return monthlyCost;
        }

        private List<CostDataPointDto> GenerateMockCostTrendData(DateTime startDate, DateTime endDate)
        {
            var dataPoints = new List<CostDataPointDto>();
            var currentDate = startDate;
            var random = new Random();

            while (currentDate <= endDate)
            {
                dataPoints.Add(new CostDataPointDto
                {
                    Date = currentDate,
                    Cost = 100 + (decimal)random.NextDouble() * 50, // $100-$150/天
                    ComputeCost = 60 + (decimal)random.NextDouble() * 20,
                    MemoryCost = 20 + (decimal)random.NextDouble() * 10,
                    StorageCost = 10 + (decimal)random.NextDouble() * 10,
                    NetworkCost = 10 + (decimal)random.NextDouble() * 10
                });

                currentDate = currentDate.AddDays(1);
            }

            return dataPoints;
        }

        private List<CostDataPointDto> PerformLinearRegression(List<CostDataPointDto> historical, int forecastDays)
        {
            // 简单线性回归预测
            var n = historical.Count;
            if (n < 2) return new List<CostDataPointDto>();

            var xValues = Enumerable.Range(0, n).Select(i => (double)i).ToList();
            var yValues = historical.Select(dp => (double)dp.Cost).ToList();

            var sumX = xValues.Sum();
            var sumY = yValues.Sum();
            var sumXY = xValues.Zip(yValues, (x, y) => x * y).Sum();
            var sumX2 = xValues.Sum(x => x * x);

            var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            var intercept = (sumY - slope * sumX) / n;

            var forecast = new List<CostDataPointDto>();
            var lastDate = historical.Last().Date;

            for (int i = 1; i <= forecastDays; i++)
            {
                var predictedCost = (decimal)(slope * (n + i - 1) + intercept);
                forecast.Add(new CostDataPointDto
                {
                    Date = lastDate.AddDays(i),
                    Cost = Math.Max(0, predictedCost),
                    ComputeCost = predictedCost * 0.6m,
                    MemoryCost = predictedCost * 0.2m,
                    StorageCost = predictedCost * 0.1m,
                    NetworkCost = predictedCost * 0.1m
                });
            }

            return forecast;
        }

        private double CalculateForecastConfidence(List<CostDataPointDto> historical)
        {
            // 基于数据稳定性计算预测置信度
            var costs = historical.Select(dp => (double)dp.Cost).ToList();
            var avg = costs.Average();
            var variance = costs.Sum(c => Math.Pow(c - avg, 2)) / costs.Count;
            var stdDev = Math.Sqrt(variance);
            var cv = stdDev / avg; // 变异系数

            // 变异系数越低，置信度越高
            if (cv < 0.1) return 95; // 高置信度
            if (cv < 0.2) return 80; // 中等置信度
            if (cv < 0.3) return 60; // 较低置信度
            return 40; // 低置信度
        }

        private string DetermineTrend(List<CostDataPointDto> dataPoints)
        {
            if (dataPoints.Count < 2) return "稳定";

            var firstHalf = dataPoints.Take(dataPoints.Count / 2).Average(dp => dp.Cost);
            var secondHalf = dataPoints.Skip(dataPoints.Count / 2).Average(dp => dp.Cost);

            var changePercentage = ((secondHalf - firstHalf) / firstHalf) * 100;

            if (changePercentage > 10) return "上升";
            if (changePercentage < -10) return "下降";
            return "稳定";
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DTOs for Cost Estimation Service
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public class CloudPricingDto
    {
        public string Provider { get; set; } = string.Empty;
        public decimal ComputePricePerVCPUPerHour { get; set; }
        public decimal MemoryPricePerGBPerHour { get; set; }
        public decimal StoragePricePerGBPerMonth { get; set; }
        public decimal NetworkPricePerGB { get; set; }
    }

    public class ServiceResourceConfigDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public int Replicas { get; set; } = 1;
        public string CpuRequest { get; set; } = "100m";
        public string CpuLimit { get; set; } = "500m";
        public string MemoryRequest { get; set; } = "128Mi";
        public string MemoryLimit { get; set; } = "512Mi";
        public decimal StorageSize { get; set; } = 10; // GB
    }

    public class ServiceCostEstimationDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public string CloudProvider { get; set; } = string.Empty;
        public decimal MonthlyCost { get; set; }
        public decimal AnnualCost { get; set; }
        public List<CostBreakdownItemDto> CostBreakdown { get; set; } = new();
        public string Currency { get; set; } = "USD";
    }

    public class CostBreakdownItemDto
    {
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal MonthlyCost { get; set; }
    }

    public class SolutionCostEstimationDto
    {
        public string SolutionName { get; set; } = string.Empty;
        public string CloudProvider { get; set; } = string.Empty;
        public int ServiceCount { get; set; }
        public decimal TotalMonthlyCost { get; set; }
        public decimal TotalAnnualCost { get; set; }
        public List<ServiceCostEstimationDto> ServiceCosts { get; set; } = new();
        public string Currency { get; set; } = "USD";
    }

    public class MultiCloudCostComparisonDto
    {
        public string SolutionName { get; set; } = string.Empty;
        public List<CloudProviderCostDto> Comparisons { get; set; } = new();
        public string CheapestProvider { get; set; } = string.Empty;
        public decimal CheapestMonthlyCost { get; set; }
        public string MostExpensiveProvider { get; set; } = string.Empty;
        public decimal MostExpensiveMonthlyCost { get; set; }
        public decimal PotentialSavingsPercentage { get; set; }
        public decimal PotentialMonthlySavings { get; set; }
        public decimal PotentialAnnualSavings { get; set; }
    }

    public class CloudProviderCostDto
    {
        public string Provider { get; set; } = string.Empty;
        public decimal MonthlyCost { get; set; }
        public decimal AnnualCost { get; set; }
    }

    public class CostOptimizationRecommendationDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public decimal CurrentMonthlyCost { get; set; }
        public int RecommendationCount { get; set; }
        public decimal TotalPotentialMonthlySavings { get; set; }
        public decimal TotalPotentialAnnualSavings { get; set; }
        public decimal OptimizedMonthlyCost { get; set; }
        public decimal SavingsPercentage { get; set; }
        public List<CostOptimizationItemDto> Recommendations { get; set; } = new();
    }

    public class CostOptimizationItemDto
    {
        public string Category { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CurrentValue { get; set; } = string.Empty;
        public string RecommendedValue { get; set; } = string.Empty;
        public decimal PotentialMonthlySavings { get; set; }
        public string Impact { get; set; } = string.Empty;
        public string ImplementationEffort { get; set; } = string.Empty;
    }

    public class CostTrendDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public string CloudProvider { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<CostDataPointDto> DataPoints { get; set; } = new();
        public decimal TotalCost { get; set; }
        public decimal AverageDailyCost { get; set; }
        public decimal PeakDailyCost { get; set; }
        public decimal LowestDailyCost { get; set; }
    }

    public class CostDataPointDto
    {
        public DateTime Date { get; set; }
        public decimal Cost { get; set; }
        public decimal ComputeCost { get; set; }
        public decimal MemoryCost { get; set; }
        public decimal StorageCost { get; set; }
        public decimal NetworkCost { get; set; }
    }

    public class CostForecastDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public DateTime ForecastStartDate { get; set; }
        public DateTime ForecastEndDate { get; set; }
        public List<CostDataPointDto> ForecastDataPoints { get; set; } = new();
        public decimal EstimatedMonthlyCost { get; set; }
        public double Confidence { get; set; } // 0-100
        public string Trend { get; set; } = string.Empty; // 上升/下降/稳定
    }

    public class CostAllocationDto
    {
        public string TagKey { get; set; } = string.Empty;
        public decimal TotalCost { get; set; }
        public List<AllocationItemDto> Allocations { get; set; } = new();
    }

    public class AllocationItemDto
    {
        public string TagValue { get; set; } = string.Empty;
        public decimal Cost { get; set; }
        public decimal Percentage { get; set; }
    }
}

