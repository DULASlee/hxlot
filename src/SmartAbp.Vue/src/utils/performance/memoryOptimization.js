// SmartAbp Enterprise Memory Optimization & Cache Management
import { onBeforeUnmount, ref } from 'vue';
export function useMemoryMonitor() {
    const memoryInfo = ref({
        usedMemory: 0,
        totalMemory: 0,
        memoryUsage: 0
    });
    const isSupported = ref(false);
    const updateInterval = ref(null);
    const updateMemoryInfo = () => {
        if ('memory' in performance) {
            const memory = performance.memory;
            const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
            const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
            memoryInfo.value = {
                usedMemory: used,
                totalMemory: total,
                memoryUsage: total > 0 ? Math.round((used / total) * 100) : 0
            };
            // 内存警告
            if (memoryInfo.value.memoryUsage > 80) {
                console.warn(`[Memory Warning] High memory usage: ${memoryInfo.value.memoryUsage}%`);
            }
        }
    };
    const startMonitoring = (interval = 5000) => {
        if ('memory' in performance) {
            isSupported.value = true;
            updateMemoryInfo();
            updateInterval.value = window.setInterval(updateMemoryInfo, interval);
        }
    };
    const stopMonitoring = () => {
        if (updateInterval.value) {
            clearInterval(updateInterval.value);
            updateInterval.value = null;
        }
    };
    const triggerGC = () => {
        if ('gc' in window && typeof window.gc === 'function') {
            window.gc();
            console.log('[Memory] Manual garbage collection triggered');
        }
        else {
            console.warn('[Memory] Manual GC not available');
        }
    };
    onBeforeUnmount(() => {
        stopMonitoring();
    });
    return {
        memoryInfo,
        isSupported,
        startMonitoring,
        stopMonitoring,
        triggerGC,
        updateMemoryInfo
    };
}
/**
 * 企业级LRU缓存实现
 */
