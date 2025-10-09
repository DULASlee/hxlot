/**
 * SmartAbp生产代码问题检查器 v1.0
 * 专门检查SmartAbp项目的生产环境代码问题
 */

import { BaseChecker } from './base-checker.js';
import type { CheckResult } from '../types/index.js';
import { glob } from 'glob';
import * as fs from 'fs-extra';
import path from 'path';

export class SmartAbpProductionChecker extends BaseChecker {
  public override readonly name = 'SmartAbp生产代码检查器';
  public override readonly description = '检查SmartAbp项目生产环境代码问题：console.log、内存泄露、类型安全等';
  public override readonly version = '1.0.0';
  public override enabled = true;

  private totalIssuesFound = 0;
  private checkedFiles = 0;

  protected override async doCheck(): Promise<void> {
    // 在check()方法中实现所有检查逻辑
  }

  public override async check(): Promise<CheckResult> {
    const startTime = Date.now();
    this.totalIssuesFound = 0;
    this.checkedFiles = 0;

    console.log('  🔍 开始SmartAbp生产代码检查...');

    try {
      // 检查1: 生产代码中的console调用（P0严重问题）
      console.log('    ▸ 检查生产代码中的console调用...');
      await this.checkConsoleUsage();

      // 检查2: 定时器内存泄漏风险（P1问题）
      console.log('    ▸ 检查定时器内存泄漏风险...');
      await this.checkTimerLeaks();

      // 检查3: 类型安全绕过（P0问题）
      console.log('    ▸ 检查类型安全绕过...');
      await this.checkTypeSafety();

      // 检查4: TODO/FIXME技术债务（P2问题）
      console.log('    ▸ 统计技术债务标记...');
      await this.checkTechnicalDebt();

      // 检查5: Vue3异步处理问题（P1问题）
      console.log('    ▸ 检查Vue3异步处理问题...');
      await this.checkVueAsyncIssues();

      console.log(`  ✅ SmartAbp生产检查完成，检查了 ${this.checkedFiles} 个文件，发现 ${this.totalIssuesFound} 个问题`);

      return {
        checker: this.name,
        passed: this.violations.filter(v => v.level === 'P0').length === 0,
        duration: Date.now() - startTime,
        filesChecked: this.checkedFiles,
        violations: this.violations,
        details: {
          totalIssuesFound: this.totalIssuesFound,
          issueBreakdown: this.getIssueBreakdown()
        }
      };
    } catch (error) {
      return {
        checker: this.name,
        passed: false,
        duration: Date.now() - startTime,
        filesChecked: this.checkedFiles,
        violations: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 检查生产代码中的console调用
   */
  private async checkConsoleUsage(): Promise<void> {
    const tsFiles = await glob('src/SmartAbp.Vue/src/**/*.{ts,vue,js}', {
      cwd: this.config.projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*']
    });

    for (const file of tsFiles) {
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        this.checkedFiles++;

        // 检查console.*调用
        const consoleRegex = /console\.(log|warn|error|info|debug|trace|table|time|timeEnd|group|groupEnd|count|clear)\s*\(/g;
        const lines = content.split('\n');

        lines.forEach((line: string, index: number) => {
          if (consoleRegex.test(line)) {
            this.totalIssuesFound++;
            this.addViolation({
              rule: 'smartabp-production.no-console-calls',
              level: 'P0',
              file: file,
              line: index + 1,
              message: '生产代码中禁止使用console调用，可能影响性能和暴露敏感信息',
              snippet: line.trim(),
              suggestion: '使用专门的日志系统（如winston、pino）或移除console调用'
            });
          }
        });
      }
    }
  }

  /**
   * 检查定时器内存泄漏风险
   */
  private async checkTimerLeaks(): Promise<void> {
    const vueFiles = await glob('src/SmartAbp.Vue/src/**/*.{vue,ts}', {
      cwd: this.config.projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**']
    });

    for (const file of vueFiles) {
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        
        // 查找setTimeout/setInterval
        const timerRegex = /(setTimeout|setInterval)\s*\(/g;
        const clearRegex = /(clearTimeout|clearInterval|onUnmounted|onBeforeUnmount)/g;
        
        const lines = content.split('\n');
        const hasTimers = lines.some((line: string) => timerRegex.test(line));
        const hasCleanup = lines.some((line: string) => clearRegex.test(line));

        if (hasTimers && !hasCleanup) {
          lines.forEach((line: string, index: number) => {
            if (timerRegex.test(line)) {
              this.totalIssuesFound++;
              this.addViolation({
                rule: 'smartabp-production.timer-memory-leak',
                level: 'P1',
                file: file,
                line: index + 1,
                message: '定时器可能导致内存泄漏，缺少清理逻辑',
                snippet: line.trim(),
                suggestion: '在Vue组件中使用onUnmounted钩子清理定时器，或使用clearTimeout/clearInterval'
              });
            }
          });
        }
      }
    }
  }

  /**
   * 检查类型安全绕过
   */
  private async checkTypeSafety(): Promise<void> {
    const tsFiles = await glob('src/SmartAbp.Vue/src/**/*.{ts,vue}', {
      cwd: this.config.projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**']
    });

    for (const file of tsFiles) {
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line: string, index: number) => {
          // 检查 @ts-ignore
          if (line.includes('@ts-ignore')) {
            this.totalIssuesFound++;
            this.addViolation({
              rule: 'smartabp-production.no-ts-ignore',
              level: 'P0',
              file: file,
              line: index + 1,
              message: '使用@ts-ignore绕过TypeScript检查，可能隐藏类型错误',
              snippet: line.trim(),
              suggestion: '修复类型错误或使用类型断言（as Type）替代'
            });
          }

          // 检查 as any
          if (line.includes('as any')) {
            this.totalIssuesFound++;
            this.addViolation({
              rule: 'smartabp-production.no-as-any',
              level: 'P0',
              file: file,
              line: index + 1,
              message: '使用as any绕过类型检查，完全失去类型安全',
              snippet: line.trim(),
              suggestion: '定义正确的类型或使用联合类型/类型守卫'
            });
          }

          // 检查 any 类型注解
          if (/:\s*any\b/.test(line)) {
            this.totalIssuesFound++;
            this.addViolation({
              rule: 'smartabp-production.no-any-type',
              level: 'P1',
              file: file,
              line: index + 1,
              message: '使用any类型注解，失去类型检查保护',
              snippet: line.trim(),
              suggestion: '定义具体的类型接口或使用unknown类型'
            });
          }
        });
      }
    }
  }

