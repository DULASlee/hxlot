import { ref } from 'vue'
import { http as httpClient } from '../http-client'

/**
 * Aspire解决方案生成定义
 */
export interface AspireSolutionDefinition {
  solutionName: string
  rootNamespace: string
  description?: string
  microservices: MicroserviceDefinition[]
  includeApiGateway?: boolean
  databaseName?: string
  usePostgreSQL?: boolean
  useRedis?: boolean
  useRabbitMQ?: boolean
  useElasticsearch?: boolean
  useSeq?: boolean
}

/**
 * 微服务定义
 */
export interface MicroserviceDefinition {
  name: string
  projectName: string
  displayName: string
  description?: string
  replicas?: number
  useDapr?: boolean
  useServiceDiscovery?: boolean
  useHealthChecks?: boolean
  useOpenTelemetry?: boolean
}

/**
 * 生成结果
 */
export interface GeneratedAspireSolution {
  solutionName: string
  files: Record<string, string>
  microserviceCount: number
  generatedAt: string
}

/**
 * Aspire代码生成Composable
 * Day 9: .NET Aspire微服务编排
 */
export function useAspireCodeGen() {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const result = ref<GeneratedAspireSolution | null>(null)

  /**
   * 生成Aspire解决方案
   */
  const generateAspireSolution = async (
    definition: AspireSolutionDefinition
  ): Promise<GeneratedAspireSolution> => {
    loading.value = true
    error.value = null

    try {
      const response = await httpClient.post<GeneratedAspireSolution>(
        '/api/code-generation/aspire-solution',
        definition
      )

      result.value = response
      return response
    } catch (err: any) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 验证Aspire配置
   */
  const validateConfiguration = (definition: AspireSolutionDefinition): string[] => {
    const errors: string[] = []

    if (!definition.solutionName || definition.solutionName.trim().length === 0) {
      errors.push('解决方案名称不能为空')
    }

    if (!definition.rootNamespace || definition.rootNamespace.trim().length === 0) {
      errors.push('根命名空间不能为空')
    }

    if (!definition.microservices || definition.microservices.length === 0) {
      errors.push('至少需要一个微服务')
    }

    definition.microservices.forEach((service, index) => {
      if (!service.name || service.name.trim().length === 0) {
        errors.push(`微服务 #${index + 1}: 服务名称不能为空`)
      }

      if (!service.projectName || service.projectName.trim().length === 0) {
        errors.push(`微服务 #${index + 1}: 项目名称不能为空`)
      }

      if (!/^[a-z][a-z0-9-]*$/.test(service.name)) {
        errors.push(`微服务 #${index + 1}: 服务名称格式不正确（应为kebab-case）`)
      }

      if (!/^[A-Z][a-zA-Z0-9]*$/.test(service.projectName)) {
        errors.push(`微服务 #${index + 1}: 项目名称格式不正确（应为PascalCase）`)
      }
    })

    return errors
  }

  /**
   * 获取默认配置
   */
  const getDefaultConfiguration = (): AspireSolutionDefinition => {
    return {
      solutionName: 'SmartAbp.Microservices',
      rootNamespace: 'SmartAbp',
      description: '基于.NET Aspire的微服务解决方案',
      microservices: [],
      includeApiGateway: true,
      databaseName: 'AppDatabase',
      usePostgreSQL: true,
      useRedis: true,
      useRabbitMQ: true,
      useElasticsearch: false,
      useSeq: true
    }
  }

  return {
    loading,
    error,
    result,
    generateAspireSolution,
    validateConfiguration,
    getDefaultConfiguration
  }
}

