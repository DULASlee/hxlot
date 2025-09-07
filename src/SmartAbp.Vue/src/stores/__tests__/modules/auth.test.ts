import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores'

describe('认证状态管理', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态应该是未认证', () => {
    const authStore = useAuthStore()

    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.userInfo).toBeNull()
    expect(authStore.token).toBeNull()
  })

  it('设置Token后应该更新认证状态', () => {
    const authStore = useAuthStore()
    const testToken = 'test-access-token'
    const testRefreshToken = 'test-refresh-token'

    authStore.setToken(testToken, testRefreshToken)

    expect(authStore.token).toBe(testToken)
    expect(authStore.refreshToken).toBe(testRefreshToken)
    expect(authStore.isAuthenticated).toBe(true)
  })

  it('设置用户信息应该正确存储', () => {
    const authStore = useAuthStore()
    const testUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['user', 'admin']
    }

    authStore.setUserInfo(testUser)

    expect(authStore.userInfo).toEqual(testUser)
    expect(authStore.hasRole('admin')).toBe(true)
    expect(authStore.hasRole('guest')).toBe(false)
  })

  it('清除认证信息应该重置所有状态', () => {
    const authStore = useAuthStore()

    // 先设置一些数据
    authStore.setToken('test-token', 'test-refresh')
    authStore.setUserInfo({
      id: '1',
      username: 'test',
      email: 'test@test.com',
      roles: ['user']
    })

    // 清除认证信息
    authStore.clearAuth()

    expect(authStore.token).toBeNull()
    expect(authStore.refreshToken).toBeNull()
    expect(authStore.userInfo).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('获取认证头应该返回正确格式', () => {
    const authStore = useAuthStore()
    const testToken = 'test-bearer-token'

    // 未设置token时应该返回空对象
    expect(authStore.getAuthHeader()).toEqual({})

    // 设置token后应该返回Bearer格式
    authStore.setToken(testToken)
    expect(authStore.getAuthHeader()).toEqual({
      Authorization: `Bearer ${testToken}`
    })
  })
})
