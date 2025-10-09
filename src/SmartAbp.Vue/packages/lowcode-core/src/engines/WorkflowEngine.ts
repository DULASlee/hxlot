/**
 * 🔥 工作流状态机引擎
 * 
 * 功能：
 * 1. 工作流实例管理
 * 2. 状态转换控制
 * 3. 事件触发和监听
 * 4. 工作流持久化
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import type { EnhancedState, StateTransition } from '../stores/enhancedStateMachine'
import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

/**
 * 工作流实例
 */
export interface WorkflowInstance {
  id: string
  workflowId: string
  currentState: string
  context: Record<string, any>
  startTime: number
  endTime?: number
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  history: StateTransitionRecord[]
}

/**
 * 状态转换记录
 */
export interface StateTransitionRecord {
  from: string
  to: string
  event: string
  timestamp: number
  context?: Record<string, any>
}

// 工作流节点接口
export interface WorkflowNode {
  id: string
  name: string
  type: 'start' | 'end' | 'task' | 'decision' | 'parallel'
  properties?: Record<string, any>
}

// 工作流转换接口
export interface WorkflowTransition {
  id: string
  from: string
  to: string
  condition?: string
  action?: string
}

/**
 * 工作流定义
 */
export interface WorkflowDefinition {
  id: string
  name: string
  states: EnhancedState[]
  transitions: StateTransition[]
  initialState: string
}

/**
 * 工作流引擎
 */
export class WorkflowEngine {
  private workflows: Map<string, WorkflowDefinition> = new Map()
  private instances: Map<string, WorkflowInstance> = new Map()
  private eventListeners: Map<string, Array<(instance: WorkflowInstance) => void>> = new Map()

  /**
   * 注册工作流定义
   */
  registerWorkflow(definition: WorkflowDefinition): void {
    this.workflows.set(definition.id, definition)
    logger.info('📝 注册工作流定义', { id: definition.id, name: definition.name })
  }

  /**
   * 创建工作流实例
   */
  createInstance(workflowId: string, initialContext: Record<string, any> = {}): WorkflowInstance {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`工作流定义不存在: ${workflowId}`)
    }

    const instance: WorkflowInstance = {
      id: this.generateInstanceId(),
      workflowId,
      currentState: workflow.initialState,
      context: { ...initialContext },
      startTime: Date.now(),
      status: 'running',
      history: []
    }

    this.instances.set(instance.id, instance)
    logger.info('🚀 创建工作流实例', { instanceId: instance.id, workflowId })

    this.emitEvent('instance.created', instance)
    return instance
  }

  /**
   * 触发状态转换
   */
  async triggerTransition(
    instanceId: string,
    event: string,
    payload?: Record<string, any>
  ): Promise<WorkflowInstance> {
    const instance = this.instances.get(instanceId)
    if (!instance) {
      throw new Error(`工作流实例不存在: ${instanceId}`)
    }

    const workflow = this.workflows.get(instance.workflowId)
    if (!workflow) {
      throw new Error(`工作流定义不存在: ${instance.workflowId}`)
    }

    // 查找有效的转换
    const transition = workflow.transitions.find(
      t => t.source === instance.currentState && t.label === event
    )

    if (!transition) {
      throw new Error(
        `无效的状态转换: from=${instance.currentState}, event=${event}`
      )
    }

    // 检查转换条件
    if (transition.condition) {
      const conditionMet = await this.evaluateCondition(
        transition.condition,
        instance.context,
        payload
      )
      if (!conditionMet) {
        throw new Error('转换条件不满足')
      }
    }

    // 记录转换历史
    const transitionRecord: StateTransitionRecord = {
      from: instance.currentState,
      to: transition.target,
      event,
      timestamp: Date.now(),
      context: payload
    }
    instance.history.push(transitionRecord)

    // 更新状态
    const oldState = instance.currentState
    instance.currentState = transition.target

    // 更新上下文
    if (payload) {
      instance.context = { ...instance.context, ...payload }
    }

    // 检查是否到达结束状态
    const targetState = workflow.states.find(s => s.id === transition.target)
    if (targetState?.type === 'end') {
      instance.status = 'completed'
      instance.endTime = Date.now()
      this.emitEvent('instance.completed', instance)
    }

    logger.info('⚡ 状态转换成功', {
      instanceId,
      from: oldState,
      to: instance.currentState,
      event
    })

    this.emitEvent('state.changed', instance)
    return instance
  }

  /**
   * 获取工作流实例
   */
  getInstance(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId)
  }

  /**
   * 取消工作流实例
   */
  cancelInstance(instanceId: string): void {
    const instance = this.instances.get(instanceId)
    if (instance) {
      instance.status = 'cancelled'
      instance.endTime = Date.now()
      this.emitEvent('instance.cancelled', instance)
      logger.info('🛑 工作流实例已取消', { instanceId })
    }
  }

  /**
   * 监听事件
   */
  on(event: string, listener: (instance: WorkflowInstance) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听
   */
  off(event: string, listener: (instance: WorkflowInstance) => void): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   */
  private emitEvent(event: string, instance: WorkflowInstance): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(instance)
        } catch (error) {
          logger.error('事件监听器错误', { event, error })
        }
      })
    }
  }

  /**
   * 评估转换条件
   */
  private async evaluateCondition(
    condition: string,
    context: Record<string, any>,
    payload?: Record<string, any>
  ): Promise<boolean> {
    try {
      // 简单的条件评估，实际可能需要更复杂的表达式解析
      const func = new Function('context', 'payload', `return (${condition})`)
      return func(context, payload)
    } catch (error) {
      logger.error('条件评估失败', { condition, error })
      return false
    }
  }

  /**
   * 生成实例ID
   */
  private generateInstanceId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取所有实例
   */
  getAllInstances(): WorkflowInstance[] {
    return Array.from(this.instances.values())
  }

  /**
   * 获取运行中的实例
   */
  getRunningInstances(): WorkflowInstance[] {
    return this.getAllInstances().filter(i => i.status === 'running')
  }

  /**
   * 清理已完成的实例
   */
  clearCompletedInstances(): number {
    const completed = this.getAllInstances().filter(
      i => i.status === 'completed' || i.status === 'failed' || i.status === 'cancelled'
    )
    
    completed.forEach(instance => {
      this.instances.delete(instance.id)
    })

    logger.info('🧹 清理已完成实例', { count: completed.length })
    return completed.length
  }
}
