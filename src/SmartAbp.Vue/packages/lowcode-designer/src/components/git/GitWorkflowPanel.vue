<template>
  <div class="git-workflow-panel">
    <el-card class="panel-header">
      <template #header>
        <div class="header-content">
          <h2>
            <el-icon><FolderOpened /></el-icon>
            Git工作流配置
          </h2>
          <el-tag type="info">
            自动化Git管理
          </el-tag>
        </div>
      </template>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="Git工作流自动化"
        description="一键初始化标准化Git仓库，自动生成.gitignore、Git钩子、PR模板等配置文件"
      />
    </el-card>

    <!-- 功能Tab页 -->
    <el-tabs
      v-model="activeTab"
      class="workflow-tabs"
    >
      <!-- Tab 1: 仓库初始化 -->
      <el-tab-pane
        label="仓库初始化"
        name="init"
      >
        <el-card>
          <el-form
            ref="initFormRef"
            :model="initConfig"
            :rules="initRules"
            label-width="140px"
          >
            <el-form-item
              label="项目名称"
              prop="projectName"
            >
              <el-input
                v-model="initConfig.projectName"
                placeholder="请输入项目名称"
                clearable
              />
            </el-form-item>

            <el-form-item
              label="项目路径"
              prop="projectPath"
            >
              <el-input
                v-model="initConfig.projectPath"
                placeholder="/path/to/project"
                clearable
              >
                <template #append>
                  <el-button @click="selectPath">
                    浏览
                  </el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item
              label="默认分支"
              prop="defaultBranch"
            >
              <el-input
                v-model="initConfig.defaultBranch"
                placeholder="main"
                clearable
              />
            </el-form-item>

            <el-form-item
              label=".gitignore模板"
              prop="gitignoreTemplate"
            >
              <el-select
                v-model="initConfig.gitignoreTemplate"
                placeholder="选择模板"
              >
                <el-option
                  label=".NET项目"
                  value="dotnet"
                />
                <el-option
                  label="Vue项目"
                  value="vue"
                />
                <el-option
                  label=".NET + Vue（推荐）"
                  value="dotnet-vue"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="初始化选项">
              <el-checkbox v-model="initConfig.initializeWithReadme">
                生成README.md
              </el-checkbox>
              <el-checkbox v-model="initConfig.generateGitignore">
                生成.gitignore
              </el-checkbox>
              <el-checkbox v-model="initConfig.setupGitHooks">
                配置Git钩子
              </el-checkbox>
              <el-checkbox v-model="initConfig.generatePullRequestTemplate">
                生成PR模板
              </el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                @click="handleInitializeRepository"
              >
                <el-icon><Upload /></el-icon>
                初始化仓库
              </el-button>
              <el-button @click="handleGenerateConfigPreview">
                <el-icon><View /></el-icon>
                预览配置
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 初始化结果 -->
          <el-alert
            v-if="initResult"
            :type="initResult.success ? 'success' : 'error'"
            :title="initResult.success ? '初始化成功' : '初始化失败'"
            :closable="false"
            show-icon
            class="result-alert"
          >
            <div class="result-content">
              <p>{{ initResult.message }}</p>
              <div v-if="initResult.createdFiles.length > 0">
                <strong>已创建文件：</strong>
                <ul>
                  <li
                    v-for="file in initResult.createdFiles"
                    :key="file"
                  >
                    {{ file }}
                  </li>
                </ul>
              </div>
              <div v-if="initResult.warnings.length > 0">
                <strong>警告：</strong>
                <ul>
                  <li
                    v-for="warning in initResult.warnings"
                    :key="warning"
                  >
                    {{ warning }}
                  </li>
                </ul>
              </div>
            </div>
          </el-alert>
        </el-card>
      </el-tab-pane>

      <!-- Tab 2: 分支管理 -->
      <el-tab-pane
        label="分支管理"
        name="branch"
      >
        <el-card>
          <el-form
            ref="branchFormRef"
            :model="branchConfig"
            :rules="branchRules"
            label-width="140px"
          >
            <el-form-item
              label="分支类型"
              prop="branchType"
            >
              <el-select
                v-model="branchConfig.branchType"
                placeholder="选择分支类型"
              >
                <el-option
                  label="Feature（功能）"
                  value="feature"
                />
                <el-option
                  label="Bugfix（修复）"
                  value="bugfix"
                />
                <el-option
                  label="Hotfix（热修复）"
                  value="hotfix"
                />
                <el-option
                  label="Release（发布）"
                  value="release"
                />
              </el-select>
            </el-form-item>

            <el-form-item
              label="分支名称"
              prop="branchName"
            >
              <el-input
                v-model="branchConfig.branchName"
                placeholder="user-authentication"
                clearable
              />
              <template #extra>
                <span class="branch-preview">
                  完整分支名: <el-tag size="small">{{ fullBranchName }}</el-tag>
                </span>
              </template>
            </el-form-item>

            <el-form-item
              label="基于分支"
              prop="baseBranch"
            >
              <el-input
                v-model="branchConfig.baseBranch"
                placeholder="main"
                clearable
              />
            </el-form-item>

            <el-form-item
              label="分支描述"
              prop="description"
            >
              <el-input
                v-model="branchConfig.description"
                type="textarea"
                :rows="3"
                placeholder="描述此分支的用途..."
              />
            </el-form-item>

            <el-form-item label="创建后切换">
              <el-switch v-model="branchConfig.checkoutAfterCreate" />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                @click="handleCreateBranch"
              >
                <el-icon><Plus /></el-icon>
                创建分支
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- Tab 3: 提交管理 -->
      <el-tab-pane
        label="提交管理"
        name="commit"
      >
        <el-card>
          <el-form
            ref="commitFormRef"
            :model="commitConfig"
            :rules="commitRules"
            label-width="140px"
          >
            <el-form-item
              label="提交类型"
              prop="commitType"
            >
              <el-select
                v-model="commitConfig.commitType"
                placeholder="选择提交类型"
              >
                <el-option
                  label="feat: 新功能"
                  value="feat"
                />
                <el-option
                  label="fix: Bug修复"
                  value="fix"
                />
                <el-option
                  label="docs: 文档更新"
                  value="docs"
                />
                <el-option
                  label="style: 代码格式"
                  value="style"
                />
                <el-option
                  label="refactor: 代码重构"
                  value="refactor"
                />
                <el-option
                  label="test: 测试相关"
                  value="test"
                />
                <el-option
                  label="chore: 构建/工具"
                  value="chore"
                />
              </el-select>
            </el-form-item>

            <el-form-item
              label="作用域"
              prop="scope"
            >
              <el-input
                v-model="commitConfig.scope"
                placeholder="auth, ui, api（可选）"
                clearable
              />
            </el-form-item>

            <el-form-item
              label="简短描述"
              prop="description"
            >
              <el-input
                v-model="commitConfig.description"
                placeholder="简洁地描述此次提交..."
                clearable
              />
            </el-form-item>

            <el-form-item
              label="详细说明"
              prop="body"
            >
              <el-input
                v-model="commitConfig.body"
                type="textarea"
                :rows="4"
                placeholder="详细说明此次变更的原因、影响等（可选）"
              />
            </el-form-item>

            <el-form-item label="运行钩子">
              <el-switch v-model="commitConfig.runPreCommitHooks" />
              <span class="form-item-tip">执行Pre-commit钩子（格式检查+Lint）</span>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                @click="handleGenerateCommitMessage"
              >
                <el-icon><Document /></el-icon>
                生成提交信息
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 生成的提交信息预览 -->
          <el-card
            v-if="generatedCommitMessage"
            class="commit-preview"
            shadow="never"
          >
            <template #header>
              <span>生成的提交信息（Conventional Commits格式）</span>
            </template>
            <pre class="commit-message">{{ generatedCommitMessage }}</pre>
            <el-button
              type="success"
              size="small"
              @click="copyCommitMessage"
            >
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </el-card>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 配置预览对话框 -->
    <el-dialog
      v-model="configPreviewVisible"
      title="Git配置文件预览"
      width="70%"
      :destroy-on-close="true"
    >
      <el-tabs v-model="previewTab">
        <el-tab-pane
          label=".gitignore"
          name="gitignore"
        >
          <pre class="config-preview">{{ generatedConfigs?.gitignoreContent }}</pre>
        </el-tab-pane>
        <el-tab-pane
          label="Pre-commit钩子"
          name="precommit"
        >
          <pre class="config-preview">{{ generatedConfigs?.preCommitHookContent }}</pre>
        </el-tab-pane>
        <el-tab-pane
          label="PR模板"
          name="pr"
        >
          <pre class="config-preview">{{ generatedConfigs?.pullRequestTemplate }}</pre>
        </el-tab-pane>
        <el-tab-pane
          label="README"
          name="readme"
        >
          <pre class="config-preview">{{ generatedConfigs?.readmeTemplate }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  FolderOpened,
  Upload,
  View,
  Plus,
  Document,
  CopyDocument
} from '@element-plus/icons-vue'
import { useGitWorkflow } from '@smartabp/lowcode-api'
import type {
  GitRepositoryInitConfig,
  GitBranchConfig,
  GitCommitConfig,
  GitWorkflowResult,
  GeneratedGitConfig
} from '@smartabp/lowcode-api'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 状态管理 - State Management
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const activeTab = ref('init')
const previewTab = ref('gitignore')
const configPreviewVisible = ref(false)

