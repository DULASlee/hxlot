/**
 * 轻量HTTP客户端封装（fetch）
 * - 支持 params 查询参数
 * - 支持 JSON body
 * - 泛型返回类型 Promise<T>
 */
function buildUrl(url, params) {
    if (!params || typeof params !== 'object')
        return url;
    const entries = Object.entries(params);
    if (entries.length === 0)
        return url;
    const usp = new URLSearchParams();
    for (const [key, value] of entries) {
        if (value === undefined || value === null)
            continue;
        usp.append(key, String(value));
    }
    const qs = usp.toString();
    if (!qs)
        return url;
    return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`;
}
async function request(method, url, data, params) {
    const finalUrl = buildUrl(url, params);
    const init = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (data !== undefined && method !== 'GET') {
        init.body = JSON.stringify(data);
    }
    const response = await fetch(finalUrl, init);
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${response.statusText}${text ? `: ${text}` : ''}`);
    }
    // 尝试解析JSON，空响应返回 undefined as unknown as T
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return (await response.json());
    }
    // 非JSON时按文本返回（调用方若声明T为void则忽略）
    return (await response.text());
}
const http = {
    get: async function get(url, options) {
        return request('GET', url, undefined, options?.params);
    },
    post: async function post(url, data, options) {
        return request('POST', url, data, options?.params);
    },
    put: async function put(url, data, options) {
        return request('PUT', url, data, options?.params);
    },
    delete: async function del(url, options) {
        return request('DELETE', url, options?.data, options?.params);
    }
};
export default http;
