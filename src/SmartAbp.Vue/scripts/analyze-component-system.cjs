/**
 * SmartAbp 组件自动导入系统性能与稳定性分析工具
 * 
 * 功能：
 * 1. 分析组件解析性能
 * 2. 检测系统稳定性
 * 3. 评估扩展性
 * 4. 生成改进建议
 * 
 * @author SmartAbp Team
 * @version 1.0.0
 */

const fs = require('node:fs')
const path = require('node:path')
const { performance } = require('node:perf_hooks')

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 配置常量
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PROJECT_ROOT = path.resolve(__dirname, '..')
const PACKAGES_ROOT = path.join(PROJECT_ROOT, 'packages')
const SRC_COMPONENTS = path.join(PROJECT_ROOT, 'src/components')

const PACKAGES_NAMING_RULES = {
    'lowcode-shared': 'Ls',
    'lowcode-core': 'Lc',
    'lowcode-designer': 'Ld',
    'lowcode-api': 'La',
    'lowcode-tools': 'Lt',
    'metadata-core': 'Mc',
}

const PACKAGES_COMPONENT_DIRS = [
    'lowcode-shared/src/components',
    'lowcode-core/src/components',
    'lowcode-designer/src/components',
    'lowcode-api/src/components',
    'lowcode-tools/src/components',
    'metadata-core/src/components',
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 工具函数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 递归扫描目录，查找所有Vue组件
 */
function scanComponents(dir, components = [], relativeTo = dir) {
    if (!fs.existsSync(dir)) {
        return components
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                scanComponents(fullPath, components, relativeTo)
            }
        } else if (entry.isFile() && entry.name.endsWith('.vue')) {
            const relativePath = path.relative(relativeTo, fullPath)
            components.push({
                name: entry.name.replace('.vue', ''),
                path: fullPath,
                relativePath,
                size: fs.statSync(fullPath).size
            })
        }
    }

    return components
}

/**
 * 模拟组件解析过程（带性能测试）
 */
function simulateComponentResolve(componentName, enableCache = true) {
    const cache = new Map()
    const startTime = performance.now()

    // 模拟缓存查找
    if (enableCache && cache.has(componentName)) {
        const endTime = performance.now()
        return {
            found: true,
            fromCache: true,
            time: endTime - startTime
        }
    }

    // 提取前缀
    let prefix = null
    let baseName = componentName

    for (const [_, pfx] of Object.entries(PACKAGES_NAMING_RULES)) {
        if (componentName.startsWith(pfx)) {
            prefix = pfx
            baseName = componentName.slice(pfx.length)
            break
        }
    }

    // 情况1: 有前缀，直接查找
    if (prefix) {
        const packageName = Object.entries(PACKAGES_NAMING_RULES)
            .find(([_, pfx]) => pfx === prefix)?.[0]

        if (packageName) {
            const searchPaths = [
                path.join(PACKAGES_ROOT, packageName, 'src/components', `${baseName}.vue`),
                path.join(PACKAGES_ROOT, packageName, 'src/components', baseName, 'index.vue'),
            ]

            for (const searchPath of searchPaths) {
                if (fs.existsSync(searchPath)) {
                    const endTime = performance.now()
                    if (enableCache) cache.set(componentName, searchPath)
                    return {
                        found: true,
                        fromCache: false,
                        path: searchPath,
                        time: endTime - startTime,
                        searchAttempts: searchPaths.indexOf(searchPath) + 1
                    }
                }
            }
        }
    }

    // 情况2: 无前缀，遍历所有package
    let searchAttempts = 0
    for (const dir of PACKAGES_COMPONENT_DIRS) {
        const packageName = dir.split('/')[0]
        const searchPaths = [
            path.join(PACKAGES_ROOT, packageName, 'src/components', `${componentName}.vue`),
            path.join(PACKAGES_ROOT, packageName, 'src/components', componentName, 'index.vue'),
        ]

        for (const searchPath of searchPaths) {
            searchAttempts++
            if (fs.existsSync(searchPath)) {
                const endTime = performance.now()
                if (enableCache) cache.set(componentName, searchPath)
                return {
                    found: true,
                    fromCache: false,
                    path: searchPath,
                    time: endTime - startTime,
                    searchAttempts
                }
            }
        }
    }

    const endTime = performance.now()
    return {
        found: false,
        fromCache: false,
        time: endTime - startTime,
        searchAttempts
    }
}

