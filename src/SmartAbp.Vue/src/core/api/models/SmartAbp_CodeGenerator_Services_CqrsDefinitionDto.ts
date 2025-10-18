/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SmartAbp_CodeGenerator_Services_CommandDefinitionDto } from './SmartAbp_CodeGenerator_Services_CommandDefinitionDto';
import type { SmartAbp_CodeGenerator_Services_EventDefinitionDto } from './SmartAbp_CodeGenerator_Services_EventDefinitionDto';
import type { SmartAbp_CodeGenerator_Services_QueryDefinitionDto } from './SmartAbp_CodeGenerator_Services_QueryDefinitionDto';
export type SmartAbp_CodeGenerator_Services_CqrsDefinitionDto = {
    moduleName?: string | null;
    namespace?: string | null;
    commands?: Array<SmartAbp_CodeGenerator_Services_CommandDefinitionDto> | null;
    queries?: Array<SmartAbp_CodeGenerator_Services_QueryDefinitionDto> | null;
    events?: Array<SmartAbp_CodeGenerator_Services_EventDefinitionDto> | null;
};

