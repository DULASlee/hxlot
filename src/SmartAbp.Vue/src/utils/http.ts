/**
 * 轻量HTTP客户端封装（fetch）
 * - 支持 params 查询参数
 * - 支持 JSON body
 * - 泛型返回类型 Promise<T>
 */

// 接受任意可序列化对象作为查询参数，避免调用方DTO与索引签名不兼容
type QueryParams = unknown

interface RequestOptions {
    params?: QueryParams
}

interface DeleteOptions extends RequestOptions {
    data?: unknown
}

function buildUrl(url: string, params?: QueryParams): string {
    if (!params || typeof params !== 'object') return url
    const entries = Object.entries(params as Record<string, unknown>)
    if (entries.length === 0) return url
    const usp = new URLSearchParams()
    for (const [key, value] of entries) {
        if (value === undefined || value === null) continue
        usp.append(key, String(value))
    }
    const qs = usp.toString()
    if (!qs) return url
    return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`
}

async function request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: unknown,
    params?: QueryParams
): Promise<T> {
    const finalUrl = buildUrl(url, params)
    const init: globalThis.RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    if (data !== undefined && method !== 'GET') {
        init.body = JSON.stringify(data)
    }

    const response = await fetch(finalUrl, init)
    if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`HTTP ${response.status} ${response.statusText}${text ? `: ${text}` : ''}`)
    }

    // 尝试解析JSON，空响应返回 undefined as unknown as T
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
        return (await response.json()) as T
    }
    // 非JSON时按文本返回（调用方若声明T为void则忽略）
    return (await response.text()) as unknown as T
}

const http = {
    get: async function get<T>(url: string, options?: RequestOptions): Promise<T> {
        return request<T>('GET', url, undefined, options?.params)
    },
    post: async function post<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
        return request<T>('POST', url, data, options?.params)
    },
    put: async function put<T>(url: string, data?: unknown, options?: RequestOptions): Promise<T> {
        return request<T>('PUT', url, data, options?.params)
    },
    delete: async function del<T = void>(url: string, options?: DeleteOptions): Promise<T> {
        return request<T>('DELETE', url, options?.data, options?.params)
    }
}

export default http


