// Manifest Schema Types for SmartAbp Module System
// 模块清单类型定义 - 支持菜单聚合和运行时注入

export interface ModuleManifest {
  $schema: string
  name: string
  displayName: string
  description: string
  version: string
  author: string
  abpStyle: boolean
  order: number
  dependsOn: string[]
  routes: RouteConfig[]
  stores: StoreConfig[]
  policies: string[]
  lifecycle: LifecycleConfig
  features: FeatureConfig
  menuConfig?: MenuConfig
}

export interface RouteConfig {
  name: string
  path: string
  component: string
  meta: RouteMeta
}

export interface RouteMeta {
  title: string
  menuKey: string
  requiredRoles?: string[]
  icon?: string
  showInMenu?: boolean
  enableBreadcrumb?: boolean
  enableQuickAccess?: boolean
}

export interface StoreConfig {
  symbol: string
  id: string
  modulePath: string
}

export interface LifecycleConfig {
  onInstall?: string
  onUninstall?: string
  onActivate?: string
  onDeactivate?: string
}

export interface FeatureConfig {
  enableAuth: boolean
  enableCache: boolean
  enableI18n: boolean
}

export interface MenuConfig {
  icon: string
  order: number
  features: string[]
  parentMenu?: string
  children?: MenuItemConfig[]
}

export interface MenuItemConfig {
  key: string
  title: string
  path: string
  icon?: string
  roles?: string[]
  children?: MenuItemConfig[]
}

// 菜单聚合器接口
export interface MenuAggregator {
  addModule(manifest: ModuleManifest): void
  removeModule(moduleName: string): void
  generateMenuTree(): MenuItemConfig[]
  injectRuntimeMenus(): void
}

// 运行时菜单注入器接口
export interface RuntimeMenuInjector {
  inject(menus: MenuItemConfig[]): void
  remove(moduleNames: string[]): void
  refresh(): void
}

// 模块写入器接口
export interface ManifestWriter {
  writeManifest(manifest: ModuleManifest): Promise<void>
  generateFiles(manifest: ModuleManifest): Promise<GeneratedFile[]>
  updateRouter(routes: RouteConfig[]): Promise<void>
  updateMenus(menuConfig: MenuConfig): Promise<void>
}

export interface GeneratedFile {
  path: string
  content: string
  type: "component" | "store" | "route" | "menu" | "config"
}

// 字段配置类型
export interface FieldConfig {
  name: string
  label: string
  type: "string" | "number" | "boolean" | "date" | "enum"
  required: boolean
  defaultValue?: any
  validation?: ValidationRule[]
}

export interface ValidationRule {
  type: "required" | "minLength" | "maxLength" | "pattern" | "custom"
  value?: any
  message?: string
}

// 权限配置类型
export interface PermissionConfig {
  enabled: boolean
  prefix: string
  roles: string[]
  operations: {
    create?: string
    read?: string
    update?: string
    delete?: string
  }
}

// 向导表单类型
export interface WizardForm {
  templatePack: string
  moduleName: string
  displayName: string
  entityName: string
  fields: FieldConfig[]
  permissions: PermissionConfig
  menuConfig: MenuConfig
}
