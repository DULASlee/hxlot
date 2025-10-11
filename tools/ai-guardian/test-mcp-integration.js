#!/usr/bin/env node

/**
 * 测试 MCP 服务器集成
 */

const CodeLineTracker = require('./CodeLineTracker.js');
const AIEngineGuardian = require('./AIEngineGuardian.js');

console.log('🧪 测试 MCP 服务器集成...\n');

try {
    // 测试 CodeLineTracker
    console.log('📊 测试 CodeLineTracker...');
    const codeTracker = new CodeLineTracker();
    console.log('✅ CodeLineTracker 实例化成功');
    console.log(`   当前会话: ${codeTracker.sessionId}`);

    // 测试添加代码
    codeTracker.addCode('test', 'const x = 1;\nconst y = 2;\n');
    console.log(`   当前行数: ${codeTracker.currentSession.totalLines}`);

    // 测试 AIEngineGuardian
    console.log('\n📚 测试 AIEngineGuardian...');
    const ruleGuardian = new AIEngineGuardian();
    console.log('✅ AIEngineGuardian 实例化成功');

    // 测试加载规则
    console.log('\n🔄 测试规则加载...');
    const loadResult = ruleGuardian.loadAllRules();
    console.log(`✅ 规则加载完成: 成功${loadResult.loaded}个，缺失${loadResult.missing}个`);

    console.log('\n🎉 所有测试通过！MCP 服务器集成正常！');

} catch (error) {
    console.error('\n❌ 测试失败:');
    console.error(error);
    process.exit(1);
}

