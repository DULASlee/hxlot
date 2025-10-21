/**
 * 🎯 后端契约类型系统 - 31级AlphaGO分析最优解
 *
 * Phase 3C: packages完全独立的类型定义系统
 *
 * 架构原则：
 * - 铁律一：packages类型完全独立，不依赖主应用
 * - 铁律二：类型定义基于后端契约，确保一致性
 * - 铁律三：向后兼容，支持渐进式迁移
 *
 * 数据来源：基于后端NSwag生成的DTO，手工同步保证一致性
 * 维护策略：阶段1手工维护，阶段2自动化工具，阶段3完全自动化
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 核心实体和模块契约类型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 实体定义契约
 * 对应后端: SmartAbp.Application.Contracts.LowCode.Dtos.EntityDefinitionDto
 */
export interface EntityDefinitionDto {
    id?: string;
    creationTime?: string;
    creatorId?: string | null;
    lastModificationTime?: string | null;
    lastModifierId?: string | null;
    isDeleted?: boolean;
    deleterId?: string | null;
    deletionTime?: string | null;
    name?: string | null;
    tableName?: string | null;
    displayName?: string | null;
    description?: string | null;
    entityType?: string | null;
    baseType?: string | null;
    namespace?: string | null;
    schema?: string | null;
    isAggregateRoot?: boolean;
    baseClass?: string | null;
    interfaces?: Array<string> | null;
    isAudited?: boolean;
    isSoftDelete?: boolean;
    isMultiTenant?: boolean;
    fields?: Array<EntityFieldDto> | null;
    relationships?: Array<EntityRelationDto> | null;
    validationRules?: Array<ValidationRuleDto> | null;
    businessRules?: Array<BusinessRuleDto> | null;
    indexes?: Array<EntityIndexDto> | null;
    constraints?: Array<EntityConstraintDto> | null;
    permissions?: Array<EntityPermissionDto> | null;
    pageConfig?: PageConfigDto | null;
    codeGeneration?: CodeGenerationConfigDto | null;
    tenantId?: string | null;
    navigationProperties?: Array<NavigationPropertyDto> | null;
    moduleId?: string | null;
    isCompleted?: boolean;
    tags?: Array<string> | null;
    schemaVersion?: string | null;
    version?: string | null;
}

/**
 * 模块契约
 * 对应后端: SmartAbp.Application.Contracts.LowCode.Dtos.ModuleDto
 */
