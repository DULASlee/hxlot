/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto';
import type { SmartAbp_Domain_Entities_LowCode_ModuleArchitectureConfig } from './SmartAbp_Domain_Entities_LowCode_ModuleArchitectureConfig';
import type { SmartAbp_Domain_Entities_LowCode_ModuleCodeGenOptions } from './SmartAbp_Domain_Entities_LowCode_ModuleCodeGenOptions';
import type { SmartAbp_Domain_Entities_LowCode_ModuleFeatureManagement } from './SmartAbp_Domain_Entities_LowCode_ModuleFeatureManagement';
import type { SmartAbp_Domain_Entities_LowCode_ModuleFrontendConfig } from './SmartAbp_Domain_Entities_LowCode_ModuleFrontendConfig';
import type { SmartAbp_Domain_Entities_LowCode_ModulePermissionConfig } from './SmartAbp_Domain_Entities_LowCode_ModulePermissionConfig';
export type SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto = {
    id?: string;
    systemName?: string | null;
    moduleName?: string | null;
    displayName?: string | null;
    description?: string | null;
    namespace?: string | null;
    version?: string | null;
    /**
     * 模块架构配置
     */
    architectureConfig?: SmartAbp_Domain_Entities_LowCode_ModuleArchitectureConfig | null;
    /**
     * 模块前端配置
     */
    frontendConfig?: SmartAbp_Domain_Entities_LowCode_ModuleFrontendConfig | null;
    /**
     * 模块代码生成选项
     */
    codeGenOptions?: SmartAbp_Domain_Entities_LowCode_ModuleCodeGenOptions | null;
    /**
     * 模块权限配置
     * Phase 3新增：后端SSOT完整性
     * 对应前端: UnifiedPermissionConfig (unified-schema.ts)
     */
    permissionConfig?: SmartAbp_Domain_Entities_LowCode_ModulePermissionConfig | null;
    /**
     * 模块特性管理配置
     * Phase 3新增：后端SSOT完整性
     * 对应前端: UnifiedFeatureManagement (unified-schema.ts)
     */
    featureManagement?: SmartAbp_Domain_Entities_LowCode_ModuleFeatureManagement | null;
    status?: string | null;
    isActive?: boolean;
    tenantId?: string | null;
    entities?: Array<SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto> | null;
    dependencies?: Array<string> | null;
    schemaVersion?: string | null;
    creationTime?: string;
    creatorId?: string | null;
    lastModificationTime?: string | null;
    lastModifierId?: string | null;
};

