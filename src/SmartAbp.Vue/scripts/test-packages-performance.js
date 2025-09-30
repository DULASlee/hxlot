#!/usr/bin/env node
/**
 * packages性能测试脚本
 * 测试packages的加载性能和运行时性能
 */

import { readFileSync, statSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { gzipSync, brotliCompressSync } from 'zlib'

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
 * 格式化文件大小
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`
}

/**
 * 获取目录大小
 */
function getDirectorySize(dirPath) {
  let totalSize = 0
  
  try {
    const items = readdirSync(dirPath)
    
    for (const item of items) {
      const itemPath = join(dirPath, item)
      const stat = statSync(itemPath)
      
      if (stat.isFile()) {
        totalSize += stat.size
      } else if (stat.isDirectory()) {
        totalSize += getDirectorySize(itemPath)
      }
    }
  } catch (e) {
    // 忽略错误
  }
  
  return totalSize
}

/**
 * 分析单个package的性能
 */
function analyzePackagePerformance(packageName) {
  const packagePath = join(packagesDir, packageName)
  const distPath = join(packagePath, 'dist')
  const srcPath = join(packagePath, 'src')
  
  const performance = {
    name: packageName,
    exists: false,
    srcSize: 0,
    distSize: 0,
    compression: {
      gzip: 0,
      brotli: 0
    },
    files: {
      total: 0,
      js: 0,
      ts: 0,
      vue: 0
    },
    quality: {
      score: 100,
      issues: []
    }
  }
  
  try {
    // 检查是否存在
    statSync(packagePath)
    performance.exists = true
    
    // 源码大小
    try {
      performance.srcSize = getDirectorySize(srcPath)
    } catch (e) {}
    
    // 构建产物大小
    try {
      performance.distSize = getDirectorySize(distPath)
      
      // 压缩比分析
      try {
        const indexJsPath = join(distPath, 'index.js')
        const indexContent = readFileSync(indexJsPath)
        performance.compression.gzip = gzipSync(indexContent).length
        performance.compression.brotli = brotliCompressSync(indexContent).length
      } catch (e) {}
    } catch (e) {
      performance.quality.issues.push('缺少构建产物')
      performance.quality.score -= 30
    }
    
    // 文件统计
    try {
      const countFiles = (dir, ext) => {
        let count = 0
        const items = readdirSync(dir)
        for (const item of items) {
          const itemPath = join(dir, item)
          const stat = statSync(itemPath)
          if (stat.isFile() && item.endsWith(ext)) {
            count++
          } else if (stat.isDirectory()) {
            count += countFiles(itemPath, ext)
          }
        }
        return count
      }
      
      performance.files.js = countFiles(distPath, '.js')
      performance.files.ts = countFiles(srcPath, '.ts')
      performance.files.vue = countFiles(srcPath, '.vue')
      performance.files.total = performance.files.js + performance.files.ts + performance.files.vue
    } catch (e) {}
    
    // 性能预算检查
    const MAX_PACKAGE_SIZE = 512 * 1024 // 512KB
    if (performance.distSize > MAX_PACKAGE_SIZE) {
      performance.quality.issues.push(`包体积过大 (${formatSize(performance.distSize)} > ${formatSize(MAX_PACKAGE_SIZE)})`)
      performance.quality.score -= 20
    }
    
    // 压缩率检查
    if (performance.compression.gzip > 0) {
      const compressionRatio = performance.compression.gzip / performance.distSize
      if (compressionRatio > 0.6) {
        performance.quality.issues.push('压缩率较低，可能存在优化空间')
        performance.quality.score -= 10
      }
    }
    
  } catch (e) {
    performance.exists = false
  }
  
  return performance
}

/**
 * 主函数
 */
function main() {
  log.section('⚡ packages性能测试')
  
  const packages = [
    'lowcode-shared',
    'lowcode-core',
    'lowcode-api',
    'lowcode-designer',
    'lowcode-tools'
  ]
  
  const results = packages.map(pkg => analyzePackagePerformance(pkg))
  
  // 输出结果
  log.section('📊 性能分析结果')
  
  console.log('┌─────────────────────┬─────────┬──────────┬──────────┬─────────┬────────┐')
  console.log('│ Package             │ 源码    │ 构建产物 │ Gzip     │ Brotli  │ 评分   │')
  console.log('├─────────────────────┼─────────┼──────────┼──────────┼─────────┼────────┤')
  
  let totalSrcSize = 0
  let totalDistSize = 0
  let totalGzipSize = 0
  let totalBrotliSize = 0
  let avgScore = 0
  
  for (const result of results) {
    const { name, srcSize, distSize, compression, quality } = result
    
    if (result.exists) {
      totalSrcSize += srcSize
      totalDistSize += distSize
      totalGzipSize += compression.gzip
      totalBrotliSize += compression.brotli
      avgScore += quality.score
      
      const scoreColor = quality.score >= 90 ? colors.green :
                        quality.score >= 70 ? colors.yellow :
                        colors.red
      
      console.log(
        `│ ${name.padEnd(19)} │ ${formatSize(srcSize).padEnd(7)} │ ${formatSize(distSize).padEnd(8)} │ ${formatSize(compression.gzip).padEnd(8)} │ ${formatSize(compression.brotli).padEnd(7)} │ ${scoreColor}${quality.score}${colors.reset}${String(quality.score).padStart(3)}   │`
      )
      
      if (quality.issues.length > 0) {
        console.log(`│ ${colors.yellow}  问题: ${quality.issues.join(', ')}${colors.reset}`.padEnd(85 + colors.yellow.length + colors.reset.length) + '│')
      }
    } else {
      console.log(`│ ${name.padEnd(19)} │ ${colors.red}不存在${colors.reset}`.padEnd(70 + colors.red.length + colors.reset.length) + '│')
    }
  }
  
  console.log('└─────────────────────┴─────────┴──────────┴──────────┴─────────┴────────┘')
  
  // 总计
  log.section('📈 总计')
  avgScore = avgScore / results.filter(r => r.exists).length
  
  console.log(`  源码总大小:     ${colors.bright}${formatSize(totalSrcSize)}${colors.reset}`)
  console.log(`  构建产物总大小: ${colors.bright}${formatSize(totalDistSize)}${colors.reset}`)
  console.log(`  Gzip压缩后:     ${colors.bright}${formatSize(totalGzipSize)}${colors.reset} (压缩率: ${((1 - totalGzipSize / totalDistSize) * 100).toFixed(1)}%)`)
  console.log(`  Brotli压缩后:   ${colors.bright}${formatSize(totalBrotliSize)}${colors.reset} (压缩率: ${((1 - totalBrotliSize / totalDistSize) * 100).toFixed(1)}%)`)
  console.log(`  平均性能评分:   ${colors.bright}${avgScore.toFixed(1)}${colors.reset}/100`)
  
  // 性能建议
  log.section('💡 性能优化建议')
  
  const suggestions = []
  
  if (totalDistSize > 1024 * 1024) {
    suggestions.push('• 总包体积较大，建议启用代码分割')
  }
  
  const compressionRatio = totalGzipSize / totalDistSize
  if (compressionRatio > 0.6) {
    suggestions.push('• Gzip压缩率较低，建议检查是否有重复代码或可优化的资源')
  }
  
  const hasLargePackage = results.some(r => r.distSize > 512 * 1024)
  if (hasLargePackage) {
    suggestions.push('• 存在超过512KB的package，建议进一步拆分')
  }
  
  if (suggestions.length > 0) {
    suggestions.forEach(s => log.warn(s))
  } else {
    log.success('性能表现良好，无明显优化空间！')
  }
  
  log.section('✨ 性能测试完成')
}

main()
