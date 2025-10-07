/**
 * 内存监控Hook
 */
export interface MemoryInfo {
    /** 已使用内存（MB） */
    usedMemory: number;
    /** 总内存（MB） */
    totalMemory: number;
    /** 内存使用率（%） */
    memoryUsage: number;
    /** 垃圾回收信息 */
    gcInfo?: {
        collections: number;
        duration: number;
    };
}
export declare function useMemoryMonitor(): {
    memoryInfo: import("vue").Ref<{
        usedMemory: number;
        totalMemory: number;
        memoryUsage: number;
        gcInfo?: {
            collections: number;
            duration: number;
        } | undefined;
    }, MemoryInfo | {
        usedMemory: number;
        totalMemory: number;
        memoryUsage: number;
        gcInfo?: {
            collections: number;
            duration: number;
        } | undefined;
    }>;
    isSupported: import("vue").Ref<boolean, boolean>;
    startMonitoring: (interval?: number) => void;
    stopMonitoring: () => void;
    triggerGC: () => void;
    updateMemoryInfo: () => void;
};
/**
 * 企业级LRU缓存实现
 */
export declare class LRUCache<K, V> {
    private capacity;
    private cache;
    private accessOrder;
    constructor(capacity?: number);
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    delete(key: K): boolean;
    clear(): void;
    size(): number;
    has(key: K): boolean;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    getStats(): {
        size: number;
        capacity: number;
        utilization: number;
    };
}
/**
 * 智能缓存管理Hook
 */
export interface CacheOptions<T> {
    /** 缓存容量 */
    capacity?: number;
    /** 过期时间（毫秒） */
    ttl?: number;
    /** 存储到localStorage */
    persistent?: boolean;
    /** 序列化函数 */
    serialize?: (value: T) => string;
    /** 反序列化函数 */
    deserialize?: (value: string) => T;
}
export declare function useCache<T>(key: string, options?: CacheOptions<T>): {
    get: (cacheKey: string) => T | null;
    set: (cacheKey: string, value: T) => void;
    remove: (cacheKey: string) => boolean;
    clear: () => void;
    getStats: () => {
        hitRate: number;
        totalRequests: number;
        cacheHits: number;
        size: number;
        capacity: number;
        utilization: number;
    };
    cleanup: () => void;
    hitRate: import("vue").Ref<number, number>;
    totalRequests: import("vue").Ref<number, number>;
    cacheHits: import("vue").Ref<number, number>;
};
/**
 * 防抖Hook
 */
export declare function useDebounce<T extends (..._args: any[]) => any>(fn: T, delay?: number): [T, () => void];
/**
 * 节流Hook
 */
export declare function useThrottle<T extends (..._args: any[]) => any>(fn: T, delay?: number): [T, () => void];
/**
 * 对象池管理
 */
export declare class ObjectPool<T> {
    private pool;
    private createFn;
    private resetFn?;
    private maxSize;
    constructor(createFn: () => T, resetFn?: (_obj: T) => void, maxSize?: number);
    get(): T;
    release(obj: T): void;
    clear(): void;
    size(): number;
}
//# sourceMappingURL=memoryOptimization.d.ts.map
