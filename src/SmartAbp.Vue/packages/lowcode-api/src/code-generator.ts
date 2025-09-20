import { api } from "@/utils/api"
import type { ModuleMetadata, EntityUIConfig } from "./types"

/**
 * Code Generator API Service
 * Provides methods to interact with the SmartAbp Code Generator endpoints
 */

// Type definitions for API requests and responses
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

export interface PropertyDefinition {
  name: string
  type: string
  isRequired: boolean
  maxLength?: number
  description: string
}

export interface GeneratedCodeResult {
  code: string
  metadata: {
    generatedAt: string
    linesOfCode: number
    fileName: string
  }
  generationTime: {
    totalMilliseconds: number
  }
}

export interface EnterpriseSolutionRequest {
  solutionName: string
  includeDdd: boolean
  includeCqrs: boolean
  includeApplicationServices: boolean
  includeInfrastructure: boolean
  includeAspire: boolean
  includeCaching: boolean
  includeMessaging: boolean
  includeTests: boolean
  includeTelemetry: boolean
  includeQuality: boolean
  dddDefinition: any
  cqrsDefinition: any
  applicationServiceDefinition: any
  infrastructureDefinition: any
  aspireDefinition: any
  cachingDefinition: any
  messagingDefinition: any
  testDefinition: any
  telemetryDefinition: any
  qualityDefinition: any
}

export interface EnterpriseSolutionResult {
  solutionName: string
  isSuccess: boolean
  generatedAt: string
  componentCount: number
  components: Record<string, any>
}

export interface CodeGenerationStatistics {
  totalGenerations: number
  successfulGenerations: number
  failedGenerations: number
  averageGenerationTime: {
    totalMilliseconds: number
  }
  totalLinesGenerated: number
  memoryUsage: number
  cacheHitRatio: number
  lastGenerationTime: string
}

export interface GeneratedModuleResult {
  moduleName: string
  generatedFiles: string[]
  generationReport: string
}

export interface MenuItemDto {
  id: string
  label: string
  children?: MenuItemDto[]
}

export interface DatabaseIntrospectionRequest {
  connectionStringName: string
  provider: "SqlServer" | "PostgreSql" | "MySql" | "Oracle"
  schema?: string
  tables?: string[]
}

export interface DatabaseSchema {
  tables: TableSchema[]
}

export interface TableSchema {
  schema: string
  name: string
  columns: ColumnSchema[]
  foreignKeys: ForeignKeySchema[]
}

export interface ColumnSchema {
  name: string
  dataType: string
  isNullable: boolean
  maxLength?: number
  isPrimaryKey: boolean
}

export interface ForeignKeySchema {
  column: string
  referencedSchema: string
  referencedTable: string
  referencedColumn: string
}

/**
 * Code Generator API Client
 */
export const codeGeneratorApi = {
  /**
   * Get generation statistics
   */
  async getStatistics(): Promise<CodeGenerationStatistics> {
    return await api.get<CodeGenerationStatistics>("/api/code-generator/statistics")
  },

  /**
   * [V9] Generate a full module from metadata
   */
  async generateModule(metadata: ModuleMetadata): Promise<GeneratedModuleResult> {
    return await api.post<GeneratedModuleResult>("/api/code-generator/generate-module", metadata)
  },

  /** Validate module metadata (server-side structural validation) */
  async validateModule(metadata: ModuleMetadata): Promise<{
    isValid: boolean
    issues: Array<{ severity: string; message: string; path?: string }>
  }> {
    return await api.post("/api/code-generator/validate", metadata)
  },

  /** Dry-run generation: get file list and summary without writing to disk */
  async dryRunGenerate(metadata: ModuleMetadata): Promise<{
    success: boolean
    moduleName: string
    totalFiles: number
    totalLines: number
    files: string[]
  }> {
    return await api.post("/api/code-generator/dry-run", metadata)
  },

  /**
   * Get available connection string names
   */
  async getConnectionStrings(): Promise<string[]> {
    return await api.get<string[]>("/api/code-generator/connection-strings")
  },

  /**
   * Get menu tree for selecting parent menu
   */
  async getMenuTree(): Promise<MenuItemDto[]> {
    return await api.get<MenuItemDto[]>("/api/code-generator/menus")
  },

  /** Introspect database schema */
  async introspectDatabase(req: DatabaseIntrospectionRequest): Promise<DatabaseSchema> {
    return await api.post<DatabaseSchema>("/api/code-generator/introspect-db", req)
  },

  /**
   * Get UI config for a module/entity
   */
  async getUiConfig(moduleName: string, entityName: string): Promise<EntityUIConfig> {
    return await api.get<EntityUIConfig>(
      `/api/code-generator/ui-config?module=${encodeURIComponent(moduleName)}&entity=${encodeURIComponent(entityName)}`,
    )
  },

  /**
   * Save UI config for a module/entity
   */
  async saveUiConfig(
    moduleName: string,
    entityName: string,
    config: EntityUIConfig,
  ): Promise<void> {
    await api.post<void>(
      `/api/code-generator/ui-config?module=${encodeURIComponent(moduleName)}&entity=${encodeURIComponent(entityName)}`,
      config,
    )
  },

  /**
   * Generate a simple entity
   */
  async generateEntity(definition: EntityDefinition): Promise<GeneratedCodeResult> {
    return await api.post<GeneratedCodeResult>("/api/code-generator/generate-entity", definition)
  },

  /**
   * Generate DDD domain layer
   */
  async generateDdd(definition: any): Promise<any> {
    return await api.post("/api/code-generator/generate-ddd", definition)
  },

  /**
   * Generate CQRS pattern implementation
   */
  async generateCqrs(definition: any): Promise<any> {
    return await api.post("/api/code-generator/generate-cqrs", definition)
  },

  /**
   * Generate application services layer
   */
  async generateApplicationServices(definition: any): Promise<any> {
    return await api.post("/api/code-generator/generate-application-services", definition)
  },

  /**
   * Generate infrastructure layer
   */
  async generateInfrastructure(definition: any): Promise<any> {
    return await api.post("/api/code-generator/generate-infrastructure", definition)
  },

  /**
   * Generate Aspire microservices solution
   */
  async generateAspire(definition: any): Promise<any> {
    return await api.post("/api/code-generator/generate-aspire", definition)
  },

  /**
   * Generate distributed caching solution
   */
  async generateCaching(definition: any): Promise<any> {
    return await api.post("/api/code-generator/generate-caching", definition)
  },

  /**
   * Generate messaging solution
   */
  async generateMessaging(definition: any): Promise<any> {
    return await api.post("/api/code-generator/generate-messaging", definition)
  },

  /**
   * Generate test suite
   */
  async generateTests(definition: any): Promise<any> {
    return await api.post("/api/code-generator/generate-tests", definition)
  },

  /**
   * Generate telemetry solution
   */
  async generateTelemetry(definition: any): Promise<any> {
    return await api.post("/api/code-generator/generate-telemetry", definition)
  },

  /**
   * Generate code quality solution
   */
  async generateQuality(definition: any): Promise<any> {
    return await api.post("/api/code-generator/generate-quality", definition)
  },

  /**
   * Generate complete enterprise solution
   */
  async generateEnterpriseSolution(
    definition: EnterpriseSolutionRequest,
  ): Promise<EnterpriseSolutionResult> {
    return await api.post<EnterpriseSolutionResult>(
      "/api/code-generator/generate-enterprise-solution",
      definition,
    )
  },
}

export default codeGeneratorApi
