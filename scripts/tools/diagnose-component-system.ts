#!/usr/bin/env tsx
/**
 * SmartAbp 组件注册系统诊断工具
 * 
 * 功能：
 * 1. 检测组件注册系统的健康状况
 * 2. 识别潜在的性能问题
 * 3. 提供优化建议
 * 
 * 使用方式：
 * ```bash
 * npm run diagnose:components
 * ```
 */

import { existsSync, readFileSync, statSync } from 'fs'
import { glob } from 'glob'
import { resolve } from 'path'

interface DiagnosticResult {
    category: string
    level: 'info' | 'warning' | 'error' | 'success'
    message: string
    details?: any
}

const results: DiagnosticResult[] = []

function addResult(category: string, level: DiagnosticResult['level'], message: string, details?: any) {
    results.push({ category, level, message, details })
}

// ============ 诊断1：检测重复组件名 ============
function detectDuplicateComponents() {
    console.log('\n🔍 正在检测重复组件名...')

    const componentFiles = glob.sync('packages/*/src/components/**/*.vue', { cwd: process.cwd() })
    const componentNames = new Map<string, string[]>()

    for (const file of componentFiles) {
        const name = file.split('/').pop()?.replace('.vue', '') || ''
        if (!componentNames.has(name)) {
            componentNames.set(name, [])
        }
        componentNames.get(name)!.push(file)
    }

    const duplicates = Array.from(componentNames.entries())
        .filter(([_, files]) => files.length > 1)

    if (duplicates.length === 0) {
        addResult('重复检测', 'success', '未发现重复组件名')
    } else {
        for (const [name, files] of duplicates) {
            addResult('重复检测', 'warning', `组件名重复: ${name}`, { files })
        }
    }
}

// ============ 诊断2：检测大文件组件 ============
function detectLargeComponents() {
    console.log('\n🔍 正在检测大文件组件...')

    const componentFiles = glob.sync('packages/*/src/components/**/*.vue', { cwd: process.cwd() })
    const largeComponents: Array<{ file: string; size: number; lines: number }> = []

    const LARGE_FILE_THRESHOLD = 500 // 500行

    for (const file of componentFiles) {
        const fullPath = resolve(process.cwd(), file)
        if (!existsSync(fullPath)) continue

        const content = readFileSync(fullPath, 'utf-8')
        const lines = content.split('\n').length
        const size = statSync(fullPath).size

        if (lines > LARGE_FILE_THRESHOLD) {
            largeComponents.push({ file, size, lines })
        }
    }

    if (largeComponents.length === 0) {
        addResult('大文件检测', 'success', '未发现过大的组件文件')
    } else {
        largeComponents.sort((a, b) => b.lines - a.lines)
        addResult('大文件检测', 'warning', `发现 ${largeComponents.length} 个大文件组件`, {
            top5: largeComponents.slice(0, 5),
            suggestion: '建议拆分成多个小组件，提升维护性'
        })
    }
}

// ============ 诊断3：检测注册系统配置 ============
function detectRegistrationConfig() {
    console.log('\n🔍 正在检测注册系统配置...')

    // 检查 vite.config.ts
    const viteConfigPath = 'src/SmartAbp.Vue/vite.config.ts'
    if (existsSync(viteConfigPath)) {
        const content = readFileSync(viteConfigPath, 'utf-8')

        // 检查 packagesResolver
        if (content.includes('createPackagesResolver')) {
            addResult('配置检测', 'success', 'packagesResolver 已启用')
        } else {
            addResult('配置检测', 'error', 'packagesResolver 未启用', {
                fix: '在 vite.config.ts 中添加 createPackagesResolver()'
            })
        }

        // 检查 vitePluginLowCode
        if (content.includes('vitePluginLowCode')) {
            addResult('配置检测', 'success', 'vitePluginLowCode 已启用')
        } else {
            addResult('配置检测', 'warning', 'vitePluginLowCode 未启用', {
                impact: '开发期缓存清理功能不可用'
            })
        }

        // 检查冲突检测器
        if (content.includes('createComponentConflictDetector')) {
            addResult('配置检测', 'success', '组件冲突检测器已启用')
        } else {
            addResult('配置检测', 'warning', '组件冲突检测器未启用')
        }
    }

    // 检查 main.ts
    const mainPath = 'src/SmartAbp.Vue/src/main.ts'
    if (existsSync(mainPath)) {
        const content = readFileSync(mainPath, 'utf-8')

        if (content.includes('LowCodeComponentsPlugin')) {
            addResult('配置检测', 'info', 'LowCodeComponentsPlugin 已注册', {
                note: '建议评估是否需要移除，改用编译时自动导入'
            })
        }
    }
}

