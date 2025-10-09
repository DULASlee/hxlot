/**
 * 🔥 SmartAbp Unified Schema Validator
 * 
 * 基于metadata-core的统一Schema验证器
 * 采用装饰器模式 + 适配器模式 + Feature Flag
 * 
 * @version 1.0.0
 * @author SmartAbp架构团队
 * @date 2025-10-06
 */

// 🔥 启用真实的metadata-core验证
import {
    getEntityMetadataErrors,
    getModuleMetadataErrors,
    safeValidateEntityMetadata,
    safeValidateModuleMetadata,
    validateEntityMetadata,
    validateModuleMetadata
} from '@smartabp/metadata-core'

// 🔥 阶段2：版本管理和兼容性检查
import {
    compareVersions,
    CURRENT_SCHEMA_VERSION,
    findUpgradePath as getUpgradePath,
    isCompatibleVersion as isCompatible,
    parseVersion
} from '@smartabp/metadata-core'

import {
    type CompatibilityResult
} from '@smartabp/metadata-core'

// 🔥 阶段3：Schema差异对比
import {
    diffEntitySchema,
    generateChangelog,
    generateDiffSummary,
    type SchemaDiff
} from '@smartabp/metadata-core'

import type {
    UnifiedEntityDefinition,
    UnifiedModuleMetadata
} from '@smartabp/lowcode-shared'

import {
    convertEntityToMetadataCore,
    convertModuleToMetadataCore,
    validateConversion
} from './metadata-adapter'

// 🔥 阶段4：国际化错误信息
import {
    extractZodErrorParams,
    getMessageKeyFromZodError,
    translateValidationMessage
} from '../i18n/validation-i18n.js'

// ============================================================================
// Feature Flag 控制
// ============================================================================

/**
 * 验证功能开关配置
 */
export interface UnifiedValidationFeatureFlags {
    /** 是否启用metadata-core验证 */
    enableMetadataCoreValidation: boolean
    /** 是否启用严格模式验证 */
    enableStrictValidation: boolean
    /** 是否启用性能监控 */
    enablePerformanceMonitoring: boolean
    /** 是否启用详细错误报告 */
    enableDetailedErrorReporting: boolean
    /** 🔥 阶段2：是否启用版本兼容性检查 */
    enableVersionCompatibilityCheck?: boolean
    /** 🔥 阶段2：是否启用自动版本迁移建议 */
    enableAutoMigrationSuggestions?: boolean

    /** 🔥 阶段3：是否启用Schema差异对比 */
    enableSchemaDiffComparison?: boolean
    /** 是否启用变更日志生成 */
    enableChangelogGeneration?: boolean
    /** 是否启用破坏性变更检测 */
    enableBreakingChangeDetection?: boolean

    /** 🔥 阶段4：是否启用国际化错误消息 */
    enableI18nErrorMessages?: boolean
}

/**
 * 默认Feature Flag配置
 */
const DEFAULT_FEATURE_FLAGS: UnifiedValidationFeatureFlags = {
    enableMetadataCoreValidation: true,
    enableStrictValidation: false, // 渐进式启用
    enablePerformanceMonitoring: true,
    enableDetailedErrorReporting: true,
    enableVersionCompatibilityCheck: true, // 🔥 阶段2：默认启用版本检查
    enableAutoMigrationSuggestions: true,  // 🔥 阶段2：默认启用迁移建议
    enableSchemaDiffComparison: true,      // 🔥 阶段3：默认启用差异对比
    enableChangelogGeneration: true,       // 🔥 阶段3：默认启用变更日志
    enableBreakingChangeDetection: true,   // 🔥 阶段3：默认启用破坏性变更检测
    enableI18nErrorMessages: true          // 🔥 阶段4：默认启用国际化错误消息
}

/**
 * 全局Feature Flag实例
 */
let globalFeatureFlags: UnifiedValidationFeatureFlags = { ...DEFAULT_FEATURE_FLAGS }

