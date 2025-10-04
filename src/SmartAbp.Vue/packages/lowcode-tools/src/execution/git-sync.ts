/**
 * AI编程铁律执行引擎 v7.0 - Git同步（直接使用项目成熟脚本）
 * 
 * @file git-sync.ts
 * @description 直接调用项目已有的git-safe-sync脚本，简单可靠
 * @author 世界顶级低代码引擎架构师
 * @date 2025-10-04
 * @version 1.0.0-mvp
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'

const execAsync = promisify(exec)

export interface GitSyncResult {
  success: boolean
  message: string
  stdout?: string
  stderr?: string
}

/**
 * Git同步 - 使用项目成熟脚本
 * 
 * 调用项目已有的git-safe-sync脚本：
 * - Windows: scripts/git/git-safe-sync.ps1
 * - Linux/Mac: scripts/git/git-safe-sync.sh
 * 
 * @example
 * ```typescript
 * const result = await gitSync()
 * if (result.success) {
 *   console.log('✅ Git同步成功')
 * }
 * ```
 */
export async function gitSync(): Promise<GitSyncResult> {
  const isWindows = process.platform === 'win32'
  
  // 使用项目成熟的git-safe-sync脚本
  const scriptPath = isWindows
    ? 'scripts\\git\\git-safe-sync.ps1'
    : 'scripts/git/git-safe-sync.sh'
  
  const command = isWindows
    ? `powershell -ExecutionPolicy Bypass -File ${scriptPath} -AutoCommit`
    : `bash ${scriptPath} --auto-commit --non-interactive`
  
  console.log('🔄 执行Git同步（使用项目成熟脚本）...')
  console.log(`📜 脚本: ${scriptPath}`)
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: 120000, // 2分钟超时
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    })
    
    // 输出脚本执行日志
    if (stdout) console.log(stdout)
    if (stderr) console.warn(stderr)
    
    return {
      success: true,
      message: '✅ Git同步成功',
      stdout,
      stderr
    }
  } catch (error: any) {
    console.error('❌ Git同步失败:', error.message)
    
    // 输出错误详情
    if (error.stdout) console.log(error.stdout)
    if (error.stderr) console.error(error.stderr)
    
    return {
      success: false,
      message: `❌ Git同步失败: ${error.message}`,
      stdout: error.stdout,
      stderr: error.stderr
    }
  }
}

/**
 * 检查Git状态
 */
export async function checkGitStatus(): Promise<{
  hasChanges: boolean
  changedFiles: string[]
}> {
  try {
    const { stdout } = await execAsync('git status --porcelain', { timeout: 5000 })
    const lines = stdout.trim().split('\n').filter(line => line.length > 0)
    
    return {
      hasChanges: lines.length > 0,
      changedFiles: lines.map(line => line.substring(3))
    }
  } catch (error) {
    console.warn('⚠️ 检查Git状态失败')
    return { hasChanges: false, changedFiles: [] }
  }
}

