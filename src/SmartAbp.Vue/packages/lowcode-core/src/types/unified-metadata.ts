// 🚀 从lowcode-shared导入统一类型定义（已从metadata-core迁移）
import type {
  EntityMetadata as CoreEntityMetadata,
  ModuleMetadata as CoreModuleMetadata,
  PropertyMetadata as CorePropertyMetadata
} from '@smartabp/lowcode-shared'

// 🔄 向后兼容性别名（逐步弃用）
/** @deprecated 请使用 @smartabp/metadata-core 中的 ModuleMetadata */
export interface ModuleMetadata extends Partial<CoreModuleMetadata> {
  name: string
  displayName?: string
  description?: string
  version?: string
  entities?: EntityMetadata[]
  [key: string]: any
}

/** @deprecated 请使用 @smartabp/metadata-core 中的 EntityMetadata */
export interface EntityMetadata extends Partial<CoreEntityMetadata> {
  name: string
  displayName?: string
  description?: string
  properties?: PropertyMetadata[]
  [key: string]: any
}

/** @deprecated 请使用 @smartabp/metadata-core 中的 PropertyMetadata */
export interface PropertyMetadata extends Partial<CorePropertyMetadata> {
  name: string
  type: string
  displayName?: string
  description?: string
  isRequired?: boolean
  defaultValue?: any
  [key: string]: any
}

// 🚀 重新导出标准类型（推荐使用）
export type {
  CoreEntityMetadata as StandardEntityMetadata, CoreModuleMetadata as StandardModuleMetadata, CorePropertyMetadata as StandardPropertyMetadata
}

export interface ManifestData {
  modules: ModuleMetadata[]
  version: string
  timestamp: Date
  [key: string]: any
}
