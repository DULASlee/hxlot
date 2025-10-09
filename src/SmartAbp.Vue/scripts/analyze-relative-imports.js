#!/usr/bin/env node

/**
 * 架构违规检测脚本 - 相对路径引用分析
 * 
 * 功能：
 * 1. 扫描packages中的所有相对路径引用
 * 2. 按package分类统计
 * 3. 生成详细的修复报告
 * 4. 提供自动修复建议
 * 
 * 执行：node scripts/analyze-relative-imports.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// ANSI颜色码
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('\n' + '━'.repeat(80))
  log(title, 'cyan')
  console.log('━'.repeat(80))
}

// 扫描相对路径引用
function scanRelativeImports() {
  logSection('📊 扫描packages中的相对路径引用')
  
  const packagesDir = path.join(__dirname, '../packages')
  const packages = ['lowcode-shared', 'lowcode-core', 'lowcode-api', 'lowcode-tools', 'lowcode-designer', 'metadata-core']
  
  const results = {
    total: 0,
    byPackage: {},
    violations: []
  }
  
  packages.forEach(pkg => {
    const pkgPath = path.join(packagesDir, pkg, 'src')
    if (!fs.existsSync(pkgPath)) {
      log(`⚠️  ${pkg} 的src目录不存在`, 'yellow')
      return
    }
    
    // 使用grep查找相对路径引用
    try {
      const grepCmd = process.platform === 'win32'
        ? `cd "${pkgPath}" && findstr /s /r "from.*'\\.\\./.*'" *.ts *.vue 2>nul || echo.`
        : `grep -r "from.*'\\.\\./'" "${pkgPath}" --include="*.ts" --include="*.vue" || true`
      
      const output = execSync(grepCmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })
      
      if (output && output.trim()) {
        const lines = output.trim().split('\n').filter(line => line.trim() && !line.includes('node_modules'))
        
        if (lines.length > 0) {
          results.byPackage[pkg] = {
            count: lines.length,
            files: []
          }
          
          // 解析每一行
          lines.forEach(line => {
            // Windows格式：path:content 或 Unix格式：path:content
            const match = line.match(/^(.+?):(.*from.*['"]\.\.\/.*['"])/)
            if (match) {
              const filePath = match[1].trim()
              const importLine = match[2].trim()
              
              results.violations.push({
                package: pkg,
                file: filePath,
                line: importLine
              })
              
              if (!results.byPackage[pkg].files.includes(filePath)) {
                results.byPackage[pkg].files.push(filePath)
              }
            }
          })
          
          results.total += lines.length
        }
      }
    } catch (error) {
      // grep没找到结果时会返回非零退出码，这是正常的
      if (!error.message.includes('Command failed')) {
        log(`❌ 扫描 ${pkg} 时出错: ${error.message}`, 'red')
      }
    }
  })
  
  return results
}

// 生成修复报告
function generateReport(results) {
  logSection('📋 架构违规详细报告')
  
  log(`\n总计发现 ${results.total} 处相对路径引用违规`, 'red')
  log(`涉及 ${Object.keys(results.byPackage).length} 个packages\n`, 'red')
  
  // 按package统计
  Object.entries(results.byPackage)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([pkg, data]) => {
      log(`\n📦 ${pkg}:`, 'yellow')
      log(`   违规数量: ${data.count}`, 'yellow')
      log(`   违规文件: ${data.files.length} 个\n`, 'yellow')
      
      // 显示前5个文件
      data.files.slice(0, 5).forEach(file => {
        const relativePath = file.replace(/.*packages[\\\/]/, 'packages/')
        log(`   - ${relativePath}`, 'reset')
      })
      
      if (data.files.length > 5) {
        log(`   ... 还有 ${data.files.length - 5} 个文件`, 'reset')
      }
    })
  
  // 修复优先级建议
  logSection('🎯 修复优先级建议')
  
  const priority = [
    { name: 'lowcode-shared', reason: '被其他包依赖，最底层' },
    { name: 'metadata-core', reason: '独立元数据核心，零依赖' },
    { name: 'lowcode-core', reason: '核心引擎，依赖shared' },
    { name: 'lowcode-api', reason: '业务API层' },
    { name: 'lowcode-tools', reason: '工具包' },
    { name: 'lowcode-designer', reason: '设计器UI，最上层' },
  ]
  
  priority.forEach((item, index) => {
    const data = results.byPackage[item.name]
    if (data) {
      log(`${index + 1}. ${item.name} (${data.count}处违规)`, 'cyan')
      log(`   原因: ${item.reason}`, 'reset')
    }
  })
  
  // 生成JSON报告
  const reportPath = path.join(__dirname, '../reports/relative-imports-violations.json')
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf-8')
  
  log(`\n✅ 详细报告已保存到: ${reportPath}`, 'green')
}

// 提供修复指导
function provideFixGuidance() {
  logSection('🔧 修复指导')
  
  log('\n正确的导入方式示例：\n', 'green')
  
  const examples = [
    {
      wrong: "import { ComponentRegistry } from '../../../lowcode-shared/components'",
      right: "import { ComponentRegistry } from '@smartabp/lowcode-shared'",
      note: '✅ 使用@smartabp别名'
    },
    {
      wrong: "import type { EntityMetadata } from '../metadata-core/types'",
      right: "import type { EntityMetadata } from '@smartabp/metadata-core'",
      note: '✅ 跨package使用别名'
    },
    {
      wrong: "import { validator } from '../../utils/validator'",
      right: "import { validator } from './utils/validator'",
      note: '✅ package内部可用相对路径（同级或子级）'
    }
  ]
  
  examples.forEach(ex => {
    log('❌ 错误:', 'red')
    log(`   ${ex.wrong}\n`, 'reset')
    log('✅ 正确:', 'green')
    log(`   ${ex.right}`, 'reset')
    log(`   ${ex.note}\n`, 'cyan')
  })
  
  log('修复步骤：', 'yellow')
  log('1. 识别被引用的模块属于哪个package', 'reset')
  log('2. 将相对路径改为 @smartabp/{package} 别名', 'reset')
  log('3. 确保被引用的内容已在目标package的index.ts中导出', 'reset')
  log('4. 运行 npm run type-check 验证修复', 'reset')
  log('5. 运行架构合规检查确认', 'reset')
}

// 主函数
function main() {
  console.clear()
  log('🔥 SmartAbp前端架构违规检测工具 v1.0', 'cyan')
  log('━'.repeat(80), 'cyan')
  
  const results = scanRelativeImports()
  
  if (results.total === 0) {
    logSection('✅ 检测结果')
    log('\n🎉 恭喜！未发现相对路径引用违规！', 'green')
    log('架构完全合规，符合三大铁律要求。\n', 'green')
    return
  }
  
  generateReport(results)
  provideFixGuidance()
  
  logSection('📊 总结')
  log(`\n需要修复的文件总数: ${results.violations.length}`, 'yellow')
  log('预计修复时间: 3-5天（Week 1任务）\n', 'yellow')
  log('💡 提示：可以使用批量替换工具加速修复过程', 'cyan')
}

main()

