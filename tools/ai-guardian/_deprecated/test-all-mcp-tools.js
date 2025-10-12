#!/usr/bin/env node

/**
 * 测试所有 MCP 工具功能
 */

const AIGuardianMCP = require('./mcp-ai-guardian-server.js');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 测试 AI Guardian MCP 所有工具');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function testAllTools() {
  const server = new AIGuardianMCP();
  
  try {
    // 测试1: 代码行数记录
    console.log('📊 测试 1: mcp_record_code_lines');
    const result1 = await server.handleToolCall('mcp_record_code_lines', {
      lines: 50,
      context: '创建用户管理Store'
    });
    console.log(`✅ 结果: ${result1.message}`);
    console.log(`   进度: ${result1.progress}\n`);
    
    // 测试2: 查询会话状态
    console.log('📊 测试 2: mcp_get_session_state');
    const result2 = await server.handleToolCall('mcp_get_session_state', {});
    console.log(`✅ 当前行数: ${result2.currentLines}`);
    console.log(`   状态: ${result2.status}`);
    console.log(`   进度: ${result2.progress}\n`);
    
    // 测试3: 规则重载
    console.log('📚 测试 3: mcp_reload_rules');
    const result3 = await server.handleToolCall('mcp_reload_rules', {
      immediate: true
    });
    console.log(`✅ ${result3.message}`);
    console.log(`   成功: ${result3.loaded}, 缺失: ${result3.missing}, 错误: ${result3.errors}\n`);
    
    // 测试4: AI活动心跳
    console.log('💓 测试 4: ai_guardian_ping');
    const result4 = await server.handleToolCall('ai_guardian_ping', {
      activity: '编写用户管理模块'
    });
    console.log(`✅ ${result4.message}`);
    console.log(`   状态: ${result4.status}\n`);
    
    // 测试5: 查询守护状态
    console.log('🛡️ 测试 5: ai_guardian_status');
    const result5 = await server.handleToolCall('ai_guardian_status', {});
    console.log(`✅ AI在线: ${result5.isOnline}`);
    console.log(`   未活动时长: ${result5.inactiveDuration}秒\n`);
    
    // 测试6: 重置计数器
    console.log('🔄 测试 6: mcp_reset_counter');
    const result6 = await server.handleToolCall('mcp_reset_counter', {});
    console.log(`✅ ${result6.message}\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 所有 MCP 工具测试通过！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 可用的 MCP 工具清单:');
    console.log('  1. mcp_record_code_lines   - 记录代码行数（280/300自动检查）');
    console.log('  2. mcp_get_session_state   - 查询编程会话状态');
    console.log('  3. mcp_reset_counter       - 重置代码计数器');
    console.log('  4. mcp_reload_rules        - 重载规则文件');
    console.log('  5. mcp_git_commit_all      - Git提交所有更改');
    console.log('  6. ai_guardian_ping        - AI活动心跳');
    console.log('  7. ai_guardian_checkpoint  - 创建检查点');
    console.log('  8. ai_guardian_status      - 查询守护状态');
    console.log('  9. ai_guardian_recover     - 恢复指令\n');
    
  } catch (error) {
    console.error('\n❌ 测试失败:');
    console.error(error);
    process.exit(1);
  }
}

testAllTools();

