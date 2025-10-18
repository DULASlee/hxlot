/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SmartAbp_Domain_Entities_LowCode_MenuConfigItem } from './SmartAbp_Domain_Entities_LowCode_MenuConfigItem';
/**
 * 模块前端配置
 */
export type SmartAbp_Domain_Entities_LowCode_ModuleFrontendConfig = {
    /**
     * 路由前缀（如：/project-management）
     */
    routePrefix?: string | null;
    /**
     * 父级菜单ID
     */
    parentMenuId?: string | null;
    /**
     * 菜单图标
     */
    menuIcon?: string | null;
    /**
     * 菜单排序
     */
    menuOrder?: number;
    /**
     * 完整菜单配置（支持多层级菜单树）
     * Phase 3新增：支持前端完整菜单结构
     */
    menuConfig?: Array<SmartAbp_Domain_Entities_LowCode_MenuConfigItem> | null;
};