export interface ModuleDto {
    id?: string;
    systemName?: string | null;
    moduleName?: string | null;
    name?: string | null; // 向后兼容：别名到moduleName
    displayName?: string | null;
    description?: string | null;
    namespace?: string | null;
    version?: string | null;
    architectureConfig?: ModuleArchitectureConfig | null;
    frontendConfig?: ModuleFrontendConfig | null;
    codeGenOptions?: ModuleCodeGenOptions | null;
    permissionConfig?: ModulePermissionConfig | null;
    featureManagement?: ModuleFeatureManagement | null;
    status?: string | null;
    isActive?: boolean;
    tenantId?: string | null;
    entities?: Array<EntityDefinitionDto> | null;
    dependencies?: Array<string> | null;
    schemaVersion?: string | null;
    creationTime?: string;
    creatorId?: string | null;
    lastModificationTime?: string | null;
    lastModifierId?: string | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 支撑类型契约
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface EntityFieldDto {
    id?: string;
    entityDefinitionId?: string;
    name?: string | null;
    displayName?: string | null;
    type?: string | null;
    length?: number | null;
    isRequired?: boolean;
    isUnique?: boolean;
    isIndexed?: boolean;
    defaultValue?: string | null;
    comment?: string | null;
    order?: number;
    isPrimaryKey?: boolean;
    minLength?: number | null;
    precision?: number | null;
    scale?: number | null;
    minValue?: number | null;
    maxValue?: number | null;
    pattern?: string | null;
    enumValues?: Array<EnumValueDto> | null;
    validationRules?: Array<ValidationRuleDto> | null;
    uiConfig?: PropertyUIConfig | null;
    columnName?: string | null;
    columnType?: string | null;
    isAuditField?: boolean;
    isSoftDeleteField?: boolean;
    isTenantField?: boolean;

    // 🔗 向后兼容性字段（方便访问）
    /** @deprecated 使用 length 替代 */
    maxLength?: number | null;
    /** @deprecated 使用 comment 替代 */
    description?: string | null;
    /** @deprecated 使用 uiConfig.searchable 替代 */
    searchable?: boolean;
    /** @deprecated 使用 order 替代 */
    sort?: number;
}

export interface EntityIndexDto {
    id?: string;
    entityDefinitionId?: string;
    name?: string | null;
    columns?: Array<string> | null;  // 修正：后端C#使用Columns，不是fields
    isUnique?: boolean;
    isClustered?: boolean;  // 补充缺失字段
}

export interface EntityConstraintDto {
    id?: string;
    name?: string | null;
    type?: string | null;
    expression?: string | null;
}

export interface EntityPermissionDto {
    id?: string;
    name?: string | null;
    permissionName?: string | null;
    condition?: string | null;
}

export interface EntityRelationDto {
    id?: string;
    creationTime?: string;
    creatorId?: string | null;
    lastModificationTime?: string | null;
    lastModifierId?: string | null;
    isDeleted?: boolean;
    deleterId?: string | null;
    deletionTime?: string | null;
    fromEntity?: string | null;
    toEntity?: string | null;
    type?: 0 | 1 | 2 | 3;
    foreignKey?: string | null;
    navigationProperty?: string | null;
    joinTable?: string | null;
    cascadeDelete?: boolean;
    tenantId?: string | null;

