export interface EntityUIConfig {
  // Define the structure of EntityUIConfig based on its usage
  // This is a placeholder, adjust according to actual needs.
  [key: string]: any;
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
}

export interface CustomPermission {
  entity: string
  action: string
  displayName: string
}
