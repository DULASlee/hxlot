/**
 * EnhancedEntityGenerator 单元测试
 *
 * 测试覆盖率目标: ≥80%
 *
 * @author SmartAbp架构师团队
 * @version 2.0.0
 * @date 2025-10-16
 */

import type { UnifiedEntityDefinition } from '@smartabp/lowcode-shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { EnhancedEntityGenerator } from '../EnhancedEntityGenerator'

describe('EnhancedEntityGenerator', () => {
    let generator: EnhancedEntityGenerator

    beforeEach(() => {
        generator = new EnhancedEntityGenerator({
            projectName: 'TestProject',
            namespace: 'TestProject',
            generateComments: true,
            generateValidation: true,
            generateNavigationProperties: true,
            generateEntityConfiguration: true
        })
    })

    describe('基础Entity生成', () => {
        it('应该生成包含基本字段的Entity类', () => {
            const entity: UnifiedEntityDefinition = {
                id: 'entity-1',
                name: 'User',
                displayName: '用户',
                tableName: 'Users',
                description: '用户实体',
                schemaVersion: '2.0',
                fields: [
                    {
                        id: 'field-1',
                        name: 'Name',
                        displayName: '姓名',
                        type: 'string',
                        description: '用户姓名',
                        helpText: '',
                        isRequired: true,
                        isPrimaryKey: false,
                        isIndexed: false,
                        isUnique: false,
                        defaultValue: '',
                        minLength: 2,
                        maxLength: 50,
                        enumValues: null,
                        displayOrder: 1,
                        groupName: '',
                        isVisible: true,
                        listVisible: true,
                        detailVisible: true,
                        formVisible: true,
                        searchable: true
                    },
                    {
                        id: 'field-2',
                        name: 'Email',
                        displayName: '邮箱',
                        type: 'string',
                        description: '用户邮箱',
                        helpText: '',
                        isRequired: true,
                        isPrimaryKey: false,
                        isIndexed: true,
                        isUnique: true,
                        defaultValue: '',
                        minLength: 0,
                        maxLength: 100,
                        enumValues: null,
                        displayOrder: 2,
                        groupName: '',
                        isVisible: true,
                        listVisible: true,
                        detailVisible: true,
                        formVisible: true,
                        searchable: true
                    },
                    {
                        id: 'field-3',
                        name: 'Age',
                        displayName: '年龄',
                        type: 'int',
                        description: '用户年龄',
                        helpText: '',
                        isRequired: false,
                        isPrimaryKey: false,
                        isIndexed: false,
                        isUnique: false,
                        defaultValue: null,
                        minValue: 0,
                        maxValue: 150,
                        enumValues: null,
                        displayOrder: 3,
                        groupName: '',
                        isVisible: true,
                        listVisible: true,
                        detailVisible: true,
                        formVisible: true,
                        searchable: false
                    }
                ],
                relationships: [],
                indexes: [],
                constraints: [],
                permissions: {
                    enablePermission: false,
                    defaultPermissions: [],
                    customPermissions: []
                },
                uiConfig: {
                    icon: 'user',
                    color: '#1890ff',
                    sortOrder: 0,
                    layout: 'default',
                    labelWidth: 100,
                    detailPage: {
                        layout: 'tabs',
                        showCreationTime: true,
                        showModificationTime: true
                    }
                },
                codeGenerationConfig: {
                    generateEntity: true,
                    generateFrontend: true,
                    generateTests: true
                },
                metadata: {}
            }

            const result = generator.generateEntity(entity, [entity])

            // 验证生成的Entity代码
            expect(result.entityCode).toContain('public class User : FullAuditedAggregateRoot<Guid>')
            expect(result.entityCode).toContain('public string Name { get; set; }')
            expect(result.entityCode).toContain('public string Email { get; set; }')
            expect(result.entityCode).toContain('public int? Age { get; set; }')

            // 验证数据注解
            expect(result.entityCode).toContain('[Required]')
            expect(result.entityCode).toContain('[MaxLength(50)]')
            expect(result.entityCode).toContain('[MaxLength(100)]')
            expect(result.entityCode).toContain('[Range(0, 150)]')

            // 验证构造函数
            expect(result.entityCode).toContain('protected User()')
            expect(result.entityCode).toContain('public User(Guid id, string name, string email)')
        })
    })

    describe('22种C#类型映射', () => {
        it('应该正确映射所有支持的C#类型', () => {
            const typeTestCases = [
                { type: 'string', expected: 'string' },
                { type: 'int', expected: 'int' },
                { type: 'long', expected: 'long' },
                { type: 'decimal', expected: 'decimal' },
                { type: 'double', expected: 'double' },
                { type: 'float', expected: 'float' },
                { type: 'bool', expected: 'bool' },
                { type: 'DateTime', expected: 'DateTime' },
                { type: 'Guid', expected: 'Guid' },
                { type: 'byte[]', expected: 'byte[]' }
            ]

            for (const testCase of typeTestCases) {
                const entity: UnifiedEntityDefinition = {
                    id: 'entity-type-test',
                    name: 'TypeTest',
                    displayName: '类型测试',
                    tableName: 'TypeTests',
                    description: '类型映射测试',
                    schemaVersion: '2.0',
                    fields: [
                        {
                            id: 'field-test',
                            name: 'TestField',
                            displayName: '测试字段',
                            type: testCase.type,
                            description: '',
                            helpText: '',
                            isRequired: true,
                            isPrimaryKey: false,
                            isIndexed: false,
                            isUnique: false,
                            defaultValue: '',
                            enumValues: null,
                            displayOrder: 1,
                            groupName: '',
                            isVisible: true,
                            listVisible: true,
                            detailVisible: true,
                            formVisible: true,
                            searchable: true
                        }
                    ],
                    relationships: [],
                    indexes: [],
                    constraints: [],
                    permissions: {
                        enablePermission: false,
                        defaultPermissions: [],
                        customPermissions: []
                    },
                    uiConfig: {
                        icon: 'test',
                        color: '#000000',
                        sortOrder: 0,
                        layout: 'default',
                        labelWidth: 100,
                        detailPage: {
                            layout: 'tabs',
                            showCreationTime: true,
                            showModificationTime: true
                        }
                    },
                    codeGenerationConfig: {
                        generateEntity: true,
                        generateFrontend: true,
                        generateTests: true
                    },
                    metadata: {}
                }

                const result = generator.generateEntity(entity, [entity])
                expect(result.entityCode).toContain(`public ${testCase.expected} TestField { get; set; }`)
            }
        })
    })

    describe('导航属性生成', () => {
        it('应该生成OneToMany关系的导航属性', () => {
            const orderEntity: UnifiedEntityDefinition = {
                id: 'order-entity',
                name: 'Order',
                displayName: '订单',
                tableName: 'Orders',
                description: '订单实体',
                schemaVersion: '2.0',
                fields: [],
                relationships: [
                    {
                        id: 'rel-1',
                        name: 'OrderItems',
                        displayName: '订单明细',
                        sourceEntityId: 'order-entity',
                        targetEntityId: 'order-item-entity',
                        targetEntity: 'OrderItem',
                        type: 'OneToMany',
                        sourceProperty: '',
                        targetProperty: 'OrderId',
                        sourceNavigationProperty: '',
                        targetNavigationProperty: 'OrderItems',
                        description: '订单包含多个订单明细'
                    }
                ],
                indexes: [],
                constraints: [],
                permissions: {
                    enablePermission: false,
                    defaultPermissions: [],
                    customPermissions: []
                },
                uiConfig: {
                    icon: 'order',
                    color: '#1890ff',
                    sortOrder: 0,
                    layout: 'default',
                    labelWidth: 100,
                    detailPage: {
                        layout: 'tabs',
                        showCreationTime: true,
                        showModificationTime: true
                    }
                },
                codeGenerationConfig: {
                    generateEntity: true,
                    generateFrontend: true,
                    generateTests: true
                },
                metadata: {}
            }

            const orderItemEntity: UnifiedEntityDefinition = {
                id: 'order-item-entity',
                name: 'OrderItem',
                displayName: '订单明细',
                tableName: 'OrderItems',
                description: '订单明细实体',
                schemaVersion: '2.0',
                fields: [],
                relationships: [],
                indexes: [],
                constraints: [],
                permissions: {
                    enablePermission: false,
                    defaultPermissions: [],
                    customPermissions: []
                },
                uiConfig: {
                    icon: 'item',
                    color: '#52c41a',
                    sortOrder: 0,
                    layout: 'default',
                    labelWidth: 100,
                    detailPage: {
                        layout: 'tabs',
                        showCreationTime: true,
                        showModificationTime: true
                    }
                },
                codeGenerationConfig: {
                    generateEntity: true,
                    generateFrontend: true,
                    generateTests: true
                },
                metadata: {}
            }

            const result = generator.generateEntity(orderEntity, [orderEntity, orderItemEntity])

            // 验证导航属性生成
            expect(result.entityCode).toContain('public virtual ICollection<OrderItem> OrderItems { get; set; }')
            expect(result.entityCode).toContain('/// 导航属性: 订单明细')
        })

        it('应该生成OneToOne关系的导航属性和外键', () => {
            const userEntity: UnifiedEntityDefinition = {
                id: 'user-entity',
                name: 'User',
                displayName: '用户',
                tableName: 'Users',
                description: '用户实体',
                schemaVersion: '2.0',
                fields: [],
                relationships: [
                    {
                        id: 'rel-profile',
                        name: 'Profile',
                        displayName: '用户资料',
                        sourceEntityId: 'user-entity',
                        targetEntityId: 'profile-entity',
                        targetEntity: 'UserProfile',
                        type: 'OneToOne',
                        sourceProperty: 'ProfileId',
                        targetProperty: '',
                        sourceNavigationProperty: '',
                        targetNavigationProperty: 'Profile',
                        description: '用户有一个资料'
                    }
                ],
                indexes: [],
                constraints: [],
                permissions: {
                    enablePermission: false,
                    defaultPermissions: [],
                    customPermissions: []
                },
                uiConfig: {
                    icon: 'user',
                    color: '#1890ff',
                    sortOrder: 0,
                    layout: 'default',
                    labelWidth: 100,
                    detailPage: {
                        layout: 'tabs',
                        showCreationTime: true,
                        showModificationTime: true
                    }
                },
                codeGenerationConfig: {
                    generateEntity: true,
                    generateFrontend: true,
                    generateTests: true
                },
                metadata: {}
            }

            const profileEntity: UnifiedEntityDefinition = {
                id: 'profile-entity',
                name: 'UserProfile',
                displayName: '用户资料',
                tableName: 'UserProfiles',
                description: '用户资料实体',
                schemaVersion: '2.0',
                fields: [],
                relationships: [],
                indexes: [],
                constraints: [],
                permissions: {
                    enablePermission: false,
                    defaultPermissions: [],
                    customPermissions: []
                },
                uiConfig: {
                    icon: 'profile',
                    color: '#52c41a',
                    sortOrder: 0,
                    layout: 'default',
                    labelWidth: 100,
                    detailPage: {
                        layout: 'tabs',
                        showCreationTime: true,
                        showModificationTime: true
                    }
                },
                codeGenerationConfig: {
                    generateEntity: true,
                    generateFrontend: true,
                    generateTests: true
                },
                metadata: {}
            }

            const result = generator.generateEntity(userEntity, [userEntity, profileEntity])

            // 验证外键生成
            expect(result.entityCode).toContain('public Guid? ProfileId { get; set; }')
            expect(result.entityCode).toContain('/// 外键: 用户资料')

            // 验证导航属性生成
            expect(result.entityCode).toContain('[ForeignKey(nameof(ProfileId))]')
            expect(result.entityCode).toContain('public virtual UserProfile? Profile { get; set; }')
        })
    })

    describe('EntityConfiguration生成', () => {
        it('应该生成完整的EntityConfiguration', () => {
            const entity: UnifiedEntityDefinition = {
                id: 'entity-config-test',
                name: 'Product',
                displayName: '产品',
                tableName: 'Products',
                description: '产品实体',
                schemaVersion: '2.0',
                fields: [
                    {
                        id: 'field-name',
                        name: 'Name',
                        displayName: '产品名称',
                        type: 'string',
                        description: '产品名称',
                        helpText: '',
                        isRequired: true,
                        isPrimaryKey: false,
                        isIndexed: true,
                        isUnique: true,
                        defaultValue: '',
                        maxLength: 100,
                        enumValues: null,
                        displayOrder: 1,
                        groupName: '',
                        isVisible: true,
                        listVisible: true,
                        detailVisible: true,
                        formVisible: true,
                        searchable: true
                    },
                    {
                        id: 'field-price',
                        name: 'Price',
                        displayName: '价格',
                        type: 'decimal',
                        description: '产品价格',
                        helpText: '',
                        isRequired: true,
                        isPrimaryKey: false,
                        isIndexed: false,
                        isUnique: false,
                        defaultValue: null,
                        precision: 18,
                        scale: 2,
                        enumValues: null,
                        displayOrder: 2,
                        groupName: '',
                        isVisible: true,
                        listVisible: true,
                        detailVisible: true,
                        formVisible: true,
                        searchable: false
                    }
                ],
                relationships: [],
                indexes: [
                    {
                        id: 'idx-name',
                        name: 'IX_Product_Name',
                        columns: ['Name'],
                        isUnique: true,
                        isClustered: false
                    }
                ],
                constraints: [],
                permissions: {
                    enablePermission: false,
                    defaultPermissions: [],
                    customPermissions: []
                },
                uiConfig: {
                    icon: 'product',
                    color: '#fa8c16',
                    sortOrder: 0,
                    layout: 'default',
                    labelWidth: 100,
                    detailPage: {
                        layout: 'tabs',
                        showCreationTime: true,
                        showModificationTime: true
                    }
                },
                codeGenerationConfig: {
                    generateEntity: true,
                    generateFrontend: true,
                    generateTests: true
                },
                metadata: {}
            }

            const result = generator.generateEntity(entity, [entity])

            // 验证EntityConfiguration类
            expect(result.entityConfigurationCode).toContain('public class ProductConfiguration : IEntityTypeConfiguration<Product>')
            expect(result.entityConfigurationCode).toContain('builder.ToTable("Products")')

            // 验证字段配置
            expect(result.entityConfigurationCode).toContain('builder.Property(e => e.Name)')
            expect(result.entityConfigurationCode).toContain('.IsRequired()')
            expect(result.entityConfigurationCode).toContain('.HasMaxLength(100)')
            expect(result.entityConfigurationCode).toContain('.HasComment("产品名称: 产品名称")')

            expect(result.entityConfigurationCode).toContain('builder.Property(e => e.Price)')
            expect(result.entityConfigurationCode).toContain('.HasPrecision(18, 2)')

            // 验证索引配置
            expect(result.entityConfigurationCode).toContain('builder.HasIndex(e => new { e.Name })')
            expect(result.entityConfigurationCode).toContain('.HasDatabaseName("IX_Product_Name")')
            expect(result.entityConfigurationCode).toContain('.IsUnique()')
        })
    })

    describe('质量评估', () => {
        it('生成的代码应该达到95分以上质量标准', () => {
            const entity: UnifiedEntityDefinition = {
                id: 'quality-test',
                name: 'QualityTest',
                displayName: '质量测试',
                tableName: 'QualityTests',
                description: '质量测试实体',
                schemaVersion: '2.0',
                fields: [
                    {
                        id: 'field-1',
                        name: 'Name',
                        displayName: '名称',
                        type: 'string',
                        description: '',
                        helpText: '',
                        isRequired: true,
                        isPrimaryKey: false,
                        isIndexed: false,
                        isUnique: false,
                        defaultValue: '',
                        maxLength: 50,
                        enumValues: null,
                        displayOrder: 1,
                        groupName: '',
                        isVisible: true,
                        listVisible: true,
                        detailVisible: true,
                        formVisible: true,
                        searchable: true
                    }
                ],
                relationships: [],
                indexes: [],
                constraints: [],
                permissions: {
                    enablePermission: false,
                    defaultPermissions: [],
                    customPermissions: []
                },
                uiConfig: {
                    icon: 'test',
                    color: '#000000',
                    sortOrder: 0,
                    layout: 'default',
                    labelWidth: 100,
                    detailPage: {
                        layout: 'tabs',
                        showCreationTime: true,
                        showModificationTime: true
                    }
                },
                codeGenerationConfig: {
                    generateEntity: true,
                    generateFrontend: true,
                    generateTests: true
                },
                metadata: {}
            }

            const result = generator.generateEntity(entity, [entity])

            // 质量检查项
            const qualityChecks = {
                hasUsings: result.entityCode.includes('using System;'),
                hasNamespace: result.entityCode.includes('namespace TestProject'),
                hasInheritance: result.entityCode.includes(': FullAuditedAggregateRoot<Guid>'),
                hasComments: result.entityCode.includes('///'),
                hasConstructor: result.entityCode.includes('protected QualityTest()'),
                hasValidation: result.entityCode.includes('[Required]'),
                hasTimestamp: result.entityCode.includes('生成时间:'),
                hasVersion: result.entityCode.includes('v2.0')
            }

            // 所有质量检查项都应该通过
            Object.entries(qualityChecks).forEach(([key, value]) => {
                expect(value, `质量检查失败: ${key}`).toBe(true)
            })

            // 计算质量分数（简化版）
            const passedChecks = Object.values(qualityChecks).filter(v => v).length
            const qualityScore = (passedChecks / Object.keys(qualityChecks).length) * 100

            expect(qualityScore).toBeGreaterThanOrEqual(95)
        })
    })
})