/**
 * 设置Feature Flag
 */
export function setValidationFeatureFlags(flags: Partial<UnifiedValidationFeatureFlags>) {
    globalFeatureFlags = { ...globalFeatureFlags, ...flags }
}

/**
 * 获取Feature Flag
 */
export function getValidationFeatureFlags(): UnifiedValidationFeatureFlags {
    return { ...globalFeatureFlags }
}

// ============================================================================
// 验证结果类型定义
// ============================================================================

/**
 * 统一验证结果
 */
export interface UnifiedValidationResult<T = any> {
    /** 验证是否成功 */
    success: boolean
    /** 验证后的数据（如果成功） */
    data?: T
    /** 错误信息列表 */
    errors: ValidationError[]
    /** 警告信息列表 */
    warnings: ValidationWarning[]
    /** 性能统计 */
    performance?: ValidationPerformance
    /** 原始数据（用于调试） */
    originalData?: any
}

/**
 * 验证错误
 */
export interface ValidationError {
    /** 错误代码 */
    code: string
    /** 错误消息 */
    message: string
    /** 错误路径 */
    path?: string
    /** 错误详情 */
    details?: any
    /** 修复建议 */
    suggestion?: string
}

/**
 * 验证警告
 */
export interface ValidationWarning {
    /** 警告代码 */
    code: string
    /** 警告消息 */
    message: string
    /** 警告路径 */
    path?: string
    /** 改进建议 */
    suggestion?: string
}

/**
 * 性能统计
 */
export interface ValidationPerformance {
    /** 开始时间 */
    startTime: number
    /** 结束时间 */
    endTime: number
    /** 耗时（毫秒） */
    duration: number
    /** 验证的字段数量 */
    fieldCount: number
    /** 验证的规则数量 */
    ruleCount: number
}

// ============================================================================
// 自定义错误类
// ============================================================================

/**
 * Schema验证错误
 */
export class SchemaValidationError extends Error {
    public readonly errors: ValidationError[]
    public readonly warnings: ValidationWarning[]

    constructor(message: string, errors: ValidationError[], warnings: ValidationWarning[] = []) {
        super(message)
        this.name = 'SchemaValidationError'
        this.errors = errors
        this.warnings = warnings
    }

    /**
     * 获取格式化的错误信息
     */
    getFormattedMessage(): string {
        const errorMessages = this.errors.map(err => `- ${err.message}`).join('\n')
        const warningMessages = this.warnings.map(warn => `- ${warn.message}`).join('\n')

        let message = `Schema Validation Failed:\n${errorMessages}`
        if (warningMessages) {
            message += `\n\nWarnings:\n${warningMessages}`
        }

        return message
    }
}

// ============================================================================
// 核心验证器类
// ============================================================================

/**
 * 统一Schema验证器
 */
export class UnifiedSchemaValidator {
    private featureFlags: UnifiedValidationFeatureFlags

    constructor(featureFlags?: Partial<UnifiedValidationFeatureFlags>) {
        this.featureFlags = { ...globalFeatureFlags, ...featureFlags }
    }

