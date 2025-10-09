/**
 * @smartabp/metadata-core
 * 实体验证器单元测试
 * 
 * 测试覆盖：
 * - 基础验证（10个用例）
 * - 属性验证（10个用例）
 * - 导航属性验证（8个用例）
 * - 跨字段验证（7个用例）
 * - 边界条件测试（5个用例）
 * 
 * 总计：40个测试用例
 */

import { describe, expect, it } from 'vitest'
import type { EntityMetadata } from '@smartabp/lowcode-shared/types'
import {
    EntityMetadataSchema,
    getEntityMetadataErrors,
    safeValidateEntityMetadata,
    validateEntityMetadata,
    validateEntityMetadataAsync
} from './validators/entity-validator'

// ========================================
// 测试数据工厂
// ========================================

/**
 * 创建有效的实体元数据
 */
function createValidEntity(overrides?: Partial<EntityMetadata>): EntityMetadata {
    return {
        name: 'Book',
        module: 'Library',
        keyType: 'Guid',
        isAggregateRoot: true,
        isMultiTenant: true,
        isSoftDelete: true,
        hasExtraProperties: true,
        properties: [
            {
                name: 'title',
                type: 'string',
                isRequired: true,
                isReadOnly: false,
                isUnique: false,
                maxLength: 200,
                displayName: '标题'
            },
            {
                name: 'author',
                type: 'string',
                isRequired: true,
                isReadOnly: false,
                isUnique: false,
                maxLength: 100,
                displayName: '作者'
            }
        ],
        ...overrides
    }
}

// ========================================
// 基础验证测试（10个用例）
// ========================================

describe('EntityValidator - 基础验证', () => {
    it('1.1 应该接受完整有效的实体元数据', () => {
        const entity = createValidEntity()
        const result = EntityMetadataSchema.safeParse(entity)

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.name).toBe('Book')
            expect(result.data.properties).toHaveLength(2)
        }
    })

    it('1.2 应该拒绝缺少name的实体', () => {
        const entity = createValidEntity()
        delete (entity as any).name

        const errors = getEntityMetadataErrors(entity)
        expect(errors).toContain('实体名称不能为空')
    })

    it('1.3 应该拒绝name不是PascalCase的实体', () => {
        const entity = createValidEntity({ name: 'book' })

        const errors = getEntityMetadataErrors(entity)
        expect(errors).toContain('实体名称必须是PascalCase格式（首字母大写）')
    })

    it('1.4 应该拒绝缺少module的实体', () => {
        const entity = createValidEntity()
        delete (entity as any).module

        const errors = getEntityMetadataErrors(entity)
        expect(errors).toContain('模块名称不能为空')
    })

    it('1.5 应该拒绝无效的keyType', () => {
        const entity = createValidEntity({ keyType: 'invalid' as any })

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(false)
    })

    it('1.6 应该接受所有有效的keyType', () => {
        const keyTypes: Array<'Guid' | 'int' | 'long' | 'string'> = ['Guid', 'int', 'long', 'string']

        keyTypes.forEach(keyType => {
            const entity = createValidEntity({ keyType })
            const result = EntityMetadataSchema.safeParse(entity)
            expect(result.success).toBe(true)
        })
    })

    it('1.7 应该接受可选的schemaVersion', () => {
        const entity = createValidEntity({ schemaVersion: '1.0.0' })
        const result = EntityMetadataSchema.safeParse(entity)

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.schemaVersion).toBe('1.0.0')
        }
    })

    it('1.8 应该接受可选的description', () => {
        const entity = createValidEntity({ description: '图书实体' })
        const result = EntityMetadataSchema.safeParse(entity)

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.description).toBe('图书实体')
        }
    })

    it('1.9 应该接受可选的aggregate', () => {
        const entity = createValidEntity({ aggregate: 'LibraryAggregate' })
        const result = EntityMetadataSchema.safeParse(entity)

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.aggregate).toBe('LibraryAggregate')
        }
    })

    it('1.10 应该正确设置所有布尔标志', () => {
        const entity = createValidEntity({
            isAggregateRoot: false,
            isMultiTenant: false,
            isSoftDelete: false,
            hasExtraProperties: false
        })
        const result = EntityMetadataSchema.safeParse(entity)

        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.isAggregateRoot).toBe(false)
            expect(result.data.isMultiTenant).toBe(false)
            expect(result.data.isSoftDelete).toBe(false)
            expect(result.data.hasExtraProperties).toBe(false)
        }
    })
})

// ========================================
// 属性验证测试（10个用例）
// ========================================

