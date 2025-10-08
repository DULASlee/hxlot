/**
 * 后端DTO格式转换器
 * 
 * 将前端EntityMetadata和ModuleMetadata转换为后端C#可识别的DTO格式
 * 用于前后端元数据交换和代码生成
 * 
 * @author SmartAbp架构团队
 * @date 2025-10-07
 */

import type {
    EntityMetadata,
    ModuleMetadata,
    NavigationPropertyMetadata,
    PropertyMetadata,
    RouteMetadata,
    StoreMetadata
} from '../types'

// ========================================
// 后端DTO接口定义
// ========================================

/**
 * 后端实体元数据DTO
 * 对应C#后端的EntityMetadataDto
 */
export interface EntityMetadataDto {
    schemaVersion?: string
    name: string
    displayName?: string
    module: string
    namespace?: string
    aggregate?: string
    keyType: 'Guid' | 'int' | 'long' | 'string'
    description?: string
    isAggregateRoot: boolean
    isMultiTenant: boolean
    isSoftDelete: boolean
    hasExtraProperties: boolean
    properties: PropertyMetadataDto[]
    navigationProperties?: NavigationPropertyMetadataDto[]
    tableName?: string
    schema?: string
    primaryKey?: string
    indexes?: IndexDto[]
    constraints?: ConstraintDto[]
    permissions?: string[]
    auditFields?: AuditFieldDto[]
}

/**
 * 后端属性元数据DTO
 */
export interface PropertyMetadataDto {
    name: string
    displayName?: string
    type: string
    clrType?: string
    dbType?: string
    isRequired: boolean
    isReadOnly: boolean
    isUnique: boolean
    isPrimaryKey?: boolean
    isForeignKey?: boolean
    maxLength?: number
    minLength?: number
    minValue?: number
    maxValue?: number
    precision?: number
    scale?: number
    defaultValue?: string
    description?: string
    columnName?: string
    columnOrder?: number
    validationRules?: ValidationRuleDto[]
    attributes?: AttributeDto[]
}

/**
 * 后端导航属性元数据DTO
 */
export interface NavigationPropertyMetadataDto {
    name: string
    displayName?: string
    targetEntity: string
    targetModule?: string
    relationType: 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany'
    foreignKey?: string
    inverseName?: string
    isCollection: boolean
    cascadeDelete?: boolean
    lazyLoading?: boolean
    includeInDto?: boolean
}

/**
 * 后端模块元数据DTO
 */
export interface ModuleMetadataDto {
    schemaVersion?: string
    name: string
    displayName?: string
    namespace?: string
    version: string
    description?: string
    author?: string
    abpStyle: boolean
    order: number
    dependsOn: string[]
    entities?: string[]
    routes?: RouteMetadataDto[]
    stores?: StoreMetadataDto[]
    policies?: string[]
    permissions?: string[]
    features?: FeatureDto[]
    configuration?: ConfigurationDto[]
    localization?: LocalizationDto[]
    menuConfig?: MenuConfigDto
    assemblyName?: string
    connectionString?: string
}

/**
 * 验证规则DTO
 */
export interface ValidationRuleDto {
    name: string
    ruleType: string
    condition: string
    errorMessage: string
    errorCode?: string
    severity?: 'Error' | 'Warning' | 'Info'
    clientSide?: boolean
    serverSide?: boolean
}

/**
 * 属性特性DTO
 */
export interface AttributeDto {
    name: string
    parameters?: Record<string, any>
}

/**
 * 索引DTO
 */
export interface IndexDto {
    name: string
    columns: string[]
    isUnique: boolean
    isClustered?: boolean
    filter?: string
}

/**
 * 约束DTO
 */
export interface ConstraintDto {
    name: string
    type: 'PrimaryKey' | 'ForeignKey' | 'Unique' | 'Check'
    columns: string[]
    referencedTable?: string
    referencedColumns?: string[]
    checkExpression?: string
}

/**
 * 审计字段DTO
 */
