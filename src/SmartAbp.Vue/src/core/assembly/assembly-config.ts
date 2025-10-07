import type { AssemblyConfig, AssemblyStorage, AssemblyValidationResult } from './assembly-types'

/**
 * 装配件配置管理器
 * 负责装配件配置的验证、存储和管理
 */
export class AssemblyConfigManager {
  private configs: Map<string, AssemblyConfig> = new Map()
  private storage?: AssemblyStorage

  constructor(storage?: AssemblyStorage) {
    this.storage = storage
  }

  /**
   * 添加或更新配置
   */
  async addConfig(config: AssemblyConfig): Promise<void> {
    // 验证配置
    const validation = this.validateConfig(config)
    if (!validation.isValid) {
      throw new Error(`配置验证失败: ${validation.errors.join(', ')}`)
    }

    // 检查名称冲突
    if (this.configs.has(config.name) && this.configs.get(config.name)?.version !== config.version) {
      throw new Error(`装配件 ${config.name} 已存在，请使用不同的名称或版本`)
    }

    // 更新配置
    const now = new Date()
    const updatedConfig: AssemblyConfig = {
      ...config,
      updatedAt: now,
      createdAt: config.createdAt || now
    }

    this.configs.set(config.name, updatedConfig)

    // 保存到存储
    if (this.storage) {
      await this.storage.saveConfig(updatedConfig)
    }
  }

  /**
   * 获取配置
   */
  getConfig(name: string): AssemblyConfig | undefined {
    return this.configs.get(name)
  }

  /**
   * 获取所有配置
   */
  getAllConfigs(): AssemblyConfig[] {
    return Array.from(this.configs.values()).sort((a, b) => (a.loadOrder ?? 0) - (b.loadOrder ?? 0))
  }

  /**
   * 删除配置
   */
  async deleteConfig(name: string): Promise<void> {
    if (!this.configs.has(name)) {
      throw new Error(`装配件 ${name} 不存在`)
    }

    this.configs.delete(name)

    // 从存储中删除
    if (this.storage) {
      await this.storage.deleteConfig(name)
    }
  }

  /**
   * 启用装配件
   */
  async enableAssembly(name: string): Promise<void> {
    const config = this.configs.get(name)
    if (!config) {
      throw new Error(`装配件 ${name} 不存在`)
    }

    if (config.enabled) {
      return // 已经启用
    }

    const updatedConfig: AssemblyConfig = {
      ...config,
      enabled: true,
      updatedAt: new Date()
    }

    this.configs.set(name, updatedConfig)

    if (this.storage) {
      await this.storage.saveConfig(updatedConfig)
    }
  }

  /**
   * 禁用装配件
   */
  async disableAssembly(name: string): Promise<void> {
    const config = this.configs.get(name)
    if (!config) {
      throw new Error(`装配件 ${name} 不存在`)
    }

    if (!config.enabled) {
      return // 已经禁用
    }

    const updatedConfig: AssemblyConfig = {
      ...config,
      enabled: false,
      updatedAt: new Date()
    }

    this.configs.set(name, updatedConfig)

    if (this.storage) {
      await this.storage.saveConfig(updatedConfig)
    }
  }

  /**
   * 更新配置
   */
  async updateConfig(name: string, updates: Partial<AssemblyConfig>): Promise<void> {
    const config = this.configs.get(name)
    if (!config) {
      throw new Error(`装配件 ${name} 不存在`)
    }

    // 创建更新后的配置
    const updatedConfig: AssemblyConfig = {
      ...config,
      ...updates,
      updatedAt: new Date()
    }

    // 验证更新后的配置
    const validation = this.validateConfig(updatedConfig)
    if (!validation.isValid) {
      throw new Error(`配置验证失败: ${validation.errors.join(', ')}`)
    }

    this.configs.set(name, updatedConfig)

    if (this.storage) {
      await this.storage.saveConfig(updatedConfig)
    }
  }

  /**
   * 验证配置
   */
  validateConfig(config: AssemblyConfig): AssemblyValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const dependencies: any[] = []

    // 验证名称
    if (!config.name || !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(config.name)) {
      errors.push('名称只能包含字母、数字、下划线和连字符，且必须以字母开头')
    }

    // 验证显示名称
    if (!config.displayName || config.displayName.trim().length === 0) {
      errors.push('显示名称不能为空')
    }

    // 验证版本号
    if (!config.version || !/^\d+\.\d+\.\d+$/.test(config.version)) {
      errors.push('版本号格式必须为 x.y.z')
    }

    // 验证入口文件
    if (!config.entry || config.entry.trim().length === 0) {
      errors.push('入口文件不能为空')
    } else if (!config.entry.endsWith('.js') && !config.entry.endsWith('.ts')) {
      warnings.push('入口文件通常应该是 .js 或 .ts 文件')
    }

    // 验证加载顺序
    if (config.loadOrder !== undefined && (config.loadOrder < 0 || config.loadOrder > 100)) {
      errors.push('加载顺序必须在 0-100 之间')
    }

    // 验证超时时间
    if (config.timeout !== undefined && (config.timeout < 1 || config.timeout > 300)) {
      errors.push('超时时间必须在 1-300 秒之间')
    }

    // 验证依赖项
    if (config.dependencies && Array.isArray(config.dependencies)) {
      for (const dep of config.dependencies) {
        if (typeof dep !== 'string' || dep.trim().length === 0) {
          errors.push(`依赖项名称无效: ${dep}`)
        } else if (dep === config.name) {
          errors.push('装配件不能依赖自身')
        }
      }
    }