    // 🔗 向后兼容性字段
    /** @deprecated 使用 toEntity 替代 */
    targetEntityId?: string | null;
    /** @deprecated 使用 navigationProperty 替代 */
    targetNavigationProperty?: string | null;
    /** @deprecated 使用 toEntity 替代 */
    targetEntity?: string | null;
    /** @deprecated 使用 type 替代（RelationType枚举） */
    relationType?: string | null;
}

export interface NavigationPropertyDto {
    id?: string;
    name?: string | null;
    propertyType?: string | null;
    entityName?: string | null;
    isCollection?: boolean;
    foreignKey?: string | null;
    isNullable?: boolean;
    description?: string | null;
}

export interface BusinessRuleDto {
    id?: string;
    name?: string | null;
    description?: string | null;
    condition?: string | null;
    action?: string | null;
    priority?: number;
    isActive?: boolean;
}

export interface ValidationRuleDto {
    id?: string;
    type?: string | null;
    parameters?: Record<string, any> | null;
    errorMessage?: string | null;
}

export interface CodeGenerationConfigDto {
    generateController?: boolean;
    generateService?: boolean;
    generateRepository?: boolean;
    generateDTO?: boolean;
    generateEntity?: boolean;
    generateTests?: boolean;
    template?: string | null;
    outputPath?: string | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 页面配置契约类型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PageConfigDto {
    listConfig?: ListConfig | null;
    formConfig?: FormConfig | null;
    detailConfig?: DetailConfig | null;
    layoutConfig?: LayoutConfig | null;
    events?: Record<string, EventConfig> | undefined;
}

export interface PropertyUIConfig {
    listVisible?: boolean;
    formVisible?: boolean;
    detailVisible?: boolean;
    searchable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
    controlType: string;
    controlProps?: Record<string, any> | null;
    dataSource?: DataSourceConfig | null;
    list?: ListFieldConfig | null;
    form?: FormFieldConfig | null;
    displayFormat?: string | null;
    prefix?: string | null;
    suffix?: string | null;
}

export interface EnumValueDto {
    id?: string;
    name?: string | null;
    value?: any;
    displayName?: string | null;
}

export interface DataSourceConfig {
    type?: string | null;
    url?: string | null;
    labelField?: string | null;
    valueField?: string | null;
    params?: Record<string, any> | null;
}

export interface FormFieldConfig {
    span?: number;
    offset?: number;
    hidden?: boolean;
}

export interface ListFieldConfig {
    width?: number;
    sortable?: boolean;
    filterable?: boolean;
}

export interface ListConfig {
    pageSize?: number;
    showPagination?: boolean;
    enableSelection?: boolean;
    columns?: Array<ColumnDefinition> | null;
    actions?: Array<ActionConfig> | null;
    pagination?: PaginationConfig | null;
}

export interface FormConfig {
    layout?: string | null;
    labelWidth?: number;
    validateOnChange?: boolean;
    submitButton?: ActionConfig | null;
    cancelButton?: ActionConfig | null;
    rules?: Array<FormCreateRule> | null;
    effects?: Array<FieldEffect> | null;
    global?: FormGlobalConfig | null;
}

export interface DetailConfig {
    layout?: string | null;
    sections?: Array<DetailSection> | null;
}

export interface LayoutConfig {
    type?: string | null;
    columns?: number;
    spacing?: number;
}

export interface EventConfig {
    id?: string | null;
    name?: string | null;
    trigger?: string | null;
    action?: string | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 模块配置契约类型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ModuleArchitectureConfig {
    databaseProvider?: string | null;
    useMultiTenancy?: boolean;
    enableAuditing?: boolean;
    enableSoftDelete?: boolean;
}

export interface ModuleFrontendConfig {
    framework?: string | null;
    uiLibrary?: string | null;
    routePrefix?: string | null;
    menuConfig?: Array<MenuConfigItem> | null;
    themeConfig?: Record<string, any> | null;
}

export interface ModuleCodeGenOptions {
    generateFrontend?: boolean;
    generateBackend?: boolean;
    generateMobilePages?: boolean;
    frontendFramework?: string | null;
    backendTemplate?: string | null;
}

export interface ModulePermissionConfig {
    permissionGroups?: Array<PermissionGroupConfig> | null;
    defaultPermissions?: Array<string> | null;
}

export interface ModuleFeatureManagement {
    enableAdvancedQuery?: boolean;
    enableBatchOperations?: boolean;
    enableImportExport?: boolean;
    enableVersioning?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 辅助类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface MenuConfigItem {
    id?: string;
    label?: string | null;
    icon?: string | null;
    route?: string | null;
    children?: Array<MenuConfigItem> | null;
    permissions?: Array<string> | null;
    sort?: number;
    hidden?: boolean;
}

export interface PermissionGroupConfig {
    name?: string | null;
    displayName?: string | null;
    permissions?: Array<string> | null;
}

export interface ColumnDefinition {
    field?: string | null;
    title?: string | null;
    width?: number;
    sortable?: boolean;
    filterable?: boolean;
}

export interface ActionConfig {
    id?: string | null;
    name?: string | null;
    type?: string | null;
    text?: string | null;
    icon?: string | null;
}

export interface PaginationConfig {
    showTotal?: boolean;
    showSizeChanger?: boolean;
    pageSizes?: Array<number> | null;
}

export interface FormCreateRule {
    field?: string | null;
    trigger?: string | null;
    validator?: string | null;
    config?: ValidationRuleConfig | null;
}

export interface FieldEffect {
    field?: string | null;
    trigger?: string | null;
    effect?: string | null;
    config?: Record<string, any> | null;
}

export interface FormGlobalConfig {
    showResetButton?: boolean;
    submitOnEnter?: boolean;
    validateOnBlur?: boolean;
}

export interface DetailSection {
    id?: string | null;
    title?: string | null;
    fields?: Array<string> | null;
    layout?: string | null;
}

export interface ValidationRuleConfig {
    min?: number;
    max?: number;
    pattern?: string | null;
    message?: string | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 Layer2 (SmartStudio Lite) 契约类型
// 对应后端: SmartAbp.Application.Contracts.LowCode.Dtos.SimplifiedModuleCreationDto
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Layer2 简化的模块创建DTO
 * 提供渐进式用户体验，相比Layer1增加字段配置能力
 */
export interface SimplifiedModuleCreationDto {
    systemName: string;
    moduleName: string;
    displayName: string;
    description?: string | null;
    entityName: string;
    entityDisplayName: string;
    fields: SimplifiedFieldConfigDto[];
    architecturePattern?: string | null;
    databaseProvider?: string | null;
    parentMenuId?: string | null;
    menuIcon?: string | null;
}

/**
 * Layer2 简化的字段配置DTO
 * 提供10种常用字段类型和UI控件选择
 */
export interface SimplifiedFieldConfigDto {
    name: string;
    displayName: string;
    type: string;
    isRequired?: boolean;
    isNullable?: boolean;
    maxLength?: number | null;
    minLength?: number | null;
    precision?: number | null;
    scale?: number | null;
    minValue?: number | null;
    maxValue?: number | null;
    defaultValue?: string | null;
    pattern?: string | null;
    uiControl?: string | null;
    enumValues?: EnumValueDto[] | null;
    validationRules?: ValidationRuleDto[] | null;
    order?: number;
    comment?: string | null;
}

/**
 * Layer2 模块创建结果DTO
 */
export interface SimplifiedModuleCreationResultDto {
    success: boolean;
    moduleId?: string | null;
    entityId?: string | null;
    message?: string | null;
    generatedFiles?: string[] | null;
    sessionId?: string | null;
}

/**
 * 验证结果DTO
 */
export interface ValidationResultDto {
    isValid: boolean;
    errors?: ValidationErrorDto[] | null;
}

/**
 * 验证错误DTO
 */
export interface ValidationErrorDto {
    field?: string | null;
    message?: string | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔗 向后兼容性类型别名（渐进式迁移支持）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** @deprecated 使用 EntityDefinitionDto 替代 */
export type UnifiedEntityDefinition = EntityDefinitionDto;

/** @deprecated 使用 ModuleDto 替代 */
export type UnifiedModuleMetadata = ModuleDto;

/** @deprecated 使用 EntityFieldDto 替代 */
export type UnifiedEntityField = EntityFieldDto;

/** @deprecated 使用 EntityIndexDto 替代 */
export type UnifiedEntityIndex = EntityIndexDto;

/** @deprecated 使用 EntityConstraintDto 替代 */
export type UnifiedEntityConstraint = EntityConstraintDto;

/** @deprecated 使用 EntityPermissionDto 替代 */
export type UnifiedEntityPermission = EntityPermissionDto;

/** @deprecated 使用 PropertyUIConfig 替代 */
export type UnifiedPropertyUIConfig = PropertyUIConfig;

/** @deprecated 使用 EnumValueDto 替代 */
export type UnifiedEnumValue = EnumValueDto;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 契约验证与元数据
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 后端契约元数据
 */
export const BACKEND_CONTRACT_INFO = {
    version: '3C.1.0',
    strategy: 'Independent Package Contract Types',
    compliance: 'Architecture Iron Rules Fully Compliant',
    source: 'Manual sync from Backend NSwag Generated Types',
    lastSync: '2025-10-18T15:00:00Z',
    syncStrategy: 'Phase1: Manual, Phase2: Automated, Phase3: Full Auto',
    typeCount: 50,
    dependencies: 'Zero external dependencies',
    note: 'Packages are now completely independent with contract-based types'
} as const;

/**
 * 类型同步检查（用于未来自动化）
 */
export interface TypeSyncStatus {
    lastCheck: string;
    inconsistencies: string[];
    autoSyncEnabled: boolean;
    nextSyncTime: string;
}
