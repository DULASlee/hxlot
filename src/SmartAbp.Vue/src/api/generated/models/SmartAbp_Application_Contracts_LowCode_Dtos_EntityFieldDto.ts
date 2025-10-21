/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_LowCode_Dtos_EnumValueDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_EnumValueDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_ValidationRuleDto } from './SmartAbp_Application_Contracts_LowCode_Dtos_ValidationRuleDto';
import type { SmartAbp_Domain_Entities_LowCode_PropertyUIConfig } from './SmartAbp_Domain_Entities_LowCode_PropertyUIConfig';
export type SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto = {
    id?: string;
    entityDefinitionId?: string;
    name?: string | null;
    displayName?: string | null;
    type?: string | null;
    length?: number | null;
    isRequired?: boolean;
    isUnique?: boolean;
    isIndexed?: boolean;
    defaultValue?: string | null;
    comment?: string | null;
    order?: number;
    isPrimaryKey?: boolean;
    minLength?: number | null;
    precision?: number | null;
    scale?: number | null;
    minValue?: number | null;
    maxValue?: number | null;
    pattern?: string | null;
    enumValues?: Array<SmartAbp_Application_Contracts_LowCode_Dtos_EnumValueDto> | null;
    validationRules?: Array<SmartAbp_Application_Contracts_LowCode_Dtos_ValidationRuleDto> | null;
    /**
     * 属性UI配置（JSON存储）
     * Phase 1A 调整：保留在 Domain 层，通过 NSwag 配置扫描
     */
    uiConfig?: SmartAbp_Domain_Entities_LowCode_PropertyUIConfig | null;
    columnName?: string | null;
    columnType?: string | null;
    isAuditField?: boolean;
    isSoftDeleteField?: boolean;
    isTenantField?: boolean;
};

