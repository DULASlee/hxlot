/**
 * 全局错误处理器
 * 统一处理应用中的所有错误，提供错误分类、恢复策略和监控上报
 */

// import { getGlobalMemoryMonitor } from '../memory/GlobalMemoryMonitor';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'network' | 'validation' | 'business' | 'system' | 'ui' | 'unknown';
export type RecoveryStrategy = 'retry' | 'fallback' | 'redirect' | 'reload' | 'ignore';

/**
 * 错误上下文信息
 */
export interface ErrorContext {
  /** 用户ID */
  userId?: string;
  /** 会话ID */
  sessionId: string;
  /** 页面路径 */
  path: string;
  /** 用户代理 */
  userAgent: string;
  /** 时间戳 */
  timestamp: number;
  /** 组件名称 */
  componentName?: string;
  /** 操作名称 */
  operation?: string;
  /** 额外数据 */
  metadata?: Record<string, any>;
}

/**
 * 标准化错误信息
 */
export interface StandardError {
  /** 错误ID */
  id: string;
  /** 错误代码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 错误严重程度 */
  severity: ErrorSeverity;
  /** 错误分类 */
  category: ErrorCategory;
  /** 原始错误 */
  originalError: Error;
  /** 错误上下文 */
  context: ErrorContext;
  /** 错误堆栈 */
  stack?: string;
  /** 恢复策略 */
  recoveryStrategy: RecoveryStrategy;
  /** 是否已恢复 */
  recovered: boolean;
  /** 重试次数 */
  retryCount: number;
}

/**
 * 错误处理器选项
 */
export interface ErrorHandlerOptions {
  /** 是否启用自动恢复 */
  enableAutoRecovery: boolean;
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试延迟（毫秒） */
  retryDelay: number;
  /** 是否启用错误上报 */
  enableReporting: boolean;
  /** 上报延迟（毫秒） */
  reportingDelay: number;
  /** 是否在开发模式下显示详细错误 */
  showDetailedErrors: boolean;
}

/**
 * 错误恢复处理器
 */
export interface ErrorRecoveryHandler {
  /** 处理器名称 */
  name: string;
  /** 是否可以处理该错误 */
  canHandle: (error: StandardError) => boolean;
  /** 执行恢复操作 */
  recover: (error: StandardError) => Promise<boolean>;
  /** 优先级 */
  priority: number;
}

/**
 * 全局错误处理器
 */
export class GlobalErrorHandler {
  private errors: Map<string, StandardError> = new Map();
  private recoveryHandlers: ErrorRecoveryHandler[] = [];
  private options: ErrorHandlerOptions;
  private sessionId: string;
  private reportingQueue: StandardError[] = [];
  private reportingTimer?: number;

  constructor(options: Partial<ErrorHandlerOptions> = {}) {
    this.options = {
      enableAutoRecovery: true,
      maxRetries: 3,
      retryDelay: 1000,
      enableReporting: true,
      reportingDelay: 5000,
      showDetailedErrors: process.env.NODE_ENV === 'development',
      ...options
    };
    
    this.sessionId = this.generateSessionId();
    this.setupGlobalHandlers();
    this.startReportingTimer();
  }

  /**
   * 处理错误
   */
  async handleError(error: Error, context: Partial<ErrorContext> = {}): Promise<StandardError> {
    const standardError = this.standardizeError(error, context);
    
    // 存储错误
    this.errors.set(standardError.id, standardError);
    
    // 记录到控制台
    this.logError(standardError);
    
    // 尝试自动恢复
    if (this.options.enableAutoRecovery) {
      await this.attemptRecovery(standardError);
    }
    
    // 添加到上报队列
    if (this.options.enableReporting) {
      this.queueForReporting(standardError);
    }
    
    return standardError;
  }

  /**
   * 注册错误恢复处理器
   */
  registerRecoveryHandler(handler: ErrorRecoveryHandler): void {
    this.recoveryHandlers.push(handler);
    // 按优先级排序
    this.recoveryHandlers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recoveryRate: number;
  } {
    const errors = Array.from(this.errors.values());
    const total = errors.length;
    
    const byCategory: Record<ErrorCategory, number> = {
      network: 0,
      validation: 0,
      business: 0,
      system: 0,
      ui: 0,
      unknown: 0
    };
    
    const bySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    
    let recoveredCount = 0;
    
    errors.forEach(error => {
      byCategory[error.category]++;
      bySeverity[error.severity]++;
      if (error.recovered) recoveredCount++;
    });
    
    return {
      total,
      byCategory,
      bySeverity,
      recoveryRate: total > 0 ? recoveredCount / total : 0
    };
  }

  /**
   * 清理错误历史
   */
  clearErrors(olderThan?: number): void {
    if (!olderThan) {
      this.errors.clear();
      return;
    }
    
    const cutoff = Date.now() - olderThan;
    const entriesToDelete: string[] = [];
    this.errors.forEach((error, id) => {
      if (error.context.timestamp < cutoff) {
        entriesToDelete.push(id);
      }
    });
    entriesToDelete.forEach(id => this.errors.delete(id));
  }

