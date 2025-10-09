/**
 * VueAutoComponentBridge - Vue组件自动注册桥梁
 * 🎯 解决关键Gap：从ComponentRegistry → Vue App全局组件
 * 
 * 这是真正让组件"可用"的关键环节！
 */

import type { App } from 'vue'
import { globalComponentRegistry } from './components/ComponentRegistry'

/**
 * 🔥 真正的自动消费：将ComponentRegistry中的组件注册到Vue应用
 */
export class VueComponentBridge {
    private app: App
    private registeredComponents = new Set<string>()

    constructor(app: App) {
        this.app = app
    }

    /**
     * 🎯 核心方法：自动注册所有发现的组件到Vue
     */
    async syncComponentsToVue(): Promise<void> {
        const allComponents = globalComponentRegistry.getAllComponents()
        
        for (const metadata of allComponents) {
            if (!this.registeredComponents.has(metadata.name)) {
                await this.registerSingleComponent(metadata)
            }
        }
    }

    /**
     * 📦 注册单个组件到Vue应用
     */
    private async registerSingleComponent(metadata: any): Promise<void> {
        try {
            // 🔥 关键：动态导入组件
            const component = await this.loadComponent(metadata)
            
            if (component) {
                // ✅ 注册到Vue应用全局组件
                this.app.component(metadata.name, component)
                this.registeredComponents.add(metadata.name)
                
                console.log(`✅ Vue组件已注册: ${metadata.name}`)
            }
        } catch (error) {
            console.warn(`⚠️ 组件注册失败: ${metadata.name}`, error)
        }
    }

    /**
     * 🚀 动态加载组件（真实实现）
     */
    private async loadComponent(metadata: any): Promise<any> {
        // 方案1：基于文件路径动态导入
        if (metadata.sourceCode) {
            // 这里需要实际的文件路径
            const componentPath = this.resolveComponentPath(metadata)
            if (componentPath) {
                const module = await import(componentPath)
                return module.default || module
            }
        }

        // 方案2：从已有的组件加载器获取
        return await globalComponentRegistry.loadComponent(metadata.name)
    }

    /**
     * 🎯 解析组件文件路径（关键实现）
     */
    private resolveComponentPath(metadata: any): string | null {
        // 这里需要将ComponentRegistry中的元数据转换为实际的import路径
        // 比如：metadata.path = "/src/components/UserCard.vue"
        // 需要转换为："/src/components/UserCard.vue" 
        
        if (metadata.path) {
            // Vite环境下可以直接使用路径
            return metadata.path
        }
        
        // 根据bundle和name推测路径
        if (metadata.bundle === '@smartabp/main-app') {
            return `/src/components/${metadata.name}.vue`
        }
        
        return null
    }

    /**
     * 📡 监听ComponentRegistry变化，实时同步到Vue
     */
    startAutoSync(): void {
        // 初始同步
        this.syncComponentsToVue()
        
        // 监听新组件注册事件
        globalComponentRegistry.on?.('componentRegistered', (metadata: any) => {
            this.registerSingleComponent(metadata)
        })
        
        console.log('🔄 Vue组件自动同步已启动')
    }
}

/**
 * 🎯 便捷API：一键启动完整的自动化流程
 */
export async function setupAutoComponentSystem(app: App): Promise<void> {
    // 1️⃣ 启动自动发现
    const { startAutoDiscovery } = await import('./AutoComponentDiscovery')
    await startAutoDiscovery()
    
    // 2️⃣ 建立Vue桥梁
    const bridge = new VueComponentBridge(app)
    bridge.startAutoSync()
    
    console.log('🚀 完整自动组件系统已启动')
    console.log('   ✅ 文件监听 → AI分析 → 自动注册 → Vue可用')
}
