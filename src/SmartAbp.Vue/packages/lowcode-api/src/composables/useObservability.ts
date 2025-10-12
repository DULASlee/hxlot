import { createSimpleApiComposable } from '@smartabp/lowcode-shared'
import { http as httpClient } from '../http-client.js'

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
 * 使用工厂函数自动生成，消除样板代码
 */
export function useObservability() {
  return createSimpleApiComposable({
    generatePrometheusConfig: {
      endpoint: '/api/code-generation/observability/prometheus',
      method: 'POST',
      errorMessage: '生成Prometheus配置失败'
    },
    generateGrafanaDashboard: {
      endpoint: '/api/code-generation/observability/grafana',
      method: 'POST',
      errorMessage: '生成Grafana仪表板失败'
    },
    getGoldenSignals: {
      endpoint: '/api/code-generation/observability/golden-signals',
      method: 'GET',
      errorMessage: '获取黄金指标失败'
    }
  }, httpClient)
}

