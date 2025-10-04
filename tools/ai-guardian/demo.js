#!/usr/bin/env node

/**
 * AI Guardian 功能演示脚本
 */

const fs = require('fs');
const path = require('path');

// 模拟AI Guardian的核心功能
class AIGuardianDemo {
  constructor() {
    this.checkpointDir = '.ai-engine';
    this.stateFile = path.join(this.checkpointDir, 'ai-state.json');
    this.logDir = path.join(this.checkpointDir, 'logs');
    
    this.ensureDirs();
  }

  ensureDirs() {
    [this.checkpointDir, this.logDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // 功能1: 记录AI活动
  recordActivity(activity) {
    const state = {
      lastActivity: Date.now(),
      activity: activity,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
    console.log(`✅ AI活动已记录: ${activity}`);
    return state;
  }

  // 功能2: 创建检查点
  createCheckpoint(checkpoint) {
    const fullCheckpoint = {
      ...checkpoint,
      timestamp: new Date().toISOString()
    };
    
    const checkpointFile = path.join(this.checkpointDir, `checkpoint-${Date.now()}.json`);
    fs.writeFileSync(checkpointFile, JSON.stringify(fullCheckpoint, null, 2));
    
    console.log(`💾 检查点已创建: ${checkpoint.stage}`);
    return checkpointFile;
  }

  // 功能3: 检测AI状态
  checkStatus() {
    if (!fs.existsSync(this.stateFile)) {
      return { isOnline: false, message: '无状态记录' };
    }

    const state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
    const inactiveDuration = (Date.now() - state.lastActivity) / 1000;
    const isOnline = inactiveDuration < 90; // 90秒阈值

    return {
      isOnline,
      lastActivity: new Date(state.lastActivity).toISOString(),
      inactiveDuration: Math.floor(inactiveDuration),
      activity: state.activity
    };
  }

  // 功能4: 生成恢复指令
  generateRecovery() {
    const checkpointFiles = fs.readdirSync(this.checkpointDir)
      .filter(f => f.startsWith('checkpoint-'))
      .sort()
      .reverse();

    if (checkpointFiles.length === 0) {
      return '请继续';
    }

    const latestCheckpoint = JSON.parse(
      fs.readFileSync(path.join(this.checkpointDir, checkpointFiles[0]), 'utf8')
    );

    const recovery = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 AI断线恢复指令
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

请继续执行以下任务：

📊 当前阶段: ${latestCheckpoint.stage || '未知'}
🎯 当前任务: ${latestCheckpoint.task || '未知'}
📈 完成进度: ${latestCheckpoint.progress || 0}%

✅ 已完成: ${(latestCheckpoint.completedTasks || []).join(', ') || '无'}
⏳ 待执行: ${(latestCheckpoint.pendingTasks || []).join(', ') || '无'}

📍 检查点时间: ${latestCheckpoint.timestamp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    const recoveryFile = path.join(this.logDir, `recovery-${Date.now()}.txt`);
    fs.writeFileSync(recoveryFile, recovery);
    
    console.log(`📝 恢复指令已生成: ${recoveryFile}`);
    return recovery;
  }
}

// 演示所有功能
console.log('🛡️ AI Guardian 功能演示\n');

const demo = new AIGuardianDemo();

// 1. 记录AI活动
console.log('【功能1】记录AI活动:');
demo.recordActivity('正在编写AI Guardian代码');

// 2. 创建检查点
console.log('\n【功能2】创建检查点:');
demo.createCheckpoint({
  stage: '代码实现阶段',
  task: 'AI Guardian MCP服务器开发',
  progress: 80,
  completedTasks: ['MCP服务器', 'Python守护脚本', '配置文件'],
  pendingTasks: ['单元测试', '文档完善']
});

// 3. 检查状态
console.log('\n【功能3】检查AI状态:');
const status = demo.checkStatus();
console.log(`AI状态: ${status.isOnline ? '🟢 在线' : '🔴 离线'}`);
console.log(`最后活动: ${status.lastActivity}`);
console.log(`无活动时长: ${status.inactiveDuration}秒`);
console.log(`当前活动: ${status.activity}`);

// 4. 生成恢复指令
console.log('\n【功能4】生成恢复指令:');
const recovery = demo.generateRecovery();
console.log(recovery);

console.log('\n✅ 所有功能演示完成！');
console.log('\n📁 生成的文件:');
console.log('- .ai-engine/ai-state.json (AI状态)');
console.log('- .ai-engine/checkpoint-*.json (检查点)');
console.log('- .ai-engine/logs/recovery-*.txt (恢复指令)');