    /**
     * 验证实体定义
     */
    async validateEntity(entity: UnifiedEntityDefinition): Promise<UnifiedValidationResult<UnifiedEntityDefinition>> {
        const startTime = performance.now()

        try {
            // Feature Flag检查
            if (!this.featureFlags.enableMetadataCoreValidation) {
                return this.createSuccessResult(entity, startTime)
            }

            // 转换为metadata-core格式
            const metadataEntity = convertEntityToMetadataCore(entity)

            // 验证转换是否成功
            if (!validateConversion(entity, metadataEntity)) {
                return this.createErrorResult(
                    [{ code: 'CONVERSION_FAILED', message: 'Failed to convert entity to metadata-core format' }],
                    startTime,
                    entity
                )
            }

            // 🔥 执行metadata-core真实验证
            if (this.featureFlags.enableStrictValidation) {
                // 严格模式：抛出异常
                try {
                    validateEntityMetadata(metadataEntity)
                } catch (error) {
                    // 验证失败，获取详细错误
                    const zodErrors = getEntityMetadataErrors(metadataEntity)
                    const errors = this.convertZodErrors(zodErrors)
                    return this.createErrorResult(errors, startTime, entity)
                }
            } else {
                // 安全模式：返回结果
                const validationResult = safeValidateEntityMetadata(metadataEntity)

                if (!validationResult.success) {
                    const errors = this.convertZodErrors(validationResult.error?.errors || [])
                    return this.createErrorResult(errors, startTime, entity)
                }
            }

            // 🔥 阶段2：版本兼容性检查
            const warnings: ValidationWarning[] = []
            if (this.featureFlags.enableVersionCompatibilityCheck) {
                const versionCheck = this.checkSchemaVersion(entity.schemaVersion || '1.0.0')
                if (versionCheck.warnings.length > 0) {
                    warnings.push(...versionCheck.warnings.map(w => ({
                        code: 'VERSION_WARNING',
                        message: w,
                        path: 'schemaVersion'
                    })))
                }
            }

            // 验证成功
            return this.createSuccessResult(entity, startTime, {
                fieldCount: entity.fields.length,
                ruleCount: entity.fields.reduce((sum, field) => sum + (field.validationRules?.length || 0), 0)
            }, warnings)

        } catch (error) {
            return this.createErrorResult(
                [{
                    code: 'VALIDATION_EXCEPTION',
                    message: error instanceof Error ? error.message : 'Unknown validation error',
                    details: error
                }],
                startTime,
                entity
            )
        }
    }

    /**
     * 验证模块定义
     */
    async validateModule(module: UnifiedModuleMetadata): Promise<UnifiedValidationResult<UnifiedModuleMetadata>> {
        const startTime = performance.now()

        try {
            // Feature Flag检查
            if (!this.featureFlags.enableMetadataCoreValidation) {
                return this.createSuccessResult(module, startTime)
            }

            // 转换为metadata-core格式
            const metadataModule = convertModuleToMetadataCore(module)

            // 🔥 执行metadata-core真实验证
            if (this.featureFlags.enableStrictValidation) {
                // 严格模式：抛出异常
                try {
                    validateModuleMetadata(metadataModule)
                } catch (error) {
                    // 验证失败，获取详细错误
                    const zodErrors = getModuleMetadataErrors(metadataModule)
                    const errors = this.convertZodErrors(zodErrors)
                    return this.createErrorResult(errors, startTime, module)
                }
            } else {
                // 安全模式：返回结果
                const validationResult = safeValidateModuleMetadata(metadataModule)

                if (!validationResult.success) {
                    const errors = this.convertZodErrors(validationResult.error?.errors || [])
                    return this.createErrorResult(errors, startTime, module)
                }
            }

            // 验证成功
            return this.createSuccessResult(module, startTime, {
                fieldCount: module.entities.reduce((sum, entity) => sum + entity.fields.length, 0),
                ruleCount: module.entities.reduce((sum, entity) =>
                    sum + entity.fields.reduce((fieldSum, field) => fieldSum + (field.validationRules?.length || 0), 0), 0)
            })

        } catch (error) {
            return this.createErrorResult(
                [{
                    code: 'VALIDATION_EXCEPTION',
                    message: error instanceof Error ? error.message : 'Unknown validation error',
                    details: error
                }],
                startTime,
                module
            )
        }
    }

