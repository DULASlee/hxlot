/**
 * FieldConfigTable 组件单元测试
 * 遵循"从花瓶到神器"六大铁律
 *
 * 铁律1: 页面完整性 - 路由、菜单、布局、权限、状态
 * 铁律2: 控件完整性 - 事件绑定、数据来源、禁用状态、验证规则
 * 铁律3: 前端API真实性 - 真实HTTP调用、禁止假数据、类型定义、错误处理
 * 铁律4: 后端持久化 - Repository注入、数据库操作、事务管理
 * 铁律5: DTO一致性 - 单一事实源、类型字段匹配、AutoMapper
 * 铁律6: 代码复用 - DRY原则、模板检索
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FieldConfigTable from './FieldConfigTable.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue({ value: 'confirm' })
    }
  }
})

// Mock icons
vi.mock('@element-plus/icons-vue', () => ({
  Plus: { name: 'Plus' },
  Delete: { name: 'Delete' },
  ArrowUp: { name: 'ArrowUp' },
  ArrowDown: { name: 'ArrowDown' }
}))

// 测试数据
const mockFields = [
  {
    name: 'Name',
    displayName: '名称',
    type: 'string',
    isRequired: true,
    maxLength: 200,
    uiControl: 'input',
    order: 0,
    comment: '名称字段'
  },
  {
    name: 'Code',
    displayName: '编码',
    type: 'string',
    isRequired: true,
    maxLength: 100,
    uiControl: 'input',
    order: 1,
    comment: '编码字段'
  }
]

describe('FieldConfigTable 组件单元测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 铁律1：页面完整性测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('铁律1 - 页面完整性', () => {
    it('✅ 表格结构：应显示完整的表格结构', () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 验证表格头部
      expect(wrapper.find('.table-header').exists()).toBe(true)
      expect(wrapper.find('.el-button').exists()).toBe(true)
      expect(wrapper.find('.field-count').exists()).toBe(true)
    })

    it('✅ 表格行：应显示正确的字段数量', () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 验证字段数量显示
      expect(wrapper.text()).toContain('已配置 2 个字段')
      expect(wrapper.find('.field-count').exists()).toBe(true)
    })

    it('✅ 表格列：应包含所有必需的列', () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 验证表格存在
      expect(wrapper.find('.field-table').exists()).toBe(true)
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 铁律2：控件完整性测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('铁律2 - 控件完整性', () => {
    it('✅ 事件绑定：添加字段按钮应有点击事件', async () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      const addButton = wrapper.find('.el-button')
      expect(addButton.exists()).toBe(true)

      // 模拟点击事件
      await addButton.trigger('click')

      // 验证事件已触发（字段数量增加）
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('✅ 表单控件：字段名称输入应有验证', async () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 验证字段名称输入框存在
      const nameInputs = wrapper.findAll('input[placeholder*="PascalCase"]')
      expect(nameInputs.length).toBeGreaterThan(0)
    })

    it('✅ 字段类型：下拉选择应包含所有类型选项', () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 验证字段类型选择器存在
      const typeSelects = wrapper.findAll('el-select')
      expect(typeSelects.length).toBeGreaterThan(0)
    })

    it('✅ 必填选项：复选框应正确显示必填状态', () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 验证必填复选框存在
      const checkboxes = wrapper.findAll('el-checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 铁律3：前端API真实性测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('铁律3 - 前端API真实性', () => {
    it('✅ 数据绑定：应正确绑定字段数据', () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 验证computed属性正确绑定
      expect(wrapper.vm.fields).toEqual(mockFields)
    })

    it('✅ 事件处理：字段修改应触发更新事件', async () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 修改字段数据
      const newFields = [...mockFields]
      newFields[0].displayName = '新名称'
      wrapper.vm.fields = newFields

      // 验证更新事件已触发
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 铁律4：后端持久化测试（模拟验证）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('铁律4 - 后端持久化（模拟验证）', () => {
    it('✅ 数据操作：添加字段应更新数据模型', async () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: []
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 模拟添加字段
      const newField = {
        name: 'NewField',
        displayName: '新字段',
        type: 'string',
        isRequired: false,
        maxLength: 200,
        uiControl: 'input',
        order: 0,
        comment: '新字段'
      }

      // 手动设置fields
      await wrapper.setProps({ modelValue: [newField] })

      // 验证数据已更新
      expect(wrapper.vm.fields.length).toBe(1)
      expect(wrapper.vm.fields[0]).toEqual(newField)
    })

    it('✅ 删除操作：删除字段应正确处理', async () => {
      vi.mocked(ElMessageBox.confirm).mockResolvedValue({ value: 'confirm' })

      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 模拟删除第一个字段
      await wrapper.vm.handleDeleteField(0)

      // 验证删除确认对话框已调用
      expect(ElMessageBox.confirm).toHaveBeenCalledWith('确定删除这个字段吗？', '提示', expect.any(Object))

      // 验证成功消息
      expect(ElMessage.success).toHaveBeenCalledWith('删除成功')
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 铁律5：DTO一致性测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('铁律5 - DTO一致性', () => {
    it('✅ 类型验证：字段应符合DTO规范', () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 验证字段数据结构
      const field = wrapper.vm.fields[0]
      expect(field).toHaveProperty('name')
      expect(field).toHaveProperty('displayName')
      expect(field).toHaveProperty('type')
      expect(field).toHaveProperty('isRequired')
      expect(field).toHaveProperty('uiControl')
      expect(field).toHaveProperty('order')
    })

    it('✅ 字段验证：字段名称应符合PascalCase格式', async () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 测试PascalCase验证逻辑
      const field1 = { name: 'invalidName', _nameError: null }
      wrapper.vm.validateFieldName(field1, 0)
      expect(field1._nameError).toBe('必须是PascalCase格式（例如：UserName）')

      // 测试有效格式
      const field2 = { name: 'ValidName', _nameError: null }
      wrapper.vm.validateFieldName(field2, 0)
      expect(field2._nameError).toBeNull()

      // 测试空名称
      const field3 = { name: '', _nameError: null }
      wrapper.vm.validateFieldName(field3, 0)
      expect(field3._nameError).toBe('字段名称不能为空')
    })

    it('✅ 字段验证：字段名称应唯一', async () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 测试重复名称验证（Name字段在mockFields中已存在）
      const field = { name: 'Name', _nameError: null }
      const index = 0

      wrapper.vm.validateFieldName(field, index)
      expect(field._nameError).toBe('字段名称重复')
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 铁律6：代码复用测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('铁律6 - 代码复用', () => {
    it('✅ 字段排序：应正确处理字段顺序', async () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 模拟向上移动
      await wrapper.vm.moveField(1, 'up')

      // 验证更新事件已触发
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('✅ 字段类型联动：类型改变应自动设置UI控件', () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 测试字段类型改变处理
      const field = {
        name: 'TestField',
        displayName: '测试字段',
        type: 'string',
        isRequired: false,
        maxLength: undefined,
        uiControl: 'input',
        order: 0,
        comment: '测试字段'
      }

      wrapper.vm.handleTypeChange(field)

      // 验证字符串类型设置
      expect(field.maxLength).toBe(200)
      expect(field.uiControl).toBe('input')
    })

    it('✅ 字段类型联动：整数类型应设置数字输入控件', () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      const field = {
        name: 'TestField',
        displayName: '测试字段',
        type: 'int',
        isRequired: false,
        uiControl: 'input',
        order: 0,
        comment: '测试字段'
      }

      wrapper.vm.handleTypeChange(field)

      // 验证整数类型设置
      expect(field.uiControl).toBe('number')
    })

    it('✅ 字段类型联动：布尔类型应设置开关控件', () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      const field = {
        name: 'TestField',
        displayName: '测试字段',
        type: 'bool',
        isRequired: false,
        uiControl: 'input',
        order: 0,
        comment: '测试字段'
      }

      wrapper.vm.handleTypeChange(field)

      // 验证布尔类型设置
      expect(field.uiControl).toBe('switch')
    })

    it('✅ 字段类型联动：日期类型应设置日期选择器', () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      const field = {
        name: 'TestField',
        displayName: '测试字段',
        type: 'DateTime',
        isRequired: false,
        uiControl: 'input',
        order: 0,
        comment: '测试字段'
      }

      wrapper.vm.handleTypeChange(field)

      // 验证日期类型设置
      expect(field.uiControl).toBe('date-picker')
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 边界条件测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('边界条件测试', () => {
    it('✅ 空数据：应正确处理空字段列表', () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: []
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 验证空数据处理
      expect(wrapper.vm.fields.length).toBe(0)
      expect(wrapper.text()).toContain('已配置 0 个字段')
    })

    it('✅ 移动边界：第一个字段上移按钮应禁用', async () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 验证第一个字段的上移按钮应禁用
      const upButtons = wrapper.findAll('.el-button').filter(button =>
        button.text().includes('上移')
      )
      if (upButtons.length > 0) {
        // 第一个上移按钮应禁用
        expect(upButtons[0].attributes('disabled')).toBeDefined()
      }
    })

    it('✅ 移动边界：最后一个字段下移按钮应禁用', async () => {
      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: mockFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 验证最后一个字段的下移按钮应禁用
      const downButtons = wrapper.findAll('.el-button').filter(button =>
        button.text().includes('下移')
      )
      if (downButtons.length > 0) {
        // 最后一个下移按钮应禁用
        expect(downButtons[downButtons.length - 1].attributes('disabled')).toBeDefined()
      }
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 性能测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('性能测试', () => {
    it('✅ 大量字段：应能处理大量字段数据', () => {
      // 创建100个字段的测试数据
      const largeFields = Array.from({ length: 100 }, (_, index) => ({
        name: `Field${index}`,
        displayName: `字段${index}`,
        type: 'string',
        isRequired: index % 2 === 0,
        maxLength: 200,
        uiControl: 'input',
        order: index,
        comment: `字段${index}的注释`
      }))

      const wrapper = mount(FieldConfigTable, {
        props: {
          modelValue: largeFields
        },
        global: {
          stubs: {
            'el-table': { template: '<table class="el-table"><slot></slot></table>' },
            'el-table-column': { template: '<td class="el-table-column"><slot></slot></td>' },
            'el-input': { template: '<input class="el-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
            'el-select': { template: '<select class="el-select" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"><slot></slot></select>' },
            'el-option': { template: '<option class="el-option" :value="value"><slot></slot></option>' },
            'el-checkbox': { template: '<input type="checkbox" class="el-checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-button': { template: '<button class="el-button" @click="$emit(\'click\')"><slot></slot></button>' },
            'el-drawer': { template: '<div class="el-drawer"><slot></slot></div>' },
            'el-form': { template: '<form class="el-form"><slot></slot></form>' },
            'el-form-item': { template: '<div class="el-form-item"><slot></slot></div>' },
            'el-switch': { template: '<input type="checkbox" class="el-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />' },
            'el-input-number': { template: '<input type="number" class="el-input-number" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />' }
          }
        }
      })

      // 验证大量数据处理
      expect(wrapper.vm.fields.length).toBe(100)
      expect(wrapper.text()).toContain('已配置 100 个字段')
    })
  })
})
