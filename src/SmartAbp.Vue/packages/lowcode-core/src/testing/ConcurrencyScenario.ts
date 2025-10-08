/**
 * 🔥 并发测试场景配置
 * 
 * 功能：
 * 1. 定义并发测试场景
 * 2. 配置并发操作
 * 3. 管理共享资源
 * 4. 场景验证
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

/**
 * 并发操作类型
 */
export type ConcurrentOperationType = 
  | 'read'       // 读操作
  | 'write'      // 写操作
  | 'read-write' // 读写操作
  | 'atomic'     // 原子操作
  | 'custom'     // 自定义操作

/**
 * 期望的并发行为
 */
export type ExpectedBehavior = 
  | 'atomic'              // 原子性（操作不可分割）
  | 'eventual-consistent' // 最终一致性
  | 'isolated'           // 隔离性
  | 'serializable'       // 可串行化

/**
 * 并发操作定义
 */
export interface ConcurrentOperation {
  /** 操作ID */
  id: string
  /** 操作名称 */
  name: string
  /** 操作类型 */
  type: ConcurrentOperationType
  /** 操作函数 */
  action: () => Promise<any>
  /** 期望的并发行为 */
  expectedBehavior: ExpectedBehavior
  /** 操作超时时间（毫秒） */
  timeout: number
  /** 访问的共享资源 */
  sharedResources?: string[]
  /** 操作权重 */
  weight?: number
}

/**
 * 共享资源定义
 */
export interface SharedResource {
  /** 资源ID */
  id: string
  /** 资源名称 */
  name: string
  /** 资源类型 */
  type: 'data' | 'lock' | 'semaphore' | 'mutex' | 'custom'
  /** 初始值 */
  initialValue?: any
  /** 最大并发访问数 */
  maxConcurrentAccess?: number
}

/**
 * 并发测试场景配置
 */
export interface ConcurrencyTestScenarioConfig {
  /** 场景ID */
  id: string
  /** 场景名称 */
  name: string
  /** 场景描述 */
  description?: string
  /** 并发级别（同时执行的操作数） */
  concurrencyLevel: number
  /** 共享资源列表 */
  sharedResources: SharedResource[]
  /** 测试持续时间（秒） */
  testDuration: number
  /** 并发操作列表 */
  operations: ConcurrentOperation[]
  /** 是否检测竞态条件 */
  detectRaceConditions?: boolean
  /** 是否检测死锁 */
  detectDeadlocks?: boolean
  /** 是否启用详细日志 */
  verboseLogging?: boolean
}

/**
 * 并发测试场景
 */
export class ConcurrencyTestScenario {
  private config: ConcurrencyTestScenarioConfig
  private resourceMap: Map<string, SharedResource>
  private totalWeight: number = 0

  constructor(config: ConcurrencyTestScenarioConfig) {
    this.config = config
    this.resourceMap = new Map()
    this.validateConfig()
    this.buildResourceMap()
    this.calculateTotalWeight()
  }

  /**
   * 验证配置
   */
  private validateConfig(): void {
    if (!this.config.id || !this.config.name) {
      throw new Error('场景ID和名称不能为空')
    }

    if (this.config.concurrencyLevel <= 0) {
      throw new Error('并发级别必须大于0')
    }

    if (this.config.concurrencyLevel > 10000) {
      throw new Error('并发级别不能超过10000')
    }

    if (this.config.testDuration <= 0) {
      throw new Error('测试持续时间必须大于0')
    }

    if (!this.config.operations || this.config.operations.length === 0) {
      throw new Error('至少需要配置一个并发操作')
    }

    // 验证操作配置
    this.config.operations.forEach((operation, index) => {
      if (!operation.id || !operation.name) {
        throw new Error(`操作${index}的ID和名称不能为空`)
      }
      if (!operation.action || typeof operation.action !== 'function') {
        throw new Error(`操作${index}的action必须是一个函数`)
      }
      if (operation.timeout <= 0) {
        throw new Error(`操作${index}的超时时间必须大于0`)
      }
    })

    logger.info('✅ 并发场景配置验证通过', { scenarioId: this.config.id })
  }

  /**
   * 构建资源映射
   */
  private buildResourceMap(): void {
    this.config.sharedResources.forEach(resource => {
      this.resourceMap.set(resource.id, resource)
    })
  }

