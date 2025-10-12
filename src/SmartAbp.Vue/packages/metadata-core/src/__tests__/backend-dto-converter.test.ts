/**
 * 后端DTO转换器测试
 * 
 * 验证前端EntityMetadata和ModuleMetadata到后端DTO格式的转换功能
 */

import { describe, expect, it } from 'vitest'
import type { EntityMetadata, ModuleMetadata } from '../types/index.js'
import {
    getBackendConversionStats,
    toEntityMetadataDto,
    toModuleMetadataDto,
    toPropertyMetadataDto
} from './converters/backend-dto-converter'

describe('后端DTO转换器', () => {

    describe('toEntityMetadataDto', () => {
        it('应该正确转换基础实体元数据', () => {
            const entity: EntityMetadata = {
                name: 'Product',
                displayName: '产品',
                module: 'Catalog',
                keyType: 'Guid',
                isAggregateRoot: true,
                isMultiTenant: true,
                isSoftDelete: true,
                hasExtraProperties: true,
                properties: [
                    {
                        name: 'name',
                        type: 'string',
                        isRequired: true,
                        isReadOnly: false,
                        isUnique: false,
                        maxLength: 100,
                        displayName: '产品名称',
                        description: '产品的名称'
                    },
                    {
                        name: 'price',
                        type: 'decimal',
                        isRequired: true,
                        isReadOnly: false,
                        isUnique: false,
                        displayName: '价格',
                        description: '产品价格'
                    }
                ]
            }

            const dto = toEntityMetadataDto(entity)

            expect(dto.name).toBe('Product')
            expect(dto.displayName).toBe('产品')
            expect(dto.module).toBe('Catalog')
            expect(dto.keyType).toBe('Guid')
            expect(dto.namespace).toBe('Catalog.Products')
            expect(dto.tableName).toBe('Products')
            expect(dto.schema).toBe('dbo')
            expect(dto.primaryKey).toBe('Id')
            expect(dto.properties).toHaveLength(2)
            expect(dto.permissions).toContain('Catalog.Product.Read')
            expect(dto.permissions).toContain('Catalog.Product.Create')
            expect(dto.permissions).toContain('Catalog.Product.Update')
            expect(dto.permissions).toContain('Catalog.Product.Delete')
        })

        it('应该正确处理导航属性', () => {
            const entity: EntityMetadata = {
                name: 'Order',
                module: 'Sales',
                keyType: 'Guid',
                isAggregateRoot: true,
                isMultiTenant: true,
                isSoftDelete: true,
                hasExtraProperties: true,
                properties: [],
                navigationProperties: [
                    {
                        name: 'orderItems',
                        targetEntity: 'OrderItem',
                        relationType: 'OneToMany',
                        inverseName: 'order'
                    },
                    {
                        name: 'customer',
                        targetEntity: 'Customer',
                        relationType: 'ManyToOne',
                        foreignKey: 'CustomerId'
                    }
                ]
            }

            const dto = toEntityMetadataDto(entity)

            expect(dto.navigationProperties).toHaveLength(2)

            const orderItemsNav = dto.navigationProperties?.find(nav => nav.name === 'orderItems')
            expect(orderItemsNav?.isCollection).toBe(true)
            expect(orderItemsNav?.cascadeDelete).toBe(true)

            const customerNav = dto.navigationProperties?.find(nav => nav.name === 'customer')
            expect(customerNav?.isCollection).toBe(false)
            expect(customerNav?.foreignKey).toBe('CustomerId')
        })

        it('应该生成正确的审计字段', () => {
            const entity: EntityMetadata = {
                name: 'Product',
                module: 'Catalog',
                keyType: 'Guid',
                isAggregateRoot: true,
                isMultiTenant: true,
                isSoftDelete: true,
                hasExtraProperties: true,
                properties: []
            }

            const dto = toEntityMetadataDto(entity)

            expect(dto.auditFields).toBeDefined()
            expect(dto.auditFields?.some(field => field.type === 'CreationTime')).toBe(true)
            expect(dto.auditFields?.some(field => field.type === 'CreatorId')).toBe(true)
            expect(dto.auditFields?.some(field => field.type === 'IsDeleted')).toBe(true)
            expect(dto.auditFields?.some(field => field.type === 'DeletionTime')).toBe(true)
        })

        it('应该生成正确的索引', () => {
            const entity: EntityMetadata = {
                name: 'Product',
                module: 'Catalog',
                keyType: 'Guid',
                isAggregateRoot: true,
                isMultiTenant: true,
                isSoftDelete: true,
                hasExtraProperties: true,
                properties: [
                    {
                        name: 'code',
                        type: 'string',
                        isRequired: true,
                        isReadOnly: false,
                        isUnique: true,
                        maxLength: 50
                    }
                ]
            }

            const dto = toEntityMetadataDto(entity)

            expect(dto.indexes).toBeDefined()
            expect(dto.indexes?.some(index => index.name === 'IX_Product_code')).toBe(true)
            expect(dto.indexes?.some(index => index.name === 'IX_Product_TenantId')).toBe(true)
        })

        it('应该生成正确的约束', () => {
            const entity: EntityMetadata = {
                name: 'OrderItem',
                module: 'Sales',
                keyType: 'Guid',
                isAggregateRoot: false,
                isMultiTenant: true,
                isSoftDelete: false,
                hasExtraProperties: true,
                properties: [],
                navigationProperties: [
                    {
                        name: 'order',
                        targetEntity: 'Order',
                        relationType: 'ManyToOne',
                        foreignKey: 'OrderId'
                    }
                ]
            }

            const dto = toEntityMetadataDto(entity)

            expect(dto.constraints).toBeDefined()
            expect(dto.constraints?.some(constraint => constraint.type === 'PrimaryKey')).toBe(true)
            expect(dto.constraints?.some(constraint => constraint.type === 'ForeignKey')).toBe(true)

            const fkConstraint = dto.constraints?.find(c => c.type === 'ForeignKey')
            expect(fkConstraint?.columns).toContain('OrderId')
            expect(fkConstraint?.referencedTable).toBe('Orders')
        })
    })

    describe('toPropertyMetadataDto', () => {
        it('应该正确转换字符串属性', () => {
            const property = {
                name: 'name',
                type: 'string',
                isRequired: true,
                isReadOnly: false,
                isUnique: false,
                maxLength: 100,
                displayName: '名称'
            }

            const dto = toPropertyMetadataDto(property)

            expect(dto.name).toBe('name')
            expect(dto.clrType).toBe('string')
            expect(dto.dbType).toBe('nvarchar')
            expect(dto.isRequired).toBe(true)
            expect(dto.maxLength).toBe(100)
            expect(dto.columnName).toBe('name')
            expect(dto.attributes?.some(attr => attr.name === 'Required')).toBe(true)
            expect(dto.attributes?.some(attr => attr.name === 'MaxLength')).toBe(true)
        })

        it('应该正确转换数值属性', () => {
            const property = {
                name: 'price',
                type: 'decimal',
                isRequired: true,
                isReadOnly: false,
                isUnique: false,
                minValue: 0,
                maxValue: 999999
            }

            const dto = toPropertyMetadataDto(property)

            expect(dto.clrType).toBe('decimal')
            expect(dto.dbType).toBe('decimal(18,2)')
            expect(dto.precision).toBe(18)
            expect(dto.scale).toBe(2)
            expect(dto.minValue).toBe(0)
            expect(dto.maxValue).toBe(999999)
        })

        it('应该正确转换DateTime属性', () => {
            const property = {
                name: 'createdAt',
                type: 'DateTime',
                isRequired: true,
                isReadOnly: false,
                isUnique: false
            }

            const dto = toPropertyMetadataDto(property)

            expect(dto.clrType).toBe('DateTime')
            expect(dto.dbType).toBe('datetime2')
        })

        it('应该正确转换Guid属性', () => {
            const property = {
                name: 'id',
                type: 'Guid',
                isRequired: true,
                isReadOnly: false,
                isUnique: true
            }

            const dto = toPropertyMetadataDto(property)

            expect(dto.clrType).toBe('Guid')
            expect(dto.dbType).toBe('uniqueidentifier')
            expect(dto.isUnique).toBe(true)
        })
    })

    describe('toModuleMetadataDto', () => {
        it('应该正确转换模块元数据', () => {
            const module: ModuleMetadata = {
                name: 'Catalog',
                displayName: '产品目录',
                version: '1.0.0',
                description: '产品目录管理模块',
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
                policies: ['Catalog.Read', 'Catalog.Write'],
                features: {
                    EnableAdvancedSearch: true,
                    MaxProductsPerCategory: 100
                }
            }

            const dto = toModuleMetadataDto(module)

            expect(dto.name).toBe('Catalog')
            expect(dto.displayName).toBe('产品目录')
            expect(dto.namespace).toBe('Catalog')
            expect(dto.assemblyName).toBe('Catalog.dll')
            expect(dto.routes).toHaveLength(1)
            expect(dto.stores).toHaveLength(1)
            expect(dto.policies).toContain('Catalog.Read')
            expect(dto.permissions).toContain('Catalog.Read')
            expect(dto.permissions).toContain('Catalog.Manage')
            expect(dto.features).toHaveLength(2)

            const enableSearchFeature = dto.features?.find(f => f.name === 'EnableAdvancedSearch')
            expect(enableSearchFeature?.valueType).toBe('Boolean')
            expect(enableSearchFeature?.defaultValue).toBe('true')

            const maxProductsFeature = dto.features?.find(f => f.name === 'MaxProductsPerCategory')
            expect(maxProductsFeature?.valueType).toBe('Number')
            expect(maxProductsFeature?.defaultValue).toBe('100')
        })

        it('应该正确转换路由元数据', () => {
            const module: ModuleMetadata = {
                name: 'Sales',
                version: '1.0.0',
                abpStyle: true,
                order: 2,
                dependsOn: [],
                routes: [
                    {
                        path: '/orders',
                        name: 'Orders',
                        component: 'OrderListView',
                        meta: { requiresAuth: true }
                    }
                ],
                stores: [],
                policies: []
            }

            const dto = toModuleMetadataDto(module)

            expect(dto.routes).toHaveLength(1)
            const route = dto.routes![0]
            expect(route.path).toBe('/orders')
            expect(route.controller).toBe('OrderListViewController')
            expect(route.action).toBe('Index')
            expect(route.httpMethod).toBe('GET')
            expect(route.policies).toContain('Orders.Read')
        })

        it('应该正确转换Store元数据', () => {
            const module: ModuleMetadata = {
                name: 'Inventory',
                version: '1.0.0',
                abpStyle: true,
                order: 3,
                dependsOn: [],
                routes: [],
                stores: [
                    {
                        name: 'ProductStore',
                        type: 'entity',
                        entityName: 'Product'
                    },
                    {
                        name: 'UIStore',
                        type: 'ui'
                    }
                ],
                policies: []
            }

            const dto = toModuleMetadataDto(module)

            expect(dto.stores).toHaveLength(2)

            const entityStore = dto.stores?.find(s => s.name === 'ProductStore')
            expect(entityStore?.type).toBe('Entity')
            expect(entityStore?.scope).toBe('Scoped')
            expect(entityStore?.implementation).toBe('ProductStoreService')
            expect(entityStore?.interface).toBe('IProductStoreService')

            const uiStore = dto.stores?.find(s => s.name === 'UIStore')
            expect(uiStore?.type).toBe('UI')
            expect(uiStore?.scope).toBe('Singleton')
        })
    })

    describe('getBackendConversionStats', () => {
        it('应该返回正确的统计信息', () => {
            const entities: EntityMetadata[] = [
                {
                    name: 'Product',
                    module: 'Catalog',
                    keyType: 'Guid',
                    isAggregateRoot: true,
                    isMultiTenant: true,
                    isSoftDelete: true,
                    hasExtraProperties: true,
                    properties: [
                        { name: 'name', type: 'string', isRequired: true, isReadOnly: false, isUnique: false },
                        { name: 'price', type: 'decimal', isRequired: true, isReadOnly: false, isUnique: false }
                    ],
                    navigationProperties: [
                        { name: 'category', targetEntity: 'Category', relationType: 'ManyToOne' }
                    ]
                },
                {
                    name: 'Category',
                    module: 'Catalog',
                    keyType: 'Guid',
                    isAggregateRoot: true,
                    isMultiTenant: true,
                    isSoftDelete: true,
                    hasExtraProperties: true,
                    properties: [
                        { name: 'name', type: 'string', isRequired: true, isReadOnly: false, isUnique: false }
                    ]
                }
            ]

            const modules: ModuleMetadata[] = [
                {
                    name: 'Catalog',
                    version: '1.0.0',
                    abpStyle: true,
                    order: 1,
                    dependsOn: [],
                    routes: [],
                    stores: [],
                    policies: []
                }
            ]

            const stats = getBackendConversionStats(entities, modules)

            expect(stats.totalEntities).toBe(2)
            expect(stats.totalModules).toBe(1)
            expect(stats.totalProperties).toBe(3)
            expect(stats.totalNavigationProperties).toBe(1)
            expect(stats.conversionTime).toBeTruthy()
        })
    })

    describe('性能测试', () => {
        it('单个实体转换应该在合理时间内完成', () => {
            const entity: EntityMetadata = {
                name: 'Product',
                module: 'Catalog',
                keyType: 'Guid',
                isAggregateRoot: true,
                isMultiTenant: true,
                isSoftDelete: true,
                hasExtraProperties: true,
                properties: Array.from({ length: 20 }, (_, i) => ({
                    name: `property${i}`,
                    type: 'string',
                    isRequired: true,
                    isReadOnly: false,
                    isUnique: false
                }))
            }

            const startTime = performance.now()
            const dto = toEntityMetadataDto(entity)
            const endTime = performance.now()

            expect(dto).toBeDefined()
            expect(endTime - startTime).toBeLessThan(10) // 应该在10ms内完成
        })

        it('批量转换应该有良好的性能', () => {
            const entities: EntityMetadata[] = Array.from({ length: 50 }, (_, i) => ({
                name: `Entity${i}`,
                module: 'Test',
                keyType: 'Guid',
                isAggregateRoot: true,
                isMultiTenant: true,
                isSoftDelete: true,
                hasExtraProperties: true,
                properties: [
                    { name: 'name', type: 'string', isRequired: true, isReadOnly: false, isUnique: false }
                ]
            }))

            const startTime = performance.now()
            const dtos = entities.map(entity => toEntityMetadataDto(entity))
            const endTime = performance.now()

            expect(dtos).toHaveLength(50)
            expect(endTime - startTime).toBeLessThan(100) // 50个实体应该在100ms内完成
        })
    })
})
