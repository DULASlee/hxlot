<template>
  <div class="advanced-log-viewer">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button
            :type="viewMode === 'logs' ? 'primary' : ''"
            size="small"
            @click="viewMode = 'logs'"
          >
            <IconEpDocument />
            日志 ({{ logStats.total }})
          </el-button>
          <el-button
            :type="viewMode === 'performance' ? 'primary' : ''"
            size="small"
            @click="viewMode = 'performance'"
          >
            <IconEpTimer />
            性能 ({{ performanceStats.total }})
          </el-button>
          <el-button
            :type="viewMode === 'errors' ? 'primary' : ''"
            size="small"
            @click="viewMode = 'errors'"
          >
            <IconEpWarningFilled />
            错误 ({{ errorStats.total }})
          </el-button>
        </el-button-group>

        <el-divider direction="vertical" />

        <!-- 实时开关 -->
        <el-switch
          v-model="realTimeMode"
          active-text="实时"
          inactive-text="暂停"
          size="small"
        />

        <!-- 自动滚动 -->
        <el-switch
          v-model="autoScroll"
          active-text="自动滚动"
          inactive-text=""
          size="small"
        />
      </div>

      <div class="toolbar-right">
        <!-- 搜索 -->
        <el-input
          v-model="searchQuery"
          placeholder="搜索..."
          size="small"
          style="width: 200px"
          clearable
        >
          <template #prefix>
            <IconEpSearch />
          </template>
        </el-input>

        <!-- 更多操作 -->
        <el-dropdown @command="handleCommand">
          <el-button size="small">
            <IconEpMoreFilled />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="export">
                导出数据
              </el-dropdown-item>
              <el-dropdown-item command="diagnostic">
                诊断报告
              </el-dropdown-item>
              <el-dropdown-item
                command="clear"
                divided
              >
                清空数据
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 内容区域 -->
    <div
      class="content-area"
      :style="{ height: contentHeight }"
    >
      <!-- 日志视图 -->
      <div
        v-show="viewMode === 'logs'"
        class="view-panel"
      >
        <LogViewer
          :height="contentHeight"
          :auto-scroll="autoScroll"
          :show-controls="false"
        />
      </div>

      <!-- 性能视图 -->
      <div
        v-show="viewMode === 'performance'"
        class="view-panel"
      >
        <div class="performance-panel">
          <!-- 性能统计 -->
          <el-card
            class="stats-card"
            shadow="never"
          >
            <template #header>
              <span>性能统计</span>
            </template>
            <el-row :gutter="16">
              <el-col :span="6">
                <el-statistic
                  title="总计"
                  :value="performanceStats.total"
                />
              </el-col>
              <el-col :span="6">
                <el-statistic
                  title="平均耗时"
                  :value="performanceStats.average"
                  suffix="ms"
                  :precision="2"
                />
              </el-col>
              <el-col :span="6">
                <el-statistic
                  title="最小耗时"
                  :value="performanceStats.min"
                  suffix="ms"
                  :precision="2"
                />
              </el-col>
              <el-col :span="6">
                <el-statistic
                  title="最大耗时"
                  :value="performanceStats.max"
                  suffix="ms"
                  :precision="2"
                />
              </el-col>
            </el-row>
          </el-card>

          <!-- 性能条目列表 -->
          <el-card
            class="entries-card"
            shadow="never"
          >
            <template #header>
              <span>性能条目</span>
            </template>
            <el-table
              :data="filteredPerformanceEntries"
              height="300"
              size="small"
            >
              <el-table-column
                prop="name"
                label="名称"
                min-width="150"
              />
              <el-table-column
                prop="category"
                label="分类"
                width="100"
              />
              <el-table-column
                prop="duration"
                label="耗时"
                width="100"
                sortable
              >
                <template #default="{ row }">
                  <el-tag
                    v-if="row && row.duration !== undefined"
                    :type="row.duration > 1000 ? 'danger' : row.duration > 500 ? 'warning' : 'success'"
                    size="small"
                  >
                    {{ row.duration?.toFixed(2) }}ms
                  </el-tag>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="startTime"
                label="开始时间"
                width="120"
              >
                <template #default="{ row }">
                  {{ row && row.startTime ? formatTime(row.startTime) : '-' }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>

      <!-- 错误视图 -->
      <div
        v-show="viewMode === 'errors'"
        class="view-panel"
      >
        <div class="error-panel">
          <!-- 错误统计 -->
          <el-card
            class="stats-card"
            shadow="never"
          >
            <template #header>
              <span>错误统计</span>
            </template>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-statistic
                  title="错误总数"
                  :value="errorStats.total"
                />
              </el-col>
              <el-col :span="16">
                <div class="context-stats">
                  <span class="stats-label">错误分布:</span>
                  <el-tag
                    v-for="contextEntry in Object.entries(errorStats.contexts)"
                    :key="contextEntry[0]"
                    size="small"
                    style="margin-left: 8px"
                  >
                    {{ contextEntry[0] }}: {{ contextEntry[1] }}
                  </el-tag>
                </div>
              </el-col>
            </el-row>
          </el-card>

          <!-- 错误列表 -->
          <el-card
            class="entries-card"
            shadow="never"
          >
            <template #header>
              <span>错误报告</span>
            </template>
            <div class="error-list">
              <div
                v-for="error in filteredErrorReports"
                :key="error.id"
                class="error-item"
              >
                <div class="error-header">
                  <el-tag
                    type="danger"
                    size="small"
                  >
                    错误
                  </el-tag>
                  <span class="error-time">{{ error.timestamp ? formatDateTime(error.timestamp) : '-' }}</span>
                  <el-tag
                    v-if="error.context"
                    size="small"
                    plain
                  >
                    {{ error.context }}
                  </el-tag>
                </div>
                <div class="error-message">
                  {{ error.error?.message || '未知错误' }}
                </div>
                <div
                  v-if="error.stackTrace"
                  class="error-stack"
                >
                  <el-collapse>
                    <el-collapse-item
                      title="堆栈跟踪"
                      name="stack"
                    >
                      <pre class="stack-trace">{{ error.stackTrace }}</pre>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { logManager } from '@/utils/logManager'
import { logger } from '@/utils/logger'
import LogViewer from './LogViewer.vue'

// Props
interface Props {
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '600px'
})

