/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Domain_Shared_LowCode_DetailConfigDto } from './SmartAbp_Domain_Shared_LowCode_DetailConfigDto';
import type { SmartAbp_Domain_Shared_LowCode_EventConfigDto } from './SmartAbp_Domain_Shared_LowCode_EventConfigDto';
import type { SmartAbp_Domain_Shared_LowCode_FormConfigDto } from './SmartAbp_Domain_Shared_LowCode_FormConfigDto';
import type { SmartAbp_Domain_Shared_LowCode_LayoutConfigDto } from './SmartAbp_Domain_Shared_LowCode_LayoutConfigDto';
import type { SmartAbp_Domain_Shared_LowCode_ListConfigDto } from './SmartAbp_Domain_Shared_LowCode_ListConfigDto';
export type SmartAbp_Domain_Shared_LowCode_PageConfigDto = {
    form?: SmartAbp_Domain_Shared_LowCode_FormConfigDto | null;
    list?: SmartAbp_Domain_Shared_LowCode_ListConfigDto | null;
    detail?: SmartAbp_Domain_Shared_LowCode_DetailConfigDto | null;
    events?: Record<string, SmartAbp_Domain_Shared_LowCode_EventConfigDto> | null;
    layout?: SmartAbp_Domain_Shared_LowCode_LayoutConfigDto | null;
};

