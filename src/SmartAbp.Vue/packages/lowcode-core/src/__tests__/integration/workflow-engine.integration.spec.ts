/**
 * 工作流引擎端到端集成测试
 * 测试工作流从定义到执行完成的完整流程
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { WorkflowEngine } from './../engines/WorkflowEngine'
import type { WorkflowDefinition } from './../engines/WorkflowEngine'

describe('工作流引擎端到端集成测试', () => {
  let engine: WorkflowEngine
  let approvalWorkflow: WorkflowDefinition

  beforeEach(() => {
    engine = new WorkflowEngine()
    
    // 定义标准审批工作流
    approvalWorkflow = {
      id: 'approval-workflow',
      name: '标准审批流程',
      initialState: 'draft',
      states: [
        { id: 'draft', name: '草稿', type: 'initial', metadata: {} },
        { id: 'pending', name: '待审批', type: 'normal', metadata: {} },
        { id: 'approved', name: '已批准', type: 'final', metadata: {} },
        { id: 'rejected', name: '已拒绝', type: 'final', metadata: {} }
      ],
      transitions: [
        {
          id: 't1',
          fromState: 'draft',
          toState: 'pending',
          event: 'submit',
          label: '提交审批'
        },
        {
          id: 't2',
          fromState: 'pending',
          toState: 'approved',
          event: 'approve',
          label: '批准',
          condition: 'context.user.role === "manager"'
        },
        {
          id: 't3',
          fromState: 'pending',
          toState: 'rejected',
          event: 'reject',
          label: '拒绝'
        },
        {
          id: 't4',
          fromState: 'rejected',
          toState: 'draft',
          event: 'revise',
          label: '重新编辑'
        }
      ]
    }
  })

  describe('完整工作流生命周期', () => {
    it('应该完成从创建到审批通过的完整流程', async () => {
      // 1. 注册工作流
      engine.registerWorkflow(approvalWorkflow)

      // 2. 创建工作流实例
      const instance = engine.createInstance('approval-workflow', {
        orderId: 'ORD-001',
        amount: 1000,
        user: { id: 'user-001', role: 'user' }
      })

      expect(instance.currentState).toBe('draft')
      expect(instance.status).toBe('running')

      // 3. 提交审批
      const pendingInstance = await engine.triggerTransition(instance.id, 'submit')
      expect(pendingInstance.currentState).toBe('pending')
      expect(pendingInstance.history).toHaveLength(1)
      expect(pendingInstance.history[0].event).toBe('submit')

      // 4. 经理批准（更新上下文）
      const updatedInstance = engine.getInstance(instance.id)!
      updatedInstance.context.user = { id: 'manager-001', role: 'manager' }

      const approvedInstance = await engine.triggerTransition(instance.id, 'approve')
      expect(approvedInstance.currentState).toBe('approved')
      expect(approvedInstance.status).toBe('completed')
      expect(approvedInstance.endTime).toBeDefined()
      expect(approvedInstance.history).toHaveLength(2)
    })

    it('应该支持拒绝后重新编辑流程', async () => {
      engine.registerWorkflow(approvalWorkflow)
      const instance = engine.createInstance('approval-workflow')

      // 提交 -> 待审批
      await engine.triggerTransition(instance.id, 'submit')

      // 拒绝
      const rejectedInstance = await engine.triggerTransition(instance.id, 'reject')
      expect(rejectedInstance.currentState).toBe('rejected')
      expect(rejectedInstance.status).toBe('completed')

      // 重新编辑
      const revisedInstance = await engine.triggerTransition(instance.id, 'revise')
      expect(revisedInstance.currentState).toBe('draft')
      expect(revisedInstance.status).toBe('running')
      expect(revisedInstance.history).toHaveLength(3)
    })
  })

  describe('工作流条件验证', () => {
    it('应该验证转换条件', async () => {
      engine.registerWorkflow(approvalWorkflow)
      const instance = engine.createInstance('approval-workflow', {
        user: { id: 'user-001', role: 'user' }
      })

      await engine.triggerTransition(instance.id, 'submit')

      // 普通用户尝试批准应该失败
      await expect(
        engine.triggerTransition(instance.id, 'approve')
      ).rejects.toThrow('转换条件不满足')
    })
  })

  describe('工作流事件系统', () => {
    it('应该触发工作流事件', async (done) => {
      engine.registerWorkflow(approvalWorkflow)

      let eventFired = false
      engine.on('state.changed', (instance) => {
        eventFired = true
        expect(instance.currentState).toBe('pending')
        done()
      })

      const instance = engine.createInstance('approval-workflow')
      await engine.triggerTransition(instance.id, 'submit')

      expect(eventFired).toBe(true)
    })

    it('应该在完成时触发completed事件', async (done) => {
      engine.registerWorkflow(approvalWorkflow)

      engine.on('instance.completed', (instance) => {
        expect(instance.status).toBe('completed')
        expect(instance.currentState).toBe('approved')
        done()
      })

      const instance = engine.createInstance('approval-workflow', {
        user: { id: 'manager', role: 'manager' }
      })
      await engine.triggerTransition(instance.id, 'submit')
      await engine.triggerTransition(instance.id, 'approve')
    })
  })

  describe('工作流实例管理', () => {
    it('应该支持多实例并发管理', () => {
      engine.registerWorkflow(approvalWorkflow)

      const instance1 = engine.createInstance('approval-workflow', { orderId: 'ORD-001' })
      const instance2 = engine.createInstance('approval-workflow', { orderId: 'ORD-002' })
      const instance3 = engine.createInstance('approval-workflow', { orderId: 'ORD-003' })

      const allInstances = engine.getAllInstances()
      expect(allInstances).toHaveLength(3)

      const runningInstances = engine.getRunningInstances()
      expect(runningInstances).toHaveLength(3)
    })

    it('应该支持取消工作流实例', () => {
      engine.registerWorkflow(approvalWorkflow)
      const instance = engine.createInstance('approval-workflow')

      engine.cancelInstance(instance.id)

      const cancelled = engine.getInstance(instance.id)
      expect(cancelled?.status).toBe('cancelled')
      expect(cancelled?.endTime).toBeDefined()
    })

    it('应该支持清理已完成实例', async () => {
      engine.registerWorkflow(approvalWorkflow)
      
      const instance = engine.createInstance('approval-workflow', {
        user: { role: 'manager' }
      })
      await engine.triggerTransition(instance.id, 'submit')
      await engine.triggerTransition(instance.id, 'approve')

      const count = engine.clearCompletedInstances()
      expect(count).toBe(1)
      expect(engine.getAllInstances()).toHaveLength(0)
    })
  })
})
