import { api } from "@/utils/api"
import { ElMessage } from "element-plus"
import type { ModuleMetadata, EntityUIConfig, EntityDefinition } from "./types"

/**
 * Code Generator API Service
 * Provides methods to interact with the SmartAbp Code Generator endpoints
 */

// Type definitions for API requests and responses
// EntityDefinition and PropertyDefinition moved to types.ts

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

// Error handling utilities
class CodeGeneratorError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
    public retryable = false,
  ) {
    super(message)
    this.name = "CodeGeneratorError"
  }
}

const validateRequired = (value: any, fieldName: string): void => {
  if (value === null || value === undefined || value === "") {
    throw new CodeGeneratorError(
      `${fieldName} is required`,
      "VALIDATION_ERROR",
      { field: fieldName },
      false,
    )
  }
}

const validateArray = (value: any[], fieldName: string): void => {
  if (!Array.isArray(value)) {
    throw new CodeGeneratorError(
      `${fieldName} must be an array`,
      "VALIDATION_ERROR",
      { field: fieldName, type: typeof value },
      false,
    )
  }
}

const validateString = (value: any, fieldName: string): void => {
  if (typeof value !== "string") {
    throw new CodeGeneratorError(
      `${fieldName} must be a string`,
      "VALIDATION_ERROR",
      { field: fieldName, type: typeof value },
      false,
    )
  }
}

const logError = (operation: string, error: any, context?: any): void => {
  console.error(`[CodeGeneratorAPI] ${operation} failed:`, {
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
    context,
    timestamp: new Date().toISOString(),
  })
}

const showErrorMessage = (message: string, details?: string): void => {
  ElMessage.error({
    message: `${message}${details ? `: ${details}` : ""}`,
    duration: 5000,
    showClose: true,
  })
}

