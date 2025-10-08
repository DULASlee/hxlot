/**
 * 🔥 竞态条件检测器
 * 
 * 功能：
 * 1. 检测数据竞争
 * 2. 检测死锁
 * 3. 检测锁竞争
 * 4. 分析并发问题
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

/**
 * 资源访问记录
 */
export interface ResourceAccessRecord {
  /** 资源ID */
  resourceId: string
  /** 操作ID */
  operationId: string
  /** 访问类型 */
  accessType: 'read' | 'write'
  /** 访问时间戳 */
  timestamp: number
  /** 线程/任务ID */
  threadId: string
}

/**
 * 竞态条件
 */
export interface RaceCondition {
  /** 竞态条件ID */
  id: string
  /** 涉及的资源 */
  resourceId: string
  /** 涉及的操作 */
  operations: string[]
  /** 冲突的访问记录 */
  conflictingAccesses: ResourceAccessRecord[]
  /** 检测时间 */
  detectedAt: Date
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high' | 'critical'
  /** 描述 */
  description: string
}

/**
 * 死锁
 */
export interface Deadlock {
  /** 死锁ID */
  id: string
  /** 涉及的操作 */
  operations: string[]
  /** 涉及的资源 */
  resources: string[]
  /** 等待链 */
  waitChain: Array<{ operation: string; waitingFor: string }>
  /** 检测时间 */
  detectedAt: Date
  /** 描述 */
  description: string
}

/**
 * 锁竞争
 */
export interface LockContention {
  /** 资源ID */
  resourceId: string
  /** 竞争次数 */
  contentionCount: number
  /** 平均等待时间（毫秒） */
  averageWaitTime: number
  /** 最大等待时间（毫秒） */
  maxWaitTime: number
  /** 涉及的操作 */
  operations: string[]
}

/**
 * 竞态条件检测结果
 */
export interface RaceDetectionResult {
  /** 检测到的竞态条件 */
  raceConditions: RaceCondition[]
  /** 检测到的死锁 */
  deadlocks: Deadlock[]
  /** 检测到的锁竞争 */
  lockContentions: LockContention[]
  /** 总体风险级别 */
  overallRisk: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  /** 建议 */
  recommendations: string[]
}

/**
 * 竞态条件检测器
 */
export class RaceConditionDetector {
  private accessRecords: Map<string, ResourceAccessRecord[]>
  private operationTimeouts: Map<string, number>
  private resourceWaitChain: Map<string, Set<string>>
  private raceConditions: RaceCondition[]
  private deadlocks: Deadlock[]
  private lockContentions: Map<string, LockContention>

  constructor() {
    this.accessRecords = new Map()
    this.operationTimeouts = new Map()
    this.resourceWaitChain = new Map()
    this.raceConditions = []
    this.deadlocks = []
    this.lockContentions = new Map()
  }

  /**
   * 记录资源访问
   */
  recordAccess(record: ResourceAccessRecord): void {
    const records = this.accessRecords.get(record.resourceId) || []
    records.push(record)
    this.accessRecords.set(record.resourceId, records)

    // 检测竞态条件
    this.detectRaceCondition(record)
  }

