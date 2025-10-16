/**
 * 🔥 SmartAbp Metadata Validation Adapter
 *
 * 将unified-schema转换为metadata-core格式进行验证
 * 这是一个适配器模式的实现，确保类型转换的安全性
 *
 * @version 1.0.0
 * @author SmartAbp架构团队
 * @date 2025-10-06
 */

// 🚀 导入统一类型定义（已从metadata-core迁移到lowcode-shared）
import type {
  BackendConfig,
  EntityMetadata,
  ValidationRule as MetadataCoreValidationRule,
  ModuleMetadata,
  NavigationPropertyMetadata,
  PropertyMetadata,
  UIConfig
} from '../types/unified-schema'

import type {
  UnifiedCodeGenerationConfig,
  UnifiedEntityDefinition,
  UnifiedEntityField,
  UnifiedEntityRelationship,
  UnifiedEntityUIConfig,
  UnifiedModuleMetadata,
  UnifiedValidationRule
} from '@smartabp/lowcode-shared'

// ============================================================================
// 实体转换器
// ============================================================================

/**
 * 将UnifiedEntityDefinition转换为EntityMetadata
 */
export function convertEntityToMetadataCore(entity: UnifiedEntityDefinition): EntityMetadata {
  return {
    schemaVersion: '1.0.0',
    name: entity.name,
    module: entity.module,
    keyType: 'Guid' as const, // 修复：使用字面量类型
    description: entity.description,
    isAggregateRoot: entity.isAggregateRoot ?? false,  // 修复：提供默认值
    isMultiTenant: entity.isMultiTenant ?? false,  // 修复：提供默认值
    isSoftDelete: entity.isSoftDelete ?? false,  // 修复：提供默认值
    hasExtraProperties: true, // 默认支持扩展属性
    properties: entity.fields.map(convertFieldToProperty),
    navigationProperties: entity.relationships?.map(convertRelationshipToNavigation) || [],
    xUiConfig: entity.uiConfig ? convertUIConfig(entity.uiConfig) : undefined,
    xBackendConfig: entity.codeGeneration ? convertBackendConfig(entity.codeGeneration) : undefined
  }
}

/**
 * 将UnifiedEntityField转换为PropertyMetadata
 */
function convertFieldToProperty(field: UnifiedEntityField): PropertyMetadata {
  return {
    name: field.name,
    type: field.type,
    isRequired: field.isRequired,
    isReadOnly: field.isReadonly || false,
    isUnique: field.isUnique || false,
    maxLength: field.maxLength,
    minLength: field.minLength,
    minValue: field.minValue,
    maxValue: field.maxValue,
    defaultValue: field.defaultValue as string | undefined,
    description: field.description,
    displayName: field.displayName,
    validationRules: field.validationRules?.map(convertValidationRule) || []
  }
}

/**
 * 将UnifiedEntityRelationship转换为NavigationPropertyMetadata
 */
function convertRelationshipToNavigation(relationship: UnifiedEntityRelationship): NavigationPropertyMetadata {
  return {
    name: relationship.name,
    targetEntity: relationship.targetEntity,
    relationType: relationship.type === 'ManyToMany' ? 'ManyToMany' : relationship.type,
    foreignKey: relationship.sourceProperty || undefined,
    inverseName: relationship.targetNavigationProperty || undefined
  }
}

/**
 * 将UnifiedValidationRule转换为ValidationRule
 */
function convertValidationRule(rule: UnifiedValidationRule): MetadataCoreValidationRule {
  return {
    name: rule.ruleType || 'unknown',
    condition: rule.ruleValue || '',
    errorMessage: rule.errorMessage || 'Validation failed'
  }
}

/**
 * 将UnifiedEntityUIConfig转换为UIConfig
 */
function convertUIConfig(uiConfig: UnifiedEntityUIConfig): UIConfig {
  return {
    listColumns: uiConfig.listPage?.displayFields,
    formFields: uiConfig.formPage?.fieldGroups?.[0]?.fields,
    searchFields: uiConfig.listPage?.searchFields,
    defaultSort: uiConfig.listPage?.sortField,
    pageSize: uiConfig.listPage?.pageSize
  }
}

/**
 * 将UnifiedCodeGenerationConfig转换为BackendConfig
 */
function convertBackendConfig(codeGeneration: UnifiedCodeGenerationConfig): BackendConfig {
  return {
    generateRepository: true, // 默认生成Repository
    generateAppService: codeGeneration.generateAppService || false,
    generateController: codeGeneration.generateController,
    generateDto: codeGeneration.generateDto
  }
}

// ============================================================================
// 模块转换器
// ============================================================================

/**
 * 将UnifiedModuleMetadata转换为ModuleMetadata
 */
export function convertModuleToMetadataCore(module: UnifiedModuleMetadata): ModuleMetadata {
  return {
    schemaVersion: module.schemaVersion || '1.0.0',
    name: module.name,
    displayName: module.displayName,
    version: module.version,
    description: module.description,
    author: module.author,
    abpStyle: true, // SmartAbp项目默认使用ABP风格
    order: 100, // 默认排序
    dependsOn: [], // 暂时为空，可根据需要扩展
    routes: [], // 暂时为空，可根据需要扩展
    stores: [], // 暂时为空，可根据需要扩展
    policies: [], // 暂时为空，可根据需要扩展
    lifecycle: undefined, // 可选
    features: undefined, // 可选
    menuConfig: module.menuConfig && Array.isArray(module.menuConfig) && module.menuConfig.length > 0 ? {
      title: module.menuConfig[0]?.label || module.displayName || module.name,
      icon: module.menuConfig[0]?.icon,
      order: 100 // 默认排序值
    } : undefined
  }
}