// ============ 诊断4：检测组件元数据 ============
function detectComponentMetadata() {
    console.log('\n🔍 正在检测组件元数据...')

    const componentFiles = glob.sync('packages/*/src/components/**/*.vue', { cwd: process.cwd() })
    const withMetadata: string[] = []
    const withoutMetadata: string[] = []

    for (const file of componentFiles) {
        const fullPath = resolve(process.cwd(), file)
        if (!existsSync(fullPath)) continue

        const source = readFileSync(fullPath, 'utf-8')

        if (source.includes('@smartabp-component')) {
            withMetadata.push(file)
        } else {
            withoutMetadata.push(file)
        }
    }

    const coverage = (withMetadata.length / (withMetadata.length + withoutMetadata.length) * 100).toFixed(1)

    if (withMetadata.length === 0) {
        addResult('元数据检测', 'error', '所有组件都缺少元数据注释', {
            fix: '为组件添加 @smartabp-component 元数据注释'
        })
    } else if (withoutMetadata.length > 0) {
        addResult('元数据检测', 'warning', `元数据覆盖率: ${coverage}%`, {
            withMetadata: withMetadata.length,
            withoutMetadata: withoutMetadata.length,
            samples: withoutMetadata.slice(0, 5)
        })
    } else {
        addResult('元数据检测', 'success', '所有组件都包含元数据注释')
    }
}

// ============ 诊断5：检测路径解析问题 ============
function detectPathResolutionIssues() {
    console.log('\n🔍 正在检测路径解析问题...')

    const packagesResolverPath = 'src/SmartAbp.Vue/src/utils/vite/packagesResolver.ts'
    if (!existsSync(packagesResolverPath)) {
        addResult('路径解析', 'error', 'packagesResolver.ts 文件不存在')
        return
    }

    const content = readFileSync(packagesResolverPath, 'utf-8')

    // 检查是否返回别名路径（可能导致解析失败）
    if (content.includes('return `@smartabp/')) {
        addResult('路径解析', 'error', '检测到返回别名路径，可能导致解析失败', {
            issue: 'packagesResolver 返回 @smartabp/xxx 别名路径',
            fix: '修改为返回绝对文件系统路径',
            example: 'return path // 绝对路径，而非别名'
        })
    } else {
        addResult('路径解析', 'success', '路径解析配置正确')
    }
}

