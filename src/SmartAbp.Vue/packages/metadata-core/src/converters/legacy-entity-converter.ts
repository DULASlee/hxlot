/**
 * @smartabp/metadata-core/converters
 * Legacy EntityDefinition to EntityMetadata 转换器
 * 
 * 功能：
 * - 将旧版EntityDefinition格式转换为新的EntityMetadata格式
 * - 支持lowcode-api中的EntityDefinition
 * - 自动推断缺失字段
 * - 验证转换结果
 */

import type { EntityMetadata, PropertyMetadata } from '../types'
import { validateEntityMetadata } from '../validators/entity-validator'

// ========================================
// 旧版EntityDefinition类型定义
// ========================================

/**
 * 旧版EntityDefinition（从lowcode-api/types.ts）
 */
export interface LegacyEntityDefinition {
  name: string
  displayName?: string
  tableName?: string
  module: string
  aggregate: string
  description: string
  isAggregateRoot: boolean
  isMultiTenant: boolean
  isSoftDelete: boolean
  hasExtraProperties: boolean
  properties: LegacyPropertyDefinition[]
}

export interface LegacyPropertyDefinition {
  name: string
  displayName?: string
  type: string
  isRequired: boolean
  maxLength?: number
  minLength?: number
  description: string
  filterable?: boolean
  showInList?: boolean
  sortable?: boolean
  defaultValue?: any
  validation?: {
    pattern?: string
    message?: string
  }
  options?: Array<{ label: string; value: any }>
}

// ========================================
// 转换选项
// ========================================

export interface EntityConvertOptions {
  /**
   * 是否验证转换结果
   * @default true
   */
  validate?: boolean
  
  /**
   * 默认主键类型
   * @default 'Guid'
   */
  defaultKeyType?: 'Guid' | 'int' | 'long' | 'string'
  
  /**
   * 是否从properties推断UI配置
   * @default true
   */
  inferUIConfig?: boolean
  
  /**
   * 是否从properties推断后端配置
   * @default true
   */
  inferBackendConfig?: boolean
}

// ========================================
// 核心转换函数
// ========================================

/**
 * 将LegacyEntityDefinition转换为EntityMetadata
 * 
 * @example
 * const legacyEntity = loadLegacyEntity()
 * const entityMetadata = convertLegacyEntityToMetadata(legacyEntity)
 */
