/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleActionDto } from './SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleActionDto';
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleConditionDto } from './SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleConditionDto';
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleExecutionResultDto } from './SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleExecutionResultDto';
export type SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto = {
    id?: string;
    creationTime?: string;
    creatorId?: string | null;
    lastModificationTime?: string | null;
    lastModifierId?: string | null;
    isDeleted?: boolean;
    deleterId?: string | null;
    deletionTime?: string | null;
    name?: string | null;
    entityName?: string | null;
    description?: string | null;
    type?: string | null;
    priority?: number;
    isActive?: boolean;
    hasError?: boolean;
    conditions?: Array<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleConditionDto> | null;
    actions?: Array<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleActionDto> | null;
    executionTiming?: Array<string> | null;
    lastExecutionResult?: SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleExecutionResultDto | null;
    lastExecutionTime?: string | null;
    executionCount?: number;
    successCount?: number;
    failureCount?: number;
    averageExecutionTime?: number;
    successRate?: number;
    version?: number;
};

