/**
 * 🔥 性能基线管理
 * 
 * 功能：
 * 1. 存储性能基线数据
 * 2. 管理基线版本
 * 3. 基线数据序列化
 * 4. 基线对比和验证
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 平均响应时间（毫秒） */
  averageResponseTime: number
  /** 最小响应时间（毫秒） */
  minResponseTime: number
  /** 最大响应时间（毫秒） */
  maxResponseTime: number
  /** P50响应时间（毫秒） */
  p50ResponseTime: number
  /** P95响应时间（毫秒） */
  p95ResponseTime: number
  /** P99响应时间（毫秒） */
  p99ResponseTime: number
  /** 吞吐量（请求/秒） */
  throughput: number
  /** 成功率（%） */
  successRate: number
  /** 错误率（%） */
  errorRate: number
  /** 内存使用（MB） */
  memoryUsage?: number
  /** CPU使用率（%） */
  cpuUsage?: number
}

/**
 * 基准场景
 */
export interface BaselineScenario {
  /** 场景ID */
  id: string
  /** 场景名称 */
  name: string
  /** 场景描述 */
  description?: string
  /** 性能指标 */
  metrics: PerformanceMetrics
}

/**
 * 性能基线
 */
export interface PerformanceBaseline {
  /** 基线ID */
  id: string
  /** 基线名称 */
  name: string
  /** 版本号 */
  version: string
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
  /** 环境信息 */
  environment: {
    os: string
    nodeVersion: string
    cpuModel?: string
    memory?: string
  }
  /** 场景列表 */
  scenarios: BaselineScenario[]
  /** 元数据 */
  metadata?: Record<string, any>
}

/**
 * 基线存储接口
 */
export interface BaselineStorage {
  /** 保存基线 */
  save(baseline: PerformanceBaseline): Promise<void>
  /** 加载基线 */
  load(id: string): Promise<PerformanceBaseline | null>
  /** 列出所有基线 */
  list(): Promise<PerformanceBaseline[]>
  /** 删除基线 */
  delete(id: string): Promise<void>
}

/**
 * 内存存储实现
 */
export class MemoryBaselineStorage implements BaselineStorage {
  private baselines: Map<string, PerformanceBaseline> = new Map()

  async save(baseline: PerformanceBaseline): Promise<void> {
    this.baselines.set(baseline.id, baseline)
    logger.info('✅ 基线已保存到内存', { id: baseline.id, version: baseline.version })
  }

  async load(id: string): Promise<PerformanceBaseline | null> {
    return this.baselines.get(id) || null
  }

  async list(): Promise<PerformanceBaseline[]> {
    return Array.from(this.baselines.values())
  }

  async delete(id: string): Promise<void> {
    this.baselines.delete(id)
    logger.info('✅ 基线已从内存删除', { id })
  }

  clear(): void {
    this.baselines.clear()
  }
}

/**
 * LocalStorage存储实现
 */
export class LocalStorageBaselineStorage implements BaselineStorage {
  private readonly storageKey = 'smartabp_performance_baselines'

  async save(baseline: PerformanceBaseline): Promise<void> {
    try {
      const baselines = await this.loadAll()
      const index = baselines.findIndex(b => b.id === baseline.id)
      
      if (index >= 0) {
        baselines[index] = baseline
      } else {
        baselines.push(baseline)
      }

      localStorage.setItem(this.storageKey, JSON.stringify(baselines))
      logger.info('✅ 基线已保存到LocalStorage', { id: baseline.id, version: baseline.version })
    } catch (error) {
      logger.error('❌ 保存基线失败', error)
      throw error
    }
  }

  async load(id: string): Promise<PerformanceBaseline | null> {
    const baselines = await this.loadAll()
    const baseline = baselines.find(b => b.id === id)
    
    if (baseline) {
      // 转换日期字符串为Date对象
      baseline.createdAt = new Date(baseline.createdAt)
      baseline.updatedAt = new Date(baseline.updatedAt)
    }
    
    return baseline || null
  }

  async list(): Promise<PerformanceBaseline[]> {
    const baselines = await this.loadAll()
    
    // 转换日期字符串为Date对象
    return baselines.map(baseline => ({
      ...baseline,
      createdAt: new Date(baseline.createdAt),
      updatedAt: new Date(baseline.updatedAt)
    }))
  }

