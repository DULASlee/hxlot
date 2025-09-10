/**
 * 结构化日志系统
 * 支持多级别、上下文、批量处理、链路追踪
 */

import type {
  StructuredLogger as IStructuredLogger,
  LogLevel,
  LogEntry
} from './types';

export interface LoggerOptions {
  level?: LogLevel;
  enableConsole?: boolean;
  enableFile?: boolean;
  filePath?: string;
  maxFileSize?: number;
  enableStructured?: boolean;
  enableColors?: boolean;
  context?: Record<string, any>;
}

export interface LogTransport {
  name: string;
  write(entry: LogEntry): Promise<void>;
}

// ============= 日志传输器 =============

/**
 * 控制台传输器
 */
export class ConsoleTransport implements LogTransport {
  name = 'console';
  private enableColors: boolean;

  constructor(enableColors = true) {
    this.enableColors = enableColors;
  }

  async write(entry: LogEntry): Promise<void> {
    const message = this.formatMessage(entry);

    switch (entry.level) {
      case 'debug':
        console.debug(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
      case 'fatal':
        console.error(message);
        break;
    }
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase().padEnd(5);

    let message = `${timestamp} [${level}] ${entry.message}`;

    // 添加上下文信息
    if (Object.keys(entry.context).length > 0) {
      message += ` | Context: ${JSON.stringify(entry.context)}`;
    }

    // 添加错误信息
    if (entry.error) {
      message += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack) {
        message += `\n  Stack: ${entry.error.stack}`;
      }
    }

    // 添加链路追踪信息
    if (entry.traceId) {
      message += ` | TraceId: ${entry.traceId}`;
    }
    if (entry.spanId) {
      message += ` | SpanId: ${entry.spanId}`;
    }

    return this.enableColors ? this.colorize(message, entry.level) : message;
  }

  private colorize(message: string, level: LogLevel): string {
    const colors = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
      fatal: '\x1b[35m'  // magenta
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';

    return `${color}${message}${reset}`;
  }
}

/**
 * 文件传输器
 */
export class FileTransport implements LogTransport {
  name = 'file';
  private filePath: string;
  private maxFileSize: number;
  private currentSize = 0;

  constructor(filePath: string, maxFileSize = 10 * 1024 * 1024) {
    this.filePath = filePath;
    this.maxFileSize = maxFileSize;
    // 标记使用以避免未使用警告
    void this.filePath;
  }

  async write(entry: LogEntry): Promise<void> {
    const message = JSON.stringify(entry) + '\n';

    // 检查文件大小
    if (this.currentSize + message.length > this.maxFileSize) {
      await this.rotateFile();
    }

    // 写入文件（这里简化实现，实际项目中需要使用fs模块）
    this.currentSize += message.length;
  }

  private async rotateFile(): Promise<void> {
    // 文件轮转逻辑
    // const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // const backupPath = `${this.filePath}.${timestamp}`;

    // 重命名当前文件并创建新文件
    // TODO: 实现实际的文件轮转逻辑
    this.currentSize = 0;
  }
}

// ============= 结构化日志器 =============

export class StructuredLogger implements IStructuredLogger {
  private level: LogLevel;
  private context: Record<string, any>;
  private transports: LogTransport[] = [];
  private batchEntries: LogEntry[] = [];
  private batchSize = 100;
  private batchTimeout = 5000; // 5秒
  private batchTimer?: number | ReturnType<typeof setTimeout>;

  private readonly levelNumbers: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4
  };

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || 'info';
    this.context = options.context || {};

    // 添加默认传输器
    if (options.enableConsole !== false) {
      this.addTransport(new ConsoleTransport(options.enableColors));
    }

    if (options.enableFile && options.filePath) {
      this.addTransport(new FileTransport(options.filePath, options.maxFileSize));
    }
  }

  debug(message: string, context: Record<string, any> = {}): void {
    this.log('debug', message, undefined, context);
  }

  info(message: string, context: Record<string, any> = {}): void {
    this.log('info', message, undefined, context);
  }

  warn(message: string, context: Record<string, any> = {}): void {
    this.log('warn', message, undefined, context);
  }

  error(message: string, error?: Error, context: Record<string, any> = {}): void {
    this.log('error', message, error, context);
  }

  fatal(message: string, error?: Error, context: Record<string, any> = {}): void {
    this.log('fatal', message, error, context);
  }

  child(context: Record<string, any>): StructuredLogger {
    return new StructuredLogger({
      level: this.level,
      context: { ...this.context, ...context }
    });
  }

  withContext(context: Record<string, any>): StructuredLogger {
    const logger = this.child(context);
    // 复制传输器
    logger.transports = [...this.transports];
    return logger;
  }

  batch(entries: LogEntry[]): void {
    this.batchEntries.push(...entries);

    if (this.batchEntries.length >= this.batchSize) {
      this.flushBatch();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flushBatch(), this.batchTimeout);
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  removeTransport(name: string): void {
    this.transports = this.transports.filter(t => t.name !== name);
  }

  // ============= 链路追踪支持 =============

  withTrace(traceId: string, spanId?: string): StructuredLogger {
    return this.withContext({ traceId, spanId });
  }

  // ============= 内部方法 =============

  private log(
    level: LogLevel,
    message: string,
    error?: Error,
    context: Record<string, any> = {}
  ): void {
    // 检查日志级别
    if (this.levelNumbers[level] < this.levelNumbers[this.level]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context: { ...this.context, ...context },
      error,
      traceId: context.traceId || this.context.traceId,
      spanId: context.spanId || this.context.spanId,
      metadata: {
        hostname: (typeof process !== 'undefined' && process?.env) ? (process.env.HOSTNAME ?? 'browser') : 'browser',
        pid: (typeof process !== 'undefined' && typeof process.pid === 'number') ? process.pid : 0,
        version: '1.0.0'
      }
    };

    this.writeEntry(entry);
  }

  private async writeEntry(entry: LogEntry): Promise<void> {
    const promises = this.transports.map(transport =>
      transport.write(entry).catch(error => {
        // 避免日志系统本身的错误导致应用崩溃
        console.error(`Log transport ${transport.name} error:`, error);
      })
    );

    await Promise.allSettled(promises);
  }

  private flushBatch(): void {
    if (this.batchEntries.length === 0) return;

    const entriesToFlush = [...this.batchEntries];
    this.batchEntries = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    // 异步写入批量日志
    Promise.allSettled(
      entriesToFlush.map(entry => this.writeEntry(entry))
    ).catch(error => {
      console.error('Batch log flush error:', error);
    });
  }

  /**
   * 销毁日志器
   */
  destroy(): void {
    this.flushBatch();
    this.transports = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
  }
}
