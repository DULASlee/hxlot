/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleActionDto } from './SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleActionDto';
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleConditionDto } from './SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleConditionDto';
export type SmartAbp_Application_Contracts_BusinessRules_Dtos_UpdateBusinessRuleDto = {
    name: string;
    description?: string | null;
    priority?: number;
    isActive?: boolean;
    conditions?: Array<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleConditionDto> | null;
    actions?: Array<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleActionDto> | null;
    executionTiming?: Array<string> | null;
};

