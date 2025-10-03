<!--
  🍎 UltraSimpleStudio - 苹果风格极简代码生成器
  设计哲学：一个页面完成所有操作，3-5分钟生成企业级代码
  核心原则：所见即所得，无分步向导，直觉操作
-->
<template>
  <div class="ultra-simple-studio">
    <!-- 🍎 苹果风格头部区域 -->
    <div class="studio-header">
      <div class="title-section">
        <div class="title-icon">
          🚀
        </div>
        <div class="title-content">
          <h1 class="main-title">
            {{ t('ultraSimple.title') }}
          </h1>
          <p class="subtitle">
            {{ t('ultraSimple.subtitle') }}
          </p>
        </div>
      </div>

      <!-- 🔧 工具栏 -->
      <div class="toolbar">
        <!-- 语言切换器 -->
        <el-dropdown
          class="language-switcher"
          @command="handleLanguageChange"
        >
          <el-button
            text
            class="toolbar-btn"
          >
            <el-icon>🌍</el-icon>
            {{ currentLanguage }}
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh-CN">
                🇨🇳 中文
              </el-dropdown-item>
              <el-dropdown-item command="en-US">
                🇺🇸 English
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 主题切换器 -->
        <el-dropdown
          class="theme-switcher"
          @command="handleThemeChange"
        >
          <el-button
            text
            class="toolbar-btn"
          >
            <el-icon><Moon v-if="isDarkMode" /><Sunny v-else /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="light">
                ☀️ {{ t('theme.light') }}
              </el-dropdown-item>
              <el-dropdown-item command="dark">
                🌙 {{ t('theme.dark') }}
              </el-dropdown-item>
              <el-dropdown-item command="tech-blue">
                💙 {{ t('theme.techBlue') }}
              </el-dropdown-item>
              <el-dropdown-item command="auto">
                🔄 {{ t('theme.auto') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主内容卡片 -->
    <div class="studio-card">
      <!-- 表单区域 - 8个必填字段 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="config-form"
        @submit.prevent="handleGenerate"
      >
        <!-- 第1项：选择数据库表 -->
        <el-form-item
          :label="t('ultraSimple.form.table')"
          prop="tableName"
          class="form-item"
        >
          <el-select
            v-model="formData.tableName"
            :placeholder="t('ultraSimple.form.tablePlaceholder')"
            filterable
            size="large"
            class="form-control"
            @change="handleTableChange"
          >
            <el-option
              v-for="table in availableTables"
              :key="table.name"
              :label="table.displayName"
              :value="table.name"
            >
              <span class="table-option">
                <i class="icon-database" />
                {{ table.displayName }}
                <span class="table-name">({{ table.name }})</span>
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 第2项：系统名称 -->
        <el-form-item
          :label="t('ultraSimple.form.systemName')"
          prop="systemName"
          class="form-item"
        >
          <el-input
            v-model="formData.systemName"
            :placeholder="t('ultraSimple.form.systemNamePlaceholder')"
            size="large"
            class="form-control"
            @input="handleInputChange"
          />
          <span class="form-hint">{{ t('ultraSimple.hints.systemName') }}</span>
        </el-form-item>

        <!-- 第3项：模块名称 -->
        <el-form-item
          :label="t('ultraSimple.form.moduleName')"
          prop="moduleName"
          class="form-item"
        >
          <el-input
            v-model="formData.moduleName"
            :placeholder="t('ultraSimple.form.moduleNamePlaceholder')"
            size="large"
            class="form-control"
            @input="handleInputChange"
          />
          <span class="form-hint">{{ t('ultraSimple.hints.moduleName') }}</span>
        </el-form-item>

        <!-- 第4项：显示名称 -->
        <el-form-item
          :label="t('ultraSimple.form.displayName')"
          prop="displayName"
          class="form-item"
        >
          <el-input
            v-model="formData.displayName"
            :placeholder="t('ultraSimple.form.displayNamePlaceholder')"
            size="large"
            class="form-control"
          />
          <span class="form-hint">{{ t('ultraSimple.hints.displayName') }}</span>
        </el-form-item>

        <!-- 第5项：架构模式 -->
        <el-form-item
          :label="t('ultraSimple.form.architecture')"
          prop="architecture"
          class="form-item"
        >
          <el-select
            v-model="formData.architecture"
            :placeholder="t('ultraSimple.form.architecturePlaceholder')"
            size="large"
            class="form-control"
          >
            <el-option
              label="CRUD"
              value="Crud"
            >
              <span>CRUD - {{ t('ultraSimple.architectureTypes.crud') }}</span>
            </el-option>
            <el-option
              label="DDD"
              value="DDD"
            >
              <span>DDD - {{ t('ultraSimple.architectureTypes.ddd') }}</span>
            </el-option>
            <el-option
              label="CQRS"
              value="CQRS"
            >
              <span>CQRS - {{ t('ultraSimple.architectureTypes.cqrs') }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 第6项：数据库类型 -->
        <el-form-item
          :label="t('ultraSimple.form.database')"
          prop="databaseType"
          class="form-item"
        >
          <el-select
            v-model="formData.databaseType"
            :placeholder="t('ultraSimple.form.databasePlaceholder')"
            size="large"
            class="form-control"
          >
            <el-option
              label="LocalDB"
              value="LocalDb"
            />
            <el-option
              label="SQLite"
              value="Sqlite"
            />
            <el-option
              label="SQL Server"
              value="SqlServer"
            />
            <el-option
              label="PostgreSQL"
              value="PostgreSQL"
            />
            <el-option
              label="MySQL"
              value="MySql"
            />
          </el-select>
        </el-form-item>

        <!-- 第7项：上级菜单 -->
        <el-form-item
          :label="t('ultraSimple.form.parentMenu')"
          prop="parentMenu"
          class="form-item"
        >
          <el-input
            v-model="formData.parentMenu"
            :placeholder="t('ultraSimple.form.parentMenuPlaceholder')"
            size="large"
            class="form-control"
          />
          <span class="form-hint">{{ t('ultraSimple.hints.parentMenu') }}</span>
        </el-form-item>

        <!-- 第8项：菜单图标 -->
        <el-form-item
          :label="t('ultraSimple.form.menuIcon')"
          prop="menuIcon"
          class="form-item"
        >
          <el-input
            v-model="formData.menuIcon"
            :placeholder="t('ultraSimple.form.menuIconPlaceholder')"
            size="large"
            class="form-control"
          />
          <span class="form-hint">{{ t('ultraSimple.hints.menuIcon') }}</span>
        </el-form-item>

        <!-- 自动推导信息展示 -->
        <div class="derived-info">
          <h3 class="derived-title">
            <i class="icon-magic" />
            {{ t('ultraSimple.derived.title') }}
          </h3>
          <div class="derived-items">
            <div class="derived-item">
              <span class="label">{{ t('ultraSimple.derived.namespace') }}:</span>
              <code class="value">{{ derivedNamespace }}</code>
            </div>
            <div class="derived-item">
              <span class="label">{{ t('ultraSimple.derived.route') }}:</span>
              <code class="value">{{ derivedRoutePrefix }}</code>
            </div>
            <div class="derived-item">
              <span class="label">{{ t('ultraSimple.derived.api') }}:</span>
              <code class="value">{{ derivedApiEndpoint }}</code>
            </div>
          </div>
        </div>
      </el-form>

      <!-- 底部操作区 -->
      <div class="actions">
        <!-- 生成按钮 -->
        <el-button
          :type="generateBtnType"
          size="large"
          :loading="generating"
          :disabled="!isFormValid"
          :class="['generate-btn', generateBtnClass]"
          @click="handleGenerate"
        >
          <i :class="generateBtnIcon" />
          {{ generateBtnText }}
        </el-button>

        <!-- 重置按钮 -->
        <el-button
          v-if="generationComplete"
          size="large"
          class="reset-btn"
          @click="handleReset"
        >
          <i class="icon-refresh" />
          {{ t('ultraSimple.actions.generateAnother') }}
        </el-button>
      </div>

      <!-- 生成进度显示 -->
      <div
        v-if="generating || generationComplete"
        class="progress-section"
      >
        <el-progress
          :percentage="progress"
          :status="progressStatus"
          :color="progressColor"
          :stroke-width="12"
          class="modern-progress"
        />

        <!-- 生成日志 -->
        <div class="generation-logs">
          <div
            v-for="log in generationLogs"
            :key="log.id"
            :class="['log-item', log.type]"
          >
            <span class="log-icon">{{ getLogIcon(log.type) }}</span>
            <span class="log-message">{{ log.message }}</span>
            <span class="log-timestamp">{{ formatTime(log.timestamp) }}</span>
          </div>
        </div>

        <!-- 完成后的操作按钮 / 报告信息 -->
        <div
          v-if="generationComplete"
          class="completion-actions"
        >
          <el-button
            type="success"
            size="large"
            @click="viewGeneratedCode"
          >
            <i class="icon-eye" />
            {{ t('ultraSimple.actions.viewCode') }}
          </el-button>
          <el-button
            type="primary"
            size="large"
            @click="downloadCode"
          >
            <i class="icon-download" />
            {{ t('ultraSimple.actions.downloadZip') }}
          </el-button>
          <el-button
            size="large"
            @click="showReport = true"
          >
            📄 查看生成报告
          </el-button>
        </div>
      </div>

      <!-- 生成报告对话框 -->
      <el-dialog
        v-model="showReport"
        title="生成报告"
        width="720px"
      >
        <pre class="report-block">{{ generationReport }}</pre>
        <div class="report-tips">
          <div>迁移脚本目录（Script模式）：</div>
          <code>artifacts/migrations/{{ formData.systemName }}/{{ formData.moduleName }}</code>
        </div>
        <template #footer>
          <el-button @click="showReport = false">
            关闭
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'
import type { ModuleMetadata } from '@smartabp/lowcode-api'
import { codeGeneratorApi } from '@smartabp/lowcode-api'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

// 本地类型定义 - 修复API不匹配问题
interface TableSchema {
  name: string
  displayName?: string
  columns: Array<{
    name: string
    dataType: string
    isNullable: boolean
    maxLength?: number
    isPrimaryKey: boolean
  }>
  primaryKeys: string[]
  foreignKeys: Array<{
    column: string
    referencedSchema: string
    referencedTable: string
    referencedColumn: string
  }>
}

// 类型已从lowcode-api导入，不需要重复定义
import { setLocale } from '@/plugins/i18n'
import { useMenuStore } from '@/stores'
import { useThemeStore } from '@/stores/modules/theme'
import { useRouter } from 'vue-router'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 组合函数
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const { t, locale } = useI18n()
const themeStore = useThemeStore()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 响应式状态
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const formRef = ref<FormInstance>()
const availableTables = ref<TableSchema[]>([])
const formData = ref({
  tableName: '',
  systemName: '',
  moduleName: '',
  displayName: '',
  architecture: 'Crud',
  databaseType: 'LocalDb',
  parentMenu: '',
  menuIcon: 'database'
})

const generating = ref(false)
const generationComplete = ref(false)
const progress = ref(0)
const generationLogs = ref<Array<{ type: string, message: string, timestamp: number, id: string }>>([])
const sessionId = ref('')
const menuStore = useMenuStore()
const router = useRouter()
const showReport = ref(false)
const generationReport = ref('')

// 🎯 进度条颜色动态计算
const progressColor = computed(() => {
  if (generationComplete.value) return '#67c23a' // 绿色 - 完成
  if (generating.value) {
    // 根据进度动态渐变：蓝色 → 橙色 → 绿色
    const p = progress.value
    if (p < 30) return '#409eff' // 蓝色 - 开始
    if (p < 70) return '#e6a23c' // 橙色 - 进行中
    return '#67c23a' // 绿色 - 即将完成
  }
  return '#409eff' // 默认蓝色
})

// 🎯 进度条状态
const progressStatus = computed(() => {
  if (generationComplete.value) return 'success'
  if (generating.value && progress.value > 0) return undefined
  return undefined
})

// 生成按钮三态（蓝/红/绿）
const generateBtnType = computed<'primary' | 'danger' | 'success'>(() => {
  if (generating.value) return 'danger'
  if (generationComplete.value) return 'success'
  return 'primary'
})

const generateBtnClass = computed(() => {
  if (generating.value) return 'btn-red'
  if (generationComplete.value) return 'btn-green'
  return 'btn-blue'
})

// 🎯 按钮图标动态计算
const generateBtnIcon = computed(() => {
  if (generating.value) return 'icon-loading spinning'
  if (generationComplete.value) return 'icon-check'
  return 'icon-rocket'
})

// 🎯 按钮文本动态计算
const generateBtnText = computed(() => {
  if (generating.value) return t('ultraSimple.actions.generating')
  if (generationComplete.value) return t('ultraSimple.actions.completed')
  return t('ultraSimple.actions.generate')
})

// 🌍 国际化相关
const currentLanguage = computed(() => {
  return locale.value === 'zh-CN' ? '中文' : 'English'
})

// 🌓 主题相关
const isDarkMode = computed(() => {
  return themeStore.isDarkMode
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 表单验证规则
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const rules: FormRules = {
  tableName: [{ required: true, message: t('ultraSimple.validation.tableRequired'), trigger: 'change' }],
  systemName: [{ required: true, message: t('ultraSimple.validation.systemNameRequired'), trigger: 'blur' }],
  moduleName: [{ required: true, message: t('ultraSimple.validation.moduleNameRequired'), trigger: 'blur' }],
  displayName: [{ required: true, message: t('ultraSimple.validation.displayNameRequired'), trigger: 'blur' }],
  architecture: [{ required: true, message: t('ultraSimple.validation.architectureRequired'), trigger: 'change' }],
  databaseType: [{ required: true, message: t('ultraSimple.validation.databaseRequired'), trigger: 'change' }]
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 计算属性 - 自动推导
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const derivedNamespace = computed(() => {
  if (!formData.value.systemName || !formData.value.moduleName) return '-'
  return `${formData.value.systemName}.${formData.value.moduleName}`
})

const derivedRoutePrefix = computed(() => {
  if (!formData.value.systemName || !formData.value.moduleName) return '-'
  return `/${formData.value.systemName.toLowerCase()}/${formData.value.moduleName.toLowerCase()}`
})

const derivedApiEndpoint = computed(() => {
  if (!formData.value.moduleName) return '-'
  return `/api/app/${formData.value.moduleName.toLowerCase()}`
})

const isFormValid = computed(() => {
  return formData.value.tableName &&
         formData.value.systemName &&
         formData.value.moduleName &&
         formData.value.displayName &&
         formData.value.architecture &&
         formData.value.databaseType
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 生命周期
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
onMounted(async () => {
  await loadDatabaseTables()
})

onBeforeUnmount(() => {
  if (progressTimer !== null) {
    clearInterval(progressTimer)
    progressTimer = null
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 方法
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 加载数据库表
 */
async function loadDatabaseTables(): Promise<void> {
  try {
    addLog('info', t('ultraSimple.logs.loadingTables'))
    const dbSchema = await codeGeneratorApi.introspectDatabase({
      provider: mapProvider(formData.value.databaseType),
      connectionStringName: 'Default'
    })

    // 转换DatabaseSchema到TableSchema数组
    availableTables.value = (dbSchema as any)?.tables || []
    addLog('success', t('ultraSimple.logs.tablesLoaded', { count: availableTables.value.length }))
  } catch (error) {
    console.warn('⚠️ Failed to load database tables, using mock data:', error)
    // 降级到模拟数据
    availableTables.value = [
      { name: 'Users', displayName: 'Users Table', columns: [], primaryKeys: [], foreignKeys: [] },
      { name: 'Projects', displayName: 'Projects Table', columns: [], primaryKeys: [], foreignKeys: [] },
      { name: 'Orders', displayName: 'Orders Table', columns: [], primaryKeys: [], foreignKeys: [] }
    ]
    addLog('warning', t('ultraSimple.logs.usingMockData'))
  }
}

/**
 * 表选择变化
 */
function handleTableChange(tableName: string): void {
  if (!tableName) return

  // 自动推导模块名和显示名
  formData.value.moduleName = tableName.replace(/s$/, '') // 移除复数s
  formData.value.displayName = `${formData.value.moduleName} Management`
}

/**
 * 输入变化
 */
function handleInputChange(): void {
  // 可以添加实时验证逻辑
}

/**
 * 生成代码
 */
async function handleGenerate(): Promise<void> {
  if (!formRef.value) return

  // 验证表单
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) {
    ElMessage.warning(t('ultraSimple.messages.fillRequired'))
    return
}

  generating.value = true
  generationComplete.value = false
  smoothTo(0)
  generationLogs.value = []

  try {
    addLog('info', t('ultraSimple.logs.starting'))
    smoothTo(10)

    // 构建元数据（严格遵循 lowcode-api ModuleMetadata）
    const metadata: ModuleMetadata = {
      systemName: formData.value.systemName,
      name: formData.value.moduleName,
      displayName: formData.value.displayName,
      namespace: derivedNamespace.value,
      architecturePattern: formData.value.architecture as 'Crud' | 'DDD' | 'CQRS',
      databaseInfo: {
        provider: mapProvider(formData.value.databaseType),
        connectionStringName: 'Default',
        tableName: formData.value.tableName
      },
      frontend: {
        routePrefix: derivedRoutePrefix.value,
        framework: 'Vue3TS',
        icon: formData.value.menuIcon
      },
      backend: {
        generateEntity: true,
        generateAppService: true,
        generateController: true,
        generateDto: true,
        authorization: {
          enabled: true,
          policyPrefix: formData.value.systemName
        }
      },
      icon: formData.value.menuIcon
    }

    // 可选：生成前验证
    try {
      const validation = await codeGeneratorApi.validateModule(metadata)
      if (!validation.isValid && validation.errors?.length) {
        validation.errors.forEach(e => addLog('warning', `${e.field}: ${e.message}`))
      }
    } catch {}

    addLog('info', t('ultraSimple.logs.generatingBackend'))
    smoothTo(30)

    // 调用生成API
    const result = await codeGeneratorApi.generateModule(metadata)
    sessionId.value = (result as any)?.sessionId || ''
    generationReport.value = (result as any)?.generationReport || ''

    addLog('success', t('ultraSimple.logs.backendCompleted'))
    smoothTo(60)

    addLog('info', t('ultraSimple.logs.generatingFrontend'))
    smoothTo(80)

    // 轮询进度（如果有sessionId）
    if (sessionId.value) {
      await pollProgress()
    }

    addLog('success', t('ultraSimple.logs.completed'))
    smoothTo(100)
    generationComplete.value = true

    // 注册模块元数据（幂等）
    try {
      await codeGeneratorApi.registerModule(metadata)
    } catch (e) {
      addLog('warning', `元数据注册失败: ${(e as Error).message}`)
    }

    // 刷新主菜单以立即可见生成的标准化页面
    try {
      await menuStore.initializeMenu()
    } catch {}
    // 可插拔回调：允许宿主在生成完成后做导航或菜单注册增强
    triggerHook('afterGeneration', { metadata, result })

    // 优先使用后端建议的路由
    const jumpPath = (result as any)?.suggestedRoutePath || metadata.frontend?.routePrefix
    if (jumpPath) {
      try {
        // 等待菜单ready，减少偶发404
        await new Promise(resolve => setTimeout(resolve, 200))
        await router.push(jumpPath)
      } catch {}
    }

    ElMessage.success(t('ultraSimple.messages.success'))
  } catch (error) {
    addLog('error', t('ultraSimple.logs.failed', { error: (error as Error).message }))
    ElMessage.error(t('ultraSimple.messages.error'))
    generating.value = false
  }
}

/**
 * 轮询生成进度
 */
async function pollProgress(): Promise<void> {
  const maxAttempts = 60
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const status = await codeGeneratorApi.getGenerationStatus(sessionId.value)

      if (status.status === 'completed') {
    return
  }

      // 与后端进度对齐并平滑过渡
      if (typeof status.percentage === 'number') {
        smoothTo(Math.max(progress.value, status.percentage))
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
    } catch (error) {
      console.error('Failed to poll progress:', error)
      break
    }
  }
}

/**
 * 查看生成的代码
 */
function viewGeneratedCode(): void {
  ElMessage.info(t('ultraSimple.messages.viewCode', { sessionId: sessionId.value }))
}

/**
 * 下载代码ZIP
 */
async function downloadCode(): Promise<void> {
  try {
    const blob = await codeGeneratorApi.exportGeneratedCode(sessionId.value)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${formData.value.moduleName}_${Date.now()}.zip`
    link.click()
    URL.revokeObjectURL(url)

    ElMessage.success(t('ultraSimple.messages.downloadSuccess'))
  } catch (error) {
    ElMessage.error(t('ultraSimple.messages.downloadError'))
  }
}

/**
 * 重置表单
 */
function handleReset(): void {
  formRef.value?.resetFields()
  generating.value = false
  generationComplete.value = false
  progress.value = 0
  generationLogs.value = []
  sessionId.value = ''
}

/**
 * 添加日志 - 增强版
 */
function addLog(type: string, message: string): void {
  const logEntry = {
    type,
    message,
    timestamp: Date.now(),
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  generationLogs.value.push(logEntry)

  // 🎯 自动滚动到最新日志
  nextTick(() => {
    const logsContainer = document.querySelector('.generation-logs')
    if (logsContainer) {
      logsContainer.scrollTop = logsContainer.scrollHeight
    }
  })
}

/**
 * 🌍 处理语言切换
 */
function handleLanguageChange(lang: string): void {
  setLocale(lang as 'zh-CN' | 'en-US')
  ElMessage.success(t('ultraSimple.messages.languageChanged'))
}

/**
 * 🌓 处理主题切换
 */
function handleThemeChange(theme: string): void {
  themeStore.setTheme(theme as any)
  ElMessage.success(t('ultraSimple.messages.themeChanged'))
}

/**
 * 获取日志图标
 */
function getLogIcon(type: string): string {
  const icons: Record<string, string> = {
    info: '🚀',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }
  return icons[type] || '📝'
}

/**
 * 格式化时间戳
 */
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString()
}

// provider映射（UI选择 → 后端契约）
function mapProvider(value: string): 'SqlServer' | 'PostgreSql' | 'MySql' | 'SQLite' {
  switch (value) {
    case 'LocalDb':
    case 'SqlServer':
      return 'SqlServer'
    case 'PostgreSQL':
    case 'PostgreSql':
      return 'PostgreSql'
    case 'Sqlite':
    case 'SQLite':
      return 'SQLite'
    case 'MySql':
      return 'MySql'
    default:
      return 'SqlServer'
  }
}

// 进度平滑动画
let progressTimer: number | null = null
function smoothTo(target: number): void {
  const clamped = Math.max(0, Math.min(100, target))
  if (progressTimer !== null) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  const step = () => {
    if (progress.value === clamped) {
      if (progressTimer !== null) {
        clearInterval(progressTimer)
        progressTimer = null
      }
      return
    }
    const delta = clamped - progress.value
    const inc = Math.sign(delta) * Math.max(1, Math.floor(Math.abs(delta) / 8))
    progress.value = progress.value + inc
    if ((inc > 0 && progress.value > clamped) || (inc < 0 && progress.value < clamped)) {
      progress.value = clamped
    }
  }
  progressTimer = window.setInterval(step, 30)
}

// 可插拔扩展钩子（不破坏现有架构）
function triggerHook(name: string, payload: unknown): void {
  const hooks = (window as unknown as { SmartAbpHooks?: Record<string, (p: unknown) => void> }).SmartAbpHooks
  if (hooks && typeof hooks[name] === 'function') {
    try {
      hooks[name](payload)
    } catch {
      // 忽略第三方钩子抛出的错误，避免影响主流程
    }
  }
}
</script>

<style scoped lang="scss">
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 主题令牌系统集成
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
.ultra-simple-studio {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-6);
  // 🌈 渐变背景，营造空间感
  background: linear-gradient(135deg,
    var(--color-background-base) 0%,
    var(--color-background-soft) 100%
  );
  min-height: calc(100vh - 200px);

  // 🎨 页面加载动画
  animation: fadeSlideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 头部区域
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  .studio-header {
    text-align: center;
    margin-bottom: var(--spacing-8);

    .studio-title {
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-3);

      .icon {
        display: inline-block;
        margin-right: var(--spacing-2);
      }
    }

    .studio-subtitle {
      font-size: var(--font-size-lg);
      color: var(--color-text-secondary);
      margin: 0;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 主卡片
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  .studio-card {
    background: var(--color-background-secondary);
    border-radius: var(--border-radius-2xl);
    padding: var(--spacing-8);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border-light);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 表单样式
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    .config-form {
      .form-item {
        margin-bottom: var(--spacing-6);

        .form-control {
          width: 100%;
        }

        .form-hint {
          display: block;
          margin-top: var(--spacing-1);
          font-size: var(--font-size-sm);
          color: var(--color-text-tertiary);
        }

        .table-option {
  display: flex;
  align-items: center;
          gap: var(--spacing-2);

          .icon-database {
            color: var(--color-primary-500);
          }

          .table-name {
            color: var(--color-text-tertiary);
            font-size: var(--font-size-sm);
          }
        }
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 自动推导信息
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    .derived-info {
      background: var(--color-primary-50);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-5);
      margin-top: var(--spacing-6);
      border-left: 4px solid var(--color-primary-500);

      .derived-title {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-primary-700);
        margin: 0 0 var(--spacing-4) 0;
  display: flex;
  align-items: center;
        gap: var(--spacing-2);

        .icon-magic {
          font-size: var(--font-size-xl);
        }
      }

      .derived-items {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--spacing-3);

        .derived-item {
  display: flex;
  align-items: center;
          gap: var(--spacing-2);

          .label {
            font-weight: var(--font-weight-medium);
            color: var(--color-text-secondary);
          }

          .value {
            font-family: var(--font-family-mono);
            font-size: var(--font-size-sm);
            background: var(--color-background-primary);
            padding: var(--spacing-1) var(--spacing-2);
            border-radius: var(--border-radius-base);
            color: var(--color-primary-600);
          }
        }
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 操作按钮区
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    .actions {
      display: flex;
  justify-content: center;
      gap: var(--spacing-4);
      margin-top: var(--spacing-8);
      padding-top: var(--spacing-6);
      border-top: 2px solid var(--color-border-light);

      .generate-btn,
      .reset-btn {
        min-width: 200px;
        height: 56px;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        border-radius: var(--border-radius-xl);
        transition: all var(--transition-duration-base) var(--transition-timing-easeInOut);

        i {
          margin-right: var(--spacing-2);
        }

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
      }

      .generate-btn {
        &.btn-blue {
          background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
          border-color: var(--color-primary-600);
        }
        &.btn-red {
          background: linear-gradient(135deg, var(--color-danger-500) 0%, var(--color-danger-600) 100%);
          border-color: var(--color-danger-600);
        }
        &.btn-green {
          background: linear-gradient(135deg, var(--color-success-500) 0%, var(--color-success-600) 100%);
          border-color: var(--color-success-600);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 现代化进度区域
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    .progress-section {
      margin-top: var(--spacing-8);
      padding-top: var(--spacing-6);
      border-top: 2px solid var(--color-border-light);

      // 🌈 现代化进度条
      .modern-progress {
        :deep(.el-progress-bar__outer) {
          background: linear-gradient(90deg,
            rgba(64, 158, 255, 0.1) 0%,
            rgba(64, 158, 255, 0.05) 100%
          );
          border-radius: var(--border-radius-full);
          overflow: hidden;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.3) 50%,
              transparent 100%
            );
            animation: progressShimmer 2s infinite;
          }
        }

        :deep(.el-progress-bar__inner) {
          border-radius: var(--border-radius-full);
          transition: all var(--transition-duration-normal) var(--transition-timing-ease-out);
          background: linear-gradient(90deg,
            var(--color-primary-400) 0%,
            var(--color-primary-500) 50%,
            var(--color-primary-600) 100%
          );
          box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
        }

        :deep(.el-progress__text) {
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
        }
      }

      // 🚀 增强版日志显示
      .generation-logs {
        margin-top: var(--spacing-5);
        max-height: 300px;
        overflow-y: auto;
        background: var(--color-background-elevated);
        border-radius: var(--border-radius-xl);
        padding: var(--spacing-4);
        border: 1px solid var(--color-border-soft);
        box-shadow: var(--shadow-sm);

        // 🎯 自定义滚动条
        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: var(--color-background-muted);
          border-radius: var(--border-radius-full);
        }

        &::-webkit-scrollbar-thumb {
          background: var(--color-primary-300);
          border-radius: var(--border-radius-full);

          &:hover {
            background: var(--color-primary-400);
          }
        }

        .log-item {
          padding: var(--spacing-3) 0;
          border-bottom: 1px solid var(--color-border-light);
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          font-size: var(--font-size-sm);
          font-family: var(--font-family-mono);
          transition: all var(--transition-duration-fast) var(--transition-timing-ease-out);
          animation: logItemSlideIn 0.3s ease-out;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background: rgba(var(--color-primary-rgb), 0.05);
            border-radius: var(--border-radius-md);
            transform: translateX(4px);
          }

          .log-icon {
            flex-shrink: 0;
            font-size: var(--font-size-base);
            animation: iconPulse 2s infinite;
          }

          .log-message {
            flex: 1;
            line-height: 1.4;
          }

          .log-timestamp {
            flex-shrink: 0;
            font-size: var(--font-size-xs);
            color: var(--color-text-tertiary);
            opacity: 0.7;
          }

          &.info {
            color: var(--color-info-600);
            .log-icon { color: var(--color-info-500); }
          }

          &.success {
            color: var(--color-success-600);
            .log-icon { color: var(--color-success-500); }
          }

          &.warning {
            color: var(--color-warning-600);
            .log-icon { color: var(--color-warning-500); }
          }

          &.error {
            color: var(--color-danger-600);
            .log-icon { color: var(--color-danger-500); }
          }
        }
      }

      .completion-actions {
  display: flex;
  justify-content: center;
        gap: var(--spacing-4);
        margin-top: var(--spacing-6);

        button {
          min-width: 180px;

          i {
            margin-right: var(--spacing-2);
          }
        }
      }
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 响应式设计
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@media (max-width: 768px) {
  .ultra-simple-studio {
    padding: var(--spacing-4);

    .studio-header {
      .studio-title {
        font-size: var(--font-size-3xl);
      }

      .studio-subtitle {
        font-size: var(--font-size-base);
      }
    }

    .studio-card {
      padding: var(--spacing-5);

      .config-form {
        :deep(.el-form-item__label) {
          width: 100% !important;
          text-align: left;
          margin-bottom: var(--spacing-2);
        }

        :deep(.el-form-item__content) {
          margin-left: 0 !important;
        }
      }

      .derived-info .derived-items {
        grid-template-columns: 1fr;
      }

      .actions {
        flex-direction: column;

        .generate-btn,
        .reset-btn {
  width: 100%;
        }
      }

      .progress-section .completion-actions {
        flex-direction: column;

        button {
          width: 100%;
        }
      }
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 暗色主题适配
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[data-theme="dark"] {
  .ultra-simple-studio {
    .derived-info {
      background: rgba(var(--color-primary-900), 0.2);
      border-left-color: var(--color-primary-400);

      .derived-title {
        color: var(--color-primary-300);
      }

      .derived-items .derived-item {
        .value {
          background: var(--color-background-tertiary);
          color: var(--color-primary-400);
        }
      }
    }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 动画效果
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 🎆 页面加载动画
@keyframes fadeSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// 🌈 浮动动画
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

// 🌊 波纹效果
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

// 🌈 进度条闪光动画
@keyframes progressShimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

// 🚀 日志项滑入动画
@keyframes logItemSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 💫 图标脉冲动画
@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

// 🔄 加载旋转动画
@keyframes spinning {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 💫 脉冲效果
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

</style>