export interface AuditFieldDto {
    name: string
    type: 'CreationTime' | 'CreatorId' | 'LastModificationTime' | 'LastModifierId' | 'DeletionTime' | 'DeleterId' | 'IsDeleted'
    isRequired: boolean
    clrType: string
}

/**
 * 路由元数据DTO
 */
export interface RouteMetadataDto {
    path: string
    name: string
    component?: string
    controller?: string
    action?: string
    httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    area?: string
    policies?: string[]
    meta?: Record<string, any>
    children?: RouteMetadataDto[]
}

/**
 * Store元数据DTO
 */
export interface StoreMetadataDto {
    name: string
    type: 'Entity' | 'UI' | 'Global' | 'Cache'
    entityName?: string
    scope: 'Singleton' | 'Transient' | 'Scoped'
    implementation?: string
    interface?: string
}

/**
 * 功能DTO
 */
export interface FeatureDto {
    name: string
    displayName?: string
    description?: string
    valueType: 'Boolean' | 'String' | 'Number'
    defaultValue?: string
    isRequired: boolean
    group?: string
}

/**
 * 配置DTO
 */
export interface ConfigurationDto {
    name: string
    displayName?: string
    description?: string
    defaultValue?: string
    isRequired: boolean
    isSecret?: boolean
    group?: string
}

/**
 * 本地化DTO
 */
export interface LocalizationDto {
    cultureName: string
    resources: Record<string, string>
}

/**
 * 菜单配置DTO
 */
export interface MenuConfigDto {
    name: string
    displayName: string
    icon?: string
    url?: string
    order: number
    requiredPermission?: string
    target?: '_self' | '_blank'
    isActive: boolean
    children?: MenuConfigDto[]
}

// ========================================
// 转换器实现
// ========================================

/**
 * 将EntityMetadata转换为EntityMetadataDto
 */
export function toEntityMetadataDto(
    entity: EntityMetadata,
    options?: {
        includeTableInfo?: boolean
        includeIndexes?: boolean
        includeConstraints?: boolean
        includeAuditFields?: boolean
        generateNamespace?: boolean
    }
): EntityMetadataDto {
    const opts = {
        includeTableInfo: true,
        includeIndexes: true,
        includeConstraints: true,
        includeAuditFields: true,
        generateNamespace: true,
        ...options
    }

    const dto: EntityMetadataDto = {
        schemaVersion: entity.schemaVersion || '1.0.0',
        name: entity.name,
        displayName: entity.displayName || entity.name,
        module: entity.module,
        keyType: entity.keyType,
        description: entity.description,
        isAggregateRoot: entity.isAggregateRoot,
        isMultiTenant: entity.isMultiTenant,
        isSoftDelete: entity.isSoftDelete,
        hasExtraProperties: entity.hasExtraProperties,
        properties: entity.properties.map(prop => toPropertyMetadataDto(prop)),
        navigationProperties: entity.navigationProperties?.map(nav => toNavigationPropertyMetadataDto(nav))
    }

    // 生成命名空间
    if (opts.generateNamespace) {
        dto.namespace = `${entity.module}.${entity.name}s`
    }

    // 生成表信息
    if (opts.includeTableInfo) {
        dto.tableName = generateTableName(entity.name)
        dto.schema = 'dbo'
        dto.primaryKey = `${entity.keyType === 'Guid' ? 'Id' : 'Id'}`
    }

    // 生成审计字段
    if (opts.includeAuditFields && entity.isAggregateRoot) {
        dto.auditFields = generateAuditFields(entity)
    }

    // 生成索引
    if (opts.includeIndexes) {
        dto.indexes = generateIndexes(entity)
    }

    // 生成约束
    if (opts.includeConstraints) {
        dto.constraints = generateConstraints(entity)
    }

    // 生成权限
    dto.permissions = generateEntityPermissions(entity)

    return dto
}

/**
 * 将PropertyMetadata转换为PropertyMetadataDto
 */
