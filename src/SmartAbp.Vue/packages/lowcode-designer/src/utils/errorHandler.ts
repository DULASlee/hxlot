/**
 * 全局错误处理与恢复机制
 * 
 * 功能：
 * - 全局错误捕获
 * - 错误日志记录
 * - 自动恢复机制
 * - 用户友好提示
 */

import { ElMessage, ElMessageBox } from 'element-plus'

// ==================== 错误类型 ====================

export enum ErrorType {
    NETWORK = 'network',
    VALIDATION = 'validation',
    PERMISSION = 'permission',
    BUSINESS = 'business',
    SYSTEM = 'system',
    UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    CRITICAL = 'critical'
}

export interface ErrorInfo {
    type: ErrorType
    severity: ErrorSeverity
    message: string
    code?: string
    details?: any
    stack?: string
    timestamp: Date
    url?: string
    component?: string
}

// ==================== 错误处理器 ====================

export class ErrorHandler {
    private static instance: ErrorHandler
    private errorLog: ErrorInfo[] = []
    private maxLogSize = 100
    private recoveryStrategies = new Map<ErrorType, (error: ErrorInfo) => Promise<boolean>>()

    private constructor() {
        this.initializeRecoveryStrategies()
        this.setupGlobalHandlers()
    }

    static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler()
        }
        return ErrorHandler.instance
    }

    // 初始化恢复策略
    private initializeRecoveryStrategies() {
        // 网络错误恢复
        this.recoveryStrategies.set(ErrorType.NETWORK, async (error) => {
            console.log('尝试恢复网络错误:', error.message)

            // 检查网络连接
            if (!navigator.onLine) {
                ElMessage.warning('网络连接已断开，请检查网络设置')
                return false
            }

            // 尝试重新请求
            if (error.details?.retry) {
                try {
                    await error.details.retry()
                    ElMessage.success('网络已恢复')
                    return true
                } catch {
                    return false
                }
            }

            return false
        })

        // 验证错误恢复
        this.recoveryStrategies.set(ErrorType.VALIDATION, async (error) => {
            ElMessage.warning(error.message)
            return false // 验证错误需要用户手动修复
        })

        // 权限错误恢复
        this.recoveryStrategies.set(ErrorType.PERMISSION, async (error) => {
            try {
                await ElMessageBox.confirm(
                    '您没有执行此操作的权限，是否重新登录？',
                    '权限不足',
                    {
                        type: 'warning',
                        confirmButtonText: '重新登录',
                        cancelButtonText: '取消'
                    }
                )

                // 跳转到登录页
                window.location.href = '/login'
                return true
            } catch {
                return false
            }
        })

        // 业务错误恢复
        this.recoveryStrategies.set(ErrorType.BUSINESS, async (error) => {
            ElMessage.error(error.message)
            return false // 业务错误需要用户处理
        })

        // 系统错误恢复
        this.recoveryStrategies.set(ErrorType.SYSTEM, async (error) => {
            console.error('系统错误:', error)

            try {
                await ElMessageBox.confirm(
                    '系统遇到错误，是否刷新页面？',
                    '系统错误',
                    {
                        type: 'error',
                        confirmButtonText: '刷新页面',
                        cancelButtonText: '取消'
                    }
                )

                window.location.reload()
                return true
            } catch {
                return false
            }
        })
    }

    // 设置全局错误处理器
    private setupGlobalHandlers() {
        // 捕获未处理的Promise错误
        window.addEventListener('unhandledrejection', (event) => {
            event.preventDefault()
            this.handleError({
                type: ErrorType.UNKNOWN,
                severity: ErrorSeverity.ERROR,
                message: event.reason?.message || '未处理的Promise错误',
                details: event.reason,
                stack: event.reason?.stack,
                timestamp: new Date()
            })
        })

        // 捕获全局JavaScript错误
        window.addEventListener('error', (event) => {
            event.preventDefault()
            this.handleError({
                type: ErrorType.SYSTEM,
                severity: ErrorSeverity.ERROR,
                message: event.message || '脚本错误',
                details: {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                },
                stack: event.error?.stack,
                timestamp: new Date()
            })
        })

        // 捕获Vue错误（需要在Vue应用中配置）
        // app.config.errorHandler = (err, instance, info) => {
        //   this.handleError({
        //     type: ErrorType.SYSTEM,
        //     severity: ErrorSeverity.ERROR,
        //     message: err.message,
        //     component: instance?.$options.name,
        //     details: { info },
        //     stack: err.stack,
        //     timestamp: new Date()
        //   })
        // }
    }

    // 处理错误
    async handleError(error: ErrorInfo): Promise<boolean> {
        // 记录错误
        this.logError(error)

        // 显示用户友好的错误消息
        this.showUserMessage(error)

        // 尝试自动恢复
        const strategy = this.recoveryStrategies.get(error.type)
        if (strategy) {
            try {
                const recovered = await strategy(error)
                if (recovered) {
                    console.log('错误已自动恢复:', error.message)
                    return true
                }
            } catch (recoveryError) {
                console.error('恢复失败:', recoveryError)
            }
        }

        return false
    }

    // 记录错误
    private logError(error: ErrorInfo) {
        this.errorLog.push(error)

        // 限制日志大小
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift()
        }

        // 发送到服务器（可选）
        this.sendToServer(error)
    }

    // 显示用户消息
    private showUserMessage(error: ErrorInfo) {
        const message = this.getUserFriendlyMessage(error)

        switch (error.severity) {
            case ErrorSeverity.INFO:
                ElMessage.info(message)
                break
            case ErrorSeverity.WARNING:
                ElMessage.warning(message)
                break
            case ErrorSeverity.ERROR:
                ElMessage.error(message)
                break
            case ErrorSeverity.CRITICAL:
                ElMessageBox.alert(message, '严重错误', {
                    type: 'error',
                    confirmButtonText: '确定'
                })
                break
        }
    }

    // 获取用户友好的错误消息
    private getUserFriendlyMessage(error: ErrorInfo): string {
        const messages: Record<ErrorType, string> = {
            [ErrorType.NETWORK]: '网络连接失败，请检查网络设置',
            [ErrorType.VALIDATION]: error.message || '输入数据不符合要求',
            [ErrorType.PERMISSION]: '您没有执行此操作的权限',
            [ErrorType.BUSINESS]: error.message || '操作失败，请稍后重试',
            [ErrorType.SYSTEM]: '系统遇到错误，请稍后重试',
            [ErrorType.UNKNOWN]: '发生未知错误，请联系管理员'
        }

        return messages[error.type] || error.message
    }

    // 发送错误到服务器
    private async sendToServer(error: ErrorInfo) {
        // 只发送严重错误
        if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.ERROR) {
            try {
                // TODO: 实现实际的错误上报API
                console.log('发送错误到服务器:', error)
                // await fetch('/api/errors/report', {
                //   method: 'POST',
                //   headers: { 'Content-Type': 'application/json' },
                //   body: JSON.stringify(error)
                // })
            } catch (err) {
                console.error('错误上报失败:', err)
            }
        }
    }

    // 获取错误日志
    getErrorLog(): ErrorInfo[] {
        return [...this.errorLog]
    }

    // 清空错误日志
    clearErrorLog() {
        this.errorLog = []
    }

    // 注册自定义恢复策略
    registerRecoveryStrategy(type: ErrorType, strategy: (error: ErrorInfo) => Promise<boolean>) {
        this.recoveryStrategies.set(type, strategy)
    }
}

