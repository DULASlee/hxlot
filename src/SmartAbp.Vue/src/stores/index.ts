// 导出所有模块stores
export * from "./modules/auth"
export * from "./modules/log"
export * from "./modules/menu"
export * from "./modules/project"
export * from "./modules/system"
export * from "./modules/theme"
export * from "./modules/user"
export { useDesignerStore } from "@smartabp/lowcode-designer/stores/designer"

// 导出类型
export type { UserInfo, LoginCredentials } from "./modules/auth"
export type { ThemeMode } from "./modules/theme"
export type { User } from "@/types/user"
export type { Project, CreateProjectRequest, UpdateProjectRequest } from "./modules/project"
export type { SystemSettings, Permission, Role, SystemInfo } from "./modules/system"
