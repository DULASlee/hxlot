/**
 * 规则执行引擎单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { RuleExecutionEngine } from '../ruleExecutionEngine'
import type { BusinessRule, RuleContext } from '../../stores/enhancedStateMachine'

describe('RuleExecutionEngine', () => {
  let engine: RuleExecutionEngine
  let mockRules: BusinessRule[]
  let mockContext: RuleContext

  beforeEach(() => {
    engine = new RuleExecutionEngine()
    
    mockRules = [
      {
        id: 'rule1',
        name: '测试规则1',
        description: '如果金额大于1000，设置状态为审批中',
        condition: 'entity.amount > 1000',
        action: "SetFieldValue(field='status', value='pending')",
        priority: 1,
        enabled: true
      },
      {
        id: 'rule2',
        name: '测试规则2',
        description: '如果状态为审批中，显示消息',
        condition: "entity.status === 'pending'",
        action: "ShowMessage(message='需要审批', type='warning')",
        priority: 2,
        enabled: true
      }
    ]

    mockContext = {
      entity: {
        amount: 1500,
        status: 'draft'
      },
      user: {
        id: 'user1',
        name: 'Test User',
        roles: ['admin']
      },
      environment: 'dev'
    }
  })

  describe('executeRules', () => {
    it('应该成功执行所有启用的规则', async () => {
      const result = await engine.executeRules(mockRules, mockContext)

      expect(result.success).toBe(true)
      expect(result.executedCount).toBe(2)
      expect(result.failedCount).toBe(0)
      expect(result.results).toHaveLength(2)
    })

    it('应该按优先级排序执行规则', async () => {
      const result = await engine.executeRules(mockRules, mockContext)

      // 优先级高的先执行
      expect(result.results[0].ruleId).toBe('rule2')
      expect(result.results[1].ruleId).toBe('rule1')
    })

    it('应该跳过未启用的规则', async () => {
      mockRules[0].enabled = false

      const result = await engine.executeRules(mockRules, mockContext)

      expect(result.executedCount).toBe(1)
      expect(result.results).toHaveLength(1)
      expect(result.results[0].ruleId).toBe('rule2')
    })

    it('应该记录执行错误', async () => {
      mockRules.push({
        id: 'rule3',
        name: '错误规则',
        description: '无效的条件',
        condition: 'invalid javascript code',
        action: "ShowMessage(message='test')",
        priority: 0,
        enabled: true
      })

      const result = await engine.executeRules(mockRules, mockContext)

      expect(result.success).toBe(false)
      expect(result.failedCount).toBeGreaterThan(0)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('应该正确传递上下文给下一个规则', async () => {
      const result = await engine.executeRules(mockRules, mockContext)

      expect(result.results[1].result).toBeDefined()
    })
  })

  describe('executeRule', () => {
    it('应该成功执行单条规则', async () => {
      const rule = mockRules[0]
      const result = await engine.executeRule(rule, mockContext)

      expect(result.success).toBe(true)
      expect(result.ruleId).toBe('rule1')
      expect(result.conditionMet).toBe(true)
      expect(result.actionExecuted).toBe(true)
    })

    it('条件不满足时应该跳过动作', async () => {
      mockContext.entity.amount = 500 // 小于1000
      const rule = mockRules[0]

      const result = await engine.executeRule(rule, mockContext)

      expect(result.success).toBe(true)
      expect(result.conditionMet).toBe(false)
      expect(result.actionExecuted).toBe(false)
    })

    it('应该处理没有条件的规则', async () => {
      const rule: BusinessRule = {
        id: 'rule_no_condition',
        name: '无条件规则',
        description: '总是执行',
        action: "ShowMessage(message='always')",
        priority: 0,
        enabled: true
      }

      const result = await engine.executeRule(rule, mockContext)

      expect(result.success).toBe(true)
      expect(result.conditionMet).toBe(true)
      expect(result.actionExecuted).toBe(true)
    })

    it('应该记录执行时间', async () => {
      const rule = mockRules[0]
      const result = await engine.executeRule(rule, mockContext)

      expect(result.duration).toBeGreaterThanOrEqual(0)
    })
  })

  describe('调试模式', () => {
    it('启用调试模式应该输出详细日志', () => {
      expect(() => engine.enableDebug()).not.toThrow()
    })

    it('禁用调试模式应该停止详细日志', () => {
      engine.enableDebug()
      expect(() => engine.disableDebug()).not.toThrow()
    })
  })
})
