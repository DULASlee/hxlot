/**
 * @smartabp/metadata-core/converters
 * Aspire Solution 转换器
 * 
 * 功能：
 * - 将后端AspireSolutionDefinition转换为前端AspireSolutionMetadata
 * - 自动映射基础设施配置
 * - 转换微服务定义
 * - 验证转换结果
 */

import type { AspireSolutionMetadata, MicroserviceMetadata } from '@smartabp/lowcode-shared/types'
import { validateAspireSolutionMetadata } from './validators/aspire-validator'

// ========================================
// 后端Aspire类型定义（简化版）
// ========================================

/**
 * 后端AspireSolutionDefinition（从AspireDefinitions.cs）
 */
export interface BackendAspireSolutionDefinition {
    solutionName: string
    rootNamespace: string
    description?: string
    microservices: BackendMicroserviceDefinition[]
    includeApiGateway: boolean
    databaseName: string

    // Infrastructure Services
    usePostgreSQL: boolean
    useRedis: boolean
    useRabbitMQ: boolean
    useElasticsearch: boolean
    useSeq: boolean
    useDapr: boolean
    useServiceMesh: boolean

    // Configuration
    developmentConfig?: any
    productionConfig?: any
    security?: any
    observability?: any
}

export interface BackendMicroserviceDefinition {
    name: string
    projectName: string
    displayName: string
    description?: string
    baseNamespace: string
    replicas: number
    useDapr: boolean
    useServiceDiscovery: boolean
    useHealthChecks: boolean

    // Dependencies
    dependsOn: string[]

    // Ports
    httpPort: number
    httpsPort?: number
    grpcPort?: number

    // Environment Variables
    environmentVariables?: Record<string, string>

    // Resource Limits
    cpuLimit?: string
    memoryLimit?: string
}

// ========================================
// 转换选项
// ========================================

export interface AspireConvertOptions {
    /**
     * 是否验证转换结果
     * @default true
     */
    validate?: boolean

    /**
     * 是否转换observability配置
     * @default true
     */
    includeObservability?: boolean

    /**
     * 默认副本数（如果后端未指定）
     * @default 1
     */
    defaultReplicas?: number
}

// ========================================
// 核心转换函数
// ========================================

/**
 * 将BackendAspireSolutionDefinition转换为AspireSolutionMetadata
 * 
 * @example
 * const backendDef = loadBackendDefinition()
 * const solutionMetadata = convertBackendAspireToMetadata(backendDef)
 */
export function convertBackendAspireToMetadata(
    backendDef: BackendAspireSolutionDefinition,
    options: AspireConvertOptions = {}
): AspireSolutionMetadata {
    const { validate = true, includeObservability = true, defaultReplicas = 1 } = options

    // 转换微服务
    const microservices = convertMicroservices(backendDef.microservices, defaultReplicas)

    // 转换基础设施
    const infrastructure = convertInfrastructure(backendDef)

    // 转换可观测性配置
    const observability: AspireSolutionMetadata['observability'] = includeObservability
        ? convertObservability(backendDef)
        : {
            enableLogging: false,
            enableMetrics: false,
            enableTracing: false
        }

    // 构建AspireSolutionMetadata
    const solutionMetadata: AspireSolutionMetadata = {
        solutionName: backendDef.solutionName,
        rootNamespace: backendDef.rootNamespace,
        description: backendDef.description,
        microservices,
        includeApiGateway: backendDef.includeApiGateway,
        infrastructure,
        observability
    }

    // 验证转换结果
    if (validate) {
        try {
            validateAspireSolutionMetadata(solutionMetadata)
        } catch (error) {
            throw new Error(
                `转换后的AspireSolutionMetadata验证失败: ${error instanceof Error ? error.message : String(error)}`
            )
        }
    }

    return solutionMetadata
}

// ========================================
// 微服务转换
// ========================================

/**
 * 转换微服务列表
 */
function convertMicroservices(
    backendMicroservices: BackendMicroserviceDefinition[],
    defaultReplicas: number
): MicroserviceMetadata[] {
    return backendMicroservices.map(service => convertMicroservice(service, defaultReplicas))
}

/**
 * 转换单个微服务
 */
function convertMicroservice(
    backendService: BackendMicroserviceDefinition,
    _defaultReplicas: number
): MicroserviceMetadata {
    const service: MicroserviceMetadata = {
        name: backendService.name,
        displayName: backendService.displayName,
        port: backendService.httpPort || 8080,
        type: inferServiceType(backendService.name), // 推断服务类型
        description: backendService.description,
        dependencies: backendService.dependsOn || []
    }

    // 端点配置（简化）
    if (backendService.httpPort || backendService.grpcPort) {
        service.endpoints = []

        if (backendService.httpPort) {
            service.endpoints.push({
                path: '/api',
                method: 'GET',
                description: 'HTTP API端点'
            })
        }

        if (backendService.grpcPort) {
            service.endpoints.push({
                path: '/grpc',
                method: 'POST',
                description: 'gRPC端点'
            })
        }
    }

    return service
}

/**
 * 推断服务类型
 */
function inferServiceType(
    serviceName: string
): 'WebApi' | 'gRPC' | 'Worker' | 'Gateway' {
    const lowerName = serviceName.toLowerCase()

    if (lowerName.includes('gateway')) {
        return 'Gateway'
    }

    if (lowerName.includes('worker') || lowerName.includes('job') || lowerName.includes('background')) {
        return 'Worker'
    }

    if (lowerName.includes('grpc')) {
        return 'gRPC'
    }

    // 默认为WebApi类型
    return 'WebApi'
}

// ========================================
// 基础设施转换
// ========================================

/**
 * 转换基础设施配置
 */
