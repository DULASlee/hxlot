import { ElMessage } from "element-plus";

/**
 * Enhanced Cache Manager with comprehensive error handling
 */

// Error types for different cache operations
class CacheError extends Error {
  constructor(
    message: string,
    public code: string,
    public operation: string,
    public retryable = false,
    public details?: any,
  ) {
    super(message);
    this.name = "CacheError";
  }
}

// Cache interfaces
interface CacheItem<T = any> {
  value: T;
  expiresAt: number;
  version: string;
}

interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number; // in milliseconds
  version?: string;
  storage?: Storage | Map<string, any>; // 支持Storage或Map作为存储
}

// Error handling utilities
const logCacheError = (operation: string, error: any, context?: any): void => {
  console.error(`[CacheManager] ${operation} failed:`, {
    error:
      error instanceof Error
        ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
        : error,
    context,
    timestamp: new Date().toISOString(),
  });
};

const showCacheErrorMessage = (message: string, details?: string): void => {
  ElMessage.error({
    message: `Cache Error: ${message}${details ? ` - ${details}` : ""}`,
    duration: 3000,
    showClose: true,
  });
};

const validateKey = (key: string): void => {
  if (!key || typeof key !== "string") {
    throw new CacheError(
      "Cache key must be a non-empty string",
      "VALIDATION_ERROR",
      "validateKey",
      false,
      { key, type: typeof key },
    );
  }

  if (key.length > 200) {
    throw new CacheError(
      "Cache key too long (max 200 characters)",
      "VALIDATION_ERROR",
      "validateKey",
      false,
      { keyLength: key.length },
    );
  }
};

const validateValue = (value: any): void => {
  if (value === undefined) {
    throw new CacheError(
      "Cache value cannot be undefined",
      "VALIDATION_ERROR",
      "validateValue",
      false,
    );
  }
};

const validateOptions = (options: CacheOptions): void => {
  if (
    options.maxSize !== undefined &&
    (typeof options.maxSize !== "number" || options.maxSize <= 0)
  ) {
    throw new CacheError(
      "maxSize must be a positive number",
      "VALIDATION_ERROR",
      "validateOptions",
      false,
      { maxSize: options.maxSize },
    );
  }

  if (
    options.defaultTTL !== undefined &&
    (typeof options.defaultTTL !== "number" || options.defaultTTL < 0)
  ) {
    throw new CacheError(
      "defaultTTL must be a non-negative number",
      "VALIDATION_ERROR",
      "validateOptions",
      false,
      { defaultTTL: options.defaultTTL },
    );
  }
};

const safeJsonParse = (text: string): any => {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new CacheError("Failed to parse cached data", "PARSE_ERROR", "safeJsonParse", false, {
      text: text.substring(0, 100),
    });
  }
};

const safeJsonStringify = (value: any): string => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    throw new CacheError(
      "Failed to serialize data for caching",
      "SERIALIZE_ERROR",
      "safeJsonStringify",
      false,
      { valueType: typeof value },
    );
  }
};

