using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 弹性策略服务 - 生成Polly和Istio弹性配置
    /// Day 20: Phase 2 弹性工程
    /// </summary>
    public class ResiliencePolicyService
    {
        /// <summary>
        /// 验证弹性策略配置
        /// </summary>
        public async Task<ResiliencePolicyValidationResultDto> ValidatePolicyAsync(ResiliencePolicyDto policy)
        {
            var result = new ResiliencePolicyValidationResultDto
            {
                IsValid = true
            };

            // 验证服务名称
            if (string.IsNullOrWhiteSpace(policy.ServiceName))
            {
                result.Errors.Add("服务名称不能为空");
                result.IsValid = false;
            }

            // 验证重试策略
            if (policy.Retry.Enabled)
            {
                ValidateRetryPolicy(policy.Retry, result);
            }

            // 验证断路器
            if (policy.CircuitBreaker.Enabled)
            {
                ValidateCircuitBreaker(policy.CircuitBreaker, result);
            }

            // 验证超时控制
            if (policy.Timeout.Enabled)
            {
                ValidateTimeout(policy.Timeout, result);
            }

            // 验证舱壁隔离
            if (policy.Bulkhead.Enabled)
            {
                ValidateBulkhead(policy.Bulkhead, result);
            }

            // 验证限流策略
            if (policy.RateLimit.Enabled)
            {
                ValidateRateLimit(policy.RateLimit, result);
            }

            // 验证回退策略
            if (policy.Fallback.Enabled)
            {
                ValidateFallback(policy.Fallback, result);
            }

            return await Task.FromResult(result);
        }

        /// <summary>
        /// 生成Polly策略代码 - 完整实现
        /// </summary>
        public async Task<GeneratedPollyCodeDto> GeneratePollyCodeAsync(ResiliencePolicyDto policy)
        {
            var code = new StringBuilder();
            var policies = new List<string>();

            // 生成命名空间和引用
            code.AppendLine("using System;");
            code.AppendLine("using System.Net.Http;");
            code.AppendLine("using Microsoft.Extensions.DependencyInjection;");
            code.AppendLine("using Polly;");
            code.AppendLine("using Polly.CircuitBreaker;");
            code.AppendLine("using Polly.Timeout;");
            code.AppendLine("using Polly.RateLimiting;");
            code.AppendLine();

            // 1. 生成Retry策略
            if (policy.Retry.Enabled)
            {
                policies.Add(GenerateRetryPolicy(policy.Retry));
            }

            // 2. 生成Circuit Breaker策略
            if (policy.CircuitBreaker.Enabled)
            {
                policies.Add(GenerateCircuitBreakerPolicy(policy.CircuitBreaker));
            }

            // 3. 生成Timeout策略
            if (policy.Timeout.Enabled)
            {
                policies.Add(GenerateTimeoutPolicy(policy.Timeout));
            }

            // 4. 生成Bulkhead策略
            if (policy.Bulkhead.Enabled)
            {
                policies.Add(GenerateBulkheadPolicy(policy.Bulkhead));
            }

            // 5. 生成Rate Limit策略
            if (policy.RateLimit.Enabled)
            {
                policies.Add(GenerateRateLimitPolicy(policy.RateLimit));
            }

            // 6. 生成Fallback策略
            if (policy.Fallback.Enabled)
            {
                policies.Add(GenerateFallbackPolicy(policy.Fallback));
            }

            // 生成组合策略代码
            code.AppendLine("// 弹性策略配置");
            foreach (var policyCode in policies)
            {
                code.AppendLine(policyCode);
                code.AppendLine();
            }

            // 生成AddHttpClient扩展方法
            var configMethod = GenerateAddHttpClientConfiguration(policy, policies);

            return await Task.FromResult(new GeneratedPollyCodeDto
            {
                CSharpCode = code.ToString(),
                ConfigurationMethod = configMethod,
                RequiredNugetPackages = new List<string>
                {
                    "Polly",
                    "Polly.Extensions.Http",
                    "Microsoft.Extensions.Http.Polly"
                },
                GeneratedAt = DateTime.UtcNow
            });
        }

        /// <summary>
        /// 生成Istio策略YAML - Day 20 Part 2实现
        /// </summary>
        public Task<GeneratedIstioPolicyDto> GenerateIstioPolicyAsync(ResiliencePolicyDto policy)
        {
            // TODO: Day 20 Part 2 实现
            throw new NotImplementedException("将在Day 20 Part 2实现");
        }

        #region 私有验证方法

        private void ValidateRetryPolicy(RetryPolicyDto retry, ResiliencePolicyValidationResultDto result)
        {
            // 验证重试次数
            if (retry.MaxAttempts < 1 || retry.MaxAttempts > 10)
            {
                result.Errors.Add("重试次数必须在1-10之间");
                result.IsValid = false;
            }

            // 验证延迟时间
            if (retry.InitialDelayMs < 0)
            {
                result.Errors.Add("初始延迟不能为负数");
                result.IsValid = false;
            }

            if (retry.MaxDelayMs <= retry.InitialDelayMs)
            {
                result.Errors.Add("最大延迟必须大于初始延迟");
                result.IsValid = false;
            }

            // 验证退避策略
            var validStrategies = new[] { "Exponential", "Linear", "Fixed" };
            if (!validStrategies.Contains(retry.BackoffStrategy))
            {
                result.Errors.Add($"退避策略必须是以下之一: {string.Join(", ", validStrategies)}");
                result.IsValid = false;
            }

            // 建议
            if (retry.MaxAttempts > 5)
            {
                result.Warnings.Add("重试次数超过5次可能导致级联失败");
                result.Suggestions["Retry.MaxAttempts"] = "建议设置为3-5次";
            }
        }

        private void ValidateCircuitBreaker(CircuitBreakerDto circuitBreaker, ResiliencePolicyValidationResultDto result)
        {
            // 验证失败率阈值
            if (circuitBreaker.FailureThreshold < 0 || circuitBreaker.FailureThreshold > 1)
            {
                result.Errors.Add("失败率阈值必须在0-1之间");
                result.IsValid = false;
            }

            // 验证采样时间窗口
            if (circuitBreaker.SamplingDurationMs < 1000)
            {
                result.Warnings.Add("采样时间窗口小于1秒，可能导致断路器过于敏感");
                result.Suggestions["CircuitBreaker.SamplingDurationMs"] = "建议至少5秒";
            }

            // 验证最小吞吐量
            if (circuitBreaker.MinimumThroughput < 1)
            {
                result.Errors.Add("最小吞吐量必须至少为1");
                result.IsValid = false;
            }

            // 验证熔断持续时间
            if (circuitBreaker.BreakDurationMs < 1000)
            {
                result.Warnings.Add("熔断持续时间小于1秒，可能导致系统不稳定");
                result.Suggestions["CircuitBreaker.BreakDurationMs"] = "建议至少30秒";
            }

            // 验证半开状态试探次数
            if (circuitBreaker.HalfOpenMaxAttempts < 1 || circuitBreaker.HalfOpenMaxAttempts > 10)
            {
                result.Errors.Add("半开状态试探次数必须在1-10之间");
                result.IsValid = false;
            }
        }

        private void ValidateTimeout(TimeoutDto timeout, ResiliencePolicyValidationResultDto result)
        {
            // 验证超时时间
            if (timeout.TimeoutMs < 100)
            {
                result.Warnings.Add("超时时间小于100ms，可能过于严格");
                result.Suggestions["Timeout.TimeoutMs"] = "建议至少1000ms";
            }

            if (timeout.TimeoutMs > 300000) // 5分钟
            {
                result.Warnings.Add("超时时间超过5分钟，可能过于宽松");
                result.Suggestions["Timeout.TimeoutMs"] = "建议在1000-30000ms之间";
            }
        }

        private void ValidateBulkhead(BulkheadDto bulkhead, ResiliencePolicyValidationResultDto result)
        {
            // 验证最大并发数
            if (bulkhead.MaxParallelization < 1)
            {
                result.Errors.Add("最大并发数必须至少为1");
                result.IsValid = false;
            }

            if (bulkhead.MaxParallelization > 1000)
            {
                result.Warnings.Add("最大并发数超过1000，可能导致资源耗尽");
                result.Suggestions["Bulkhead.MaxParallelization"] = "建议在10-100之间";
            }

            // 验证队列大小
            if (bulkhead.MaxQueuingActions < 0)
            {
                result.Errors.Add("队列大小不能为负数");
                result.IsValid = false;
            }

            // 验证舱壁类型
            var validTypes = new[] { "Semaphore", "FixedThreadPool" };
            if (!validTypes.Contains(bulkhead.BulkheadType))
            {
                result.Errors.Add($"舱壁类型必须是以下之一: {string.Join(", ", validTypes)}");
                result.IsValid = false;
            }
        }

        private void ValidateRateLimit(RateLimitDto rateLimit, ResiliencePolicyValidationResultDto result)
        {
            // 验证最大请求数
            if (rateLimit.MaxRequests < 1)
            {
                result.Errors.Add("最大请求数必须至少为1");
                result.IsValid = false;
            }

            // 验证时间窗口
            if (rateLimit.WindowSizeMs < 100)
            {
                result.Errors.Add("时间窗口必须至少为100ms");
                result.IsValid = false;
            }

            // 验证算法
            var validAlgorithms = new[] { "SlidingWindow", "FixedWindow", "TokenBucket" };
            if (!validAlgorithms.Contains(rateLimit.Algorithm))
            {
                result.Errors.Add($"限流算法必须是以下之一: {string.Join(", ", validAlgorithms)}");
                result.IsValid = false;
            }

            // 计算RPS并给出建议
            var rps = (double)rateLimit.MaxRequests / (rateLimit.WindowSizeMs / 1000.0);
            if (rps > 10000)
            {
                result.Warnings.Add($"当前配置RPS={rps:F0}，可能超出系统处理能力");
                result.Suggestions["RateLimit"] = "建议降低MaxRequests或增大WindowSize";
            }
        }

        private void ValidateFallback(FallbackDto fallback, ResiliencePolicyValidationResultDto result)
        {
            // 验证回退类型
            var validTypes = new[] { "Default", "Cache", "AlternativeService" };
            if (!validTypes.Contains(fallback.FallbackType))
            {
                result.Errors.Add($"回退类型必须是以下之一: {string.Join(", ", validTypes)}");
                result.IsValid = false;
            }

            // 验证回退配置完整性
            if (fallback.FallbackType == "Default" && string.IsNullOrWhiteSpace(fallback.FallbackValue))
            {
                result.Warnings.Add("使用Default回退类型但未配置FallbackValue");
                result.Suggestions["Fallback.FallbackValue"] = "建议配置默认返回值";
            }

            if (fallback.FallbackType == "AlternativeService" && string.IsNullOrWhiteSpace(fallback.AlternativeServiceUrl))
            {
                result.Errors.Add("使用AlternativeService但未配置备用服务URL");
                result.IsValid = false;
            }

            // 验证缓存配置
            if (fallback.EnableCache && fallback.CacheDurationMs < 1000)
            {
                result.Warnings.Add("缓存时长小于1秒，缓存效果可能不佳");
                result.Suggestions["Fallback.CacheDurationMs"] = "建议至少60秒";
            }
        }

        #endregion

        #region Polly代码生成方法

        private string GenerateRetryPolicy(RetryPolicyDto retry)
        {
            var code = new StringBuilder();
            code.AppendLine("// Retry策略");
            code.AppendLine("var retryPolicy = Policy");
            code.AppendLine("    .Handle<HttpRequestException>()");
            
            // 添加可重试的异常类型
            foreach (var exception in retry.RetryableExceptions.Skip(1))
            {
                code.AppendLine($"    .Or<{exception}>()");
            }

            // 生成退避策略
            switch (retry.BackoffStrategy)
            {
                case "Exponential":
                    code.AppendLine($"    .WaitAndRetryAsync({retry.MaxAttempts},");
                    code.AppendLine($"        retryAttempt => TimeSpan.FromMilliseconds({retry.InitialDelayMs} * Math.Pow(2, retryAttempt - 1)),");
                    code.AppendLine("        onRetry: (outcome, timespan, retryCount, context) =>");
                    code.AppendLine("        {");
                    code.AppendLine($"            Console.WriteLine($\"Retry {{retryCount}} after {{timespan.TotalMilliseconds}}ms\");");
                    code.AppendLine("        });");
                    break;
                case "Linear":
                    code.AppendLine($"    .WaitAndRetryAsync({retry.MaxAttempts},");
                    code.AppendLine($"        retryAttempt => TimeSpan.FromMilliseconds({retry.InitialDelayMs} * retryAttempt),");
                    code.AppendLine("        onRetry: (outcome, timespan, retryCount, context) =>");
                    code.AppendLine("        {");
                    code.AppendLine($"            Console.WriteLine($\"Retry {{retryCount}} after {{timespan.TotalMilliseconds}}ms\");");
                    code.AppendLine("        });");
                    break;
                case "Fixed":
                    code.AppendLine($"    .WaitAndRetryAsync({retry.MaxAttempts},");
                    code.AppendLine($"        retryAttempt => TimeSpan.FromMilliseconds({retry.InitialDelayMs}),");
                    code.AppendLine("        onRetry: (outcome, timespan, retryCount, context) =>");
                    code.AppendLine("        {");
                    code.AppendLine($"            Console.WriteLine($\"Retry {{retryCount}} after {{timespan.TotalMilliseconds}}ms\");");
                    code.AppendLine("        });");
                    break;
            }

            return code.ToString();
        }

        private string GenerateCircuitBreakerPolicy(CircuitBreakerDto circuitBreaker)
        {
            var code = new StringBuilder();
            code.AppendLine("// Circuit Breaker策略");
            code.AppendLine("var circuitBreakerPolicy = Policy");
            code.AppendLine("    .Handle<HttpRequestException>()");
            code.AppendLine($"    .AdvancedCircuitBreakerAsync(");
            code.AppendLine($"        failureThreshold: {circuitBreaker.FailureThreshold},");
            code.AppendLine($"        samplingDuration: TimeSpan.FromMilliseconds({circuitBreaker.SamplingDurationMs}),");
            code.AppendLine($"        minimumThroughput: {circuitBreaker.MinimumThroughput},");
            code.AppendLine($"        durationOfBreak: TimeSpan.FromMilliseconds({circuitBreaker.BreakDurationMs}),");
            code.AppendLine("        onBreak: (outcome, timespan) =>");
            code.AppendLine("        {");
            code.AppendLine($"            Console.WriteLine($\"Circuit breaker opened for {{timespan.TotalSeconds}}s\");");
            code.AppendLine("        },");
            code.AppendLine("        onReset: () =>");
            code.AppendLine("        {");
            code.AppendLine("            Console.WriteLine(\"Circuit breaker reset\");");
            code.AppendLine("        },");
            code.AppendLine("        onHalfOpen: () =>");
            code.AppendLine("        {");
            code.AppendLine("            Console.WriteLine(\"Circuit breaker half-open\");");
            code.AppendLine("        });");

            return code.ToString();
        }

        private string GenerateTimeoutPolicy(TimeoutDto timeout)
        {
            var code = new StringBuilder();
            code.AppendLine("// Timeout策略");
            code.AppendLine($"var timeoutPolicy = Policy.TimeoutAsync<HttpResponseMessage>(");
            code.AppendLine($"    TimeSpan.FromMilliseconds({timeout.TimeoutMs}),");
            code.AppendLine("    onTimeoutAsync: (context, timespan, task) =>");
            code.AppendLine("    {");
            code.AppendLine($"        Console.WriteLine($\"Timeout after {{timespan.TotalMilliseconds}}ms\");");
            code.AppendLine("        return Task.CompletedTask;");
            code.AppendLine("    });");

            return code.ToString();
        }

        private string GenerateBulkheadPolicy(BulkheadDto bulkhead)
        {
            var code = new StringBuilder();
            code.AppendLine("// Bulkhead策略");
            code.AppendLine($"var bulkheadPolicy = Policy.BulkheadAsync<HttpResponseMessage>(");
            code.AppendLine($"    maxParallelization: {bulkhead.MaxParallelization},");
            code.AppendLine($"    maxQueuingActions: {bulkhead.MaxQueuingActions},");
            code.AppendLine("    onBulkheadRejectedAsync: context =>");
            code.AppendLine("    {");
            code.AppendLine("        Console.WriteLine(\"Bulkhead rejected\");");
            code.AppendLine("        return Task.CompletedTask;");
            code.AppendLine("    });");

            return code.ToString();
        }

        private string GenerateRateLimitPolicy(RateLimitDto rateLimit)
        {
            var code = new StringBuilder();
            code.AppendLine("// Rate Limit策略");
            code.AppendLine($"var rateLimitPolicy = Policy.RateLimitAsync<HttpResponseMessage>(");
            code.AppendLine($"    numberOfExecutions: {rateLimit.MaxRequests},");
            code.AppendLine($"    perTimeSpan: TimeSpan.FromMilliseconds({rateLimit.WindowSizeMs}),");
            code.AppendLine($"    maxBurst: {rateLimit.QueueLimit},");
            code.AppendLine("    onRejected: (retryAfter, context) =>");
            code.AppendLine("    {");
            code.AppendLine($"        Console.WriteLine($\"Rate limit exceeded, retry after {{retryAfter}}\");");
            code.AppendLine("    });");

            return code.ToString();
        }

        private string GenerateFallbackPolicy(FallbackDto fallback)
        {
            var code = new StringBuilder();
            code.AppendLine("// Fallback策略");
            code.AppendLine("var fallbackPolicy = Policy<HttpResponseMessage>");
            code.AppendLine("    .Handle<HttpRequestException>()");
            code.AppendLine("    .FallbackAsync(");
            
            if (fallback.FallbackType == "Default")
            {
                code.AppendLine("        fallbackAction: (cancellationToken) =>");
                code.AppendLine("        {");
                code.AppendLine($"            var response = new HttpResponseMessage(System.Net.HttpStatusCode.OK);");
                code.AppendLine($"            response.Content = new StringContent(\"{fallback.FallbackValue}\");");
                code.AppendLine("            return Task.FromResult(response);");
                code.AppendLine("        },");
            }
            else if (fallback.FallbackType == "AlternativeService")
            {
                code.AppendLine("        fallbackAction: async (cancellationToken) =>");
                code.AppendLine("        {");
                code.AppendLine("            using var client = new HttpClient();");
                code.AppendLine($"            return await client.GetAsync(\"{fallback.AlternativeServiceUrl}\", cancellationToken);");
                code.AppendLine("        },");
            }

            code.AppendLine("        onFallbackAsync: (outcome, context) =>");
            code.AppendLine("        {");
            code.AppendLine("            Console.WriteLine(\"Fallback executed\");");
            code.AppendLine("            return Task.CompletedTask;");
            code.AppendLine("        });");

            return code.ToString();
        }

        private string GenerateAddHttpClientConfiguration(ResiliencePolicyDto policy, List<string> policies)
        {
            var code = new StringBuilder();
            code.AppendLine("// 在Startup.cs或Program.cs中配置HttpClient");
            code.AppendLine($"services.AddHttpClient(\"{policy.ServiceName}\")");

            if (policies.Count > 0)
            {
                code.AppendLine("    .AddPolicyHandler((services, request) =>");
                code.AppendLine("    {");
                code.AppendLine("        // 组合所有策略");
                code.AppendLine("        IAsyncPolicy<HttpResponseMessage> policyWrap = Policy.NoOpAsync<HttpResponseMessage>();");
                
                if (policy.Retry.Enabled)
                {
                    code.AppendLine("        policyWrap = policyWrap.WrapAsync(retryPolicy);");
                }
                if (policy.CircuitBreaker.Enabled)
                {
                    code.AppendLine("        policyWrap = policyWrap.WrapAsync(circuitBreakerPolicy);");
                }
                if (policy.Timeout.Enabled)
                {
                    code.AppendLine("        policyWrap = policyWrap.WrapAsync(timeoutPolicy);");
                }
                if (policy.Bulkhead.Enabled)
                {
                    code.AppendLine("        policyWrap = policyWrap.WrapAsync(bulkheadPolicy);");
                }
                if (policy.RateLimit.Enabled)
                {
                    code.AppendLine("        policyWrap = policyWrap.WrapAsync(rateLimitPolicy);");
                }
                if (policy.Fallback.Enabled)
                {
                    code.AppendLine("        policyWrap = policyWrap.WrapAsync(fallbackPolicy);");
                }

                code.AppendLine("        return policyWrap;");
                code.AppendLine("    });");
            }

            return code.ToString();
        }

        #endregion
    }
}

