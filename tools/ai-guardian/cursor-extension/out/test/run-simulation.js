#!/usr/bin/env node
"use strict";
/**
 * AI Guardian插件功能模拟测试运行器
 * 用于验证Python脚本功能集成
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAIGuardianSimulationTest = void 0;
const simulator_1 = require("./simulator");
/**
 * 主测试函数
 */
async function main() {
    console.log('🧪 AI Guardian插件功能模拟测试');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 测试目标: 验证Python脚本功能集成');
    console.log('🎯 测试范围: 对话框关闭、ESC键、恢复策略等');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
        // 运行完整的功能演示
        await (0, simulator_1.runSimulationTest)();
        // 运行单独的组件测试
        console.log('\n🔧 开始组件单独测试...');
        const simulator = new simulator_1.AIGuardianSimulator();
        // 测试1: 对话框关闭
        console.log('\n📋 测试1: 对话框关闭功能');
        const closeResult = await simulator.simulateCloseDialogsAndModals();
        console.log(`结果: ${closeResult ? '✅ 通过' : '❌ 失败'}`);
        // 测试2: ESC键序列
        console.log('\n⌨️ 测试2: ESC键序列发送');
        const escResult = await simulator.simulateEscapeKeySequence();
        console.log(`结果: ${escResult ? '✅ 通过' : '❌ 失败'}`);
        // 测试3: 连接状态检测
        console.log('\n🔗 测试3: AI连接状态检测');
        const connected = simulator.simulateIsAIConnected();
        console.log(`结果: ${connected ? '✅ 已连接' : '❌ 未连接'}`);
        // 测试4: 恢复消息发送
        console.log('\n📤 测试4: 智能恢复消息发送');
        const messageResult = await simulator.simulateSmartSendRecoveryMessage(1);
        console.log(`结果: ${messageResult ? '✅ 通过' : '❌ 失败'}`);
        // 测试5: 新会话开启
        console.log('\n🔄 测试5: 新会话开启');
        const sessionResult = await simulator.simulateOpenNewChatSession();
        console.log(`结果: ${sessionResult ? '✅ 通过' : '❌ 失败'}`);
        // 测试6: 等待连接
        console.log('\n⏳ 测试6: 等待连接机制');
        const waitResult = await simulator.simulateWaitForConnection(3);
        console.log(`结果: ${waitResult ? '✅ 通过' : '❌ 失败'}`);
        // 测试7: 完整恢复策略
        console.log('\n⚡️ 测试7: 智能三级恢复策略');
        const recoveryResult = await simulator.simulateIntelligentRecovery();
        console.log(`结果: ${recoveryResult ? '✅ 通过' : '❌ 失败'}`);
        // 统计信息
        console.log('\n📊 测试统计信息');
        const stats = simulator.getSimulationStats();
        console.log(`  📋 执行命令总数: ${stats.commandsExecuted}`);
        console.log(`  📤 发送消息总数: ${stats.messagesSent}`);
        console.log(`  🔗 AI当前状态: ${stats.aiState.isOnline ? '在线' : '离线'}`);
        console.log(`  🔧 执行引擎状态: ${stats.aiState.engineLoaded ? '已加载' : '未加载'}`);
        // 测试结果汇总
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 测试结果汇总');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const testResults = [
            { name: '对话框关闭功能', result: closeResult },
            { name: 'ESC键序列发送', result: escResult },
            { name: 'AI连接状态检测', result: connected },
            { name: '智能恢复消息发送', result: messageResult },
            { name: '新会话开启', result: sessionResult },
            { name: '等待连接机制', result: waitResult },
            { name: '智能三级恢复策略', result: recoveryResult }
        ];
        let passedTests = 0;
        let totalTests = testResults.length;
        testResults.forEach(test => {
            const status = test.result ? '✅ 通过' : '❌ 失败';
            console.log(`  ${test.name}: ${status}`);
            if (test.result)
                passedTests++;
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📊 测试通过率: ${passedTests}/${totalTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
        if (passedTests === totalTests) {
            console.log('🎉 所有测试通过！Python脚本功能集成成功！');
        }
        else {
            console.log('⚠️ 部分测试失败，需要进一步检查');
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    catch (error) {
        console.error('❌ 测试执行失败:', error);
        process.exit(1);
    }
}
exports.runAIGuardianSimulationTest = main;
/**
 * 错误处理
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未处理的Promise拒绝:', reason);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    console.error('❌ 未捕获的异常:', error);
    process.exit(1);
});
// 运行主测试
if (require.main === module) {
    main().catch(console.error);
}
//# sourceMappingURL=run-simulation.js.map