  /**
   * 检查技术债务标记
   */
  private async checkTechnicalDebt(): Promise<void> {
    const allFiles = await glob('src/**/*.{ts,vue,js,cs}', {
      cwd: this.config.projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**', '**/bin/**', '**/obj/**']
    });

    let todoCount = 0;
    let fixmeCount = 0;
    let hackCount = 0;

    for (const file of allFiles.slice(0, 100)) { // 限制检查文件数避免超时
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line: string, index: number) => {
          if (/\/\/\s*(TODO|todo)\b/.test(line)) {
            todoCount++;
            if (todoCount <= 10) { // 只记录前10个，避免过多violation
              this.addViolation({
                rule: 'smartabp-production.technical-debt',
                level: 'P2',
                file: file,
                line: index + 1,
                message: 'TODO标记表示未完成的功能或需要改进的代码',
                snippet: line.trim(),
                suggestion: '完成TODO标记的功能实现或移除过时的标记'
              });
            }
          }

          if (/\/\/\s*(FIXME|fixme)\b/.test(line)) {
            fixmeCount++;
            if (fixmeCount <= 10) {
              this.addViolation({
                rule: 'smartabp-production.technical-debt',
                level: 'P1',
                file: file,
                line: index + 1,
                message: 'FIXME标记表示需要修复的已知问题',
                snippet: line.trim(),
                suggestion: '修复FIXME标记的问题'
              });
            }
          }

          if (/\/\/\s*(HACK|hack|XXX)\b/.test(line)) {
            hackCount++;
            if (hackCount <= 5) {
              this.addViolation({
                rule: 'smartabp-production.technical-debt',
                level: 'P1',
                file: file,
                line: index + 1,
                message: 'HACK/XXX标记表示临时解决方案，需要重构',
                snippet: line.trim(),
                suggestion: '重构HACK代码，使用更规范的实现'
              });
            }
          }
        });
      }
    }

    this.totalIssuesFound += todoCount + fixmeCount + hackCount;
  }

  /**
   * 检查Vue3异步处理问题
   */
  private async checkVueAsyncIssues(): Promise<void> {
    const vueFiles = await glob('src/SmartAbp.Vue/src/**/*.vue', {
      cwd: this.config.projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**']
    });

    for (const file of vueFiles) {
      const fullPath = path.join(this.config.projectRoot, file);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line: string, index: number) => {
          // 检查watch没有清理
          if (/watch\s*\(/.test(line) && !content.includes('onUnmounted')) {
            this.totalIssuesFound++;
            this.addViolation({
              rule: 'smartabp-production.vue-watch-cleanup',
              level: 'P1',
              file: file,
              line: index + 1,
              message: 'Vue watch可能需要手动清理以避免内存泄漏',
              snippet: line.trim(),
              suggestion: '使用watchEffect返回的停止函数或在onUnmounted中清理'
            });
          }

          // 检查异步操作没有错误处理
          if (/(fetch|axios|http)\s*\(/.test(line) && !line.includes('catch') && !content.includes('try')) {
            this.totalIssuesFound++;
            this.addViolation({
              rule: 'smartabp-production.async-error-handling',
              level: 'P1',
              file: file,
              line: index + 1,
              message: '异步操作缺少错误处理',
              snippet: line.trim(),
              suggestion: '添加.catch()或try-catch处理异步错误'
            });
          }
        });
      }
    }
  }

  /**
   * 获取问题分类统计
   */
  private getIssueBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    this.violations.forEach(v => {
      const rule = v.rule || 'unknown';
      breakdown[rule] = (breakdown[rule] || 0) + 1;
    });

    return breakdown;
  }
}