export function toPropertyMetadataDto(property: PropertyMetadata): PropertyMetadataDto {
    const dto: PropertyMetadataDto = {
        name: property.name,
        displayName: property.displayName || property.name,
        type: property.type,
        clrType: mapToClrType(property.type),
        dbType: mapToDbType(property.type),
        isRequired: property.isRequired ?? false,
        isReadOnly: property.isReadOnly ?? false,
        isUnique: property.isUnique ?? false,
        maxLength: property.maxLength,
        minLength: property.minLength,
        minValue: property.minValue,
        maxValue: property.maxValue,
        defaultValue: property.defaultValue,
        description: property.description,
        columnName: property.name,
        validationRules: property.validationRules?.map(rule => ({
            name: rule.name,
            ruleType: rule.name,
            condition: rule.condition,
            errorMessage: rule.errorMessage,
            clientSide: true,
            serverSide: true
        }))
    }

    // 设置精度和小数位数
    if (property.type === 'decimal' || property.type === 'double') {
        dto.precision = 18
        dto.scale = 2
    }

    // 生成属性特性
    dto.attributes = generatePropertyAttributes(property)

    return dto
}

/**
 * 将NavigationPropertyMetadata转换为NavigationPropertyMetadataDto
 */
export function toNavigationPropertyMetadataDto(
    navigation: NavigationPropertyMetadata
): NavigationPropertyMetadataDto {
    return {
        name: navigation.name,
        targetEntity: navigation.targetEntity,
        relationType: navigation.relationType,
        foreignKey: navigation.foreignKey,
        inverseName: navigation.inverseName,
        isCollection: navigation.relationType === 'OneToMany' || navigation.relationType === 'ManyToMany',
        cascadeDelete: navigation.relationType === 'OneToMany',
        lazyLoading: true,
        includeInDto: navigation.relationType !== 'ManyToMany'
    }
}

/**
 * 将ModuleMetadata转换为ModuleMetadataDto
 */
export function toModuleMetadataDto(
    module: ModuleMetadata,
    options?: {
        includeAssemblyInfo?: boolean
        includeConfiguration?: boolean
        includeLocalization?: boolean
        generatePermissions?: boolean
    }
): ModuleMetadataDto {
    const opts = {
        includeAssemblyInfo: true,
        includeConfiguration: true,
        includeLocalization: true,
        generatePermissions: true,
        ...options
    }

    const dto: ModuleMetadataDto = {
        schemaVersion: module.schemaVersion || '1.0.0',
        name: module.name,
        displayName: module.displayName || module.name,
        version: module.version,
        description: module.description,
        author: module.author,
        abpStyle: module.abpStyle,
        order: module.order,
        dependsOn: module.dependsOn,
        routes: module.routes?.map(route => toRouteMetadataDto(route)),
        stores: module.stores?.map(store => toStoreMetadataDto(store)),
        policies: module.policies || []
    }

    // 生成命名空间
    dto.namespace = module.name

    // 生成程序集信息
    if (opts.includeAssemblyInfo) {
        dto.assemblyName = `${module.name}.dll`
    }

    // 生成权限
    if (opts.generatePermissions) {
        dto.permissions = generateModulePermissions(module)
    }

    // 生成功能配置
    if (module.features) {
        dto.features = Object.entries(module.features).map(([name, value]) => ({
            name,
            displayName: name,
            valueType: typeof value === 'boolean' ? 'Boolean' : typeof value === 'number' ? 'Number' : 'String',
            defaultValue: String(value),
            isRequired: false
        }))
    }

    // 生成菜单配置
    if (module.menuConfig) {
        dto.menuConfig = toMenuConfigDto(module.menuConfig)
    }

    return dto
}

/**
 * 将RouteMetadata转换为RouteMetadataDto
 */
export function toRouteMetadataDto(route: RouteMetadata): RouteMetadataDto {
    return {
        name: route.name,
        path: route.path,
        component: route.component,
        controller: route.component ? `${route.component}Controller` : undefined,
        action: 'Index',
        httpMethod: 'GET',
        policies: route.meta?.requiresAuth ? [`${route.name}.Read`] : undefined,
        meta: route.meta,
        children: route.children?.map(child => toRouteMetadataDto(child))
    }
}

