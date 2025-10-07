#!/usr/bin/env node

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🛡️ AI执行引擎自我守护机制
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * 功能：
 * - 启动时自动加载所有MDC规则
 * - 每30分钟自动重新加载规则
 * - 检测规则文件变更并自动重载
 * - 生成规则加载报告
 * - 防止AI在长会话中"忘记"核心规则
 * 
 * 使用：
 * - 启动守护进程: node tools/ai-guardian/AIEngineGuardian.js start
 * - 手动加载规则: node tools/ai-guardian/AIEngineGuardian.js load
 * - 检查规则状态: node tools/ai-guardian/AIEngineGuardian.js status
 * - 停止守护进程: node tools/ai-guardian/AIEngineGuardian.js stop
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 配置
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CONFIG = {
  // 核心规则文件列表（必须按顺序加载）
  coreRules: [
    '.cursor/rules/00_编程完整性铁律.mdc',
    '.cursor/rules/00_执行引擎.mdc',
    '.cursor/rules/00_core_philosophy.mdc',
    '.cursor/rules/01_code_standards.mdc',
    '.cursor/rules/02_development_process.mdc',
    '.cursor/rules/03_quality_guardian.mdc',
    '.cursor/rules/04_code_quality_prohibitions.mdc',
    '.cursor/rules/05_deep_testing_tenet.mdc',
  ],
  
  // 重新加载间隔（毫秒）
  reloadInterval: 30 * 60 * 1000, // 30分钟
  
  // 状态文件
  statusFile: '.ai-engine/guardian-status.json',
  
  // 报告文件
  reportFile: '.ai-engine/guardian-report.md',
  
  // PID文件
  pidFile: '.ai-engine/guardian.pid',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ AI执行引擎守护类
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AIEngineGuardian {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.status = this.loadStatus();
    this.rulesCache = new Map();
    this.fileWatchers = new Map();
  }

  /**
   * 生成会话ID
   */
  generateSessionId() {
    return `guardian_${Date.now()}`;
  }

  /**
   * 加载状态
   */
  loadStatus() {
    const statusPath = path.join(process.cwd(), CONFIG.statusFile);
    
    if (fs.existsSync(statusPath)) {
      try {
        return JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
      } catch (error) {
        console.warn('⚠️ 无法读取守护状态，创建新状态');
      }
    }

    return {
      version: '1.0.0',
      sessionId: this.sessionId,
      startTime: new Date().toISOString(),
      lastReloadTime: null,
      reloadCount: 0,
      rulesLoaded: [],
      rulesMissing: [],
      errors: [],
    };
  }

  /**
   * 保存状态
   */
  saveStatus() {
    const statusPath = path.join(process.cwd(), CONFIG.statusFile);
    const dir = path.dirname(statusPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(statusPath, JSON.stringify(this.status, null, 2), 'utf-8');
  }

  /**
   * 加载所有规则文件
   */
  loadAllRules() {
    console.log('\n🔥 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔥 AI编程铁律执行引擎 v9.0 (Ultimate Edition) 已启动！');
    console.log('🔥 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const loadedRules = [];
    const missingRules = [];
    const errors = [];

    console.log('📚 正在加载核心规则文件...\n');

    CONFIG.coreRules.forEach((rulePath, index) => {
      const fullPath = path.join(process.cwd(), rulePath);
      const ruleNumber = index + 1;

      try {
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const stats = fs.statSync(fullPath);
          
          this.rulesCache.set(rulePath, {
            content,
            size: stats.size,
            modifiedTime: stats.mtime.toISOString(),
            loadTime: new Date().toISOString(),
          });

          loadedRules.push(rulePath);
          console.log(`✅ [${ruleNumber}/${CONFIG.coreRules.length}] ${rulePath}`);
          console.log(`   📄 大小: ${this.formatBytes(stats.size)}`);
          console.log(`   🕐 修改时间: ${stats.mtime.toLocaleString()}\n`);
        } else {
          missingRules.push(rulePath);
          errors.push({ file: rulePath, error: '文件不存在' });
          console.error(`❌ [${ruleNumber}/${CONFIG.coreRules.length}] ${rulePath} - 文件不存在\n`);
        }
      } catch (error) {
        errors.push({ file: rulePath, error: error.message });
        console.error(`❌ [${ruleNumber}/${CONFIG.coreRules.length}] ${rulePath} - 错误: ${error.message}\n`);
      }
    });

    // 更新状态
    this.status.lastReloadTime = new Date().toISOString();
    this.status.reloadCount++;
    this.status.rulesLoaded = loadedRules;
    this.status.rulesMissing = missingRules;
    this.status.errors = errors;

    this.saveStatus();

    // 显示加载摘要
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 加载摘要');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ 成功加载: ${loadedRules.length}/${CONFIG.coreRules.length}个规则文件`);
    
    if (missingRules.length > 0) {
      console.error(`❌ 缺失文件: ${missingRules.length}个`);
      missingRules.forEach(file => console.error(`   - ${file}`));
    }
    
    if (errors.length > 0) {
      console.error(`⚠️ 错误: ${errors.length}个`);
    }
    
    console.log(`🔄 重载次数: ${this.status.reloadCount}`);
    console.log(`🕐 本次重载时间: ${new Date().toLocaleString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      loaded: loadedRules.length,
      missing: missingRules.length,
      errors: errors.length,
      success: missingRules.length === 0 && errors.length === 0,
    };
  }

  /**
   * 检查规则文件变更
   */
  checkRulesChanges() {
    const changedRules = [];

    this.rulesCache.forEach((cache, rulePath) => {
      const fullPath = path.join(process.cwd(), rulePath);
      
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        
        if (stats.mtime.toISOString() !== cache.modifiedTime) {
          changedRules.push(rulePath);
          console.log(`🔄 检测到规则文件变更: ${rulePath}`);
        }
      }
    });

    if (changedRules.length > 0) {
      console.log(`\n🔄 重新加载${changedRules.length}个已变更的规则文件...\n`);
      this.loadAllRules();
    }

    return changedRules;
  }

  /**
   * 启动守护进程
   */
  startDaemon() {
    console.log('\n🚀 启动AI执行引擎守护进程...\n');

    // 检查是否已有守护进程在运行
    const pidPath = path.join(process.cwd(), CONFIG.pidFile);
    if (fs.existsSync(pidPath)) {
      const pid = fs.readFileSync(pidPath, 'utf-8').trim();
      console.warn(`⚠️ 检测到已存在的守护进程 (PID: ${pid})`);
      console.warn(`⚠️ 如需重启，请先运行: node tools/ai-guardian/AIEngineGuardian.js stop\n`);
      return;
    }

    // 保存PID
    const dir = path.dirname(pidPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(pidPath, process.pid.toString(), 'utf-8');

    // 首次加载规则
    this.loadAllRules();

    // 设置定时重载
    const reloadTimer = setInterval(() => {
      console.log('\n⏰ 定时重载触发（30分钟）...\n');
      this.loadAllRules();
    }, CONFIG.reloadInterval);

    // 设置文件监视（检测变更）
    const changeCheckTimer = setInterval(() => {
      this.checkRulesChanges();
    }, 60000); // 每分钟检查一次

    console.log(`✅ 守护进程已启动 (PID: ${process.pid})`);
    console.log(`⏰ 将在30分钟后自动重载规则`);
    console.log(`🔄 每分钟检查规则文件变更\n`);
    console.log(`💡 停止守护进程: node tools/ai-guardian/AIEngineGuardian.js stop\n`);

    // 处理退出信号
    process.on('SIGINT', () => {
      console.log('\n\n🛑 收到停止信号，正在清理...\n');
      clearInterval(reloadTimer);
      clearInterval(changeCheckTimer);
      fs.unlinkSync(pidPath);
      console.log('✅ 守护进程已停止\n');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      clearInterval(reloadTimer);
      clearInterval(changeCheckTimer);
      fs.unlinkSync(pidPath);
      process.exit(0);
    });
  }

  /**
   * 停止守护进程
   */
  stopDaemon() {
    const pidPath = path.join(process.cwd(), CONFIG.pidFile);
    
    if (!fs.existsSync(pidPath)) {
      console.log('⚠️ 没有检测到运行中的守护进程\n');
      return;
    }

    const pid = fs.readFileSync(pidPath, 'utf-8').trim();
    
    try {
      process.kill(parseInt(pid), 'SIGTERM');
      fs.unlinkSync(pidPath);
      console.log(`✅ 守护进程已停止 (PID: ${pid})\n`);
    } catch (error) {
      console.error(`❌ 停止守护进程失败: ${error.message}`);
      console.error(`💡 尝试手动删除PID文件: ${pidPath}\n`);
    }
  }

  /**
   * 显示状态
   */
  showStatus() {
    console.log('\n📊 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 AI执行引擎守护状态');
    console.log('📊 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const pidPath = path.join(process.cwd(), CONFIG.pidFile);
    const isRunning = fs.existsSync(pidPath);

    console.log(`🔄 守护进程状态: ${isRunning ? '✅ 运行中' : '❌ 未运行'}`);
    
    if (isRunning) {
      const pid = fs.readFileSync(pidPath, 'utf-8').trim();
      console.log(`🆔 进程ID: ${pid}`);
    }

    console.log(`\n📚 规则加载状态:`);
    console.log(`  • 会话ID: ${this.status.sessionId}`);
    console.log(`  • 启动时间: ${this.status.startTime ? new Date(this.status.startTime).toLocaleString() : '未知'}`);
    console.log(`  • 最后重载: ${this.status.lastReloadTime ? new Date(this.status.lastReloadTime).toLocaleString() : '未加载'}`);
    console.log(`  • 重载次数: ${this.status.reloadCount}次`);
    console.log(`  • 已加载规则: ${this.status.rulesLoaded.length}/${CONFIG.coreRules.length}个`);
    
    if (this.status.rulesMissing.length > 0) {
      console.log(`  • 缺失规则: ${this.status.rulesMissing.length}个`);
      this.status.rulesMissing.forEach(file => console.log(`    - ${file}`));
    }
    
    if (this.status.errors.length > 0) {
      console.log(`  • 错误: ${this.status.errors.length}个`);
      this.status.errors.forEach(err => console.log(`    - ${err.file}: ${err.error}`));
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * 生成报告
   */
  generateReport() {
    const report = [];
    
    report.push('# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    report.push('# 🛡️ AI执行引擎守护报告');
    report.push('# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    report.push('');
    report.push(`**会话ID**: ${this.status.sessionId}`);
    report.push(`**启动时间**: ${this.status.startTime}`);
    report.push(`**最后重载时间**: ${this.status.lastReloadTime || '未加载'}`);
    report.push(`**重载次数**: ${this.status.reloadCount}次`);
    report.push('');
    
    report.push('## 📚 已加载规则文件');
    report.push('');
    this.status.rulesLoaded.forEach((file, index) => {
      const cache = this.rulesCache.get(file);
      report.push(`${index + 1}. **${file}**`);
      if (cache) {
        report.push(`   - 大小: ${this.formatBytes(cache.size)}`);
        report.push(`   - 修改时间: ${cache.modifiedTime}`);
      }
    });
    report.push('');
    
    if (this.status.rulesMissing.length > 0) {
      report.push('## ❌ 缺失规则文件');
      report.push('');
      this.status.rulesMissing.forEach((file, index) => {
        report.push(`${index + 1}. **${file}**`);
      });
      report.push('');
    }
    
    if (this.status.errors.length > 0) {
      report.push('## ⚠️ 错误记录');
      report.push('');
      this.status.errors.forEach((err, index) => {
        report.push(`${index + 1}. **${err.file}**: ${err.error}`);
      });
      report.push('');
    }
    
    const reportPath = path.join(process.cwd(), CONFIG.reportFile);
    const dir = path.dirname(reportPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, report.join('\n'), 'utf-8');
    console.log(`\n📄 报告已生成: ${CONFIG.reportFile}\n`);
  }

  /**
   * 格式化字节数
   */
  formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 CLI命令
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'load';

  const guardian = new AIEngineGuardian();

  switch (command) {
    case 'load':
      const result = guardian.loadAllRules();
      if (!result.success) {
        process.exit(1);
      }
      break;

    case 'start':
      guardian.startDaemon();
      break;

    case 'stop':
      guardian.stopDaemon();
      break;

    case 'status':
      guardian.showStatus();
      break;

    case 'report':
      guardian.generateReport();
      break;

    case 'help':
      console.log('\n📚 AI执行引擎守护使用说明\n');
      console.log('命令:');
      console.log('  load   - 手动加载所有规则文件（默认）');
      console.log('  start  - 启动守护进程（30分钟自动重载）');
      console.log('  stop   - 停止守护进程');
      console.log('  status - 显示当前状态');
      console.log('  report - 生成守护报告');
      console.log('  help   - 显示帮助信息\n');
      break;

    default:
      console.error(`❌ 未知命令: ${command}\n`);
      console.log('使用 "node AIEngineGuardian.js help" 查看帮助\n');
      process.exit(1);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 执行
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (require.main === module) {
  main();
}

module.exports = AIEngineGuardian;

