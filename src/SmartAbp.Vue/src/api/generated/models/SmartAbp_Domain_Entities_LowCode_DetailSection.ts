/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 详情区段
 */
export type SmartAbp_Domain_Entities_LowCode_DetailSection = {
    /**
     * 区段标题
     */
    title: string;
    /**
     * 区段类型（fields | table）
     */
    type?: string | null;
    /**
     * 显示字段列表
     */
    fields?: Array<string> | null;
    /**
     * 数据源字段名（type=table时）
     */
    data?: string | null;
};

