export type PropertyType =
  | "string"
  | "int"
  | "long"
  | "double"
  | "decimal"
  | "bool"
  | "datetime"
  | "guid"
  | "byte"
  | "short"

export interface EntityProperty {
  id?: string | number
  name: string
  type: PropertyType | string
  isRequired: boolean
  maxLength?: number
  description: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  isKey?: boolean
  isUnique?: boolean
  isIndexed?: boolean
  validationRules?: any[]
  displayOrder?: number
  defaultValue?: any
}

export interface EnhancedEntityModel {
  id?: string | number
  name: string
  module: string
  aggregate: string
  description: string
  isAggregateRoot: boolean
  isMultiTenant: boolean
  isSoftDelete: boolean
  hasExtraProperties: boolean
  properties: EntityProperty[]
  validationErrors?: string[]
  isDirty?: boolean
  baseClass?: string
  namespace?: string
  tableName?: string
  schema?: string
  relationships: any[]
  businessRules?: any[]
  permissions?: any[]
  interfaces?: any[]
}
