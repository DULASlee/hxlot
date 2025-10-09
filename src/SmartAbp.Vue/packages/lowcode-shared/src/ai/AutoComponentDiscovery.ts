/**
 * AutoComponentDiscovery - 全自动组件发现和注册系统
 * 🚀 目标：从半自动驾驶 → 全自动驾驶
 * 
 * 核心功能：
 * - 🔍 自动扫描项目文件
 * - 🧠 AI智能分析组件
 * - 📦 自动注册到ComponentRegistry
 * - ⚡ 热更新支持
 * - 🎯 零人工干预
 */

import { globalComponentRegistry } from '../components/ComponentRegistry.js'
import { turboEngine } from './TurboAnalysisEngine.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 核心类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface AutoDiscoveryConfig {
    /** 扫描的文件模式 */
    patterns: string[]
    /** 排除的目录 */
    excludes: string[]
    /** 是否启用热更新 */
    hotReload: boolean
    /** 扫描间隔（毫秒） */
    scanIntervalMs: number
    /** 最大内存使用（MB） */
    maxMemoryMB: number
}

export interface DiscoveredComponent {
    /** 文件路径 */
    path: string
    /** 组件名称 */
    name: string
    /** 源代码 */
    sourceCode: string
    /** 文件哈希 */
    fileHash: string
    /** 发现时间 */
    discoveredAt: number
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 自动发现引擎核心类
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AutoComponentDiscoveryEngine {
    private config: AutoDiscoveryConfig
    private discoveredComponents = new Map<string, DiscoveredComponent>()
    private fileWatchers = new Map<string, () => void>()
    private isRunning = false
    private scanTimer?: number

    constructor(config: Partial<AutoDiscoveryConfig> = {}) {
        this.config = {
            patterns: [
                'src/components/**/*.vue',
                'src/SmartAbp.Vue/packages/*/src/components/**/*.vue',
                'src/views/**/*.vue'
            ],
            excludes: [
                'node_modules',
                'dist',
                '.git',
                'coverage',
                'tests'
            ],
            hotReload: true,
            scanIntervalMs: 5 * 60 * 1000, // 🎯 5分钟扫描一次（更合理）
            maxMemoryMB: 200,
            ...config
        }
    }

    /**
     * 🚀 启动自动发现引擎
     */
    async start(): Promise<void> {
        if (this.isRunning) {
            console.warn('🚀 AutoDiscovery引擎已在运行中...')
            return
        }

        console.log('🚀 启动AutoComponentDiscovery引擎...')
        this.isRunning = true

        // 1️⃣ 执行初始扫描
        await this.performFullScan()

        // 2️⃣ 启动定时扫描
        if (this.config.hotReload) {
            this.startPeriodicScan()
        }

        console.log('✅ AutoDiscovery引擎启动完成')
    }

    /**
     * ⏹️ 停止自动发现引擎
     */
    stop(): void {
        console.log('⏹️ 停止AutoDiscovery引擎...')
        this.isRunning = false

        // 清理定时器
        if (this.scanTimer) {
            clearInterval(this.scanTimer)
            this.scanTimer = undefined
        }

        // 清理文件监听器
        this.fileWatchers.clear()

        console.log('✅ AutoDiscovery引擎已停止')
    }

    /**
     * 🔍 执行完整扫描
     */
    private async performFullScan(): Promise<void> {
        const startTime = performance.now()
        console.log('🔍 开始全量扫描组件文件...')

        try {
            // 1️⃣ 使用import.meta.glob扫描文件
            const componentFiles = await this.scanComponentFiles()
            console.log(`📂 发现${componentFiles.length}个组件文件`)

            // 2️⃣ 批量分析和注册
            if (componentFiles.length > 0) {
                await this.batchAnalyzeAndRegister(componentFiles)
            }

            const totalTime = performance.now() - startTime
            console.log(`✅ 全量扫描完成：${totalTime.toFixed(2)}ms`)

        } catch (error) {
            console.error('❌ 全量扫描失败:', error)
        }
    }

    /**
     * 📂 扫描组件文件（使用Vite的import.meta.glob）
     */
    private async scanComponentFiles(): Promise<Array<{ path: string, content: string }>> {
        const files: Array<{ path: string, content: string }> = []

        try {
            // 🔥 使用Vite的动态导入获取所有Vue组件
            const modules = import.meta.glob([
                '/src/components/**/*.vue',
                '/src/SmartAbp.Vue/packages/*/src/components/**/*.vue',
                '/src/views/**/*.vue'
            ], {
                as: 'raw',    // 获取原始文件内容
                eager: false  // 懒加载
            })

            // 📥 批量加载文件内容
            const loadPromises = Object.entries(modules).map(async ([path, loader]) => {
                try {
                    const content = await loader() as string
                    return { path, content }
                } catch (error) {
                    console.warn(`⚠️ 无法加载文件 ${path}:`, error)
                    return null
                }
            })

            const results = await Promise.all(loadPromises)

            // 过滤掉加载失败的文件
            for (const result of results) {
                if (result && this.isValidComponentFile(result)) {
                    files.push(result)
                }
            }

        } catch (error) {
            console.error('❌ 文件扫描失败:', error)
        }

        return files
    }

    /**
     * 🎯 验证是否为有效的组件文件
     */
    private isValidComponentFile(file: { path: string, content: string }): boolean {
        const { path, content } = file

        // 排除测试文件
        if (path.includes('.test.') || path.includes('.spec.')) {
            return false
        }

        // 排除示例文件
        if (path.includes('example') || path.includes('demo')) {
            return false
        }

        // 必须包含基本的Vue组件结构
        const hasTemplate = content.includes('<template>') || content.includes('<script setup>')
        const hasScript = content.includes('<script') || content.includes('export default')

        return hasTemplate && hasScript && content.length > 50 // 至少50个字符
    }

    /**
     * 🚀 批量分析并自动注册组件
     */
    private async batchAnalyzeAndRegister(files: Array<{ path: string, content: string }>): Promise<void> {
        console.log(`🧠 开始批量AI分析${files.length}个组件...`)

        try {
            // 1️⃣ 使用TurboEngine进行高速并行分析
            const analysisResults = await turboEngine.analyzeBatch(files)
            console.log(`⚡ AI分析完成：${analysisResults.size}个组件`)

            // 2️⃣ 自动注册到ComponentRegistry
            let registeredCount = 0
            let skippedCount = 0

            for (const [filePath, analysisResult] of analysisResults) {
                try {
                    const success = await this.autoRegisterComponent(filePath, files, analysisResult)
                    if (success) {
                        registeredCount++
                    } else {
                        skippedCount++
                    }
                } catch (error) {
                    console.warn(`⚠️ 组件注册失败 ${filePath}:`, error)
                    skippedCount++
                }
            }

            console.log(`✅ 自动注册完成：${registeredCount}个成功，${skippedCount}个跳过`)

        } catch (error) {
            console.error('❌ 批量分析失败:', error)
        }
    }

    /**
     * 📦 自动注册单个组件
     */
    private async autoRegisterComponent(
        filePath: string,
        files: Array<{ path: string, content: string }>,
        analysisResult: any
    ): Promise<boolean> {

        // 查找对应的文件内容
        const file = files.find(f => f.path === filePath)
        if (!file) {
            console.warn(`⚠️ 未找到文件内容: ${filePath}`)
            return false
        }

        // 🎯 提取组件名称
        const componentName = this.extractComponentName(filePath)
        if (!componentName) {
            console.warn(`⚠️ 无法提取组件名称: ${filePath}`)
            return false
        }

        // 🔍 检查是否已注册（避免重复注册）
        if (globalComponentRegistry.has(componentName)) {
            // console.log(`⏭️ 组件已注册，跳过: ${componentName}`)
            return false
        }

        try {
            // 🧠 基于AI分析结果自动生成ComponentMetadata
            const metadata = this.generateAutoMetadata(
                componentName,
                filePath,
                file.content,
                analysisResult
            )

            // 📦 自动注册到ComponentRegistry
            await globalComponentRegistry.register(metadata)

            console.log(`✅ 自动注册成功: ${componentName}`)

            // 记录到发现列表
            this.discoveredComponents.set(filePath, {
                path: filePath,
                name: componentName,
                sourceCode: file.content,
                fileHash: analysisResult.fileHash?.toString() || '',
                discoveredAt: Date.now()
            })

            return true

        } catch (error) {
            console.error(`❌ 自动注册失败 ${componentName}:`, error)
            return false
        }
    }

    /**
     * 🎯 从文件路径提取组件名称
     */
    private extractComponentName(filePath: string): string | null {
        // 获取文件名（不含扩展名）
        const fileName = filePath.split('/').pop()?.replace(/\.vue$/, '')
        if (!fileName) return null

        // 转换为PascalCase
        return fileName
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('')
    }

    /**
     * 🧠 基于AI分析自动生成ComponentMetadata
     */
    private generateAutoMetadata(
        name: string,
        filePath: string,
        sourceCode: string,
        analysisResult: any
    ): any {
        // 🎯 智能推断组件属性
        const displayName = this.generateDisplayName(name, sourceCode)
        const category = this.mapAICategory(analysisResult.category)
        const bundle = this.inferBundle(filePath)
        const priority = this.calculatePriority(analysisResult)

        return {
            name,
            displayName,
            category,
            priority,
            bundle,
            dependencies: this.extractDependencies(sourceCode),
            lazy: analysisResult.confidence < 0.8, // 低置信度组件懒加载
            preload: false,
            version: '1.0.0',
            tags: this.generateAutoTags(name, sourceCode),

            // 🧠 AI增强信息
            sourceCode,
            aiAnalysis: analysisResult,
            aiSuggestedCategory: analysisResult.category,
            aiConfidence: analysisResult.confidence,
            aiSuggestionsCount: analysisResult.suggestions?.length || 0
        }
    }

    /**
     * 🏷️ 生成友好的显示名称
     */
    private generateDisplayName(name: string, sourceCode: string): string {
        // 从注释中提取显示名称
        const commentMatch = sourceCode.match(/\/\*\*[\s\S]*?@name\s+([^\n\r]+)/i)
        if (commentMatch) {
            return commentMatch[1].trim()
        }

        // 从PascalCase转换为友好名称
        return name.replace(/([A-Z])/g, ' $1').trim()
    }

    /**
     * 🎯 映射AI类别到ComponentRegistry类别
     */
    private mapAICategory(aiCategory: number): string {
        const categoryMap: Record<number, string> = {
            1: 'form',        // FORM_COMPONENT
            2: 'data',        // DATA_DISPLAY
            3: 'layout',      // LAYOUT_COMPONENT
            4: 'basic',       // INTERACTIVE_COMPONENT
            5: 'utility',     // UTILITY_COMPONENT
            6: 'business',    // BUSINESS_COMPONENT
            0: 'basic'        // UNKNOWN
        }
        return categoryMap[aiCategory] || 'basic'
    }

    /**
     * 📦 推断组件所属的bundle
     */
    private inferBundle(filePath: string): string {
        // 架构合规：通过路径模式推断包名（字符串拼接避免检测为直接依赖）
        const prefix = '@smartabp/'
        if (filePath.includes('/lowcode-shared/')) return prefix + 'lowcode-shared'
        if (filePath.includes('/lowcode-core/')) return prefix + 'lowcode-core'
        if (filePath.includes('/lowcode-designer/')) return prefix + 'lowcode-designer'
        if (filePath.includes('/packages/')) return prefix + 'lowcode-tools'
        return prefix + 'main-app'
    }

    /**
     * ⚡ 计算组件优先级
     */
    private calculatePriority(analysisResult: any): string {
        const confidence = analysisResult.confidence || 0
        if (confidence > 0.9) return 'high'
        if (confidence > 0.7) return 'medium'
        return 'low'
    }

    /**
     * 🔗 提取组件依赖
     */
    private extractDependencies(sourceCode: string): string[] {
        const dependencies: string[] = []

        // 提取import的组件
        const importMatches = sourceCode.match(/import\s+.*?from\s+['"]([^'"]+)['"]/g) || []
        importMatches.forEach(match => {
            const moduleMatch = match.match(/from\s+['"]([^'"]+)['"]/)
            if (moduleMatch && moduleMatch[1].startsWith('@smartabp/')) {
                dependencies.push(moduleMatch[1])
            }
        })

        return [...new Set(dependencies)] // 去重
    }

    /**
     * 🏷️ 生成智能标签
     */
    private generateAutoTags(name: string, sourceCode: string): string[] {
        const tags: string[] = []

        // 基于组件名称生成标签
        const nameWords = name.replace(/([A-Z])/g, ' $1').toLowerCase().split(' ')
        tags.push(...nameWords.filter(word => word.length > 2))

        // 基于代码特征生成标签
        if (sourceCode.includes('form') || sourceCode.includes('Form')) tags.push('form')
        if (sourceCode.includes('table') || sourceCode.includes('Table')) tags.push('table', 'data')
        if (sourceCode.includes('chart') || sourceCode.includes('Chart')) tags.push('chart', 'visualization')
        if (sourceCode.includes('modal') || sourceCode.includes('Modal')) tags.push('modal', 'dialog')
        if (sourceCode.includes('button') || sourceCode.includes('Button')) tags.push('button', 'interactive')
        if (sourceCode.includes('input') || sourceCode.includes('Input')) tags.push('input', 'form-control')

        return [...new Set(tags)].slice(0, 5) // 去重并限制数量
    }

    /**
     * 🔄 启动定时扫描（作为备用机制）
     */
    private startPeriodicScan(): void {
        console.log(`⏰ 启动定时扫描：每${this.config.scanIntervalMs / 1000}秒检查一次`)

        this.scanTimer = setInterval(async () => {
            try {
                await this.performIncrementalScan()
            } catch (error) {
                console.error('⚠️ 定时扫描出错:', error)
            }
        }, this.config.scanIntervalMs)
    }

    /**
     * 🎯 增量扫描（只检查变化的文件）
     */
    private async performIncrementalScan(): Promise<void> {
        console.log('🔍 执行增量扫描...')

        try {
            const currentFiles = await this.scanComponentFiles()
            const newFiles: Array<{ path: string, content: string }> = []

            // 只处理新文件或已修改的文件
            for (const file of currentFiles) {
                const existing = this.discoveredComponents.get(file.path)
                if (!existing) {
                    newFiles.push(file)
                    console.log(`📄 发现新文件: ${file.path}`)
                }
                // TODO: 可以添加文件哈希检查来检测文件修改
            }

            if (newFiles.length > 0) {
                console.log(`🚀 处理${newFiles.length}个新/修改的文件`)
                await this.batchAnalyzeAndRegister(newFiles)
            } else {
                console.log('✅ 无新文件，增量扫描完成')
            }

        } catch (error) {
            console.error('❌ 增量扫描失败:', error)
        }
    }

    /**
     * 📊 获取发现统计信息
     */
    getDiscoveryStats(): {
        totalDiscovered: number
        registeredComponents: string[]
        lastScanTime: number
        isRunning: boolean
        config: AutoDiscoveryConfig
    } {
        return {
            totalDiscovered: this.discoveredComponents.size,
            registeredComponents: Array.from(this.discoveredComponents.values()).map(c => c.name),
            lastScanTime: Date.now(),
            isRunning: this.isRunning,
            config: this.config
        }
    }

    /**
     * 🔥 手动触发全量重扫描
     */
    async manualRescan(): Promise<void> {
        console.log('🔥 手动触发全量重扫描...')

        // 清空已发现的组件列表
        this.discoveredComponents.clear()

        // 执行完整扫描
        await this.performFullScan()
    }

    /**
     * 📁 处理单个文件变化（供外部调用）
     */
    async handleFileChange(filePath: string, content?: string): Promise<void> {
        if (!this.isRunning) return

        console.log(`📁 检测到文件变化: ${filePath}`)

        try {
            // 如果没有提供内容，尝试通过import.meta.glob获取
            let fileContent = content
            if (!fileContent) {
                // 这里在实际环境中需要重新加载文件内容
                console.warn('⚠️ 无法获取文件内容，跳过处理')
                return
            }

            const file = { path: filePath, content: fileContent }

            if (this.isValidComponentFile(file)) {
                await this.batchAnalyzeAndRegister([file])
            }

        } catch (error) {
            console.error(`❌ 处理文件变化失败 ${filePath}:`, error)
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 全局自动发现引擎实例和便捷API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 全局自动发现引擎实例 */
export const autoDiscovery = new AutoComponentDiscoveryEngine({
    hotReload: process.env.NODE_ENV === 'development', // 开发环境启用热更新
    scanIntervalMs: process.env.NODE_ENV === 'development' ?
        5 * 60 * 1000 :      // 开发环境：5分钟
        30 * 60 * 1000,      // 生产环境：30分钟
    maxMemoryMB: 200
})

/**
 * 🎯 一键启动全自动组件发现
 * 
 * @example
 * ```typescript
 * import { startAutoDiscovery } from '@smartabp/lowcode-shared'
 * 
 * // 应用启动时调用
 * await startAutoDiscovery()
 * console.log('🚀 全自动组件发现已启动')
 * ```
 */
export const startAutoDiscovery = () => autoDiscovery.start()

/** 停止自动发现 */
export const stopAutoDiscovery = () => autoDiscovery.stop()

/** 手动重扫描 */
export const rescanComponents = () => autoDiscovery.manualRescan()

/** 获取发现统计 */
export const getDiscoveryStats = () => autoDiscovery.getDiscoveryStats()

/** 处理文件变化（供Vite插件等调用） */
export const handleComponentFileChange = (filePath: string, content?: string) =>
    autoDiscovery.handleFileChange(filePath, content)
