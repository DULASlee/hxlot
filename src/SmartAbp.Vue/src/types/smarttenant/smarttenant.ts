// 🔥 自动生成的TypeScript类型定义 - Vue3强类型支持
// 与后端DTO保持完全一致，确保类型安全

/// <summary>
/// 租户管理数据传输对象
/// </summary>
export interface SmartTenantDto {
  /**  */
  id?: string
  /**  */
  tenantId?: string
  /**  */
  code?: string
  /**  */
  parentId?: string
  /**  */
  isActive?: boolean
  /**  */
  description?: string
  /**  */
  subscriptionPlanId?: string
  /**  */
  startTime?: Date | string
  /**  */
  maxUserCount?: number
  /**  */
  maxStorageSize?: number
  /**  */
  maxApiCallsPerDay?: number
  /**  */
  connectionString?: string
  /**  */
  isIsolatedDatabase?: boolean
  /**  */
  featureConfig?: string
  /**  */
  customSettings?: string
  /**  */
  extraProperties?: string
  /**  */
  concurrencyStamp?: string
  /**  */
  creationTime?: Date | string
  /**  */
  creatorId?: string
  /**  */
  lastModificationTime?: Date | string
  /**  */
  isDeleted?: boolean
  /**  */
  deletionTime?: Date | string
}

/// <summary>
/// 创建租户管理数据传输对象
/// </summary>
export interface CreateSmartTenantDto {
  /**  */
  tenantId?: string
  /**  */
  code?: string
  /**  */
  parentId?: string
  /**  */
  isActive?: boolean
  /**  */
  description?: string
  /**  */
  subscriptionPlanId?: string
  /**  */
  startTime?: Date | string
  /**  */
  maxUserCount?: number
  /**  */
  maxStorageSize?: number
  /**  */
  maxApiCallsPerDay?: number
  /**  */
  connectionString?: string
  /**  */
  isIsolatedDatabase?: boolean
  /**  */
  featureConfig?: string
  /**  */
  customSettings?: string
  /**  */
  extraProperties?: string
  /**  */
  concurrencyStamp?: string
  /**  */
  creationTime?: Date | string
  /**  */
  creatorId?: string
  /**  */
  lastModificationTime?: Date | string
  /**  */
  isDeleted?: boolean
  /**  */
  deletionTime?: Date | string
}

/// <summary>
/// 更新租户管理数据传输对象
/// </summary>
export interface UpdateSmartTenantDto {
  /**  */
  id?: string
  /**  */
  tenantId?: string
  /**  */
  code?: string
  /**  */
  parentId?: string
  /**  */
  isActive?: boolean
  /**  */
  description?: string
  /**  */
  subscriptionPlanId?: string
  /**  */
  startTime?: Date | string
  /**  */
  maxUserCount?: number
  /**  */
  maxStorageSize?: number
  /**  */
  maxApiCallsPerDay?: number
  /**  */
  connectionString?: string
  /**  */
  isIsolatedDatabase?: boolean
  /**  */
  featureConfig?: string
  /**  */
  customSettings?: string
  /**  */
  extraProperties?: string
  /**  */
  concurrencyStamp?: string
  /**  */
  creationTime?: Date | string
  /**  */
  creatorId?: string
  /**  */
  lastModificationTime?: Date | string
  /**  */
  isDeleted?: boolean
  /**  */
  deletionTime?: Date | string
}

/// <summary>
/// 获取租户管理列表查询对象
/// </summary>
export interface GetSmartTenantListDto {
  /** 关键词搜索 */
  keyword?: string
  /** 页码 */
  pageIndex?: number
  /** 页大小 */
  pageSize?: number
  /** 排序字段 */
  sortField?: string
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
}
