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
    onDeleteBehavior?: SmartAbp_CodeGenerator_Services_V9_EntityRelationshipDto.onDeleteBehavior;
    joinEntity?: SmartAbp_CodeGenerator_Services_V9_EnhancedEntityModelDto | null;
};
export namespace SmartAbp_CodeGenerator_Services_V9_EntityRelationshipDto {
    export enum onDeleteBehavior {
        '_0' = 0,
        '_1' = 1,
        '_2' = 2,
        '_3' = 3,
    }
}

