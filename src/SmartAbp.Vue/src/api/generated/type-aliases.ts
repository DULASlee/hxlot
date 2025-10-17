/**
 * 🔥 后端SSOT类型别名（Phase 2B）
 * 用途：简化api-client.ts生成的冗长类型名
 * 架构决策：100%映射后端类型，不创建新定义
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 模块元数据类型别名
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type {
    SmartAbpApplicationContractsLowCodeDtosModuleDto as ModuleDto,
    SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateModuleDto as CreateOrUpdateModuleDto
} from './api-client'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 实体元数据类型别名
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type {
    SmartAbpApplicationContractsLowCodeDtosEntityDefinitionDto as EntityDefinitionDto,
    SmartAbpApplicationContractsLowCodeDtosEntityFieldDto as EntityFieldDto,
    SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateEntityDefinitionDto as CreateOrUpdateEntityDefinitionDto,
    SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateEntityFieldDto as CreateOrUpdateEntityFieldDto
} from './api-client'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 导航属性类型别名
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type {
    SmartAbpApplicationContractsLowCodeDtosNavigationPropertyDto as NavigationPropertyDto
} from './api-client'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JSON配置类型别名
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type {
    SmartAbpDomainEntitiesLowCodeModuleArchitectureConfig as ModuleArchitectureConfig,
    SmartAbpDomainEntitiesLowCodeModuleFrontendConfig as ModuleFrontendConfig,
    SmartAbpDomainEntitiesLowCodeModuleCodeGenOptions as ModuleCodeGenOptions
} from './api-client'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 枚举类型（手动补充，因为swagger-typescript-api生成为数字字面量）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 导航关系类型枚举
 */
export enum NavigationRelationType {
    /** 一对一（如：User ←→ UserProfile） */
    OneToOne = 0,
    /** 一对多（如：Customer → Orders） */
    OneToMany = 1,
    /** 多对一（如：Order → Customer） */
    ManyToOne = 2,
    /** 多对多（如：Product ←→ Category） */
    ManyToMany = 3
}

/**
 * 级联删除行为枚举
 */
export enum CascadeDeleteBehavior {
    /** 无操作 */
    None = 0,
    /** 级联删除（删除主实体时自动删除关联实体） */
    Cascade = 1,
    /** 设置为NULL（删除主实体时将外键设为NULL） */
    SetNull = 2,
    /** 限制删除（存在关联时禁止删除主实体） */
    Restrict = 3
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 向后兼容别名（Phase 2B过渡期）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @deprecated 使用 ModuleDto 替代（Phase 2B）
 */
export type UnifiedModuleMetadata = import('./api-client').SmartAbpApplicationContractsLowCodeDtosModuleDto

/**
 * @deprecated 使用 EntityDefinitionDto 替代（Phase 2B）
 */
export type UnifiedEntityDefinition = import('./api-client').SmartAbpApplicationContractsLowCodeDtosEntityDefinitionDto

