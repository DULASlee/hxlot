#!/usr/bin/env node

/**
 * 测试完整的增量编程工作流
 */

const MCPScriptExecutor = require('./mcp-script-executor.js');

async function test() {
    console.log('🧪 测试完整增量编程工作流\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('场景: AI开发3个任务，每个任务300行，最后Git提交');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const server = new MCPScriptExecutor({ testMode: true });

    // ========================================
    // 第一个任务: 用户管理模块 (300行)
    // ========================================
    console.log('📋 【任务1】开发用户管理模块\n');

    console.log('✍️ 步骤1: AI编写50行代码 (创建UserStore)');
    let result = await server.handleToolCall('mcp_record_code_lines', {
        lines: 50,
        context: '创建UserStore基础结构'
    });
    console.log(`   结果: ${result.message}`);
    console.log(`   进度: ${result.currentLines}/300\n`);

    console.log('✍️ 步骤2: AI编写100行代码 (实现CRUD)');
    result = await server.handleToolCall('mcp_record_code_lines', {
        lines: 100,
        context: '实现用户CRUD操作'
    });
    console.log(`   结果: ${result.message}`);
    console.log(`   进度: ${result.currentLines}/300\n`);

    console.log('✍️ 步骤3: AI编写150行代码 (添加权限管理)');
    result = await server.handleToolCall('mcp_record_code_lines', {
        lines: 150,
        context: '添加角色权限管理'
    });
    console.log(`   自动执行: ${result.autoExecuted ? '是' : '否'}`);
    if (result.actions && result.actions.length > 0) {
        result.actions.forEach((action, i) => {
            console.log(`   动作${i + 1}: ${action.type}`);
            console.log(`   结果: ${action.message}`);
        });
    }
    console.log(`   进度: ${result.currentLines}/300\n`);

    // ========================================
    // 第二个任务: 文章管理模块 (300行)
    // ========================================
    console.log('📋 【任务2】开发文章管理模块\n');

    console.log('✍️ 步骤1: AI编写80行代码 (创建ArticleStore)');
    result = await server.handleToolCall('mcp_record_code_lines', {
        lines: 80,
        context: '创建ArticleStore'
    });
    console.log(`   结果: ${result.message}`);
    console.log(`   进度: ${result.currentLines}/300\n`);

    console.log('✍️ 步骤2: AI编写220行代码 (富文本编辑器集成)');
    result = await server.handleToolCall('mcp_record_code_lines', {
        lines: 220,
        context: '集成富文本编辑器'
    });
    console.log(`   自动执行: ${result.autoExecuted ? '是' : '否'}`);
    if (result.actions && result.actions.length > 0) {
        result.actions.forEach((action, i) => {
            console.log(`   动作${i + 1}: ${action.type}`);
            console.log(`   结果: ${action.message}`);
        });
    }
    console.log(`   进度: ${result.currentLines}/300\n`);

    // ========================================
    // 第三个任务: 评论系统 (150行)
    // ========================================
    console.log('📋 【任务3】开发评论系统\n');

    console.log('✍️ 步骤1: AI编写150行代码 (完成评论功能)');
    result = await server.handleToolCall('mcp_record_code_lines', {
        lines: 150,
        context: '实现评论功能'
    });
    console.log(`   结果: ${result.message}`);
    console.log(`   进度: ${result.currentLines}/300\n`);

    // ========================================
    // 所有任务完成，准备Git提交
    // ========================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 所有TODO任务已完成\n');

    console.log('📊 最终状态查询:');
    result = await server.handleToolCall('mcp_get_session_state', {});
    console.log(`   会话ID: ${result.sessionId}`);
    console.log(`   当前行数: ${result.currentLines}/300`);
    console.log(`   状态: ${result.status}`);
    console.log(`   检查点数量: ${result.checkpointHistory.length}\n`);

    console.log('📦 准备Git提交（模拟）');
    console.log('   注意: 实际项目中不会真正执行Git提交\n');

    // 模拟Git提交（实际不执行）
    console.log('   [跳过] mcp_git_commit_all("feat: 完成用户、文章、评论模块")');
    console.log('   ✅ 会话将被重置，可以开始新的开发任务\n');

    // 清理
    server.dispose();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 增量编程工作流测试完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

test().catch(error => {
    console.error('💥 测试失败:', error);
    console.error(error.stack);
    process.exit(1);
});