    /**
     * 批量验证实体
     */
    async validateEntities(entities: UnifiedEntityDefinition[]): Promise<UnifiedValidationResult<UnifiedEntityDefinition[]>> {
        const startTime = performance.now()
        const results = await Promise.all(entities.map(entity => this.validateEntity(entity)))

        const errors: ValidationError[] = []
        const warnings: ValidationWarning[] = []
        const validEntities: UnifiedEntityDefinition[] = []

        results.forEach((result, index) => {
            if (result.success && result.data) {
                validEntities.push(result.data)
            } else {
                errors.push(...result.errors.map(err => ({
                    ...err,
                    path: `entities[${index}].${err.path || ''}`
                })))
            }
            warnings.push(...result.warnings)
        })

        if (errors.length > 0) {
            return this.createErrorResult(errors, startTime, entities, warnings)
        }

        return this.createSuccessResult(validEntities, startTime, {
            fieldCount: validEntities.reduce((sum, entity) => sum + entity.fields.length, 0),
            ruleCount: validEntities.reduce((sum, entity) =>
                sum + entity.fields.reduce((fieldSum, field) => fieldSum + (field.validationRules?.length || 0), 0), 0)
        }, warnings)
    }

    // ============================================================================
    // Zod错误转换（真实验证）
    // ============================================================================

    /**
     * 转换Zod错误为ValidationError格式
     */
    private convertZodErrors(zodErrors: any[]): ValidationError[] {
        return zodErrors.map(error => ({
            code: error.code || 'VALIDATION_ERROR',
            message: error.message || 'Validation failed',
            path: Array.isArray(error.path) ? error.path.join('.') : error.path || 'unknown',
            details: error,
            suggestion: this.generateSuggestionFromZodError(error)
        }))
    }

    /**
     * 从Zod错误生成修复建议
     * 🔥 阶段4：集成国际化错误消息
     */
    private generateSuggestionFromZodError(error: any): string | undefined {
        // 🔥 如果启用国际化，使用翻译后的消息
        if (this.featureFlags.enableI18nErrorMessages) {
            const messageKey = getMessageKeyFromZodError(error)
            if (messageKey) {
                const params = extractZodErrorParams(error)
                return translateValidationMessage(messageKey, params)
            }
        }

        // 降级：使用英文默认消息
        const errorCode = error.code

        if (errorCode === 'invalid_type') {
            return `Expected type: ${error.expected}, received: ${error.received}`
        }

        if (errorCode === 'too_small') {
            if (error.type === 'string') {
                return `String length must be at least ${error.minimum} characters`
            }
            if (error.type === 'number') {
                return `Value must be at least ${error.minimum}`
            }
            if (error.type === 'array') {
                return `Array must contain at least ${error.minimum} items`
            }
        }

        if (errorCode === 'too_big') {
            if (error.type === 'string') {
                return `String length must not exceed ${error.maximum} characters`
            }
            if (error.type === 'number') {
                return `Value must not exceed ${error.maximum}`
            }
            if (error.type === 'array') {
                return `Array must not contain more than ${error.maximum} items`
            }
        }

        if (errorCode === 'invalid_string') {
            if (error.validation === 'email') {
                return 'Please enter a valid email address'
            }
            if (error.validation === 'url') {
                return 'Please enter a valid URL'
            }
            if (error.validation === 'regex') {
                return 'Value does not match the required pattern'
            }
        }

        if (errorCode === 'invalid_enum_value') {
            return `Value must be one of: ${error.options?.join(', ')}`
        }

        return undefined
    }

    // ============================================================================
    // 🔥 阶段2：版本管理和兼容性检查方法
    // ============================================================================

