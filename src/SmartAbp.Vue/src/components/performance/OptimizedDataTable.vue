<!--
SmartAbp Enterprise Optimized Data Table Component
企业级性能优化数据表格组件 - 展示虚拟滚动、懒加载、内存优化等技术
-->
<template>
  <div class="optimized-data-table">
    <!-- 性能监控面板 -->
    <div v-if="showPerformancePanel" class="performance-panel">
      <div class="performance-metrics">
        <div class="metric">
          <span class="label">渲染时间:</span>
          <span class="value">{{ averageRenderTime.toFixed(2) }}ms</span>
        </div>
        <div class="metric">
          <span class="label">内存使用:</span>
          <span class="value">{{ memoryInfo.usedMemory }}MB ({{ memoryInfo.memoryUsage }}%)</span>
        </div>
        <div class="metric">
          <span class="label">缓存命中率:</span>
          <span class="value">{{ cacheStats.hitRate }}%</span>
        </div>
        <div class="metric">
          <span class="label">显示行数:</span>
          <span class="value">{{ visibleItems.length }}/{{ totalRows }}</span>
        </div>
      </div>
      <div class="performance-actions">
        <el-button size="small" @click="triggerGC">垃圾回收</el-button>
        <el-button size="small" @click="clearCache">清理缓存</el-button>
        <el-button size="small" type="warning" @click="exportPerformanceData">导出性能数据</el-button>
      </div>
    </div>

    <!-- 表格工具栏 -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索..."
          style="width: 200px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="pageSize"
          placeholder="页面大小"
          style="width: 120px; margin-left: 10px"
          @change="handlePageSizeChange"
        >
          <el-option label="50" :value="50" />
          <el-option label="100" :value="100" />
          <el-option label="200" :value="200" />
          <el-option label="500" :value="500" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-switch
          v-model="showPerformancePanel"
          active-text="性能面板"
          style="margin-right: 10px"
        />
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 虚拟滚动表格容器 -->
    <div
      ref="scrollContainer"
      class="virtual-scroll-container"
      :style="{ height: `${containerHeight}px` }"
    >
      <!-- 虚拟滚动空间占位 -->
      <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
        <!-- 可见行渲染 -->
        <div
          v-for="(item, _index) in visibleItems"
          :key="item._virtualIndex"
          class="virtual-row"
          :style="{
            position: 'absolute',
            top: `${item._virtualIndex * itemHeight}px`,
            width: '100%',
            height: `${itemHeight}px`
          }"
        >
          <div class="table-row" :class="{ 'row-even': item._virtualIndex % 2 === 0 }">
            <!-- 序号列 -->
            <div class="table-cell index-cell">
              {{ item._virtualIndex + 1 }}
            </div>
            
            <!-- 数据列 -->
            <div
              v-for="column in columns"
              :key="column.key"
              class="table-cell"
              :style="{ width: column.width || 'auto', textAlign: column.align || 'left' }"
            >
              <!-- 自定义渲染 -->
              <template v-if="column.render">
                <component
                  :is="column.render"
                  :value="item[column.key]"
                  :record="item"
                  :index="item._virtualIndex"
                />
              </template>
              <!-- 懒加载图片 -->
              <template v-else-if="column.type === 'image'">
                <LazyImage
                  :src="item[column.key]"
                  :alt="column.title"
                  class="table-image"
                />
              </template>
              <!-- 普通文本 -->
              <template v-else>
                {{ item[column.key] }}
              </template>
            </div>

            <!-- 操作列 -->
            <div v-if="showActions" class="table-cell actions-cell">
              <el-button-group size="small">
                <el-button @click="handleEdit(item)">编辑</el-button>
                <el-button type="danger" @click="handleDelete(item)">删除</el-button>
              </el-button-group>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <el-loading text="加载中..." />
    </div>

    <!-- 无限滚动加载更多 -->
    <div v-if="enableInfiniteScroll" ref="infiniteScrollTarget" class="infinite-scroll-trigger">
      <div v-if="infiniteLoading" class="loading-more">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载更多...</span>
      </div>
      <div v-else-if="infiniteFinished" class="no-more-data">
        没有更多数据了
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElButton, ElInput, ElSelect, ElOption, ElSwitch, ElIcon, ElLoading, ElButtonGroup } from 'element-plus'
import { Search, Refresh, Loading } from '@element-plus/icons-vue'
import { useVirtualScroll, type VirtualScrollOptions } from '@/utils/performance/virtualScrolling'
import { useInfiniteScroll } from '@/utils/performance/lazyLoading'
import { useMemoryMonitor, useCache, useDebounce } from '@/utils/performance/memoryOptimization'
import { usePerformanceMonitor } from '@/utils/performance/virtualScrolling'
import LazyImage from './LazyImage.vue'

// 组件属性
interface Column {
  key: string
  title: string
  width?: number
  align?: 'left' | 'center' | 'right'
  type?: 'text' | 'image' | 'custom'
  render?: any // Vue组件
}

interface Props {
  /** 表格数据 */
  data?: any[]
  /** 表格列配置 */
  columns: Column[]
  /** 容器高度 */
  containerHeight?: number
  /** 每行高度 */
  itemHeight?: number
  /** 是否显示操作列 */
  showActions?: boolean
  /** 是否启用无限滚动 */
  enableInfiniteScroll?: boolean
  /** 数据加载函数 */
  loadMore?: () => Promise<{ data: any[], hasMore: boolean }>
  /** 搜索函数 */
  onSearch?: (keyword: string) => Promise<any[]>
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  containerHeight: 600,
  itemHeight: 50,
  showActions: true,
  enableInfiniteScroll: false
})

