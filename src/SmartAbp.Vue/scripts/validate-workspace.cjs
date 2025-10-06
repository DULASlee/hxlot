#!/usr/bin/env node
/**
 * @smartabp/workspace-validator
 * 🛡️ 第4层保护：工作区完整性验证
 * 
 * 功能:
 * 1. 验证@smartabp包仅使用workspace:*引用
 * 2. 检测意外的外部npm依赖
 * 3. 验证private包标记
 * 4. 检查循环依赖
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 配置
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WORKSPACE_ROOT = path.resolve(__dirname, '..')
const PACKAGES_DIR = path.join(WORKSPACE_ROOT, 'packages')

const PROTECTED_PACKAGES = [
  '@smartabp/metadata-core',
  '@smartabp/lowcode-shared',
  '@smartabp/lowcode-core',
  '@smartabp/lowcode-designer'
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 验证函数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 验证1: workspace:* 引用检查
 */
function validateWorkspaceReferences() {
  console.log('\n🔍 验证1: workspace:* 引用检查...')
  
  const errors = []
  const packageJsonFiles = glob.sync('**/package.json', {
    cwd: PACKAGES_DIR,
    ignore: ['**/node_modules/**']
  })

  packageJsonFiles.forEach(file => {
    const fullPath = path.join(PACKAGES_DIR, file)
    const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
    
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    }

    Object.entries(allDeps).forEach(([name, version]) => {
      if (PROTECTED_PACKAGES.includes(name)) {
        if (version !== 'workspace:*') {
          errors.push({
            package: pkg.name,
            issue: `依赖 ${name} 应使用 "workspace:*"，当前: "${version}"`,
            file: file
          })
        }
      }
    })
  })

  if (errors.length > 0) {
    console.error('❌ 发现 workspace 引用错误:')
    errors.forEach(err => {
      console.error(`   - ${err.package}: ${err.issue}`)
      console.error(`     文件: ${err.file}`)
    })
    return false
  }

  console.log('✅ 所有 @smartabp 包均使用 workspace:* 引用')
  return true
}

/**
 * 验证2: private 包标记检查
 */
function validatePrivatePackages() {
  console.log('\n🔍 验证2: private 包标记检查...')
  
  const errors = []
  const corePackages = [
    'metadata-core',
    'lowcode-shared',
    'lowcode-core'
  ]

  corePackages.forEach(pkgName => {
    const pkgPath = path.join(PACKAGES_DIR, pkgName, 'package.json')
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      
      if (pkg.name === '@smartabp/metadata-core' && pkg.private !== true) {
        errors.push({
          package: pkg.name,
          issue: '核心包应标记为 private: true',
          file: `packages/${pkgName}/package.json`
        })
      }
    }
  })

  if (errors.length > 0) {
    console.error('❌ 发现 private 标记错误:')
    errors.forEach(err => {
      console.error(`   - ${err.package}: ${err.issue}`)
      console.error(`     文件: ${err.file}`)
    })
    return false
  }

  console.log('✅ 所有核心包已正确标记为 private')
  return true
}

/**
 * 验证3: 外部依赖安全检查
 */
function validateExternalDependencies() {
  console.log('\n🔍 验证3: 外部依赖安全检查...')
  
  const warnings = []
  const metadataCorePath = path.join(PACKAGES_DIR, 'metadata-core/package.json')
  
  if (fs.existsSync(metadataCorePath)) {
    const pkg = JSON.parse(fs.readFileSync(metadataCorePath, 'utf-8'))
    
    const externalDeps = Object.keys(pkg.dependencies || {})
    const expectedDeps = ['zod', 'semver']
    
    const unexpectedDeps = externalDeps.filter(dep => !expectedDeps.includes(dep))
    
    if (unexpectedDeps.length > 0) {
      warnings.push({
        package: pkg.name,
        issue: `发现意外的外部依赖: ${unexpectedDeps.join(', ')}`,
        suggestion: '请确认这些依赖是必需的'
      })
    }
  }

  if (warnings.length > 0) {
    console.warn('⚠️  外部依赖警告:')
    warnings.forEach(warn => {
      console.warn(`   - ${warn.package}: ${warn.issue}`)
      console.warn(`     建议: ${warn.suggestion}`)
    })
  } else {
    console.log('✅ 外部依赖符合安全策略')
  }

  return true
}

/**
 * 验证4: 循环依赖检查
 */
function validateCircularDependencies() {
  console.log('\n🔍 验证4: 循环依赖检查...')
  
  const dependencyGraph = {}
  const packageJsonFiles = glob.sync('**/package.json', {
    cwd: PACKAGES_DIR,
    ignore: ['**/node_modules/**']
  })

  // 构建依赖图
  packageJsonFiles.forEach(file => {
    const fullPath = path.join(PACKAGES_DIR, file)
    const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
    
    if (pkg.name && pkg.name.startsWith('@smartabp/')) {
      const deps = Object.keys({
        ...pkg.dependencies,
        ...pkg.devDependencies
      }).filter(dep => dep.startsWith('@smartabp/'))
      
      dependencyGraph[pkg.name] = deps
    }
  })

  // 检测循环依赖
  const visited = new Set()
  const recursionStack = new Set()
  const cycles = []

  function detectCycle(node, path = []) {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node)
      cycles.push(path.slice(cycleStart).concat(node))
      return
    }

    if (visited.has(node)) return

    visited.add(node)
    recursionStack.add(node)

    const deps = dependencyGraph[node] || []
    deps.forEach(dep => {
      detectCycle(dep, [...path, node])
    })

    recursionStack.delete(node)
  }

  Object.keys(dependencyGraph).forEach(pkg => {
    detectCycle(pkg)
  })

  if (cycles.length > 0) {
    console.error('❌ 发现循环依赖:')
    cycles.forEach(cycle => {
      console.error(`   - ${cycle.join(' -> ')}`)
    })
    return false
  }

  console.log('✅ 无循环依赖')
  return true
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 主函数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🛡️  SmartAbp Workspace 完整性验证')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const results = [
    validateWorkspaceReferences(),
    validatePrivatePackages(),
    validateExternalDependencies(),
    validateCircularDependencies()
  ]

  const allPassed = results.every(r => r === true)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (allPassed) {
    console.log('✅ 工作区完整性验证通过！')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    process.exit(0)
  } else {
    console.error('❌ 工作区完整性验证失败！')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    process.exit(1)
  }
}

// 执行
main()

