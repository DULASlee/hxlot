/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Domain_Entities_LowCode_PermissionGroupConfig } from './SmartAbp_Domain_Entities_LowCode_PermissionGroupConfig';
/**
 * 模块权限配置
 * Phase 3新增：后端SSOT完整性
 * 对应前端: UnifiedPermissionConfig (unified-schema.ts)
 */
export type SmartAbp_Domain_Entities_LowCode_ModulePermissionConfig = {
    /**
     * 权限组列表
     */
    groups?: Array<SmartAbp_Domain_Entities_LowCode_PermissionGroupConfig> | null;
    /**
     * 自定义操作列表
     */
    customActions?: Array<string> | null;
};

