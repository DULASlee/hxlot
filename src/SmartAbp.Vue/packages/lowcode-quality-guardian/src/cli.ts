#!/usr/bin/env node

/**
 * SmartAbp Quality Guardian - CLI入口
 * 命令行接口，提供友好的交互体验
 */

import chalk from 'chalk';
import { Command } from 'commander';
import path from 'path';
import { QualityGuardian } from './core/quality-guardian.js';
import type { QualityConfig } from './types/index.js';

const program = new Command();

program
  .name('quality-guardian')
  .description('SmartAbp Quality Guardian - 企业级代码质量检查工具')
  .version('2.0.0');

program
  .command('check')
  .description('执行代码质量检查')
  .option('-p, --project-root <path>', '项目根目录', process.cwd())
  .option('-f, --config-file <path>', '配置文件路径')
  .option('-m, --mode <mode>', '检查模式: strict|moderate|lenient', 'strict')
  .option('--ci-mode', '启用CI模式', false)
  .option('--no-fail-fast', '禁用快速失败（继续检查所有问题）')
  .option('--no-report', '不生成报告文件')
  .option('-r, --report-dir <dir>', '报告输出目录', 'reports/quality')
  .option('-c, --checkers <checkers>', '指定要执行的检查器（逗号分隔）')
  .action(async (options) => {
    try {
      printBanner();

      const config: Partial<QualityConfig> = {
        projectRoot: path.resolve(options.projectRoot),
        mode: options.mode as 'strict' | 'moderate' | 'lenient',
        ciMode: options.ciMode,
        failFast: options.failFast,
        generateReport: options.report,
        reportDir: path.resolve(options.projectRoot, options.reportDir)
      };

      if (options.checkers) {
        config.checkers = options.checkers.split(',').map((c: string) => c.trim());
      }

      const guardian = new QualityGuardian(config);
      const report = await guardian.run();

      // 根据结果设置退出码
      if (config.ciMode && !report.gate.passed) {
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('\n💥 执行失败:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('init')
  .description('初始化质量检查配置文件')
  .action(async () => {
    console.log(chalk.blue('\n🚀 初始化 Quality Guardian 配置...\n'));
    console.log(chalk.yellow('此功能即将推出！'));
    console.log('');
  });

program
  .command('report')
  .description('查看最新的质量报告')
  .option('-f, --format <format>', '报告格式: json|html|markdown', 'html')
  .action(async (_options) => {
    console.log(chalk.blue('\n📊 打开质量报告...\n'));
    console.log(chalk.yellow('此功能即将推出！'));
    console.log('');
  });

program
  .command('fix')
  .description('自动修复可修复的问题')
  .option('-d, --dry-run', '只检查不修改')
  .action(async (_options) => {
    console.log(chalk.blue('\n🔧 自动修复质量问题...\n'));
    console.log(chalk.yellow('此功能即将推出！'));
    console.log('');
  });

program.parse();

function printBanner(): void {
  console.log('');
  console.log(chalk.blue.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.blue.bold('  🛡️  SmartAbp Quality Guardian v2.0'));
  console.log(chalk.blue.bold('  企业级代码质量检查工具'));
  console.log(chalk.blue.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');
}
