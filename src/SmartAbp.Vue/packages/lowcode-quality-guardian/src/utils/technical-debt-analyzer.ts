/**
 * SmartAbp Quality Guardian - 技术债务量化分析器
 * 
 * 核心功能：
 * - 统计技术债务总量（按扣分计算）
 * - 预估修复时间和成本
 * - 多维度分类统计（级别、检查器、文件、规则）
 * - 计算债务密度（每千行代码）
 * - 债务趋势分析
 */

import type {
    DebtCategory,
    QualityReport,
    TechnicalDebt,
    Violation
} from '@smartabp/lowcode-shared/types/index.js';

/**
 * 技术债务分析器配置
 */
export interface DebtAnalyzerConfig {
    /** 每小时工资（用于成本估算），默认500元 */
    hourlyRate?: number;
    /** 货币单位，默认CNY */
    currency?: string;
    /** 修复时间估算规则（分钟） */
    estimationRules?: {
        P0: number; // P0问题平均修复时间（分钟），默认30
        P1: number; // P1问题平均修复时间（分钟），默认15
        P2: number; // P2问题平均修复时间（分钟），默认5
    };
    /** 债务扣分权重 */
    debtWeights?: {
        P0: number; // P0问题扣分，默认10
        P1: number; // P1问题扣分，默认5
        P2: number; // P2问题扣分，默认1
    };
}

/**
 * 技术债务分析器
 */
export class TechnicalDebtAnalyzer {
    private config: Required<DebtAnalyzerConfig>;

    constructor(config: DebtAnalyzerConfig = {}) {
        this.config = {
            hourlyRate: config.hourlyRate ?? 500,
            currency: config.currency ?? 'CNY',
            estimationRules: {
                P0: config.estimationRules?.P0 ?? 30,
                P1: config.estimationRules?.P1 ?? 15,
                P2: config.estimationRules?.P2 ?? 5,
            },
            debtWeights: {
                P0: config.debtWeights?.P0 ?? 10,
                P1: config.debtWeights?.P1 ?? 5,
                P2: config.debtWeights?.P2 ?? 1,
            },
        };
    }

    /**
     * 分析质量报告并生成技术债务统计
     */
    public analyze(report: QualityReport): TechnicalDebt {
        // 1. 计算总债务量
        const totalDebt = this.calculateTotalDebt(report);

        // 2. 预估修复时间
        const estimatedHours = this.estimateRepairTime(report);

        // 3. 计算修复成本
        const estimatedCost = {
            hours: estimatedHours,
            hourlyRate: this.config.hourlyRate,
            totalCost: estimatedHours * this.config.hourlyRate,
            currency: this.config.currency,
        };

        // 4. 按级别分类
        const byLevel = this.analyzeByLevel(report);

        // 5. 按检查器分类
        const byChecker = this.analyzeByChecker(report);

        // 6. 按文件分类（Top 10）
        const byFile = this.analyzeByFile(report);

        // 7. 按规则分类（Top 20）
        const byRule = this.analyzeByRule(report);

        // 8. 计算债务密度
        const density = this.calculateDebtDensity(report, totalDebt);

        return {
            totalDebt,
            estimatedHours,
            estimatedCost,
            byLevel,
            byChecker,
            byFile,
            byRule,
            density,
        };
    }

    /**
     * 计算总债务量（按扣分计算）
     */
    private calculateTotalDebt(report: QualityReport): number {
        let totalDebt = 0;

        // P0违规
        totalDebt += report.violations.P0.length * this.config.debtWeights.P0;

        // P1违规
        totalDebt += report.violations.P1.length * this.config.debtWeights.P1;

        // P2违规
        totalDebt += report.violations.P2.length * this.config.debtWeights.P2;

        return totalDebt;
    }

