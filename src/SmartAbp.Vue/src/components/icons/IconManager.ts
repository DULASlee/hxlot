/**
 * 🏢 SmartAbp 企业级图标管理器
 * 🎯 统一图标注册、加载和性能优化
 * ⚡ 支持按需加载和缓存策略
 * 🎨 企业级视觉规范管理
 */

import type { App, Component } from 'vue'

// 🎯 图标配置接口
export interface IconConfig {
  /** 图标名称 */
  name: string
  /** 图标组件 */
  component: Component | (() => Promise<Component>)
  /** 图标分类 */
  category: IconCategory
  /** 图标标签 */
  tags: string[]
  /** 是否为企业级图标 */
  enterprise?: boolean
  /** 图标版本 */
  version?: string
  /** 描述信息 */
  description?: string
}

// 📂 图标分类枚举
export enum IconCategory {
  BUSINESS = 'business',          // 💼 业务管理
  SYSTEM = 'system',             // ⚙️ 系统管理
  USER = 'user',                 // 👥 用户权限
  DATA = 'data',                 // 📊 数据管理
  ACTION = 'action',             // 📋 操作动作
  NAVIGATION = 'navigation',     // 📁 导航控制
  STATUS = 'status',             // 🔔 状态提示
  TOOL = 'tool',                 // 🛠️ 开发工具
  COMMON = 'common'              // 📱 通用图标
}

// 🎨 图标主题配置
export interface IconTheme {
  name: string
  colors: {
    primary: string
    success: string
    warning: string
    danger: string
    info: string
    text: string
  }
  sizes: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
}

// 🏢 企业级图标管理器核心类
export class EnterpriseIconManager {
  private static instance: EnterpriseIconManager
  private iconRegistry = new Map<string, IconConfig>()
  private loadedIcons = new Set<string>()
  private currentTheme: IconTheme
  private app?: App

  // 🎨 默认企业级主题
  private static DEFAULT_THEME: IconTheme = {
    name: 'enterprise',
    colors: {
      primary: '#409EFF',
      success: '#67C23A', 
      warning: '#E6A23C',
      danger: '#F56C6C',
      info: '#909399',
      text: '#303133'
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24
    }
  }

  private constructor() {
    this.currentTheme = EnterpriseIconManager.DEFAULT_THEME
    this.initializeEnterpriseIcons()
  }

  // 🏗️ 单例模式获取实例
  static getInstance(): EnterpriseIconManager {
    if (!this.instance) {
      this.instance = new EnterpriseIconManager()
    }
    return this.instance
  }

  // 🔧 初始化 Vue 应用
  install(app: App) {
    // 提供图标管理器
    app.provide('iconManager', this)
    
    console.log('🎨 企业级图标系统已注册')
  }

  // 📝 注册图标
  registerIcon(config: IconConfig): void {
    if (this.iconRegistry.has(config.name)) {
      console.warn(`🚨 图标已存在: ${config.name}`)
      return
    }

    this.iconRegistry.set(config.name, {
      ...config,
      enterprise: config.enterprise ?? true,
      version: config.version ?? '1.0.0'
    })

    console.log(`✅ 已注册企业级图标: ${config.name}`)
  }

  // 📦 批量注册图标
  registerIcons(configs: IconConfig[]): void {
    configs.forEach(config => this.registerIcon(config))
  }

  // 🔍 获取图标配置
  getIcon(name: string): IconConfig | undefined {
    return this.iconRegistry.get(name)
  }

  // 📋 获取所有图标
  getAllIcons(): Map<string, IconConfig> {
    return new Map(this.iconRegistry)
  }

  // 🏷️ 按分类获取图标
  getIconsByCategory(category: IconCategory): IconConfig[] {
    return Array.from(this.iconRegistry.values())
      .filter(icon => icon.category === category)
  }

