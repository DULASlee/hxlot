import type { 
  AssemblyConfig, 
  // ✅ 修复: AssemblyInstance已声明但未使用,注释掉
  // AssemblyInstance, 
  AssemblyEvent,
  // ✅ 修复: 使用IAssemblyManager而不是AssemblyManager
  IAssemblyManager as AssemblyManager  // 别名,避免全局替换
} from './assembly-types'

/**
 * 插件接口
 */
export interface AssemblyPlugin {
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 安装方法 */
  install(manager: AssemblyManager): void
  /** 卸载方法 */
  uninstall?(): void
  /** 插件配置 */
  config?: Record<string, any>
}

/**
 * 日志插件 - 记录装配件生命周期事件
 */
export class LoggingPlugin implements AssemblyPlugin {
  name = 'logging-plugin'
  version = '1.0.0'
  private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info'

  constructor(config?: { logLevel?: 'debug' | 'info' | 'warn' | 'error' }) {
    this.logLevel = config?.logLevel || 'info'
  }

  install(manager: AssemblyManager): void {
    // 监听所有事件
    manager.on('*', (event: AssemblyEvent) => {
      this.logEvent(event)
    })
  }

  private logEvent(event: AssemblyEvent): void {
    const timestamp = event.timestamp.toISOString()
    const message = `[${timestamp}] ${event.type.toUpperCase()} - ${event.assemblyName}`
    
    switch (event.type) {
      case 'error':
        if (this.shouldLog('error')) {
          console.error(message, event.error)
        }
        break
      case 'loading':
      case 'unloading':
        if (this.shouldLog('debug')) {
          console.debug(message)
        }
        break
      case 'loaded':
      case 'unloaded':
      case 'enabled':
      case 'disabled':
        if (this.shouldLog('info')) {
          console.info(message)
        }
        break
      default:
        if (this.shouldLog('debug')) {
          console.debug(message)
        }
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error']
    return levels.indexOf(level) >= levels.indexOf(this.logLevel)
  }
}

/**
 * 性能监控插件 - 监控装配件加载性能
 */
export class PerformancePlugin implements AssemblyPlugin {
  name = 'performance-plugin'
  version = '1.0.0'
  private metrics: Map<string, any[]> = new Map()

  install(manager: AssemblyManager): void {
    manager.on('loading', (event: AssemblyEvent) => {
      this.recordStart(event.assemblyName, 'load')
    })

    manager.on('loaded', (event: AssemblyEvent) => {
      this.recordEnd(event.assemblyName, 'load')
    })

    manager.on('unloading', (event: AssemblyEvent) => {
      this.recordStart(event.assemblyName, 'unload')
    })

    manager.on('unloaded', (event: AssemblyEvent) => {
      this.recordEnd(event.assemblyName, 'unload')
    })
  }

  private recordStart(assemblyName: string, operation: string): void {
    const key = `${assemblyName}-${operation}`
    this.metrics.set(key, [
      ...(this.metrics.get(key) || []),
      { start: performance.now() }
    ])
  }

  private recordEnd(assemblyName: string, operation: string): void {
    const key = `${assemblyName}-${operation}`
    const metrics = this.metrics.get(key)
    if (metrics && metrics.length > 0) {
      const lastMetric = metrics[metrics.length - 1]
      lastMetric.end = performance.now()
      lastMetric.duration = lastMetric.end - lastMetric.start
    }
  }

  /**
   * 获取性能指标
   */
  getMetrics(): Record<string, any> {
    const result: Record<string, any> = {}
    
    for (const [key, metrics] of this.metrics) {
      const validMetrics = metrics.filter(m => m.duration !== undefined)
      if (validMetrics.length > 0) {
        const durations = validMetrics.map(m => m.duration)
        result[key] = {
          count: validMetrics.length,
          average: durations.reduce((a, b) => a + b, 0) / durations.length,
          min: Math.min(...durations),
          max: Math.max(...durations),
          last: durations[durations.length - 1]
        }
      }
    }
    
    return result
  }

