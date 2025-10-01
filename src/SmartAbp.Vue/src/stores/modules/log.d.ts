import { type Ref, type ComputedRef } from 'vue';
import { LogLevel, type LogEntry, type LogStats } from '@/utils/logger';
/**
 * 日志过滤器接口
 */
export interface LogFilters {
    level: LogLevel | null;
    category: string;
    search: string;
}
/**
 * 日志Store
 * 负责管理日志查看器和日志记录
 */
export declare const useLogStore: import("pinia").StoreDefinition<"logs", Pick<{
    isLogViewerVisible: Ref<boolean, boolean>;
    logFilters: Ref<LogFilters, LogFilters>;
    logs: ComputedRef<LogEntry[]>;
    logStats: ComputedRef<LogStats>;
    filteredLogs: ComputedRef<LogEntry[]>;
    errorCount: ComputedRef<number>;
    warningCount: ComputedRef<number>;
    hasErrors: ComputedRef<boolean>;
    hasWarnings: ComputedRef<boolean>;
    showLogViewer: () => void;
    hideLogViewer: () => void;
    toggleLogViewer: () => void;
    setLogFilter: (filters: Partial<LogFilters>) => void;
    clearLogFilters: () => void;
    clearAllLogs: () => void;
    logDebug: (message: string, data?: any) => void;
    logInfo: (message: string, data?: any) => void;
    logWarn: (message: string, data?: any) => void;
    logError: (message: string, data?: any) => void;
    logSuccess: (message: string, data?: any) => void;
    logApiRequest: (method: string, url: string, data?: any) => void;
    logApiResponse: (method: string, url: string, status: number, data?: any) => void;
    logUserAction: (action: string, details?: any) => void;
    logSystemEvent: (event: string, details?: any) => void;
    logPerformance: (operation: string, duration: number, details?: any) => void;
}, "isLogViewerVisible" | "logFilters">, Pick<{
    isLogViewerVisible: Ref<boolean, boolean>;
    logFilters: Ref<LogFilters, LogFilters>;
    logs: ComputedRef<LogEntry[]>;
    logStats: ComputedRef<LogStats>;
    filteredLogs: ComputedRef<LogEntry[]>;
    errorCount: ComputedRef<number>;
    warningCount: ComputedRef<number>;
    hasErrors: ComputedRef<boolean>;
    hasWarnings: ComputedRef<boolean>;
    showLogViewer: () => void;
    hideLogViewer: () => void;
    toggleLogViewer: () => void;
    setLogFilter: (filters: Partial<LogFilters>) => void;
    clearLogFilters: () => void;
    clearAllLogs: () => void;
    logDebug: (message: string, data?: any) => void;
    logInfo: (message: string, data?: any) => void;
    logWarn: (message: string, data?: any) => void;
    logError: (message: string, data?: any) => void;
    logSuccess: (message: string, data?: any) => void;
    logApiRequest: (method: string, url: string, data?: any) => void;
    logApiResponse: (method: string, url: string, status: number, data?: any) => void;
    logUserAction: (action: string, details?: any) => void;
    logSystemEvent: (event: string, details?: any) => void;
    logPerformance: (operation: string, duration: number, details?: any) => void;
}, "logs" | "logStats" | "filteredLogs" | "errorCount" | "warningCount" | "hasErrors" | "hasWarnings">, Pick<{
    isLogViewerVisible: Ref<boolean, boolean>;
    logFilters: Ref<LogFilters, LogFilters>;
    logs: ComputedRef<LogEntry[]>;
    logStats: ComputedRef<LogStats>;
    filteredLogs: ComputedRef<LogEntry[]>;
    errorCount: ComputedRef<number>;
    warningCount: ComputedRef<number>;
    hasErrors: ComputedRef<boolean>;
    hasWarnings: ComputedRef<boolean>;
    showLogViewer: () => void;
    hideLogViewer: () => void;
    toggleLogViewer: () => void;
    setLogFilter: (filters: Partial<LogFilters>) => void;
    clearLogFilters: () => void;
    clearAllLogs: () => void;
    logDebug: (message: string, data?: any) => void;
    logInfo: (message: string, data?: any) => void;
    logWarn: (message: string, data?: any) => void;
    logError: (message: string, data?: any) => void;
    logSuccess: (message: string, data?: any) => void;
    logApiRequest: (method: string, url: string, data?: any) => void;
    logApiResponse: (method: string, url: string, status: number, data?: any) => void;
    logUserAction: (action: string, details?: any) => void;
    logSystemEvent: (event: string, details?: any) => void;
    logPerformance: (operation: string, duration: number, details?: any) => void;
}, "showLogViewer" | "hideLogViewer" | "toggleLogViewer" | "setLogFilter" | "clearLogFilters" | "clearAllLogs" | "logDebug" | "logInfo" | "logWarn" | "logError" | "logSuccess" | "logApiRequest" | "logApiResponse" | "logUserAction" | "logSystemEvent" | "logPerformance">>;
//# sourceMappingURL=log.d.ts.map