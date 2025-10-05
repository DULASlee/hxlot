import type { AssemblyConfig, AssemblyHealth, AssemblyInstance } from './assembly-types'

/**
 * 装配件加载器
 * 负责动态加载、执行和管理装配件
 */
export class AssemblyLoader {
  private loadedAssemblies: Map<string, AssemblyInstance> = new Map()
  private loadPromises: Map<string, Promise<AssemblyInstance>> = new Map()

  /**
   * 加载装配件
   */
  async loadAssembly(config: AssemblyConfig): Promise<AssemblyInstance> {
    const { name, timeout } = config

    // 检查是否已加载
    if (this.loadedAssemblies.has(name)) {
      return this.loadedAssemblies.get(name)!
    }

    // 检查是否正在加载
    if (this.loadPromises.has(name)) {
      return this.loadPromises.get(name)!
    }

    // 创建加载Promise
    const loadPromise = this._loadAssemblyInternal(config)
    this.loadPromises.set(name, loadPromise)

    try {
      // 设置超时
      const instance = await this._withTimeout(loadPromise, (timeout ?? 30) * 1000)

      this.loadedAssemblies.set(name, instance)
      this.loadPromises.delete(name)

      return instance
    } catch (error) {
      this.loadPromises.delete(name)
      throw error
    }
  }

  /**
   * 卸载装配件
   */
  async unloadAssembly(name: string): Promise<void> {
    const instance = this.loadedAssemblies.get(name)
    if (!instance) {
      return
    }

    try {
      // 调用卸载钩子
      if (typeof instance.unload === 'function') {
        await instance.unload()
      }

      // 清理资源
      if (typeof instance.cleanup === 'function') {
        await instance.cleanup()
      }

      this.loadedAssemblies.delete(name)
    } catch (error) {
      console.error(`卸载装配件 ${name} 时出错:`, error)
      throw error
    }
  }

  /**
   * 重新加载装配件
   */
  async reloadAssembly(name: string, config: AssemblyConfig): Promise<AssemblyInstance> {
    await this.unloadAssembly(name)
    return this.loadAssembly(config)
  }

  /**
   * 获取已加载的装配件
   */
  getLoadedAssembly(name: string): AssemblyInstance | undefined {
    return this.loadedAssemblies.get(name)
  }

  /**
   * 获取所有已加载的装配件
   */
  getAllLoadedAssemblies(): Map<string, AssemblyInstance> {
    return new Map(this.loadedAssemblies)
  }

  /**
   * 检查装配件健康状态
   */
  async checkAssemblyHealth(name: string): Promise<AssemblyHealth> {
    const instance = this.loadedAssemblies.get(name)
    if (!instance) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        lastCheck: new Date(),
        message: '装配件未加载'
      }
    }

    try {
      // 调用健康检查方法
      if (typeof instance.healthCheck === 'function') {
        const healthResult = await instance.healthCheck()
        return {
          ...healthResult,
          lastCheck: new Date()
        }
      }

      // 默认健康状态
      return {
        status: 'healthy',
        timestamp: new Date(),
        lastCheck: new Date(),
        message: '装配件运行正常'
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        lastCheck: new Date(),
        message: `健康检查失败: ${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  }

  /**
   * 批量检查健康状态
   */
  async checkAllAssembliesHealth(): Promise<Map<string, AssemblyHealth>> {
    const healthResults = new Map<string, AssemblyHealth>()

    for (const [name] of this.loadedAssemblies) {
      const health = await this.checkAssemblyHealth(name)
      healthResults.set(name, health)
    }

    return healthResults
  }

  /**
   * 内部加载方法
   */
  private async _loadAssemblyInternal(config: AssemblyConfig): Promise<AssemblyInstance> {
    const { name, entry } = config

    try {
      // 动态导入装配件
      const module = await import(/* @vite-ignore */ entry)

      if (!module.default) {
        throw new Error(`装配件 ${name} 没有导出默认对象`)
      }

      const assemblyModule = module.default

      // 验证装配件结构
      this._validateAssemblyModule(assemblyModule, name)

      // 创建装配件实例
      const instance: AssemblyInstance = {
        name: config.name,
        version: config.version,
        config: config,
        loaded: true,
        enabled: true,
        instance: assemblyModule,
        loadTime: new Date(),
        health: {
          status: 'unknown',
          timestamp: new Date(),
          lastCheck: new Date()
        }
      }

      // 调用初始化方法
      if (typeof assemblyModule.initialize === 'function') {
        await assemblyModule.initialize(config)
      }

      // 调用启动方法
      if (typeof assemblyModule.start === 'function') {
        await assemblyModule.start()
      }

      // 更新健康状态
      instance.health = await this.checkAssemblyHealth(name)

      return instance
    } catch (error) {
      throw new Error(`加载装配件 ${name} 失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 验证装配件模块结构
   */
  private _validateAssemblyModule(module: any, name: string): void {
    if (typeof module !== 'object' || module === null) {
      throw new Error(`装配件 ${name} 的默认导出必须是一个对象`)
    }

    // 检查必需的方法
    const requiredMethods = ['initialize', 'start']
    for (const method of requiredMethods) {
      if (typeof module[method] !== 'function') {
        throw new Error(`装配件 ${name} 必须实现 ${method} 方法`)
      }
    }
  }

  /**
   * 带超时的Promise包装器
   */
  private _withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`操作超时 (${timeoutMs}ms)`))
      }, timeoutMs)

      promise
        .then(result => {
          clearTimeout(timeoutId)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timeoutId)
          reject(error)
        })
    })
  }

  /**
   * 清理所有装配件
   */
  async cleanup(): Promise<void> {
    const unloadPromises = Array.from(this.loadedAssemblies.keys()).map(name =>
      this.unloadAssembly(name).catch(error => {
        console.error(`清理装配件 ${name} 时出错:`, error)
      })
    )

    await Promise.all(unloadPromises)
    this.loadedAssemblies.clear()
    this.loadPromises.clear()
  }
}

/**
 * 创建装配件加载器实例
 */
export function createAssemblyLoader(): AssemblyLoader {
  return new AssemblyLoader()
}