/**
 * 将StoreMetadata转换为StoreMetadataDto
 */
export function toStoreMetadataDto(store: StoreMetadata): StoreMetadataDto {
    return {
        name: store.name,
        type: store.type === 'entity' ? 'Entity' : store.type === 'ui' ? 'UI' : 'Global',
        entityName: store.entityName,
        scope: store.type === 'entity' ? 'Scoped' : 'Singleton',
        implementation: `${store.name}Service`,
        interface: `I${store.name}Service`
    }
}

/**
 * 将MenuConfig转换为MenuConfigDto
 */
export function toMenuConfigDto(menu: any): MenuConfigDto {
    return {
        name: menu.title || 'Default',
        displayName: menu.title || 'Default',
        icon: menu.icon,
        order: menu.order || 1,
        isActive: true,
        children: menu.children?.map((child: any) => toMenuConfigDto(child))
    }
}

// ========================================
// 辅助函数
// ========================================

/**
 * 映射前端类型到C#类型
 */
function mapToClrType(frontendType: string): string {
    const typeMap: Record<string, string> = {
        'string': 'string',
        'int': 'int',
        'long': 'long',
        'decimal': 'decimal',
        'double': 'double',
        'bool': 'bool',
        'boolean': 'bool',
        'DateTime': 'DateTime',
        'DateOnly': 'DateOnly',
        'TimeOnly': 'TimeOnly',
        'TimeSpan': 'TimeSpan',
        'Guid': 'Guid',
        'byte[]': 'byte[]'
    }
    return typeMap[frontendType] || 'string'
}

/**
 * 映射前端类型到数据库类型
 */
function mapToDbType(frontendType: string): string {
    const typeMap: Record<string, string> = {
        'string': 'nvarchar',
        'int': 'int',
        'long': 'bigint',
        'decimal': 'decimal(18,2)',
        'double': 'float',
        'bool': 'bit',
        'boolean': 'bit',
        'DateTime': 'datetime2',
        'DateOnly': 'date',
        'TimeOnly': 'time',
        'TimeSpan': 'time',
        'Guid': 'uniqueidentifier',
        'byte[]': 'varbinary(max)'
    }
    return typeMap[frontendType] || 'nvarchar(255)'
}

/**
 * 生成表名
 */
function generateTableName(entityName: string): string {
    // 转换为复数形式（简单实现）
    if (entityName.endsWith('y')) {
        return entityName.slice(0, -1) + 'ies'
    } else if (entityName.endsWith('s')) {
        return entityName + 'es'
    } else {
        return entityName + 's'
    }
}

/**
 * 生成审计字段
 */
function generateAuditFields(entity: EntityMetadata): AuditFieldDto[] {
    const auditFields: AuditFieldDto[] = [
        {
            name: 'CreationTime',
            type: 'CreationTime',
            isRequired: true,
            clrType: 'DateTime'
        },
        {
            name: 'CreatorId',
            type: 'CreatorId',
            isRequired: false,
            clrType: 'Guid?'
        },
        {
            name: 'LastModificationTime',
            type: 'LastModificationTime',
            isRequired: false,
            clrType: 'DateTime?'
        },
        {
            name: 'LastModifierId',
            type: 'LastModifierId',
            isRequired: false,
            clrType: 'Guid?'
        }
    ]

    if (entity.isSoftDelete) {
        auditFields.push(
            {
                name: 'IsDeleted',
                type: 'IsDeleted',
                isRequired: true,
                clrType: 'bool'
            },
            {
                name: 'DeletionTime',
                type: 'DeletionTime',
                isRequired: false,
                clrType: 'DateTime?'
            },
            {
                name: 'DeleterId',
                type: 'DeleterId',
                isRequired: false,
                clrType: 'Guid?'
            }
        )
    }

    return auditFields
}

/**
 * 生成索引
 */
