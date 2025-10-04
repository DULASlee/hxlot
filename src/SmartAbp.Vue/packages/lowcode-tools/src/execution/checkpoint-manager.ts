/**
 * AI编程铁律执行引擎 v7.0 - 检查点管理器
 * 
 * @file checkpoint-manager.ts
 * @description 负责检查点的创建、存储、恢复和清理，实现失败恢复机制的核心功能
 * @author 世界顶级低代码引擎架构师
 * @date 2025-10-04
 * @version 1.0.0
 */

import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import { v4 as uuidv4 } from 'uuid'
import {
  ExecutionCheckpoint,
  CheckpointFilter,
  CheckpointQueryResult,
  CheckpointStatistics,
  RecoveryResult,
  CheckpointStatus,
  ExecutionStage
} from './types'

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const readdir = promisify(fs.readdir)
const unlink = promisify(fs.unlink)
const mkdir = promisify(fs.mkdir)
const stat = promisify(fs.stat)

/**
 * 检查点管理器配置
 */
export interface CheckpointManagerConfig {
  storageDir?: string               // 存储目录
  maxCheckpoints?: number           // 最大保留检查点数
  compressionEnabled?: boolean      // 是否启用压缩
  encryptionEnabled?: boolean       // 是否启用加密
}

/**
 * 检查点管理器
 * 
 * @description 管理执行引擎的检查点，支持失败恢复、状态持久化和历史追踪
 * 
 * @example
 * ```typescript
 * const manager = new CheckpointManager({
 *   storageDir: '.ai-engine/checkpoints',
 *   maxCheckpoints: 10
 * })
 * 
 * // 保存检查点
 * const checkpoint = await manager.save({
 *   id: uuidv4(),
 *   stage: ExecutionStage.STAGE3_INCREMENTAL_CODING,
 *   timestamp: new Date(),
 *   status: CheckpointStatus.IN_PROGRESS,
 *   context: { completedSteps: ['step1', 'step2'] },
 *   artifacts: { modifiedFiles: ['file.ts'], generatedCode: 100 },
 *   recovery: { retryable: true, autoFixAvailable: false }
 * })
 * 
 * // 恢复检查点
 * const result = await manager.restore(checkpoint.id)
 * ```
 */
export class CheckpointManager {
  private config: Required<CheckpointManagerConfig>
  private readonly DEFAULT_STORAGE_DIR = '.ai-engine/checkpoints'
  private readonly DEFAULT_MAX_CHECKPOINTS = 10
  
  /**
   * 构造函数
   * @param config 配置选项
   */
  constructor(config: CheckpointManagerConfig = {}) {
    this.config = {
      storageDir: config.storageDir || this.DEFAULT_STORAGE_DIR,
      maxCheckpoints: config.maxCheckpoints || this.DEFAULT_MAX_CHECKPOINTS,
      compressionEnabled: config.compressionEnabled || false,
      encryptionEnabled: config.encryptionEnabled || false
    }
  }
  
  /**
   * 初始化存储目录
   * @private
   */
  private async ensureStorageDir(): Promise<void> {
    try {
      await stat(this.config.storageDir)
    } catch (error) {
      // 目录不存在，创建它
      await mkdir(this.config.storageDir, { recursive: true })
    }
  }
  
  /**
   * 获取检查点文件路径
   * @param checkpointId 检查点ID
   * @returns 文件路径
   * @private
   */
  private getCheckpointPath(checkpointId: string): string {
    return path.join(this.config.storageDir, `${checkpointId}.json`)
  }
  
  /**
   * 生成新的检查点ID
   * @returns 检查点ID
   */
  public generateId(): string {
    return uuidv4()
  }
  
