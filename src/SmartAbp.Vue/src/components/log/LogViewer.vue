<template>
  <div class="log-viewer">
    <!-- 日志控制栏 -->
    <div class="log-controls">
      <div class="log-filters">
        <!-- 级别过滤 -->
        <el-select
          v-model="selectedLevel"
          placeholder="选择日志级别"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="(name, level) in LOG_LEVEL_NAMES"
            :key="level"
            :label="name"
            :value="Number(level)"
          />
        </el-select>

        <!-- 分类过滤 -->
        <el-select
          v-model="selectedCategory"
          placeholder="选择分类"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="category in categories"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>

        <!-- 搜索框 -->
        <el-input
          v-model="searchQuery"
          placeholder="搜索日志..."
          size="small"
          style="width: 200px"
          clearable
        >
          <template #prefix>
            <IconEpSearch />
          </template>
        </el-input>
      </div>

      <div class="log-actions">
        <!-- 日志统计 -->
        <el-popover placement="bottom" width="300" trigger="hover">
          <template #reference>
            <el-button size="small" type="info" plain>
              <IconEpDataAnalysis />
              统计 ({{ stats.total }})
            </el-button>
          </template>
          <div class="log-stats">
            <div class="stat-item">
              <el-tag type="success" size="small">成功: {{ stats.success }}</el-tag>
            </div>
            <div class="stat-item">
              <el-tag type="info" size="small">信息: {{ stats.info }}</el-tag>
            </div>
            <div class="stat-item">
              <el-tag type="warning" size="small">警告: {{ stats.warn }}</el-tag>
            </div>
            <div class="stat-item">
              <el-tag type="danger" size="small">错误: {{ stats.error }}</el-tag>
            </div>
            <div class="stat-item">
              <el-tag size="small">调试: {{ stats.debug }}</el-tag>
            </div>
          </div>
        </el-popover>

        <!-- 导出按钮 -->
        <el-dropdown @command="handleExport">
          <el-button size="small" type="primary" plain>
            <IconEpDownload />
            导出
            <IconEpArrowDown />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="json">JSON 格式</el-dropdown-item>
              <el-dropdown-item command="csv">CSV 格式</el-dropdown-item>
              <el-dropdown-item command="txt">文本格式</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 清空日志 -->
        <el-button
          size="small"
          type="danger"
          plain
          @click="handleClear"
        >
          <IconEpDelete />
          清空
        </el-button>

        <!-- 自动滚动开关 -->
        <el-switch
          v-model="autoScroll"
          size="small"
          active-text="自动滚动"
          inactive-text=""
        />
      </div>
    </div>

    <!-- 日志列表 -->
    <div
      ref="logContainer"
      class="log-container"
      :style="{ height: containerHeight }"
    >
      <div v-if="filteredLogs.length === 0" class="empty-logs">
        <el-empty description="暂无日志数据" />
      </div>

      <div
        v-for="log in filteredLogs"
        :key="log.id"
        class="log-entry"
        :class="[`log-level-${log.level}`, { 'log-expanded': expandedLogs.has(log.id) }]"
        @click="toggleLogExpansion(log.id)"
      >
        <!-- 日志头部 -->
        <div class="log-header">
          <div class="log-meta">
            <el-tag
              :type="getLevelTagType(log.level)"
              size="small"
              class="log-level-tag"
            >
              {{ LOG_LEVEL_NAMES[log.level] }}
            </el-tag>

            <span class="log-time">
              {{ formatTime(new Date(log.timestamp)) }}
            </span>

            <el-tag
              v-if="log.category"
              size="small"
              class="log-category"
              plain
            >
              {{ log.category }}
            </el-tag>

            <el-tag
              v-if="log.source"
              size="small"
              class="log-source"
              type="info"
              plain
            >
              {{ log.source }}
            </el-tag>
          </div>

          <div class="log-actions-mini">
            <el-button
              v-if="log.data"
              size="small"
              text
              @click.stop="toggleLogExpansion(log.id)"
            >
              <IconEpArrowDown v-if="!expandedLogs.has(log.id)" />
              <IconEpArrowUp v-else />
            </el-button>

            <el-button
              size="small"
              text
              @click.stop="copyLog(log)"
            >
              <IconEpCopyDocument />
            </el-button>
          </div>
        </div>

        <!-- 日志消息 -->
        <div class="log-message">
          {{ log.message }}
        </div>

        <!-- 展开的数据 -->
        <div
          v-if="expandedLogs.has(log.id) && log.data"
          class="log-data"
        >
          <el-divider content-position="left">详细数据</el-divider>
          <pre class="log-data-content">{{ formatLogData(log.data) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { logger, LogLevel, LOG_LEVEL_NAMES, type LogEntry } from '@/utils/logger'

// Props
interface Props {
  height?: string
  maxEntries?: number
  showControls?: boolean
  autoScroll?: boolean
  categories?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  maxEntries: 1000,
  showControls: true,
  autoScroll: true,
  categories: () => []
})

// 响应式数据
const logs = logger.getLogsRef()
const selectedLevel = ref<number | null>(null)
const selectedCategory = ref<string>('')
const searchQuery = ref('')
const autoScroll = ref(props.autoScroll)
const expandedLogs = ref(new Set<string>())
const logContainer = ref<HTMLElement>()

// 计算属性
const containerHeight = computed(() => props.height)

const filteredLogs = computed(() => {
  let result = logs.value

  // 级别过滤
  if (selectedLevel.value !== null) {
    result = result.filter(log => log.level === selectedLevel.value)
  }

  // 分类过滤
  if (selectedCategory.value) {
    result = result.filter(log => log.category === selectedCategory.value)
  }

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(log =>
      log.message.toLowerCase().includes(query) ||
      log.category?.toLowerCase().includes(query) ||
      log.source?.toLowerCase().includes(query)
    )
  }

  // 限制数量
  return result.slice(0, props.maxEntries)
})

