#!/usr/bin/env node

/**
 * 专家模式工作流: 第2阶段 - 执行与完成
 * 严格遵循项目编程规则定义的6步工作法。
 *
 * 用法：
 *   npm run expert:finalize -- "feat: 完成了模块向导的重构"
 *
 * 行为:
 *   5. 执行质量检查
 *   6. 执行代码GIT推送
 */

const { spawnSync } = require('child_process');
const path = require('path');
const chalk = require('chalk');

// --- Helper Functions ---
function getCommitMessage() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(chalk.red('❌ 错误: 请提供Git提交信息。'));
    console.log(chalk.cyan('   用法: npm run expert:finalize -- "feat: 你的提交信息"'));
    process.exit(1);
  }
  return args.join(' ').trim();
}

function run(cmd, args, options = {}) {
  console.log(chalk.cyan(`\n> ${cmd} ${args.join(' ')}`));
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32', ...options });
  if (result.status !== 0) {
    throw new Error(`命令执行失败: ${cmd} ${args.join(' ')}`);
  }
  return result;
}

// --- Main Logic ---
function main() {
  console.log(chalk.yellow('🚀 正在启动专家模式 [阶段2: 执行与完成]...'));

  const commitMessage = getCommitMessage();

  // 步骤 5: 执行质量检查
  console.log(chalk.blue('\n--- 步骤 5: 执行质量检查 ---'));
  try {
    // 假设 'expert:verify' 脚本包含了 lint, test, build 等所有检查
    run('npm', ['run', 'expert:verify']);
    console.log(chalk.green('✅ 所有质量检查通过！'));
  } catch (error) {
    console.error(chalk.red(`❌ 质量检查失败: ${error.message}`));
    console.log(chalk.yellow('   请在修复问题后重新运行此命令。'));
    process.exit(1);
  }

  // 步骤 6: 执行代码GIT推送
  console.log(chalk.blue('\n--- 步骤 6: 执行代码GIT推送 ---'));
  try {
    run('git', ['add', '.']);
    run('git', ['commit', '-m', commitMessage, '-n']); // -n to skip pre-commit hooks if they run tests again
    run('git', ['push']);
    console.log(chalk.green('✅ 代码已成功推送至远程仓库！'));
  } catch (error) {
    console.error(chalk.red(`❌ Git推送失败: ${error.message}`));
    console.log(chalk.yellow('   请检查你的Git状态和权限。'));
    process.exit(1);
  }

  console.log(chalk.bgGreen.black.bold('\n🎉 专家模式工作流已成功完成！'));
}

// --- Execution ---
try {
  // 确保 chalk 存在
  require.resolve('chalk');
} catch (e) {
  // 安装 chalk
  console.log('正在安装辅助工具 chalk...');
  spawnSync('npm', ['install', 'chalk'], { stdio: 'inherit' });
}

try {
  main();
} catch (e) {
  console.error(chalk.red('\n❌ 专家模式最终化失败:'), e.message);
  process.exit(1);
}
