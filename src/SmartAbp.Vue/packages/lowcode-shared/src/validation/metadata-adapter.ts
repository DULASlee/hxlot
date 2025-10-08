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

// 🚀 从metadata-core导入统一类型定义
import type {
    BackendConfig,
    EntityMetadata,
    ValidationRule as MetadataCoreValidationRule,
    ModuleMetadata,
    NavigationPropertyMetadata,
    PropertyMetadata,
    UIConfig
} from '@smartabp/metadata-core'

import type {
    UnifiedCodeGenerationConfig,
    UnifiedEntityDefinition,
    UnifiedEntityField,
    UnifiedEntityRelationship,
    UnifiedEntityUIConfig,
    UnifiedModuleMetadata,
    UnifiedValidationRule
} from '../types/unified-schema'

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
// 反向转换器（可选，用于调试）
// ============================================================================

/**
 * 将EntityMetadata转换回UnifiedEntityDefinition（用于调试）
 */
export function convertEntityFromMetadataCore(entity: EntityMetadata): Partial<UnifiedEntityDefinition> {
    // 简化的反向转换，仅用于调试和验证
    // 注意：这是不完整的转换，因为UnifiedEntityDefinition有更多必需字段
    return {
        name: entity.name,
        module: entity.module,
        description: entity.description,
        isAggregateRoot: entity.isAggregateRoot,
        isMultiTenant: entity.isMultiTenant,
        isSoftDelete: entity.isSoftDelete,
        // 注意：这里只返回基础字段，完整的UnifiedEntityDefinition需要更多字段
        // 如需完整转换，请根据实际需求补充所有必需字段
    }
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
