/**
 * 应用配置
 */
/**
 * 全局变量声明
 */
declare global {
    var __API_BASE_URL__: string | undefined;
}
/**
 * 应用配置接口
 */
export interface AppConfig {
    /** API基础URL */
    apiBaseUrl: string;
}
/**
 * 应用配置对象
 */
export declare const appConfig: AppConfig;
//# sourceMappingURL=index.d.ts.map
