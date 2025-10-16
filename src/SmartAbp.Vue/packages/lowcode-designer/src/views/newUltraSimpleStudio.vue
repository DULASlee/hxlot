<!--
  🆕 newUltraSimpleStudio - 极简稳定版
  目标：保留核心功能，移除干扰因素，确保 el-select 回显正常
-->
<template>
  <div class="ultra-simple-studio">
    <div class="studio-container">
      <div class="studio-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="title">{{ t('ultraSimple.title') }}</h1>
            <p class="subtitle">{{ t('ultraSimple.subtitle') }}</p>
          </div>
          <div class="header-actions">
            <el-tooltip :content="mode === 'dark' ? t('common.switchToLight') : t('common.switchToDark')" placement="bottom">
              <el-button :icon="mode === 'dark' ? 'Sunny' : 'Moon'" circle class="theme-toggle" @click="toggleTheme" />
            </el-tooltip>
          </div>
        </div>
      </div>

      <div class="studio-content">
        <div class="config-panel">
          <el-form :model="config" label-position="top" class="config-form">
            <el-form-item :label="t('ultraSimple.form.selectTable') + ' *'" required>
              <el-select
                v-model="selectedTable"
                :key="'table-'+selectedTable"
                :placeholder="t('ultraSimple.form.tablePlaceholder')"
                size="large"
                filterable
                style="width: 100%"
              >
                <el-option v-for="table in availableTables" :key="table.name" :label="table.name" :value="table.name" />
              </el-select>
            </el-form-item>

            <el-divider />

            <h3 class="section-title">{{ t('ultraSimple.form.systemBasicInfo') }}</h3>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item :label="t('ultraSimple.form.systemName') + ' *'" required>
                  <el-select
                    v-model="config.systemName"
                    :key="'sys-'+config.systemName"
                    :placeholder="t('ultraSimple.form.systemNamePlaceholder')"
                    size="large"
                    filterable
                    style="width: 100%"
                  >
                    <el-option label="智慧建造 (SmartConstruction)" value="SmartConstruction" />
                    <el-option label="生产执行系统 (MES)" value="MES" />
                    <el-option label="人力资源 (HRM)" value="HRM" />
                    <el-option label="客户关系 (CRM)" value="CRM" />
                    <el-option label="SmartAbp" value="SmartAbp" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="t('ultraSimple.form.moduleName') + ' *'" required>
                  <el-input v-model="config.moduleName" :placeholder="t('ultraSimple.form.moduleNamePlaceholder')" size="large" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="t('ultraSimple.form.displayName') + ' *'" required>
                  <el-input v-model="config.displayName" :placeholder="t('ultraSimple.form.displayNamePlaceholder')" size="large" clearable />
                </el-form-item>
              </el-col>
            </el-row>

            <h3 class="section-title">{{ t('ultraSimple.form.codeGenerationConfig') }}</h3>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item :label="t('ultraSimple.form.architecturePattern') + ' *'" required>
                  <el-select v-model="config.architecturePattern" :placeholder="t('ultraSimple.form.architecturePatternPlaceholder')" size="large" style="width: 100%">
                    <el-option label="基础 CRUD" value="Crud" />
                    <el-option label="领域驱动设计 (DDD)" value="DDD" />
                    <el-option label="命令查询分离 (CQRS)" value="CQRS" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="t('ultraSimple.form.databaseProvider') + ' *'" required>
                  <el-select v-model="config.databaseProvider" :placeholder="t('ultraSimple.form.databaseProviderPlaceholder')" size="large" style="width: 100%">
                    <el-option label="SQL Server" value="SqlServer" />
                    <el-option label="MySQL" value="MySql" />
                    <el-option label="PostgreSQL" value="PostgreSql" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <h3 class="section-title">{{ t('ultraSimple.form.frontendConfig') }}</h3>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item :label="t('ultraSimple.form.parentMenu') + ' *'" required>
                  <el-select v-model="config.parentMenuId" :placeholder="t('ultraSimple.form.parentMenuPlaceholder')" size="large" style="width: 100%">
                    <el-option label="工作台" value="workstation" />
                    <el-option label="业务管理" value="business" />
                    <el-option label="基础数据" value="master-data" />
                    <el-option label="报表中心" value="reports" />
                    <el-option label="系统管理" value="system" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="t('ultraSimple.form.menuIcon')">
                  <el-input v-model="config.menuIcon" :placeholder="t('ultraSimple.form.menuIconPlaceholder')" size="large" clearable />
                </el-form-item>
              </el-col>
            </el-row>

            <el-alert :title="t('ultraSimple.derived.title')" type="info" :closable="false" class="derived-info">
              <div><strong>{{ t('ultraSimple.derived.namespace') }}:</strong> {{ derivedNamespace }}</div>
              <div><strong>{{ t('ultraSimple.derived.routePrefix') }}:</strong> {{ derivedRoutePrefix }}</div>
              <div><strong>{{ t('ultraSimple.derived.apiEndpoint') }}:</strong> {{ derivedApiEndpoint }}</div>
            </el-alert>

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

        <div class="log-panel">
          <div class="panel-header"><span>{{ t('ultraSimple.logs.title') }}</span></div>
          <el-progress v-if="generating || generationComplete" :percentage="generationProgress" :status="generationComplete ? 'success' : undefined" class="progress-bar" />
          <div class="log-list">
            <div v-for="(log, index) in generationLogs" :key="index" class="log-entry" :class="log.type">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            <div v-if="generationLogs.length === 0" class="log-empty">{{ t('ultraSimple.hints.waitingForGeneration') || '等待生成...' }}</div>
          </div>
          <div v-if="generationComplete" class="action-buttons">
            <el-button type="primary" @click="viewGeneratedCode">📄 {{ t('ultraSimple.actions.viewCode') }}</el-button>
            <el-button type="success" @click="downloadGeneratedCode">📦 {{ t('ultraSimple.actions.downloadZip') }}</el-button>
            <el-button @click="resetToStart">🔄 {{ t('ultraSimple.actions.generateAgain') }}</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModuleMetadata, TableSchema } from '@smartabp/lowcode-api'
