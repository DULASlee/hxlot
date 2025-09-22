function normalizeUrl(url) {
    const value = String(url ?? "").trim();
    if (!value)
        return "/";
    return value;
}
const env = import.meta?.env || {};
export const appConfig = {
    apiBaseUrl: normalizeUrl(env.VITE_API_BASE_URL || globalThis.__API_BASE_URL__),
};
