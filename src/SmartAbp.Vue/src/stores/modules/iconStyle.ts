/**
 * 🎨 SmartAbp 图标风格管理 Store
 * 
 * 功能：
 * - 统一管理系统图标风格（表情符号 / FontAwesome / Element Plus / Carbon / Material Design）
 * - 一键切换全局图标风格
 * - 持久化用户偏好设置
 * - 动态更新所有图标显示
 * 
 * 配置驱动设计：
 * - 默认值和存储键名从配置中心读取
 * - 遵循开闭原则，消除硬编码
 */

import { DEFAULT_VALUES, STORAGE_KEYS } from '@/config/theme-icon.config'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// 🎨 图标风格类型定义
export type IconStyleType = 'emoji' | 'fontawesome' | 'element-plus' | 'carbon' | 'material'

// 🎯 图标风格配置接口
export interface IconStyleConfig {
  id: IconStyleType
  name: string
  description: string
  preview: string
  enterprise: boolean
  bundle: string
}

// 🏢 企业级图标映射接口（推荐）
export interface EnterpriseIconMapping {
  fontawesome: string
  elementPlus: string
  carbon: string
  material: string
}

// 📋 完整图标映射接口（包含社交场景图标）
// ⚠️ 仅在论坛、聊天等非企业级场景使用
export interface IconMapping extends EnterpriseIconMapping {
  emoji: string
}

// 🎨 预定义图标风格配置
const ICON_STYLES: Record<IconStyleType, IconStyleConfig> = {
  fontawesome: {
    id: 'fontawesome',
    name: 'Font Awesome',
    description: '经典专业的企业级图标库（推荐）',
    preview: 'fa-solid fa-briefcase',
    enterprise: true,
    bundle: 'fontawesome'
  },
  'element-plus': {
    id: 'element-plus',
    name: 'Element Plus',
    description: 'Element UI 配套企业级图标',
    preview: 'ep-briefcase',
    enterprise: true,
    bundle: 'element-plus'
  },
  carbon: {
    id: 'carbon',
    name: 'Carbon (IBM)',
    description: 'IBM 企业级设计图标',
    preview: 'carbon-dashboard',
    enterprise: true,
    bundle: 'carbon'
  },
  material: {
    id: 'material',
    name: 'Material Design',
    description: 'Google Material Design 企业级图标',
    preview: 'mdi-briefcase',
    enterprise: true,
    bundle: 'material'
  },
  emoji: {
    id: 'emoji',
    name: '表情符号',
    description: '⚠️ 仅适用于论坛、聊天等社交场景',
    preview: '😀',
    enterprise: false,
    bundle: 'native'
  }
}

