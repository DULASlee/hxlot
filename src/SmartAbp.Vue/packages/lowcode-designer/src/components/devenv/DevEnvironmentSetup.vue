<template>
  <div class="dev-environment-setup">
    <el-card class="setup-header" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">
            <el-icon><Setting /></el-icon>
            本地开发环境配置
          </span>
          <span class="subtitle">一键生成Docker Compose + 启动脚本 + 环境变量</span>
        </div>
      </template>

      <el-alert
        title="快速上手"
        type="info"
        description="选择所需的基础服务，配置项目信息，即可生成完整的本地开发环境配置文件。支持PostgreSQL、Redis、RabbitMQ、Elasticsearch、Seq等5大基础服务。"
        :closable="false"
        show-icon
      />
    </el-card>

    <el-row :gutter="20" class="content-row">
      <!-- 左侧配置面板 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span><el-icon><Tools /></el-icon> 配置面板</span>
          </template>

          <el-form :model="config" label-width="120px" label-position="right">
            <!-- 项目信息 -->
            <el-divider content-position="left">
              <el-icon><Folder /></el-icon> 项目信息
            </el-divider>
            
            <el-form-item label="项目名称" required>
              <el-input
                v-model="config.projectName"
                placeholder="例如: SmartAbp"
                clearable
              >
                <template #prefix>
                  <el-icon><DocumentCopy /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="项目路径" required>
              <el-input
                v-model="config.projectPath"
                placeholder="例如: /Users/xxx/Projects/SmartAbp"
                clearable
              >
                <template #prefix>
                  <el-icon><FolderOpened /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 服务选择 -->
            <el-divider content-position="left">
              <el-icon><Cpu /></el-icon> 基础服务选择
            </el-divider>

            <el-form-item label="数据库">
              <el-checkbox-group v-model="config.services">
                <el-checkbox label="postgresql">
                  <el-tag type="primary" size="small">PostgreSQL</el-tag>
                  <span class="service-desc">关系型数据库</span>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="缓存">
              <el-checkbox-group v-model="config.services">
                <el-checkbox label="redis">
                  <el-tag type="danger" size="small">Redis</el-tag>
                  <span class="service-desc">分布式缓存</span>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="消息队列">
              <el-checkbox-group v-model="config.services">
                <el-checkbox label="rabbitmq">
                  <el-tag type="warning" size="small">RabbitMQ</el-tag>
                  <span class="service-desc">消息中间件</span>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="搜索引擎">
              <el-checkbox-group v-model="config.services">
                <el-checkbox label="elasticsearch">
                  <el-tag type="success" size="small">Elasticsearch</el-tag>
                  <span class="service-desc">全文搜索</span>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="日志服务">
              <el-checkbox-group v-model="config.services">
                <el-checkbox label="seq">
                  <el-tag type="info" size="small">Seq</el-tag>
                  <span class="service-desc">结构化日志</span>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <!-- 高级选项 -->
            <el-divider content-position="left">
              <el-icon><Star /></el-icon> 高级选项
            </el-divider>

            <el-form-item label="热重载">
              <el-switch v-model="config.enableHotReload" />
              <span class="option-desc">启用代码热重载</span>
            </el-form-item>

            <el-form-item label="调试模式">
              <el-switch v-model="config.enableDebugMode" />
              <span class="option-desc">启用详细日志</span>
            </el-form-item>

            <el-form-item label="健康检查">
              <el-switch v-model="config.enableHealthCheck" />
              <span class="option-desc">启用服务健康检查</span>
            </el-form-item>

            <!-- 操作按钮 -->
            <el-form-item>
              <el-button
                type="primary"
                :icon="Promotion"
                :loading="loading"
                @click="generateAllConfigs"
              >
                生成所有配置
              </el-button>
              <el-button :icon="View" @click="previewDialogVisible = true">
                预览配置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧预览和下载 -->
      <el-col :span="12">
        <el-card shadow="hover" class="preview-card">
          <template #header>
            <span><el-icon><Document /></el-icon> 生成结果</span>
          </template>

          <el-tabs v-model="activeTab" class="result-tabs">
            <!-- Docker Compose -->
            <el-tab-pane label="Docker Compose" name="docker">
              <div v-if="dockerCompose" class="result-content">
                <div class="result-actions">
                  <el-button
                    size="small"
                    :icon="Download"
                    type="primary"
                    @click="downloadDockerCompose"
                  >
                    下载 docker-compose.dev.yml
                  </el-button>
                  <el-button
                    size="small"
                    :icon="CopyDocument"
                    @click="copyDockerCompose"
                  >
                    复制
                  </el-button>
                </div>
                
                <div class="instructions">
                  <el-alert type="success" :closable="false">
                    <template #title>
                      <el-icon><CircleCheck /></el-icon>
                      使用说明
                    </template>
                    <ul>
                      <li v-for="(instruction, index) in dockerCompose.instructions" :key="index">
                        {{ instruction }}
                      </li>
                    </ul>
                  </el-alert>
                </div>

                <el-input
                  v-model="dockerCompose.yamlContent"
                  type="textarea"
                  :rows="15"
                  readonly
                  class="code-preview"
                />
              </div>
              <el-empty v-else description="请先生成配置" />
            </el-tab-pane>

            <!-- 启动脚本 -->
            <el-tab-pane label="启动脚本" name="script">
              <div v-if="startupScript" class="result-content">
                <div class="script-type-selector">
                  <el-radio-group v-model="scriptType" size="small" @change="generateScript">
                    <el-radio-button label="bash">
                      <el-icon><Monitor /></el-icon> Linux/Mac
                    </el-radio-button>
                    <el-radio-button label="powershell">
                      <el-icon><Platform /></el-icon> PowerShell
                    </el-radio-button>
                    <el-radio-button label="batch">
                      <el-icon><Grid /></el-icon> Batch
                    </el-radio-button>
                  </el-radio-group>
                </div>

                <div class="result-actions">
                  <el-button
                    size="small"
                    :icon="Download"
                    type="primary"
                    @click="downloadStartupScript"
                  >
                    下载 {{ startupScript.fileName }}
                  </el-button>
                  <el-button
                    size="small"
                    :icon="CopyDocument"
                    @click="copyStartupScript"
                  >
                    复制
                  </el-button>
                </div>

                <div class="instructions">
                  <el-alert type="info" :closable="false">
                    <template #title>
                      <el-icon><InfoFilled /></el-icon>
                      使用说明
                    </template>
                    <ul>
                      <li v-for="(instruction, index) in startupScript.instructions" :key="index">
                        {{ instruction }}
                      </li>
                    </ul>
                  </el-alert>
                </div>

                <el-input
                  v-model="startupScript.scriptContent"
                  type="textarea"
                  :rows="12"
                  readonly
                  class="code-preview"
                />
              </div>
              <el-empty v-else description="请先生成配置" />
            </el-tab-pane>

            <!-- 环境变量 -->
            <el-tab-pane label="环境变量" name="env">
              <div v-if="envFile" class="result-content">
                <div class="env-selector">
                  <el-radio-group v-model="envType" size="small" @change="generateEnv">
                    <el-radio-button label="development">
                      <el-icon><Laptop /></el-icon> Development
                    </el-radio-button>
                    <el-radio-button label="staging">
                      <el-icon><Cloudy /></el-icon> Staging
                    </el-radio-button>
                    <el-radio-button label="production">
                      <el-icon><Connection /></el-icon> Production
                    </el-radio-button>
                  </el-radio-group>
                </div>

                <div class="result-actions">
                  <el-button
                    size="small"
                    :icon="Download"
                    type="primary"
                    @click="downloadEnvFile"
                  >
                    下载 {{ envFile.fileName }}
                  </el-button>
                  <el-button
                    size="small"
                    :icon="CopyDocument"
                    @click="copyEnvFile"
                  >
                    复制
                  </el-button>
                </div>

                <div class="instructions">
                  <el-alert type="warning" :closable="false">
                    <template #title>
                      <el-icon><Warning /></el-icon>
                      安全提示
                    </template>
                    <ul>
                      <li v-for="(instruction, index) in envFile.instructions" :key="index">
                        {{ instruction }}
                      </li>
                    </ul>
                  </el-alert>
                </div>

                <el-input
                  v-model="envFile.content"
                  type="textarea"
                  :rows="12"
                  readonly
                  class="code-preview"
                />
              </div>
              <el-empty v-else description="请先生成配置" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="配置预览"
      width="60%"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="项目名称">
          {{ config.projectName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="项目路径">
          {{ config.projectPath || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="选择服务" :span="2">
          <el-tag
            v-for="service in config.services"
            :key="service"
            type="primary"
            size="small"
            style="margin-right: 8px"
          >
            {{ service }}
          </el-tag>
          <span v-if="config.services.length === 0">未选择</span>
        </el-descriptions-item>
        <el-descriptions-item label="热重载">
          <el-tag :type="config.enableHotReload ? 'success' : 'info'" size="small">
            {{ config.enableHotReload ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="调试模式">
          <el-tag :type="config.enableDebugMode ? 'success' : 'info'" size="small">
            {{ config.enableDebugMode ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="健康检查">
          <el-tag :type="config.enableHealthCheck ? 'success' : 'info'" size="small">
            {{ config.enableHealthCheck ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting,
  Tools,
  Folder,
  DocumentCopy,
  FolderOpened,
  Cpu,
  Star,
  Promotion,
  View,
  Document,
  Download,
  CopyDocument,
  CircleCheck,
  Monitor,
  Platform,
  Grid,
  InfoFilled,
  Laptop,
  Cloudy,
  Connection,
  Warning
} from '@element-plus/icons-vue'
import {
  useDevEnvironment,
  type DevEnvironmentConfig,
  type GeneratedDockerCompose,
  type GeneratedStartupScript,
  type GeneratedEnvFile,
  type EnvironmentVariables
} from '@smartabp/lowcode-api'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 状态管理 - State Management
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const {
  loading,
  error,
  generateDockerCompose,
  generateStartupScript,
  generateEnvFile,
  downloadFile,
  copyToClipboard
} = useDevEnvironment()

const config = reactive<DevEnvironmentConfig>({
  projectName: 'SmartAbp',
  projectPath: '/Users/xxx/Projects/SmartAbp',
  services: ['postgresql', 'redis'],
  environmentVariables: {},
  enableHotReload: true,
  enableDebugMode: true,
  enableHealthCheck: true
})

const dockerCompose = ref<GeneratedDockerCompose | null>(null)
const startupScript = ref<GeneratedStartupScript | null>(null)
const envFile = ref<GeneratedEnvFile | null>(null)

const activeTab = ref('docker')
const scriptType = ref<'bash' | 'powershell' | 'batch'>('bash')
const envType = ref<'development' | 'staging' | 'production'>('development')
const previewDialogVisible = ref(false)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 核心方法 - Core Methods
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 生成所有配置
 */
async function generateAllConfigs(): Promise<void> {
  if (!config.projectName || !config.projectPath) {
    ElMessage.warning('请填写项目名称和路径')
    return
  }

  if (config.services.length === 0) {
    ElMessage.warning('请至少选择一个服务')
    return
  }

  try {
    // 生成Docker Compose
    dockerCompose.value = await generateDockerCompose(config)
    ElMessage.success('Docker Compose配置生成成功')

    // 生成启动脚本
    await generateScript()
    
    // 生成环境变量
    await generateEnv()

    ElMessage.success({
      message: '所有配置生成成功！',
      duration: 3000
    })
  } catch (err: any) {
    ElMessage.error(err.message || '生成配置失败')
  }
}

/**
 * 生成启动脚本
 */
async function generateScript(): Promise<void> {
  try {
    startupScript.value = await generateStartupScript({
      scriptType: scriptType.value,
      preStartCommands: ['echo "正在启动开发环境..."'],
      startCommands: ['docker-compose -f docker-compose.dev.yml up -d'],
      postStartCommands: ['echo "开发环境启动完成！"'],
      healthCheckTimeout: 60
    })
  } catch (err: any) {
    ElMessage.error('生成启动脚本失败')
  }
}

/**
 * 生成环境变量文件
 */
async function generateEnv(): Promise<void> {
  try {
    const envVars: EnvironmentVariables = {
      development: {
        NODE_ENV: 'development',
        API_URL: 'http://localhost:5000',
        DB_HOST: 'localhost',
        DB_PORT: '5432',
        REDIS_HOST: 'localhost',
        REDIS_PORT: '6379'
      },
      staging: {
        NODE_ENV: 'staging',
        API_URL: 'https://staging-api.example.com',
        DB_HOST: 'staging-db',
        DB_PORT: '5432',
        REDIS_HOST: 'staging-redis',
        REDIS_PORT: '6379'
      },
      production: {
        NODE_ENV: 'production',
        API_URL: 'https://api.example.com',
        DB_HOST: 'prod-db',
        DB_PORT: '5432',
        REDIS_HOST: 'prod-redis',
        REDIS_PORT: '6379'
      },
      secretKeys: ['DB_PASSWORD', 'REDIS_PASSWORD', 'JWT_SECRET']
    }

    envFile.value = await generateEnvFile(envType.value, envVars)
  } catch (err: any) {
    ElMessage.error('生成环境变量文件失败')
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 下载和复制方法 - Download & Copy Methods
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function downloadDockerCompose(): void {
  if (dockerCompose.value) {
    downloadFile(dockerCompose.value.yamlContent, dockerCompose.value.fileName)
    ElMessage.success('Docker Compose配置已下载')
  }
}

async function copyDockerCompose(): Promise<void> {
  if (dockerCompose.value) {
    await copyToClipboard(dockerCompose.value.yamlContent)
    ElMessage.success('已复制到剪贴板')
  }
}

function downloadStartupScript(): void {
  if (startupScript.value) {
    downloadFile(startupScript.value.scriptContent, startupScript.value.fileName)
    ElMessage.success('启动脚本已下载')
  }
}

async function copyStartupScript(): Promise<void> {
  if (startupScript.value) {
    await copyToClipboard(startupScript.value.scriptContent)
    ElMessage.success('已复制到剪贴板')
  }
}

function downloadEnvFile(): void {
  if (envFile.value) {
    downloadFile(envFile.value.content, envFile.value.fileName)
    ElMessage.success('环境变量文件已下载')
  }
}

async function copyEnvFile(): Promise<void> {
  if (envFile.value) {
    await copyToClipboard(envFile.value.content)
    ElMessage.success('已复制到剪贴板')
  }
}
</script>

<style scoped lang="scss">
.dev-environment-setup {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

.setup-header {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .title {
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .subtitle {
      font-size: 14px;
      color: #909399;
    }
  }
}

.content-row {
  min-height: 600px;
}

.service-desc {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

.option-desc {
  margin-left: 12px;
  font-size: 13px;
  color: #606266;
}

.preview-card {
  height: 100%;
}

.result-tabs {
  :deep(.el-tabs__content) {
    padding: 0;
  }
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.script-type-selector,
.env-selector {
  margin-bottom: 12px;
}

.instructions {
  ul {
    margin: 0;
    padding-left: 20px;

    li {
      margin: 4px 0;
      line-height: 1.6;
    }
  }
}

.code-preview {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;

  :deep(textarea) {
    line-height: 1.5;
    font-family: inherit;
  }
}
</style>