  /**
   * 保存检查点
   * 
   * @param checkpoint 检查点数据
   * @returns 保存的检查点
   * 
   * @throws {Error} 如果保存失败
   * 
   * @example
   * ```typescript
   * const checkpoint = await manager.save({
   *   id: manager.generateId(),
   *   stage: ExecutionStage.STAGE4_QUALITY_GATES,
   *   timestamp: new Date(),
   *   status: CheckpointStatus.COMPLETED,
   *   context: { completedSteps: ['gate1', 'gate2', 'gate3'] },
   *   artifacts: { modifiedFiles: [], generatedCode: 0, qualityScore: 95 },
   *   recovery: { retryable: false, autoFixAvailable: false }
   * })
   * console.log('✅ 检查点已保存:', checkpoint.id)
   * ```
   */
  public async save(checkpoint: ExecutionCheckpoint): Promise<ExecutionCheckpoint> {
    const startTime = Date.now()
    
    try {
      // 确保存储目录存在
      await this.ensureStorageDir()
      
      // 验证检查点数据
      this.validateCheckpoint(checkpoint)
      
      // 序列化检查点数据
      const data = JSON.stringify(checkpoint, null, 2)
      
      // 写入文件
      const filePath = this.getCheckpointPath(checkpoint.id)
      await writeFile(filePath, data, 'utf-8')
      
      const duration = Date.now() - startTime
      console.log(`✅ 检查点已保存: ${checkpoint.id} (耗时: ${duration}ms)`)
      console.log(`   阶段: ${checkpoint.stage}`)
      console.log(`   状态: ${checkpoint.status}`)
      console.log(`   文件: ${filePath}`)
      
      // 清理旧检查点
      await this.cleanup()
      
      return checkpoint
    } catch (error) {
      console.error(`❌ 保存检查点失败: ${checkpoint.id}`, error)
      throw new Error(`Failed to save checkpoint: ${(error as Error).message}`)
    }
  }
  