describe('EntityValidator - 属性验证', () => {
    it('2.1 应该拒绝空的properties数组', () => {
        const entity = createValidEntity({ properties: [] })

        const errors = getEntityMetadataErrors(entity)
        expect(errors).toContain('实体必须至少有一个属性')
    })

    it('2.2 应该接受单个属性', () => {
        const entity = createValidEntity({
            properties: [
                { name: 'id', type: 'Guid', isRequired: true, isReadOnly: false, isUnique: true }
            ]
        })

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
    })

    it('2.3 应该拒绝属性name不是camelCase', () => {
        const entity = createValidEntity({
            properties: [
                { name: 'Title', type: 'string', isRequired: true, isReadOnly: false, isUnique: false }
            ]
        })

        const errors = getEntityMetadataErrors(entity)
        expect(errors.some(e => e.includes('camelCase'))).toBe(true)
    })

    it('2.4 应该接受所有有效的属性类型', () => {
        const validTypes = ['string', 'int', 'long', 'decimal', 'double', 'bool', 'DateTime', 'Guid']

        validTypes.forEach(type => {
            const entity = createValidEntity({
                properties: [
                    { name: 'testProp', type, isRequired: false, isReadOnly: false, isUnique: false }
                ]
            })
            const result = EntityMetadataSchema.safeParse(entity)
            expect(result.success).toBe(true)
        })
    })

    it('2.5 应该验证maxLength对string类型的合理性', () => {
        const entity = createValidEntity({
            properties: [
                { name: 'title', type: 'string', isRequired: true, isReadOnly: false, isUnique: false, maxLength: 10001 }
            ]
        })

        const errors = getEntityMetadataErrors(entity)
        expect(errors.some(e => e.includes('maxLength'))).toBe(true)
    })

    it('2.6 应该验证minLength不能大于maxLength', () => {
        const entity = createValidEntity({
            properties: [
                {
                    name: 'title',
                    type: 'string',
                    isRequired: true,
                    isReadOnly: false,
                    isUnique: false,
                    minLength: 100,
                    maxLength: 50
                }
            ]
        })

        const errors = getEntityMetadataErrors(entity)
        expect(errors.some(e => e.includes('minLength') && e.includes('maxLength'))).toBe(true)
    })

    it('2.7 应该接受有效的数值范围', () => {
        const entity = createValidEntity({
            properties: [
                {
                    name: 'age',
                    type: 'int',
                    isRequired: true,
                    isReadOnly: false,
                    isUnique: false,
                    minValue: 0,
                    maxValue: 150
                }
            ]
        })

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
    })

    it('2.8 应该拒绝minValue大于maxValue', () => {
        const entity = createValidEntity({
            properties: [
                {
                    name: 'age',
                    type: 'int',
                    isRequired: true,
                    isReadOnly: false,
                    isUnique: false,
                    minValue: 100,
                    maxValue: 50
                }
            ]
        })

        const errors = getEntityMetadataErrors(entity)
        expect(errors.some(e => e.includes('minValue') && e.includes('maxValue'))).toBe(true)
    })

    it('2.9 应该接受属性的可选字段', () => {
        const entity = createValidEntity({
            properties: [
                {
                    name: 'title',
                    type: 'string',
                    isRequired: true,
                    isReadOnly: false,
                    isUnique: false,
                    defaultValue: 'Untitled',
                    description: '图书标题',
                    displayName: '标题'
                }
            ]
        })

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.properties[0].defaultValue).toBe('Untitled')
            expect(result.data.properties[0].description).toBe('图书标题')
            expect(result.data.properties[0].displayName).toBe('标题')
        }
    })

    it('2.10 应该接受validationRules数组', () => {
        const entity = createValidEntity({
            properties: [
                {
                    name: 'email',
                    type: 'string',
                    isRequired: true,
                    isReadOnly: false,
                    isUnique: true,
                    validationRules: [
                        { name: 'email', condition: 'isEmail', errorMessage: '必须是有效的邮箱地址' }
                    ]
                }
            ]
        })

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.properties[0].validationRules).toHaveLength(1)
        }
    })
})

// ========================================
// 导航属性验证测试（8个用例）
// ========================================

