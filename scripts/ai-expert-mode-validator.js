#!/usr/bin/env node

/**
 * AI专家模式验证器
 * 功能：检查AI是否真正执行了专家模式的规则加载
 * 使用：在AI专家模式激活后运行此脚本验证
 */

const fs = require('fs');
const path = require('path');

class AIExpertModeValidator {
    constructor() {
        this.projectRoot = process.cwd();
        this.rulesDir = path.join(this.projectRoot, '.cursor', 'rules');
        this.scriptsDir = path.join(this.projectRoot, 'scripts');

        this.validationResults = {
            rulesLoaded: false,
            toolsDiscovered: false,
            complianceChecked: false,
            errors: []
        };
    }

    /**
     * 验证AI是否真正加载了项目规则
     */
    validateRulesLoading() {
        console.log('🔍 验证AI规则加载...');

        const criticalRules = [
            'git-version-control-law.mdc',
            'core-principles.mdc',
            'expert-mode.mdc',
            'development-process.mdc'
        ];

        const loadedRules = [];
        const missingRules = [];

        for (const rule of criticalRules) {
            const rulePath = path.join(this.rulesDir, rule);
            if (fs.existsSync(rulePath)) {
                const content = fs.readFileSync(rulePath, 'utf8');
                loadedRules.push({
                    file: rule,
                    size: content.length,
                    keyRequirements: this.extractKeyRequirements(rule, content)
                });
            } else {
                missingRules.push(rule);
            }
        }

        this.validationResults.rulesLoaded = missingRules.length === 0;

        if (missingRules.length > 0) {
            this.validationResults.errors.push(`缺失关键规则文件: ${missingRules.join(', ')}`);
        }

        return { loadedRules, missingRules };
    }

    /**
     * 验证AI是否发现了项目工具
     */
    validateToolsDiscovery() {
        console.log('🔍 验证AI工具发现...');

        const expectedTools = [
            'git-safe-sync.sh',
            'git-safe-sync.bat',
            'git-safe-sync.ps1',
            'deploy-quality-system.sh'
        ];

        const discoveredTools = [];
        const missingTools = [];

        for (const tool of expectedTools) {
            const toolPath = path.join(this.scriptsDir, tool);
            if (fs.existsSync(toolPath)) {
                const stats = fs.statSync(toolPath);
                discoveredTools.push({
                    file: tool,
                    size: stats.size,
                    executable: (stats.mode & parseInt('111', 8)) !== 0
                });
            } else {
                missingTools.push(tool);
            }
        }

        this.validationResults.toolsDiscovered = missingTools.length === 0;

        if (missingTools.length > 0) {
            this.validationResults.errors.push(`未发现关键工具: ${missingTools.join(', ')}`);
        }

        return { discoveredTools, missingTools };
    }

    /**
     * 检查Git操作合规性
     */
    checkGitCompliance() {
        console.log('🔍 检查Git操作合规性...');

        // 检查最近的Git操作是否符合规则
        const { execSync } = require('child_process');

        try {
            // 检查最近3个提交的提交信息格式
            const recentCommits = execSync('git log --oneline -3', { encoding: 'utf8' });
            const commits = recentCommits.trim().split('\n');

            const complianceIssues = [];

            for (const commit of commits) {
                const [hash, ...messageParts] = commit.split(' ');
                const message = messageParts.join(' ');

                // 检查提交信息格式
                if (!this.isValidCommitMessage(message)) {
                    complianceIssues.push(`提交信息格式不符合规范: ${hash} - ${message}`);
                }
            }

            // 检查是否使用了项目Git脚本
            const gitConfig = this.checkGitScriptUsage();

            this.validationResults.complianceChecked = complianceIssues.length === 0;

            if (complianceIssues.length > 0) {
                this.validationResults.errors.push(...complianceIssues);
            }

            return { commits: commits.length, issues: complianceIssues, gitConfig };

        } catch (error) {
            this.validationResults.errors.push(`Git操作检查失败: ${error.message}`);
            return { error: error.message };
        }
    }

    /**
     * 提取规则文件的关键要求
     */
    extractKeyRequirements(fileName, content) {
        const requirements = [];

        if (fileName === 'git-version-control-law.mdc') {
            const scriptMatch = content.match(/bash scripts\/git-safe-sync\.sh.*?--non-interactive --auto-commit/);
            if (scriptMatch) {
                requirements.push('必须使用项目Git脚本');
            }

            const qualityGatesMatch = content.match(/npm run (type-check|lint|build)/g);
            if (qualityGatesMatch) {
                requirements.push('必须通过质量门禁检查');
            }
        }

        if (fileName === 'core-principles.mdc') {
            const qualityMatch = content.match(/95分.*?质量标准/);
            if (qualityMatch) {
                requirements.push('必须达到95分质量标准');
            }
        }

        return requirements;
    }

