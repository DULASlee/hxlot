/**
 * 表达式解析器单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ExpressionParser, SecurityError, ExecutionTimeoutError } from '../ruleExpressionParser'
import type { RuleContext } from '../../stores/enhancedStateMachine'

describe('ExpressionParser', () => {
  let parser: ExpressionParser
  let mockContext: RuleContext

  beforeEach(() => {
    parser = new ExpressionParser()
    mockContext = {
      entity: {
        amount: 1000,
        status: 'active',
        createdAt: new Date('2024-01-01')
      },
      user: {
        id: 'user1',
        name: 'Test User',
        roles: ['admin', 'user']
      },
      environment: 'dev'
    }
  })

  describe('evaluate', () => {
    it('应该成功解析简单的比较表达式', async () => {
      const result = await parser.evaluate('entity.amount > 500', mockContext)
      expect(result).toBe(true)
    })

    it('应该成功解析复杂的逻辑表达式', async () => {
      const expression = "entity.amount > 500 && entity.status === 'active'"
      const result = await parser.evaluate(expression, mockContext)
      expect(result).toBe(true)
    })

    it('应该支持Math函数', async () => {
      const result = await parser.evaluate('Math.max(entity.amount, 500)', mockContext)
      expect(result).toBe(1000)
    })

    it('应该支持字符串操作', async () => {
      const result = await parser.evaluate('entity.status.toUpperCase()', mockContext)
      expect(result).toBe('ACTIVE')
    })

    it('应该支持数组操作', async () => {
      const result = await parser.evaluate('user.roles.includes("admin")', mockContext)
      expect(result).toBe(true)
    })

    it('应该支持辅助函数', async () => {
      const result = await parser.evaluate('isEmpty(entity.status)', mockContext)
      expect(result).toBe(false)
    })
  })

  describe('安全性验证', () => {
    it('应该拒绝eval表达式', async () => {
      await expect(
        parser.evaluate('eval("malicious code")', mockContext)
      ).rejects.toThrow(SecurityError)
    })

    it('应该拒绝Function构造', async () => {
      await expect(
        parser.evaluate('Function("return 1")()', mockContext)
      ).rejects.toThrow(SecurityError)
    })

    it('应该拒绝require引用', async () => {
      await expect(
        parser.evaluate('require("fs")', mockContext)
      ).rejects.toThrow(SecurityError)
    })

    it('应该拒绝window对象访问', async () => {
      await expect(
        parser.evaluate('window.location.href', mockContext)
      ).rejects.toThrow(SecurityError)
    })

    it('应该拒绝document对象访问', async () => {
      await expect(
        parser.evaluate('document.cookie', mockContext)
      ).rejects.toThrow(SecurityError)
    })

    it('应该拒绝localStorage访问', async () => {
      await expect(
        parser.evaluate('localStorage.getItem("key")', mockContext)
      ).rejects.toThrow(SecurityError)
    })

    it('应该拒绝__proto__访问', async () => {
      await expect(
        parser.evaluate('entity.__proto__', mockContext)
      ).rejects.toThrow(SecurityError)
    })

    it('应该拒绝超长表达式', async () => {
      const longExpression = 'entity.amount > 500'.repeat(100)
      await expect(
        parser.evaluate(longExpression, mockContext)
      ).rejects.toThrow(SecurityError)
    })
  })

  describe('错误处理', () => {
    it('应该处理未定义的属性', async () => {
      const result = await parser.evaluate('entity.nonexistent === undefined', mockContext)
      expect(result).toBe(true)
    })

    it('应该处理语法错误', async () => {
      await expect(
        parser.evaluate('entity.amount >', mockContext)
      ).rejects.toThrow()
    })

    it('应该处理运行时错误', async () => {
      await expect(
        parser.evaluate('entity.amount.nonExistentMethod()', mockContext)
      ).rejects.toThrow()
    })
  })

  describe('性能', () => {
    it('应该在合理时间内完成执行', async () => {
      const startTime = Date.now()
      await parser.evaluate('entity.amount > 500', mockContext)
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(100) // 应该在100ms内完成
    })
  })
})