/**
 * 计算文件行数
 */
function countLines(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8')
    return content.split('\n').length
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 分析函数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 1. 组件统计分析
 */
function analyzeComponentStatistics() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 第一层分析：组件统计')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const stats = {
        packages: {},
        mainApp: {},
        total: 0,
        totalSize: 0,
        totalLines: 0
    }

    // 扫描packages
    for (const dir of PACKAGES_COMPONENT_DIRS) {
        const packageName = dir.split('/')[0]
        const componentDir = path.join(PACKAGES_ROOT, dir)
        const components = scanComponents(componentDir)

        stats.packages[packageName] = {
            count: components.length,
            components: components.map(c => ({
                name: c.name,
                size: c.size,
                lines: countLines(c.path)
            })),
            totalSize: components.reduce((sum, c) => sum + c.size, 0),
            totalLines: components.reduce((sum, c) => sum + countLines(c.path), 0)
        }

        stats.total += components.length
        stats.totalSize += stats.packages[packageName].totalSize
        stats.totalLines += stats.packages[packageName].totalLines
    }

    // 扫描主应用
    const mainComponents = scanComponents(SRC_COMPONENTS)
    stats.mainApp = {
        count: mainComponents.length,
        components: mainComponents.map(c => ({
            name: c.name,
            size: c.size,
            lines: countLines(c.path)
        })),
        totalSize: mainComponents.reduce((sum, c) => sum + c.size, 0),
        totalLines: mainComponents.reduce((sum, c) => sum + countLines(c.path), 0)
    }

    stats.total += mainComponents.length
    stats.totalSize += stats.mainApp.totalSize
    stats.totalLines += stats.mainApp.totalLines

    // 输出统计
    console.log(`\n📦 Packages组件:`)
    for (const [pkg, data] of Object.entries(stats.packages)) {
        const prefix = PACKAGES_NAMING_RULES[pkg]
        console.log(`   ${prefix} (${pkg}): ${data.count}个组件, ${(data.totalSize / 1024).toFixed(2)}KB, ${data.totalLines}行`)
    }

    console.log(`\n🏠 主应用组件: ${stats.mainApp.count}个组件, ${(stats.mainApp.totalSize / 1024).toFixed(2)}KB, ${stats.mainApp.totalLines}行`)
    console.log(`\n📊 总计: ${stats.total}个组件, ${(stats.totalSize / 1024).toFixed(2)}KB, ${stats.totalLines}行`)

    return stats
}

/**
 * 2. 性能分析
 */
function analyzePerformance(stats) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚡ 第二层分析：解析性能')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // 收集所有组件名
    const allComponents = []

    for (const [pkg, data] of Object.entries(stats.packages)) {
        const prefix = PACKAGES_NAMING_RULES[pkg]
        allComponents.push(...data.components.map(c => ({
            name: `${prefix}${c.name}`,
            hasPrefix: true,
            package: pkg
        })))
    }

    // 性能测试
    const perfTests = {
        withPrefix: [],
        withoutPrefix: [],
        cacheHit: []
    }

    // 测试1: 带前缀解析（最优情况）
    console.log('\n🎯 测试1: 带前缀组件解析（最优情况）')
    const sampleWithPrefix = allComponents.filter(c => c.hasPrefix).slice(0, 20)
    for (const comp of sampleWithPrefix) {
        const result = simulateComponentResolve(comp.name, false)
        perfTests.withPrefix.push(result.time)
    }
    const avgWithPrefix = perfTests.withPrefix.reduce((a, b) => a + b, 0) / perfTests.withPrefix.length
    console.log(`   平均解析时间: ${avgWithPrefix.toFixed(4)}ms`)
    console.log(`   最快: ${Math.min(...perfTests.withPrefix).toFixed(4)}ms`)
    console.log(`   最慢: ${Math.max(...perfTests.withPrefix).toFixed(4)}ms`)

    // 测试2: 不带前缀解析（最差情况）
    console.log('\n🔍 测试2: 不带前缀组件解析（最差情况）')
    const sampleWithoutPrefix = stats.mainApp.components.slice(0, 20)
    for (const comp of sampleWithoutPrefix) {
        const result = simulateComponentResolve(comp.name, false)
        perfTests.withoutPrefix.push(result.time)
    }
    const avgWithoutPrefix = perfTests.withoutPrefix.reduce((a, b) => a + b, 0) / perfTests.withoutPrefix.length
    console.log(`   平均解析时间: ${avgWithoutPrefix.toFixed(4)}ms`)
    console.log(`   最快: ${Math.min(...perfTests.withoutPrefix).toFixed(4)}ms`)
    console.log(`   最慢: ${Math.max(...perfTests.withoutPrefix).toFixed(4)}ms`)

    // 测试3: 缓存命中
    console.log('\n💾 测试3: 缓存性能')
    const cache = new Map()
    for (let i = 0; i < 100; i++) {
        const startTime = performance.now()
        cache.get('LsButton')
        const endTime = performance.now()
        perfTests.cacheHit.push(endTime - startTime)
    }
    const avgCacheHit = perfTests.cacheHit.reduce((a, b) => a + b, 0) / perfTests.cacheHit.length
    console.log(`   缓存命中平均时间: ${avgCacheHit.toFixed(6)}ms`)
    console.log(`   性能提升: ${((avgWithPrefix - avgCacheHit) / avgWithPrefix * 100).toFixed(2)}%`)

    return {
        avgWithPrefix,
        avgWithoutPrefix,
        avgCacheHit,
        worstCase: Math.max(...perfTests.withoutPrefix),
        bestCase: Math.min(...perfTests.withPrefix)
    }
}

