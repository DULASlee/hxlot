/**
 * 🎯 lowcode-tools 包导出文件
 * 🎯 低代码引擎核心功能 - 专注基础实现
 * ❌ 严禁添加AI智能辅助功能
 * ❌ 严禁添加多人协作功能
 * 📦 遵循packages目录架构 - 支持独立发包
 */
// 📊 日志工具
export const logger = {
    info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
    error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
    debug: (message, ...args) => console.debug(`[DEBUG] ${message}`, ...args),
    // 🔧 组件日志器
    child: (context) => ({
        info: (message, ...args) => console.log(`[${context.component}] ${message}`, ...args),
        error: (message, ...args) => console.error(`[${context.component}] ${message}`, ...args),
        warn: (message, ...args) => console.warn(`[${context.component}] ${message}`, ...args),
        debug: (message, ...args) => console.debug(`[${context.component}] ${message}`, ...args)
    })
};
// 🏭 创建组件日志器
export const createComponentLogger = (componentName) => {
    return logger.child({ component: componentName });
};
// ⚡ 事件总线
export const eventBus = {
    emit: (event, data) => {
        console.log(`[EVENT] ${event}`, data);
        // TODO: 实现真实的事件总线
    },
    on: (event, handler) => {
        console.log(`[LISTEN] ${event}`, handler);
        // TODO: 实现事件监听
    },
    off: (event, handler) => {
        console.log(`[UNLISTEN] ${event}`, handler);
        // TODO: 移除事件监听
    }
};
// 🔧 工具函数
export const utils = {
    // 字符串转换
    toCamelCase: (str) => {
        return str.charAt(0).toLowerCase() + str.slice(1);
    },
    toPascalCase: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    toSnakeCase: (str) => {
        return str.replace(/([A-Z])/g, '_$1').toLowerCase();
    },
    // ID生成
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    // 防抖
    debounce: (func, wait) => {
        let timeout;
        return ((...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(null, args), wait);
        });
    }
};
// 🎯 性能监控工具 (预留)
export const performanceMonitor = {
    mark: (name) => {
        if (performance && performance.mark) {
            performance.mark(name);
        }
    },
    measure: (name, startMark, endMark) => {
        if (performance && performance.measure) {
            performance.measure(name, startMark, endMark);
        }
    }
};