import { codeGeneratorApi } from '@smartabp/lowcode-api'
import { useTheme } from '@smartabp/lowcode-shared/theme'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

const { t } = useI18n()
const { mode, toggleTheme } = useTheme()

interface DatabaseTable { name: string; displayName: string; columnCount: number; schema?: TableSchema | null }
interface MetadataConfig {
  systemName: string
  moduleName: string
  displayName: string
  architecturePattern: 'Crud' | 'DDD' | 'CQRS'
  databaseProvider: 'SqlServer' | 'MySql' | 'PostgreSql'
  parentMenuId: string
  menuIcon: string
}

const selectedTable = ref<string>('')
const availableTables = ref<DatabaseTable[]>([])
const generating = ref(false)
const generationComplete = ref(false)
const generationProgress = ref(0)
const generationLogs = ref<Array<{ time: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }>>([])
const generationSessionId = ref<string>('')

const config = reactive<MetadataConfig>({
  systemName: '',
  moduleName: '',
  displayName: '',
  architecturePattern: 'Crud',
  databaseProvider: 'SqlServer',
  parentMenuId: 'business',
  menuIcon: 'database'
})

const derivedNamespace = computed(() => {
  if (!config.systemName || !config.moduleName) return ''
  return `${config.systemName}.${config.moduleName}`
})
const derivedRoutePrefix = computed(() => {
  if (!config.moduleName) return ''
  return `/${config.moduleName.toLowerCase()}`
})
const derivedApiEndpoint = computed(() => {
  if (!config.moduleName) return ''
  return `/api/app/${config.moduleName.toLowerCase()}`
})

const isConfigValid = computed(() => {
  return !!(
    selectedTable.value &&
    config.systemName &&
    config.moduleName &&
    config.displayName &&
    config.architecturePattern &&
    config.databaseProvider &&
    config.parentMenuId
  )
})

function addLog(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
  const now = new Date()
  generationLogs.value.push({
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
    message,
    type
  })
}

