import { ref } from 'vue'
import { createSimpleApiComposable } from '@smartabp/lowcode-shared'
import { http } from '../http-client.js'

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
  const error = ref<string | null>(null)

  // API 方法通过工厂函数生成
  const apiComposable: any = createSimpleApiComposable({
    generateConfig: {
      endpoint: '/api/cicd-template/generate',
      method: 'POST',
      errorMessage: 'CI/CD配置生成失败'
    },
    validateConfig: {
      endpoint: '/api/cicd-template/validate',
      method: 'POST',
      errorMessage: '配置验证失败'
    }
  }, http)
  
  const loading = apiComposable.loading
  const generateConfig = apiComposable.generateConfig as (config: CICDPlatformConfig) => Promise<GeneratedCICDConfig>
  const validateConfig = apiComposable.validateConfig as (config: CICDPlatformConfig) => Promise<CICDTemplateValidationResult>

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

