/**
 * AI Guardian插件测试脚本
 * 用于验证插件的核心功能
 */

const vscode = require('vscode');

class AIGuardianTester {
    constructor() {
        this.testResults = [];
    }

    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🧪 AI Guardian插件 v1.2.0 自动化测试');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');

        // 测试1: 插件激活测试
        await this.testPluginActivation();

        // 测试2: 命令可用性测试
        await this.testCommandsAvailability();

        // 测试3: 自我检查功能测试
        await this.testSelfCheck();

        // 测试4: 状态栏测试
        await this.testStatusBar();

        // 测试5: 配置测试
        await this.testConfiguration();

        // 显示测试报告
        this.showTestReport();
    }

    /**
     * 测试1: 插件激活测试
     */
    async testPluginActivation() {
        console.log('📋 测试1: 插件激活测试');
        try {
            const extension = vscode.extensions.getExtension('smartabp.ai-guardian');

            if (!extension) {
                this.addResult('插件激活', false, '未找到插件');
                return;
            }

            if (!extension.isActive) {
                await extension.activate();
            }

            this.addResult('插件激活', true, `版本: ${extension.packageJSON.version}`);
        } catch (error) {
            this.addResult('插件激活', false, error.message);
        }
    }

    /**
     * 测试2: 命令可用性测试
     */
    async testCommandsAvailability() {
        console.log('📋 测试2: 命令可用性测试');

        const commands = [
            'aiGuardian.start',
            'aiGuardian.stop',
            'aiGuardian.status',
            'aiGuardian.recover',
            'aiGuardian.checkEngine',
            'aiGuardian.loadEngine',
            'aiGuardian.resetState',
            'aiGuardian.forceRestart',
            'aiGuardian.selfCheck'
        ];

        try {
            const allCommands = await vscode.commands.getCommands();

            for (const cmd of commands) {
                const exists = allCommands.includes(cmd);
                this.addResult(`命令: ${cmd}`, exists, exists ? '可用' : '不可用');
            }
        } catch (error) {
            this.addResult('命令检查', false, error.message);
        }
    }

    /**
     * 测试3: 自我检查功能测试
     */
    async testSelfCheck() {
        console.log('📋 测试3: 自我检查功能测试');

        try {
            // 执行自我检查命令
            await vscode.commands.executeCommand('aiGuardian.selfCheck');

            // 等待执行完成
            await this.sleep(2000);

            this.addResult('自我检查功能', true, '执行成功');
        } catch (error) {
            this.addResult('自我检查功能', false, error.message);
        }
    }

    /**
     * 测试4: 状态栏测试
     */
    async testStatusBar() {
        console.log('📋 测试4: 状态栏测试');

        try {
            // 执行状态命令
            await vscode.commands.executeCommand('aiGuardian.status');

            this.addResult('状态栏功能', true, '执行成功');
        } catch (error) {
            this.addResult('状态栏功能', false, error.message);
        }
    }

    /**
     * 测试5: 配置测试
     */
    async testConfiguration() {
        console.log('📋 测试5: 配置测试');

        try {
            const config = vscode.workspace.getConfiguration('aiGuardian');

            const enabled = config.get('enabled');
            const checkInterval = config.get('checkInterval');
            const offlineThreshold = config.get('offlineThreshold');
            const autoRecover = config.get('autoRecover');

            this.addResult('配置: enabled', enabled !== undefined, `值: ${enabled}`);
            this.addResult('配置: checkInterval', checkInterval !== undefined, `值: ${checkInterval}秒`);
            this.addResult('配置: offlineThreshold', offlineThreshold !== undefined, `值: ${offlineThreshold}秒`);
            this.addResult('配置: autoRecover', autoRecover !== undefined, `值: ${autoRecover}`);
        } catch (error) {
            this.addResult('配置检查', false, error.message);
        }
    }

    /**
     * 添加测试结果
     */
    addResult(testName, passed, message) {
        this.testResults.push({
            name: testName,
            passed,
            message
        });

        const icon = passed ? '✅' : '❌';
        console.log(`  ${icon} ${testName}: ${message}`);
    }

    /**
     * 显示测试报告
     */
    showTestReport() {
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 测试报告');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = total - passed;
        const passRate = ((passed / total) * 100).toFixed(2);

        console.log(`总测试数: ${total}`);
        console.log(`通过: ${passed} ✅`);
        console.log(`失败: ${failed} ❌`);
        console.log(`通过率: ${passRate}%`);
        console.log('');

        if (failed > 0) {
            console.log('❌ 失败的测试:');
            this.testResults
                .filter(r => !r.passed)
                .forEach(r => {
                    console.log(`  - ${r.name}: ${r.message}`);
                });
        } else {
            console.log('🎉 所有测试通过！');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    /**
     * 辅助函数: 延迟
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 导出测试类
module.exports = AIGuardianTester;

// 如果直接运行此脚本
if (require.main === module) {
    console.log('⚠️ 此脚本需要在VSCode扩展环境中运行');
    console.log('请在VSCode的调试控制台中执行测试');
}
