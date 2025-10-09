/**
 * 错误处理与日志系统深度集成
 * 将GlobalErrorHandler与现有日志系统无缝集成，提供统一的错误日志记录
 */

import { GlobalErrorHandler, type ErrorCategory, type ErrorSeverity, type StandardError } from './error/GlobalErrorHandler';

// 集成接口定义
export interface ErrorLogEntry {
  /** 错误ID */
  errorId: string;
  /** 日志级别 */
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  /** 错误消息 */
  message: string;
  /** 错误分类 */
  category: ErrorCategory;
  /** 错误严重程度 */
  severity: ErrorSeverity;
  /** 错误上下文 */
  context: Record<string, any>;
  /** 错误堆栈 */
  stack?: string;
  /** 恢复状态 */
  recoveryInfo?: {
    attempted: boolean;
    successful: boolean;
    strategy: string;
    retryCount: number;
  };
  /** 时间戳 */
  timestamp: number;
}

/**
 * 错误日志集成器
 * 负责将错误处理系统与日志系统进行深度集成
 */
export class ErrorLogIntegration {
  private errorHandler: GlobalErrorHandler;
  private logger: any; // 引用现有的日志系统

  constructor(errorHandler: GlobalErrorHandler, logger: any) {
    this.errorHandler = errorHandler;
    this.logger = logger;
    this.setupErrorLogging();
  }

  /**
   * 设置错误日志记录
   */
  private setupErrorLogging(): void {
    // 监听错误处理器的错误事件并记录到日志
    this.hookIntoErrorHandler();
  }

  /**
   * 钩入错误处理器
   */
  private hookIntoErrorHandler(): void {
    // 扩展错误处理器以包含日志记录
    const originalHandleError = this.errorHandler.handleError.bind(this.errorHandler);

    this.errorHandler.handleError = async (error: Error, context = {}) => {
      const standardError = await originalHandleError(error, context);

      // 记录错误到日志系统
      await this.logError(standardError);

      return standardError;
    };
  }

  /**
   * 记录错误到日志系统
   */
  private async logError(error: StandardError): Promise<void> {
    const errorLogEntry: ErrorLogEntry = {
      errorId: error.id,
      logLevel: this.mapSeverityToLogLevel(error.severity),
      message: error.message,
      category: error.category,
      severity: error.severity,
      context: {
        ...error.context,
        code: error.code,
        originalError: error.originalError.name,
      },
      stack: error.stack,
      recoveryInfo: {
        attempted: error.recoveryStrategy !== 'ignore',
        successful: error.recovered,
        strategy: error.recoveryStrategy,
        retryCount: error.retryCount,
      },
      timestamp: error.context.timestamp,
    };

    // 使用现有日志系统记录
    if (this.logger) {
      this.logger[errorLogEntry.logLevel](
        `[ERROR:${error.category.toUpperCase()}] ${error.message}`,
        {
          errorId: error.id,
          category: error.category,
          severity: error.severity,
          context: errorLogEntry.context,
          recovery: errorLogEntry.recoveryInfo,
          stack: error.stack,
        }
      );
    }

    // 如果是严重错误，发送到监控系统
    if (error.severity === 'critical' || error.severity === 'high') {
      await this.reportCriticalError(errorLogEntry);
    }
  }

  /**
   * 将错误严重程度映射到日志级别
   */
  private mapSeverityToLogLevel(severity: ErrorSeverity): 'debug' | 'info' | 'warn' | 'error' | 'fatal' {
    switch (severity) {
      case 'critical':
        return 'fatal';
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      case 'low':
        return 'info';
      default:
        return 'debug';
    }
  }

