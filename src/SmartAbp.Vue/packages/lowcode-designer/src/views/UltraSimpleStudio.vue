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
            <h1 class="title">
              {{ t('ultraSimple.title') }}
            </h1>
            <p class="subtitle">
              {{ t('ultraSimple.subtitle') }}
            </p>
          </div>
          <div class="header-actions">
            <el-tooltip :content="mode === 'dark' ? t('common.switchToLight') : t('common.switchToDark')"
              placement="bottom">
              <el-button :icon="mode === 'dark' ? 'Sunny' : 'Moon'" circle class="theme-toggle" @click="toggleTheme" />
            </el-tooltip>
          </div>
        </div>
      </div>

      <!-- 主内容区 - 左右布局 -->
      <div class="studio-content">
        <!-- 左侧：配置表单 -->
        <div class="config-panel">
          <el-form :model="config" label-position="top" class="config-form">
            <!-- 1. 数据库表选择 -->
            <el-form-item :label="t('ultraSimple.form.selectTable') + ' *'" required>
              <!-- ✅ 修复：移除 clearable 属性，与能正常工作的下拉框保持一致 -->
              <el-select v-model="selectedTable" :placeholder="t('ultraSimple.form.tablePlaceholder')" size="large"
                style="width: 100%" ref="tableSelectRef"
                @visible-change="(open: boolean) => { if (open) console.log('🔎 打开表下拉：当前selectedTable=', selectedTable, '可选项=', availableTables.map(t => t.name)) }"
                @change="async (val: string) => { console.log('🟢 el-select change(table):', val); const has = availableTables.some(t => t.name === val); if (!has) console.warn('⚠️ 选中值未在可选项中找到', val); await nextTick(); const el = tableSelectRef?.value?.$el as HTMLElement | undefined; const txt = el?.querySelector('.el-select__selected-item, .el-input__inner') as HTMLElement | null; console.log('🧪 DOM选中文本(table)=', txt?.textContent, 'input.value=', (el?.querySelector('input') as HTMLInputElement | null)?.value); }">
                <el-option v-for="table in availableTables" :key="table.name" :label="table.name" :value="table.name" />
              </el-select>
            </el-form-item>

            <el-divider />

            <!-- 2-4. 系统基础信息 -->
            <h3 class="section-title">
              {{ t('ultraSimple.form.systemBasicInfo') }}
            </h3>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item :label="t('ultraSimple.form.systemName') + ' *'" required>
                  <!-- ✅ 修复：移除 allow-create 和 default-first-option -->
                  <el-select v-model="config.systemName" :placeholder="t('ultraSimple.form.systemNamePlaceholder')"
                    size="large" style="width: 100%" ref="systemSelectRef"
                    @visible-change="(open: boolean) => { if (open) console.log('🔎 打开系统名称下拉：当前systemName=', config.systemName) }"
                    @change="async (val: string) => { console.log('🟢 el-select change(systemName):', val); await nextTick(); const el = systemSelectRef?.value?.$el as HTMLElement | undefined; const txt = el?.querySelector('.el-select__selected-item, .el-input__inner') as HTMLElement | null; console.log('🧪 DOM选中文本(system)=', txt?.textContent, 'input.value=', (el?.querySelector('input') as HTMLInputElement | null)?.value); }">
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
                  <el-input v-model="config.moduleName" :placeholder="t('ultraSimple.form.moduleNamePlaceholder')"
                    size="large" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item :label="t('ultraSimple.form.displayName') + ' *'" required>
                  <el-input v-model="config.displayName" :placeholder="t('ultraSimple.form.displayNamePlaceholder')"
                    size="large" clearable />
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 5-6. 代码生成配置 -->
            <h3 class="section-title">
              {{ t('ultraSimple.form.codeGenerationConfig') }}
            </h3>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item :label="t('ultraSimple.form.architecturePattern') + ' *'" required>
                  <el-select v-model="config.architecturePattern"
                    :placeholder="t('ultraSimple.form.architecturePatternPlaceholder')" size="large"
                    style="width: 100%">
                    <el-option label="基础 CRUD" value="Crud" />
                    <el-option label="领域驱动设计 (DDD)" value="DDD" />
                    <el-option label="命令查询分离 (CQRS)" value="CQRS" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="t('ultraSimple.form.databaseProvider') + ' *'" required>
                  <el-select v-model="config.databaseProvider"
                    :placeholder="t('ultraSimple.form.databaseProviderPlaceholder')" size="large" style="width: 100%">
                    <el-option label="SQL Server" value="SqlServer" />
                    <el-option label="MySQL" value="MySql" />
                    <el-option label="PostgreSQL" value="PostgreSql" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 7-8. 前端界面配置 -->
            <h3 class="section-title">
              {{ t('ultraSimple.form.frontendConfig') }}
            </h3>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item :label="t('ultraSimple.form.parentMenu') + ' *'" required>
                  <el-select v-model="config.parentMenuId" :placeholder="t('ultraSimple.form.parentMenuPlaceholder')"
                    size="large" style="width: 100%">
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
                  <div class="icon-picker">
                    <el-input v-model="config.menuIcon" :placeholder="t('ultraSimple.form.menuIconPlaceholder')"
                      size="large" readonly>
                      <template #prefix>
                        <el-icon v-if="config.menuIcon">
                          <component :is="(EpIcons as any)[config.menuIcon]" />
                        </el-icon>
                      </template>
                      <template #append>
                        <el-button @click="iconPickerVisible = true">{{ t('common.select') || '选择' }}</el-button>
                      </template>
                    </el-input>

                    <el-dialog v-model="iconPickerVisible" :title="t('ultraSimple.form.menuIcon')" width="720px">
                      <el-input v-model="iconSearch" :placeholder="t('common.search') || '搜索图标'" clearable />
                      <div class="icon-grid">
                        <div v-for="name in epIconNames" :key="name" class="icon-item" @click="selectMenuIcon(name)">
                          <el-icon>
                            <component :is="(EpIcons as any)[name]" />
                          </el-icon>
                          <span>{{ name }}</span>
                        </div>
                      </div>
                      <template #footer>
                        <el-button @click="iconPickerVisible = false">{{ t('common.close') || '关闭' }}</el-button>
                      </template>
                    </el-dialog>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <!-- 自动推导信息 -->
            <el-alert :title="t('ultraSimple.derived.title')" type="info" :closable="false" class="derived-info">
              <div><strong>{{ t('ultraSimple.derived.namespace') }}:</strong> {{ derivedNamespace }}</div>
              <div><strong>{{ t('ultraSimple.derived.routePrefix') }}:</strong> {{ derivedRoutePrefix }}</div>
              <div><strong>{{ t('ultraSimple.derived.apiEndpoint') }}:</strong> {{ derivedApiEndpoint }}</div>
            </el-alert>

            <!-- ✅ B方案优化：验证错误显示 -->
            <el-alert v-if="validationState.errors.length > 0 && validationState.isDirty" title="配置验证失败" type="error"
              :closable="false" class="validation-errors">
              <ul class="error-list">
                <li v-for="(error, index) in validationState.errors" :key="index">
                  <strong>{{ error.field }}:</strong> {{ error.message }}
                </li>
              </ul>
            </el-alert>

            <!-- 生成按钮 -->
            <el-button type="primary" size="large" :loading="generating"
              :disabled="!isConfigValid || generationComplete" class="generate-btn" @click="startGeneration">
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
          <el-progress v-if="generating || generationComplete" :percentage="generationProgress"
            :status="generationComplete ? 'success' : undefined" class="progress-bar" />

          <!-- 日志列表 -->
          <div class="log-list">
            <div v-for="(log, index) in generationLogs" :key="index" class="log-entry" :class="log.type">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            <div v-if="generationLogs.length === 0" class="log-empty">
              {{ t('ultraSimple.hints.waitingForGeneration') || '等待生成...' }}
            </div>
          </div>

          <!-- 完成后的操作按钮 -->
          <div v-if="generationComplete" class="action-buttons">
            <el-button type="primary" @click="viewGeneratedCode">
              📄 {{ t('ultraSimple.actions.viewCode') }}
            </el-button>
            <el-button type="success" @click="downloadGeneratedCode">
              📦 {{ t('ultraSimple.actions.downloadZip') }}
            </el-button>
            <el-button @click="resetToStart">
              🔄 {{ t('ultraSimple.actions.generateAgain') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as EpIcons from '@element-plus/icons-vue'
import type { ModuleMetadata, TableSchema } from '@smartabp/lowcode-api'
import { codeGeneratorApi } from '@smartabp/lowcode-api'
import { safeValidateModuleMetadata } from '@smartabp/lowcode-shared'
import { useTheme } from '@smartabp/lowcode-shared/theme'
import { useDebounceFn } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

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

// ✅ 简化：响应式状态（移除不必要的计算属性）
const selectedTable = ref<string>('')
const availableTables = ref<DatabaseTable[]>([])
const loadingTables = ref(false)
const tableSelectRef = ref()
const systemSelectRef = ref()

const config = reactive<MetadataConfig>({
  systemName: '',  // 🔥 修复：移除默认值，让用户手动选择
  moduleName: '',
  displayName: '',
  architecturePattern: 'Crud',
  databaseProvider: 'SqlServer',
  parentMenuId: 'business',
  menuIcon: 'database'
})

// 🔥 调试：监听所有变化
if (import.meta.env.DEV) {
  watch(() => selectedTable.value, (val) => {
    console.log('🔍 selectedTable changed:', val)
  })
  watch(() => config.systemName, (val) => {
    console.log('🔍 config.systemName changed:', val)
  })
  watch(() => config.architecturePattern, (val) => {
    console.log('🔍 config.architecturePattern changed:', val)
  })
  watch(() => config.databaseProvider, (val) => {
    console.log('🔍 config.databaseProvider changed:', val)
  })
}

const generating = ref(false)
const generationComplete = ref(false)
const generationProgress = ref(0)
const generationLogs = ref<GenerationLog[]>([])
const generationSessionId = ref<string>('')

// ✅ B方案优化：验证状态
const validationState = reactive({
  errors: [] as Array<{ field: string; message: string }>,
  isValid: false,
  isDirty: false,
  isValidating: false
})

// 计算属性
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

// 🔥 简化：移除验证状态依赖，只检查必填字段
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

// 显式校验，返回缺失字段列表
const getMissingFields = (): string[] => {
  const missing: string[] = []
  if (!selectedTable.value) missing.push(t('ultraSimple.form.table'))
  if (!config.systemName) missing.push(t('ultraSimple.form.systemName'))
  if (!config.moduleName) missing.push(t('ultraSimple.form.moduleName'))
  if (!config.displayName) missing.push(t('ultraSimple.form.displayName'))
  if (!config.architecturePattern) missing.push(t('ultraSimple.form.architecturePattern'))
  if (!config.databaseProvider) missing.push(t('ultraSimple.form.databaseProvider'))
  if (!config.parentMenuId) missing.push(t('ultraSimple.form.parentMenu'))
  return missing
}

// 将config转换为ModuleMetadata（不再为核心必填提供兜底默认）
const convertToModuleMetadata = (): ModuleMetadata => {
  const selectedTableData = availableTables.value.find(t => t.name === selectedTable.value)

  const c = (config && (config as any).value) ? (config as any).value as MetadataConfig : {
    systemName: '',
    moduleName: '',
    displayName: '',
    architecturePattern: 'Crud',
    databaseProvider: 'SqlServer',
    parentMenuId: 'business',
    menuIcon: 'database'
  } as MetadataConfig

  const ns = (derivedNamespace?.value && derivedNamespace.value.trim()) || ''
  const route = (derivedRoutePrefix?.value && derivedRoutePrefix.value.trim()) || ''
  const schema = selectedTableData?.schema
    ? String((selectedTableData.schema as unknown as { schema?: string })?.schema || 'dbo')
    : 'dbo'

  // 🔥 关键修复：将选中的表转换为 Entity
  const entities: any[] = []
  if (selectedTableData) {
    const entityName = selectedTable.value || 'Entity'
    const entity = {
      id: crypto.randomUUID(),
      name: entityName,
      displayName: entityName,
      description: `${entityName} 实体`,
      module: c.moduleName,
      namespace: ns,
      tableName: selectedTable.value,
      schema: schema,
      isAggregateRoot: true,
      isAudited: true,
      isSoftDelete: true,
      isMultiTenant: false,
      baseClass: 'AuditedAggregateRoot',
      interfaces: [],
      properties: (selectedTableData.schema?.columns || []).map((col: any) => ({
        id: crypto.randomUUID(),
        name: col.name || col.Name,
        displayName: col.name || col.Name,
        type: col.dataType || col.DataType || 'string',
        isRequired: !col.isNullable && !(col.IsNullable ?? true),
        isKey: col.isPrimaryKey || col.IsPrimaryKey || false,
        isUnique: false,
        isIndexed: false,
        defaultValue: null,
        description: '',
        helpText: '',
        maxLength: col.maxLength || col.MaxLength || null,
        minLength: null,
        pattern: '',
        precision: null,
        scale: null,
        minValue: null,
        maxValue: null,
        enumValues: [],
        validationRules: [],
        displayOrder: 0,
        groupName: '',
        isVisible: true,
        isReadonly: false,
        columnName: col.name || col.Name,
        columnType: col.dataType || col.DataType || 'string',
        isAuditField: false,
        isSoftDeleteField: false,
        searchable: true,
        disabled: false,
        listVisible: true,
        detailVisible: true,
        formVisible: true,
        sortable: true,
        filterable: true,
        isTenantField: false
      })),
      relationships: [],
      indexes: [],
      constraints: [],
      businessRules: [],
      permissions: [],
      codeGeneration: {
        generateEntity: true,
        generateRepository: true,
        generateService: true,        // 🔥 修复：后端是 GenerateService 不是 GenerateAppService
        generateController: true,
        generateDto: true,
        generateTests: false,
        customTemplates: {},
        options: {
          useAutoMapper: true,
          generateValidation: true,
          generateSwaggerDoc: true,
          generatePermissions: true,
          generateAuditLog: true
        }
      },
      uiConfig: {
        listConfig: {                 // 🔥 修复：后端是 ListConfig 不是 listPageConfig
          defaultPageSize: 10,
          sortableColumns: [],
          filterableColumns: [],
          searchableColumns: [],
          displayColumns: [],
          actions: []
        },
        formConfig: {
          layout: 'vertical',
          columnCount: 1,
          fieldGroups: [],
          validationStrategy: 'immediate'
        },
        detailConfig: {               // 🔥 修复：后端是 DetailConfig 不是 detailPageConfig
          layout: 'vertical',
          sections: [],
          actions: []
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      tags: []
    }
    entities.push(entity)
  }

  return {
    id: crypto.randomUUID(),
    systemName: c.systemName,
    moduleName: c.moduleName, // Phase 2B: 后端ModuleDto使用moduleName而非name
    displayName: c.displayName,
    description: `${c.displayName || c.moduleName} 模块`,
    version: '1.0.0',
    // schemaVersion: '1.0.0',  // Phase 2B: 后端ModuleDto无此字段
    // architecturePattern: (c.architecturePattern as 'Crud' | 'DDD' | 'CQRS') || 'Crud', // Phase 2B: 后端ModuleDto无此字段
    namespace: ns,
    entities: entities,  // 🔥 修复：传入真实的实体数组
    // databaseInfo: { // Phase 2B: 后端ModuleDto无此字段
    //   connectionStringName: 'Default',
    //   schema,
    //   provider: (c.databaseProvider || 'SqlServer') as 'SqlServer' | 'PostgreSql' | 'MySql' | 'Oracle' | 'SQLite'
    // },
    // frontend: { // Phase 2B: 后端ModuleDto无此字段，使用FrontendConfig
    //   parentId: c.parentMenuId || 'business',
    //   routePrefix: route
    // },
    // author: 'SmartAbp Generator', // Phase 2B: 后端ModuleDto无此字段
    // featureManagement: { isEnabled: false, defaultPolicy: '' }, // Phase 2B: 后端ModuleDto无此字段
    // generateMobilePages: false, // Phase 2B: 后端ModuleDto无此字段
    // dependencies: [],
    // Phase 2B: 后端ModuleDto无menuConfig字段（已删除）
    // permissionConfig: {
    //   groups: [],              // Phase 2B: 后端ModuleDto无此字段
    //   customActions: []        // Phase 2B: 后端ModuleDto无此字段
    // },
    // Phase 2B: 使用后端SSOT审计字段命名（ISO 8601格式）
    creationTime: new Date().toISOString(),
    lastModificationTime: new Date().toISOString()
  }
}

// ✅ B方案优化：使用metadata-core验证
const performValidation = () => {
  try {
    validationState.isValidating = true

    // 转换为ModuleMetadata
    const metadata = convertToModuleMetadata()

    // 使用safeValidate避免异常
    const result = safeValidateModuleMetadata(metadata)

    if (result.success) {
      validationState.errors = []
      validationState.isValid = true
    } else {
      validationState.errors = result.error.issues?.map((err: any) => ({
        field: err.path?.join?.('.') ?? 'unknown',
        message: err.message ?? '验证失败'
      })) ?? []
      validationState.isValid = false
    }
  } catch (error) {
    console.error('验证异常:', error)
    validationState.errors = [{
      field: 'system',
      message: '系统错误，请刷新重试'
    }]
    validationState.isValid = false
  } finally {
    validationState.isValidating = false
  }
}

// ✅ B方案优化：使用@vueuse/core的防抖函数（自动管理资源）
const debouncedValidate = useDebounceFn(performValidation, 300)

// 🔥 临时禁用：移除所有可能干扰的 watch 监听器
// 问题：多个 watch 互相干扰导致下拉框无法选择
// 解决方案：先让基础功能工作，后续再逐步添加

// ❌ 临时禁用验证 watch
// const watchedFields = computed(() => [
//   selectedTable.value,
//   config.value.systemName,
//   config.value.moduleName,
//   config.value.displayName,
//   config.value.architecturePattern,
//   config.value.databaseProvider,
//   config.value.parentMenuId
// ])

// watch(watchedFields, () => {
//   validationState.isDirty = true
//   debouncedValidate()
// }, { immediate: true })

// ❌ 临时禁用自动选中
// watch(availableTables, (tables) => {
//   if (tables.length > 0 && !selectedTable.value) {
//     ensureDefaultSelectedTable()
//   }
// }, { immediate: true })

// ❌ 临时禁用自动填充
// watch(selectedTable, (tableName) => {
//   if (!tableName) return
//
//   console.log('✅ 表已选择:', tableName)
//
//   const table = availableTables.value.find(t => t.name === tableName)
//   if (table) {
//     if (!config.value.moduleName) {
//       config.value.moduleName = tableName.replace(/^[A-Z]+_/, '').replace(/_/g, '')
//     }
//     if (!config.value.displayName) {
//       config.value.displayName = table.displayName || tableName
//     }
//   }
// })

// ✅ B方案优化：组件销毁时自动清理（防止内存泄漏）
onUnmounted(() => {
  // useDebounceFn会自动处理清理，无需手动调用cancel
})

// 🔒 极简页面持久化（本地缓存）
const PERSIST_KEY = 'ultraSimple:state:v1'
const persistState = () => {
  try {
    const snapshot = {
      selectedTable: selectedTable.value,
      config: config  // 🔥 修复：reactive 对象不需要 .value
    }
    localStorage.setItem(PERSIST_KEY, JSON.stringify(snapshot))
  } catch (e) {
    console.warn('⚠️ 本地缓存失败:', e)
  }
}
const persistStateDebounced = useDebounceFn(persistState, 300)

watch(() => selectedTable.value, () => persistStateDebounced())
watch(() => config, () => persistStateDebounced(), { deep: true })  // 🔥 修复：reactive 对象不需要 .value

// ✅ 简化：确保默认选中第一个表
const ensureDefaultSelectedTable = () => {
  if (selectedTable.value) return
  const first = availableTables.value?.[0]
  const firstTable = first?.name
  if (firstTable) {
    selectedTable.value = firstTable
    console.log('✅ 自动选中第一个表:', firstTable)
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
  // 显式前置校验，缺失则阻止提交
  const missing = getMissingFields()
  if (missing.length > 0) {
    ElMessage({
      message: t('ultraSimple.validation.missingRequired', { fields: missing.join('、') }),
      type: 'error',
      duration: 4000,
      showClose: true
    })
    addLog(t('ultraSimple.logs.validationFailed', { fields: missing.join(', ') }), 'error')
    return
  }

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

    // ✅ B方案优化：复用转换函数，避免重复代码
    const metadata = convertToModuleMetadata()

    addLog(t('ultraSimple.logs.metadataComplete'), 'success')
    generationProgress.value = 25

    addLog(t('ultraSimple.logs.callingService'), 'info')
    const result = await codeGeneratorApi.generateModule(metadata)

    if (!result.success) {
      throw new Error(result.message || t('ultraSimple.messages.error'))
    }

    // 兼容：服务端若返回生成会话，可从结果中的statistics或message中解析；此处改为直接拉取状态由后端生成会话
    const status = await codeGeneratorApi.getGenerationStatus('latest')
    generationSessionId.value = (status && (status.sessionId || status.id)) || ''
    generationProgress.value = 40

    addLog(t('ultraSimple.logs.generatingBackend'), 'info')
    await pollGenerationProgress(generationSessionId.value || 'latest')

    generationProgress.value = 100
    addLog(t('ultraSimple.logs.generationComplete'), 'success')
    if (generationSessionId.value) {
      addLog(t('ultraSimple.messages.viewCode', { sessionId: generationSessionId.value }), 'info')
    }

    if (result.generatedFiles) {
      addLog(t('ultraSimple.logs.filesGenerated', { count: result.generatedFiles.length }), 'success')
    }

    generationComplete.value = true
    ElMessage.success(t('ultraSimple.messages.success'))
  } catch (error) {
    const err: any = error
    const errorMsg = (err?.message as string) || t('ultraSimple.validation.unknownError')

    // 增强：输出后端校验错误明细
    const valErrors = Array.isArray(err?.validationErrors) ? err.validationErrors as Array<{ field: string; message: string }> : []
    if (valErrors.length > 0) {
      const detail = valErrors.map(e => `${e.field || '-'}: ${e.message}`).join('; ')
      addLog(`参数校验失败: ${detail}`, 'error')
      console.error('Backend validation errors:', valErrors)
    }

    // 增强错误处理 - 分类错误类型
    if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      // API端点不存在
      addLog(t('ultraSimple.logs.apiNotFound'), 'error')
      addLog('尝试检查API路径是否正确，后端服务是否启动', 'info')
    } else if (errorMsg.includes('Network') || errorMsg.includes('fetch')) {
      // 网络连接问题
      addLog(t('ultraSimple.logs.networkError'), 'error')
      addLog('请检查网络连接和后端服务状态', 'info')
    } else if (errorMsg.includes('timed out') || errorMsg.includes('timeout')) {
      // 请求超时
      addLog(t('ultraSimple.logs.requestTimeout'), 'error')
      addLog('服务器响应超时，请重试或减小数据量', 'info')
    } else if (errorMsg.includes('session') || errorMsg.includes('Session')) {
      // 会话问题
      addLog(t('ultraSimple.logs.sessionError'), 'error')
      addLog('会话无效或已过期，请刷新页面重试', 'info')
    } else {
      // 其他错误
      addLog(t('ultraSimple.logs.generationFailed', { error: errorMsg }), 'error')
    }

    // 记录完整错误信息和堆栈，便于调试
    console.error('Code generation error:', error)

    // 用户友好提示
    ElMessage({
      message: t('ultraSimple.messages.error'),
      type: 'error',
      duration: 5000,
      showClose: true
    })
    // 重置状态以便重试
    generationComplete.value = false
  } finally {
    generating.value = false
  }
}

const pollGenerationProgress = async (sessionId: string) => {
  const maxAttempts = 60
  let attempts = 0
  let backoffDelay = 1000 // 初始延迟1秒

  while (attempts < maxAttempts) {
    try {
      // 获取生成状态
      const progress = await codeGeneratorApi.getGenerationStatus(sessionId)

      // 有进度更新，重置退避延迟
      if (progress.percentage > generationProgress.value) {
        backoffDelay = 1000 // 重置为初始值
        generationProgress.value = Math.min(progress.percentage, 95)

        // 添加进度日志
        if (progress.currentStep) {
          addLog(`📊 ${progress.currentStep}`, 'info')
        }
      }

      // 处理不同状态
      if (progress.status === 'completed') {
        addLog('✅ 代码生成已完成', 'success')
        return
      } else if (progress.status === 'error') {
        throw new Error(progress.error || t('ultraSimple.validation.generationError'))
      } else if (progress.status === 'processing') {
        // 处理中
        addLog(`⏳ 生成中: ${progress.percentage}%`, 'info')
      }

      // 指数退避策略：每次重试延迟增加，但不超过10秒
      await sleep(backoffDelay)
      backoffDelay = Math.min(backoffDelay * 1.5, 10000)
      attempts++
    } catch (error) {
      const errorMsg = (error as Error).message || 'Unknown error'
      addLog(`⚠️ 轮询状态错误: ${errorMsg}`, 'warning')
      console.warn('Status polling error:', error)

      // 指数退避策略，但错误情况下增长更快
      await sleep(backoffDelay)
      backoffDelay = Math.min(backoffDelay * 2, 10000)
      attempts++

      // 到达一定尝试次数后如果还有错误，提供建议
      if (attempts >= 5 && attempts % 5 === 0) {
        addLog('💡 提示: 如果长时间无响应，请检查网络连接或后端服务状态', 'info')
      }
    }
  }

  // 超过最大尝试次数
  addLog(t('ultraSimple.logs.queryTimeout'), 'warning')
  addLog('生成可能仍在继续，请稍后查看结果', 'info')
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

    // 添加下载进度指示
    const downloadStartTime = Date.now()
    generationProgress.value = 75

    // 发起导出请求
    const blob = await codeGeneratorApi.exportGeneratedCode(generationSessionId.value)

    // 检查返回的是否是有效的Blob
    if (!(blob instanceof Blob)) {
      throw new Error('服务器未返回有效的ZIP文件')
    }

    // 检查blob大小
    if (blob.size < 100) { // 小于100字节可能是错误
      const text = await new Response(blob).text()
      try {
        const errorJson = JSON.parse(text)
        throw new Error(errorJson.message || '导出失败，服务器返回错误')
      } catch (jsonError) {
        // 如果不是JSON错误，则可能是真的小文件
        if (blob.size === 0) {
          throw new Error('导出失败，服务器返回空文件')
        }
      }
    }

    // 计算下载耗时
    const downloadDuration = Date.now() - downloadStartTime

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.moduleName}_${Date.now()}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // 延迟释放URL对象，以确保下载开始
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 1000)

    generationProgress.value = 100
    addLog(`✅ 下载完成 (${(blob.size / 1024).toFixed(1)} KB, ${downloadDuration}ms)`, 'success')
    ElMessage.success(t('ultraSimple.messages.downloadSuccess'))
  } catch (error) {
    const errorMsg = (error as Error).message || '未知错误'

    // 错误分类处理
    if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      addLog('⚠️ 导出API不存在，请检查API路径', 'error')
    } else if (errorMsg.includes('Network') || errorMsg.includes('fetch')) {
      addLog('⚠️ 网络错误，请检查网络连接', 'error')
    } else if (errorMsg.includes('session') || errorMsg.includes('Session')) {
      addLog('⚠️ 会话错误，会话可能已过期', 'error')
    } else {
      addLog(`⚠️ ${t('ultraSimple.logs.downloadFailed')}: ${errorMsg}`, 'error')
    }

    console.error('Download error:', error)
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
  // 🔥 修复：reactive 对象不能直接赋值，需要逐个属性赋值
  config.systemName = ''
  config.moduleName = ''
  config.displayName = ''
  config.architecturePattern = 'Crud'
  config.databaseProvider = 'SqlServer'
  config.parentMenuId = 'business'
  config.menuIcon = 'database'
  clearPersist()
}

