/**
 * 规则引擎端到端集成测试
 * 测试从规则定义到执行的完整流程
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEnhancedStateMachineStore } from '../../stores/enhancedStateMachine'
import type { BusinessRule, RuleContext } from '../../stores/enhancedStateMachine'

describe('规则引擎端到端集成测试', () => {
  let store: ReturnType<typeof useEnhancedStateMachineStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useEnhancedStateMachineStore()
  })

  describe('完整业务规则执行流程', () => {
    it('应该完成从规则创建到执行的完整流程', async () => {
      // 1. 创建业务规则
      const rule: BusinessRule = {
        id: 'integration-rule-1',
        name: '订单金额验证规则',
        description: '当订单金额大于1000时，设置需要审批标记',
        type: 'field-linkage',
        trigger: 'amount',
        condition: 'entity.amount > 1000',
        action: "SetFieldValue(field='needsApproval', value='true')",
        priority: 1,
        enabled: true
      }

      store.addBusinessRule(rule)

      // 2. 验证规则已添加
      expect(store.businessRules).toHaveLength(1)
      expect(store.businessRules[0].id).toBe('integration-rule-1')

      // 3. 准备执行上下文
      const context: RuleContext = {
        entity: {
          id: 'order-001',
          amount: 1500,
          needsApproval: false
        },
        user: {
          id: 'user-001',
          name: 'Test User',
          roles: ['user']
        },
        environment: 'test'
      }

      // 4. 执行规则
      const result = await store.executeBusinessRulesEnhanced(context)

      // 5. 验证执行结果
      expect(result.success).toBe(true)
      expect(result.executedCount).toBe(1)
      expect(result.failedCount).toBe(0)
      expect(result.results).toHaveLength(1)
      expect(result.results[0].conditionMet).toBe(true)
      expect(result.results[0].actionExecuted).toBe(true)
    })

    it('应该支持多规则级联执行', async () => {
      // 添加多个相关规则
      const rules: BusinessRule[] = [
        {
          id: 'rule-1',
          name: '金额检查',
          type: 'field-linkage',
          trigger: 'amount',
          condition: 'entity.amount > 1000',
          action: "SetFieldValue(field='needsApproval', value='true')",
          priority: 1,
          enabled: true
        },
        {
          id: 'rule-2',
          name: '审批提示',
          type: 'field-linkage',
          trigger: 'needsApproval',
          condition: "entity.needsApproval === true",
          action: "ShowMessage(message='需要经理审批', type='warning')",
          priority: 2,
          enabled: true
        }
      ]

      rules.forEach(rule => store.addBusinessRule(rule))

      const context: RuleContext = {
        entity: {
          amount: 2000,
          needsApproval: false
        },
        user: {
          id: 'user-001',
          name: 'Test User',
          roles: ['user']
        },
        environment: 'test'
      }

      const result = await store.executeBusinessRulesEnhanced(context)

      expect(result.success).toBe(true)
      expect(result.executedCount).toBe(2)
      expect(result.results).toHaveLength(2)
    })

    it('应该正确处理规则执行失败场景', async () => {
      const invalidRule: BusinessRule = {
        id: 'invalid-rule',
        name: '无效规则',
        type: 'custom',
        trigger: 'test',
        condition: 'invalid javascript syntax !!',
        action: "DoSomething()",
        priority: 1,
        enabled: true
      }

      store.addBusinessRule(invalidRule)

      const context: RuleContext = {
        entity: {},
        user: { id: 'test', name: 'Test', roles: [] },
        environment: 'test'
      }

      const result = await store.executeBusinessRulesEnhanced(context)

      expect(result.success).toBe(false)
      expect(result.failedCount).toBeGreaterThan(0)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('规则调试和日志功能', () => {
    it('应该支持启用和禁用调试模式', () => {
      expect(() => store.enableRuleDebug()).not.toThrow()
      expect(() => store.disableRuleDebug()).not.toThrow()
    })

    it('应该记录规则执行日志', async () => {
      const rule: BusinessRule = {
        id: 'log-rule',
        name: '日志测试规则',
        type: 'custom',
        trigger: 'test',
        condition: 'entity.value > 100',
        action: "SetFieldValue(field='status', value='high')",
        priority: 1,
        enabled: true
      }

      store.addBusinessRule(rule)

      const context: RuleContext = {
        entity: { value: 150 },
        user: { id: 'test', name: 'Test', roles: [] },
        environment: 'test'
      }

      await store.executeBusinessRulesEnhanced(context)

      const logs = store.getRuleExecutionLogs()
      expect(logs).toBeDefined()
    })
  })
})
