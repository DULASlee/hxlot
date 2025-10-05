/**
 * 装配件系统与现有项目的集成模块
 * 将装配件系统集成到 SmartAbp.Vue 项目中
 */

import type { AssemblyConfig, IAssemblyManager } from './assembly-types'
import { createDefaultAssemblyManager } from './index'

/**
 * SmartAbp 装配件系统集成器
 */
export class AssemblySystemIntegrator {
  private manager: IAssemblyManager | null = null
  private isIntegrated: boolean = false
  private registeredAssemblies: Map<string, AssemblyConfig> = new Map()

  constructor() {
    this.initializeIntegration()
  }

  /**
   * 初始化集成
   */
  private async initializeIntegration(): Promise<void> {
    try {
      this.manager = await createDefaultAssemblyManager()
      this.isIntegrated = true

      console.log('装配件系统集成完成')

      // 注册项目核心装配件
      await this.registerCoreAssemblies()

    } catch (error) {
      console.error('装配件系统集成失败:', error)
      this.isIntegrated = false
    }
  }

  /**
   * 注册项目核心装配件
   */
  private async registerCoreAssemblies(): Promise<void> {
    if (!this.manager) return

    // 低代码引擎装配件
    await this.registerLowCodeEngineAssembly()

    // Aspire 微服务编排器装配件
    await this.registerAspireOrchestratorAssembly()

    // 代码生成器装配件
    await this.registerCodeGeneratorAssembly()

    // 运维管理装配件
    await this.registerOpsManagementAssembly()

    console.log('核心装配件注册完成')
  }

