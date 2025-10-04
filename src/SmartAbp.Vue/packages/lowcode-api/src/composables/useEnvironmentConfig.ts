import { ref } from 'vue'
import { http as httpClient } from '../http-client'

/**
 * 环境配置DTO
 */
export interface EnvironmentConfig {
  environment: string
  defaultReplicas: number
  resources: ResourceLimits
  environmentVariables: Record<string, string>
  features: FeatureFlags
  deploymentStrategy: DeploymentStrategyConfig
  enableAutoScaling: boolean
  autoScaling?: AutoScalingConfig
}

export interface ResourceLimits {
  cpuRequest: string
  cpuLimit: string
  memoryRequest: string
  memoryLimit: string
  storageRequest: string
  storageLimit: string
}

export interface FeatureFlags {
  enableTelemetry: boolean
  enableMetrics: boolean
  enableTracing: boolean
  enableLogging: boolean
  enableHealthChecks: boolean
  enableSwagger: boolean
  customFlags: Record<string, boolean>
}

export interface DeploymentStrategyConfig {
  type: string
  maxSurge: string
  maxUnavailable: string
  minReadySeconds: number
  progressDeadlineSeconds: number
}

export interface AutoScalingConfig {
  minReplicas: number
  maxReplicas: number
  targetCPUUtilization: number
  targetMemoryUtilization: number
  customMetrics: CustomMetric[]
}

export interface CustomMetric {
  name: string
  type: string
  targetType: string
  targetValue: string
}

/**
 * 环境对比结果
 */
export interface EnvironmentComparison {
  environment1: string
  environment2: string
  differences: ConfigDifference[]
  totalDifferences: number
  comparedAt: string
}

export interface ConfigDifference {
  path: string
  property: string
  value1?: string
  value2?: string
  differenceType: string
}

/**
 * K8s Manifest生成结果
 */
export interface GeneratedKubernetesManifest {
  environment: string
  manifests: Record<string, string>
  resourceCount: number
  generatedAt: string
}

/**
 * Helm Chart生成结果
 */
export interface GeneratedHelmChart {
  chartName: string
  chartVersion: string
  files: Record<string, string>
  templateCount: number
  generatedAt: string
}

/**
 * 环境配置管理Composable - Day 11
 */
export function useEnvironmentConfig() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 获取环境列表
   */
  const getEnvironments = async (): Promise<string[]> => {
    try {
      loading.value = true
      error.value = null

      const response = await httpClient.get<string[]>(
        '/api/code-generation/environments'
      )

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取环境列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取环境配置
   */
  const getEnvironmentConfig = async (
    environment: string
  ): Promise<EnvironmentConfig> => {
    try {
      loading.value = true
      error.value = null

      const response = await httpClient.get<EnvironmentConfig>(
        `/api/code-generation/environments/${environment}/config`
      )

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取环境配置失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 保存环境配置
   */
  const saveEnvironmentConfig = async (
    environment: string,
    config: EnvironmentConfig
  ): Promise<EnvironmentConfig> => {
    try {
      loading.value = true
      error.value = null

      const response = await httpClient.post<EnvironmentConfig>(
        `/api/code-generation/environments/${environment}/config`,
        config
      )

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存环境配置失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 对比两个环境
   */
  const compareEnvironments = async (
    env1: string,
    env2: string
  ): Promise<EnvironmentComparison> => {
    try {
      loading.value = true
      error.value = null

      const response = await httpClient.get<EnvironmentComparison>(
        `/api/code-generation/environments/compare?env1=${env1}&env2=${env2}`
      )

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '环境对比失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 生成Kubernetes Manifest
   */
  const generateKubernetesManifest = async (
    serviceName: string,
    environment: string,
    config: EnvironmentConfig
  ): Promise<GeneratedKubernetesManifest> => {
    try {
      loading.value = true
      error.value = null

      const response = await httpClient.post<GeneratedKubernetesManifest>(
        '/api/code-generation/kubernetes/manifest',
        {
          serviceName,
          environment,
          config
        }
      )

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '生成K8s Manifest失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 生成Helm Chart
   */
  const generateHelmChart = async (
    chartName: string,
    services: string[],
    environments: Record<string, EnvironmentConfig>
  ): Promise<GeneratedHelmChart> => {
    try {
      loading.value = true
      error.value = null

      const response = await httpClient.post<GeneratedHelmChart>(
        '/api/code-generation/helm/chart',
        {
          chartName,
          services,
          environments
        }
      )

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '生成Helm Chart失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getEnvironments,
    getEnvironmentConfig,
    saveEnvironmentConfig,
    compareEnvironments,
    generateKubernetesManifest,
    generateHelmChart
  }
}

