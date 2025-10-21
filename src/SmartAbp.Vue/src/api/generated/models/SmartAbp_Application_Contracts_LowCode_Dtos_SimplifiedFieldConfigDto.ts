/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_LowCode_Dtos_EnumValueDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_EnumValueDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_ValidationRuleDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_ValidationRuleDto';
export type SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedFieldConfigDto = {
    name: string;
    displayName: string;
    type: string;
    isRequired?: boolean;
    isNullable?: boolean;
    maxLength?: number | null;
    minLength?: number | null;
    precision?: number | null;
    scale?: number | null;
    minValue?: number | null;
    maxValue?: number | null;
    defaultValue?: string | null;
    pattern?: string | null;
    uiControl?: string | null;
    enumValues?: Array<SmartAbp_Application_Contracts_LowCode_Dtos_EnumValueDto> | null;
    validationRules?: Array<SmartAbp_Application_Contracts_LowCode_Dtos_ValidationRuleDto> | null;
    order?: number;
    comment?: string | null;
};

