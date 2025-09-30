#!/usr/bin/env node
/**
 * packages快速构建脚本 (优化版)
 * 使用并行构建、增量编译和缓存优化
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { resolve, join } from 'path'
import { readdirSync, statSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createHash } from 'crypto'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const packagesDir = resolve(__dirname, '../packages')
const cacheDir = resolve(__dirname, '../node_modules/.cache/packages-build')

// 确保缓存目录存在
if (!existsSync(cacheDir)) {
  mkdirSync(cacheDir, { recursive: true })
}

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
 * 计算目录内容的哈希值
 */
function getDirectoryHash(dirPath) {
  const hash = createHash('md5')
  
  try {
    const files = readdirSync(dirPath)
    for (const file of files.sort()) {
      const filePath = join(dirPath, file)
      const stat = statSync(filePath)
      
      if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.vue'))) {
        const content = readFileSync(filePath, 'utf-8')
        hash.update(content)
      } else if (stat.isDirectory() && file !== 'dist' && file !== 'node_modules') {
        hash.update(getDirectoryHash(filePath))
      }
    }
  } catch (e) {
    // 忽略错误
  }
  
  return hash.digest('hex')
}

/**
 * 检查是否需要重新构建
 */
function needsRebuild(pkg) {
  const cacheFile = join(cacheDir, `${pkg.name}.cache`)
  const srcPath = join(pkg.path, 'src')
  
  if (!existsSync(cacheFile)) {
    return true
  }
  
  try {
    const cache = JSON.parse(readFileSync(cacheFile, 'utf-8'))
    const currentHash = getDirectoryHash(srcPath)
    
    return cache.hash !== currentHash
  } catch (e) {
    return true
  }
}

/**
 * 保存构建缓存
 */
function saveBuildCache(pkg) {
  const cacheFile = join(cacheDir, `${pkg.name}.cache`)
  const srcPath = join(pkg.path, 'src')
  const hash = getDirectoryHash(srcPath)
  
  writeFileSync(cacheFile, JSON.stringify({ hash, timestamp: Date.now() }))
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
          tsconfigPath,
          needsRebuild: false
        })
      }
    }
  }
  
  return packages
}

/**
 * 构建单个package (增量)
 */
async function buildPackage(pkg) {
  // 检查是否需要重新构建
  if (!needsRebuild(pkg)) {
    log.info(`${colors.bright}${pkg.name}${colors.reset} 无变化，跳过构建`)
    return { success: true, package: pkg.name, skipped: true }
  }
  
  log.info(`构建 ${colors.bright}${pkg.name}${colors.reset}...`)
  
  try {
    // 使用增量编译
    const tscCmd = `npx tsc -p ${pkg.tsconfigPath} --incremental`
    await execAsync(tscCmd, { cwd: pkg.path })
    
    // 保存缓存
    saveBuildCache(pkg)
    
    log.success(`${pkg.name} 构建完成 ✨`)
    return { success: true, package: pkg.name, skipped: false }
  } catch (error) {
    log.error(`${pkg.name} 构建失败`)
    return { success: false, package: pkg.name, error: error.message, skipped: false }
  }
}

/**
 * 主构建函数
 */
async function main() {
  const startTime = Date.now()
  
  log.section('⚡ packages快速构建系统 (优化版)')
  
  // 获取所有packages
  const packages = getAllPackages()
  log.info(`发现 ${colors.bright}${packages.length}${colors.reset} 个packages`)
  
  // 检查哪些需要重新构建
  log.info('检查增量构建缓存...')
  const needsRebuildCount = packages.filter(pkg => needsRebuild(pkg)).length
  const cachedCount = packages.length - needsRebuildCount
  
  if (cachedCount > 0) {
    log.success(`${cachedCount} 个packages可使用缓存`)
  }
  if (needsRebuildCount > 0) {
    log.info(`${needsRebuildCount} 个packages需要重新构建`)
  }
  
  // 并行构建
  log.section('🔨 开始构建')
  const results = await Promise.all(packages.map(pkg => buildPackage(pkg)))
  
  // 统计结果
  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length
  const skippedCount = results.filter(r => r.skipped).length
  const builtCount = successCount - skippedCount
  
  log.section('📊 构建结果')
  log.info(`总计: ${packages.length} 个packages`)
  log.success(`成功: ${successCount} 个`)
  if (skippedCount > 0) {
    log.info(`缓存: ${skippedCount} 个`)
  }
  if (builtCount > 0) {
    log.info(`构建: ${builtCount} 个`)
  }
  
  if (failCount > 0) {
    log.error(`失败: ${failCount} 个`)
    results.filter(r => !r.success).forEach(r => {
      log.error(`  - ${r.package}`)
    })
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  log.info(`\n⏱️  总耗时: ${colors.bright}${duration}s${colors.reset}`)
  
  if (duration < 3) {
    log.success(`🎉 构建速度目标达成！(<3s)`)
  }
  
  // 退出码
  process.exit(failCount > 0 ? 1 : 0)
}

main().catch(error => {
  log.error(`构建系统错误: ${error.message}`)
  console.error(error)
  process.exit(1)
})
