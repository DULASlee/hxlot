export interface ModuleMetadata {
  systemName: string
  name: string
  displayName: string
  description: string
  version: string
  featureManagement: FeatureManagement
  entities: EntityDefinition[]
  databaseInfo: DatabaseInfo
  permissionConfig: PermissionConfig
  frontend?: FrontendConfig
  architecturePattern?: string
  dependencies?: string[]
}

export interface EntityDefinition {
  name: string
  displayName: string
  description?: string
  module: string
  properties: EntityProperty[]
  relationships?: EntityRelationship[]
  tableName?: string
  schema?: string
  namespace?: string
  primaryKeys?: string[]
  foreignKeys?: Array<{ property: string; entity: string; propertyName: string }>
}

export interface EntityProperty {
  name: string
  type: PropertyType | string
  displayName?: string
  description?: string
  required?: boolean
  maxLength?: number
  minLength?: number
  defaultValue?: any
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  isNavigationProperty?: boolean
  foreignEntity?: string
}

export interface EntityRelationship {
  type: RelationshipType
  targetEntity: string
  foreignKey?: string
  navigationProperty?: string
  cascadeDelete?: boolean
}

export interface FeatureManagement {
  defaultPolicy: "RequireAuthentication" | "AllowAnonymous" | "RequirePermission"
  enabledFeatures?: string[]
  isEnabled?: boolean
}

export interface FrontendConfig {
  parentId?: string
  framework?: string
  theme?: string
  layout?: string
}

export interface DatabaseInfo {
  connectionStringName: string
  provider: "SqlServer" | "PostgreSql" | "MySql" | "SQLite"
  schema?: string
  useTransactions?: boolean
}

export interface PermissionConfig {
  customActions: CustomPermission[]
}

export interface CustomPermission {
  entity: string
  action: string
  displayName: string
  description?: string
}

export interface StepMetadata {
  title: string
  description: string
  estimatedTime: string
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string[]>
  warnings?: string[]
}

export interface WizardNavigation {
  currentStep: WizardStep
  completedSteps: Set<WizardStep>
  canProceed: boolean
  canGoBack: boolean
}

// WizardStep constants - use consistent naming
export const WizardStep = {
  BASIC_INFO: "BASIC_INFO",
  ENTITY_DESIGN: "ENTITY_DESIGN",
  FEATURE_CONFIG: "FEATURE_CONFIG",
  PREVIEW: "PREVIEW",
} as const

export type WizardStep = (typeof WizardStep)[keyof typeof WizardStep]

export enum PropertyType {
  STRING = "string",
  INT = "int",
  LONG = "long",
  DOUBLE = "double",
  DECIMAL = "decimal",
  BOOL = "bool",
  DATETIME = "datetime",
  GUID = "guid",
  BYTE = "byte",
  SHORT = "short",
}

export enum RelationshipType {
  ONE_TO_ONE = "one_to_one",
  ONE_TO_MANY = "one_to_many",
  MANY_TO_ONE = "many_to_one",
  MANY_TO_MANY = "many_to_many",
}

// Validation schemas
export const ModuleMetadataSchema = {
  systemName: { required: true, minLength: 1, maxLength: 50 },
  name: { required: true, pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ },
  displayName: { required: true, minLength: 1, maxLength: 100 },
  description: { maxLength: 500 },
  version: { pattern: /^\d+\.\d+\.\d+$/ },
} as const

export const EntityDefinitionSchema = {
  name: { required: true, pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/ },
  displayName: { required: true, minLength: 1 },
  properties: { required: true, minItems: 1 },
} as const

// Type guards
export function isValidModuleMetadata(data: any): data is ModuleMetadata {
  return (
    data &&
    typeof data.systemName === "string" &&
    typeof data.name === "string" &&
    typeof data.displayName === "string" &&
    typeof data.version === "string" &&
    data.featureManagement &&
    Array.isArray(data.entities) &&
    data.databaseInfo &&
    data.permissionConfig
  )
}

export function isValidEntityDefinition(data: any): data is EntityDefinition {
  return (
    data &&
    typeof data.name === "string" &&
    typeof data.displayName === "string" &&
    Array.isArray(data.properties) &&
    data.properties.every(isValidEntityProperty)
  )
}

export function isValidEntityProperty(data: any): data is EntityProperty {
  return (
    data &&
    typeof data.name === "string" &&
    typeof data.type === "string" &&
    Object.values(PropertyType).includes(data.type as PropertyType)
  )
}
