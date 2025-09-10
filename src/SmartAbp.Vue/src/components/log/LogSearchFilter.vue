<template>
  <div class="log-search-filter">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索日志内容..."
        clearable
        @input="handleSearch"
        @clear="handleClear"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #suffix>
          <el-button
            v-if="searchQuery"
            text
            :type="showAdvanced ? 'primary' : 'default'"
            @click="toggleAdvancedSearch"
          >
            高级
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 高级搜索面板 -->
    <el-collapse-transition>
      <div
        v-show="showAdvanced"
        class="advanced-search"
      >
        <el-card
          shadow="never"
          class="search-panel"
        >
          <div class="search-options">
            <!-- 时间范围 -->
            <div class="option-group">
              <label class="option-label">时间范围</label>
              <el-date-picker
                v-model="timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                @change="handleTimeRangeChange"
              />
            </div>

            <!-- 日志级别 -->
            <div class="option-group">
              <label class="option-label">日志级别</label>
              <el-checkbox-group
                v-model="selectedLevels"
                @change="handleLevelChange"
              >
                <el-checkbox
                  v-for="level in logLevels"
                  :key="level.value"
                  :label="level.value"
                  :style="{ color: level.color }"
                >
                  {{ level.label }}
                </el-checkbox>
              </el-checkbox-group>
            </div>

            <!-- 分类过滤 -->
            <div class="option-group">
              <label class="option-label">分类</label>
              <el-select
                v-model="selectedCategories"
                multiple
                placeholder="选择分类"
                collapse-tags
                collapse-tags-tooltip
                @change="handleCategoryChange"
              >
                <el-option
                  v-for="category in availableCategories"
                  :key="category"
                  :label="category"
                  :value="category"
                />
              </el-select>
            </div>

            <!-- 来源过滤 -->
            <div class="option-group">
              <label class="option-label">来源</label>
              <el-select
                v-model="selectedSources"
                multiple
                placeholder="选择来源"
                collapse-tags
                collapse-tags-tooltip
                @change="handleSourceChange"
              >
                <el-option
                  v-for="source in availableSources"
                  :key="source"
                  :label="source"
                  :value="source"
                />
              </el-select>
            </div>

            <!-- 搜索选项 -->
            <div class="option-group">
              <label class="option-label">搜索选项</label>
              <div class="search-options-checkboxes">
                <el-checkbox
                  v-model="searchOptions.caseSensitive"
                  @change="handleSearch"
                >
                  区分大小写
                </el-checkbox>
                <el-checkbox
                  v-model="searchOptions.useRegex"
                  @change="handleSearch"
                >
                  正则表达式
                </el-checkbox>
                <el-checkbox
                  v-model="searchOptions.searchInData"
                  @change="handleSearch"
                >
                  搜索数据字段
                </el-checkbox>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="option-group">
              <el-button @click="clearAllFilters">
                清空所有过滤器
              </el-button>
              <el-button
                type="primary"
                @click="saveCurrentFilter"
              >
                保存当前过滤器
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </el-collapse-transition>

    <!-- 快速过滤器 -->
    <div class="quick-filters">
      <el-tag
        v-for="filter in quickFilters"
        :key="filter.name"
        :type="filter.active ? 'primary' : 'info'"
        :effect="filter.active ? 'dark' : 'plain'"
        class="quick-filter-tag"
        @click="applyQuickFilter(filter)"
      >
        {{ filter.label }}
      </el-tag>
    </div>

    <!-- 搜索结果统计 -->
    <div class="search-stats">
      <el-text
        size="small"
        type="info"
      >
        找到 {{ filteredCount }} 条记录
        <span v-if="searchQuery">，关键词: "{{ searchQuery }}"</span>
      </el-text>
      <el-button
        v-if="hasActiveFilters"
        text
        type="primary"
        size="small"
        @click="exportFilteredLogs"
      >
        导出筛选结果
      </el-button>
    </div>

    <!-- 保存的过滤器 -->
    <el-drawer
      v-model="showSavedFilters"
      title="保存的过滤器"
      direction="rtl"
      size="400px"
    >
      <div class="saved-filters">
        <div
          v-for="(filter, index) in savedFilters"
          :key="index"
          class="saved-filter-item"
        >
          <div class="filter-info">
            <h4>{{ filter.name }}</h4>
            <p class="filter-description">
              {{ filter.description }}
            </p>
            <el-text
              size="small"
              type="info"
            >
              保存时间: {{ dayjs(filter.createdAt).format('YYYY-MM-DD HH:mm') }}
            </el-text>
          </div>
          <div class="filter-actions">
            <el-button
              size="small"
              @click="applySavedFilter(filter)"
            >
              应用
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteSavedFilter(index)"
            >
              删除
            </el-button>
          </div>
        </div>
        <el-empty
          v-if="savedFilters.length === 0"
          description="暂无保存的过滤器"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { logger, LogLevel, type LogEntry } from '@/utils/logger'
