/**
 * AI编程铁律执行引擎 v7.0 - MVP极简断点续传
 * 
 * @file simple-checkpoint.ts
 * @description 极简的断点续传实现，只记录当前阶段，简单实用
 * @author 世界顶级低代码引擎架构师
 * @date 2025-10-04
 * @version 1.0.0-mvp
 */

import * as fs from 'fs'
import * as path from 'path'

/**
 * 执行阶段枚举
 */
export enum ExecutionStage {
  STAGE0_INDEPENDENT_JUDGMENT = 'stage0_independent_judgment',
  STAGE1_TRIGGER_DETECTION = 'stage1_trigger_detection',
  STAGE2_PRE_LEARNING = 'stage2_pre_learning',
  STAGE3_INCREMENTAL_CODING = 'stage3_incremental_coding',
  STAGE4_QUALITY_GATES = 'stage4_quality_gates',
  STAGE5_GIT_SYNC = 'stage5_git_sync',
  STAGE6_AUTO_CONTINUE = 'stage6_auto_continue'
}

/**
 * 极简检查点 - MVP方案
 * 
 * 只保存当前执行阶段到文本文件，简单高效
 * 
 * @example
 * ```typescript
 * const checkpoint = new SimpleCheckpoint()
 * 
 * // 保存当前阶段
 * checkpoint.save(ExecutionStage.STAGE3_INCREMENTAL_CODING)
 * 
 * // 恢复上次阶段
 * const lastStage = checkpoint.restore()
 * if (lastStage) {
 *   console.log(`从${lastStage}继续执行...`)
 * }
 * 
 * // 清除检查点
 * checkpoint.clear()
 * ```
 */
export class SimpleCheckpoint {
  private readonly CHECKPOINT_DIR = '.ai-engine'
  private readonly CHECKPOINT_FILE = 'last-stage.txt'
  
  /**
   * 获取检查点文件路径
   */
  private getCheckpointPath(): string {
    return path.join(process.cwd(), this.CHECKPOINT_DIR, this.CHECKPOINT_FILE)
  }
  
  /**
   * 确保检查点目录存在
   */
  private ensureDir(): void {
    const dir = path.join(process.cwd(), this.CHECKPOINT_DIR)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
  
  /**
   * 保存当前执行阶段
   * 
   * @param stage 执行阶段
   * 
   * @example
   * ```typescript
   * checkpoint.save(ExecutionStage.STAGE4_QUALITY_GATES)
   * console.log('✅ 已保存检查点')
   * ```
   */
  public save(stage: ExecutionStage | string): void {
    try {
      this.ensureDir()
      const filePath = this.getCheckpointPath()
      const timestamp = new Date().toISOString()
      const content = `${stage}\n${timestamp}`
      
      fs.writeFileSync(filePath, content, 'utf-8')
      console.log(`✅ 检查点已保存: ${stage}`)
    } catch (error) {
      console.warn('⚠️ 保存检查点失败:', error)
    }
  }
  
  /**
   * 恢复上次执行阶段
   * 
   * @returns 上次执行阶段，如果没有则返回null
   * 
   * @example
   * ```typescript
   * const lastStage = checkpoint.restore()
   * if (lastStage) {
   *   console.log(`🔄 从${lastStage}继续执行`)
   * } else {
   *   console.log('🆕 开始新的执行')
   * }
   * ```
   */
  public restore(): string | null {
    try {
      const filePath = this.getCheckpointPath()
      
      if (!fs.existsSync(filePath)) {
        return null
      }
      
      const content = fs.readFileSync(filePath, 'utf-8')
      const [stage, timestamp] = content.split('\n')
      
      console.log(`🔄 恢复检查点: ${stage} (${timestamp})`)
      return stage
    } catch (error) {
      console.warn('⚠️ 恢复检查点失败:', error)
      return null
    }
  }
  
  /**
   * 清除检查点
   * 
   * @example
   * ```typescript
   * checkpoint.clear()
   * console.log('🗑️ 检查点已清除')
   * ```
   */
  public clear(): void {
    try {
      const filePath = this.getCheckpointPath()
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log('🗑️ 检查点已清除')
      }
    } catch (error) {
      console.warn('⚠️ 清除检查点失败:', error)
    }
  }
  
  /**
   * 检查是否有检查点
   * 
   * @returns 是否存在检查点
   */
  public hasCheckpoint(): boolean {
    const filePath = this.getCheckpointPath()
    return fs.existsSync(filePath)
  }
}

/**
 * 单例实例
 */
export const simpleCheckpoint = new SimpleCheckpoint()

