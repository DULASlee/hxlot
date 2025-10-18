/**
 * 🔥 后端SSOT类型别名（Phase 2B + Phase 3扩展）
 * 用途：简化api-client.ts生成的冗长类型名
 * 架构决策：100%映射后端类型，不创建新定义
 */
import type { SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto } from './models/SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto';
import type { SmartAbp_Domain_Entities_LowCode_ModuleArchitectureConfig } from './models/SmartAbp_Domain_Entities_LowCode_ModuleArchitectureConfig';
import type { SmartAbp_Domain_Entities_LowCode_ModuleCodeGenOptions } from './models/SmartAbp_Domain_Entities_LowCode_ModuleCodeGenOptions';
import type { SmartAbp_Domain_Entities_LowCode_ModuleFrontendConfig } from './models/SmartAbp_Domain_Entities_LowCode_ModuleFrontendConfig';
/**
 * 菜单配置项（支持递归树结构）
 * Phase 3新增：后端SSOT完整性
 */
export interface MenuConfigItem {
    /** 菜单ID */
    id: string;
    /** 菜单标题 */
    label: string;
    /** 菜单图标 */
    icon?: string | null;
    /** 路由地址 */
    route?: string | null;
    /** 排序号 */
    order: number;
    /** 子菜单（支持递归） */
    children?: MenuConfigItem[] | null;
}
/**
 * 模块前端配置（Phase 3扩展版本）
 * 扩展了原生类型，添加了MenuConfig字段
 */
export interface ModuleFrontendConfigExtended extends SmartAbp_Domain_Entities_LowCode_ModuleFrontendConfig {
    /** 完整菜单配置（支持多层级菜单树）- Phase 3新增 */
    menuConfig?: MenuConfigItem[] | null;
}
/**
 * 模块代码生成选项（Phase 3扩展版本）
 * 扩展了原生类型，添加了GenerateMobilePages字段
 */
export interface ModuleCodeGenOptionsExtended extends SmartAbp_Domain_Entities_LowCode_ModuleCodeGenOptions {
    /** 是否生成移动端页面 - Phase 3新增 */
    generateMobilePages?: boolean;
}
/**
 * 模块架构配置（Phase 3扩展版本）
 * 扩展了原生类型，添加了多个配置字段
 */
export interface ModuleArchitectureConfigExtended extends SmartAbp_Domain_Entities_LowCode_ModuleArchitectureConfig {
    /** 数据库表前缀 - Phase 3新增 */
    tablePrefix?: string | null;
    /** 代码生成作者 - Phase 3新增 */
    author?: string | null;
    /** 是否使用多租户 - Phase 3新增 */
    isMultiTenant?: boolean;
    /** 是否使用软删除 - Phase 3新增 */
    useSoftDelete?: boolean;
    /** 是否启用审计日志 - Phase 3新增 */
    enableAuditLog?: boolean;
}
/**
 * 模块DTO（Phase 3扩展版本）
 * 扩展了原生类型，添加了Dependencies字段和扩展配置
 */
export interface ModuleDtoExtended extends Omit<SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto, 'frontendConfig' | 'codeGenOptions' | 'architectureConfig'> {
    /** 模块依赖（前端依赖的其他模块）- Phase 3新增 🔥 修复：string → string[] */
    dependencies?: string[] | null;
    /** 前端配置（扩展版本） */
    frontendConfig?: ModuleFrontendConfigExtended | null;
    /** 代码生成选项（扩展版本） */
    codeGenOptions?: ModuleCodeGenOptionsExtended | null;
    /** 架构配置（扩展版本） */
    architectureConfig?: ModuleArchitectureConfigExtended | null;
}
export type { SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateModuleDto as CreateOrUpdateModuleDto, SmartAbpApplicationContractsLowCodeDtosModuleDto as ModuleDto } from './api-client';
export type { SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateEntityDefinitionDto as CreateOrUpdateEntityDefinitionDto, SmartAbpApplicationContractsLowCodeDtosCreateOrUpdateEntityFieldDto as CreateOrUpdateEntityFieldDto, SmartAbpApplicationContractsLowCodeDtosEntityDefinitionDto as EntityDefinitionDto, SmartAbpApplicationContractsLowCodeDtosEntityFieldDto as EntityFieldDto } from './api-client';
export type { SmartAbpApplicationContractsLowCodeDtosNavigationPropertyDto as NavigationPropertyDto } from './api-client';
export type { SmartAbpDomainEntitiesLowCodeModuleArchitectureConfig as ModuleArchitectureConfig, SmartAbpDomainEntitiesLowCodeModuleCodeGenOptions as ModuleCodeGenOptions, SmartAbpDomainEntitiesLowCodeModuleFrontendConfig as ModuleFrontendConfig } from './api-client';
/**
 * 导航关系类型枚举
 */
export declare enum NavigationRelationType {
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
export declare enum CascadeDeleteBehavior {
    /** 无操作 */
    None = 0,
    /** 级联删除（删除主实体时自动删除关联实体） */
    Cascade = 1,
    /** 设置为NULL（删除主实体时将外键设为NULL） */
    SetNull = 2,
    /** 限制删除（存在关联时禁止删除主实体） */
    Restrict = 3
}
/**
 * @deprecated 使用 ModuleDto 替代（Phase 2B）
 */
export type UnifiedModuleMetadata = import('./api-client').SmartAbpApplicationContractsLowCodeDtosModuleDto;
/**
 * @deprecated 使用 EntityDefinitionDto 替代（Phase 2B）
 */
export type UnifiedEntityDefinition = import('./api-client').SmartAbpApplicationContractsLowCodeDtosEntityDefinitionDto;
/**
 * @deprecated 使用 EntityFieldDto 替代（Phase 2B）
 */
export type UnifiedEntityField = import('./api-client').SmartAbpApplicationContractsLowCodeDtosEntityFieldDto;
/**
 * @deprecated 使用 NavigationPropertyDto 替代（Phase 2B）
 */
export type UnifiedEntityRelationship = import('./api-client').SmartAbpApplicationContractsLowCodeDtosNavigationPropertyDto;
/**
 * @deprecated 使用字符串类型替代（Phase 2B）
 */
export type UnifiedFieldType = string;
/**
 * @deprecated 使用ValidationRule（来自lowcode-shared/types/metadata）替代（Phase 2B）
 */
export type UnifiedValidationRule = import('@smartabp/lowcode-shared').ValidationRule;
/**
 * @deprecated 已废弃（Phase 3B后端SSOT迁移）
 * 无对应替代类型，ValidationRule不再需要ruleType枚举
 */
//# sourceMappingURL=type-aliases.d.ts.map