<template>
  <div class="route-performance-panel">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <i class="fas fa-route" />
          <span>路由切换性能分析</span>
          <div class="header-stats">
            <el-tag type="info">
              平均耗时: {{ average.toFixed(0) }}ms
            </el-tag>
            <el-tag type="success">
              总记录: {{ performances.length }}
            </el-tag>
          </div>
        </div>
      </template>

      <!-- 性能图表 -->
      <div
        v-if="performances.length > 0"
        class="chart-container"
      >
        <div class="chart-title">
          路由切换时间趋势
        </div>
        <div
          ref="chartRef"
          class="chart-canvas"
        />
      </div>

      <!-- 性能列表 -->
      <el-table 
        :data="paginatedPerformances" 
        stripe 
        style="width: 100%; margin-top: 20px"
        :default-sort="{ prop: 'timestamp', order: 'descending' }"
      >
        <el-table-column
          prop="routePath"
          label="路由路径"
          min-width="200"
        >
          <template #default="{ row }">
            <el-tag
              type="primary"
              size="small"
            >
              {{ row.routePath }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column
          prop="duration"
          label="耗时"
          width="120"
          sortable
        >
          <template #default="{ row }">
            <span :class="getDurationClass(row.duration)">
              {{ row.duration.toFixed(0) }}ms
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="timestamp"
          label="时间"
          width="180"
          sortable
        >
          <template #default="{ row }">
            {{ formatTimestamp(row.timestamp) }}
          </template>
        </el-table-column>

        <el-table-column
          label="性能评级"
          width="100"
        >
          <template #default="{ row }">
            <el-tag
              :type="getRatingType(row.duration)"
              size="small"
            >
              {{ getRatingText(row.duration) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="performances.length > pageSize"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="performances.length"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed, ref, onMounted } from 'vue'

interface RoutePerformance {
  routePath: string
  duration: number
  timestamp: number
}

const props = defineProps<{
  performances: RoutePerformance[]
  average: number
}>()

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 图表引用
const chartRef = ref<HTMLDivElement | null>(null)

// 分页数据
const paginatedPerformances = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.performances.slice(start, end)
})

// 格式化时间戳
const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 获取耗时样式类
const getDurationClass = (duration: number) => {
  if (duration < 100) return 'duration-good'
  if (duration < 500) return 'duration-warning'
  return 'duration-poor'
}

// 获取评级类型
const getRatingType = (duration: number) => {
  if (duration < 100) return 'success'
  if (duration < 500) return 'warning'
  return 'danger'
}

// 获取评级文本
const getRatingText = (duration: number) => {
  if (duration < 100) return '优秀'
  if (duration < 500) return '良好'
  return '较慢'
}

// 渲染简单的条形图
onMounted(() => {
  if (chartRef.value && props.performances.length > 0) {
    renderSimpleChart()
  }
})

// 简单图表渲染（使用CSS）
const renderSimpleChart = () => {
  // 这里可以集成 ECharts 或其他图表库
  // 为了保持简洁，暂时使用CSS条形图
  console.log('Chart data:', props.performances.slice(-20))
}
</script>

<style scoped lang="scss">
.route-performance-panel {
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;

    i {
      color: #409EFF;
    }

    .header-stats {
      margin-left: auto;
      display: flex;
      gap: 8px;
    }
  }

  .chart-container {
    padding: var(--spacing-5);
    background: #F5F7FA;
    border-radius: 8px;

    .chart-title {
      font-size: 14px;
      font-weight: 500;
      color: #606266;
      margin-bottom: 12px;
    }

    .chart-canvas {
      height: 200px;
      background: white;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;
    }
  }

  :deep(.el-table) {
    .duration-good {
      color: #67C23A;
      font-weight: 600;
    }

    .duration-warning {
      color: #E6A23C;
      font-weight: 600;
    }

    .duration-poor {
      color: #F56C6C;
      font-weight: 600;
    }
  }
}
</style>
