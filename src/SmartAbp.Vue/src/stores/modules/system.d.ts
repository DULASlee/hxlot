import { type Ref, type ComputedRef } from 'vue';
/**
 * 系统健康状态
 */
export type SystemHealth = 'healthy' | 'warning' | 'critical' | 'unknown';
/**
 * 系统设置接口
 */
export interface SystemSettings {
    maintenanceMode: boolean;
    [key: string]: any;
}
/**
 * 角色接口
 */
export interface Role {
    id: string;
    name: string;
    isDefault: boolean;
    [key: string]: any;
}
/**
 * 权限接口
 */
export interface Permission {
    id: string;
    name: string;
    isGranted: boolean;
    [key: string]: any;
}
/**
 * 系统信息接口
 */
export interface SystemInfo {
    memoryUsage: {
        percentage: number;
        used: number;
        total: number;
    };
    cpuUsage?: number;
    diskUsage?: {
        percentage: number;
        used: number;
        total: number;
    };
    [key: string]: any;
}
/**
 * 系统Store
 * 负责管理系统设置、角色、权限和系统信息
 */
export declare const useSystemStore: import("pinia").StoreDefinition<"system", Pick<{
    settings: Ref<SystemSettings | null, SystemSettings | null>;
    roles: Ref<Role[], Role[]>;
    permissions: Ref<Permission[], Permission[]>;
    systemInfo: Ref<SystemInfo | null, SystemInfo | null>;
    loading: Ref<boolean, boolean>;
    error: Ref<string | null, string | null>;
    isMaintenanceMode: ComputedRef<boolean>;
    defaultRoles: ComputedRef<Role[]>;
    customRoles: ComputedRef<Role[]>;
    grantedPermissions: ComputedRef<Permission[]>;
    systemHealth: ComputedRef<SystemHealth>;
    fetchSettings: () => Promise<void>;
    updateSettings: (_newSettings: Partial<SystemSettings>) => Promise<void>;
    fetchRoles: () => Promise<void>;
    fetchPermissions: () => Promise<void>;
    fetchSystemInfo: () => Promise<void>;
    toggleMaintenanceMode: (_enabled: boolean) => Promise<void>;
    clearError: () => void;
}, "error" | "permissions" | "roles" | "loading" | "settings" | "systemInfo">, Pick<{
    settings: Ref<SystemSettings | null, SystemSettings | null>;
    roles: Ref<Role[], Role[]>;
    permissions: Ref<Permission[], Permission[]>;
    systemInfo: Ref<SystemInfo | null, SystemInfo | null>;
    loading: Ref<boolean, boolean>;
    error: Ref<string | null, string | null>;
    isMaintenanceMode: ComputedRef<boolean>;
    defaultRoles: ComputedRef<Role[]>;
    customRoles: ComputedRef<Role[]>;
    grantedPermissions: ComputedRef<Permission[]>;
    systemHealth: ComputedRef<SystemHealth>;
    fetchSettings: () => Promise<void>;
    updateSettings: (_newSettings: Partial<SystemSettings>) => Promise<void>;
    fetchRoles: () => Promise<void>;
    fetchPermissions: () => Promise<void>;
    fetchSystemInfo: () => Promise<void>;
    toggleMaintenanceMode: (_enabled: boolean) => Promise<void>;
    clearError: () => void;
}, "isMaintenanceMode" | "defaultRoles" | "customRoles" | "grantedPermissions" | "systemHealth">, Pick<{
    settings: Ref<SystemSettings | null, SystemSettings | null>;
    roles: Ref<Role[], Role[]>;
    permissions: Ref<Permission[], Permission[]>;
    systemInfo: Ref<SystemInfo | null, SystemInfo | null>;
    loading: Ref<boolean, boolean>;
    error: Ref<string | null, string | null>;
    isMaintenanceMode: ComputedRef<boolean>;
    defaultRoles: ComputedRef<Role[]>;
    customRoles: ComputedRef<Role[]>;
    grantedPermissions: ComputedRef<Permission[]>;
    systemHealth: ComputedRef<SystemHealth>;
    fetchSettings: () => Promise<void>;
    updateSettings: (_newSettings: Partial<SystemSettings>) => Promise<void>;
    fetchRoles: () => Promise<void>;
    fetchPermissions: () => Promise<void>;
    fetchSystemInfo: () => Promise<void>;
    toggleMaintenanceMode: (_enabled: boolean) => Promise<void>;
    clearError: () => void;
}, "clearError" | "fetchSettings" | "updateSettings" | "fetchRoles" | "fetchPermissions" | "fetchSystemInfo" | "toggleMaintenanceMode">>;
//# sourceMappingURL=system.d.ts.map