export function convertLegacyEntityToMetadata(
  legacyEntity: LegacyEntityDefinition,
  options: EntityConvertOptions = {}
): EntityMetadata {
  const {
    validate = true,
    defaultKeyType = 'Guid',
    inferUIConfig = true,
    inferBackendConfig = true
  } = options
  
  // 转换属性
  const properties = convertProperties(legacyEntity.properties)
  
  // 推断UI配置
  const xUiConfig = inferUIConfig ? inferUIConfigFromProperties(legacyEntity.properties) : undefined
  
  // 推断后端配置
  const xBackendConfig = inferBackendConfig
    ? {
        generateRepository: true,
        generateAppService: true,
        generateController: true,
        generateDto: true
      }
    : undefined
  
  // 构建EntityMetadata
  const entityMetadata: EntityMetadata = {
    name: legacyEntity.name,
    module: legacyEntity.module,
    aggregate: legacyEntity.aggregate,
    keyType: defaultKeyType,
    description: legacyEntity.description,
    isAggregateRoot: legacyEntity.isAggregateRoot,
    isMultiTenant: legacyEntity.isMultiTenant,
    isSoftDelete: legacyEntity.isSoftDelete,
    hasExtraProperties: legacyEntity.hasExtraProperties,
    properties,
    xUiConfig,
    xBackendConfig
  }
  
  // 验证转换结果
  if (validate) {
    try {
      validateEntityMetadata(entityMetadata)
    } catch (error) {
      throw new Error(
        `转换后的EntityMetadata验证失败: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }
  
  return entityMetadata
}

// ========================================
// 属性转换
// ========================================

/**
 * 转换属性列表
 */
function convertProperties(
  legacyProperties: LegacyPropertyDefinition[]
): PropertyMetadata[] {
  return legacyProperties.map(convertProperty)
}

/**
 * 转换单个属性
 */
function convertProperty(legacyProp: LegacyPropertyDefinition): PropertyMetadata {
  const property: PropertyMetadata = {
    name: legacyProp.name,
    type: legacyProp.type,
    isRequired: legacyProp.isRequired,
    isReadOnly: false, // Legacy中没有此字段，默认false
    isUnique: false, // Legacy中没有此字段，默认false
    displayName: legacyProp.displayName,
    description: legacyProp.description
  }
  
  // 长度约束
  if (legacyProp.maxLength !== undefined) {
    property.maxLength = legacyProp.maxLength
  }
  if (legacyProp.minLength !== undefined) {
    property.minLength = legacyProp.minLength
  }
  
  // 默认值
  if (legacyProp.defaultValue !== undefined) {
    property.defaultValue = String(legacyProp.defaultValue)
  }
  
  // 验证规则
  if (legacyProp.validation) {
    property.validationRules = [
      {
        name: 'pattern',
        condition: legacyProp.validation.pattern || '',
        errorMessage: legacyProp.validation.message || '验证失败'
      }
    ]
  }
  
  return property
}

// ========================================
// UI配置推断
// ========================================

/**
 * 从属性推断UI配置
 */
function inferUIConfigFromProperties(
  legacyProperties: LegacyPropertyDefinition[]
): EntityMetadata['xUiConfig'] {
  const listColumns: string[] = []
  const formFields: string[] = []
  const searchFields: string[] = []
  
  for (const prop of legacyProperties) {
    // 列表列
    if (prop.showInList) {
      listColumns.push(prop.name)
    }
    
    // 表单字段（所有非只读字段）
    formFields.push(prop.name)
    
    // 搜索字段（filterable的字段）
    if (prop.filterable) {
      searchFields.push(prop.name)
    }
  }
  
  // 查找第一个sortable字段作为默认排序
  const sortableField = legacyProperties.find(p => p.sortable)
  const defaultSort = sortableField ? sortableField.name : undefined
  
  return {
    listColumns: listColumns.length > 0 ? listColumns : undefined,
    formFields: formFields.length > 0 ? formFields : undefined,
    searchFields: searchFields.length > 0 ? searchFields : undefined,
    defaultSort,
    pageSize: 20
  }
}

// ========================================
// 批量转换
// ========================================

/**
 * 批量转换多个实体
 */
export function convertLegacyEntitiesToMetadata(
  legacyEntities: LegacyEntityDefinition[],
  options: EntityConvertOptions = {}
): EntityMetadata[] {
  return legacyEntities.map(entity => convertLegacyEntityToMetadata(entity, options))
}

// ========================================
// 反向转换（EntityMetadata → LegacyEntityDefinition）
// ========================================

/**
 * 将EntityMetadata转换回LegacyEntityDefinition格式（用于兼容性）
 */
export function convertMetadataToLegacyEntity(
  entityMetadata: EntityMetadata
): LegacyEntityDefinition {
  return {
    name: entityMetadata.name,
    module: entityMetadata.module,
    aggregate: entityMetadata.aggregate || '',
    description: entityMetadata.description || '',
    isAggregateRoot: entityMetadata.isAggregateRoot,
    isMultiTenant: entityMetadata.isMultiTenant,
    isSoftDelete: entityMetadata.isSoftDelete,
    hasExtraProperties: entityMetadata.hasExtraProperties,
    properties: convertPropertiesReverse(entityMetadata.properties, entityMetadata.xUiConfig)
  }
}

/**
 * 反向转换属性
 */
function convertPropertiesReverse(
  properties: PropertyMetadata[],
  uiConfig?: EntityMetadata['xUiConfig']
): LegacyPropertyDefinition[] {
  return properties.map(prop => {
    const legacyProp: LegacyPropertyDefinition = {
      name: prop.name,
      displayName: prop.displayName,
      type: prop.type,
      isRequired: prop.isRequired,
      description: prop.description || '',
      showInList: uiConfig?.listColumns?.includes(prop.name),
      filterable: uiConfig?.searchFields?.includes(prop.name),
      sortable: uiConfig?.defaultSort === prop.name
    }
    
    if (prop.maxLength !== undefined) {
      legacyProp.maxLength = prop.maxLength
    }
    if (prop.minLength !== undefined) {
      legacyProp.minLength = prop.minLength
    }
    if (prop.defaultValue !== undefined) {
      legacyProp.defaultValue = prop.defaultValue
    }
    
    // 转换验证规则
    if (prop.validationRules && prop.validationRules.length > 0) {
      const rule = prop.validationRules[0]
      if (rule) {
        legacyProp.validation = {
          pattern: rule.condition,
          message: rule.errorMessage
        }
      }
    }
    
    return legacyProp
  })
}

// ========================================
// 工具函数
// ========================================

/**
 * 检查是否为有效的LegacyEntityDefinition
 */
export function isValidLegacyEntity(obj: any): obj is LegacyEntityDefinition {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.name === 'string' &&
    typeof obj.module === 'string' &&
    typeof obj.isAggregateRoot === 'boolean' &&
    typeof obj.isMultiTenant === 'boolean' &&
    typeof obj.isSoftDelete === 'boolean' &&
    typeof obj.hasExtraProperties === 'boolean' &&
    Array.isArray(obj.properties)
  )
}

/**
 * 获取转换摘要
 */
export function getEntityConversionSummary(
  legacyEntity: LegacyEntityDefinition,
  entityMetadata: EntityMetadata
): string {
  return `
转换完成: ${legacyEntity.name} (${legacyEntity.module})
  属性数量: ${legacyEntity.properties.length}个
  主键类型: ${entityMetadata.keyType}
  聚合根: ${entityMetadata.isAggregateRoot ? '是' : '否'}
  多租户: ${entityMetadata.isMultiTenant ? '是' : '否'}
  软删除: ${entityMetadata.isSoftDelete ? '是' : '否'}
  UI配置: ${entityMetadata.xUiConfig ? '已推断' : '未生成'}
`.trim()
}

/**
 * 从ModuleMetadata中提取所有实体（如果存在）
 */
export function extractEntitiesFromLegacyModule(
  legacyModule: any
): LegacyEntityDefinition[] {
  if (legacyModule && Array.isArray(legacyModule.entities)) {
    return legacyModule.entities.filter(isValidLegacyEntity)
  }
  return []
}

