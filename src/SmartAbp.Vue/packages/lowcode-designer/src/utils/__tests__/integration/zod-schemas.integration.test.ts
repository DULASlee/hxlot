import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { 
  validateModuleMetadata, 
  validateEntityDefinition, 
  validatePropertyDefinition,
  safeParse,
  ModuleMetadataSchema,
  EntitySchema,
  PropertySchema
} from '../zod-schemas'
import { PropertyType } from '../../types/wizard'

/**
 * 集成测试 - Zod模式验证
 * 测试Zod模式与实际业务逻辑的集成
 */

describe('Zod Schemas Integration Tests', () => {
  describe('Module Metadata Validation', () => {
    it('should validate complete module metadata with real-world data', () => {
      const realWorldMetadata = {
        systemName: 'SmartERP',
        name: 'InventoryManagement',
        displayName: '库存管理模块',
        version: '2.1.0',
        description: '企业级库存管理系统，支持多仓库、批次管理和库存预警',
        architecturePattern: 'DDD',
        featureManagement: {
          isEnabled: true,
          defaultPolicy: 'RequirePermission'
        },
        entities: [
          {
            name: 'Product',
            displayName: '产品',
            description: '产品信息实体',
            isAggregateRoot: true,
            isMultiTenant: true,
            isSoftDelete: true,
            properties: [
              {
                name: 'id',
                type: PropertyType.Guid,
                isPrimaryKey: true,
                displayName: '产品ID'
              },
              {
                name: 'name',
                type: PropertyType.String,
                displayName: '产品名称',
                required: true,
                maxLength: 100
              },
              {
                name: 'price',
                type: PropertyType.Decimal,
                displayName: '价格',
                required: true
              }
            ]
          },
          {
            name: 'Inventory',
            displayName: '库存',
            description: '库存记录实体',
            properties: [
              {
                name: 'id',
                type: PropertyType.Guid,
                isPrimaryKey: true
              },
              {
                name: 'productId',
                type: PropertyType.Guid,
                isForeignKey: true,
                displayName: '产品ID'
              },
              {
                name: 'quantity',
                type: PropertyType.Int,
                displayName: '数量',
                required: true
              }
            ]
          }
        ],
        databaseInfo: {
          connectionStringName: 'InventoryDb',
          provider: 'SqlServer',
          schema: 'inventory'
        },
        permissionConfig: {
          customActions: [
            {
              entity: 'Product',
              action: 'BulkUpdate',
              displayName: '批量更新产品'
            },
            {
              entity: 'Inventory',
              action: 'AdjustStock',
              displayName: '调整库存'
            }
          ]
        }
      }

      const result = validateModuleMetadata(realWorldMetadata)
      
      expect(result.systemName).toBe('SmartERP')
      expect(result.name).toBe('InventoryManagement')
      expect(result.entities).toHaveLength(2)
      expect(result.entities[0].properties).toHaveLength(3)
      expect(result.permissionConfig.customActions).toHaveLength(2)
    })

    it('should handle validation errors gracefully in integration', () => {
      const invalidMetadata = {
        systemName: 'invalid system', // 包含空格，不符合PascalCase
        name: 'TestModule',
        displayName: '测试模块',
        entities: [
          {
            name: 'TestEntity',
            displayName: '测试实体',
            properties: [
              {
                name: 'id',
                type: PropertyType.Guid
              }
            ]
          }
        ]
      }

      expect(() => validateModuleMetadata(invalidMetadata)).toThrow()
      
      // 测试安全解析
      const safeResult = safeParse(invalidMetadata, ModuleMetadataSchema)
      expect(safeResult.success).toBe(false)
      expect(safeResult.errors).toBeDefined()
      expect(safeResult.errors?.length).toBeGreaterThan(0)
    })
  })

  describe('Entity Validation Integration', () => {
    it('should validate entity with complex property relationships', () => {
      const complexEntity = {
        name: 'Order',
        displayName: '订单',
        description: '客户订单实体，包含订单项和支付信息',
        isAggregateRoot: true,
        properties: [
          {
            name: 'id',
            type: PropertyType.Guid,
            isPrimaryKey: true,
            displayName: '订单ID'
          },
          {
            name: 'customerId',
            type: PropertyType.Guid,
            isForeignKey: true,
            displayName: '客户ID',
            required: true
          },
          {
            name: 'orderDate',
            type: PropertyType.DateTime,
            displayName: '订单日期',
            required: true
          },
          {
            name: 'totalAmount',
            type: PropertyType.Decimal,
            displayName: '总金额',
            required: true
          },
          {
            name: 'status',
            type: PropertyType.String,
            displayName: '订单状态',
            required: true,
            maxLength: 20
          }
        ]
      }

      const result = validateEntityDefinition(complexEntity)
      
      expect(result.name).toBe('Order')
      expect(result.properties).toHaveLength(5)
      expect(result.properties.find(p => p.name === 'totalAmount')?.type).toBe(PropertyType.Decimal)
      expect(result.properties.find(p => p.name === 'customerId')?.isForeignKey).toBe(true)
    })
  })

  describe('Property Validation Integration', () => {
    it('should validate property with all constraints', () => {
      const fullProperty = {
        name: 'emailAddress',
        type: PropertyType.String,
        displayName: '邮箱地址',
        description: '用户的电子邮箱地址，用于登录和通知',
        required: true,
        maxLength: 255,
        defaultValue: '',
        isPrimaryKey: false,
        isForeignKey: false
      }

      const result = validatePropertyDefinition(fullProperty)
      
      expect(result.name).toBe('emailAddress')
      expect(result.type).toBe(PropertyType.String)
      expect(result.required).toBe(true)
      expect(result.maxLength).toBe(255)
      expect(result.defaultValue).toBe('')
    })

    it('should handle property validation errors in business context', () => {
      const invalidProperty = {
        name: '2invalidName', // 以数字开头
        type: PropertyType.String
      }

      expect(() => validatePropertyDefinition(invalidProperty)).toThrow()
      
      const safeResult = safeParse(invalidProperty, PropertySchema)
      expect(safeResult.success).toBe(false)
    })
  })

  describe('Performance Integration', () => {
    it('should handle large-scale data validation efficiently', () => {
      // 生成大量测试数据
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        name: `Property${index}`,
        type: PropertyType.String,
        displayName: `属性 ${index}`,
        required: index % 2 === 0
      }))

      let validatedCount = 0
      let errorCount = 0

      // 批量验证性能测试
      largeDataset.forEach(property => {
        try {
          validatePropertyDefinition(property)
          validatedCount++
        } catch {
          errorCount++
        }
      })

      expect(validatedCount).toBe(1000) // 所有数据都应该通过验证
      expect(errorCount).toBe(0)
    })
  })

  describe('Edge Cases Integration', () => {
    it('should handle optional fields with default values', () => {
      const minimalProperty = {
        name: 'testField',
        type: PropertyType.String
        // 省略可选字段
      }

      const result = validatePropertyDefinition(minimalProperty)
      
      expect(result.name).toBe('testField')
      expect(result.required).toBeUndefined() // 应该是undefined而不是false
      expect(result.defaultValue).toBeUndefined()
    })

    it('should validate complex nested structures', () => {
      const complexModule = {
        systemName: 'ComplexSystem',
        name: 'NestedModule',
        displayName: '嵌套模块',
        entities: [
          {
            name: 'ParentEntity',
            displayName: '父实体',
            properties: [
              {
                name: 'id',
                type: PropertyType.Guid,
                isPrimaryKey: true
              },
              {
                name: 'children',
                type: PropertyType.String, // 实际可能是关联关系
                displayName: '子项'
              }
            ]
          },
          {
            name: 'ChildEntity',
            displayName: '子实体',
            properties: [
              {
                name: 'id',
                type: PropertyType.Guid,
                isPrimaryKey: true
              },
              {
                name: 'parentId',
                type: PropertyType.Guid,
                isForeignKey: true,
                displayName: '父实体ID'
              }
            ]
          }
        ]
      }

      const result = validateModuleMetadata(complexModule)
      
      expect(result.entities).toHaveLength(2)
      expect(result.entities[0].properties[1].name).toBe('children')
      expect(result.entities[1].properties[1].isForeignKey).toBe(true)
    })
  })
})