  /**
   * 上报严重错误
   */
  private async reportCriticalError(errorLog: ErrorLogEntry): Promise<void> {
    try {
      // 这里可以集成外部监控服务，如 Sentry, Datadog 等
      console.warn('🚨 Critical Error Detected:', {
        errorId: errorLog.errorId,
        message: errorLog.message,
        category: errorLog.category,
        timestamp: new Date(errorLog.timestamp).toISOString(),
      });

      // 实际实现中可以调用监控API
      // await monitoringService.reportCriticalError(errorLog);
    } catch (reportError) {
      // 避免报告错误时产生循环
      console.error('Failed to report critical error:', reportError);
    }
  }

  /**
   * 获取错误日志统计
   */
  getErrorLogStats(): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    recoveryRate: number;
    criticalErrorsLast24h: number;
  } {
    const errorStats = this.errorHandler.getErrorStats();

    // 计算过去24小时的严重错误数量
    // const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentCriticalErrors = 0; // 这里需要从日志系统查询

    return {
      totalErrors: errorStats.total,
      errorsByCategory: errorStats.byCategory,
      errorsBySeverity: errorStats.bySeverity,
      recoveryRate: errorStats.recoveryRate,
      criticalErrorsLast24h: recentCriticalErrors,
    };
  }

  /**
   * 清理过期的错误日志
   */
  async cleanupOldErrorLogs(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    // 清理错误处理器中的过期错误
    this.errorHandler.clearErrors(maxAgeMs);

    // 通知日志系统清理相关日志
    if (this.logger && typeof this.logger.cleanup === 'function') {
      await this.logger.cleanup(maxAgeMs);
    }
  }

  /**
   * 导出错误日志报告
   */
  async exportErrorReport(
    startTime: number,
    endTime: number
  ): Promise<{
    reportId: string;
    period: { start: string; end: string };
    summary: any;
    errors: ErrorLogEntry[];
  }> {
    const reportId = `error-report-${Date.now()}`;
    const errors: ErrorLogEntry[] = []; // 这里需要从日志系统查询

    const summary = {
      totalErrors: errors.length,
      errorsByCategory: {} as Record<ErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      mostCommonErrors: this.getMostCommonErrors(errors),
      recoverySuccessRate: this.calculateRecoveryRate(errors),
    };

    return {
      reportId,
      period: {
        start: new Date(startTime).toISOString(),
        end: new Date(endTime).toISOString(),
      },
      summary,
      errors,
    };
  }

  /**
   * 获取最常见的错误
   */
  private getMostCommonErrors(errors: ErrorLogEntry[]): Array<{ message: string; count: number; category: ErrorCategory }> {
    const errorCounts = new Map<string, { count: number; category: ErrorCategory }>();

    errors.forEach(error => {
      const key = error.message;
      const existing = errorCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        errorCounts.set(key, { count: 1, category: error.category });
      }
    });

    return Array.from(errorCounts.entries())
      .map(([message, data]) => ({ message, count: data.count, category: data.category }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * 计算恢复成功率
   */
  private calculateRecoveryRate(errors: ErrorLogEntry[]): number {
    const errorsWithRecovery = errors.filter(e => e.recoveryInfo?.attempted);
    if (errorsWithRecovery.length === 0) return 0;

    const successful = errorsWithRecovery.filter(e => e.recoveryInfo?.successful).length;
    return successful / errorsWithRecovery.length;
  }

  /**
   * 销毁集成器
   */
  destroy(): void {
    // 恢复原始的错误处理方法
    // 这里需要保存原始方法的引用以便恢复
    // 实际实现中应该在构造函数中保存原始方法
  }
}

/**
 * 创建错误日志集成实例
 */
export function createErrorLogIntegration(
  errorHandler: GlobalErrorHandler,
  logger: any
): ErrorLogIntegration {
  return new ErrorLogIntegration(errorHandler, logger);
}

/**
 * 便捷函数：设置全局错误日志集成
 */
export function setupGlobalErrorLogging(logger: any): ErrorLogIntegration {
  // 假设有全局错误处理器
  const { getGlobalErrorHandler } = require('../error/GlobalErrorHandler');
  const errorHandler = getGlobalErrorHandler();

  return createErrorLogIntegration(errorHandler, logger);
}