// ==================== 错误边界组件辅助 ====================

export interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

export function createErrorBoundary() {
    const state: ErrorBoundaryState = {
        hasError: false,
        error: null,
        errorInfo: null
    }

    const captureError = (error: Error, component?: string) => {
        state.hasError = true
        state.error = error
        state.errorInfo = {
            type: ErrorType.SYSTEM,
            severity: ErrorSeverity.ERROR,
            message: error.message,
            component,
            stack: error.stack,
            timestamp: new Date()
        }

        ErrorHandler.getInstance().handleError(state.errorInfo)
    }

    const reset = () => {
        state.hasError = false
        state.error = null
        state.errorInfo = null
    }

    return {
        state,
        captureError,
        reset
    }
}

// ==================== 工具函数 ====================

/**
 * 安全执行异步函数
 */
export async function safeAsync<T>(
    fn: () => Promise<T>,
    errorType: ErrorType = ErrorType.UNKNOWN
): Promise<T | null> {
    try {
        return await fn()
    } catch (error) {
        ErrorHandler.getInstance().handleError({
            type: errorType,
            severity: ErrorSeverity.ERROR,
            message: (error as Error).message,
            details: error,
            stack: (error as Error).stack,
            timestamp: new Date()
        })
        return null
    }
}

/**
 * 安全执行同步函数
 */
export function safeSync<T>(
    fn: () => T,
    errorType: ErrorType = ErrorType.UNKNOWN
): T | null {
    try {
        return fn()
    } catch (error) {
        ErrorHandler.getInstance().handleError({
            type: errorType,
            severity: ErrorSeverity.ERROR,
            message: (error as Error).message,
            details: error,
            stack: (error as Error).stack,
            timestamp: new Date()
        })
        return null
    }
}

/**
 * 创建错误
 */
export function createError(
    type: ErrorType,
    message: string,
    details?: any
): ErrorInfo {
    return {
        type,
        severity: ErrorSeverity.ERROR,
        message,
        details,
        timestamp: new Date()
    }
}

// ==================== 导出 ====================

export default ErrorHandler.getInstance()

