export interface Template {
  id: string
  name: string
  description: string // 必需字段
  category: string // 必需字段，修复类型不匹配
  metadata?: Record<string, any>
  features?: string[]
}

export interface DatabaseConfig {
  provider: "SqlServer" | "PostgreSql" | "MySql" | "Oracle"
  connectionStringName: string
  schema?: string
}

export interface PropertyDefinition {
  name: string
  displayName?: string
  type: string
  isRequired: boolean
  maxLength?: number
  minLength?: number
  description: string
  filterable?: boolean
  showInList?: boolean
  sortable?: boolean
  defaultValue?: any
  validation?: {
    pattern?: string
    message?: string
  }
  options?: Array<{ label: string; value: any }>
  position?: number
}

export interface EntityDefinition {
  name: string
  displayName?: string
  tableName?: string
  module: string
  aggregate: string
  description: string
  isAggregateRoot: boolean
  isMultiTenant: boolean
  isSoftDelete: boolean
  hasExtraProperties: boolean
  properties: PropertyDefinition[]
}

export interface CustomPermission {
  entity: string
  action: string
  displayName: string
}

export interface ModuleMetadata {
  systemName: string
  name: string
  displayName: string
  description?: string
  version: string
  architecturePattern: "Crud" | "DDD" | "CQRS"
  featureManagement: {
    isEnabled: boolean
    defaultPolicy?: string
  }
  entities: EntityDefinition[]
  databaseInfo: {
    connectionStringName: string
    provider: "SqlServer" | "PostgreSql" | "MySql" | "SQLite"
    schema?: string
  }
  permissionConfig: {
    customActions: CustomPermission[]
  }
  icon?: string
  sort?: number
  frontend?: {
    parentId?: string
  }
  dependencies: string[]
}
