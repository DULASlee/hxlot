import { computed } from "vue";
import { useAuthStore } from "@/stores/modules/auth";
export function useAuth() {
    const store = useAuthStore();
    const isAuthenticated = computed(() => store.isAuthenticated);
    const isLoading = computed(() => store.isLoading);
    const user = computed(() => store.userInfo);
    const token = computed(() => store.token);
    const login = async (credentials) => {
        return await store.login(credentials);
    };
    const logout = () => {
        store.logout();
    };
    const hasPermission = (_permission) => {
        // Placeholder: integrate when permission store is available
        return true;
    };
    const hasRole = (role) => {
        return store.hasRole(role);
    };
    const getAuthHeader = () => {
        return store.getAuthHeader();
    };
    const refreshToken = async () => {
        // Delegated to ApiService interceptor; return true for API compatibility
        return true;
    };
    const validateToken = async () => {
        // Optionally call a ping endpoint; assume valid if token exists
        return !!token.value;
    };
    return {
        isAuthenticated,
        isLoading,
        user,
        token,
        login,
        logout,
        hasPermission,
        hasRole,
        getAuthHeader,
        refreshToken,
        validateToken,
    };
}
export default useAuth;