function generateIndexes(entity: EntityMetadata): IndexDto[] {
    const indexes: IndexDto[] = []

    // 为唯一属性创建索引
    entity.properties.forEach(prop => {
        if (prop.isUnique) {
            indexes.push({
                name: `IX_${entity.name}_${prop.name}`,
                columns: [prop.name],
                isUnique: true
            })
        }
    })

    // 如果是多租户，添加TenantId索引
    if (entity.isMultiTenant) {
        indexes.push({
            name: `IX_${entity.name}_TenantId`,
            columns: ['TenantId'],
            isUnique: false
        })
    }

    return indexes
}

/**
 * 生成约束
 */
function generateConstraints(entity: EntityMetadata): ConstraintDto[] {
    const constraints: ConstraintDto[] = []

    // 主键约束
    constraints.push({
        name: `PK_${entity.name}`,
        type: 'PrimaryKey',
        columns: ['Id']
    })

    // 外键约束（基于导航属性）
    entity.navigationProperties?.forEach(nav => {
        if (nav.foreignKey && (nav.relationType === 'ManyToOne' || nav.relationType === 'OneToOne')) {
            constraints.push({
                name: `FK_${entity.name}_${nav.targetEntity}_${nav.foreignKey}`,
                type: 'ForeignKey',
                columns: [nav.foreignKey],
                referencedTable: generateTableName(nav.targetEntity),
                referencedColumns: ['Id']
            })
        }
    })

    return constraints
}

/**
 * 生成属性特性
 */
function generatePropertyAttributes(property: PropertyMetadata): AttributeDto[] {
    const attributes: AttributeDto[] = []

    if (property.isRequired) {
        attributes.push({ name: 'Required' })
    }

    if (property.maxLength) {
        attributes.push({
            name: 'MaxLength',
            parameters: { length: property.maxLength }
        })
    }

    if (property.type === 'string' && !property.maxLength) {
        attributes.push({
            name: 'MaxLength',
            parameters: { length: 255 }
        })
    }

    return attributes
}

/**
 * 生成实体权限
 */
function generateEntityPermissions(entity: EntityMetadata): string[] {
    const baseName = `${entity.module}.${entity.name}`
    return [
        `${baseName}.Read`,
        `${baseName}.Create`,
        `${baseName}.Update`,
        `${baseName}.Delete`
    ]
}

/**
 * 生成模块权限
 */
function generateModulePermissions(module: ModuleMetadata): string[] {
    return [
        `${module.name}.Read`,
        `${module.name}.Manage`
    ]
}

// ========================================
// 转换选项和工具函数
// ========================================

/**
 * 转换选项
 */
export interface ConvertToBackendOptions {
    includeTableInfo?: boolean
    includeIndexes?: boolean
    includeConstraints?: boolean
    includeAuditFields?: boolean
    includeAssemblyInfo?: boolean
    includeConfiguration?: boolean
    includeLocalization?: boolean
    generateNamespace?: boolean
    generatePermissions?: boolean
}

/**
 * 批量转换实体
 */
export function toEntityMetadataDtoBatch(
    entities: EntityMetadata[],
    options?: ConvertToBackendOptions
): EntityMetadataDto[] {
    return entities.map(entity => toEntityMetadataDto(entity, options))
}

/**
 * 批量转换模块
 */
export function toModuleMetadataDtoBatch(
    modules: ModuleMetadata[],
    options?: ConvertToBackendOptions
): ModuleMetadataDto[] {
    return modules.map(module => toModuleMetadataDto(module, options))
}

/**
 * 获取转换统计信息
 */
export function getBackendConversionStats(entities: EntityMetadata[], modules: ModuleMetadata[]) {
    return {
        totalEntities: entities.length,
        totalModules: modules.length,
        totalProperties: entities.reduce((sum, entity) => sum + entity.properties.length, 0),
        totalNavigationProperties: entities.reduce((sum, entity) => sum + (entity.navigationProperties?.length || 0), 0),
        conversionTime: new Date().toISOString()
    }
}
