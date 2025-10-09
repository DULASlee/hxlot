/**
 * 工作流引擎单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { WorkflowEngine } from './WorkflowEngine'
import type { WorkflowDefinition, WorkflowInstance } from './WorkflowEngine'

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine
  let mockWorkflow: WorkflowDefinition

  beforeEach(() => {
    engine = new WorkflowEngine()
    
    mockWorkflow = {
      id: 'workflow1',
      name: '测试工作流',
      initialState: 'draft',
      states: [
        { id: 'draft', name: '草稿', type: 'normal', metadata: {} },
        { id: 'review', name: '审核中', type: 'normal', metadata: {} },
        { id: 'approved', name: '已批准', type: 'final', metadata: {} },
        { id: 'rejected', name: '已拒绝', type: 'final', metadata: {} }
      ],
      transitions: [
        { id: 't1', fromState: 'draft', toState: 'review', event: 'submit', label: '提交审核' },
        { id: 't2', fromState: 'review', toState: 'approved', event: 'approve', label: '批准' },
        { id: 't3', fromState: 'review', toState: 'rejected', event: 'reject', label: '拒绝' }
      ]
    }
  })

  describe('registerWorkflow', () => {
    it('应该成功注册工作流定义', () => {
      expect(() => engine.registerWorkflow(mockWorkflow)).not.toThrow()
    })

    it('应该允许覆盖已存在的工作流', () => {
      engine.registerWorkflow(mockWorkflow)
      expect(() => engine.registerWorkflow(mockWorkflow)).not.toThrow()
    })
  })

  describe('createInstance', () => {
    beforeEach(() => {
      engine.registerWorkflow(mockWorkflow)
    })

    it('应该成功创建工作流实例', () => {
      const instance = engine.createInstance('workflow1', { userId: 'user1' })

      expect(instance).toBeDefined()
      expect(instance.workflowId).toBe('workflow1')
      expect(instance.currentState).toBe('draft')
      expect(instance.status).toBe('running')
      expect(instance.context.userId).toBe('user1')
    })

    it('未注册的工作流应该抛出错误', () => {
      expect(() => engine.createInstance('invalid-workflow')).toThrow()
    })

    it('应该生成唯一的实例ID', () => {
      const instance1 = engine.createInstance('workflow1')
      const instance2 = engine.createInstance('workflow1')

      expect(instance1.id).not.toBe(instance2.id)
    })
  })

  describe('triggerTransition', () => {
    let instance: WorkflowInstance

    beforeEach(() => {
      engine.registerWorkflow(mockWorkflow)
      instance = engine.createInstance('workflow1')
    })

    it('应该成功触发有效的状态转换', async () => {
      const updatedInstance = await engine.triggerTransition(instance.id, 'submit')

      expect(updatedInstance.currentState).toBe('review')
      expect(updatedInstance.history).toHaveLength(1)
      expect(updatedInstance.history[0].event).toBe('submit')
    })

    it('应该拒绝无效的状态转换', async () => {
      await expect(
        engine.triggerTransition(instance.id, 'invalid-event')
      ).rejects.toThrow()
    })

    it('应该记录转换历史', async () => {
      await engine.triggerTransition(instance.id, 'submit')
      await engine.triggerTransition(instance.id, 'approve')

      const finalInstance = engine.getInstance(instance.id)
      expect(finalInstance?.history).toHaveLength(2)
      expect(finalInstance?.history[0].from).toBe('draft')
      expect(finalInstance?.history[1].from).toBe('review')
    })

    it('应该在到达最终状态时完成工作流', async () => {
      await engine.triggerTransition(instance.id, 'submit')
      const finalInstance = await engine.triggerTransition(instance.id, 'approve')

      expect(finalInstance.status).toBe('completed')
      expect(finalInstance.endTime).toBeDefined()
    })

    it('应该支持带条件的转换', async () => {
      const conditionalWorkflow: WorkflowDefinition = {
        ...mockWorkflow,
        transitions: [
          {
            id: 't1',
            fromState: 'draft',
            toState: 'review',
            event: 'submit',
            label: '提交审核',
            condition: 'context.amount > 1000'
          }
        ]
      }

      engine.registerWorkflow(conditionalWorkflow)
      const newInstance = engine.createInstance(conditionalWorkflow.id, { amount: 500 })

      await expect(
        engine.triggerTransition(newInstance.id, 'submit')
      ).rejects.toThrow('转换条件不满足')
    })
  })

  describe('getInstance', () => {
    it('应该返回存在的实例', () => {
      engine.registerWorkflow(mockWorkflow)
      const instance = engine.createInstance('workflow1')

      const retrieved = engine.getInstance(instance.id)
      expect(retrieved).toEqual(instance)
    })

    it('不存在的实例应该返回undefined', () => {
      const retrieved = engine.getInstance('nonexistent')
      expect(retrieved).toBeUndefined()
    })
  })

  describe('cancelInstance', () => {
    it('应该成功取消工作流实例', () => {
      engine.registerWorkflow(mockWorkflow)
      const instance = engine.createInstance('workflow1')

      engine.cancelInstance(instance.id)

      const cancelled = engine.getInstance(instance.id)
      expect(cancelled?.status).toBe('cancelled')
      expect(cancelled?.endTime).toBeDefined()
    })
  })

  describe('事件监听', () => {
    it('应该触发instance.created事件', (done) => {
      engine.registerWorkflow(mockWorkflow)
      
      engine.on('instance.created', (instance) => {
        expect(instance.workflowId).toBe('workflow1')
        done()
      })

      engine.createInstance('workflow1')
    })

    it('应该触发state.changed事件', async (done) => {
      engine.registerWorkflow(mockWorkflow)
      const instance = engine.createInstance('workflow1')

      engine.on('state.changed', (updatedInstance) => {
        expect(updatedInstance.currentState).toBe('review')
        done()
      })

      await engine.triggerTransition(instance.id, 'submit')
    })

    it('应该触发instance.completed事件', async (done) => {
      engine.registerWorkflow(mockWorkflow)
      const instance = engine.createInstance('workflow1')

      engine.on('instance.completed', (completedInstance) => {
        expect(completedInstance.status).toBe('completed')
        done()
      })

      await engine.triggerTransition(instance.id, 'submit')
      await engine.triggerTransition(instance.id, 'approve')
    })
  })

  describe('实例管理', () => {
    beforeEach(() => {
      engine.registerWorkflow(mockWorkflow)
    })

    it('应该返回所有实例', () => {
      engine.createInstance('workflow1')
      engine.createInstance('workflow1')

      const allInstances = engine.getAllInstances()
      expect(allInstances).toHaveLength(2)
    })

    it('应该返回运行中的实例', async () => {
      const instance1 = engine.createInstance('workflow1')
      const instance2 = engine.createInstance('workflow1')

      await engine.triggerTransition(instance1.id, 'submit')
      await engine.triggerTransition(instance1.id, 'approve') // 完成

      const runningInstances = engine.getRunningInstances()
      expect(runningInstances).toHaveLength(1)
      expect(runningInstances[0].id).toBe(instance2.id)
    })

    it('应该清理已完成的实例', async () => {
      const instance = engine.createInstance('workflow1')
      await engine.triggerTransition(instance.id, 'submit')
      await engine.triggerTransition(instance.id, 'approve')

      const count = engine.clearCompletedInstances()
      expect(count).toBe(1)
      expect(engine.getAllInstances()).toHaveLength(0)
    })
  })
})
