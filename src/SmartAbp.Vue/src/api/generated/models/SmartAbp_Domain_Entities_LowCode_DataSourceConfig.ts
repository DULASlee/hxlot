/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 数据源配置
 */
export type SmartAbp_Domain_Entities_LowCode_DataSourceConfig = {
    /**
     * 数据源类型（static | api | dict）
     */
    type?: string | null;
    /**
     * API URL（type=api时）
     */
    url?: string | null;
    /**
     * 显示字段名（如：name, title）
     */
    labelField?: string | null;
    /**
     * 值字段名（如：id, value）
     */
    valueField?: string | null;
    /**
     * 请求参数
     */
    params?: Record<string, any> | null;
};

