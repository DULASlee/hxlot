/**
 * 增强的结构化日志器
 * 支持传输器架构、子日志器、完整的结构化格式
 */
import { type Ref } from "vue";
import { LogTransport, LogEntry, LogLevel } from "./transports";
export interface LoggerOptions {
    level?: LogLevel;
    context?: Record<string, any>;
    transports?: LogTransport[];
    enableBatching?: boolean;
    batchSize?: number;
    batchTimeout?: number;
}
export interface LogStats {
    total: number;
    debug: number;
    info: number;
    success: number;
    warn: number;
    error: number;
    fatal: number;
}
export interface PerformanceTimer {
    name: string;
    startTime: number;
    context?: Record<string, any>;
    end(): number;
}
/**
 * 增强的结构化日志器类
 */
export declare class EnhancedLogger {
    private level;
    private context;
    private transports;
    private logs;
    private childLoggers;
    private subscribers;
    private maxLogs;
    private enableBatching;
    private batchSize;
    private batchTimeout;
    private batchQueue;
    private batchTimer?;
    private activeTimers;
    constructor(options?: LoggerOptions);
    debug(message: string, metadata?: Record<string, any>): void;
    info(message: string, metadata?: Record<string, any>): void;
    success(message: string, metadata?: Record<string, any>): void;
    warn(message: string, metadata?: Record<string, any>): void;
    error(message: string, error?: Error | string, metadata?: Record<string, any>): void;
    fatal(message: string, error?: Error | string, metadata?: Record<string, any>): void;
    private log;
    child(context: Record<string, any>, options?: Partial<LoggerOptions>): EnhancedLogger;
    startTimer(name: string, context?: Record<string, any>): PerformanceTimer;
    trackAsync<T>(name: string, operation: () => Promise<T>, context?: Record<string, any>): Promise<T>;
    trackSync<T>(name: string, operation: () => T, context?: Record<string, any>): T;
    addTransport(transport: LogTransport): void;
    removeTransport(name: string): boolean;
    getTransports(): LogTransport[];
    private addDefaultTransports;
    private addToBatch;
    private flushBatch;
    private writeToTransports;
    private addToLogs;
    getStats(): LogStats;
    getStatsRef(): import("vue").ComputedRef<LogStats>;
    getLogs(): LogEntry[];
    getLogsRef(): Ref<LogEntry[]>;
    subscribe(callback: (logs: LogEntry[]) => void): () => void;
    private notifySubscribers;
    export(format?: "json" | "csv" | "txt"): string;
    exportDiagnosticReport(): string;
    setLevel(level: LogLevel): void;
    setMaxLogs(max: number): void;
    clear(): void;
    flush(): Promise<void>;
    destroy(): Promise<void>;
    private generateId;
}
/**
 * 创建增强日志器的便捷函数
 */
export declare function createLogger(options?: LoggerOptions): EnhancedLogger;
/**
 * 为特定模块创建日志器
 */
export declare function createModuleLogger(moduleName: string, options?: LoggerOptions): EnhancedLogger;
//# sourceMappingURL=enhanced-logger.d.ts.map