import type { QualityConfig } from '../types/index.js';

export const DEFAULT_PERFORMANCE_CONFIG = {
    enableParallel: true,
    parallelBatchSize: 5,
    fileScanConcurrency: 10,
    enableFileCache: true,
    maxMemoryMB: 1024
};

export const DEFAULT_CONFIG: QualityConfig = {
    projectRoot: process.cwd(),
    mode: 'strict',
    ciMode: false,
    failFast: true,
    generateReport: true,
    reportDir: 'reports/quality',
    checkers: [
        'typescript',
        'architecture',
        'smartabp',
        'lowcode',
        'codegen',
        'performance',
        'security'
    ],
    performance: DEFAULT_PERFORMANCE_CONFIG,
    enableDebtAnalysis: false,
    enableBaselineComparison: false,
    rules: {},
    checkerConfigs: {}
};
