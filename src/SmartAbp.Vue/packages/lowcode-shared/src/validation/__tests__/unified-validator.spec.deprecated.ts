// @ts-nocheck
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🟡 已废弃：unified-validator集成测试（Unified Validator Tests）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// 废弃日期: 2025-10-18
// 废弃原因: 迁移到后端SSOT架构后，前端不再需要独立的Schema验证器
// 替代方案: 后端DTO验证（由ABP框架和FluentValidation处理）
//
// 📋 旧有功能:
//   - UnifiedSchemaValidator: 前端Schema验证器（已废弃）
//   - validateEntity(): 实体验证（已废弃，后端验证）
//   - validateModule(): 模块验证（已废弃，后端验证）
//   - validateEntities(): 批量验证（已废弃，后端验证）
//
// 📚 新的最佳实践:
//   验证逻辑现在在后端C#层完成：
//
//   后端验证（Application.Contracts + FluentValidation）:
//   public class CreateModuleDto : IValidatableObject
//   {
//       [Required]
//       [MaxLength(100)]
//       public string ModuleName { get; set; }
//
//       public IEnumerable<ValidationResult> Validate(...)
//       {
//           // 验证逻辑
//       }
//   }
//
//   前端只需显示后端返回的验证错误。
//
// 📖 参考文档:
//   - docs/架构设计/低代码引擎v2.0进阶版/Phase1-快速止血方案v1.1-后端SSOT修正版.md
//
// ⚠️ 重要警告:
//   此测试文件已失效，请勿运行或维护！
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/* eslint-disable */
/* ━━━━━ 以下代码已废弃，仅作存档 ━━━━━

/**
 * @fileoverview unified-validator集成测试
 * @description 验证真实的metadata-core集成功能
 * @version 1.0.0
 * @author SmartAbp Team
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  UnifiedSchemaValidator,
  SchemaValidationError,
  setValidationFeatureFlags,
  getValidationFeatureFlags
} from './unified-validator'
import type { UnifiedEntityDefinition, UnifiedModuleMetadata } from '@/api/generated/type-aliases'

describe('UnifiedSchemaValidator - 真实验证器集成测试', () => {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 测试数据
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const validEntity: UnifiedEntityDefinition = {
    id: crypto.randomUUID(),
    name: 'Project',
    displayName: '项目',
    tableName: 'Projects',
    module: 'ProjectManagement',
    namespace: 'SmartAbp.ProjectManagement.Entities',
    description: '项目实体',
    schema: 'dbo',
    isAggregateRoot: true,
    baseClass: 'FullAuditedAggregateRoot<Guid>',
    interfaces: [],
    isAudited: true,
    isSoftDelete: true,
    isMultiTenant: false,
    fields: [
      {
        id: crypto.randomUUID(),
        name: 'name',
        displayName: '项目名称',
        type: 'string',
        description: '项目名称',
        helpText: '',
        isRequired: true,
        isPrimaryKey: false,
        isUnique: false,
        isIndexed: false,
        maxLength: 100,
        enumValues: [],
        validationRules: [],
        displayOrder: 1,
        groupName: 'Basic',
        isVisible: true,
        isReadonly: false,
        listVisible: true,
        detailVisible: true,
        formVisible: true,
        searchable: true,
        sortable: true,
        filterable: true,
        disabled: false,
        columnName: 'name',
        columnType: 'nvarchar',
        isAuditField: false,
        isSoftDeleteField: false,
        isTenantField: false
      }
    ],
    relationships: [],
    validationRules: [],
    businessRules: [],
    indexes: [],
    constraints: [],
    permissions: [],
    uiConfig: {
      listPage: {
        pageSize: 20,
        sortField: 'creationTime',
        sortOrder: 'desc',
        searchFields: ['name'],
        displayFields: ['name', 'description']
      },
      formPage: {
        layout: 'vertical',
        labelWidth: 120,
        fieldGroups: [{
          name: 'basic',
          displayName: 'Basic Information',
          fields: ['name', 'description']
        }]
      },
      detailPage: {
        layout: 'card',
        displayFields: ['name', 'description']
      }
    },
    codeGeneration: {
      generateEntity: true,
      generateDto: true,
      generateAppService: true,
      generateController: true,
      generateRepository: true,
      generateFrontend: true,
      generateTests: false
    },
    isCompleted: false,
    tags: [],
    schemaVersion: '1.0.0',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Feature Flag测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Feature Flag 控制', () => {
    it('应该能够设置和获取Feature Flags', () => {
      setValidationFeatureFlags({
        enableMetadataCoreValidation: false,
        enableStrictValidation: true
      })

      const flags = getValidationFeatureFlags()
      expect(flags.enableMetadataCoreValidation).toBe(false)
      expect(flags.enableStrictValidation).toBe(true)
    })

    it('应该能够禁用验证功能', async () => {
      setValidationFeatureFlags({
        enableMetadataCoreValidation: false
      })

      const validator = new UnifiedSchemaValidator()
      const result = await validator.validateEntity(validEntity)

      // 禁用验证时应该直接返回成功
      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 实体验证测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('实体验证 - 真实metadata-core验证', () => {
    let validator: UnifiedSchemaValidator

    beforeEach(() => {
      // 重置Feature Flags
      setValidationFeatureFlags({
        enableMetadataCoreValidation: true,
        enableStrictValidation: false
      })
      validator = new UnifiedSchemaValidator()
    })

    it('应该能够验证合法的实体定义', async () => {
      const result = await validator.validateEntity(validEntity)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.data).toEqual(validEntity)
      expect(result.performance).toBeDefined()
      expect(result.performance?.duration).toBeGreaterThanOrEqual(0)
    })

    it('应该能够检测实体名称为空的错误', async () => {
      const invalidEntity = { ...validEntity, name: '' }
      const result = await validator.validateEntity(invalidEntity as any)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(err => err.path?.includes('name'))).toBe(true)
    })

    it('应该能够检测实体模块为空的错误', async () => {
      const invalidEntity = { ...validEntity, module: '' }
      const result = await validator.validateEntity(invalidEntity as any)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(err => err.path?.includes('module'))).toBe(true)
    })

    it('应该提供详细的错误建议', async () => {
      const invalidEntity = { ...validEntity, name: '' }
      const result = await validator.validateEntity(invalidEntity as any)

      expect(result.success).toBe(false)
      expect(result.errors.some(err => err.suggestion !== undefined)).toBe(true)
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 模块验证测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('模块验证 - 真实metadata-core验证', () => {
    let validator: UnifiedSchemaValidator

    const validModule: UnifiedModuleMetadata = {
      id: crypto.randomUUID(),
      systemName: 'SmartAbp',
      name: 'ProjectManagement',
      displayName: '项目管理',
      description: '项目管理模块',
      version: '1.0.0',
      author: 'SmartAbp Team',
      namespace: 'SmartAbp.ProjectManagement',
      architecturePattern: 'Crud',
      databaseInfo: {
        connectionStringName: 'Default',
        schema: 'dbo',
        provider: 'SqlServer'
      },
      frontend: {
        parentId: '',
        routePrefix: 'projectmanagement'
      },
      generateMobilePages: false,
      featureManagement: {
        isEnabled: true,
        defaultPolicy: 'RequiresAuthentication'
      },
      entities: [validEntity],
      menuConfig: [],
      permissionConfig: {
        groupName: 'ProjectManagement',
        permissions: []
      },
      dependencies: [],
      schemaVersion: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    beforeEach(() => {
      setValidationFeatureFlags({
        enableMetadataCoreValidation: true,
        enableStrictValidation: false
      })
      validator = new UnifiedSchemaValidator()
    })

    it('应该能够验证合法的模块定义', async () => {
      const result = await validator.validateModule(validModule)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.data).toEqual(validModule)
      expect(result.performance).toBeDefined()
    })

    it('应该能够检测模块名称为空的错误', async () => {
      const invalidModule = { ...validModule, name: '' }
      const result = await validator.validateModule(invalidModule as any)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('应该能够检测模块版本格式错误', async () => {
      const invalidModule = { ...validModule, version: '' }
      const result = await validator.validateModule(invalidModule as any)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 批量验证测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('批量验证', () => {
    let validator: UnifiedSchemaValidator

    beforeEach(() => {
      setValidationFeatureFlags({
        enableMetadataCoreValidation: true
      })
      validator = new UnifiedSchemaValidator()
    })

    it('应该能够批量验证多个实体', async () => {
      const entities = [
        validEntity,
        { ...validEntity, id: crypto.randomUUID(), name: 'Task' }
      ]

      const result = await validator.validateEntities(entities)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
    })

    it('应该能够检测批量验证中的错误实体', async () => {
      const entities = [
        validEntity,
        { ...validEntity, id: crypto.randomUUID(), name: '' } // 错误实体
      ]

      const result = await validator.validateEntities(entities as any)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(err => err.path?.includes('entities[1]'))).toBe(true)
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SchemaValidationError测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('SchemaValidationError', () => {
    it('应该能够创建验证错误实例', () => {
      const errors = [
        { code: 'INVALID_NAME', message: 'Name is required', path: 'name' }
      ]

      const error = new SchemaValidationError('Validation failed', errors)

      expect(error.name).toBe('SchemaValidationError')
      expect(error.message).toBe('Validation failed')
      expect(error.errors).toEqual(errors)
    })

    it('应该能够生成格式化的错误信息', () => {
      const errors = [
        { code: 'INVALID_NAME', message: 'Name is required', path: 'name' },
        { code: 'INVALID_TYPE', message: 'Type must be string', path: 'type' }
      ]

      const error = new SchemaValidationError('Validation failed', errors)
      const formatted = error.getFormattedMessage()

      expect(formatted).toContain('Name is required')
      expect(formatted).toContain('Type must be string')
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 性能监控测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('性能监控', () => {
    let validator: UnifiedSchemaValidator

    beforeEach(() => {
      setValidationFeatureFlags({
        enablePerformanceMonitoring: true
      })
      validator = new UnifiedSchemaValidator()
    })

    it('应该记录验证性能指标', async () => {
      const result = await validator.validateEntity(validEntity)

      expect(result.performance).toBeDefined()
      expect(result.performance?.duration).toBeGreaterThanOrEqual(0)
      expect(result.performance?.fieldCount).toBe(validEntity.fields.length)
    })

    it('应该统计字段和规则数量', async () => {
      const entityWithRules = {
        ...validEntity,
        fields: [{
          ...validEntity.fields[0],
          validationRules: [
            {
              id: '1',
              fieldName: 'name',
              ruleType: 'required' as const,
              ruleValue: 'true',
              errorMessage: 'Name is required'
            }
          ]
        }]
      }

      const result = await validator.validateEntity(entityWithRules)

      expect(result.performance?.ruleCount).toBeGreaterThan(0)
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 真实Zod验证测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('真实Zod验证功能', () => {
    let validator: UnifiedSchemaValidator

    beforeEach(() => {
      setValidationFeatureFlags({
        enableMetadataCoreValidation: true
      })
      validator = new UnifiedSchemaValidator()
    })

    it('应该能够验证字段名称格式（camelCase）', async () => {
      const entityWithInvalidFieldName = {
        ...validEntity,
        fields: [{
          ...validEntity.fields[0],
          name: 'InvalidName' // PascalCase，应该是camelCase
        }]
      }

      const result = await validator.validateEntity(entityWithInvalidFieldName as any)

      // Zod应该检测到字段名格式错误
      // 注意：实际错误信息取决于metadata-core的验证规则
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('应该提供Zod错误的详细建议', async () => {
      const entityWithInvalidFieldName = {
        ...validEntity,
        fields: [{
          ...validEntity.fields[0],
          name: 'InvalidName'
        }]
      }

      const result = await validator.validateEntity(entityWithInvalidFieldName as any)

      if (!result.success) {
        const hasSuggestions = result.errors.some(err => err.suggestion !== undefined)
        expect(hasSuggestions).toBe(true)
      }
    })
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 边界条件测试
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('边界条件测试', () => {
    let validator: UnifiedSchemaValidator

    beforeEach(() => {
      validator = new UnifiedSchemaValidator()
    })

    it('应该能够处理空实体列表', async () => {
      const result = await validator.validateEntities([])

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(0)
    })

    it('应该能够处理包含大量字段的实体', async () => {
      const entityWithManyFields = {
        ...validEntity,
        fields: Array.from({ length: 100 }, (_, i) => ({
          ...validEntity.fields[0],
          id: crypto.randomUUID(),
          name: `field${i}`,
          displayName: `字段${i}`
        }))
      }

      const result = await validator.validateEntity(entityWithManyFields)

      expect(result.success).toBe(true)
      expect(result.performance?.fieldCount).toBe(100)
    })
  })
})

*/
// End of archived code

