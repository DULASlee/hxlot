import type { AssemblyConfig, AssemblyStorage } from './assembly-types'

/**
 * 本地存储适配器 - 使用 localStorage
 */
export class LocalStorageAdapter implements AssemblyStorage {
  private readonly storageKey = 'smartabp-assemblies'

  async saveConfig(config: AssemblyConfig): Promise<void> {
    const configs = await this.loadAllConfigs()
    const existingIndex = configs.findIndex(c => c.name === config.name)
    
    if (existingIndex >= 0) {
      configs[existingIndex] = config
    } else {
      configs.push(config)
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(configs))
  }

  async loadConfig(name: string): Promise<AssemblyConfig | null> {
    const configs = await this.loadAllConfigs()
    return configs.find(c => c.name === name) || null
  }

  async loadAllConfigs(): Promise<AssemblyConfig[]> {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return []
      
      const configs = JSON.parse(stored) as AssemblyConfig[]
      
      // 转换日期字符串为Date对象
      return configs.map(config => ({
        ...config,
        createdAt: config.createdAt ? new Date(config.createdAt) : new Date(),
        updatedAt: config.updatedAt ? new Date(config.updatedAt) : new Date()
      }))
    } catch (error) {
      console.error('加载配置失败:', error)
      return []
    }
  }

  async deleteConfig(name: string): Promise<void> {
    const configs = await this.loadAllConfigs()
    const filtered = configs.filter(c => c.name !== name)
    localStorage.setItem(this.storageKey, JSON.stringify(filtered))
  }

  async configExists(name: string): Promise<boolean> {
    const config = await this.loadConfig(name)
    return config !== null
  }
}

/**
 * 内存存储适配器 - 用于测试和开发
 */
export class MemoryStorageAdapter implements AssemblyStorage {
  private configs: Map<string, AssemblyConfig> = new Map()

  async saveConfig(config: AssemblyConfig): Promise<void> {
    this.configs.set(config.name, config)
  }

  async loadConfig(name: string): Promise<AssemblyConfig | null> {
    return this.configs.get(name) || null
  }

  async loadAllConfigs(): Promise<AssemblyConfig[]> {
    return Array.from(this.configs.values())
  }

  async deleteConfig(name: string): Promise<void> {
    this.configs.delete(name)
  }

  async configExists(name: string): Promise<boolean> {
    return this.configs.has(name)
  }

  // 清空存储
  clear(): void {
    this.configs.clear()
  }
}

/**
 * 索引数据库存储适配器 - 用于大量数据存储
 */
export class IndexedDBStorageAdapter implements AssemblyStorage {
  private dbName = 'SmartAbpAssemblies'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains('assemblies')) {
          const store = db.createObjectStore('assemblies', { keyPath: 'name' })
          store.createIndex('updatedAt', 'updatedAt', { unique: false })
        }
      }
    })
  }

  async saveConfig(config: AssemblyConfig): Promise<void> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['assemblies'], 'readwrite')
      const store = transaction.objectStore('assemblies')
      const request = store.put(config)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async loadConfig(name: string): Promise<AssemblyConfig | null> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['assemblies'], 'readonly')
      const store = transaction.objectStore('assemblies')
      const request = store.get(name)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async loadAllConfigs(): Promise<AssemblyConfig[]> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['assemblies'], 'readonly')
      const store = transaction.objectStore('assemblies')
      const request = store.getAll()
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  async deleteConfig(name: string): Promise<void> {
    const db = await this.getDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['assemblies'], 'readwrite')
      const store = transaction.objectStore('assemblies')
      const request = store.delete(name)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async configExists(name: string): Promise<boolean> {
    const config = await this.loadConfig(name)
    return config !== null
  }
}

/**
 * 远程API存储适配器 - 用于与后端同步
 */
export class ApiStorageAdapter implements AssemblyStorage {
  private baseUrl: string
  private token?: string

  constructor(baseUrl: string, token?: string) {
    this.baseUrl = baseUrl
    this.token = token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async saveConfig(config: AssemblyConfig): Promise<void> {
    await this.request('/api/assemblies/config', {
      method: 'POST',
      body: JSON.stringify(config)
    })
  }

  async loadConfig(name: string): Promise<AssemblyConfig | null> {
    try {
      return await this.request<AssemblyConfig>(`/api/assemblies/config/${name}`)
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null
      }
      throw error
    }
  }

  async loadAllConfigs(): Promise<AssemblyConfig[]> {
    return await this.request<AssemblyConfig[]>('/api/assemblies/configs')
  }

