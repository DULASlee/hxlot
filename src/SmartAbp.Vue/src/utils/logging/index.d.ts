/**
 * SmartAbp 统一日志系统
 * 整合传输器架构、结构化日志、子日志器、Vue响应式等功能
 */
export { EnhancedLogger, createLogger, createModuleLogger } from "./enhanced-logger";
export type { LogTransport, LogEntry } from "./transports";
export { LogLevel, LOG_LEVEL_NAMES, LOG_LEVEL_COLORS, ConsoleTransport, FileTransport, MemoryTransport, NetworkTransport, } from "./transports";
export { logManager, trackPerformance, type PerformanceTracker } from "../logManager";
import { LogLevel } from "./transports";
/**
 * 全局日志器实例 - 向后兼容
 */
export declare const logger: import("./enhanced-logger").EnhancedLogger;
/**
 * 低代码引擎专用日志器
 */
export declare const lowcodeLogger: import("./enhanced-logger").EnhancedLogger;
/**
 * 创建应用程序日志器
 */
export declare function createAppLogger(appName: string): import("./enhanced-logger").EnhancedLogger;
/**
 * 创建组件日志器
 */
export declare function createComponentLogger(componentName: string): import("./enhanced-logger").EnhancedLogger;
/**
 * 创建服务日志器
 */
export declare function createServiceLogger(serviceName: string): import("./enhanced-logger").EnhancedLogger;
/**
 * 创建插件日志器
 */
export declare function createPluginLogger(pluginName: string): import("./enhanced-logger").EnhancedLogger;
/**
 * 便捷的日志方法 - 向后兼容老的 API
 */
export declare const log: {
    debug: (message: string, data?: any) => void;
    info: (message: string, data?: any) => void;
    success: (message: string, data?: any) => void;
    warn: (message: string, data?: any) => void;
    error: (message: string, error?: Error | string, data?: any) => void;
    fatal: (message: string, error?: Error | string, data?: any) => void;
};
/**
 * 性能追踪的便捷方法
 */
export declare const perf: {
    start: (name: string, context?: Record<string, any>) => import("./enhanced-logger").PerformanceTimer;
    trackAsync: <T>(name: string, operation: () => Promise<T>, context?: Record<string, any>) => Promise<T>;
    trackSync: <T>(name: string, operation: () => T, context?: Record<string, any>) => T;
};
/**
 * 系统级日志方法
 */
export declare const system: {
    startup: (details: Record<string, any>) => void;
    shutdown: (details: Record<string, any>) => void;
    error: (message: string, error: Error, context?: Record<string, any>) => void;
    security: (event: string, details: Record<string, any>) => void;
};
/**
 * 用户操作日志
 */
export declare const userActivity: {
    login: (userId: string, details: Record<string, any>) => void;
    logout: (userId: string, details: Record<string, any>) => void;
    action: (userId: string, action: string, details: Record<string, any>) => void;
};
/**
 * API请求日志
 */
export declare const api: {
    request: (url: string, method: string, details?: Record<string, any>) => void;
    response: (url: string, method: string, status: number, duration: number, details?: Record<string, any>) => void;
    error: (url: string, method: string, error: Error, details?: Record<string, any>) => void;
};
/**
 * 数据库操作日志
 */
export declare const database: {
    query: (sql: string, duration: number, details?: Record<string, any>) => void;
    slowQuery: (sql: string, duration: number, threshold?: number, details?: Record<string, any>) => void;
    error: (sql: string, error: Error, details?: Record<string, any>) => void;
};
/**
 * 初始化日志系统
 */
export declare function initLogging(config?: {
    level?: LogLevel;
    enableFileLogging?: boolean;
    enableNetworkLogging?: boolean;
    networkEndpoint?: string;
    logDirectory?: string;
}): void;
/**
 * 清理日志系统资源
 */
export declare function cleanupLogging(): Promise<void>;
/**
 * Vue组合式函数：使用日志器
 */
export declare function useLogger(context?: Record<string, any>): {
    logger: import("./enhanced-logger").EnhancedLogger;
    logs: import("vue").Ref<import("./transports").LogEntry[], import("./transports").LogEntry[]>;
    stats: import("vue").ComputedRef<import("./enhanced-logger").LogStats>;
    debug: (message: string, metadata?: Record<string, any>) => void;
    info: (message: string, metadata?: Record<string, any>) => void;
    success: (message: string, metadata?: Record<string, any>) => void;
    warn: (message: string, metadata?: Record<string, any>) => void;
    error: (message: string, error?: Error | string, metadata?: Record<string, any>) => void;
    fatal: (message: string, error?: Error | string, metadata?: Record<string, any>) => void;
    startTimer: (name: string, context?: Record<string, any>) => import("./enhanced-logger").PerformanceTimer;
    trackAsync: <T>(name: string, operation: () => Promise<T>, context?: Record<string, any>) => Promise<T>;
    trackSync: <T>(name: string, operation: () => T, context?: Record<string, any>) => T;
};
/**
 * Vue组合式函数：使用性能追踪
 */
export declare function usePerformanceTracking(context?: Record<string, any>): {
    startTimer: (name: string) => import("./enhanced-logger").PerformanceTimer;
    trackAsync: <T>(name: string, operation: () => Promise<T>) => Promise<T>;
    trackSync: <T>(name: string, operation: () => T) => T;
};
//# sourceMappingURL=index.d.ts.map