/**
 * AI编程铁律执行引擎 v7.0 - 智能检查（增量+快速）
 * 
 * @file smart-check.ts
 * @description 只检查改动的文件，简单快速
 * @author 世界顶级低代码引擎架构师
 * @date 2025-10-04
 * @version 1.0.0-mvp
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface CheckResult {
  success: boolean
  message: string
  duration: number
}

/**
 * 智能检查 - 只检查改动的文件
 * 
 * @example
 * ```typescript
 * const result = await smartCheck()
 * if (result.success) {
 *   console.log(`✅ 检查通过 (${result.duration}ms)`)
 * }
 * ```
 */
export async function smartCheck(): Promise<CheckResult> {
  const startTime = Date.now()
  
  console.log('🔍 开始智能检查...')
  
  try {
    // 获取改动的文件
    const { stdout } = await execAsync('git diff --name-only HEAD', { timeout: 5000 })
    const changedFiles = stdout.trim().split('\n').filter(line => line.length > 0)
    
    if (changedFiles.length === 0) {
      console.log('⏭️ 无文件改动，跳过检查')
      return {
        success: true,
        message: '⏭️ 无文件改动',
        duration: Date.now() - startTime
      }
    }
    
    console.log(`📝 发现 ${changedFiles.length} 个文件改动`)
    
    // 检查packages目录是否有改动
    const packagesChanged = changedFiles.some(f => f.includes('packages/'))
    
    if (packagesChanged) {
      console.log('🔍 检查packages目录...')
      
      // 使用项目已有的npm scripts
      await execAsync('npm run lint', {
        cwd: 'src/SmartAbp.Vue',
        timeout: 60000
      })
      
      console.log('✅ 检查通过')
    } else {
      console.log('⏭️ packages无改动，跳过检查')
    }
    
    return {
      success: true,
      message: '✅ 智能检查通过',
      duration: Date.now() - startTime
    }
  } catch (error: any) {
    return {
      success: false,
      message: `❌ 检查失败: ${error.message}`,
      duration: Date.now() - startTime
    }
  }
}