// 响应式数据
const viewMode = ref<'logs' | 'performance' | 'errors'>('logs')
const realTimeMode = ref(true)
const autoScroll = ref(true)
const searchQuery = ref('')

// 计算属性
const contentHeight = computed(() => {
  const toolbarHeight = 60
  const totalHeight = parseInt(props.height.replace('px', ''))
  return `${totalHeight - toolbarHeight}px`
})

const logStats = computed(() => logger.getStats())
const performanceStats = computed(() => logManager.performanceStats.value)
const errorStats = computed(() => logManager.errorStats.value)

const performanceEntries = computed(() => logManager.getPerformanceEntries().value)
const errorReports = computed(() => logManager.getErrorReports().value)

const filteredPerformanceEntries = computed(() => {
  // 安全检查：确保performanceEntries.value存在且为数组
  if (!performanceEntries.value || !Array.isArray(performanceEntries.value)) {
    return []
  }

  let entries = performanceEntries.value.filter(e => e && e.duration !== undefined)

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    entries = entries.filter(e =>
      e && e.name && e.name.toLowerCase().includes(query) ||
      (e && e.category && e.category.toLowerCase().includes(query))
    )
  }

  return entries.slice(0, 100) // 限制显示数量
})

const filteredErrorReports = computed(() => {
  // 安全检查：确保errorReports.value存在且为数组
  if (!errorReports.value || !Array.isArray(errorReports.value)) {
    return []
  }

  let reports = errorReports.value.filter(r => r && r.error) // 过滤无效数据

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    reports = reports.filter(r =>
      (r.error && r.error.message && r.error.message.toLowerCase().includes(query)) ||
      (r.context && r.context.toLowerCase().includes(query))
    )
  }

  return reports.slice(0, 50) // 限制显示数量
})

// 方法
const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('HH:mm:ss.SSS')
}

const formatDateTime = (timestamp: Date) => {
  return dayjs(timestamp).format('MM-DD HH:mm:ss')
}

const handleCommand = async (command: string) => {
  switch (command) {
    case 'export':
      await exportData()
      break
    case 'diagnostic':
      await exportDiagnostic()
      break
    case 'clear':
      await clearData()
      break
  }
}

const exportData = async () => {
  try {
    let content = ''
    let filename = ''

    switch (viewMode.value) {
      case 'logs':
        content = logger.export('json')
        filename = `logs_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.json`
        break
      case 'performance':
        content = JSON.stringify(performanceEntries.value, null, 2)
        filename = `performance_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.json`
        break
      case 'errors':
        content = JSON.stringify(errorReports.value, null, 2)
        filename = `errors_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.json`
        break
    }

    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const exportDiagnostic = async () => {
  try {
    const content = logManager.exportDiagnosticReport()
    const filename = `diagnostic_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.json`

    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success('诊断报告导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const clearData = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有数据吗？此操作不可恢复。',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    logger.clear()
    logManager.cleanup()
    ElMessage.success('数据已清空')
  } catch {
    // 用户取消
  }
}

// 监听实时模式变化
watch(realTimeMode, (enabled) => {
  if (enabled) {
    ElMessage.info('已启用实时模式')
  } else {
    ElMessage.info('已暂停实时更新')
  }
})

// 生命周期
onMounted(() => {
  // 初始化时记录日志
  logger.info('高级日志查看器已启动', 'log-viewer')
})
</script>

<style scoped>
.advanced-log-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color);
  min-height: 60px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content-area {
  flex: 1;
  overflow: hidden;
}

.view-panel {
  height: 100%;
  overflow: hidden;
}

.performance-panel,
.error-panel {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.stats-card {
  margin-bottom: 16px;
}

.entries-card {
  flex: 1;
}

.context-stats {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.stats-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.error-list {
  max-height: 400px;
  overflow-y: auto;
}

.error-item {
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  margin-bottom: 12px;
  background: var(--el-bg-color);
}

.error-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.error-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-family: monospace;
}

.error-message {
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  word-break: break-word;
}

.error-stack {
  margin-top: 8px;
}

.stack-trace {
  font-size: 12px;
  line-height: 1.4;
  background: var(--el-bg-color-page);
  padding: 8px;
  border-radius: 4px;
  overflow: auto;
  max-height: 200px;
}

/* 响应式设计 */
@media (width <= 768px) {
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }

  .performance-panel,
  .error-panel {
    padding: 8px;
  }
}
</style>
