/**
 * 开发环境配置API Composable
 * Development Environment Configuration API
 * 
 * @author SmartAbp Team
 * @date 2025-01-04
 */

import { ref } from 'vue'
import { createSimpleApiComposable } from '@smartabp/lowcode-shared'
import { http } from '../http-client.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TypeScript类型定义 - Type Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DevEnvironmentConfig {
  projectName: string
  projectPath: string
  services: string[]
  environmentVariables: Record<string, string>
  enableHotReload: boolean
  enableDebugMode: boolean
  enableHealthCheck: boolean
}

export interface GeneratedDockerCompose {
  yamlContent: string
  fileName: string
  instructions: string[]
  generatedAt: string
}

export interface StartupScriptConfig {
  scriptType: 'bash' | 'powershell' | 'batch'
  preStartCommands: string[]
  startCommands: string[]
  postStartCommands: string[]
  healthCheckTimeout: number
}

export interface GeneratedStartupScript {
  scriptContent: string
  fileName: string
  scriptType: string
  instructions: string[]
  generatedAt: string
}

export interface EnvironmentVariables {
  development: Record<string, string>
  staging: Record<string, string>
  production: Record<string, string>
  secretKeys: string[]
}

export interface GeneratedEnvFile {
  content: string
  fileName: string
  environment: string
  instructions: string[]
  generatedAt: string
}

export interface ValidationResult {
  isValid: boolean
  warnings: string[]
  errors: string[]
  suggestions: Record<string, string>
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Composable主函数 - Main Composable Function
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useDevEnvironment() {
  const error = ref<string | null>(null)

  // API 方法通过工厂函数生成
  const apiComposable: any = createSimpleApiComposable({
    generateDockerCompose: {
      endpoint: '/api/code-generator/dev-environment/docker-compose',
      method: 'POST',
      errorMessage: '生成Docker Compose配置失败'
    },
    generateStartupScript: {
      endpoint: '/api/code-generator/dev-environment/startup-script',
      method: 'POST',
      errorMessage: '生成启动脚本失败'
    },
    generateEnvFile: {
      endpoint: '/api/code-generator/dev-environment/env-file',
      method: 'POST',
      errorMessage: '生成环境变量文件失败'
    },
    validateConfig: {
      endpoint: '/api/code-generator/dev-environment/validate',
      method: 'POST',
      errorMessage: '验证配置失败'
    }
  }, http)

  const loading = apiComposable.loading
  const generateDockerCompose = apiComposable.generateDockerCompose as (config: DevEnvironmentConfig) => Promise<GeneratedDockerCompose>
  const generateStartupScript = apiComposable.generateStartupScript as (config: StartupScriptConfig) => Promise<GeneratedStartupScript>
  const generateEnvFile = apiComposable.generateEnvFile as (environment: string, envVars: EnvironmentVariables) => Promise<GeneratedEnvFile>
  const validateConfig = apiComposable.validateConfig as (config: DevEnvironmentConfig) => Promise<ValidationResult>

  /**
   * 下载文件（前端工具函数）
   */
  function downloadFile(content: string, fileName: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  /**
   * 复制到剪贴板
   */
  async function copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  }

  return {
    loading,
    error,
    generateDockerCompose,
    generateStartupScript,
    generateEnvFile,
    validateConfig,
    downloadFile,
    copyToClipboard
  }
}

