import { type Ref, type ComputedRef } from 'vue';
/**
 * 主题配置接口
 */
export interface ThemeConfig {
    name: string;
    value: string;
    icon: string;
    color: string;
    description: string;
}
/**
 * 主题类型
 */
export type ThemeType = 'tech-blue' | 'deep-green' | 'light-purple' | 'dark';
/**
 * 可用主题常量
 */
export declare const THEMES: ThemeConfig[];
/**
 * 主题系统返回值接口
 */
export interface UseDesignSystemReturn {
    theme: Ref<string>;
    isDarkMode: Ref<boolean>;
    isCurrentThemeDark: ComputedRef<boolean>;
    setTheme: (newTheme: string) => void;
    toggleDarkMode: () => void;
    getAvailableThemes: () => ThemeConfig[];
    getThemeToken: (tokenName: string) => string;
    setThemeToken: (tokenName: string, value: string) => void;
    applyTheme: () => void;
    watchSystemTheme: () => () => void;
    initTheme: () => () => void;
    THEMES: ThemeConfig[];
}
/**
 * 主题系统 Composable
 * 提供主题管理功能，包括设置主题、切换暗黑模式、获取可用主题等
 */
export declare function useDesignSystem(): UseDesignSystemReturn;
export default useDesignSystem;
//# sourceMappingURL=useDesignSystem.d.ts.map