/*
AI_GENERATED_COMPONENT: true
Generated at: 2025-09-12T23:25:00.000Z
Template parameters: {"EntityName":"User","entityName":"user","ModuleName":"User","entityDisplayName":"用户管理"}
Based on SmartAbp template library
DO NOT EDIT MANUALLY - Regenerate using module wizard
*/

/**
 * 用户相关类型定义
 * 基于ABP框架的标准DTO模式
 */

// 基础用户实体
export interface User {
  id: string
  userName: string
  email: string
  name: string
  surname: string
  isActive: boolean
  phoneNumber?: string
  lockoutEnabled: boolean
  lockoutEnd?: Date
  roleNames: string[]
  concurrencyStamp: string
  creationTime: Date
  creatorId?: string
  lastModificationTime?: Date
  lastModifierId?: string
  isDeleted: boolean
  deleterId?: string
  deletionTime?: Date
}

// 创建用户DTO
export interface CreateUserDto {
  userName: string
  name: string
  surname: string
  email: string
  phoneNumber?: string
  isActive: boolean
  lockoutEnabled: boolean
  password: string
  roleNames: string[]
}

// 更新用户DTO
export interface UpdateUserDto {
  userName: string
  name: string
  surname: string
  email: string
  phoneNumber?: string
  isActive: boolean
  lockoutEnabled: boolean
  roleNames: string[]
  concurrencyStamp: string
}

// 获取用户列表DTO
export interface GetUserListDto {
  filter?: string
  sorting?: string
  skipCount?: number
  maxResultCount?: number
}

// 分页结果DTO
export interface PagedResultDto<T> {
  totalCount: number
  items: T[]
}

// 用户列表项
export interface UserListItem {
  id: string
  userName: string
  email: string
  name: string
  surname: string
  isActive: boolean
  phoneNumber?: string
  creationTime: Date
  roleNames: string[]
}

// 用户查询参数
export interface UserQueryParams {
  pageIndex: number
  pageSize: number
  filter?: string
  sorting?: string
  isActive?: boolean
}

// 用户统计信息
export interface UserStatistics {
  totalCount: number
  activeCount: number
  lockedCount: number
  newUsersThisMonth: number
}

// 角色信息
export interface Role {
  id: string
  name: string
  displayName: string
  isDefault: boolean
  isStatic: boolean
  isPublic: boolean
}

// 用户角色
export interface UserRole {
  id: string
  userId: string
  roleId: string
  roleName: string
}