// 初始化
onMounted(async () => {
  // 恢复本地缓存
  try {
    const raw = localStorage.getItem(PERSIST_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      if (saved && typeof saved === 'object') {
        if (typeof saved.selectedTable === 'string') {
          selectedTable.value = saved.selectedTable
        }
        if (saved.config && typeof saved.config === 'object') {
          // 仅合并已知字段，避免污染
          config.systemName = saved.config.systemName ?? config.systemName
          config.moduleName = saved.config.moduleName ?? config.moduleName
          config.displayName = saved.config.displayName ?? config.displayName
          config.architecturePattern = saved.config.architecturePattern ?? config.architecturePattern
          config.databaseProvider = saved.config.databaseProvider ?? config.databaseProvider
          config.parentMenuId = saved.config.parentMenuId ?? config.parentMenuId
          config.menuIcon = saved.config.menuIcon ?? config.menuIcon
        }
      }
    }
  } catch (e) {
    console.warn('⚠️ 恢复本地缓存失败:', e)
  }

  let connectionTest: any = null

  try {
    loadingTables.value = true
    addLog(t('ultraSimple.logs.connectingDatabase'), 'info')

    connectionTest = await codeGeneratorApi.testDatabaseConnection({
      provider: 'SqlServer',
      connectionString: 'Default'
    })

    if (connectionTest.success) {
      addLog(t('ultraSimple.logs.databaseConnected', { dbName: connectionTest.databaseName }), 'success')
      addLog(t('ultraSimple.logs.tablesFound', { count: connectionTest.tableCount || 0 }), 'info')

      // 🔥 优先级1：检查 connectionTest 是否直接包含表名列表
      if (connectionTest.tables && Array.isArray(connectionTest.tables) && connectionTest.tables.length > 0) {
        // ✅ 最佳方案：直接使用 connectionTest 返回的表名列表
        availableTables.value = connectionTest.tables.map((tableName: string) => ({
          name: tableName,
          displayName: tableName,
          columnCount: 0,
          schema: null
        }))
        ensureDefaultSelectedTable()
        addLog(`✅ 成功加载 ${availableTables.value.length} 个真实表名`, 'success')
        console.log('✅ 数据库表加载成功（真实表名）:', availableTables.value)
      } else {
        // 🔥 优先级2：尝试获取完整的表架构
        try {
          const schema = await codeGeneratorApi.introspectDatabase({
            connectionStringName: 'Default',
            provider: 'SqlServer'
          })

          if (schema.tables && schema.tables.length > 0) {
            // ✅ 成功获取完整架构
            availableTables.value = schema.tables.map((table: TableSchema) => ({
              name: table.name,
              displayName: table.displayName || table.name,
              columnCount: (table.columns && Array.isArray(table.columns)) ? table.columns.length : 0,
              schema: table
            }))
            ensureDefaultSelectedTable()
            addLog(t('ultraSimple.logs.tablesLoaded', { count: schema.tables.length }), 'success')
            console.log('✅ 数据库表加载成功（完整架构）:', availableTables.value.length, '个表')
          } else {
            throw new Error('schema.tables 为空')
          }
        } catch (schemaError) {
          // 🔥 优先级3（最后降级）：使用表占位符
          console.warn('⚠️ introspectDatabase 失败，使用最终降级方案:', schemaError)
          addLog('⚠️ 无法获取详细表架构，使用表占位符', 'warning')

          if (connectionTest.tableCount && connectionTest.tableCount > 0) {
            availableTables.value = Array.from({ length: connectionTest.tableCount }, (_, i) => ({
              name: `Table${i + 1}`,
              displayName: `表${i + 1}`,
              columnCount: 0,
              schema: undefined
            }))
            ensureDefaultSelectedTable()
            addLog(`⚠️ 已生成 ${availableTables.value.length} 个表占位符（最终降级）`, 'warning')
            addLog('❌ 无法获取真实表名，请检查后端API配置', 'error')
            console.log('⚠️ 降级到表占位符:', availableTables.value.length, '个表')
          } else {
            throw schemaError
          }
        }
      }
    } else {
      addLog(t('ultraSimple.logs.databaseFailedMock'), 'warning')
    }
  } catch (error) {
    console.error('❌ 数据库连接完全失败:', error)
    addLog(t('ultraSimple.logs.usingMockData'), 'warning')

    // 🔥 最终降级：优先尝试使用 connectionTest 中的表名
    if (connectionTest?.tables && Array.isArray(connectionTest.tables) && connectionTest.tables.length > 0) {
      // 最佳：使用真实表名
      availableTables.value = connectionTest.tables.map((tableName: string) => ({
        name: tableName,
        displayName: tableName,
        columnCount: 0,
        schema: undefined
      }))
      addLog(`✅ 使用真实表名列表（${availableTables.value.length}个）`, 'success')
      console.log('✅ 最终降级成功，使用真实表名:', availableTables.value.length, '个表')
    } else if (connectionTest?.tableCount && connectionTest.tableCount > 0) {
      // 次选：使用表占位符
      availableTables.value = Array.from({ length: connectionTest.tableCount }, (_, i) => ({
        name: `Table${i + 1}`,
        displayName: `表${i + 1}`,
        columnCount: 0,
        schema: undefined
      }))
      addLog(`⚠️ 使用基础表占位符（${availableTables.value.length}个）`, 'warning')
      console.log('⚠️ 最终降级，生成了', availableTables.value.length, '个表占位符')
    }
  } finally {
    loadingTables.value = false

    // 🔥 最终检查
    if (availableTables.value.length === 0) {
      addLog('❌ 未能加载数据库表列表，请检查数据库连接或联系管理员', 'error')
      ElMessage.error('未能加载数据库表列表，请检查数据库连接')
      console.error('❌ availableTables 最终为空，connectionTest:', connectionTest)
    } else {
      console.log('✅ 最终成功加载:', availableTables.value.length, '个表')
      console.log('📋 表列表:', availableTables.value.map(t => t.name).slice(0, 5))
      console.log('🔍 selectedTable 当前值:', selectedTable.value)
      console.log('🔍 config.systemName 当前值:', config.systemName)
    }
  }
})

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const clearPersist = () => {
  try { localStorage.removeItem(PERSIST_KEY) } catch { }
}