describe('EntityValidator - 导航属性验证', () => {
    it('3.1 应该接受空的navigationProperties', () => {
        const entity = createValidEntity()
        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
    })

    it('3.2 应该接受有效的OneToOne关系', () => {
        const entity = createValidEntity({
            navigationProperties: [
                {
                    name: 'publisher',
                    targetEntity: 'Publisher',
                    relationType: 'OneToOne',
                    foreignKey: 'publisherId'
                }
            ]
        })

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
    })

    it('3.3 应该接受有效的OneToMany关系', () => {
        const entity = createValidEntity({
            navigationProperties: [
                {
                    name: 'chapters',
                    targetEntity: 'Chapter',
                    relationType: 'OneToMany',
                    inverseName: 'book'
                }
            ]
        })

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
    })

    it('3.4 应该接受有效的ManyToOne关系', () => {
        const entity = createValidEntity({
            navigationProperties: [
                {
                    name: 'category',
                    targetEntity: 'Category',
                    relationType: 'ManyToOne',
                    foreignKey: 'categoryId'
                }
            ]
        })

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
    })

    it('3.5 应该接受有效的ManyToMany关系', () => {
        const entity = createValidEntity({
            navigationProperties: [
                {
                    name: 'authors',
                    targetEntity: 'Author',
                    relationType: 'ManyToMany'
                }
            ]
        })

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
    })

    it('3.6 应该拒绝导航属性name不是camelCase', () => {
        const entity = createValidEntity({
            navigationProperties: [
                {
                    name: 'Publisher',
                    targetEntity: 'Publisher',
                    relationType: 'OneToOne'
                }
            ]
        })

        const errors = getEntityMetadataErrors(entity)
        expect(errors.some(e => e.includes('camelCase'))).toBe(true)
    })

    it('3.7 应该拒绝targetEntity不是PascalCase', () => {
        const entity = createValidEntity({
            navigationProperties: [
                {
                    name: 'publisher',
                    targetEntity: 'publisher',
                    relationType: 'OneToOne'
                }
            ]
        })

        const errors = getEntityMetadataErrors(entity)
        expect(errors.some(e => e.includes('PascalCase'))).toBe(true)
    })

    it('3.8 应该接受多个导航属性', () => {
        const entity = createValidEntity({
            navigationProperties: [
                { name: 'publisher', targetEntity: 'Publisher', relationType: 'ManyToOne' },
                { name: 'chapters', targetEntity: 'Chapter', relationType: 'OneToMany' },
                { name: 'authors', targetEntity: 'Author', relationType: 'ManyToMany' }
            ]
        })

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.navigationProperties).toHaveLength(3)
        }
    })
})

// ========================================
// 跨字段验证测试（7个用例）
// ========================================

describe('EntityValidator - 跨字段验证', () => {
    it('4.1 应该拒绝重复的属性名', () => {
        const entity = createValidEntity({
            properties: [
                { name: 'title', type: 'string', isRequired: true, isReadOnly: false, isUnique: false },
                { name: 'title', type: 'string', isRequired: false, isReadOnly: false, isUnique: false }
            ]
        })

        const errors = getEntityMetadataErrors(entity)
        expect(errors).toContain('属性名称不能重复: title')
    })

    it('4.2 应该拒绝属性名与导航属性名重复', () => {
        const entity = createValidEntity({
            properties: [
                { name: 'publisher', type: 'string', isRequired: true, isReadOnly: false, isUnique: false }
            ],
            navigationProperties: [
                { name: 'publisher', targetEntity: 'Publisher', relationType: 'ManyToOne' }
            ]
        })

        const errors = getEntityMetadataErrors(entity)
        expect(errors.some(e => e.includes('属性名称与导航属性名称重复'))).toBe(true)
    })

    it('4.3 应该拒绝重复的导航属性名', () => {
        const entity = createValidEntity({
            navigationProperties: [
                { name: 'chapters', targetEntity: 'Chapter', relationType: 'OneToMany' },
                { name: 'chapters', targetEntity: 'Chapter', relationType: 'OneToMany' }
            ]
        })

        const errors = getEntityMetadataErrors(entity)
        expect(errors.some(e => e.includes('导航属性名称不能重复'))).toBe(true)
    })

    it('4.4 应该允许不同类型的同名属性（不同实体）', () => {
        const entity1 = createValidEntity({ name: 'Book' })
        const entity2 = createValidEntity({ name: 'Author' })

        const result1 = EntityMetadataSchema.safeParse(entity1)
        const result2 = EntityMetadataSchema.safeParse(entity2)

        expect(result1.success).toBe(true)
        expect(result2.success).toBe(true)
    })

    it('4.5 应该验证foreignKey引用存在的属性', () => {
        const entity = createValidEntity({
            properties: [
                { name: 'id', type: 'Guid', isRequired: true, isReadOnly: false, isUnique: true }
            ],
            navigationProperties: [
                {
                    name: 'category',
                    targetEntity: 'Category',
                    relationType: 'ManyToOne',
                    foreignKey: 'categoryId'
                }
            ]
        })

        const errors = getEntityMetadataErrors(entity)
        expect(errors.some(e => e.includes('foreignKey') && e.includes('categoryId'))).toBe(true)
    })

    it('4.6 应该接受foreignKey引用存在的属性', () => {
        const entity = createValidEntity({
            properties: [
                { name: 'categoryId', type: 'Guid', isRequired: true, isReadOnly: false, isUnique: false }
            ],
            navigationProperties: [
                {
                    name: 'category',
                    targetEntity: 'Category',
                    relationType: 'ManyToOne',
                    foreignKey: 'categoryId'
                }
            ]
        })

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
    })

    it('4.7 应该接受aggregate在同一module内', () => {
        const entity = createValidEntity({
            name: 'Chapter',
            module: 'Library',
            aggregate: 'Book'
        })

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
    })
})