import { logExporter, ExportFormat } from '@/utils/logExporter'
import dayjs from 'dayjs'

// Props
interface Props {
  logs: LogEntry[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  filtered: [logs: LogEntry[]]
  searchChanged: [query: string]
}>()

// 响应式数据
const searchQuery = ref('')
const showAdvanced = ref(false)
const timeRange = ref<[string, string] | null>(null)
const selectedLevels = ref<LogLevel[]>([
  LogLevel.DEBUG,
  LogLevel.INFO,
  LogLevel.SUCCESS,
  LogLevel.WARN,
  LogLevel.ERROR
])
const selectedCategories = ref<string[]>([])
const selectedSources = ref<string[]>([])
const searchOptions = ref({
  caseSensitive: false,
  useRegex: false,
  searchInData: false
})
const showSavedFilters = ref(false)
const savedFilters = ref<SavedFilter[]>([])

// 日志级别配置
const logLevels = [
  { value: LogLevel.DEBUG, label: '调试', color: '#909399' },
  { value: LogLevel.INFO, label: '信息', color: '#409EFF' },
  { value: LogLevel.SUCCESS, label: '成功', color: '#67C23A' },
  { value: LogLevel.WARN, label: '警告', color: '#E6A23C' },
  { value: LogLevel.ERROR, label: '错误', color: '#F56C6C' }
]

// 快速过滤器
const quickFilters = ref([
  { name: 'errors', label: '仅错误', active: false },
  { name: 'warnings', label: '错误和警告', active: false },
  { name: 'recent', label: '最近1小时', active: false },
  { name: 'performance', label: '性能相关', active: false },
  { name: 'auth', label: '认证相关', active: false }
])

// 保存的过滤器接口
interface SavedFilter {
  name: string
  description: string
  createdAt: Date
  searchQuery: string
  timeRange: [string, string] | null
  selectedLevels: LogLevel[]
  selectedCategories: string[]
  selectedSources: string[]
  searchOptions: {
    caseSensitive: boolean
    useRegex: boolean
    searchInData: boolean
  }
}

// 计算属性
const availableCategories = computed(() => {
  const categories = new Set<string>()
  props.logs.forEach(log => {
    if (log.category) {
      categories.add(log.category)
    }
  })
  return Array.from(categories).sort()
})

const availableSources = computed(() => {
  const sources = new Set<string>()
  props.logs.forEach(log => {
    if (log.source) {
      sources.add(log.source)
    }
  })
  return Array.from(sources).sort()
})

const filteredLogs = computed(() => {
  let filtered = [...props.logs]

  // 时间范围过滤
  if (timeRange.value) {
    const [start, end] = timeRange.value
    const startTime = new Date(start)
    const endTime = new Date(end)
    filtered = filtered.filter(log =>
      new Date(log.timestamp) >= startTime && new Date(log.timestamp) <= endTime
    )
  }

  // 级别过滤
  filtered = filtered.filter(log => selectedLevels.value.includes(log.level))

  // 分类过滤
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter(log =>
      log.category && selectedCategories.value.includes(log.category)
    )
  }

  // 来源过滤
  if (selectedSources.value.length > 0) {
    filtered = filtered.filter(log =>
      log.source && selectedSources.value.includes(log.source)
    )
  }

  // 文本搜索
  if (searchQuery.value.trim()) {
    filtered = filtered.filter(log => matchesSearch(log, searchQuery.value.trim()))
  }

  return filtered
})

