// 测试MCP服务器是否正常工作
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动MCP服务器测试...');

// 启动MCP服务器进程
const mcpProcess = spawn('node', ['tools/ai-guardian/mcp-script-executor.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: process.cwd()
});

// 发送初始化消息
setTimeout(() => {
  const initMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  console.log('📤 发送初始化消息:', JSON.stringify(initMessage));
  mcpProcess.stdin.write(JSON.stringify(initMessage) + '\n');

  // 监听响应
  mcpProcess.stdout.on('data', (data) => {
    const response = data.toString().trim();
    console.log('📥 收到响应:', response);

    if (response.includes('tools/list')) {
      // 发送tools/list请求
      const listMessage = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };
      console.log('📤 发送tools/list消息:', JSON.stringify(listMessage));
      mcpProcess.stdin.write(JSON.stringify(listMessage) + '\n');
    }
  });

  mcpProcess.stderr.on('data', (data) => {
    console.error('❌ 错误:', data.toString());
  });

  // 5秒后退出
  setTimeout(() => {
    console.log('⏹️ 测试完成，退出');
    mcpProcess.kill();
    process.exit(0);
  }, 5000);

}, 1000);
