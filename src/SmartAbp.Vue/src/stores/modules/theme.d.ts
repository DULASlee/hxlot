import { type ComputedRef, type WritableComputedRef } from 'vue';
import { type ThemeType, type ThemeConfig } from '@/composables/useDesignSystem';
export type Theme = ThemeType;
export type ThemeMode = 'light' | 'dark' | 'auto';
/**
 * 主题Store
 * 负责管理应用主题和暗黑模式
 *
 * 配置驱动设计：
 * - 主题切换时自动联动图标风格
 * - 联动关系由配置中心管理
 */
export declare const useThemeStore: import("pinia").StoreDefinition<"theme", Pick<{
    currentTheme: WritableComputedRef<ThemeType, ThemeType>;
    isDarkMode: import("vue").Ref<boolean, boolean>;
    isCurrentThemeDark: ComputedRef<boolean>;
    currentThemeConfig: ComputedRef<ThemeConfig>;
    setTheme: (newTheme: Theme) => void;
    toggleDarkMode: () => void;
    getAvailableThemes: () => ThemeConfig[];
    getThemeToken: (tokenName: string) => string;
    setThemeToken: (tokenName: string, value: string) => void;
    applyTheme: () => void;
    watchSystemTheme: () => () => void;
    init: () => (() => void);
    getThemeConfig: (themeValue: Theme) => ThemeConfig;
}, "isDarkMode">, Pick<{
    currentTheme: WritableComputedRef<ThemeType, ThemeType>;
    isDarkMode: import("vue").Ref<boolean, boolean>;
    isCurrentThemeDark: ComputedRef<boolean>;
    currentThemeConfig: ComputedRef<ThemeConfig>;
    setTheme: (newTheme: Theme) => void;
    toggleDarkMode: () => void;
    getAvailableThemes: () => ThemeConfig[];
    getThemeToken: (tokenName: string) => string;
    setThemeToken: (tokenName: string, value: string) => void;
    applyTheme: () => void;
    watchSystemTheme: () => () => void;
    init: () => (() => void);
    getThemeConfig: (themeValue: Theme) => ThemeConfig;
}, "isCurrentThemeDark" | "currentTheme" | "currentThemeConfig">, Pick<{
    currentTheme: WritableComputedRef<ThemeType, ThemeType>;
    isDarkMode: import("vue").Ref<boolean, boolean>;
    isCurrentThemeDark: ComputedRef<boolean>;
    currentThemeConfig: ComputedRef<ThemeConfig>;
    setTheme: (newTheme: Theme) => void;
    toggleDarkMode: () => void;
    getAvailableThemes: () => ThemeConfig[];
    getThemeToken: (tokenName: string) => string;
    setThemeToken: (tokenName: string, value: string) => void;
    applyTheme: () => void;
    watchSystemTheme: () => () => void;
    init: () => (() => void);
    getThemeConfig: (themeValue: Theme) => ThemeConfig;
}, "getAvailableThemes" | "getThemeToken" | "setThemeToken" | "applyTheme" | "watchSystemTheme" | "setTheme" | "toggleDarkMode" | "init" | "getThemeConfig">>;
export default useThemeStore;
//# sourceMappingURL=theme.d.ts.map