const filteredCount = computed(() => filteredLogs.value.length)

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim() ||
    timeRange.value ||
    selectedLevels.value.length < logLevels.length ||
    selectedCategories.value.length > 0 ||
    selectedSources.value.length > 0
  )
})

// 方法
const matchesSearch = (log: LogEntry, query: string): boolean => {
  try {
    let searchText = log.message

    // 是否搜索数据字段
    if (searchOptions.value.searchInData && log.data) {
      searchText += ' ' + JSON.stringify(log.data)
    }

    // 是否使用正则表达式
    if (searchOptions.value.useRegex) {
      const flags = searchOptions.value.caseSensitive ? 'g' : 'gi'
      const regex = new RegExp(query, flags)
      return regex.test(searchText)
    }

    // 普通文本搜索
    if (searchOptions.value.caseSensitive) {
      return searchText.includes(query)
    } else {
      return searchText.toLowerCase().includes(query.toLowerCase())
    }
  } catch (error) {
    // 正则表达式错误时回退到普通搜索
    const searchText = searchOptions.value.caseSensitive
      ? log.message
      : log.message.toLowerCase()
    const searchQuery = searchOptions.value.caseSensitive
      ? query
      : query.toLowerCase()
    return searchText.includes(searchQuery)
  }
}

const handleSearch = () => {
  emit('searchChanged', searchQuery.value)
}

const handleClear = () => {
  searchQuery.value = ''
  handleSearch()
}

const toggleAdvancedSearch = () => {
  showAdvanced.value = !showAdvanced.value
}

const handleTimeRangeChange = () => {
  // 时间范围变化时自动触发过滤
}

const handleLevelChange = () => {
  // 级别变化时自动触发过滤
}

const handleCategoryChange = () => {
  // 分类变化时自动触发过滤
}

const handleSourceChange = () => {
  // 来源变化时自动触发过滤
}

const applyQuickFilter = (filter: any) => {
  // 重置其他快速过滤器
  quickFilters.value.forEach(f => {
    f.active = f.name === filter.name ? !f.active : false
  })

  if (filter.active) {
    switch (filter.name) {
      case 'errors':
        selectedLevels.value = [LogLevel.ERROR]
        break
      case 'warnings':
        selectedLevels.value = [LogLevel.ERROR, LogLevel.WARN]
        break
      case 'recent':
        const oneHourAgo = dayjs().subtract(1, 'hour')
        timeRange.value = [
          oneHourAgo.format('YYYY-MM-DD HH:mm:ss'),
          dayjs().format('YYYY-MM-DD HH:mm:ss')
        ]
        break
      case 'performance':
        selectedCategories.value = ['performance']
        break
      case 'auth':
        selectedCategories.value = ['auth', 'authentication', 'login']
        break
    }
  } else {
    clearAllFilters()
  }
}

const clearAllFilters = () => {
  searchQuery.value = ''
  timeRange.value = null
  selectedLevels.value = [
    LogLevel.DEBUG,
    LogLevel.INFO,
    LogLevel.SUCCESS,
    LogLevel.WARN,
    LogLevel.ERROR
  ]
  selectedCategories.value = []
  selectedSources.value = []
  searchOptions.value = {
    caseSensitive: false,
    useRegex: false,
    searchInData: false
  }
  quickFilters.value.forEach(f => {
    f.active = false
  })
}

