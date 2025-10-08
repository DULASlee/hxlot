/**
 * Assembly Types - 装配件类型定义
 * 位置: @smartabp/lowcode-shared
 * 作用: 统一的装配件类型系统，供所有 package 和主应用使用
 */

/**
 * 依赖图结构
 */
export interface DependencyGraph {
    nodes: Map<string, DependencyNode>
    roots: string[]
    hasCycles: boolean
}

/**
 * 依赖节点
 */
export interface DependencyNode {
    id: string
    name: string
    type: string
    dependencies: string[]
    metadata?: Record<string, any>
}

/**
 * 依赖边
 */
export interface DependencyEdge {
    from: string
    to: string
    type: 'dependency' | 'composition' | 'aggregation'
    weight?: number
}

/**
 * 验证结果接口（先定义，被IAssemblyManager引用）
 */
export interface ValidationResult {
    isValid: boolean
    errors: string[]
    warnings: string[]
}

/**
 * 生成代码结果接口（先定义，被IAssemblyManager引用）
 */
export interface GeneratedCode {
    frontend: Record<string, string>
    backend: Record<string, string>
    metadata: Record<string, any>
}

/**
 * 装配件管理器接口
 */
export interface IAssemblyManager {
    registerPlugin(plugin: AssemblyPlugin): void
    unregisterPlugin(name: string): void
    getPlugin(name: string): AssemblyPlugin | undefined
    getAllPlugins(): AssemblyPlugin[]
    registerAssembly?(config: AssemblyConfig): void
    loadAssembly?(name: string): Promise<any>
    getAllAssemblyConfigs?(): AssemblyConfig[]
    validateAssembly(): ValidationResult
    generateCode(): GeneratedCode
    on(event: string, callback: (...args: any[]) => void): void
    emit(event: string, data?: any): void
    buildDependencyGraph(): DependencyGraph
}

/**
 * 装配件配置
 */
export interface AssemblyConfig {
    name: string
    version: string
    dependencies: string[]
    settings: Record<string, any>
    metadata?: Record<string, any>
}

/**
 * 装配件事件
 */
export interface AssemblyEvent {
    type: string
    data: any
    timestamp: Date
}

/**
 * 装配件插件接口
 */
export interface AssemblyPlugin {
    name: string
    version: string
    dependencies: string[]
    initialize?(): Promise<void>
    destroy?(): Promise<void>
    validate?(): ValidationResult
    generate?(): GeneratedCode
    install(manager: IAssemblyManager): void
    uninstall?(): void
}

/**
 * 装配验证结果（已被ValidationResult替代，保留向后兼容）
 */
export type AssemblyValidationResult = ValidationResult

/**
 * 验证错误
 */
export interface ValidationError {
    code: string
    message: string
    severity: 'error' | 'warning' | 'info'
    location?: {
        file: string
        line: number
        column: number
    }
}

/**
 * 验证警告
 */
export interface ValidationWarning {
    code: string
    message: string
    suggestion?: string
}

/**
 * 生成的代码
 */
export interface GeneratedCode {
    files: GeneratedFile[]
    metadata: Record<string, any>
}

/**
 * 生成的文件
 */
export interface GeneratedFile {
    path: string
    content: string
    type: 'typescript' | 'javascript' | 'vue' | 'css' | 'html'
}

/**
 * 依赖分析结果
 */
export interface DependencyAnalysis {
    totalAssemblies: number
    rootAssemblies: string[]
    leafAssemblies: string[]
    cyclicDependencies: boolean
    dependencyDepth: number
    assemblyDependencies: Record<string, string[]>
}

