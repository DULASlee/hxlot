/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_CodeGenerator_Services_V9_UnifiedCustomPermissionActionDto } from './SmartAbp_CodeGenerator_Services_V9_UnifiedCustomPermissionActionDto';
export type SmartAbp_CodeGenerator_Services_V9_UnifiedPermissionConfigDto = {
    customActions?: Array<SmartAbp_CodeGenerator_Services_V9_UnifiedCustomPermissionActionDto> | null;
    inheritedPermissions?: Array<string> | null;
    roleBasedAccess?: Record<string, Array<string>> | null;
};

