/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_CodeGenerator_Services_V9_EnhancedEntityModelDto } from './SmartAbp_CodeGenerator_Services_V9_EnhancedEntityModelDto';
export type SmartAbp_CodeGenerator_Services_V9_EntityRelationshipDto = {
    id?: string | null;
    name?: string | null;
    displayName?: string | null;
    sourceEntityId?: string | null;
    targetEntityId?: string | null;
    targetEntity?: string | null;
    type?: string | null;
    sourceProperty?: string | null;
    targetProperty?: string | null;
    sourceNavigationProperty?: string | null;
    targetNavigationProperty?: string | null;
    cascadeDelete?: boolean;
    isRequired?: boolean;
    foreignKeyProperty?: string | null;
    joinTableName?: string | null;
    onDeleteAction?: string | null;
    isForeignKeyRequired?: boolean;
    onDeleteBehavior?: 0 | 1 | 2 | 3;
    joinEntity?: SmartAbp_CodeGenerator_Services_V9_EnhancedEntityModelDto | null;
};

