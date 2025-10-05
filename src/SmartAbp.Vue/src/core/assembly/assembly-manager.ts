/**
 * 装配件管理器主类
 */

import type { 
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
  DependencyGraph
} from './assembly-types'

import { AssemblyLoader } from './assembly-loader'
import { AssemblyConfigManager } from './assembly-config'
import { 
  validateAssemblyConfig, 
  generateId, 
  deepClone,
  debounce
} from './assembly-utils'

/**
 * 装配件管理器实现类
 */
export class AssemblyManager implements IAssemblyManager {
  private configManager: AssemblyConfigManager
  private loader: IAssemblyLoader
  private instances: Map<string, AssemblyInstance> = new Map()
  private eventHandlers: Map<AssemblyEventType | '*', Function[]> = new Map()
  private options: AssemblyManagerOptions
  private healthCheckInterval?: number
  private isInitialized: boolean = false

  constructor(options: AssemblyManagerOptions = {}) {
    this.options = {
      autoLoad: true,
      enableHealthChecks: true,
      healthCheckInterval: 30000, // 30秒
      enablePlugins: true,
      debug: false,
      ...options
    }

    this.configManager = new AssemblyConfigManager(options.storage)
    this.loader = new AssemblyLoader(options.loaderOptions)

    this.initialize()
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // 加载配置
      await this.configManager.load()

      // 启动健康检查
      if (this.options.enableHealthChecks) {
        this.startHealthChecks()
      }

      // 自动加载已启用的装配件
      if (this.options.autoLoad) {
        await this.loadEnabledAssemblies()
      }

      this.isInitialized = true
      this.emit('initialized', {
        type: 'initialized',
        assemblyName: 'system',
        timestamp: new Date(),
        data: { success: true }
      })

      if (this.options.debug) {
        console.log('装配件管理器初始化完成')
      }
    } catch (error) {
      this.emit('error', {
        type: 'error',
        assemblyName: 'system',
        timestamp: new Date(),
        error: error as Error
      })
      throw error
    }
  }

  private async loadEnabledAssemblies(): Promise<void> {
    const configs = this.configManager.getAllConfigs()
    const enabledConfigs = configs.filter(config => config.enabled)

    for (const config of enabledConfigs) {
      try {
        await this.loadAssembly(config.name)
      } catch (error) {
        console.warn(`自动加载装配件 ${config.name} 失败:`, error)
      }
    }
  }

  private startHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = window.setInterval(async () => {
      await this.performHealthChecks()
    }, this.options.healthCheckInterval)
  }

  private async performHealthChecks(): Promise<void> {
    const instances = Array.from(this.instances.values())
    
    for (const instance of instances) {
      if (instance.loaded && instance.enabled) {
        try {
          const health = await this.checkAssemblyHealth(instance.name)
          if (health.status === 'unhealthy') {
            this.emit('health-changed', {
              type: 'health-changed',
              assemblyName: instance.name,
              timestamp: new Date(),
              data: health
            })
          }
        } catch (error) {
          console.warn(`装配件 ${instance.name} 健康检查失败:`, error)
        }
      }
    }
  }

  async registerAssembly(config: AssemblyConfig): Promise<AssemblyValidationResult> {
    const validation = validateAssemblyConfig(config)
    
    if (!validation.isValid) {
      this.emit('validation-failed', {
        type: 'validation-failed',
        assemblyName: config.name,
        timestamp: new Date(),
        data: validation
      })
      throw new Error(`装配件配置验证失败: ${validation.errors.join(', ')}`)
    }

    // 检查是否已存在同名装配件
    const existingConfig = this.configManager.getConfig(config.name)
    if (existingConfig) {
      this.emit('updated', {
        type: 'updated',
        assemblyName: config.name,
        timestamp: new Date(),
        data: { oldConfig: existingConfig, newConfig: config }
      })
    } else {
      this.emit('registered', {
        type: 'registered',
        assemblyName: config.name,
        timestamp: new Date(),
        data: config
      })
    }

    await this.configManager.saveConfig(config)

    // 如果装配件已启用且自动加载，则立即加载
    if (config.enabled && this.options.autoLoad) {
      try {
        await this.loadAssembly(config.name)
      } catch (error) {
        console.warn(`注册后自动加载装配件 ${config.name} 失败:`, error)
      }
    }

    return validation
  }

  async unregisterAssembly(name: string): Promise<void> {
    const config = this.configManager.getConfig(name)
    if (!config) {
      throw new Error(`装配件 ${name} 未注册`)
    }

    // 如果装配件已加载，先卸载
    if (this.instances.has(name)) {
      await this.unloadAssembly(name)
    }

    await this.configManager.removeConfig(name)

    this.emit('unregistered', {
      type: 'unregistered',
      assemblyName: name,
      timestamp: new Date(),
      data: config
    })
  }

  async loadAssembly(name: string): Promise<AssemblyInstance> {
    const config = this.configManager.getConfig(name)
    if (!config) {
      throw new Error(`装配件 ${name} 未注册`)
    }

    // 检查是否已加载
    const existingInstance = this.instances.get(name)
    if (existingInstance && existingInstance.loaded) {
      return existingInstance
    }

    this.emit('loading', {
      type: 'loading',
      assemblyName: name,
      timestamp: new Date(),
      data: config
    })

    try {
      // 检查依赖关系
      await this.loadDependencies(config.dependencies)

      // 加载装配件
      const instance = await this.loader.load(config.entry, config)
      
      const assemblyInstance: AssemblyInstance = {
        name: config.name,
        config: deepClone(config),
        loaded: true,
        enabled: config.enabled,
        instance: instance,
        error: undefined
      }

      this.instances.set(name, assemblyInstance)

      this.emit('loaded', {
        type: 'loaded',
        assemblyName: name,
        timestamp: new Date(),
        data: assemblyInstance
      })

      return assemblyInstance
    } catch (error) {
      const failedInstance: AssemblyInstance = {
        name: config.name,
        config: deepClone(config),
        loaded: false,
        enabled: false,
        instance: undefined,
        error: error as Error
      }

      this.instances.set(name, failedInstance)

      this.emit('error', {
        type: 'error',
        assemblyName: name,
        timestamp: new Date(),
        error: error as Error
      })

      throw error
    }
  }

  async unloadAssembly(name: string): Promise<void> {
    const instance = this.instances.get(name)
    if (!instance) {
      throw new Error(`装配件 ${name} 未加载`)
    }

    this.emit('unloading', {
      type: 'unloading',
      assemblyName: name,
      timestamp: new Date(),
      data: instance
    })

    try {
      await this.loader.unload(instance)
      this.instances.delete(name)

      this.emit('unloaded', {
        type: 'unloaded',
        assemblyName: name,
        timestamp: new Date(),
        data: instance
      })
    } catch (error) {
      this.emit('error', {
        type: 'error',
        assemblyName: name,
        timestamp: new Date(),
        error: error as Error
      })
      throw error
    }
  }

  async reloadAssembly(name: string): Promise<AssemblyInstance> {
    await this.unloadAssembly(name)
    return this.loadAssembly(name)
  }

  async enableAssembly(name: string): Promise<void> {
    const config = this.configManager.getConfig(name)
    if (!config) {
      throw new Error(`装配件 ${name} 未注册`)
    }

    if (config.enabled) {
      return // 已经启用
    }

    config.enabled = true
    await this.configManager.saveConfig(config)

    // 如果自动加载启用，则加载装配件
    if (this.options.autoLoad) {
      await this.loadAssembly(name)
    }

    this.emit('enabled', {
      type: 'enabled',
      assemblyName: name,
      timestamp: new Date(),
      data: config
    })
  }

  async disableAssembly(name: string): Promise<void> {
    const config = this.configManager.getConfig(name)
    if (!config) {
      throw new Error(`装配件 ${name} 未注册`)
    }

    if (!config.enabled) {
      return // 已经禁用
    }

    config.enabled = false
    await this.configManager.saveConfig(config)

    // 如果装配件已加载，则卸载
    if (this.instances.has(name)) {
      await this.unloadAssembly(name)
    }

    this.emit('disabled', {
      type: 'disabled',
      assemblyName: name,
      timestamp: new Date(),
      data: config
    })
  }

  getAssembly(name: string): AssemblyInstance | null {
    return this.instances.get(name) || null
  }

  getAllAssemblyConfigs(): AssemblyConfig[] {
    return this.configManager.getAllConfigs()
  }

  getAllAssemblyInstances(): AssemblyInstance[] {
    return Array.from(this.instances.values())
  }

  validateAssembly(config: AssemblyConfig): AssemblyValidationResult {
    return validateAssemblyConfig(config)
  }

  async checkAssemblyHealth(name: string): Promise<AssemblyHealth> {
    const instance = this.instances.get(name)
    if (!instance) {
      return {
        status: 'unknown',
        message: '装配件未加载',
        timestamp: new Date()
      }
    }

    if (!instance.loaded) {
      return {
        status: 'unhealthy',
        message: '装配件加载失败',
        timestamp: new Date(),
        error: instance.error
      }
    }

    try {
      // 调用装配件的健康检查方法（如果存在）
      if (instance.instance && typeof instance.instance.healthCheck === 'function') {
        const healthResult = await instance.instance.healthCheck()
        return {
          status: healthResult.status || 'healthy',
          message: healthResult.message,
          timestamp: new Date(),
          details: healthResult.details
        }
      }

      // 基础健康检查
      return {
        status: 'healthy',
        message: '装配件运行正常',
        timestamp: new Date()
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: '健康检查失败',
        timestamp: new Date(),
        error: error as Error
      }
    }
  }

  buildDependencyGraph(): DependencyGraph {
    const configs = this.configManager.getAllConfigs()
    const { buildDependencyGraph } = require('./assembly-utils')
    return buildDependencyGraph(configs)
  }

  on(event: AssemblyEventType | '*', handler: (event: AssemblyEvent) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  off(event: AssemblyEventType | '*', handler: (event: AssemblyEvent) => void): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private emit(eventType: AssemblyEventType, event: AssemblyEvent): void {
    // 调用特定事件的处理程序
    const specificHandlers = this.eventHandlers.get(eventType) || []
    for (const handler of specificHandlers) {
      try {
        handler(event)
      } catch (error) {
        console.error(`事件处理程序执行失败 (${eventType}):`, error)
      }
    }

    // 调用通配符事件的处理程序
    const wildcardHandlers = this.eventHandlers.get('*') || []
    for (const handler of wildcardHandlers) {
      try {
        handler(event)
      } catch (error) {
        console.error(`通配符事件处理程序执行失败:`, error)
      }
    }

    if (this.options.debug) {
      console.log(`[AssemblyManager] ${eventType}: ${event.assemblyName}`)
    }
  }

  private async loadDependencies(dependencies: string[]): Promise<void> {
    for (const depName of dependencies) {
      const depConfig = this.configManager.getConfig(depName)
      if (!depConfig) {
        throw new Error(`依赖项 ${depName} 未注册`)
      }

      if (!this.instances.has(depName) || !this.instances.get(depName)!.loaded) {
        await this.loadAssembly(depName)
      }
    }
  }

  async dispose(): Promise<void> {
    // 停止健康检查
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = undefined
    }

    // 卸载所有装配件
    const instances = Array.from(this.instances.values())
    for (const instance of instances) {
      try {
        await this.unloadAssembly(instance.name)
      } catch (error) {
        console.warn(`卸载装配件 ${instance.name} 失败:`, error)
      }
    }

    // 清空事件处理程序
    this.eventHandlers.clear()

    this.isInitialized = false

    this.emit('disposed', {
      type: 'disposed',
      assemblyName: 'system',
      timestamp: new Date(),
      data: { success: true }
    })
  }
}

/**
 * 创建装配件管理器实例
 */
export async function createAssemblyManager(
  options: AssemblyManagerOptions = {}
): Promise<AssemblyManager> {
  const manager = new AssemblyManager(options)
  await manager['initialize']() // 调用私有初始化方法
  return manager
}

export default AssemblyManager