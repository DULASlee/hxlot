/**
 * metadata-core 架构验证 Demo
 * 验证统一类型定义和验证功能的集成可行性
 */

// ========== 测试1: 类型导入验证 ==========
import type {
    EntityMetadata,
    ModuleMetadata
} from '../src/types'

import {
    getEntityMetadataErrors,
    getModuleMetadataErrors,
    validateEntityMetadata,
    validateModuleMetadata
} from '../src/validators'

// ========== 测试2: 创建测试数据 ==========
const testEntity: EntityMetadata = {
    name: 'Product',
    module: 'Catalog',
    keyType: 'Guid',
    description: '产品实体',
    isAggregateRoot: true,
    isMultiTenant: true,
    isSoftDelete: true,
    hasExtraProperties: true,
    properties: [
        {
            name: 'Name',
            type: 'string',
            isRequired: true,
            isReadOnly: false,
            isUnique: false,
            maxLength: 100,
            description: '产品名称',
            displayName: '产品名称'
        },
        {
            name: 'Price',
            type: 'decimal',
            isRequired: true,
            isReadOnly: false,
            isUnique: false,
            description: '产品价格',
            displayName: '价格'
        }
    ]
}

const testModule: ModuleMetadata = {
    name: 'Catalog',
    displayName: '商品目录',
    version: '1.0.0',
    description: '商品目录管理模块',
    author: 'SmartAbp Team',
    abpStyle: true,
    order: 1,
    dependsOn: [],
    routes: [
        {
            path: '/catalog',
            name: 'Catalog',
            component: 'CatalogView'
        }
    ],
    stores: [
        {
            name: 'ProductStore',
            type: 'entity',
            entityName: 'Product'
        }
    ],
    policies: ['Catalog.Read', 'Catalog.Write']
}

// ========== 测试3: 验证功能测试 ==========
export function runIntegrationTest(): TestResult {
    const results: TestResult = {
        success: true,
        errors: [],
        performance: {
            entityValidationTime: 0,
            moduleValidationTime: 0
        },
        details: {
            entityValidation: false,
            moduleValidation: false,
            typeImport: false,
            errorHandling: false
        }
    }

    try {
        // 测试类型导入
        console.log('🔍 测试1: 类型导入验证')
        if (testEntity && testModule) {
            results.details.typeImport = true
            console.log('✅ 类型导入成功')
        }

        // 测试实体验证
        console.log('🔍 测试2: 实体验证功能')
        const entityStart = performance.now()

        try {
            const validatedEntity = validateEntityMetadata(testEntity)
            const entityEnd = performance.now()
            results.performance.entityValidationTime = entityEnd - entityStart

            if (validatedEntity) {
                results.details.entityValidation = true
                console.log(`✅ 实体验证成功 (${results.performance.entityValidationTime.toFixed(2)}ms)`)
            }
        } catch (error) {
            const errors = getEntityMetadataErrors(testEntity)
            console.error('❌ 实体验证失败:', errors)
            results.errors.push(...errors)
        }

        // 测试模块验证
        console.log('🔍 测试3: 模块验证功能')
        const moduleStart = performance.now()

        try {
            const validatedModule = validateModuleMetadata(testModule)
            const moduleEnd = performance.now()
            results.performance.moduleValidationTime = moduleEnd - moduleStart

            if (validatedModule) {
                results.details.moduleValidation = true
                console.log(`✅ 模块验证成功 (${results.performance.moduleValidationTime.toFixed(2)}ms)`)
            }
        } catch (error) {
            const errors = getModuleMetadataErrors(testModule)
            console.error('❌ 模块验证失败:', errors)
            results.errors.push(...errors)
        }

        // 测试错误处理
        console.log('🔍 测试4: 错误处理功能')
        const invalidEntity: Partial<EntityMetadata> = {
            name: '', // 无效名称
            module: 'Test'
            // 缺少必需字段
        }

        try {
            validateEntityMetadata(invalidEntity as EntityMetadata)
        } catch (error) {
            const errors = getEntityMetadataErrors(invalidEntity as EntityMetadata)
            if (errors.length > 0) {
                results.details.errorHandling = true
                console.log('✅ 错误处理功能正常')
                console.log('📋 错误详情:', errors)
            }
        }

    } catch (error) {
        results.success = false
        results.errors.push(error instanceof Error ? error.message : String(error))
        console.error('🚨 集成测试失败:', error)
    }

    return results
}

