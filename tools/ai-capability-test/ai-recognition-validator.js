#!/usr/bin/env node

/**
 * AI增量开发能力识别验证器
 * 用于测试和验证AI是否能自动识别和使用增量开发能力
 */

const fs = require('fs');
const path = require('path');

class AIRecognitionValidator {
    constructor() {
        this.testCases = this.loadTestCases();
        this.results = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            details: []
        };
    }

    /**
     * 加载测试用例
     */
    loadTestCases() {
        const testCasesPath = path.join(__dirname, 'test-cases.json');
        if (!fs.existsSync(testCasesPath)) {
            throw new Error('测试用例文件不存在');
        }
        return JSON.parse(fs.readFileSync(testCasesPath, 'utf-8'));
    }

    /**
     * 执行所有测试
     */
    async runAllTests() {
        console.log('🧪 开始AI增量开发能力识别测试...\n');

        for (const testSuite of this.testCases.testSuites) {
            console.log(`📋 测试套件: ${testSuite.name}`);
            console.log(`📝 描述: ${testSuite.description}\n`);

            for (const testCase of testSuite.testCases) {
                await this.runSingleTest(testCase);
            }
            console.log('');
        }

        this.generateReport();
    }

    /**
     * 执行单个测试用例
     */
    async runSingleTest(testCase) {
        console.log(`  🔍 测试用例: ${testCase.name}`);
        console.log(`  📥 用户输入: "${testCase.userInput}"`);

        this.results.totalTests++;

        const testResult = {
            id: testCase.id,
            name: testCase.name,
            userInput: testCase.userInput,
            passed: false,
            score: 0,
            details: {}
        };

        try {
            // 模拟AI响应分析
            const aiResponse = this.simulateAIResponse(testCase);
            
            // 验证触发词识别
            testResult.details.triggerRecognition = this.validateTriggerRecognition(
                testCase, aiResponse
            );

            // 验证命令执行
            testResult.details.commandExecution = this.validateCommandExecution(
                testCase, aiResponse
            );

            // 验证响应格式
            testResult.details.responseFormat = this.validateResponseFormat(
                testCase, aiResponse
            );

            // 验证代码质量
            testResult.details.codeQuality = this.validateCodeQuality(
                testCase, aiResponse
            );

            // 验证兼容性
            testResult.details.compatibility = this.validateCompatibility(
                testCase, aiResponse
            );

            // 计算总分
            testResult.score = this.calculateScore(testResult.details);
            testResult.passed = testResult.score >= 70; // 70分及格

            if (testResult.passed) {
                this.results.passedTests++;
                console.log(`  ✅ 通过 (得分: ${testResult.score})`);
            } else {
                this.results.failedTests++;
                console.log(`  ❌ 失败 (得分: ${testResult.score})`);
            }

        } catch (error) {
            testResult.error = error.message;
            this.results.failedTests++;
            console.log(`  ❌ 错误: ${error.message}`);
        }

        this.results.details.push(testResult);
    }

    /**
     * 模拟AI响应（实际使用时需要真实的AI交互）
     */
    simulateAIResponse(testCase) {
        // 这里模拟AI的响应，实际使用时需要与真实AI交互
        const mockResponse = {
            recognizedTriggers: [],
            executedCommands: [],
            responseFormat: '',
            generatedCode: '',
            qualityChecks: []
        };

        // 模拟触发词识别
        if (testCase.expectedTriggers) {
            testCase.expectedTriggers.forEach(trigger => {
                if (testCase.userInput.includes(trigger)) {
                    mockResponse.recognizedTriggers.push(trigger);
                }
            });
        }

        // 模拟命令执行
        if (testCase.expectedCommands) {
            // 在实际场景中，这里应该检查AI是否真的执行了这些命令
            mockResponse.executedCommands = testCase.expectedCommands.slice(0, 2); // 模拟部分执行
        }

        // 模拟响应格式
        if (testCase.expectedResponseSections) {
            mockResponse.responseFormat = testCase.expectedResponseSections.join('\n');
        }

        return mockResponse;
    }

    /**
     * 验证触发词识别
     */
    validateTriggerRecognition(testCase, aiResponse) {
        const expected = testCase.expectedTriggers || [];
        const recognized = aiResponse.recognizedTriggers || [];
        
        const recognitionRate = expected.length > 0 ? 
            (recognized.length / expected.length) * 100 : 100;

        return {
            expected: expected,
            recognized: recognized,
            rate: recognitionRate,
            score: this.getScoreByRate(recognitionRate)
        };
    }

    /**
     * 验证命令执行
     */
    validateCommandExecution(testCase, aiResponse) {
        const expected = testCase.expectedCommands || [];
        const executed = aiResponse.executedCommands || [];
        
        const executionRate = expected.length > 0 ? 
            (executed.length / expected.length) * 100 : 100;

        return {
            expected: expected,
            executed: executed,
            rate: executionRate,
            score: this.getScoreByRate(executionRate)
        };
    }

    /**
     * 验证响应格式
     */
    validateResponseFormat(testCase, aiResponse) {
        const expected = testCase.expectedResponseSections || [];
        const actual = aiResponse.responseFormat || '';
        
        let matchCount = 0;
        expected.forEach(section => {
            if (actual.includes(section)) {
                matchCount++;
            }
        });

        const formatRate = expected.length > 0 ? 
            (matchCount / expected.length) * 100 : 100;

        return {
            expected: expected,
            matchCount: matchCount,
            rate: formatRate,
            score: this.getScoreByRate(formatRate)
        };
    }

    /**
     * 验证代码质量
     */
    validateCodeQuality(testCase, aiResponse) {
        const expected = testCase.qualityChecks || [];
        const checks = aiResponse.qualityChecks || [];
        
        // 模拟质量检查结果
        const passedChecks = Math.min(checks.length, expected.length);
        const qualityRate = expected.length > 0 ? 
            (passedChecks / expected.length) * 100 : 100;

        return {
            expected: expected,
            passed: passedChecks,
            rate: qualityRate,
            score: this.getScoreByRate(qualityRate)
        };
    }

    /**
     * 验证兼容性
     */
    validateCompatibility(testCase, aiResponse) {
        // 模拟兼容性检查
        const compatibilityScore = 90; // 假设90%兼容

        return {
            score: compatibilityScore,
            issues: [] // 兼容性问题列表
        };
    }

    /**
     * 根据比率获取分数
     */
    getScoreByRate(rate) {
        if (rate >= 90) return 100;
        if (rate >= 80) return 85;
        if (rate >= 70) return 75;
        if (rate >= 60) return 65;
        return 50;
    }

    /**
     * 计算总分
     */
    calculateScore(details) {
        const weights = this.testCases.evaluationCriteria;
        let totalScore = 0;
        let totalWeight = 0;

        // 触发词识别 (25%)
        if (details.triggerRecognition) {
            totalScore += details.triggerRecognition.score * 0.25;
            totalWeight += 0.25;
        }

        // 命令执行 (25%)
        if (details.commandExecution) {
            totalScore += details.commandExecution.score * 0.25;
            totalWeight += 0.25;
        }

        // 响应格式 (20%)
        if (details.responseFormat) {
            totalScore += details.responseFormat.score * 0.20;
            totalWeight += 0.20;
        }

        // 代码质量 (20%)
        if (details.codeQuality) {
            totalScore += details.codeQuality.score * 0.20;
            totalWeight += 0.20;
        }

        // 兼容性 (10%)
        if (details.compatibility) {
            totalScore += details.compatibility.score * 0.10;
            totalWeight += 0.10;
        }

        return totalWeight > 0 ? Math.round(totalScore / totalWeight * 100) : 0;
    }

    /**
     * 生成测试报告
     */
    generateReport() {
        console.log('\n📊 AI增量开发能力识别测试报告');
        console.log('=====================================');
        
        const passRate = this.results.totalTests > 0 ? 
            (this.results.passedTests / this.results.totalTests * 100).toFixed(1) : 0;

        console.log(`📈 总体统计:`);
        console.log(`   总测试数: ${this.results.totalTests}`);
        console.log(`   通过数: ${this.results.passedTests}`);
        console.log(`   失败数: ${this.results.failedTests}`);
        console.log(`   通过率: ${passRate}%`);

        // 按测试套件分组显示结果
        const suiteResults = {};
        this.results.details.forEach(result => {
            const suiteId = result.id.split('-')[0];
            if (!suiteResults[suiteId]) {
                suiteResults[suiteId] = { passed: 0, total: 0, scores: [] };
            }
            suiteResults[suiteId].total++;
            suiteResults[suiteId].scores.push(result.score);
            if (result.passed) {
                suiteResults[suiteId].passed++;
            }
        });

        console.log('\n📋 分类结果:');
        Object.entries(suiteResults).forEach(([suiteId, stats]) => {
            const avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
            const passRate = (stats.passed / stats.total * 100).toFixed(1);
            console.log(`   ${suiteId}: ${stats.passed}/${stats.total} (${passRate}%) 平均分: ${avgScore.toFixed(1)}`);
        });

        // 详细结果
        console.log('\n📝 详细结果:');
        this.results.details.forEach(result => {
            console.log(`\n   ${result.id} - ${result.name}`);
            console.log(`   得分: ${result.score} ${result.passed ? '✅' : '❌'}`);
            
            if (result.details.triggerRecognition) {
                console.log(`   触发词识别: ${result.details.triggerRecognition.rate.toFixed(1)}%`);
            }
            if (result.details.commandExecution) {
                console.log(`   命令执行: ${result.details.commandExecution.rate.toFixed(1)}%`);
            }
            if (result.details.responseFormat) {
                console.log(`   响应格式: ${result.details.responseFormat.rate.toFixed(1)}%`);
            }
        });

        // 改进建议
        this.generateImprovementSuggestions();

        // 保存报告到文件
        this.saveReportToFile();
    }

    /**
     * 生成改进建议
     */
    generateImprovementSuggestions() {
        console.log('\n💡 改进建议:');

        const failedTests = this.results.details.filter(r => !r.passed);
        
        if (failedTests.length === 0) {
            console.log('   🎉 所有测试都通过了！AI增量开发能力识别表现优秀。');
            return;
        }

        // 分析失败原因
        const issues = {
            triggerRecognition: 0,
            commandExecution: 0,
            responseFormat: 0,
            codeQuality: 0
        };

        failedTests.forEach(test => {
            if (test.details.triggerRecognition?.score < 70) issues.triggerRecognition++;
            if (test.details.commandExecution?.score < 70) issues.commandExecution++;
            if (test.details.responseFormat?.score < 70) issues.responseFormat++;
            if (test.details.codeQuality?.score < 70) issues.codeQuality++;
        });

        if (issues.triggerRecognition > 0) {
            console.log('   🔍 触发词识别需要改进:');
            console.log('      - 检查.cursorrules中的触发词映射表');
            console.log('      - 添加更多触发词变体');
            console.log('      - 强化触发词识别规则');
        }

        if (issues.commandExecution > 0) {
            console.log('   ⚙️ 命令执行需要改进:');
            console.log('      - 确保命令路径正确');
            console.log('      - 简化复杂的命令序列');
            console.log('      - 添加命令执行验证');
        }

        if (issues.responseFormat > 0) {
            console.log('   📝 响应格式需要改进:');
            console.log('      - 强化格式要求的表述');
            console.log('      - 提供更详细的格式示例');
            console.log('      - 添加格式验证检查点');
        }

        if (issues.codeQuality > 0) {
            console.log('   🏗️ 代码质量需要改进:');
            console.log('      - 完善质量检查标准');
            console.log('      - 加强模板库建设');
            console.log('      - 提升兼容性验证');
        }
    }

    /**
     * 保存报告到文件
     */
    saveReportToFile() {
        const reportPath = path.join(__dirname, 'results');
        if (!fs.existsSync(reportPath)) {
            fs.mkdirSync(reportPath, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `ai-recognition-test-${timestamp}.json`;
        const filePath = path.join(reportPath, fileName);

        fs.writeFileSync(filePath, JSON.stringify(this.results, null, 2), 'utf-8');
        console.log(`\n💾 测试报告已保存: ${filePath}`);
    }
}

// 命令行接口
if (require.main === module) {
    const validator = new AIRecognitionValidator();
    validator.runAllTests().catch(console.error);
}

module.exports = AIRecognitionValidator;