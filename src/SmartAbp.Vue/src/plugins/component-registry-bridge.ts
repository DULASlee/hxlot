/**
 * Component Registry Bridge - Vue Plugin
 * 
 * 🔥 【架构铁律二】组件注册系统桥接
 * 
 * 功能：
 * 1. 将 ComponentRegistry 集成到 Vue 应用
 * 2. 提供全局访问 ComponentRegistry 的能力
 * 3. 支持组件动态加载和懒加载
 * 4. 提供组件生命周期钩子
 * 
 * @author SmartAbp Team
 * @version 1.0.0
 * @license MIT
 */

import type { App, Plugin } from 'vue'
import { globalComponentRegistry } from '@smartabp/lowcode-shared'

/**
 * Component Registry Bridge 配置选项
 */
export interface ComponentRegistryBridgeOptions {
  /**
   * 是否启用开发模式
   */
  devMode?: boolean

  /**
   * 是否自动加载所有已注册组件
   */
  autoLoad?: boolean

  /**
   * 是否启用性能监控
   */
  enablePerformanceMonitoring?: boolean

  /**
   * 是否启用调试日志
   */
  debug?: boolean
}

/**
 * 默认配置
 */
const defaultOptions: ComponentRegistryBridgeOptions = {
  devMode: import.meta.env.DEV,
  autoLoad: false,
  enablePerformanceMonitoring: true,
  debug: import.meta.env.DEV
}

/**
 * Component Registry Bridge Vue Plugin
 */
export const ComponentRegistryBridge: Plugin = {
  install(app: App, options: ComponentRegistryBridgeOptions = {}) {
    const config = { ...defaultOptions, ...options }

    if (config.debug) {
      console.log('[ComponentRegistryBridge] 🚀 开始初始化...')
      console.log('[ComponentRegistryBridge] 配置:', config)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. 将 ComponentRegistry 注入到 Vue 全局属性
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    app.config.globalProperties.$componentRegistry = globalComponentRegistry

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2. 提供 provide/inject 支持
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    app.provide('componentRegistry', globalComponentRegistry)

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 3. 动态组件加载支持
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    app.config.globalProperties.$loadComponent = async (name: string) => {
      try {
        if (config.debug) {
          console.log(`[ComponentRegistryBridge] 🔄 加载组件: ${name}`)
        }

        const component = await globalComponentRegistry.load(name)

        if (config.debug) {
          console.log(`[ComponentRegistryBridge] ✅ 组件加载成功: ${name}`)
        }

        return component
      } catch (error) {
        console.error(`[ComponentRegistryBridge] ❌ 组件加载失败: ${name}`, error)
        throw error
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 4. 组件状态检查辅助函数
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    app.config.globalProperties.$isComponentRegistered = (name: string): boolean => {
      return globalComponentRegistry.has(name)
    }

    app.config.globalProperties.$getComponentMetadata = (name: string) => {
      return globalComponentRegistry.getMetadata(name)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 5. 组件性能监控（如果启用）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (config.enablePerformanceMonitoring && config.debug) {
      // 性能监控通过 ComponentRegistry 的 getPerformanceMetrics() 获取
      console.log('[ComponentRegistryBridge] 📊 性能监控已启用')
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 6. 自动加载所有已注册组件（如果启用）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (config.autoLoad) {
      const registeredComponents = globalComponentRegistry.getAvailableComponents()

      if (config.debug) {
        console.log(`[ComponentRegistryBridge] 📦 自动加载 ${registeredComponents.length} 个组件...`)
      }

      registeredComponents.forEach(async (metadata: any) => {
        try {
          if (!metadata.lazy) {
            await globalComponentRegistry.load(metadata.name)
          }
        } catch (error) {
          console.error(`[ComponentRegistryBridge] ❌ 自动加载失败: ${metadata.name}`, error)
        }
      })
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 7. 开发模式辅助功能
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (config.devMode) {
      // 暴露到全局（仅开发模式）
      if (typeof window !== 'undefined') {
        (window as any).__componentRegistry = globalComponentRegistry;
        (window as any).__componentRegistryBridge = {
          getAll: () => globalComponentRegistry.getAvailableComponents(),
          get: (name: string) => globalComponentRegistry.getMetadata(name),
          load: (name: string) => globalComponentRegistry.load(name),
          has: (name: string) => globalComponentRegistry.has(name),
          stats: () => {
            const all = globalComponentRegistry.getAvailableComponents()
            return {
              total: all.length,
              byCategory: all.reduce((acc: Record<string, number>, m: any) => {
                acc[m.category] = (acc[m.category] || 0) + 1
                return acc
              }, {} as Record<string, number>),
              byBundle: all.reduce((acc: Record<string, number>, m: any) => {
                acc[m.bundle] = (acc[m.bundle] || 0) + 1
                return acc
              }, {} as Record<string, number>)
            }
          }
        }

        console.log('[ComponentRegistryBridge] 💡 开发模式工具已启用:')
        console.log('  - window.__componentRegistry')
        console.log('  - window.__componentRegistryBridge.getAll()')
        console.log('  - window.__componentRegistryBridge.stats()')
      }
    }

    if (config.debug) {
      const registeredCount = globalComponentRegistry.getAvailableComponents().length
      console.log(`[ComponentRegistryBridge] ✅ 初始化完成！已注册 ${registeredCount} 个组件`)
    }
  }
}

/**
 * TypeScript 类型扩展
 * 为 Vue 组件实例添加类型支持
 */
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    /**
     * 全局组件注册表
     */
    $componentRegistry: typeof globalComponentRegistry

    /**
     * 动态加载组件
     */
    $loadComponent: (name: string) => Promise<any>

    /**
     * 检查组件是否已注册
     */
    $isComponentRegistered: (name: string) => boolean

    /**
     * 获取组件元数据
     */
    $getComponentMetadata: (name: string) => any
  }
}

/**
 * 默认导出
 */
export default ComponentRegistryBridge

