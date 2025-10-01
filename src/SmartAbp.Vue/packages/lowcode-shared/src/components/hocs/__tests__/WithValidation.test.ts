/**
 * WithValidation HOC 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { WithValidation, useValidation } from '../WithValidation'

// 简单输入组件
const SimpleInput = {
  name: 'SimpleInput',
  props: {
    modelValue: String
  },
  emits: ['update:modelValue'],
  template: `
    <input 
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="test-input"
    />
  `
}

describe('WithValidation HOC', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础功能', () => {
    it('应该正确渲染被包装组件', () => {
      const WrappedInput = WithValidation(SimpleInput)
      const wrapper = mount(WrappedInput, {
        props: {
          modelValue: ''
        }
      })

      expect(wrapper.find('.test-input').exists()).toBe(true)
    })

    it('应该支持v-model双向绑定', async () => {
      const WrappedInput = WithValidation(SimpleInput)
      const wrapper = mount(WrappedInput, {
        props: {
          modelValue: 'initial',
          'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value })
        }
      })

      const input = wrapper.find('.test-input')
      await input.setValue('new value')

      expect(wrapper.props('modelValue')).toBe('new value')
    })
  })

  describe('必填验证', () => {
    it('应该验证必填字段', async () => {
      const WrappedInput = WithValidation(SimpleInput)
      const wrapper = mount(WrappedInput, {
        props: {
          modelValue: '',
          required: true,
          errorMessage: '此字段为必填项',
          validateTrigger: 'blur'
        }
      })

      const input = wrapper.find('.test-input')
      await input.trigger('blur')
      await nextTick()

      expect(wrapper.find('.validation-error').exists()).toBe(true)
      expect(wrapper.text()).toContain('此字段为必填项')
    })

    it('应该在有值时通过必填验证', async () => {
      const WrappedInput = WithValidation(SimpleInput)
      const wrapper = mount(WrappedInput, {
        props: {
          modelValue: 'test',
          required: true,
          validateTrigger: 'blur'
        }
      })

      const input = wrapper.find('.test-input')
      await input.trigger('blur')
      await nextTick()

      expect(wrapper.find('.validation-error').exists()).toBe(false)
    })
  })

  describe('规则验证', () => {
    it('应该验证邮箱格式', async () => {
      const WrappedInput = WithValidation(SimpleInput)
      const rules = [
        { type: 'email' as const, message: '请输入有效的邮箱地址' }
      ]
      
      const wrapper = mount(WrappedInput, {
        props: {
          modelValue: 'invalid-email',
          rules,
          validateTrigger: 'blur'
        }
      })

      await wrapper.find('.test-input').trigger('blur')
      await nextTick()

      expect(wrapper.text()).toContain('请输入有效的邮箱地址')
    })

    it('应该验证URL格式', async () => {
      const WrappedInput = WithValidation(SimpleInput)
      const rules = [
        { type: 'url' as const, message: '请输入有效的URL' }
      ]
      
      const wrapper = mount(WrappedInput, {
        props: {
          modelValue: 'not-a-url',
          rules,
          validateTrigger: 'blur'
        }
      })

      await wrapper.find('.test-input').trigger('blur')
      await nextTick()

      expect(wrapper.text()).toContain('请输入有效的URL')
    })

    it('应该验证正则表达式', async () => {
      const WrappedInput = WithValidation(SimpleInput)
      const rules = [
        { type: 'pattern' as const, pattern: /^\d+$/, message: '只能输入数字' }
      ]
      
      const wrapper = mount(WrappedInput, {
        props: {
          modelValue: 'abc',
          rules,
          validateTrigger: 'blur'
        }
      })

      await wrapper.find('.test-input').trigger('blur')
      await nextTick()

      expect(wrapper.text()).toContain('只能输入数字')
    })

    it('应该支持自定义验证器', async () => {
      const WrappedInput = WithValidation(SimpleInput)
      const customValidator = vi.fn(() => false)
      const rules = [
        { 
          type: 'custom' as const, 
          validator: customValidator,
          message: '自定义验证失败' 
        }
      ]
      
      const wrapper = mount(WrappedInput, {
        props: {
          modelValue: 'test',
          rules,
          validateTrigger: 'blur'
        }
      })

      await wrapper.find('.test-input').trigger('blur')
      await nextTick()

      expect(customValidator).toHaveBeenCalledWith('test')
      expect(wrapper.text()).toContain('自定义验证失败')
    })
  })

  describe('验证触发时机', () => {
    it('应该在blur时触发验证', async () => {
      const WrappedInput = WithValidation(SimpleInput)
      const wrapper = mount(WrappedInput, {
        props: {
          modelValue: '',
          required: true,
          validateTrigger: 'blur'
        }
      })

      await wrapper.find('.test-input').trigger('blur')
      await nextTick()

      expect(wrapper.find('.validation-error').exists()).toBe(true)
    })

    it('应该在change时触发验证', async () => {
      const WrappedInput = WithValidation(SimpleInput)
      const wrapper = mount(WrappedInput, {
        props: {
          modelValue: '',
          required: true,
          validateTrigger: 'change'
        }
      })

      await wrapper.find('.test-input').trigger('input')
      await nextTick()

      expect(wrapper.find('.validation-error').exists()).toBe(true)
    })
  })

  describe('事件处理', () => {
    it('应该触发validation-change事件', async () => {
      const WrappedInput = WithValidation(SimpleInput)
      const wrapper = mount(WrappedInput, {
        props: {
          modelValue: '',
          required: true,
          validateTrigger: 'blur'
        }
      })

      await wrapper.find('.test-input').trigger('blur')
      await nextTick()

      const events = wrapper.emitted('validation-change')
      expect(events).toBeTruthy()
      expect(events?.[0][0]).toHaveProperty('valid', false)
    })
  })
})

describe('useValidation Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该初始化为空错误状态', () => {
    const { errors, touchedFields, isValid } = useValidation()
    
    expect(errors.value).toEqual({})
    expect(touchedFields.value.size).toBe(0)
    expect(isValid.value).toBe(true)
  })

  it('应该能够验证单个字段', async () => {
    const { errors, validateField, isFieldValid } = useValidation()
    
    const rules = [
      { type: 'required' as const, message: '必填项' }
    ]
    
    await validateField('username', '', rules)
    
    expect(errors.value.username).toContain('必填项')
    expect(isFieldValid('username')).toBe(false)
  })

  it('应该能够验证多个字段', async () => {
    const { errors, validateField } = useValidation()
    
    const usernameRules = [{ type: 'required' as const, message: '用户名必填' }]
    const emailRules = [{ type: 'email' as const, message: '邮箱格式错误' }]
    
    await validateField('username', '', usernameRules)
    await validateField('email', 'invalid', emailRules)
    
    expect(errors.value.username).toContain('用户名必填')
    expect(errors.value.email).toContain('邮箱格式错误')
  })

  it('应该能够清除字段错误', () => {
    const { errors, validateField, clearFieldError } = useValidation()
    
    const rules = [{ type: 'required' as const, message: '必填项' }]
    validateField('username', '', rules)
    
    expect(errors.value.username).toBeTruthy()
    
    clearFieldError('username')
    
    expect(errors.value.username).toBeUndefined()
  })

  it('应该能够清除所有错误', () => {
    const { errors, validateField, clearErrors } = useValidation()
    
    const rules = [{ type: 'required' as const, message: '必填项' }]
    validateField('field1', '', rules)
    validateField('field2', '', rules)
    
    expect(Object.keys(errors.value).length).toBe(2)
    
    clearErrors()
    
    expect(Object.keys(errors.value).length).toBe(0)
  })

  it('应该能够验证所有字段', async () => {
    const { validateAllFields } = useValidation()
    
    const fields = {
      username: { value: '', rules: [{ type: 'required' as const, message: '必填' }] },
      email: { value: 'test@example.com', rules: [{ type: 'email' as const, message: '邮箱错误' }] }
    }
    
    const result = await validateAllFields(fields)
    
    expect(result.valid).toBe(false)
    expect(result.errors.username).toBeTruthy()
    expect(result.errors.email).toBeFalsy()
  })

  it('应该跟踪已触摸的字段', async () => {
    const { touchedFields, validateField } = useValidation()
    
    const rules = [{ type: 'required' as const, message: '必填' }]
    
    await validateField('username', 'test', rules)
    
    expect(touchedFields.value.has('username')).toBe(true)
  })
})
