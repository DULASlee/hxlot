/**
 * 错误监控与告警系统
 * 提供全局错误捕获、错误上报、错误恢复等功能
 */
/**
 * 错误级别
 */
export var ErrorLevel;
(function (ErrorLevel) {
    /** 致命错误 - 导致应用崩溃 */
    ErrorLevel["FATAL"] = "fatal";
    /** 错误 - 功能无法使用 */
    ErrorLevel["ERROR"] = "error";
    /** 警告 - 功能降级 */
    ErrorLevel["WARNING"] = "warning";
    /** 信息 - 记录信息 */
    ErrorLevel["INFO"] = "info";
})(ErrorLevel || (ErrorLevel = {}));
/**
 * 错误类型
 */
export var ErrorType;
(function (ErrorType) {
    /** JavaScript运行时错误 */
    ErrorType["RUNTIME"] = "runtime";
    /** 网络请求错误 */
    ErrorType["NETWORK"] = "network";
    /** Promise未捕获错误 */
    ErrorType["PROMISE"] = "promise";
    /** 资源加载错误 */
    ErrorType["RESOURCE"] = "resource";
    /** Vue组件错误 */
    ErrorType["VUE"] = "vue";
    /** 业务逻辑错误 */
    ErrorType["BUSINESS"] = "business";
})(ErrorType || (ErrorType = {}));
/**
 * 错误监控类
 */
class ErrorMonitor {
    constructor(config = {}) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "errorCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.config = {
            enabled: true,
            reportUrl: '/api/errors/report',
            sampleRate: 1.0,
            capturePromiseRejection: true,
            captureResourceError: true,
            maxErrorCache: 50,
            onError: () => { },
            ...config
        };
    }
    /**
     * 初始化错误监控
     */
    init() {
        if (this.isInitialized || !this.config.enabled) {
            return;
        }
        // 1. 监听JavaScript运行时错误
        window.addEventListener('error', this.handleRuntimeError.bind(this), true);
        // 2. 监听Promise未捕获错误
        if (this.config.capturePromiseRejection) {
            window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
        }
        // 3. 监听Vue错误（需要在Vue应用中配置）
        // app.config.errorHandler = this.handleVueError.bind(this)
        this.isInitialized = true;
        console.log('[ErrorMonitor] Initialized');
    }
    /**
     * 处理运行时错误
     */
    handleRuntimeError(event) {
        // 区分JavaScript错误和资源加载错误
        const target = event.target;
        if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
            // 资源加载错误
            if (!this.config.captureResourceError)
                return;
            this.captureError({
                type: ErrorType.RESOURCE,
                level: ErrorLevel.WARNING,
                message: `Resource load failed: ${target.src || target.src}`,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                extra: {
                    resourceType: target.tagName,
                    resourceSrc: target.src || target.src
                }
            });
        }
        else {
            // JavaScript运行时错误
            this.captureError({
                type: ErrorType.RUNTIME,
                level: ErrorLevel.ERROR,
                message: event.message,
                stack: event.error?.stack,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent,
                extra: {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                }
            });
        }
    }
    /**
     * 处理Promise错误
     */
    handlePromiseError(event) {
        this.captureError({
            type: ErrorType.PROMISE,
            level: ErrorLevel.ERROR,
            message: event.reason?.message || String(event.reason),
            stack: event.reason?.stack,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });
    }
    /**
     * 处理Vue错误
     */
    handleVueError(err, _instance, info) {
        const error = err;
        this.captureError({
            type: ErrorType.VUE,
            level: ErrorLevel.ERROR,
            message: error.message,
            stack: error.stack,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            extra: {
                componentInfo: info
            }
        });
    }
    /**
     * 捕获错误
     */
    captureError(error) {
        // 采样率控制
        if (Math.random() > this.config.sampleRate) {
            return;
        }
        // 缓存错误
        this.errorCache.push(error);
        if (this.errorCache.length > this.config.maxErrorCache) {
            this.errorCache.shift();
        }
        // 触发回调
        this.config.onError(error);
        // 上报错误
        this.reportError(error);
        // 控制台输出
        console.error('[ErrorMonitor] Captured error:', error);
    }
    /**
     * 上报错误
     */
    async reportError(error) {
        if (!this.config.reportUrl)
            return;
        try {
            await fetch(this.config.reportUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(error)
            });
        }
        catch (e) {
            console.error('[ErrorMonitor] Report failed:', e);
        }
    }
    /**
     * 手动捕获业务错误
     */
    captureBusinessError(message, extra) {
        this.captureError({
            type: ErrorType.BUSINESS,
            level: ErrorLevel.ERROR,
            message,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            extra
        });
    }
    /**
     * 捕获网络错误
     */
    captureNetworkError(url, status, statusText) {
        this.captureError({
            type: ErrorType.NETWORK,
            level: status >= 500 ? ErrorLevel.ERROR : ErrorLevel.WARNING,
            message: `Network request failed: ${url}`,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            extra: {
                requestUrl: url,
                status,
                statusText
            }
        });
    }
    /**
     * 获取错误缓存
     */
    getErrorCache() {
        return [...this.errorCache];
    }
    /**
     * 清空错误缓存
     */
    clearErrorCache() {
        this.errorCache = [];
    }
    /**
     * 销毁监控
     */
    destroy() {
        if (!this.isInitialized)
            return;
        window.removeEventListener('error', this.handleRuntimeError.bind(this), true);
        window.removeEventListener('unhandledrejection', this.handlePromiseError.bind(this));
        this.isInitialized = false;
        console.log('[ErrorMonitor] Destroyed');
    }
}
// 导出单例
export const errorMonitor = new ErrorMonitor();
// Vue插件形式
export default {
    install(app, options = {}) {
        const monitor = new ErrorMonitor(options);
        monitor.init();
        // 设置Vue错误处理器
        app.config.errorHandler = monitor.handleVueError.bind(monitor);
        window.$errorMonitor = monitor;
    }
};
