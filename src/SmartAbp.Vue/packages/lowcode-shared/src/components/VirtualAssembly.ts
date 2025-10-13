/**
 * 虚拟程序集（Virtual Assembly）
 * 
 * 核心创新：通过Proxy模拟C#程序集的"全局类型可见性"
 * 
 * 工作原理：
 * 1. 创建Proxy对象拦截组件访问
 * 2. 从ComponentRegistry查找组件元数据
 * 3. 动态import加载组件模块
 * 4. 创建Vue3异步组件
 * 5. LRU缓存优化性能
 * 
 * 使用示例：
 * ```typescript
 * import { Components } from '@smartabp/lowcode-shared'
 * 
 * const SmartForm = Components.SmartForm  // Proxy拦截 → 自动加载
 * ```
 * 
 * @module VirtualAssembly
 * @author AI首席架构师
 * @since 2.0.0
 */

import { defineAsyncComponent, type AsyncComponentLoader, type Component } from 'vue'
import { globalPluginManager } from '../plugins/PluginManager'
import type { ComponentMetadata, ComponentRegistry } from './ComponentRegistry'

/**
 * LRU缓存实现
 * 用于缓存已加载的组件，避免重复加载
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private order: K[] = []

  constructor(private capacity: number = 100) { }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined
    }

    // 移到最前（标记为最近使用）
    this.order = this.order.filter(k => k !== key)
    this.order.unshift(key)

    return this.cache.get(key)
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // 已存在，更新位置
      this.order = this.order.filter(k => k !== key)
    } else if (this.cache.size >= this.capacity) {
      // 超出容量，淘汰最久未使用的
      const oldest = this.order.pop()
      if (oldest !== undefined) {
        this.cache.delete(oldest)
      }
    }

    this.cache.set(key, value)
    this.order.unshift(key)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
    this.order = []
  }

  get size(): number {
    return this.cache.size
  }
}

/**
 * 组件代理类型
 * 允许通过属性访问获取组件
 */
export type ComponentProxy = Record<string, Component>

/**
 * 虚拟程序集选项
 */
export interface VirtualAssemblyOptions {
  /**
   * 缓存容量（默认100）
   */
  cacheCapacity?: number

  /**
   * 加载延迟（ms，避免闪烁，默认200）
   */
  loadingDelay?: number

  /**
   * 加载超时（ms，默认30000）
   */
  loadingTimeout?: number

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
 * 性能统计
 */
interface PerformanceStats {
  totalLoads: number
  cacheHits: number
  cacheMisses: number
  avgLoadTime: number
  loadTimes: number[]
}

/**
 * 虚拟程序集类
 * 
 * 核心功能：
 * - 组件动态加载
 * - LRU缓存管理
 * - 性能监控
 * - 错误处理
 */
export class VirtualAssembly {
  private cache: LRUCache<string, Component>
  private options: Required<VirtualAssemblyOptions>
  private stats: PerformanceStats = {
    totalLoads: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgLoadTime: 0,
    loadTimes: []
  }

  constructor(
    private registry: ComponentRegistry,
    options: VirtualAssemblyOptions = {}
  ) {
    this.options = {
      cacheCapacity: options.cacheCapacity ?? 100,
      loadingDelay: options.loadingDelay ?? 200,
      loadingTimeout: options.loadingTimeout ?? 30000,
      enablePerformanceMonitoring: options.enablePerformanceMonitoring ?? true,
      debug: options.debug ?? false
    }

    this.cache = new LRUCache<string, Component>(this.options.cacheCapacity)

    if (this.options.debug) {
      console.log('[VirtualAssembly] 初始化完成', {
        cacheCapacity: this.options.cacheCapacity
      })
    }
  }

  /**
   * 创建组件代理对象
   * 
   * 核心魔法：通过Proxy拦截属性访问，实现按需加载
   * 
   * @returns 组件代理对象
   */
  createProxy(): ComponentProxy {
    return new Proxy({} as ComponentProxy, {
      /**
       * 拦截属性访问（最核心的逻辑）
       */
      get: (_target, componentName: string) => {
        // 内部方法不拦截
        if (componentName === 'toJSON' || typeof componentName === 'symbol') {
          return undefined
        }

        // 1. 缓存检查
        if (this.cache.has(componentName)) {
          this.stats.cacheHits++

          if (this.options.debug) {
            console.log(`[VirtualAssembly] 从缓存加载: ${componentName}`)
          }

          return this.cache.get(componentName)
        }

        this.stats.cacheMisses++

        // 2. Registry查找
        const metadata = this.registry.getMetadata(componentName)

        if (!metadata) {
          console.warn(`[VirtualAssembly] 组件未找到: ${componentName}`)
          return undefined
        }

        if (this.options.debug) {
          console.log(`[VirtualAssembly] 动态加载: ${componentName}`, {
            path: (metadata as any).path,
            bundle: metadata.bundle
          })
        }

        // 3. 创建异步组件
        const asyncComponent = this.createAsyncComponent(componentName, metadata)

        // 4. 缓存组件
        this.cache.set(componentName, asyncComponent)

        return asyncComponent
      },

      /**
       * 支持 'ComponentName' in Components 检查
       */
      has: (_target, componentName: string) => {
        return this.registry.getMetadata(componentName) !== null
      },

      /**
       * 支持 Object.keys(Components)
       */
      ownKeys: (_target) => {
        return this.registry.getAvailableComponents().map(m => m.name)
      },

      /**
       * 支持 Object.getOwnPropertyDescriptor
       */
      getOwnPropertyDescriptor: (_target, componentName: string) => {
        if (this.registry.getMetadata(componentName)) {
          return {
            enumerable: true,
            configurable: true
          }
        }
        return undefined
      }
    })
  }