    /**
     * 预估修复时间（小时）
     */
    private estimateRepairTime(report: QualityReport): number {
        let totalMinutes = 0;

        // P0违规修复时间
        totalMinutes += report.violations.P0.length * this.config.estimationRules.P0;

        // P1违规修复时间
        totalMinutes += report.violations.P1.length * this.config.estimationRules.P1;

        // P2违规修复时间
        totalMinutes += report.violations.P2.length * this.config.estimationRules.P2;

        // 转换为小时，保留2位小数
        return Math.round((totalMinutes / 60) * 100) / 100;
    }

    /**
     * 按级别分类统计
     */
    private analyzeByLevel(report: QualityReport): {
        P0: DebtCategory;
        P1: DebtCategory;
        P2: DebtCategory;
    } {
        const p0Count = report.violations.P0.length;
        const p1Count = report.violations.P1.length;
        const p2Count = report.violations.P2.length;

        const p0Debt = p0Count * this.config.debtWeights.P0;
        const p1Debt = p1Count * this.config.debtWeights.P1;
        const p2Debt = p2Count * this.config.debtWeights.P2;
        const totalDebt = p0Debt + p1Debt + p2Debt;

        return {
            P0: {
                debt: p0Debt,
                count: p0Count,
                estimatedHours: (p0Count * this.config.estimationRules.P0) / 60,
                percentage: totalDebt > 0 ? (p0Debt / totalDebt) * 100 : 0,
            },
            P1: {
                debt: p1Debt,
                count: p1Count,
                estimatedHours: (p1Count * this.config.estimationRules.P1) / 60,
                percentage: totalDebt > 0 ? (p1Debt / totalDebt) * 100 : 0,
            },
            P2: {
                debt: p2Debt,
                count: p2Count,
                estimatedHours: (p2Count * this.config.estimationRules.P2) / 60,
                percentage: totalDebt > 0 ? (p2Debt / totalDebt) * 100 : 0,
            },
        };
    }

    /**
     * 按检查器分类统计
     */
    private analyzeByChecker(report: QualityReport): Record<string, DebtCategory> {
        const result: Record<string, DebtCategory> = {};

        for (const [checkerName, checkResult] of Object.entries(report.checkers)) {
            const violations = checkResult.violations;
            const p0Count = violations.filter((v) => v.level === 'P0').length;
            const p1Count = violations.filter((v) => v.level === 'P1').length;
            const p2Count = violations.filter((v) => v.level === 'P2').length;

            const debt =
                p0Count * this.config.debtWeights.P0 +
                p1Count * this.config.debtWeights.P1 +
                p2Count * this.config.debtWeights.P2;

            const estimatedHours =
                (p0Count * this.config.estimationRules.P0 +
                    p1Count * this.config.estimationRules.P1 +
                    p2Count * this.config.estimationRules.P2) /
                60;

            const totalCount = p0Count + p1Count + p2Count;

            result[checkerName] = {
                debt,
                count: totalCount,
                estimatedHours: Math.round(estimatedHours * 100) / 100,
                percentage: 0, // Will be calculated after all checkers are processed
            };
        }

        // Calculate percentages
        const totalDebt = Object.values(result).reduce((sum, cat) => sum + cat.debt, 0);
        if (totalDebt > 0) {
            for (const cat of Object.values(result)) {
                cat.percentage = Math.round((cat.debt / totalDebt) * 10000) / 100;
            }
        }

        return result;
    }

    /**
     * 按文件分类统计（Top 10）
     */
    private analyzeByFile(
        report: QualityReport
    ): Array<{
        file: string;
        debt: number;
        violations: number;
        estimatedHours: number;
    }> {
        const fileMap = new Map<string, { debt: number; violations: Violation[] }>();

        // 收集所有违规按文件分组
        const allViolations = [
            ...report.violations.P0,
            ...report.violations.P1,
            ...report.violations.P2,
        ];

        for (const violation of allViolations) {
            if (!violation.file) continue;

            if (!fileMap.has(violation.file)) {
                fileMap.set(violation.file, { debt: 0, violations: [] });
            }

            const fileData = fileMap.get(violation.file)!;
            fileData.violations.push(violation);
            fileData.debt += this.config.debtWeights[violation.level];
        }

        // 转换为数组并排序
        const fileStats = Array.from(fileMap.entries()).map(([file, data]) => {
            const estimatedMinutes = data.violations.reduce((sum, v) => {
                return sum + this.config.estimationRules[v.level];
            }, 0);

            return {
                file,
                debt: data.debt,
                violations: data.violations.length,
                estimatedHours: Math.round((estimatedMinutes / 60) * 100) / 100,
            };
        });

        // 按债务量降序排序，取Top 10
        return fileStats.sort((a, b) => b.debt - a.debt).slice(0, 10);
    }

