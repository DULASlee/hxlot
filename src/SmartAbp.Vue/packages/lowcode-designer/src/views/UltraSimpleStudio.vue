<!--
  🍎 UltraSimpleStudio - 极简单页面代码生成
  
  设计理念：一个页面完成所有操作
  - 单页面：选表 + 配置 + 生成
  - 8个元数据：充分必要
  - 实时反馈：日志 + 进度
-->
<template>
  <div class="ultra-simple-studio">
    <div class="studio-container">
      <!-- 头部 -->
      <div class="studio-header">
        <h1 class="title">{{ t('ultraSimple.title') }}</h1>
        <p class="subtitle">{{ t('ultraSimple.subtitle') }}</p>
      </div>

      <!-- 主内容区 - 左右布局 -->
      <div class="studio-content">
        <!-- 左侧：配置表单 -->
        <div class="config-panel">
          <el-form
            :model="config"
            label-position="top"
            class="config-form"
          >
            <!-- 1. 数据库表选择 -->
            <el-form-item
              :label="t('ultraSimple.form.selectTable') + ' *'"
              required
            >
              <el-select
                v-model="selectedTable"
                :placeholder="t('ultraSimple.form.tablePlaceholder')"
                size="large"
                filterable
                clearable
                style="width: 100%"
                @change="handleTableSelected"
              >
                <el-option
                  v-for="table in availableTables"
                  :key="table.name"
                  :label="`${table.displayName} (${table.name})`"
                  :value="table.name"
                />
              </el-select>
            </el-form-item>

            <el-divider />

            <!-- 2-4. 系统基础信息 -->
            <h3 class="section-title">📋 {{ t('ultraSimple.form.systemBasicInfo') }}</h3>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item
                  :label="t('ultraSimple.form.systemName') + ' *'"
                  required
                >
                  <el-select
                    v-model="config.systemName"
                    :placeholder="t('ultraSimple.form.systemNamePlaceholder')"
                    filterable
                    allow-create
                  >
                    <el-option label="SmartConstruction" value="SmartConstruction" />
                    <el-option label="MES" value="MES" />
                    <el-option label="HRM" value="HRM" />
                    <el-option label="CRM" value="CRM" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="t('ultraSimple.form.moduleName') + ' *'"
                  required
                >
                  <el-input
                    v-model="config.moduleName"
                    :placeholder="t('ultraSimple.form.moduleNamePlaceholder')"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="t('ultraSimple.form.displayName') + ' *'"
                  required
                >
                  <el-input
                    v-model="config.displayName"
                    :placeholder="t('ultraSimple.form.displayNamePlaceholder')"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 5-6. 代码生成配置 -->
            <h3 class="section-title">🏗️ {{ t('ultraSimple.form.codeGenerationConfig') }}</h3>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item
                  :label="t('ultraSimple.form.architecturePattern') + ' *'"
                  required
                >
                  <el-select
                    v-model="config.architecturePattern"
                    :placeholder="t('ultraSimple.form.architecturePatternPlaceholder')"
                  >
                    <el-option
                      :label="t('ultraSimple.architectureTypes.Crud')"
                      value="Crud"
                    />
                    <el-option
                      :label="t('ultraSimple.architectureTypes.DDD')"
                      value="DDD"
                    />
                    <el-option
                      :label="t('ultraSimple.architectureTypes.CQRS')"
                      value="CQRS"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  :label="t('ultraSimple.form.databaseProvider') + ' *'"
                  required
                >
                  <el-select
                    v-model="config.databaseProvider"
                    :placeholder="t('ultraSimple.form.databaseProviderPlaceholder')"
                  >
                    <el-option label="SQL Server" value="SqlServer" />
                    <el-option label="MySQL" value="MySql" />
                    <el-option label="PostgreSQL" value="PostgreSql" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 7-8. 前端界面配置 -->
            <h3 class="section-title">🎨 {{ t('ultraSimple.form.frontendConfig') }}</h3>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item
                  :label="t('ultraSimple.form.parentMenu') + ' *'"
                  required
                >
                  <el-select
                    v-model="config.parentMenuId"
                    :placeholder="t('ultraSimple.form.parentMenuPlaceholder')"
                  >
                    <el-option label="🏠 工作台" value="workstation" />
                    <el-option label="💼 业务管理" value="business" />
                    <el-option label="📊 基础数据" value="master-data" />
                    <el-option label="📈 报表分析" value="reports" />
                    <el-option label="⚙️ 系统管理" value="system" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="t('ultraSimple.form.menuIcon')">
                  <el-input
                    v-model="config.menuIcon"
                    :placeholder="t('ultraSimple.form.menuIconPlaceholder')"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 自动推导信息 -->
            <el-alert
              :title="t('ultraSimple.derived.title')"
              type="info"
              :closable="false"
              class="derived-info"
            >
              <div><strong>{{ t('ultraSimple.derived.namespace') }}:</strong> {{ derivedNamespace }}</div>
              <div><strong>{{ t('ultraSimple.derived.routePrefix') }}:</strong> {{ derivedRoutePrefix }}</div>
              <div><strong>{{ t('ultraSimple.derived.apiEndpoint') }}:</strong> {{ derivedApiEndpoint }}</div>
            </el-alert>

            <!-- 生成按钮 -->
            <el-button
              type="primary"
              size="large"
              :loading="generating"
              :disabled="!isConfigValid || generationComplete"
              class="generate-btn"
              @click="startGeneration"
            >
              {{ generating ? t('ultraSimple.actions.generating') : t('ultraSimple.actions.oneClickGenerate') }}
            </el-button>
          </el-form>
        </div>

        <!-- 右侧：日志和进度 -->
        <div class="log-panel">
          <div class="panel-header">
            <span>📋 {{ t('ultraSimple.logs.title') }}</span>
          </div>
          
          <!-- 进度条 -->
          <el-progress
            v-if="generating || generationComplete"
            :percentage="generationProgress"
            :status="generationComplete ? 'success' : undefined"
            class="progress-bar"
          />

          <!-- 日志列表 -->
          <div class="log-list">
            <div
              v-for="(log, index) in generationLogs"
              :key="index"
              class="log-entry"
              :class="log.type"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            <div
              v-if="generationLogs.length === 0"
              class="log-empty"
            >
              {{ t('ultraSimple.hints.waitingForGeneration') || '等待生成...' }}
            </div>
          </div>

          <!-- 完成后的操作按钮 -->
          <div
            v-if="generationComplete"
            class="action-buttons"
          >
            <el-button
              type="primary"
              @click="viewGeneratedCode"
            >
              📄 {{ t('ultraSimple.actions.viewCode') }}
            </el-button>
            <el-button
              type="success"
              @click="downloadGeneratedCode"
            >
              📦 {{ t('ultraSimple.actions.downloadZip') }}
            </el-button>
            <el-button
              @click="resetToStart"
            >
              🔄 {{ t('ultraSimple.actions.generateAgain') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { codeGeneratorApi } from '@smartabp/lowcode-api'
import type { ModuleMetadata, TableSchema } from '@smartabp/lowcode-api'

const { t } = useI18n()

// 类型定义
interface DatabaseTable {
  name: string
  displayName: string
  columnCount: number
  schema?: TableSchema
}

interface MetadataConfig {
  systemName: string
  moduleName: string
  displayName: string
  architecturePattern: 'Crud' | 'DDD' | 'CQRS'
  databaseProvider: 'SqlServer' | 'MySql' | 'PostgreSql'
  parentMenuId: string
  menuIcon: string
}

interface GenerationLog {
  time: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

// 响应式状态
const selectedTable = ref<string>('')
const availableTables = ref<DatabaseTable[]>([])
const loadingTables = ref(false)

const config = ref<MetadataConfig>({
  systemName: '',
  moduleName: '',
  displayName: '',
  architecturePattern: 'Crud',
  databaseProvider: 'SqlServer',
  parentMenuId: 'business',
  menuIcon: 'database'
})

const generating = ref(false)
const generationComplete = ref(false)
const generationProgress = ref(0)
const generationLogs = ref<GenerationLog[]>([])
const generationSessionId = ref<string>('')

// 计算属性
const derivedNamespace = computed(() => {
  if (!config.value.systemName || !config.value.moduleName) return ''
  return `${config.value.systemName}.${config.value.moduleName}`
})

const derivedRoutePrefix = computed(() => {
  if (!config.value.moduleName) return ''
  return `/${config.value.moduleName.toLowerCase()}`
})

const derivedApiEndpoint = computed(() => {
  if (!config.value.moduleName) return ''
  return `/api/app/${config.value.moduleName.toLowerCase()}`
})

const isConfigValid = computed(() => {
  return !!(
    selectedTable.value &&
    config.value.systemName &&
    config.value.moduleName &&
    config.value.displayName &&
    config.value.architecturePattern &&
    config.value.databaseProvider &&
    config.value.parentMenuId
  )
})

// 事件处理
const handleTableSelected = (tableName: string) => {
  if (!tableName) return
  const table = availableTables.value.find(t => t.name === tableName)
  if (table) {
    config.value.moduleName = tableName
    config.value.displayName = table.displayName
    ElMessage.success(t('ultraSimple.messages.tableSelected', { tableName: table.displayName }))
  }
}

const addLog = (message: string, type: GenerationLog['type'] = 'info') => {
  const now = new Date()
  generationLogs.value.push({
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
    message,
    type
  })
}

// 代码生成
const startGeneration = async () => {
  generating.value = true
  generationProgress.value = 0
  generationLogs.value = []

  try {
    addLog(t('ultraSimple.logs.startGeneration'), 'info')
    generationProgress.value = 5

    addLog(t('ultraSimple.logs.parsingSchema'), 'info')
    const selectedTableData = availableTables.value.find(t => t.name === selectedTable.value)
    
    if (!selectedTableData?.schema) {
      addLog(t('ultraSimple.logs.schemaNotLoaded'), 'warning')
    }
    
    generationProgress.value = 15

    const metadata: ModuleMetadata = {
      systemName: config.value.systemName,
      name: config.value.moduleName,
      displayName: config.value.displayName,
      namespace: derivedNamespace.value,
      architecturePattern: config.value.architecturePattern,
      databaseInfo: {
        provider: config.value.databaseProvider,
        connectionString: 'default',
        tableName: selectedTable.value,
        schema: selectedTableData?.schema || null
      },
      frontend: {
        framework: 'Vue3',
        parentId: config.value.parentMenuId,
        routePrefix: derivedRoutePrefix.value,
        icon: config.value.menuIcon || 'database'
      },
      backend: {
        generateEntity: true,
        generateAppService: true,
        generateController: true,
        generateDto: true,
        generateRepository: false,
        authorization: {
          enabled: true,
          policyPrefix: config.value.systemName
        }
      }
    }

    addLog(t('ultraSimple.logs.metadataComplete'), 'success')
    generationProgress.value = 25

    addLog(t('ultraSimple.logs.callingService'), 'info')
    const result = await codeGeneratorApi.generateModule(metadata)
    
    if (!result.success) {
      throw new Error(result.message || t('ultraSimple.messages.error'))
    }

    generationSessionId.value = result.sessionId
    generationProgress.value = 40

    addLog(t('ultraSimple.logs.generatingBackend'), 'info')
    await pollGenerationProgress(result.sessionId)
    
    generationProgress.value = 100
    addLog(t('ultraSimple.logs.generationComplete'), 'success')
    addLog(t('ultraSimple.messages.viewCode', { sessionId: result.sessionId }), 'info')
    
    if (result.generatedFiles) {
      addLog(t('ultraSimple.logs.filesGenerated', { count: result.generatedFiles.length }), 'success')
    }

    generationComplete.value = true
    ElMessage.success(t('ultraSimple.messages.success'))
  } catch (error) {
    const errorMsg = (error as Error).message || t('ultraSimple.validation.unknownError')
    addLog(t('ultraSimple.logs.generationFailed', { error: errorMsg }), 'error')
    ElMessage.error(t('ultraSimple.messages.error'))
    console.error('Code generation error:', error)
  } finally {
    generating.value = false
  }
}

const pollGenerationProgress = async (sessionId: string) => {
  const maxAttempts = 60
  let attempts = 0
  
  while (attempts < maxAttempts) {
    try {
      const progress = await codeGeneratorApi.getGenerationStatus(sessionId)
      
      if (progress.percentage > generationProgress.value) {
        generationProgress.value = Math.min(progress.percentage, 95)
        addLog(`📊 ${progress.currentStep}`, 'info')
      }
      
      if (progress.status === 'completed') {
        return
      } else if (progress.status === 'error') {
        throw new Error(progress.error || t('ultraSimple.validation.generationError'))
      }
      
      await sleep(1000)
      attempts++
    } catch (error) {
      await sleep(1000)
      attempts++
    }
  }
  
  addLog(t('ultraSimple.logs.queryTimeout'), 'warning')
}

const viewGeneratedCode = async () => {
  if (!generationSessionId.value) {
    ElMessage.warning(t('ultraSimple.validation.noCodeToView'))
    return
  }
  
  try {
    addLog(t('ultraSimple.logs.fetchingPreview'), 'info')
    const preview = await codeGeneratorApi.getGenerationStatus(generationSessionId.value)
    
    if (preview.completedFiles && preview.completedFiles.length > 0) {
      ElMessage.success(t('ultraSimple.logs.filesGenerated', { count: preview.completedFiles.length }))
      addLog(t('ultraSimple.logs.fileList', { files: preview.completedFiles.join(', ') }), 'info')
    } else {
      ElMessage.info(t('ultraSimple.hints.checkOutputDir'))
    }
  } catch (error) {
    ElMessage.error(t('ultraSimple.validation.previewFailed'))
  }
}

const downloadGeneratedCode = async () => {
  if (!generationSessionId.value) {
    ElMessage.warning(t('ultraSimple.validation.noCodeToDownload'))
    return
  }
  
  try {
    addLog(t('ultraSimple.logs.packagingCode'), 'info')
    const blob = await codeGeneratorApi.exportGeneratedCode(generationSessionId.value)
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.value.moduleName}_${Date.now()}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    addLog(t('ultraSimple.logs.downloadComplete'), 'success')
    ElMessage.success(t('ultraSimple.messages.downloadSuccess'))
  } catch (error) {
    addLog(t('ultraSimple.logs.downloadFailed'), 'error')
    ElMessage.error(t('ultraSimple.messages.downloadError'))
  }
}

const resetToStart = () => {
  selectedTable.value = ''
  generating.value = false
  generationComplete.value = false
  generationProgress.value = 0
  generationLogs.value = []
  generationSessionId.value = ''
  config.value = {
    systemName: '',
    moduleName: '',
    displayName: '',
    architecturePattern: 'Crud',
    databaseProvider: 'SqlServer',
    parentMenuId: 'business',
    menuIcon: 'database'
  }
}

// 初始化
onMounted(async () => {
  try {
    loadingTables.value = true
    addLog(t('ultraSimple.logs.connectingDatabase'), 'info')
    
    const connectionTest = await codeGeneratorApi.testDatabaseConnection({
      provider: 'SqlServer',
      connectionString: 'default'
    })
    
    if (connectionTest.success) {
      addLog(t('ultraSimple.logs.databaseConnected', { dbName: connectionTest.databaseName }), 'success')
      addLog(t('ultraSimple.logs.tablesFound', { count: connectionTest.tableCount || 0 }), 'info')
      
      const schema = await codeGeneratorApi.introspectDatabase({
        provider: 'SqlServer',
        connectionStringName: 'default'
      })
      
      if (schema.tables && schema.tables.length > 0) {
        availableTables.value = schema.tables.map((table: TableSchema) => ({
          name: table.name,
          displayName: table.name,
          columnCount: table.columns.length,
          schema: table
        }))
        
        addLog(t('ultraSimple.logs.tablesLoaded', { count: schema.tables.length }), 'success')
      }
    } else {
      addLog(t('ultraSimple.logs.databaseFailedMock'), 'warning')
    }
  } catch (error) {
    console.warn('Database connection failed, using mock data:', error)
    addLog(t('ultraSimple.logs.usingMockData'), 'warning')
  } finally {
    loadingTables.value = false
  }
})

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
</script>

<style scoped lang="scss">
.ultra-simple-studio {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

.studio-container {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.studio-header {
  text-align: center;
  margin-bottom: 32px;
  
  .title {
    font-size: 32px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 8px 0;
  }
  
  .subtitle {
    font-size: 16px;
    color: #7f8c8d;
    margin: 0;
  }
}

.studio-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.config-panel {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 16px 0 12px 0;
  }
  
  .derived-info {
    margin-top: 16px;
    
    div {
      margin: 4px 0;
    }
  }
  
  .generate-btn {
    width: 100%;
    margin-top: 24px;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
  }
}

.log-panel {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: fit-content;
  max-height: 800px;
  
  .panel-header {
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;
    font-weight: 600;
    background: #f5f5f5;
    border-radius: 8px 8px 0 0;
  }
  
  .progress-bar {
    padding: 0 16px;
    margin-top: 16px;
  }
  
  .log-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    min-height: 300px;
    max-height: 600px;
    
    .log-entry {
      margin-bottom: 8px;
      padding: 8px;
      border-radius: 4px;
      font-size: 13px;
      
      .log-time {
        color: #999;
        margin-right: 8px;
      }
      
      &.info {
        background: #e3f2fd;
        color: #1976d2;
      }
      
      &.success {
        background: #e8f5e9;
        color: #388e3c;
      }
      
      &.warning {
        background: #fff3e0;
        color: #f57c00;
      }
      
      &.error {
        background: #ffebee;
        color: #d32f2f;
      }
    }
    
    .log-empty {
      text-align: center;
      color: #999;
      padding: 32px;
    }
  }
  
  .action-buttons {
    padding: 16px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    gap: 8px;
  }
}

@media (max-width: 1200px) {
  .studio-content {
    grid-template-columns: 1fr;
  }
}
</style>