// 📋 系统图标映射表（所有菜单和功能图标）
// 🎯 配置驱动设计：只需在此添加新图标，无需修改组件代码
const ICON_MAPPINGS: Record<string, IconMapping> = {
  // 📊 工作台相关
  dashboard: {
    emoji: '📊',
    fontawesome: 'fa-solid fa-chart-line',
    elementPlus: 'ep-data-line',
    carbon: 'carbon-dashboard',
    material: 'mdi-view-dashboard'
  },
  'chart-pie': {
    emoji: '📊',
    fontawesome: 'fa-solid fa-chart-pie',
    elementPlus: 'ep-pie-chart',
    carbon: 'carbon-chart-pie',
    material: 'mdi-chart-pie'
  },
  'chart-bar': {
    emoji: '📊',
    fontawesome: 'fa-solid fa-chart-bar',
    elementPlus: 'ep-histogram',
    carbon: 'carbon-chart-bar',
    material: 'mdi-chart-bar'
  },

  // 🔧 兼容别名：fa-chart-line → 使用与 dashboard 一致的线图
  'chart-line': {
    emoji: '📊',
    fontawesome: 'fa-solid fa-chart-line',
    elementPlus: 'ep-data-line',
    carbon: 'carbon-dashboard',
    material: 'mdi-view-dashboard'
  },

  // 👥 用户管理
  user: {
    emoji: '👤',
    fontawesome: 'fa-solid fa-user',
    elementPlus: 'ep-user',
    carbon: 'carbon-user',
    material: 'mdi-account'
  },
  users: {
    emoji: '👥',
    fontawesome: 'fa-solid fa-users',
    elementPlus: 'ep-user-filled',
    carbon: 'carbon-user-multiple',
    material: 'mdi-account-group'
  },
  'user-circle': {
    emoji: '👤',
    fontawesome: 'fa-solid fa-user-circle',
    elementPlus: 'ep-avatar',
    carbon: 'carbon-user-avatar',
    material: 'mdi-account-circle'
  },
  'user-shield': {
    emoji: '🛡️',
    fontawesome: 'fa-solid fa-user-shield',
    elementPlus: 'ep-user',
    carbon: 'carbon-user-role',
    material: 'mdi-shield-account'
  },
  'users-cog': {
    emoji: '👥⚙️',
    fontawesome: 'fa-solid fa-users-cog',
    elementPlus: 'ep-setting',
    carbon: 'carbon-user-settings',
    material: 'mdi-account-cog'
  },

  // 📁 项目管理
  project: {
    emoji: '📁',
    fontawesome: 'fa-solid fa-project-diagram',
    elementPlus: 'ep-folder',
    carbon: 'carbon-folder',
    material: 'mdi-folder-multiple'
  },

  // 🔧 兼容别名：fa-project-diagram 显式键名（与 project 等价）
  'project-diagram': {
    emoji: '📁',
    fontawesome: 'fa-solid fa-project-diagram',
    elementPlus: 'ep-folder',
    carbon: 'carbon-folder',
    material: 'mdi-folder-multiple'
  },
  tasks: {
    emoji: '📋',
    fontawesome: 'fa-solid fa-tasks',
    elementPlus: 'ep-document-checked',
    carbon: 'carbon-task',
    material: 'mdi-format-list-checks'
  },

  // 📋 日志管理
  log: {
    emoji: '📋',
    fontawesome: 'fa-solid fa-list-alt',
    elementPlus: 'ep-document',
    carbon: 'carbon-document',
    material: 'mdi-file-document'
  },
  'file-alt': {
    emoji: '📄',
    fontawesome: 'fa-solid fa-file-alt',
    elementPlus: 'ep-document',
    carbon: 'carbon-document-blank',
    material: 'mdi-file-document-outline'
  },
  list: {
    emoji: '📋',
    fontawesome: 'fa-solid fa-list',
    elementPlus: 'ep-menu',
    carbon: 'carbon-list',
    material: 'mdi-format-list-bulleted'
  },
  'list-ul': {
    emoji: '📋',
    fontawesome: 'fa-solid fa-list-ul',
    elementPlus: 'ep-menu',
    carbon: 'carbon-list-bulleted',
    material: 'mdi-format-list-bulleted'
  },
  eye: {
    emoji: '👁️',
    fontawesome: 'fa-solid fa-eye',
    elementPlus: 'ep-view',
    carbon: 'carbon-view',
    material: 'mdi-eye'
  },

  // ⚙️ 系统设置
  settings: {
    emoji: '⚙️',
    fontawesome: 'fa-solid fa-cog',
    elementPlus: 'ep-setting',
    carbon: 'carbon-settings',
    material: 'mdi-cog'
  },
  cog: {
    emoji: '⚙️',
    fontawesome: 'fa-solid fa-cog',
    elementPlus: 'ep-setting',
    carbon: 'carbon-settings',
    material: 'mdi-cog'
  },
  cogs: {
    emoji: '⚙️⚙️',
    fontawesome: 'fa-solid fa-cogs',
    elementPlus: 'ep-setting',
    carbon: 'carbon-settings-adjust',
    material: 'mdi-cogs'
  },
  key: {
    emoji: '🔑',
    fontawesome: 'fa-solid fa-key',
    elementPlus: 'ep-key',
    carbon: 'carbon-locked',
    material: 'mdi-key'
  },

  // 🧪 测试中心
  test: {
    emoji: '🧪',
    fontawesome: 'fa-solid fa-flask',
    elementPlus: 'ep-orange',
    carbon: 'carbon-chemistry',
    material: 'mdi-flask'
  },
  vial: {
    emoji: '🧪',
    fontawesome: 'fa-solid fa-vial',
    elementPlus: 'ep-test-tube',
    carbon: 'carbon-chemistry',
    material: 'mdi-test-tube'
  },
  microscope: {
    emoji: '🔬',
    fontawesome: 'fa-solid fa-microscope',
    elementPlus: 'ep-view',
    carbon: 'carbon-microscope',
    material: 'mdi-microscope'
  },
  bug: {
    emoji: '🐛',
    fontawesome: 'fa-solid fa-bug',
    elementPlus: 'ep-warning',
    carbon: 'carbon-debug',
    material: 'mdi-bug'
  },

  // 🧩 低代码
  lowcode: {
    emoji: '🧩',
    fontawesome: 'fa-solid fa-puzzle-piece',
    elementPlus: 'ep-connection',
    carbon: 'carbon-application',
    material: 'mdi-puzzle'
  },
  cubes: {
    emoji: '🧱',
    fontawesome: 'fa-solid fa-cubes',
    elementPlus: 'ep-box',
    carbon: 'carbon-cube',
    material: 'mdi-cube-outline'
  },
  code: {
    emoji: '💻',
    fontawesome: 'fa-solid fa-code',
    elementPlus: 'ep-document-copy',
    carbon: 'carbon-code',
    material: 'mdi-code-tags'
  },
  magic: {
    emoji: '✨',
    fontawesome: 'fa-solid fa-magic',
    elementPlus: 'ep-magic-stick',
    carbon: 'carbon-magic-wand',
    material: 'mdi-auto-fix'
  },
  'hat-wizard': {
    emoji: '🧙',
    fontawesome: 'fa-solid fa-hat-wizard',
    elementPlus: 'ep-magic-stick',
    carbon: 'carbon-magic-wand',
    material: 'mdi-wizard-hat'
  },
  'mouse-pointer': {
    emoji: '👆',
    fontawesome: 'fa-solid fa-mouse-pointer',
    elementPlus: 'ep-pointer',
    carbon: 'carbon-cursor',
    material: 'mdi-cursor-default'
  },
  'file-code': {
    emoji: '📝',
    fontawesome: 'fa-solid fa-file-code',
    elementPlus: 'ep-document',
    carbon: 'carbon-document-code',
    material: 'mdi-file-code'
  },
  database: {
    emoji: '🗄️',
    fontawesome: 'fa-solid fa-database',
    elementPlus: 'ep-coin',
    carbon: 'carbon-data-base',
    material: 'mdi-database'
  },
  'paint-brush': {
    emoji: '🎨',
    fontawesome: 'fa-solid fa-paint-brush',
    elementPlus: 'ep-brush',
    carbon: 'carbon-paint-brush',
    material: 'mdi-brush'
  },

  // 🏠 导航
  home: {
    emoji: '🏠',
    fontawesome: 'fa-solid fa-home',
    elementPlus: 'ep-home-filled',
    carbon: 'carbon-home',
    material: 'mdi-home'
  },

  // 👤 个人中心
  profile: {
    emoji: '👤',
    fontawesome: 'fa-solid fa-user-circle',
    elementPlus: 'ep-user',
    carbon: 'carbon-user-avatar',
    material: 'mdi-account-circle'
  },

  // ❓ 帮助中心
  help: {
    emoji: '❓',
    fontawesome: 'fa-solid fa-question-circle',
    elementPlus: 'ep-question-filled',
    carbon: 'carbon-help',
    material: 'mdi-help-circle'
  },
  'question-circle': {
    emoji: '❓',
    fontawesome: 'fa-solid fa-question-circle',
    elementPlus: 'ep-question-filled',
    carbon: 'carbon-help',
    material: 'mdi-help-circle'
  },

  // 🎨 主题
  palette: {
    emoji: '🎨',
    fontawesome: 'fa-solid fa-palette',
    elementPlus: 'ep-picture',
    carbon: 'carbon-color-palette',
    material: 'mdi-palette'
  },
  'tachometer-alt': {
    emoji: '⚡',
    fontawesome: 'fa-solid fa-tachometer-alt',
    elementPlus: 'ep-odometer',
    carbon: 'carbon-dashboard-reference',
    material: 'mdi-speedometer'
  },
  'sign-in-alt': {
    emoji: '🔐',
    fontawesome: 'fa-solid fa-sign-in-alt',
    elementPlus: 'ep-right',
    carbon: 'carbon-login',
    material: 'mdi-login'
  },

  // 🔧 操作图标
  add: {
    emoji: '➕',
    fontawesome: 'fa-solid fa-plus',
    elementPlus: 'ep-plus',
    carbon: 'carbon-add',
    material: 'mdi-plus'
  },
  edit: {
    emoji: '✏️',
    fontawesome: 'fa-solid fa-edit',
    elementPlus: 'ep-edit',
    carbon: 'carbon-edit',
    material: 'mdi-pencil'
  },
  delete: {
    emoji: '🗑️',
    fontawesome: 'fa-solid fa-trash',
    elementPlus: 'ep-delete',
    carbon: 'carbon-trash-can',
    material: 'mdi-delete'
  },
  search: {
    emoji: '🔍',
    fontawesome: 'fa-solid fa-search',
    elementPlus: 'ep-search',
    carbon: 'carbon-search',
    material: 'mdi-magnify'
  },
  refresh: {
    emoji: '🔄',
    fontawesome: 'fa-solid fa-sync-alt',
    elementPlus: 'ep-refresh',
    carbon: 'carbon-renew',
    material: 'mdi-refresh'
  },
}