// ========================================
// 边界条件测试（5个用例）
// ========================================

describe('EntityValidator - 边界条件', () => {
    it('5.1 应该接受最小有效实体（仅必需字段）', () => {
        const entity: EntityMetadata = {
            name: 'MinEntity',
            module: 'Test',
            keyType: 'Guid',
            isAggregateRoot: true,
            isMultiTenant: false,
            isSoftDelete: false,
            hasExtraProperties: false,
            properties: [
                { name: 'id', type: 'Guid', isRequired: true, isReadOnly: true, isUnique: true }
            ]
        }

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
    })

    it('5.2 应该接受最大复杂实体（所有可选字段）', () => {
        const entity = createValidEntity({
            schemaVersion: '1.0.0',
            description: '复杂实体测试',
            aggregate: 'TestAggregate',
            properties: [
                {
                    name: 'complexProp',
                    type: 'string',
                    isRequired: true,
                    isReadOnly: false,
                    isUnique: true,
                    maxLength: 500,
                    minLength: 10,
                    defaultValue: 'default',
                    description: '复杂属性',
                    displayName: '复杂属性',
                    validationRules: [
                        { name: 'custom', condition: 'customValidator', errorMessage: '自定义验证失败' }
                    ]
                }
            ],
            navigationProperties: [
                {
                    name: 'related',
                    targetEntity: 'RelatedEntity',
                    relationType: 'ManyToOne',
                    foreignKey: 'relatedId',
                    inverseName: 'inverse'
                }
            ],
            xUiConfig: {
                listColumns: ['id', 'name'],
                formFields: ['name', 'description'],
                searchFields: ['name'],
                defaultSort: 'createdAt',
                pageSize: 20
            },
            xBackendConfig: {
                generateRepository: true,
                generateAppService: true,
                generateController: true,
                generateDto: true
            }
        })

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
    })

    it('5.3 应该处理大量属性（100个）', () => {
        const properties = Array.from({ length: 100 }, (_, i) => ({
            name: `prop${i}`,
            type: 'string',
            isRequired: false,
            isReadOnly: false,
            isUnique: false
        }))

        const entity = createValidEntity({ properties })
        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
    })

    it('5.4 应该处理极长的字符串值', () => {
        const longDescription = 'A'.repeat(5000)
        const entity = createValidEntity({ description: longDescription })

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(true)
    })

    it('5.5 应该拒绝null值在必需字段', () => {
        const entity = {
            name: null,
            module: 'Test',
            keyType: 'Guid',
            isAggregateRoot: true,
            isMultiTenant: false,
            isSoftDelete: false,
            hasExtraProperties: false,
            properties: []
        }

        const result = EntityMetadataSchema.safeParse(entity)
        expect(result.success).toBe(false)
    })
})

// ========================================
// 验证API测试
// ========================================

describe('EntityValidator - 验证API', () => {
    it('API.1 validateEntityMetadata应该抛出异常对于无效数据', () => {
        const entity = createValidEntity({ name: 'invalid' })

        expect(() => validateEntityMetadata(entity)).toThrow()
    })

    it('API.2 safeValidateEntityMetadata应该返回SafeParseReturnType', () => {
        const entity = createValidEntity()
        const result = safeValidateEntityMetadata(entity)

        expect(result.success).toBe(true)
        expect('data' in result).toBe(true)
    })

    it('API.3 getEntityMetadataErrors应该返回错误数组', () => {
        const entity = createValidEntity({ name: 'invalid' })
        const errors = getEntityMetadataErrors(entity)

        expect(Array.isArray(errors)).toBe(true)
        expect(errors.length).toBeGreaterThan(0)
    })

    it('API.4 validateEntityMetadataAsync应该支持异步验证', async () => {
        const entity = createValidEntity()
        const result = await validateEntityMetadataAsync(entity)

        expect(result).toBe(true)
    })

    it('API.5 validateEntityMetadataAsync应该拒绝无效数据', async () => {
        const entity = createValidEntity({ properties: [] })

        await expect(validateEntityMetadataAsync(entity)).rejects.toThrow()
    })
})

