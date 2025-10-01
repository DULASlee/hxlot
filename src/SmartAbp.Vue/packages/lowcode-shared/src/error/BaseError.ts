/**
 * 统一错误基类
 * 
 * 提供企业级错误处理基础设施，包括：
 * - 错误分类和严重性管理
 * - 错误上下文和元数据
 * - 错误链追踪
 * - 错误序列化和反序列化
 * - 错误恢复建议
 */

/**
 * 错误分类
 */
export enum ErrorCategory {
  /** 验证错误 */
  VALIDATION = 'VALIDATION',
  /** 业务逻辑错误 */
  BUSINESS = 'BUSINESS',
  /** 网络错误 */
  NETWORK = 'NETWORK',
  /** 权限错误 */
  PERMISSION = 'PERMISSION',
  /** 系统错误 */
  SYSTEM = 'SYSTEM',
  /** 未知错误 */
  UNKNOWN = 'UNKNOWN'
}

/**
 * 错误严重性
 */
export enum ErrorSeverity {
  /** 低 - 可忽略的警告 */
  LOW = 'LOW',
  /** 中 - 需要注意 */
  MEDIUM = 'MEDIUM',
  /** 高 - 需要处理 */
  HIGH = 'HIGH',
  /** 严重 - 需要立即处理 */
  CRITICAL = 'CRITICAL'
}

/**
 * 错误上下文接口
 */
export interface ErrorContext {
  /** 用户ID */
  userId?: string
  /** 用户名 */
  userName?: string
  /** 组件名称 */
  component?: string
  /** 操作名称 */
  action?: string
  /** 请求ID */
  requestId?: string
  /** 会话ID */
  sessionId?: string
  /** 时间戳 */
  timestamp?: number
  /** 浏览器信息 */
  userAgent?: string
  /** URL */
  url?: string
  /** 路由路径 */
  route?: string
  /** 额外详情 */
  details?: Record<string, unknown>
}

/**
 * 错误恢复建议
 */
export interface ErrorRecoverySuggestion {
  /** 建议类型 */
  type: 'retry' | 'refresh' | 'navigate' | 'contact' | 'ignore' | 'custom'
  /** 建议描述 */
  description: string
  /** 自动执行动作 */
  action?: () => void | Promise<void>
  /** 导航目标（用于navigate类型） */
  navigateTo?: string
  /** 等待时间（用于retry类型，毫秒） */
  retryAfter?: number
}

/**
 * 序列化错误数据
 */
export interface SerializedError {
  /** 错误名称 */
  name: string
  /** 错误消息 */
  message: string
  /** 错误代码 */
  code?: string
  /** 错误分类 */
  category: ErrorCategory
  /** 严重性 */
  severity: ErrorSeverity
  /** 上下文 */
  context?: ErrorContext
  /** 堆栈跟踪 */
  stack?: string
  /** 原始错误 */
  originalError?: {
    name: string
    message: string
    stack?: string
  }
  /** 恢复建议 */
  recoverySuggestions?: ErrorRecoverySuggestion[]
  /** 时间戳 */
  timestamp: number
}

/**
 * 统一错误基类
 * 
 * 所有自定义错误都应该继承此类
 */
export abstract class BaseError extends Error {
  /** 错误代码 */
  public readonly code?: string

  /** 错误分类 */
  public readonly category: ErrorCategory

  /** 严重性 */
  public readonly severity: ErrorSeverity

  /** 错误上下文 */
  public readonly context?: ErrorContext

  /** 原始错误（如果是包装错误） */
  public readonly originalError?: Error

  /** 恢复建议 */
  public readonly recoverySuggestions: ErrorRecoverySuggestion[]

  /** 错误创建时间戳 */
  public readonly timestamp: number

  /** 错误是否已被处理 */
  private _handled: boolean = false

  /**
   * 构造函数
   */
  constructor(
    message: string,
    options?: {
      code?: string
      category?: ErrorCategory
      severity?: ErrorSeverity
      context?: ErrorContext
      originalError?: Error
      recoverySuggestions?: ErrorRecoverySuggestion[]
    }
  ) {
    super(message)

    // 设置正确的原型链
    Object.setPrototypeOf(this, new.target.prototype)

    // 设置错误名称为类名
    this.name = this.constructor.name

    // 捕获堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }

    // 设置属性
    this.code = options?.code
    this.category = options?.category ?? ErrorCategory.UNKNOWN
    this.severity = options?.severity ?? ErrorSeverity.MEDIUM
    this.context = options?.context
    this.originalError = options?.originalError
    this.recoverySuggestions = options?.recoverySuggestions ?? []
    this.timestamp = Date.now()
  }

  /**
   * 标记错误已处理
   */
  public markAsHandled(): void {
    this._handled = true
  }

  /**
   * 检查错误是否已处理
   */
  public isHandled(): boolean {
    return this._handled
  }

  /**
   * 添加恢复建议
   */
  public addRecoverySuggestion(suggestion: ErrorRecoverySuggestion): void {
    this.recoverySuggestions.push(suggestion)
  }

