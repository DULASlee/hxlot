/**
 * 向后兼容的日志器 - 现在基于增强的日志系统
 * @deprecated 建议使用 @/utils/logging 中的新日志系统
 */
import { type Ref } from "vue";
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    SUCCESS = 2,
    WARN = 3,
    ERROR = 4
}
export declare const LOG_LEVEL_NAMES: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
};
export declare const LOG_LEVEL_COLORS: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
};
export interface LogEntry {
    id: string;
    level: LogLevel;
    message: string;
    timestamp: number;
    category?: string;
    data?: any;
    source?: string;
    stack?: string;
}
export interface LogStats {
    total: number;
    debug: number;
    info: number;
    success: number;
    warn: number;
    error: number;
}
type LogSubscriber = (logs: LogEntry[]) => void;
declare class Logger {
    private compatLogger;
    private subscribers;
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    success(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, data?: any): void;
    private notifySubscribers;
    getLogs(): LogEntry[];
    log(level: unknown, message: string, data?: any): void;
    getLogsRef(): Ref<LogEntry[]>;
    getStats(): LogStats;
    private mapEnhancedLogLevel;
    export(format?: "json" | "csv" | "txt"): string;
    clear(): void;
    subscribe(callback: LogSubscriber): () => void;
    setMaxLogs(max: number): void;
    getEnhancedLogger(): import("./logging").EnhancedLogger;
}
export declare const logger: Logger;
/**
 * @deprecated 建议迁移到新的增强日志系统
 *
 * 旧API：
 * import { logger } from '@/utils/logger'
 * logger.info('消息', data)
 *
 * 新API：
 * import { logger, createComponentLogger } from '@/utils/logging'
 * const componentLogger = createComponentLogger('MyComponent')
 * componentLogger.info('消息', data)
 *
 * 新API优势：
 * - 传输器架构 (ConsoleTransport, FileTransport, NetworkTransport)
 * - 结构化日志格式
 * - 子日志器支持 logger.child({ component: 'Name' })
 * - 性能追踪 logger.trackAsync()
 * - 真正的文件写入
 * - 批量处理优化
 */
export declare const enhanced: {
    getLogger: () => import("./logging").EnhancedLogger;
    child: (context: Record<string, any>) => import("./logging").EnhancedLogger;
    trackAsync: <T>(name: string, operation: () => Promise<T>, context?: Record<string, any>) => Promise<T>;
    trackSync: <T>(name: string, operation: () => T, context?: Record<string, any>) => T;
    exportDiagnostic: () => string;
};
export {};
/**
 * 快速迁移示例：
 *
 * // 旧方式
 * logger.info('用户操作', { userId: 123, action: 'login' })
 *
 * // 新方式 (推荐)
 * import { createComponentLogger } from '@/utils/logging'
 * const userLogger = createComponentLogger('UserComponent')
 * userLogger.info('用户操作', { userId: 123, action: 'login' })
 *
 * // 或者使用增强功能
 * import { enhanced } from '@/utils/logger'
 * const userLogger = enhanced.child({ component: 'UserComponent' })
 * userLogger.info('用户操作', { userId: 123, action: 'login' })
 */
//# sourceMappingURL=logger.d.ts.map