const isStorageAvailable = (storage: Storage): boolean => {
  try {
    const testKey = "__cache_test__";
    storage.setItem(testKey, "test");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Enhanced Cache Manager with comprehensive error handling
 */
export class CacheManager {
  private options: Required<CacheOptions>;
  private storage: Storage | Map<string, any>; // 支持Storage或Map作为存储
  private memoryCache: Map<string, CacheItem> = new Map();
  private fallbackCache: Map<string, CacheItem> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    errors: 0,
    evictions: 0,
  };

  constructor(options: CacheOptions = {}) {
    try {
      validateOptions(options);

      this.options = {
        maxSize: options.maxSize ?? 50,
        defaultTTL: options.defaultTTL ?? 10 * 60 * 1000, // 10 minutes
        version: options.version ?? "1.0.0",
        storage: options.storage ?? localStorage,
      };

      this.storage = this.options.storage;

      // Check if storage is available
      if (this.storage instanceof Storage) {
        if (!isStorageAvailable(this.storage)) {
          console.warn("[CacheManager] Primary storage not available, using memory-only cache");
          this.storage = sessionStorage;
          if (!isStorageAvailable(this.storage)) {
            console.warn("[CacheManager] Session storage not available, using memory-only cache");
          }
        }
      }

      // Initialize cache from storage
      this.initializeFromStorage();
    } catch (error) {
      logCacheError("constructor", error, options);
      showCacheErrorMessage("Failed to initialize cache manager");

      // Fallback to minimal configuration
      this.options = {
        maxSize: 50,
        defaultTTL: 10 * 60 * 1000,
        version: "1.0.0",
        storage: new Map() as Map<string, any>,
      };
      this.storage = this.options.storage;
    }
  }

  private initializeFromStorage(): void {
    try {
      const keys = Object.keys(this.storage);
      for (const key of keys) {
        if (key.startsWith("cache_")) {
          try {
            const item = this.getFromStorage(key);
            if (item && !this.isExpired(item)) {
              const cleanKey = key.replace("cache_", "");
              this.memoryCache.set(cleanKey, item);
            }
          } catch (error) {
            logCacheError("initializeFromStorage", error, { key });
            // Continue with other items
          }
        }
      }
    } catch (error) {
      logCacheError("initializeFromStorage", error);
    }
  }

  private getFromStorage(key: string): CacheItem | null {
    try {
      let item: string | null = null;
      if (this.storage instanceof Map) {
        item = this.storage.get(key) || null;
      } else {
        item = this.storage.getItem(key);
      }
      if (!item) return null;

      return safeJsonParse(item);
    } catch (error) {
      logCacheError("getFromStorage", error, { key });
      return null;
    }
  }

  private setToStorage(key: string, item: CacheItem): void {
    try {
      const serialized = safeJsonStringify(item);
      if (this.storage instanceof Map) {
        this.storage.set(key, serialized);
      } else {
        this.storage.setItem(key, serialized);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        logCacheError("setToStorage", error, { key, reason: "Storage quota exceeded" });
        // Try to clear expired items and retry
        this.clearExpired();
        try {
          if (this.storage instanceof Storage) {
            this.storage.setItem(key, safeJsonStringify(item));
          } else {
            this.storage.set(key, item);
          }
        } catch (retryError) {
          logCacheError("setToStorage.retry", retryError, { key });
          throw new CacheError(
            "Storage quota exceeded after cleanup",
            "STORAGE_QUOTA_ERROR",
            "setToStorage",
            false,
            { key },
          );
        }
      } else {
        throw error;
      }
    }
  }

  private removeFromStorage(key: string): void {
    try {
      if (this.storage instanceof Map) {
        this.storage.delete(key);
      } else {
        this.storage.removeItem(key);
      }
    } catch (error) {
      logCacheError("removeFromStorage", error, { key });
    }
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() > item.expiresAt;
  }

  private evictLRU(): void {
    try {
      if (this.memoryCache.size >= this.options.maxSize) {
        const oldestKey = this.memoryCache.keys().next().value;
        if (oldestKey) {
          this.memoryCache.delete(oldestKey);
          this.removeFromStorage(`cache_${oldestKey}`);
          this.stats.evictions++;
        }
      }
    } catch (error) {
      logCacheError("evictLRU", error);
    }
  }

  private clearExpired(): void {
    try {
      // const now = Date.now() // Removed unused variable
      const expiredKeys: string[] = [];

      for (const [key, item] of this.memoryCache.entries()) {
        if (this.isExpired(item)) {
          expiredKeys.push(key);
        }
      }

      for (const key of expiredKeys) {
        this.memoryCache.delete(key);
        this.removeFromStorage(`cache_${key}`);
      }
    } catch (error) {
      logCacheError("clearExpired", error);
    }
  }

  /**
   * Set a value in the cache with error handling and fallback
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      validateKey(key);
      validateValue(value);

      const effectiveTTL = ttl ?? this.options.defaultTTL;
      const item: CacheItem<T> = {
        value,
        expiresAt: Date.now() + effectiveTTL,
        version: this.options.version,
      };

      // Clear expired items before adding new one
      this.clearExpired();

      // Evict LRU if cache is full
      if (!this.memoryCache.has(key)) {
        this.evictLRU();
      }

      // Store in memory cache
      this.memoryCache.set(key, item);

      // Try to store in persistent storage
      try {
        this.setToStorage(`cache_${key}`, item);
      } catch (storageError) {
        logCacheError("set.storage", storageError, { key });
        // Continue with memory-only cache
      }

      return true;
    } catch (error) {
      this.stats.errors++;
      logCacheError("set", error, { key });

      if (error instanceof CacheError && error.code === "VALIDATION_ERROR") {
        showCacheErrorMessage("Invalid cache key or value", error.message);
      } else if (error instanceof CacheError && error.code === "STORAGE_QUOTA_ERROR") {
        showCacheErrorMessage("Storage quota exceeded", "Cache will use memory-only storage");
      } else {
        showCacheErrorMessage("Failed to set cache value");
      }

      // Try fallback to memory cache
      try {
        const item: CacheItem<T> = {
          value,
          expiresAt: Date.now() + (ttl ?? this.options.defaultTTL),
          version: this.options.version,
        };
        this.fallbackCache.set(key, item);
        return true;
      } catch (fallbackError) {
        logCacheError("set.fallback", fallbackError, { key });
        return false;
      }
    }
  }

  /**
   * Get a value from the cache with error handling
   */
  get<T>(key: string): T | undefined {
    try {
      validateKey(key);

      // Check memory cache first
      const item = this.memoryCache.get(key);
      if (item) {
        if (this.isExpired(item)) {
          this.memoryCache.delete(key);
          this.removeFromStorage(`cache_${key}`);
          this.stats.misses++;
          return undefined;
        }

        this.stats.hits++;
        return item.value as T;
      }

      // Check fallback cache
      const fallbackItem = this.fallbackCache.get(key);
      if (fallbackItem && !this.isExpired(fallbackItem)) {
        this.stats.hits++;
        return fallbackItem.value as T;
      }

      // Try to load from storage
      try {
        const storageItem = this.getFromStorage(`cache_${key}`);
        if (storageItem && !this.isExpired(storageItem)) {
          this.memoryCache.set(key, storageItem);
          this.stats.hits++;
          return storageItem.value as T;
        }
      } catch (storageError) {
        logCacheError("get.storage", storageError, { key });
      }

      this.stats.misses++;
      return undefined;
    } catch (error) {
      this.stats.errors++;
      logCacheError("get", error, { key });

      if (error instanceof CacheError && error.code === "VALIDATION_ERROR") {
        showCacheErrorMessage("Invalid cache key", error.message);
      } else {
        showCacheErrorMessage("Failed to retrieve cached value");
      }

      return undefined;
    }
  }

  /**
   * Get or set a value with error handling
   */
  getOrSet<T>(key: string, factory: () => T | Promise<T>, ttl?: number): T | Promise<T> {
    try {
      validateKey(key);

      const existing = this.get<T>(key);
      if (existing !== undefined) {
        return existing;
      }

      const result = factory();

      if (result instanceof Promise) {
        return result
          .then((value) => {
            this.set(key, value, ttl);
            return value;
          })
          .catch((error) => {
            logCacheError("getOrSet.factory", error, { key });
            showCacheErrorMessage("Failed to generate cache value");
            throw error;
          });
      } else {
        this.set(key, result, ttl);
        return result;
      }
    } catch (error) {
      logCacheError("getOrSet", error, { key });
      throw error;
    }
  }

  /**
   * Delete a value from the cache with error handling
   */
  delete(key: string): boolean {
    try {
      validateKey(key);

      const hadInMemory = this.memoryCache.delete(key);
      const hadInFallback = this.fallbackCache.delete(key);

      try {
        this.removeFromStorage(`cache_${key}`);
      } catch (storageError) {
        logCacheError("delete.storage", storageError, { key });
      }

      return hadInMemory || hadInFallback;
    } catch (error) {
      this.stats.errors++;
      logCacheError("delete", error, { key });

      if (error instanceof CacheError && error.code === "VALIDATION_ERROR") {
        showCacheErrorMessage("Invalid cache key", error.message);
      } else {
        showCacheErrorMessage("Failed to delete cached value");
      }

      return false;
    }
  }

  /**
   * Clear all cached values with error handling
   */
  clear(): void {
    try {
      this.memoryCache.clear();
      this.fallbackCache.clear();

      // Clear storage items
      try {
        const keys = Object.keys(this.storage);
        for (const key of keys) {
          if (key.startsWith("cache_")) {
            this.removeFromStorage(key);
          }
        }
      } catch (storageError) {
        logCacheError("clear.storage", storageError);
      }
    } catch (error) {
      this.stats.errors++;
      logCacheError("clear", error);
      showCacheErrorMessage("Failed to clear cache");
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      size: this.memoryCache.size,
      fallbackSize: this.fallbackCache.size,
      hitRatio:
        this.stats.hits + this.stats.misses > 0
          ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
          : 0,
    };
  }

  /**
   * Check if cache is healthy
   */
  isHealthy(): boolean {
    try {
      const testKey = "__health_check__";
      const testValue = { test: true, timestamp: Date.now() };

      this.set(testKey, testValue, 1000); // 1 second TTL
      const retrieved = this.get(testKey);
      this.delete(testKey);

      return (retrieved as { test: boolean; timestamp: number; } | null)?.test === true;
    } catch (error) {
      logCacheError("healthCheck", error);
      return false;
    }
  }
}

/**
 * Vue Composition API wrapper with error handling
 */
export function useCacheManager() {
  const cache = globalCache;

  const withCache = async <T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> => {
    try {
      return await cache.getOrSet(key, factory, ttl);
    } catch (error) {
      logCacheError("withCache", error, { key });
      showCacheErrorMessage("Cache operation failed, executing factory function");

      // Fallback to direct factory execution
      try {
        return await factory();
      } catch (factoryError) {
        logCacheError("withCache.fallback", factoryError);
        throw factoryError;
      }
    }
  };

  const clearCache = (): void => {
    try {
      cache.clear();
      ElMessage.success("Cache cleared successfully");
    } catch (error) {
      logCacheError("clearCache", error);
      showCacheErrorMessage("Failed to clear cache");
    }
  };

  const getCacheStats = () => {
    try {
      return cache.getStats();
    } catch (error) {
      logCacheError("getCacheStats", error);
      return { hits: 0, misses: 0, errors: 1, evictions: 0, size: 0, fallbackSize: 0, hitRatio: 0 };
    }
  };

  const checkCacheHealth = (): boolean => {
    try {
      return cache.isHealthy();
    } catch (error) {
      logCacheError("checkCacheHealth", error);
      return false;
    }
  };

  return {
    cache,
    withCache,
    clearCache,
    getCacheStats,
    checkCacheHealth,
  };
}

// Global cache instance with error handling
export const globalCache = new CacheManager({
  maxSize: 50,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  version: "1.0.0",
  storage: (() => {
    try {
      return localStorage;
    } catch (error) {
      console.warn("[CacheManager] localStorage not available, using sessionStorage");
      try {
        return sessionStorage;
      } catch (sessionError) {
        console.warn("[CacheManager] sessionStorage not available, using memory-only cache");
        return new Map() as Map<string, any>;
      }
    }
  })(),
});
