// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚡ Aspire熔断机制增强器
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @module @smartabp/lowcode-core/generators/aspire/CircuitBreakerEnhancer
//
// 📋 功能：
//   - 熔断器模式实现
//   - 重试策略配置
//   - 超时控制
//   - 降级处理
//   - 健康检查集成
//   - 熔断状态监控
//   - 自动恢复机制
//   - 指标收集与告警
//
// 🎯 目标：
//   - 系统容错能力
//   - 故障隔离
//   - 快速失败
//   - 优雅降级
//
// 🏆 质量标准：
//   - 代码质量 ≥95分
//   - TypeScript类型安全 100%
//   - 业界最佳实践（参考Netflix Hystrix、Polly）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 熔断器状态
 */
export type CircuitBreakerState = 'Closed' | 'Open' | 'HalfOpen'

/**
 * 重试策略类型
 */
export type RetryStrategy = 'fixed' | 'exponential' | 'linear' | 'jitter'

/**
 * 降级策略类型
 */
export type FallbackStrategy = 'none' | 'cache' | 'static' | 'alternative' | 'custom'

/**
 * 熔断器配置
 */
export interface CircuitBreakerConfig {
  /** 配置名称 */
  name: string
  /** 失败阈值（连续失败次数）*/
  failureThreshold: number
  /** 成功阈值（半开状态下成功次数）*/
  successThreshold: number
  /** 超时时间（毫秒）*/
  timeout: number
  /** 熔断器开启持续时间（毫秒）*/
  durationOfBreak: number
  /** 采样周期（毫秒）*/
  samplingPeriod: number
  /** 最小吞吐量（在采样周期内）*/
  minimumThroughput: number
  /** 错误百分比阈值 */
  errorPercentageThreshold: number
  /** 重试配置 */
  retryPolicy: RetryPolicyConfig
  /** 超时配置 */
  timeoutPolicy: TimeoutPolicyConfig
  /** 降级配置 */
  fallbackPolicy: FallbackPolicyConfig
  /** 健康检查配置 */
  healthCheck: HealthCheckConfig
  /** 监控配置 */
  monitoring: MonitoringConfig
}

/**
 * 重试策略配置
 */
export interface RetryPolicyConfig {
  /** 启用重试 */
  enabled: boolean
  /** 重试策略 */
  strategy: RetryStrategy
  /** 最大重试次数 */
  maxRetryAttempts: number
  /** 基础延迟（毫秒）*/
  baseDelay: number
  /** 最大延迟（毫秒）*/
  maxDelay: number
  /** 指数退避倍数 */
  backoffMultiplier: number
  /** 随机化因子 */
  jitterFactor: number
  /** 可重试的异常类型 */
  retryableExceptions: string[]
  /** 不可重试的异常类型 */
  nonRetryableExceptions: string[]
}

/**
 * 超时策略配置
 */
export interface TimeoutPolicyConfig {
  /** 启用超时 */
  enabled: boolean
  /** 超时时间（毫秒）*/
  timeout: number
  /** 超时策略 */
  timeoutStrategy: 'pessimistic' | 'optimistic'
  /** 超时后操作 */
  onTimeout: 'cancel' | 'continue'
}

/**
 * 降级策略配置
 */
export interface FallbackPolicyConfig {
  /** 启用降级 */
  enabled: boolean
  /** 降级策略 */
  strategy: FallbackStrategy
  /** 缓存键生成器 */
  cacheKeyGenerator?: string
  /** 静态响应 */
  staticResponse?: any
  /** 备用服务端点 */
  alternativeEndpoint?: string
  /** 自定义降级处理器 */
  customHandler?: string
}

/**
 * 健康检查配置
 */
export interface HealthCheckConfig {
  /** 启用健康检查 */
  enabled: boolean
  /** 检查间隔（毫秒）*/
  interval: number
  /** 健康检查端点 */
  endpoint: string
  /** 超时时间（毫秒）*/
  timeout: number
  /** 期望状态码 */
  expectedStatusCodes: number[]
  /** 健康阈值 */
  healthyThreshold: number
  /** 不健康阈值 */
  unhealthyThreshold: number
}

