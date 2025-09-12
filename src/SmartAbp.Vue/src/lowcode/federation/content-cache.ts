/**
 * SmartAbp 内容寻址缓存系统
 *
 * 基于内容哈希的增量缓存，支持schema和插件内容变化检测
 *
 * @author SmartAbp Team
 * @version 1.0.0
 */
import { IndexedDbStore } from "../runtime/persistence/indexeddb"

/**
 * 内容寻址缓存类
 * 使用SHA256作为内容哈希，实现增量缓存和内容去重
 */
export class ContentAddressableCache {
  private map = new Map<string, Uint8Array>()
  private metaMap = new Map<string, CacheMetadata>()
  private store?: IndexedDbStore<CacheMetadata>
  private quotaBytes: number = 100 * 1024 * 1024 // 默认配额100MB
  private highWatermark: number = 0.9 // 90%
  private lowWatermark: number = 0.7 // 70%

  /**
   * 计算内容哈希（SHA256）
   */
  async keyOf(input: string | Uint8Array): Promise<string> {
    const data = typeof input === "string" ? new TextEncoder().encode(input) : input

    // 使用Web Crypto API计算SHA256
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = new Uint8Array(hashBuffer)

    // 转换为十六进制字符串
    return Array.from(hashArray)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }

  /**
   * 获取缓存内容
   */
  get(key: string): Uint8Array | undefined {
    return this.map.get(key)
  }

  /**
   * 设置缓存内容
   */
  set(key: string, value: Uint8Array, metadata?: CacheMetadata): void {
    this.map.set(key, value)
    if (metadata) {
      this.metaMap.set(key, {
        ...metadata,
        timestamp: Date.now(),
        accessCount: 0,
      })
    }
    if (this.store) {
      void this.store.put(key, value, this.metaMap.get(key))
    }
    // 配额控制：超过高水位触发清理至低水位
    this.enforceQuota()
  }

