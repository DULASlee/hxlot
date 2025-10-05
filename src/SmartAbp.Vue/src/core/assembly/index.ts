/**
 * 装配件系统主入口
 */

// 核心类型和接口
export type {
  AssemblyConfig,
  AssemblyInstance,
  AssemblyEvent,
  AssemblyEventType,
  AssemblyHealth,
  AssemblyValidationResult,
  IAssemblyManager,
  IAssemblyLoader,
  AssemblyManagerOptions,
  AssemblyLoaderOptions,
  DependencyGraph,
  DependencyNode
} from './assembly-types'

// 核心管理器
export {
  AssemblyManager,
  createAssemblyManager
} from './assembly-manager'

// 加载器
export {
  AssemblyLoader
} from './assembly-loader'

// 配置管理器
export {
  AssemblyConfigManager
} from './assembly-config'

// 工具函数
export {
  validateAssemblyConfig,
  generateId,
  deepClone,
  debounce,
  buildDependencyGraph,
  validateDependencies,
  topologicalSort
} from './assembly-utils'

// 存储适配器
export {
  LocalStorageAdapter,
  IndexedDBAdapter,
  RemoteStorageAdapter,
  createStorageAdapter
} from './storage-adapters'

// 插件系统
export {
  LoggingPlugin,
  PerformancePlugin,
  DependencyAnalysisPlugin,
  SecurityPlugin,
  CachePlugin,
  PluginManager,
  DefaultPluginBundle,
  type AssemblyPlugin
} from './plugins'

// Vue 组件
export { default as AssemblyForm } from '../components/assembly/AssemblyForm.vue'

/**
 * 创建默认装配件管理器实例
 */
export async function createDefaultAssemblyManager(): Promise<any> {
  const { createAssemblyManager } = await import('./assembly-manager')
  return createAssemblyManager({
    autoLoad: true,
    enableHealthChecks: true,
    healthCheckInterval: 30000,
    enablePlugins: true,
    debug: process.env.NODE_ENV === 'development',
    storage: {
      type: 'localStorage',
      options: {
        prefix: 'assembly_'
      }
    },
    loaderOptions: {
      timeout: 30000,
      retryCount: 3,
      cacheEnabled: true
    }
  })
}

/**
 * 装配件系统版本信息
 */
export const AssemblySystemInfo = {
  version: '1.0.0',
  name: 'SmartAbp Assembly System',
  description: '企业级装配件管理系统',
  author: 'SmartAbp Team',
  license: 'MIT'
}

/**
 * 装配件系统工具函数
 */
export const AssemblyUtils = {
  /**
   * 检查当前环境是否支持装配件系统
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           typeof Promise !== 'undefined' &&
           typeof Map !== 'undefined' &&
           typeof Set !== 'undefined'
  },

  /**
   * 获取系统信息
   */
  getSystemInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    }
  },

  /**
   * 性能基准测试
   */
  async benchmark(): Promise<PerformanceBenchmark> {
    const startTime = performance.now()
    
    // 简单的性能测试
    const results = {
      loadTime: 0,
      memoryUsage: 0,
      operationsPerSecond: 0
    }

    // 模拟装配件加载测试
    const testStart = performance.now()
    for (let i = 0; i < 1000; i++) {
      // 模拟操作
      await new Promise(resolve => setTimeout(resolve, 0))
    }
    results.loadTime = performance.now() - testStart
    results.operationsPerSecond = 1000 / (results.loadTime / 1000)

    // 估算内存使用
    if ('memory' in performance) {
      results.memoryUsage = (performance as any).memory.usedJSHeapSize
    }

    results.loadTime = performance.now() - startTime

    return results
  }
}

// 类型定义
interface PerformanceBenchmark {
  loadTime: number
  memoryUsage: number
  operationsPerSecond: number
}

export default {
  createDefaultAssemblyManager,
  AssemblySystemInfo,
  AssemblyUtils
}