/**
 * Lowcode-Shared 组件统一注册
 * 
 * 将所有共享组件注册到ComponentRegistry
 * @遵循架构铁律二：强制使用组件注册系统
 */

import { registerComponent } from './ComponentRegistry.js'

/**
 * 注册所有lowcode-shared组件到ComponentRegistry
 */
export function registerSharedComponents(): void {
    console.log('🔧 开始注册lowcode-shared组件到ComponentRegistry')

    // 1. BaseComponent（基础组件，高优先级）
    registerComponent({
        name: 'BaseComponent',
        displayName: '基础组件',
        description: '所有低代码组件的基类',
        category: 'basic',
        priority: 'high',
        dependencies: [],
        bundle: '@smartabp/lowcode-shared',
        lazy: false,
        preload: true,
        version: '1.0.0',
        tags: ['base', 'foundation']
    })

    // 2. VirtualAssembly（虚拟程序集，高优先级）
    registerComponent({
        name: 'VirtualAssembly',
        displayName: '虚拟程序集',
        description: '微AI 2.0核心 - 智能组件装配系统',
        category: 'utility',
        priority: 'high',
        dependencies: ['BaseComponent'],
        bundle: '@smartabp/lowcode-shared',
        lazy: false,
        preload: true,
        version: '2.0.0',
        tags: ['assembly', 'ai', 'micro-ai']
    })

    // 3. HOCs（高阶组件）
    registerComponent({
        name: 'withLoading',
        displayName: '加载状态HOC',
        description: '为组件添加加载状态功能',
        category: 'utility',
        priority: 'medium',
        dependencies: ['BaseComponent'],
        bundle: '@smartabp/lowcode-shared',
        lazy: true,
        preload: false,
        version: '1.0.0',
        tags: ['hoc', 'loading']
    })

    registerComponent({
        name: 'withError',
        displayName: '错误处理HOC',
        description: '为组件添加错误处理功能',
        category: 'utility',
        priority: 'medium',
        dependencies: ['BaseComponent'],
        bundle: '@smartabp/lowcode-shared',
        lazy: true,
        preload: false,
        version: '1.0.0',
        tags: ['hoc', 'error']
    })

    registerComponent({
        name: 'withPermission',
        displayName: '权限控制HOC',
        description: '为组件添加权限控制功能',
        category: 'security',
        priority: 'medium',
        dependencies: ['BaseComponent'],
        bundle: '@smartabp/lowcode-shared',
        lazy: true,
        preload: false,
        version: '1.0.0',
        tags: ['hoc', 'permission', 'security']
    })

    // 4. 版本管理组件
    registerComponent({
        name: 'VersionWarningBanner',
        displayName: '版本警告横幅',
        description: 'Schema版本不兼容时的警告组件',
        category: 'utility',
        priority: 'low',
        dependencies: ['BaseComponent'],
        bundle: '@smartabp/lowcode-shared',
        lazy: true,
        preload: false,
        version: '1.0.0',
        tags: ['version', 'warning', 'banner']
    })

    console.log('✅ lowcode-shared组件注册完成 (7个组件)')
}

