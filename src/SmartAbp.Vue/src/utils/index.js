// 导入需要在函数中使用的模块
import { logger, LogLevel } from "@/utils/logger";
import { logManager } from "@/utils/logManager";
import { analyzeCurrentLogs } from "@/utils/logAnalyzer";
import { logExporter } from "@/utils/logExporter";
// 导出日志系统核心功能
export { logger, LogLevel, LOG_LEVEL_NAMES } from "@/utils/logger";
export { logManager, trackPerformance } from "@/utils/logManager";
export { logAnalyzer, analyzeCurrentLogs } from "@/utils/logAnalyzer";
export { logExporter, ExportFormat } from "@/utils/logExporter";
// 便捷的日志记录函数
export const createLogger = () => logger;
export const getLogAnalysis = () => analyzeCurrentLogs();
export const exportLogs = (config) => logExporter.downloadLogs(config);
// 快速日志记录
export const logInfo = (message, data) => {
    logger.info(message, data);
};
export const logSuccess = (message, data) => {
    logger.success(message, data);
};
export const logWarn = (message, data) => {
    logger.warn(message, data);
};
export const logError = (message, data) => {
    logger.error(message, data);
};
export const logDebug = (message, data) => {
    logger.debug(message, data);
};
// 性能追踪
export const startTracking = (name, category) => {
    return logManager.startPerformanceTracking(name, category);
};
export const endTracking = (trackingId) => {
    return logManager.endPerformanceTracking(trackingId);
};
// 批量日志记录
export const logBatch = (entries) => logManager.logBatch(entries);
// 清理日志
export const clearLogs = () => {
    logger.clear();
    logManager.cleanup();
};
// 获取日志统计
export const getLogStats = () => {
    const logs = logger.getLogs();
    return {
        total: logs.length,
        info: logs.filter((log) => log.level === LogLevel.INFO).length,
        success: logs.filter((log) => log.level === LogLevel.SUCCESS).length,
        warn: logs.filter((log) => log.level === LogLevel.WARN).length,
        error: logs.filter((log) => log.level === LogLevel.ERROR).length,
        debug: logs.filter((log) => log.level === LogLevel.DEBUG).length,
    };
};
// 导出认证相关
export { authService } from "./auth";
export { useAuth } from "./useAuth";
