/**
 * SmartAbp Quality Guardian - 质量基线管理器
 * 
 * 核心功能：
 * - 保存质量报告作为基线
 * - 加载历史基线
 * - 对比当前报告与基线
 * - 生成质量趋势分析
 * - 自动管理基线历史记录
 */

import execa from 'execa';
import * as fs from 'fs-extra';
import path from 'path';
import type {
    BaselineComparison,
    BaselineManagerConfig,
    ComparisonMetric,
    QualityBaseline,
    QualityReport,
    QualityTrend,
    Violation,
} from '../types/index.js';

/**
 * 基线管理器
 */
export class BaselineManager {
    private config: Required<BaselineManagerConfig>;

    constructor(config: BaselineManagerConfig) {
        this.config = {
            storageDir: config.storageDir,
            defaultBaselineName: config.defaultBaselineName ?? 'main',
            autoSave: config.autoSave ?? true,
            maxHistoryCount: config.maxHistoryCount ?? 50,
            significantChangeThreshold: config.significantChangeThreshold ?? 5,
        };

        // 确保存储目录存在
        fs.ensureDirSync(this.config.storageDir);
    }

    /**
     * 保存当前报告为基线
     */
    public async saveBaseline(
        report: QualityReport,
        options: {
            name?: string;
            description?: string;
            setAsDefault?: boolean;
        } = {}
    ): Promise<QualityBaseline> {
        const name = options.name ?? this.config.defaultBaselineName;
        const timestamp = new Date().toISOString();
        const id = this.generateBaselineId(name, timestamp);

        // 尝试获取Git信息
        const gitInfo = await this.getGitInfo();

        const baseline: QualityBaseline = {
            id,
            name,
            description: options.description,
            createdAt: timestamp,
            gitCommit: gitInfo.commit,
            gitBranch: gitInfo.branch,
            data: report,
        };

        // 保存基线文件
        const baselinePath = path.join(this.config.storageDir, `${id}.json`);
        await fs.writeJson(baselinePath, baseline, { spaces: 2 });

        // 如果设置为默认基线，创建符号链接
        if (options.setAsDefault) {
            const defaultPath = path.join(this.config.storageDir, `${name}-latest.json`);
            await fs.writeJson(defaultPath, baseline, { spaces: 2 });
        }

        // 清理旧的基线（如果超过最大保留数量）
        if (this.config.maxHistoryCount > 0) {
            await this.cleanOldBaselines(name);
        }

        return baseline;
    }

    /**
     * 加载指定的基线
     */
    public async loadBaseline(nameOrId: string): Promise<QualityBaseline | null> {
        try {
            // 尝试按ID加载
            let baselinePath = path.join(this.config.storageDir, `${nameOrId}.json`);
            if (await fs.pathExists(baselinePath)) {
                return await fs.readJson(baselinePath);
            }

            // 尝试按名称加载最新的基线
            baselinePath = path.join(this.config.storageDir, `${nameOrId}-latest.json`);
            if (await fs.pathExists(baselinePath)) {
                return await fs.readJson(baselinePath);
            }

            // 尝试查找匹配名称的最新基线
            const baselines = await this.listBaselines(nameOrId);
            if (baselines.length > 0) {
                return baselines[0] || null; // 返回最新的
            }

            return null;
        } catch (error) {
            console.error(`加载基线失败: ${error}`);
            return null;
        }
    }

    /**
     * 列出所有基线（按名称筛选）
     */
    public async listBaselines(nameFilter?: string): Promise<QualityBaseline[]> {
        try {
            const files = await fs.readdir(this.config.storageDir);
            const baselineFiles = files.filter((f: string) => f.endsWith('.json') && !f.endsWith('-latest.json'));

            const baselines: QualityBaseline[] = [];
            for (const file of baselineFiles) {
                try {
                    const baseline = await fs.readJson(path.join(this.config.storageDir, file));
                    if (!nameFilter || baseline.name === nameFilter) {
                        baselines.push(baseline);
                    }
                } catch (error) {
                    // 跳过损坏的基线文件
                    console.warn(`跳过损坏的基线文件: ${file}`);
                }
            }

            // 按时间降序排序
            return baselines.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
            console.error(`列出基线失败: ${error}`);
            return [];
        }
    }

