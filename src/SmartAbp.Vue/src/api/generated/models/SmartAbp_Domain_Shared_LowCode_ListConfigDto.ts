/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Domain_Shared_LowCode_ActionConfigDto } from './SmartAbp_Domain_Shared_LowCode_ActionConfigDto';
import type { SmartAbp_Domain_Shared_LowCode_ColumnDefinitionDto } from './SmartAbp_Domain_Shared_LowCode_ColumnDefinitionDto';
import type { SmartAbp_Domain_Shared_LowCode_PaginationConfigDto } from './SmartAbp_Domain_Shared_LowCode_PaginationConfigDto';
export type SmartAbp_Domain_Shared_LowCode_ListConfigDto = {
    columns?: Array<SmartAbp_Domain_Shared_LowCode_ColumnDefinitionDto> | null;
    pagination?: SmartAbp_Domain_Shared_LowCode_PaginationConfigDto | null;
    actions?: Array<SmartAbp_Domain_Shared_LowCode_ActionConfigDto> | null;
};

