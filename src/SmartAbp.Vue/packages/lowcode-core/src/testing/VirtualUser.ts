/**
 * 🔥 虚拟用户模拟
 * 
 * 功能：
 * 1. 模拟真实用户行为
 * 2. 执行HTTP请求
 * 3. 收集性能数据
 * 4. 错误处理和重试
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'
import type { TestEndpoint } from './LoadTestScenario'

const logger = getGlobalLogger()

/**
 * 请求结果
 */
export interface RequestResult {
  /** 请求URL */
  url: string
  /** HTTP方法 */
  method: string
  /** HTTP状态码 */
  status: number
  /** 响应时间（毫秒） */
  responseTime: number
  /** 响应大小（字节） */
  responseSize: number
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  error?: string
  /** 时间戳 */
  timestamp: number
}

/**
 * 虚拟用户统计
 */
export interface VirtualUserStats {
  /** 用户ID */
  userId: string
  /** 总请求数 */
  totalRequests: number
  /** 成功请求数 */
  successfulRequests: number
  /** 失败请求数 */
  failedRequests: number
  /** 平均响应时间 */
  averageResponseTime: number
  /** 最小响应时间 */
  minResponseTime: number
  /** 最大响应时间 */
  maxResponseTime: number
  /** 总响应大小 */
  totalResponseSize: number
}

/**
 * 虚拟用户配置
 */
export interface VirtualUserConfig {
  /** 用户ID */
  userId: string
  /** 思考时间（秒） */
  thinkTime: number
  /** 最大重试次数 */
  maxRetries?: number
  /** 请求超时时间（毫秒） */
  timeout?: number
  /** 是否启用详细日志 */
  verboseLogging?: boolean
}

/**
 * 虚拟用户
 */
export class VirtualUser {
  private config: VirtualUserConfig
  private requestHistory: RequestResult[] = []
  private isRunning: boolean = false
  private controller: AbortController | null = null

  constructor(config: VirtualUserConfig) {
    this.config = {
      maxRetries: 3,
      timeout: 30000,
      verboseLogging: false,
      ...config
    }
  }

  /**
   * 执行HTTP请求
   */
  async executeRequest(endpoint: TestEndpoint): Promise<RequestResult> {
    const startTime = performance.now()
    const timestamp = Date.now()

    try {
      // 创建AbortController用于超时控制
      this.controller = new AbortController()
      const timeoutId = setTimeout(() => this.controller?.abort(), this.config.timeout)

      // 发送HTTP请求
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: endpoint.headers,
        body: endpoint.payload ? JSON.stringify(endpoint.payload) : undefined,
        signal: this.controller.signal
      })

      clearTimeout(timeoutId)

      // 计算响应时间
      const responseTime = performance.now() - startTime

      // 获取响应大小
      const responseSize = parseInt(response.headers.get('content-length') || '0', 10)

      // 检查响应状态
      const success = response.ok && (
        !endpoint.expectedStatus || response.status === endpoint.expectedStatus
      )

      const result: RequestResult = {
        url: endpoint.url,
        method: endpoint.method,
        status: response.status,
        responseTime,
        responseSize,
        success,
        timestamp
      }

      // 记录请求结果
      this.requestHistory.push(result)

      if (this.config.verboseLogging) {
        logger.debug(`用户[${this.config.userId}]请求完成`, result)
      }

      return result

    } catch (error) {
      const responseTime = performance.now() - startTime

      const result: RequestResult = {
        url: endpoint.url,
        method: endpoint.method,
        status: 0,
        responseTime,
        responseSize: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp
      }

      this.requestHistory.push(result)

      if (this.config.verboseLogging) {
        logger.error(`用户[${this.config.userId}]请求失败`, result)
      }

      return result
    }
  }

  /**
   * 执行请求（带重试）
   */
  async executeWithRetry(endpoint: TestEndpoint): Promise<RequestResult> {
    let lastResult: RequestResult | null = null
    const maxRetries = this.config.maxRetries || 0

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      lastResult = await this.executeRequest(endpoint)

      if (lastResult.success) {
        return lastResult
      }

      // 如果不是最后一次尝试，等待后重试
      if (attempt < maxRetries) {
        const retryDelay = Math.min(1000 * Math.pow(2, attempt), 5000) // 指数退避，最多5秒
        await this.sleep(retryDelay)

        if (this.config.verboseLogging) {
          logger.warn(`用户[${this.config.userId}]重试请求 (${attempt + 1}/${maxRetries})`, {
            url: endpoint.url
          })
        }
      }
    }

    return lastResult!
  }

  /**
   * 思考时间（模拟用户操作间隔）
   */
  async think(): Promise<void> {
    const thinkTimeMs = this.config.thinkTime * 1000
    // 添加一些随机性（±20%）
    const randomFactor = 0.8 + Math.random() * 0.4
    const actualThinkTime = thinkTimeMs * randomFactor

    await this.sleep(actualThinkTime)
  }

  /**
   * 睡眠
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 停止用户
   */
  stop(): void {
    this.isRunning = false
    if (this.controller) {
      this.controller.abort()
      this.controller = null
    }
  }

  /**
   * 获取用户统计
   */
  getStats(): VirtualUserStats {
    if (this.requestHistory.length === 0) {
      return {
        userId: this.config.userId,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        totalResponseSize: 0
      }
    }

    const successfulRequests = this.requestHistory.filter(r => r.success).length
    const failedRequests = this.requestHistory.filter(r => !r.success).length
    const responseTimes = this.requestHistory.map(r => r.responseTime)
    const totalResponseSize = this.requestHistory.reduce((sum, r) => sum + r.responseSize, 0)

    return {
      userId: this.config.userId,
      totalRequests: this.requestHistory.length,
      successfulRequests,
      failedRequests,
      averageResponseTime: responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      totalResponseSize
    }
  }

  /**
   * 获取请求历史
   */
  getRequestHistory(): readonly RequestResult[] {
    return [...this.requestHistory]
  }

  /**
   * 清空请求历史
   */
  clearHistory(): void {
    this.requestHistory = []
  }

  /**
   * 获取用户ID
   */
  getUserId(): string {
    return this.config.userId
  }

  /**
   * 是否正在运行
   */
  isActive(): boolean {
    return this.isRunning
  }

  /**
   * 设置运行状态
   */
  setRunning(running: boolean): void {
    this.isRunning = running
  }
}