export class LRUCache {
    constructor(capacity = 1000) {
        Object.defineProperty(this, "capacity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "accessOrder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        this.capacity = capacity;
    }
    get(key) {
        if (this.cache.has(key)) {
            // 更新访问顺序
            this.accessOrder.delete(key);
            this.accessOrder.add(key);
            return this.cache.get(key);
        }
        return undefined;
    }
    set(key, value) {
        if (this.cache.has(key)) {
            // 更新现有键
            this.cache.set(key, value);
            this.accessOrder.delete(key);
            this.accessOrder.add(key);
        }
        else {
            // 添加新键
            if (this.cache.size >= this.capacity) {
                // 移除最久未使用的项
                const oldestKey = this.accessOrder.values().next().value;
                if (oldestKey !== undefined) {
                    this.accessOrder.delete(oldestKey);
                    this.cache.delete(oldestKey);
                }
            }
            this.cache.set(key, value);
            this.accessOrder.add(key);
        }
    }
    delete(key) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            this.accessOrder.delete(key);
            return true;
        }
        return false;
    }
    clear() {
        this.cache.clear();
        this.accessOrder.clear();
    }
    size() {
        return this.cache.size;
    }
    has(key) {
        return this.cache.has(key);
    }
    keys() {
        return this.accessOrder.values();
    }
    values() {
        return this.cache.values();
    }
    // 获取缓存统计信息
    getStats() {
        return {
            size: this.cache.size,
            capacity: this.capacity,
            utilization: Math.round((this.cache.size / this.capacity) * 100)
        };
    }
}
export function useCache(key, options = {}) {
    const { capacity = 100, ttl = 60 * 60 * 1000, // 1小时
    persistent = false,
    // serialize = JSON.stringify, // 暂时注释未使用变量
    // deserialize = JSON.parse // 暂时注释未使用变量
     } = options;
    const cache = new LRUCache(capacity);
    const hitRate = ref(0);
    const totalRequests = ref(0);
    const cacheHits = ref(0);
    // 从localStorage恢复缓存
    const restoreFromStorage = () => {
        if (persistent && typeof localStorage !== 'undefined') {
            try {
                const stored = localStorage.getItem(`cache_${key}`);
                if (stored) {
                    const data = JSON.parse(stored);
                    Object.entries(data).forEach(([k, v]) => {
                        cache.set(k, v);
                    });
                }
            }
            catch (error) {
                console.error('[Cache] Failed to restore from storage:', error);
            }
        }
    };
    // 保存到localStorage
    const saveToStorage = () => {
        if (persistent && typeof localStorage !== 'undefined') {
            try {
                const data = {};
                for (const [k] of cache.keys()) {
                    if (k) {
                        const item = cache.get(k);
                        if (item) {
                            data[k] = item;
                        }
                    }
                }
                localStorage.setItem(`cache_${key}`, JSON.stringify(data));
            }
            catch (error) {
                console.error('[Cache] Failed to save to storage:', error);
            }
        }
    };
    const get = (cacheKey) => {
        totalRequests.value++;
        const item = cache.get(cacheKey);
        if (item) {
            // 检查是否过期
            if (Date.now() - item.timestamp < ttl) {
                item.accessCount++;
                cacheHits.value++;
                hitRate.value = Math.round((cacheHits.value / totalRequests.value) * 100);
                return item.value;
            }
            else {
                // 过期，删除
                cache.delete(cacheKey);
            }
        }
        hitRate.value = Math.round((cacheHits.value / totalRequests.value) * 100);
        return null;
    };
    const set = (cacheKey, value) => {
        const item = {
            value,
            timestamp: Date.now(),
            accessCount: 1
        };
        cache.set(cacheKey, item);
        saveToStorage();
    };
    const remove = (cacheKey) => {
        const result = cache.delete(cacheKey);
        if (result) {
            saveToStorage();
        }
        return result;
    };
    const clear = () => {
        cache.clear();
        cacheHits.value = 0;
        totalRequests.value = 0;
        hitRate.value = 0;
        if (persistent && typeof localStorage !== 'undefined') {
            localStorage.removeItem(`cache_${key}`);
        }
    };
    // 缓存统计
    const getStats = () => ({
        ...cache.getStats(),
        hitRate: hitRate.value,
        totalRequests: totalRequests.value,
        cacheHits: cacheHits.value
    });
    // 清理过期缓存
    const cleanup = () => {
        const now = Date.now();
        const keysToDelete = [];
        for (const cacheKey of cache.keys()) {
            const item = cache.get(cacheKey);
            if (item && now - item.timestamp >= ttl) {
                keysToDelete.push(cacheKey);
            }
        }
        keysToDelete.forEach(cacheKey => cache.delete(cacheKey));
        if (keysToDelete.length > 0) {
            saveToStorage();
            console.log(`[Cache] Cleaned up ${keysToDelete.length} expired items`);
        }
    };
    // 初始化
    restoreFromStorage();
    // 定期清理
    const cleanupInterval = setInterval(cleanup, 5 * 60 * 1000); // 5分钟
    onBeforeUnmount(() => {
        clearInterval(cleanupInterval);
        saveToStorage();
    });
    return {
        get,
        set,
        remove,
        clear,
        getStats,
        cleanup,
        hitRate,
        totalRequests,
        cacheHits
    };
}
/**
 * 防抖Hook
 */
export function useDebounce(fn, delay = 300) {
    let timer = null;
    const debouncedFn = ((...functionArgs) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = window.setTimeout(() => {
            fn.apply(null, functionArgs);
            timer = null;
        }, delay);
    });
    const cancel = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };
    onBeforeUnmount(() => {
        cancel();
    });
    return [debouncedFn, cancel];
}
/**
 * 节流Hook
 */
export function useThrottle(fn, delay = 300) {
    let timer = null;
    let lastExecTime = 0;
    const throttledFn = ((...functionArgs) => {
        const now = Date.now();
        if (now - lastExecTime >= delay) {
            fn.apply(null, functionArgs);
            lastExecTime = now;
        }
        else if (!timer) {
            timer = window.setTimeout(() => {
                fn.apply(null, functionArgs);
                lastExecTime = Date.now();
                timer = null;
            }, delay - (now - lastExecTime));
        }
    });
    const cancel = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };
    onBeforeUnmount(() => {
        cancel();
    });
    return [throttledFn, cancel];
}
/**
 * 对象池管理
 */
export class ObjectPool {
    constructor(createFn, resetFn, maxSize = 50) {
        Object.defineProperty(this, "pool", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "createFn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "resetFn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.maxSize = maxSize;
    }
    get() {
        const item = this.pool.pop();
        return item || this.createFn();
    }
    release(obj) {
        if (this.pool.length < this.maxSize) {
            if (this.resetFn) {
                this.resetFn(obj);
            }
            this.pool.push(obj);
        }
    }
    clear() {
        this.pool.length = 0;
    }
    size() {
        return this.pool.length;
    }
}
