/**
 * 应用配置
 */
/**
 * 规范化URL
 */
function normalizeUrl(url) {
    const value = String(url ?? '').trim();
    if (!value)
        return '/';
    return value;
}
const env = import.meta?.env || {};
/**
 * 应用配置对象
 */
export const appConfig = {
    apiBaseUrl: normalizeUrl(env.VITE_API_BASE_URL || globalThis.__API_BASE_URL__ || 'https://localhost:44379')
};
