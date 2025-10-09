import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { logger, LogLevel } from '@/utils/logger';
/**
 * 日志Store
 * 负责管理日志查看器和日志记录
 */
export const useLogStore = defineStore('logs', () => {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 状态定义
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const isLogViewerVisible = ref(false);
    const logFilters = ref({
        level: null,
        category: '',
        search: ''
    });
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 计算属性
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    /**
     * 所有日志
     */
    const logs = computed(() => logger.getLogs());
    /**
     * 日志统计信息
     */
    const logStats = computed(() => logger.getStats());
    /**
     * 过滤后的日志
     */
    const filteredLogs = computed(() => {
        let result = logs.value;
        if (logFilters.value.level !== null) {
            result = result.filter(log => log.level === logFilters.value.level);
        }
        if (logFilters.value.category) {
            result = result.filter(log => log.category === logFilters.value.category);
        }
        if (logFilters.value.search) {
            const query = logFilters.value.search.toLowerCase();
            result = result.filter(log => log.message.toLowerCase().includes(query) ||
                log.category?.toLowerCase().includes(query) ||
                log.source?.toLowerCase().includes(query));
        }
        return result;
    });
    /**
     * 错误数量
     */
    const errorCount = computed(() => logs.value.filter(log => log.level === LogLevel.ERROR).length);
    /**
     * 警告数量
     */
    const warningCount = computed(() => logs.value.filter(log => log.level === LogLevel.WARN).length);
    /**
     * 是否有错误
     */
    const hasErrors = computed(() => errorCount.value > 0);
    /**
     * 是否有警告
     */
    const hasWarnings = computed(() => warningCount.value > 0);
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 日志查看器方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    /**
     * 显示日志查看器
     */
    const showLogViewer = () => {
        isLogViewerVisible.value = true;
    };
    /**
     * 隐藏日志查看器
     */
    const hideLogViewer = () => {
        isLogViewerVisible.value = false;
    };
    /**
     * 切换日志查看器
     */
    const toggleLogViewer = () => {
        isLogViewerVisible.value = !isLogViewerVisible.value;
    };
    /**
     * 设置日志过滤器
     */
    const setLogFilter = (filters) => {
        Object.assign(logFilters.value, filters);
    };
    /**
     * 清除日志过滤器
     */
    const clearLogFilters = () => {
        logFilters.value = {
            level: null,
            category: '',
            search: ''
        };
    };
    /**
     * 清除所有日志
     */
    const clearAllLogs = () => {
        logger.clear();
    };
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 便捷的日志记录方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const logDebug = (message, data) => {
        logger.debug(message, data);
    };
    const logInfo = (message, data) => {
        logger.info(message, data);
    };
    const logWarn = (message, data) => {
        logger.warn(message, data);
    };
    const logError = (message, data) => {
        logger.error(message, data);
    };
    const logSuccess = (message, data) => {
        logger.success(message, data);
    };
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 专用日志记录方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    /**
     * API请求日志
     */
    const logApiRequest = (method, url, data) => {
        logInfo(`${method.toUpperCase()} ${url}`, {
            ...data,
            category: 'api',
            source: 'http-client'
        });
    };
    /**
     * API响应日志
     */
    const logApiResponse = (method, url, status, data) => {
        const level = status >= 400 ? LogLevel.ERROR : status >= 300 ? LogLevel.WARN : LogLevel.SUCCESS;
        const message = `${method.toUpperCase()} ${url} - ${status}`;
        const logData = { ...data, category: 'api', source: 'http-client' };
        if (level === LogLevel.ERROR) {
            logError(message, logData);
        }
        else if (level === LogLevel.WARN) {
            logWarn(message, logData);
        }
        else {
            logSuccess(message, logData);
        }
    };
    /**
     * 用户操作日志
     */
    const logUserAction = (action, details) => {
        logInfo(`用户操作: ${action}`, {
            ...details,
            category: 'user',
            source: 'ui'
        });
    };
    /**
     * 系统事件日志
     */
    const logSystemEvent = (event, details) => {
        logInfo(`系统事件: ${event}`, {
            ...details,
            category: 'system',
            source: 'system'
        });
    };
    /**
     * 性能日志
     */
    const logPerformance = (operation, duration, details) => {
        const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO;
        const message = `性能: ${operation} 耗时 ${duration}ms`;
        const logData = { ...details, category: 'performance', source: 'performance' };
        if (level === LogLevel.WARN) {
            logWarn(message, logData);
        }
        else {
            logInfo(message, logData);
        }
    };
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 返回Store接口
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    return {
        // 状态
        isLogViewerVisible,
        logFilters,
        // 计算属性
        logs,
        logStats,
        filteredLogs,
        errorCount,
        warningCount,
        hasErrors,
        hasWarnings,
        // 日志查看器方法
        showLogViewer,
        hideLogViewer,
        toggleLogViewer,
        setLogFilter,
        clearLogFilters,
        clearAllLogs,
        // 日志记录方法
        logDebug,
        logInfo,
        logWarn,
        logError,
        logSuccess,
        // 专用日志记录方法
        logApiRequest,
        logApiResponse,
        logUserAction,
        logSystemEvent,
        logPerformance
    };
});