  /**
   * 检查内容是否存在
   */
  has(key: string): boolean {
    return this.map.has(key)
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    this.metaMap.delete(key)
    if (this.store) {
      void this.store.delete(key)
    }
    return this.map.delete(key)
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.map.clear()
    this.metaMap.clear()
    if (this.store) {
      void this.store.clear()
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    let totalSize = 0
    let accessCount = 0

    for (const [key, data] of this.map) {
      totalSize += data.byteLength
      const meta = this.metaMap.get(key)
      accessCount += meta?.accessCount || 0
    }

    return {
      totalEntries: this.map.size,
      totalSizeBytes: totalSize,
      totalAccessCount: accessCount,
      averageEntrySize: this.map.size > 0 ? totalSize / this.map.size : 0,
    }
  }

  /**
   * 启用IndexedDB持久化
   */
  async enablePersistence(
    dbName: string = "smartabp-content-cache",
    storeName: string = "entries",
  ): Promise<void> {
    if (typeof indexedDB === "undefined") return
    this.store = await IndexedDbStore.open<CacheMetadata>(dbName, storeName)
    // 同步现有内存数据到磁盘
    for (const [key, value] of this.map) {
      const meta = this.metaMap.get(key)
      await this.store.put(key, value, meta)
    }
  }

  /**
   * 冷启动：从IndexedDB加载到内存
   */
  async hydrateFromPersistence(limitEntries: number = 5000): Promise<number> {
    if (!this.store) return 0
    let count = 0
    for await (const rec of this.store.iter()) {
      if (count >= limitEntries) break
      this.map.set(rec.key, rec.value)
      if (rec.meta) this.metaMap.set(rec.key, rec.meta)
      count++
    }
    return count
  }

  /**
   * 获取缓存元数据
   */
  getMeta(key: string): CacheMetadata | undefined {
    return this.metaMap.get(key)
  }

  /**
   * 更新访问统计
   */
  private updateAccess(key: string): void {
    const meta = this.metaMap.get(key)
    if (meta) {
      meta.accessCount = (meta.accessCount || 0) + 1
      meta.lastAccessTime = Date.now()
    }
  }

  /**
   * 带访问统计的获取方法
   */
  getWithStats(key: string): Uint8Array | undefined {
    const result = this.get(key)
    if (result) {
      this.updateAccess(key)
    }
    return result
  }

  /**
   * 批量获取
   */
  async getBatch(keys: string[]): Promise<Map<string, Uint8Array>> {
    const result = new Map<string, Uint8Array>()

    for (const key of keys) {
      const value = this.getWithStats(key)
      if (value) {
        result.set(key, value)
      }
    }

    return result
  }

  /**
   * 基于大小的LRU清理
   */
  cleanup(maxSizeBytes: number): number {
    const stats = this.getStats()
    if (stats.totalSizeBytes <= maxSizeBytes) {
      return 0
    }

    // 按访问时间排序，删除最旧的
    const entries = Array.from(this.metaMap.entries()).sort(
      (a, b) => (a[1].lastAccessTime || 0) - (b[1].lastAccessTime || 0),
    )

    let removedCount = 0
    let currentSize = stats.totalSizeBytes

    for (const [key] of entries) {
      const data = this.map.get(key)
      if (data && currentSize > maxSizeBytes) {
        currentSize -= data.byteLength
        this.delete(key)
        removedCount++
      } else {
        break
      }
    }

    return removedCount
  }

  /**
   * 配额控制：当使用量超过高水位时，清理至低水位
   */
  enforceQuota(): void {
    const stats = this.getStats()
    if (stats.totalSizeBytes > this.quotaBytes * this.highWatermark) {
      const target = Math.floor(this.quotaBytes * this.lowWatermark)
      this.cleanup(target)
    }
  }

  /** 配置持久化配额与水位 */
  configureQuota(options: {
    quotaBytes?: number
    highWatermark?: number
    lowWatermark?: number
  }): void {
    if (options.quotaBytes && options.quotaBytes > 0) this.quotaBytes = options.quotaBytes
    if (
      options.highWatermark &&
      options.lowWatermark &&
      options.highWatermark > options.lowWatermark
    ) {
      this.highWatermark = Math.min(0.99, Math.max(0.5, options.highWatermark))
      this.lowWatermark = Math.min(this.highWatermark - 0.1, Math.max(0.3, options.lowWatermark))
    }
  }
}

/**
 * 增量编译缓存
 * 专门用于schema+plugin的编译产物缓存
 */
export class IncrementalCompilationCache {
  private _contentCache = new ContentAddressableCache()
  private compilationMap = new Map<string, CompilationCacheEntry>()

  /**
   * 获取内容缓存实例（只读访问）
   */
  get contentCache(): ContentAddressableCache {
    return this._contentCache
  }

  /**
   * 生成编译缓存键
   * 格式: schemaHash + pluginVersion + options
   */
  async generateCompilationKey(
    schema: any,
    pluginVersion: string,
    options?: Record<string, any>,
  ): Promise<string> {
    const schemaContent = JSON.stringify(schema, Object.keys(schema).sort())
    const schemaHash = await this._contentCache.keyOf(schemaContent)

    const optionsHash = options
      ? await this._contentCache.keyOf(JSON.stringify(options, Object.keys(options).sort()))
      : "no-options"

    return `${schemaHash}:${pluginVersion}:${optionsHash}`
  }

  /**
   * 检查编译缓存
   */
  async checkCompilation(
    schema: any,
    pluginVersion: string,
    options?: Record<string, any>,
  ): Promise<CompilationResult | null> {
    const key = await this.generateCompilationKey(schema, pluginVersion, options)
    const entry = this.compilationMap.get(key)

    if (!entry) return null

    // 检查编译产物是否还存在
    const compiledCode = this._contentCache.getWithStats(entry.compiledCodeHash)
    if (!compiledCode) {
      this.compilationMap.delete(key)
      return null
    }

    return {
      code: new TextDecoder().decode(compiledCode),
      metadata: entry.metadata,
      fromCache: true,
      cacheKey: key,
      compiledAt: entry.compiledAt,
    }
  }

