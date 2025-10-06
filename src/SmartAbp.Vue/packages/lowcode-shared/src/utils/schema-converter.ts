/**
 * Schema类型转换工具
 * 
 * 用于前后端类型的双向转换
 * 
 * @author SmartAbp架构团队
 * @date 2025-10-05
 */

import type {
    UnifiedEntityDefinition,
    UnifiedEntityField,
    UnifiedEntityRelationship,
    UnifiedModuleMetadata,
    UnifiedValidationRule,
} from '../types/unified-schema'

/**
 * 后端DTO → 前端统一Schema转换器
 */
export class SchemaConverter {

    /**
     * 转换ModuleMetadataDto → UnifiedModuleMetadata
     * 
     * @param dto 后端DTO
     * @returns 前端统一Schema
     */
    static fromBackendModuleDto(dto: Record<string, any>): UnifiedModuleMetadata {
        return {
            id: dto.id || '',
            systemName: dto.systemName || '',
            name: dto.name || '',
            displayName: dto.displayName || '',
            description: dto.description || '',
            version: dto.version || '1.0.0',
            namespace: dto.namespace || '',
            architecturePattern: dto.architecturePattern || 'Crud',
            author: dto.author || 'SmartAbp Generator',
            databaseInfo: {
                connectionStringName: dto.databaseInfo?.connectionStringName || 'Default',
                schema: dto.databaseInfo?.schema || 'dbo',
                provider: dto.databaseInfo?.provider || 'SqlServer',
            },
            frontend: {
                parentId: dto.frontend?.parentId || '',
                routePrefix: dto.frontend?.routePrefix || '',
            },
            generateMobilePages: dto.generateMobilePages || false,
            featureManagement: {
                isEnabled: dto.featureManagement?.isEnabled || false,
                defaultPolicy: dto.featureManagement?.defaultPolicy || '',
            },
            entities: (dto.entities || []).map((e: Record<string, any>) =>
                SchemaConverter.fromBackendEntityDto(e)
            ),
            menuConfig: dto.menuConfig || [],
            permissionConfig: dto.permissionConfig || { groupName: '', permissions: [] },
            dependencies: dto.dependencies || [],
            schemaVersion: '1.0.0',
            createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
            updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
        }
    }

    /**
     * 转换EnhancedEntityModelDto → UnifiedEntityDefinition
     * 
     * @param dto 后端DTO
     * @returns 前端统一Schema
     */
    static fromBackendEntityDto(dto: Record<string, any>): UnifiedEntityDefinition {
        return {
            id: dto.id || '',
            name: dto.name || '',
            displayName: dto.displayName || '',
            tableName: dto.tableName || '',
            module: dto.module || '',
            namespace: dto.namespace || '',
            description: dto.description || '',
            schema: dto.schema || 'dbo',
            isAggregateRoot: dto.isAggregateRoot || false,
            baseClass: dto.baseClass || 'Entity<Guid>',
            interfaces: dto.interfaces || [],
            isAudited: dto.isAudited || false,
            isSoftDelete: dto.isSoftDelete || false,
            isMultiTenant: dto.isMultiTenant || false,
            fields: (dto.properties || []).map((p: Record<string, any>) =>
                SchemaConverter.fromBackendPropertyDto(p)
            ),
            relationships: (dto.relationships || []).map((r: Record<string, any>) =>
                SchemaConverter.fromBackendRelationshipDto(r)
            ),
            validationRules: (dto.properties || [])
                .flatMap((p: Record<string, any>) => (p.validationRules || []).map((r: Record<string, any>) =>
                    SchemaConverter.fromBackendValidationRuleDto(r, p.name)
                )),
            businessRules: dto.businessRules || [],
            indexes: dto.indexes || [],
            constraints: dto.constraints || [],
            permissions: dto.permissions || [],
            uiConfig: dto.uiConfig || {
                listPage: {
                    pageSize: 10,
                    sortField: 'id',
                    sortOrder: 'desc',
                    searchFields: [],
                    displayFields: []
                },
                formPage: {
                    layout: 'horizontal',
                    labelWidth: 120,
                    fieldGroups: []
                },
                detailPage: {
                    layout: 'card',
                    displayFields: []
                },
            },
            codeGeneration: dto.codeGeneration || {
                generateEntity: true,
                generateDto: true,
                generateAppService: true,
                generateController: true,
                generateRepository: true,
                generateFrontend: true,
                generateTests: true,
            },
            isCompleted: dto.isCompleted || false,
            tags: dto.tags || [],
            schemaVersion: '1.0.0',
            version: dto.version || '1.0.0',
            createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
            updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
        }
    }

