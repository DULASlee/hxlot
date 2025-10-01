<template>
  <div class="logs-dashboard">
    <el-page-header
      content="日志管理"
      @back="goBack"
    >
      <template #extra>
        <el-button
          type="primary"
          :icon="Refresh"
          @click="refreshLogs"
        >
          刷新
        </el-button>
      </template>
    </el-page-header>

    <el-divider />

    <!-- 日志统计卡片 -->
    <el-row
      :gutter="20"
      class="stats-cards"
    >
      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon
              :size="32"
              color="#409EFF"
            >
              <document />
            </el-icon>
            <div class="stat-content">
              <div class="stat-label">
                总日志数
              </div>
              <div class="stat-value">
                {{ logStats.totalCount.toLocaleString() }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon
              :size="32"
              color="#F56C6C"
            >
              <warning />
            </el-icon>
            <div class="stat-content">
              <div class="stat-label">
                错误日志
              </div>
              <div class="stat-value">
                {{ logStats.errorCount.toLocaleString() }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon
              :size="32"
              color="#E6A23C"
            >
              <warning-filled />
            </el-icon>
            <div class="stat-content">
              <div class="stat-label">
                警告日志
              </div>
              <div class="stat-value">
                {{ logStats.warningCount.toLocaleString() }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon
              :size="32"
              color="#67C23A"
            >
              <circle-check />
            </el-icon>
            <div class="stat-content">
              <div class="stat-label">
                错误率
              </div>
              <div class="stat-value">
                {{ (logStats.errorRate * 100).toFixed(2) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 日志级别分布图 -->
    <el-row
      :gutter="20"
      class="charts-row"
    >
      <el-col
        :xs="24"
        :lg="12"
      >
        <el-card shadow="hover">
          <template #header>
            <span>日志级别分布</span>
          </template>
          <div
            ref="levelDistChartRef"
            class="chart-container"
          />
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :lg="12"
      >
        <el-card shadow="hover">
          <template #header>
            <span>日志趋势（最近24小时）</span>
          </template>
          <div
            ref="logTrendChartRef"
            class="chart-container"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 日志查询与列表 -->
    <el-card
      shadow="hover"
      class="log-search-card"
    >
      <template #header>
        <span>日志查询</span>
      </template>

      <!-- 查询表单 -->
      <el-form
        :inline="true"
        :model="searchForm"
        class="search-form"
      >
        <el-form-item label="服务名称">
          <el-select
            v-model="searchForm.serviceName"
            placeholder="全部服务"
            clearable
          >
            <el-option
              label="SmartAbp.Web"
              value="SmartAbp.Web"
            />
            <el-option
              label="SmartAbp.CodeGenerator"
              value="SmartAbp.CodeGenerator"
            />
            <el-option
              label="SmartAbp.OpsManagement"
              value="SmartAbp.OpsManagement"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="日志级别">
          <el-select
            v-model="searchForm.level"
            placeholder="全部级别"
            clearable
          >
            <el-option
              label="Debug"
              value="Debug"
            />
            <el-option
              label="Information"
              value="Information"
            />
            <el-option
              label="Warning"
              value="Warning"
            />
            <el-option
              label="Error"
              value="Error"
            />
            <el-option
              label="Fatal"
              value="Fatal"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索日志内容"
            clearable
            style="width: 300px"
          />
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="searchLogs"
          >
            查询
          </el-button>
          <el-button @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 日志列表 -->
      <el-table
        :data="logList"
        stripe
        style="width: 100%"
      >
        <el-table-column
          prop="timestamp"
          label="时间"
          width="180"
        />
        <el-table-column
          prop="level"
          label="级别"
          width="100"
        >
          <template #default="{ row }">
            <el-tag
              :type="getLevelTagType(row.level)"
              size="small"
            >
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="serviceName"
          label="服务"
          width="200"
        />
        <el-table-column
          prop="message"
          label="消息"
          show-overflow-tooltip
        />
        <el-table-column
          prop="traceId"
          label="TraceID"
          width="200"
          show-overflow-tooltip
        />
        <el-table-column
          label="操作"
          width="120"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="viewLogDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="日志详情"
      width="800px"
    >
      <el-descriptions
        :column="1"
        border
      >
        <el-descriptions-item label="时间">
          {{ selectedLog?.timestamp }}
        </el-descriptions-item>
        <el-descriptions-item label="级别">
          <el-tag :type="getLevelTagType(selectedLog?.level || '')">
            {{ selectedLog?.level }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="服务名称">
          {{ selectedLog?.serviceName }}
        </el-descriptions-item>
        <el-descriptions-item label="TraceID">
          {{ selectedLog?.traceId || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="请求路径">
          {{ selectedLog?.requestPath || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="消息">
          {{ selectedLog?.message }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="selectedLog?.exception"
          label="异常信息"
        >
          <pre style="max-height: 300px; overflow-y: auto">{{ selectedLog.exception }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh, Document, Warning, WarningFilled, CircleCheck } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

/**
 * ELK日志管理面板
 * 提供日志统计、查询、可视化
 */

const router = useRouter()
const levelDistChartRef = ref<HTMLElement>()
const logTrendChartRef = ref<HTMLElement>()

let levelDistChart: ECharts | null = null
let logTrendChart: ECharts | null = null

// 日志统计
const logStats = ref({
  totalCount: 125840,
  errorCount: 1258,
  warningCount: 3456,
  errorRate: 0.01,
})

// 搜索表单
const searchForm = ref({
  serviceName: '',
  level: '',
  keyword: '',
  timeRange: [],
})

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 1000,
})

// 日志列表
const logList = ref([
  {
    id: '1',
    timestamp: '2025-10-01 14:30:25',
    level: 'Error',
    serviceName: 'SmartAbp.Web',
    message: 'Database connection timeout',
    traceId: 'abc123-def456-ghi789',
    requestPath: '/api/users',
    exception: 'System.TimeoutException: Connection timeout...',
  },
  {
    id: '2',
    timestamp: '2025-10-01 14:29:15',
    level: 'Warning',
    serviceName: 'SmartAbp.CodeGenerator',
    message: 'Template compilation warning',
    traceId: 'xyz789-uvw456-rst123',
    requestPath: '/api/generator/compile',
    exception: null,
  },
  // ... 更多日志数据
])

// 日志详情
const detailDialogVisible = ref(false)
const selectedLog = ref<any>(null)

// 返回上一页
const goBack = () => {
  router.back()
}

// 获取级别标签类型
const getLevelTagType = (level: string) => {
  const typeMap: Record<string, any> = {
    Debug: '',
    Information: 'info',
    Warning: 'warning',
    Error: 'danger',
    Fatal: 'danger',
  }
  return typeMap[level] || ''
}

// 初始化日志级别分布图
const initLevelDistChart = () => {
  if (!levelDistChartRef.value) return

  levelDistChart = echarts.init(levelDistChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: ['Debug', 'Information', 'Warning', 'Error', 'Fatal'],
    },
    series: [
      {
        name: '日志级别',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 12580, name: 'Debug', itemStyle: { color: '#909399' } },
          { value: 98420, name: 'Information', itemStyle: { color: '#409EFF' } },
          { value: 3456, name: 'Warning', itemStyle: { color: '#E6A23C' } },
          { value: 1258, name: 'Error', itemStyle: { color: '#F56C6C' } },
          { value: 126, name: 'Fatal', itemStyle: { color: '#C0341D' } },
        ],
      },
    ],
  }

  levelDistChart.setOption(option as any)
}

// 初始化日志趋势图
const initLogTrendChart = () => {
  if (!logTrendChartRef.value) return

  logTrendChart = echarts.init(logTrendChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['Info', 'Warning', 'Error'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Info',
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 5000 + 3000)),
        itemStyle: { color: '#409EFF' },
        areaStyle: { opacity: 0.5 },
      },
      {
        name: 'Warning',
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 200 + 100)),
        itemStyle: { color: '#E6A23C' },
        areaStyle: { opacity: 0.5 },
      },
      {
        name: 'Error',
        type: 'line',
        stack: 'Total',
        smooth: true,
        data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 100 + 20)),
        itemStyle: { color: '#F56C6C' },
        areaStyle: { opacity: 0.5 },
      },
    ],
  }

  logTrendChart.setOption(option as any)
}

// 搜索日志
const searchLogs = () => {
  console.log('搜索日志:', searchForm.value)
  // TODO: 调用后端API
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    serviceName: '',
    level: '',
    keyword: '',
    timeRange: [],
  }
  searchLogs()
}

// 刷新日志
const refreshLogs = () => {
  console.log('刷新日志')
  // TODO: 调用后端API
}

// 查看日志详情
const viewLogDetail = (log: any) => {
  selectedLog.value = log
  detailDialogVisible.value = true
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  searchLogs()
}

const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  searchLogs()
}

onMounted(() => {
  initLevelDistChart()
  initLogTrendChart()

  // 响应式调整
  window.addEventListener('resize', () => {
    levelDistChart?.resize()
    logTrendChart?.resize()
  })
})

onUnmounted(() => {
  levelDistChart?.dispose()
  logTrendChart?.dispose()
})
</script>

<style scoped>
.logs-dashboard {
  width: 100%;
}

.stats-cards {
  margin: 20px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.charts-row {
  margin: 20px 0;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.log-search-card {
  margin-top: 20px;
}

.search-form {
  margin-bottom: 20px;
}
</style>

