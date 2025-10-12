#!/usr/bin/env node

/**
 * 测试280行检查点
 */

const MCPScriptExecutor = require('./mcp-script-executor.js');

async function test() {
    console.log('🧪 测试280行自动轻量检查\n');

    const server = new MCPScriptExecutor({ testMode: true });

    console.log('✍️ 步骤1: AI编写250行代码');
    let result = await server.handleToolCall('mcp_record_code_lines', {
        lines: 250,
        context: '创建大型组件'
    });
    console.log(`   结果: ${result.message}`);
    console.log(`   进度: ${result.currentLines}/300\n`);

    console.log('✍️ 步骤2: AI再编写40行代码（总计290行，触发280行检查）');
    result = await server.handleToolCall('mcp_record_code_lines', {
        lines: 40,
        context: '添加更多功能'
    });
    console.log(`   自动执行: ${result.autoExecuted ? '是' : '否'}`);
    if (result.actions && result.actions.length > 0) {
        result.actions.forEach((action, i) => {
            console.log(`   动作${i + 1}: ${action.type}`);
            console.log(`   结果: ${action.message}`);
            console.log(`   检查项: ${action.result.checks ? action.result.checks.join(', ') : 'N/A'}`);
        });
    }
    console.log(`   进度: ${result.currentLines}/300\n`);

    console.log('✍️ 步骤3: AI继续编写10行代码（总计300行，触发质量门禁）');
    result = await server.handleToolCall('mcp_record_code_lines', {
        lines: 10,
        context: '完成功能'
    });
    console.log(`   自动执行: ${result.autoExecuted ? '是' : '否'}`);
    if (result.actions && result.actions.length > 0) {
        result.actions.forEach((action, i) => {
            console.log(`   动作${i + 1}: ${action.type}`);
            console.log(`   结果: ${action.message}`);
        });
    }
    console.log(`   进度: ${result.currentLines}/300\n`);

    // 查看检查点历史
    console.log('📊 检查点历史:');
    result = await server.handleToolCall('mcp_get_session_state', {});
    result.checkpointHistory.forEach((cp, i) => {
        console.log(`   ${i + 1}. ${cp.type} - ${cp.lines}行 - ${cp.result} - ${cp.timestamp}`);
    });

    server.dispose();

    console.log('\n🎉 280行检查点测试完成！');
}

test().catch(error => {
    console.error('💥 测试失败:', error);
    console.error(error.stack);
    process.exit(1);
});

