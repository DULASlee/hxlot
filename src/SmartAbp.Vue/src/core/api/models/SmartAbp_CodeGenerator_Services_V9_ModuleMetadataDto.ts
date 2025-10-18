/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SmartAbp_CodeGenerator_Services_V9_DatabaseConfigDto } from './SmartAbp_CodeGenerator_Services_V9_DatabaseConfigDto';
import type { SmartAbp_CodeGenerator_Services_V9_EnhancedEntityModelDto } from './SmartAbp_CodeGenerator_Services_V9_EnhancedEntityModelDto';
import type { SmartAbp_CodeGenerator_Services_V9_FeatureManagementDto } from './SmartAbp_CodeGenerator_Services_V9_FeatureManagementDto';
import type { SmartAbp_CodeGenerator_Services_V9_FrontendConfigDto } from './SmartAbp_CodeGenerator_Services_V9_FrontendConfigDto';
import type { SmartAbp_CodeGenerator_Services_V9_MenuConfigDto } from './SmartAbp_CodeGenerator_Services_V9_MenuConfigDto';
import type { SmartAbp_CodeGenerator_Services_V9_PermissionConfigDto } from './SmartAbp_CodeGenerator_Services_V9_PermissionConfigDto';
export type SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto = {
    id?: string | null;
    systemName?: string | null;
    name?: string | null;
    displayName?: string | null;
    description?: string | null;
    version?: string | null;
    architecturePattern?: string | null;
    namespace?: string | null;
    author?: string | null;
    databaseInfo?: SmartAbp_CodeGenerator_Services_V9_DatabaseConfigDto | null;
    featureManagement?: SmartAbp_CodeGenerator_Services_V9_FeatureManagementDto | null;
    frontend?: SmartAbp_CodeGenerator_Services_V9_FrontendConfigDto | null;
    generateMobilePages?: boolean;
    dependencies?: Array<string> | null;
    entities?: Array<SmartAbp_CodeGenerator_Services_V9_EnhancedEntityModelDto> | null;
    menuConfig?: Array<SmartAbp_CodeGenerator_Services_V9_MenuConfigDto> | null;
    permissionConfig?: SmartAbp_CodeGenerator_Services_V9_PermissionConfigDto | null;
};

