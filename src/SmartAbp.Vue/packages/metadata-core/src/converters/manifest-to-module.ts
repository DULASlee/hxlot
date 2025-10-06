/**
 * @smartabp/metadata-core/converters
 * Manifest to ModuleMetadata 转换器
 * 
 * 功能：
 * - 将旧版Manifest格式转换为新的ModuleMetadata格式
 * - 零代码侵入，向后兼容
 * - 自动映射字段
 * - 验证转换结果
 */

import type { ModuleMetadata, RouteMetadata, StoreMetadata } from '../types'
import { validateModuleMetadata } from '../validators/module-validator'

// ========================================
// 旧版Manifest类型定义
// ========================================

/**
 * 旧版Manifest Schema（从schema.ts）
 */
export interface LegacyManifest {
    $schema?: string
    name: string
    displayName?: string
    description?: string
    version: string
    author?: string
    abpStyle: boolean
    order: number
    dependsOn: string[]
    routes: LegacyRoute[]
    stores: LegacyStore[]
    policies: string[]
    lifecycle?: LegacyLifecycle
    features?: {
        enableAuth?: boolean
        enableCache?: boolean
        enableI18n?: boolean
    }
    menuConfig?: {
        icon?: string
        order?: number
        features?: string[]
        parentMenu?: string
    }
}

export interface LegacyRoute {
    name: string
    path: string
    component: string
    meta?: {
        title?: string
        icon?: string
        policy?: string
        keepAlive?: boolean
        hidden?: boolean
        order?: number
        requiredRoles?: string[]
        menuKey?: string
        showInMenu?: boolean
    }
}

export interface LegacyStore {
    symbol: string
    id: string
    modulePath: string
}

export interface LegacyLifecycle {
    preInit?: string
    init?: string
    postInit?: string
    beforeMount?: string
    mounted?: string
}

// ========================================
// 转换选项
// ========================================

export interface ConvertOptions {
    /**
     * 是否验证转换结果
     * @default true
     */
    validate?: boolean

    /**
     * 是否保留旧版字段（存储在额外属性中）
     * @default false
     */
    preserveLegacyFields?: boolean

    /**
     * 组件路径前缀映射
     * @example { '@/': 'src/' }
     */
    componentPathMapping?: Record<string, string>

    /**
     * 自定义字段映射函数
     */
    customFieldMapper?: (field: string, value: any) => any
}

// ========================================
// 核心转换函数
// ========================================

/**
 * 将Manifest转换为ModuleMetadata
 * 
 * @example
 * const manifest = loadManifest()
 * const moduleMetadata = convertManifestToModule(manifest)
 */
export function convertManifestToModule(
    manifest: LegacyManifest,
    options: ConvertOptions = {}
): ModuleMetadata {
    const { validate = true, preserveLegacyFields = false } = options

    // 转换路由
    const routes = convertRoutes(manifest.routes, options)

    // 转换Store
    const stores = convertStores(manifest.stores, options)

    // 转换生命周期
    const lifecycle = convertLifecycle(manifest.lifecycle, options)

    // 转换features
    const features = convertFeatures(manifest.features)

    // 转换menuConfig
    const menuConfig = convertMenuConfig(manifest.menuConfig)

    // 构建新的ModuleMetadata
    const moduleMetadata: ModuleMetadata = {
        name: manifest.name,
        displayName: manifest.displayName,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author,
        abpStyle: manifest.abpStyle,
        order: manifest.order,
        dependsOn: manifest.dependsOn,
        routes,
        stores,
        policies: manifest.policies,
        lifecycle,
        features,
        menuConfig
    }

    // 保留旧版字段
    if (preserveLegacyFields) {
        const legacyFields: Record<string, any> = {}

        if (manifest.$schema) {
            legacyFields.$schema = manifest.$schema
        }

        // 可以在features中存储遗留字段（作为字符串存储）
        if (Object.keys(legacyFields).length > 0) {
            moduleMetadata.features = {
                ...moduleMetadata.features,
                __legacy: JSON.stringify(legacyFields)
            }
        }
    }

    // 验证转换结果
    if (validate) {
        try {
            validateModuleMetadata(moduleMetadata)
        } catch (error) {
            throw new Error(
                `转换后的ModuleMetadata验证失败: ${error instanceof Error ? error.message : String(error)}`
            )
        }
    }

    return moduleMetadata
}

// ========================================
// 子转换函数
// ========================================

/**
 * 转换路由配置
 */
function convertRoutes(
    legacyRoutes: LegacyRoute[],
    _options: ConvertOptions
): RouteMetadata[] {
    return legacyRoutes.map(route => {
        // const { componentPathMapping = {} } = _options

        // 转换组件路径（暂时直接使用）
        const component = route.component
        // for (const [from, to] of Object.entries(componentPathMapping)) {
        //   if (component.startsWith(from)) {
        //     component = component.replace(from, to)
        //   }
        // }

        // 转换meta
        const meta: Record<string, any> = {}
        if (route.meta) {
            Object.assign(meta, route.meta)
        }

        const routeMetadata: RouteMetadata = {
            path: route.path,
            name: route.name,
            component,
            meta: Object.keys(meta).length > 0 ? meta : undefined
        }

        return routeMetadata
    })
}

/**
 * 转换Store配置
 */
