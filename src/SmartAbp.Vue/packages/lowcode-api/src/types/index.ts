export interface CodeGeneratorApi {
  generateModule: (config: ModuleGenerationConfig) => Promise<GenerationResult>
  validateModule: (config: ModuleValidationConfig) => Promise<ValidationResult>
  preflightSchemaVersion: () => Promise<PreflightResult>
  getTemplates: () => Promise<Template[]>
  getSchema: (version?: string) => Promise<SchemaDefinition>
  healthCheck: () => Promise<HealthStatus>
}

export interface ModuleGenerationConfig {
  metadata: ModuleMetadata
  options: GenerationOptions
  target: GenerationTarget
  overwrite?: boolean
  dryRun?: boolean
}

export interface ModuleValidationConfig {
  metadata: ModuleMetadata
  schemaVersion?: string
  strict?: boolean
}

export interface GenerationResult {
  success: boolean
  generatedFiles: GeneratedFile[]
  warnings: string[]
  errors: string[]
  duration: number
  stats: GenerationStats
}

export interface GeneratedFile {
  path: string
  content: string
  size: number
  checksum: string
  language: string
  type: "code" | "config" | "template" | "migration"
}

export interface GenerationStats {
  totalFiles: number
  totalLines: number
  totalSize: number
  components: number
  entities: number
  services: number
  tests: number
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  schemaVersion: string
}

export interface ValidationError {
  code: string
  message: string
  path: string
  severity: "error" | "warning"
  suggestedFix?: string
}

export interface ValidationWarning {
  code: string
  message: string
  path: string
  severity: "warning"
}

export interface PreflightResult {
  compatible: boolean
  currentVersion: string
  requiredVersion: string
  changes: SchemaChange[]
  migrationPath?: string
}

export interface SchemaChange {
  type: "addition" | "removal" | "modification"
  path: string
  description: string
  breaking: boolean
}

export interface Template {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  version: string
  author: string
  content: string
  metadata: Record<string, any>
}

export interface SchemaDefinition {
  version: string
  entities: EntitySchema[]
  properties: PropertySchema[]
  relationships: RelationshipSchema[]
  validations: ValidationSchema[]
  metadata: Record<string, any>
}

export interface EntitySchema {
  name: string
  properties: string[]
  required: string[]
  relationships: string[]
  indexes: IndexSchema[]
  constraints: ConstraintSchema[]
}

export interface PropertySchema {
  name: string
  type: string
  format?: string
  minLength?: number
  maxLength?: number
  pattern?: string
  defaultValue?: any
  nullable: boolean
}

export interface RelationshipSchema {
  name: string
  type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many"
  target: string
  foreignKey?: string
  cascade: boolean
}

export interface IndexSchema {
  name: string
  columns: string[]
  unique: boolean
  clustered: boolean
}

export interface ConstraintSchema {
  name: string
  type: "primary" | "foreign" | "unique" | "check"
  columns: string[]
  reference?: string
  condition?: string
}

export interface ValidationSchema {
  name: string
  type: "required" | "range" | "pattern" | "custom"
  message: string
  parameters: Record<string, any>
}

export interface GenerationOptions {
  framework: "vue" | "react" | "angular" | "blazor"
  language: "typescript" | "javascript" | "csharp"
  architecture: "ddd" | "mvc" | "clean"
  testing: boolean
  documentation: boolean
  docker: boolean
  ciCd: boolean
}

export interface GenerationTarget {
  outputDir: string
  baseNamespace: string
  basePath: string
  apiVersion: string
}

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  version: string
  uptime: number
  services: ServiceStatus[]
}

export interface ServiceStatus {
  name: string
  status: "up" | "down" | "degraded"
  responseTime: number
  error?: string
}

export interface ModuleMetadata {
  moduleName: string
  systemName: string
  name: string
  displayName: string
  description: string
  version: string
  icon?: string
  sort?: number
  featureManagement: FeatureManagement
  entities: EntityDefinition[]
  databaseInfo: DatabaseInfo
  permissionConfig: PermissionConfig
  frontend?: FrontendConfig
  architecturePattern?: string
  dependencies?: string[]
}

export interface FeatureManagement {
  defaultPolicy: "RequireAuthentication" | "AllowAnonymous" | "RequirePermission"
  enabledFeatures?: string[]
  isEnabled?: boolean
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
}

export interface EntityProperty {
  name: string
  type: string
  displayName?: string
  description?: string
  required?: boolean
  maxLength?: number
  minLength?: number
  defaultValue?: any
  isPrimaryKey?: boolean
  isForeignKey?: boolean
}

export interface PropertyDefinition extends EntityProperty {
  entityName?: string
  module?: string
  version?: string
  filterable?: boolean
  sortable?: boolean
  searchable?: boolean
}

export interface EntityRelationship {
  type: string
  targetEntity: string
  foreignKey?: string
  navigationProperty?: string
  cascadeDelete?: boolean
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

export interface FrontendConfig {
  parentId?: string
  framework?: string
  theme?: string
  layout?: string
}

export interface EntityUIConfig {
  entityName: string
  moduleName: string
  properties: EntityUIProperty[]
  layout: EntityUILayout
  validations: EntityUIValidation[]
  permissions: EntityUIPermission[]
  metadata?: Record<string, any>
}

export interface EntityUIProperty {
  name: string
  type: string
  displayName: string
  description?: string
  required: boolean
  visible: boolean
  editable: boolean
  defaultValue?: any
  validationRules?: PropertyValidationRule[]
  uiHint?: string
  order: number
}

export interface PropertyValidationRule {
  type: "required" | "minLength" | "maxLength" | "pattern" | "range" | "custom"
  message: string
  value?: any
}

export interface EntityUILayout {
  type: "form" | "table" | "card" | "custom"
  sections: UILayoutSection[]
  columns: number
  responsive: boolean
}

export interface UILayoutSection {
  title: string
  description?: string
  properties: string[]
  columns: number
  order: number
  collapsible: boolean
  collapsed: boolean
}

export interface EntityUIValidation {
  propertyName: string
  rules: ValidationRule[]
  customValidator?: string
}

export interface ValidationRule {
  type: string
  message: string
  parameters?: Record<string, any>
}

export interface EntityUIPermission {
  action: string
  displayName: string
  description?: string
  granted: boolean
  roles?: string[]
}

// Mock implementation for development
export const codeGeneratorApi: CodeGeneratorApi = {
  generateModule: async (_config) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      success: true,
      generatedFiles: [],
      warnings: [],
      errors: [],
      duration: 1000,
      stats: {
        totalFiles: 0,
        totalLines: 0,
        totalSize: 0,
        components: 0,
        entities: 0,
        services: 0,
        tests: 0,
      },
    }
  },
  validateModule: async (_config) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      isValid: true,
      errors: [],
      warnings: [],
      schemaVersion: "1.0.0",
    }
  },
  preflightSchemaVersion: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return {
      compatible: true,
      currentVersion: "1.0.0",
      requiredVersion: "1.0.0",
      changes: [],
    }
  },
  getTemplates: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return []
  },
  getSchema: async (version) => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return {
      version: version || "1.0.0",
      entities: [],
      properties: [],
      relationships: [],
      validations: [],
      metadata: {},
    }
  },
  healthCheck: async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return {
      status: "healthy",
      version: "1.0.0",
      uptime: 1000,
      services: [],
    }
  },
}
