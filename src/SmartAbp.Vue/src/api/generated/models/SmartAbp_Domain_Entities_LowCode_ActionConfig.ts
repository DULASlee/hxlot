/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 操作按钮配置
 */
export type SmartAbp_Domain_Entities_LowCode_ActionConfig = {
    /**
     * 按钮类型（create | edit | delete | custom）
     */
    type: string;
    /**
     * 按钮标签
     */
    label: string;
    /**
     * 按钮图标
     */
    icon?: string | null;
    /**
     * 按钮动作（openDialog | api | navigate）
     */
    action?: string | null;
    /**
     * 显示条件（表达式）
     */
    condition?: string | null;
    /**
     * 按钮配置
     */
    config?: Record<string, any> | null;
};

