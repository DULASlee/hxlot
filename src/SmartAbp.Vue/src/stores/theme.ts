import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { usePreferredDark, useStorage } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark' | 'tech' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const currentTheme = useStorage<ThemeMode>('smartabp_theme', 'light')

  // 计算属性
  const preferredDark = usePreferredDark()
  const isDark = computed(() => {
    if (currentTheme.value === 'auto') {
      return preferredDark.value
    }
    return currentTheme.value === 'dark' || currentTheme.value === 'tech'
  })

  // 返回需要挂到组件的主题类名
  const themeClass = computed(() => {
    if (currentTheme.value === 'auto') {
      return preferredDark.value ? 'dark' : 'light'
    }
    return currentTheme.value
  })

  // 方法
  const setTheme = (theme: ThemeMode) => {
    currentTheme.value = theme
    localStorage.setItem('smartabp_theme', theme)
    applyTheme()
  }

  // 一键暗黑/还原
  const toggleTheme = () => {
    const newTheme: ThemeMode = isDark.value ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const applyTheme = () => {
    const root = document.documentElement
    // 清理旧主题类
    root.classList.remove('light', 'dark', 'tech')
    // 应用新主题类
    root.classList.add(themeClass.value)
    // 同步 data-theme 属性
    root.setAttribute('data-theme', themeClass.value)
    // 过渡动画
    document.body.classList.add('theme-transitions')
  }

  // 初始化主题
  const initTheme = () => {
    applyTheme()
    // 响应式监听：主题模式与系统偏好变化时自动应用
    watch([currentTheme, preferredDark], () => {
      applyTheme()
    })
  }

  return {
    // 状态
    currentTheme,
    // 计算属性
    isDark,
    themeClass,
    // 方法
    setTheme,
    toggleTheme,
    applyTheme,
    initTheme
  }
})
