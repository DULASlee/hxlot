// utils/storage.ts
/**
 * UniApp本地存储封装
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-22
 */

/**
 * 设置本地存储
 */
export function setStorage(key: string, value: any): void {
  try {
    uni.setStorageSync(key, value)
  } catch (e) {
    console.error('setStorage error:', e)
  }
}

/**
 * 获取本地存储
 */
export function getStorage<T = any>(key: string, defaultValue?: T): T | null {
  try {
    const value = uni.getStorageSync(key)
    return value !== '' ? value : (defaultValue || null)
  } catch (e) {
    console.error('getStorage error:', e)
    return defaultValue || null
  }
}

/**
 * 移除本地存储
 */
export function removeStorage(key: string): void {
  try {
    uni.removeStorageSync(key)
  } catch (e) {
    console.error('removeStorage error:', e)
  }
}

/**
 * 清空本地存储
 */
export function clearStorage(): void {
  try {
    uni.clearStorageSync()
  } catch (e) {
    console.error('clearStorage error:', e)
  }
}
