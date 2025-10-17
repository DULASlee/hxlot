/**
 * @fileoverview useValidation - Vue3组合式API验证钩子
 * @description 提供企业级表单验证功能，集成UnifiedSchemaValidator
 * @version 1.0.0
 * @author SmartAbp Team
 */

import { computed, reactive, readonly } from 'vue'
// Phase 1D: 使用metadata.ts的类型
import type {
    UnifiedModuleMetadata
} from '../types/metadata'
// UnifiedEntityDefinition从metadata导出（如果需要）
import type { EntityMetadata as UnifiedEntityDefinition } from '../types/metadata'
import {
    UnifiedSchemaValidator,
    type UnifiedValidationFeatureFlags,
    type UnifiedValidationResult,
    type ValidationError
} from '../validation/unified-validator.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 验证状态接口
 */
export interface ValidationState {
    /** 是否正在验证 */
    isValidating: boolean
    /** 是否有错误 */
    hasErrors: boolean
    /** 是否有警告 */
    hasWarnings: boolean
    /** 错误列表 */
    errors: ValidationError[]
    /** 警告列表 */
    warnings: ValidationError[]
    /** 最后验证时间 */
    lastValidated: Date | null
    /** 验证性能指标 */
    performance: {
        duration: number
        cacheHits: number
        totalValidations: number
    }
}

/**
 * 验证选项接口
 */
export interface ValidationOptions {
    /** 防抖延迟（毫秒） */
    debounceMs?: number
    /** 是否启用缓存 */
    enableCache?: boolean
    /** 缓存过期时间（毫秒） */
    cacheExpiry?: number
    /** 是否实时验证 */
    realtime?: boolean
    /** 验证模式 */
    mode?: 'strict' | 'standard' | 'lenient'
    /** Feature flags */
    featureFlags?: Partial<UnifiedValidationFeatureFlags>
}

/**
 * 验证结果缓存项
 */
