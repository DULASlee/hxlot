#!/usr/bin/env node
/**
 * 发布前检查脚本
 * 确保packages可以安全发布
 */

import { readFileSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { execSync } from 'child_process'

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
 * 检查清单
 */
const checks = {
  // 检查package.json配置
  packageJson: (pkg) => {
    const issues = []
    
    if (!pkg.packageJson.name) {
      issues.push('缺少name字段')
    }
    
    if (!pkg.packageJson.version) {
      issues.push('缺少version字段')
    }
    
    if (!pkg.packageJson.description) {
      issues.push('缺少description字段')
    }
    
    if (!pkg.packageJson.license) {
      issues.push('缺少license字段')
    }
    
    if (!pkg.packageJson.repository) {
      issues.push('缺少repository字段')
    }
    
    if (!pkg.packageJson.publishConfig?.access) {
      issues.push('缺少publishConfig.access字段')
    }
    
    return issues
  },
  
  // 检查构建产物
  buildOutput: (pkg) => {
    const issues = []
    const distPath = join(pkg.path, 'dist')
    
    if (!existsSync(distPath)) {
      issues.push('缺少dist目录，请先构建')
      return issues
    }
    
    const indexJs = join(distPath, 'index.js')
    const indexDts = join(distPath, 'index.d.ts')
    
    if (!existsSync(indexJs)) {
      issues.push('缺少dist/index.js文件')
    }
    
    if (!existsSync(indexDts)) {
      issues.push('缺少dist/index.d.ts文件')
    }
    
    return issues
  },
  
  // 检查README
  readme: (pkg) => {
    const issues = []
    const readmePath = join(pkg.path, 'README.md')
    
    if (!existsSync(readmePath)) {
      issues.push('缺少README.md文件')
    }
    
    return issues
  },
  
  // 检查版本冲突
  versionConflict: (pkg) => {
    const issues = []
    
    try {
      const result = execSync(
        `npm view ${pkg.packageJson.name}@${pkg.packageJson.version} version 2>/dev/null`,
        { encoding: 'utf-8' }
      ).trim()
      
      if (result === pkg.packageJson.version) {
        issues.push(`版本 ${pkg.packageJson.version} 已存在于npm registry`)
      }
    } catch (e) {
      // 版本不存在，这是好的
    }
    
    return issues
  },
  
  // 检查依赖版本
  dependencies: (pkg) => {
    const issues = []
    const deps = {
      ...pkg.packageJson.dependencies,
      ...pkg.packageJson.peerDependencies
    }
    
    for (const [name, version] of Object.entries(deps)) {
      if (!version || version === '*') {
        issues.push(`依赖 ${name} 缺少明确的版本号`)
      }
    }
    
    return issues
  }
}

/**
 * 执行检查
 */
function runChecks(pkg) {
  const results = {}
  let totalIssues = 0
  
  for (const [checkName, checkFn] of Object.entries(checks)) {
    const issues = checkFn(pkg)
    results[checkName] = issues
    totalIssues += issues.length
  }
  
  return { results, totalIssues }
}

/**
 * 主函数
 */
function main() {
  log.section('📋 发布前检查')
  
  // 获取可发布的packages
  const packages = []
  const items = ['lowcode-shared', 'lowcode-core', 'lowcode-api', 'lowcode-designer', 'lowcode-tools']
  
  for (const item of items) {
    const packagePath = join(packagesDir, item)
    const packageJsonPath = join(packagePath, 'package.json')
    
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
        if (!packageJson.private) {
          packages.push({
            name: item,
            path: packagePath,
            packageJson
          })
        }
      } catch (e) {
        log.error(`无法读取 ${item}/package.json`)
      }
    }
  }
  
  log.info(`检查 ${colors.bright}${packages.length}${colors.reset} 个packages\n`)
  
  // 执行检查
  let globalIssueCount = 0
  const results = []
  
  for (const pkg of packages) {
    const { results: checkResults, totalIssues } = runChecks(pkg)
    globalIssueCount += totalIssues
    
    results.push({
      package: pkg,
      checkResults,
      totalIssues
    })
  }
  
  // 输出结果
  log.section('📊 检查结果')
  
  for (const result of results) {
    const icon = result.totalIssues === 0 ? colors.green + '✓' : colors.red + '✗'
    console.log(`${icon}${colors.reset} ${colors.bright}${result.package.name}${colors.reset} (${result.package.packageJson.version})`)
    
    if (result.totalIssues > 0) {
      for (const [checkName, issues] of Object.entries(result.checkResults)) {
        if (issues.length > 0) {
          console.log(`  ${colors.yellow}${checkName}:${colors.reset}`)
          issues.forEach(issue => {
            console.log(`    - ${issue}`)
          })
        }
      }
    }
  }
  
  // 总结
  log.section('📈 总结')
  
  const passedCount = results.filter(r => r.totalIssues === 0).length
  const failedCount = results.filter(r => r.totalIssues > 0).length
  
  log.info(`总计: ${packages.length} 个packages`)
  log.success(`通过: ${passedCount} 个`)
  
  if (failedCount > 0) {
    log.error(`失败: ${failedCount} 个`)
    log.error(`总问题数: ${globalIssueCount}`)
    console.log('\n请修复上述问题后再发布！')
    process.exit(1)
  } else {
    log.success('所有检查通过，可以发布！ ✨')
    process.exit(0)
  }
}

main()
