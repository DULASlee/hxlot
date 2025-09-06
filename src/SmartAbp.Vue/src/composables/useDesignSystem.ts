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

  // 主题预加载缓存
  const themeCache = new Map<ThemeType, boolean>();

  // 预加载主题样式
  const preloadTheme = (themeType: ThemeType) => {
    if (themeCache.has(themeType)) return;

    // 创建临时元素预加载主题变量
    const tempElement = document.createElement('div');
    tempElement.className = `theme-${themeType}`;
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.style.pointerEvents = 'none';
    document.body.appendChild(tempElement);

    // 强制浏览器计算样式
    window.getComputedStyle(tempElement).backgroundColor;

    // 移除临时元素并标记为已缓存
    document.body.removeChild(tempElement);
    themeCache.set(themeType, true);
  };

  // 优化的主题设置函数
  const setTheme = (newTheme: ThemeType) => {
    // 防抖处理，避免快速切换时的性能问题
    if ((setTheme as any).debounceTimer) {
      clearTimeout((setTheme as any).debounceTimer);
    }

    (setTheme as any).debounceTimer = setTimeout(() => {
      if (theme.value !== newTheme) {
        // 开始性能监控
        const themeConfig = THEMES.find(t => t.value === newTheme);
        const themeName = themeConfig?.name || newTheme;
        performanceMonitor.measureThemeSwitch(themeName);

        // 预加载新主题
        preloadTheme(newTheme);

        theme.value = newTheme;
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        applyTheme();

        // 在下一帧结束性能监控
        requestAnimationFrame(() => {
          setTimeout(() => {
            performanceMonitor.endMeasurement(themeName);
          }, 200); // 等待过渡动画完成
        });
      }
      (setTheme as any).debounceTimer = null;
    }, 16); // 约1帧的延迟，平滑切换
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

  // 高性能主题应用函数
  const applyTheme = () => {
    // 使用 requestAnimationFrame 优化DOM操作
    requestAnimationFrame(() => {
      const documentElement = document.documentElement;
      const classList = documentElement.classList;

      // 批量DOM操作，减少重排重绘
      const currentThemeClass = `theme-${theme.value}`;
      const hasCurrentClass = classList.contains(currentThemeClass);

      if (!hasCurrentClass) {
        // 使用更高效的类名切换
        classList.forEach((className) => {
          if (className.startsWith('theme-')) {
            classList.remove(className);
          }
        });

        // 添加新主题类和过渡类
        classList.add(currentThemeClass, 'theme-transition');

        // 设置 data-theme 属性
        documentElement.setAttribute('data-theme', theme.value);

        // 设置颜色方案
        documentElement.style.colorScheme = isCurrentThemeDark.value ? 'dark' : 'light';

        // 更新 meta theme-color（异步执行，避免阻塞）
        setTimeout(() => {
          const metaThemeColor = document.querySelector('meta[name="theme-color"]');
          if (metaThemeColor) {
            const headerBg = getThemeToken('--theme-header-bg') ||
                           (isCurrentThemeDark.value ? '#1f2937' : '#ffffff');
            metaThemeColor.setAttribute('content', headerBg);
          }
        }, 0);

        // 移除过渡类，避免后续操作触发不必要的动画
        setTimeout(() => {
          classList.remove('theme-transition');
        }, 200);
      }
    });
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

  // 性能监控
  const performanceMonitor = {
    startTime: 0,
    endTime: 0,
    measureThemeSwitch: (themeName: string) => {
      performanceMonitor.startTime = performance.now();
      console.log(`🎨 开始切换主题: ${themeName}`);
    },
    endMeasurement: (themeName: string) => {
      performanceMonitor.endTime = performance.now();
      const duration = performanceMonitor.endTime - performanceMonitor.startTime;
      console.log(`✅ 主题切换完成: ${themeName}, 耗时: ${duration.toFixed(2)}ms`);

      // 如果切换时间超过100ms，输出警告
      if (duration > 100) {
        console.warn(`⚠️ 主题切换较慢: ${duration.toFixed(2)}ms，建议优化`);
      }
    }
  };

  // 预加载所有主题（在空闲时间执行）
  const preloadAllThemes = () => {
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        THEMES.forEach(themeConfig => {
          if (themeConfig.value !== theme.value) {
            preloadTheme(themeConfig.value);
          }
        });
        console.log('🚀 所有主题预加载完成');
      });
    } else {
      // 降级方案：使用setTimeout
      setTimeout(() => {
        THEMES.forEach(themeConfig => {
          if (themeConfig.value !== theme.value) {
            preloadTheme(themeConfig.value);
          }
        });
        console.log('🚀 所有主题预加载完成');
      }, 1000);
    }
  };

  // 初始化主题
  const initTheme = () => {
    // 设置初始主题
    applyTheme();

    // 预加载其他主题
    preloadAllThemes();

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
