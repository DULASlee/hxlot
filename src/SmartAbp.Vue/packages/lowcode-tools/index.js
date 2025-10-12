/**
 * 🔧 SmartAbp 低代码工具模块
 *
 * 📦 包名: @smartabp/lowcode-tools
 * 🎯 定位: **独立工具层** - 为packages提供独立的工具函数
 * 🌉 架构: 完全独立，不依赖主应用
 *
 * ⚡ 核心职责:
 * - 提供独立的日志、事件工具
 * - 不依赖主应用的任何代码
 * - 保证packages可独立构建
 *
 * 🚨 架构约束:
 * - ✅ 完全独立实现
 * - ✅ 可以依赖 @smartabp/lowcode-shared
 * - ❌ 严禁使用 @/ 别名
 * - ❌ 严禁导出Node.js专用工具到浏览器环境
 */

// ===== 日志工具导出 =====
/**
 * 📝 日志系统（独立实现）
 */
export const logger = {
  info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
  debug: (message, ...args) => console.debug(`[DEBUG] ${message}`, ...args),
  fatal: (message, ...args) => console.error(`[FATAL] ${message}`, ...args),
  success: (message, ...args) => console.log(`[SUCCESS] ✅ ${message}`, ...args)
};

/**
 * 组件专用日志创建器
 */
export const createComponentLogger = (componentName) => ({
  info: (message, ...args) => logger.info(`[${componentName}] ${message}`, ...args),
  warn: (message, ...args) => logger.warn(`[${componentName}] ${message}`, ...args),
  error: (message, ...args) => logger.error(`[${componentName}] ${message}`, ...args),
  debug: (message, ...args) => logger.debug(`[${componentName}] ${message}`, ...args)
});

// ===== 事件总线导出 =====
/**
 * 📡 简化版事件总线（独立实现）
 */
export const eventBus = {
  events: new Map(),
  
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  },
  
  off(event, callback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  },
  
  emit(event, ...args) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }
};

// ===== 包信息导出 =====
export const LOWCODE_TOOLS_VERSION = '1.0.0';

export const PACKAGE_INFO = {
  name: '@smartabp/lowcode-tools',
  version: LOWCODE_TOOLS_VERSION,
  description: 'SmartAbp LowCode Engine Tools - Independent Utilities',
  role: 'independent-tools',
  author: 'SmartAbp Team'
};

// 默认导出（保持向后兼容）
export default PACKAGE_INFO;
