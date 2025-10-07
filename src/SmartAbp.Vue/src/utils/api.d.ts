import { AxiosInstance, AxiosRequestConfig } from "axios";
/**
 * HTTP请求工具类
 */
export declare class ApiService {
    private axiosInstance;
    constructor(baseURL?: string);
    /**
     * 设置请求和响应拦截器
     */
    private setupInterceptors;
    /**
     * 刷新Token
     */
    private refreshToken;
    /**
     * GET请求
     */
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    /**
     * POST请求
     */
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    /**
     * PUT请求
     */
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    /**
     * DELETE请求
     */
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    /**
     * 上传文件
     */
    upload<T = any>(url: string, file: File, additionalData?: Record<string, any>): Promise<T>;
    /**
     * 获取axios实例（用于更复杂的请求）
     */
    getInstance(): AxiosInstance;
}
export declare const apiService: ApiService;
export declare const api: {
    get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
    upload: <T = any>(url: string, file: File, additionalData?: Record<string, any>) => Promise<T>;
    getInstance: () => AxiosInstance;
};
//# sourceMappingURL=api.d.ts.map
