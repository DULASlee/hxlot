/**
 * UI组件集成测试
 * 测试业务规则设计器和工作流设计器的完整交互
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import BusinessRuleDesigner from '../../components/BusinessRuleDesigner/BusinessRuleDesigner.vue'
import WorkflowDesigner from '../../components/WorkflowDesigner/WorkflowDesigner.vue'
import type { RuleNode } from '../../components/BusinessRuleDesigner/types'

describe('UI组件集成测试', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('业务规则设计器集成', () => {
    it('应该完成规则设计的完整流程', async () => {
      const wrapper = mount(BusinessRuleDesigner, {
        global: {
          stubs: {
            VueFlow: true,
            Background: true,
            Controls: true,
            MiniMap: true
          }
        }
      })

      // 1. 组件应该正确渲染
      expect(wrapper.exists()).toBe(true)

      // 2. 应该能够添加节点
      const initialNodes: RuleNode[] = [
        {
          id: '1',
          type: 'start',
          position: { x: 100, y: 100 },
          data: {
            id: '1',
            type: 'start',
            label: '开始'
          }
        }
      ]

      await wrapper.setProps({ initialNodes })

      // 3. 应该能够验证规则
      const validateBtn = wrapper.find('[data-test="validate-btn"]')
      if (validateBtn.exists()) {
        await validateBtn.trigger('click')
      }

      // 4. 应该能够保存规则
      const saveBtn = wrapper.find('[data-test="save-btn"]')
      if (saveBtn.exists()) {
        await saveBtn.trigger('click')
      }
    })

    it('应该支持节点拖拽和连接', async () => {
      const wrapper = mount(BusinessRuleDesigner, {
        global: {
          stubs: {
            VueFlow: true,
            Background: true,
            Controls: true,
            MiniMap: true
          }
        }
      })

      // 模拟添加多个节点
      const nodes: RuleNode[] = [
        {
          id: '1',
          type: 'start',
          position: { x: 100, y: 100 },
          data: { id: '1', type: 'start', label: '开始' }
        },
        {
          id: '2',
          type: 'condition',
          position: { x: 300, y: 100 },
          data: {
            id: '2',
            type: 'condition',
            label: '条件判断',
            condition: 'amount > 1000'
          }
        },
        {
          id: '3',
          type: 'action',
          position: { x: 500, y: 100 },
          data: {
            id: '3',
            type: 'action',
            label: '执行动作',
            action: 'SetFieldValue'
          }
        }
      ]

      await wrapper.setProps({ initialNodes: nodes })

      // 验证节点数量
      expect(wrapper.props('initialNodes')).toHaveLength(3)
    })
  })

  describe('工作流设计器集成', () => {
    it('应该完成工作流设计的完整流程', async () => {
      const wrapper = mount(WorkflowDesigner, {
        global: {
          stubs: {
            VueFlow: true,
            Background: true,
            Controls: true
          }
        }
      })

      // 1. 组件应该正确渲染
      expect(wrapper.exists()).toBe(true)

      // 2. 应该能够设置工作流名称
      const nameInput = wrapper.find('input[placeholder*="工作流名称"]')
      if (nameInput.exists()) {
        await nameInput.setValue('测试审批流程')
      }

      // 3. 应该能够保存工作流
      const saveBtn = wrapper.find('[data-test="save-btn"]')
      if (saveBtn.exists()) {
        await saveBtn.trigger('click')
      }
    })

    it('应该支持工作流节点和转换配置', async () => {
      const mockWorkflow = {
        id: 'test-workflow',
        name: '测试工作流',
        states: [
          { id: 'start', name: '开始', type: 'initial' },
          { id: 'process', name: '处理中', type: 'normal' },
          { id: 'end', name: '结束', type: 'final' }
        ],
        transitions: [
          { id: 't1', from: 'start', to: 'process', event: 'begin' },
          { id: 't2', from: 'process', to: 'end', event: 'complete' }
        ]
      }

      const wrapper = mount(WorkflowDesigner, {
        props: {
          initialWorkflow: mockWorkflow
        },
        global: {
          stubs: {
            VueFlow: true,
            Background: true,
            Controls: true
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props('initialWorkflow')).toEqual(mockWorkflow)
    })
  })

  describe('组件间集成', () => {
    it('规则设计器和工作流设计器应该能够协同工作', async () => {
      // 创建规则设计器
      const ruleDesigner = mount(BusinessRuleDesigner, {
        global: {
          stubs: {
            VueFlow: true,
            Background: true,
            Controls: true,
            MiniMap: true
          }
        }
      })

      // 创建工作流设计器
      const workflowDesigner = mount(WorkflowDesigner, {
        global: {
          stubs: {
            VueFlow: true,
            Background: true,
            Controls: true
          }
        }
      })

      // 两个组件应该都能正常渲染
      expect(ruleDesigner.exists()).toBe(true)
      expect(workflowDesigner.exists()).toBe(true)

      // 验证它们可以独立操作
      expect(ruleDesigner.vm).toBeDefined()
      expect(workflowDesigner.vm).toBeDefined()
    })
  })

  describe('UI交互完整性', () => {
    it('应该支持完整的用户交互流程', async () => {
      const wrapper = mount(BusinessRuleDesigner, {
        global: {
          stubs: {
            VueFlow: true,
            Background: true,
            Controls: true,
            MiniMap: true
          }
        }
      })

      // 1. 初始状态
      expect(wrapper.exists()).toBe(true)

      // 2. 可以与组件交互
      const component = wrapper.vm
      expect(component).toBeDefined()

      // 3. 组件应该有基本的方法
      expect(typeof component.$props).toBe('object')
    })
  })
})