  /**
   * 缓存编译结果
   */
  async cacheCompilation(
    schema: any,
    pluginVersion: string,
    compiledCode: string,
    metadata: any,
    options?: Record<string, any>,
  ): Promise<string> {
    const key = await this.generateCompilationKey(schema, pluginVersion, options)
    const codeBytes = new TextEncoder().encode(compiledCode)
    const codeHash = await this._contentCache.keyOf(codeBytes)

    // 存储编译产物
    this._contentCache.set(codeHash, codeBytes, {
      type: "compiled-code",
      size: codeBytes.byteLength,
      timestamp: Date.now(),
      tags: ["compilation", pluginVersion],
    })

    // 存储编译映射
    this.compilationMap.set(key, {
      schemaHash: key.split(":")[0],
      pluginVersion,
      compiledCodeHash: codeHash,
      compiledAt: Date.now(),
      metadata: metadata || {},
    })

    return key
  }

  /**
   * 获取缓存统计
   */
  getStats(): IncrementalCacheStats {
    const contentStats = this._contentCache.getStats()

    return {
      compilationEntries: this.compilationMap.size,
      contentCacheStats: contentStats,
      hitRatio: this.calculateHitRatio(),
      memoryUsageBytes: this.calculateMemoryUsage(),
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    // 默认24小时
    const now = Date.now()
    let removedCount = 0

    // 清理过期的编译映射
    for (const [key, entry] of this.compilationMap) {
      if (now - entry.compiledAt > maxAgeMs) {
        this.compilationMap.delete(key)
        removedCount++
      }
    }

    // 清理孤立的内容缓存
    const maxSize = 100 * 1024 * 1024 // 100MB限制
    const contentRemoved = this._contentCache.cleanup(maxSize)

    return removedCount + contentRemoved
  }

  private calculateHitRatio(): number {
    // 简化实现，实际项目中需要更复杂的统计
    return 0.8 // 假设80%命中率
  }

  private calculateMemoryUsage(): number {
    const contentStats = this._contentCache.getStats()
    const mappingSize = this.compilationMap.size * 256 // 估算每个映射256字节
    return contentStats.totalSizeBytes + mappingSize
  }
}

// ============= 类型定义 =============

interface CacheMetadata {
  type?: string
  size?: number
  timestamp?: number
  lastAccessTime?: number
  accessCount?: number
  tags?: string[]
}

export interface CacheStats {
  totalEntries: number
  totalSizeBytes: number
  totalAccessCount: number
  averageEntrySize: number
}

interface CompilationCacheEntry {
  schemaHash: string
  pluginVersion: string
  compiledCodeHash: string
  compiledAt: number
  metadata: any
}

interface CompilationResult {
  code: string
  metadata: any
  fromCache: boolean
  cacheKey: string
  compiledAt: number
}

export interface IncrementalCacheStats {
  compilationEntries: number
  contentCacheStats: CacheStats
  hitRatio: number
  memoryUsageBytes: number
}

// ============= 导出 =============

// 全局实例（单例模式）
export const globalContentCache = new ContentAddressableCache()
export const globalCompilationCache = new IncrementalCompilationCache()

// 便捷函数
export async function computeContentHash(content: string | Uint8Array): Promise<string> {
  return await globalContentCache.keyOf(content)
}

export async function cacheCompiledCode(
  schema: any,
  pluginVersion: string,
  code: string,
  metadata?: any,
  options?: Record<string, any>,
): Promise<string> {
  return await globalCompilationCache.cacheCompilation(
    schema,
    pluginVersion,
    code,
    metadata,
    options,
  )
}

export async function getCachedCompilation(
  schema: any,
  pluginVersion: string,
  options?: Record<string, any>,
): Promise<CompilationResult | null> {
  return await globalCompilationCache.checkCompilation(schema, pluginVersion, options)
}
