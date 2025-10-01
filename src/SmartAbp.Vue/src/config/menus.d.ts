import type { MenuConfig, MenuItem, PageMenuItem } from "@/types/menu";
/**
 * SmartAbp 完整菜单配置
 * 基于现有路由系统和权限模型
 * 与现有 AuthService 和路由配置完全兼容
 */
export declare const ROLES: {
    readonly ADMIN: "admin";
    readonly USER: "user";
    readonly GUEST: "guest";
};
export declare const menuConfig: MenuConfig;
export default menuConfig;
export declare const findMenuItemByKey: (key: string, menus?: MenuItem[]) => MenuItem | null;
export declare const findMenuItemByPath: (path: string, menus?: MenuItem[]) => MenuItem | null;
export declare const getFlatPageMenus: (menus?: MenuItem[]) => PageMenuItem[];
//# sourceMappingURL=menus.d.ts.map