  /**
   * 检测竞态条件
   */
  private detectRaceCondition(currentAccess: ResourceAccessRecord): void {
    const records = this.accessRecords.get(currentAccess.resourceId)
    if (!records || records.length < 2) {
      return
    }

    // 查找时间窗口内的冲突访问（最近100ms）
    const timeWindow = 100
    const recentRecords = records.filter(r => 
      r.timestamp >= currentAccess.timestamp - timeWindow &&
      r.timestamp <= currentAccess.timestamp &&
      r.threadId !== currentAccess.threadId
    )

    // 检测写-写冲突或读-写冲突
    const conflicts = recentRecords.filter(r => {
      return (r.accessType === 'write' && currentAccess.accessType === 'write') ||
             (r.accessType === 'write' || currentAccess.accessType === 'write')
    })

    if (conflicts.length > 0) {
      const raceCondition: RaceCondition = {
        id: `race-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        resourceId: currentAccess.resourceId,
        operations: Array.from(new Set([
          ...conflicts.map(c => c.operationId),
          currentAccess.operationId
        ])),
        conflictingAccesses: [...conflicts, currentAccess],
        detectedAt: new Date(),
        severity: this.calculateSeverity(conflicts.length, currentAccess.accessType),
        description: `检测到${conflicts.length + 1}个操作同时访问资源 ${currentAccess.resourceId}，可能存在数据竞争`
      }

      this.raceConditions.push(raceCondition)

      logger.warn('⚠️ 检测到竞态条件', {
        resourceId: currentAccess.resourceId,
        operations: raceCondition.operations,
        severity: raceCondition.severity
      })
    }
  }

  /**
   * 计算严重程度
   */
  private calculateSeverity(conflictCount: number, accessType: 'read' | 'write'): RaceCondition['severity'] {
    if (accessType === 'write' && conflictCount >= 5) return 'critical'
    if (accessType === 'write' && conflictCount >= 3) return 'high'
    if (accessType === 'write' || conflictCount >= 5) return 'medium'
    return 'low'
  }

  /**
   * 记录操作等待资源
   */
  recordWait(operationId: string, resourceId: string): void {
    const waitSet = this.resourceWaitChain.get(operationId) || new Set()
    waitSet.add(resourceId)
    this.resourceWaitChain.set(operationId, waitSet)

    // 检测死锁
    this.detectDeadlock(operationId)
  }

  /**
   * 检测死锁
   */
  private detectDeadlock(startOperation: string): void {
    const visited = new Set<string>()
    const path: string[] = []

    const hasCycle = (operation: string): boolean => {
      if (path.includes(operation)) {
        // 发现循环，即死锁
        const cycleStart = path.indexOf(operation)
        const cycle = path.slice(cycleStart)
        this.reportDeadlock(cycle)
        return true
      }

      if (visited.has(operation)) {
        return false
      }

      visited.add(operation)
      path.push(operation)

      const waitingFor = this.resourceWaitChain.get(operation)
      if (waitingFor) {
        for (const resource of waitingFor) {
          // 查找持有该资源的操作
          for (const [op, resources] of this.resourceWaitChain.entries()) {
            if (op !== operation && resources.has(resource)) {
              if (hasCycle(op)) {
                return true
              }
            }
          }
        }
      }

      path.pop()
      return false
    }

    hasCycle(startOperation)
  }

  /**
   * 报告死锁
   */
  private reportDeadlock(cycle: string[]): void {
    const waitChain = cycle.map((op, index) => ({
      operation: op,
      waitingFor: cycle[(index + 1) % cycle.length] || 'unknown' // 添加默认值防止undefined
    }))

    const deadlock: Deadlock = {
      id: `deadlock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      operations: cycle,
      resources: [],
      waitChain,
      detectedAt: new Date(),
      description: `检测到死锁：${cycle.length}个操作形成循环等待`
    }

    // 收集涉及的资源
    for (const op of cycle) {
      const resources = this.resourceWaitChain.get(op)
      if (resources) {
        deadlock.resources.push(...Array.from(resources))
      }
    }

    this.deadlocks.push(deadlock)

    logger.error('🚨 检测到死锁', {
      operations: cycle,
      resources: deadlock.resources
    })
  }

  /**
   * 记录锁竞争
   */
  recordLockContention(resourceId: string, operationId: string, waitTime: number): void {
    const contention = this.lockContentions.get(resourceId) || {
      resourceId,
      contentionCount: 0,
      averageWaitTime: 0,
      maxWaitTime: 0,
      operations: []
    }

    contention.contentionCount++
    contention.averageWaitTime = 
      (contention.averageWaitTime * (contention.contentionCount - 1) + waitTime) / contention.contentionCount
    contention.maxWaitTime = Math.max(contention.maxWaitTime, waitTime)
    
    if (!contention.operations.includes(operationId)) {
      contention.operations.push(operationId)
    }

    this.lockContentions.set(resourceId, contention)
  }

  /**
   * 获取检测结果
   */
  getDetectionResult(): RaceDetectionResult {
    const overallRisk = this.calculateOverallRisk()
    const recommendations = this.generateRecommendations()

    return {
      raceConditions: [...this.raceConditions],
      deadlocks: [...this.deadlocks],
      lockContentions: Array.from(this.lockContentions.values()),
      overallRisk,
      recommendations
    }
  }

  /**
   * 计算总体风险级别
   */
  private calculateOverallRisk(): RaceDetectionResult['overallRisk'] {
    if (this.deadlocks.length > 0) return 'critical'
    
    const criticalRaces = this.raceConditions.filter(r => r.severity === 'critical').length
    if (criticalRaces > 0) return 'critical'
    
    const highRaces = this.raceConditions.filter(r => r.severity === 'high').length
    if (highRaces > 2) return 'high'
    if (highRaces > 0) return 'medium'
    
    const mediumRaces = this.raceConditions.filter(r => r.severity === 'medium').length
    if (mediumRaces > 5) return 'medium'
    if (mediumRaces > 0) return 'low'
    
    return 'safe'
  }

  /**
   * 生成建议
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    if (this.deadlocks.length > 0) {
      recommendations.push('检测到死锁！建议：')
      recommendations.push('- 确保所有操作按相同顺序获取锁')
      recommendations.push('- 使用超时机制避免无限等待')
      recommendations.push('- 考虑使用死锁检测和恢复机制')
    }

    const criticalRaces = this.raceConditions.filter(r => r.severity === 'critical' || r.severity === 'high')
    if (criticalRaces.length > 0) {
      recommendations.push('检测到严重的竞态条件！建议：')
      recommendations.push('- 使用互斥锁保护共享资源')
      recommendations.push('- 使用原子操作处理关键数据')
      recommendations.push('- 考虑使用无锁数据结构')
    }

    const highContentions = Array.from(this.lockContentions.values())
      .filter(c => c.averageWaitTime > 100)
    if (highContentions.length > 0) {
      recommendations.push('检测到高锁竞争！建议：')
      recommendations.push('- 减少临界区代码量')
      recommendations.push('- 使用更细粒度的锁')
      recommendations.push('- 考虑使用读写锁分离读写操作')
    }

    if (recommendations.length === 0) {
      recommendations.push('未检测到严重的并发问题，系统运行良好')
    }

    return recommendations
  }

  /**
   * 清空检测数据
   */
  clear(): void {
    this.accessRecords.clear()
    this.operationTimeouts.clear()
    this.resourceWaitChain.clear()
    this.raceConditions = []
    this.deadlocks = []
    this.lockContentions.clear()
  }

  /**
   * 获取竞态条件数量
   */
  getRaceConditionCount(): number {
    return this.raceConditions.length
  }

  /**
   * 获取死锁数量
   */
  getDeadlockCount(): number {
    return this.deadlocks.length
  }

  /**
   * 获取锁竞争数量
   */
  getLockContentionCount(): number {
    return this.lockContentions.size
  }
}