  /**
   * 标准化错误
   */
  private standardizeError(error: Error, context: Partial<ErrorContext>): StandardError {
    const fullContext: ErrorContext = {
      sessionId: this.sessionId,
      path: window.location?.pathname || '/',
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      ...context
    };

    const standardError: StandardError = {
      id: this.generateErrorId(),
      code: this.extractErrorCode(error),
      message: error.message || 'Unknown error',
      severity: this.determineSeverity(error),
      category: this.categorizeError(error),
      originalError: error,
      context: fullContext,
      stack: error.stack,
      recoveryStrategy: this.determineRecoveryStrategy(error),
      recovered: false,
      retryCount: 0
    };

    return standardError;
  }

  /**
   * 尝试错误恢复
   */
  private async attemptRecovery(error: StandardError): Promise<void> {
    for (const handler of this.recoveryHandlers) {
      if (handler.canHandle(error)) {
        try {
          const recovered = await handler.recover(error);
          if (recovered) {
            error.recovered = true;
            console.log(`Error ${error.id} recovered by ${handler.name}`);
            break;
          }
        } catch (recoveryError) {
          console.warn(`Recovery handler ${handler.name} failed:`, recoveryError);
        }
      }
    }
  }

  /**
   * 记录错误到控制台
   */
  private logError(error: StandardError): void {
    const logLevel = this.getLogLevel(error.severity);
    const message = this.options.showDetailedErrors 
      ? `[${error.category}] ${error.message}\nContext: ${JSON.stringify(error.context, null, 2)}`
      : `[${error.category}] ${error.message}`;
    
    console[logLevel](message, error.originalError);
  }

  /**
   * 添加到上报队列
   */
  private queueForReporting(error: StandardError): void {
    this.reportingQueue.push(error);
  }

  /**
   * 启动上报定时器
   */
  private startReportingTimer(): void {
    if (this.options.enableReporting) {
      this.reportingTimer = window.setInterval(() => {
        this.flushReportingQueue();
      }, this.options.reportingDelay);
    }
  }

  /**
   * 刷新上报队列
   */
  private async flushReportingQueue(): Promise<void> {
    if (this.reportingQueue.length === 0) return;
    
    const errors = [...this.reportingQueue];
    this.reportingQueue = [];
    
    try {
      // 这里可以集成实际的错误上报服务
      await this.reportErrors(errors);
    } catch (reportingError) {
      console.warn('Failed to report errors:', reportingError);
      // 将错误重新加入队列，但限制重试次数
      this.reportingQueue.push(...errors.filter(e => e.retryCount < 3));
    }
  }

  /**
   * 上报错误到服务器
   */
  private async reportErrors(errors: StandardError[]): Promise<void> {
    // 模拟错误上报
    console.log(`Reporting ${errors.length} errors to monitoring service`);
    
    // 实际实现中，这里会调用错误监控服务的API
    // 例如：Sentry, LogRocket, 或自定义错误监控服务
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalHandlers(): void {
    // 处理未捕获的Promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new Error(event.reason?.message || 'Unhandled promise rejection'),
        { operation: 'promise_rejection' }
      );
    });

    // 处理全局JavaScript错误
    window.addEventListener('error', (event) => {
      this.handleError(
        new Error(event.message),
        { 
          operation: 'javascript_error',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        }
      );
    });
  }

  /**
   * 提取错误代码
   */
  private extractErrorCode(error: Error): string {
    // 尝试从错误中提取标准化的错误代码
    if ('code' in error) {
      return String(error.code);
    }
    
    // 根据错误类型生成代码
    if (error.name === 'TypeError') return 'TYPE_ERROR';
    if (error.name === 'ReferenceError') return 'REFERENCE_ERROR';
    if (error.name === 'NetworkError') return 'NETWORK_ERROR';
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * 确定错误严重程度
   */
  private determineSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    }
    
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'high';
    }
    
    if (message.includes('network') || message.includes('timeout')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * 错误分类
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('xhr')) {
      return 'network';
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'system';
    }
    
    return 'unknown';
  }

  /**
   * 确定恢复策略
   */
  private determineRecoveryStrategy(error: Error): RecoveryStrategy {
    const category = this.categorizeError(error);
    
    switch (category) {
      case 'network':
        return 'retry';
      case 'validation':
        return 'fallback';
      case 'ui':
        return 'reload';
      default:
        return 'ignore';
    }
  }

  /**
   * 获取日志级别
   */
  private getLogLevel(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'log';
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 销毁处理器
   */
  destroy(): void {
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer);
    }
    this.flushReportingQueue();
    this.errors.clear();
    this.recoveryHandlers = [];
  }
}

// 全局错误处理器实例
let globalErrorHandler: GlobalErrorHandler | null = null;

/**
 * 获取全局错误处理器
 */
export function getGlobalErrorHandler(): GlobalErrorHandler {
  if (!globalErrorHandler) {
    globalErrorHandler = new GlobalErrorHandler();
  }
  return globalErrorHandler;
}

/**
 * 便捷的错误处理函数
 */
export function handleError(error: Error, context?: Partial<ErrorContext>): Promise<StandardError> {
  return getGlobalErrorHandler().handleError(error, context);
}