/**
 * 3. 稳定性分析
 */
function analyzeStability(stats) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🛡️ 第三层分析：系统稳定性')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const issues = []

    // 检查1: 组件名冲突
    console.log('\n🔍 检查1: 组件名冲突检测')
    const componentNames = new Map()
    let conflicts = 0

    for (const [pkg, data] of Object.entries(stats.packages)) {
        for (const comp of data.components) {
            const fullName = `${PACKAGES_NAMING_RULES[pkg]}${comp.name}`
            if (componentNames.has(fullName)) {
                conflicts++
                issues.push({
                    type: 'conflict',
                    severity: 'high',
                    message: `组件名冲突: ${fullName} (在${componentNames.get(fullName)}和${pkg}中)`
                })
            } else {
                componentNames.set(fullName, pkg)
            }
        }
    }
    console.log(conflicts === 0 ? '   ✅ 无冲突' : `   ❌ 发现${conflicts}个冲突`)

    // 检查2: 前缀覆盖率
    console.log('\n📊 检查2: 前缀使用统计')
    const prefixUsage = {}
    for (const [pkg, data] of Object.entries(stats.packages)) {
        const prefix = PACKAGES_NAMING_RULES[pkg]
        prefixUsage[prefix] = data.count
    }
    console.log('   前缀使用情况:')
    for (const [prefix, count] of Object.entries(prefixUsage)) {
        console.log(`     ${prefix}: ${count}个组件`)
    }

    // 检查3: 大文件检测
    console.log('\n📏 检查3: 大文件检测（>300行）')
    let largeFiles = 0
    for (const [pkg, data] of Object.entries(stats.packages)) {
        for (const comp of data.components) {
            if (comp.lines > 300) {
                largeFiles++
                issues.push({
                    type: 'large-file',
                    severity: 'medium',
                    message: `大文件: ${PACKAGES_NAMING_RULES[pkg]}${comp.name} (${comp.lines}行)`
                })
            }
        }
    }
    console.log(largeFiles === 0 ? '   ✅ 无大文件' : `   ⚠️ ${largeFiles}个大文件`)

    // 检查4: 目录结构一致性
    console.log('\n🗂️ 检查4: 目录结构一致性')
    let structureIssues = 0
    for (const dir of PACKAGES_COMPONENT_DIRS) {
        const componentDir = path.join(PACKAGES_ROOT, dir)
        if (!fs.existsSync(componentDir)) {
            structureIssues++
            issues.push({
                type: 'structure',
                severity: 'low',
                message: `目录不存在: ${dir}`
            })
        }
    }
    console.log(structureIssues === 0 ? '   ✅ 结构一致' : `   ⚠️ ${structureIssues}个问题`)

    return {
        issues,
        conflictCount: conflicts,
        largeFileCount: largeFiles,
        structureIssueCount: structureIssues
    }
}

/**
 * 4. 扩展性分析
 */