  /**
   * 计算总权重
   */
  private calculateTotalWeight(): void {
    this.totalWeight = this.config.operations.reduce(
      (sum, op) => sum + (op.weight || 1),
      0
    )
  }

  /**
   * 根据权重随机选择操作
   */
  selectOperation(): ConcurrentOperation {
    if (this.config.operations.length === 1) {
      const operation = this.config.operations[0]
      if (!operation) {
        throw new Error('操作列表不能为空')
      }
      return operation
    }

    const random = Math.random() * this.totalWeight
    let weightSum = 0

    for (const operation of this.config.operations) {
      weightSum += operation.weight || 1
      if (random <= weightSum) {
        return operation
      }
    }

    // 后备方案：返回第一个操作
    const fallbackOperation = this.config.operations[0]
    if (!fallbackOperation) {
      throw new Error('操作列表不能为空')
    }
    return fallbackOperation
  }

  /**
   * 获取共享资源
   */
  getSharedResource(resourceId: string): SharedResource | undefined {
    return this.resourceMap.get(resourceId)
  }

  /**
   * 获取所有共享资源
   */
  getAllSharedResources(): SharedResource[] {
    return this.config.sharedResources
  }

  /**
   * 检查操作是否访问共享资源
   */
  hasSharedResourceAccess(operation: ConcurrentOperation): boolean {
    return !!operation.sharedResources && operation.sharedResources.length > 0
  }

  /**
   * 获取访问相同资源的操作
   */
  getConflictingOperations(operation: ConcurrentOperation): ConcurrentOperation[] {
    if (!operation.sharedResources) {
      return []
    }

    return this.config.operations.filter(op => {
      if (op.id === operation.id || !op.sharedResources) {
        return false
      }
      // 检查是否有共享资源重叠
      return op.sharedResources.some(resource => 
        operation.sharedResources!.includes(resource)
      )
    })
  }

  /**
   * 获取场景配置
   */
  getConfig(): Readonly<ConcurrencyTestScenarioConfig> {
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
   * 获取并发级别
   */
  getConcurrencyLevel(): number {
    return this.config.concurrencyLevel
  }

  /**
   * 获取测试持续时间
   */
  getTestDuration(): number {
    return this.config.testDuration
  }

  /**
   * 是否检测竞态条件
   */
  shouldDetectRaceConditions(): boolean {
    return this.config.detectRaceConditions !== false
  }

  /**
   * 是否检测死锁
   */
  shouldDetectDeadlocks(): boolean {
    return this.config.detectDeadlocks !== false
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
    return `并发场景[${this.config.name}]: ${this.config.concurrencyLevel}并发, ${this.config.testDuration}秒, ${this.config.operations.length}个操作, ${this.config.sharedResources.length}个共享资源`
  }
}

/**
 * 并发场景构建器
 */
export class ConcurrencyTestScenarioBuilder {
  private config: Partial<ConcurrencyTestScenarioConfig> = {
    sharedResources: [],
    operations: [],
    detectRaceConditions: true,
    detectDeadlocks: true,
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
   * 设置并发级别
   */
  withConcurrencyLevel(level: number): this {
    this.config.concurrencyLevel = level
    return this
  }

  /**
   * 设置测试持续时间
   */
  withTestDuration(seconds: number): this {
    this.config.testDuration = seconds
    return this
  }

  /**
   * 添加共享资源
   */
  addSharedResource(resource: SharedResource): this {
    this.config.sharedResources!.push(resource)
    return this
  }

  /**
   * 添加并发操作
   */
  addOperation(operation: ConcurrentOperation): this {
    this.config.operations!.push(operation)
    return this
  }

  /**
   * 启用竞态条件检测
   */
  withRaceConditionDetection(enabled: boolean = true): this {
    this.config.detectRaceConditions = enabled
    return this
  }

  /**
   * 启用死锁检测
   */
  withDeadlockDetection(enabled: boolean = true): this {
    this.config.detectDeadlocks = enabled
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
  build(): ConcurrencyTestScenario {
    if (!this.config.id || !this.config.name || 
        this.config.concurrencyLevel === undefined || 
        this.config.testDuration === undefined) {
      throw new Error('场景ID、名称、并发级别和测试持续时间为必填项')
    }

    return new ConcurrencyTestScenario(this.config as ConcurrencyTestScenarioConfig)
  }
}
