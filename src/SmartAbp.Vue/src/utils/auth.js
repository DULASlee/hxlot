import { logger } from '@/utils/logger';
import { computed, ref } from 'vue';
// 响应式状态
const isAuthenticated = ref(false);
const currentUser = ref(null);
const tokenInfo = ref(null);
// 存储键名
const TOKEN_KEY = 'smartabp_token';
const USER_KEY = 'smartabp_user';
const REFRESH_TOKEN_KEY = 'smartabp_refresh_token';
// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://localhost:44379');
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID || 'SmartAbp_App';
const SCOPE = import.meta.env.VITE_SCOPE || 'SmartAbp';
/**
 * 认证服务类
 */
export class AuthService {
    constructor() {
        Object.defineProperty(this, "refreshTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    /**
     * 获取单例实例
     */
    static getInstance() {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }
    /**
     * 登录（支持对象参数或分离参数）
     */
    async login(usernameOrCredentials, password, tenantName) {
        let username;
        let pwd;
        let tenant;
        // 检查是否传入了凭据对象
        if (typeof usernameOrCredentials === 'object') {
            username = usernameOrCredentials.username;
            pwd = usernameOrCredentials.password;
            tenant = usernameOrCredentials.tenantName;
        }
        else {
            username = usernameOrCredentials;
            pwd = password || '';
            tenant = tenantName;
        }
        try {
            if (!username || !pwd) {
                throw new Error('用户名或密码不能为空');
            }
            const loginData = new URLSearchParams();
            loginData.append('grant_type', 'password');
            loginData.append('username', username);
            loginData.append('password', pwd);
            loginData.append('client_id', CLIENT_ID);
            loginData.append('scope', SCOPE);
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            if (tenant) {
                headers['__tenant'] = tenant;
            }
            const response = await fetch(`${API_BASE_URL}/connect/token`, {
                method: 'POST',
                headers,
                body: loginData
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = (errorData && (errorData.error_description || errorData.error)) || '登录失败';
                throw new Error(message);
            }
            const tokenData = await response.json();
            const token = {
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                token_type: tokenData.token_type || 'Bearer',
                expires_in: tokenData.expires_in,
                expires_at: Date.now() + tokenData.expires_in * 1000
            };
            await this.setTokenInfo(token);
            await this.fetchUserInfo();
            this.startTokenRefresh();
            return true;
        }
        catch (error) {
            logger.error('登录失败:', { error });
            throw error;
        }
    }
    /**
     * 登出
     */
    async logout() {
        try {
            this.stopTokenRefresh();
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            isAuthenticated.value = false;
            currentUser.value = null;
            tokenInfo.value = null;
            logger.info('用户已登出');
        }
        catch (error) {
            logger.error('登出失败:', { error });
        }
    }
    /**
     * 刷新Token
     */
    async refreshToken() {
        try {
            const currentToken = this.getTokenInfo();
            if (!currentToken?.refresh_token) {
                throw new Error('没有刷新Token');
            }
            const refreshData = new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: currentToken.refresh_token,
                client_id: CLIENT_ID
            });
            const response = await fetch(`${API_BASE_URL}/connect/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: refreshData
            });
            if (!response.ok) {
                throw new Error('刷新Token失败');
            }
            const tokenData = await response.json();
            const newToken = {
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token || currentToken.refresh_token,
                token_type: tokenData.token_type || 'Bearer',
                expires_in: tokenData.expires_in,
                expires_at: Date.now() + tokenData.expires_in * 1000
            };
            await this.setTokenInfo(newToken);
            logger.info('Token刷新成功');
            return true;
        }
        catch (error) {
            logger.error('刷新Token失败:', { error });
            await this.logout();
            return false;
        }
    }
    /**
     * 获取用户信息
     */
    async fetchUserInfo() {
        try {
            const token = this.getTokenInfo();
            if (!token) {
                throw new Error('没有访问Token');
            }
            const response = await fetch(`${API_BASE_URL}/api/account/my-profile`, {
                headers: {
                    Authorization: `${token.token_type} ${token.access_token}`
                }
            });
            if (!response.ok) {
                throw new Error('获取用户信息失败');
            }
            const userData = await response.json();
            const claims = this.parseTokenClaims(token.access_token);
            const user = {
                id: userData.id || claims.sub || '',
                userName: userData.userName || claims.preferred_username || '',
                email: userData.email || claims.email,
                name: userData.name || claims.name,
                tenantId: claims.tenant_id,
                tenantName: claims.tenant_name,
                tenantDisplayName: claims.tenant_display_name,
                displayName: claims.display_name || userData.name,
                avatar: claims.avatar,
                department: claims.department,
                position: claims.position,
                roles: claims.role ? (Array.isArray(claims.role) ? claims.role : [claims.role]) : []
            };
            currentUser.value = user;
            isAuthenticated.value = true;
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            return user;
        }
        catch (error) {
            logger.error('获取用户信息失败:', { error });
            return null;
        }
    }
    /**
     * 解析JWT Token中的Claims
     */
    parseTokenClaims(token) {
        try {
            const payload = token.split('.')[1];
            if (!payload)
                return {};
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded);
        }
        catch (error) {
            logger.error('解析Token失败:', { error });
            return {};
        }
    }
    /**
     * 设置Token信息
     */
    async setTokenInfo(token) {
        tokenInfo.value = token;
        localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    }
    /**
     * 获取Token信息
     */
    getTokenInfo() {
        if (tokenInfo.value) {
            return tokenInfo.value;
        }
        const stored = localStorage.getItem(TOKEN_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                tokenInfo.value = parsed;
                return parsed;
            }
            catch (error) {
                logger.error('解析存储的Token失败:', { error });
                localStorage.removeItem(TOKEN_KEY);
            }
        }
        return null;
    }
    /**
     * 检查Token是否有效
     */
    isTokenValid() {
        const token = this.getTokenInfo();
        if (!token) {
            return false;
        }
        const now = Date.now();
        const expiresAt = token.expires_at - 5 * 60 * 1000; // 提前5分钟判断为过期
        return now < expiresAt;
    }
    /**
     * 启动自动刷新Token
     */
    startTokenRefresh() {
        this.stopTokenRefresh();
        const token = this.getTokenInfo();
        if (!token) {
            return;
        }
        const refreshTime = token.expires_at - Date.now() - 5 * 60 * 1000;
        if (refreshTime > 0) {
            this.refreshTimer = window.setTimeout(async () => {
                const success = await this.refreshToken();
                if (success) {
                    this.startTokenRefresh();
                }
            }, refreshTime);
            logger.debug(`Token将在 ${Math.round(refreshTime / 1000)} 秒后自动刷新`);
        }
    }
    /**
     * 停止自动刷新Token
     */
    stopTokenRefresh() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    /**
     * 初始化认证状态
     */
    async initialize() {
        try {
            const storedUser = localStorage.getItem(USER_KEY);
            if (storedUser) {
                currentUser.value = JSON.parse(storedUser);
            }
            if (this.isTokenValid()) {
                isAuthenticated.value = true;
                this.startTokenRefresh();
                await this.fetchUserInfo();
            }
            else {
                const token = this.getTokenInfo();
                if (token?.refresh_token) {
                    const success = await this.refreshToken();
                    if (success) {
                        await this.fetchUserInfo();
                    }
                }
                else {
                    await this.logout();
                }
            }
        }
        catch (error) {
            logger.error('初始化认证状态失败:', { error });
            await this.logout();
        }
    }
    /**
     * 获取认证头
     */
    getAuthHeader() {
        const token = this.getTokenInfo();
        if (token && this.isTokenValid()) {
            return {
                Authorization: `${token.token_type} ${token.access_token}`
            };
        }
        return {};
    }
    /**
     * 获取当前用户
     */
    getCurrentUser() {
        return currentUser.value;
    }
    /**
     * 检查用户是否有指定权限
     */
    hasPermission(_permission) {
        const user = currentUser.value;
        if (!user || !isAuthenticated.value) {
            return false;
        }
        // 这里可以根据实际权限系统实现
        return true;
    }
    /**
     * 检查用户是否有指定角色
     */
    hasRole(role) {
        const user = currentUser.value;
        if (!user || !isAuthenticated.value) {
            return false;
        }
        return user.roles.includes(role);
    }
    /**
     * 验证token有效性
     */
    async validateToken() {
        if (!this.isTokenValid()) {
            return false;
        }
        try {
            await this.fetchUserInfo();
            return true;
        }
        catch {
            return false;
        }
    }
}
Object.defineProperty(AuthService, "instance", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: null
});
// 创建全局认证服务实例
export const authService = AuthService.getInstance();
export const useAuth = () => {
    return {
        isAuthenticated: computed(() => isAuthenticated.value),
        currentUser: computed(() => currentUser.value),
        tokenInfo: computed(() => tokenInfo.value),
        authService
    };
};