    /**
     * 转换EntityPropertyDto → UnifiedEntityField
     * 
     * @param dto 后端DTO
     * @returns 前端统一Schema
     */
    static fromBackendPropertyDto(dto: Record<string, any>): UnifiedEntityField {
        return {
            id: dto.id || '',
            name: dto.name || '',
            displayName: dto.displayName || '',
            type: dto.type || 'string',
            description: dto.description || '',
            helpText: dto.helpText || '',
            isRequired: dto.isRequired || false,
            isPrimaryKey: dto.isKey || dto.isPrimaryKey || false,
            isUnique: dto.isUnique || false,
            isIndexed: dto.isIndexed || false,
            defaultValue: dto.defaultValue,
            maxLength: dto.maxLength,
            minLength: dto.minLength,
            pattern: dto.pattern,
            precision: dto.precision,
            scale: dto.scale,
            minValue: dto.minValue,
            maxValue: dto.maxValue,
            enumValues: dto.enumValues || [],
            validationRules: (dto.validationRules || []).map((r: Record<string, any>) =>
                SchemaConverter.fromBackendValidationRuleDto(r, dto.name)
            ),
            displayOrder: dto.displayOrder || 0,
            groupName: dto.groupName || '',
            isVisible: dto.isVisible !== false,
            isReadonly: dto.isReadonly || false,
            listVisible: dto.listVisible !== false,
            detailVisible: dto.detailVisible !== false,
            formVisible: dto.formVisible !== false,
            searchable: dto.searchable || false,
            sortable: dto.sortable || false,
            filterable: dto.filterable || false,
            disabled: dto.disabled || false,
            columnName: dto.columnName || dto.name,
            columnType: dto.columnType || '',
            isAuditField: dto.isAuditField || false,
            isSoftDeleteField: dto.isSoftDeleteField || false,
            isTenantField: dto.isTenantField || false,
        }
    }

    /**
     * 转换ValidationRuleDto → UnifiedValidationRule
     * 
     * @param dto 后端DTO
     * @param fieldName 字段名称
     * @returns 前端统一Schema
     */
    static fromBackendValidationRuleDto(dto: Record<string, any>, fieldName: string): UnifiedValidationRule {
        return {
            id: dto.id,
            fieldName: fieldName,
            ruleType: dto.ruleType || dto.type || 'required',
            ruleValue: dto.ruleValue || dto.value?.toString() || '',
            errorMessage: dto.errorMessage || dto.message || '',
            trigger: dto.trigger || 'blur',
        }
    }

    /**
     * 转换RelationshipDto → UnifiedEntityRelationship
     * 
     * @param dto 后端DTO
     * @returns 前端统一Schema
     */
    static fromBackendRelationshipDto(dto: Record<string, any>): UnifiedEntityRelationship {
        return {
            id: dto.id || '',
            name: dto.name || '',
            displayName: dto.displayName || '',
            sourceEntityId: dto.sourceEntityId || '',
            targetEntityId: dto.targetEntityId || '',
            targetEntity: dto.targetEntity || '',
            type: dto.type || 'OneToMany',
            sourceProperty: dto.sourceProperty || '',
            targetProperty: dto.targetProperty || '',
            sourceNavigationProperty: dto.sourceNavigationProperty || '',
            targetNavigationProperty: dto.targetNavigationProperty || '',
            description: dto.description || '',
        }
    }

    // ============================================================================
    // 前端统一Schema → 后端DTO（用于保存）
    // ============================================================================

    /**
     * 转换UnifiedModuleMetadata → ModuleMetadataDto
     * 
     * @param schema 前端统一Schema
     * @returns 后端DTO
     */
    static toBackendModuleDto(schema: UnifiedModuleMetadata): Record<string, any> {
        return {
            id: schema.id,
            systemName: schema.systemName,
            name: schema.name,
            displayName: schema.displayName,
            description: schema.description,
            version: schema.version,
            architecturePattern: schema.architecturePattern,
            namespace: schema.namespace,
            author: schema.author,
            databaseInfo: {
                connectionStringName: schema.databaseInfo.connectionStringName,
                schema: schema.databaseInfo.schema,
                provider: schema.databaseInfo.provider,
            },
            frontend: {
                parentId: schema.frontend.parentId,
                routePrefix: schema.frontend.routePrefix,
            },
            generateMobilePages: schema.generateMobilePages,
            featureManagement: {
                isEnabled: schema.featureManagement.isEnabled,
                defaultPolicy: schema.featureManagement.defaultPolicy,
            },
            entities: schema.entities.map(e => SchemaConverter.toBackendEntityDto(e)),
            menuConfig: schema.menuConfig,
            permissionConfig: schema.permissionConfig,
            dependencies: schema.dependencies,
        }
    }