const iconPickerVisible = ref(false)
const iconSearch = ref('')
const epIconNames = computed(() => Object.keys(EpIcons).filter(n => n.toLowerCase().includes(iconSearch.value.toLowerCase())))
const selectMenuIcon = (name: string) => {
  config.menuIcon = name
  iconPickerVisible.value = false
}
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

  // ✅ B方案优化：验证错误样式
  .validation-errors {
    margin-top: var(--spacing-xl);
    border-radius: var(--radius-base);

    .error-list {
      margin: 0;
      padding-left: var(--spacing-lg);

      li {
        margin: var(--spacing-sm) 0;
        font-size: var(--font-size-sm);

        strong {
          color: var(--color-danger);
          margin-right: var(--spacing-xs);
        }
      }
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

  // 修复：在可搜索(el-select filterable)模式下，确保已选文本可见
  :deep(.el-select) {

    .el-select__selected-item,
    .el-select__selection,
    .el-select__wrapper,
    .el-select__input {
      color: var(--color-text-primary, var(--el-text-color-regular)) !important;
    }

    // 兼容新旧样式类名
    .el-select__selected-item .el-select__selected-item-text {
      color: var(--color-text-primary, var(--el-text-color-regular)) !important;
    }

    // 关键：filterable模式使用输入框渲染选中值
    .el-input__inner {
      color: var(--color-text-primary, var(--el-text-color-regular)) !important;
      -webkit-text-fill-color: var(--color-text-primary, var(--el-text-color-regular)) !important;
      caret-color: var(--color-text-primary, var(--el-text-color-regular)) !important;
    }

    .el-select__placeholder,
    .el-input__inner::placeholder {
      color: var(--color-text-secondary, #909399) !important;
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

.icon-picker {
  .icon-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
    margin-top: 12px;
    max-height: 360px;
    overflow: auto;
  }

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: 1px solid var(--color-border-primary);
    border-radius: 8px;
    cursor: pointer;
    transition: all .15s ease;
    font-size: 12px;

    :deep(.el-icon) {
      font-size: 18px;
      margin-bottom: 4px;
    }

    &:hover {
      box-shadow: var(--shadow-sm);
      transform: translateY(-1px);
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
