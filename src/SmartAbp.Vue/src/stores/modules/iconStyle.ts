/**
 * 🎨 SmartAbp 图标风格管理 Store
 * 
 * 功能：
 * - 统一管理系统图标风格（表情符号 / FontAwesome / Element Plus / Carbon / Material Design）
 * - 一键切换全局图标风格
 * - 持久化用户偏好设置
 * - 动态更新所有图标显示
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

// 📋 图标映射接口
export interface IconMapping {
  emoji: string
  fontawesome: string
  elementPlus: string
  carbon: string
  material: string
}

// 🎨 预定义图标风格配置
const ICON_STYLES: Record<IconStyleType, IconStyleConfig> = {
  emoji: {
    id: 'emoji',
    name: '表情符号',
    description: '轻松活泼的表情符号风格',
    preview: '😀',
    enterprise: false,
    bundle: 'native'
  },
  fontawesome: {
    id: 'fontawesome',
    name: 'Font Awesome',
    description: '经典专业的企业级图标库',
    preview: 'fa-solid fa-briefcase',
    enterprise: true,
    bundle: 'fontawesome'
  },
  'element-plus': {
    id: 'element-plus',
    name: 'Element Plus',
    description: 'Element UI 配套图标',
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
    description: 'Google Material Design 图标',
    preview: 'mdi-briefcase',
    enterprise: true,
    bundle: 'material'
  }
}

// 📋 系统图标映射表（所有菜单和功能图标）
const ICON_MAPPINGS: Record<string, IconMapping> = {
  // 工作台
  dashboard: {
    emoji: '📊',
    fontawesome: 'fa-solid fa-chart-line',
    elementPlus: 'ep-data-line',
    carbon: 'carbon-dashboard',
    material: 'mdi-view-dashboard'
  },
  
  // 用户管理
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
  
  // 项目管理
  project: {
    emoji: '📁',
    fontawesome: 'fa-solid fa-project-diagram',
    elementPlus: 'ep-folder',
    carbon: 'carbon-folder',
    material: 'mdi-folder-multiple'
  },
  
  // 日志管理
  log: {
    emoji: '📋',
    fontawesome: 'fa-solid fa-list-alt',
    elementPlus: 'ep-document',
    carbon: 'carbon-document',
    material: 'mdi-file-document'
  },
  
  // 系统设置
  settings: {
    emoji: '⚙️',
    fontawesome: 'fa-solid fa-cog',
    elementPlus: 'ep-setting',
    carbon: 'carbon-settings',
    material: 'mdi-cog'
  },
  
  // 测试中心
  test: {
    emoji: '🧪',
    fontawesome: 'fa-solid fa-flask',
    elementPlus: 'ep-orange',
    carbon: 'carbon-chemistry',
    material: 'mdi-flask'
  },
  
  // 低代码
  lowcode: {
    emoji: '🧩',
    fontawesome: 'fa-solid fa-puzzle-piece',
    elementPlus: 'ep-connection',
    carbon: 'carbon-application',
    material: 'mdi-puzzle'
  },
  
  // 个人中心
  profile: {
    emoji: '👤',
    fontawesome: 'fa-solid fa-user-circle',
    elementPlus: 'ep-user',
    carbon: 'carbon-user-avatar',
    material: 'mdi-account-circle'
  },
  
  // 帮助中心
  help: {
    emoji: '❓',
    fontawesome: 'fa-solid fa-question-circle',
    elementPlus: 'ep-question-filled',
    carbon: 'carbon-help',
    material: 'mdi-help-circle'
  },
  
  // 操作图标
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
  
  // 更多图标可以继续添加...
}

// 🏪 图标风格管理 Store
export const useIconStyleStore = defineStore('iconStyle', () => {
  // 📊 状态
  const currentStyle = ref<IconStyleType>('emoji') // 默认表情符号
  const isChanging = ref(false)

  // 🎯 计算属性
  const styleConfig = computed(() => ICON_STYLES[currentStyle.value])
  
  const isEnterpriseStyle = computed(() => styleConfig.value.enterprise)
  
  const availableStyles = computed(() => Object.values(ICON_STYLES))

  /**
   * 🎨 获取指定键的图标
   * @param key 图标键名
   * @returns 当前风格的图标代码
   */
  const getIcon = (key: string): string => {
    const mapping = ICON_MAPPINGS[key]
    if (!mapping) {
      console.warn(`🚨 未找到图标映射: ${key}`)
      return currentStyle.value === 'emoji' ? '🔘' : 'fa-solid fa-circle'
    }
    
    // 将 'element-plus' 转换为 'elementPlus' 以匹配接口定义
    const styleKey = currentStyle.value === 'element-plus' ? 'elementPlus' : currentStyle.value as keyof IconMapping
    return mapping[styleKey] || mapping.emoji
  }

  /**
   * 🔄 切换图标风格
   * @param style 目标图标风格
   */
  const setIconStyle = async (style: IconStyleType) => {
    if (style === currentStyle.value) {
      return
    }

    isChanging.value = true
    
    try {
      // 保存到本地存储
      localStorage.setItem('smartabp-icon-style', style)
      
      // 更新当前风格
      currentStyle.value = style
      
      // 触发全局事件（供其他组件监听）
      window.dispatchEvent(new CustomEvent('icon-style-changed', {
        detail: { style }
      }))
      
      console.log(`🎨 图标风格已切换: ${ICON_STYLES[style].name}`)
      
    } catch (error) {
      console.error('❌ 图标风格切换失败:', error)
    } finally {
      isChanging.value = false
    }
  }

  /**
   * 🔄 从本地存储恢复图标风格
   */
  const loadIconStyle = () => {
    try {
      const saved = localStorage.getItem('smartabp-icon-style') as IconStyleType
      if (saved && ICON_STYLES[saved]) {
        currentStyle.value = saved
        console.log(`📦 已恢复图标风格: ${ICON_STYLES[saved].name}`)
      }
    } catch (error) {
      console.error('❌ 图标风格加载失败:', error)
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

