#!/usr/bin/env node

/**
 * 测试增量编程功能
 */

const MCPScriptExecutor = require('./mcp-script-executor.js');

async function test() {
    console.log('🧪 测试增量编程功能...\n');

    const server = new MCPScriptExecutor();

    // 测试1: 获取初始状态
    console.log('📊 测试1: 获取会话状态');
    let result = await server.handleToolCall('mcp_get_session_state', {});
    console.log('当前状态:', result.progress, '- 状态:', result.status);
    console.log('');

    // 测试2: 记录少量代码（50行）
    console.log('✍️ 测试2: AI编写50行代码');
    result = await server.handleToolCall('mcp_record_code_lines', {
        lines: 50,
        context: '创建UserStore'
    });
    console.log('结果:', result.message);
    console.log('');

    // 测试3: 继续编写代码（100行）
    console.log('✍️ 测试3: AI编写100行代码');
    result = await server.handleToolCall('mcp_record_code_lines', {
        lines: 100,
        context: '实现登录功能'
    });
    console.log('结果:', result.message);
    console.log('');

    // 测试4: 达到280行阈值
    console.log('⚠️ 测试4: AI编写150行代码（总计应该达到300行）');
    result = await server.handleToolCall('mcp_record_code_lines', {
        lines: 150,
        context: '添加用户管理功能'
    });
    console.log('结果:', result.message);
    console.log('有警告吗?', result.needsAction);
    if (result.warnings) {
        result.warnings.forEach(w => {
            console.log(`  - ${w.type}: ${w.message}`);
        });
    }
    console.log('');

    // 测试5: 获取当前状态
    console.log('📊 测试5: 查看最终状态');
    result = await server.handleToolCall('mcp_get_session_state', {});
    console.log('当前状态:', result.progress);
    console.log('状态:', result.status);
    console.log('检查点历史:');
    result.checkpointHistory.forEach((cp, i) => {
        console.log(`  ${i + 1}. ${cp.type} - ${cp.lines}行 - ${cp.timestamp}`);
    });
    console.log('');

    // 测试6: 重置计数器
    console.log('🔄 测试6: 重置计数器（模拟质量门禁通过）');
    result = await server.handleToolCall('mcp_reset_counter', {});
    console.log('结果:', result.message);
    console.log('新计数:', result.newCount);
    console.log('');

    // 测试7: 确认重置成功
    console.log('📊 测试7: 确认重置后的状态');
    result = await server.handleToolCall('mcp_get_session_state', {});
    console.log('当前状态:', result.progress, '- 状态:', result.status);
    console.log('');

    // 清理
    server.dispose();

    console.log('🎉 增量编程功能测试完成！');
}

test().catch(error => {
    console.error('💥 测试失败:', error);
    process.exit(1);
});