// ⚠️ 以下为新增的图标映射（2025-10-01 图标系统迁移）

// 📄 文档相关
const ICON_MAPPINGS_EXTEND_DOCS = {
  'file-alt': {
    emoji: '📄',
    fontawesome: 'fa-solid fa-file-alt',
    elementPlus: 'ep-document',
    carbon: 'carbon-document',
    material: 'mdi-file-document'
  },
}

// 🧪 测试相关
const ICON_MAPPINGS_EXTEND_TEST = {
  vial: {
    emoji: '🧪',
    fontawesome: 'fa-solid fa-vial',
    elementPlus: 'ep-experiment',
    carbon: 'carbon-chemistry',
    material: 'mdi-test-tube'
  },
  microscope: {
    emoji: '🔬',
    fontawesome: 'fa-solid fa-microscope',
    elementPlus: 'ep-data-analysis',
    carbon: 'carbon-microscope',
    material: 'mdi-microscope'
  },
}

// 🔐 登录相关
const ICON_MAPPINGS_EXTEND_AUTH = {
  'sign-in-alt': {
    emoji: '🔐',
    fontawesome: 'fa-solid fa-sign-in-alt',
    elementPlus: 'ep-key',
    carbon: 'carbon-login',
    material: 'mdi-login'
  },
}