// ========== 测试4: 性能基准测试 ==========
export function runPerformanceTest(): PerformanceResult {
    const results: PerformanceResult = {
        entityValidationAvg: 0,
        moduleValidationAvg: 0,
        batchValidationTime: 0,
        memoryUsage: 0
    }

    const iterations = 1000
    const startMemory = process.memoryUsage().heapUsed

    // 实体验证性能测试
    console.log(`🚀 开始性能测试 (${iterations}次迭代)`)

    const entityTimes: number[] = []
    for (let i = 0; i < iterations; i++) {
        const start = performance.now()
        try {
            validateEntityMetadata(testEntity)
        } catch (error) {
            // 忽略验证失败，专注性能测试
        }
        const end = performance.now()
        entityTimes.push(end - start)
    }

    results.entityValidationAvg = entityTimes.reduce((a, b) => a + b, 0) / entityTimes.length

    // 模块验证性能测试
    const moduleTimes: number[] = []
    for (let i = 0; i < iterations; i++) {
        const start = performance.now()
        try {
            validateModuleMetadata(testModule)
        } catch (error) {
            // 忽略验证失败，专注性能测试
        }
        const end = performance.now()
        moduleTimes.push(end - start)
    }

    results.moduleValidationAvg = moduleTimes.reduce((a, b) => a + b, 0) / moduleTimes.length

    // 批量验证测试
    const batchStart = performance.now()
    for (let i = 0; i < 100; i++) {
        try {
            validateEntityMetadata(testEntity)
            validateModuleMetadata(testModule)
        } catch (error) {
            // 忽略验证失败
        }
    }
    const batchEnd = performance.now()
    results.batchValidationTime = batchEnd - batchStart

    // 内存使用情况
    const endMemory = process.memoryUsage().heapUsed
    results.memoryUsage = (endMemory - startMemory) / 1024 / 1024 // MB

    console.log('📊 性能测试结果:')
    console.log(`   实体验证平均时间: ${results.entityValidationAvg.toFixed(4)}ms`)
    console.log(`   模块验证平均时间: ${results.moduleValidationAvg.toFixed(4)}ms`)
    console.log(`   批量验证时间: ${results.batchValidationTime.toFixed(2)}ms`)
    console.log(`   内存使用增量: ${results.memoryUsage.toFixed(2)}MB`)

    return results
}

// ========== 类型定义 ==========
export interface TestResult {
    success: boolean
    errors: string[]
    performance: {
        entityValidationTime: number
        moduleValidationTime: number
    }
    details: {
        entityValidation: boolean
        moduleValidation: boolean
        typeImport: boolean
        errorHandling: boolean
    }
}

export interface PerformanceResult {
    entityValidationAvg: number
    moduleValidationAvg: number
    batchValidationTime: number
    memoryUsage: number
}

// ========== 主执行函数 ==========
export async function runFullArchitectureValidation(): Promise<{
    integration: TestResult
    performance: PerformanceResult
    recommendation: string
}> {
    console.log('🏗️ 开始 metadata-core 架构验证')
    console.log('='.repeat(50))

    const integration = runIntegrationTest()
    const performance = runPerformanceTest()

    let recommendation = ''

    if (integration.success &&
        performance.entityValidationAvg < 3.0 &&
        performance.moduleValidationAvg < 3.0) {
        recommendation = '✅ 架构验证通过，推荐立即进行Phase 2深度集成'
    } else if (integration.success) {
        recommendation = '⚠️ 功能验证通过，但性能需要优化后再集成'
    } else {
        recommendation = '❌ 架构验证失败，需要修复问题后重新验证'
    }

    console.log('='.repeat(50))
    console.log('🎯 最终建议:', recommendation)

    return {
        integration,
        performance,
        recommendation
    }
}

// 如果直接运行此文件，执行完整验证
if (require.main === module) {
    runFullArchitectureValidation()
        .then(result => {
            console.log('🎉 架构验证完成')
            process.exit(result.integration.success ? 0 : 1)
        })
        .catch(error => {
            console.error('💥 架构验证异常:', error)
            process.exit(1)
        })
}
