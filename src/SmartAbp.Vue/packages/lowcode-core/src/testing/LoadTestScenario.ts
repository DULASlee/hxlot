/**
 * 🔥 负载测试场景配置
 * 
 * 功能：
 * 1. 定义测试场景
 * 2. 配置测试参数
 * 3. 管理测试端点
 * 4. 场景验证
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

/**
 * HTTP方法枚举
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/**
 * 测试端点配置
 */
export interface TestEndpoint {
  /** 端点URL */
  url: string
  /** HTTP方法 */
  method: HttpMethod
  /** 请求头 */
  headers?: Record<string, string>
  /** 请求体 */
  payload?: any
  /** 权重（用于随机选择） */
  weight: number
  /** 期望的响应时间（毫秒） */
  expectedResponseTime?: number
  /** 期望的HTTP状态码 */
  expectedStatus?: number
}

/**
 * 负载测试场景配置
 */
export interface LoadTestScenarioConfig {
  /** 场景ID */
  id: string
  /** 场景名称 */
  name: string
  /** 场景描述 */
  description?: string
  /** 虚拟用户数 */
  virtualUsers: number
  /** 测试持续时间（秒） */
  duration: number
  /** 预热时间（秒） */
  rampUpTime: number
  /** 每秒请求数（可选） */
  requestsPerSecond?: number
  /** 测试端点列表 */
  endpoints: TestEndpoint[]
  /** 思考时间（秒，模拟用户操作间隔） */
  thinkTime?: number
  /** 是否启用详细日志 */
  verboseLogging?: boolean
}

/**
 * 负载测试场景
 */
export class LoadTestScenario {
  private config: LoadTestScenarioConfig
  private totalWeight: number = 0

  constructor(config: LoadTestScenarioConfig) {
    this.config = config
    this.validateConfig()
    this.calculateTotalWeight()
  }

  /**
   * 验证配置
   */
  private validateConfig(): void {
    if (!this.config.id || !this.config.name) {
      throw new Error('场景ID和名称不能为空')
    }

    if (this.config.virtualUsers <= 0) {
      throw new Error('虚拟用户数必须大于0')
    }

    if (this.config.duration <= 0) {
      throw new Error('测试持续时间必须大于0')
    }

    if (this.config.rampUpTime < 0) {
      throw new Error('预热时间不能为负数')
    }

    if (this.config.rampUpTime > this.config.duration) {
      throw new Error('预热时间不能超过测试持续时间')
    }

    if (!this.config.endpoints || this.config.endpoints.length === 0) {
      throw new Error('至少需要配置一个测试端点')
    }

    // 验证端点配置
    this.config.endpoints.forEach((endpoint, index) => {
      if (!endpoint.url) {
        throw new Error(`端点${index}的URL不能为空`)
      }
      if (endpoint.weight <= 0) {
        throw new Error(`端点${index}的权重必须大于0`)
      }
    })

    logger.info('✅ 场景配置验证通过', { scenarioId: this.config.id })
  }

  /**
   * 计算总权重
   */
  private calculateTotalWeight(): void {
    this.totalWeight = this.config.endpoints.reduce((sum, endpoint) => sum + endpoint.weight, 0)
  }

  /**
   * 根据权重随机选择端点
   */
  selectEndpoint(): TestEndpoint {
    const random = Math.random() * this.totalWeight
    let weightSum = 0

    for (const endpoint of this.config.endpoints) {
      weightSum += endpoint.weight
      if (random <= weightSum) {
        return endpoint
      }
    }

    // 默认返回第一个端点
    return this.config.endpoints[0]
  }

  /**
   * 获取场景配置
   */
  getConfig(): Readonly<LoadTestScenarioConfig> {
    return { ...this.config }
  }

  /**
   * 获取场景ID
   */
  getId(): string {
    return this.config.id
  }

  /**
   * 获取场景名称
   */
  getName(): string {
    return this.config.name
  }

  /**
   * 获取虚拟用户数
   */
  getVirtualUsers(): number {
    return this.config.virtualUsers
  }

  /**
   * 获取测试持续时间
   */
  getDuration(): number {
    return this.config.duration
  }

  /**
   * 获取预热时间
   */
  getRampUpTime(): number {
    return this.config.rampUpTime
  }

  /**
   * 获取思考时间
   */
  getThinkTime(): number {
    return this.config.thinkTime || 1
  }

  /**
   * 是否启用详细日志
   */
  isVerboseLogging(): boolean {
    return this.config.verboseLogging || false
  }

  /**
   * 获取场景摘要
   */
  getSummary(): string {
    return `场景[${this.config.name}]: ${this.config.virtualUsers}用户, ${this.config.duration}秒, ${this.config.endpoints.length}个端点`
  }
}

/**
 * 场景构建器（Builder模式）
 */
export class LoadTestScenarioBuilder {
  private config: Partial<LoadTestScenarioConfig> = {
    endpoints: [],
    rampUpTime: 0,
    thinkTime: 1,
    verboseLogging: false
  }

  /**
   * 设置场景ID
   */
  withId(id: string): this {
    this.config.id = id
    return this
  }

  /**
   * 设置场景名称
   */
  withName(name: string): this {
    this.config.name = name
    return this
  }

  /**
   * 设置场景描述
   */
  withDescription(description: string): this {
    this.config.description = description
    return this
  }

  /**
   * 设置虚拟用户数
   */
  withVirtualUsers(count: number): this {
    this.config.virtualUsers = count
    return this
  }

  /**
   * 设置测试持续时间
   */
  withDuration(seconds: number): this {
    this.config.duration = seconds
    return this
  }

  /**
   * 设置预热时间
   */
  withRampUpTime(seconds: number): this {
    this.config.rampUpTime = seconds
    return this
  }

  /**
   * 设置每秒请求数
   */
  withRequestsPerSecond(rps: number): this {
    this.config.requestsPerSecond = rps
    return this
  }

  /**
   * 添加测试端点
   */
  addEndpoint(endpoint: TestEndpoint): this {
    this.config.endpoints!.push(endpoint)
    return this
  }

  /**
   * 设置思考时间
   */
  withThinkTime(seconds: number): this {
    this.config.thinkTime = seconds
    return this
  }

  /**
   * 启用详细日志
   */
  withVerboseLogging(enabled: boolean = true): this {
    this.config.verboseLogging = enabled
    return this
  }

  /**
   * 构建场景
   */
  build(): LoadTestScenario {
    if (!this.config.id || !this.config.name || !this.config.virtualUsers || !this.config.duration) {
      throw new Error('场景ID、名称、虚拟用户数和持续时间为必填项')
    }

    return new LoadTestScenario(this.config as LoadTestScenarioConfig)
  }
}