// 🧙 AI相关
const ICON_MAPPINGS_EXTEND_AI = {
  'hat-wizard': {
    emoji: '🧙',
    fontawesome: 'fa-solid fa-hat-wizard',
    elementPlus: 'ep-magic-stick',
    carbon: 'carbon-ai-status',
    material: 'mdi-wizard-hat'
  },
}

// 👆 交互相关
const ICON_MAPPINGS_EXTEND_INTERACTION = {
  'mouse-pointer': {
    emoji: '👆',
    fontawesome: 'fa-solid fa-mouse-pointer',
    elementPlus: 'ep-pointer',
    carbon: 'carbon-cursor-1',
    material: 'mdi-cursor-default'
  },
}

// 🖥️ 主题图标
const ICON_MAPPINGS_EXTEND_THEME = {
  microchip: {
    emoji: '🖥️',
    fontawesome: 'fa-solid fa-microchip',
    elementPlus: 'ep-cpu',
    carbon: 'carbon-chip',
    material: 'mdi-chip'
  },
  leaf: {
    emoji: '🍃',
    fontawesome: 'fa-solid fa-leaf',
    elementPlus: 'ep-orange',
    carbon: 'carbon-tree',
    material: 'mdi-leaf'
  },
}

// 🔄 合并扩展映射到主映射表
Object.assign(ICON_MAPPINGS,
  ICON_MAPPINGS_EXTEND_DOCS,
  ICON_MAPPINGS_EXTEND_TEST,
  ICON_MAPPINGS_EXTEND_AUTH,
  ICON_MAPPINGS_EXTEND_AI,
  ICON_MAPPINGS_EXTEND_INTERACTION,
  ICON_MAPPINGS_EXTEND_THEME
)

