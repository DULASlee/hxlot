/**
 * 💾 Cache Management Module Entry
 * 
 * 统一缓存管理系统入口
 * 
 * @module @smartabp/lowcode-shared/cache
 */

export {
  UnifiedCacheManager as Cache, UnifiedCacheManager, // 别名，方便使用
  type CacheConfig, type CacheEvents, type CacheItem,
  type CacheStats,
  type CacheStrategy,
  type SerializationMethod
} from './UnifiedCacheManager';

