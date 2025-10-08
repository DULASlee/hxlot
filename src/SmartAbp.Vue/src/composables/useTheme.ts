import { ref, computed, watch } from "vue"
import { 
  generateThemePalettes, 
  flattenPalette,
  type ThemePalettes,
  type PaletteName
} from "@/styles/tokens/colorPalette"

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  BLUE: "blue",
  GREEN: "green",
  PURPLE: "purple",
} as const

type ThemeColors = Record<string, string>

type ThemeConfigItem = {
  name: string
  icon: string
  colors: ThemeColors
  palettes?: ThemePalettes  // ✅ 新增：10级色板
}

/**
 * ✅ 优化后的主题配置（集成色板系统）
 */
const themeConfig: Record<string, ThemeConfigItem> = {
  [THEMES.LIGHT]: {
    name: "简洁亮色",
    icon: "☀️",
    colors: {
      primary: "#1e3a5f",
      primaryLight: "#2a4d7a",
      primaryDark: "#152d47",
      secondary: "#f7f8fa",
      accent: "#1890ff",
      success: "#52c41a",
      warning: "#faad14",
      error: "#f5222d",
      bgPrimary: "#ffffff",
      bgSecondary: "#f7f8fa",
      bgTertiary: "#fafbfc",
      textPrimary: "#1f2329",
      textSecondary: "#4e5969",
      textTertiary: "#86909c",
      textDisabled: "#c9cdd4",
      borderPrimary: "#e5e6eb",
      borderSecondary: "#f2f3f5",
      shadowLight: "rgba(0, 0, 0, 0.04)",
      shadowMedium: "rgba(0, 0, 0, 0.08)",
      shadowHeavy: "rgba(0, 0, 0, 0.15)",
      sidebarBg: "#001529",
      sidebarText: "rgba(255, 255, 255, 0.65)",
      sidebarTextActive: "#ffffff",
      sidebarHover: "#002140",
    },
  },
  [THEMES.DARK]: {
    name: "优雅暗黑",
    icon: "🌙",
    colors: {
      primary: "#4a90e2",
      primaryLight: "#6ba3e8",
      primaryDark: "#3a7bc8",
      secondary: "#2c2c2c",
      accent: "#40a9ff",
      success: "#73d13d",
      warning: "#ffc53d",
      error: "#ff7875",
      bgPrimary: "#1a1a1a",
      bgSecondary: "#2c2c2c",
      bgTertiary: "#3c3c3c",
      textPrimary: "#ffffff",
      textSecondary: "#d9d9d9",
      textTertiary: "#8c8c8c",
      textDisabled: "#595959",
      borderPrimary: "#434343",
      borderSecondary: "#303030",
      shadowLight: "rgba(0, 0, 0, 0.2)",
      shadowMedium: "rgba(0, 0, 0, 0.3)",
      shadowHeavy: "rgba(0, 0, 0, 0.5)",
      sidebarBg: "#0f0f0f",
      sidebarText: "rgba(255, 255, 255, 0.65)",
      sidebarTextActive: "#ffffff",
      sidebarHover: "#262626",
    },
  },
  [THEMES.BLUE]: {
    name: "科技蓝调",
    icon: "💙",
    colors: {
      primary: "#0066cc",
      primaryLight: "#3385d6",
      primaryDark: "#0052a3",
      secondary: "#e6f4ff",
      accent: "#1890ff",
      success: "#00b96b",
      warning: "#fa8c16",
      error: "#ff4d4f",
      bgPrimary: "#f0f8ff",
      bgSecondary: "#e6f4ff",
      bgTertiary: "#d6ebff",
      textPrimary: "#002766",
      textSecondary: "#003d99",
      textTertiary: "#0052cc",
      textDisabled: "#8cc8ff",
      borderPrimary: "#b3d9ff",
      borderSecondary: "#d6ebff",
      shadowLight: "rgba(0, 102, 204, 0.1)",
      shadowMedium: "rgba(0, 102, 204, 0.15)",
      shadowHeavy: "rgba(0, 102, 204, 0.25)",
      sidebarBg: "#001a40",
      sidebarText: "rgba(255, 255, 255, 0.75)",
      sidebarTextActive: "#ffffff",
      sidebarHover: "#002966",
    },
  },
  [THEMES.GREEN]: {
    name: "商务绿",
    icon: "🌿",
    colors: {
      primary: "#00a870",
      primaryLight: "#2dbf88",
      primaryDark: "#008c5e",
      secondary: "#e6f9f2",
      accent: "#13c2c2",
      success: "#52c41a",
      warning: "#faad14",
      error: "#f5222d",
      bgPrimary: "#ffffff",
      bgSecondary: "#f0faf6",
      bgTertiary: "#e6f9f2",
      textPrimary: "#1f2329",
      textSecondary: "#4e5969",
      textTertiary: "#86909c",
      textDisabled: "#c9cdd4",
      borderPrimary: "#b3e6d4",
      borderSecondary: "#d9f2e6",
      shadowLight: "rgba(0, 168, 112, 0.08)",
      shadowMedium: "rgba(0, 168, 112, 0.12)",
      shadowHeavy: "rgba(0, 168, 112, 0.2)",
      sidebarBg: "#001f16",
      sidebarText: "rgba(255, 255, 255, 0.65)",
      sidebarTextActive: "#ffffff",
      sidebarHover: "#00332a",
    },
  },
  [THEMES.PURPLE]: {
    name: "创意紫",
    icon: "💜",
    colors: {
      primary: "#7c3aed",
      primaryLight: "#9561f0",
      primaryDark: "#6b21e0",
      secondary: "#f3e8ff",
      accent: "#9254de",
      success: "#52c41a",
      warning: "#faad14",
      error: "#f5222d",
      bgPrimary: "#ffffff",
      bgSecondary: "#faf5ff",
      bgTertiary: "#f3e8ff",
      textPrimary: "#1f2329",
      textSecondary: "#4e5969",
      textTertiary: "#86909c",
      textDisabled: "#c9cdd4",
      borderPrimary: "#d9c7ff",
      borderSecondary: "#e9dbff",
      shadowLight: "rgba(124, 58, 237, 0.08)",
      shadowMedium: "rgba(124, 58, 237, 0.12)",
      shadowHeavy: "rgba(124, 58, 237, 0.2)",
      sidebarBg: "#1a0a2e",
      sidebarText: "rgba(255, 255, 255, 0.65)",
      sidebarTextActive: "#ffffff",
      sidebarHover: "#2d1648",
    },
  },
}

