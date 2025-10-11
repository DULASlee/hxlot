/**
 * 开发环境配置API Composable
 * Development Environment Configuration API
 * 
 * @author SmartAbp Team
 * @date 2025-01-04
 */

import { ref } from 'vue'
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
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 生成Docker Compose配置
   */
  async function generateDockerCompose(config: DevEnvironmentConfig): Promise<GeneratedDockerCompose> {
    loading.value = true
    error.value = null
    try {
      const response = await http.post<GeneratedDockerCompose>(
        '/api/code-generator/dev-environment/docker-compose',
        config
      )
      return response
    } catch (err: any) {
      error.value = err.message || '生成Docker Compose配置失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 生成启动脚本
   */
  async function generateStartupScript(config: StartupScriptConfig): Promise<GeneratedStartupScript> {
    loading.value = true
    error.value = null
    try {
      const response = await http.post<GeneratedStartupScript>(
        '/api/code-generator/dev-environment/startup-script',
        config
      )
      return response
    } catch (err: any) {
      error.value = err.message || '生成启动脚本失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 生成环境变量文件
   */
  async function generateEnvFile(
    environment: string,
    envVars: EnvironmentVariables
  ): Promise<GeneratedEnvFile> {
    loading.value = true
    error.value = null
    try {
      const response = await http.post<GeneratedEnvFile>(
        `/api/code-generator/dev-environment/env-file/${environment}`,
        envVars
      )
      return response
    } catch (err: any) {
      error.value = err.message || '生成环境变量文件失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 验证配置
   */
  async function validateConfig(config: DevEnvironmentConfig): Promise<ValidationResult> {
    loading.value = true
    error.value = null
    try {
      const response = await http.post<ValidationResult>(
        '/api/code-generator/dev-environment/validate',
        config
      )
      return response
    } catch (err: any) {
      error.value = err.message || '验证配置失败'
      throw err
    } finally {
      loading.value = false
    }
  }

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

