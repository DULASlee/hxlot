/**
 * 全局错误处理工具
 * 用途：统一处理API错误、网络错误、业务错误
 * 符合铁律2：控件完整性（友好的错误提示）
 */

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',        // 网络错误
  AUTH_ERROR = 'AUTH_ERROR',              // 认证错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',  // 验证错误
  BUSINESS_ERROR = 'BUSINESS_ERROR',      // 业务错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'         // 未知错误
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type: ErrorType
  message: string
  code?: string
  details?: any
}

/**
 * 解析API错误
 */
export function parseApiError(error: any): ErrorInfo {
  // 网络错误
  if (!error.response) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: '网络连接失败，请检查网络设置',
      details: error
    }
  }

  // HTTP状态码错误
  const status = error.response.status
  const data = error.response.data

  // 401 认证错误
  if (status === 401) {
    return {
      type: ErrorType.AUTH_ERROR,
      message: '登录已过期，请重新登录',
      code: '401',
      details: data
    }
  }

  // 403 权限错误
  if (status === 403) {
    return {
      type: ErrorType.AUTH_ERROR,
      message: '您没有权限执行此操作',
      code: '403',
      details: data
    }
  }

  // 400 验证错误
  if (status === 400) {
    const errorMessage = data?.error?.message || '请求参数错误'
    return {
      type: ErrorType.VALIDATION_ERROR,
      message: errorMessage,
      code: '400',
      details: data?.error?.validationErrors || data
    }
  }

  // 404 资源不存在
  if (status === 404) {
    return {
      type: ErrorType.BUSINESS_ERROR,
      message: '请求的资源不存在',
      code: '404',
      details: data
    }
  }

  // 500 服务器错误
  if (status >= 500) {
    return {
      type: ErrorType.BUSINESS_ERROR,
      message: '服务器错误，请稍后重试',
      code: status.toString(),
      details: data
    }
  }

  // ABP框架错误格式
  if (data?.error) {
    return {
      type: ErrorType.BUSINESS_ERROR,
      message: data.error.message || '操作失败',
      code: data.error.code,
      details: data.error.details
    }
  }

  // 默认错误
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: error.message || '未知错误',
    details: error
  }
}

/**
 * 显示错误提示（Toast）
 */
export function showErrorToast(error: any) {
  const errorInfo = parseApiError(error)
  
  uni.showToast({
    title: errorInfo.message,
    icon: 'none',
    duration: 2000
  })
  
  console.error('[ErrorHandler]', errorInfo)
}

/**
 * 显示错误弹窗（Modal）
 */
export function showErrorModal(error: any, title = '操作失败') {
  const errorInfo = parseApiError(error)
  
  uni.showModal({
    title,
    content: errorInfo.message,
    showCancel: false,
    confirmText: '知道了'
  })
  
  console.error('[ErrorHandler]', errorInfo)
}

/**
 * 处理认证错误（跳转到登录页）
 */
export function handleAuthError() {
  uni.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none',
    duration: 2000
  })
  
  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/login/login'
    })
  }, 2000)
}

/**
 * 全局错误处理器（根据错误类型自动处理）
 */
export function handleError(error: any, showModal = false) {
  const errorInfo = parseApiError(error)
  
  // 认证错误：跳转登录
  if (errorInfo.type === ErrorType.AUTH_ERROR) {
    handleAuthError()
    return
  }
  
  // 其他错误：显示提示
  if (showModal) {
    showErrorModal(error)
  } else {
    showErrorToast(error)
  }
}

