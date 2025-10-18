/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto } from './SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_CodeGenerationConfigDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_CodeGenerationConfigDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_EntityConstraintDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_EntityConstraintDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_EntityIndexDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_EntityIndexDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_EntityPermissionDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_EntityPermissionDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_EntityRelationDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_EntityRelationDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_NavigationPropertyDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_NavigationPropertyDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_ValidationRuleDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_ValidationRuleDto';
import type { SmartAbp_Domain_Entities_LowCode_PageConfigDto } from './SmartAbp_Domain_Entities_LowCode_PageConfigDto';
export type SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto = {
    id?: string;
    creationTime?: string;
    creatorId?: string | null;
    lastModificationTime?: string | null;
    lastModifierId?: string | null;
    isDeleted?: boolean;
    deleterId?: string | null;
    deletionTime?: string | null;
    name?: string | null;
    tableName?: string | null;
    displayName?: string | null;
    description?: string | null;
    entityType?: string | null;
    baseType?: string | null;
    namespace?: string | null;
    schema?: string | null;
    isAggregateRoot?: boolean;
    baseClass?: string | null;
    interfaces?: Array<string> | null;
    isAudited?: boolean;
    isSoftDelete?: boolean;
    isMultiTenant?: boolean;
    fields?: Array<SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto> | null;
    relationships?: Array<SmartAbp_Application_Contracts_LowCode_Dtos_EntityRelationDto> | null;
    validationRules?: Array<SmartAbp_Application_Contracts_LowCode_Dtos_ValidationRuleDto> | null;
    businessRules?: Array<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto> | null;
    indexes?: Array<SmartAbp_Application_Contracts_LowCode_Dtos_EntityIndexDto> | null;
    constraints?: Array<SmartAbp_Application_Contracts_LowCode_Dtos_EntityConstraintDto> | null;
    permissions?: Array<SmartAbp_Application_Contracts_LowCode_Dtos_EntityPermissionDto> | null;
    /**
     * 页面配置DTO（JSON存储）
     */
    pageConfig?: SmartAbp_Domain_Entities_LowCode_PageConfigDto | null;
    codeGeneration?: SmartAbp_Application_Contracts_LowCode_Dtos_CodeGenerationConfigDto | null;
    tenantId?: string | null;
    navigationProperties?: Array<SmartAbp_Application_Contracts_LowCode_Dtos_NavigationPropertyDto> | null;
    moduleId?: string | null;
    isCompleted?: boolean;
    tags?: Array<string> | null;
    schemaVersion?: string | null;
    version?: string | null;
};

