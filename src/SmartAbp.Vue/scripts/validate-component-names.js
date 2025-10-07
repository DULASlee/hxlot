#!/usr/bin/env node
/**
 * SmartAbp 组件命名冲突检测脚本
 * 
 * @description
 * 自动检测组件命名冲突，确保：
 * 1. packages组件使用正确的前缀
 * 2. 主应用组件不使用前缀
 * 3. 没有重复的组件名
 * 4. 符合PascalCase命名规范
 * 
 * @usage
 * npm run validate:components
 * node scripts/validate-component-names.js
 * 
 * @author SmartAbp Team
 * @version 1.0.0
 */

const fs = require('node:fs')
const path = require('node:path')
const { glob } = require('glob')

// 组件前缀规则（与packagesResolver.ts保持一致）
const PACKAGES_NAMING_RULES = {
    'lowcode-shared': 'Ls',
    'lowcode-core': 'Lc',
    'lowcode-designer': 'Ld',
    'lowcode-api': 'La',
    'lowcode-tools': 'Lt',
    'metadata-core': 'Mc',
}

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
}

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    title: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}\n`),
}

/**
 * 检测结果统计
 */
const stats = {
    totalComponents: 0,
    packagesComponents: 0,
    mainAppComponents: 0,
    errors: [],
    warnings: [],
    info: [],
}

/**
 * 扫描目录下的所有Vue组件
 */
async function scanComponents(dir, isPackage = false, packageName = '') {
    const pattern = path.join(dir, '**/*.vue').replace(/\\/g, '/')
    const files = await glob(pattern, {
        ignore: [
            '**/node_modules/**',
            '**/__tests__/**',
            '**/examples/**',
            '**/dist/**',
        ],
    })

    const components = []

    for (const file of files) {
        const relativePath = path.relative(process.cwd(), file)
        const fileName = path.basename(file, '.vue')

        // 检查文件名是否符合PascalCase
        if (!isPascalCase(fileName)) {
            stats.errors.push({
                type: 'NAMING_CONVENTION',
                file: relativePath,
                message: `组件文件名必须使用PascalCase: ${fileName}`,
            })
        }

        components.push({
            name: fileName,
            path: relativePath,
            isPackage,
            packageName,
        })
    }

    return components
}

/**
 * 检查是否符合PascalCase
 */
function isPascalCase(str) {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str)
}

/**
 * 检查packages组件前缀
 */
function validatePackagePrefix(component) {
    const { name, packageName, path: filePath } = component
    const expectedPrefix = PACKAGES_NAMING_RULES[packageName]

    if (!expectedPrefix) {
        stats.warnings.push({
            type: 'UNKNOWN_PACKAGE',
            file: filePath,
            message: `未知的package: ${packageName}`,
        })
        return
    }

    if (!name.startsWith(expectedPrefix)) {
        stats.errors.push({
            type: 'PREFIX_MISSING',
            file: filePath,
            message: `组件应使用前缀 "${expectedPrefix}": ${name} → ${expectedPrefix}${name}`,
            suggestion: `重命名为: ${expectedPrefix}${name}.vue`,
        })
    }
}

/**
 * 检查主应用组件是否错误使用了前缀
 */
function validateMainAppNoPrefix(component) {
    const { name, path: filePath } = component
    const allPrefixes = Object.values(PACKAGES_NAMING_RULES)

    for (const prefix of allPrefixes) {
        if (name.startsWith(prefix)) {
            stats.errors.push({
                type: 'UNWANTED_PREFIX',
                file: filePath,
                message: `主应用组件不应使用前缀 "${prefix}": ${name}`,
                suggestion: `重命名为: ${name.slice(prefix.length)}.vue`,
            })
            break
        }
    }
}

/**
 * 检查组件名重复
 */
function checkDuplicateNames(components) {
    const nameMap = new Map()

    for (const component of components) {
        const { name, path: filePath } = component

        if (nameMap.has(name)) {
            nameMap.get(name).push(filePath)
        } else {
            nameMap.set(name, [filePath])
        }
    }

    // 找出重复的组件名
    for (const [name, paths] of nameMap.entries()) {
        if (paths.length > 1) {
            stats.errors.push({
                type: 'DUPLICATE_NAME',
                message: `组件名重复: ${name}`,
                files: paths,
                suggestion: `请为packages组件添加前缀，或重命名其中一个组件`,
            })
        }
    }
}

/**
 * 打印检测报告
 */
function printReport() {
    log.title('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    log.title('📊 组件命名规范检测报告')
    log.title('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    console.log(`\n📈 统计信息:`)
    console.log(`  总组件数: ${stats.totalComponents}`)
    console.log(`  packages组件: ${stats.packagesComponents}`)
    console.log(`  主应用组件: ${stats.mainAppComponents}`)

    // 打印错误
    if (stats.errors.length > 0) {
        console.log(`\n${colors.red}❌ 发现 ${stats.errors.length} 个错误:${colors.reset}\n`)

        for (const error of stats.errors) {
            console.log(`${colors.red}✗${colors.reset} ${error.type}: ${error.message}`)

            if (error.file) {
                console.log(`  文件: ${error.file}`)
            }

            if (error.files) {
                console.log(`  涉及文件:`)
                error.files.forEach(f => console.log(`    - ${f}`))
            }

            if (error.suggestion) {
                console.log(`  ${colors.cyan}建议: ${error.suggestion}${colors.reset}`)
            }

            console.log()
        }
    }

    // 打印警告
    if (stats.warnings.length > 0) {
        console.log(`\n${colors.yellow}⚠ 发现 ${stats.warnings.length} 个警告:${colors.reset}\n`)

        for (const warning of stats.warnings) {
            console.log(`${colors.yellow}⚠${colors.reset} ${warning.type}: ${warning.message}`)
            if (warning.file) {
                console.log(`  文件: ${warning.file}`)
            }
            console.log()
        }
    }

    // 打印总结
    log.title('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (stats.errors.length === 0 && stats.warnings.length === 0) {
        log.success('✨ 所有组件命名规范检查通过！')
        log.title('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        return 0
    } else {
        if (stats.errors.length > 0) {
            log.error(`❌ 检测失败：${stats.errors.length} 个错误需要修复`)
        }
        if (stats.warnings.length > 0) {
            log.warning(`⚠️  ${stats.warnings.length} 个警告建议处理`)
        }
        log.title('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        return 1
    }
}

/**
 * 主函数
 */
async function main() {
    log.title('🔍 开始检测组件命名规范...')

    const allComponents = []

    // 1. 扫描packages组件
    log.info('扫描packages组件...')
    for (const [packageName, prefix] of Object.entries(PACKAGES_NAMING_RULES)) {
        const dir = path.join('packages', packageName, 'src', 'components')

        if (fs.existsSync(dir)) {
            const components = await scanComponents(dir, true, packageName)
            allComponents.push(...components)
            stats.packagesComponents += components.length

            log.info(`  ${packageName}: ${components.length} 个组件`)
        }
    }

    // 2. 扫描主应用组件
    log.info('扫描主应用组件...')
    const mainAppDir = path.join('src', 'components')

    if (fs.existsSync(mainAppDir)) {
        const components = await scanComponents(mainAppDir, false)
        allComponents.push(...components)
        stats.mainAppComponents += components.length

        log.info(`  src/components: ${components.length} 个组件`)
    }

    stats.totalComponents = allComponents.length

    // 3. 验证packages组件前缀
    log.info('\n验证packages组件前缀...')
    for (const component of allComponents) {
        if (component.isPackage) {
            validatePackagePrefix(component)
        }
    }

    // 4. 验证主应用组件无前缀
    log.info('验证主应用组件命名...')
    for (const component of allComponents) {
        if (!component.isPackage) {
            validateMainAppNoPrefix(component)
        }
    }

    // 5. 检查组件名重复
    log.info('检查组件名重复...')
    checkDuplicateNames(allComponents)

    // 6. 打印报告
    const exitCode = printReport()

    process.exit(exitCode)
}

// 执行
main().catch((error) => {
    log.error(`执行失败: ${error.message}`)
    console.error(error)
    process.exit(1)
})

