/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 字段联动效果
 */
export type SmartAbp_Domain_Entities_LowCode_FieldEffect = {
    /**
     * 源字段（触发联动的字段）
     */
    source: string;
    /**
     * 目标字段（被联动的字段）
     */
    target: string;
    /**
     * 触发事件（change | blur | focus）
     */
    event: string;
    /**
     * 联动效果（show | hide | enable | disable | setValue | options）
     */
    effect: string;
    /**
     * 条件表达式（如：value === 'admin'）
     */
    condition?: string | null;
    /**
     * 联动配置
     */
    config?: Record<string, any> | null;
};

