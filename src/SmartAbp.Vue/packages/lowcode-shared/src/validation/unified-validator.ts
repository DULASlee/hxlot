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
  validateEntityMetadata, 
  validateModuleMetadata,
  safeValidateEntityMetadata,
  safeValidateModuleMetadata,
  getEntityMetadataErrors,
  getModuleMetadataErrors
} from '@smartabp/metadata-core'

import type {
    UnifiedEntityDefinition,
    UnifiedModuleMetadata
} from '../types/unified-schema'

import {
    convertEntityToMetadataCore,
    convertModuleToMetadataCore,
    validateConversion
} from './metadata-adapter'

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
}

/**
 * 默认Feature Flag配置
 */
const DEFAULT_FEATURE_FLAGS: UnifiedValidationFeatureFlags = {
    enableMetadataCoreValidation: true,
    enableStrictValidation: false, // 渐进式启用
    enablePerformanceMonitoring: true,
    enableDetailedErrorReporting: true
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
 * 验证结果
 */
export interface ValidationResult<T = any> {
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
    async validateEntity(entity: UnifiedEntityDefinition): Promise<ValidationResult<UnifiedEntityDefinition>> {
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

            // 验证成功
            return this.createSuccessResult(entity, startTime, {
                fieldCount: entity.fields.length,
                ruleCount: entity.fields.reduce((sum, field) => sum + (field.validationRules?.length || 0), 0)
            })

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
    async validateModule(module: UnifiedModuleMetadata): Promise<ValidationResult<UnifiedModuleMetadata>> {
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
    async validateEntities(entities: UnifiedEntityDefinition[]): Promise<ValidationResult<UnifiedEntityDefinition[]>> {
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
   */
  private generateSuggestionFromZodError(error: any): string | undefined {
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
    ): ValidationResult<T> {
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
    ): ValidationResult<T> {
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
                let validationResult: ValidationResult

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