  /**
   * 创建Vue3异步组件
   * 
   * @param name 组件名称
   * @param metadata 组件元数据
   * @returns Vue3异步组件
   */
  private createAsyncComponent(name: string, metadata: ComponentMetadata): Component {
    const startTime = this.options.enablePerformanceMonitoring ? performance.now() : 0
    const fromCache = this.cache.has(name)

    const loader: AsyncComponentLoader = async () => {
      try {
        // 触发加载前钩子
        await globalPluginManager.triggerHook('beforeComponentLoad', { fromCache }, name)

        // 动态import加载组件
        // 使用动态导入函数（TypeScript限制：import()必须是字面量，这里使用Function构造器）
        type DynamicImport = (path: string) => Promise<Record<string, unknown>>
        const dynamicImport = new Function('path', 'return import(path)') as DynamicImport
        
        // 根据bundle和组件名生成路径
        const componentPath = `${metadata.bundle}/components/${name}.vue`
        const module = await dynamicImport(/* @vite-ignore */ componentPath)

        // 性能统计
        if (this.options.enablePerformanceMonitoring) {
          const loadTime = performance.now() - startTime
          this.recordLoadTime(loadTime)

          if (this.options.debug) {
            console.log(`[VirtualAssembly] 加载完成: ${name} (${loadTime.toFixed(2)}ms)`)
          }

          // 触发加载后钩子（包含性能数据）
          await globalPluginManager.triggerHook('afterComponentLoad', {
            duration: loadTime,
            fromCache
          }, name)
        }

        this.stats.totalLoads++

        // 支持export default和命名导出
        return module.default || module[name]
      } catch (error) {
        console.error(`[VirtualAssembly] 加载失败: ${name}`, error)

        // 触发错误钩子
        await globalPluginManager.triggerHook('onError', { error }, name)

        throw error
      }
    }

    return defineAsyncComponent({
      loader,
      delay: this.options.loadingDelay,
      timeout: this.options.loadingTimeout,

      // 可选：自定义加载和错误组件
      // loadingComponent: () => import('./LoadingPlaceholder.vue'),
      // errorComponent: () => import('./ErrorPlaceholder.vue'),

      onError(error, retry, fail, attempts) {
        console.error(`[VirtualAssembly] 异步组件错误 (尝试 ${attempts}次):`, error)

        // 最多重试3次
        if (attempts <= 3) {
          retry()
        } else {
          fail()
        }
      }
    })
  }

  /**
   * 记录加载时间（用于性能统计）
   */
  private recordLoadTime(time: number): void {
    this.stats.loadTimes.push(time)

    // 只保留最近100次
    if (this.stats.loadTimes.length > 100) {
      this.stats.loadTimes.shift()
    }

    // 计算平均加载时间
    this.stats.avgLoadTime =
      this.stats.loadTimes.reduce((a, b) => a + b, 0) / this.stats.loadTimes.length
  }

  /**
   * 预加载组件（用于性能优化）
   * 
   * @param componentNames 要预加载的组件名称列表
   */
  async preload(componentNames: string[]): Promise<void> {
    if (this.options.debug) {
      console.log(`[VirtualAssembly] 预加载组件:`, componentNames)
    }

    const proxy = this.createProxy()

    await Promise.all(
      componentNames.map(async name => {
        try {
          const component = proxy[name]
          // 触发加载
          return component
        } catch (error) {
          console.error(`[VirtualAssembly] 预加载失败: ${name}`, error)
          return null
        }
      })
    )
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()

    if (this.options.debug) {
      console.log('[VirtualAssembly] 缓存已清除')
    }
  }

  /**
   * 获取性能统计
   */
  getStats(): PerformanceStats {
    return {
      ...this.stats,
      cacheHitRate: this.stats.totalLoads > 0
        ? (this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100
        : 0
    } as PerformanceStats & { cacheHitRate: number }
  }

  /**
   * 打印性能报告
   */
  printPerformanceReport(): void {
    const stats = this.getStats()

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 虚拟程序集性能报告')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`总加载次数: ${stats.totalLoads}`)
    console.log(`缓存命中: ${stats.cacheHits} (${(stats as any).cacheHitRate.toFixed(2)}%)`)
    console.log(`缓存未命中: ${stats.cacheMisses}`)
    console.log(`平均加载时间: ${stats.avgLoadTime.toFixed(2)}ms`)
    console.log(`当前缓存大小: ${this.cache.size}/${this.options.cacheCapacity}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }
}

/**
 * 创建虚拟程序集的便捷函数
 * 
 * @param registry 组件注册表
 * @param options 选项
 * @returns 组件代理对象
 */
export function createVirtualAssembly(
  registry: ComponentRegistry,
  options?: VirtualAssemblyOptions
): ComponentProxy {
  const assembly = new VirtualAssembly(registry, options)
  return assembly.createProxy()
}

