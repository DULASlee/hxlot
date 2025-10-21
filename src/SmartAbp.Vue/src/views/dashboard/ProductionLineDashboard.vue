<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
<!-- MES产线实时监控大屏 -->
<!-- 固定分辨率：1920×1080，自动缩放适配 -->
<!-- 创建日期: 2025-10-21 -->
<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

<template>
  <div class="dashboard-container" :style="containerStyle">
    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <!-- 标题栏 -->
    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">MES产线实时监控大屏</h1>
      <div class="dashboard-time">{{ currentTime }}</div>
      <div class="dashboard-status">
        <el-tag :type="isConnected ? 'success' : 'danger'" size="large">
          <el-icon><Connection /></el-icon>
          {{ isConnected ? '已连接' : '未连接' }}
        </el-tag>
      </div>
    </div>

    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <!-- KPI指标区 -->
    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <div class="kpi-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <KPICard
            title="总产量"
            :value="productionLineData?.totalProduction || 0"
            unit="件"
            :trend="calculateTrend('totalProduction')"
            :icon="DataAnalysis"
            type="primary"
          >
            <template #footer>
              目标: {{ productionLineData?.targetProduction || 0 }} 件
            </template>
          </KPICard>
        </el-col>
        <el-col :span="6">
          <KPICard
            title="当前效率"
            :value="productionLineData?.currentEfficiency || 0"
            unit="%"
            :trend="calculateTrend('currentEfficiency')"
            :icon="TrendCharts"
            type="success"
            :formatter="(v) => v.toFixed(1)"
          />
        </el-col>
        <el-col :span="6">
          <KPICard
            title="设备利用率"
            :value="productionLineData?.equipmentUtilization || 0"
            unit="%"
            :trend="calculateTrend('equipmentUtilization')"
            :icon="Monitor"
            type="warning"
            :formatter="(v) => v.toFixed(1)"
          />
        </el-col>
        <el-col :span="6">
          <KPICard
            title="合格率"
            :value="productionLineData?.qualifiedRate || 0"
            unit="%"
            :trend="calculateTrend('qualifiedRate')"
            :icon="CircleCheck"
            type="success"
            :formatter="(v) => v.toFixed(1)"
          >
            <template #footer>
              合格: {{ productionLineData?.qualifiedCount || 0 }} / 
              不合格: {{ productionLineData?.unqualifiedCount || 0 }}
            </template>
          </KPICard>
        </el-col>
      </el-row>
    </div>

    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <!-- 图表区 -->
    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <div class="chart-section">
      <el-row :gutter="20">
        <!-- 生产趋势 -->
        <el-col :span="12">
          <RealtimeChart
            title="生产趋势"
            height="350px"
            :series="productionTrendSeries"
            yAxisUnit="件"
          />
        </el-col>

        <!-- 效率趋势 -->
        <el-col :span="12">
          <RealtimeChart
            title="效率趋势"
            height="350px"
            :series="efficiencyTrendSeries"
            yAxisUnit="%"
            :yAxisMin="0"
            :yAxisMax="100"
          />
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 能耗趋势 -->
        <el-col :span="12">
          <RealtimeChart
            title="能耗趋势"
            height="350px"
            :series="energyTrendSeries"
            yAxisUnit="kWh"
          />
        </el-col>

        <!-- 设备状态分布 -->
        <el-col :span="12">
          <div class="equipment-status-panel">
            <h3 class="panel-title">设备状态分布</h3>
            <div class="equipment-status-grid">
              <div class="status-item status-item--running">
                <div class="status-count">{{ productionLineData?.runningEquipmentCount || 0 }}</div>
                <div class="status-label">运行中</div>
              </div>
              <div class="status-item status-item--idle">
                <div class="status-count">{{ productionLineData?.idleEquipmentCount || 0 }}</div>
                <div class="status-label">待机</div>
              </div>
              <div class="status-item status-item--fault">
                <div class="status-count">{{ productionLineData?.faultEquipmentCount || 0 }}</div>
                <div class="status-label">故障</div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <!-- 当前生产信息 -->
    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <div class="production-info-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="info-card">
            <div class="info-label">当前批次</div>
            <div class="info-value">{{ productionLineData?.currentBatchNo || '-' }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-card">
            <div class="info-label">产品型号</div>
            <div class="info-value">{{ productionLineData?.currentProductModel || '-' }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-card">
            <div class="info-label">当前产量</div>
            <div class="info-value">
              {{ productionLineData?.currentProduction || 0 }} / 
              {{ productionLineData?.targetProduction || 0 }}
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProductionLineRealtimeStore } from '@/stores/productionLineRealtimeStore'
import KPICard from '@/components/dashboard/KPICard.vue'
import RealtimeChart from '@/components/dashboard/RealtimeChart.vue'
import type { ChartSeries } from '@/components/dashboard/RealtimeChart.vue'
import { DataAnalysis, TrendCharts, Monitor, CircleCheck, Connection } from '@element-plus/icons-vue'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 状态管理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 实时数据Store */
const store = useProductionLineRealtimeStore()

/** 产线ID（可配置） */
const productionLineId = ref('production-line-001')

/** 当前时间 */
const currentTime = ref('')

/** 时间更新定时器 */
let timeTimer: number | null = null

/** 上一次数据快照（用于计算趋势） */
const previousData = ref<any>(null)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 计算属性
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 产线实时数据 */
const productionLineData = computed(() => 
  store.getProductionLineData(productionLineId.value)
)

/** 趋势数据 */
const trendData = computed(() => 
  store.getTrendData(productionLineId.value)
)

/** WebSocket连接状态 */
const isConnected = computed(() => store.isWebSocketConnected)

/**
 * 生产趋势图表数据
 */
const productionTrendSeries = computed<ChartSeries[]>(() => {
  if (!trendData.value) return []

  return [{
    name: '产量',
    data: trendData.value.productionTrend,
    color: '#409eff',
    smooth: true,
    areaStyle: true
  }]
})

/**
 * 效率趋势图表数据
 */
const efficiencyTrendSeries = computed<ChartSeries[]>(() => {
  if (!trendData.value) return []

  return [{
    name: '效率',
    data: trendData.value.efficiencyTrend,
    color: '#67c23a',
    smooth: true,
    areaStyle: true
  }]
})

/**
 * 能耗趋势图表数据
 */
const energyTrendSeries = computed<ChartSeries[]>(() => {
  if (!trendData.value) return []

  return [{
    name: '能耗',
    data: trendData.value.energyTrend,
    color: '#e6a23c',
    smooth: true,
    areaStyle: true
  }]
})

/**
 * 容器样式（固定1920×1080，自动缩放）
 */
const containerStyle = computed(() => {
  const scaleX = window.innerWidth / 1920
  const scaleY = window.innerHeight / 1080
  const scale = Math.min(scaleX, scaleY)

  return {
    width: '1920px',
    height: '1080px',
    transform: `scale(${scale})`,
    transformOrigin: 'top left'
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 方法
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 更新当前时间
 */
const updateTime = () => {
  currentTime.value = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

/**
 * 计算趋势值（与上一次数据对比）
 * 
 * @param field 字段名
 * @returns 趋势百分比，正数表示上升，负数表示下降
 */
const calculateTrend = (field: string): number | null => {
  if (!productionLineData.value || !previousData.value) return null

  const currentValue = productionLineData.value[field as keyof typeof productionLineData.value] as number
  const previousValue = previousData.value[field]

  if (previousValue === 0 || previousValue === undefined) return null

  const trend = ((currentValue - previousValue) / previousValue) * 100
  return trend
}

/**
 * 更新数据快照
 */
const updateDataSnapshot = () => {
  if (productionLineData.value) {
    previousData.value = { ...productionLineData.value }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 生命周期
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onMounted(async () => {
  console.log('[ProductionLineDashboard] 组件已挂载')

  // 1. 启动时间更新定时器
  updateTime()
  timeTimer = window.setInterval(updateTime, 1000)

  // 2. 连接并订阅产线数据
  try {
    await store.connectAndSubscribe(productionLineId.value)
    console.log('[ProductionLineDashboard] 已连接并订阅产线数据')
  } catch (error) {
    console.error('[ProductionLineDashboard] 连接失败', error)
  }

  // 3. 每10秒更新数据快照（用于计算趋势）
  setInterval(updateDataSnapshot, 10000)
})

onUnmounted(async () => {
  console.log('[ProductionLineDashboard] 组件即将卸载')

  // 1. 清除时间定时器
  if (timeTimer) {
    clearInterval(timeTimer)
    timeTimer = null
  }

  // 2. 断开并取消订阅
  try {
    await store.disconnectAndUnsubscribe(productionLineId.value)
    console.log('[ProductionLineDashboard] 已断开连接')
  } catch (error) {
    console.error('[ProductionLineDashboard] 断开连接失败', error)
  }
})
</script>

<style scoped lang="scss">
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 大屏容器样式
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.dashboard-container {
  position: fixed;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 标题栏
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    background: linear-gradient(90deg, rgba(23, 25, 35, 0.95), rgba(31, 34, 46, 0.85));
    border-bottom: 2px solid rgba(64, 158, 255, 0.3);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .dashboard-title {
    font-size: 36px;
    font-weight: 700;
    color: #fff;
    margin: 0;
    text-shadow: 0 2px 10px rgba(64, 158, 255, 0.5);
    letter-spacing: 2px;
  }

  .dashboard-time {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }

  .dashboard-status {
    font-size: 16px;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // KPI区域
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  .kpi-section {
    padding: 30px 40px 20px;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 图表区域
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  .chart-section {
    padding: 10px 40px 20px;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 设备状态面板
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  .equipment-status-panel {
    background: linear-gradient(135deg, rgba(23, 25, 35, 0.95) 0%, rgba(31, 34, 46, 0.95) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 24px;
    height: 350px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .panel-title {
    font-size: 16px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 24px 0;
    text-align: center;
  }

  .equipment-status-grid {
    display: flex;
    gap: 20px;
    justify-content: space-around;
    margin-top: 60px;
  }

  .status-item {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 40px 20px;
    text-align: center;
    border: 2px solid transparent;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    }

    &--running {
      border-color: rgba(103, 194, 58, 0.5);
    }

    &--idle {
      border-color: rgba(230, 162, 60, 0.5);
    }

    &--fault {
      border-color: rgba(245, 108, 108, 0.5);
    }
  }

  .status-count {
    font-size: 48px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
    font-variant-numeric: tabular-nums;
  }

  .status-label {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 生产信息区域
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  .production-info-section {
    padding: 10px 40px 20px;
  }

  .info-card {
    background: linear-gradient(135deg, rgba(23, 25, 35, 0.95) 0%, rgba(31, 34, 46, 0.95) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  .info-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 12px;
  }

  .info-value {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    font-variant-numeric: tabular-nums;
  }
}
</style>

