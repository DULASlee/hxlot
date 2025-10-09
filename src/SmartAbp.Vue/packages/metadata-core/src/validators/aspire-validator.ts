/**
 * Aspire微服务方案元数据验证器
 * 基于Zod实现类型安全验证
 */

import { z } from 'zod'
import type { AspireSolutionMetadata } from '@smartabp/lowcode-shared'
import { aspireErrorMap, formatErrorMessage } from './error-map'

// ========================================
// Zod Schema定义
// ========================================

/**
 * 端点元数据Schema
 */
const EndpointMetadataSchema = z.object({
    path: z.string().min(1, '端点路径不能为空'),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    description: z.string().optional()
})

/**
 * 微服务元数据Schema
 */
const MicroserviceMetadataSchema = z.object({
    name: z.string()
        .min(1, '微服务名称不能为空')
        .regex(/^[A-Z][a-zA-Z0-9]*$/, '微服务名称必须是PascalCase格式'),
    displayName: z.string().optional(),
    port: z.number().int().min(1, '端口号必须在1-65535之间').max(65535, '端口号必须在1-65535之间'),
    type: z.enum(['WebApi', 'gRPC', 'Worker', 'Gateway']),
    description: z.string().optional(),
    dependencies: z.array(z.string()).default([]),
    endpoints: z.array(EndpointMetadataSchema).optional()
})

/**
 * 数据库配置Schema
 */
const DatabaseConfigSchema = z.object({
    type: z.enum(['PostgreSQL', 'MySQL', 'SqlServer', 'MongoDB']),
    connectionString: z.string().optional()
}).optional()

/**
 * 缓存配置Schema
 */
const CacheConfigSchema = z.object({
    type: z.enum(['Redis', 'MemoryCache']),
    connectionString: z.string().optional()
}).optional()

/**
 * 消息队列配置Schema
 */
const MessageQueueConfigSchema = z.object({
    type: z.enum(['RabbitMQ', 'Kafka', 'AzureServiceBus']),
    connectionString: z.string().optional()
}).optional()

/**
 * 基础设施配置Schema
 */
const InfrastructureConfigSchema = z.object({
    database: DatabaseConfigSchema,
    cache: CacheConfigSchema,
    messageQueue: MessageQueueConfigSchema
})

/**
 * 可观测性配置Schema
 */
const ObservabilityConfigSchema = z.object({
    enableLogging: z.boolean(),
    enableMetrics: z.boolean(),
    enableTracing: z.boolean(),
    loggingProvider: z.enum(['Serilog', 'NLog']).optional(),
    metricsProvider: z.enum(['Prometheus', 'AppInsights']).optional(),
    tracingProvider: z.enum(['OpenTelemetry', 'AppInsights']).optional()
})

/**
 * 安全配置Schema
 */
const SecurityConfigSchema = z.object({
    enableAuthentication: z.boolean(),
    enableAuthorization: z.boolean(),
    authProvider: z.enum(['IdentityServer', 'AzureAD', 'JWT']).optional()
}).optional()

/**
 * Aspire方案元数据Schema
 */
export const AspireSolutionMetadataSchema = z.object({
    schemaVersion: z.string().default('1.0.0'),
    solutionName: z.string()
        .min(1, '解决方案名称不能为空')
        .regex(/^[A-Z][a-zA-Z0-9.]*$/, '解决方案名称必须是PascalCase格式（首字母大写）'),
    rootNamespace: z.string()
        .min(1, '根命名空间不能为空')
        .regex(/^[A-Z][a-zA-Z0-9.]*$/, '根命名空间必须是PascalCase格式（首字母大写）'),
    description: z.string().optional(),
    microservices: z.array(MicroserviceMetadataSchema).default([]),
    includeApiGateway: z.boolean(),
    infrastructure: InfrastructureConfigSchema,
    observability: ObservabilityConfigSchema,
    security: SecurityConfigSchema
}).superRefine((data, ctx) => {
    // ========================================
    // 高级验证：跨字段验证
    // ========================================

    // 1. 检查微服务名称重复
    if (data.microservices.length > 0) {
        const serviceNames = data.microservices.map(s => s.name)
        const duplicateServices = serviceNames.filter((name, index) => 
            serviceNames.indexOf(name) !== index
        )
        if (duplicateServices.length > 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `微服务名称不能重复: ${duplicateServices[0]}`,
                path: ['microservices']
            })
        }

        // 2. 检查端口号重复
        const ports = data.microservices.map(s => s.port)
        const duplicatePorts = ports.filter((port, index) => 
            ports.indexOf(port) !== index
        )
        if (duplicatePorts.length > 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `微服务端口号不能重复: ${duplicatePorts[0]}`,
                path: ['microservices']
            })
        }
    }
})

// ========================================
// 验证函数
// ========================================

/**
 * 验证Aspire方案元数据（同步，抛出异常）
 * @throws ZodError 验证失败时抛出
 */
export function validateAspireSolutionMetadata(data: unknown): AspireSolutionMetadata {
    return AspireSolutionMetadataSchema.parse(data) as AspireSolutionMetadata
}

/**
 * 安全验证Aspire方案元数据（同步，返回结果对象）
 * @returns 验证结果对象
 */
export function safeValidateAspireSolutionMetadata(data: unknown) {
    return AspireSolutionMetadataSchema.safeParse(data)
}

/**
 * 获取格式化的验证错误信息
 */
export function getAspireSolutionMetadataErrors(data: unknown): string[] {
    const result = AspireSolutionMetadataSchema.safeParse(data, { errorMap: aspireErrorMap })

    if (result.success) {
        return []
    }

    return result.error.issues.map(err => {
        const path = err.path.length > 0 ? err.path.join('.') : ''
        return formatErrorMessage(path, err.message)
    })
}

/**
 * 验证Aspire方案元数据（异步，支持复杂验证）
 * @returns true表示验证通过，抛出异常表示验证失败
 */
export async function validateAspireSolutionMetadataAsync(
    data: unknown
): Promise<boolean> {
    // 基础验证
    const result = AspireSolutionMetadataSchema.safeParse(data)

    if (!result.success) {
        throw result.error
    }

    // 可扩展：添加异步验证逻辑
    // 例如：检查微服务依赖关系是否有效
    // for (const service of result.data.microservices) {
    //   for (const dep of service.dependencies) {
    //     const exists = result.data.microservices.some(s => s.name === dep)
    //     if (!exists) throw new Error(`微服务${service.name}依赖的${dep}不存在`)
    //   }
    // }

    return true
}