    /**
     * 检查提交信息是否符合规范
     */
    isValidCommitMessage(message) {
        // 基本格式检查
        const patterns = [
            /^(feat|fix|docs|style|refactor|test|chore):/,  // 传统格式
            /^(🔧|✨|📝|🎨|♻️|✅|🔥).*?/,                    // emoji格式
            /^(自动提交|Merge|fix:)/                          // 特殊格式
        ];

        return patterns.some(pattern => pattern.test(message));
    }

    /**
     * 检查是否使用了Git脚本
     */
    checkGitScriptUsage() {
        // 这里可以检查Git钩子、别名等配置
        // 或者通过分析提交时间间隔等方式判断是否使用了脚本
        return {
            hasGitHooks: fs.existsSync(path.join(this.projectRoot, '.git', 'hooks')),
            hasGitConfig: fs.existsSync(path.join(this.projectRoot, '.git', 'config'))
        };
    }

    /**
     * 生成验证报告
     */
    generateReport() {
        console.log('\n🏆 AI专家模式验证报告');
        console.log('='.repeat(50));

        const rulesResult = this.validateRulesLoading();
        const toolsResult = this.validateToolsDiscovery();
        const complianceResult = this.checkGitCompliance();

        // 规则加载报告
        console.log('\n📋 规则加载验证:');
        console.log(`   ✅ 加载规则: ${rulesResult.loadedRules.length}个`);
        rulesResult.loadedRules.forEach(rule => {
            console.log(`      - ${rule.file} (${rule.size}字符, ${rule.keyRequirements.length}个关键要求)`);
            rule.keyRequirements.forEach(req => console.log(`        * ${req}`));
        });

        if (rulesResult.missingRules.length > 0) {
            console.log(`   ❌ 缺失规则: ${rulesResult.missingRules.join(', ')}`);
        }

        // 工具发现报告
        console.log('\n🔧 工具发现验证:');
        console.log(`   ✅ 发现工具: ${toolsResult.discoveredTools.length}个`);
        toolsResult.discoveredTools.forEach(tool => {
            console.log(`      - ${tool.file} (${tool.size}字节, ${tool.executable ? '可执行' : '不可执行'})`);
        });

        if (toolsResult.missingTools.length > 0) {
            console.log(`   ❌ 缺失工具: ${toolsResult.missingTools.join(', ')}`);
        }

        // 合规性报告
        console.log('\n⚖️ 操作合规性验证:');
        if (complianceResult.error) {
            console.log(`   ❌ 检查失败: ${complianceResult.error}`);
        } else {
            console.log(`   📊 检查提交: ${complianceResult.commits}个`);
            if (complianceResult.issues.length === 0) {
                console.log('   ✅ 所有操作符合规范');
            } else {
                console.log(`   ⚠️  发现问题: ${complianceResult.issues.length}个`);
                complianceResult.issues.forEach(issue => console.log(`      - ${issue}`));
            }
        }

        // 总体评估
        console.log('\n🎯 总体评估:');
        const score = this.calculateComplianceScore();
        console.log(`   📊 合规分数: ${score}/100`);

        if (score >= 90) {
            console.log('   🏆 AI专家模式执行优秀');
        } else if (score >= 70) {
            console.log('   ⚠️  AI专家模式执行需要改进');
        } else {
            console.log('   ❌ AI专家模式执行不合格');
        }

        // 改进建议
        if (this.validationResults.errors.length > 0) {
            console.log('\n💡 改进建议:');
            this.validationResults.errors.forEach(error => {
                console.log(`   - ${error}`);
            });
        }

        return {
            score,
            compliant: score >= 90,
            issues: this.validationResults.errors
        };
    }

    /**
     * 计算合规分数
     */
    calculateComplianceScore() {
        let score = 100;

        // 规则加载扣分
        if (!this.validationResults.rulesLoaded) score -= 30;

        // 工具发现扣分
        if (!this.validationResults.toolsDiscovered) score -= 20;

        // 操作合规扣分
        if (!this.validationResults.complianceChecked) score -= 25;

        // 每个错误扣分
        score -= this.validationResults.errors.length * 5;

        return Math.max(0, score);
    }
}

// 如果作为脚本直接运行
if (require.main === module) {
    const validator = new AIExpertModeValidator();
    const report = validator.generateReport();

    process.exit(report.compliant ? 0 : 1);
}

module.exports = AIExpertModeValidator;
