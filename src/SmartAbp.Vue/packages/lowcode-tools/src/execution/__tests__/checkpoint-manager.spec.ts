/**
 * AI编程铁律执行引擎 v7.0 - 检查点管理器单元测试
 * 
 * @file checkpoint-manager.spec.ts
 * @description 检查点管理器的完整单元测试套件，覆盖所有核心功能
 * @author 世界顶级低代码引擎架构师
 * @date 2025-10-04
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'
import { CheckpointManager } from '../checkpoint-manager'
import {
  ExecutionCheckpoint,
  ExecutionStage,
  CheckpointStatus,
  ErrorSeverity
} from '../types'

const rmdir = promisify(fs.rm)
const mkdir = promisify(fs.mkdir)

describe('CheckpointManager', () => {
  let manager: CheckpointManager
  const testStorageDir = '.ai-engine-test/checkpoints'
  
  beforeEach(async () => {
    // 创建测试目录
    try {
      await mkdir(testStorageDir, { recursive: true })
    } catch (error) {
      // 目录已存在
    }
    
    manager = new CheckpointManager({
      storageDir: testStorageDir,
      maxCheckpoints: 5
    })
  })
  
  afterEach(async () => {
    // 清理测试目录
    try {
      await rmdir(testStorageDir, { recursive: true, force: true })
    } catch (error) {
      console.warn('清理测试目录失败', error)
    }
  })
  
  // 辅助函数：创建测试检查点
  const createTestCheckpoint = (overrides?: Partial<ExecutionCheckpoint>): ExecutionCheckpoint => {
    return {
      id: manager.generateId(),
      stage: ExecutionStage.STAGE3_INCREMENTAL_CODING,
      timestamp: new Date(),
      status: CheckpointStatus.IN_PROGRESS,
      context: {
        completedSteps: ['step1', 'step2'],
        currentStep: 'step3',
        variables: { count: 100 }
      },
      artifacts: {
        modifiedFiles: ['file1.ts', 'file2.ts'],
        generatedCode: 150,
        qualityScore: 95,
        timestamp: new Date(),
        metrics: {
          linesAdded: 150,
          linesDeleted: 20,
          linesModified: 50,
          filesCreated: 2,
          filesModified: 1,
          filesDeleted: 0,
          totalLines: 150
        }
      },
      recovery: {
        retryable: true,
        autoFixAvailable: false,
        maxRetries: 3
      },
      metadata: {
        version: 'v7.0',
        mode: 'STANDARD'
      },
      ...overrides
    }
  }
  
  describe('基本功能测试', () => {
    it('应该能够生成唯一的检查点ID', () => {
      const id1 = manager.generateId()
      const id2 = manager.generateId()
      
      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(id1.length).toBeGreaterThan(0)
    })
    
    it('应该能够保存检查点', async () => {
      const checkpoint = createTestCheckpoint()
      
      const saved = await manager.save(checkpoint)
      
      expect(saved).toBeDefined()
      expect(saved.id).toBe(checkpoint.id)
      expect(saved.stage).toBe(checkpoint.stage)
      expect(saved.status).toBe(checkpoint.status)
    })
    
    it('应该能够恢复检查点', async () => {
      const checkpoint = createTestCheckpoint()
      await manager.save(checkpoint)
      
      const result = await manager.restore(checkpoint.id)
      
      expect(result.success).toBe(true)
      expect(result.checkpoint).toBeDefined()
      expect(result.checkpoint.id).toBe(checkpoint.id)
      expect(result.checkpoint.stage).toBe(checkpoint.stage)
      expect(result.restoredContext).toBeDefined()
      expect(result.restoredContext.completedSteps).toHaveLength(2)
    })
    
    it('恢复不存在的检查点应该抛出错误', async () => {
      await expect(manager.restore('non-existent-id')).rejects.toThrow()
    })
    
    it('应该能够删除检查点', async () => {
      const checkpoint = createTestCheckpoint()
      await manager.save(checkpoint)
      
      const deleted = await manager.delete(checkpoint.id)
      
      expect(deleted).toBe(true)
      
      // 验证检查点已删除
      await expect(manager.restore(checkpoint.id)).rejects.toThrow()
    })
  })
  
  describe('查询功能测试', () => {
    it('应该能够列出所有检查点', async () => {
      const cp1 = createTestCheckpoint()
      const cp2 = createTestCheckpoint()
      
      await manager.save(cp1)
      await manager.save(cp2)
      
      const result = await manager.list()
      
      expect(result.checkpoints).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.hasMore).toBe(false)
    })
    
    it('应该能够按状态过滤检查点', async () => {
      const cp1 = createTestCheckpoint({ status: CheckpointStatus.COMPLETED })
      const cp2 = createTestCheckpoint({ status: CheckpointStatus.FAILED })
      const cp3 = createTestCheckpoint({ status: CheckpointStatus.COMPLETED })
      
      await manager.save(cp1)
      await manager.save(cp2)
      await manager.save(cp3)
      
      const result = await manager.list({ status: CheckpointStatus.COMPLETED })
      
      expect(result.checkpoints).toHaveLength(2)
      expect(result.checkpoints.every(cp => cp.status === CheckpointStatus.COMPLETED)).toBe(true)
    })
    
    it('应该能够按阶段过滤检查点', async () => {
      const cp1 = createTestCheckpoint({ stage: ExecutionStage.STAGE2_PRE_LEARNING })
      const cp2 = createTestCheckpoint({ stage: ExecutionStage.STAGE3_INCREMENTAL_CODING })
      const cp3 = createTestCheckpoint({ stage: ExecutionStage.STAGE2_PRE_LEARNING })
      
      await manager.save(cp1)
      await manager.save(cp2)
      await manager.save(cp3)
      
      const result = await manager.list({ stage: ExecutionStage.STAGE2_PRE_LEARNING })
      
      expect(result.checkpoints).toHaveLength(2)
      expect(result.checkpoints.every(cp => cp.stage === ExecutionStage.STAGE2_PRE_LEARNING)).toBe(true)
    })
    
    it('应该支持分页查询', async () => {
      // 创建10个检查点（但会被自动清理到maxCheckpoints=5）
      for (let i = 0; i < 10; i++) {
        await manager.save(createTestCheckpoint())
      }
      
      const page1 = await manager.list({ limit: 3, offset: 0 })
      const page2 = await manager.list({ limit: 3, offset: 3 })
      
      expect(page1.checkpoints).toHaveLength(3)
      expect(page1.total).toBe(5) // 自动清理后只保留5个
      expect(page1.hasMore).toBe(true)
      
      expect(page2.checkpoints).toHaveLength(2) // 剩余2个
      expect(page2.total).toBe(5)
      expect(page2.hasMore).toBe(false)
    })
    
    it('应该能够查找最近的可恢复检查点', async () => {
      const cp1 = createTestCheckpoint({ recovery: { retryable: false, autoFixAvailable: false } })
      const cp2 = createTestCheckpoint({ recovery: { retryable: true, autoFixAvailable: true } })
      const cp3 = createTestCheckpoint({ recovery: { retryable: false, autoFixAvailable: false } })
      
      await manager.save(cp1)
      await new Promise(resolve => setTimeout(resolve, 10)) // 确保时间戳不同
      await manager.save(cp2)
      await new Promise(resolve => setTimeout(resolve, 10))
      await manager.save(cp3)
      
      const latest = await manager.findLatestRecoverable()
      
      expect(latest).toBeDefined()
      expect(latest!.id).toBe(cp2.id)
      expect(latest!.recovery.retryable).toBe(true)
    })
  })
  
  describe('统计功能测试', () => {
    it('应该能够获取检查点统计信息', async () => {
      await manager.save(createTestCheckpoint({ status: CheckpointStatus.COMPLETED }))
      await manager.save(createTestCheckpoint({ status: CheckpointStatus.FAILED }))
      await manager.save(createTestCheckpoint({ status: CheckpointStatus.COMPLETED }))
      
      const stats = await manager.getStatistics()
      
      expect(stats.total).toBe(3)
      expect(stats.byStatus[CheckpointStatus.COMPLETED]).toBe(2)
      expect(stats.byStatus[CheckpointStatus.FAILED]).toBe(1)
      expect(stats.byStatus[CheckpointStatus.IN_PROGRESS]).toBe(0)
      expect(stats.oldestTimestamp).toBeDefined()
      expect(stats.latestTimestamp).toBeDefined()
    })
    
    it('应该能够按阶段统计检查点', async () => {
      await manager.save(createTestCheckpoint({ stage: ExecutionStage.STAGE2_PRE_LEARNING }))
      await manager.save(createTestCheckpoint({ stage: ExecutionStage.STAGE3_INCREMENTAL_CODING }))
      await manager.save(createTestCheckpoint({ stage: ExecutionStage.STAGE2_PRE_LEARNING }))
      
      const stats = await manager.getStatistics()
      
      expect(stats.byStage[ExecutionStage.STAGE2_PRE_LEARNING]).toBe(2)
      expect(stats.byStage[ExecutionStage.STAGE3_INCREMENTAL_CODING]).toBe(1)
    })
  })
  
  describe('清理功能测试', () => {
    it('应该能够清理超过最大数量的检查点', async () => {
      // 创建10个检查点（超过maxCheckpoints=5）
      // 因为save()会自动调用cleanup()，所以始终保持最多5个
      for (let i = 0; i < 10; i++) {
        await manager.save(createTestCheckpoint())
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      const beforeList = await manager.list()
      expect(beforeList.total).toBe(5) // 自动清理机制已生效
      
      // 测试手动清理（应该不会清理任何内容，因为已经是最大数量）
      const cleanedCount = await manager.cleanup()
      expect(cleanedCount).toBe(0)
      
      const afterList = await manager.list()
      expect(afterList.total).toBe(5)
    })
    
    it('应该能够清理早于指定日期的检查点', async () => {
      const now = new Date()
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      await manager.save(createTestCheckpoint({ timestamp: sevenDaysAgo }))
      await manager.save(createTestCheckpoint({ timestamp: threeDaysAgo }))
      await manager.save(createTestCheckpoint({ timestamp: now }))
      
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      const count = await manager.cleanup(fiveDaysAgo)
      
      expect(count).toBe(1) // 只有7天前的被清理
      
      const remaining = await manager.list()
      expect(remaining.total).toBe(2)
    })
  })
  
  describe('数据验证测试', () => {
    it('保存缺少必填字段的检查点应该抛出错误', async () => {
      const invalidCheckpoint = {
        id: manager.generateId()
        // 缺少其他必填字段
      } as any
      
      await expect(manager.save(invalidCheckpoint)).rejects.toThrow()
    })
    
    it('应该正确保存和恢复日期字段', async () => {
      const checkpoint = createTestCheckpoint()
      const originalTimestamp = checkpoint.timestamp
      
      await manager.save(checkpoint)
      const result = await manager.restore(checkpoint.id)
      
      expect(result.checkpoint.timestamp).toBeInstanceOf(Date)
      expect(result.checkpoint.timestamp.getTime()).toBe(originalTimestamp.getTime())
    })
    
    it('应该正确保存和恢复嵌套对象', async () => {
      const checkpoint = createTestCheckpoint({
        context: {
          completedSteps: ['step1', 'step2', 'step3'],
          currentStep: 'step4',
          variables: {
            count: 100,
            nested: {
              value: 'test'
            }
          }
        }
      })
      
      await manager.save(checkpoint)
      const result = await manager.restore(checkpoint.id)
      
      expect(result.checkpoint.context.variables?.nested).toEqual({ value: 'test' })
      expect(result.checkpoint.context.completedSteps).toEqual(['step1', 'step2', 'step3'])
    })
  })
  
  describe('性能测试', () => {
    it('保存检查点应该在100ms内完成', async () => {
      const checkpoint = createTestCheckpoint()
      
      const startTime = Date.now()
      await manager.save(checkpoint)
      const duration = Date.now() - startTime
      
      expect(duration).toBeLessThan(100)
    })
    
    it('恢复检查点应该在50ms内完成', async () => {
      const checkpoint = createTestCheckpoint()
      await manager.save(checkpoint)
      
      const startTime = Date.now()
      await manager.restore(checkpoint.id)
      const duration = Date.now() - startTime
      
      expect(duration).toBeLessThan(50)
    })
    
    it('应该能够处理大量检查点', async () => {
      // 创建100个检查点
      const startTime = Date.now()
      
      for (let i = 0; i < 100; i++) {
        await manager.save(createTestCheckpoint())
      }
      
      const saveDuration = Date.now() - startTime
      console.log(`保存100个检查点耗时: ${saveDuration}ms`)
      
      // 查询所有检查点
      const queryStart = Date.now()
      const result = await manager.list()
      const queryDuration = Date.now() - queryStart
      
      console.log(`查询100个检查点耗时: ${queryDuration}ms`)
      
      expect(result.total).toBeGreaterThanOrEqual(5) // 因为maxCheckpoints=5，会自动清理
      expect(queryDuration).toBeLessThan(1000)
    })
  })
  
  describe('并发测试', () => {
    it('应该能够并发保存多个检查点', async () => {
      const checkpoints = Array.from({ length: 10 }, () => createTestCheckpoint())
      
      const promises = checkpoints.map(cp => manager.save(cp))
      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(10)
      results.forEach((result, index) => {
        expect(result.id).toBe(checkpoints[index].id)
      })
    })
  })
})

