/**
 * 🔧 统一日志器接口定义
 * 
 * 为packages提供标准化的logger类型定义，避免使用any
 */

export interface ILogger {
  debug(message: string, ...args: unknown[]): void
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, error?: Error | unknown, ...args: unknown[]): void
  fatal(message: string, error?: Error | unknown, ...args: unknown[]): void
  success?(message: string, ...args: unknown[]): void
}

/**
 * 从globalThis获取logger实例的类型安全方法
 * 主应用会通过lowcode-tools桥接层注入logger到globalThis
 */
export function getGlobalLogger(): ILogger {
  const globalWithLogger = globalThis as typeof globalThis & {
    __SMARTABP_LOGGER__?: ILogger
  }
  
  // 如果有注入的logger，直接返回
  if (globalWithLogger.__SMARTABP_LOGGER__) {
    return globalWithLogger.__SMARTABP_LOGGER__
  }
  
  // 否则返回兼容console的适配器
  return {
    debug: (message: string, ...args: unknown[]) => console.debug(message, ...args),
    info: (message: string, ...args: unknown[]) => console.info(message, ...args),
    warn: (message: string, ...args: unknown[]) => console.warn(message, ...args),
    error: (message: string, error?: Error | unknown, ...args: unknown[]) => 
      console.error(message, error, ...args),
    fatal: (message: string, error?: Error | unknown, ...args: unknown[]) => 
      console.error('[FATAL]', message, error, ...args),
    success: (message: string, ...args: unknown[]) => 
      console.log('[SUCCESS]', message, ...args)
  }
}

/**
 * 创建组件专用logger的工厂函数
 */
export function createComponentLogger(componentName: string): ILogger {
  const baseLogger = getGlobalLogger()
  
  return {
    debug: (message: string, ...args: unknown[]) => 
      baseLogger.debug(`[${componentName}] ${message}`, ...args),
    info: (message: string, ...args: unknown[]) => 
      baseLogger.info(`[${componentName}] ${message}`, ...args),
    warn: (message: string, ...args: unknown[]) => 
      baseLogger.warn(`[${componentName}] ${message}`, ...args),
    error: (message: string, error?: Error | unknown, ...args: unknown[]) => 
      baseLogger.error(`[${componentName}] ${message}`, error, ...args),
    fatal: (message: string, error?: Error | unknown, ...args: unknown[]) => 
      baseLogger.fatal(`[${componentName}] ${message}`, error, ...args),
    success: (message: string, ...args: unknown[]) => 
      baseLogger.success?.(`[${componentName}] ${message}`, ...args) || 
      baseLogger.info(`[${componentName}] ✅ ${message}`, ...args)
  }
}