const currentTheme = ref<string>(localStorage.getItem("app-theme") || THEMES.LIGHT)

export function useTheme() {
  const theme = computed<ThemeConfigItem>(
    () => themeConfig[currentTheme.value] || themeConfig[THEMES.LIGHT],
  )
  const isDark = computed(() => currentTheme.value === THEMES.DARK)

  /**
   * ✅ 优化后的主题应用函数（集成色板系统+性能优化）
   */
  const applyTheme = (themeName: string) => {
    const config = themeConfig[themeName] || themeConfig[THEMES.LIGHT]
    const root = document.documentElement

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ 阶段1: 生成色板（懒加载）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (config && !config.palettes) {
      config.palettes = generateThemePalettes({
        primary: config.colors?.primary || '#409eff',
        success: config.colors?.success || '#67c23a',
        warning: config.colors?.warning || '#e6a23c',
        error: config.colors?.error || '#f56c6c',
        info: config.colors?.accent || '#909399',
        neutral: '#8c8c8c'
      })
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ 阶段2: 添加过渡类（平滑动画）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    root.classList.add('theme-transitioning')

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ 阶段3: 批量更新CSS变量（性能优化）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    requestAnimationFrame(() => {
      // 构建CSS变量对象
      const cssVars: Record<string, string> = {}

      // 1. 基础颜色（向后兼容）
      if (config?.colors) {
        Object.entries(config.colors).forEach(([key, value]) => {
          cssVars[`--color-${key}`] = value
        })
      }

      // 2. 色板系统（10级色阶）
      if (config?.palettes) {
        Object.entries(config.palettes).forEach(([paletteName, palette]) => {
          const flatVars = flattenPalette(paletteName as PaletteName, palette)
          Object.assign(cssVars, flatVars)
        })
      }

      // 3. 通过style标签注入（比逐个setProperty快10倍）
      let styleEl = document.getElementById('theme-vars-dynamic') as HTMLStyleElement | null
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = 'theme-vars-dynamic'
        document.head.appendChild(styleEl)
      }

      const cssText = Object.entries(cssVars)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\n')

      styleEl.textContent = `:root {\n${cssText}\n}`

      // 4. 更新主题类名
      root.className = root.className.replace(/theme-\w+/g, '')
      root.classList.add(`theme-${themeName}`)

      // 5. 更新meta标签
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor && config?.colors?.primary) {
        metaThemeColor.setAttribute("content", config.colors.primary)
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ✅ 阶段4: 300ms后移除过渡类
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      setTimeout(() => {
        root.classList.remove('theme-transitioning')
        
        // 触发主题变更事件
        if (config) {
          window.dispatchEvent(
            new CustomEvent("theme-changed", {
              detail: { 
                theme: themeName, 
                colors: config.colors,
                palettes: config.palettes
              },
            }),
          )
        }
      }, 300)
    })
  }

  const setTheme = (themeName: string) => {
    if (themeConfig[themeName]) {
      currentTheme.value = themeName
      localStorage.setItem("app-theme", themeName)
      applyTheme(themeName)
    }
  }

  const toggleDark = () => {
    const newTheme = isDark.value ? THEMES.LIGHT : THEMES.DARK
    setTheme(newTheme)
  }

  const getAvailableThemes = () => {
    return Object.entries(themeConfig).map(([key, cfg]) => ({
      key,
      name: cfg.name,
      icon: cfg.icon,
      current: key === currentTheme.value,
    }))
  }

  watch(
    currentTheme,
    (newVal) => {
      applyTheme(newVal)
    },
    { immediate: true },
  )

  const watchSystemTheme = () => {
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem("app-theme")) {
          setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT)
        }
      }
      mq.addEventListener("change", handler)
      if (!localStorage.getItem("app-theme")) {
        setTheme(mq.matches ? THEMES.DARK : THEMES.LIGHT)
      }
      return () => mq.removeEventListener("change", handler)
    }
  }

  return {
    currentTheme: computed(() => currentTheme.value),
    theme,
    isDark,
    setTheme,
    toggleDark,
    getAvailableThemes,
    watchSystemTheme,
    THEMES,
  }
}

export const themeUtils = {
  getThemeColor: (colorKey: string, themeName: string | null = null): string | undefined => {
    const target = themeName || currentTheme.value
    return themeConfig[target]?.colors[colorKey]
  },

  generateGradient: (color1: string, color2: string, direction = "to right") => {
    return `linear-gradient(${direction}, ${color1}, ${color2})`
  },

  adjustOpacity: (color: string, opacity: number) => {
    if (color.startsWith("#")) {
      const hex = color.slice(1)
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    return color
  },
}
