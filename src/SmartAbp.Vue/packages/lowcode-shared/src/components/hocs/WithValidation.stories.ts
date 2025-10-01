/**
 * WithValidation HOC Storybook Stories
 * 表单验证高阶组件可视化文档
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { WithValidation, useValidation } from './WithValidation'

// 简单输入组件
const SimpleInput = {
  name: 'SimpleInput',
  props: {
    modelValue: String,
  },
  emits: ['update:modelValue'],
  template: `
    <input 
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      style="padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; width: 100%;"
      placeholder="请输入..."
    />
  `
}

const WrappedInput = WithValidation(SimpleInput)

const meta: Meta<typeof WrappedInput> = {
  title: 'Packages/lowcode-shared/HOCs/WithValidation',
  component: WrappedInput,
  tags: ['autodocs'],
  argTypes: {
    required: {
      control: 'boolean',
      description: '是否必填',
    },
    rules: {
      control: 'object',
      description: '验证规则数组',
    },
    validateTrigger: {
      control: 'select',
      options: ['blur', 'change', 'submit'],
      description: '验证触发时机',
      table: {
        type: { summary: 'ValidateTrigger' },
        defaultValue: { summary: 'blur' },
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof WrappedInput>

/**
 * 基础示例 - 必填验证
 */
export const Required: Story = {
  render: () => ({
    components: { WithValidation: WrappedInput },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `
      <div style="padding: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: bold;">
          用户名（必填）
        </label>
        <WithValidation 
          v-model="value"
          :required="true"
          error-message="用户名不能为空"
          validate-trigger="blur"
        />
        <p style="margin-top: 10px; color: #909399;">当前值: {{ value || '(空)' }}</p>
      </div>
    `,
  }),
}

/**
 * 邮箱验证
 */
export const EmailValidation: Story = {
  render: () => ({
    components: { WithValidation: WrappedInput },
    setup() {
      const email = ref('')
      const rules = [
        { type: 'required' as const, message: '邮箱不能为空' },
        { type: 'email' as const, message: '请输入有效的邮箱地址' }
      ]
      return { email, rules }
    },
    template: `
      <div style="padding: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: bold;">
          邮箱地址
        </label>
        <WithValidation 
          v-model="email"
          :rules="rules"
          validate-trigger="blur"
        />
        <p style="margin-top: 10px; color: #909399;">当前值: {{ email || '(空)' }}</p>
      </div>
    `,
  }),
}

/**
 * URL验证
 */
export const UrlValidation: Story = {
  render: () => ({
    components: { WithValidation: WrappedInput },
    setup() {
      const url = ref('')
      const rules = [
        { type: 'required' as const, message: 'URL不能为空' },
        { type: 'url' as const, message: '请输入有效的URL地址' }
      ]
      return { url, rules }
    },
    template: `
      <div style="padding: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: bold;">
          网站地址
        </label>
        <WithValidation 
          v-model="url"
          :rules="rules"
          validate-trigger="blur"
        />
        <p style="margin-top: 10px; color: #909399;">当前值: {{ url || '(空)' }}</p>
      </div>
    `,
  }),
}

/**
 * 正则验证
 */
export const PatternValidation: Story = {
  render: () => ({
    components: { WithValidation: WrappedInput },
    setup() {
      const phone = ref('')
      const rules = [
        { type: 'required' as const, message: '手机号不能为空' },
        { type: 'pattern' as const, pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
      ]
      return { phone, rules }
    },
    template: `
      <div style="padding: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: bold;">
          手机号码
        </label>
        <WithValidation 
          v-model="phone"
          :rules="rules"
          validate-trigger="blur"
        />
        <p style="margin-top: 10px; color: #909399;">当前值: {{ phone || '(空)' }}</p>
      </div>
    `,
  }),
}

/**
 * 自定义验证器
 */
export const CustomValidation: Story = {
  render: () => ({
    components: { WithValidation: WrappedInput },
    setup() {
      const password = ref('')
      const rules = [
        { type: 'required' as const, message: '密码不能为空' },
        {
          type: 'custom' as const,
          message: '密码长度必须在8-20个字符之间',
          validator: (value: string) => value.length >= 8 && value.length <= 20
        }
      ]
      return { password, rules }
    },
    template: `
      <div style="padding: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: bold;">
          密码（8-20个字符）
        </label>
        <WithValidation 
          v-model="password"
          :rules="rules"
          validate-trigger="blur"
        />
        <p style="margin-top: 10px; color: #909399;">当前长度: {{ password.length }}</p>
      </div>
    `,
  }),
}

/**
 * useValidation Composable示例
 */
export const UseValidationComposable: Story = {
  render: () => ({
    setup() {
      const { errors, validateField, clearErrors, isFieldValid } = useValidation()
      const username = ref('')
      const email = ref('')
      
      const rules = {
        username: [
          { type: 'required' as const, message: '用户名不能为空' }
        ],
        email: [
          { type: 'required' as const, message: '邮箱不能为空' },
          { type: 'email' as const, message: '请输入有效的邮箱地址' }
        ]
      }
      
      const handleValidate = async (field: string, value: string) => {
        await validateField(field, value, rules[field as keyof typeof rules])
      }
      
      return {
        username,
        email,
        errors,
        handleValidate,
        clearErrors,
        isFieldValid,
      }
    },
    template: `
      <div style="padding: 20px;">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">用户名</label>
          <input 
            v-model="username"
            @blur="handleValidate('username', username)"
            style="padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; width: 100%;"
            placeholder="请输入用户名"
          />
          <div v-if="errors.username && errors.username.length > 0" style="color: #f56c6c; margin-top: 5px;">
            {{ errors.username[0] }}
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">邮箱</label>
          <input 
            v-model="email"
            @blur="handleValidate('email', email)"
            style="padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px; width: 100%;"
            placeholder="请输入邮箱"
          />
          <div v-if="errors.email && errors.email.length > 0" style="color: #f56c6c; margin-top: 5px;">
            {{ errors.email[0] }}
          </div>
        </div>
        
        <button 
          @click="clearErrors"
          style="padding: 8px 16px; border-radius: 4px; border: 1px solid #409eff; background: #409eff; color: white; cursor: pointer;"
        >
          清除所有错误
        </button>
      </div>
    `,
  }),
}
