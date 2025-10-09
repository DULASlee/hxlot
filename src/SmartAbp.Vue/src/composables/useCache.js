/**
 * 缓存策略优化 Composable
 * 提供多级缓存、智能过期、缓存预热等功能
 */
import { ref, computed } from 'vue';
/**
 * 多级缓存管理 Composable
 */
export function useCache(config = {}) {
    const { prefix = 'smartabp', ttl = 5 * 60 * 1000, // 默认5分钟
    maxSize = 100, storage = 'memory' } = config;
    // 内存缓存
    const memoryCache = new Map();
    // 统计信息
    const stats = ref({
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        memoryUsage: 0
    });
    /**
     * 生成缓存键
     */
    const getCacheKey = (key) => {
        return `${prefix}:${key}`;
    };
    /**
     * 检查缓存是否过期
     */
    const isExpired = (entry) => {
        return entry.expiry > 0 && Date.now() > entry.expiry;
    };
    /**
     * 从存储中获取缓存
     */
    const getFromStorage = (key) => {
        try {
            const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
            const data = storageObj.getItem(getCacheKey(key));
            if (data) {
                return JSON.parse(data);
            }
        }
        catch (e) {
            console.warn('Failed to get from storage:', e);
        }
        return null;
    };
    /**
     * 保存到存储
     */
    const saveToStorage = (key, entry) => {
        if (storage === 'memory')
            return;
        try {
            const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
            storageObj.setItem(getCacheKey(key), JSON.stringify(entry));
        }
        catch (e) {
            console.warn('Failed to save to storage:', e);
        }
    };
    /**
     * 从存储中删除
     */
    const removeFromStorage = (key) => {
        if (storage === 'memory')
            return;
        try {
            const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
            storageObj.removeItem(getCacheKey(key));
        }
        catch (e) {
            console.warn('Failed to remove from storage:', e);
        }
    };
    /**
     * 更新统计信息
     */
    const updateStats = () => {
        const size = memoryCache.size;
        const memoryUsage = Array.from(memoryCache.entries()).reduce((total, [key, entry]) => {
            // 估算内存使用 (粗略计算)
            return total + key.length * 2 + JSON.stringify(entry).length * 2;
        }, 0);
        stats.value = {
            ...stats.value,
            size,
            memoryUsage,
            hitRate: stats.value.hits + stats.value.misses > 0
                ? stats.value.hits / (stats.value.hits + stats.value.misses)
                : 0
        };
    };
    /**
     * LRU淘汰策略
     */
    const evictLRU = () => {
        if (memoryCache.size <= maxSize)
            return;
        // 找到最少使用的条目
        let lruKey = null;
        let lruTime = Infinity;
        memoryCache.forEach((entry, key) => {
            if (entry.lastAccessed < lruTime) {
                lruTime = entry.lastAccessed;
                lruKey = key;
            }
        });
        if (lruKey) {
            memoryCache.delete(lruKey);
            removeFromStorage(lruKey);
        }
    };
    /**
     * 设置缓存
     */
    const set = (key, value, customTtl) => {
        const now = Date.now();
        const expiry = customTtl !== undefined
            ? (customTtl === 0 ? 0 : now + customTtl)
            : (ttl === 0 ? 0 : now + ttl);
        const entry = {
            value,
            expiry,
            createdAt: now,
            lastAccessed: now,
            hitCount: 0
        };
        // 先清理过期缓存
        cleanup();
        // LRU淘汰
        evictLRU();
        // 保存到内存缓存
        memoryCache.set(key, entry);
        // 保存到持久化存储
        saveToStorage(key, entry);
        updateStats();
    };
    /**
     * 获取缓存
     */
    const get = (key) => {
        // 先从内存缓存获取
        let entry = memoryCache.get(key);
        // 如果内存中没有，尝试从存储中获取
        if (!entry && storage !== 'memory') {
            const storageEntry = getFromStorage(key);
            // 如果从存储中获取到，放入内存缓存
            if (storageEntry) {
                entry = storageEntry;
                memoryCache.set(key, entry);
            }
        }
        // 未找到或已过期
        if (!entry || isExpired(entry)) {
            stats.value.misses++;
            updateStats();
            if (entry) {
                // 删除过期条目
                memoryCache.delete(key);
                removeFromStorage(key);
            }
            return null;
        }
        // 更新访问信息
        entry.lastAccessed = Date.now();
        entry.hitCount++;
        // 命中统计
        stats.value.hits++;
        updateStats();
        return entry.value;
    };
    /**
     * 删除缓存
     */
    const remove = (key) => {
        const existed = memoryCache.delete(key);
        removeFromStorage(key);
        updateStats();
        return existed;
    };
    /**
     * 检查缓存是否存在
     */
    const has = (key) => {
        const entry = memoryCache.get(key) || getFromStorage(key);
        return entry !== null && !isExpired(entry);
    };
    /**
     * 清空所有缓存
     */
    const clear = () => {
        memoryCache.clear();
        if (storage !== 'memory') {
            const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
            const keysToRemove = [];
            for (let i = 0; i < storageObj.length; i++) {
                const key = storageObj.key(i);
                if (key?.startsWith(`${prefix}:`)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => storageObj.removeItem(key));
        }
        // 重置统计
        stats.value = {
            hits: 0,
            misses: 0,
            hitRate: 0,
            size: 0,
            memoryUsage: 0
        };
    };
    /**
     * 清理过期缓存
     */
    const cleanup = () => {
        let removed = 0;
        memoryCache.forEach((entry, key) => {
            if (isExpired(entry)) {
                memoryCache.delete(key);
                removeFromStorage(key);
                removed++;
            }
        });
        if (removed > 0) {
            updateStats();
        }
        return removed;
    };
    /**
     * 获取所有缓存键
     */
    const keys = () => {
        return Array.from(memoryCache.keys());
    };
    /**
     * 批量设置
     */
    const setMany = (entries) => {
        entries.forEach(({ key, value, ttl: customTtl }) => {
            set(key, value, customTtl);
        });
    };
    /**
     * 批量获取
     */
    const getMany = (keys) => {
        return keys.map(key => get(key));
    };
    /**
     * 批量删除
     */
    const removeMany = (keys) => {
        keys.forEach(key => remove(key));
    };
    return {
        // 状态
        stats: computed(() => stats.value),
        size: computed(() => memoryCache.size),
        // 基础方法
        set,
        get,
        remove,
        has,
        clear,
        cleanup,
        keys,
        // 批量方法
        setMany,
        getMany,
        removeMany
    };
}
/**
 * HTTP请求缓存 Composable
 */
export function useHttpCache() {
    const cache = useCache({
        prefix: 'http-cache',
        ttl: 60 * 1000, // 1分钟
        maxSize: 50,
        storage: 'memory'
    });
    /**
     * 生成请求缓存键
     */
    const getRequestKey = (url, options) => {
        const method = options?.method || 'GET';
        const body = options?.body ? JSON.stringify(options.body) : '';
        return `${method}:${url}:${body}`;
    };
    /**
     * 缓存GET请求
     */
    const cachedFetch = async (url, options) => {
        const key = getRequestKey(url, options);
        // 非GET请求不缓存
        if (options?.method && options.method !== 'GET') {
            return fetch(url, options);
        }
        // 尝试从缓存获取
        const cached = cache.get(key);
        if (cached) {
            return new Response(JSON.stringify(cached.data), {
                status: 200,
                headers: new Headers(cached.headers)
            });
        }
        // 发起请求
        const response = await fetch(url, options);
        // 只缓存成功的响应
        if (response.ok) {
            const data = await response.clone().json();
            const headers = {};
            response.headers.forEach((value, key) => {
                headers[key] = value;
            });
            cache.set(key, { data, headers });
        }
        return response;
    };
    /**
     * 预热缓存
     */
    const warmup = async (urls) => {
        await Promise.all(urls.map(url => cachedFetch(url)));
    };
    return {
        cachedFetch,
        warmup,
        cache
    };
}
