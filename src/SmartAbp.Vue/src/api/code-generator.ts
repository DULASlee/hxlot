import { api } from "@/utils/api"

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
