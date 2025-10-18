/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SmartAbp_CodeGenerator_Services_V9_BusinessRuleDto } from './SmartAbp_CodeGenerator_Services_V9_BusinessRuleDto';
import type { SmartAbp_CodeGenerator_Services_V9_CodeGenerationConfigDto } from './SmartAbp_CodeGenerator_Services_V9_CodeGenerationConfigDto';
import type { SmartAbp_CodeGenerator_Services_V9_EntityConstraintDto } from './SmartAbp_CodeGenerator_Services_V9_EntityConstraintDto';
import type { SmartAbp_CodeGenerator_Services_V9_EntityIndexDto } from './SmartAbp_CodeGenerator_Services_V9_EntityIndexDto';
import type { SmartAbp_CodeGenerator_Services_V9_EntityPermissionDto } from './SmartAbp_CodeGenerator_Services_V9_EntityPermissionDto';
import type { SmartAbp_CodeGenerator_Services_V9_EntityPropertyDto } from './SmartAbp_CodeGenerator_Services_V9_EntityPropertyDto';
import type { SmartAbp_CodeGenerator_Services_V9_EntityRelationshipDto } from './SmartAbp_CodeGenerator_Services_V9_EntityRelationshipDto';
import type { SmartAbp_CodeGenerator_Services_V9_EntityUIConfigDto } from './SmartAbp_CodeGenerator_Services_V9_EntityUIConfigDto';
export type SmartAbp_CodeGenerator_Services_V9_EnhancedEntityModelDto = {
    id?: string | null;
    name?: string | null;
    displayName?: string | null;
    description?: string | null;
    module?: string | null;
    namespace?: string | null;
    isAggregateRoot?: boolean;
    isAudited?: boolean;
    isSoftDelete?: boolean;
    isMultiTenant?: boolean;
    baseClass?: string | null;
    interfaces?: Array<string> | null;
    properties?: Array<SmartAbp_CodeGenerator_Services_V9_EntityPropertyDto> | null;
    relationships?: Array<SmartAbp_CodeGenerator_Services_V9_EntityRelationshipDto> | null;
    tableName?: string | null;
    schema?: string | null;
    indexes?: Array<SmartAbp_CodeGenerator_Services_V9_EntityIndexDto> | null;
    constraints?: Array<SmartAbp_CodeGenerator_Services_V9_EntityConstraintDto> | null;
    businessRules?: Array<SmartAbp_CodeGenerator_Services_V9_BusinessRuleDto> | null;
    permissions?: Array<SmartAbp_CodeGenerator_Services_V9_EntityPermissionDto> | null;
    codeGeneration?: SmartAbp_CodeGenerator_Services_V9_CodeGenerationConfigDto | null;
    uiConfig?: SmartAbp_CodeGenerator_Services_V9_EntityUIConfigDto | null;
    createdAt?: string;
    updatedAt?: string;
    version?: string | null;
    tags?: Array<string> | null;
};

