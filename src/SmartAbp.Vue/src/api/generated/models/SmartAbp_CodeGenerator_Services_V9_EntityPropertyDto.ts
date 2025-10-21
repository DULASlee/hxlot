/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_CodeGenerator_Services_V9_EnumValueDto } from './SmartAbp_CodeGenerator_Services_V9_EnumValueDto';
import type { SmartAbp_CodeGenerator_Services_V9_ValidationRuleDto } from './SmartAbp_CodeGenerator_Services_V9_ValidationRuleDto';
export type SmartAbp_CodeGenerator_Services_V9_EntityPropertyDto = {
    id?: string | null;
    name?: string | null;
    displayName?: string | null;
    type?: string | null;
    isRequired?: boolean;
    isKey?: boolean;
    isUnique?: boolean;
    isIndexed?: boolean;
    defaultValue?: Record<string, any> | null;
    description?: string | null;
    helpText?: string | null;
    maxLength?: number | null;
    minLength?: number | null;
    pattern?: string | null;
    precision?: number | null;
    scale?: number | null;
    minValue?: number | null;
    maxValue?: number | null;
    enumValues?: Array<SmartAbp_CodeGenerator_Services_V9_EnumValueDto> | null;
    validationRules?: Array<SmartAbp_CodeGenerator_Services_V9_ValidationRuleDto> | null;
    displayOrder?: number;
    groupName?: string | null;
    isVisible?: boolean;
    isReadonly?: boolean;
    columnName?: string | null;
    columnType?: string | null;
    isAuditField?: boolean;
    isSoftDeleteField?: boolean;
    searchable?: boolean;
    disabled?: boolean;
    listVisible?: boolean;
    detailVisible?: boolean;
    formVisible?: boolean;
    sortable?: boolean;
    filterable?: boolean;
    isTenantField?: boolean;
};

