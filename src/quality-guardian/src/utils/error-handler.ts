/**
 * 错误处理器 - 健壮性保证
 */

export enum ErrorSeverity {
    FATAL = 'fatal',       // 致命错误，必须停止
    CRITICAL = 'critical', // 严重错误，但可继续
    WARNING = 'warning',   // 警告，可忽略
    INFO = 'info'         // 信息，仅记录
}

export interface ErrorContext {
    operation: string;
    file?: string;
    checker?: string;
    originalError: Error;
    severity: ErrorSeverity;
    recoverable: boolean;
}

export class ErrorHandler {
    private errors: ErrorContext[] = [];
    private continueOnError: boolean;

    constructor(continueOnError: boolean = true) {
        this.continueOnError = continueOnError;
    }

    /**
     * 处理错误
     */
    handle(context: ErrorContext): boolean {
        this.errors.push(context);

        // 根据严重性决定是否继续
        if (context.severity === ErrorSeverity.FATAL && !this.continueOnError) {
            return false;
        }

        return true;
    }

    /**
     * 分类错误
     */
    static classifyError(error: Error): ErrorSeverity {
        const message = error.message.toLowerCase();

        // 致命错误
        if (message.includes('out of memory') || message.includes('heap out of memory')) {
            return ErrorSeverity.FATAL;
        }

        // 权限错误
        if (message.includes('eacces') || message.includes('eperm') || message.includes('permission denied')) {
            return ErrorSeverity.CRITICAL;
        }

        // 硬盘错误
        if (message.includes('enospc') || message.includes('no space left') || message.includes('disk full')) {
            return ErrorSeverity.CRITICAL;
        }

        // 文件不存在
        if (message.includes('enoent') || message.includes('no such file')) {
            return ErrorSeverity.WARNING;
        }

        // 超时错误
        if (message.includes('timeout') || message.includes('etimedout')) {
            return ErrorSeverity.WARNING;
        }

        // 网络错误
        if (message.includes('econnrefused') || message.includes('enetunreach')) {
            return ErrorSeverity.WARNING;
        }

        return ErrorSeverity.WARNING;
    }

    /**
     * 判断错误是否可恢复
     */
    static isRecoverable(error: Error): boolean {
        const severity = this.classifyError(error);
        return severity !== ErrorSeverity.FATAL;
    }

    /**
     * 获取友好的错误消息
     */
    static getFriendlyMessage(error: Error): string {
        const message = error.message.toLowerCase();

        if (message.includes('eacces') || message.includes('eperm')) {
            return '权限不足，请检查文件或目录权限';
        }

        if (message.includes('enospc') || message.includes('no space left')) {
            return '磁盘空间不足，请清理磁盘';
        }

        if (message.includes('enoent')) {
            return '文件或目录不存在';
        }

        if (message.includes('timeout')) {
            return '操作超时，请检查网络或系统负载';
        }

        if (message.includes('out of memory')) {
            return '内存不足，请增加Node.js内存限制';
        }

        return error.message;
    }

    /**
     * 获取错误列表
     */
    getErrors(): ErrorContext[] {
        return this.errors;
    }

    /**
     * 获取错误统计
     */
    getStats() {
        const stats = {
            total: this.errors.length,
            fatal: 0,
            critical: 0,
            warning: 0,
            info: 0,
            recoverable: 0,
            unrecoverable: 0
        };

        this.errors.forEach(err => {
            stats[err.severity]++;
            if (err.recoverable) {
                stats.recoverable++;
            } else {
                stats.unrecoverable++;
            }
        });

        return stats;
    }
}

/**
 * Custom error class to signal that an operation is worth retrying.
 */
export class RetriableError extends Error {
    public readonly originalError?: Error;

    constructor(message: string, originalError?: Error) {
        super(message);
        this.name = 'RetriableError';
        this.originalError = originalError;
    }
}

