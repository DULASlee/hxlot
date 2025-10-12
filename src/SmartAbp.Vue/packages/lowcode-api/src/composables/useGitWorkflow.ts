import { createSimpleApiComposable } from '@smartabp/lowcode-shared'
import { http } from '../http-client.js'

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

/**
 * Git工作流 Composable
 * 使用工厂函数自动生成，消除样板代码
 */
export function useGitWorkflow() {
  return createSimpleApiComposable({
    initializeRepository: {
      endpoint: '/api/git-workflow/initialize',
      method: 'POST',
      errorMessage: 'Git仓库初始化失败'
    },
    createBranch: {
      endpoint: '/api/git-workflow/create-branch',
      method: 'POST',
      errorMessage: '创建分支失败'
    },
    generateCommitMessage: {
      endpoint: '/api/git-workflow/generate-commit-message',
      method: 'POST',
      errorMessage: '生成提交信息失败'
    },
    generateAllGitConfigs: {
      endpoint: '/api/git-workflow/generate-all-configs',
      method: 'POST',
      errorMessage: '生成Git配置失败'
    }
  }, http)
}

