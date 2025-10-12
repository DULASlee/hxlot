import { ref } from 'vue'
import { createSimpleApiComposable } from '@smartabp/lowcode-shared'

// 弹性策略配置接口
export interface ResiliencePolicyConfig {
  serviceName: string
  retry: {
    enabled: boolean
    maxAttempts: number
    backoffStrategy: string
    initialDelayMs: number
    maxDelayMs: number
  }
  circuitBreaker: {
    enabled: boolean
    failureThreshold: number
    samplingDurationMs: number
    minimumThroughput: number
    breakDurationMs: number
    halfOpenMaxAttempts: number
  }
  timeout: {
    enabled: boolean
    timeoutMs: number
    throwOnTimeout: boolean
  }
  bulkhead: {
    enabled: boolean
    maxParallelization: number
    maxQueuingActions: number
  }
  rateLimit: {
    enabled: boolean
    maxRequests: number
    windowSizeMs: number
  }
  fallback: {
    enabled: boolean
    fallbackType: string
    fallbackValue: string
    alternativeServiceUrl: string
    enableCache: boolean
    cacheDurationMs: number
  }
}

// 生成的代码结果接口
export interface GeneratedCode {
  pollyCode: string
  istioYaml: string
}

/**
 * 弹性策略管理Composable
 * 提供策略验证、代码生成等功能
 */
export function useResiliencePolicy() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 验证策略配置
   */
  const validatePolicy = (config: ResiliencePolicyConfig): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    // 验证服务名称
    if (!config.serviceName || config.serviceName.trim() === '') {
      errors.push('服务名称不能为空')
    }

    // 验证重试策略
    if (config.retry.enabled) {
      if (config.retry.maxAttempts < 1 || config.retry.maxAttempts > 10) {
        errors.push('重试次数必须在1-10之间')
      }
      if (config.retry.maxDelayMs <= config.retry.initialDelayMs) {
        errors.push('最大延迟必须大于初始延迟')
      }
    }

    // 验证断路器
    if (config.circuitBreaker.enabled) {
      if (config.circuitBreaker.failureThreshold < 0 || config.circuitBreaker.failureThreshold > 1) {
        errors.push('失败率阈值必须在0-1之间')
      }
      if (config.circuitBreaker.minimumThroughput < 1) {
        errors.push('最小吞吐量必须至少为1')
      }
    }

    // 验证超时
    if (config.timeout.enabled) {
      if (config.timeout.timeoutMs < 100) {
        errors.push('超时时间必须至少100ms')
      }
    }

    // 验证舱壁隔离
    if (config.bulkhead.enabled) {
      if (config.bulkhead.maxParallelization < 1) {
        errors.push('最大并发数必须至少为1')
      }
    }

    // 验证限流
    if (config.rateLimit.enabled) {
      if (config.rateLimit.maxRequests < 1) {
        errors.push('最大请求数必须至少为1')
      }
      if (config.rateLimit.windowSizeMs < 100) {
        errors.push('时间窗口必须至少100ms')
      }
    }

    // 验证回退策略
    if (config.fallback.enabled) {
      if (config.fallback.fallbackType === 'AlternativeService' && !config.fallback.alternativeServiceUrl) {
        errors.push('使用备用服务时必须配置备用服务URL')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 生成弹性策略代码（保留验证逻辑）
   */
  const generateCode = async (config: ResiliencePolicyConfig): Promise<GeneratedCode> => {
    // 验证配置
    const validation = validatePolicy(config)
    if (!validation.valid) {
      throw new Error(`配置验证失败：${validation.errors.join(', ')}`)
    }

    // TODO: 调用后端API生成代码
    // const response = await httpClient.post('/api/code-generation/resilience/generate', config)
    // return response

    // 临时返回模拟数据
    return {
      pollyCode: `// Polly弹性策略 - ${config.serviceName}\n// 生成的完整代码...`,
      istioYaml: `# Istio弹性配置 - ${config.serviceName}\n// 生成的完整YAML...`
    }
  }

  return {
    loading,
    error,
    validatePolicy,
    generateCode
  }
}