const categories = computed(() => {
  if (props.categories.length > 0) {
    return props.categories
  }

  const categorySet = new Set<string>()
  logs.value.forEach(log => {
    if (log.category) {
      categorySet.add(log.category)
    }
  })
  return Array.from(categorySet).sort()
})

const stats = computed(() => logger.getStats())

// 方法
const formatTime = (timestamp: Date) => {
  return dayjs(timestamp).format('HH:mm:ss.SSS')
}

const formatLogData = (data: any) => {
  if (typeof data === 'string') {
    return data
  }
  return JSON.stringify(data, null, 2)
}

const getLevelTagType = (level: LogLevel) => {
  switch (level) {
    case LogLevel.SUCCESS: return 'success'
    case LogLevel.INFO: return 'info'
    case LogLevel.WARN: return 'warning'
    case LogLevel.ERROR: return 'danger'
    case LogLevel.DEBUG: return undefined
    default: return undefined
  }
}

const toggleLogExpansion = (logId: string) => {
  if (expandedLogs.value.has(logId)) {
    expandedLogs.value.delete(logId)
  } else {
    expandedLogs.value.add(logId)
  }
}

const copyLog = async (log: LogEntry) => {
  try {
    const text = `[${formatTime(new Date(log.timestamp))}] [${LOG_LEVEL_NAMES[log.level]}] ${log.category ? `[${log.category}] ` : ''}${log.message}`
    await navigator.clipboard.writeText(text)
    ElMessage.success('日志已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const handleExport = (format: string) => {
  try {
    const content = logger.export(format as 'json' | 'csv' | 'txt')
    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/plain'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('日志导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const handleClear = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有日志吗？此操作不可恢复。',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    logger.clear()
    expandedLogs.value.clear()
    ElMessage.success('日志已清空')
  } catch {
    // 用户取消
  }
}

const scrollToBottom = () => {
  if (autoScroll.value && logContainer.value) {
    nextTick(() => {
      logContainer.value!.scrollTop = logContainer.value!.scrollHeight
    })
  }
}

// 监听日志变化，自动滚动到底部
watch(
  () => logs.value.length,
  () => {
    scrollToBottom()
  }
)

// 监听自动滚动设置变化
watch(autoScroll, (newValue) => {
  if (newValue) {
    scrollToBottom()
  }
})

// 生命周期
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.log-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;
}

.log-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color);
  flex-wrap: wrap;
  gap: 8px;
}

.log-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.log-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.log-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  background: var(--el-bg-color);
}

.empty-logs {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.log-entry {
  margin-bottom: 8px;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--el-bg-color);
}

.log-entry:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.log-expanded {
  border-color: var(--el-color-primary);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.log-level-tag {
  font-weight: 500;
}

.log-time {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.log-category,
.log-source {
  font-size: 12px;
}

.log-actions-mini {
  display: flex;
  align-items: center;
  gap: 4px;
}

.log-message {
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  word-break: break-word;
}

.log-data {
  margin-top: 12px;
}

.log-data-content {
  background: var(--el-bg-color-page);
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}

/* 日志级别样式 */
.log-level-0 {
  border-left: 4px solid #909399;
}

.log-level-1 {
  border-left: 4px solid #409EFF;
}

.log-level-2 {
  border-left: 4px solid #E6A23C;
}

.log-level-3 {
  border-left: 4px solid #F56C6C;
}

.log-level-4 {
  border-left: 4px solid #67C23A;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .log-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .log-filters,
  .log-actions {
    justify-content: center;
  }

  .log-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
