/**
 * 存储适配器管理器
 */

import type { AssemblyConfig, AssemblyStorage } from '../assembly-types'

/**
 * 本地存储适配器
 */
export class LocalStorageAdapter implements AssemblyStorage {
  private readonly storageKey = 'smartabp-assemblies'

  async saveConfig(config: AssemblyConfig): Promise<void> {
    try {
      const configs = await this.loadAllConfigs()
      const index = configs.findIndex(c => c.name === config.name)
      if (index >= 0) {
        configs[index] = config
      } else {
        configs.push(config)
      }
      localStorage.setItem(this.storageKey, JSON.stringify(configs))
    } catch (error) {
      throw new Error(`本地存储保存失败: ${error}`)
    }
  }

  async loadConfig(name: string): Promise<AssemblyConfig | null> {
    try {
      const configs = await this.loadAllConfigs()
      return configs.find(c => c.name === name) || null
    } catch (error) {
      throw new Error(`本地存储加载失败: ${error}`)
    }
  }

  async loadAllConfigs(): Promise<AssemblyConfig[]> {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (error) {
      throw new Error(`本地存储加载失败: ${error}`)
    }
  }

  async deleteConfig(name: string): Promise<void> {
    try {
      const configs = await this.loadAllConfigs()
      const filtered = configs.filter(c => c.name !== name)
      localStorage.setItem(this.storageKey, JSON.stringify(filtered))
    } catch (error) {
      throw new Error(`本地存储删除失败: ${error}`)
    }
  }

  async configExists(name: string): Promise<boolean> {
    try {
      const config = await this.loadConfig(name)
      return config !== null
    } catch (error) {
      return false
    }
  }
}

/**
 * 内存存储适配器（主要用于测试）
 */
export class MemoryStorageAdapter implements AssemblyStorage {
  private storage: Map<string, AssemblyConfig> = new Map()

  async saveConfig(config: AssemblyConfig): Promise<void> {
    this.storage.set(config.name, config)
  }

  async loadConfig(name: string): Promise<AssemblyConfig | null> {
    return this.storage.get(name) || null
  }

  async loadAllConfigs(): Promise<AssemblyConfig[]> {
    return Array.from(this.storage.values())
  }

  async deleteConfig(name: string): Promise<void> {
    this.storage.delete(name)
  }

  async configExists(name: string): Promise<boolean> {
    return this.storage.has(name)
  }
}

/**
 * 索引数据库存储适配器
 */
export class IndexedDBStorageAdapter implements AssemblyStorage {
  private dbName = 'SmartAbpAssemblies'
  private dbVersion = 1
  private storeName = 'assemblies'
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('浏览器不支持IndexedDB'))
        return
      }

      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(new Error('IndexedDB打开失败'))
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'name' })
        }
      }
    })
  }

  async saveConfig(config: AssemblyConfig): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(config)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('IndexedDB保存失败'))
    })
  }

  async loadConfig(name: string): Promise<AssemblyConfig | null> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(name)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(new Error('IndexedDB加载失败'))
    })
  }

  async loadAllConfigs(): Promise<AssemblyConfig[]> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(new Error('IndexedDB加载失败'))
    })
  }

  async deleteConfig(name: string): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(name)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('IndexedDB删除失败'))
    })
  }

  async configExists(name: string): Promise<boolean> {
    const config = await this.loadConfig(name)
    return config !== null
  }
}

/**
 * 远程API存储适配器
 */
export class ApiStorageAdapter implements AssemblyStorage {
  constructor(
    private baseUrl: string,
    private authToken?: string
  ) { }

  private async request<T>(endpoint: string, options: any = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
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
    await this.request(`/api/assemblies/${config.name}`, {
      method: 'PUT',
      body: JSON.stringify(config)
    })
  }

  async loadConfig(name: string): Promise<AssemblyConfig | null> {
    try {
      return await this.request<AssemblyConfig>(`/api/assemblies/${name}`)
    } catch (error) {
      // 404 means config not found
      return null
    }
  }

  async loadAllConfigs(): Promise<AssemblyConfig[]> {
    return this.request<AssemblyConfig[]>('/api/assemblies')
  }

  async deleteConfig(name: string): Promise<void> {
    await this.request(`/api/assemblies/${name}`, {
      method: 'DELETE'
    })
  }

