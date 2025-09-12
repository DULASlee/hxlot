/**
 * 动态菜单系统类型定义
 * 基于现有架构扩展，与 AuthService 和 UserInfo 完全兼容
 */

// 权限码类型 (扩展现有系统)
export type PermissionCode = string

// 菜单项类型
export type MenuType = "page" | "folder" | "external" | "divider"

// 菜单项基础接口
export interface BaseMenuItem {
  /** 唯一标识符 */
  key: string
  /** 菜单标题 */
  title: string
  /** 图标类名 (Font Awesome) */
  icon?: string
  /** 排序权重，数字越小越靠前 */
  order: number
  /** 是否显示，可用于临时隐藏菜单 */
  visible: boolean
  /** 所需角色数组，用户必须拥有其中任意一个角色 */
  requiredRoles: string[]
  /** 菜单类型 */
  type: MenuType
  /** 描述信息 */
  description?: string
}

// 页面菜单项
export interface PageMenuItem extends BaseMenuItem {
  type: "page"
  /** 路由路径 */
  path: string
  /** Vue组件路径 (用于动态导入) */
  component: string
  /** 路由元数据 */
  meta?: Record<string, any>
  /** 是否在标签页中可关闭 */
  closable?: boolean
}

// 文件夹菜单项（包含子菜单）
export interface FolderMenuItem extends BaseMenuItem {
  type: "folder"
  /** 子菜单列表 */
  children: MenuItem[]
  /** 默认是否展开 */
  defaultExpanded?: boolean
}

// 外部链接菜单项
export interface ExternalMenuItem extends BaseMenuItem {
  type: "external"
  /** 外部链接URL */
  url: string
  /** 打开方式 */
  target?: "_blank" | "_self"
}

// 分割线菜单项
export interface DividerMenuItem extends BaseMenuItem {
  type: "divider"
}

// 联合菜单项类型
export type MenuItem = PageMenuItem | FolderMenuItem | ExternalMenuItem | DividerMenuItem

// 菜单配置接口
export interface MenuConfig {
  /** 菜单列表 */
  menus: MenuItem[]
  /** 默认首页路径 */
  defaultPath: string
  /** 登录页路径 */
  loginPath: string
  /** 无权限页面路径 */
  forbiddenPath: string
}

// 菜单渲染状态 (用于组件状态管理)
export interface MenuRenderState {
  /** 当前激活的菜单key */
  activeMenuKey: string
  /** 当前激活的子菜单key */
  activeSubMenuKey: string
  /** 展开的菜单key列表 */
  expandedMenuKeys: string[]
  /** 是否显示副菜单 */
  showSubmenu: boolean
  /** 打开的标签页列表 */
  openTabs: TabItem[]
  /** 当前活动标签 */
  activeTab: string
  singleTabMode: boolean
}

// 标签页项
export interface TabItem {
  key: string
  title: string
  icon?: string
  path: string
  closable: boolean
  meta?: Record<string, any>
}

// 菜单过滤选项
export interface MenuFilterOptions {
  /** 是否过滤隐藏菜单 */
  filterHidden?: boolean
  /** 是否过滤无权限菜单 */
  filterPermissions?: boolean
  /** 自定义过滤函数 */
  customFilter?: (menu: MenuItem) => boolean
}

// 扩展现有 UserInfo 类型以支持菜单权限检查
export interface MenuUserInfo {
  /** 用户角色列表 (复用现有 UserInfo.roles) */
  roles: string[]
  /** 是否为超级管理员 */
  isAdmin?: boolean
}