const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> => {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      logError(operationName, error, { attempt: attempt + 1, maxRetries })

      if (attempt === maxRetries) {
        break
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Code Generator API Client
 */
export const codeGeneratorApi = {
  /**
   * Get generation statistics
   */
  async getStatistics(): Promise<CodeGenerationStatistics> {
    try {
      return await retryWithBackoff(
        () => api.get<CodeGenerationStatistics>("/api/code-generator/statistics"),
        "getStatistics",
      )
    } catch (error) {
      const errorMessage = "Failed to retrieve generation statistics"
      logError("getStatistics", error)
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "API_ERROR", error, true)
    }
  },

  /**
   * [V9] Generate a full module from metadata
   */
  async generateModule(metadata: ModuleMetadata): Promise<GeneratedModuleResult> {
    try {
      // Input validation
      validateRequired(metadata, "Module metadata")
      validateRequired(metadata.name, "Module name")
      validateString(metadata.name, "Module name")

      if (metadata.entities) {
        validateArray(metadata.entities, "Entities")
        metadata.entities.forEach((entity: EntityDefinition, index: number) => {
          validateRequired(entity.name, `Entity[${index}].name`)
          validateString(entity.name, `Entity[${index}].name`)
        })
      }

      return await retryWithBackoff(
        () => api.post<GeneratedModuleResult>("/api/code-generator/generate-module", metadata),
        "generateModule",
      )
    } catch (error) {
      const errorMessage = "Failed to generate module"
      logError("generateModule", error, { moduleName: metadata?.name })

      if (error instanceof CodeGeneratorError && error.code === "VALIDATION_ERROR") {
        showErrorMessage("Module validation failed", error.message)
      } else {
        showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      }

      throw error instanceof CodeGeneratorError
        ? error
        : new CodeGeneratorError(errorMessage, "GENERATION_ERROR", error, true)
    }
  },

  /** Validate module metadata (server-side structural validation) */
  async validateModule(metadata: ModuleMetadata): Promise<{
    isValid: boolean
    issues: Array<{ severity: string; message: string; path?: string }>
  }> {
    try {
      // Input validation
      validateRequired(metadata, "Module metadata")
      validateRequired(metadata.name, "Module name")
      validateString(metadata.name, "Module name")

      return await retryWithBackoff(
        () => api.post("/api/code-generator/validate", metadata),
        "validateModule",
      )
    } catch (error) {
      const errorMessage = "Failed to validate module metadata"
      logError("validateModule", error, { moduleName: metadata?.name })
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "VALIDATION_ERROR", error, true)
    }
  },

  /** Dry-run generation: get file list and summary without writing to disk */
  async dryRunGenerate(metadata: ModuleMetadata): Promise<{
    success: boolean
    moduleName: string
    totalFiles: number
    totalLines: number
    files: string[]
  }> {
    try {
      // Input validation
      validateRequired(metadata, "Module metadata")
      validateRequired(metadata.name, "Module name")
      validateString(metadata.name, "Module name")

      return await retryWithBackoff(
        () => api.post("/api/code-generator/dry-run", metadata),
        "dryRunGenerate",
      )
    } catch (error) {
      const errorMessage = "Failed to perform dry run generation"
      logError("dryRunGenerate", error, { moduleName: metadata?.name })
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "DRY_RUN_ERROR", error, true)
    }
  },

  /**
   * Get available connection string names
   */
  async getConnectionStrings(): Promise<string[]> {
    try {
      return await retryWithBackoff(
        () => api.get<string[]>("/api/code-generator/connection-strings"),
        "getConnectionStrings",
      )
    } catch (error) {
      const errorMessage = "Failed to retrieve connection strings"
      logError("getConnectionStrings", error)
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "API_ERROR", error, true)
    }
  },

  /**
   * Get menu tree for selecting parent menu
   */
  async getMenuTree(): Promise<MenuItemDto[]> {
    try {
      return await retryWithBackoff(
        () => api.get<MenuItemDto[]>("/api/code-generator/menus"),
        "getMenuTree",
      )
    } catch (error) {
      const errorMessage = "Failed to retrieve menu tree"
      logError("getMenuTree", error)
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "API_ERROR", error, true)
    }
  },

  /** Introspect database schema */
  async introspectDatabase(req: DatabaseIntrospectionRequest): Promise<DatabaseSchema> {
    try {
      // Input validation
      validateRequired(req, "Database introspection request")
      validateRequired(req.connectionStringName, "Connection string name")
      validateString(req.connectionStringName, "Connection string name")
      validateRequired(req.provider, "Database provider")

      const validProviders = ["SqlServer", "PostgreSql", "MySql", "Oracle"]
      if (!validProviders.includes(req.provider)) {
        throw new CodeGeneratorError(
          `Invalid database provider: ${req.provider}. Valid providers: ${validProviders.join(", ")}`,
          "VALIDATION_ERROR",
          { provider: req.provider, validProviders },
          false,
        )
      }

      return await retryWithBackoff(
        () => api.post<DatabaseSchema>("/api/code-generator/introspect-db", req),
        "introspectDatabase",
      )
    } catch (error) {
      const errorMessage = "Failed to introspect database"
      logError("introspectDatabase", error, {
        connectionStringName: req?.connectionStringName,
        provider: req?.provider,
      })

      if (error instanceof CodeGeneratorError && error.code === "VALIDATION_ERROR") {
        showErrorMessage("Database configuration validation failed", error.message)
      } else {
        showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      }

      throw error instanceof CodeGeneratorError
        ? error
        : new CodeGeneratorError(errorMessage, "DATABASE_ERROR", error, true)
    }
  },

  /**
   * Get UI config for a module/entity
   */
  async getUiConfig(moduleName: string, entityName: string): Promise<EntityUIConfig> {
    try {
      // Input validation
      validateRequired(moduleName, "Module name")
      validateString(moduleName, "Module name")
      validateRequired(entityName, "Entity name")
      validateString(entityName, "Entity name")

      return await retryWithBackoff(
        () =>
          api.get<EntityUIConfig>(
            `/api/code-generator/ui-config?module=${encodeURIComponent(moduleName)}&entity=${encodeURIComponent(entityName)}`,
          ),
        "getUiConfig",
      )
    } catch (error) {
      const errorMessage = "Failed to retrieve UI configuration"
      logError("getUiConfig", error, { moduleName, entityName })
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "API_ERROR", error, true)
    }
  },

  /**
   * Save UI config for a module/entity
   */
  async saveUiConfig(
    moduleName: string,
    entityName: string,
    config: EntityUIConfig,
  ): Promise<void> {
    try {
      // Input validation
      validateRequired(moduleName, "Module name")
      validateString(moduleName, "Module name")
      validateRequired(entityName, "Entity name")
      validateString(entityName, "Entity name")
      validateRequired(config, "UI configuration")

      await retryWithBackoff(
        () =>
          api.post<void>(
            `/api/code-generator/ui-config?module=${encodeURIComponent(moduleName)}&entity=${encodeURIComponent(entityName)}`,
            config,
          ),
        "saveUiConfig",
      )
    } catch (error) {
      const errorMessage = "Failed to save UI configuration"
      logError("saveUiConfig", error, { moduleName, entityName })
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "API_ERROR", error, true)
    }
  },

  /**
   * Generate a simple entity
   */
  async generateEntity(definition: EntityDefinition): Promise<GeneratedCodeResult> {
    try {
      // Input validation
      validateRequired(definition, "Entity definition")
      validateRequired(definition.name, "Entity name")
      validateString(definition.name, "Entity name")
      validateRequired(definition.module, "Module name")
      validateString(definition.module, "Module name")
      validateRequired(definition.properties, "Entity properties")
      validateArray(definition.properties, "Entity properties")

      return await retryWithBackoff(
        () => api.post<GeneratedCodeResult>("/api/code-generator/generate-entity", definition),
        "generateEntity",
      )
    } catch (error) {
      const errorMessage = "Failed to generate entity"
      logError("generateEntity", error, {
        entityName: definition?.name,
        moduleName: definition?.module,
      })

      if (error instanceof CodeGeneratorError && error.code === "VALIDATION_ERROR") {
        showErrorMessage("Entity validation failed", error.message)
      } else {
        showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      }

      throw error instanceof CodeGeneratorError
        ? error
        : new CodeGeneratorError(errorMessage, "GENERATION_ERROR", error, true)
    }
  },

  /**
   * Generate DDD domain layer
   */
  async generateDdd(definition: any): Promise<any> {
    try {
      // Input validation
      validateRequired(definition, "DDD definition")

      return await retryWithBackoff(
        () => api.post("/api/code-generator/generate-ddd", definition),
        "generateDdd",
      )
    } catch (error) {
      const errorMessage = "Failed to generate DDD domain layer"
      logError("generateDdd", error)
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "GENERATION_ERROR", error, true)
    }
  },

  /**
   * Generate CQRS pattern implementation
   */
  async generateCqrs(definition: any): Promise<any> {
    try {
      // Input validation
      validateRequired(definition, "CQRS definition")

      return await retryWithBackoff(
        () => api.post("/api/code-generator/generate-cqrs", definition),
        "generateCqrs",
      )
    } catch (error) {
      const errorMessage = "Failed to generate CQRS pattern"
      logError("generateCqrs", error)
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "GENERATION_ERROR", error, true)
    }
  },

  /**
   * Generate application services layer
   */
  async generateApplicationServices(definition: any): Promise<any> {
    try {
      // Input validation
      validateRequired(definition, "Application services definition")

      return await retryWithBackoff(
        () => api.post("/api/code-generator/generate-application-services", definition),
        "generateApplicationServices",
      )
    } catch (error) {
      const errorMessage = "Failed to generate application services"
      logError("generateApplicationServices", error)
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "GENERATION_ERROR", error, true)
    }
  },

  /**
   * Generate infrastructure layer
   */
  async generateInfrastructure(definition: any): Promise<any> {
    try {
      // Input validation
      validateRequired(definition, "Infrastructure definition")

      return await retryWithBackoff(
        () => api.post("/api/code-generator/generate-infrastructure", definition),
        "generateInfrastructure",
      )
    } catch (error) {
      const errorMessage = "Failed to generate infrastructure layer"
      logError("generateInfrastructure", error)
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "GENERATION_ERROR", error, true)
    }
  },

  /**
   * Generate Aspire microservices solution
   */
  async generateAspire(definition: any): Promise<any> {
    try {
      // Input validation
      validateRequired(definition, "Aspire definition")

      return await retryWithBackoff(
        () => api.post("/api/code-generator/generate-aspire", definition),
        "generateAspire",
      )
    } catch (error) {
      const errorMessage = "Failed to generate Aspire solution"
      logError("generateAspire", error)
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "GENERATION_ERROR", error, true)
    }
  },

  /**
   * Generate distributed caching solution
   */
  async generateCaching(definition: any): Promise<any> {
    try {
      // Input validation
      validateRequired(definition, "Caching definition")

      return await retryWithBackoff(
        () => api.post("/api/code-generator/generate-caching", definition),
        "generateCaching",
      )
    } catch (error) {
      const errorMessage = "Failed to generate caching solution"
      logError("generateCaching", error)
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "GENERATION_ERROR", error, true)
    }
  },

  /**
   * Generate messaging solution
   */
  async generateMessaging(definition: any): Promise<any> {
    try {
      // Input validation
      validateRequired(definition, "Messaging definition")

      return await retryWithBackoff(
        () => api.post("/api/code-generator/generate-messaging", definition),
        "generateMessaging",
      )
    } catch (error) {
      const errorMessage = "Failed to generate messaging solution"
      logError("generateMessaging", error)
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "GENERATION_ERROR", error, true)
    }
  },

  /**
   * Generate test suite
   */
  async generateTests(definition: any): Promise<any> {
    try {
      // Input validation
      validateRequired(definition, "Test definition")

      return await retryWithBackoff(
        () => api.post("/api/code-generator/generate-tests", definition),
        "generateTests",
      )
    } catch (error) {
      const errorMessage = "Failed to generate test suite"
      logError("generateTests", error)
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "GENERATION_ERROR", error, true)
    }
  },

  /**
   * Generate telemetry solution
   */
  async generateTelemetry(definition: any): Promise<any> {
    try {
      // Input validation
      validateRequired(definition, "Telemetry definition")

      return await retryWithBackoff(
        () => api.post("/api/code-generator/generate-telemetry", definition),
        "generateTelemetry",
      )
    } catch (error) {
      const errorMessage = "Failed to generate telemetry solution"
      logError("generateTelemetry", error)
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "GENERATION_ERROR", error, true)
    }
  },

  /**
   * Generate code quality solution
   */
  async generateQuality(definition: any): Promise<any> {
    try {
      // Input validation
      validateRequired(definition, "Quality definition")

      return await retryWithBackoff(
        () => api.post("/api/code-generator/generate-quality", definition),
        "generateQuality",
      )
    } catch (error) {
      const errorMessage = "Failed to generate quality solution"
      logError("generateQuality", error)
      showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      throw new CodeGeneratorError(errorMessage, "GENERATION_ERROR", error, true)
    }
  },

  /**
   * Generate complete enterprise solution
   */
  async generateEnterpriseSolution(
    definition: EnterpriseSolutionRequest,
  ): Promise<EnterpriseSolutionResult> {
    try {
      // Input validation
      validateRequired(definition, "Enterprise solution request")
      validateRequired(definition.solutionName, "Solution name")
      validateString(definition.solutionName, "Solution name")

      // Validate solution name format
      if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(definition.solutionName)) {
        throw new CodeGeneratorError(
          "Solution name must start with a letter and contain only letters and numbers",
          "VALIDATION_ERROR",
          { solutionName: definition.solutionName },
          false,
        )
      }

      return await retryWithBackoff(
        () =>
          api.post<EnterpriseSolutionResult>(
            "/api/code-generator/generate-enterprise-solution",
            definition,
          ),
        "generateEnterpriseSolution",
      )
    } catch (error) {
      const errorMessage = "Failed to generate enterprise solution"
      logError("generateEnterpriseSolution", error, { solutionName: definition?.solutionName })

      if (error instanceof CodeGeneratorError && error.code === "VALIDATION_ERROR") {
        showErrorMessage("Solution validation failed", error.message)
      } else {
        showErrorMessage(errorMessage, error instanceof Error ? error.message : "Unknown error")
      }

      throw error instanceof CodeGeneratorError
        ? error
        : new CodeGeneratorError(errorMessage, "GENERATION_ERROR", error, true)
    }
  },
}

export default codeGeneratorApi