// 🏪 图标风格管理 Store
export const useIconStyleStore = defineStore('iconStyle', () => {
  // 📊 状态
  // ✅ 配置驱动：使用配置中心的默认值（Element Plus）
  const currentStyle = ref<IconStyleType>(DEFAULT_VALUES.ICON_STYLE)
  const isChanging = ref(false)

  // 🎯 计算属性
  const styleConfig = computed(() => ICON_STYLES[currentStyle.value])

  const isEnterpriseStyle = computed(() => styleConfig.value.enterprise)

  // 🏢 仅返回企业级图标风格（过滤掉emoji等非企业级风格）
  const availableStyles = computed(() =>
    Object.values(ICON_STYLES).filter(style => style.enterprise)
  )

  /**
   * 🔍 从旧的图标类名中提取图标键名
   * @param iconClass 旧的图标类名（如 'fas fa-chart-pie'）
   * @returns 图标键名（如 'chart-pie'） 或 null
   */
  const extractIconKey = (iconClass: string): string | null => {
    // 如果包含空格或 fa-，说明是旧的 FontAwesome 类名
    if (!iconClass.includes(' ') && !iconClass.includes('fa-')) {
      return null // 已经是图标键名
    }

    // 提取最后一个部分作为键名
    // "fas fa-chart-pie" -> "chart-pie"
    // "fa-solid fa-users" -> "users"
    const parts = iconClass.split(' ')
    const lastPart = parts[parts.length - 1]
    if (!lastPart) return null

    // 移除 fa- 前缀
    const keyName = lastPart.replace(/^fa-/, '')

    // 检查是否存在对应的映射
    return ICON_MAPPINGS[keyName] ? keyName : null
  }

  /**
   * 🎨 获取指定键的图标（智能解析）
   * @param key 图标键名或旧的图标类名
   * @returns 当前风格的图标代码
   */
  const getIcon = (key: string): string => {
    // 🔍 智能解析：自动处理旧的图标类名
    const extractedKey = extractIconKey(key)
    const iconKey = extractedKey || key

    const mapping = ICON_MAPPINGS[iconKey]
    if (!mapping) {
      console.warn(`🚨 未找到图标映射: ${key} (解析为: ${iconKey})`)
      return currentStyle.value === 'emoji' ? '🔘' : 'fa-solid fa-circle'
    }

    // 将 'element-plus' 转换为 'elementPlus' 以匹配接口定义
    const styleKey = currentStyle.value === 'element-plus' ? 'elementPlus' : currentStyle.value as keyof IconMapping
    return mapping[styleKey] || mapping.emoji
  }

  /**
   * 🔄 切换图标风格
   * 🏢 企业级保护：阻止切换到非企业级风格
   * 🛡️ 错误恢复：同时更新主存储和备份存储
   * @param style 目标图标风格
   */
  const setIconStyle = async (style: IconStyleType) => {
    if (style === currentStyle.value) {
      return
    }

    // 🏢 企业级管理系统：禁止切换到非企业级图标风格
    if (!ICON_STYLES[style].enterprise) {
      const errorMsg = `⚠️ 企业级管理系统禁止使用非企业级图标风格: ${ICON_STYLES[style].name}`
      console.warn(errorMsg)
      throw new Error(errorMsg)
    }

    isChanging.value = true

    try {
      // ✅ 配置驱动：使用配置的存储键名
      // 🛡️ 同时更新主存储和备份存储
      localStorage.setItem(STORAGE_KEYS.ICON_STYLE, style)
      localStorage.setItem(STORAGE_KEYS.ICON_STYLE_BACKUP, style)

      // 更新当前风格
      currentStyle.value = style

      // 触发全局事件（供其他组件监听）
      window.dispatchEvent(new CustomEvent('icon-style-changed', {
        detail: { style }
      }))

      console.log(`🎨 图标风格已切换: ${ICON_STYLES[style].name}`)

      // ⚠️ 不刷新页面，避免权限丢失
      // 图标风格会通过响应式系统自动更新

    } catch (error) {
      console.error('❌ 图标风格切换失败:', error)
      throw error
    } finally {
      isChanging.value = false
    }
  }

  /**
   * 🔄 从本地存储恢复图标风格
   * 🏢 企业级优先原则：非企业级风格自动切换为默认值
   * 🛡️ 错误恢复机制：主存储 → 备份存储 → 默认值
   */
  const loadIconStyle = () => {
    try {
      // ✅ 配置驱动：使用配置的存储键名
      const saved = localStorage.getItem(STORAGE_KEYS.ICON_STYLE) as IconStyleType
      const backup = localStorage.getItem(STORAGE_KEYS.ICON_STYLE_BACKUP) as IconStyleType
      const validStyle = saved || backup

      if (validStyle && ICON_STYLES[validStyle]) {
        // 🏢 企业级管理系统：禁止使用非企业级图标风格（如 emoji）
        if (!ICON_STYLES[validStyle].enterprise) {
          console.warn(`⚠️ 检测到非企业级图标风格: ${ICON_STYLES[validStyle].name}，切换为默认值`)
          // ✅ 配置驱动：使用配置的默认值
          currentStyle.value = DEFAULT_VALUES.ICON_STYLE
          localStorage.setItem(STORAGE_KEYS.ICON_STYLE, DEFAULT_VALUES.ICON_STYLE)
          localStorage.setItem(STORAGE_KEYS.ICON_STYLE_BACKUP, DEFAULT_VALUES.ICON_STYLE)
        } else {
          currentStyle.value = validStyle
          // 🛡️ 更新备份以便下次恢复
          localStorage.setItem(STORAGE_KEYS.ICON_STYLE_BACKUP, validStyle)
          console.log(`📦 已恢复图标风格: ${ICON_STYLES[validStyle].name}`)
        }
      } else {
        // ✅ 配置驱动：使用配置的默认值
        currentStyle.value = DEFAULT_VALUES.ICON_STYLE
        localStorage.setItem(STORAGE_KEYS.ICON_STYLE, DEFAULT_VALUES.ICON_STYLE)
        localStorage.setItem(STORAGE_KEYS.ICON_STYLE_BACKUP, DEFAULT_VALUES.ICON_STYLE)
        console.log(`🏢 使用默认企业级图标风格: ${ICON_STYLES[DEFAULT_VALUES.ICON_STYLE].name}`)
      }
    } catch (error) {
      console.error('❌ 图标风格加载失败，使用默认值:', error)
      // ✅ 配置驱动：发生错误时使用配置的默认值
      currentStyle.value = DEFAULT_VALUES.ICON_STYLE
    }
  }

  /**
   * 🔧 批量获取图标映射
   * @param keys 图标键名数组
   * @returns 图标映射对象
   */
  const getIcons = (keys: string[]): Record<string, string> => {
    const result: Record<string, string> = {}
    keys.forEach(key => {
      result[key] = getIcon(key)
    })
    return result
  }

  /**
   * 📋 获取所有可用图标键名
   */
  const getAllIconKeys = (): string[] => {
    return Object.keys(ICON_MAPPINGS)
  }

  /**
   * ➕ 添加自定义图标映射
   * @param key 图标键名
   * @param mapping 图标映射
   */
  const addIconMapping = (key: string, mapping: IconMapping) => {
    if (ICON_MAPPINGS[key]) {
      console.warn(`🚨 图标映射已存在: ${key}`)
    }
    ICON_MAPPINGS[key] = mapping
    console.log(`✅ 已添加图标映射: ${key}`)
  }

  // 🎯 初始化时加载保存的风格
  loadIconStyle()

  return {
    // 状态
    currentStyle,
    isChanging,

    // 计算属性
    styleConfig,
    isEnterpriseStyle,
    availableStyles,

    // 方法
    getIcon,
    getIcons,
    setIconStyle,
    loadIconStyle,
    getAllIconKeys,
    addIconMapping
  }
})