/**
 * 监控配置
 */
export interface MonitoringConfig {
  /** 启用监控 */
  enabled: boolean
  /** 指标收集间隔（毫秒）*/
  metricsInterval: number
  /** 启用详细日志 */
  enableDetailedLogging: boolean
  /** 告警阈值 */
  alertThresholds: {
    /** 错误率阈值 */
    errorRateThreshold: number
    /** 响应时间阈值（毫秒）*/
    responseTimeThreshold: number
    /** 并发请求数阈值 */
    concurrentRequestsThreshold: number
  }
  /** 指标导出端点 */
  metricsEndpoint?: string
}

/**
 * 熔断器指标
 */
export interface CircuitBreakerMetrics {
  /** 配置名称 */
  name: string
  /** 当前状态 */
  state: CircuitBreakerState
  /** 总请求数 */
  totalRequests: number
  /** 成功请求数 */
  successfulRequests: number
  /** 失败请求数 */
  failedRequests: number
  /** 错误率 */
  errorRate: number
  /** 平均响应时间（毫秒）*/
  averageResponseTime: number
  /** 最大响应时间（毫秒）*/
  maxResponseTime: number
  /** 最小响应时间（毫秒）*/
  minResponseTime: number
  /** 并发请求数 */
  concurrentRequests: number
  /** 最后故障时间 */
  lastFailureTime?: Date
  /** 状态变更时间 */
  stateChangedTime: Date
}

/**
 * 执行结果
 */
export interface ExecutionResult<T> {
  /** 是否成功 */
  success: boolean
  /** 结果数据 */
  data?: T
  /** 错误信息 */
  error?: Error
  /** 执行时间（毫秒）*/
  duration: number
  /** 是否来自降级 */
  fromFallback: boolean
  /** 是否被熔断器阻止 */
  circuitBreakerBlocked: boolean
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ 熔断机制增强器类
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Aspire熔断机制增强器
 * 
 * @example
 * ```typescript
 * const enhancer = new CircuitBreakerEnhancer()
 * 
 * // 创建熔断器配置
 * const config = enhancer.createCircuitBreakerConfig({
 *   name: 'api-service',
 *   failureThreshold: 5,
 *   timeout: 5000
 * })
 * 
 * // 生成熔断器代码
 * const code = enhancer.generateCircuitBreakerCode([config])
 * 
 * // 生成监控Dashboard配置
 * const dashboard = enhancer.generateMonitoringDashboard([config])
 * ```
 */
export class CircuitBreakerEnhancer {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 公共方法 - 配置生成
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 创建熔断器配置
   */
  createCircuitBreakerConfig(options: {
    name: string
    failureThreshold?: number
    timeout?: number
    enableRetry?: boolean
    enableFallback?: boolean
    fallbackStrategy?: FallbackStrategy
  }): CircuitBreakerConfig {
    return {
      name: options.name,
      failureThreshold: options.failureThreshold || 5,
      successThreshold: 3,
      timeout: options.timeout || 30000,
      durationOfBreak: 60000,
      samplingPeriod: 60000,
      minimumThroughput: 10,
      errorPercentageThreshold: 50,
      
      retryPolicy: {
        enabled: options.enableRetry || true,
        strategy: 'exponential',
        maxRetryAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        jitterFactor: 0.1,
        retryableExceptions: [
          'HttpRequestException',
          'TaskCanceledException',
          'SocketException',
          'TimeoutException',
        ],
        nonRetryableExceptions: [
          'ArgumentException',
          'UnauthorizedAccessException',
          'ForbiddenException',
        ],
      },

      timeoutPolicy: {
        enabled: true,
        timeout: options.timeout || 30000,
        timeoutStrategy: 'pessimistic',
        onTimeout: 'cancel',
      },

      fallbackPolicy: {
        enabled: options.enableFallback || true,
        strategy: options.fallbackStrategy || 'cache',
        cacheKeyGenerator: 'DefaultCacheKeyGenerator',
      },

      healthCheck: {
        enabled: true,
        interval: 30000,
        endpoint: '/health',
        timeout: 10000,
        expectedStatusCodes: [200, 204],
        healthyThreshold: 3,
        unhealthyThreshold: 3,
      },

      monitoring: {
        enabled: true,
        metricsInterval: 10000,
        enableDetailedLogging: true,
        alertThresholds: {
          errorRateThreshold: 10,
          responseTimeThreshold: 5000,
          concurrentRequestsThreshold: 100,
        },
        metricsEndpoint: '/metrics',
      },
    }
  }