const saveCurrentFilter = async () => {
  try {
    const { value: name } = await ElMessageBox.prompt('请输入过滤器名称', '保存过滤器', {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '过滤器名称不能为空'
    })

    const { value: description } = await ElMessageBox.prompt('请输入过滤器描述（可选）', '保存过滤器', {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputType: 'textarea'
    })

    const filter: SavedFilter = {
      name,
      description: description || '',
      createdAt: new Date(),
      searchQuery: searchQuery.value,
      timeRange: timeRange.value,
      selectedLevels: [...selectedLevels.value],
      selectedCategories: [...selectedCategories.value],
      selectedSources: [...selectedSources.value],
      searchOptions: { ...searchOptions.value }
    }

    savedFilters.value.push(filter)
    saveSavedFilters()
    ElMessage.success('过滤器保存成功')
  } catch {
    // 用户取消
  }
}

const applySavedFilter = (filter: SavedFilter) => {
  searchQuery.value = filter.searchQuery
  timeRange.value = filter.timeRange
  selectedLevels.value = [...filter.selectedLevels]
  selectedCategories.value = [...filter.selectedCategories]
  selectedSources.value = [...filter.selectedSources]
  searchOptions.value = { ...filter.searchOptions }
  showSavedFilters.value = false
  ElMessage.success(`已应用过滤器: ${filter.name}`)
}

const deleteSavedFilter = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个过滤器吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    savedFilters.value.splice(index, 1)
    saveSavedFilters()
    ElMessage.success('过滤器删除成功')
  } catch {
    // 用户取消
  }
}

const exportFilteredLogs = () => {
  const config = {
    format: ExportFormat.HTML,
    includeAnalysis: true,
    includePerformance: false,
    includeErrors: false
  }

  // 创建临时的过滤后的日志数据
  const tempLogs = filteredLogs.value
  const originalGetLogs = logger.getLogs
  logger.getLogs = () => tempLogs

  try {
    logExporter.downloadLogs(config, `filtered_logs_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.html`)
    ElMessage.success('筛选结果导出成功')
  } finally {
    // 恢复原始方法
    logger.getLogs = originalGetLogs
  }
}

const loadSavedFilters = () => {
  try {
    const saved = localStorage.getItem('log-search-filters')
    if (saved) {
      const parsed = JSON.parse(saved)
      savedFilters.value = parsed.map((f: any) => ({
        ...f,
        createdAt: new Date(f.createdAt)
      }))
    }
  } catch (error) {
    console.warn('加载保存的过滤器失败:', error)
  }
}

const saveSavedFilters = () => {
  try {
    localStorage.setItem('log-search-filters', JSON.stringify(savedFilters.value))
  } catch (error) {
    console.warn('保存过滤器失败:', error)
  }
}

// 监听过滤结果变化
watch(filteredLogs, (newLogs) => {
  emit('filtered', newLogs)
}, { immediate: true })

// 组件挂载时加载保存的过滤器
onMounted(() => {
  loadSavedFilters()
})
</script>

<style scoped>
.log-search-filter {
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 10px;
}

.advanced-search {
  margin-bottom: 15px;
}

.search-panel {
  border: 1px solid #e4e7ed;
}

.search-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-label {
  font-weight: 600;
  color: #606266;
  font-size: 14px;
}

.search-options-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.quick-filter-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.quick-filter-tag:hover {
  transform: translateY(-1px);
}

.search-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid #e4e7ed;
}

.saved-filters {
  padding: 20px;
}

.saved-filter-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 10px;
}

.filter-info h4 {
  margin: 0 0 5px 0;
  color: #303133;
}

.filter-description {
  margin: 0 0 5px 0;
  color: #606266;
  font-size: 13px;
}

.filter-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .search-options {
    grid-template-columns: 1fr;
  }

  .search-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .saved-filter-item {
    flex-direction: column;
    gap: 10px;
  }

  .filter-actions {
    align-self: stretch;
  }
}
</style>