  // 🔎 搜索图标
  searchIcons(query: string): IconConfig[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.iconRegistry.values())
      .filter(icon => 
        icon.name.toLowerCase().includes(lowerQuery) ||
        icon.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        (icon.description && icon.description.toLowerCase().includes(lowerQuery))
      )
  }

  // ⚡ 预加载图标
  async preloadIcon(name: string): Promise<void> {
    if (this.loadedIcons.has(name)) {
      return // 已加载
    }

    const iconConfig = this.getIcon(name)
    if (!iconConfig) {
      console.warn(`🚨 未找到图标: ${name}`)
      return
    }

    try {
      if (typeof iconConfig.component === 'function') {
        // 预加载异步组件
        const asyncComponent = iconConfig.component as () => Promise<any>
        await asyncComponent()
      }
      this.loadedIcons.add(name)
      console.log(`📦 已预加载图标: ${name}`)
    } catch (error) {
      console.error(`❌ 预加载图标失败: ${name}`, error)
    }
  }

  // 📦 批量预加载图标
  async preloadIcons(names: string[]): Promise<void> {
    await Promise.all(names.map(name => this.preloadIcon(name)))
  }

  // 🎨 设置主题
  setTheme(theme: Partial<IconTheme>): void {
    this.currentTheme = {
      ...this.currentTheme,
      ...theme
    }
    
    // 更新 CSS 变量
    this.updateCSSVariables()
    console.log(`🎨 已切换图标主题: ${theme.name || 'custom'}`)
  }

  // 📏 获取当前主题
  getCurrentTheme(): IconTheme {
    return { ...this.currentTheme }
  }

  // 🧹 清理未使用的图标
  cleanup(): void {
    // 实现图标缓存清理逻辑
    console.log('🧹 开始清理未使用的图标缓存')
    
    // 清理加载记录
    this.loadedIcons.clear()
    
    console.log('✅ 图标缓存清理完成')
  }

  // 📊 获取使用统计
  getUsageStats(): {
    totalIcons: number
    loadedIcons: number
    categoryStats: Record<string, number>
  } {
    const categoryStats: Record<string, number> = {}
    
    Array.from(this.iconRegistry.values()).forEach(icon => {
      categoryStats[icon.category] = (categoryStats[icon.category] || 0) + 1
    })

    return {
      totalIcons: this.iconRegistry.size,
      loadedIcons: this.loadedIcons.size,
      categoryStats
    }
  }

  // 🎯 初始化企业级图标
  private initializeEnterpriseIcons(): void {
    // 📊 业务管理图标
    this.registerBusinessIcons()
    
    // ⚙️ 系统管理图标
    this.registerSystemIcons()
    
    // 👥 用户权限图标
    this.registerUserIcons()
    
    // 📋 操作动作图标
    this.registerActionIcons()
    
    // 📁 导航控制图标
    this.registerNavigationIcons()
    
    // 🔔 状态提示图标
    this.registerStatusIcons()
    
    // 🛠️ 开发工具图标
    this.registerToolIcons()
    
    // 📱 通用图标
    this.registerCommonIcons()
  }

  // 💼 注册业务管理图标
  private registerBusinessIcons(): void {
    const businessIcons: Omit<IconConfig, 'category'>[] = [
      {
        name: 'dashboard',
        component: () => import('./enterprise/DashboardIcon.vue'),
        tags: ['仪表板', '概览', '首页'],
        description: '工作台仪表板图标'
      },
      {
        name: 'project',
        component: () => import('./enterprise/ProjectIcon.vue'),
        tags: ['项目', '管理', '业务'],
        description: '项目管理图标'
      },
      {
        name: 'order',
        component: () => import('./enterprise/OrderIcon.vue'),
        tags: ['订单', '购物车', '交易'],
        description: '订单管理图标'
      },
      {
        name: 'customer',
        component: () => import('./enterprise/CustomerIcon.vue'),
        tags: ['客户', '用户群', '业务'],
        description: '客户管理图标'
      }
    ]

    businessIcons.forEach(icon => 
      this.registerIcon({ ...icon, category: IconCategory.BUSINESS })
    )
  }

  // ⚙️ 注册系统管理图标
  private registerSystemIcons(): void {
    const systemIcons: Omit<IconConfig, 'category'>[] = [
      {
        name: 'settings',
        component: () => import('./enterprise/SettingsIcon.vue'),
        tags: ['设置', '配置', '系统'],
        description: '系统设置图标'
      },
      {
        name: 'logs',
        component: () => import('./enterprise/LogsIcon.vue'),
        tags: ['日志', '记录', '审计'],
        description: '系统日志图标'
      },
      {
        name: 'monitor',
        component: () => import('./enterprise/MonitorIcon.vue'),
        tags: ['监控', '性能', '状态'],
        description: '系统监控图标'
      }
    ]

    systemIcons.forEach(icon => 
      this.registerIcon({ ...icon, category: IconCategory.SYSTEM })
    )
  }

  // 👥 注册用户权限图标
  private registerUserIcons(): void {
    const userIcons: Omit<IconConfig, 'category'>[] = [
      {
        name: 'user',
        component: () => import('./enterprise/UserIcon.vue'),
        tags: ['用户', '个人', '账户'],
        description: '用户图标'
      },
      {
        name: 'role',
        component: () => import('./enterprise/RoleIcon.vue'),
        tags: ['角色', '权限', '管理'],
        description: '角色管理图标'
      },
      {
        name: 'security',
        component: () => import('./enterprise/SecurityIcon.vue'),
        tags: ['安全', '加密', '保护'],
        description: '安全管理图标'
      }
    ]

    userIcons.forEach(icon => 
      this.registerIcon({ ...icon, category: IconCategory.USER })
    )
  }

  // 📋 注册操作动作图标
  private registerActionIcons(): void {
    const actionIcons: Omit<IconConfig, 'category'>[] = [
      {
        name: 'add',
        component: () => import('./enterprise/AddIcon.vue'),
        tags: ['添加', '新建', '创建'],
        description: '添加操作图标'
      },
      {
        name: 'edit',
        component: () => import('./enterprise/EditIcon.vue'),
        tags: ['编辑', '修改', '更新'],
        description: '编辑操作图标'
      },
      {
        name: 'delete',
        component: () => import('./enterprise/DeleteIcon.vue'),
        tags: ['删除', '移除', '清除'],
        description: '删除操作图标'
      },
      {
        name: 'search',
        component: () => import('./enterprise/SearchIcon.vue'),
        tags: ['搜索', '查找', '检索'],
        description: '搜索操作图标'
      },
      {
        name: 'refresh',
        component: () => import('./enterprise/RefreshIcon.vue'),
        tags: ['刷新', '重新加载', '更新'],
        description: '刷新操作图标'
      }
    ]

    actionIcons.forEach(icon => 
      this.registerIcon({ ...icon, category: IconCategory.ACTION })
    )
  }

  // 📁 注册导航控制图标
  private registerNavigationIcons(): void {
    const navigationIcons: Omit<IconConfig, 'category'>[] = [
      {
        name: 'menu',
        component: () => import('./enterprise/MenuIcon.vue'),
        tags: ['菜单', '导航', '列表'],
        description: '菜单导航图标'
      },
      {
        name: 'close',
        component: () => import('./enterprise/CloseIcon.vue'),
        tags: ['关闭', '取消', '退出'],
        description: '关闭操作图标'
      },
      {
        name: 'expand',
        component: () => import('./enterprise/ExpandIcon.vue'),
        tags: ['展开', '扩展', '显示'],
        description: '展开控制图标'
      }
    ]

    navigationIcons.forEach(icon => 
      this.registerIcon({ ...icon, category: IconCategory.NAVIGATION })
    )
  }

  // 🔔 注册状态提示图标
  private registerStatusIcons(): void {
    const statusIcons: Omit<IconConfig, 'category'>[] = [
      {
        name: 'success',
        component: () => import('./enterprise/SuccessIcon.vue'),
        tags: ['成功', '完成', '正确'],
        description: '成功状态图标'
      },
      {
        name: 'warning',
        component: () => import('./enterprise/WarningIcon.vue'),
        tags: ['警告', '注意', '提醒'],
        description: '警告状态图标'
      },
      {
        name: 'error',
        component: () => import('./enterprise/ErrorIcon.vue'),
        tags: ['错误', '失败', '异常'],
        description: '错误状态图标'
      },
      {
        name: 'loading',
        component: () => import('./enterprise/LoadingIcon.vue'),
        tags: ['加载', '等待', '处理'],
        description: '加载状态图标'
      }
    ]

    statusIcons.forEach(icon => 
      this.registerIcon({ ...icon, category: IconCategory.STATUS })
    )
  }

  // 🛠️ 注册开发工具图标
  private registerToolIcons(): void {
    const toolIcons: Omit<IconConfig, 'category'>[] = [
      {
        name: 'code',
        component: () => import('./enterprise/CodeIcon.vue'),
        tags: ['代码', '编程', '开发'],
        description: '代码开发图标'
      },
      {
        name: 'lowcode',
        component: () => import('./enterprise/LowCodeIcon.vue'),
        tags: ['低代码', '可视化', '拖拽'],
        description: '低代码开发图标'
      },
      {
        name: 'api',
        component: () => import('./enterprise/ApiIcon.vue'),
        tags: ['接口', 'API', '集成'],
        description: 'API接口图标'
      }
    ]

    toolIcons.forEach(icon => 
      this.registerIcon({ ...icon, category: IconCategory.TOOL })
    )
  }

  // 📱 注册通用图标
  private registerCommonIcons(): void {
    const commonIcons: Omit<IconConfig, 'category'>[] = [
      {
        name: 'home',
        component: () => import('./enterprise/HomeIcon.vue'),
        tags: ['首页', '主页', '起始'],
        description: '首页图标'
      },
      {
        name: 'folder',
        component: () => import('./enterprise/FolderIcon.vue'),
        tags: ['文件夹', '目录', '分类'],
        description: '文件夹图标'
      },
      {
        name: 'file',
        component: () => import('./enterprise/FileIcon.vue'),
        tags: ['文件', '文档', '资料'],
        description: '文件图标'
      }
    ]

    commonIcons.forEach(icon => 
      this.registerIcon({ ...icon, category: IconCategory.COMMON })
    )
  }

  // 🎨 更新 CSS 变量
  private updateCSSVariables(): void {
    const root = document.documentElement
    
    // 更新颜色变量
    Object.entries(this.currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--enterprise-icon-color-${key}`, value)
    })
    
    // 更新尺寸变量
    Object.entries(this.currentTheme.sizes).forEach(([key, value]) => {
      root.style.setProperty(`--enterprise-icon-size-${key}`, `${value}px`)
    })
  }
}

// 🎯 导出单例实例
export const iconManager = EnterpriseIconManager.getInstance()

// 🔧 Vue 插件导出
export default {
  install(app: App) {
    iconManager.install(app)
  }
}

// 📝 使用说明
/*
🏢 企业级图标系统使用指南:

1. 📦 安装注册:
   app.use(EnterpriseIconManager)

2. 🎯 在组件中使用:
   <EnterpriseIcon name="dashboard" size="lg" color="primary" />

3. 🔍 搜索图标:
   const icons = iconManager.searchIcons('用户')

4. 🎨 自定义主题:
   iconManager.setTheme({
     name: 'dark',
     colors: { primary: '#409EFF' }
   })

5. ⚡ 预加载图标:
   await iconManager.preloadIcons(['dashboard', 'user', 'settings'])

6. 📊 使用统计:
   const stats = iconManager.getUsageStats()
*/