// ============ 诊断6：检测性能问题 ============
function detectPerformanceIssues() {
    console.log('\n🔍 正在检测性能问题...')

    const lowcodePluginPath = 'src/SmartAbp.Vue/src/plugins/lowcode-components.ts'
    if (existsSync(lowcodePluginPath)) {
        const content = readFileSync(lowcodePluginPath, 'utf-8')

        // 检查是否使用 eager: true（会破坏Tree-shaking）
        if (content.includes('eager: true')) {
            addResult('性能检测', 'error', '检测到 eager: true，破坏Tree-shaking', {
                impact: '所有组件都会被打包，增加首屏加载时间',
                fix: '移除 eager: true，改用编译时自动导入'
            })
        }

        // 检查是否全局注册组件（影响性能）
        if (content.includes('app.component(')) {
            const matches = content.match(/app\.component\(/g)
            const count = matches?.length || 0

            if (count > 10) {
                addResult('性能检测', 'warning', `检测到 ${count} 个全局注册组件`, {
                    impact: '增加应用启动时间',
                    suggestion: '考虑使用按需导入'
                })
            }
        }
    }

    addResult('性能检测', 'info', '建议使用编译时自动导入替代运行时全量注册')
}

// ============ 诊断7：统计组件分布 ============
function analyzeComponentDistribution() {
    console.log('\n🔍 正在分析组件分布...')

    const packages = [
        'lowcode-core',
        'lowcode-designer',
        'lowcode-shared',
        'lowcode-api',
        'lowcode-tools',
        'metadata-core'
    ]

    const distribution: Record<string, number> = {}
    let totalComponents = 0

    for (const pkg of packages) {
        const files = glob.sync(`packages/${pkg}/src/components/**/*.vue`, { cwd: process.cwd() })
        distribution[pkg] = files.length
        totalComponents += files.length
    }

    addResult('组件统计', 'info', `总计 ${totalComponents} 个组件`, { distribution })

    // 检测是否有空的组件目录
    const emptyPackages = packages.filter(pkg => distribution[pkg] === 0)
    if (emptyPackages.length > 0) {
        addResult('组件统计', 'warning', '以下package无组件', { packages: emptyPackages })
    }
}

// ============ 主函数 ============
async function main() {
    console.log('╔═══════════════════════════════════════════════════════════╗')
    console.log('║   SmartAbp 组件注册系统诊断工具 v1.0                     ║')
    console.log('╚═══════════════════════════════════════════════════════════╝')

    detectDuplicateComponents()
    detectLargeComponents()
    detectRegistrationConfig()
    detectComponentMetadata()
    detectPathResolutionIssues()
    detectPerformanceIssues()
    analyzeComponentDistribution()

    console.log('\n\n╔═══════════════════════════════════════════════════════════╗')
    console.log('║   诊断报告                                                ║')
    console.log('╚═══════════════════════════════════════════════════════════╝\n')

    const errorCount = results.filter(r => r.level === 'error').length
    const warningCount = results.filter(r => r.level === 'warning').length
    const infoCount = results.filter(r => r.level === 'info').length
    const successCount = results.filter(r => r.level === 'success').length

    console.log(`📊 统计: ${errorCount} 错误, ${warningCount} 警告, ${infoCount} 信息, ${successCount} 正常\n`)

    // 按级别分组输出
    const levels: Array<DiagnosticResult['level']> = ['error', 'warning', 'info', 'success']
    const icons = {
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        success: '✅'
    }

    for (const level of levels) {
        const items = results.filter(r => r.level === level)
        if (items.length === 0) continue

        console.log(`\n${icons[level]} ${level.toUpperCase()}:\n`)

        for (const item of items) {
            console.log(`  [${item.category}] ${item.message}`)

            if (item.details) {
                console.log(`    详情: ${JSON.stringify(item.details, null, 2)}`)
            }
        }
    }

    // 输出优化建议
    console.log('\n\n╔═══════════════════════════════════════════════════════════╗')
    console.log('║   优化建议                                                ║')
    console.log('╚═══════════════════════════════════════════════════════════╝\n')

    if (errorCount > 0) {
        console.log('🚨 发现严重问题，建议立即修复：\n')
        console.log('1. 查看上方 ❌ ERROR 部分的详细信息')
        console.log('2. 参考 docs/工具指南/组件注册系统架构重构方案v2.0.md')
        console.log('3. 执行修复后重新运行诊断\n')
    }

    if (warningCount > 0) {
        console.log('⚠️  发现潜在问题，建议优化：\n')
        console.log('1. 查看上方 ⚠️ WARNING 部分的详细信息')
        console.log('2. 评估影响范围和优化优先级')
        console.log('3. 逐步实施优化方案\n')
    }

    if (errorCount === 0 && warningCount === 0) {
        console.log('🎉 恭喜！组件注册系统运行良好！\n')
        console.log('建议：')
        console.log('1. 定期运行此诊断工具（每周一次）')
        console.log('2. 在添加新组件后运行诊断')
        console.log('3. 在性能测试前运行诊断\n')
    }

    console.log('╔═══════════════════════════════════════════════════════════╗')
    console.log('║   诊断完成                                                ║')
    console.log('╚═══════════════════════════════════════════════════════════╝\n')

    // 返回退出码
    process.exit(errorCount > 0 ? 1 : 0)
}

main().catch(err => {
    console.error('诊断过程中发生错误:', err)
    process.exit(1)
})

