/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 事件配置
 */
export type SmartAbp_Domain_Entities_LowCode_EventConfig = {
    /**
     * 事件类型（api | navigate | dialog | validate）
     */
    type: string;
    /**
     * API URL（type=api时）
     */
    url?: string | null;
    /**
     * HTTP方法（GET | POST | PUT | DELETE）
     */
    method?: string | null;
    /**
     * 请求参数
     */
    params?: Record<string, any> | null;
    /**
     * 成功提示信息
     */
    successMessage?: string | null;
    /**
     * 后续事件（链式调用）
     */
    then?: SmartAbp_Domain_Entities_LowCode_EventConfig | null;
    /**
     * 成功后的事件
     */
    afterSuccess?: SmartAbp_Domain_Entities_LowCode_EventConfig | null;
};

