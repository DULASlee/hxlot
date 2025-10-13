/**
 * 主从表单系统基础实体类型定义
 * 
 * 目的：为 useMasterDetail 提供完整的强类型约束
 */

/**
 * 基础实体接口
 * 
 * 所有实体必须包含id标识符
 */
export interface BaseEntity {
  /** 实体唯一标识 */
  id?: string | number

  /** 创建时间（可选） */
  creationTime?: string | Date

  /** 创建人ID（可选） */
  creatorId?: string | number

  /** 修改时间（可选） */
  lastModificationTime?: string | Date

  /** 修改人ID（可选） */
  lastModifierId?: string | number
}

/**
 * 具有软删除功能的实体
 */
export interface SoftDeleteEntity extends BaseEntity {
  isDeleted?: boolean
  deletionTime?: string | Date
  deleterId?: string | number
}

/**
 * 主从表详情实体接口
 * 
 * 扩展BaseEntity，添加运行时状态属性
 */
export interface DetailEntity extends BaseEntity {
  /** 是否为新建记录（前端运行时状态） */
  _isNew?: boolean

  /** 是否处于编辑模式（前端运行时状态） */
  _editMode?: boolean

  /** 是否标记为删除（前端运行时状态） */
  _deleted?: boolean

  /** 原始数据快照（用于撤销操作） */
  _originalData?: Partial<this>

  /** 验证错误信息 */
  _errors?: Record<string, string>
}

/**
 * 主从表主实体接口
 * 
 * 主表实体的基础接口
 */
export interface MasterEntity extends BaseEntity {
  /** 是否有未保存的变更 */
  _hasChanges?: boolean

  /** 乐观锁版本号 */
  _version?: number
}

/**
 * 类型守卫：检查是否为BaseEntity
 */
export function isBaseEntity(obj: any): obj is BaseEntity {
  return obj && (typeof obj.id === 'string' || typeof obj.id === 'number' || obj.id === undefined)
}

/**
 * 类型守卫：检查是否为DetailEntity
 */
export function isDetailEntity(obj: any): obj is DetailEntity {
  return isBaseEntity(obj) && (
    '_isNew' in obj ||
    '_editMode' in obj ||
    '_deleted' in obj
  )
}

/**
 * 类型守卫：检查是否为新建记录
 */
export function isNewRecord<T extends DetailEntity>(detail: T): boolean {
  return detail._isNew === true
}

/**
 * 类型守卫：检查是否在编辑模式
 */
export function isEditMode<T extends DetailEntity>(detail: T): boolean {
  return detail._editMode === true
}

/**
 * 类型守卫：检查是否已删除
 */
export function isDeleted<T extends DetailEntity>(detail: T): boolean {
  return detail._deleted === true
}

