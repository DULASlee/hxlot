/**
 * 应用配置
 */

/**
 * 规范化URL
 */
function normalizeUrl(url?: string | null): string {
  const value = String(url ?? '').trim()
  if (!value) return '/'
  return value
}

/**
 * 环境变量接口
 */
interface ImportMetaEnv {
  VITE_API_BASE_URL?: string
  [key: string]: any
}

/**
 * 全局变量声明
 */
declare global {
   
  var __API_BASE_URL__: string | undefined
}

/**
 * 应用配置接口
 */
export interface AppConfig {
  /** API基础URL */
  apiBaseUrl: string
}

const env: ImportMetaEnv = (import.meta as any)?.env || {}

/**
 * 应用配置对象
 */
export const appConfig: AppConfig = {
  apiBaseUrl: normalizeUrl(
    env.VITE_API_BASE_URL || globalThis.__API_BASE_URL__ || 'https://localhost:44379'
  )
}
