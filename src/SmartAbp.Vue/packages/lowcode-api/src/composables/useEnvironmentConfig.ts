import { createSimpleApiComposable } from '@smartabp/lowcode-shared'
import { http as httpClient } from '../http-client.js'

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
 * 使用工厂函数自动生成，消除样板代码
 */
export function useEnvironmentConfig() {
  return createSimpleApiComposable({
    getEnvironments: {
      endpoint: '/api/code-generation/environments',
      method: 'GET',
      errorMessage: '获取环境列表失败'
    },
    getEnvironmentConfig: {
      endpoint: '/api/code-generation/environments',
      method: 'GET',
      errorMessage: '获取环境配置失败'
    },
    saveEnvironmentConfig: {
      endpoint: '/api/code-generation/environments',
      method: 'POST',
      errorMessage: '保存环境配置失败'
    },
    compareEnvironments: {
      endpoint: '/api/code-generation/environments/compare',
      method: 'GET',
      errorMessage: '环境对比失败'
    },
    generateKubernetesManifest: {
      endpoint: '/api/code-generation/kubernetes/manifest',
      method: 'POST',
      errorMessage: '生成K8s Manifest失败'
    },
    generateHelmChart: {
      endpoint: '/api/code-generation/helm/chart',
      method: 'POST',
      errorMessage: '生成Helm Chart失败'
    }
  }, httpClient)
}

