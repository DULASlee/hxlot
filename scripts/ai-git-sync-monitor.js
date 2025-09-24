#!/usr/bin/env node

/**
 * 🔥 第十一重爆雷：AI Git智能同步监控器
 * 自动监控30分钟定时同步和任务节点完成触发
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitSyncMonitor {
  constructor() {
    this.GIT_SYNC_INTERVAL = 30 * 60 * 1000; // 30分钟
    this.lastSyncTime = this.getLastSyncTime();
    this.syncHistory = this.loadSyncHistory();
    this.failedAttempts = 0;
    this.isRunning = false;
    
    // 任务完成触发器列表
    this.TASK_COMPLETION_TRIGGERS = [
      'BUG修复完成',
      '功能开发完成',
      '代码重构完成',
      '测试用例完成',
      '文档更新完成',
      '架构决策完成',
      'ADR文档创建完成',
      '模板创建完成',
      '配置更新完成',
      '依赖更新完成'
    ];
    
    this.initializeMonitor();
  }
  
  /**
   * 初始化监控器
   */
  initializeMonitor() {
    console.log('🔥 第十一重爆雷：Git智能同步监控器启动');
    console.log(`⏰ 同步间隔: ${this.GIT_SYNC_INTERVAL / 60000} 分钟`);
    console.log(`📊 上次同步: ${new Date(this.lastSyncTime).toLocaleString()}`);
    
    // 启动定时检查
    this.startTimedMonitoring();
    
    // 启动文件变化监控
    this.startFileChangeMonitoring();
    
    // 注册进程退出清理
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }
  
  /**
   * 启动定时监控
   */
  startTimedMonitoring() {
    setInterval(() => {
      this.checkTimedTrigger();
    }, 60000); // 每分钟检查一次
    
    // 立即检查一次
    setTimeout(() => this.checkTimedTrigger(), 5000);
  }
  
  /**
   * 检查时间触发器
   */
  checkTimedTrigger() {
    const currentTime = Date.now();
    const timeSinceLastSync = currentTime - this.lastSyncTime;
    
    if (timeSinceLastSync >= this.GIT_SYNC_INTERVAL) {
      const minutesSinceSync = Math.floor(timeSinceLastSync / 60000);
      console.log(`🔥 第十一重爆雷触发：距离上次同步已过 ${minutesSinceSync} 分钟`);
      
      this.executeGitSync('timed', {
        reason: '30分钟定时同步',
        minutesSinceLastSync: minutesSinceSync
      });
    }
  }
  
  /**
   * 检查任务完成触发器
   */
  checkTaskTrigger(taskType) {
    if (this.TASK_COMPLETION_TRIGGERS.includes(taskType)) {
      console.log(`🔥 第十一重爆雷触发：任务完成 - ${taskType}`);
      
      this.executeGitSync('task-completion', {
        reason: `${taskType}任务完成`,
        taskType: taskType
      });
      
      return true;
    }
    
    return false;
  }
  
  /**
   * 启动文件变化监控
   */
  startFileChangeMonitoring() {
    const projectRoot = process.cwd();
    const watchPaths = [
      path.join(projectRoot, 'src'),
      path.join(projectRoot, 'docs'),
      path.join(projectRoot, '.cursor'),
      path.join(projectRoot, 'scripts')
    ];
    
    watchPaths.forEach(watchPath => {
      if (fs.existsSync(watchPath)) {
        fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
          if (filename && this.isSignificantFile(filename)) {
            this.handleFileChange(eventType, filename);
          }
        });
      }
    });
  }
  
  /**
   * 判断是否为重要文件
   */
  isSignificantFile(filename) {
    const significantExtensions = ['.mdc', '.ts', '.js', '.vue', '.cs', '.json', '.md'];
    const significantFiles = ['package.json', 'tsconfig.json', '.gitignore'];
    
    return significantExtensions.some(ext => filename.endsWith(ext)) ||
           significantFiles.includes(path.basename(filename));
  }
  
  /**
   * 处理文件变化
   */
  handleFileChange(eventType, filename) {
    const timeSinceLastSync = Date.now() - this.lastSyncTime;
    
    // 如果距离上次同步超过10分钟且有重要修改，考虑立即同步
    if (timeSinceLastSync >= 10 * 60 * 1000) {
      console.log(`📝 检测到重要文件变化: ${filename}`);
      
      // 延迟5秒执行，避免频繁触发
      clearTimeout(this.fileChangeTimeout);
      this.fileChangeTimeout = setTimeout(() => {
        this.executeGitSync('significant-change', {
          reason: '重要文件修改',
          filename: filename,
          eventType: eventType
        });
      }, 5000);
    }
  }
  
  /**
   * 执行Git同步
   */
  async executeGitSync(triggerType, context) {
    if (this.isRunning) {
      console.log('⚠️ Git同步正在进行中，跳过本次触发');
      return;
    }
    
    this.isRunning = true;
    const startTime = Date.now();
    
    try {
      console.log(`🚀 开始Git智能同步 [${triggerType}]`);
      console.log(`📋 触发原因: ${context.reason}`);
      
      // 检查网络连接
      await this.checkNetworkConnectivity();
      
      // 执行Git安全同步脚本
      const syncResult = await this.runGitSafeSync(context);
      
      // 记录成功
      const duration = Date.now() - startTime;
      this.recordSyncSuccess(triggerType, context, syncResult, duration);
      
      console.log(`✅ Git同步成功完成 [${triggerType}] - 耗时 ${duration}ms`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordSyncFailure(triggerType, context, error, duration);
      
      console.error(`❌ Git同步失败 [${triggerType}]: ${error.message}`);
      
    } finally {
      this.isRunning = false;
    }
  }
  
  /**
   * 检查网络连接
   */
  async checkNetworkConnectivity() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('网络连接检查超时'));
      }, 10000);
      
      execSync('git ls-remote --heads origin', { 
        stdio: 'pipe',
        timeout: 8000
      });
      
      clearTimeout(timeout);
      resolve();
    });
  }
  
  /**
   * 运行Git安全同步脚本
   */
  async runGitSafeSync(context) {
    const scriptPath = path.join(process.cwd(), 'scripts', 'git-safe-sync.sh');
    
    if (!fs.existsSync(scriptPath)) {
      throw new Error('Git安全同步脚本不存在: ' + scriptPath);
    }
    
    const autoCommitMessage = context.autoCommitMessage || 
      `第十一重爆雷自动同步: ${context.reason} - ${new Date().toISOString()}`;
    
    return new Promise((resolve, reject) => {
      const child = spawn('bash', [
        scriptPath,
        '--non-interactive',
        '--auto-commit',
        '--message', autoCommitMessage
      ], {
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      let output = '';
      let errorOutput = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        console.log(data.toString().trim());
      });
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(data.toString().trim());
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            output: output,
            commitCount: this.extractCommitCount(output),
            fileCount: this.extractFileCount(output)
          });
        } else {
          reject(new Error(`Git同步脚本退出，错误码: ${code}\n${errorOutput}`));
        }
      });
      
      child.on('error', (error) => {
        reject(new Error(`执行Git同步脚本失败: ${error.message}`));
      });
    });
  }
  
  /**
   * 提取提交数量
   */
  extractCommitCount(output) {
    const match = output.match(/(\d+)\s*files?\s*changed/i);
    return match ? parseInt(match[1]) : 0;
  }
  
  /**
   * 提取文件数量
   */
  extractFileCount(output) {
    const match = output.match(/(\d+)\s*insertion/i);
    return match ? parseInt(match[1]) : 0;
  }
  
  /**
   * 记录同步成功
   */
  recordSyncSuccess(triggerType, context, syncResult, duration) {
    this.lastSyncTime = Date.now();
    this.failedAttempts = 0;
    
    const record = {
      timestamp: new Date().toISOString(),
      success: true,
      triggerType: triggerType,
      reason: context.reason,
      duration: duration,
      commitCount: syncResult.commitCount,
      fileCount: syncResult.fileCount,
      output: syncResult.output
    };
    
    this.syncHistory.unshift(record);
    if (this.syncHistory.length > 50) {
      this.syncHistory = this.syncHistory.slice(0, 50);
    }
    
    this.saveSyncHistory();
    this.saveLastSyncTime();
  }
  
  /**
   * 记录同步失败
   */
  recordSyncFailure(triggerType, context, error, duration) {
    this.failedAttempts++;
    
    const record = {
      timestamp: new Date().toISOString(),
      success: false,
      triggerType: triggerType,
      reason: context.reason,
      duration: duration,
      error: error.message,
      attempt: this.failedAttempts
    };
    
    this.syncHistory.unshift(record);
    if (this.syncHistory.length > 50) {
      this.syncHistory = this.syncHistory.slice(0, 50);
    }
    
    this.saveSyncHistory();
    
    // 处理连续失败
    if (this.failedAttempts >= 3) {
      console.error(`🚨 连续${this.failedAttempts}次同步失败，需要人工干预`);
      this.notifyUser(`Git同步连续失败${this.failedAttempts}次，请检查网络连接和仓库权限`);
    } else {
      console.warn(`⚠️ 第${this.failedAttempts}次同步失败，将在5分钟后重试`);
      setTimeout(() => {
        this.executeGitSync(triggerType + '-retry', {
          ...context,
          reason: context.reason + ' (重试)'
        });
      }, 5 * 60 * 1000);
    }
  }
  
  /**
   * 通知用户
   */
  notifyUser(message) {
    console.error(`🔔 用户通知: ${message}`);
    
    // 创建通知文件
    const notificationFile = path.join(process.cwd(), '.git-sync-notification.txt');
    fs.writeFileSync(notificationFile, `${new Date().toISOString()}: ${message}\n`, { flag: 'a' });
    
    // 如果有桌面通知能力，可以在这里添加
    try {
      if (process.platform === 'win32') {
        execSync(`powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('${message}', 'Git同步告警')"`);
      }
    } catch (e) {
      // 忽略通知错误
    }
  }
  
  /**
   * 获取上次同步时间
   */
  getLastSyncTime() {
    try {
      const syncTimeFile = path.join(process.cwd(), '.git-sync-time');
      if (fs.existsSync(syncTimeFile)) {
        return parseInt(fs.readFileSync(syncTimeFile, 'utf8'));
      }
    } catch (e) {
      // 忽略读取错误
    }
    
    return Date.now() - this.GIT_SYNC_INTERVAL; // 默认为需要立即同步
  }
  
  /**
   * 保存上次同步时间
   */
  saveLastSyncTime() {
    try {
      const syncTimeFile = path.join(process.cwd(), '.git-sync-time');
      fs.writeFileSync(syncTimeFile, this.lastSyncTime.toString());
    } catch (e) {
      console.error('保存同步时间失败:', e.message);
    }
  }
  
  /**
   * 加载同步历史
   */
  loadSyncHistory() {
    try {
      const historyFile = path.join(process.cwd(), '.git-sync-history.json');
      if (fs.existsSync(historyFile)) {
        return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      }
    } catch (e) {
      console.warn('加载同步历史失败:', e.message);
    }
    
    return [];
  }
  
  /**
   * 保存同步历史
   */
  saveSyncHistory() {
    try {
      const historyFile = path.join(process.cwd(), '.git-sync-history.json');
      fs.writeFileSync(historyFile, JSON.stringify(this.syncHistory, null, 2));
    } catch (e) {
      console.error('保存同步历史失败:', e.message);
    }
  }
  
  /**
   * 获取同步状态报告
   */
  getStatusReport() {
    const timeSinceLastSync = Date.now() - this.lastSyncTime;
    const minutesSinceSync = Math.floor(timeSinceLastSync / 60000);
    
    const recentFailures = this.syncHistory
      .filter(record => !record.success)
      .slice(0, 5);
    
    const recentSuccesses = this.syncHistory
      .filter(record => record.success)
      .slice(0, 5);
    
    return {
      lastSyncTime: new Date(this.lastSyncTime).toLocaleString(),
      minutesSinceLastSync: minutesSinceSync,
      needsSync: timeSinceLastSync >= this.GIT_SYNC_INTERVAL,
      failedAttempts: this.failedAttempts,
      recentFailures: recentFailures,
      recentSuccesses: recentSuccesses,
      totalSyncs: this.syncHistory.length,
      successRate: this.syncHistory.length > 0 
        ? (this.syncHistory.filter(r => r.success).length / this.syncHistory.length * 100).toFixed(1) + '%'
        : 'N/A'
    };
  }
  
  /**
   * 清理资源
   */
  cleanup() {
    console.log('\n🔚 第十一重爆雷Git监控器正在关闭...');
    
    if (this.fileChangeTimeout) {
      clearTimeout(this.fileChangeTimeout);
    }
    
    // 保存最终状态
    this.saveSyncHistory();
    this.saveLastSyncTime();
    
    console.log('✅ 清理完成');
    process.exit(0);
  }
  
  /**
   * 手动触发同步 (供外部调用)
   */
  manualSync(taskType) {
    if (taskType && this.checkTaskTrigger(taskType)) {
      return; // 已通过任务触发器处理
    }
    
    this.executeGitSync('manual', {
      reason: taskType ? `手动触发: ${taskType}` : '手动触发',
      taskType: taskType
    });
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const monitor = new GitSyncMonitor();
  
  // 处理命令行参数
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const command = args[0];
    
    switch (command) {
      case 'status':
        console.log('📊 Git同步状态报告:');
        console.log(JSON.stringify(monitor.getStatusReport(), null, 2));
        break;
        
      case 'sync':
        const taskType = args[1];
        monitor.manualSync(taskType);
        break;
        
      case 'history':
        console.log('📜 同步历史:');
        console.log(JSON.stringify(monitor.syncHistory.slice(0, 10), null, 2));
        break;
        
      default:
        console.log('用法:');
        console.log('  node ai-git-sync-monitor.js status   # 查看状态');
        console.log('  node ai-git-sync-monitor.js sync     # 手动同步');
        console.log('  node ai-git-sync-monitor.js history  # 查看历史');
        process.exit(1);
    }
    
    // 非监控模式，执行完退出
    setTimeout(() => process.exit(0), 2000);
  } else {
    // 默认启动监控模式
    console.log('🎯 进入监控模式 - 按 Ctrl+C 退出');
  }
}

module.exports = GitSyncMonitor;
