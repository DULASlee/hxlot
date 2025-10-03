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
        <div class="header-content">
          <div class="header-text">
            <h1 class="title">{{ t('ultraSimple.title') }}</h1>
            <p class="subtitle">{{ t('ultraSimple.subtitle') }}</p>
          </div>
          <div class="header-actions">
            <el-tooltip 
              :content="mode === 'dark' ? t('common.switchToLight') : t('common.switchToDark')"
              placement="bottom"
            >
              <el-button
                :icon="mode === 'dark' ? 'Sunny' : 'Moon'"
                circle
                @click="toggleTheme"
                class="theme-toggle"
              />
            </el-tooltip>
          </div>
        </div>
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
            <h3 class="section-title">{{ t('ultraSimple.form.systemBasicInfo') }}</h3>
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
                    <el-option :label="t('ultraSimple.systemNames.SmartConstruction')" value="SmartConstruction" />
                    <el-option :label="t('ultraSimple.systemNames.MES')" value="MES" />
                    <el-option :label="t('ultraSimple.systemNames.HRM')" value="HRM" />
                    <el-option :label="t('ultraSimple.systemNames.CRM')" value="CRM" />
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
            <h3 class="section-title">{{ t('ultraSimple.form.codeGenerationConfig') }}</h3>
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
                    <el-option :label="t('ultraSimple.databaseProviders.SqlServer')" value="SqlServer" />
                    <el-option :label="t('ultraSimple.databaseProviders.MySql')" value="MySql" />
                    <el-option :label="t('ultraSimple.databaseProviders.PostgreSql')" value="PostgreSql" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 7-8. 前端界面配置 -->
            <h3 class="section-title">{{ t('ultraSimple.form.frontendConfig') }}</h3>
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
                    <el-option :label="t('ultraSimple.menuOptions.workstation')" value="workstation" />
                    <el-option :label="t('ultraSimple.menuOptions.business')" value="business" />
                    <el-option :label="t('ultraSimple.menuOptions.masterData')" value="master-data" />
                    <el-option :label="t('ultraSimple.menuOptions.reports')" value="reports" />
                    <el-option :label="t('ultraSimple.menuOptions.system')" value="system" />
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
            <span>{{ t('ultraSimple.logs.title') }}</span>
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
import { useTheme } from '@smartabp/lowcode-shared/theme'
import type { ModuleMetadata, TableSchema } from '@smartabp/lowcode-api'

const { t } = useI18n()
const { mode, toggleTheme } = useTheme()

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
      connectionString: 'Default'
    })
    
    if (connectionTest.success) {
      addLog(t('ultraSimple.logs.databaseConnected', { dbName: connectionTest.databaseName }), 'success')
      addLog(t('ultraSimple.logs.tablesFound', { count: connectionTest.tableCount || 0 }), 'info')
      
      const schema = await codeGeneratorApi.introspectDatabase({
        provider: 'SqlServer',
        connectionStringName: 'Default'
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
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);
  padding: var(--spacing-lg);
}

.studio-container {
  max-width: 1400px;
  margin: 0 auto;
  background: var(--color-bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  border: 0.5px solid var(--color-border-primary);
}

.studio-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .header-text {
    text-align: left;
    flex: 1;
  }
  
  .header-actions {
    .theme-toggle {
      width: 40px;
      height: 40px;
      font-size: 18px;
      
      &:hover {
        background: var(--color-bg-secondary);
      }
    }
  }
  
  .title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-sm) 0;
    letter-spacing: -0.5px;
  }
  
  .subtitle {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin: 0;
    font-weight: var(--font-weight-normal);
  }
}

