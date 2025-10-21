/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedFieldConfigDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedFieldConfigDto';
export type SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedModuleCreationDto = {
    systemName: string;
    moduleName: string;
    displayName: string;
    description?: string | null;
    entityName: string;
    entityDisplayName: string;
    fields?: Array<SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedFieldConfigDto> | null;
    architecturePattern?: string | null;
    databaseProvider?: string | null;
    parentMenuId?: string | null;
    menuIcon?: string | null;
};

