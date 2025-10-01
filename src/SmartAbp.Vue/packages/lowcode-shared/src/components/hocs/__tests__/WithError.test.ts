/**
 * WithError HOC 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { WithError, useErrorHandler } from '../WithError'

// 正常组件
const NormalComponent = {
  name: 'NormalComponent',
  template: '<div class="normal-content">Normal Content</div>'
}

// 会抛出错误的组件
const ErrorComponent = {
  name: 'ErrorComponent',
  setup() {
    throw new Error('Component Error')
  },
  template: '<div>Never rendered</div>'
}

describe('WithError HOC', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 抑制console.error
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('基础功能', () => {
    it('应该正确渲染正常组件', () => {
      const WrappedComponent = WithError(NormalComponent)
      const wrapper = mount(WrappedComponent)

      expect(wrapper.find('.normal-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Normal Content')
    })

    it('应该捕获组件错误', () => {
      const WrappedComponent = WithError(ErrorComponent)
      const wrapper = mount(WrappedComponent, {
        props: {
          errorDisplayMode: 'inline'
        }
      })

      // 应该显示错误信息，而不是原组件
      expect(wrapper.text()).toContain('Component Error')
      expect(wrapper.find('.error-container').exists()).toBe(true)
    })

    it('应该在初始化时接受error prop', () => {
      const WrappedComponent = WithError(NormalComponent)
      const testError = new Error('Initial Error')
      
      const wrapper = mount(WrappedComponent, {
        props: {
          error: testError,
          errorDisplayMode: 'inline'
        }
      })

      expect(wrapper.text()).toContain('Initial Error')
    })
  })

  describe('错误显示模式', () => {
    it('inline模式应该内联显示错误', () => {
      const WrappedComponent = WithError(ErrorComponent)
      const wrapper = mount(WrappedComponent, {
        props: {
          errorDisplayMode: 'inline'
        }
      })

      expect(wrapper.find('.error-container').exists()).toBe(true)
      expect(wrapper.html()).toContain('Component Error')
    })

    it('silent模式应该静默处理错误', () => {
      const WrappedComponent = WithError(ErrorComponent)
      const wrapper = mount(WrappedComponent, {
        props: {
          errorDisplayMode: 'silent'
        }
      })

      // silent模式下不显示错误UI，但会记录错误
      expect(wrapper.find('.error-container').exists()).toBe(false)
    })
  })

  describe('重试功能', () => {
    it('应该显示重试按钮当retryable为true', () => {
      const WrappedComponent = WithError(ErrorComponent)
      const wrapper = mount(WrappedComponent, {
        props: {
          errorDisplayMode: 'inline',
          retryable: true
        }
      })

      expect(wrapper.find('.retry-button').exists()).toBe(true)
    })

    it('应该隐藏重试按钮当retryable为false', () => {
      const WrappedComponent = WithError(ErrorComponent)
      const wrapper = mount(WrappedComponent, {
        props: {
          errorDisplayMode: 'inline',
          retryable: false
        }
      })

      expect(wrapper.find('.retry-button').exists()).toBe(false)
    })

    it('应该在点击重试时触发retry事件', async () => {
      const WrappedComponent = WithError(NormalComponent)
      const testError = new Error('Test Error')
      
      const wrapper = mount(WrappedComponent, {
        props: {
          error: testError,
          errorDisplayMode: 'inline',
          retryable: true
        }
      })

      const retryButton = wrapper.find('.retry-button')
      await retryButton.trigger('click')

      expect(wrapper.emitted('retry')).toBeTruthy()
    })
  })

  describe('事件处理', () => {
    it('应该触发error事件', () => {
      const WrappedComponent = WithError(ErrorComponent)
      const onError = vi.fn()
      
      mount(WrappedComponent, {
        props: {
          onError
        }
      })

      expect(onError).toHaveBeenCalled()
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
    })

    it('应该触发error-cleared事件', async () => {
      const WrappedComponent = WithError(NormalComponent)
      const testError = new Error('Test Error')
      
      const wrapper = mount(WrappedComponent, {
        props: {
          error: testError,
          errorDisplayMode: 'inline'
        }
      })

      await wrapper.setProps({ error: null })
      await nextTick()

      expect(wrapper.emitted('error-cleared')).toBeTruthy()
    })
  })

  describe('Props透传', () => {
    it('应该透传props到被包装组件', () => {
      const ComponentWithProps = {
        name: 'ComponentWithProps',
        props: {
          message: String
        },
        template: '<div>{{ message }}</div>'
      }

      const WrappedComponent = WithError(ComponentWithProps)
      const wrapper = mount(WrappedComponent, {
        props: {
          message: 'Hello World'
        }
      })

      expect(wrapper.text()).toContain('Hello World')
    })
  })
})

describe('useErrorHandler Composable', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('应该初始化为无错误状态', () => {
    const { error, hasError, errorCount } = useErrorHandler()
    
    expect(error.value).toBeNull()
    expect(hasError.value).toBe(false)
    expect(errorCount.value).toBe(0)
  })

  it('应该能够处理错误', () => {
    const { error, hasError, errorCount, handleError } = useErrorHandler()
    
    const testError = new Error('Test Error')
    handleError(testError)
    
    expect(error.value).toBe(testError)
    expect(hasError.value).toBe(true)
    expect(errorCount.value).toBe(1)
  })

  it('应该能够处理字符串错误', () => {
    const { error, handleError } = useErrorHandler()
    
    handleError('String error')
    
    expect(error.value).toBeInstanceOf(Error)
    expect(error.value?.message).toBe('String error')
  })

  it('应该能够清除错误', () => {
    const { error, hasError, handleError, clearError } = useErrorHandler()
    
    handleError(new Error('Test'))
    expect(hasError.value).toBe(true)
    
    clearError()
    
    expect(error.value).toBeNull()
    expect(hasError.value).toBe(false)
  })

  it('应该累计错误次数', () => {
    const { errorCount, handleError } = useErrorHandler()
    
    handleError(new Error('Error 1'))
    expect(errorCount.value).toBe(1)
    
    handleError(new Error('Error 2'))
    expect(errorCount.value).toBe(2)
    
    handleError(new Error('Error 3'))
    expect(errorCount.value).toBe(3)
  })

  it('应该支持错误上下文', () => {
    const { handleError } = useErrorHandler()
    
    const testError = new Error('Test')
    const context = { userId: '123', action: 'submit' }
    
    // 应该不抛出错误
    expect(() => {
      handleError(testError, context)
    }).not.toThrow()
  })
})