    /**
     * 对比当前报告与基线
     */
    public async compare(
        currentReport: QualityReport,
        baselineNameOrId: string
    ): Promise<BaselineComparison | null> {
        const baseline = await this.loadBaseline(baselineNameOrId);
        if (!baseline) {
            console.error(`未找到基线: ${baselineNameOrId}`);
            return null;
        }

        const baselineReport = baseline.data;

        // 1. 总体对比
        const scoreChange = currentReport.scores.overall - baselineReport.scores.overall;
        const scoreChangePercent = (scoreChange / baselineReport.scores.overall) * 100;
        const significant = Math.abs(scoreChangePercent) >= this.config.significantChangeThreshold;

        let direction: 'improved' | 'stable' | 'degraded';
        if (Math.abs(scoreChangePercent) < 1) {
            direction = 'stable';
        } else if (scoreChange > 0) {
            direction = 'improved';
        } else {
            direction = 'degraded';
        }

        const overall = {
            scoreChange: Math.round(scoreChange * 100) / 100,
            scoreChangePercent: Math.round(scoreChangePercent * 100) / 100,
            direction,
            significant,
        };

        // 2. 违规数量对比
        const violations = {
            P0: this.compareMetric(
                baselineReport.violations.P0.length,
                currentReport.violations.P0.length,
                'lower'
            ),
            P1: this.compareMetric(
                baselineReport.violations.P1.length,
                currentReport.violations.P1.length,
                'lower'
            ),
            P2: this.compareMetric(
                baselineReport.violations.P2.length,
                currentReport.violations.P2.length,
                'lower'
            ),
            total: this.compareMetric(
                baselineReport.violations.P0.length +
                baselineReport.violations.P1.length +
                baselineReport.violations.P2.length,
                currentReport.violations.P0.length +
                currentReport.violations.P1.length +
                currentReport.violations.P2.length,
                'lower'
            ),
        };

        // 3. 维度评分对比
        const dimensions = {
            correctness: this.compareMetric(
                baselineReport.scores.dimensions.correctness,
                currentReport.scores.dimensions.correctness,
                'higher'
            ),
            security: this.compareMetric(
                baselineReport.scores.dimensions.security,
                currentReport.scores.dimensions.security,
                'higher'
            ),
            maintainability: this.compareMetric(
                baselineReport.scores.dimensions.maintainability,
                currentReport.scores.dimensions.maintainability,
                'higher'
            ),
            architecture: this.compareMetric(
                baselineReport.scores.dimensions.architecture,
                currentReport.scores.dimensions.architecture,
                'higher'
            ),
            style: this.compareMetric(
                baselineReport.scores.dimensions.style,
                currentReport.scores.dimensions.style,
                'higher'
            ),
            performance: this.compareMetric(
                baselineReport.scores.dimensions.performance,
                currentReport.scores.dimensions.performance,
                'higher'
            ),
        };

        // 4. 技术债务对比（需要从scores.breakdown计算）
        const baselineDebt = this.calculateTotalDebt(baselineReport);
        const currentDebt = this.calculateTotalDebt(currentReport);

        const technicalDebt = {
            totalDebt: this.compareMetric(baselineDebt, currentDebt, 'lower'),
            estimatedHours: this.compareMetric(
                baselineDebt / 10, // 简化估算：债务/10 = 小时
                currentDebt / 10,
                'lower'
            ),
            density: this.compareMetric(
                baselineDebt / (baselineReport.statistics.totalLines || 1) * 1000,
                currentDebt / (currentReport.statistics.totalLines || 1) * 1000,
                'lower'
            ),
        };

        // 5. 识别新增、修复和持续存在的问题
        const { newIssues, fixedIssues, persistentIssues } = this.categorizeIssues(
            baselineReport,
            currentReport
        );

        // 6. 文件变化统计
        const fileChanges = {
            added: 0,
            modified: 0,
            deleted: 0,
            totalFiles: currentReport.statistics.filesChecked,
        };

        // 7. 生成改进建议
        const recommendations = this.generateRecommendations(
            overall,
            violations,
            dimensions,
            newIssues
        );

        return {
            baseline: {
                id: baseline.id,
                name: baseline.name,
                createdAt: baseline.createdAt,
            },
            currentTimestamp: currentReport.timestamp,
            overall,
            violations,
            dimensions,
            technicalDebt,
            newIssues,
            fixedIssues,
            persistentIssues,
            fileChanges,
            recommendations,
        };
    }

