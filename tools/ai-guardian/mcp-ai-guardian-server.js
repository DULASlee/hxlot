#!/usr/bin/env node

/**
 * SmartAbp AI Guardian MCP Server
 * AI大模型断线检测与自动恢复服务
 * 
 * @author 世界顶级微服务架构师
 * @date 2025-10-04
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class AIGuardianMCP {
  constructor() {
    this.projectRoot = process.env.AI_GUARDIAN_PROJECT_ROOT || process.cwd();
    this.checkpointDir = path.join(this.projectRoot, '.ai-engine');
    this.logDir = path.join(this.checkpointDir, 'logs');
    this.stateFile = path.join(this.checkpointDir, 'ai-state.json');
    
    // AI状态追踪
    this.lastActivity = Date.now();
    this.activityHistory = [];
    this.offlineDetectionThreshold = 90000; // 90秒无活动判断为离线
    this.heartbeatInterval = 30000; // 30秒心跳间隔
    
    // 恢复机制
    this.recoveryAttempts = 0;
    this.maxRecoveryAttempts = 3;
    this.lastCheckpoint = null;
    
    this.ensureDirs();
    this.loadState();
    this.startHeartbeat();
    
    console.log('[AI Guardian] 🛡️ AI断线守护服务已启动');
  }

  ensureDirs() {
    [this.checkpointDir, this.logDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  loadState() {
    try {
      if (fs.existsSync(this.stateFile)) {
        const state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
        this.lastActivity = state.lastActivity || Date.now();
        this.lastCheckpoint = state.lastCheckpoint || null;
        this.activityHistory = state.activityHistory || [];
        console.log('[AI Guardian] ✅ 状态加载成功');
      }
    } catch (error) {
      console.error(`[AI Guardian] ⚠️ 状态加载失败: ${error.message}`);
    }
  }

  saveState() {
    try {
      const state = {
        lastActivity: this.lastActivity,
        lastCheckpoint: this.lastCheckpoint,
        activityHistory: this.activityHistory.slice(-50), // 只保留最近50条
        timestamp: new Date().toISOString()
      };
      fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2), 'utf8');
    } catch (error) {
      console.error(`[AI Guardian] ⚠️ 状态保存失败: ${error.message}`);
    }
  }

  /**
   * 记录AI活动（MCP工具调用时自动触发）
   */
  recordActivity(activity) {
    this.lastActivity = Date.now();
    this.activityHistory.push({
      activity,
      timestamp: new Date().toISOString()
    });
    
    // 重置恢复尝试计数
    this.recoveryAttempts = 0;
    
    this.saveState();
    console.log(`[AI Guardian] 📝 记录活动: ${activity}`);
  }

  /**
   * 检测AI是否离线
   */
  isAIOffline() {
    const inactiveDuration = Date.now() - this.lastActivity;
    return inactiveDuration > this.offlineDetectionThreshold;
  }

  /**
   * 创建检查点
   */
  createCheckpoint(checkpoint) {
    this.lastCheckpoint = {
      ...checkpoint,
      timestamp: new Date().toISOString()
    };
    this.saveState();
    
    // 保存详细检查点文件
    const checkpointFile = path.join(
      this.checkpointDir,
      `checkpoint-${Date.now()}.json`
    );
    fs.writeFileSync(
      checkpointFile,
      JSON.stringify(this.lastCheckpoint, null, 2),
      'utf8'
    );
    
    console.log(`[AI Guardian] 💾 检查点已创建: ${checkpoint.stage}`);
  }

  /**
   * 生成恢复指令
   */
  generateRecoveryCommand() {
    if (!this.lastCheckpoint) {
      return {
        command: '请继续',
        context: '无检查点信息'
      };
    }

    const { stage, task, progress, completedTasks, pendingTasks } = this.lastCheckpoint;
    
    const recoveryPrompt = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 AI大模型断线恢复指令
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

请继续执行以下任务：

📊 **当前阶段**: ${stage || '未知'}
🎯 **当前任务**: ${task || '未知'}
📈 **完成进度**: ${progress || 0}%

✅ **已完成任务**:
${completedTasks?.map(t => `  - ${t}`).join('\n') || '  无'}

⏳ **待执行任务**:
${pendingTasks?.map(t => `  - ${t}`).join('\n') || '  无'}

📍 **检查点时间**: ${this.lastCheckpoint.timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 **操作指引**:
1. 复制上述信息
2. 在Cursor聊天框输入"请继续"
3. 附带上述上下文信息

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    return {
      command: recoveryPrompt,
      checkpoint: this.lastCheckpoint
    };
  }

  /**
   * 尝试自动恢复
   */
  async attemptAutoRecovery() {
    if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
      console.log('[AI Guardian] ⚠️ 已达到最大恢复尝试次数，停止自动恢复');
      return { success: false, reason: '超过最大尝试次数' };
    }

    this.recoveryAttempts++;
    
    console.log(`[AI Guardian] 🔄 尝试自动恢复 (${this.recoveryAttempts}/${this.maxRecoveryAttempts})`);
    
    // 生成恢复指令
    const recovery = this.generateRecoveryCommand();
    
    // 保存恢复指令到文件
    const recoveryFile = path.join(
      this.logDir,
      `recovery-${Date.now()}.txt`
    );
    fs.writeFileSync(recoveryFile, recovery.command, 'utf8');
    
    console.log(`[AI Guardian] 📝 恢复指令已保存: ${recoveryFile}`);
    console.log('[AI Guardian] 💡 请复制以下内容到Cursor聊天框：');
    console.log(recovery.command);
    
    return {
      success: true,
      recoveryFile,
      recovery
    };
  }

  /**
   * 心跳监控
   */
  startHeartbeat() {
    setInterval(() => {
      if (this.isAIOffline()) {
        console.log('[AI Guardian] ⚠️ 检测到AI可能已离线！');
        this.autoSendContinue();
      } else {
        const inactiveDuration = Math.floor((Date.now() - this.lastActivity) / 1000);
        console.log(`[AI Guardian] 💚 AI在线 (最后活动: ${inactiveDuration}秒前)`);
      }
    }, this.heartbeatInterval);
  }

  /**
   * 自动发送"请继续"到Cursor聊天框
   */
  autoSendContinue() {
    if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
      return;
    }

    this.recoveryAttempts++;
    console.log(`[AI Guardian] 🔄 自动恢复 (${this.recoveryAttempts}/${this.maxRecoveryAttempts})`);
    
    // 通过MCP协议主动发送消息
    const notification = {
      jsonrpc: '2.0',
      method: 'notifications/message',
      params: {
        level: 'info',
        message: '请继续执行上一个任务'
      }
    };
    
    // 发送通知到Cursor
    process.stdout.write(JSON.stringify(notification) + '\n');
    console.log('[AI Guardian] ✅ 已自动发送"请继续"到聊天框');
  }

  /**
   * MCP Tools定义
   */
  getTools() {
    return [
      {
        name: 'ai_guardian_ping',
        description: 'AI活动心跳检测，记录AI工作状态',
        inputSchema: {
          type: 'object',
          properties: {
            activity: {
              type: 'string',
              description: '当前活动描述'
            }
          }
        }
      },
      {
        name: 'ai_guardian_checkpoint',
        description: '创建执行检查点，用于断线恢复',
        inputSchema: {
          type: 'object',
          properties: {
            stage: { type: 'string', description: '执行阶段' },
            task: { type: 'string', description: '当前任务' },
            progress: { type: 'number', description: '进度百分比' },
            completedTasks: { type: 'array', description: '已完成任务列表' },
            pendingTasks: { type: 'array', description: '待执行任务列表' }
          },
          required: ['stage', 'task']
        }
      },
      {
        name: 'ai_guardian_status',
        description: '获取AI在线状态和活动历史',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'ai_guardian_recover',
        description: '生成AI断线恢复指令',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ];
  }

  /**
   * MCP Tool调用处理
   */
  async handleToolCall(name, args) {
    switch (name) {
      case 'ai_guardian_ping':
        this.recordActivity(args.activity || '未知活动');
        return {
          status: 'online',
          lastActivity: new Date(this.lastActivity).toISOString(),
          message: 'AI活动已记录'
        };

      case 'ai_guardian_checkpoint':
        this.createCheckpoint(args);
        return {
          success: true,
          checkpoint: this.lastCheckpoint,
          message: '检查点已创建'
        };

      case 'ai_guardian_status':
        return {
          isOnline: !this.isAIOffline(),
          lastActivity: new Date(this.lastActivity).toISOString(),
          inactiveDuration: Math.floor((Date.now() - this.lastActivity) / 1000),
          activityHistory: this.activityHistory.slice(-10),
          lastCheckpoint: this.lastCheckpoint
        };

      case 'ai_guardian_recover':
        const recovery = await this.attemptAutoRecovery();
        return recovery;

      default:
        return { error: `未知工具: ${name}` };
    }
  }

  /**
   * MCP标准协议处理
   */
  async handleMessage(message) {
    const { method, params } = message;

    switch (method) {
      case 'initialize':
        return {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'ai-guardian',
            version: '1.0.0'
          },
          capabilities: {
            tools: {}
          }
        };

      case 'tools/list':
        return { tools: this.getTools() };

      case 'tools/call':
        const { name, arguments: args } = params;
        const result = await this.handleToolCall(name, args);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };

      default:
        throw new Error(`未知方法: ${method}`);
    }
  }
}

// 启动MCP服务器
const server = new AIGuardianMCP();

// 处理stdin/stdout MCP协议
process.stdin.setEncoding('utf8');
let buffer = '';

process.stdin.on('data', async (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (!line.trim()) continue;

    try {
      const message = JSON.parse(line);
      const response = await server.handleMessage(message);
      
      const responseMessage = {
        jsonrpc: '2.0',
        id: message.id,
        result: response
      };
      
      process.stdout.write(JSON.stringify(responseMessage) + '\n');
    } catch (error) {
      const errorMessage = {
        jsonrpc: '2.0',
        id: message?.id,
        error: {
          code: -32603,
          message: error.message
        }
      };
      
      process.stdout.write(JSON.stringify(errorMessage) + '\n');
    }
  }
});

process.stdin.on('end', () => {
  console.log('[AI Guardian] 🛡️ AI断线守护服务已停止');
  process.exit(0);
});

// 优雅退出
process.on('SIGINT', () => {
  server.saveState();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.saveState();
  process.exit(0);
});