    /**
     * 按规则分类统计（Top 20）
     */
    private analyzeByRule(
        report: QualityReport
    ): Array<{
        rule: string;
        count: number;
        debt: number;
        estimatedHours: number;
        avgTimePerFix: number;
    }> {
        const ruleMap = new Map<string, Violation[]>();

        // 收集所有违规按规则分组
        const allViolations = [
            ...report.violations.P0,
            ...report.violations.P1,
            ...report.violations.P2,
        ];

        for (const violation of allViolations) {
            if (!ruleMap.has(violation.rule)) {
                ruleMap.set(violation.rule, []);
            }
            ruleMap.get(violation.rule)!.push(violation);
        }

        // 转换为数组并计算统计
        const ruleStats = Array.from(ruleMap.entries()).map(([rule, violations]) => {
            const debt = violations.reduce((sum, v) => {
                return sum + this.config.debtWeights[v.level];
            }, 0);

            const estimatedMinutes = violations.reduce((sum, v) => {
                return sum + this.config.estimationRules[v.level];
            }, 0);

            const estimatedHours = Math.round((estimatedMinutes / 60) * 100) / 100;
            const avgTimePerFix = Math.round((estimatedMinutes / violations.length) * 100) / 100;

            return {
                rule,
                count: violations.length,
                debt,
                estimatedHours,
                avgTimePerFix,
            };
        });

        // 按违规数量降序排序，取Top 20
        return ruleStats.sort((a, b) => b.count - a.count).slice(0, 20);
    }

    /**
     * 计算债务密度（每千行代码）
     */
    private calculateDebtDensity(
        report: QualityReport,
        totalDebt: number
    ): {
        debtPerKLOC: number;
        violationsPerKLOC: number;
        totalLinesOfCode: number;
    } {
        const totalLinesOfCode = report.statistics.totalLines || 1; // 避免除以0
        const totalViolations =
            report.violations.P0.length + report.violations.P1.length + report.violations.P2.length;

        // 每千行代码的债务量和违规数
        const debtPerKLOC = Math.round((totalDebt / totalLinesOfCode) * 1000 * 100) / 100;
        const violationsPerKLOC =
            Math.round((totalViolations / totalLinesOfCode) * 1000 * 100) / 100;

        return {
            debtPerKLOC,
            violationsPerKLOC,
            totalLinesOfCode,
        };
    }

    /**
     * 对比两个报告，计算债务趋势
     */
    public compareReports(
        currentReport: QualityReport,
        previousReport: QualityReport
    ): TechnicalDebt['trend'] {
        const currentDebt = this.analyze(currentReport);
        const previousDebt = this.analyze(previousReport);

        const change = currentDebt.totalDebt - previousDebt.totalDebt;
        const changePercent =
            previousDebt.totalDebt > 0 ? (change / previousDebt.totalDebt) * 100 : 0;

        let direction: 'improving' | 'stable' | 'worsening';
        if (Math.abs(changePercent) < 5) {
            direction = 'stable';
        } else if (change < 0) {
            direction = 'improving';
        } else {
            direction = 'worsening';
        }

        return {
            direction,
            changePercent: Math.round(changePercent * 100) / 100,
            changeSinceLastCheck: Math.round(change * 100) / 100,
        };
    }
}

