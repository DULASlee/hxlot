/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SmartAbp_Domain_Entities_LowCode_ModuleArchitectureConfig } from './SmartAbp_Domain_Entities_LowCode_ModuleArchitectureConfig';
import type { SmartAbp_Domain_Entities_LowCode_ModuleCodeGenOptions } from './SmartAbp_Domain_Entities_LowCode_ModuleCodeGenOptions';
import type { SmartAbp_Domain_Entities_LowCode_ModuleFrontendConfig } from './SmartAbp_Domain_Entities_LowCode_ModuleFrontendConfig';
export type SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateModuleDto = {
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
    status?: string | null;
    isActive?: boolean;
};

