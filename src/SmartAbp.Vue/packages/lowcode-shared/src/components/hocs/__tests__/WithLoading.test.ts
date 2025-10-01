/**
 * WithLoading HOC 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { WithLoading, useLoading } from '../WithLoading'

// 测试组件
const TestComponent = {
  name: 'TestComponent',
  template: '<div class="test-content">Test Content</div>'
}

describe('WithLoading HOC', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础功能', () => {
    it('应该正确渲染包装的组件', () => {
      const WrappedComponent = WithLoading(TestComponent)
      const wrapper = mount(WrappedComponent, {
        props: {
          loading: false
        }
      })

      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test Content')
    })

    it('应该在loading为true时显示加载状态', () => {
      const WrappedComponent = WithLoading(TestComponent)
      const wrapper = mount(WrappedComponent, {
        props: {
          loading: true
        }
      })

      expect(wrapper.find('.loading-container').exists()).toBe(true)
      expect(wrapper.find('.test-content').exists()).toBe(false)
    })

    it('应该在loading为false时隐藏加载状态', () => {
      const WrappedComponent = WithLoading(TestComponent)
      const wrapper = mount(WrappedComponent, {
        props: {
          loading: false
        }
      })

      expect(wrapper.find('.loading-container').exists()).toBe(false)
      expect(wrapper.find('.test-content').exists()).toBe(true)
    })
  })

  describe('Props配置', () => {
    it('应该显示自定义加载文本', () => {
      const WrappedComponent = WithLoading(TestComponent)
      const customText = '正在加载数据...'
      const wrapper = mount(WrappedComponent, {
        props: {
          loading: true,
          loadingText: customText
        }
      })

      expect(wrapper.text()).toContain(customText)
    })

    it('应该使用默认加载文本', () => {
      const WrappedComponent = WithLoading(TestComponent)
      const wrapper = mount(WrappedComponent, {
        props: {
          loading: true
        }
      })

      expect(wrapper.text()).toContain('加载中...')
    })

    it('应该支持自定义加载图标', () => {
      const WrappedComponent = WithLoading(TestComponent)
      const customIcon = 'el-icon-loading'
      const wrapper = mount(WrappedComponent, {
        props: {
          loading: true,
          loadingIcon: customIcon
        }
      })

      expect(wrapper.html()).toContain(customIcon)
    })
  })

  describe('最小加载时间', () => {
    it('应该遵守最小加载时间', async () => {
      const WrappedComponent = WithLoading(TestComponent)
      const wrapper = mount(WrappedComponent, {
        props: {
          loading: true,
          minLoadingTime: 100
        }
      })

      // 立即设置loading为false
      await wrapper.setProps({ loading: false })
      
      // 应该还在显示加载状态
      expect(wrapper.find('.loading-container').exists()).toBe(true)

      // 等待最小加载时间
      await new Promise(resolve => setTimeout(resolve, 150))
      await nextTick()

      // 现在应该隐藏加载状态
      expect(wrapper.find('.loading-container').exists()).toBe(false)
    })
  })

  describe('事件处理', () => {
    it('应该触发loading-start事件', async () => {
      const WrappedComponent = WithLoading(TestComponent)
      const wrapper = mount(WrappedComponent, {
        props: {
          loading: false
        }
      })

      await wrapper.setProps({ loading: true })

      expect(wrapper.emitted('loading-start')).toBeTruthy()
    })

    it('应该触发loading-end事件', async () => {
      const WrappedComponent = WithLoading(TestComponent)
      const wrapper = mount(WrappedComponent, {
        props: {
          loading: true
        }
      })

      await wrapper.setProps({ loading: false })

      // 等待最小加载时间
      await new Promise(resolve => setTimeout(resolve, 350))
      await nextTick()

      expect(wrapper.emitted('loading-end')).toBeTruthy()
    })
  })

  describe('Props透传', () => {
    it('应该透传props到被包装组件', () => {
      const ComponentWithProps = {
        name: 'ComponentWithProps',
        props: {
          title: String
        },
        template: '<div>{{ title }}</div>'
      }

      const WrappedComponent = WithLoading(ComponentWithProps)
      const wrapper = mount(WrappedComponent, {
        props: {
          loading: false,
          title: 'Test Title'
        }
      })

      expect(wrapper.text()).toContain('Test Title')
    })
  })
})

describe('useLoading Composable', () => {
  it('应该初始化为false', () => {
    const { isLoading } = useLoading()
    expect(isLoading.value).toBe(false)
  })

  it('应该初始化为指定值', () => {
    const { isLoading } = useLoading(true)
    expect(isLoading.value).toBe(true)
  })

  it('应该能够开始加载', () => {
    const { isLoading, startLoading } = useLoading()
    
    startLoading()
    
    expect(isLoading.value).toBe(true)
  })

  it('应该能够停止加载', () => {
    const { isLoading, startLoading, stopLoading } = useLoading()
    
    startLoading()
    expect(isLoading.value).toBe(true)
    
    stopLoading()
    expect(isLoading.value).toBe(false)
  })

  it('应该支持嵌套加载', () => {
    const { isLoading, startLoading, stopLoading } = useLoading()
    
    startLoading()
    startLoading()
    expect(isLoading.value).toBe(true)
    
    stopLoading()
    expect(isLoading.value).toBe(true)
    
    stopLoading()
    expect(isLoading.value).toBe(false)
  })

  it('应该支持withLoading包装异步函数', async () => {
    const { isLoading, withLoading } = useLoading()
    
    const asyncFn = vi.fn().mockResolvedValue('result')
    
    expect(isLoading.value).toBe(false)
    
    const promise = withLoading(asyncFn)
    
    expect(isLoading.value).toBe(true)
    
    const result = await promise
    
    expect(isLoading.value).toBe(false)
    expect(result).toBe('result')
    expect(asyncFn).toHaveBeenCalled()
  })

  it('应该在异步函数失败时也停止加载', async () => {
    const { isLoading, withLoading } = useLoading()
    
    const asyncFn = vi.fn().mockRejectedValue(new Error('Test error'))
    
    try {
      await withLoading(asyncFn)
    } catch (error) {
      expect((error as Error).message).toBe('Test error')
    }
    
    expect(isLoading.value).toBe(false)
  })
})
