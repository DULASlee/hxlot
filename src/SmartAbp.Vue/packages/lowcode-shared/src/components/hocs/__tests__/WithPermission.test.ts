/**
 * WithPermission HOC 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { WithPermission, usePermission, setPermissionChecker } from '../WithPermission'

// 测试组件
const SecretContent = {
  name: 'SecretContent',
  template: '<div class="secret-content">Secret Information</div>'
}

describe('WithPermission HOC', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 设置默认权限检查器
    setPermissionChecker(() => ['user'])
  })

  afterEach(() => {
    // 清理
    setPermissionChecker(null)
  })

  describe('基础功能', () => {
    it('应该在有权限时渲染组件', () => {
      setPermissionChecker(() => ['admin'])
      
      const WrappedComponent = WithPermission(SecretContent)
      const wrapper = mount(WrappedComponent, {
        props: {
          permission: 'admin'
        }
      })

      expect(wrapper.find('.secret-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Secret Information')
    })

    it('应该在无权限时隐藏组件（默认行为）', () => {
      setPermissionChecker(() => ['user'])
      
      const WrappedComponent = WithPermission(SecretContent)
      const wrapper = mount(WrappedComponent, {
        props: {
          permission: 'admin'
        }
      })

      expect(wrapper.find('.secret-content').exists()).toBe(false)
    })
  })

  describe('权限匹配模式', () => {
    it('应该支持单个权限字符串', () => {
      setPermissionChecker(() => ['editor'])
      
      const WrappedComponent = WithPermission(SecretContent)
      const wrapper = mount(WrappedComponent, {
        props: {
          permission: 'editor'
        }
      })

      expect(wrapper.find('.secret-content').exists()).toBe(true)
    })

    it('应该支持权限数组 - any模式', () => {
      setPermissionChecker(() => ['editor'])
      
      const WrappedComponent = WithPermission(SecretContent)
      const wrapper = mount(WrappedComponent, {
        props: {
          permission: ['admin', 'editor'],
          matchMode: 'any'
        }
      })

      expect(wrapper.find('.secret-content').exists()).toBe(true)
    })

    it('应该支持权限数组 - all模式', () => {
      setPermissionChecker(() => ['admin', 'editor'])
      
      const WrappedComponent = WithPermission(SecretContent)
      const wrapper = mount(WrappedComponent, {
        props: {
          permission: ['admin', 'editor'],
          matchMode: 'all'
        }
      })

      expect(wrapper.find('.secret-content').exists()).toBe(true)
    })

    it('应该在all模式下验证所有权限', () => {
      setPermissionChecker(() => ['admin'])
      
      const WrappedComponent = WithPermission(SecretContent)
      const wrapper = mount(WrappedComponent, {
        props: {
          permission: ['admin', 'editor'],
          matchMode: 'all'
        }
      })

      expect(wrapper.find('.secret-content').exists()).toBe(false)
    })
  })

  describe('无权限行为', () => {
    it('应该支持hide行为', () => {
      setPermissionChecker(() => ['user'])
      
      const WrappedComponent = WithPermission(SecretContent)
      const wrapper = mount(WrappedComponent, {
        props: {
          permission: 'admin',
          unauthorizedBehavior: 'hide'
        }
      })

      expect(wrapper.html()).toBe('<!--v-if-->')
    })

    it('应该支持disable行为', () => {
      setPermissionChecker(() => ['user'])
      
      const WrappedComponent = WithPermission(SecretContent)
      const wrapper = mount(WrappedComponent, {
        props: {
          permission: 'admin',
          unauthorizedBehavior: 'disable'
        }
      })

      expect(wrapper.find('.secret-content').exists()).toBe(true)
      expect(wrapper.find('.secret-content').attributes('disabled')).toBeDefined()
    })

    it('应该支持placeholder行为', () => {
      setPermissionChecker(() => ['user'])
      
      const WrappedComponent = WithPermission(SecretContent)
      const wrapper = mount(WrappedComponent, {
        props: {
          permission: 'admin',
          unauthorizedBehavior: 'placeholder',
          unauthorizedMessage: '您没有权限查看此内容'
        }
      })

      expect(wrapper.find('.secret-content').exists()).toBe(false)
      expect(wrapper.find('.unauthorized-placeholder').exists()).toBe(true)
      expect(wrapper.text()).toContain('您没有权限查看此内容')
    })

    it('应该使用默认的未授权消息', () => {
      setPermissionChecker(() => ['user'])
      
      const WrappedComponent = WithPermission(SecretContent)
      const wrapper = mount(WrappedComponent, {
        props: {
          permission: 'admin',
          unauthorizedBehavior: 'placeholder'
        }
      })

      expect(wrapper.text()).toContain('您没有权限访问此内容')
    })
  })

  describe('事件处理', () => {
    it('应该在权限检查失败时触发unauthorized事件', () => {
      setPermissionChecker(() => ['user'])
      
      const WrappedComponent = WithPermission(SecretContent)
      const wrapper = mount(WrappedComponent, {
        props: {
          permission: 'admin'
        }
      })

      expect(wrapper.emitted('unauthorized')).toBeTruthy()
    })

    it('应该在权限检查成功时触发authorized事件', () => {
      setPermissionChecker(() => ['admin'])
      
      const WrappedComponent = WithPermission(SecretContent)
      const wrapper = mount(WrappedComponent, {
        props: {
          permission: 'admin'
        }
      })

      expect(wrapper.emitted('authorized')).toBeTruthy()
    })
  })

  describe('Props透传', () => {
    it('应该透传props到被包装组件', () => {
      setPermissionChecker(() => ['admin'])
      
      const ComponentWithProps = {
        name: 'ComponentWithProps',
        props: {
          title: String
        },
        template: '<div>{{ title }}</div>'
      }

      const WrappedComponent = WithPermission(ComponentWithProps)
      const wrapper = mount(WrappedComponent, {
        props: {
          permission: 'admin',
          title: 'Test Title'
        }
      })

      expect(wrapper.text()).toContain('Test Title')
    })
  })
})

describe('usePermission Composable', () => {
  beforeEach(() => {
    setPermissionChecker(() => ['user', 'editor'])
  })

  afterEach(() => {
    setPermissionChecker(null)
  })

  it('应该能够检查单个权限', () => {
    const { hasPermission } = usePermission()
    
    expect(hasPermission('user')).toBe(true)
    expect(hasPermission('admin')).toBe(false)
  })

  it('应该能够检查任意权限（any）', () => {
    const { hasAnyPermission } = usePermission()
    
    expect(hasAnyPermission(['admin', 'user'])).toBe(true)
    expect(hasAnyPermission(['admin', 'superuser'])).toBe(false)
  })

  it('应该能够检查所有权限（all）', () => {
    const { hasAllPermissions } = usePermission()
    
    expect(hasAllPermissions(['user', 'editor'])).toBe(true)
    expect(hasAllPermissions(['user', 'admin'])).toBe(false)
  })

  it('应该能够获取当前权限列表', () => {
    const { currentPermissions } = usePermission()
    
    expect(currentPermissions.value).toEqual(['user', 'editor'])
  })

  it('应该在没有权限检查器时返回false', () => {
    setPermissionChecker(null)
    
    const { hasPermission } = usePermission()
    
    expect(hasPermission('user')).toBe(false)
  })

  it('应该支持空权限列表', () => {
    setPermissionChecker(() => [])
    
    const { hasPermission } = usePermission()
    
    expect(hasPermission('user')).toBe(false)
  })

  it('应该支持动态更新权限检查器', () => {
    const { hasPermission } = usePermission()
    
    expect(hasPermission('admin')).toBe(false)
    
    setPermissionChecker(() => ['admin'])
    
    expect(hasPermission('admin')).toBe(true)
  })
})

describe('setPermissionChecker', () => {
  afterEach(() => {
    setPermissionChecker(null)
  })

  it('应该能够设置权限检查器', () => {
    const checker = vi.fn(() => ['admin'])
    
    setPermissionChecker(checker)
    
    const { hasPermission } = usePermission()
    hasPermission('admin')
    
    expect(checker).toHaveBeenCalled()
  })

  it('应该能够清除权限检查器', () => {
    setPermissionChecker(() => ['admin'])
    setPermissionChecker(null)
    
    const { hasPermission } = usePermission()
    
    expect(hasPermission('admin')).toBe(false)
  })
})
