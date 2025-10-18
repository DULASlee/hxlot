/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Domain_Entities_LowCode_FieldEffect } from './SmartAbp_Domain_Entities_LowCode_FieldEffect';
import type { SmartAbp_Domain_Entities_LowCode_FormCreateRule } from './SmartAbp_Domain_Entities_LowCode_FormCreateRule';
import type { SmartAbp_Domain_Entities_LowCode_FormGlobalConfig } from './SmartAbp_Domain_Entities_LowCode_FormGlobalConfig';
/**
 * 表单配置（form-create完整规则）
 */
export type SmartAbp_Domain_Entities_LowCode_FormConfig = {
    /**
     * form-create rules数组
     */
    rules?: Array<SmartAbp_Domain_Entities_LowCode_FormCreateRule> | null;
    /**
     * 全局配置
     */
    config?: SmartAbp_Domain_Entities_LowCode_FormGlobalConfig | null;
    /**
     * 字段联动规则
     */
    effects?: Array<SmartAbp_Domain_Entities_LowCode_FieldEffect> | null;
};