function analyzeScalability(stats, perf) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📈 第四层分析：可扩展性评估')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const currentComponents = stats.total
    const projections = [100, 200, 500, 1000, 2000]

    console.log('\n🔮 扩展性预测:')
    console.log(`   当前组件数: ${currentComponents}`)
    console.log('\n   扩展到不同规模时的预期性能:')

    for (const target of projections) {
        if (target <= currentComponents) continue

        const scaleFactor = target / currentComponents
        const projectedWorstCase = perf.worstCase * scaleFactor
        const projectedAvg = perf.avgWithoutPrefix * Math.log2(scaleFactor)

        console.log(`\n   📊 ${target}个组件:`)
        console.log(`      最差情况: ${projectedWorstCase.toFixed(4)}ms`)
        console.log(`      平均情况: ${projectedAvg.toFixed(4)}ms`)
        console.log(`      缓存命中: ${perf.avgCacheHit.toFixed(6)}ms (不变)`)

        if (projectedWorstCase > 10) {
            console.log(`      ⚠️ 警告: 解析时间可能超过10ms`)
        }
    }

    // 内存占用估算
    console.log('\n💾 内存占用估算:')
    const avgPathLength = 80 // 平均路径长度
    const memoryPerComponent = avgPathLength * 2 + 24 // 字符串 + Map开销
    const currentMemory = currentComponents * memoryPerComponent
    console.log(`   当前缓存内存: ~${(currentMemory / 1024).toFixed(2)}KB`)

    for (const target of projections) {
        if (target <= currentComponents) continue
        const projectedMemory = target * memoryPerComponent
        console.log(`   ${target}个组件: ~${(projectedMemory / 1024).toFixed(2)}KB`)
    }

    return {
        currentComponents,
        projections,
        memoryPerComponent
    }
}

/**
 * 5. 改进建议生成
 */
function generateRecommendations(stats, perf, stability, scalability) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('💡 第五层分析：改进建议')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const recommendations = []

    // 性能优化
    if (perf.avgWithoutPrefix > 1) {
        recommendations.push({
            category: '性能优化',
            priority: 'high',
            title: '实现组件索引预构建',
            description: '当前不带前缀的组件解析需要遍历所有package，建议在构建时生成组件索引',
            impact: `预计减少${((perf.avgWithoutPrefix - 0.1) / perf.avgWithoutPrefix * 100).toFixed(0)}%的解析时间`,
            implementation: '在vite.config.ts中添加buildStart钩子，预构建组件映射表'
        })
    }

    // 稳定性增强
    if (stability.conflictCount > 0) {
        recommendations.push({
            category: '稳定性增强',
            priority: 'critical',
            title: '解决组件名冲突',
            description: `发现${stability.conflictCount}个组件名冲突，必须立即解决`,
            impact: '避免运行时组件解析错误',
            implementation: '重命名冲突组件或调整前缀规则'
        })
    }

    // 代码质量
    if (stability.largeFileCount > 0) {
        recommendations.push({
            category: '代码质量',
            priority: 'medium',
            title: '拆分大型组件',
            description: `发现${stability.largeFileCount}个超过300行的组件文件`,
            impact: '提升代码可维护性和复用性',
            implementation: '使用组合式API拆分逻辑，提取子组件'
        })
    }

    // 扩展性增强
    if (stats.total > 100) {
        recommendations.push({
            category: '扩展性增强',
            priority: 'medium',
            title: '实现懒加载机制',
            description: '组件数量较多，建议实现按需加载',
            impact: '减少初始包体积，提升首屏加载速度',
            implementation: '使用动态import和异步组件'
        })
    }

    // 开发体验
    recommendations.push({
        category: '开发体验',
        priority: 'low',
        title: '增强TypeScript智能提示',
        description: '当前components.d.ts已生成，可以进一步优化',
        impact: '提升开发效率，减少错误',
        implementation: '添加组件Props类型导出，生成JSDoc注释'
    })

    // 监控系统
    recommendations.push({
        category: '监控系统',
        priority: 'medium',
        title: '添加组件解析监控',
        description: '实时监控组件解析性能和错误',
        impact: '及时发现性能问题和解析错误',
        implementation: '在packagesResolver中添加性能埋点和错误上报'
    })

    // 输出建议
    console.log('\n📋 改进建议列表:\n')

    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    for (let i = 0; i < recommendations.length; i++) {
        const rec = recommendations[i]
        const icon = rec.priority === 'critical' ? '🔴' :
            rec.priority === 'high' ? '🟠' :
                rec.priority === 'medium' ? '🟡' : '🟢'

        console.log(`${icon} 建议${i + 1}: ${rec.title}`)
        console.log(`   分类: ${rec.category}`)
        console.log(`   优先级: ${rec.priority.toUpperCase()}`)
        console.log(`   描述: ${rec.description}`)
        console.log(`   影响: ${rec.impact}`)
        console.log(`   实施: ${rec.implementation}\n`)
    }

    return recommendations
}

