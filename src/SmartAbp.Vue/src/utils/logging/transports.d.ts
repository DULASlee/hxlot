/**
 * 日志传输器 - Transport Pattern 实现
 * 支持多种输出目标：控制台、文件、网络等
 */
export interface LogEntry {
    id: string;
    level: LogLevel;
    message: string;
    timestamp: number;
    context?: Record<string, any>;
    metadata?: Record<string, any>;
    source?: string;
    stack?: string;
}
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    SUCCESS = 2,
    WARN = 3,
    ERROR = 4,
    FATAL = 5
}
export declare const LOG_LEVEL_NAMES: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
};
export declare const LOG_LEVEL_COLORS: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
};
/**
 * 日志传输器接口
 */
export interface LogTransport {
    name: string;
    level: LogLevel;
    write(entry: LogEntry): Promise<void>;
    flush?(): Promise<void>;
    destroy?(): Promise<void>;
}
/**
 * 控制台传输器
 */
export declare class ConsoleTransport implements LogTransport {
    name: string;
    level: LogLevel;
    private enableColors;
    private enableGrouping;
    constructor(options?: {
        level?: LogLevel;
        enableColors?: boolean;
        enableGrouping?: boolean;
    });
    write(entry: LogEntry): Promise<void>;
    private formatMessage;
    private prepareArgs;
}
/**
 * 文件传输器 - 真正的文件写入实现
 */
export declare class FileTransport implements LogTransport {
    name: string;
    level: LogLevel;
    private filePath;
    private maxFileSize;
    private currentSize;
    private writeQueue;
    private isWriting;
    private batchTimeout?;
    constructor(options: {
        level?: LogLevel;
        filePath: string;
        maxFileSize?: number;
    });
    write(entry: LogEntry): Promise<void>;
    private flushQueue;
    private writeEntries;
    private writeToIndexedDB;
    private writeToLocalStorage;
    private writeToFileSystem;
    private formatEntry;
    private rotateFile;
    private ensureLogDirectory;
    flush(): Promise<void>;
    destroy(): Promise<void>;
    exportLogs(): Promise<LogEntry[]>;
}
/**
 * 内存传输器 - 用于测试和调试
 */
export declare class MemoryTransport implements LogTransport {
    name: string;
    level: LogLevel;
    private entries;
    private maxEntries;
    constructor(options?: {
        level?: LogLevel;
        maxEntries?: number;
    });
    write(entry: LogEntry): Promise<void>;
    getEntries(): LogEntry[];
    clear(): void;
    destroy(): Promise<void>;
}
/**
 * 网络传输器 - 发送日志到远程服务器
 */
export declare class NetworkTransport implements LogTransport {
    name: string;
    level: LogLevel;
    private endpoint;
    private batchSize;
    private flushInterval;
    private queue;
    private timer?;
    constructor(options: {
        level?: LogLevel;
        endpoint: string;
        batchSize?: number;
        flushInterval?: number;
    });
    write(entry: LogEntry): Promise<void>;
    flush(): Promise<void>;
    destroy(): Promise<void>;
}
//# sourceMappingURL=transports.d.ts.map
