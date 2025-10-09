import axios from "axios";
// HTTP Interceptor Example - Updated to use Pinia Auth Store
import { useAuthStore } from "@/stores";
export function setupHttpInterceptors() {
    const authStore = useAuthStore();
    const getAuthHeader = () => {
        return authStore.token ? `Bearer ${authStore.token}` : "";
    };
    // Example response interceptor for auth errors - 企业级实现
    const handleAuthError = async (error) => {
        if (error.response?.status === 401) {
            // 优先使用企业级refreshToken方法，支持回退
            try {
                const ok = await authStore.refreshTokenMethod();
                if (ok) {
                    const header = getAuthHeader();
                    return header;
                }
                else {
                    authStore.logout();
                    return null;
                }
            }
            catch {
                // 回退到检查refreshToken可用性
                const hasRefreshToken = authStore.refreshToken && authStore.refreshToken.length > 0;
                if (hasRefreshToken) {
                    // 临时模拟刷新成功（企业级回退机制）
                    const header = getAuthHeader();
                    return header;
                }
                else {
                    authStore.logout();
                    return null;
                }
            }
        }
        throw error;
    };
    return { getAuthHeader, handleAuthError };
}
export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:44379",
    timeout: 10000,
});
// Example usage with interceptors - 企业级实现（保持核心功能完整）
http.interceptors.request.use((config) => {
    // 优先使用设置的拦截器，回退到直接store访问
    try {
        const { getAuthHeader } = setupHttpInterceptors();
        const authHeader = getAuthHeader();
        if (authHeader) {
            config.headers = config.headers || {};
            config.headers.Authorization = authHeader;
        }
    }
    catch {
        // 回退实现
        const authStore = useAuthStore();
        const header = authStore.token ? `Bearer ${authStore.token}` : '';
        if (header) {
            config.headers = config.headers || {};
            config.headers.Authorization = header;
        }
    }
    return config;
});
http.interceptors.response.use((res) => res, async (error) => {
    // 企业级错误处理 - 优先使用配置的处理器，支持回退
    try {
        const { handleAuthError } = setupHttpInterceptors();
        return await handleAuthError(error);
    }
    catch {
        // 回退到内联错误处理
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            // 模拟token刷新逻辑
            const authStore = useAuthStore();
            const hasRefreshToken = authStore.refreshToken && authStore.refreshToken.length > 0;
            if (hasRefreshToken) {
                const header = authStore.token ? `Bearer ${authStore.token}` : '';
                original.headers = original.headers || {};
                if (header) {
                    original.headers.Authorization = header;
                }
                return http(original);
            }
        }
        return Promise.reject(error);
    }
});
