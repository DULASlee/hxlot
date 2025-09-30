#!/usr/bin/env node
/**
 * packages独立构建脚本
 * 支持独立发布到npm的packages构建系统
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { resolve, join } from 'path'
import { readdirSync, statSync, existsSync } from 'fs'
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
 * 获取所有packages
 */
function getAllPackages() {
  const packages = []
  const items = readdirSync(packagesDir)
  
  for (const item of items) {
    const packagePath = join(packagesDir, item)
    const stat = statSync(packagePath)
    
    if (stat.isDirectory() && item.startsWith('lowcode-')) {
      const packageJsonPath = join(packagePath, 'package.json')
      const tsconfigPath = join(packagePath, 'tsconfig.json')
      
      if (existsSync(packageJsonPath) && existsSync(tsconfigPath)) {
        packages.push({
          name: item,
          path: packagePath,
          packageJsonPath,
          tsconfigPath
        })
      }
    }
  }
  
  return packages
}

/**
 * 构建单个package
 */
async function buildPackage(pkg) {
  log.info(`构建 ${colors.bright}${pkg.name}${colors.reset}...`)
  
  try {
    // 1. TypeScript编译
    log.info(`  TypeScript编译...`)
    const tscCmd = `npx tsc -p ${pkg.tsconfigPath}`
    await execAsync(tscCmd, { cwd: pkg.path })
    log.success(`  TypeScript编译完成`)
    
    // 2. 复制资源文件（如果有）
    const srcPath = join(pkg.path, 'src')
    const distPath = join(pkg.path, 'dist')
    
    if (existsSync(srcPath)) {
      // 复制.vue文件
      try {
        await execAsync(`find ${srcPath} -name "*.vue" -exec cp --parents {} ${distPath} \\;`, { cwd: pkg.path })
        log.success(`  资源文件复制完成`)
      } catch (e) {
        // 如果没有.vue文件，跳过
      }
    }
    
    log.success(`${pkg.name} 构建完成 ✨`)
    return { success: true, package: pkg.name }
  } catch (error) {
    log.error(`${pkg.name} 构建失败: ${error.message}`)
    return { success: false, package: pkg.name, error: error.message }
  }
}

/**
 * 主构建函数
 */
async function main() {
  const startTime = Date.now()
  
  log.section('📦 packages独立构建系统')
  
  // 获取所有packages
  const packages = getAllPackages()
  log.info(`发现 ${colors.bright}${packages.length}${colors.reset} 个packages`)
  packages.forEach(pkg => log.info(`  - ${pkg.name}`))
  
  // 并行构建
  log.section('🔨 开始构建')
  const results = await Promise.all(packages.map(pkg => buildPackage(pkg)))
  
  // 统计结果
  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length
  
  log.section('📊 构建结果')
  log.info(`总计: ${packages.length} 个packages`)
  log.success(`成功: ${successCount} 个`)
  
  if (failCount > 0) {
    log.error(`失败: ${failCount} 个`)
    results.filter(r => !r.success).forEach(r => {
      log.error(`  - ${r.package}: ${r.error}`)
    })
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  log.info(`\n⏱️  总耗时: ${colors.bright}${duration}s${colors.reset}`)
  
  // 退出码
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch(error => {
  log.error(`构建系统错误: ${error.message}`)
  console.error(error)
  process.exit(1)
})
