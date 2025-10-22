/**
 * 认证守卫中间件
 * 用途：保护需要登录才能访问的页面
 * 符合铁律2：控件完整性（防止未登录访问）
 */

import { useAuthStore } from '@/stores/authStore'

/**
 * 检查用户是否已登录
 */
export function checkAuth(): boolean {
  const authStore = useAuthStore()
  return authStore.isAuthenticated
}

/**
 * 要求登录（页面守卫）
 */
export function requireAuth(callback?: () => void) {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    // 未登录，跳转到登录页
    uni.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 2000
    })
    
    // 保存当前页面路径，登录后返回
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentRoute = `/${currentPage.route}`
    
    uni.setStorageSync('redirect_after_login', currentRoute)
    
    // 跳转到登录页
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/login/login'
      })
    }, 1500)
    
    return false
  }
  
  // 已登录，执行回调
  if (callback) {
    callback()
  }
  
  return true
}

/**
 * 页面 onLoad 守卫（Vue3 Composition API）
 */
export function useAuthGuard() {
  const authStore = useAuthStore()
  
  // 检查登录状态
  const checkLogin = () => {
    if (!authStore.isAuthenticated) {
      requireAuth()
    }
  }
  
  // 获取用户信息
  const getUserInfo = () => {
    return authStore.userInfo
  }
  
  return {
    checkLogin,
    getUserInfo,
    isAuthenticated: authStore.isAuthenticated
  }
}

