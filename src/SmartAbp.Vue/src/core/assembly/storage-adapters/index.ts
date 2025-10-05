/**
 * 存储适配器管理器
 */

import type { AssemblyConfig, AssemblyStorage } from '../assembly-types'

/**
 * 本地存储适配器
 */
export class LocalStorageAdapter implements AssemblyStorage {
  private readonly storageKey = 'smartabp-assemblies'

  async save(configs: AssemblyConfig[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(configs))
    } catch (error) {
      throw new Error(`本地存储保存失败: ${error}`)
    }
  }

  async load(): Promise<AssemblyConfig[]> {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (error) {
      throw new Error(`本地存储加载失败: ${error}`)
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      throw new Error(`本地存储清空失败: ${error}`)
    }
  }
}

/**
 * 内存存储适配器（主要用于测试）
 */
export class MemoryStorageAdapter implements AssemblyStorage {
  private storage: AssemblyConfig[] = []

  async save(configs: AssemblyConfig[]): Promise<void> {
    this.storage = [...configs]
  }

  async load(): Promise<AssemblyConfig[]> {
    return [...this.storage]
  }

  async clear(): Promise<void> {
    this.storage = []
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

  async save(configs: AssemblyConfig[]): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      // 清空现有数据
      store.clear()

      // 保存新数据
      for (const config of configs) {
        store.add(config)
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(new Error('IndexedDB保存失败'))
    })
  }

  async load(): Promise<AssemblyConfig[]> {
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

  async clear(): Promise<void> {
    if (!this.db) {
      await this.init()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('IndexedDB清空失败'))
    })
  }
}

/**
 * 远程API存储适配器
 */
export class ApiStorageAdapter implements AssemblyStorage {
  constructor(
    private baseUrl: string,
    private authToken?: string
  ) {}

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

  async save(configs: AssemblyConfig[]): Promise<void> {
    await this.request('/api/assemblies', {
      method: 'PUT',
      body: JSON.stringify(configs)
    })
  }

  async load(): Promise<AssemblyConfig[]> {
    return this.request<AssemblyConfig[]>('/api/assemblies')
  }

  async clear(): Promise<void> {
    await this.request('/api/assemblies', {
      method: 'DELETE'
    })
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

  async save(configs: AssemblyConfig[]): Promise<void> {
    // 同时保存到本地和远程
    await Promise.all([
      this.localAdapter.save(configs),
      this.remoteAdapter.save(configs).catch(error => {
        console.warn('远程保存失败，使用本地存储:', error)
      })
    ])

    this.lastSyncTime = Date.now()
  }

  async load(): Promise<AssemblyConfig[]> {
    const now = Date.now()

    // 如果最近同步过，优先使用本地数据
    if (now - this.lastSyncTime < this.syncInterval) {
      try {
        return await this.localAdapter.load()
      } catch (error) {
        console.warn('本地加载失败，尝试远程加载:', error)
      }
    }

    // 从远程加载并同步到本地
    try {
      const remoteConfigs = await this.remoteAdapter.load()
      await this.localAdapter.save(remoteConfigs)
      this.lastSyncTime = now
      return remoteConfigs
    } catch (error) {
      console.warn('远程加载失败，使用本地数据:', error)
      return this.localAdapter.load()
    }
  }

  async clear(): Promise<void> {
    await Promise.all([
      this.localAdapter.clear(),
      this.remoteAdapter.clear().catch(error => {
        console.warn('远程清空失败:', error)
      })
    ])

    this.lastSyncTime = Date.now()
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