function convertInfrastructure(
    backendDef: BackendAspireSolutionDefinition
): AspireSolutionMetadata['infrastructure'] {
    const infrastructure: AspireSolutionMetadata['infrastructure'] = {}

    // PostgreSQL
    if (backendDef.usePostgreSQL) {
        infrastructure.database = {
            type: 'PostgreSQL',
            connectionString: `Host=localhost;Database=${backendDef.databaseName};Username=postgres;Password=postgres`
        }
    }

    // Redis
    if (backendDef.useRedis) {
        infrastructure.cache = {
            type: 'Redis',
            connectionString: 'localhost:6379'
        }
    }

    // RabbitMQ
    if (backendDef.useRabbitMQ) {
        infrastructure.messageQueue = {
            type: 'RabbitMQ',
            connectionString: 'amqp://guest:guest@localhost:5672'
        }
    }

    return infrastructure
}

// ========================================
// 可观测性转换
// ========================================

/**
 * 转换可观测性配置
 */
function convertObservability(
    backendDef: BackendAspireSolutionDefinition
): AspireSolutionMetadata['observability'] {
    const observability: AspireSolutionMetadata['observability'] = {
        enableLogging: backendDef.useSeq,
        enableMetrics: true,
        enableTracing: true,
        loggingProvider: backendDef.useSeq ? 'Serilog' : undefined,
        metricsProvider: 'Prometheus',
        tracingProvider: 'OpenTelemetry'
    }

    return observability
}

// ========================================
// 批量转换
// ========================================

/**
 * 批量转换多个Aspire解决方案
 */
export function convertBackendAspireSolutionsToMetadata(
    backendDefs: BackendAspireSolutionDefinition[],
    options: AspireConvertOptions = {}
): AspireSolutionMetadata[] {
    return backendDefs.map(def => convertBackendAspireToMetadata(def, options))
}

// ========================================
// 反向转换（AspireSolutionMetadata → BackendAspireSolutionDefinition）
// ========================================

/**
 * 将AspireSolutionMetadata转换回后端格式（用于兼容性）
 */
export function convertMetadataToBackendAspire(
    metadata: AspireSolutionMetadata
): BackendAspireSolutionDefinition {
    return {
        solutionName: metadata.solutionName,
        rootNamespace: metadata.solutionName.replace(/[^a-zA-Z0-9]/g, ''),
        description: metadata.description,
        microservices: convertMicroservicesReverse(metadata.microservices),
        includeApiGateway: metadata.microservices.some(s => s.name.toLowerCase().includes('gateway')),
        databaseName: 'AppDatabase',

        // Infrastructure
        usePostgreSQL: metadata.infrastructure?.database?.type === 'PostgreSQL',
        useRedis: !!metadata.infrastructure?.cache,
        useRabbitMQ: metadata.infrastructure?.messageQueue?.type === 'RabbitMQ',
        useElasticsearch: false, // 默认false
        useSeq: metadata.observability.loggingProvider === 'Serilog',
        useDapr: false,
        useServiceMesh: false
    }
}

/**
 * 反向转换微服务列表
 */
function convertMicroservicesReverse(
    microservices: MicroserviceMetadata[]
): BackendMicroserviceDefinition[] {
    return microservices.map(service => {
        return {
            name: service.name,
            projectName: service.name,
            displayName: service.displayName || service.name,
            description: service.description,
            baseNamespace: service.name.replace(/[^a-zA-Z0-9]/g, ''),
            replicas: 1,
            useDapr: false,
            useServiceDiscovery: true,
            useHealthChecks: true,
            dependsOn: service.dependencies || [],
            httpPort: service.port || 8080,
            httpsPort: undefined,
            grpcPort: service.type === 'gRPC' ? service.port + 1 : undefined,
            environmentVariables: undefined,
            cpuLimit: undefined,
            memoryLimit: undefined
        }
    })
}

// ========================================
// 工具函数
// ========================================

/**
 * 检查是否为有效的BackendAspireSolutionDefinition
 */
export function isValidBackendAspireDefinition(obj: any): obj is BackendAspireSolutionDefinition {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.solutionName === 'string' &&
        typeof obj.rootNamespace === 'string' &&
        Array.isArray(obj.microservices) &&
        typeof obj.includeApiGateway === 'boolean'
    )
}

/**
 * 获取转换摘要
 */
export function getAspireConversionSummary(
    backendDef: BackendAspireSolutionDefinition,
    metadata: AspireSolutionMetadata
): string {
    const infrastructureCount = Object.keys(metadata.infrastructure || {}).length
    const observabilityCount = Object.keys(metadata.observability || {}).length

    return `
转换完成: ${backendDef.solutionName}
  微服务: ${metadata.microservices.length}个
  基础设施: ${infrastructureCount}个组件
  可观测性: ${observabilityCount}个配置
  数据库: ${metadata.infrastructure?.database?.type || '未配置'}
  消息队列: ${metadata.infrastructure?.messageQueue?.type || '未配置'}
  缓存: ${metadata.infrastructure?.cache ? 'Redis' : '未配置'}
`.trim()
}

/**
 * 从解决方案中提取特定类型的微服务
 */
export function extractMicroservicesByType(
    metadata: AspireSolutionMetadata,
    type: MicroserviceMetadata['type']
): MicroserviceMetadata[] {
    return metadata.microservices.filter(service => service.type === type)
}

/**
 * 检查解决方案是否包含特定基础设施
 */
export function hasInfrastructure(
    metadata: AspireSolutionMetadata,
    infrastructureType: 'database' | 'cache' | 'messageQueue'
): boolean {
    return !!metadata.infrastructure?.[infrastructureType]
}

