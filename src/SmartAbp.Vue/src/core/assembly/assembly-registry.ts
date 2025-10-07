import { computed, ref } from 'vue'
import { AssemblyConfigManager } from './assembly-config'
import { AssemblyLoader } from './assembly-loader'
import type { AssemblyConfig, AssemblyInstance } from './assembly-types'

/**
 * 装配件注册项接口
 */
export interface AssemblyRegistryItem {
  /** 装配件配置 */
  config: AssemblyConfig
  /** 装配件实例 */
  instance?: AssemblyInstance
  /** 注册时间 */
  registeredAt: Date
  /** 最后加载时间 */
  lastLoadedAt?: Date
  /** 加载次数 */
  loadCount: number
  /** 错误次数 */
  errorCount: number
  /** 最后错误信息 */
  lastError?: string
}

/**
 * 装配件注册表类
 */
export class AssemblyRegistry {
  private registry: Map<string, AssemblyRegistryItem> = new Map()
  private loader: AssemblyLoader
  // private configManager: AssemblyConfigManager

  constructor(loader: AssemblyLoader, _configManager?: AssemblyConfigManager) {
    this.loader = loader
    // this.configManager = configManager

    // 监听装配件事件
    // 注意：AssemblyLoader没有'on'方法，这部分功能待实现
    this.setupEventListeners()
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners() {
    // TODO: 实现事件监听
    // AssemblyLoader类当前不支持事件系统
    // 需要使用AssemblyManager来监听事件

    // // 监听装配件加载事件
    // this.loader.on('loaded', (args: any) => {
    //   const item = this.registry.get(args.assemblyName)
    //   if (item) {
    //     item.lastLoadedAt = new Date()
    //     item.loadCount++
    //     item.instance = this.loader.getAssembly(args.assemblyName)
    //   }
    // })

    // // 监听装配件错误事件
    // this.loader.on('error', (args: any) => {
    //   const item = this.registry.get(args.assemblyName)
    //   if (item) {
    //     item.errorCount++
    //     item.lastError = args.data?.message || '未知错误'
    //   }
    // })

    // // 监听装配件卸载事件
    // this.loader.on('unloaded', (args: any) => {
    //   const item = this.registry.get(args.assemblyName)
    //   if (item) {
    //     item.instance = undefined
    //   }
    // })
  }

  /**
   * 注册装配件
   */
  async register(config: AssemblyConfig): Promise<void> {
    if (this.registry.has(config.name)) {
      throw new Error(`装配件已注册: ${config.name}`)
    }

    const registryItem: AssemblyRegistryItem = {
      config,
      registeredAt: new Date(),
      loadCount: 0,
      errorCount: 0
    }

    this.registry.set(config.name, registryItem)

    // 如果装配件启用，则自动加载
    if (config.enabled) {
      await this.loadAssembly(config.name)
    }
  }

  /**
   * 注销装配件
   */
  async unregister(assemblyName: string): Promise<void> {
    const item = this.registry.get(assemblyName)
    if (!item) {
      throw new Error(`装配件未注册: ${assemblyName}`)
    }

    // 如果装配件已加载，先卸载
    if (item.instance) {
      await this.unloadAssembly(assemblyName)
    }

    this.registry.delete(assemblyName)
  }

  /**
   * 加载装配件
   */
  async loadAssembly(assemblyName: string): Promise<AssemblyInstance> {
    const item = this.registry.get(assemblyName)
    if (!item) {
      throw new Error(`装配件未注册: ${assemblyName}`)
    }

    if (!item.config.enabled) {
      throw new Error(`装配件未启用: ${assemblyName}`)
    }

    try {
      const instance = await this.loader.loadAssembly(item.config)
      item.instance = instance
      item.lastLoadedAt = new Date()
      item.loadCount++
      return instance
    } catch (error) {
      item.errorCount++
      item.lastError = error instanceof Error ? error.message : String(error)
      throw error
    }
  }

  /**
   * 卸载装配件
   */
  async unloadAssembly(assemblyName: string): Promise<void> {
    const item = this.registry.get(assemblyName)
    if (!item) {
      throw new Error(`装配件未注册: ${assemblyName}`)
    }

    await this.loader.unloadAssembly(assemblyName)
    item.instance = undefined
  }

  /**
   * 重新加载装配件
   */
  async reloadAssembly(assemblyName: string): Promise<AssemblyInstance> {
    await this.unloadAssembly(assemblyName)
    return await this.loadAssembly(assemblyName)
  }

  /**
   * 获取注册项
   */
  getRegistryItem(assemblyName: string): AssemblyRegistryItem | undefined {
    return this.registry.get(assemblyName)
  }

  /**
   * 获取所有注册项
   */
  getAllRegistryItems(): AssemblyRegistryItem[] {
    return Array.from(this.registry.values())
  }

  /**
   * 获取已加载的装配件
   */
  getLoadedAssemblies(): AssemblyRegistryItem[] {
    return this.getAllRegistryItems().filter(item => item.instance !== undefined)
  }

  /**
   * 获取启用的装配件
   */
  getEnabledAssemblies(): AssemblyRegistryItem[] {
    return this.getAllRegistryItems().filter(item => item.config.enabled)
  }

  /**
   * 检查装配件是否已注册
   */
  isRegistered(assemblyName: string): boolean {
    return this.registry.has(assemblyName)
  }

  /**
   * 检查装配件是否已加载
   */
  isLoaded(assemblyName: string): boolean {
    const item = this.registry.get(assemblyName)
    return item?.instance !== undefined
  }

  /**
   * 获取装配件统计信息
   */
  getStatistics() {
    const items = this.getAllRegistryItems()
    return {
      total: items.length,
      loaded: items.filter(item => item.instance !== undefined).length,
      enabled: items.filter(item => item.config.enabled).length,
      errors: items.reduce((sum, item) => sum + item.errorCount, 0),
      totalLoads: items.reduce((sum, item) => sum + item.loadCount, 0)
    }
  }

  /**
   * 根据依赖关系排序注册项
   */
  getRegistryItemsByDependencyOrder(): AssemblyRegistryItem[] {
    const items = this.getAllRegistryItems()
    const visited = new Set<string>()
    const result: AssemblyRegistryItem[] = []

    const visit = (assemblyName: string) => {
      if (visited.has(assemblyName)) return
      visited.add(assemblyName)

      const item = this.registry.get(assemblyName)
      if (!item) return

      // 先访问依赖项
      item.config.dependencies.forEach(dep => visit(dep))

      // 然后添加当前项
      result.push(item)
    }

    items.forEach(item => visit(item.config.name))
    return result
  }

  /**
   * 批量注册装配件
   */
  async registerMultiple(configs: AssemblyConfig[]): Promise<void> {
    for (const config of configs) {
      await this.register(config)
    }
  }

  /**
   * 批量加载装配件
   */
  async loadMultiple(assemblyNames: string[]): Promise<void> {
    for (const name of assemblyNames) {
      await this.loadAssembly(name)
    }
  }

  /**
   * 批量卸载装配件
   */
  async unloadMultiple(assemblyNames: string[]): Promise<void> {
    for (const name of assemblyNames) {
      await this.unloadAssembly(name)
    }
  }

  /**
   * 清理注册表
   */
  async clear(): Promise<void> {
    const assemblyNames = Array.from(this.registry.keys())
    await this.unloadMultiple(assemblyNames)
    this.registry.clear()
  }

  /**
   * 导出注册表数据
   */
  exportRegistry(): string {
    const data = this.getAllRegistryItems().map(item => ({
      config: item.config,
      registeredAt: item.registeredAt.toISOString(),
      lastLoadedAt: item.lastLoadedAt?.toISOString(),
      loadCount: item.loadCount,
      errorCount: item.errorCount,
      lastError: item.lastError
    }))

    return JSON.stringify(data, null, 2)
  }

  /**
   * 导入注册表数据
   */
  async importRegistry(json: string): Promise<void> {
    const data = JSON.parse(json)

    for (const itemData of data) {
      const config: AssemblyConfig = itemData.config
      const registryItem: AssemblyRegistryItem = {
        config,
        registeredAt: new Date(itemData.registeredAt),
        lastLoadedAt: itemData.lastLoadedAt ? new Date(itemData.lastLoadedAt) : undefined,
        loadCount: itemData.loadCount,
        errorCount: itemData.errorCount,
        lastError: itemData.lastError
      }

      this.registry.set(config.name, registryItem)

      // 如果装配件之前是加载状态，尝试重新加载
      if (itemData.lastLoadedAt && config.enabled) {
        try {
          await this.loadAssembly(config.name)
        } catch (error) {
          console.warn(`重新加载装配件失败: ${config.name}`, error)
        }
      }
    }
  }
}

/**
 * Vue组合式函数：使用装配件注册表
 * TODO: 实现这个组合式函数
 * 依赖的useAssemblyLoader和useAssemblyConfig函数尚未实现
 */
export function useAssemblyRegistry() {
  // const { loader } = useAssemblyLoader()
  // const { manager, configs, initialize: initializeConfig } = useAssemblyConfig()

  const loader = new AssemblyLoader()
  const manager = new AssemblyConfigManager()
  const registry = new AssemblyRegistry(loader, manager)
  const registryItems = ref<AssemblyRegistryItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 初始化注册表
   */
  const initialize = async () => {
    isLoading.value = true
    error.value = null
    try {
      // await initializeConfig()

      // 注册所有配置
      const configsToRegister = manager.getAllConfigs()
      await registry.registerMultiple(configsToRegister)

      registryItems.value = registry.getAllRegistryItems()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '初始化注册表失败'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 注册装配件
   */
  const register = async (config: AssemblyConfig) => {
    isLoading.value = true
    error.value = null
    try {
      await registry.register(config)
      registryItems.value = registry.getAllRegistryItems()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '注册装配件失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载装配件
   */
  const loadAssembly = async (assemblyName: string) => {
    isLoading.value = true
    error.value = null
    try {
      const instance = await registry.loadAssembly(assemblyName)
      registryItems.value = registry.getAllRegistryItems()
      return instance
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载装配件失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取统计信息
   */
  const statistics = computed(() => registry.getStatistics())

  /**
   * 获取已加载的装配件
   */
  const loadedAssemblies = computed(() =>
    registryItems.value.filter(item => item.instance !== undefined)
  )

  /**
   * 获取启用的装配件
   */
  const enabledAssemblies = computed(() =>
    registryItems.value.filter(item => item.config.enabled)
  )

  return {
    registry,
    registryItems,
    statistics,
    loadedAssemblies,
    enabledAssemblies,
    isLoading,
    error,
    initialize,
    register,
    loadAssembly,
    unloadAssembly: (assemblyName: string) => registry.unloadAssembly(assemblyName),
    reloadAssembly: (assemblyName: string) => registry.reloadAssembly(assemblyName),
    isRegistered: (assemblyName: string) => registry.isRegistered(assemblyName),
    isLoaded: (assemblyName: string) => registry.isLoaded(assemblyName),
    exportRegistry: () => registry.exportRegistry(),
    importRegistry: (json: string) => registry.importRegistry(json)
  }
}

export default AssemblyRegistry
