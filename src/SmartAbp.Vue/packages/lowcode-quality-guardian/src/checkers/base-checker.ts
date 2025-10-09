/**
 * SmartAbp Quality Guardian - 检查器基础架构
 * 提供统一的检查器接口和基础实现
 */

import chalk from 'chalk';
import execa from 'execa';
import glob from 'fast-glob';
import * as fs from 'fs-extra';
import path from 'path';
import { performance } from 'perf_hooks';

import type {
  CheckerPlugin,
  CheckResult,
  QualityConfig,
  Violation,
  ViolationLevel
} from '../types/index.js';

/**
 * 抽象检查器基类
 * 所有检查器都应该继承此类
 */
export abstract class BaseChecker implements CheckerPlugin {
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly version: string;
  public enabled: boolean = true;

  protected config: QualityConfig = {} as QualityConfig;
  protected violations: Violation[] = [];
  protected filesChecked: number = 0;
  protected startTime: number = 0;

  constructor(config: Partial<CheckerPlugin> = {}) {
    this.enabled = config.enabled ?? true;
  }

  /**
   * 执行检查（模板方法）
   */
  async check(config: QualityConfig): Promise<CheckResult> {
    this.config = config;
    this.violations = [];
    this.filesChecked = 0;
    this.startTime = performance.now();

    try {
      // 检查前准备
      await this.beforeCheck();

      // 执行实际检查逻辑（子类实现）
      await this.doCheck();

      // 检查后清理
      await this.afterCheck();

      const duration = Math.round(performance.now() - this.startTime);

      return {
        checker: this.name,
        passed: this.violations.filter(v => v.level === 'P0').length === 0,
        duration,
        filesChecked: this.filesChecked,
        violations: this.violations,
        details: await this.getDetails()
      };

    } catch (error) {
      const duration = Math.round(performance.now() - this.startTime);
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        checker: this.name,
        passed: false,
        duration,
        filesChecked: this.filesChecked,
        violations: this.violations,
        error: errorMessage
      };
    }
  }

  /**
   * 检查前准备（钩子方法）
   */
  protected async beforeCheck(): Promise<void> {
    // 默认实现为空，子类可以重写
  }

  /**
   * 执行实际检查逻辑（抽象方法，子类必须实现）
   */
  protected abstract doCheck(): Promise<void>;

  /**
   * 检查后清理（钩子方法）
   */
  protected async afterCheck(): Promise<void> {
    // 默认实现为空，子类可以重写
  }

  /**
   * 获取检查详情（钩子方法）
   */
  protected async getDetails(): Promise<Record<string, any> | undefined> {
    return undefined;
  }

  // ========== 实用工具方法 ==========

  /**
   * 添加违规记录
   */
  protected addViolation(violation: Omit<Violation, 'rule'> & { rule?: string }): void {
    this.violations.push({
      rule: violation.rule || this.name,
      level: violation.level,
      file: violation.file,
      line: violation.line,
      column: violation.column,
      message: violation.message,
      snippet: violation.snippet,
      suggestion: violation.suggestion,
      links: violation.links
    });
  }

  /**
   * 查找匹配的文件
   */
  protected async findFiles(patterns: string | string[], options: {
    cwd?: string;
    ignore?: string[];
    absolute?: boolean;
  } = {}): Promise<string[]> {
    const cwd = options.cwd || this.config.projectRoot;
    const ignore = options.ignore || [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/coverage/**'
    ];

    const files = await glob(patterns, {
      cwd,
      ignore,
      absolute: options.absolute ?? false,
      onlyFiles: true
    });

    this.filesChecked += files.length;
    return files;
  }

  /**
   * 执行shell命令
   */
  protected async execCommand(
    command: string,
    args: string[] = [],
    options: { cwd?: string; timeout?: number } = {}
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const { stdout, stderr, exitCode } = await execa(command, args, {
      cwd: options.cwd || this.config.projectRoot,
      timeout: options.timeout || 30000,
      reject: false // 不因为非0退出码抛异常
    });

    return { stdout, stderr, exitCode };
  }

  /**
   * 读取文件内容
   */
  protected async readFile(filePath: string): Promise<string> {
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.config.projectRoot, filePath);

    return await fs.readFile(fullPath, 'utf8');
  }

  /**
   * 检查文件是否存在
   */
  protected async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(this.config.projectRoot, filePath);

    return await fs.pathExists(fullPath);
  }

  /**
   * 解析grep输出为违规记录
   */
  protected parseGrepOutput(
    output: string,
    rule: string,
    level: ViolationLevel,
    messageTemplate: string,
    suggestion?: string
  ): void {
    if (!output || !output.trim()) return;

    const lines = output.split('\\n').filter(line => line.trim());

    for (const line of lines) {
      const match = line.match(/^(.+?):(\\d+):(.*)$/);
      if (match && match.length >= 4) {
        const [, file, lineNumber, content] = match;

        if (file && lineNumber && content !== undefined) {
          this.addViolation({
            rule,
            level,
            file: file.replace(this.config.projectRoot + '/', ''),
            line: parseInt(lineNumber, 10),
            message: messageTemplate,
            snippet: content.trim(),
            suggestion
          });
        }
      }
    }
  }

  /**
   * 统计文件行数
   */
  protected async countLines(filePath: string): Promise<number> {
    try {
      const content = await this.readFile(filePath);
      return content.split('\\n').length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 计算文件复杂度（简单的行数/函数数比值）
   */
  protected async calculateComplexity(filePath: string): Promise<number> {
    try {
      const content = await this.readFile(filePath);
      const lines = content.split('\\n').length;
      const functions = (content.match(/\\bfunction\\b|=>|\\basync\\b/g) || []).length;

      return functions > 0 ? Math.round(lines / functions) : lines;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 打印检查进度
   */
  protected logProgress(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };

    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    console.log(colors[level](`     ${icons[level]} ${message}`));
  }
}

/**
 * 文件模式匹配器
 */
export class FilePatternMatcher {
  constructor(
    public includes: string[],
    public excludes: string[] = []
  ) { }

  match(filePath: string): boolean {
    // 检查是否匹配包含模式
    const includeMatches = this.includes.length === 0 ||
      this.includes.some(pattern => this.matchPattern(filePath, pattern));

    if (!includeMatches) return false;

    // 检查是否匹配排除模式
    const excludeMatches = this.excludes.some(pattern => this.matchPattern(filePath, pattern));

    return !excludeMatches;
  }

  private matchPattern(filePath: string, pattern: string): boolean {
    // 简单的glob模式匹配
    const regexPattern = pattern
      .replace(/\\*\\*/g, '.*')  // ** -> .*
      .replace(/\\*/g, '[^/]*')  // * -> [^/]*
      .replace(/\\?/g, '.');      // ? -> .

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  }
}

/**
 * 规则定义接口
 */
export interface CheckRule {
  /** 规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 规则描述 */
  description: string;
  /** 违规级别 */
  level: ViolationLevel;
  /** 匹配模式 */
  pattern: string | RegExp;
  /** 文件过滤器 */
  filePattern?: FilePatternMatcher;
  /** 修复建议 */
  suggestion?: string;
  /** 相关链接 */
  links?: string[];
  /** 是否启用 */
  enabled?: boolean;
}

/**
 * 基于规则的检查器基类
 */
export abstract class RuleBasedChecker extends BaseChecker {
  protected abstract rules: CheckRule[];

  protected async doCheck(): Promise<void> {
    const enabledRules = this.rules.filter(rule => rule.enabled !== false);

    for (const rule of enabledRules) {
      await this.checkRule(rule);
    }
  }

  protected async checkRule(rule: CheckRule): Promise<void> {
    this.logProgress(`检查规则: ${rule.name}`, 'info');

    try {
      // 获取要检查的文件列表
      const allFiles = await this.findFiles(['**/*'], { absolute: false });
      const targetFiles = rule.filePattern
        ? allFiles.filter(file => rule.filePattern!.match(file))
        : allFiles;

      let ruleViolations = 0;

      for (const file of targetFiles) {
        const violations = await this.checkFileAgainstRule(file, rule);
        ruleViolations += violations;
      }

      if (ruleViolations === 0) {
        this.logProgress(`规则 ${rule.name}: 0违规`, 'success');
      } else {
        const level = rule.level === 'P0' ? 'error' : rule.level === 'P1' ? 'warning' : 'info';
        this.logProgress(`规则 ${rule.name}: ${ruleViolations}处违规`, level);
      }

    } catch (error) {
      this.logProgress(`规则 ${rule.name} 检查异常: ${error}`, 'error');
    }
  }

  protected async checkFileAgainstRule(filePath: string, rule: CheckRule): Promise<number> {
    try {
      const content = await this.readFile(filePath);
      const lines = content.split('\\n');
      let violations = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line !== undefined && line !== null) {
          const matches = this.matchRule(line, rule.pattern);

          if (matches) {
            this.addViolation({
              rule: rule.id,
              level: rule.level,
              file: filePath || 'unknown',
              line: i + 1,
              message: rule.description,
              snippet: line.trim(),
              suggestion: rule.suggestion,
              links: rule.links
            });
            violations++;
          }
        }
      }

      return violations;

    } catch (error) {
      return 0;
    }
  }

  private matchRule(text: string, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') {
      return text.includes(pattern);
    } else {
      return pattern.test(text);
    }
  }
}
