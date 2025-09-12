export interface PropertyDefinition {
  name: string
  type: string
  isRequired: boolean
  maxLength?: number
  description: string
  defaultValue?: string
}

export interface EntityDefinition {
  name: string
  module: string
  aggregate: string
  description: string
  isAggregateRoot: boolean
  isMultiTenant: boolean
  isSoftDelete: boolean
  hasExtraProperties: boolean
  properties: PropertyDefinition[]
}

export interface GeneratedCodeResult {
  success: boolean
  code?: string
  files?: Record<string, string>
  metadata?: {
    generatedAt: string
    linesOfCode: number
  }
  generationTime?: {
    totalMilliseconds: number
  }
  sessionId?: string
}

export interface PropertyType {
  type: string
  name: string
  description: string
  icon: string
  color: string
  defaultRequired: boolean
  hasLength: boolean
}

export interface EntityProperty extends PropertyDefinition {
  id: string
}

export interface EntityModel extends EntityDefinition {
  properties: EntityProperty[]
}
