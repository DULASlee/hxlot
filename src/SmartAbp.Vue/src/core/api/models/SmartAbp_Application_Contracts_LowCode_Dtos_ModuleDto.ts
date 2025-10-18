/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_ModuleFeatureManagementDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_ModuleFeatureManagementDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_ModulePermissionConfigDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_ModulePermissionConfigDto';
import type { SmartAbp_Domain_Entities_LowCode_ModuleArchitectureConfig } from './SmartAbp_Domain_Entities_LowCode_ModuleArchitectureConfig';
import type { SmartAbp_Domain_Entities_LowCode_ModuleCodeGenOptions } from './SmartAbp_Domain_Entities_LowCode_ModuleCodeGenOptions';
import type { SmartAbp_Domain_Entities_LowCode_ModuleFrontendConfig } from './SmartAbp_Domain_Entities_LowCode_ModuleFrontendConfig';
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
    permissionConfig?: SmartAbp_Application_Contracts_LowCode_Dtos_ModulePermissionConfigDto | null;
    featureManagement?: SmartAbp_Application_Contracts_LowCode_Dtos_ModuleFeatureManagementDto | null;
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

