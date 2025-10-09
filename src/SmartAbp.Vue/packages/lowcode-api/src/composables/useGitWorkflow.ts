import { ref } from 'vue'
import { http } from '@smartabp/lowcode-api'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Git工作流类型定义 - Git Workflow Type Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface GitRepositoryInitConfig {
  projectName: string
  projectPath: string
  defaultBranch: string
  initializeWithReadme: boolean
  generateGitignore: boolean
  gitignoreTemplate: 'dotnet' | 'vue' | 'dotnet-vue'
  setupGitHooks: boolean
  generatePullRequestTemplate: boolean
}

export interface GitBranchConfig {
  branchName: string
  baseBranch: string
  branchType: 'feature' | 'bugfix' | 'hotfix' | 'release'
  description: string
  checkoutAfterCreate: boolean
}

export interface GitCommitConfig {
  commitMessage: string
  commitType: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore'
  scope: string
  description: string
  body: string
  filesToCommit: string[]
  runPreCommitHooks: boolean
}

export interface GitWorkflowResult {
  success: boolean
  message: string
  repositoryPath: string
  currentBranch: string
  createdFiles: string[]
  warnings: string[]
  errors: string[]
}

export interface GeneratedGitConfig {
  gitignoreContent: string
  preCommitHookContent: string
  prePushHookContent: string
  commitMsgHookContent: string
  pullRequestTemplate: string
  readmeTemplate: string
  generatedAt: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Git工作流Composable - Git Workflow Composable
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useGitWorkflow() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 初始化Git仓库
   */
  async function initializeRepository(config: GitRepositoryInitConfig): Promise<GitWorkflowResult> {
    loading.value = true
    error.value = null

    try {
      const response = await http.post<GitWorkflowResult>('/api/git-workflow/initialize', config)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Git仓库初始化失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建分支
   */
  async function createBranch(config: GitBranchConfig): Promise<GitWorkflowResult> {
    loading.value = true
    error.value = null

    try {
      const response = await http.post<GitWorkflowResult>('/api/git-workflow/create-branch', config)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建分支失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 生成提交信息
   */
  async function generateCommitMessage(config: GitCommitConfig): Promise<GitWorkflowResult> {
    loading.value = true
    error.value = null

    try {
      const response = await http.post<GitWorkflowResult>('/api/git-workflow/generate-commit-message', config)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '生成提交信息失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 生成所有Git配置文件
   */
  async function generateAllGitConfigs(config: GitRepositoryInitConfig): Promise<GeneratedGitConfig> {
    loading.value = true
    error.value = null

    try {
      const response = await http.post<GeneratedGitConfig>('/api/git-workflow/generate-all-configs', config)
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '生成Git配置失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    initializeRepository,
    createBranch,
    generateCommitMessage,
    generateAllGitConfigs
  }
}

