/**
 * 路由相关类型定义
 */

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * 页面标题
     */
    title: string

    /**
     * 关联的菜单key
     */
    menuKey?: string

    /**
     * 图标
     */
    icon?: string

    /**
     * 是否缓存组件
     */
    keepAlive?: boolean

    /**
     * 是否需要认证
     */
    requiresAuth?: boolean

    /**
     * 所需角色（用户需要拥有其中任一角色）
     */
    requiredRoles?: string[]

    /**
     * 所需权限（用户需要拥有其中任一权限）
     */
    requiredPermissions?: string[]

    /**
     * 过渡动画名称
     */
    transition?: string

    /**
     * 是否显示面包屑
     */
    breadcrumb?: boolean

    /**
     * 徽章
     */
    badge?: string | number

    /**
     * 是否在菜单中隐藏
     */
    hidden?: boolean

    /**
     * 是否固定在标签栏
     */
    affix?: boolean

    /**
     * 是否在新窗口打开
     */
    newWindow?: boolean

    /**
     * 是否预加载
     */
    preload?: boolean

    /**
     * 加载优先级
     */
    priority?: 'high' | 'normal' | 'low'

    /**
     * SEO描述
     */
    description?: string

    /**
     * SEO关键词
     */
    keywords?: string[]

    /**
     * 自定义数据
     */
    [key: string]: any
  }
}

/**
 * 路由配置增强类型
 */
export interface EnhancedRouteConfig {
  path: string
  name?: string
  component?: any
  children?: EnhancedRouteConfig[]
  meta?: import('vue-router').RouteMeta
  redirect?: string
  alias?: string | string[]
  props?: boolean | Record<string, any> | ((route: any) => Record<string, any>)
  beforeEnter?: any
}

/**
 * 路由权限配置
 */
export interface RoutePermission {
  /**
   * 路由路径
   */
  path: string

  /**
   * 所需角色
   */
  roles?: string[]

  /**
   * 所需权限
   */
  permissions?: string[]

  /**
   * 是否需要认证
   */
  requiresAuth?: boolean
}

/**
 * 路由加载状态
 */
export interface RouteLoadingState {
  /**
   * 是否正在加载
   */
  loading: boolean

  /**
   * 加载进度 (0-100)
   */
  progress: number

  /**
   * 错误信息
   */
  error?: Error

  /**
   * 加载开始时间
   */
  startTime?: number

  /**
   * 加载耗时(ms)
   */
  duration?: number
}

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  /**
   * 标题
   */
  title: string

  /**
   * 路径
   */
  path?: string

  /**
   * 图标
   */
  icon?: string

  /**
   * 是否禁用链接
   */
  disabled?: boolean
}

export {}
