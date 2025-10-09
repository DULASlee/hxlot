<template>
  <div class="cicd-template-designer">
    <el-card class="designer-header">
      <template #header>
        <div class="header-content">
          <h2>
            <el-icon><Setting /></el-icon>
            CI/CD模板生成器
          </h2>
          <el-tag type="success">
            自动化DevOps
          </el-tag>
        </div>
      </template>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="支持4大主流CI/CD平台"
        description="GitHub Actions, GitLab CI, Azure DevOps, Jenkins - 一键生成标准化YAML配置"
      />
    </el-card>

    <!-- 配置表单 -->
    <el-card class="config-form">
      <el-form
        ref="formRef"
        :model="config"
        :rules="rules"
        label-width="140px"
      >
        <el-form-item
          label="CI/CD平台"
          prop="platform"
        >
          <el-select
            v-model="config.platform"
            placeholder="选择CI/CD平台"
            @change="handlePlatformChange"
          >
            <el-option
              label="GitHub Actions"
              value="github"
            >
              <span class="platform-option">
                <el-icon><Promotion /></el-icon>
                GitHub Actions
              </span>
            </el-option>
            <el-option
              label="GitLab CI"
              value="gitlab"
            >
              <span class="platform-option">
                <el-icon><Orange /></el-icon>
                GitLab CI
              </span>
            </el-option>
            <el-option
              label="Azure DevOps"
              value="azuredevops"
            >
              <span class="platform-option">
                <el-icon><Platform /></el-icon>
                Azure DevOps
              </span>
            </el-option>
            <el-option
              label="Jenkins"
              value="jenkins"
            >
              <span class="platform-option">
                <el-icon><Operation /></el-icon>
                Jenkins
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          label="项目名称"
          prop="projectName"
        >
          <el-input
            v-model="config.projectName"
            placeholder="SmartAbp"
            clearable
          />
        </el-form-item>

        <el-form-item
          label="仓库URL"
          prop="repositoryUrl"
        >
          <el-input
            v-model="config.repositoryUrl"
            placeholder="https://github.com/user/repo.git"
            clearable
          />
        </el-form-item>

        <el-divider content-position="left">
          构建选项
        </el-divider>

        <el-form-item label=".NET版本">
          <el-select
            v-model="config.dotnetVersion"
            placeholder="选择.NET版本"
          >
            <el-option
              label=".NET 8.0（推荐）"
              value="8.0"
            />
            <el-option
              label=".NET 7.0"
              value="7.0"
            />
            <el-option
              label=".NET 6.0"
              value="6.0"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Node.js版本">
          <el-select
            v-model="config.nodeVersion"
            placeholder="选择Node.js版本"
          >
            <el-option
              label="Node.js 20（推荐）"
              value="20"
            />
            <el-option
              label="Node.js 18"
              value="18"
            />
            <el-option
              label="Node.js 16"
              value="16"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="构建任务">
          <el-checkbox-group v-model="buildTasks">
            <el-checkbox label="dotnet">
              .NET后端构建
            </el-checkbox>
            <el-checkbox label="vue">
              Vue前端构建
            </el-checkbox>
            <el-checkbox label="tests">
              单元测试
            </el-checkbox>
            <el-checkbox label="docker">
              Docker镜像构建
            </el-checkbox>
            <el-checkbox label="deploy">
              自动部署
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleGenerate"
          >
            <el-icon><DocumentAdd /></el-icon>
            生成CI/CD配置
          </el-button>
          <el-button @click="handleValidate">
            <el-icon><CircleCheck /></el-icon>
            验证配置
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 生成结果 -->
    <el-card
      v-if="generatedConfig"
      class="result-card"
    >
      <template #header>
        <div class="result-header">
          <span>生成结果：{{ generatedConfig.fileName }}</span>
          <div class="result-actions">
            <el-button
              type="success"
              size="small"
              @click="handleDownload"
            >
              <el-icon><Download /></el-icon>
              下载文件
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleCopy"
            >
              <el-icon><CopyDocument /></el-icon>
              复制内容
            </el-button>
          </div>
        </div>
      </template>

      <!-- YAML内容预览 -->
      <div class="yaml-preview">
        <pre>{{ generatedConfig.yamlContent }}</pre>
      </div>

      <!-- 使用说明 -->
      <el-divider content-position="left">
        使用说明
      </el-divider>
      <el-steps
        direction="vertical"
        :active="generatedConfig.instructions.length"
      >
        <el-step
          v-for="(instruction, index) in generatedConfig.instructions"
          :key="index"
          :title="`步骤 ${index + 1}`"
          :description="instruction"
        />
      </el-steps>
    </el-card>

    <!-- 验证结果 -->
    <el-card
      v-if="validationResult"
      class="validation-card"
    >
      <template #header>
        <span>
          <el-icon
            v-if="validationResult.isValid"
            color="green"
          ><CircleCheck /></el-icon>
          <el-icon
            v-else
            color="red"
          ><CircleClose /></el-icon>
          配置验证结果
        </span>
      </template>

      <el-alert
        v-if="validationResult.errors.length > 0"
        type="error"
        :closable="false"
        show-icon
      >
        <template #title>
          错误（{{ validationResult.errors.length }}）
        </template>
        <ul>
          <li
            v-for="(err, idx) in validationResult.errors"
            :key="idx"
          >
            {{ err }}
          </li>
        </ul>
      </el-alert>

      <el-alert
        v-if="validationResult.warnings.length > 0"
        type="warning"
        :closable="false"
        show-icon
        style="margin-top: 10px"
      >
        <template #title>
          警告（{{ validationResult.warnings.length }}）
        </template>
        <ul>
          <li
            v-for="(warn, idx) in validationResult.warnings"
            :key="idx"
          >
            {{ warn }}
          </li>
        </ul>
      </el-alert>

      <el-descriptions
        v-if="Object.keys(validationResult.suggestions).length > 0"
        title="优化建议"
        :column="1"
        border
        style="margin-top: 15px"
      >
        <el-descriptions-item
          v-for="(value, key) in validationResult.suggestions"
          :key="key"
          :label="key"
        >
          {{ value }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 平台特性说明 -->
    <el-card
      v-if="platformInfo"
      class="platform-info"
    >
      <template #header>
        <span>{{ platformInfo.name }} 特性</span>
      </template>
      <el-descriptions
        :column="2"
        border
      >
        <el-descriptions-item label="配置文件">
          {{ platformInfo.fileName }}
        </el-descriptions-item>
        <el-descriptions-item label="存放路径">
          {{ platformInfo.filePath }}
        </el-descriptions-item>
        <el-descriptions-item
          label="触发方式"
          :span="2"
        >
          {{ platformInfo.trigger }}
        </el-descriptions-item>
        <el-descriptions-item
          label="特点"
          :span="2"
        >
          {{ platformInfo.features }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting,
  Promotion,
  Orange,
  Platform,
  Operation,
  DocumentAdd,
  CircleCheck,
  CircleClose,
  RefreshLeft,
  Download,
  CopyDocument
} from '@element-plus/icons-vue'
import { useCICDTemplate } from '@smartabp/lowcode-api'
import type {
  CICDPlatformConfig,
  GeneratedCICDConfig,
  CICDTemplateValidationResult
} from '@smartabp/lowcode-api'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 状态管理 - State Management
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const { loading, generateConfig, validateConfig, exportYaml, copyToClipboard } = useCICDTemplate()

const formRef = ref()
const config = ref<CICDPlatformConfig>({
  platform: 'github',
  projectName: '',
  repositoryUrl: '',
  enableDotnetBuild: true,
  enableVueBuild: true,
  enableTests: true,
  enableDockerBuild: false,
  enableDeployment: false,
  dotnetVersion: '8.0',
  nodeVersion: '20'
})

const buildTasks = ref<string[]>(['dotnet', 'vue', 'tests'])
const generatedConfig = ref<GeneratedCICDConfig | null>(null)
const validationResult = ref<CICDTemplateValidationResult | null>(null)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 表单验证规则 - Form Validation Rules
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const rules = {
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ],
  platform: [
    { required: true, message: '请选择CI/CD平台', trigger: 'change' }
  ]
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 计算属性 - Computed Properties
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const platformInfo = computed(() => {
  const platforms = {
    github: {
      name: 'GitHub Actions',
      fileName: 'ci.yml',
      filePath: '.github/workflows/ci.yml',
      trigger: 'push到main/develop分支，PR到main分支',
      features: '云原生、免费、与GitHub深度集成、丰富的Actions市场'
    },
    gitlab: {
      name: 'GitLab CI',
      fileName: '.gitlab-ci.yml',
      filePath: '.gitlab-ci.yml',
      trigger: 'push到任意分支',
      features: '企业级、自托管、完整的DevOps平台、强大的Runner机制'
    },
    azuredevops: {
      name: 'Azure DevOps',
      fileName: 'azure-pipelines.yml',
      filePath: 'azure-pipelines.yml',
      trigger: '配置在Pipeline中',
      features: 'Microsoft生态、Azure集成、企业级功能、丰富的任务库'
    },
    jenkins: {
      name: 'Jenkins',
      fileName: 'Jenkinsfile',
      filePath: 'Jenkinsfile',
      trigger: '配置在Jenkins中',
      features: '最成熟、高度可定制、丰富的插件生态、自托管'
    }
  }
  return platforms[config.value.platform]
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 监听器 - Watchers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

watch(buildTasks, (tasks) => {
  config.value.enableDotnetBuild = tasks.includes('dotnet')
  config.value.enableVueBuild = tasks.includes('vue')
  config.value.enableTests = tasks.includes('tests')
  config.value.enableDockerBuild = tasks.includes('docker')
  config.value.enableDeployment = tasks.includes('deploy')
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 事件处理 - Event Handlers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function handlePlatformChange() {
  generatedConfig.value = null
  validationResult.value = null
}

async function handleGenerate() {
  try {
    await formRef.value.validate()
    const result = await generateConfig(config.value)
    generatedConfig.value = result
    validationResult.value = null
    ElMessage.success('CI/CD配置生成成功！')
  } catch (error) {
    ElMessage.error('生成失败，请检查配置')
  }
}

async function handleValidate() {
  try {
    await formRef.value.validate()
    const result = await validateConfig(config.value)
    validationResult.value = result
    
    if (result.isValid) {
      ElMessage.success('配置验证通过！')
    } else {
      ElMessage.warning('配置存在问题，请查看验证结果')
    }
  } catch (error) {
    ElMessage.error('验证失败')
  }
}

function handleReset() {
  config.value = {
    platform: 'github',
    projectName: '',
    repositoryUrl: '',
    enableDotnetBuild: true,
    enableVueBuild: true,
    enableTests: true,
    enableDockerBuild: false,
    enableDeployment: false,
    dotnetVersion: '8.0',
    nodeVersion: '20'
  }
  buildTasks.value = ['dotnet', 'vue', 'tests']
  generatedConfig.value = null
  validationResult.value = null
}

function handleDownload() {
  if (!generatedConfig.value) return
  exportYaml(generatedConfig.value.yamlContent, generatedConfig.value.fileName)
  ElMessage.success('文件已下载')
}

async function handleCopy() {
  if (!generatedConfig.value) return
  try {
    await copyToClipboard(generatedConfig.value.yamlContent)
    ElMessage.success('内容已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
.cicd-template-designer {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  .designer-header {
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

  .config-form {
    margin-bottom: 20px;

    .platform-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .result-card {
    margin-bottom: 20px;

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .result-actions {
        display: flex;
        gap: 10px;
      }
    }

    .yaml-preview {
      background-color: #f5f7fa;
      border-radius: 4px;
      padding: 15px;
      max-height: 500px;
      overflow-y: auto;

      pre {
        margin: 0;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.6;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    }
  }

  .validation-card {
    margin-bottom: 20px;

    ul {
      margin: 5px 0;
      padding-left: 20px;
    }
  }

  .platform-info {
    margin-bottom: 20px;
  }
}
</style>

