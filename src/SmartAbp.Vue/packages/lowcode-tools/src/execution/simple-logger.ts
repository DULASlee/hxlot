/**
 * AI编程铁律执行引擎 v7.0 - MVP极简日志
 * 
 * @file simple-logger.ts
 * @description 简单的执行日志，输出到控制台和文件
 * @author 世界顶级低代码引擎架构师
 * @date 2025-10-04
 * @version 1.0.0-mvp
 */

import * as fs from 'fs'
import * as path from 'path'

/**
 * 日志级别
 */
export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

/**
 * 极简日志器 - MVP方案
 * 
 * 简单实用：
 * - 输出到控制台（带颜色）
 * - 追加到日志文件
 * - 自动时间戳
 * 
 * @example
 * ```typescript
 * const logger = new SimpleLogger()
 * 
 * logger.info('开始执行')
 * logger.success('执行成功')
 * logger.warning('发现警告')
 * logger.error('执行失败', new Error('原因'))
 * ```
 */
export class SimpleLogger {
  private readonly LOG_DIR = '.ai-engine/logs'
  private readonly LOG_FILE = 'execution.log'
  constructor() {
    this.ensureLogDir()
  }
  
  /**
   * 确保日志目录存在
   */
  private ensureLogDir(): void {
    const dir = path.join(process.cwd(), this.LOG_DIR)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
  
  /**
   * 获取日志文件路径
   */
  private getLogPath(): string {
    return path.join(process.cwd(), this.LOG_DIR, this.LOG_FILE)
  }
  
  /**
   * 格式化日志消息
   */
  private format(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level}]`
    
    let logMessage = `${prefix} ${message}`
    
    if (data) {
      if (data instanceof Error) {
        logMessage += `\n  错误: ${data.message}`
        if (data.stack) {
          logMessage += `\n  堆栈: ${data.stack}`
        }
      } else {
        logMessage += `\n  数据: ${JSON.stringify(data, null, 2)}`
      }
    }
    
    return logMessage
  }
  
  /**
   * 获取控制台颜色
   */
  private getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.SUCCESS:
        return '\x1b[32m' // 绿色
      case LogLevel.WARNING:
        return '\x1b[33m' // 黄色
      case LogLevel.ERROR:
        return '\x1b[31m' // 红色
      default:
        return '\x1b[37m' // 白色
    }
  }
  
  /**
   * 获取控制台图标
   */
  private getIcon(level: LogLevel): string {
    switch (level) {
      case LogLevel.SUCCESS:
        return '✅'
      case LogLevel.WARNING:
        return '⚠️'
      case LogLevel.ERROR:
        return '❌'
      default:
        return 'ℹ️'
    }
  }
  
  /**
   * 写入日志
   */
  private write(level: LogLevel, message: string, data?: any): void {
    try {
      const logMessage = this.format(level, message, data)
      
      // 输出到控制台（带颜色）
      const color = this.getColor(level)
      const icon = this.getIcon(level)
      const reset = '\x1b[0m'
      console.log(`${color}${icon} ${message}${reset}`)
      
      if (data && data instanceof Error) {
        console.error(data)
      } else if (data) {
        console.log(data)
      }
      
      // 追加到文件
      const logPath = this.getLogPath()
      fs.appendFileSync(logPath, logMessage + '\n', 'utf-8')
    } catch (error) {
      console.warn('⚠️ 写入日志失败:', error)
    }
  }
  
  /**
   * 记录信息日志
   */
  public info(message: string, data?: any): void {
    this.write(LogLevel.INFO, message, data)
  }
  
  /**
   * 记录成功日志
   */
  public success(message: string, data?: any): void {
    this.write(LogLevel.SUCCESS, message, data)
  }
  
  /**
   * 记录警告日志
   */
  public warning(message: string, data?: any): void {
    this.write(LogLevel.WARNING, message, data)
  }
  
  /**
   * 记录错误日志
   */
  public error(message: string, error?: Error | any): void {
    this.write(LogLevel.ERROR, message, error)
  }
  
  /**
   * 记录阶段开始
   */
  public startStage(stage: string): void {
    const separator = '━'.repeat(60)
    this.info(`\n${separator}`)
    this.info(`🚀 开始阶段: ${stage}`)
    this.info(separator)
  }
  
  /**
   * 记录阶段结束
   */
  public endStage(stage: string, duration: number): void {
    const separator = '━'.repeat(60)
    this.success(`✅ 完成阶段: ${stage} (耗时: ${duration}ms)`)
    this.info(`${separator}\n`)
  }
  
  /**
   * 获取日志文件路径
   */
  public getLogFilePath(): string {
    return this.getLogPath()
  }
}

/**
 * 单例实例
 */
export const simpleLogger = new SimpleLogger()

