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

const execAsync = promisify(exec)

export interface GitSyncResult {
  success: boolean
  message: string
  stdout?: string
  stderr?: string
  method?: string  // 添加method字段
  error?: Error    // 添加error字段
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

/**
 * Git同步多层降级策略 - 优化4
 * 三层降级: 项目脚本 → 内联命令 → 手动指导
 */
export async function gitSyncWithFallback(): Promise<GitSyncResult> {
  const strategies = [
    // 第一层: 项目成熟脚本 (最高优先级)
    { 
      method: 'SCRIPT', 
      name: '项目Git安全同步脚本',
      command: process.platform === 'win32' 
        ? 'pwsh -File scripts/git/git-safe-sync.ps1 --auto-commit --non-interactive'
        : 'bash scripts/git/git-safe-sync.sh --auto-commit --non-interactive'
    },
    
    // 第二层: 内联Git命令 (降级方案)
    { 
      method: 'INLINE', 
      name: '内联Git命令',
      steps: [
        'git add .',
        'git commit -m "Auto: Quality gates passed"',
        'git pull --rebase origin main',
        'git push origin main'
      ]
    },
    
    // 第三层: 手动指导 (最终降级)
    { 
      method: 'MANUAL', 
      name: '手动Git操作指导',
      handler: () => {
        console.log('🚨 所有自动方法失败，请手动执行以下命令:')
        console.log('1. git add .')
        console.log('2. git commit -m "Your commit message"')
        console.log('3. git pull --rebase origin main')
        console.log('4. git push origin main')
      }
    }
  ]

  let result: GitSyncResult = { success: false, message: '未执行', method: 'NONE' }
  
  for (const strategy of strategies) {
    try {
      console.log(`🔄 尝试方法: ${strategy.name}`)
      
      if (strategy.method === 'SCRIPT') {
        // 执行项目脚本
        await execAsync(strategy.command!)
        result = { success: true, message: '项目脚本执行成功', method: strategy.method }
        break
        
      } else if (strategy.method === 'INLINE') {
        // 执行内联命令
        for (const step of strategy.steps!) {
          await execAsync(step)
        }
        result = { success: true, message: '内联命令执行成功', method: strategy.method }
        break
        
      } else if (strategy.method === 'MANUAL') {
        // 提供手动指导
        strategy.handler!()
        result = { success: false, message: '需要手动Git操作', method: strategy.method, error: new Error('需要手动Git操作') }
        break
      }
      
    } catch (error) {
      console.log(`❌ ${strategy.name} 失败: ${error}`)
      
      // 记录错误到AI学习系统
      // learningManager.recordError('GIT_SYNC_FAILED', strategy.method) // This line was removed as per the edit hint
      
      // 继续尝试下一个策略
      continue
    }
  }
  
  // 记录成功到AI学习系统
  if (result.success) {
    // learningManager.recordSuccess('GIT_SYNC_SUCCESS', result.method!) // This line was removed as per the edit hint
  }
  
  return result
}

