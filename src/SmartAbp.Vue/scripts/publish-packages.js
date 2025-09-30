#!/usr/bin/env node
/**
 * packages发布脚本
 * 自动化发布packages到npm
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const packagesDir = resolve(__dirname, '../packages')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${colors.bright}━━━ ${msg} ━━━${colors.reset}\n`)
}

/**
 * 获取所有可发布的packages
 */
function getAllPackages() {
  const packages = []
  const items = readdirSync(packagesDir)
  
  for (const item of items) {
    const packagePath = join(packagesDir, item)
    const stat = statSync(packagePath)
    
    if (stat.isDirectory() && item.startsWith('lowcode-')) {
      const packageJsonPath = join(packagePath, 'package.json')
      const distPath = join(packagePath, 'dist')
      
      if (existsSync(packageJsonPath) && existsSync(distPath)) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
          
          // 跳过private包
          if (packageJson.private) {
            log.warn(`跳过私有包: ${item}`)
            continue
          }
          
          packages.push({
            name: item,
            path: packagePath,
            packageJsonPath,
            packageJson,
            version: packageJson.version || '0.0.0',
            npmName: packageJson.name || `@smartabp/${item}`
          })
        } catch (e) {
          log.warn(`无法读取 ${item}/package.json`)
        }
      } else {
        log.warn(`${item} 缺少dist目录，请先构建`)
      }
    }
  }
  
  return packages
}

/**
 * 检查npm登录状态
 */
async function checkNpmAuth() {
  try {
    await execAsync('npm whoami')
    return true
  } catch (error) {
    return false
  }
}

/**
 * 发布单个package
 */
async function publishPackage(pkg, options = {}) {
  const { dryRun = false, tag = 'latest', access = 'public' } = options
  
  log.info(`发布 ${colors.bright}${pkg.npmName}@${pkg.version}${colors.reset}...`)
  
  try {
    // 构建发布命令
    let publishCmd = 'npm publish'
    if (dryRun) {
      publishCmd += ' --dry-run'
    }
    publishCmd += ` --tag ${tag}`
    publishCmd += ` --access ${access}`
    
    // 执行发布
    const { stdout, stderr } = await execAsync(publishCmd, { cwd: pkg.path })
    
    if (dryRun) {
      log.info(`  [DRY RUN] 模拟发布成功`)
    } else {
      log.success(`  发布成功 ✨`)
    }
    
    return { success: true, package: pkg.name }
  } catch (error) {
    log.error(`  发布失败: ${error.message}`)
    return { success: false, package: pkg.name, error: error.message }
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const tag = args.find(arg => arg.startsWith('--tag='))?.split('=')[1] || 'latest'
  const access = args.find(arg => arg.startsWith('--access='))?.split('=')[1] || 'public'
  
  log.section('📦 packages发布系统')
  
  if (dryRun) {
    log.warn('🔍 DRY RUN 模式 - 不会真正发布到npm')
  }
  
  // 检查npm登录状态
  if (!dryRun) {
    log.info('检查npm登录状态...')
    const isLoggedIn = await checkNpmAuth()
    if (!isLoggedIn) {
      log.error('未登录npm，请先执行: npm login')
      process.exit(1)
    }
    log.success('npm登录验证通过')
  }
  
  // 获取所有packages
  const packages = getAllPackages()
  log.info(`发现 ${colors.bright}${packages.length}${colors.reset} 个可发布packages\n`)
  
  packages.forEach(pkg => {
    console.log(`  ${colors.bright}${pkg.npmName}${colors.reset}: ${colors.green}${pkg.version}${colors.reset}`)
  })
  
  // 发布确认
  if (!dryRun) {
    log.section('⚠️  即将发布到npm')
    log.warn(`Tag: ${tag}`)
    log.warn(`Access: ${access}`)
    log.warn('\n按 Ctrl+C 取消，或等待5秒自动继续...\n')
    
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
  
  // 开始发布
  log.section('🚀 开始发布')
  
  const results = []
  for (const pkg of packages) {
    const result = await publishPackage(pkg, { dryRun, tag, access })
    results.push(result)
    
    // 发布之间等待1秒，避免npm限流
    if (!dryRun && packages.indexOf(pkg) < packages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  // 统计结果
  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length
  
  log.section('📊 发布结果')
  log.info(`总计: ${packages.length} 个packages`)
  log.success(`成功: ${successCount} 个`)
  
  if (failCount > 0) {
    log.error(`失败: ${failCount} 个`)
    results.filter(r => !r.success).forEach(r => {
      log.error(`  - ${r.package}: ${r.error}`)
    })
  }
  
  if (!dryRun && successCount > 0) {
    log.section('✨ 发布完成')
    log.success('所有packages已成功发布到npm！')
  }
  
  // 退出码
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch(error => {
  log.error(`发布系统错误: ${error.message}`)
  console.error(error)
  process.exit(1)
})
