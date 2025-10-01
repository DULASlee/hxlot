// 统一元数据类型定义
export interface ModuleMetadata {
  name: string
  displayName?: string
  description?: string
  version?: string
  entities?: EntityMetadata[]
  [key: string]: any
}

export interface EntityMetadata {
  name: string
  displayName?: string
  description?: string
  properties?: PropertyMetadata[]
  [key: string]: any
}

export interface PropertyMetadata {
  name: string
  type: string
  displayName?: string
  description?: string
  isRequired?: boolean
  defaultValue?: any
  [key: string]: any
}

export interface ManifestData {
  modules: ModuleMetadata[]
  version: string
  timestamp: Date
  [key: string]: any
}