    // 验证自定义配置
    if (config.config && typeof config.config !== 'object') {
      errors.push('自定义配置必须是对象类型')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      dependencies,
      timestamp: new Date()
    }
  }

  /**
   * 检查依赖关系
   */
  validateDependencies(config: AssemblyConfig, allConfigs: AssemblyConfig[]): AssemblyValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const dependencies: any[] = []

    if (!config.dependencies || config.dependencies.length === 0) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        dependencies: [],
        timestamp: new Date()
      }
    }

    const availableConfigs = new Map(allConfigs.map(c => [c.name, c]))

    for (const depName of config.dependencies) {
      const depConfig = availableConfigs.get(depName)

      if (!depConfig) {
        errors.push(`依赖的装配件 ${depName} 不存在`)
        dependencies.push({
          name: depName,
          satisfied: false,
          error: '装配件不存在'
        })
        continue
      }

      if (!depConfig.enabled) {
        warnings.push(`依赖的装配件 ${depName} 已被禁用`)
      }

      dependencies.push({
        name: depName,
        satisfied: true,
        requiredVersion: '*', // 可以扩展版本约束
        actualVersion: depConfig.version
      })
    }

    // 检查循环依赖
    const cycle = this.checkCircularDependencies(config.name, allConfigs)
    if (cycle) {
      errors.push(`检测到循环依赖: ${cycle.join(' -> ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      dependencies,
      timestamp: new Date()
    }
  }

  /**
   * 检查循环依赖
   */
  private checkCircularDependencies(
    assemblyName: string,
    allConfigs: AssemblyConfig[],
    visited: Set<string> = new Set(),
    path: string[] = []
  ): string[] | null {
    if (visited.has(assemblyName)) {
      return [...path, assemblyName]
    }

    const config = allConfigs.find(c => c.name === assemblyName)
    if (!config || !config.dependencies || config.dependencies.length === 0) {
      return null
    }

    visited.add(assemblyName)
    path.push(assemblyName)

    for (const depName of config.dependencies) {
      const cycle = this.checkCircularDependencies(depName, allConfigs, visited, [...path])
      if (cycle) {
        return cycle
      }
    }

    visited.delete(assemblyName)
    path.pop()

    return null
  }

  /**
   * 获取拓扑排序的配置列表
   */
  getTopologicalOrder(): AssemblyConfig[] {
    const configs = this.getAllConfigs()
    const graph = this.buildDependencyGraph(configs)

    if (graph.hasCycles) {
      throw new Error('存在循环依赖，无法进行拓扑排序')
    }

    return graph.topologicalOrder
      .map((name: string) => this.configs.get(name))
      .filter((config: AssemblyConfig | undefined): config is AssemblyConfig => config !== undefined)
  }

  /**
   * 构建依赖图
   */
  private buildDependencyGraph(configs: AssemblyConfig[]): any {
    const nodes = new Map()
    const indegree = new Map()

    // 初始化节点
    for (const config of configs) {
      nodes.set(config.name, {
        name: config.name,
        dependencies: config.dependencies || [],
        dependents: [],
        loaded: false,
        enabled: config.enabled
      })
      indegree.set(config.name, 0)
    }

    // 构建依赖关系
    for (const config of configs) {
      for (const depName of config.dependencies || []) {
        if (nodes.has(depName)) {
          const depNode = nodes.get(depName)
          depNode.dependents.push(config.name)
          indegree.set(config.name, (indegree.get(config.name) || 0) + 1)
        }
      }
    }

    // 拓扑排序
    const queue: string[] = []
    const topologicalOrder: string[] = []
    let hasCycles = false

    // 入度为0的节点入队
    for (const [name, degree] of indegree) {
      if (degree === 0) {
        queue.push(name)
      }
    }

    while (queue.length > 0) {
      const name = queue.shift()!
      topologicalOrder.push(name)

      const node = nodes.get(name)
      for (const dependent of node.dependents) {
        indegree.set(dependent, indegree.get(dependent) - 1)
        if (indegree.get(dependent) === 0) {
          queue.push(dependent)
        }
      }
    }

    // 检查是否有环
    if (topologicalOrder.length !== configs.length) {
      hasCycles = true
    }

    return {
      nodes,
      roots: Array.from(indegree.entries())
        .filter(([_, degree]) => degree === 0)
        .map(([name]) => name),
      hasCycles,
      topologicalOrder: hasCycles ? [] : topologicalOrder
    }
  }

  /**
   * 从存储加载配置
   */
  async loadFromStorage(): Promise<void> {
    if (!this.storage) {
      return
    }

    const configs = await this.storage.loadAllConfigs()
    this.configs.clear()

    for (const config of configs) {
      const validation = this.validateConfig(config)
      if (validation.isValid) {
        this.configs.set(config.name, config)
      } else {
        console.warn(`跳过无效配置 ${config.name}:`, validation.errors)
      }
    }
  }

  /**
   * 导出配置为JSON
   */
  exportToJson(): string {
    const configs = this.getAllConfigs()
    return JSON.stringify(configs, null, 2)
  }

  /**
   * 从JSON导入配置
   */
  async importFromJson(json: string): Promise<void> {
    try {
      const configs = JSON.parse(json) as AssemblyConfig[]

      if (!Array.isArray(configs)) {
        throw new Error('配置数据必须是数组格式')
      }

      for (const config of configs) {
        await this.addConfig(config)
      }
    } catch (error) {
      throw new Error(`导入配置失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
}

/**
 * 创建配置管理器实例
 */
export function createAssemblyConfigManager(storage?: AssemblyStorage): AssemblyConfigManager {
  return new AssemblyConfigManager(storage)
}
