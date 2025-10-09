/**
 * 业务规则代码生成器单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BusinessRuleCodeGenerator } from './BusinessRuleCodeGenerator'
import type { BusinessRule } from './../stores/enhancedStateMachine'

describe('BusinessRuleCodeGenerator', () => {
  let generator: BusinessRuleCodeGenerator
  let mockRules: BusinessRule[]

  beforeEach(() => {
    generator = new BusinessRuleCodeGenerator({
      entityName: 'Order',
      namespace: 'TestApp'
    })

    mockRules = [
      {
        id: 'rule1',
        name: '金额验证',
        description: '订单金额必须大于0',
        condition: 'data.amount > 0',
        action: "ShowMessage(message='金额必须大于0', type='error')",
        priority: 1,
        enabled: true
      },
      {
        id: 'rule2',
        name: '状态设置',
        description: '设置订单状态',
        condition: 'data.amount > 1000',
        action: "SetFieldValue(field='needsApproval', value='true')",
        priority: 2,
        enabled: true
      }
    ]
  })

  describe('generate', () => {
    it('应该生成完整的前后端代码', () => {
      const result = generator.generate(mockRules)

      expect(result.frontend).toBeDefined()
      expect(result.frontend.validation).toBeDefined()
      expect(result.frontend.types).toBeDefined()
      expect(result.backend).toBeDefined()
      expect(result.backend.service).toBeDefined()
      expect(result.backend.interface).toBeDefined()
    })

    it('前端验证代码应该包含所有规则', () => {
      const result = generator.generate(mockRules)

      expect(result.frontend.validation).toContain('rule1')
      expect(result.frontend.validation).toContain('rule2')
      expect(result.frontend.validation).toContain('OrderValidationRules')
      expect(result.frontend.validation).toContain('validateOrder')
    })

    it('后端服务代码应该包含所有规则方法', () => {
      const result = generator.generate(mockRules)

      expect(result.backend.service).toContain('OrderBusinessRuleService')
      expect(result.backend.service).toContain('Executerule1Async')
      expect(result.backend.service).toContain('Executerule2Async')
      expect(result.backend.service).toContain('ExecuteAllRulesAsync')
    })

    it('应该生成正确的TypeScript类型定义', () => {
      const result = generator.generate(mockRules)

      expect(result.frontend.types).toContain('OrderDto')
      expect(result.frontend.types).toContain('OrderRuleContext')
    })

    it('应该生成正确的C#命名空间', () => {
      const result = generator.generate(mockRules)

      expect(result.backend.service).toContain('namespace TestApp.BusinessRules')
      expect(result.backend.interface).toContain('namespace TestApp.BusinessRules')
    })
  })

  describe('条件转换', () => {
    it('应该正确转换TypeScript条件表达式', () => {
      const result = generator.generate(mockRules)

      expect(result.frontend.validation).toContain('data.amount > 0')
      expect(result.frontend.validation).toContain('data.amount > 1000')
    })

    it('应该正确转换C#条件表达式', () => {
      const result = generator.generate(mockRules)

      expect(result.backend.service).toContain('entity.amount > 0')
      expect(result.backend.service).toContain('entity.amount > 1000')
    })
  })

  describe('动作转换', () => {
    it('应该正确转换SetFieldValue动作', () => {
      const result = generator.generate(mockRules)

      // TypeScript
      expect(result.frontend.validation).toMatch(/data\.needsApproval\s*=/)

      // C#
      expect(result.backend.service).toMatch(/entity\.needsApproval\s*=/)
    })

    it('应该正确转换ShowMessage动作', () => {
      const result = generator.generate(mockRules)

      // TypeScript
      expect(result.frontend.validation).toContain('errors.push')

      // C#
      expect(result.backend.service).toContain('Logger.LogInformation')
    })
  })

  describe('边界情况', () => {
    it('应该处理空规则列表', () => {
      const result = generator.generate([])

      expect(result.frontend.validation).toBeDefined()
      expect(result.backend.service).toBeDefined()
    })

    it('应该处理没有条件的规则', () => {
      const rule: BusinessRule = {
        id: 'rule_no_condition',
        name: '无条件规则',
        description: '总是执行',
        action: "ShowMessage(message='test')",
        priority: 0,
        enabled: true
      }

      const result = generator.generate([rule])

      expect(result.frontend.validation).toContain('true')
    })

    it('应该处理没有动作的规则', () => {
      const rule: BusinessRule = {
        id: 'rule_no_action',
        name: '无动作规则',
        description: '只验证',
        condition: 'data.amount > 0',
        action: '',
        priority: 0,
        enabled: true
      }

      const result = generator.generate([rule])

      expect(result.frontend.validation).toBeDefined()
    })
  })
})