// ============================================================================
// 类型守卫（用于D2重载支持）
// ============================================================================

/**
 * 类型守卫：判断是否为 EntityMetadata
 */
export function isEntityMetadata(value: unknown): value is EntityMetadata {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.name === 'string' &&
    typeof v.module === 'string' &&
    'schemaVersion' in v &&
    'properties' in v &&
    Array.isArray(v.properties)
  )
}

/**
 * 类型守卫：判断是否为 UnifiedEntityDefinition
 */
export function isUnifiedEntityDefinition(value: unknown): value is UnifiedEntityDefinition {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.name === 'string' &&
    typeof v.module === 'string' &&
    'fields' in v &&
    Array.isArray(v.fields) &&
    !('schemaVersion' in v && 'properties' in v) // 区分于 EntityMetadata
  )
}

// ============================================================================
// 反向转换器（完整版，用于D2重载支持）
// ============================================================================

/**
 * 将EntityMetadata完整转换回UnifiedEntityDefinition
 * @version 2.0.0 - D2优化：完整反向转换
 */
export function convertMetadataCoreToUnified(entity: EntityMetadata): UnifiedEntityDefinition {
  // 生成唯一ID的辅助函数
  const generateId = (prefix: string, name: string) => `${prefix}_${name}_${Date.now()}`

  // D2务实实现：EntityMetadata → UnifiedEntityDefinition 适配
  // 注意：EntityMetadata 字段较少，需要补充 UnifiedEntityDefinition 的默认值
  const result: Partial<UnifiedEntityDefinition> = {
    name: entity.name,
    module: entity.module,
    tableName: entity.name,
    namespace: `${entity.module}.Entities`,
    displayName: entity.name,
    description: entity.description || '',
    isAggregateRoot: entity.isAggregateRoot ?? false,
    isMultiTenant: entity.isMultiTenant ?? false,
    isSoftDelete: entity.isSoftDelete ?? false,

    fields: entity.properties.map((prop, index) => ({
      id: generateId('field', prop.name),
      name: prop.name,
      type: prop.type as any,
      displayName: prop.displayName || prop.name,
      description: prop.description || '',
      helpText: '',
      isRequired: prop.isRequired ?? false,
      isPrimaryKey: prop.name.toLowerCase() === 'id',
      isUnique: prop.isUnique ?? false,
      isIndexed: false,
      isReadonly: prop.isReadOnly ?? false,
      maxLength: prop.maxLength,
      minLength: prop.minLength,
      minValue: prop.minValue,
      maxValue: prop.maxValue,
      defaultValue: prop.defaultValue,
      enumValues: [],
      validationRules: prop.validationRules?.map(r => ({
        ruleType: r.name || 'unknown',
        ruleValue: r.condition || '',
        errorMessage: r.errorMessage || ''
      })) || [],
      displayOrder: index + 1,
      groupName: 'default',
      isVisible: true,
      listVisible: true,
      detailVisible: true,
      formVisible: true,
      searchable: !prop.isReadOnly
    })) as any,

    relationships: (entity.navigationProperties?.map(nav => ({
      id: generateId('rel', nav.name),
      name: nav.name,
      displayName: nav.name,
      sourceEntityId: generateId('entity', entity.name),
      targetEntityId: generateId('entity', nav.targetEntity),
      targetEntity: nav.targetEntity,
      type: nav.relationType === 'ManyToMany' ? 'ManyToMany' : nav.relationType,
      sourceProperty: nav.foreignKey || '',
      targetProperty: nav.inverseName || '',
      sourceNavigationProperty: nav.name,
      targetNavigationProperty: nav.inverseName || '',
      description: ''
    })) || []) as any,

    uiConfig: {
      listPage: {
        displayFields: entity.xUiConfig?.listColumns || [],
        searchFields: entity.xUiConfig?.searchFields || [],
        sortField: entity.xUiConfig?.defaultSort || '',
        sortOrder: 'asc' as const,
        pageSize: entity.xUiConfig?.pageSize || 10
      },
      formPage: {
        layout: 'vertical' as const,
        labelWidth: 120,
        fieldGroups: [{
          name: 'default',
          displayName: '默认分组',
          fields: entity.xUiConfig?.formFields || []
        }]
      },
      detailPage: {
        layout: 'vertical' as const,
        labelWidth: 120,
        displayFields: entity.xUiConfig?.listColumns || []
      }
    } as any,

    codeGeneration: {
      generateEntity: true,
      generateRepository: entity.xBackendConfig?.generateRepository ?? true,
      generateAppService: entity.xBackendConfig?.generateAppService ?? false,
      generateController: entity.xBackendConfig?.generateController ?? false,
      generateDto: entity.xBackendConfig?.generateDto ?? false,
      generateFrontend: false,
      generateTests: false
    }
  }

  // D2务实方案：使用类型断言（实际项目中应避免直接传入 EntityMetadata）
  return result as UnifiedEntityDefinition
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 检查转换是否成功
 */
export function validateConversion(
  original: UnifiedEntityDefinition,
  converted: EntityMetadata
): boolean {
  return (
    original.name === converted.name &&
    original.module === converted.module &&
    original.fields.length === converted.properties.length
  )
}

/**
 * 获取转换统计信息
 */
export function getConversionStats(entities: UnifiedEntityDefinition[]) {
  return {
    totalEntities: entities.length,
    totalFields: entities.reduce((sum, entity) => sum + entity.fields.length, 0),
    totalRelationships: entities.reduce((sum, entity) => sum + (entity.relationships?.length || 0), 0),
    conversionTime: Date.now()
  }
}