    /**
     * 转换UnifiedEntityDefinition → EnhancedEntityModelDto
     * 
     * @param schema 前端统一Schema
     * @returns 后端DTO
     */
    static toBackendEntityDto(schema: UnifiedEntityDefinition): Record<string, any> {
        return {
            id: schema.id,
            name: schema.name,
            displayName: schema.displayName,
            description: schema.description,
            module: schema.module,
            namespace: schema.namespace,
            isAggregateRoot: schema.isAggregateRoot,
            isAudited: schema.isAudited,
            isSoftDelete: schema.isSoftDelete,
            isMultiTenant: schema.isMultiTenant,
            baseClass: schema.baseClass,
            interfaces: schema.interfaces,
            properties: schema.fields.map(f => SchemaConverter.toBackendPropertyDto(f)),
            relationships: schema.relationships,
            tableName: schema.tableName,
            schema: schema.schema,
            indexes: schema.indexes,
            constraints: schema.constraints,
            businessRules: schema.businessRules,
            permissions: schema.permissions,
            codeGeneration: schema.codeGeneration,
            uiConfig: schema.uiConfig,
            version: schema.version,
            tags: schema.tags,
        }
    }

    /**
     * 转换UnifiedEntityField → EntityPropertyDto
     * 
     * @param field 前端统一Schema
     * @returns 后端DTO
     */
    static toBackendPropertyDto(field: UnifiedEntityField): Record<string, any> {
        return {
            id: field.id,
            name: field.name,
            displayName: field.displayName,
            type: field.type,
            isRequired: field.isRequired,
            isKey: field.isPrimaryKey,
            isUnique: field.isUnique,
            isIndexed: field.isIndexed,
            defaultValue: field.defaultValue,
            description: field.description,
            helpText: field.helpText,
            maxLength: field.maxLength,
            minLength: field.minLength,
            pattern: field.pattern,
            precision: field.precision,
            scale: field.scale,
            minValue: field.minValue,
            maxValue: field.maxValue,
            enumValues: field.enumValues,
            validationRules: field.validationRules.map(r =>
                SchemaConverter.toBackendValidationRuleDto(r)
            ),
            displayOrder: field.displayOrder,
            groupName: field.groupName,
            isVisible: field.isVisible,
            isReadonly: field.isReadonly,
            listVisible: field.listVisible,
            detailVisible: field.detailVisible,
            formVisible: field.formVisible,
            searchable: field.searchable,
            sortable: field.sortable,
            filterable: field.filterable,
            disabled: field.disabled,
            columnName: field.columnName,
            columnType: field.columnType,
            isAuditField: field.isAuditField,
            isSoftDeleteField: field.isSoftDeleteField,
            isTenantField: field.isTenantField,
        }
    }

    /**
     * 转换UnifiedValidationRule → ValidationRuleDto
     * 
     * @param rule 前端统一Schema
     * @returns 后端DTO
     */
    static toBackendValidationRuleDto(rule: UnifiedValidationRule): Record<string, any> {
        return {
            id: rule.id,
            ruleType: rule.ruleType,
            ruleValue: rule.ruleValue,
            errorMessage: rule.errorMessage,
        }
    }

    // ============================================================================
    // 批量转换工具
    // ============================================================================

    /**
     * 批量转换实体数组
     * 
     * @param dtos 后端DTO数组
     * @returns 前端统一Schema数组
     */
    static fromBackendEntityDtoArray(dtos: Record<string, any>[]): UnifiedEntityDefinition[] {
        return dtos.map(dto => SchemaConverter.fromBackendEntityDto(dto))
    }

    /**
     * 批量转换字段数组
     * 
     * @param dtos 后端DTO数组
     * @returns 前端统一Schema数组
     */
    static fromBackendPropertyDtoArray(dtos: Record<string, any>[]): UnifiedEntityField[] {
        return dtos.map(dto => SchemaConverter.fromBackendPropertyDto(dto))
    }
}

/**
 * 导出转换器实例（单例）
 */
export const schemaConverter = SchemaConverter

