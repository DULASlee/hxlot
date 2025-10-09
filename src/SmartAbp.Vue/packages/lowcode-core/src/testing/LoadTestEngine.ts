/**
 * 🔥 负载测试引擎
 * 
 * 功能：
 * 1. 执行负载测试
 * 2. 管理虚拟用户
 * 3. 收集性能数据
 * 4. 生成测试报告
 * 
 * 集成现有的PerformanceOptimizer进行性能分析
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'
import { PerformanceOptimizer } from './analyzers/PerformanceOptimizer'
import { LoadTestScenario } from './LoadTestScenario'
import { VirtualUser, type RequestResult, type VirtualUserStats } from './VirtualUser'

const logger = getGlobalLogger()

/**
 * 测试进度
 */
export interface TestProgress {
  /** 当前阶段 */
  phase: 'preparing' | 'ramping-up' | 'steady-state' | 'ramping-down' | 'completed' | 'error'
  /** 已启动的虚拟用户数 */
  activeUsers: number
  /** 总虚拟用户数 */
  totalUsers: number
  /** 已完成的请求数 */
  completedRequests: number
  /** 成功的请求数 */
  successfulRequests: number
  /** 失败的请求数 */
  failedRequests: number
  /** 平均响应时间 */
  averageResponseTime: number
  /** 已运行时间（秒） */
  elapsedTime: number
  /** 剩余时间（秒） */
  remainingTime: number
  /** 进度百分比 */
  progressPercent: number
}

/**
 * 负载测试结果
 */
export interface LoadTestResult {
  /** 测试场景ID */
  scenarioId: string
  /** 测试场景名称 */
  scenarioName: string
  /** 开始时间 */
  startTime: Date
  /** 结束时间 */
  endTime: Date
  /** 测试持续时间（秒） */
  duration: number
  /** 虚拟用户统计 */
  userStats: VirtualUserStats[]
  /** 总体统计 */
  overallStats: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    successRate: number
    averageResponseTime: number
    minResponseTime: number
    maxResponseTime: number
    p50ResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    requestsPerSecond: number
    bytesReceived: number
  }
  /** 错误统计 */
  errorStats: {
    errorType: string
    count: number
    percentage: number
  }[]
  /** 性能分析报告（来自PerformanceOptimizer） */
  performanceReport?: any
}

/**
 * 负载测试引擎
 */
export class LoadTestEngine {
  private performanceOptimizer: PerformanceOptimizer
  private scenario: LoadTestScenario | null = null
  private virtualUsers: VirtualUser[] = []
  private isRunning: boolean = false
  private startTime: Date | null = null
  private allResults: RequestResult[] = []
  private progressInterval: number | null = null

  constructor(performanceOptimizer?: PerformanceOptimizer) {
    this.performanceOptimizer = performanceOptimizer || new PerformanceOptimizer()
  }

  /**
   * 执行负载测试
   */
  async executeLoadTest(scenario: LoadTestScenario): Promise<LoadTestResult> {
    logger.info('🚀 开始负载测试', { scenario: scenario.getSummary() })

    this.scenario = scenario
    this.isRunning = true
    this.startTime = new Date()
    this.allResults = []

    try {
      // 阶段1: 准备虚拟用户
      await this.prepareVirtualUsers()

      // 阶段2: 预热（逐步启动用户）
      await this.rampUp()

      // 阶段3: 稳定状态测试
      await this.steadyState()

      // 阶段4: 降温（逐步停止用户）
      await this.rampDown()

      // 生成测试结果
      const result = await this.generateResult()

      logger.info('✅ 负载测试完成', {
        totalRequests: result.overallStats.totalRequests,
        successRate: `${result.overallStats.successRate.toFixed(2)}%`
      })

      return result

    } catch (error) {
      logger.error('❌ 负载测试失败', error)
      throw error
    } finally {
      this.stopTest()
    }
  }