    /**
     * 生成质量趋势分析
     */
    public async analyzeTrend(baselineName: string, limit: number = 20): Promise<QualityTrend | null> {
        try {
            const baselines = await this.listBaselines(baselineName);
            if (baselines.length === 0) {
                return null;
            }

            // 限制数据点数量
            const dataPoints = baselines.slice(0, limit).reverse();

            // 提取数据
            const scores = dataPoints.map((b) => b.data.scores.overall);
            const timestamps = dataPoints.map((b) => b.createdAt);

            // 计算统计数据
            const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
            const highestScore = Math.max(...scores);
            const lowestScore = Math.min(...scores);

            // 计算标准差
            const variance = scores.reduce((sum, s) => sum + Math.pow(s - averageScore, 2), 0) / scores.length;
            const standardDeviation = Math.sqrt(variance);

            // 判断整体趋势（简单线性趋势）
            let overallTrend: 'improving' | 'stable' | 'declining' = 'stable';
            if (scores.length >= 3) {
                const recentAvg = scores.slice(-3).reduce((sum, s) => sum + s, 0) / 3;
                const earlyAvg = scores.slice(0, 3).reduce((sum, s) => sum + s, 0) / 3;
                if (recentAvg > earlyAvg + 2) {
                    overallTrend = 'improving';
                } else if (recentAvg < earlyAvg - 2) {
                    overallTrend = 'declining';
                }
            }

            // 预测下次评分（简单移动平均）
            const predictedNextScore = scores.length >= 3
                ? Math.round((scores.slice(-3).reduce((sum, s) => sum + s, 0) / 3) * 100) / 100
                : undefined;

            return {
                dataPoints: dataPoints.map((baseline) => ({
                    timestamp: baseline.createdAt,
                    score: baseline.data.scores.overall,
                    violations: {
                        P0: baseline.data.violations.P0.length,
                        P1: baseline.data.violations.P1.length,
                        P2: baseline.data.violations.P2.length,
                    },
                    technicalDebt: this.calculateTotalDebt(baseline.data),
                    filesChecked: baseline.data.statistics.filesChecked,
                    gitCommit: baseline.gitCommit,
                })),
                analysis: {
                    overallTrend,
                    averageScore: Math.round(averageScore * 100) / 100,
                    highestScore,
                    lowestScore,
                    standardDeviation: Math.round(standardDeviation * 100) / 100,
                    predictedNextScore,
                },
                chartData: {
                    labels: timestamps.map((ts) => new Date(ts).toLocaleDateString('zh-CN')),
                    scores,
                    p0Counts: dataPoints.map((b) => b.data.violations.P0.length),
                    p1Counts: dataPoints.map((b) => b.data.violations.P1.length),
                    p2Counts: dataPoints.map((b) => b.data.violations.P2.length),
                    debtValues: dataPoints.map((b) => this.calculateTotalDebt(b.data)),
                },
            };
        } catch (error) {
            console.error(`趋势分析失败: ${error}`);
            return null;
        }
    }

    // === Private Helper Methods ===

    private generateBaselineId(name: string, timestamp: string): string {
        const date = new Date(timestamp);
        const dateStr = date.toISOString().replace(/[:.]/g, '-').split('T')[0] || 'unknown';
        const timePart = date.toISOString().replace(/[:.]/g, '-').split('T')[1];
        const timeStr = timePart ? timePart.split('.')[0] || 'unknown' : 'unknown';
        return `${name}-${dateStr}-${timeStr}`;
    }

    private async getGitInfo(): Promise<{ commit?: string; branch?: string }> {
        try {
            const { stdout: commit } = await execa('git', ['rev-parse', 'HEAD']);
            const { stdout: branch } = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
            return {
                commit: commit.trim(),
                branch: branch.trim(),
            };
        } catch (error) {
            return {};
        }
    }

    private async cleanOldBaselines(name: string): Promise<void> {
        try {
            const baselines = await this.listBaselines(name);
            if (baselines.length <= this.config.maxHistoryCount) {
                return;
            }

            // 删除多余的旧基线
            const toDelete = baselines.slice(this.config.maxHistoryCount);
            for (const baseline of toDelete) {
                const filePath = path.join(this.config.storageDir, `${baseline.id}.json`);
                await fs.remove(filePath);
            }
        } catch (error) {
            console.warn(`清理旧基线失败: ${error}`);
        }
    }

