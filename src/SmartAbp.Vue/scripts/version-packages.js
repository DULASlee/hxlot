#!/usr/bin/env node
/**
 * packages版本管理脚本
 * 统一管理所有packages的版本号
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

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
      
      if (existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
          packages.push({
            name: item,
            path: packagePath,
            packageJsonPath,
            packageJson,
            currentVersion: packageJson.version || '0.0.0'
          })
        } catch (e) {
          log.warn(`无法读取 ${item}/package.json`)
        }
      }
    }
  }
  
  return packages
}

/**
 * 解析版本号
 */
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(-(.+))?$/)
  if (!match) {
    throw new Error(`无效的版本号: ${version}`)
  }
  
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[5] || null
  }
}

/**
 * 格式化版本号
 */
function formatVersion(version) {
  let v = `${version.major}.${version.minor}.${version.patch}`
  if (version.prerelease) {
    v += `-${version.prerelease}`
  }
  return v
}

/**
 * 升级版本号
 */
function bumpVersion(currentVersion, type = 'patch') {
  const version = parseVersion(currentVersion)
  
  switch (type) {
    case 'major':
      version.major++
      version.minor = 0
      version.patch = 0
      version.prerelease = null
      break
    case 'minor':
      version.minor++
      version.patch = 0
      version.prerelease = null
      break
    case 'patch':
      version.patch++
      version.prerelease = null
      break
    case 'prerelease':
      if (version.prerelease) {
        const match = version.prerelease.match(/^(\w+)\.(\d+)$/)
        if (match) {
          version.prerelease = `${match[1]}.${parseInt(match[2]) + 1}`
        } else {
          version.prerelease = `${version.prerelease}.1`
        }
      } else {
        version.patch++
        version.prerelease = 'alpha.0'
      }
      break
    default:
      throw new Error(`未知的版本类型: ${type}`)
  }
  
  return formatVersion(version)
}

/**
 * 更新package.json版本
 */
function updatePackageVersion(pkg, newVersion) {
  pkg.packageJson.version = newVersion
  
  // 更新package间依赖的版本
  const deps = ['dependencies', 'devDependencies', 'peerDependencies']
  for (const depType of deps) {
    if (pkg.packageJson[depType]) {
      for (const depName in pkg.packageJson[depType]) {
        if (depName.startsWith('@smartabp/lowcode-')) {
          // 更新为新版本（使用^范围）
          pkg.packageJson[depType][depName] = `^${newVersion}`
        }
      }
    }
  }
  
  writeFileSync(
    pkg.packageJsonPath,
    JSON.stringify(pkg.packageJson, null, 2) + '\n',
    'utf-8'
  )
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'list'
  const versionType = args[1] || 'patch'
  const specificVersion = args[2]
  
  log.section('🔢 packages版本管理系统')
  
  const packages = getAllPackages()
  log.info(`发现 ${colors.bright}${packages.length}${colors.reset} 个packages\n`)
  
  switch (command) {
    case 'list':
      // 列出所有版本
      packages.forEach(pkg => {
        console.log(`  ${colors.bright}${pkg.name}${colors.reset}: ${colors.green}${pkg.currentVersion}${colors.reset}`)
      })
      break
      
    case 'bump':
      // 升级版本
      log.section(`📈 升级版本 (类型: ${versionType})`)
      
      for (const pkg of packages) {
        const oldVersion = pkg.currentVersion
        const newVersion = specificVersion || bumpVersion(oldVersion, versionType)
        
        updatePackageVersion(pkg, newVersion)
        log.success(`${pkg.name}: ${oldVersion} → ${colors.green}${newVersion}${colors.reset}`)
      }
      
      log.section('✨ 版本升级完成')
      break
      
    case 'set':
      // 设置特定版本
      if (!specificVersion) {
        log.error('请指定版本号: npm run packages:version set <type> <version>')
        process.exit(1)
      }
      
      log.section(`🎯 设置版本为 ${specificVersion}`)
      
      for (const pkg of packages) {
        const oldVersion = pkg.currentVersion
        updatePackageVersion(pkg, specificVersion)
        log.success(`${pkg.name}: ${oldVersion} → ${colors.green}${specificVersion}${colors.reset}`)
      }
      
      log.section('✨ 版本设置完成')
      break
      
    case 'sync':
      // 同步所有packages到同一版本
      const baseVersion = packages[0]?.currentVersion || '1.0.0'
      log.section(`🔄 同步所有packages到版本 ${baseVersion}`)
      
      for (const pkg of packages) {
        if (pkg.currentVersion !== baseVersion) {
          const oldVersion = pkg.currentVersion
          updatePackageVersion(pkg, baseVersion)
          log.success(`${pkg.name}: ${oldVersion} → ${colors.green}${baseVersion}${colors.reset}`)
        }
      }
      
      log.section('✨ 版本同步完成')
      break
      
    default:
      log.error(`未知命令: ${command}`)
      console.log('\n使用方法:')
      console.log('  npm run packages:version list                    # 列出所有版本')
      console.log('  npm run packages:version bump [type]             # 升级版本 (major|minor|patch|prerelease)')
      console.log('  npm run packages:version set <type> <version>    # 设置特定版本')
      console.log('  npm run packages:version sync                    # 同步所有packages到同一版本')
      process.exit(1)
  }
}

main().catch(error => {
  log.error(`版本管理系统错误: ${error.message}`)
  console.error(error)
  process.exit(1)
})
