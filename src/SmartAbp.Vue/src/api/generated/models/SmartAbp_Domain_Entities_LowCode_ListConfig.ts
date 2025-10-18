/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Domain_Entities_LowCode_ActionConfig } from './SmartAbp_Domain_Entities_LowCode_ActionConfig';
import type { SmartAbp_Domain_Entities_LowCode_ColumnDefinition } from './SmartAbp_Domain_Entities_LowCode_ColumnDefinition';
import type { SmartAbp_Domain_Entities_LowCode_PaginationConfig } from './SmartAbp_Domain_Entities_LowCode_PaginationConfig';
/**
 * 列表配置
 */
export type SmartAbp_Domain_Entities_LowCode_ListConfig = {
    /**
     * 列定义
     */
    columns?: Array<SmartAbp_Domain_Entities_LowCode_ColumnDefinition> | null;
    /**
     * 分页配置
     */
    pagination?: SmartAbp_Domain_Entities_LowCode_PaginationConfig | null;
    /**
     * 操作按钮配置
     */
    actions?: Array<SmartAbp_Domain_Entities_LowCode_ActionConfig> | null;
};

