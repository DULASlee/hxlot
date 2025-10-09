/**
 * ViteAutoDiscoveryPlugin - Vite文件监听插件
 * 🎯 监听 .vue 文件变化，触发ComponentGenie自动分析和注册
 * 
 * 特性：
 * - 🔍 实时监听文件变化
 * - ⚡ 只在文件真正变化时触发
 * - 🧠 集成AI自动分析
 * - 📦 自动注册组件
 * - 🚀 开发环境优化体验
 */

import type { Plugin } from 'vite'
import { handleComponentFileChange } from './AutoComponentDiscovery'

export interface ViteAutoDiscoveryOptions {
    /** 是否启用插件 */
    enabled?: boolean
    /** 监听的文件模式 */
    include?: string[]
    /** 排除的文件模式 */
    exclude?: string[]
    /** 是否在控制台输出日志 */
    verbose?: boolean
}

/**
 * 🚀 Vite自动组件发现插件
 * 
 * @example
 * ```typescript
 * // vite.config.ts
 * import { defineConfig } from 'vite'
 * import { viteAutoDiscoveryPlugin } from '@smartabp/lowcode-shared'
 * 
 * export default defineConfig({
 *   plugins: [
 *     viteAutoDiscoveryPlugin({
 *       enabled: process.env.NODE_ENV === 'development'
 *     })
 *   ]
 * })
 * ```
 */
export function viteAutoDiscoveryPlugin(options: ViteAutoDiscoveryOptions = {}): Plugin {
    const {
        enabled = process.env.NODE_ENV === 'development',
        include = ['**/*.vue'],
        exclude = ['**/node_modules/**', '**/dist/**', '**/*.test.vue', '**/*.spec.vue'],
        verbose = true
    } = options

    if (!enabled) {
        return {
            name: 'vite-auto-discovery',
            apply: 'serve' // 只在开发环境应用
        }
    }

    return {
        name: 'vite-auto-discovery',
        apply: 'serve', // 只在开发环境应用
        
        buildStart() {
            if (verbose) {
                console.log('🚀 ViteAutoDiscovery插件已启动')
            }
        },

        handleHotUpdate(ctx) {
            const { file, read } = ctx

            // 检查文件是否符合监听条件
            if (!shouldProcessFile(file, include, exclude)) {
                return
            }

            if (verbose) {
                console.log(`📁 检测到Vue文件变化: ${file}`)
            }

            // 异步处理文件变化，不阻塞HMR
            processFileChangeAsync(file, read, verbose)
            
            // 返回undefined让Vite继续正常的HMR流程
            return undefined
        },

        configureServer(server) {
            // 监听文件系统变化
            server.watcher.on('add', (file) => {
                if (shouldProcessFile(file, include, exclude)) {
                    if (verbose) {
                        console.log(`📄 检测到新Vue文件: ${file}`)
                    }
                    processFileAddAsync(file, verbose)
                }
            })

            server.watcher.on('unlink', (file) => {
                if (shouldProcessFile(file, include, exclude)) {
                    if (verbose) {
                        console.log(`🗑️ 检测到Vue文件删除: ${file}`)
                    }
                    // TODO: 处理文件删除（从ComponentRegistry中移除）
                }
            })
        }
    }
}

/**
 * 🎯 检查文件是否应该被处理
 */
function shouldProcessFile(file: string, include: string[], exclude: string[]): boolean {
    // 基本检查：必须是.vue文件
    if (!file.endsWith('.vue')) {
        return false
    }

    // 排除检查
    for (const pattern of exclude) {
        if (minimatchCheck(file, pattern)) {
            return false
        }
    }

    // 包含检查
    for (const pattern of include) {
        if (minimatchCheck(file, pattern)) {
            return true
        }
    }

    return false
}

/**
 * 🔍 简化的glob匹配（避免依赖外部库）
 */
function minimatchCheck(file: string, pattern: string): boolean {
    // 简化实现，支持基本的通配符
    if (pattern.includes('**')) {
        const regex = pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\./g, '\\.')
        return new RegExp(regex).test(file)
    }
    
    if (pattern.includes('*')) {
        const regex = pattern
            .replace(/\*/g, '[^/]*')
            .replace(/\./g, '\\.')
        return new RegExp(regex).test(file)
    }
    
    return file.includes(pattern.replace(/\*\*/g, '').replace(/\*/g, ''))
}

/**
 * ⚡ 异步处理文件变化（不阻塞主线程）
 */
async function processFileChangeAsync(
    filePath: string, 
    readFile: () => Promise<string> | string,
    verbose: boolean
): Promise<void> {
    try {
        // 读取文件内容
        const content = await readFile()
        
        // 调用AutoDiscovery处理
        await handleComponentFileChange(filePath, content)
        
        if (verbose) {
            console.log(`✅ 文件变化处理完成: ${filePath}`)
        }
        
    } catch (error) {
        console.error(`❌ 处理文件变化失败 ${filePath}:`, error)
    }
}

/**
 * 📄 异步处理新文件添加
 */
async function processFileAddAsync(filePath: string, verbose: boolean): Promise<void> {
    try {
        // 对于新文件，我们需要读取其内容
        // 在实际环境中，可以使用fs.readFile或其他方式
        // 这里我们调用handleComponentFileChange，它会尝试获取内容
        await handleComponentFileChange(filePath)
        
        if (verbose) {
            console.log(`✅ 新文件处理完成: ${filePath}`)
        }
        
    } catch (error) {
        console.error(`❌ 处理新文件失败 ${filePath}:`, error)
    }
}

/**
 * 🎯 导出默认插件配置
 */
export const defaultAutoDiscoveryPlugin = viteAutoDiscoveryPlugin({
    enabled: process.env.NODE_ENV === 'development',
    include: [
        '**/src/components/**/*.vue',
        '**/packages/*/src/components/**/*.vue',
        '**/src/views/**/*.vue'
    ],
    exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.test.vue',
        '**/*.spec.vue',
        '**/example/**',
        '**/demo/**'
    ],
    verbose: true
})