interface ValidationCacheItem {
    result: UnifiedValidationResult
    timestamp: number
    hash: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ 核心组合式API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * useValidation - 企业级验证组合式API
 *
 * @description 提供完整的验证功能，包括：
 * - 实时验证与防抖
 * - 验证结果缓存
 * - 性能监控
 * - 错误恢复
 * - Feature flag支持
 *
 * @param options 验证选项
 * @returns 验证状态和方法
 *
 * @example
 * ```typescript
 * const {
 *   validationState,
 *   validateEntity,
 *   validateModule,
 *   clearErrors,
 *   resetValidation
 * } = useValidation({
 *   debounceMs: 300,
 *   enableCache: true,
 *   realtime: true
 * })
 * ```
 */
export function useValidation(options: ValidationOptions = {}) {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔧 配置与初始化
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const {
        debounceMs = 300,
        enableCache = true,
        cacheExpiry = 5 * 60 * 1000, // 5分钟
        featureFlags = {}
    } = options

    // 验证器实例
    const validator = new UnifiedSchemaValidator()

    // 设置feature flags（如果验证器支持）
    if (Object.keys(featureFlags).length > 0) {
        // 临时注释，等待UnifiedSchemaValidator实现setFeatureFlags方法
        // validator.setFeatureFlags(featureFlags)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 响应式状态
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const validationState = reactive<ValidationState>({
        isValidating: false,
        hasErrors: false,
        hasWarnings: false,
        errors: [],
        warnings: [],
        lastValidated: null,
        performance: {
            duration: 0,
            cacheHits: 0,
            totalValidations: 0
        }
    })

    // 验证缓存
    const validationCache = new Map<string, ValidationCacheItem>()

    // 防抖定时器
    let debounceTimer: NodeJS.Timeout | null = null

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🛠️ 工具函数
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 生成对象哈希值（简单实现）
     */
    function generateHash(obj: any): string {
        return btoa(JSON.stringify(obj)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
    }

    /**
     * 检查缓存是否有效
     */
    function isCacheValid(cacheItem: ValidationCacheItem): boolean {
        return Date.now() - cacheItem.timestamp < cacheExpiry
    }

    /**
     * 清理过期缓存
     */
    function cleanExpiredCache(): void {
        const now = Date.now()
        for (const [key, item] of validationCache.entries()) {
            if (now - item.timestamp >= cacheExpiry) {
                validationCache.delete(key)
            }
        }
    }

    /**
     * 更新验证状态
     */
    function updateValidationState(result: UnifiedValidationResult): void {
        validationState.hasErrors = !result.success
        validationState.hasWarnings = result.warnings.length > 0
        validationState.errors = result.errors
        validationState.warnings = result.warnings
        validationState.lastValidated = new Date()
        validationState.performance.duration = result.performance?.duration || 0
        validationState.performance.totalValidations++
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 核心验证方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 验证实体定义
     *
     * @param entity 实体定义
     * @param immediate 是否立即验证（跳过防抖）
     * @returns Promise<UnifiedValidationResult>
     */
    async function validateEntity(
        entity: UnifiedEntityDefinition,
        immediate: boolean = false
    ): Promise<UnifiedValidationResult> {
        return new Promise((resolve) => {
            const performValidation = async () => {
                validationState.isValidating = true

                try {
                    // 生成缓存键
                    const cacheKey = `entity_${generateHash(entity)}`

                    // 检查缓存
                    if (enableCache && validationCache.has(cacheKey)) {
                        const cached = validationCache.get(cacheKey)!
                        if (isCacheValid(cached)) {
                            validationState.performance.cacheHits++
                            updateValidationState(cached.result)
                            validationState.isValidating = false
                            resolve(cached.result)
                            return
                        }
                    }

                    // 执行验证
                    const startTime = Date.now()
                    const result = await validator.validateEntity(entity)
                    const duration = Date.now() - startTime

                    // 更新性能指标
                    result.performance = {
                        duration,
                        startTime: startTime,
                        endTime: Date.now(),
                        fieldCount: entity.fields?.length || 0,
                        ruleCount: entity.validationRules?.length || 0
                    }

                    // 缓存结果
                    if (enableCache) {
                        cleanExpiredCache() // 清理过期缓存
                        validationCache.set(cacheKey, {
                            result,
                            timestamp: Date.now(),
                            hash: generateHash(entity)
                        })
                    }

                    // 更新状态
                    updateValidationState(result)
                    resolve(result)

                } catch (error) {
                    console.error('Entity validation failed:', error)
                    const errorResult: UnifiedValidationResult = {
                        success: false,
                        errors: [{
                            path: 'root',
                            message: error instanceof Error ? error.message : 'Unknown validation error',
                            code: 'VALIDATION_ERROR'
                        }],
                        warnings: [],
                        performance: {
                            duration: 0,
                            startTime: Date.now(),
                            endTime: Date.now(),
                            fieldCount: 0,
                            ruleCount: 0
                        }
                    }
                    updateValidationState(errorResult)
                    resolve(errorResult)
                } finally {
                    validationState.isValidating = false
                }
            }

            // 防抖处理
            if (!immediate && debounceMs > 0) {
                if (debounceTimer) {
                    clearTimeout(debounceTimer)
                }
                debounceTimer = setTimeout(performValidation, debounceMs)
            } else {
                performValidation()
            }
        })
    }

    /**
     * 验证模块定义
     *
     * @param module 模块定义
     * @param immediate 是否立即验证（跳过防抖）
     * @returns Promise<UnifiedValidationResult>
     */
    async function validateModule(
        module: UnifiedModuleMetadata,
        immediate: boolean = false
    ): Promise<UnifiedValidationResult> {
        return new Promise((resolve) => {
            const performValidation = async () => {
                validationState.isValidating = true

                try {
                    // 生成缓存键
                    const cacheKey = `module_${generateHash(module)}`

                    // 检查缓存
                    if (enableCache && validationCache.has(cacheKey)) {
                        const cached = validationCache.get(cacheKey)!
                        if (isCacheValid(cached)) {
                            validationState.performance.cacheHits++
                            updateValidationState(cached.result)
                            validationState.isValidating = false
                            resolve(cached.result)
                            return
                        }
                    }

                    // 执行验证
                    const startTime = Date.now()
                    const result = await validator.validateModule(module)
                    const duration = Date.now() - startTime

                    // 更新性能指标
                    result.performance = {
                        duration,
                        startTime: startTime,
                        endTime: Date.now(),
                        fieldCount: module.entities?.reduce((sum, entity) => sum + (entity.fields?.length || 0), 0) || 0,
                        ruleCount: module.entities?.reduce((sum, entity) => sum + (entity.validationRules?.length || 0), 0) || 0
                    }

                    // 缓存结果
                    if (enableCache) {
                        cleanExpiredCache() // 清理过期缓存
                        validationCache.set(cacheKey, {
                            result,
                            timestamp: Date.now(),
                            hash: generateHash(module)
                        })
                    }

                    // 更新状态
                    updateValidationState(result)
                    resolve(result)

                } catch (error) {
                    console.error('Module validation failed:', error)
                    const errorResult: UnifiedValidationResult = {
                        success: false,
                        errors: [{
                            path: 'root',
                            message: error instanceof Error ? error.message : 'Unknown validation error',
                            code: 'VALIDATION_ERROR'
                        }],
                        warnings: [],
                        performance: {
                            duration: 0,
                            startTime: Date.now(),
                            endTime: Date.now(),
                            fieldCount: 0,
                            ruleCount: 0
                        }
                    }
                    updateValidationState(errorResult)
                    resolve(errorResult)
                } finally {
                    validationState.isValidating = false
                }
            }

            // 防抖处理
            if (!immediate && debounceMs > 0) {
                if (debounceTimer) {
                    clearTimeout(debounceTimer)
                }
                debounceTimer = setTimeout(performValidation, debounceMs)
            } else {
                performValidation()
            }
        })
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧹 辅助方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 清除所有错误和警告
     */
    function clearErrors(): void {
        validationState.hasErrors = false
        validationState.hasWarnings = false
        validationState.errors = []
        validationState.warnings = []
    }

    /**
     * 重置验证状态
     */
    function resetValidation(): void {
        clearErrors()
        validationState.isValidating = false
        validationState.lastValidated = null
        validationState.performance = {
            duration: 0,
            cacheHits: 0,
            totalValidations: 0
        }
        validationCache.clear()

        if (debounceTimer) {
            clearTimeout(debounceTimer)
            debounceTimer = null
        }
    }

    /**
     * 清除验证缓存
     */
    function clearCache(): void {
        validationCache.clear()
        validationState.performance.cacheHits = 0
    }

    /**
     * 获取缓存统计信息
     */
    function getCacheStats() {
        return {
            size: validationCache.size,
            hitRate: validationState.performance.totalValidations > 0
                ? (validationState.performance.cacheHits / validationState.performance.totalValidations * 100).toFixed(2) + '%'
                : '0%'
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 计算属性
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * 是否验证通过
     */
    const isValid = computed(() => !validationState.hasErrors)

    /**
     * 错误数量
     */
    const errorCount = computed(() => validationState.errors.length)

    /**
     * 警告数量
     */
    const warningCount = computed(() => validationState.warnings.length)

    /**
     * 验证摘要
     */
    const validationSummary = computed(() => ({
        isValid: isValid.value,
        errorCount: errorCount.value,
        warningCount: warningCount.value,
        lastValidated: validationState.lastValidated,
        performance: validationState.performance
    }))

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔄 生命周期清理
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // 组件卸载时清理资源
    function cleanup(): void {
        resetValidation()
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📤 返回API
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    return {
        // 响应式状态
        validationState: readonly(validationState),

        // 计算属性
        isValid,
        errorCount,
        warningCount,
        validationSummary,

        // 验证方法
        validateEntity,
        validateModule,

        // 辅助方法
        clearErrors,
        resetValidation,
        clearCache,
        getCacheStats,
        cleanup
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 便捷导出
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 导出类型已在上面定义，无需重复导出

/**
 * 默认验证选项
 */
export const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
    debounceMs: 300,
    enableCache: true,
    cacheExpiry: 5 * 60 * 1000,
    realtime: true,
    mode: 'standard'
}
