/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_CodeGenerator_Services_V9_FieldPermissionDto } from './SmartAbp_CodeGenerator_Services_V9_FieldPermissionDto';
export type SmartAbp_CodeGenerator_Services_V9_EntityPermissionDto = {
    id?: string | null;
    operation?: string | null;
    roles?: Array<string> | null;
    condition?: string | null;
    fieldLevelPermissions?: Array<SmartAbp_CodeGenerator_Services_V9_FieldPermissionDto> | null;
};