function ensureDefaultSelectedTable() {
  if (selectedTable.value) return
  const first = availableTables.value?.[0]?.name
  if (first) selectedTable.value = first
}

async function startGeneration() {
  if (!isConfigValid.value) {
    ElMessage.warning(t('ultraSimple.validation.fillRequired'))
    return
  }
  generating.value = true
  generationProgress.value = 5
  generationLogs.value = []
  try {
    addLog(t('ultraSimple.logs.startGeneration'))
    const metadata: ModuleMetadata = {
      id: crypto.randomUUID(),
      systemName: config.systemName,
      name: config.moduleName,
      displayName: config.displayName,
      namespace: derivedNamespace.value,
      schemaVersion: '1.0.0',
      entities: [],
      database: {
        connectionStringName: 'default',
        schema: 'dbo',
        provider: config.databaseProvider
      } as any,
      frontend: {
        parentId: config.parentMenuId,
        routePrefix: derivedRoutePrefix.value
      } as any
    } as any

    addLog(t('ultraSimple.logs.callingService'))
    const result = await codeGeneratorApi.generateModule({
      moduleMetadata: metadata,
      targetPath: '',
      overwriteExisting: true,
      generateTests: false,
      generateDocs: false
    })
    if (!result.success) throw new Error(result.message || '服务返回失败')

    const status = await codeGeneratorApi.getGenerationStatus('latest')
    generationSessionId.value = (status && (status.sessionId || status.id)) || ''
    generationProgress.value = 40

    // 简化轮询（最多几次）
    for (let i = 0; i < 20; i++) {
      const p = await codeGeneratorApi.getGenerationStatus(generationSessionId.value || 'latest')
      generationProgress.value = Math.min(p.percentage ?? 95, 95)
      if (p.status === 'completed') break
      await new Promise(r => setTimeout(r, 800))
    }

    generationProgress.value = 100
    generationComplete.value = true
    addLog(t('ultraSimple.logs.generationComplete'), 'success')
    ElMessage.success(t('ultraSimple.messages.success'))
  } catch (e: any) {
    addLog(t('ultraSimple.logs.generationFailed', { error: e?.message || 'Unknown' }), 'error')
    ElMessage.error(t('ultraSimple.messages.error'))
    generationComplete.value = false
  } finally {
    generating.value = false
  }
}

async function viewGeneratedCode() {
  if (!generationSessionId.value) {
    ElMessage.warning(t('ultraSimple.validation.noCodeToView'))
    return
  }
  const preview = await codeGeneratorApi.getGenerationStatus(generationSessionId.value)
  if (preview.completedFiles?.length) {
    addLog(t('ultraSimple.logs.fileList', { files: preview.completedFiles.join(', ') }), 'info')
    ElMessage.success(t('ultraSimple.logs.filesGenerated', { count: preview.completedFiles.length }))
  } else {
    ElMessage.info(t('ultraSimple.hints.checkOutputDir'))
  }
}

async function downloadGeneratedCode() {
  if (!generationSessionId.value) {
    ElMessage.warning(t('ultraSimple.validation.noCodeToDownload'))
    return
  }
  const blob = await codeGeneratorApi.exportGeneratedCode(generationSessionId.value)
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${config.moduleName}_${Date.now()}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => window.URL.revokeObjectURL(url), 1000)
  ElMessage.success(t('ultraSimple.messages.downloadSuccess'))
}

function resetToStart() {
  selectedTable.value = ''
  generationComplete.value = false
  generationProgress.value = 0
  generationLogs.value = []
  generationSessionId.value = ''
  Object.assign(config, {
    systemName: '',
    moduleName: '',
    displayName: '',
    architecturePattern: 'Crud',
    databaseProvider: 'SqlServer',
    parentMenuId: 'business',
    menuIcon: 'database'
  })
}