// 发射事件
const emit = defineEmits<{
  edit: [record: any]
  delete: [record: any]
  refresh: []
}>()

// 响应式数据
const tableData = ref<any[]>(props.data || [])
const searchKeyword = ref('')
const pageSize = ref(100)
const loading = ref(false)
const showPerformancePanel = ref(true)
const scrollContainer = ref<HTMLElement | null>(null)

// 性能监控
const { memoryInfo, startMonitoring, triggerGC } = useMemoryMonitor()
const { averageRenderTime, startRenderTimer, recordRenderTime } = usePerformanceMonitor()
const cache = useCache<any[]>('optimized-data-table', { 
  capacity: 200, 
  ttl: 5 * 60 * 1000, // 5分钟
  persistent: true 
})

// 虚拟滚动配置
const virtualScrollOptions: VirtualScrollOptions = {
  itemHeight: props.itemHeight,
  containerHeight: props.containerHeight,
  bufferSize: 10,
  throttleDelay: 16
}

// 使用虚拟滚动
const {
  visibleItems,
  scrollContainer: virtualScrollContainer,
  totalHeight,
  startIndex,
  endIndex,
  // scrollToIndex, // 暂时注释未使用变量
  updateData
} = useVirtualScroll(tableData, virtualScrollOptions)

// 无限滚动
const infiniteScrollTarget = ref<HTMLElement | null>(null)
const {
  isLoading: infiniteLoading,
  isFinished: infiniteFinished,
  // load: loadMoreData // 暂时注释未使用变量
} = useInfiniteScroll(async () => {
  if (props.loadMore) {
    const result = await props.loadMore()
    tableData.value.push(...result.data)
    return result.hasMore
  }
  return false
}, {
  disabled: !props.enableInfiniteScroll
})

// 计算属性
const totalRows = computed(() => tableData.value.length)
const cacheStats = computed(() => cache.getStats())

// 防抖搜索
const [debouncedSearch] = useDebounce(async (keyword: string) => {
  if (!props.onSearch) return

  const startTime = startRenderTimer()
  
  try {
    loading.value = true
    
    // 检查缓存
    const cacheKey = `search_${keyword}`
    let results = cache.get(cacheKey)
    
    if (!results) {
      results = await props.onSearch(keyword)
      cache.set(cacheKey, results)
    }
    
    tableData.value = results
    updateData(results)
    
  } finally {
    loading.value = false
    recordRenderTime(startTime)
  }
}, 300)

// 方法
const handleSearch = (keyword: string) => {
  searchKeyword.value = keyword
  debouncedSearch(keyword)
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  // 可以触发重新加载数据
  refreshData()
}

const refreshData = async () => {
  const startTime = startRenderTimer()
  
  try {
    loading.value = true
    emit('refresh')
    
    // 清理缓存
    cache.clear()
    
    await nextTick()
  } finally {
    loading.value = false
    recordRenderTime(startTime)
  }
}

const handleEdit = (record: any) => {
  emit('edit', record)
}

const handleDelete = (record: any) => {
  emit('delete', record)
}

const clearCache = () => {
  cache.clear()
  console.log('[Performance] Cache cleared')
}

const exportPerformanceData = () => {
  const performanceData = {
    memoryInfo: memoryInfo.value,
    averageRenderTime: averageRenderTime.value,
    cacheStats: cacheStats.value,
    tableStats: {
      totalRows: totalRows.value,
      visibleRows: visibleItems.value.length,
      startIndex: startIndex.value,
      endIndex: endIndex.value
    },
    timestamp: new Date().toISOString()
  }
  
  // 导出为JSON文件
  const blob = new Blob([JSON.stringify(performanceData, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `table-performance-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData) {
    tableData.value = newData
    updateData(newData)
  }
}, { immediate: true })

// 同步虚拟滚动容器引用
watch(scrollContainer, (el) => {
  if (el) {
    virtualScrollContainer.value = el
  }
})

// 生命周期
onMounted(() => {
  startMonitoring(3000) // 每3秒更新内存信息
})
</script>

<style scoped>
.optimized-data-table {
  width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.performance-panel {
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  padding: 12px 16px;
}

.performance-metrics {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric .label {
  font-size: 12px;
  color: #606266;
}

.metric .value {
  font-size: 12px;
  font-weight: 600;
  color: #409eff;
}

.performance-actions {
  display: flex;
  gap: 8px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.virtual-scroll-container {
  overflow-y: auto;
  position: relative;
}

.virtual-row {
  border-bottom: 1px solid #ebeef5;
}

.table-row {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
  transition: background-color 0.3s;
}

.table-row:hover {
  background-color: #f5f7fa;
}

.row-even {
  background-color: #fafafa;
}

.table-cell {
  padding: 8px 12px;
  border-right: 1px solid #ebeef5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.index-cell {
  width: 60px;
  text-align: center;
  font-weight: 600;
  color: #909399;
}

.actions-cell {
  width: 120px;
  text-align: center;
}

.table-image {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.infinite-scroll-trigger {
  padding: 16px;
  text-align: center;
}

.loading-more,
.no-more-data {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.loading-more .is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