  /**
   * 准备虚拟用户
   */
  private async prepareVirtualUsers(): Promise<void> {
    if (!this.scenario) return

    logger.info('📋 准备虚拟用户...', { count: this.scenario.getVirtualUsers() })

    this.virtualUsers = []
    for (let i = 0; i < this.scenario.getVirtualUsers(); i++) {
      const user = new VirtualUser({
        userId: `user-${i + 1}`,
        thinkTime: this.scenario.getThinkTime(),
        verboseLogging: this.scenario.isVerboseLogging()
      })
      this.virtualUsers.push(user)
    }

    logger.info('✅ 虚拟用户准备完成', { count: this.virtualUsers.length })
  }

  /**
   * 预热阶段（逐步启动用户）
   */
  private async rampUp(): Promise<void> {
    if (!this.scenario) return

    const rampUpTime = this.scenario.getRampUpTime()
    if (rampUpTime === 0) {
      // 没有预热时间，直接全部启动
      await Promise.all(this.virtualUsers.map(user => this.runUser(user)))
      return
    }

    logger.info('🔥 开始预热阶段...', { duration: `${rampUpTime}秒` })

    const usersPerSecond = this.virtualUsers.length / rampUpTime
    let startedUsers = 0

    for (let second = 0; second < rampUpTime && this.isRunning; second++) {
      const targetUsers = Math.floor((second + 1) * usersPerSecond)
      const usersToStart = targetUsers - startedUsers

      // 启动用户
      for (let i = 0; i < usersToStart && startedUsers < this.virtualUsers.length; i++) {
        const user = this.virtualUsers[startedUsers]
        if (user) { // 添加undefined检查
          this.runUser(user) // 不等待，异步启动
          startedUsers++
        }
      }

      // 等待1秒
      await this.sleep(1000)
    }

    logger.info('✅ 预热完成', { activeUsers: startedUsers })
  }

  /**
   * 稳定状态测试
   */
  private async steadyState(): Promise<void> {
    if (!this.scenario) return

    const rampUpTime = this.scenario.getRampUpTime()
    const duration = this.scenario.getDuration()
    const steadyDuration = duration - rampUpTime

    if (steadyDuration <= 0) return

    logger.info('⚡ 稳定状态测试...', { duration: `${steadyDuration}秒` })

    // 等待稳定状态测试完成
    await this.sleep(steadyDuration * 1000)
  }

  /**
   * 降温阶段
   */
  private async rampDown(): Promise<void> {
    logger.info('🔻 开始降温阶段...')
    
    // 停止所有虚拟用户
    this.virtualUsers.forEach(user => user.stop())
    
    // 等待所有用户停止
    await this.sleep(1000)
    
    logger.info('✅ 降温完成')
  }

  /**
   * 运行单个虚拟用户
   */
  private async runUser(user: VirtualUser): Promise<void> {
    if (!this.scenario) return

    user.setRunning(true)

    while (this.isRunning && user.isActive()) {
      try {
        // 选择端点
        const endpoint = this.scenario.selectEndpoint()

        // 执行请求
        const result = await user.executeWithRetry(endpoint)

        // 收集结果
        this.allResults.push(result)

        // 思考时间
        await user.think()

      } catch (error) {
        logger.error(`用户[${user.getUserId()}]执行失败`, error)
      }
    }

    user.setRunning(false)
  }