  /**
   * 重置性能指标
   */
  resetMetrics(): void {
    this.metrics.clear()
  }
}

/**
 * 依赖分析插件 - 分析装配件依赖关系
 */
export class DependencyAnalysisPlugin implements AssemblyPlugin {
  name = 'dependency-analysis-plugin'
  version = '1.0.0'
  private manager?: AssemblyManager

  install(manager: AssemblyManager): void {
    this.manager = manager
  }

  /**
   * 分析依赖关系
   */
  analyzeDependencies(): any {
    if (!this.manager) {
      throw new Error('插件未安装或管理器不可用')
    }

    const graph = this.manager.buildDependencyGraph()
    const configs = this.manager.getAllAssemblyConfigs()
    
    return {
      graph,
      statistics: {
        totalNodes: graph.nodes.size,
        rootNodes: graph.roots.length,
        hasCycles: graph.hasCycles,
        topologicalOrder: graph.topologicalOrder
      },
      recommendations: this.generateRecommendations(graph, configs)
    }
  }

  private generateRecommendations(graph: any, configs: AssemblyConfig[]): string[] {
    const recommendations: string[] = []

    if (graph.hasCycles) {
      recommendations.push('检测到循环依赖，建议重构依赖关系')
    }

    // 检查未使用的装配件
    const usedAssemblies = new Set<string>()
    for (const config of configs) {
      for (const dep of config.dependencies) {
        usedAssemblies.add(dep)
      }
    }

    const unusedAssemblies = configs
      .filter(config => !usedAssemblies.has(config.name) && config.dependencies.length === 0)
      .map(config => config.name)

    if (unusedAssemblies.length > 0) {
      recommendations.push(`以下装配件未被任何其他装配件依赖: ${unusedAssemblies.join(', ')}`)
    }

    // 检查深度依赖
    const maxDepth = this.calculateMaxDepth(graph)
    if (maxDepth > 5) {
      recommendations.push(`依赖链深度较大 (${maxDepth})，可能影响加载性能`)
    }

    return recommendations
  }

  private calculateMaxDepth(graph: any): number {
    let maxDepth = 0
    
    const dfs = (nodeName: string, depth: number, visited: Set<string> = new Set()): void => {
      if (visited.has(nodeName)) return
      
      visited.add(nodeName)
      maxDepth = Math.max(maxDepth, depth)
      
      const node = graph.nodes.get(nodeName)
      if (node) {
        for (const depName of node.dependencies) {
          dfs(depName, depth + 1, new Set(visited))
        }
      }
    }
    
    for (const rootName of graph.roots) {
      dfs(rootName, 1)
    }
    
    return maxDepth
  }
}

/**
 * 安全插件 - 验证装配件安全性
 */
export class SecurityPlugin implements AssemblyPlugin {
  name = 'security-plugin'
  version = '1.0.0'
  private allowedOrigins: string[] = []
  private signatureVerification = false

  constructor(config?: { 
    allowedOrigins?: string[]
    signatureVerification?: boolean 
  }) {
    this.allowedOrigins = config?.allowedOrigins || []
    this.signatureVerification = config?.signatureVerification || false
  }

  install(manager: AssemblyManager): void {
    // 在加载前验证安全性
    const originalLoad = manager.loadAssembly.bind(manager)
    
    manager.loadAssembly = async (name: string) => {
      const config = manager.getAssemblyConfig(name)
      if (config) {
        const securityCheck = await this.validateSecurity(config)
        if (!securityCheck.isSafe) {
          throw new Error(`安全验证失败: ${securityCheck.issues.join(', ')}`)
        }
      }
      
      return originalLoad(name)
    }
  }

