/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Domain_Shared_LowCode_FieldEffectDto } from './SmartAbp_Domain_Shared_LowCode_FieldEffectDto';
import type { SmartAbp_Domain_Shared_LowCode_FormCreateRuleDto } from './SmartAbp_Domain_Shared_LowCode_FormCreateRuleDto';
import type { SmartAbp_Domain_Shared_LowCode_FormGlobalConfigDto } from './SmartAbp_Domain_Shared_LowCode_FormGlobalConfigDto';
export type SmartAbp_Domain_Shared_LowCode_FormConfigDto = {
    rules?: Array<SmartAbp_Domain_Shared_LowCode_FormCreateRuleDto> | null;
    config?: SmartAbp_Domain_Shared_LowCode_FormGlobalConfigDto | null;
    effects?: Array<SmartAbp_Domain_Shared_LowCode_FieldEffectDto> | null;
};

