import { ref } from 'vue'
import { http as httpClient } from '../http-client'

/**
 * 可观测性配置DTO
 */
export interface ObservabilityConfig {
  prometheus: PrometheusConfig
  grafana: GrafanaDashboard
  tracing: JaegerConfig
  logging: LokiConfig
}

export interface PrometheusConfig {
  scrapeInterval: string
  evaluationInterval: string
  scrapeConfigs: ScrapeConfig[]
  alertRules: AlertRule[]
  enableServiceMonitor: boolean
}

export interface ScrapeConfig {
  jobName: string
  staticTargets: string[]
  metricsPath: string
  labels: Record<string, string>
}

export interface AlertRule {
  name: string
  expression: string
  duration: string
  severity: string
  labels: Record<string, string>
  annotations: Record<string, string>
}

export interface GrafanaDashboard {
  title: string
  description: string
  panels: Panel[]
  tags: string[]
  refreshInterval: number
}

export interface Panel {
  title: string
  type: string
  queries: MetricQuery[]
  gridX: number
  gridY: number
  gridWidth: number
  gridHeight: number
}

export interface MetricQuery {
  expression: string
  legend: string
  refId: string
}

export interface JaegerConfig {
  samplingType: string
  samplingRate: number
  agentHost: string
  agentPort: number
  enableBaggage: boolean
}

export interface LokiConfig {
  url: string
  labels: string[]
  retentionPeriod: string
  enableMultiTenancy: boolean
}

/**
 * 黄金指标
 */
export interface GoldenSignals {
  latency: MetricQuery
  traffic: MetricQuery
  errors: MetricQuery
  saturation: MetricQuery
}

/**
 * 生成结果
 */
export interface GeneratedPrometheusConfig {
  configYaml: string
  serviceMonitorYaml: string
  alertRulesYaml: string
  generatedAt: string
}

export interface GeneratedGrafanaDashboard {
  dashboardJson: string
  panelCount: number
  generatedAt: string
}

/**
 * 可观测性管理Composable - Day 15
 */
export function useObservability() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 生成Prometheus配置
   */
  const generatePrometheusConfig = async (
    serviceName: string,
    config: PrometheusConfig
  ): Promise<GeneratedPrometheusConfig> => {
    try {
      loading.value = true
      error.value = null

      const response = await httpClient.post<GeneratedPrometheusConfig>(
        '/api/code-generation/observability/prometheus',
        {
          serviceName,
          config
        }
      )

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '生成Prometheus配置失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 生成Grafana仪表板
   */
  const generateGrafanaDashboard = async (
    serviceName: string,
    dashboard: GrafanaDashboard
  ): Promise<GeneratedGrafanaDashboard> => {
    try {
      loading.value = true
      error.value = null

      const response = await httpClient.post<GeneratedGrafanaDashboard>(
        '/api/code-generation/observability/grafana',
        {
          serviceName,
          dashboard
        }
      )

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '生成Grafana仪表板失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取黄金指标定义
   */
  const getGoldenSignals = async (
    serviceName: string
  ): Promise<GoldenSignals> => {
    try {
      loading.value = true
      error.value = null

      const response = await httpClient.get<GoldenSignals>(
        `/api/code-generation/observability/golden-signals/${serviceName}`
      )

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取黄金指标失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    generatePrometheusConfig,
    generateGrafanaDashboard,
    getGoldenSignals
  }
}