  /**
   * 生成测试结果
   */
  private async generateResult(): Promise<LoadTestResult> {
    if (!this.scenario || !this.startTime) {
      throw new Error('测试未运行')
    }

    const endTime = new Date()
    const duration = (endTime.getTime() - this.startTime.getTime()) / 1000

    // 收集用户统计
    const userStats = this.virtualUsers.map(user => user.getStats())

    // 计算总体统计
    const allResponseTimes = this.allResults.map(r => r.responseTime)
    const successfulResults = this.allResults.filter(r => r.success)
    const failedResults = this.allResults.filter(r => !r.success)

    // 计算百分位数
    const sortedTimes = [...allResponseTimes].sort((a, b) => a - b)
    const p50Index = Math.floor(sortedTimes.length * 0.5)
    const p95Index = Math.floor(sortedTimes.length * 0.95)
    const p99Index = Math.floor(sortedTimes.length * 0.99)

    const overallStats = {
      totalRequests: this.allResults.length,
      successfulRequests: successfulResults.length,
      failedRequests: failedResults.length,
      successRate: (successfulResults.length / this.allResults.length) * 100,
      averageResponseTime: allResponseTimes.reduce((sum, t) => sum + t, 0) / allResponseTimes.length,
      minResponseTime: Math.min(...allResponseTimes),
      maxResponseTime: Math.max(...allResponseTimes),
      p50ResponseTime: sortedTimes[p50Index] || 0,
      p95ResponseTime: sortedTimes[p95Index] || 0,
      p99ResponseTime: sortedTimes[p99Index] || 0,
      requestsPerSecond: this.allResults.length / duration,
      bytesReceived: this.allResults.reduce((sum, r) => sum + r.responseSize, 0)
    }

    // 统计错误
    const errorMap = new Map<string, number>()
    failedResults.forEach(result => {
      const errorType = result.error || `HTTP ${result.status}`
      errorMap.set(errorType, (errorMap.get(errorType) || 0) + 1)
    })

    const errorStats = Array.from(errorMap.entries()).map(([errorType, count]) => ({
      errorType,
      count,
      percentage: (count / failedResults.length) * 100
    }))

    // 集成PerformanceOptimizer分析
    let performanceReport
    try {
      performanceReport = await this.performanceOptimizer.analyze()
    } catch (error) {
      logger.warn('性能分析失败', error)
    }

    return {
      scenarioId: this.scenario.getId(),
      scenarioName: this.scenario.getName(),
      startTime: this.startTime,
      endTime,
      duration,
      userStats,
      overallStats,
      errorStats,
      performanceReport
    }
  }

  /**
   * 获取测试进度
   */
  getProgress(): TestProgress {
    if (!this.scenario || !this.startTime) {
      return {
        phase: 'preparing',
        activeUsers: 0,
        totalUsers: 0,
        completedRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        elapsedTime: 0,
        remainingTime: 0,
        progressPercent: 0
      }
    }

    const now = Date.now()
    const elapsedTime = (now - this.startTime.getTime()) / 1000
    const duration = this.scenario.getDuration()
    const remainingTime = Math.max(0, duration - elapsedTime)
    const progressPercent = Math.min(100, (elapsedTime / duration) * 100)

    // 确定当前阶段
    let phase: TestProgress['phase'] = 'steady-state'
    const rampUpTime = this.scenario.getRampUpTime()
    
    if (elapsedTime < rampUpTime) {
      phase = 'ramping-up'
    } else if (elapsedTime >= duration) {
      phase = 'completed'
    }

    const activeUsers = this.virtualUsers.filter(u => u.isActive()).length
    const completedRequests = this.allResults.length
    const successfulRequests = this.allResults.filter(r => r.success).length
    const failedRequests = this.allResults.filter(r => !r.success).length
    const allResponseTimes = this.allResults.map(r => r.responseTime)
    const averageResponseTime = allResponseTimes.length > 0
      ? allResponseTimes.reduce((sum, t) => sum + t, 0) / allResponseTimes.length
      : 0

    return {
      phase,
      activeUsers,
      totalUsers: this.scenario.getVirtualUsers(),
      completedRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      elapsedTime,
      remainingTime,
      progressPercent
    }
  }

  /**
   * 停止测试
   */
  async stopTest(): Promise<void> {
    logger.info('🛑 停止负载测试...')

    this.isRunning = false

    // 停止所有虚拟用户
    this.virtualUsers.forEach(user => user.stop())

    // 清理
    this.virtualUsers = []
    this.scenario = null

    if (this.progressInterval !== null) {
      clearInterval(this.progressInterval)
      this.progressInterval = null
    }

    logger.info('✅ 测试已停止')
  }

  /**
   * 是否正在运行
   */
  isTestRunning(): boolean {
    return this.isRunning
  }

  /**
   * 睡眠
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