  /**
   * 恢复检查点
   * 
   * @param checkpointId 检查点ID
   * @returns 恢复结果
   * 
   * @throws {Error} 如果检查点不存在或恢复失败
   * 
   * @example
   * ```typescript
   * const result = await manager.restore('checkpoint-id-123')
   * if (result.success) {
   *   console.log('✅ 检查点恢复成功')
   *   console.log('恢复的上下文:', result.restoredContext)
   * }
   * ```
   */
  public async restore(checkpointId: string): Promise<RecoveryResult> {
    const startTime = Date.now()
    
    try {
      console.log(`🔄 正在恢复检查点: ${checkpointId}`)
      
      // 读取检查点文件
      const filePath = this.getCheckpointPath(checkpointId)
      const data = await readFile(filePath, 'utf-8')
      
      // 解析检查点数据
      const checkpoint: ExecutionCheckpoint = JSON.parse(data)
      
      // 恢复日期对象
      checkpoint.timestamp = new Date(checkpoint.timestamp)
      if (checkpoint.artifacts.timestamp) {
        checkpoint.artifacts.timestamp = new Date(checkpoint.artifacts.timestamp)
      }
      
      const duration = Date.now() - startTime
      console.log(`✅ 检查点恢复成功: ${checkpointId} (耗时: ${duration}ms)`)
      console.log(`   阶段: ${checkpoint.stage}`)
      console.log(`   已完成步骤: ${checkpoint.context.completedSteps.length}个`)
      
      return {
        success: true,
        checkpoint,
        message: `检查点恢复成功: ${checkpointId}`,
        restoredContext: checkpoint.context
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ 恢复检查点失败: ${checkpointId} (耗时: ${duration}ms)`, error)
      
      throw new Error(`Failed to restore checkpoint ${checkpointId}: ${(error as Error).message}`)
    }
  }
  
  /**
   * 查询检查点列表
   * 
   * @param filter 过滤条件
   * @returns 查询结果
   * 
   * @example
   * ```typescript
   * // 查询最近10个失败的检查点
   * const result = await manager.list({
   *   status: CheckpointStatus.FAILED,
   *   limit: 10
   * })
   * console.log(`找到 ${result.total} 个失败的检查点`)
   * ```
   */
  public async list(filter: CheckpointFilter = {}): Promise<CheckpointQueryResult> {
    try {
      await this.ensureStorageDir()
      
      // 读取所有检查点文件
      const files = await readdir(this.config.storageDir)
      const checkpointFiles = files.filter(f => f.endsWith('.json'))
      
      // 加载并解析检查点
      const checkpoints: ExecutionCheckpoint[] = []
      
      for (const file of checkpointFiles) {
        try {
          const data = await readFile(path.join(this.config.storageDir, file), 'utf-8')
          const checkpoint: ExecutionCheckpoint = JSON.parse(data)
          
          // 恢复日期对象
          checkpoint.timestamp = new Date(checkpoint.timestamp)
          
          // 应用过滤器
          if (this.matchesFilter(checkpoint, filter)) {
            checkpoints.push(checkpoint)
          }
        } catch (error) {
          console.warn(`⚠️ 跳过无效的检查点文件: ${file}`, error)
        }
      }
      
      // 按时间戳降序排序
      checkpoints.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      
      // 应用分页
      const offset = filter.offset || 0
      const limit = filter.limit || checkpoints.length
      const paginatedCheckpoints = checkpoints.slice(offset, offset + limit)
      
      return {
        checkpoints: paginatedCheckpoints,
        total: checkpoints.length,
        hasMore: offset + limit < checkpoints.length
      }
    } catch (error) {
      console.error('❌ 查询检查点列表失败', error)
      throw new Error(`Failed to list checkpoints: ${(error as Error).message}`)
    }
  }
  
  /**
   * 删除检查点
   * 
   * @param checkpointId 检查点ID
   * @returns 是否删除成功
   * 
   * @example
   * ```typescript
   * await manager.delete('old-checkpoint-id')
   * console.log('✅ 检查点已删除')
   * ```
   */
  public async delete(checkpointId: string): Promise<boolean> {
    try {
      const filePath = this.getCheckpointPath(checkpointId)
      await unlink(filePath)
      console.log(`✅ 检查点已删除: ${checkpointId}`)
      return true
    } catch (error) {
      console.error(`❌ 删除检查点失败: ${checkpointId}`, error)
      return false
    }
  }
  
  /**
   * 查找最近的可恢复检查点
   * 
   * @returns 最近的可恢复检查点，如果没有则返回null
   * 
   * @example
   * ```typescript
   * const checkpoint = await manager.findLatestRecoverable()
   * if (checkpoint) {
   *   console.log('找到可恢复检查点:', checkpoint.id)
   *   const result = await manager.restore(checkpoint.id)
   * }
   * ```
   */
  public async findLatestRecoverable(): Promise<ExecutionCheckpoint | null> {
    try {
      const result = await this.list()
      const recoverable = result.checkpoints.filter(cp => cp.recovery.retryable)
      
      if (recoverable.length > 0) {
        return recoverable[0] // 已经按时间降序排序
      }
      
      return null
    } catch (error) {
      console.error('❌ 查找可恢复检查点失败', error)
      return null
    }
  }
  
  /**
   * 获取检查点统计信息
   * 
   * @returns 统计信息
   * 
   * @example
   * ```typescript
   * const stats = await manager.getStatistics()
   * console.log('检查点统计:')
   * console.log(`  总数: ${stats.total}`)
   * console.log(`  已完成: ${stats.byStatus[CheckpointStatus.COMPLETED]}`)
   * console.log(`  失败: ${stats.byStatus[CheckpointStatus.FAILED]}`)
   * ```
   */
  public async getStatistics(): Promise<CheckpointStatistics> {
    try {
      const result = await this.list()
      const checkpoints = result.checkpoints
      
      const stats: CheckpointStatistics = {
        total: checkpoints.length,
        byStatus: {
          [CheckpointStatus.IN_PROGRESS]: 0,
          [CheckpointStatus.COMPLETED]: 0,
          [CheckpointStatus.FAILED]: 0,
          [CheckpointStatus.CANCELLED]: 0
        },
        byStage: {} as Record<ExecutionStage, number>
      }
      
      // 初始化阶段统计
      Object.values(ExecutionStage).forEach(stage => {
        stats.byStage[stage] = 0
      })
      
      // 统计
      checkpoints.forEach(cp => {
        stats.byStatus[cp.status]++
        stats.byStage[cp.stage]++
      })
      
      // 时间范围
      if (checkpoints.length > 0) {
        stats.oldestTimestamp = checkpoints[checkpoints.length - 1].timestamp
        stats.latestTimestamp = checkpoints[0].timestamp
      }
      
      return stats
    } catch (error) {
      console.error('❌ 获取统计信息失败', error)
      throw new Error(`Failed to get statistics: ${(error as Error).message}`)
    }
  }
  
  /**
   * 清理旧检查点
   * 
   * @param olderThan 清理早于此日期的检查点（可选）
   * @returns 清理的检查点数量
   * 
   * @example
   * ```typescript
   * // 清理所有旧于7天的检查点
   * const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
   * const count = await manager.cleanup(sevenDaysAgo)
   * console.log(`清理了 ${count} 个旧检查点`)
   * ```
   */
  public async cleanup(olderThan?: Date): Promise<number> {
    try {
      const result = await this.list()
      let checkpoints = result.checkpoints
      
      // 如果指定了日期，则删除早于此日期的检查点
      if (olderThan) {
        const toDelete = checkpoints.filter(cp => cp.timestamp < olderThan)
        
        for (const cp of toDelete) {
          await this.delete(cp.id)
        }
        
        console.log(`✅ 清理了 ${toDelete.length} 个旧检查点（早于 ${olderThan.toISOString()}）`)
        return toDelete.length
      }
      
      // 如果检查点数量超过限制，删除最旧的
      if (checkpoints.length > this.config.maxCheckpoints) {
        const toDelete = checkpoints.slice(this.config.maxCheckpoints)
        
        for (const cp of toDelete) {
          await this.delete(cp.id)
        }
        
        console.log(`✅ 清理了 ${toDelete.length} 个旧检查点（保留最近 ${this.config.maxCheckpoints} 个）`)
        return toDelete.length
      }
      
      return 0
    } catch (error) {
      console.error('❌ 清理检查点失败', error)
      return 0
    }
  }
  
  /**
   * 验证检查点数据
   * @param checkpoint 检查点
   * @throws {Error} 如果验证失败
   * @private
   */
  private validateCheckpoint(checkpoint: ExecutionCheckpoint): void {
    if (!checkpoint.id) {
      throw new Error('Checkpoint ID is required')
    }
    
    if (!checkpoint.stage) {
      throw new Error('Checkpoint stage is required')
    }
    
    if (!checkpoint.timestamp) {
      throw new Error('Checkpoint timestamp is required')
    }
    
    if (!checkpoint.status) {
      throw new Error('Checkpoint status is required')
    }
    
    if (!checkpoint.context) {
      throw new Error('Checkpoint context is required')
    }
    
    if (!checkpoint.artifacts) {
      throw new Error('Checkpoint artifacts is required')
    }
    
    if (!checkpoint.recovery) {
      throw new Error('Checkpoint recovery strategy is required')
    }
  }
  
  /**
   * 检查检查点是否匹配过滤器
   * @param checkpoint 检查点
   * @param filter 过滤器
   * @returns 是否匹配
   * @private
   */
  private matchesFilter(checkpoint: ExecutionCheckpoint, filter: CheckpointFilter): boolean {
    if (filter.stage && checkpoint.stage !== filter.stage) {
      return false
    }
    
    if (filter.status && checkpoint.status !== filter.status) {
      return false
    }
    
    if (filter.startDate && checkpoint.timestamp < filter.startDate) {
      return false
    }
    
    if (filter.endDate && checkpoint.timestamp > filter.endDate) {
      return false
    }
    
    return true
  }
}

/**
 * 导出单例实例
 */
export const checkpointManager = new CheckpointManager()