  private async validateSecurity(config: AssemblyConfig): Promise<{ isSafe: boolean; issues: string[] }> {
    const issues: string[] = []

    // 验证入口文件来源
    if (this.allowedOrigins.length > 0) {
      const origin = this.getOriginFromEntry(config.entry)
      if (origin && !this.allowedOrigins.includes(origin)) {
        issues.push(`入口文件来源不在允许列表中: ${origin}`)
      }
    }

    // 验证签名（如果启用）
    if (this.signatureVerification && config.config?.signature) {
      const isValid = await this.verifySignature(config)
      if (!isValid) {
        issues.push('装配件签名验证失败')
      }
    }

    // 检查可疑配置
    if (config.config?.eval) {
      issues.push('配置包含可疑的 eval 相关设置')
    }

    return {
      isSafe: issues.length === 0,
      issues
    }
  }

  private getOriginFromEntry(entry: string): string | null {
    try {
      const url = new URL(entry, window.location.origin)
      return url.origin
    } catch {
      return null
    }
  }

  private async verifySignature(config: AssemblyConfig): Promise<boolean> {
    // 简化的签名验证逻辑
    // 实际实现应该使用加密库进行验证
    return config.config?.signature === 'valid-signature'
  }
}

/**
 * 热重载插件 - 支持开发时热重载
 */
export class HotReloadPlugin implements AssemblyPlugin {
  name = 'hot-reload-plugin'
  version = '1.0.0'
  private manager?: AssemblyManager
  private watchInterval?: number

  install(manager: AssemblyManager): void {
    this.manager = manager
  }

  /**
   * 开始监视文件变化
   */
  startWatching(pollInterval: number = 2000): void {
    this.stopWatching()
    
    this.watchInterval = window.setInterval(async () => {
      if (this.manager) {
        await this.checkForUpdates()
      }
    }, pollInterval)
  }

  /**
   * 停止监视
   */
  stopWatching(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval)
      this.watchInterval = undefined
    }
  }

  private async checkForUpdates(): Promise<void> {
    if (!this.manager) return

    const configs = this.manager.getAllAssemblyConfigs()
    
    for (const config of configs) {
      try {
        // 简化的更新检查逻辑
        // 实际实现应该检查文件修改时间或使用文件系统API
        const response = await fetch(config.entry, { method: 'HEAD' })
        if (response.headers.get('last-modified')) {
          // 检测到变化，重新加载装配件
          console.log(`检测到 ${config.name} 有更新，重新加载...`)
          await this.manager.reloadAssembly(config.name)
        }
      } catch (error) {
        console.warn(`检查 ${config.name} 更新失败:`, error)
      }
    }
  }
}

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins: Map<string, AssemblyPlugin> = new Map()
  private manager?: AssemblyManager

  constructor(manager?: AssemblyManager) {
    if (manager) {
      this.manager = manager
    }
  }

  setManager(manager: AssemblyManager): void {
    this.manager = manager
  }

  install(plugin: AssemblyPlugin): void {
    if (!this.manager) {
      throw new Error('必须先设置装配件管理器')
    }

    if (this.plugins.has(plugin.name)) {
      throw new Error(`插件 ${plugin.name} 已安装`)
    }

    plugin.install(this.manager)
    this.plugins.set(plugin.name, plugin)
  }

  uninstall(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (plugin) {
      if (plugin.uninstall) {
        plugin.uninstall()
      }
      this.plugins.delete(pluginName)
    }
  }

  getPlugin<T extends AssemblyPlugin>(pluginName: string): T | undefined {
    return this.plugins.get(pluginName) as T
  }

  getAllPlugins(): AssemblyPlugin[] {
    return Array.from(this.plugins.values())
  }

  clear(): void {
    for (const pluginName of this.plugins.keys()) {
      this.uninstall(pluginName)
    }
  }
}

/**
 * 默认插件包
 */
export class DefaultPluginBundle {
  static create(manager: AssemblyManager): PluginManager {
    const pluginManager = new PluginManager(manager)
    
    // 安装默认插件
    pluginManager.install(new LoggingPlugin())
    pluginManager.install(new PerformancePlugin())
    pluginManager.install(new DependencyAnalysisPlugin())
    
    return pluginManager
  }
}

export default PluginManager