/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Domain_Entities_LowCode_ValidationRuleConfig } from './SmartAbp_Domain_Entities_LowCode_ValidationRuleConfig';
/**
 * form-create规则（与form-create完全对齐）
 */
export type SmartAbp_Domain_Entities_LowCode_FormCreateRule = {
    /**
     * 控件类型（input | select | date | ...）
     */
    type: string;
    /**
     * 字段名称
     */
    field: string;
    /**
     * 字段标题
     */
    title: string;
    /**
     * 默认值
     */
    value?: Record<string, any> | null;
    /**
     * 控件属性
     */
    props?: Record<string, any> | null;
    /**
     * 验证规则
     */
    validate?: Array<SmartAbp_Domain_Entities_LowCode_ValidationRuleConfig> | null;
    /**
     * 栅格配置
     */
    col?: Record<string, any> | null;
};