// @ts-expect-error: useGitWorkflow composable方法待实现
const { loading, initializeRepository, createBranch, generateCommitMessage, generateAllGitConfigs } = useGitWorkflow()

// 仓库初始化配置
const initConfig = ref<GitRepositoryInitConfig>({
  projectName: '',
  projectPath: '',
  defaultBranch: 'main',
  initializeWithReadme: true,
  generateGitignore: true,
  gitignoreTemplate: 'dotnet-vue',
  setupGitHooks: true,
  generatePullRequestTemplate: true
})

const initFormRef = ref()
const initResult = ref<GitWorkflowResult | null>(null)

// 分支配置
const branchConfig = ref<GitBranchConfig>({
  branchName: '',
  baseBranch: 'main',
  branchType: 'feature',
  description: '',
  checkoutAfterCreate: true
})

const branchFormRef = ref()

// 提交配置
const commitConfig = ref<GitCommitConfig>({
  commitMessage: '',
  commitType: 'feat',
  scope: '',
  description: '',
  body: '',
  filesToCommit: [],
  runPreCommitHooks: true
})

const commitFormRef = ref()
const generatedCommitMessage = ref('')

// 生成的配置文件
const generatedConfigs = ref<GeneratedGitConfig | null>(null)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 表单验证规则 - Form Validation Rules
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const initRules = {
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ],
  projectPath: [
    { required: true, message: '请输入项目路径', trigger: 'blur' }
  ]
}