onMounted(async () => {
  try {
    addLog(t('ultraSimple.logs.connectingDatabase'))
    const connectionTest: any = await codeGeneratorApi.testDatabaseConnection({ provider: 'SqlServer', connectionString: 'Default' })
    if (connectionTest?.success && Array.isArray(connectionTest.tables) && connectionTest.tables.length) {
      availableTables.value = connectionTest.tables.map((name: string) => ({ name, displayName: name, columnCount: 0, schema: null }))
      addLog(t('ultraSimple.logs.tablesFound', { count: availableTables.value.length }))
    } else {
      const schema = await codeGeneratorApi.introspectDatabase({ connectionStringName: 'Default', provider: 'SqlServer' })
      availableTables.value = (schema.tables || []).map((t: TableSchema) => ({ name: t.name, displayName: t.displayName || t.name, columnCount: (t.columns?.length) || 0, schema: t }))
      addLog(t('ultraSimple.logs.tablesLoaded', { count: availableTables.value.length }))
    }
    ensureDefaultSelectedTable()
  } catch (e) {
    addLog('❌ 未能加载数据库表列表', 'error')
    ElMessage.error('未能加载数据库表列表，请检查后端服务')
  }
})
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
    display: flex; justify-content: space-between; align-items: center; max-width: 800px; margin: 0 auto;
  }
  .header-text { text-align: left; flex: 1; }
  .title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); margin: 0 0 var(--spacing-sm) 0; }
  .subtitle { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0; }
}
.studio-content { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); }
.config-panel {
  .section-title { font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); margin: var(--spacing-xl) 0 var(--spacing-lg) 0; padding-bottom: var(--spacing-sm); border-bottom: 2px solid var(--color-border-primary); }
  .derived-info { margin-top: var(--spacing-xl); border-radius: var(--radius-base); div { margin: var(--spacing-sm) 0; font-size: var(--font-size-sm); } }
  .generate-btn { width: 100%; margin-top: var(--spacing-2xl); height: 48px; font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); border-radius: var(--radius-lg); }
}
.config-form {
  :deep(.el-form-item) { margin-bottom: var(--spacing-xl); }
  :deep(.el-select) {
    .el-select__selected-item,
    .el-select__selected-item .el-select__selected-item-text,
    .el-select__selection,
    .el-select__wrapper,
    .el-select__input,
    .el-input__inner {
      color: var(--color-text-primary, var(--el-text-color-regular)) !important;
      -webkit-text-fill-color: var(--color-text-primary, var(--el-text-color-regular)) !important;
    }
    .el-select__placeholder,
    .el-input__inner::placeholder {
      color: var(--color-text-secondary, #909399) !important;
    }
  }
  .el-divider { margin: var(--spacing-xl) 0; }
}
.log-panel {
  border: 0.5px solid var(--color-border-primary); border-radius: var(--radius-xl); display: flex; flex-direction: column; height: fit-content; max-height: 800px;
  .panel-header { padding: var(--spacing-lg) var(--spacing-xl); border-bottom: 0.5px solid var(--color-border-primary); font-weight: var(--font-weight-semibold); background: var(--color-bg-secondary); border-radius: var(--radius-xl) var(--radius-xl) 0 0; color: var(--color-text-primary); }
  .progress-bar { padding: 0 var(--spacing-xl); margin-top: var(--spacing-xl); }
  .log-list { flex: 1; overflow-y: auto; padding: var(--spacing-xl); min-height: 300px; max-height: 600px; }
  .action-buttons { padding: var(--spacing-xl); border-top: 0.5px solid var(--color-border-primary); display: flex; gap: var(--spacing-md); background: var(--color-bg-secondary); border-radius: 0 0 var(--radius-xl) var(--radius-xl); }
}
@media (max-width: 1200px) {
  .studio-content { grid-template-columns: 1fr; gap: var(--spacing-xl); }
  .studio-container { padding: var(--spacing-lg); margin: var(--spacing-md); }
}
@media (max-width: 768px) {
  .ultra-simple-studio { padding: var(--spacing-md); background: var(--color-bg-primary); }
  .studio-container { padding: var(--spacing-md); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); }
  .config-panel, .log-panel { padding: var(--spacing-md); }
  .action-buttons { flex-direction: column; gap: var(--spacing-sm); .el-button { width: 100%; } }
  .generate-btn { height: 44px; font-size: var(--font-size-base); }
}
</style>