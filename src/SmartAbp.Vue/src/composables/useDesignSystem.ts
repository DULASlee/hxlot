import { ref, computed, watch } from 'vue';

// 主题类型定义
export type ThemeType = 'tech-blue' | 'deep-green' | 'light-purple' | 'dark';

// 主题配置接口
export interface ThemeConfig {
  name: string;
  value: ThemeType;
  icon: string;
  color: string;
  description: string;
}

// 可用主题常量
export const THEMES: ThemeConfig[] = [
  {
    name: '科技蓝',
    value: 'tech-blue',
    icon: 'fas fa-microchip',
    color: '#0ea5e9',
    description: '现代科技感的蓝色主题，适合技术类企业'
  },
  {
    name: '深绿色',
    value: 'deep-green',
    icon: 'fas fa-leaf',
    color: '#059669',
    description: '稳重专业的绿色主题，适合环保和金融行业'
  },
  {
    name: '淡紫色',
    value: 'light-purple',
    icon: 'fas fa-palette',
    color: '#8b5cf6',
    description: '优雅时尚的紫色主题，适合创意和设计行业'
  },
  {
    name: '暗黑模式',
    value: 'dark',
    icon: 'fas fa-moon',
    color: '#1f2937',
    description: '护眼的暗黑主题，适合长时间工作'
  },
];

// 本地存储键
const THEME_STORAGE_KEY = 'app-theme';
const DARK_MODE_STORAGE_KEY = 'app-dark-mode';

/**
 * 主题系统 Composable
 * 提供主题管理功能，包括设置主题、切换暗黑模式、获取可用主题等
 */
export function useDesignSystem() {
  // 当前主题
  const theme = ref<ThemeType>(
    (localStorage.getItem(THEME_STORAGE_KEY) as ThemeType) || 'tech-blue'
  );

  // 是否启用暗黑模式
  const isDarkMode = ref(localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true');

  // 当前主题是否为暗黑模式
  const isCurrentThemeDark = computed(() => {
    return theme.value === 'dark';
  });

  // 设置主题
  const setTheme = (newTheme: ThemeType) => {
    theme.value = newTheme;
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyTheme();
  };

  // 切换暗黑模式
  const toggleDarkMode = () => {
    if (theme.value === 'dark') {
      // 如果当前是暗黑模式，切换到科技蓝主题
      setTheme('tech-blue');
    } else {
      // 否则切换到暗黑模式
      setTheme('dark');
    }
  };

  // 获取可用主题列表
  const getAvailableThemes = () => {
    return THEMES;
  };

  // 获取主题变量值
  const getThemeToken = (tokenName: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
  };

  // 设置主题变量值
  const setThemeToken = (tokenName: string, value: string): void => {
    document.documentElement.style.setProperty(tokenName, value);
  };

  // 应用主题到 DOM
  const applyTheme = () => {
    // 移除所有主题类
    THEMES.forEach((t) => {
      document.documentElement.classList.remove(`theme-${t.value}`);
    });

    // 设置 data-theme 属性
    document.documentElement.setAttribute('data-theme', theme.value);

    // 添加当前主题类
    document.documentElement.classList.add(`theme-${theme.value}`);

    // 设置颜色方案
    document.documentElement.style.colorScheme = isCurrentThemeDark.value ? 'dark' : 'light';

    // 更新 meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        getThemeToken('--theme-header-bg') || (isCurrentThemeDark.value ? '#1f2937' : '#ffffff')
      );
    }
  };

  // 监听系统主题变化（保留接口兼容性）
  const watchSystemTheme = () => {
    // 不再需要监听系统主题变化，返回空函数
    return () => {};
  };

  // 监听主题变化
  watch(theme, () => {
    applyTheme();
  });

  // 监听暗黑模式变化
  watch(isDarkMode, () => {
    applyTheme();
  });

  // 初始化主题
  const initTheme = () => {
    // 设置初始主题
    applyTheme();

    // 监听系统主题变化
    const cleanup = watchSystemTheme();

    return cleanup;
  };

  return {
    theme,
    isDarkMode,
    isCurrentThemeDark,
    setTheme,
    toggleDarkMode,
    getAvailableThemes,
    getThemeToken,
    setThemeToken,
    applyTheme,
    watchSystemTheme,
    initTheme,
    THEMES,
  };
}

export default useDesignSystem;
