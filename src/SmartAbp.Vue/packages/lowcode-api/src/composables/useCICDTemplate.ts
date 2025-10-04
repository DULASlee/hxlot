import { ref } from 'vue'
import { http } from '../http-client'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CI/CD模板类型定义 - CI/CD Template Type Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CICDPlatformConfig {
  platform: 'github' | 'gitlab' | 'azuredevops' | 'jenkins'
  projectName: string
  repositoryUrl: string
  enableDotnetBuild: boolean
  enableVueBuild: boolean
  enableTests: boolean
  enableDockerBuild: boolean
  enableDeployment: boolean
  dotnetVersion: string
  nodeVersion: string
}

export interface BuildStageConfig {
  stageName: string
  order: number
  commands: string[]
  dependsOn: string[]
  environment: Record<string, string>
  runOnlyOnBranches: boolean
  branches: string[]
}

export interface GeneratedCICDConfig {
  platform: string
  yamlContent: string
  fileName: string
  filePath: string
  instructions: string[]
  generatedAt: string
}

export interface CICDTemplateValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
  suggestions: Record<string, string>
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CI/CD模板Composable - CI/CD Template Composable
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useCICDTemplate() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 生成CI/CD配置
   */
  async function generateConfig(config: CICDPlatformConfig): Promise<GeneratedCICDConfig> {
    loading.value = true
    error.value = null

    try {
      const response = await http.post<GeneratedCICDConfig>('/api/cicd-template/generate', config)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'CI/CD配置生成失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 验证CI/CD配置
   */
  async function validateConfig(config: CICDPlatformConfig): Promise<CICDTemplateValidationResult> {
    loading.value = true
    error.value = null

    try {
      const response = await http.post<CICDTemplateValidationResult>('/api/cicd-template/validate', config)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '配置验证失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 导出YAML文件
   */
  function exportYaml(content: string, fileName: string) {
    try {
      const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      error.value = '文件导出失败'
      throw err
    }
  }

  /**
   * 复制到剪贴板
   */
  async function copyToClipboard(content: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(content)
    } catch (err) {
      error.value = '复制到剪贴板失败'
      throw err
    }
  }

  return {
    loading,
    error,
    generateConfig,
    validateConfig,
    exportYaml,
    copyToClipboard
  }
}