    /**
     * 检查Schema版本
     */
    private checkSchemaVersion(version: string): {
        isValid: boolean
        warnings: string[]
        suggestions: string[]
    } {
        const warnings: string[] = []
        const suggestions: string[] = []

        try {
            parseVersion(version) // 验证版本格式
            parseVersion(CURRENT_SCHEMA_VERSION) // 验证当前版本格式

            // 版本兼容性检查
            if (!isCompatible(version, CURRENT_SCHEMA_VERSION)) {
                warnings.push(
                    `Schema version ${version} may not be fully compatible with current version ${CURRENT_SCHEMA_VERSION}`
                )

                // 生成迁移建议
                if (this.featureFlags.enableAutoMigrationSuggestions) {
                    const upgradePath = getUpgradePath(version, CURRENT_SCHEMA_VERSION)
                    if (upgradePath && upgradePath.length > 0) {
                        suggestions.push(
                            `Suggested upgrade path: ${upgradePath.map(p => `${p.from} -> ${p.to}`).join(', ')}`
                        )
                    }
                }
            }

            // 检查是否是旧版本
            const comparison = compareVersions(version, CURRENT_SCHEMA_VERSION)
            if (comparison < 0) {
                warnings.push(
                    `Schema version ${version} is older than current version ${CURRENT_SCHEMA_VERSION}. Consider upgrading.`
                )
            } else if (comparison > 0) {
                warnings.push(
                    `Schema version ${version} is newer than current version ${CURRENT_SCHEMA_VERSION}. Some features may not be supported.`
                )
            }

            return { isValid: true, warnings, suggestions }
        } catch (error) {
            return {
                isValid: false,
                warnings: [`Invalid schema version format: ${version}`],
                suggestions: [`Use semantic versioning (e.g., 1.0.0)`]
            }
        }
    }

    /**
     * 检查实体兼容性（用于更新场景）
     * 
     * 🔥 阶段3增强：集成Schema差异对比
     */
    checkEntityCompatibility(
        oldEntity: UnifiedEntityDefinition,
        newEntity: UnifiedEntityDefinition
    ): CompatibilityResult & { diff?: SchemaDiff } {
        // 版本兼容性检查
        const versionCheck = this.checkSchemaVersion(newEntity.schemaVersion || '1.0.0')

        // 🔥 Schema差异对比
        let diff: SchemaDiff | undefined
        const breakingChanges: any[] = []
        const warnings: any[] = []

        if (this.featureFlags.enableSchemaDiffComparison) {
            try {
                // 转换为metadata-core格式
                const oldMetadata = convertEntityToMetadataCore(oldEntity)
                const newMetadata = convertEntityToMetadataCore(newEntity)

                // 执行差异对比
                diff = diffEntitySchema(oldMetadata, newMetadata)

                // 分析差异，识别破坏性变更
                diff.removals.forEach(removal => {
                    // 删除必填字段是破坏性变更
                    if (removal.path.includes('properties.') && removal.oldValue?.isRequired) {
                        breakingChanges.push({
                            type: 'FIELD_REMOVED' as const,
                            field: removal.path,
                            message: `删除必填字段 '${removal.path}'`,
                            oldValue: removal.oldValue,
                            suggestion: '保留该字段或提供迁移脚本'
                        })
                    }
                })

                diff.modifications.forEach(modification => {
                    // 类型变更是破坏性变更
                    if (modification.path.includes('.type')) {
                        breakingChanges.push({
                            type: 'TYPE_CHANGED' as const,
                            field: modification.path,
                            message: `字段类型变更: ${modification.oldValue} -> ${modification.newValue}`,
                            oldValue: modification.oldValue,
                            newValue: modification.newValue,
                            suggestion: '保持类型兼容或提供数据迁移'
                        })
                    }

                    // 必填性增强是破坏性变更
                    if (modification.path.includes('.isRequired') &&
                        !modification.oldValue && modification.newValue) {
                        breakingChanges.push({
                            type: 'FIELD_REQUIRED' as const,
                            field: modification.path.replace('.isRequired', ''),
                            message: `字段变为必填`,
                            suggestion: '提供默认值或迁移脚本'
                        })
                    }
                })

                // 添加变更提示到警告
                if (diff.hasChanges) {
                    warnings.push({
                        type: 'SCHEMA_CHANGED' as const,
                        field: 'schema',
                        message: `Schema发生变更: ${generateDiffSummary(diff)}`,
                        suggestion: '请审查变更日志'
                    })
                }

            } catch (error) {
                console.warn('Schema差异对比失败:', error)
            }
        }

        // 合并版本检查的警告
        warnings.push(...versionCheck.warnings.map(w => ({
            type: 'VERSION_WARNING' as const,
            field: 'schemaVersion',
            message: w,
            suggestion: versionCheck.suggestions[0]
        })))

        return {
            isCompatible: versionCheck.isValid && breakingChanges.length === 0,
            breakingChanges,
            warnings,
            suggestions: [...versionCheck.suggestions],
            diff
        }
    }