  /**
   * 注册低代码引擎装配件
   */
  private async registerLowCodeEngineAssembly(): Promise<void> {
    if (!this.manager) return

    const config: AssemblyConfig = {
      name: 'low-code-engine',
      version: '1.0.0',
      type: 'module',
      entry: '/api/assemblies/low-code-engine',
      enabled: true,
      dependencies: ['aspire-orchestrator'],
      metadata: {
        description: '企业通用低代码引擎',
        author: 'SmartAbp Team',
        category: 'engine',
        tags: ['low-code', 'engine', 'enterprise'],
        unsafeEval: false
      },
      config: {
        timeout: 30000,
        maxMemory: 2048,
        features: {
          dragDrop: true,
          visualEditing: true,
          codeGeneration: true,
          validation: true
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await this.manager.registerAssembly(config)
    this.registeredAssemblies.set(config.name, config)
  }

  /**
   * 注册 Aspire 微服务编排器装配件
   */
  private async registerAspireOrchestratorAssembly(): Promise<void> {
    if (!this.manager) return

    const config: AssemblyConfig = {
      name: 'aspire-orchestrator',
      version: '1.0.0',
      type: 'service',
      entry: '/api/assemblies/aspire-orchestrator',
      enabled: true,
      dependencies: [],
      metadata: {
        description: 'Aspire 微服务编排器',
        author: 'SmartAbp Team',
        category: 'orchestrator',
        tags: ['aspire', 'microservices', 'orchestration'],
        unsafeEval: false
      },
      config: {
        serviceDiscovery: {
          enabled: true,
          type: 'consul'
        },
        loadBalancing: {
          algorithm: 'round-robin'
        },
        circuitBreaker: {
          enabled: true,
          failureThreshold: 5
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await this.manager.registerAssembly(config)
    this.registeredAssemblies.set(config.name, config)
  }

  /**
   * 注册代码生成器装配件
   */
  private async registerCodeGeneratorAssembly(): Promise<void> {
    if (!this.manager) return

    const config: AssemblyConfig = {
      name: 'code-generator',
      version: '1.0.0',
      type: 'module',
      entry: '/api/assemblies/code-generator',
      enabled: true,
      dependencies: ['low-code-engine'],
      metadata: {
        description: 'SmartAbp 代码生成器',
        author: 'SmartAbp Team',
        category: 'generator',
        tags: ['code-generation', 'scaffolding'],
        unsafeEval: true // 代码生成需要eval功能
      },
      config: {
        templates: {
          entity: true,
          service: true,
          controller: true,
          vueComponent: true
        },
        output: {
          format: 'typescript',
          style: 'abp'
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await this.manager.registerAssembly(config)
    this.registeredAssemblies.set(config.name, config)
  }

  /**
   * 注册运维管理装配件
   */
  private async registerOpsManagementAssembly(): Promise<void> {
    if (!this.manager) return

    const config: AssemblyConfig = {
      name: 'ops-management',
      version: '1.0.0',
      type: 'service',
      entry: '/api/assemblies/ops-management',
      enabled: true,
      dependencies: ['aspire-orchestrator'],
      metadata: {
        description: '运维管理系统',
        author: 'SmartAbp Team',
        category: 'management',
        tags: ['operations', 'monitoring', 'management'],
        unsafeEval: false
      },
      config: {
        monitoring: {
          enabled: true,
          interval: 60000
        },
        alerting: {
          enabled: true,
          channels: ['email', 'slack']
        },
        logging: {
          level: 'info',
          retention: '30d'
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await this.manager.registerAssembly(config)
    this.registeredAssemblies.set(config.name, config)
  }

  /**
   * 获取装配件管理器实例
   */
  getManager(): IAssemblyManager | null {
    return this.manager
  }

  /**
   * 检查集成状态
   */
  isSystemIntegrated(): boolean {
    return this.isIntegrated && this.manager !== null
  }

  /**
   * 获取已注册的装配件列表
   */
  getRegisteredAssemblies(): AssemblyConfig[] {
    return Array.from(this.registeredAssemblies.values())
  }

  /**
   * 动态注册新装配件
   */
  async registerCustomAssembly(config: AssemblyConfig): Promise<boolean> {
    if (!this.manager) return false

    try {
      await this.manager.registerAssembly(config)
      this.registeredAssemblies.set(config.name, config)
      return true
    } catch (error) {
      console.error('注册自定义装配件失败:', error)
      return false
    }
  }

  /**
   * 启用/禁用装配件
   */
  async toggleAssembly(name: string, enabled: boolean): Promise<boolean> {
    if (!this.manager) return false

    try {
      if (enabled) {
        await this.manager.enableAssembly(name)
      } else {
        await this.manager.disableAssembly(name)
      }
      return true
    } catch (error) {
      console.error(`切换装配件 ${name} 状态失败:`, error)
      return false
    }
  }

  /**
   * 执行装配件功能
   */
  async executeAssembly(name: string, params?: any): Promise<any> {
    if (!this.manager) {
      throw new Error('装配件系统未就绪')
    }

    const instance = this.manager.getAssembly(name)
    if (!instance || !instance.loaded) {
      throw new Error(`装配件 ${name} 未加载`)
    }

    if (typeof instance.instance.execute !== 'function') {
      throw new Error(`装配件 ${name} 不支持执行操作`)
    }

    return instance.instance.execute(params)
  }

  /**
   * 获取系统健康状态
   */
  async getSystemHealth(): Promise<SystemHealth> {
    if (!this.manager) {
      return {
        status: 'unhealthy',
        message: '装配件系统未初始化',
        timestamp: new Date()
      }
    }

    const assemblies = this.manager.getAllAssemblyInstances()
    const healthChecks = await Promise.allSettled(
      assemblies.map(instance =>
        this.manager!.checkAssemblyHealth(instance.name)
      )
    )

    const healthyCount = healthChecks.filter(
      result => result.status === 'fulfilled' && result.value.status === 'healthy'
    ).length

    const totalCount = assemblies.length

    return {
      status: healthyCount === totalCount ? 'healthy' : 'degraded',
      message: `${healthyCount}/${totalCount} 个装配件健康`,
      timestamp: new Date(),
      details: {
        totalAssemblies: totalCount,
        healthyAssemblies: healthyCount,
        unhealthyAssemblies: totalCount - healthyCount,
        healthPercentage: totalCount > 0 ? (healthyCount / totalCount) * 100 : 0
      }
    }
  }

  /**
   * 重新加载所有装配件
   */
  async reloadAllAssemblies(): Promise<ReloadResult> {
    if (!this.manager) {
      return { success: false, message: '装配件系统未就绪' }
    }

    const instances = this.manager.getAllAssemblyInstances()
    const results: ReloadResult[] = []

    for (const instance of instances) {
      try {
        await this.manager.reloadAssembly(instance.name)
        results.push({
          assembly: instance.name,
          success: true,
          message: '重新加载成功'
        })
      } catch (error) {
        results.push({
          assembly: instance.name,
          success: false,
          message: `重新加载失败: ${error}`
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    return {
      success: successCount === totalCount,
      message: `重新加载完成: ${successCount}/${totalCount} 成功`,
      details: results
    }
  }

  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    if (this.manager) {
      await this.manager.dispose?.()
      this.manager = null
    }
    this.isIntegrated = false
    this.registeredAssemblies.clear()
  }
}

/**
 * 创建全局装配件系统集成器实例
 */
let globalIntegrator: AssemblySystemIntegrator | null = null

export function getAssemblySystemIntegrator(): AssemblySystemIntegrator {
  if (!globalIntegrator) {
    globalIntegrator = new AssemblySystemIntegrator()
  }
  return globalIntegrator
}

/**
 * Vue 插件安装
 */
export function installAssemblySystem(app: any): void {
  const integrator = getAssemblySystemIntegrator()

  // 将装配件管理器注入到Vue应用
  app.config.globalProperties.$assemblySystem = integrator

  // 提供装配件系统给组件使用
  app.provide('assemblySystem', integrator)

  console.log('装配件系统Vue插件安装完成')
}

/**
 * 组合式API Hook
 */
export function useAssemblySystem() {
  const integrator = getAssemblySystemIntegrator()

  return {
    manager: integrator.getManager(),
    isIntegrated: integrator.isSystemIntegrated(),
    assemblies: integrator.getRegisteredAssemblies(),
    execute: integrator.executeAssembly.bind(integrator),
    toggle: integrator.toggleAssembly.bind(integrator),
    health: integrator.getSystemHealth.bind(integrator),
    reload: integrator.reloadAllAssemblies.bind(integrator)
  }
}

// 类型定义
interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  message: string
  timestamp: Date
  details?: any
}

interface ReloadResult {
  assembly?: string
  success: boolean
  message: string
  details?: ReloadResult[]
}

export default {
  AssemblySystemIntegrator,
  getAssemblySystemIntegrator,
  installAssemblySystem,
  useAssemblySystem
}