function convertStores(
    legacyStores: LegacyStore[],
    _options: ConvertOptions
): StoreMetadata[] {
    return legacyStores.map(store => {
        // 从symbol提取Store名称（useXxxStore → xxx）
        const match = store.symbol.match(/^use([A-Z]\w+)Store$/)
        const name = match && match[1] ? match[1].charAt(0).toLowerCase() + match[1].slice(1) : store.id

        // 推断Store类型
        // 简单规则：如果id包含'entity'或'data'，认为是entity类型
        let type: 'entity' | 'ui' | 'global' = 'ui'
        if (store.id.includes('entity') || store.id.includes('data')) {
            type = 'entity'
        } else if (store.id.includes('global') || store.id.includes('app')) {
            type = 'global'
        }

        const storeMetadata: StoreMetadata = {
            name,
            type
        }

        // 如果是entity类型，尝试推断entityName
        if (type === 'entity') {
            // 从id中提取实体名称
            const entityMatch = store.id.match(/([A-Z][a-z]+)/)
            if (entityMatch) {
                storeMetadata.entityName = entityMatch[1]
            }
        }

        return storeMetadata
    })
}

/**
 * 转换生命周期配置
 */
function convertLifecycle(
    legacyLifecycle: LegacyLifecycle | undefined,
    _options: ConvertOptions
): Record<string, string> | undefined {
    if (!legacyLifecycle) return undefined

    const lifecycle: Record<string, string> = {}

    // 映射生命周期钩子
    const hookMapping: Record<string, string> = {
        preInit: 'onBeforeMount',
        init: 'onMounted',
        postInit: 'onMounted',
        beforeMount: 'onBeforeMount',
        mounted: 'onMounted'
    }

    for (const [legacyHook, newHook] of Object.entries(hookMapping)) {
        const value = legacyLifecycle[legacyHook as keyof LegacyLifecycle]
        if (value) {
            // 如果新钩子已存在，跳过（避免覆盖）
            if (!lifecycle[newHook]) {
                lifecycle[newHook] = value
            }
        }
    }

    return Object.keys(lifecycle).length > 0 ? lifecycle : undefined
}

/**
 * 转换features配置
 */
function convertFeatures(
    legacyFeatures: LegacyManifest['features']
): Record<string, any> | undefined {
    if (!legacyFeatures) return undefined

    // 直接复制features
    const features: Record<string, any> = { ...legacyFeatures }

    return Object.keys(features).length > 0 ? features : undefined
}

/**
 * 转换menuConfig
 */
function convertMenuConfig(
    legacyMenuConfig: LegacyManifest['menuConfig']
): ModuleMetadata['menuConfig'] | undefined {
    if (!legacyMenuConfig) return undefined

    return {
        title: '', // Manifest中没有title字段，需要从displayName获取
        icon: legacyMenuConfig.icon,
        order: legacyMenuConfig.order
    }
}

// ========================================
// 批量转换
// ========================================

/**
 * 批量转换多个Manifest
 */
export function convertManifestsToModules(
    manifests: LegacyManifest[],
    options: ConvertOptions = {}
): ModuleMetadata[] {
    return manifests.map(manifest => convertManifestToModule(manifest, options))
}

// ========================================
// 反向转换（ModuleMetadata → Manifest）
// ========================================

/**
 * 将ModuleMetadata转换回Manifest格式（用于兼容性）
 */
export function convertModuleToManifest(
    moduleMetadata: ModuleMetadata
): LegacyManifest {
    return {
        name: moduleMetadata.name,
        displayName: moduleMetadata.displayName,
        description: moduleMetadata.description,
        version: moduleMetadata.version,
        author: moduleMetadata.author,
        abpStyle: moduleMetadata.abpStyle,
        order: moduleMetadata.order,
        dependsOn: moduleMetadata.dependsOn,
        routes: convertRoutesReverse(moduleMetadata.routes),
        stores: convertStoresReverse(moduleMetadata.stores),
        policies: moduleMetadata.policies,
        lifecycle: convertLifecycleReverse(moduleMetadata.lifecycle),
        features: moduleMetadata.features as any,
        menuConfig: moduleMetadata.menuConfig as any
    }
}

function convertRoutesReverse(routes: RouteMetadata[]): LegacyRoute[] {
    return routes.map(route => ({
        name: route.name,
        path: route.path,
        component: route.component || '',
        meta: route.meta
    }))
}

function convertStoresReverse(stores: StoreMetadata[]): LegacyStore[] {
    return stores.map(store => ({
        symbol: `use${store.name.charAt(0).toUpperCase() + store.name.slice(1)}Store`,
        id: store.name,
        modulePath: '@/' + store.name
    }))
}

function convertLifecycleReverse(
    lifecycle: ModuleMetadata['lifecycle'] | undefined
): LegacyLifecycle | undefined {
    if (!lifecycle) return undefined

    // lifecycle is Record<string, string> but we need to be safe
    const lifecycleObj = lifecycle as Record<string, string>

    return {
        init: lifecycleObj.onMounted,
        beforeMount: lifecycleObj.onBeforeMount,
        mounted: lifecycleObj.onMounted
    }
}

// ========================================
// 工具函数
// ========================================

/**
 * 检查是否为有效的Manifest
 */
export function isValidManifest(obj: any): obj is LegacyManifest {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.name === 'string' &&
        typeof obj.version === 'string' &&
        typeof obj.abpStyle === 'boolean' &&
        typeof obj.order === 'number' &&
        Array.isArray(obj.dependsOn) &&
        Array.isArray(obj.routes) &&
        Array.isArray(obj.stores) &&
        Array.isArray(obj.policies)
    )
}

/**
 * 获取转换摘要
 */
export function getConversionSummary(
    manifest: LegacyManifest,
    moduleMetadata: ModuleMetadata
): string {
    return `
转换完成: ${manifest.name} → ${moduleMetadata.name}
  版本: ${manifest.version} → ${moduleMetadata.version}
  路由: ${manifest.routes.length}个
  Store: ${manifest.stores.length}个
  策略: ${manifest.policies.length}个
  依赖: ${manifest.dependsOn.length}个
`.trim()
}

