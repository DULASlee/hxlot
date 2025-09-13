/* eslint-disable */
import { ref, computed, watch } from "vue"

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  BLUE: "blue",
} as const

type ThemeColors = Record<string, string>

type ThemeConfigItem = {
  name: string
  icon: string
  colors: ThemeColors
}

const themeConfig: Record<string, ThemeConfigItem> = {
  [THEMES.LIGHT]: {
    name: "浅色主题",
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
    name: "暗黑主题",
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
    name: "科技蓝主题",
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
}

const currentTheme = ref<string>(localStorage.getItem("app-theme") || THEMES.LIGHT)

export function useTheme() {
  const theme = computed<ThemeConfigItem>(
    () => themeConfig[currentTheme.value] || themeConfig[THEMES.LIGHT],
  )
  const isDark = computed(() => currentTheme.value === THEMES.DARK)

  const applyTheme = (themeName: string) => {
    const config = themeConfig[themeName] || themeConfig[THEMES.LIGHT]
    const root = document.documentElement

    // 强制移除所有现有主题类
    root.className = root.className.replace(/theme-\w+/g, "")

    // 清除所有现有的CSS变量
    Object.keys(themeConfig[THEMES.LIGHT].colors).forEach((key) => {
      root.style.removeProperty(`--color-${key}`)
    })

    // 应用新主题的CSS变量
    Object.entries(config.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })

    // 添加主题类名
    root.classList.add(`theme-${themeName}`)

    // 强制重新渲染
    root.style.display = "none"
    root.offsetHeight // 触发重排
    root.style.display = ""

    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", config.colors.primary)
    }

    // 触发自定义事件通知主题变更
    window.dispatchEvent(
      new CustomEvent("theme-changed", {
        detail: { theme: themeName, colors: config.colors },
      }),
    )
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
