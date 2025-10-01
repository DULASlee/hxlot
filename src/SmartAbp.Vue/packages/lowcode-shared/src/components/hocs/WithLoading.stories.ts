/**
 * WithLoading HOC Storybook Stories
 * 加载状态高阶组件可视化文档
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { WithLoading, useLoading } from './WithLoading'

// 测试组件
const TestComponent = {
  name: 'TestComponent',
  template: `
    <div style="padding: 20px; border: 1px dashed #ccc; border-radius: 4px;">
      <h3>测试组件内容</h3>
      <p>这是一个测试组件，用于演示WithLoading HOC</p>
    </div>
  `
}

const WrappedComponent = WithLoading(TestComponent)

const meta: Meta<typeof WrappedComponent> = {
  title: 'Packages/lowcode-shared/HOCs/WithLoading',
  component: WrappedComponent,
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'boolean',
      description: '是否显示加载状态',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loadingText: {
      control: 'text',
      description: '加载提示文本',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '加载中...' },
      },
    },
    minLoadingTime: {
      control: 'number',
      description: '最小加载时间（毫秒），防止闪烁',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '300' },
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof WrappedComponent>

/**
 * 基础示例
 */
export const Basic: Story = {
  args: {
    loading: true,
    loadingText: '加载中...',
  },
}

/**
 * 不同大小
 */
export const DifferentTexts: Story = {
  render: () => ({
    components: { WithLoading: WrappedComponent },
    setup() {
      return {
        TestComponent,
      }
    },
    template: `
      <div style="display: flex; gap: 20px; flex-direction: column;">
        <WithLoading :loading="true" loading-text="数据加载中...">
          <TestComponent />
        </WithLoading>
        <WithLoading :loading="true" loading-text="正在处理请求...">
          <TestComponent />
        </WithLoading>
        <WithLoading :loading="true" loading-text="请稍候...">
          <TestComponent />
        </WithLoading>
      </div>
    `,
  }),
}

/**
 * 交互式示例
 */
export const Interactive: Story = {
  render: () => ({
    components: { WithLoading: WrappedComponent },
    setup() {
      const loading = ref(false)
      
      const startLoading = () => {
        loading.value = true
        setTimeout(() => {
          loading.value = false
        }, 2000)
      }
      
      return {
        TestComponent,
        loading,
        startLoading,
      }
    },
    template: `
      <div>
        <button 
          @click="startLoading" 
          :disabled="loading"
          style="margin-bottom: 20px; padding: 8px 16px; border-radius: 4px; border: 1px solid #409eff; background: #409eff; color: white; cursor: pointer;"
        >
          {{ loading ? '加载中...' : '开始加载' }}
        </button>
        <WithLoading :loading="loading" loading-text="数据加载中..." :min-loading-time="300">
          <TestComponent />
        </WithLoading>
      </div>
    `,
  }),
}

/**
 * useLoading Composable示例
 */
export const UseLoadingComposable: Story = {
  render: () => ({
    setup() {
      const { isLoading, startLoading, stopLoading } = useLoading()
      
      const simulateLoad = () => {
        startLoading()
        setTimeout(() => {
          stopLoading()
        }, 2000)
      }
      
      return {
        isLoading,
        simulateLoad,
      }
    },
    template: `
      <div>
        <button 
          @click="simulateLoad" 
          :disabled="isLoading"
          style="margin-bottom: 20px; padding: 8px 16px; border-radius: 4px; border: 1px solid #409eff; background: #409eff; color: white; cursor: pointer;"
        >
          {{ isLoading ? '加载中...' : '使用Composable加载' }}
        </button>
        <div style="padding: 20px; border: 1px dashed #ccc; border-radius: 4px;">
          <p v-if="isLoading">加载状态: true</p>
          <p v-else>加载状态: false</p>
        </div>
      </div>
    `,
  }),
}