.studio-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.config-panel {
  .section-title {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: var(--spacing-xl) 0 var(--spacing-lg) 0;
    padding-bottom: var(--spacing-sm);
    border-bottom: 2px solid var(--color-border-primary);
  }
  
  .derived-info {
    margin-top: var(--spacing-xl);
    border-radius: var(--radius-base);
    
    div {
      margin: var(--spacing-sm) 0;
      font-size: var(--font-size-sm);
    }
  }
  
  .generate-btn {
    width: 100%;
    margin-top: var(--spacing-2xl);
    height: 48px;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    border-radius: var(--radius-lg);
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.config-form {
  :deep(.el-form-item) {
    margin-bottom: var(--spacing-xl);
    
    .el-form-item__label {
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-xs);
    }
    
    .el-input,
    .el-select {
      .el-input__inner {
        border-radius: var(--radius-base);
        border: 0.5px solid var(--color-border-primary);
        
        &:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px var(--color-primary-light);
        }
      }
    }
  }
  
  .el-divider {
    margin: var(--spacing-xl) 0;
  }
}

.log-panel {
  border: 0.5px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  height: fit-content;
  max-height: 800px;
  
  .panel-header {
    padding: var(--spacing-lg) var(--spacing-xl);
    border-bottom: 0.5px solid var(--color-border-primary);
    font-weight: var(--font-weight-semibold);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    color: var(--color-text-primary);
  }
  
  .progress-bar {
    padding: 0 var(--spacing-xl);
    margin-top: var(--spacing-xl);
  }

.log-entry {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-base);
  font-size: var(--font-size-sm);
  
  .log-time {
    color: var(--color-text-secondary);
    margin-right: var(--spacing-md);
    font-weight: var(--font-weight-medium);
  }
}

  .log-list {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-xl);
    min-height: 300px;
    max-height: 600px;
    
    .log-entry {
      margin-bottom: var(--spacing-md);
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--radius-base);
      font-size: var(--font-size-sm);
      transition: all 0.2s var(--ease-out);
      
      &:hover {
        transform: translateX(2px);
        box-shadow: var(--shadow-sm);
      }
      
      .log-time {
        color: var(--color-text-secondary);
        margin-right: var(--spacing-md);
        font-weight: var(--font-weight-medium);
        transition: color 0.2s var(--ease-out);
      }
      
      &.info {
        background: var(--color-info-light);
        color: var(--color-info);
        border-left: 3px solid var(--color-info);
      }
      
      &.success {
        background: var(--color-success-light);
        color: var(--color-success);
        border-left: 3px solid var(--color-success);
      }
      
      &.warning {
        background: var(--color-warning-light);
        color: var(--color-warning);
        border-left: 3px solid var(--color-warning);
      }
      
      &.error {
        background: var(--color-danger-light);
        color: var(--color-danger);
        border-left: 3px solid var(--color-danger);
      }
    }
    
    .log-empty {
      text-align: center;
      color: var(--color-text-placeholder);
      padding: var(--spacing-xl);
      font-style: italic;
    }
  }
  
  .action-buttons {
    padding: var(--spacing-xl);
    border-top: 0.5px solid var(--color-border-primary);
    display: flex;
    gap: var(--spacing-md);
    background: var(--color-bg-secondary);
    border-radius: 0 0 var(--radius-xl) var(--radius-xl);
    
    .el-button {
      flex: 1;
      transition: all 0.2s var(--ease-out);
      
      &:hover {
        transform: translateY(-1px);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
  }
}

@media (max-width: 1200px) {
  .studio-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
  
  .studio-container {
    padding: var(--spacing-lg);
    margin: var(--spacing-md);
  }
  
  .studio-header {
    margin-bottom: var(--spacing-lg);
    
    .title {
      font-size: var(--font-size-2xl);
    }
    
    .subtitle {
      font-size: var(--font-size-sm);
    }
  }
}

@media (max-width: 768px) {
  .ultra-simple-studio {
    padding: var(--spacing-md);
    background: var(--color-bg-primary);
  }
  
  .studio-container {
    padding: var(--spacing-md);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }
  
  .config-panel,
  .log-panel {
    padding: var(--spacing-md);
  }
  
  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
    
    .el-button {
      width: 100%;
    }
  }
  
  .generate-btn {
    height: 44px;
    font-size: var(--font-size-base);
  }
}
</style>