const branchRules = {
  branchName: [
    { required: true, message: '请输入分支名称', trigger: 'blur' }
  ]
}

const commitRules = {
  description: [
    { required: true, message: '请输入提交描述', trigger: 'blur' }
  ]
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 计算属性 - Computed Properties
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fullBranchName = computed(() => {
  if (!branchConfig.value.branchName) return ''
  return `${branchConfig.value.branchType}/${branchConfig.value.branchName}`
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 事件处理 - Event Handlers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function handleInitializeRepository() {
  try {
    await initFormRef.value.validate()
    const result = await initializeRepository(initConfig.value)
    initResult.value = result

    if (result.success) {
      ElMessage.success('Git仓库初始化成功！')
    } else {
      ElMessage.error('Git仓库初始化失败')
    }
  } catch (error) {
    ElMessage.error('初始化失败，请检查配置')
  }
}

async function handleCreateBranch() {
  try {
    await branchFormRef.value.validate()
    const result = await createBranch(branchConfig.value)

    if (result.success) {
      ElMessage.success(`分支 ${fullBranchName.value} 创建成功！`)
    }
  } catch (error) {
    ElMessage.error('创建分支失败')
  }
}

async function handleGenerateCommitMessage() {
  try {
    await commitFormRef.value.validate()
    const result = await generateCommitMessage(commitConfig.value)

    if (result.success) {
      generatedCommitMessage.value = result.message
      ElMessage.success('提交信息生成成功！')
    }
  } catch (error) {
    ElMessage.error('生成提交信息失败')
  }
}

async function handleGenerateConfigPreview() {
  try {
    await initFormRef.value.validate()
    const configs = await generateAllGitConfigs(initConfig.value)
    generatedConfigs.value = configs
    configPreviewVisible.value = true
  } catch (error) {
    ElMessage.error('生成配置预览失败')
  }
}

function selectPath() {
  ElMessage.info('文件选择功能需要客户端支持')
}

async function copyCommitMessage() {
  try {
    await navigator.clipboard.writeText(generatedCommitMessage.value)
    ElMessage.success('提交信息已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
.git-workflow-panel {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .panel-header {
    margin-bottom: 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 24px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }
  }

  .workflow-tabs {
    margin-top: 20px;
  }

  .branch-preview {
    color: #606266;
    font-size: 14px;
    margin-left: 10px;
  }

  .form-item-tip {
    margin-left: 10px;
    color: #909399;
    font-size: 13px;
  }

  .result-alert {
    margin-top: 20px;

    .result-content {
      ul {
        margin: 5px 0;
        padding-left: 20px;
      }
    }
  }

  .commit-preview {
    margin-top: 20px;

    .commit-message {
      background-color: #f5f7fa;
      padding: 15px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 10px 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }

  .config-preview {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 13px;
    line-height: 1.6;
    max-height: 500px;
    overflow-y: auto;
    margin: 0;
  }
}
</style>

