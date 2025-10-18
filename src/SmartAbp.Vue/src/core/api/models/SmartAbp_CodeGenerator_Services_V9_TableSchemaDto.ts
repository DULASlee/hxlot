/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SmartAbp_CodeGenerator_Services_V9_ColumnSchemaDto } from './SmartAbp_CodeGenerator_Services_V9_ColumnSchemaDto';
import type { SmartAbp_CodeGenerator_Services_V9_ForeignKeySchemaDto } from './SmartAbp_CodeGenerator_Services_V9_ForeignKeySchemaDto';
export type SmartAbp_CodeGenerator_Services_V9_TableSchemaDto = {
    schema?: string | null;
    name?: string | null;
    columns?: Array<SmartAbp_CodeGenerator_Services_V9_ColumnSchemaDto> | null;
    foreignKeys?: Array<SmartAbp_CodeGenerator_Services_V9_ForeignKeySchemaDto> | null;
};

