import { LogLevel } from "@/utils/logger";
export interface PerformanceTracker {
    id: string;
    name: string;
    startTime: number;
    endTime: number;
    duration: number;
    end: () => PerformanceTracker | null;
}
export interface PerformanceStats {
    averageTime: number;
    totalOperations: number;
    slowestOperation: number;
    fastestOperation: number;
    count: number;
    total: number;
    average: number;
    min: number;
    max: number;
}
export interface ErrorStats {
    total: number;
    byCategory: Record<string, number>;
    recent: number;
    contexts: Record<string, number>;
}
declare class LogManager {
    private performanceEntries;
    private activeTrackers;
    private errorReports;
    startPerformanceTracking(name: string): PerformanceTracker;
    endPerformanceTracking(trackingId: string): PerformanceTracker | null;
    getPerformanceStats(): PerformanceStats;
    getPerformanceEntries(): import("vue").Ref<{
        id: string;
        name: string;
        startTime: number;
        endTime: number;
        duration: number;
        end: () => PerformanceTracker | null;
    }[], PerformanceTracker[] | {
        id: string;
        name: string;
        startTime: number;
        endTime: number;
        duration: number;
        end: () => PerformanceTracker | null;
    }[]>;
    getErrorStats(): ErrorStats;
    getErrorReports(): import("vue").Ref<any[], any[]>;
    logBatch(entries: Array<{
        level: LogLevel;
        message: string;
        category?: string;
        data?: any;
    }>): void;
    exportDiagnosticReport(): string;
    cleanup(): void;
    getActiveTrackers(): PerformanceTracker[];
    get performanceStats(): import("vue").ComputedRef<PerformanceStats>;
    get errorStats(): import("vue").ComputedRef<ErrorStats>;
}
export declare const logManager: LogManager;
export declare function trackPerformance<T>(name: string, fn: () => T | Promise<T>): T | Promise<T>;
export {};
//# sourceMappingURL=logManager.d.ts.map
