/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleActionDto } from './SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleActionDto';
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleConditionDto } from './SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleConditionDto';
export type SmartAbp_HttpApi_Controllers_ImportRuleData = {
    name?: string | null;
    entityName?: string | null;
    description?: string | null;
    type?: string | null;
    priority?: number;
    conditions?: Array<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleConditionDto> | null;
    actions?: Array<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleActionDto> | null;
    executionTiming?: Array<string> | null;
};