  /**
   * 创建HTTP客户端熔断器配置
   */
  createHttpClientCircuitBreaker(serviceName: string): CircuitBreakerConfig {
    return this.createCircuitBreakerConfig({
      name: `${serviceName}-http-client`,
      failureThreshold: 3,
      timeout: 10000,
      enableRetry: true,
      enableFallback: true,
      fallbackStrategy: 'cache',
    })
  }

  /**
   * 创建数据库熔断器配置
   */
  createDatabaseCircuitBreaker(databaseName: string): CircuitBreakerConfig {
    return this.createCircuitBreakerConfig({
      name: `${databaseName}-database`,
      failureThreshold: 5,
      timeout: 30000,
      enableRetry: true,
      enableFallback: false, // 数据库操作通常不适合降级
    })
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 公共方法 - 代码生成
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 生成熔断器C#代码
   */
  generateCircuitBreakerCode(configs: CircuitBreakerConfig[]): string {
    const lines: string[] = []

    lines.push('// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('// ⚡ 熔断机制配置')
    lines.push('// 自动生成，请勿手动修改')
    lines.push('// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('')

    // 添加必要的using语句
    lines.push('using Microsoft.Extensions.DependencyInjection;')
    lines.push('using Microsoft.Extensions.Http.Resilience;')
    lines.push('using Polly;')
    lines.push('using Polly.CircuitBreaker;')
    lines.push('using Polly.Extensions.Http;')
    lines.push('using Polly.Retry;')
    lines.push('using Polly.Timeout;')
    lines.push('')

    // 生成扩展方法类
    lines.push('public static class CircuitBreakerExtensions')
    lines.push('{')
    lines.push('    /// <summary>')
    lines.push('    /// 配置熔断器策略')
    lines.push('    /// </summary>')
    lines.push('    public static IServiceCollection AddCircuitBreakerPolicies(')
    lines.push('        this IServiceCollection services)')
    lines.push('    {')

    // 为每个配置生成熔断器策略
    for (const config of configs) {
      lines.push(`        // ${config.name} 熔断器配置`)
      lines.push(`        services.AddResilienceHandler("${config.name}", builder =>`)
      lines.push('        {')
      
      // 添加重试策略
      if (config.retryPolicy.enabled) {
        lines.push('            // 重试策略')
        lines.push('            builder.AddRetry(new RetryStrategyOptions')
        lines.push('            {')
        lines.push(`                MaxRetryAttempts = ${config.retryPolicy.maxRetryAttempts},`)
        lines.push(`                Delay = TimeSpan.FromMilliseconds(${config.retryPolicy.baseDelay}),`)
        lines.push(`                MaxDelay = TimeSpan.FromMilliseconds(${config.retryPolicy.maxDelay}),`)
        lines.push(`                BackoffType = DelayBackoffType.${this.getBackoffType(config.retryPolicy.strategy)},`)
        lines.push('                ShouldHandle = new PredicateBuilder().Handle<HttpRequestException>(),')
        lines.push('            });')
        lines.push('')
      }

      // 添加熔断器策略
      lines.push('            // 熔断器策略')
      lines.push('            builder.AddCircuitBreaker(new CircuitBreakerStrategyOptions')
      lines.push('            {')
      lines.push(`                FailureRatio = ${config.errorPercentageThreshold / 100},`)
      lines.push(`                SamplingDuration = TimeSpan.FromMilliseconds(${config.samplingPeriod}),`)
      lines.push(`                MinimumThroughput = ${config.minimumThroughput},`)
      lines.push(`                BreakDuration = TimeSpan.FromMilliseconds(${config.durationOfBreak}),`)
      lines.push('                ShouldHandle = new PredicateBuilder().Handle<HttpRequestException>(),')
      lines.push('            });')
      lines.push('')

      // 添加超时策略
      if (config.timeoutPolicy.enabled) {
        lines.push('            // 超时策略')
        lines.push('            builder.AddTimeout(new TimeoutStrategyOptions')
        lines.push('            {')
        lines.push(`                Timeout = TimeSpan.FromMilliseconds(${config.timeoutPolicy.timeout}),`)
        lines.push('            });')
        lines.push('')
      }

      lines.push('        });')
      lines.push('')
    }

    lines.push('        return services;')
    lines.push('    }')
    lines.push('')

    // 生成HTTP客户端配置方法
    lines.push('    /// <summary>')
    lines.push('    /// 为HTTP客户端配置熔断器')
    lines.push('    /// </summary>')
    lines.push('    public static IServiceCollection AddHttpClientWithCircuitBreaker<TClient>(')
    lines.push('        this IServiceCollection services,')
    lines.push('        string baseAddress,')
    lines.push('        string policyName)')
    lines.push('        where TClient : class')
    lines.push('    {')
    lines.push('        services.AddHttpClient<TClient>(client =>')
    lines.push('        {')
    lines.push('            client.BaseAddress = new Uri(baseAddress);')
    lines.push('        })')
    lines.push('        .AddResilienceHandler(policyName);')
    lines.push('')
    lines.push('        return services;')
    lines.push('    }')
    lines.push('}')
    lines.push('')

    // 生成配置类
    for (const config of configs) {
      lines.push(...this.generateConfigurationClass(config))
      lines.push('')
    }

    return lines.join('\n')
  }

  /**
   * 生成Program.cs中的熔断器配置
   */
  generateProgramCsCircuitBreaker(configs: CircuitBreakerConfig[]): string {
    const lines: string[] = []

    lines.push('// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('// ⚡ 熔断器配置')
    lines.push('// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('')

    lines.push('// 添加熔断器策略')
    lines.push('builder.Services.AddCircuitBreakerPolicies();')
    lines.push('')

    // 为每个服务配置HTTP客户端
    for (const config of configs) {
      if (config.name.includes('http-client')) {
        const serviceName = config.name.replace('-http-client', '')
        lines.push(`// ${serviceName} HTTP客户端熔断器`)
        lines.push(`builder.Services.AddHttpClientWithCircuitBreaker<${this.toPascalCase(serviceName)}Client>(`)
        lines.push(`    builder.Configuration.GetConnectionString("${serviceName}"),`)
        lines.push(`    "${config.name}");`)
        lines.push('')
      }
    }

    // 添加健康检查
    lines.push('// 熔断器健康检查')
    lines.push('builder.Services.AddHealthChecks()')
    for (const config of configs) {
      lines.push(`    .AddCheck<${this.toPascalCase(config.name)}HealthCheck>("${config.name}-health")`)
    }
    lines.push(';')
    lines.push('')

    return lines.join('\n')
  }

  /**
   * 生成监控Dashboard配置
   */
  generateMonitoringDashboard(configs: CircuitBreakerConfig[]): string {
    const dashboardConfig = {
      title: 'Aspire Circuit Breaker Dashboard',
      panels: configs.map(config => ({
        title: `${config.name} Circuit Breaker`,
        type: 'graph',
        targets: [
          {
            expr: `circuit_breaker_state{name="${config.name}"}`,
            legendFormat: 'State',
          },
          {
            expr: `circuit_breaker_error_rate{name="${config.name}"}`,
            legendFormat: 'Error Rate (%)',
          },
          {
            expr: `circuit_breaker_response_time{name="${config.name}"}`,
            legendFormat: 'Response Time (ms)',
          },
        ],
        thresholds: [
          {
            value: config.monitoring.alertThresholds.errorRateThreshold,
            color: 'red',
            op: 'gt',
          },
        ],
      })),
    }

    return JSON.stringify(dashboardConfig, null, 2)
  }

  /**
   * 生成健康检查代码
   */
  generateHealthCheckCode(configs: CircuitBreakerConfig[]): string {
    const lines: string[] = []

    lines.push('// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('// 🔍 熔断器健康检查')
    lines.push('// 自动生成，请勿手动修改')
    lines.push('// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    lines.push('')

    lines.push('using Microsoft.Extensions.Diagnostics.HealthChecks;')
    lines.push('')

    for (const config of configs) {
      const className = `${this.toPascalCase(config.name)}HealthCheck`
      
      lines.push(`public class ${className} : IHealthCheck`)
      lines.push('{')
      lines.push('    private readonly HttpClient _httpClient;')
      lines.push('    private readonly ILogger<${className}> _logger;')
      lines.push('')
      lines.push(`    public ${className}(HttpClient httpClient, ILogger<${className}> logger)`)
      lines.push('    {')
      lines.push('        _httpClient = httpClient;')
      lines.push('        _logger = logger;')
      lines.push('    }')
      lines.push('')
      lines.push('    public async Task<HealthCheckResult> CheckHealthAsync(')
      lines.push('        HealthCheckContext context,')
      lines.push('        CancellationToken cancellationToken = default)')
      lines.push('    {')
      lines.push('        try')
      lines.push('        {')
      lines.push(`            using var response = await _httpClient.GetAsync("${config.healthCheck.endpoint}", cancellationToken);`)
      lines.push('')
      lines.push(`            var isHealthy = ${JSON.stringify(config.healthCheck.expectedStatusCodes)}.Contains((int)response.StatusCode);`)
      lines.push('')
      lines.push('            return isHealthy')
      lines.push('                ? HealthCheckResult.Healthy($"Service is healthy. Status: {response.StatusCode}")')
      lines.push('                : HealthCheckResult.Unhealthy($"Service is unhealthy. Status: {response.StatusCode}");')
      lines.push('        }')
      lines.push('        catch (Exception ex)')
      lines.push('        {')
      lines.push('            _logger.LogError(ex, "Health check failed for {ServiceName}", context.Registration.Name);')
      lines.push('            return HealthCheckResult.Unhealthy($"Health check failed: {ex.Message}");')
      lines.push('        }')
      lines.push('    }')
      lines.push('}')
      lines.push('')
    }

    return lines.join('\n')
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 私有方法
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private generateConfigurationClass(config: CircuitBreakerConfig): string[] {
    const lines: string[] = []
    const className = `${this.toPascalCase(config.name)}CircuitBreakerOptions`

    lines.push(`/// <summary>`)
    lines.push(`/// ${config.name} 熔断器配置选项`)
    lines.push(`/// </summary>`)
    lines.push(`public class ${className}`)
    lines.push('{')
    lines.push(`    public int FailureThreshold { get; set; } = ${config.failureThreshold};`)
    lines.push(`    public int SuccessThreshold { get; set; } = ${config.successThreshold};`)
    lines.push(`    public TimeSpan Timeout { get; set; } = TimeSpan.FromMilliseconds(${config.timeout});`)
    lines.push(`    public TimeSpan DurationOfBreak { get; set; } = TimeSpan.FromMilliseconds(${config.durationOfBreak});`)
    lines.push(`    public int ErrorPercentageThreshold { get; set; } = ${config.errorPercentageThreshold};`)
    lines.push('}')

    return lines
  }

  private getBackoffType(strategy: RetryStrategy): string {
    switch (strategy) {
      case 'fixed':
        return 'Constant'
      case 'exponential':
        return 'Exponential'
      case 'linear':
        return 'Linear'
      case 'jitter':
        return 'Exponential' // Polly uses jitter within exponential
      default:
        return 'Exponential'
    }
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[.\-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📤 导出
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default CircuitBreakerEnhancer
