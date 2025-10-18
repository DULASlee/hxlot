/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Domain_Entities_LowCode_DetailConfig } from './SmartAbp_Domain_Entities_LowCode_DetailConfig';
import type { SmartAbp_Domain_Entities_LowCode_EventConfig } from './SmartAbp_Domain_Entities_LowCode_EventConfig';
import type { SmartAbp_Domain_Entities_LowCode_FormConfig } from './SmartAbp_Domain_Entities_LowCode_FormConfig';
import type { SmartAbp_Domain_Entities_LowCode_LayoutConfig } from './SmartAbp_Domain_Entities_LowCode_LayoutConfig';
import type { SmartAbp_Domain_Entities_LowCode_ListConfig } from './SmartAbp_Domain_Entities_LowCode_ListConfig';
/**
 * 页面配置DTO（JSON存储）
 */
export type SmartAbp_Domain_Entities_LowCode_PageConfigDto = {
    /**
     * 表单配置（form-create完整规则）
     */
    form?: SmartAbp_Domain_Entities_LowCode_FormConfig | null;
    /**
     * 列表配置
     */
    list?: SmartAbp_Domain_Entities_LowCode_ListConfig | null;
    /**
     * 详情配置
     */
    detail?: SmartAbp_Domain_Entities_LowCode_DetailConfig | null;
    /**
     * 页面事件配置
     */
    events?: Record<string, SmartAbp_Domain_Entities_LowCode_EventConfig> | null;
    /**
     * 布局配置
     */
    layout?: SmartAbp_Domain_Entities_LowCode_LayoutConfig | null;
};