    /**
     * 检查模块兼容性（用于更新场景）
     * 
     * 注意：由于类型系统的复杂性，此方法暂时不使用metadata-core的兼容性检查
     * 而是基于版本号进行简单的兼容性判断
     */
    checkModuleCompatibility(
        _oldModule: UnifiedModuleMetadata,
        newModule: UnifiedModuleMetadata
    ): CompatibilityResult {
        // 简化实现：基于版本号的兼容性检查
        const isCompatible = this.checkSchemaVersion(newModule.schemaVersion || '1.0.0')

        return {
            isCompatible: isCompatible.isValid,
            breakingChanges: [],
            warnings: isCompatible.warnings.map(w => ({
                type: 'FIELD_DEPRECATED' as const,
                field: 'schemaVersion',
                message: w,
                suggestion: isCompatible.suggestions[0]
            })),
            suggestions: isCompatible.suggestions
        }
    }

    // ============================================================================
    // 🔥 阶段3：Schema差异分析与变更日志生成
    // ============================================================================

    /**
     * 生成实体变更日志
     * 
     * @param oldEntity 旧实体定义
     * @param newEntity 新实体定义
     * @param version 版本号
     * @returns Markdown格式的变更日志
     */
    generateEntityChangelog(
        oldEntity: UnifiedEntityDefinition,
        newEntity: UnifiedEntityDefinition,
        version?: string
    ): string {
        if (!this.featureFlags.enableChangelogGeneration) {
            return '变更日志生成功能未启用'
        }

        try {
            const oldMetadata = convertEntityToMetadataCore(oldEntity)
            const newMetadata = convertEntityToMetadataCore(newEntity)
            const diff = diffEntitySchema(oldMetadata, newMetadata)

            const changelogVersion = version || newEntity.schemaVersion || newEntity.version || '1.0.0'
            return generateChangelog(diff, changelogVersion)
        } catch (error) {
            console.error('生成变更日志失败:', error)
            return `生成变更日志失败: ${error}`
        }
    }

    /**
     * 获取Schema差异摘要
     * 
     * @param oldEntity 旧实体定义
     * @param newEntity 新实体定义
     * @returns 差异摘要文本
     */
    getSchemaDiffSummary(
        oldEntity: UnifiedEntityDefinition,
        newEntity: UnifiedEntityDefinition
    ): string {
        if (!this.featureFlags.enableSchemaDiffComparison) {
            return '差异对比功能未启用'
        }

        try {
            const oldMetadata = convertEntityToMetadataCore(oldEntity)
            const newMetadata = convertEntityToMetadataCore(newEntity)
            const diff = diffEntitySchema(oldMetadata, newMetadata)

            return generateDiffSummary(diff)
        } catch (error) {
            console.error('获取差异摘要失败:', error)
            return '差异分析失败'
        }
    }

    /**
     * 检测破坏性变更
     * 
     * @param oldEntity 旧实体定义
     * @param newEntity 新实体定义
     * @returns 破坏性变更列表
     */
    detectBreakingChanges(
        oldEntity: UnifiedEntityDefinition,
        newEntity: UnifiedEntityDefinition
    ): any[] {
        if (!this.featureFlags.enableBreakingChangeDetection) {
            return []
        }

        const compatibilityResult = this.checkEntityCompatibility(oldEntity, newEntity)
        return compatibilityResult.breakingChanges || []
    }

    // ============================================================================
    // 私有辅助方法
    // ============================================================================

