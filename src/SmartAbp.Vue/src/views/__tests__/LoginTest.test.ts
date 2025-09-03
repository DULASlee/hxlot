import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoginTest from '../LoginTest.vue'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/utils/auth'
import { api } from '@/utils/api'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

// Mock API 服务
vi.mock('@/utils/api', () => ({
  api: {
    get: vi.fn()
  }
}))

// Mock 认证服务
vi.mock('@/utils/auth', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    fetchUserInfo: vi.fn()
  }
}))

// Mock 图标组件
vi.mock('~icons/ep/connection', () => ({
  default: { template: '<div>connection-icon</div>' }
}))
vi.mock('~icons/ep/user', () => ({
  default: { template: '<div>user-icon</div>' }
}))
vi.mock('~icons/ep/lock', () => ({
  default: { template: '<div>lock-icon</div>' }
}))
vi.mock('~icons/ep/user-filled', () => ({
  default: { template: '<div>user-filled-icon</div>' }
}))
vi.mock('~icons/ep/refresh', () => ({
  default: { template: '<div>refresh-icon</div>' }
}))
vi.mock('~icons/ep/switch-button', () => ({
  default: { template: '<div>switch-button-icon</div>' }
}))
vi.mock('~icons/ep/delete', () => ({
  default: { template: '<div>delete-icon</div>' }
}))

describe('LoginTest 组件', () => {
  let wrapper: any
  let authStore: any

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()

    // 重置所有 mock
    vi.clearAllMocks()

    wrapper = mount(LoginTest, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'el-card': { template: '<div><slot name="header"></slot><slot></slot></div>' },
          'el-tag': { template: '<span><slot></slot></span>' },
          'el-divider': { template: '<div><slot></slot></div>' },
          'el-button': {
            template: '<button @click="$emit(\'click\')" :disabled="loading"><slot></slot></button>',
            props: ['loading']
          },
          'el-alert': { template: '<div><slot></slot></div>' },
          'el-form': { template: '<form @submit="$emit(\'submit\', $event)"><slot></slot></form>' },
          'el-form-item': { template: '<div><slot></slot></div>' },
          'el-input': {
            template: '<input v-model="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue'],
            emits: ['update:modelValue']
          },
          'el-descriptions': { template: '<div><slot></slot></div>' },
          'el-descriptions-item': { template: '<div><slot></slot></div>' },
          'el-text': { template: '<span><slot></slot></span>' }
        }
      }
    })
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('应该正确渲染组件', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('SmartAbp 登录功能测试')
  })

  it('应该显示正确的初始状态', () => {
    expect(wrapper.text()).toContain('API 连接测试')
    expect(wrapper.text()).toContain('用户登录测试')
    expect(wrapper.text()).toContain('认证状态')
    expect(wrapper.text()).toContain('测试日志')
  })

  it('应该能够测试 API 连接', async () => {
    const mockApiGet = vi.mocked(api.get)
    mockApiGet.mockResolvedValue({ status: 'healthy' })

    const testButton = wrapper.find('button')
    await testButton.trigger('click')

    expect(mockApiGet).toHaveBeenCalledWith('/health-status')
  })

  it('应该能够填充测试数据', async () => {
    const adminButton = wrapper.findAll('button').find((btn: any) =>
      btn.text().includes('填入管理员测试数据')
    )

    if (adminButton) {
      await adminButton.trigger('click')

      // 检查表单数据是否被填充
      const usernameInput = wrapper.find('input[type="text"]')
      const passwordInput = wrapper.find('input[type="password"]')

      expect(usernameInput.element.value).toBe('admin')
      expect(passwordInput.element.value).toBe('1q2w3E*')
    }
  })

  it('应该能够处理登录成功', async () => {
    const mockLogin = vi.mocked(authService.login)
    const mockGetUserInfo = vi.mocked(authService.fetchUserInfo)

    mockLogin.mockResolvedValue(true)
    mockGetUserInfo.mockResolvedValue({
      id: '1',
      userName: 'admin',
      email: 'admin@test.com',
      roles: ['admin']
    })

    // 设置表单数据
    const usernameInput = wrapper.find('input')
    await usernameInput.setValue('admin')

    const passwordInput = wrapper.findAll('input')[1]
    await passwordInput.setValue('1q2w3E*')

    // 触发登录
    const loginButton = wrapper.findAll('button').find((btn: any) =>
      btn.text().includes('登录测试')
    )

    if (loginButton) {
      await loginButton.trigger('click')

      expect(mockLogin).toHaveBeenCalledWith({
        username: 'admin',
        password: '1q2w3E*'
      })
    }
  })

  it('应该能够处理登录失败', async () => {
    const mockLogin = vi.mocked(authService.login)
    mockLogin.mockRejectedValue(new Error('登录失败'))

    // 设置表单数据
    const usernameInput = wrapper.find('input')
    await usernameInput.setValue('invalid')

    const passwordInput = wrapper.findAll('input')[1]
    await passwordInput.setValue('wrongpass')

    // 触发登录
    const loginButton = wrapper.findAll('button').find((btn: any) =>
      btn.text().includes('登录测试')
    )

    if (loginButton) {
      await loginButton.trigger('click')

      expect(mockLogin).toHaveBeenCalledWith({
        username: 'invalid',
        password: 'wrongpass'
      })
    }
  })

  it('应该显示认证状态', () => {
    // 测试未认证状态
    expect(wrapper.text()).toContain('未认证')

    // 模拟已认证状态
    authStore.setToken('test-token')
    authStore.setUserInfo({
      id: '1',
      username: 'testuser',
      email: 'test@test.com',
      roles: ['user']
    })

    // 重新渲染
    wrapper.vm.$forceUpdate()
  })

  it('应该能够处理登出', async () => {
    const mockLogout = vi.mocked(authService.logout)
    mockLogout.mockResolvedValue()

    // 先设置为已认证状态
    authStore.setToken('test-token')
    authStore.setUserInfo({
      id: '1',
      username: 'testuser',
      email: 'test@test.com',
      roles: ['user']
    })

    await wrapper.vm.$nextTick()

    const logoutButton = wrapper.findAll('button').find((btn: any) =>
      btn.text().includes('登出测试')
    )

    if (logoutButton) {
      await logoutButton.trigger('click')
      expect(mockLogout).toHaveBeenCalled()
    }
  })

  it('应该能够清空日志', async () => {
    const clearButton = wrapper.findAll('button').find((btn: any) =>
      btn.text().includes('清空日志')
    )

    if (clearButton) {
      await clearButton.trigger('click')
      expect(wrapper.text()).toContain('日志已清空')
    }
  })

  it('应该正确显示连接状态', async () => {
    // 初始状态应该是未测试
    expect(wrapper.text()).toContain('未测试')

    // 模拟 API 连接成功
    const mockApiGet = vi.mocked(api.get)
    mockApiGet.mockResolvedValue({ status: 'healthy' })

    const testButton = wrapper.findAll('button').find((btn: any) =>
      btn.text().includes('测试 API 连接')
    )

    if (testButton) {
      await testButton.trigger('click')
      await wrapper.vm.$nextTick()

      // 应该显示连接正常
      expect(wrapper.text()).toContain('连接正常')
    }
  })
})
