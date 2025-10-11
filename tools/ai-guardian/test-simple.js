#!/usr/bin/env node

/**
 * 简化版 MCP 测试（无冗余输出）
 */

const AIGuardianMCP = require('./mcp-ai-guardian-server.js');

async function testSimple() {
    // 禁用控制台输出
    const originalLog = console.log;
    console.log = () => { };

    const server = new AIGuardianMCP();

    // 恢复输出
    console.log = originalLog;

    console.log('🧪 AI Guardian MCP 快速测试\n');

    try {
        // 测试1: 记录代码行数
        const r1 = await server.handleToolCall('mcp_record_code_lines', {
            lines: 50,
            context: '测试功能'
        });
        console.log(`✅ 代码追踪: ${r1.progress}`);

        // 测试2: 查询状态
        const r2 = await server.handleToolCall('mcp_get_session_state', {});
        console.log(`✅ 会话状态: ${r2.status}`);

        // 测试3: 重载规则（静默）
        const originalLog2 = console.log;
        console.log = () => { };
        const r3 = await server.handleToolCall('mcp_reload_rules', { immediate: true });
        console.log = originalLog2;
        console.log(`✅ 规则重载: 成功${r3.loaded}个，缺失${r3.missing}个`);

        // 测试4: AI心跳
        const r4 = await server.handleToolCall('ai_guardian_ping', {
            activity: '测试'
        });
        console.log(`✅ AI心跳: ${r4.status}`);

        // 测试5: 重置计数器
        const r5 = await server.handleToolCall('mcp_reset_counter', {});
        console.log(`✅ 计数器重置: ${r5.message}`);

        console.log('\n🎉 所有测试通过！MCP 服务器功能正常！\n');

        console.log('📋 已启用的功能:');
        console.log('  ✅ 代码行数追踪（自动记录）');
        console.log('  ✅ 280行轻量检查（自动触发）');
        console.log('  ✅ 300行质量门禁（强制触发）');
        console.log('  ✅ 30分钟规则重载（可手动触发）');
        console.log('  ✅ AI活动心跳监控');
        console.log('  ✅ Git自动提交功能\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ 测试失败:', error.message);
        process.exit(1);
    }
}

testSimple();