    /**
     * 创建成功结果
     */
    private createSuccessResult<T>(
        data: T,
        startTime: number,
        additionalStats?: Partial<ValidationPerformance>,
        warnings: ValidationWarning[] = []
    ): UnifiedValidationResult<T> {
        const endTime = performance.now()

        return {
            success: true,
            data,
            errors: [],
            warnings,
            performance: this.featureFlags.enablePerformanceMonitoring ? {
                startTime,
                endTime,
                duration: endTime - startTime,
                fieldCount: 0,
                ruleCount: 0,
                ...additionalStats
            } : undefined
        }
    }

    /**
     * 创建错误结果
     */
    private createErrorResult<T>(
        errors: ValidationError[],
        startTime: number,
        originalData?: T,
        warnings: ValidationWarning[] = []
    ): UnifiedValidationResult<T> {
        const endTime = performance.now()

        return {
            success: false,
            errors,
            warnings,
            performance: this.featureFlags.enablePerformanceMonitoring ? {
                startTime,
                endTime,
                duration: endTime - startTime,
                fieldCount: 0,
                ruleCount: 0
            } : undefined,
            originalData: this.featureFlags.enableDetailedErrorReporting ? originalData : undefined
        }
    }

}

// ============================================================================
// 验证装饰器
// ============================================================================

/**
 * Schema验证装饰器
 */
export function ValidateSchema(options?: {
    strict?: boolean
    skipOnFeatureDisabled?: boolean
}) {
    return function (_target: any, _propertyName: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value

        descriptor.value = async function (...args: any[]) {
            const schema = args[0]

            // 创建验证器实例
            const validator = new UnifiedSchemaValidator({
                enableStrictValidation: options?.strict || false
            })

            try {
                // 根据Schema类型选择验证方法
                let validationResult: UnifiedValidationResult

                if (schema && typeof schema === 'object') {
                    if ('entities' in schema) {
                        // 模块验证
                        validationResult = await validator.validateModule(schema as UnifiedModuleMetadata)
                    } else if ('fields' in schema) {
                        // 实体验证
                        validationResult = await validator.validateEntity(schema as UnifiedEntityDefinition)
                    } else {
                        // 跳过验证
                        return originalMethod.apply(this, args)
                    }

                    if (!validationResult.success) {
                        throw new SchemaValidationError(
                            'Schema validation failed',
                            validationResult.errors,
                            validationResult.warnings
                        )
                    }
                }

                // 验证通过，执行原方法
                return originalMethod.apply(this, args)

            } catch (error) {
                if (options?.skipOnFeatureDisabled && !globalFeatureFlags.enableMetadataCoreValidation) {
                    // Feature被禁用时跳过验证
                    return originalMethod.apply(this, args)
                }
                throw error
            }
        }

        return descriptor
    }
}

// ============================================================================
// 便捷函数导出
// ============================================================================

/**
 * 全局验证器实例
 */
const globalValidator = new UnifiedSchemaValidator()

/**
 * 验证实体（便捷函数）
 */
export const validateUnifiedEntity = (entity: UnifiedEntityDefinition) =>
    globalValidator.validateEntity(entity)

/**
 * 验证模块（便捷函数）
 */
export const validateUnifiedModule = (module: UnifiedModuleMetadata) =>
    globalValidator.validateModule(module)

/**
 * 批量验证实体（便捷函数）
 */
export const validateUnifiedEntities = (entities: UnifiedEntityDefinition[]) =>
    globalValidator.validateEntities(entities)

/**
 * 获取实体验证错误（便捷函数）
 */
export async function getUnifiedEntityErrors(entity: UnifiedEntityDefinition): Promise<ValidationError[]> {
    const result = await validateUnifiedEntity(entity)
    return result.errors
}

// ============================================================================
// 导出所有类型和类（避免重复导出）
// ============================================================================

// 类型已在上面定义时导出，这里不需要重复导出
