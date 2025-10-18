/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_CodeGenerator_Services_V9_UnifiedDatabaseConfigDto } from './SmartAbp_CodeGenerator_Services_V9_UnifiedDatabaseConfigDto';
import type { SmartAbp_CodeGenerator_Services_V9_UnifiedEntitySchemaDto } from './SmartAbp_CodeGenerator_Services_V9_UnifiedEntitySchemaDto';
import type { SmartAbp_CodeGenerator_Services_V9_UnifiedFeatureManagementDto } from './SmartAbp_CodeGenerator_Services_V9_UnifiedFeatureManagementDto';
import type { SmartAbp_CodeGenerator_Services_V9_UnifiedFrontendConfigDto } from './SmartAbp_CodeGenerator_Services_V9_UnifiedFrontendConfigDto';
import type { SmartAbp_CodeGenerator_Services_V9_UnifiedPermissionConfigDto } from './SmartAbp_CodeGenerator_Services_V9_UnifiedPermissionConfigDto';
export type SmartAbp_CodeGenerator_Services_V9_UnifiedModuleSchemaDto = {
    id?: string | null;
    systemName?: string | null;
    name?: string | null;
    displayName?: string | null;
    description?: string | null;
    version?: string | null;
    architecturePattern?: string | null;
    databaseInfo?: SmartAbp_CodeGenerator_Services_V9_UnifiedDatabaseConfigDto | null;
    featureManagement?: SmartAbp_CodeGenerator_Services_V9_UnifiedFeatureManagementDto | null;
    frontend?: SmartAbp_CodeGenerator_Services_V9_UnifiedFrontendConfigDto | null;
    generateMobilePages?: boolean;
    dependencies?: Array<string> | null;
    entities?: Array<SmartAbp_CodeGenerator_Services_V9_UnifiedEntitySchemaDto> | null;
    permissionConfig?: SmartAbp_CodeGenerator_Services_V9_UnifiedPermissionConfigDto | null;
};