  /**
   * 序列化错误为JSON
   */
  public toJSON(): SerializedError {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      severity: this.severity,
      context: this.context,
      stack: this.stack,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack
          }
        : undefined,
      recoverySuggestions: this.recoverySuggestions,
      timestamp: this.timestamp
    }
  }

  /**
   * 转换为字符串
   */
  public toString(): string {
    let result = `[${this.category}/${this.severity}] ${this.name}: ${this.message}`

    if (this.code) {
      result += ` (${this.code})`
    }

    if (this.context) {
      const contextInfo: string[] = []
      if (this.context.component) contextInfo.push(`Component: ${this.context.component}`)
      if (this.context.action) contextInfo.push(`Action: ${this.context.action}`)
      if (contextInfo.length > 0) {
        result += ` [${contextInfo.join(', ')}]`
      }
    }

    return result
  }

  /**
   * 从序列化数据恢复错误
   */
  public static fromJSON(data: SerializedError): BaseError {
    // 这里创建一个通用的BaseError实例
    // 子类应该重写此方法以创建正确的类型
    return new GenericError(data.message, {
      code: data.code,
      category: data.category,
      severity: data.severity,
      context: data.context,
      recoverySuggestions: data.recoverySuggestions
    })
  }

  /**
   * 检查是否为BaseError实例
   */
  public static isBaseError(error: unknown): error is BaseError {
    return error instanceof BaseError
  }

  /**
   * 包装任意错误为BaseError
   */
  public static wrap(
    error: unknown,
    options?: {
      message?: string
      category?: ErrorCategory
      severity?: ErrorSeverity
      context?: ErrorContext
    }
  ): BaseError {
    if (BaseError.isBaseError(error)) {
      return error
    }

    const originalError = error instanceof Error ? error : new Error(String(error))
    const message = options?.message ?? originalError.message

    return new GenericError(message, {
      category: options?.category,
      severity: options?.severity,
      context: options?.context,
      originalError
    })
  }
}

/**
 * 通用错误类（用于未分类的错误）
 */
export class GenericError extends BaseError {
  constructor(
    message: string,
    options?: {
      code?: string
      category?: ErrorCategory
      severity?: ErrorSeverity
      context?: ErrorContext
      originalError?: Error
      recoverySuggestions?: ErrorRecoverySuggestion[]
    }
  ) {
    super(message, {
      ...options,
      category: options?.category ?? ErrorCategory.UNKNOWN
    })
  }
}

/**
 * 验证错误
 */
export class ValidationError extends BaseError {
  /** 验证失败的字段 */
  public readonly field?: string

  /** 验证规则 */
  public readonly rule?: string

  constructor(
    message: string,
    options?: {
      code?: string
      field?: string
      rule?: string
      context?: ErrorContext
      recoverySuggestions?: ErrorRecoverySuggestion[]
    }
  ) {
    super(message, {
      ...options,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW
    })

    this.field = options?.field
    this.rule = options?.rule
  }

  public override toJSON(): SerializedError & { field?: string; rule?: string } {
    return {
      ...super.toJSON(),
      field: this.field,
      rule: this.rule
    }
  }
}

/**
 * 业务逻辑错误
 */
export class BusinessError extends BaseError {
  constructor(
    message: string,
    options?: {
      code?: string
      severity?: ErrorSeverity
      context?: ErrorContext
      recoverySuggestions?: ErrorRecoverySuggestion[]
    }
  ) {
    super(message, {
      ...options,
      category: ErrorCategory.BUSINESS,
      severity: options?.severity ?? ErrorSeverity.MEDIUM
    })
  }
}

/**
 * 网络错误
 */
export class NetworkError extends BaseError {
  /** HTTP状态码 */
  public readonly statusCode?: number

  /** 请求URL */
  public readonly url?: string

  constructor(
    message: string,
    options?: {
      code?: string
      statusCode?: number
      url?: string
      severity?: ErrorSeverity
      context?: ErrorContext
      originalError?: Error
      recoverySuggestions?: ErrorRecoverySuggestion[]
    }
  ) {
    super(message, {
      ...options,
      category: ErrorCategory.NETWORK,
      severity: options?.severity ?? ErrorSeverity.HIGH
    })

    this.statusCode = options?.statusCode
    this.url = options?.url
  }

  public override toJSON(): SerializedError & { statusCode?: number; url?: string } {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      url: this.url
    }
  }
}

/**
 * 权限错误
 */
export class PermissionError extends BaseError {
  /** 所需权限 */
  public readonly requiredPermission?: string

  /** 当前权限 */
  public readonly currentPermissions?: string[]

  constructor(
    message: string,
    options?: {
      code?: string
      requiredPermission?: string
      currentPermissions?: string[]
      context?: ErrorContext
      recoverySuggestions?: ErrorRecoverySuggestion[]
    }
  ) {
    super(message, {
      ...options,
      category: ErrorCategory.PERMISSION,
      severity: ErrorSeverity.HIGH
    })

    this.requiredPermission = options?.requiredPermission
    this.currentPermissions = options?.currentPermissions
  }

  public override toJSON(): SerializedError & {
    requiredPermission?: string
    currentPermissions?: string[]
  } {
    return {
      ...super.toJSON(),
      requiredPermission: this.requiredPermission,
      currentPermissions: this.currentPermissions
    }
  }
}

/**
 * 系统错误
 */
export class SystemError extends BaseError {
  constructor(
    message: string,
    options?: {
      code?: string
      context?: ErrorContext
      originalError?: Error
      recoverySuggestions?: ErrorRecoverySuggestion[]
    }
  ) {
    super(message, {
      ...options,
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.CRITICAL
    })
  }
}
