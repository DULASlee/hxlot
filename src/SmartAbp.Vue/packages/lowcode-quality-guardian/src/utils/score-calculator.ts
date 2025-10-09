/**
 * SmartAbp Quality Guardian - 质量评分计算器
 * 基于违规记录计算多维度质量评分
 */

import type { QualityScore, Violation, ViolationLevel } from '../types/index.js';

export class ScoreCalculator {
    /**
     * 计算质量评分
     */
    calculate(violations: Record<ViolationLevel, Violation[]>): QualityScore {
        // 基础分100分
        const baseScore = 100;

        // 计算扣分
        const deductions = this.calculateDeductions(violations);
        const overallScore = Math.max(0, baseScore - deductions.total);

        // 计算各维度评分
        const dimensions = this.calculateDimensionScores(violations);

        // 生成扣分明细
        const deductionDetails = this.generateDeductionDetails(violations);

        return {
            overall: Math.round(overallScore),
            dimensions: {
                correctness: dimensions.correctness,
                security: dimensions.security,
                maintainability: dimensions.maintainability,
                architecture: dimensions.architecture,
                style: dimensions.style,
                performance: dimensions.performance
            },
            breakdown: {
                baseScore,
                deductions: {
                    P0: deductions.P0,
                    P1: deductions.P1,
                    P2: deductions.P2
                },
                deductionDetails
            }
        };
    }

    /**
     * 计算扣分
     */
    private calculateDeductions(violations: Record<ViolationLevel, Violation[]>): {
        P0: number;
        P1: number;
        P2: number;
        total: number;
    } {
        const p0Deduction = violations.P0.length * 20; // 每个P0扣20分
        const p1Deduction = violations.P1.length * 5;  // 每个P1扣5分
        const p2Deduction = violations.P2.length * 0.1;  // 每个P2扣0.1分

        return {
            P0: p0Deduction,
            P1: p1Deduction,
            P2: p2Deduction,
            total: p0Deduction + p1Deduction + p2Deduction
        };
    }

    /**
     * 计算各维度评分
     */
    private calculateDimensionScores(violations: Record<ViolationLevel, Violation[]>): {
        correctness: number;
        security: number;
        maintainability: number;
        architecture: number;
        style: number;
        performance: number;
    } {
        const allViolations = [
            ...violations.P0,
            ...violations.P1,
            ...violations.P2
        ];

        // 按规则分类
        const dimensionViolations = {
            correctness: this.filterViolationsByDimension(allViolations, [
                'typescript',
                'smartabp.no-mock-code',
                'smartabp.no-empty-implementations'
            ]),
            security: this.filterViolationsByDimension(allViolations, [
                'security',
                'smartabp.no-hardcoded-secrets'
            ]),
            maintainability: this.filterViolationsByDimension(allViolations, [
                'code-smell',
                'smartabp.no-duplicate',
                'smartabp.no-magic-numbers',
                'complexity'
            ]),
            architecture: this.filterViolationsByDimension(allViolations, [
                'lowcode',
                'architecture',
                'smartabp.no-relative-package-imports'
            ]),
            style: this.filterViolationsByDimension(allViolations, [
                'eslint',
                'smartabp.no-console',
                'smartabp.no-todo'
            ]),
            performance: this.filterViolationsByDimension(allViolations, [
                'performance',
                'bundle'
            ])
        };

        // 计算每个维度的评分
        return {
            correctness: this.calculateDimensionScore(dimensionViolations.correctness),
            security: this.calculateDimensionScore(dimensionViolations.security),
            maintainability: this.calculateDimensionScore(dimensionViolations.maintainability),
            architecture: this.calculateDimensionScore(dimensionViolations.architecture),
            style: this.calculateDimensionScore(dimensionViolations.style),
            performance: this.calculateDimensionScore(dimensionViolations.performance)
        };
    }

    /**
     * 过滤特定维度的违规
     */
    private filterViolationsByDimension(
        violations: Violation[],
        rulePatterns: string[]
    ): Violation[] {
        return violations.filter(v =>
            rulePatterns.some(pattern => v.rule.includes(pattern))
        );
    }

    /**
     * 计算单个维度的评分
     */
    private calculateDimensionScore(violations: Violation[]): number {
        const baseScore = 100;

        let deduction = 0;
        violations.forEach(v => {
            switch (v.level) {
                case 'P0':
                    deduction += 15;
                    break;
                case 'P1':
                    deduction += 8;
                    break;
                case 'P2':
                    deduction += 2;
                    break;
            }
        });

        return Math.max(0, Math.round(baseScore - deduction));
    }

    /**
     * 生成扣分明细
     */
    private generateDeductionDetails(
        violations: Record<ViolationLevel, Violation[]>
    ): Array<{
        rule: string;
        level: ViolationLevel;
        count: number;
        points: number;
    }> {
        const allViolations = [
            ...violations.P0,
            ...violations.P1,
            ...violations.P2
        ];

        // 按规则分组统计
        const groupedByRule = new Map<string, Violation[]>();

        allViolations.forEach(v => {
            const existing = groupedByRule.get(v.rule) || [];
            existing.push(v);
            groupedByRule.set(v.rule, existing);
        });

        // 计算每个规则的扣分
        const details: Array<{
            rule: string;
            level: ViolationLevel;
            count: number;
            points: number;
        }> = [];

        groupedByRule.forEach((ruleViolations, rule) => {
            if (ruleViolations.length === 0) return;

            const level = ruleViolations[0]?.level || 'P2';
            const count = ruleViolations.length;
            const pointsPerViolation = level === 'P0' ? 10 : level === 'P1' ? 5 : 1;
            const points = count * pointsPerViolation;

            details.push({
                rule,
                level,
                count,
                points
            });
        });

        // 按扣分从高到低排序
        return details.sort((a, b) => b.points - a.points);
    }
}

