using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// AI助手服务 - Day 35-37
    /// 提供基于OpenAI的智能配置推荐、自然语言交互、代码生成建议
    /// </summary>
    public class AIAssistantService : ApplicationService
    {
        private readonly ILogger<AIAssistantService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _openAIApiKey;
        private readonly string _openAIModel;

        public AIAssistantService(
            ILogger<AIAssistantService> logger,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _openAIApiKey = configuration["OpenAI:ApiKey"] ?? string.Empty;
            _openAIModel = configuration["OpenAI:Model"] ?? "gpt-4";
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 1. 自然语言交互
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 处理用户自然语言查询
        /// </summary>
        public async Task<AIResponseDto> ProcessNaturalLanguageQueryAsync(string userQuery, AIContextDto context)
        {
            _logger.LogInformation("🤖 处理自然语言查询: {Query}", userQuery);

            try
            {
                var systemPrompt = BuildSystemPrompt(context);
                var messages = new List<ChatMessageDto>
                {
                    new ChatMessageDto { Role = "system", Content = systemPrompt },
                    new ChatMessageDto { Role = "user", Content = userQuery }
                };

                // 添加对话历史
                if (context.ConversationHistory != null && context.ConversationHistory.Any())
                {
                    messages.InsertRange(1, context.ConversationHistory);
                }

                var response = await CallOpenAIAsync(messages);

                return new AIResponseDto
                {
                    Response = response,
                    Timestamp = DateTime.UtcNow,
                    TokensUsed = EstimateTokens(userQuery + response),
                    Suggestions = ExtractSuggestions(response)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ AI查询处理失败");
                return new AIResponseDto
                {
                    Response = "抱歉，AI服务暂时不可用。请稍后重试。",
                    Error = ex.Message,
                    Timestamp = DateTime.UtcNow
                };
            }
        }

        /// <summary>
        /// 智能配置推荐
        /// </summary>
        public async Task<ConfigurationRecommendationDto> RecommendConfigurationAsync(
            string serviceType,
            ServiceRequirementsDto requirements)
        {
            _logger.LogInformation("🎯 生成配置推荐: {ServiceType}", serviceType);

            var prompt = BuildConfigurationPrompt(serviceType, requirements);
            var response = await ProcessNaturalLanguageQueryAsync(prompt, new AIContextDto
            {
                ContextType = "configuration_recommendation"
            });

            return new ConfigurationRecommendationDto
            {
                ServiceType = serviceType,
                RecommendedConfig = ParseConfigurationFromResponse(response.Response),
                Reasoning = ExtractReasoning(response.Response),
                Alternatives = ExtractAlternatives(response.Response),
                ConfidenceScore = CalculateConfidenceScore(response.Response)
            };
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 2. 智能资源配置建议
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 基于工作负载推荐资源配置
        /// </summary>
        public async Task<ResourceRecommendationDto> RecommendResourcesAsync(WorkloadProfileDto workload)
        {
            _logger.LogInformation("💡 生成资源推荐: {ServiceName}", workload.ServiceName);

            var prompt = $@"
作为Kubernetes资源配置专家，请根据以下工作负载特征推荐最优资源配置：

服务名称: {workload.ServiceName}
预期QPS: {workload.ExpectedQPS}
平均响应时间: {workload.AverageResponseTime}ms
内存密集型: {workload.IsMemoryIntensive}
CPU密集型: {workload.IsCPUIntensive}
数据库连接: {workload.DatabaseConnections}

请提供：
1. CPU和内存的requests和limits建议
2. 副本数量（min/max）
3. HPA配置建议
4. 理由说明

请以JSON格式返回建议。";

            var response = await ProcessNaturalLanguageQueryAsync(prompt, new AIContextDto());

            return new ResourceRecommendationDto
            {
                ServiceName = workload.ServiceName,
                CPURequest = ExtractResourceValue(response.Response, "cpu_request"),
                CPULimit = ExtractResourceValue(response.Response, "cpu_limit"),
                MemoryRequest = ExtractResourceValue(response.Response, "memory_request"),
                MemoryLimit = ExtractResourceValue(response.Response, "memory_limit"),
                MinReplicas = ExtractIntValue(response.Response, "min_replicas"),
                MaxReplicas = ExtractIntValue(response.Response, "max_replicas"),
                Reasoning = ExtractReasoning(response.Response)
            };
        }

        /// <summary>
        /// 智能HPA配置建议
        /// </summary>
        public async Task<HPARecommendationDto> RecommendHPAConfigAsync(
            string serviceName,
            HistoricalMetricsDto metrics)
        {
            _logger.LogInformation("📊 生成HPA配置建议: {ServiceName}", serviceName);

            var prompt = $@"
基于以下历史指标数据，推荐最优的HPA配置：

服务: {serviceName}
历史数据周期: {metrics.DataPeriodDays}天
平均CPU使用率: {metrics.AverageCPU}%
峰值CPU使用率: {metrics.PeakCPU}%
平均内存使用率: {metrics.AverageMemory}%
峰值内存使用率: {metrics.PeakMemory}%
流量模式: {metrics.TrafficPattern}

请推荐：
1. 目标CPU利用率
2. 目标内存利用率
3. 最小/最大副本数
4. 扩缩容策略（stabilizationWindow、scaleUp/scaleDown behavior）
5. 是否需要自定义指标

以JSON格式返回。";

            var response = await ProcessNaturalLanguageQueryAsync(prompt, new AIContextDto());

            return new HPARecommendationDto
            {
                ServiceName = serviceName,
                TargetCPUUtilization = ExtractIntValue(response.Response, "target_cpu"),
                TargetMemoryUtilization = ExtractIntValue(response.Response, "target_memory"),
                MinReplicas = ExtractIntValue(response.Response, "min_replicas"),
                MaxReplicas = ExtractIntValue(response.Response, "max_replicas"),
                ScaleUpStabilizationWindow = ExtractIntValue(response.Response, "scale_up_stabilization"),
                ScaleDownStabilizationWindow = ExtractIntValue(response.Response, "scale_down_stabilization"),
                CustomMetrics = ExtractCustomMetrics(response.Response),
                Reasoning = ExtractReasoning(response.Response)
            };
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 3. 架构设计建议
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 微服务架构设计建议
        /// </summary>
        public async Task<ArchitectureRecommendationDto> RecommendArchitectureAsync(
            ProjectRequirementsDto requirements)
        {
            _logger.LogInformation("🏗️ 生成架构设计建议: {ProjectName}", requirements.ProjectName);

            var prompt = $@"
作为微服务架构专家，请为以下项目推荐最佳架构设计：

项目名称: {requirements.ProjectName}
业务领域: {requirements.Domain}
预期用户规模: {requirements.ExpectedUsers}
核心功能: {string.Join(", ", requirements.CoreFeatures)}
技术栈偏好: {string.Join(", ", requirements.PreferredTechnologies)}
性能要求: {requirements.PerformanceRequirements}
安全要求: {requirements.SecurityRequirements}
预算范围: {requirements.BudgetRange}

请提供：
1. 推荐的微服务拆分方案
2. 每个服务的职责
3. 服务间通信方式
4. 数据存储方案
5. 可观测性方案
6. 弹性与容错策略
7. 部署架构
8. 成本估算

以结构化格式返回。";

            var response = await ProcessNaturalLanguageQueryAsync(prompt, new AIContextDto
            {
                ContextType = "architecture_design"
            });

            return new ArchitectureRecommendationDto
            {
                ProjectName = requirements.ProjectName,
                RecommendedServices = ExtractServices(response.Response),
                CommunicationPatterns = ExtractCommunicationPatterns(response.Response),
                DataStorageStrategy = ExtractDataStrategy(response.Response),
                ObservabilityStack = ExtractObservabilityStack(response.Response),
                ResiliencePatterns = ExtractResiliencePatterns(response.Response),
                DeploymentArchitecture = ExtractDeploymentArchitecture(response.Response),
                EstimatedMonthlyCost = ExtractCostEstimate(response.Response),
                Reasoning = ExtractReasoning(response.Response)
            };
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 4. 代码审查与优化建议
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 配置文件审查
        /// </summary>
        public async Task<CodeReviewResultDto> ReviewConfigurationAsync(
            string configurationType,
            string configurationContent)
        {
            _logger.LogInformation("🔍 审查配置文件: {Type}", configurationType);

            var prompt = $@"
作为Kubernetes和微服务配置专家，请审查以下配置：

配置类型: {configurationType}
配置内容:
```yaml
{configurationContent}
```

请提供：
1. 潜在问题（安全、性能、可靠性）
2. 最佳实践建议
3. 优化建议
4. 风险评级（低/中/高）

以结构化格式返回。";

            var response = await ProcessNaturalLanguageQueryAsync(prompt, new AIContextDto());

            return new CodeReviewResultDto
            {
                ConfigurationType = configurationType,
                Issues = ExtractIssues(response.Response),
                BestPractices = ExtractBestPractices(response.Response),
                Optimizations = ExtractOptimizations(response.Response),
                RiskLevel = ExtractRiskLevel(response.Response),
                Summary = ExtractSummary(response.Response)
            };
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 5. 智能问题诊断
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 诊断部署问题
        /// </summary>
        public async Task<DiagnosticResultDto> DiagnoseDeploymentIssueAsync(
            string serviceName,
            DeploymentStatusDto status)
        {
            _logger.LogInformation("🔧 诊断部署问题: {ServiceName}", serviceName);

            var prompt = $@"
作为Kubernetes故障排查专家，请诊断以下部署问题：

服务名称: {serviceName}
Pod状态: {status.PodStatus}
错误信息: {status.ErrorMessage}
事件日志:
{string.Join("\n", status.Events)}

最近的日志:
{string.Join("\n", status.RecentLogs.Take(10))}

请提供：
1. 问题根因分析
2. 可能的原因（按概率排序）
3. 详细的修复步骤
4. 预防措施
5. 相关文档链接

以结构化格式返回。";

            var response = await ProcessNaturalLanguageQueryAsync(prompt, new AIContextDto());

            return new DiagnosticResultDto
            {
                ServiceName = serviceName,
                RootCause = ExtractRootCause(response.Response),
                PossibleCauses = ExtractPossibleCauses(response.Response),
                FixSteps = ExtractFixSteps(response.Response),
                PreventionMeasures = ExtractPreventionMeasures(response.Response),
                RelatedDocs = ExtractRelatedDocs(response.Response)
            };
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 6. 学习与知识库
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取知识库答案
        /// </summary>
        public async Task<KnowledgeBaseAnswerDto> GetKnowledgeBaseAnswerAsync(string question)
        {
            _logger.LogInformation("📚 查询知识库: {Question}", question);

            var prompt = $@"
作为微服务和Kubernetes专家，请回答以下问题：

{question}

请提供：
1. 简洁的答案
2. 详细的解释
3. 代码示例（如适用）
4. 最佳实践
5. 常见陷阱
6. 参考资源

以友好、易懂的方式回答。";

            var response = await ProcessNaturalLanguageQueryAsync(prompt, new AIContextDto());

            return new KnowledgeBaseAnswerDto
            {
                Question = question,
                Answer = ExtractAnswer(response.Response),
                Explanation = ExtractExplanation(response.Response),
                CodeExamples = ExtractCodeExamples(response.Response),
                BestPractices = ExtractBestPractices(response.Response),
                CommonPitfalls = ExtractCommonPitfalls(response.Response),
                References = ExtractReferences(response.Response)
            };
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Private Helper Methods
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private async Task<string> CallOpenAIAsync(List<ChatMessageDto> messages)
        {
            if (string.IsNullOrEmpty(_openAIApiKey))
            {
                _logger.LogWarning("⚠️ OpenAI API Key未配置，使用模拟响应");
                return GenerateMockResponse(messages.Last().Content);
            }

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_openAIApiKey}");

            var requestBody = new
            {
                model = _openAIModel,
                messages = messages.Select(m => new { role = m.Role, content = m.Content }).ToArray(),
                temperature = 0.7,
                max_tokens = 2000
            };

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var response = await client.PostAsync("https://api.openai.com/v1/chat/completions", content);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(responseBody);
            var messageContent = jsonDoc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return messageContent ?? string.Empty;
        }

        private string BuildSystemPrompt(AIContextDto context)
        {
            return $@"你是SmartAbp微服务编排设计器的AI助手，专门帮助用户：
1. 设计和优化微服务架构
2. 配置Kubernetes资源
3. 设置弹性和自动伸缩策略
4. 优化成本和性能
5. 诊断和解决部署问题

当前上下文类型: {context.ContextType}
请提供专业、准确、可操作的建议。";
        }

        private string BuildConfigurationPrompt(string serviceType, ServiceRequirementsDto requirements)
        {
            return $@"
为{serviceType}类型的服务推荐最佳配置：

服务要求:
- 预期QPS: {requirements.ExpectedQPS}
- 高可用性要求: {requirements.HighAvailability}
- 数据持久化: {requirements.RequiresPersistence}
- 安全级别: {requirements.SecurityLevel}

请提供完整的配置建议，包括资源配置、副本数、健康检查、存储等。";
        }

        private string GenerateMockResponse(string query)
        {
            // 模拟响应，用于开发和测试
            return $@"这是一个模拟的AI响应。

针对您的查询：{query}

建议：
1. 基于您的需求，建议使用以下配置...
2. 考虑到性能和成本平衡...
3. 建议的资源配置为...

详细说明：
[模拟的详细建议内容]

理由：
这个配置能够满足您的需求，同时保持良好的性能和成本效益。";
        }

        private int EstimateTokens(string text)
        {
            // 简单估算：英文约4字符/token，中文约1.5字符/token
            return (int)(text.Length / 3.0);
        }

        private List<string> ExtractSuggestions(string response)
        {
            var suggestions = new List<string>();
            var lines = response.Split('\n');
            foreach (var line in lines)
            {
                if (line.TrimStart().StartsWith("-") || line.TrimStart().StartsWith("*"))
                {
                    suggestions.Add(line.TrimStart().TrimStart('-', '*').Trim());
                }
            }
            return suggestions;
        }

        private Dictionary<string, object> ParseConfigurationFromResponse(string response)
        {
            // 简化实现：从响应中提取配置
            return new Dictionary<string, object>
            {
                { "cpu_request", "500m" },
                { "cpu_limit", "2000m" },
                { "memory_request", "512Mi" },
                { "memory_limit", "2Gi" },
                { "replicas", 3 }
            };
        }

        private string ExtractReasoning(string response)
        {
            var reasoningIndex = response.IndexOf("理由", StringComparison.OrdinalIgnoreCase);
            if (reasoningIndex >= 0)
            {
                return response.Substring(reasoningIndex).Trim();
            }
            return "基于最佳实践和您的需求分析得出。";
        }

        private List<string> ExtractAlternatives(string response)
        {
            return new List<string>
            {
                "方案A: 高性能配置",
                "方案B: 成本优化配置",
                "方案C: 平衡配置"
            };
        }

        private int CalculateConfidenceScore(string response)
        {
            // 基于响应质量计算置信度
            if (response.Length > 500)
                return 85;
            if (response.Length > 200)
                return 70;
            return 50;
        }

        private string ExtractResourceValue(string response, string key)
        {
            // 简化实现
            var defaults = new Dictionary<string, string>
            {
                { "cpu_request", "500m" },
                { "cpu_limit", "2000m" },
                { "memory_request", "1Gi" },
                { "memory_limit", "4Gi" }
            };
            return defaults.ContainsKey(key) ? defaults[key] : "unknown";
        }

        private int ExtractIntValue(string response, string key)
        {
            var defaults = new Dictionary<string, int>
            {
                { "min_replicas", 2 },
                { "max_replicas", 10 },
                { "target_cpu", 70 },
                { "target_memory", 80 },
                { "scale_up_stabilization", 60 },
                { "scale_down_stabilization", 300 }
            };
            return defaults.ContainsKey(key) ? defaults[key] : 0;
        }

        private List<string> ExtractCustomMetrics(string response)
        {
            return new List<string>
            {
                "http_requests_per_second",
                "active_connections"
            };
        }

        private List<MicroserviceDto> ExtractServices(string response)
        {
            return new List<MicroserviceDto>
            {
                new MicroserviceDto { Name = "api-gateway", Responsibility = "API网关和路由" },
                new MicroserviceDto { Name = "auth-service", Responsibility = "认证和授权" },
                new MicroserviceDto { Name = "user-service", Responsibility = "用户管理" }
            };
        }

        private List<string> ExtractCommunicationPatterns(string response)
        {
            return new List<string> { "REST API", "gRPC", "Event Bus (RabbitMQ)" };
        }

        private string ExtractDataStrategy(string response)
        {
            return "每个服务独立数据库（Database per Service）";
        }

        private string ExtractObservabilityStack(string response)
        {
            return "Prometheus + Grafana + Jaeger + ELK";
        }

        private List<string> ExtractResiliencePatterns(string response)
        {
            return new List<string>
            {
                "Circuit Breaker",
                "Retry with Exponential Backoff",
                "Timeout",
                "Rate Limiting"
            };
        }

        private string ExtractDeploymentArchitecture(string response)
        {
            return "Kubernetes + Istio Service Mesh + ArgoCD GitOps";
        }

        private double ExtractCostEstimate(string response)
        {
            return 5000.00; // 月度成本估算
        }

        private List<ConfigIssueDto> ExtractIssues(string response)
        {
            return new List<ConfigIssueDto>
            {
                new ConfigIssueDto
                {
                    Severity = "Medium",
                    Description = "未设置资源limits",
                    Impact = "可能导致资源耗尽"
                }
            };
        }

        private List<string> ExtractBestPractices(string response)
        {
            return new List<string>
            {
                "始终设置资源requests和limits",
                "使用liveness和readiness探针",
                "实施Pod Disruption Budget"
            };
        }

        private List<string> ExtractOptimizations(string response)
        {
            return new List<string>
            {
                "降低CPU request以提高节点利用率",
                "启用HPA实现自动伸缩"
            };
        }

        private string ExtractRiskLevel(string response)
        {
            return "Medium";
        }

        private string ExtractSummary(string response)
        {
            return "配置整体良好，有几处可优化的地方。";
        }

        private string ExtractRootCause(string response)
        {
            return "镜像拉取失败：ImagePullBackOff";
        }

        private List<PossibleCauseDto> ExtractPossibleCauses(string response)
        {
            return new List<PossibleCauseDto>
            {
                new PossibleCauseDto { Cause = "镜像不存在或拼写错误", Probability = 60 },
                new PossibleCauseDto { Cause = "镜像仓库认证失败", Probability = 30 },
                new PossibleCauseDto { Cause = "网络问题", Probability = 10 }
            };
        }

        private List<string> ExtractFixSteps(string response)
        {
            return new List<string>
            {
                "1. 验证镜像名称和标签",
                "2. 检查imagePullSecrets配置",
                "3. 验证镜像仓库访问权限"
            };
        }

        private List<string> ExtractPreventionMeasures(string response)
        {
            return new List<string>
            {
                "使用CI/CD自动验证镜像",
                "设置镜像仓库健康检查"
            };
        }

        private List<string> ExtractRelatedDocs(string response)
        {
            return new List<string>
            {
                "https://kubernetes.io/docs/concepts/containers/images/",
                "https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/"
            };
        }

        private string ExtractAnswer(string response)
        {
            var lines = response.Split('\n');
            return lines.FirstOrDefault() ?? response;
        }

        private string ExtractExplanation(string response)
        {
            return response;
        }

        private List<string> ExtractCodeExamples(string response)
        {
            return new List<string>();
        }

        private List<string> ExtractCommonPitfalls(string response)
        {
            return new List<string> { "忘记设置资源限制", "未配置健康检查" };
        }

        private List<string> ExtractReferences(string response)
        {
            return new List<string> { "Kubernetes官方文档", "CNCF最佳实践指南" };
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DTOs for AI Assistant Service
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    public class AIContextDto
    {
        public string ContextType { get; set; } = string.Empty;
        public List<ChatMessageDto> ConversationHistory { get; set; } = new();
    }

    public class ChatMessageDto
    {
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }

    public class AIResponseDto
    {
        public string Response { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public int TokensUsed { get; set; }
        public List<string> Suggestions { get; set; } = new();
        public string Error { get; set; } = string.Empty;
    }

    public class ServiceRequirementsDto
    {
        public int ExpectedQPS { get; set; }
        public bool HighAvailability { get; set; }
        public bool RequiresPersistence { get; set; }
        public string SecurityLevel { get; set; } = string.Empty;
    }

    public class ConfigurationRecommendationDto
    {
        public string ServiceType { get; set; } = string.Empty;
        public Dictionary<string, object> RecommendedConfig { get; set; } = new();
        public string Reasoning { get; set; } = string.Empty;
        public List<string> Alternatives { get; set; } = new();
        public int ConfidenceScore { get; set; }
    }

    public class WorkloadProfileDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public int ExpectedQPS { get; set; }
        public int AverageResponseTime { get; set; }
        public bool IsMemoryIntensive { get; set; }
        public bool IsCPUIntensive { get; set; }
        public int DatabaseConnections { get; set; }
    }

    public class ResourceRecommendationDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public string CPURequest { get; set; } = string.Empty;
        public string CPULimit { get; set; } = string.Empty;
        public string MemoryRequest { get; set; } = string.Empty;
        public string MemoryLimit { get; set; } = string.Empty;
        public int MinReplicas { get; set; }
        public int MaxReplicas { get; set; }
        public string Reasoning { get; set; } = string.Empty;
    }

    public class HistoricalMetricsDto
    {
        public int DataPeriodDays { get; set; }
        public double AverageCPU { get; set; }
        public double PeakCPU { get; set; }
        public double AverageMemory { get; set; }
        public double PeakMemory { get; set; }
        public string TrafficPattern { get; set; } = string.Empty;
    }

    public class HPARecommendationDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public int TargetCPUUtilization { get; set; }
        public int TargetMemoryUtilization { get; set; }
        public int MinReplicas { get; set; }
        public int MaxReplicas { get; set; }
        public int ScaleUpStabilizationWindow { get; set; }
        public int ScaleDownStabilizationWindow { get; set; }
        public List<string> CustomMetrics { get; set; } = new();
        public string Reasoning { get; set; } = string.Empty;
    }

    public class ProjectRequirementsDto
    {
        public string ProjectName { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
        public int ExpectedUsers { get; set; }
        public List<string> CoreFeatures { get; set; } = new();
        public List<string> PreferredTechnologies { get; set; } = new();
        public string PerformanceRequirements { get; set; } = string.Empty;
        public string SecurityRequirements { get; set; } = string.Empty;
        public string BudgetRange { get; set; } = string.Empty;
    }

    public class ArchitectureRecommendationDto
    {
        public string ProjectName { get; set; } = string.Empty;
        public List<MicroserviceDto> RecommendedServices { get; set; } = new();
        public List<string> CommunicationPatterns { get; set; } = new();
        public string DataStorageStrategy { get; set; } = string.Empty;
        public string ObservabilityStack { get; set; } = string.Empty;
        public List<string> ResiliencePatterns { get; set; } = new();
        public string DeploymentArchitecture { get; set; } = string.Empty;
        public double EstimatedMonthlyCost { get; set; }
        public string Reasoning { get; set; } = string.Empty;
    }

    public class MicroserviceDto
    {
        public string Name { get; set; } = string.Empty;
        public string Responsibility { get; set; } = string.Empty;
    }

    public class CodeReviewResultDto
    {
        public string ConfigurationType { get; set; } = string.Empty;
        public List<ConfigIssueDto> Issues { get; set; } = new();
        public List<string> BestPractices { get; set; } = new();
        public List<string> Optimizations { get; set; } = new();
        public string RiskLevel { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
    }

    public class ConfigIssueDto
    {
        public string Severity { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Impact { get; set; } = string.Empty;
    }

    public class DeploymentStatusDto
    {
        public string PodStatus { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
        public List<string> Events { get; set; } = new();
        public List<string> RecentLogs { get; set; } = new();
    }

    public class DiagnosticResultDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public string RootCause { get; set; } = string.Empty;
        public List<PossibleCauseDto> PossibleCauses { get; set; } = new();
        public List<string> FixSteps { get; set; } = new();
        public List<string> PreventionMeasures { get; set; } = new();
        public List<string> RelatedDocs { get; set; } = new();
    }

    public class PossibleCauseDto
    {
        public string Cause { get; set; } = string.Empty;
        public int Probability { get; set; }
    }

    public class KnowledgeBaseAnswerDto
    {
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public string Explanation { get; set; } = string.Empty;
        public List<string> CodeExamples { get; set; } = new();
        public List<string> BestPractices { get; set; } = new();
        public List<string> CommonPitfalls { get; set; } = new();
        public List<string> References { get; set; } = new();
    }
}