  async delete(id: string): Promise<void> {
    const baselines = await this.loadAll()
    const filtered = baselines.filter(b => b.id !== id)
    
    localStorage.setItem(this.storageKey, JSON.stringify(filtered))
    logger.info('✅ 基线已从LocalStorage删除', { id })
  }

  private async loadAll(): Promise<PerformanceBaseline[]> {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (error) {
      logger.error('❌ 加载基线失败', error)
      return []
    }
  }
}

/**
 * 性能基线管理器
 */
export class PerformanceBaselineManager {
  private storage: BaselineStorage

  constructor(storage?: BaselineStorage) {
    this.storage = storage || new MemoryBaselineStorage()
  }

  /**
   * 创建基线
   */
  async createBaseline(config: {
    id: string
    name: string
    version: string
    scenarios: BaselineScenario[]
    metadata?: Record<string, any>
  }): Promise<PerformanceBaseline> {
    const baseline: PerformanceBaseline = {
      id: config.id,
      name: config.name,
      version: config.version,
      createdAt: new Date(),
      updatedAt: new Date(),
      environment: this.getEnvironmentInfo(),
      scenarios: config.scenarios,
      metadata: config.metadata
    }

    await this.storage.save(baseline)
    
    logger.info('✅ 性能基线已创建', {
      id: baseline.id,
      version: baseline.version,
      scenarios: baseline.scenarios.length
    })

    return baseline
  }

  /**
   * 更新基线
   */
  async updateBaseline(id: string, updates: {
    name?: string
    version?: string
    scenarios?: BaselineScenario[]
    metadata?: Record<string, any>
  }): Promise<PerformanceBaseline | null> {
    const baseline = await this.storage.load(id)
    
    if (!baseline) {
      logger.warn('⚠️ 基线不存在', { id })
      return null
    }

    const updated: PerformanceBaseline = {
      ...baseline,
      name: updates.name ?? baseline.name,
      version: updates.version ?? baseline.version,
      scenarios: updates.scenarios ?? baseline.scenarios,
      metadata: updates.metadata ?? baseline.metadata,
      updatedAt: new Date()
    }

    await this.storage.save(updated)
    
    logger.info('✅ 性能基线已更新', { id, version: updated.version })

    return updated
  }

  /**
   * 获取基线
   */
  async getBaseline(id: string): Promise<PerformanceBaseline | null> {
    return await this.storage.load(id)
  }

  /**
   * 列出所有基线
   */
  async listBaselines(): Promise<PerformanceBaseline[]> {
    return await this.storage.list()
  }

  /**
   * 删除基线
   */
  async deleteBaseline(id: string): Promise<void> {
    await this.storage.delete(id)
  }

  /**
   * 查找最新版本的基线
   */
  async findLatestBaseline(name: string): Promise<PerformanceBaseline | null> {
    const baselines = await this.storage.list()
    const filtered = baselines.filter(b => b.name === name)
    
    if (filtered.length === 0) {
      return null
    }

    // 按更新时间排序，返回最新的
    filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    
    return filtered[0]
  }

  /**
   * 导出基线（JSON）
   */
  exportBaseline(baseline: PerformanceBaseline): string {
    return JSON.stringify(baseline, null, 2)
  }

  /**
   * 导入基线（JSON）
   */
  async importBaseline(json: string): Promise<PerformanceBaseline> {
    const baseline: PerformanceBaseline = JSON.parse(json)
    
    // 转换日期字符串
    baseline.createdAt = new Date(baseline.createdAt)
    baseline.updatedAt = new Date(baseline.updatedAt)
    
    await this.storage.save(baseline)
    
    logger.info('✅ 基线已导入', { id: baseline.id, version: baseline.version })
    
    return baseline
  }

  /**
   * 获取环境信息
   */
  private getEnvironmentInfo(): PerformanceBaseline['environment'] {
    return {
      os: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
      nodeVersion: typeof process !== 'undefined' ? process.version : 'Unknown',
      cpuModel: typeof navigator !== 'undefined' ? (navigator as any).hardwareConcurrency?.toString() : undefined,
      memory: typeof performance !== 'undefined' && (performance as any).memory 
        ? `${Math.round((performance as any).memory.jsHeapSizeLimit / 1048576)}MB`
        : undefined
    }
  }
}
