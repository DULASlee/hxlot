/**
 * 装配件加载器 - 动态加载和管理前端装配件
 */

import type { AssemblyConfig, AssemblyDefinition } from './assembly-types'

export class AssemblyLoader {
  private assemblies: Map<string, AssemblyDefinition> = new Map()
  private config: AssemblyConfig
  
  constructor(config: AssemblyConfig) {
    this.config = config
    this.initializeAssemblies()
  }

  /**
   * 初始化装配件
   */
  private async initializeAssemblies(): Promise<void> {
    for (const [assemblyName, assemblyConfig] of Object.entries(this.config.assemblies)) {
      if (assemblyConfig.enabled) {
        await this.loadAssembly(assemblyName, assemblyConfig)
      }
    }
  }

  /**
   * 动态加载装配件
   */
  private async loadAssembly(name: string, config: any): Promise<void> {
    try {
      console.log(`Loading assembly: ${name} v${config.version}`)
      
      // 检查依赖
      await this.checkDependencies(config.dependencies || [])
      
      // 动态导入装配件模块
      const assemblyModule = await this.importAssembly(name, config)
      
      const assembly: AssemblyDefinition = {
        name,
        version: config.version,
        config,
        exports: assemblyModule,
        loaded: true,
        loadTime: new Date()
      }
      
      this.assemblies.set(name, assembly)
      console.log(`Assembly ${name} loaded successfully`)
      
    } catch (error) {
      console.error(`Failed to load assembly ${name}:`, error)
      throw error
    }
  }

  /**
   * 检查依赖关系
   */
  private async checkDependencies(dependencies: string[]): Promise<void> {
    for (const dep of dependencies) {
      if (!this.assemblies.has(dep) || !this.assemblies.get(dep)?.loaded) {
        throw new Error(`Dependency ${dep} not loaded`)
      }
    }
  }

  /**
   * 动态导入装配件
   */
  private async importAssembly(name: string, config: any): Promise<any> {
    // 根据装配件类型采用不同的加载策略
    switch (config.type) {
      case 'frontend':
        return await this.importFrontendAssembly(name, config)
      case 'backend':
        return await this.importBackendAssembly(name, config)
      default:
        throw new Error(`Unsupported assembly type: ${config.type}`)
    }
  }

  /**
   * 导入前端装配件
   */
  private async importFrontendAssembly(name: string, config: any): Promise<any> {
    const exports: any = {}
    
    // 动态加载导出的模块
    if (config.exports) {
      for (const [exportName, modulePath] of Object.entries(config.exports)) {
        try {
          // 这里可以根据实际模块系统调整加载逻辑
          exports[exportName] = await import(/* @vite-ignore */ modulePath as string)
        } catch (error) {
          console.warn(`Failed to load export ${exportName} for assembly ${name}:`, error)
        }
      }
    }
    
    return exports
  }

  /**
   * 导入后端装配件（前端中的后端服务客户端）
   */
  private async importBackendAssembly(name: string, config: any): Promise<any> {
    // 后端装配件在前端中通常表现为API客户端
    return {
      apiClient: await this.createApiClient(name, config),
      services: config.services || []
    }
  }

  /**
   * 创建API客户端
   */
  private async createApiClient(name: string, config: any): Promise<any> {
    // 根据配置创建对应的API客户端
    // 这里可以集成axios、fetch等HTTP客户端
    return {
      name,
      baseURL: this.getServiceEndpoint(name),
      // 其他客户端配置...
    }
  }

  /**
   * 获取服务端点
   */
  private getServiceEndpoint(serviceName: string): string {
    // 从环境配置或服务发现获取端点
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:44379'
    return `${baseUrl}/api/${serviceName}`
  }

  /**
   * 获取装配件实例
   */
  getAssembly<T = any>(name: string): AssemblyDefinition<T> | undefined {
    return this.assemblies.get(name) as AssemblyDefinition<T>
  }

  /**
   * 检查装配件是否已加载
   */
  isAssemblyLoaded(name: string): boolean {
    return this.assemblies.get(name)?.loaded || false
  }

  /**
   * 获取所有已加载的装配件
   */
  getLoadedAssemblies(): string[] {
    return Array.from(this.assemblies.entries())
      .filter(([_, assembly]) => assembly.loaded)
      .map(([name]) => name)
  }

  /**
   * 重新加载装配件
   */
  async reloadAssembly(name: string): Promise<void> {
    const assemblyConfig = this.config.assemblies[name]
    if (assemblyConfig) {
      this.assemblies.delete(name)
      await this.loadAssembly(name, assemblyConfig)
    }
  }

  /**
   * 启用/禁用装配件
   */
  async toggleAssembly(name: string, enabled: boolean): Promise<void> {
    const assemblyConfig = this.config.assemblies[name]
    if (assemblyConfig) {
      assemblyConfig.enabled = enabled
      
      if (enabled && !this.isAssemblyLoaded(name)) {
        await this.loadAssembly(name, assemblyConfig)
      } else if (!enabled && this.isAssemblyLoaded(name)) {
        this.assemblies.delete(name)
      }
    }
  }
}

// 导出单例实例
let assemblyLoader: AssemblyLoader | null = null

export async function initializeAssemblyLoader(config: AssemblyConfig): Promise<AssemblyLoader> {
  if (!assemblyLoader) {
    assemblyLoader = new AssemblyLoader(config)
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  return assemblyLoader
}

export function getAssemblyLoader(): AssemblyLoader {
  if (!assemblyLoader) {
    throw new Error('AssemblyLoader not initialized. Call initializeAssemblyLoader first.')
  }
  return assemblyLoader
}