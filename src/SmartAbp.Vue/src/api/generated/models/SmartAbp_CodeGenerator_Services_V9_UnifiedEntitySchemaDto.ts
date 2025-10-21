/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_CodeGenerator_Services_V9_UnifiedPropertySchemaDto } from './SmartAbp_CodeGenerator_Services_V9_UnifiedPropertySchemaDto';
import type { SmartAbp_CodeGenerator_Services_V9_UnifiedRelationshipSchemaDto } from './SmartAbp_CodeGenerator_Services_V9_UnifiedRelationshipSchemaDto';
export type SmartAbp_CodeGenerator_Services_V9_UnifiedEntitySchemaDto = {
    id?: string | null;
    name?: string | null;
    displayName?: string | null;
    description?: string | null;
    module?: string | null;
    namespace?: string | null;
    tableName?: string | null;
    schema?: string | null;
    isAggregateRoot?: boolean;
    isMultiTenant?: boolean;
    isSoftDelete?: boolean;
    baseClass?: string | null;
    properties?: Array<SmartAbp_CodeGenerator_Services_V9_UnifiedPropertySchemaDto> | null;
    relationships?: Array<SmartAbp_CodeGenerator_Services_V9_UnifiedRelationshipSchemaDto> | null;
};

