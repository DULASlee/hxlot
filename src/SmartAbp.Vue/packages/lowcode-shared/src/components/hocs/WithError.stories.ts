/**
 * WithError HOC Storybook Stories
 * 错误边界高阶组件可视化文档
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { WithError, useErrorHandler } from './WithError'

// 测试组件 - 正常组件
const NormalComponent = {
  name: 'NormalComponent',
  template: `
    <div style="padding: 20px; border: 1px dashed #67c23a; border-radius: 4px;">
      <h3 style="color: #67c23a;">✓ 正常组件</h3>
      <p>这是一个正常工作的组件</p>
    </div>
  `
}

// 测试组件 - 会抛出错误的组件
const ErrorComponent = {
  name: 'ErrorComponent',
  setup() {
    throw new Error('组件加载失败：模拟的错误')
  },
  template: `<div>这段代码不会被渲染</div>`
}

const WrappedNormalComponent = WithError(NormalComponent)
const WrappedErrorComponent = WithError(ErrorComponent)

const meta: Meta<typeof WrappedNormalComponent> = {
  title: 'Packages/lowcode-shared/HOCs/WithError',
  component: WrappedNormalComponent,
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'object',
      description: '初始错误对象',
    },
    errorDisplayMode: {
      control: 'select',
      options: ['inline', 'toast', 'modal', 'silent'],
      description: '错误显示模式',
      table: {
        type: { summary: 'ErrorDisplayMode' },
        defaultValue: { summary: 'inline' },
      },
    },
    retryable: {
      control: 'boolean',
      description: '是否可重试',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof WrappedNormalComponent>

/**
 * 基础示例 - 正常组件
 */
export const Normal: Story = {
  render: () => ({
    components: { WithError: WrappedNormalComponent },
    template: `
      <WithError>
        <div style="padding: 20px; border: 1px dashed #67c23a; border-radius: 4px;">
          <h3 style="color: #67c23a;">✓ 正常组件</h3>
          <p>这是一个正常工作的组件，没有错误</p>
        </div>
      </WithError>
    `,
  }),
}

/**
 * 错误捕获示例
 */
export const ErrorCapture: Story = {
  render: () => ({
    components: { WithError: WrappedErrorComponent },
    template: `
      <WithError error-display-mode="inline" :retryable="true">
        <div>这个组件会抛出错误</div>
      </WithError>
    `,
  }),
}

/**
 * 不同显示模式
 */
export const DisplayModes: Story = {
  render: () => ({
    setup() {
      const error = new Error('这是一个测试错误')
      return { error }
    },
    template: `
      <div style="display: flex; gap: 20px; flex-direction: column;">
        <div>
          <h4>Inline模式</h4>
          <WithError :error="error" error-display-mode="inline" :retryable="true">
            <div style="padding: 20px; border: 1px dashed #ccc;">内容区域</div>
          </WithError>
        </div>
        
        <div>
          <h4>Silent模式（静默）</h4>
          <WithError :error="error" error-display-mode="silent">
            <div style="padding: 20px; border: 1px dashed #ccc;">内容区域</div>
          </WithError>
        </div>
      </div>
    `,
  }),
}

/**
 * useErrorHandler Composable示例
 */
export const UseErrorHandlerComposable: Story = {
  render: () => ({
    setup() {
      const { error, hasError, handleError, clearError } = useErrorHandler()
      
      const triggerError = () => {
        handleError(new Error('手动触发的错误'), { source: 'user-action' })
      }
      
      return {
        error,
        hasError,
        triggerError,
        clearError,
      }
    },
    template: `
      <div style="padding: 20px;">
        <button 
          @click="triggerError"
          style="margin-right: 10px; padding: 8px 16px; border-radius: 4px; border: 1px solid #f56c6c; background: #f56c6c; color: white; cursor: pointer;"
        >
          触发错误
        </button>
        <button 
          @click="clearError"
          :disabled="!hasError"
          style="padding: 8px 16px; border-radius: 4px; border: 1px solid #409eff; background: #409eff; color: white; cursor: pointer;"
        >
          清除错误
        </button>
        
        <div v-if="hasError" style="margin-top: 20px; padding: 15px; background: #fef0f0; border: 1px solid #f56c6c; border-radius: 4px;">
          <h4 style="color: #f56c6c; margin: 0 0 10px 0;">错误信息</h4>
          <p style="margin: 0;">{{ error?.message }}</p>
        </div>
        
        <div v-else style="margin-top: 20px; padding: 15px; background: #f0f9ff; border: 1px solid #409eff; border-radius: 4px;">
          <p style="margin: 0; color: #409eff;">✓ 当前没有错误</p>
        </div>
      </div>
    `,
  }),
}