  async configExists(name: string): Promise<boolean> {
    const config = await this.loadConfig(name)
    return config !== null
  }
}

/**
 * 混合存储适配器（本地缓存 + 远程同步）
 */
export class HybridStorageAdapter implements AssemblyStorage {
  private localAdapter: LocalStorageAdapter
  private remoteAdapter: ApiStorageAdapter
  private lastSyncTime: number = 0
  private syncInterval: number = 5 * 60 * 1000 // 5分钟

  constructor(
    baseUrl: string,
    authToken?: string
  ) {
    this.localAdapter = new LocalStorageAdapter()
    this.remoteAdapter = new ApiStorageAdapter(baseUrl, authToken)
  }

  async saveConfig(config: AssemblyConfig): Promise<void> {
    // 同时保存到本地和远程
    await Promise.all([
      this.localAdapter.saveConfig(config),
      this.remoteAdapter.saveConfig(config).catch(error => {
        console.warn('远程保存失败，使用本地存储:', error)
      })
    ])

    this.lastSyncTime = Date.now()
  }

  async loadConfig(name: string): Promise<AssemblyConfig | null> {
    const now = Date.now()

    // 如果最近同步过，优先使用本地数据
    if (now - this.lastSyncTime < this.syncInterval) {
      try {
        return await this.localAdapter.loadConfig(name)
      } catch (error) {
        console.warn('本地加载失败，尝试远程加载:', error)
      }
    }

    // 从远程加载并同步到本地
    try {
      const remoteConfig = await this.remoteAdapter.loadConfig(name)
      if (remoteConfig) {
        await this.localAdapter.saveConfig(remoteConfig)
        this.lastSyncTime = now
      }
      return remoteConfig
    } catch (error) {
      console.warn('远程加载失败，使用本地数据:', error)
      return this.localAdapter.loadConfig(name)
    }
  }

  async loadAllConfigs(): Promise<AssemblyConfig[]> {
    const now = Date.now()

    // 如果最近同步过，优先使用本地数据
    if (now - this.lastSyncTime < this.syncInterval) {
      try {
        return await this.localAdapter.loadAllConfigs()
      } catch (error) {
        console.warn('本地加载失败，尝试远程加载:', error)
      }
    }

    // 从远程加载并同步到本地
    try {
      const remoteConfigs = await this.remoteAdapter.loadAllConfigs()
      for (const config of remoteConfigs) {
        await this.localAdapter.saveConfig(config)
      }
      this.lastSyncTime = now
      return remoteConfigs
    } catch (error) {
      console.warn('远程加载失败，使用本地数据:', error)
      return this.localAdapter.loadAllConfigs()
    }
  }

  async deleteConfig(name: string): Promise<void> {
    await Promise.all([
      this.localAdapter.deleteConfig(name),
      this.remoteAdapter.deleteConfig(name).catch(error => {
        console.warn('远程删除失败:', error)
      })
    ])

    this.lastSyncTime = Date.now()
  }

  async configExists(name: string): Promise<boolean> {
    // 优先检查本地，然后检查远程
    const localExists = await this.localAdapter.configExists(name)
    if (localExists) {
      return true
    }

    try {
      return await this.remoteAdapter.configExists(name)
    } catch (error) {
      return false
    }
  }
}

/**
 * 存储适配器工厂
 */
export class StorageAdapterFactory {
  static createLocalStorage(): AssemblyStorage {
    return new LocalStorageAdapter()
  }

  static createMemoryStorage(): AssemblyStorage {
    return new MemoryStorageAdapter()
  }

  static createIndexedDBStorage(): AssemblyStorage {
    return new IndexedDBStorageAdapter()
  }

  static createApiStorage(baseUrl: string, authToken?: string): AssemblyStorage {
    return new ApiStorageAdapter(baseUrl, authToken)
  }

  static createHybridStorage(baseUrl: string, authToken?: string): AssemblyStorage {
    return new HybridStorageAdapter(baseUrl, authToken)
  }
}

export default {
  LocalStorageAdapter,
  MemoryStorageAdapter,
  IndexedDBStorageAdapter,
  ApiStorageAdapter,
  HybridStorageAdapter,
  StorageAdapterFactory
}