    private compareMetric(
        baseline: number,
        current: number,
        betterDirection: 'higher' | 'lower'
    ): ComparisonMetric {
        const change = current - baseline;
        const changePercent = baseline !== 0 ? (change / baseline) * 100 : 0;

        let direction: 'improved' | 'stable' | 'degraded';
        if (Math.abs(changePercent) < 1) {
            direction = 'stable';
        } else if (betterDirection === 'higher') {
            direction = change > 0 ? 'improved' : 'degraded';
        } else {
            direction = change < 0 ? 'improved' : 'degraded';
        }

        return {
            baseline: Math.round(baseline * 100) / 100,
            current: Math.round(current * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            direction,
        };
    }

    private calculateTotalDebt(report: QualityReport): number {
        // P0: 10分, P1: 5分, P2: 1分
        return (
            report.violations.P0.length * 10 +
            report.violations.P1.length * 5 +
            report.violations.P2.length * 1
        );
    }

    private categorizeIssues(
        baselineReport: QualityReport,
        currentReport: QualityReport
    ): {
        newIssues: Violation[];
        fixedIssues: Violation[];
        persistentIssues: Violation[];
    } {
        const baselineIssues = [
            ...baselineReport.violations.P0,
            ...baselineReport.violations.P1,
            ...baselineReport.violations.P2,
        ];
        const currentIssues = [
            ...currentReport.violations.P0,
            ...currentReport.violations.P1,
            ...currentReport.violations.P2,
        ];

        // 创建问题唯一标识（rule + file + line）
        const getIssueKey = (v: Violation) => `${v.rule}:${v.file}:${v.line}`;

        const baselineKeys = new Set(baselineIssues.map(getIssueKey));
        const currentKeys = new Set(currentIssues.map(getIssueKey));

        // 新增问题：在当前报告中存在，但在基线中不存在
        const newIssues = currentIssues.filter((v) => !baselineKeys.has(getIssueKey(v)));

        // 已修复问题：在基线中存在，但在当前报告中不存在
        const fixedIssues = baselineIssues.filter((v) => !currentKeys.has(getIssueKey(v)));

        // 持续存在的问题：在两者中都存在
        const persistentIssues = currentIssues.filter((v) => baselineKeys.has(getIssueKey(v)));

        return {
            newIssues,
            fixedIssues,
            persistentIssues,
        };
    }

    private generateRecommendations(
        overall: BaselineComparison['overall'],
        violations: BaselineComparison['violations'],
        dimensions: BaselineComparison['dimensions'],
        newIssues: Violation[]
    ): string[] {
        const recommendations: string[] = [];

        // 1. 总体趋势建议
        if (overall.direction === 'degraded') {
            recommendations.push(
                `⚠️ 代码质量出现下降（${overall.scoreChangePercent.toFixed(1)}%），建议立即采取改进措施。`
            );
        } else if (overall.direction === 'improved') {
            recommendations.push(
                `✅ 代码质量持续改进（+${overall.scoreChangePercent.toFixed(1)}%），继续保持！`
            );
        }

        // 2. P0问题建议
        if (violations.P0.direction === 'degraded' && violations.P0.change > 0) {
            recommendations.push(
                `🚨 新增 ${violations.P0.change} 个P0阻断性问题，必须立即修复！`
            );
        }

        // 3. 维度下降建议
        const degradedDimensions = Object.entries(dimensions)
            .filter(([_, metric]) => metric.direction === 'degraded')
            .map(([name, _]) => name);

        if (degradedDimensions.length > 0) {
            recommendations.push(
                `📉 以下维度出现下降：${degradedDimensions.join(', ')}，建议重点关注。`
            );
        }

        // 4. 新增问题建议
        if (newIssues.length > 0) {
            const p0New = newIssues.filter((v) => v.level === 'P0').length;
            if (p0New > 0) {
                recommendations.push(`🔴 新增 ${p0New} 个P0问题，请立即处理。`);
            }
        }

        // 5. 没有建议时的默认消息
        if (recommendations.length === 0) {
            recommendations.push('✅ 代码质量保持稳定，继续保持良好的编码实践！');
        }

        return recommendations;
    }
}