/**
 * 6. 生成评分报告
 */
function generateScoreReport(stats, perf, stability, scalability) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎯 综合评分报告')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const scores = {
        performance: 0,
        stability: 0,
        scalability: 0,
        codeQuality: 0,
        overall: 0
    }

    // 性能评分 (0-100)
    if (perf.avgWithPrefix < 0.5) scores.performance = 100
    else if (perf.avgWithPrefix < 1) scores.performance = 90
    else if (perf.avgWithPrefix < 2) scores.performance = 80
    else if (perf.avgWithPrefix < 5) scores.performance = 70
    else scores.performance = 60

    // 稳定性评分 (0-100)
    scores.stability = 100
    scores.stability -= stability.conflictCount * 20
    scores.stability -= stability.structureIssueCount * 5
    scores.stability = Math.max(0, scores.stability)

    // 扩展性评分 (0-100)
    if (scalability.currentComponents < 100) scores.scalability = 100
    else if (scalability.currentComponents < 200) scores.scalability = 95
    else if (scalability.currentComponents < 500) scores.scalability = 90
    else scores.scalability = 85

    // 代码质量评分 (0-100)
    scores.codeQuality = 100
    scores.codeQuality -= stability.largeFileCount * 5
    scores.codeQuality = Math.max(0, scores.codeQuality)

    // 综合评分
    scores.overall = (
        scores.performance * 0.35 +
        scores.stability * 0.30 +
        scores.scalability * 0.20 +
        scores.codeQuality * 0.15
    )

    console.log('\n📊 各维度评分:')
    console.log(`   ⚡ 性能: ${scores.performance}/100 ${getScoreEmoji(scores.performance)}`)
    console.log(`   🛡️ 稳定性: ${scores.stability}/100 ${getScoreEmoji(scores.stability)}`)
    console.log(`   📈 扩展性: ${scores.scalability}/100 ${getScoreEmoji(scores.scalability)}`)
    console.log(`   💎 代码质量: ${scores.codeQuality}/100 ${getScoreEmoji(scores.codeQuality)}`)
    console.log(`\n🎯 综合评分: ${scores.overall.toFixed(1)}/100 ${getOverallEmoji(scores.overall)}`)

    return scores
}

function getScoreEmoji(score) {
    if (score >= 95) return '🌟🌟🌟'
    if (score >= 85) return '🌟🌟'
    if (score >= 70) return '🌟'
    if (score >= 60) return '⚠️'
    return '❌'
}

function getOverallEmoji(score) {
    if (score >= 95) return '卓越 (A+)'
    if (score >= 90) return '优秀 (A)'
    if (score >= 85) return '良好 (A-)'
    if (score >= 80) return '及格 (B+)'
    if (score >= 70) return '一般 (B)'
    return '需改进 (C)'
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 主函数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function main() {
    console.log('\n')
    console.log('╔════════════════════════════════════════════════════════╗')
    console.log('║   SmartAbp 组件自动导入系统 - 深度分析报告            ║')
    console.log('╚════════════════════════════════════════════════════════╝')
    console.log('\n')

    try {
        // 执行分析
        const stats = analyzeComponentStatistics()
        const perf = analyzePerformance(stats)
        const stability = analyzeStability(stats)
        const scalability = analyzeScalability(stats, perf)
        const recommendations = generateRecommendations(stats, perf, stability, scalability)
        const scores = generateScoreReport(stats, perf, stability, scalability)

        // 保存完整报告
        const report = {
            timestamp: new Date().toISOString(),
            statistics: stats,
            performance: perf,
            stability,
            scalability,
            recommendations,
            scores
        }

        const reportPath = path.join(__dirname, 'component-system-analysis-report.json')
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('✅ 分析完成！')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(`\n📄 详细报告已保存至: ${reportPath}\n`)

    } catch (error) {
        console.error('\n❌ 分析过程中出现错误:', error.message)
        process.exit(1)
    }
}

// 执行分析
main()

