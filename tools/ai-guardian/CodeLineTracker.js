#!/usr/bin/env node

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📊 AI代码行数追踪器
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * 功能：
 * - 追踪AI会话期间生成的代码行数
 * - 在100/200/280/300行自动触发检查点
 * - 生成质量监控报告
 * - 强制执行300行限制
 * 
 * 使用：
 * - Git hook: 在pre-commit时自动检查
 * - 手动检查: node tools/ai-guardian/CodeLineTracker.js
 * - CI/CD: 在pipeline中自动检查
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
  thresholds: {
    warning1: 100,    // 第一次警告（用户干预点1）
    warning2: 200,    // 第二次警告（用户干预点2）
    warning3: 280,    // 第三次警告（接近限制）
    critical: 300,    // 强制停止（触发质量门禁）
  },
  dataFile: '.ai-engine/code-tracker.json',
  reportFile: '.ai-engine/code-tracker-report.md',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 代码行数追踪器类
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class CodeLineTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.data = this.loadData();
    this.currentSession = this.data.sessions[this.sessionId] || {
      sessionId: this.sessionId,
      startTime: new Date().toISOString(),
      totalLines: 0,
      files: [],
      checkpoints: [],
      violations: [],
    };
  }

  /**
   * 生成会话ID
   */
  generateSessionId() {
    return `session_${Date.now()}`;
  }

  /**
   * 加载持久化数据
   */
  loadData() {
    const dataPath = path.join(process.cwd(), CONFIG.dataFile);
    
    if (fs.existsSync(dataPath)) {
      try {
        return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      } catch (error) {
        console.warn('⚠️ 无法读取历史数据，创建新数据');
      }
    }

    return {
      version: '1.0.0',
      sessions: {},
      lastSessionId: null,
    };
  }

  /**
   * 保存数据
   */
  saveData() {
    const dataPath = path.join(process.cwd(), CONFIG.dataFile);
    const dir = path.dirname(dataPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.data.sessions[this.sessionId] = this.currentSession;
    this.data.lastSessionId = this.sessionId;
    
    fs.writeFileSync(dataPath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  /**
   * 获取最近修改的文件（基于Git）
   */
  getRecentlyModifiedFiles() {
    try {
      // 获取未提交的修改文件
      const output = execSync('git diff --name-only HEAD', { encoding: 'utf-8' });
      const files = output.trim().split('\n').filter(f => f);
      
      return files.map(file => {
        const filePath = path.join(process.cwd(), file);
        if (!fs.existsSync(filePath)) {
          return null;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').length;

        return {
          path: file,
          lines: lines,
          timestamp: new Date().toISOString(),
        };
      }).filter(f => f !== null);
    } catch (error) {
      console.warn('⚠️ 无法获取Git修改文件，可能不在Git仓库中');
      return [];
    }
  }

  /**
   * 添加代码文件
   */
  addCode(fileName, code) {
    const lines = code.split('\n').length;
    
    this.currentSession.files.push({
      fileName,
      lines,
      timestamp: new Date().toISOString(),
    });

    this.currentSession.totalLines += lines;
    
    // 检查阈值
    this.checkSmartThresholds();
    
    // 保存数据
    this.saveData();
  }

  /**
   * 智能检查阈值
   */
  checkSmartThresholds() {
    const totalLines = this.currentSession.totalLines;
    const thresholds = CONFIG.thresholds;

    // 100行检查点
    if (totalLines >= thresholds.warning1 && totalLines < thresholds.warning1 + 20) {
      if (!this.hasCheckpoint('100lines')) {
        this.createCheckpoint('100lines', 'USER_REVIEW', '代码方向审查');
        this.triggerUserIntervention(1, totalLines);
      }
    }

    // 200行检查点
    if (totalLines >= thresholds.warning2 && totalLines < thresholds.warning2 + 20) {
      if (!this.hasCheckpoint('200lines')) {
        this.createCheckpoint('200lines', 'USER_REVIEW', '深度审查和测试建议');
        this.triggerUserIntervention(2, totalLines);
      }
    }

    // 280行警告
    if (totalLines >= thresholds.warning3 && totalLines < thresholds.critical) {
      if (!this.hasCheckpoint('280lines')) {
        this.createCheckpoint('280lines', 'WARNING', '接近300行限制');
        console.warn(`\n⚠️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.warn(`⚠️ 警告：已编写${totalLines}行代码，接近300行限制！`);
        console.warn(`⚠️ 建议：完成当前文件后立即执行质量门禁检查`);
        console.warn(`⚠️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      }
    }

    // 300行强制停止
    if (totalLines >= thresholds.critical) {
      if (!this.hasCheckpoint('300lines')) {
        this.createCheckpoint('300lines', 'FORCED_STOP', '强制停止');
        this.recordViolation('超出300行限制', totalLines);
        this.triggerQualityGate(totalLines);
        return false;
      }
    }

    return true;
  }

  /**
   * 检查是否存在检查点
   */
  hasCheckpoint(id) {
    return this.currentSession.checkpoints.some(cp => cp.id === id);
  }

  /**
   * 创建检查点
   */
  createCheckpoint(id, type, description) {
    this.currentSession.checkpoints.push({
      id,
      type,
      description,
      lines: this.currentSession.totalLines,
      timestamp: new Date().toISOString(),
    });
    
    console.log(`💾 检查点已创建: ${id} (${this.currentSession.totalLines}行)`);
  }

  /**
   * 记录违规
   */
  recordViolation(type, lines) {
    this.currentSession.violations.push({
      type,
      lines,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 触发用户干预
   */
  triggerUserIntervention(level, totalLines) {
    console.log(`\n🛑 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🛑 用户干预点${level}: ${totalLines}行代码审查`);
    console.log(`🛑 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    console.log(`📊 当前进度:`);
    console.log(`  • 已编写: ${totalLines}行`);
    console.log(`  • 创建文件: ${this.currentSession.files.length}个`);
    console.log(`  • 预计剩余: ~${CONFIG.thresholds.critical - totalLines}行\n`);
    
    if (level === 1) {
      console.log(`💡 建议:`);
      console.log(`  1. 审查代码方向是否正确`);
      console.log(`  2. 检查是否有重复代码`);
      console.log(`  3. 确认架构是否合规\n`);
    } else if (level === 2) {
      console.log(`💡 强烈建议:`);
      console.log(`  1. 执行深度代码审查`);
      console.log(`  2. 补充单元测试`);
      console.log(`  3. 考虑提前执行质量门禁\n`);
    }
  }

  /**
   * 触发质量门禁
   */
  triggerQualityGate(totalLines) {
    console.error(`\n🚨 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.error(`🚨 强制停止：已达到${totalLines}行代码限制！`);
    console.error(`🚨 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    console.error(`强制执行：`);
    console.error(`  ⏸️  停止所有编码活动`);
    console.error(`  🔍 执行质量门禁检查`);
    console.error(`  📦 执行Git版本同步`);
    console.error(`  🔄 重置计数器\n`);

    // 生成质量监控报告
    this.generateReport();
  }

  /**
   * 分析最近会话
   */
  analyzeRecentSession() {
    const files = this.getRecentlyModifiedFiles();
    
    if (files.length === 0) {
      console.log('✅ 没有检测到新增或修改的文件');
      return {
        totalLines: 0,
        files: [],
        violations: [],
      };
    }

    const totalLines = files.reduce((sum, f) => sum + f.lines, 0);
    
    this.currentSession.files = files;
    this.currentSession.totalLines = totalLines;
    
    // 检查阈值
    this.checkSmartThresholds();
    
    // 保存数据
    this.saveData();

    return {
      totalLines,
      files,
      violations: this.currentSession.violations,
    };
  }

  /**
   * 生成报告
   */
  generateReport() {
    const report = [];
    
    report.push('# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    report.push('# 📊 AI代码行数追踪报告');
    report.push('# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    report.push('');
    report.push(`**会话ID**: ${this.sessionId}`);
    report.push(`**开始时间**: ${this.currentSession.startTime}`);
    report.push(`**总代码行数**: ${this.currentSession.totalLines}行`);
    report.push(`**创建文件数**: ${this.currentSession.files.length}个`);
    report.push('');
    
    report.push('## 📋 文件列表');
    report.push('');
    this.currentSession.files.forEach((file, index) => {
      report.push(`${index + 1}. **${file.fileName}** (${file.lines}行)`);
    });
    report.push('');
    
    report.push('## 📊 检查点历史');
    report.push('');
    this.currentSession.checkpoints.forEach((cp, index) => {
      const icon = cp.type === 'FORCED_STOP' ? '🚨' : cp.type === 'WARNING' ? '⚠️' : '💾';
      report.push(`${index + 1}. ${icon} **${cp.id}** - ${cp.description} (${cp.lines}行)`);
    });
    report.push('');
    
    if (this.currentSession.violations.length > 0) {
      report.push('## 🚨 违规记录');
      report.push('');
      this.currentSession.violations.forEach((violation, index) => {
        report.push(`${index + 1}. **${violation.type}** (${violation.lines}行) - ${violation.timestamp}`);
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
   * 重置计数器
   */
  reset() {
    this.sessionId = this.generateSessionId();
    this.currentSession = {
      sessionId: this.sessionId,
      startTime: new Date().toISOString(),
      totalLines: 0,
      files: [],
      checkpoints: [],
      violations: [],
    };
    this.saveData();
    console.log('✅ 代码行数计数器已重置');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 CLI命令
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';

  const tracker = new CodeLineTracker();

  switch (command) {
    case 'check':
      console.log('\n🔍 正在分析最近会话的代码行数...\n');
      const result = tracker.analyzeRecentSession();
      
      if (result.totalLines === 0) {
        console.log('✅ 当前会话没有新增代码');
      } else {
        console.log(`📊 当前会话代码统计:`);
        console.log(`  • 总代码行数: ${result.totalLines}行`);
        console.log(`  • 修改文件数: ${result.files.length}个`);
        console.log(`  • 违规次数: ${result.violations.length}次\n`);
        
        if (result.totalLines >= CONFIG.thresholds.critical) {
          console.error(`🚨 错误：超出300行限制！必须立即执行质量门禁检查！\n`);
          process.exit(1);
        } else if (result.totalLines >= CONFIG.thresholds.warning3) {
          console.warn(`⚠️ 警告：接近300行限制（${result.totalLines}行），建议尽快执行质量检查\n`);
          process.exit(0);
        } else {
          console.log(`✅ 代码行数在合理范围内\n`);
        }
      }
      break;

    case 'report':
      tracker.generateReport();
      break;

    case 'reset':
      tracker.reset();
      break;

    case 'help':
      console.log('\n📚 AI代码行数追踪器使用说明\n');
      console.log('命令:');
      console.log('  check  - 检查当前会话代码行数（默认）');
      console.log('  report - 生成质量监控报告');
      console.log('  reset  - 重置计数器');
      console.log('  help   - 显示帮助信息\n');
      break;

    default:
      console.error(`❌ 未知命令: ${command}\n`);
      console.log('使用 "node CodeLineTracker.js help" 查看帮助\n');
      process.exit(1);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 执行
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (require.main === module) {
  main();
}

module.exports = CodeLineTracker;

