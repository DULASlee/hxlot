/**
 * 用户信息接口
 */
export interface UserInfo {
    id: string;
    userName: string;
    email: string;
    roles: string[];
    [key: string]: any;
}
/**
 * 登录凭证接口
 */
export interface LoginCredentials {
    username: string;
    password: string;
    rememberMe?: boolean;
    tenantName?: string;
}
/**
 * 登录响应接口
 */
export interface LoginResponse {
    success: boolean;
    user: UserInfo;
    token: string;
    message?: string;
}
/**
 * 认证Store
 * 负责管理用户认证状态、token和用户信息
 * 🔐 启用持久化：防止页面刷新后权限丢失
 */
export declare const useAuthStore: import("pinia").StoreDefinition<"auth", Pick<{
    token: import("vue").Ref<string | null, string | null>;
    refreshToken: import("vue").Ref<string | null, string | null>;
    userInfo: import("vue").Ref<{
        [x: string]: any;
        id: string;
        userName: string;
        email: string;
        roles: string[];
    } | null, UserInfo | {
        [x: string]: any;
        id: string;
        userName: string;
        email: string;
        roles: string[];
    } | null>;
    isLoading: import("vue").Ref<boolean, boolean>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    hasRole: import("vue").ComputedRef<(role: string) => boolean>;
    setToken: (accessToken: string, refreshTokenValue?: string) => void;
    setUserInfo: (user: UserInfo) => void;
    clearAuth: () => void;
    getAuthHeader: () => Record<string, string>;
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    logout: () => void;
    initialize: () => void;
    syncFromSmartAbp: () => void;
    fetchUserInfo: () => Promise<UserInfo | null>;
    refreshTokenMethod: () => Promise<string | null>;
}, "token" | "refreshToken" | "userInfo" | "isLoading">, Pick<{
    token: import("vue").Ref<string | null, string | null>;
    refreshToken: import("vue").Ref<string | null, string | null>;
    userInfo: import("vue").Ref<{
        [x: string]: any;
        id: string;
        userName: string;
        email: string;
        roles: string[];
    } | null, UserInfo | {
        [x: string]: any;
        id: string;
        userName: string;
        email: string;
        roles: string[];
    } | null>;
    isLoading: import("vue").Ref<boolean, boolean>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    hasRole: import("vue").ComputedRef<(role: string) => boolean>;
    setToken: (accessToken: string, refreshTokenValue?: string) => void;
    setUserInfo: (user: UserInfo) => void;
    clearAuth: () => void;
    getAuthHeader: () => Record<string, string>;
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    logout: () => void;
    initialize: () => void;
    syncFromSmartAbp: () => void;
    fetchUserInfo: () => Promise<UserInfo | null>;
    refreshTokenMethod: () => Promise<string | null>;
}, "isAuthenticated" | "hasRole">, Pick<{
    token: import("vue").Ref<string | null, string | null>;
    refreshToken: import("vue").Ref<string | null, string | null>;
    userInfo: import("vue").Ref<{
        [x: string]: any;
        id: string;
        userName: string;
        email: string;
        roles: string[];
    } | null, UserInfo | {
        [x: string]: any;
        id: string;
        userName: string;
        email: string;
        roles: string[];
    } | null>;
    isLoading: import("vue").Ref<boolean, boolean>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    hasRole: import("vue").ComputedRef<(role: string) => boolean>;
    setToken: (accessToken: string, refreshTokenValue?: string) => void;
    setUserInfo: (user: UserInfo) => void;
    clearAuth: () => void;
    getAuthHeader: () => Record<string, string>;
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    logout: () => void;
    initialize: () => void;
    syncFromSmartAbp: () => void;
    fetchUserInfo: () => Promise<UserInfo | null>;
    refreshTokenMethod: () => Promise<string | null>;
}, "setToken" | "setUserInfo" | "clearAuth" | "getAuthHeader" | "login" | "logout" | "initialize" | "syncFromSmartAbp" | "fetchUserInfo" | "refreshTokenMethod">>;
//# sourceMappingURL=auth.d.ts.map