  async deleteConfig(name: string): Promise<void> {
    await this.request(`/api/assemblies/config/${name}`, {
      method: 'DELETE'
    })
  }

  async configExists(name: string): Promise<boolean> {
    const config = await this.loadConfig(name)
    return config !== null
  }
}

/**
 * 混合存储适配器 - 结合本地和远程存储
 */
export class HybridStorageAdapter implements AssemblyStorage {
  private local: LocalStorageAdapter
  private remote: ApiStorageAdapter
  private syncEnabled: boolean

  constructor(remoteBaseUrl: string, token?: string, syncEnabled: boolean = true) {
    this.local = new LocalStorageAdapter()
    this.remote = new ApiStorageAdapter(remoteBaseUrl, token)
    this.syncEnabled = syncEnabled
  }

  async saveConfig(config: AssemblyConfig): Promise<void> {
    // 先保存到本地
    await this.local.saveConfig(config)
    
    // 如果启用同步，再保存到远程
    if (this.syncEnabled) {
      try {
        await this.remote.saveConfig(config)
      } catch (error) {
        console.warn('远程保存失败，配置已保存到本地:', error)
      }
    }
  }

  async loadConfig(name: string): Promise<AssemblyConfig | null> {
    // 先尝试从本地加载
    let config = await this.local.loadConfig(name)
    
    // 如果本地没有且启用同步，尝试从远程加载
    if (!config && this.syncEnabled) {
      try {
        config = await this.remote.loadConfig(name)
        if (config) {
          // 保存到本地缓存
          await this.local.saveConfig(config)
        }
      } catch (error) {
        console.warn('远程加载失败:', error)
      }
    }
    
    return config
  }

  async loadAllConfigs(): Promise<AssemblyConfig[]> {
    // 优先使用本地配置
    let configs = await this.local.loadAllConfigs()
    
    // 如果本地为空且启用同步，尝试从远程加载
    if (configs.length === 0 && this.syncEnabled) {
      try {
        configs = await this.remote.loadAllConfigs()
        // 保存到本地缓存
        for (const config of configs) {
          await this.local.saveConfig(config)
        }
      } catch (error) {
        console.warn('远程加载全部配置失败:', error)
      }
    }
    
    return configs
  }

  async deleteConfig(name: string): Promise<void> {
    // 先删除本地
    await this.local.deleteConfig(name)
    
    // 如果启用同步，再删除远程
    if (this.syncEnabled) {
      try {
        await this.remote.deleteConfig(name)
      } catch (error) {
        console.warn('远程删除失败:', error)
      }
    }
  }

  async configExists(name: string): Promise<boolean> {
    return await this.local.configExists(name)
  }

  // 同步方法
  async sync(): Promise<void> {
    if (!this.syncEnabled) return

    try {
      const remoteConfigs = await this.remote.loadAllConfigs()
      const localConfigs = await this.local.loadAllConfigs()
      
      const localMap = new Map(localConfigs.map(c => [c.name, c]))
      
      for (const remoteConfig of remoteConfigs) {
        const localConfig = localMap.get(remoteConfig.name)
        
        if (!localConfig || new Date(remoteConfig.updatedAt!) > new Date(localConfig.updatedAt!)) {
          // 远程配置更新，更新本地
          await this.local.saveConfig(remoteConfig)
        }
      }
      
      console.log('配置同步完成')
    } catch (error) {
      console.error('配置同步失败:', error)
    }
  }
}

/**
 * 存储适配器工厂
 */
export class StorageAdapterFactory {
  static createLocalStorage(): LocalStorageAdapter {
    return new LocalStorageAdapter()
  }

  static createMemoryStorage(): MemoryStorageAdapter {
    return new MemoryStorageAdapter()
  }

  static createIndexedDBStorage(): IndexedDBStorageAdapter {
    return new IndexedDBStorageAdapter()
  }

  static createApiStorage(baseUrl: string, token?: string): ApiStorageAdapter {
    return new ApiStorageAdapter(baseUrl, token)
  }

  static createHybridStorage(remoteBaseUrl: string, token?: string, syncEnabled: boolean = true): HybridStorageAdapter {
    return new HybridStorageAdapter(remoteBaseUrl, token, syncEnabled)
  }

  static createDefaultStorage(): AssemblyStorage {
    // 根据环境选择默认存储适配器
    if (typeof window !== 'undefined' && window.indexedDB) {
      return new IndexedDBStorageAdapter()
    } else if (typeof localStorage !== 'undefined') {
      return new LocalStorageAdapter()
    } else {
      return new MemoryStorageAdapter()
    }
  }
}

export default StorageAdapterFactory