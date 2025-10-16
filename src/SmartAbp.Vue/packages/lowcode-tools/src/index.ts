/**
 * 🔧 SmartAbp 低代码工具模块
 *
 * 📦 包名: @smartabp/lowcode-tools
 * 🎯 定位: **桥接层** - 连接主应用与packages
 * 🌉 角色: 作为唯一允许使用@/别名的package
 *
 * ⚡ 核心职责:
 * - 封装主应用工具函数供packages使用
 * - 提供日志、事件、性能等通用工具
 * - 桥接主应用API服务
 *
 * 🚨 架构约束:
 * - ✅ 允许使用 @/ 别名（唯一白名单）
 * - ✅ 可以依赖 @smartabp/lowcode-shared
 * - ❌ 严禁相对路径引用
 * - ❌ 严禁导出Node.js专用工具到浏览器环境
 *
 * 📝 注意: 使用`/index.js`而非`.ts`因为需要在构建前可用
 */

// ===== 日志工具导出 =====
/**
 * 📝 日志系统
 * - logger: 全局日志实例
 * - createComponentLogger: 组件专用日志创建器
 */
// 简化版日志工具（独立实现，不依赖主应用）
export const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.debug(`[DEBUG] ${message}`, ...args),
  fatal: (message: string, ...args: any[]) => console.error(`[FATAL] ${message}`, ...args),
  success: (message: string, ...args: any[]) => console.log(`[SUCCESS] ✅ ${message}`, ...args)
};

/**
 * 创建组件专用日志器
 * @param componentName 组件名称
 * @returns 组件专用日志实例
 */
export function createComponentLogger(componentName: string) {
  return {
    info: (message: string, ...args: any[]) => console.log(`[${componentName}] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => console.warn(`[${componentName}] ${message}`, ...args),
    error: (message: string, ...args: any[]) => console.error(`[${componentName}] ${message}`, ...args),
    debug: (message: string, ...args: any[]) => console.debug(`[${componentName}] ${message}`, ...args),
    fatal: (message: string, ...args: any[]) => console.error(`[${componentName}] FATAL: ${message}`, ...args),
    success: (message: string, ...args: any[]) => console.log(`[${componentName}] ✅ ${message}`, ...args)
  };
}

// ===== 事件总线导出 =====
/**
 * 📡 简化版事件总线（独立实现）
 */
export const eventBus = {
  events: new Map<string, Function[]>(),

  on(event: string, callback: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  },

  off(event: string, callback: Function) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  },

  emit(event: string, ...args: any[]) {
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
  description: 'SmartAbp LowCode Engine Tools - Bridge Layer between Main App and Packages',
  role: 'bridge-layer',
  permissions: ['@/-alias-allowed'],
  author: 'SmartAbp Team'
} as const;

// 默认导出（保持向后兼容）
export default PACKAGE_INFO;
