/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
/**
 * 验证规则配置（UI控件验证规则，非DTO）
 * Phase 1A: 重命名避免与 ValidationRuleDto 冲突
 */
export type SmartAbp_Domain_Entities_LowCode_ValidationRuleConfig = {
    /**
     * 验证类型（required | pattern | min | max | email | phone | async）
     */
    type: string;
    /**
     * 验证值（如：pattern的正则表达式，min的最小值）
     */
    value?: string | null;
    /**
     * 错误提示信息
     */
    message: string;
    /**
     * 自定义验证器名称（type=async时）
     */
    validator?: string | null;
};

