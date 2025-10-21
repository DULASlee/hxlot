/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 菜单配置项（支持递归树结构）
 * Phase 3新增：后端SSOT完整性
 */
export type SmartAbp_Domain_Entities_LowCode_MenuConfigItem = {
    /**
     * 菜单ID
     */
    id?: string | null;
    /**
     * 菜单标题
     */
    label?: string | null;
    /**
     * 菜单图标
     */
    icon?: string | null;
    /**
     * 路由地址
     */
    route?: string | null;
    /**
     * 排序号
     */
    order?: number;
    /**
     * 子菜单（支持递归）
     */
    children?: Array<SmartAbp_Domain_Entities_LowCode_MenuConfigItem> | null;
};

