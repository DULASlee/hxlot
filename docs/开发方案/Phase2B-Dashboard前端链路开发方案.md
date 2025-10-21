# Phase 2B: Dashboard前端链路开发方案

**项目**: SmartAbp低代码引擎平台扩展
**阶段**: Phase 2B - 数字大屏前端完整链路开发
**工期**: 1周（5个工作日）
**负责人**: 前端架构师 + 2名前端开发
**依赖**: Phase 2A（Dashboard生成器）已完成，Phase 4（后端SignalR Hub）已完成
**文档版本**: v1.0
**更新日期**: 2025-10-21

---

## 📋 一、项目背景和目标

### 1.1 与Phase 2A的区别

**Phase 2A（Dashboard生成器开发）**：
- 开发DashboardGenerator.cs（生成器本身）
- 创建Handlebars模板（layout.hbs、kpi-card.hbs等）
- 目标：**生成**Dashboard代码

**Phase 2B（Dashboard前端链路开发）**：
- 在SmartAbp.Vue项目中**实际编写**Dashboard前端代码
- 集成WebSocket客户端、ECharts、实时数据流
- 目标：**实现**可用的Dashboard功能

### 1.2 核心目标

1. ✅ 实现WebSocket客户端（连接SignalR Hub）
2. ✅ 实现实时数据Store（Pinia）
3. ✅ 实现大屏布局组件（全屏、响应式适配）
4. ✅ 实现KPI卡片组件（实时数据展示）
5. ✅ 实现实时图表组件（ECharts）
6. ✅ 实现MES产线监控大屏（完整示例）
7. ✅ 实现智慧工地监控大屏（完整示例）

**成功标准**：
- WebSocket连接成功，实时数据推送正常
- ECharts图表实时更新
- 大屏布局适配1920×1080
- 前端代码质量≥95分

---

## 🏗️ 二、技术架构设计

### 2.1 前端架构

```
┌──────────────────────────────────────────────────────┐
│         Dashboard View（大屏视图层）                    │
│  ┌────────────────────────────────────────────────┐  │
│  │  ProductionLineDashboard.vue（产线监控大屏）     │  │
│  │  SmartConstructionDashboard.vue（智慧工地大屏）  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         ↓ 使用
┌──────────────────────────────────────────────────────┐
│         Dashboard Components（大屏组件库）              │
│  ┌────────────────────────────────────────────────┐  │
│  │  DashboardLayout.vue（大屏布局）                 │  │
│  │  KPICard.vue（KPI指标卡片）                      │  │
│  │  RealtimeChart.vue（实时图表）                   │  │
│  │  VideoPlayer.vue（视频播放器）                   │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         ↓ 使用
┌──────────────────────────────────────────────────────┐
│         Composables（可组合函数）                       │
│  ┌────────────────────────────────────────────────┐  │
│  │  useWebSocket.ts（WebSocket客户端）             │  │
│  │  useRealtimeChart.ts（实时图表管理）             │  │
│  │  useDashboardLayout.ts（大屏布局管理）           │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         ↓ 使用
┌──────────────────────────────────────────────────────┐
│         Stores（状态管理）                              │
│  ┌────────────────────────────────────────────────┐  │
│  │  productionLineRealtimeStore.ts（产线实时数据）  │  │
│  │  smartConstructionRealtimeStore.ts（工地实时数据）│  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### 2.2 数据流

```
[SignalR Hub] → [WebSocket客户端] → [Pinia Store]
                                          ↓
                        ┌─────────────────┴─────────────────┐
                        ↓                                   ↓
                  [KPI Card]                        [Realtime Chart]
                  实时更新                              实时更新
```

---

## 💻 三、核心组件实现

### 3.1 WebSocket客户端（useWebSocket.ts）

```typescript
// src/SmartAbp.Vue/src/composables/useWebSocket.ts
import { ref, onUnmounted } from 'vue'
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr'
import { ElMessage } from 'element-plus'

interface UseWebSocketOptions {
  url: string
  onConnected?: () => void
  onDisconnected?: (error?: Error) => void
  onReconnecting?: () => void
  onReconnected?: () => void
}

export function useWebSocket(options: UseWebSocketOptions) {
  const connection = ref<HubConnection | null>(null)
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  
  /**
   * 连接WebSocket
   */
  const connect = async () => {
    try {
      connection.value = new HubConnectionBuilder()
        .withUrl(options.url)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // 指数退避：1s, 2s, 4s, 8s, 16s
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 16000)
          }
        })
        .configureLogging(LogLevel.Information)
        .build()
      
      // 连接成功
      connection.value.onclose((error) => {
        isConnected.value = false
        console.error('[WebSocket] 连接关闭', error)
        ElMessage.error('WebSocket连接已断开')
        options.onDisconnected?.(error)
      })
      
      // 重连中
      connection.value.onreconnecting((error) => {
        console.warn('[WebSocket] 正在重连...', error)
        ElMessage.warning('WebSocket正在重连...')
        options.onReconnecting?.()
      })
      
      // 重连成功
      connection.value.onreconnected((connectionId) => {
        console.log('[WebSocket] 重连成功', connectionId)
        ElMessage.success('WebSocket重连成功')
        options.onReconnected?.()
      })
      
      // 启动连接
      await connection.value.start()
      isConnected.value = true
      
      console.log('[WebSocket] 连接成功')
      ElMessage.success('WebSocket连接成功')
      options.onConnected?.()
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      console.error('[WebSocket] 连接失败', err)
      ElMessage.error(`WebSocket连接失败: ${error.value}`)
    }
  }
  
  /**
   * 断开连接
   */
  const disconnect = async () => {
    if (connection.value) {
      await connection.value.stop()
      isConnected.value = false
      console.log('[WebSocket] 连接已断开')
    }
  }
  
  /**
   * 订阅事件
   */
  const on = (eventName: string, callback: (...args: any[]) => void) => {
    connection.value?.on(eventName, callback)
  }
  
  /**
   * 取消订阅
   */
  const off = (eventName: string) => {
    connection.value?.off(eventName)
  }
  
  /**
   * 调用服务端方法
   */
  const invoke = async (methodName: string, ...args: any[]) => {
    if (!connection.value || !isConnected.value) {
      throw new Error('WebSocket未连接')
    }
    return await connection.value.invoke(methodName, ...args)
  }
  
  // 组件卸载时自动断开
  onUnmounted(() => {
    disconnect()
  })
  
  return {
    connect,
    disconnect,
    on,
    off,
    invoke,
    isConnected,
    error
  }
}
```

### 3.2 实时数据Store（productionLineRealtimeStore.ts）

```typescript
// src/SmartAbp.Vue/src/stores/productionLineRealtimeStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface ProductionLineRealtimeData {
  productionLineId: string
  productionLineName: string
  timestamp: Date
  
  // KPI指标
  totalProduction: number
  currentEfficiency: number
  equipmentUtilization: number
  qualifiedRate: number
  
  // 设备状态
  equipmentStatuses: EquipmentStatus[]
  
  // 传感器数据（图表用）
  sensorDataHistory: SensorDataPoint[]
}

interface EquipmentStatus {
  equipmentId: string
  equipmentName: string
  status: 'running' | 'idle' | 'fault'
  temperature: number
  pressure: number
}

interface SensorDataPoint {
  timestamp: Date
  value: number
  sensorType: string
}

export const useProductionLineRealtimeStore = defineStore('productionLineRealtime', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 状态
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const realtimeData = ref<ProductionLineRealtimeData>({
    productionLineId: '',
    productionLineName: '',
    timestamp: new Date(),
    totalProduction: 0,
    currentEfficiency: 0,
    equipmentUtilization: 0,
    qualifiedRate: 0,
    equipmentStatuses: [],
    sensorDataHistory: []
  })
  
  const trendData = ref<Record<string, 'up' | 'down' | 'stable'>>({})
  const lastUpdateTime = ref<Date | null>(null)
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 计算属性
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const isDataFresh = computed(() => {
    if (!lastUpdateTime.value) return false
    const now = new Date()
    const diff = now.getTime() - lastUpdateTime.value.getTime()
    return diff < 5000 // 5秒内的数据认为是新鲜的
  })
  
  const runningEquipmentCount = computed(() => {
    return realtimeData.value.equipmentStatuses.filter(e => e.status === 'running').length
  })
  
  const faultEquipmentCount = computed(() => {
    return realtimeData.value.equipmentStatuses.filter(e => e.status === 'fault').length
  })
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 操作
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 更新实时数据（WebSocket推送）
   */
  const updateRealtimeData = (newData: Partial<ProductionLineRealtimeData>) => {
    // 计算趋势（KPI指标）
    const kpiFields = ['totalProduction', 'currentEfficiency', 'equipmentUtilization', 'qualifiedRate']
    
    kpiFields.forEach(field => {
      const oldValue = (realtimeData.value as any)[field]
      const newValue = (newData as any)[field]
      
      if (newValue !== undefined) {
        if (newValue > oldValue) {
          trendData.value[field] = 'up'
        } else if (newValue < oldValue) {
          trendData.value[field] = 'down'
        } else {
          trendData.value[field] = 'stable'
        }
      }
    })
    
    // 更新数据
    Object.assign(realtimeData.value, newData)
    
    // 更新传感器数据历史（保留最近100个点）
    if (newData.sensorDataHistory) {
      realtimeData.value.sensorDataHistory.push(...newData.sensorDataHistory)
      
      if (realtimeData.value.sensorDataHistory.length > 100) {
        realtimeData.value.sensorDataHistory = 
          realtimeData.value.sensorDataHistory.slice(-100)
      }
    }
    
    lastUpdateTime.value = new Date()
  }
  
  /**
   * 重置数据
   */
  const reset = () => {
    realtimeData.value = {
      productionLineId: '',
      productionLineName: '',
      timestamp: new Date(),
      totalProduction: 0,
      currentEfficiency: 0,
      equipmentUtilization: 0,
      qualifiedRate: 0,
      equipmentStatuses: [],
      sensorDataHistory: []
    }
    trendData.value = {}
    lastUpdateTime.value = null
  }
  
  return {
    // 状态
    realtimeData,
    trendData,
    lastUpdateTime,
    
    // 计算属性
    isDataFresh,
    runningEquipmentCount,
    faultEquipmentCount,
    
    // 操作
    updateRealtimeData,
    reset
  }
})
```

### 3.3 KPI卡片组件（KPICard.vue）

```vue
<!-- src/SmartAbp.Vue/src/components/dashboard/KPICard.vue -->
<template>
  <div class="kpi-card" :class="[`kpi-card--${theme}`, { 'is-loading': loading }]">
    <div class="kpi-card__header">
      <span class="kpi-card__title">{{ title }}</span>
      <el-icon v-if="icon" class="kpi-card__icon">
        <component :is="icon" />
      </el-icon>
    </div>
    
    <div class="kpi-card__body">
      <div class="kpi-card__value">
        <span class="value-number">{{ formattedValue }}</span>
        <span v-if="unit" class="value-unit">{{ unit }}</span>
      </div>
      
      <div v-if="trend" class="kpi-card__trend" :class="`trend--${trend}`">
        <el-icon>
          <ArrowUp v-if="trend === 'up'" />
          <ArrowDown v-if="trend === 'down'" />
          <Minus v-if="trend === 'stable'" />
        </el-icon>
        <span class="trend-label">
          {{ trendLabel }}
        </span>
      </div>
    </div>
    
    <div v-if="subtitle" class="kpi-card__footer">
      {{ subtitle }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'

interface Props {
  title: string
  value: number | string
  unit?: string
  icon?: any
  trend?: 'up' | 'down' | 'stable'
  subtitle?: string
  theme?: 'primary' | 'success' | 'warning' | 'danger'
  loading?: boolean
  precision?: number
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'primary',
  loading: false,
  precision: 0
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toFixed(props.precision)
  }
  return props.value
})

const trendLabel = computed(() => {
  switch (props.trend) {
    case 'up': return '上升'
    case 'down': return '下降'
    case 'stable': return '持平'
    default: return ''
  }
})
</script>

<style scoped>
.kpi-card {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.kpi-card:hover {
  border-color: #00d4ff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  transform: translateY(-2px);
}

.kpi-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.kpi-card__title {
  font-size: 14px;
  color: #00d4ff;
  font-weight: 500;
}

.kpi-card__icon {
  font-size: 24px;
  color: #00d4ff;
}

.kpi-card__body {
  margin-bottom: 12px;
}

.kpi-card__value {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.value-number {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(90deg, #00d4ff, #00ffc8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

.value-unit {
  font-size: 16px;
  color: #00d4ff;
  opacity: 0.8;
}

.kpi-card__trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 12px;
}

.trend--up {
  color: #67c23a;
}

.trend--down {
  color: #f56c6c;
}

.trend--stable {
  color: #909399;
}

.kpi-card__footer {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(0, 212, 255, 0.2);
  padding-top: 12px;
}

.kpi-card.is-loading {
  opacity: 0.6;
  pointer-events: none;
}

/* 主题色 */
.kpi-card--primary {
  border-color: rgba(0, 212, 255, 0.3);
}

.kpi-card--success {
  border-color: rgba(103, 194, 58, 0.3);
}

.kpi-card--warning {
  border-color: rgba(230, 162, 60, 0.3);
}

.kpi-card--danger {
  border-color: rgba(245, 108, 108, 0.3);
}
</style>
```

### 3.4 实时图表组件（RealtimeChart.vue）

```vue
<!-- src/SmartAbp.Vue/src/components/dashboard/RealtimeChart.vue -->
<template>
  <div class="realtime-chart">
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface Props {
  chartId: string
  chartData: any[]
  updateInterval?: number
  chartType?: 'line' | 'bar' | 'gauge'
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  updateInterval: 1000,
  chartType: 'line'
})

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null
let updateTimer: number | null = null

/**
 * 初始化图表
 */
const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  
  const option: EChartsOption = {
    title: {
      text: props.title,
      textStyle: {
        color: '#00d4ff',
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: '#00d4ff',
      textStyle: {
        color: '#fff'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.3)'
        }
      },
      axisLabel: {
        color: '#00d4ff'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.3)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 212, 255, 0.1)'
        }
      },
      axisLabel: {
        color: '#00d4ff'
      }
    },
    series: [
      {
        name: '实时数据',
        type: props.chartType,
        smooth: true,
        symbol: 'none',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 212, 255, 0.5)' },
            { offset: 1, color: 'rgba(0, 212, 255, 0.05)' }
          ])
        },
        lineStyle: {
          color: '#00d4ff',
          width: 2
        },
        data: []
      }
    ]
  }
  
  chartInstance.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', handleResize)
}

/**
 * 更新图表数据
 */
const updateChartData = () => {
  if (!chartInstance || !props.chartData) return
  
  const xData = props.chartData.map(item => 
    new Date(item.timestamp).toLocaleTimeString()
  )
  
  const yData = props.chartData.map(item => item.value)
  
  chartInstance.setOption({
    xAxis: {
      data: xData
    },
    series: [
      {
        data: yData
      }
    ]
  })
}

/**
 * 响应式调整
 */
const handleResize = () => {
  chartInstance?.resize()
}

/**
 * 启动自动更新
 */
const startAutoUpdate = () => {
  if (props.updateInterval > 0) {
    updateTimer = window.setInterval(() => {
      updateChartData()
    }, props.updateInterval)
  }
}

/**
 * 停止自动更新
 */
const stopAutoUpdate = () => {
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
}

// 监听数据变化
watch(() => props.chartData, () => {
  updateChartData()
}, { deep: true })

onMounted(() => {
  initChart()
  startAutoUpdate()
})

onUnmounted(() => {
  stopAutoUpdate()
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped>
.realtime-chart {
  width: 100%;
  height: 100%;
}

.chart-container {
  width: 100%;
  height: 100%;
}
</style>
```

### 3.5 产线监控大屏（ProductionLineDashboard.vue）

```vue
<!-- src/SmartAbp.Vue/src/views/dashboard/ProductionLineDashboard.vue -->
<template>
  <div class="dashboard-container" :style="containerStyle">
    <!-- 标题栏 -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">MES产线实时监控大屏</h1>
      <div class="dashboard-time">{{ currentTime }}</div>
    </div>
    
    <!-- KPI指标区 -->
    <div class="kpi-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <KPICard
            title="总产量"
            :value="realtimeData.totalProduction"
            unit="件"
            :trend="trendData.totalProduction"
            :icon="DataAnalysis"
            theme="primary"
          />
        </el-col>
        <el-col :span="6">
          <KPICard
            title="当前效率"
            :value="realtimeData.currentEfficiency"
            unit="%"
            :trend="trendData.currentEfficiency"
            :icon="TrendCharts"
            theme="success"
            :precision="1"
          />
        </el-col>
        <el-col :span="6">
          <KPICard
            title="设备利用率"
            :value="realtimeData.equipmentUtilization"
            unit="%"
            :trend="trendData.equipmentUtilization"
            :icon="Monitor"
            theme="warning"
            :precision="1"
          />
        </el-col>
        <el-col :span="6">
          <KPICard
            title="合格率"
            :value="realtimeData.qualifiedRate"
            unit="%"
            :trend="trendData.qualifiedRate"
            :icon="CircleCheck"
            theme="success"
            :precision="1"
          />
        </el-col>
      </el-row>
    </div>
    
    <!-- 图表区 -->
    <div class="chart-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-panel">
            <h3 class="chart-title">生产趋势</h3>
            <RealtimeChart
              chart-id="production-trend"
              :chart-data="realtimeData.sensorDataHistory"
              chart-type="line"
            />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-panel">
            <h3 class="chart-title">设备状态</h3>
            <RealtimeChart
              chart-id="equipment-status"
              :chart-data="equipmentStatusChartData"
              chart-type="bar"
            />
          </div>
        </el-col>
      </el-row>
    </div>
    
    <!-- 设备列表 -->
    <div class="equipment-section">
      <h3 class="section-title">设备实时状态</h3>
      <el-row :gutter="10">
        <el-col
          v-for="equipment in realtimeData.equipmentStatuses"
          :key="equipment.equipmentId"
          :span="6"
        >
          <div class="equipment-card" :class="`equipment-card--${equipment.status}`">
            <div class="equipment-name">{{ equipment.equipmentName }}</div>
            <div class="equipment-status">
              <el-tag :type="getStatusType(equipment.status)">
                {{ getStatusLabel(equipment.status) }}
              </el-tag>
            </div>
            <div class="equipment-data">
              <span>温度: {{ equipment.temperature }}°C</span>
              <span>压力: {{ equipment.pressure }} MPa</span>
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
import { useWebSocket } from '@/composables/useWebSocket'
import KPICard from '@/components/dashboard/KPICard.vue'
import RealtimeChart from '@/components/dashboard/RealtimeChart.vue'
import { DataAnalysis, TrendCharts, Monitor, CircleCheck } from '@element-plus/icons-vue'

const store = useProductionLineRealtimeStore()

// WebSocket连接
const { connect, disconnect, on } = useWebSocket({
  url: '/hubs/production-line',
  onConnected: () => {
    // 订阅产线数据
    invoke('SubscribeProductionLine', 'production-line-001')
  }
})

// 当前时间
const currentTime = ref('')
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

// 容器样式（固定1920×1080，自动缩放）
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

// 实时数据
const realtimeData = computed(() => store.realtimeData)
const trendData = computed(() => store.trendData)

// 设备状态图表数据
const equipmentStatusChartData = computed(() => {
  const statuses = realtimeData.value.equipmentStatuses
  const runningCount = statuses.filter(e => e.status === 'running').length
  const idleCount = statuses.filter(e => e.status === 'idle').length
  const faultCount = statuses.filter(e => e.status === 'fault').length
  
  return [
    { timestamp: new Date(), value: runningCount, category: '运行中' },
    { timestamp: new Date(), value: idleCount, category: '空闲' },
    { timestamp: new Date(), value: faultCount, category: '故障' }
  ]
})

// 设备状态标签
const getStatusType = (status: string) => {
  switch (status) {
    case 'running': return 'success'
    case 'idle': return 'warning'
    case 'fault': return 'danger'
    default: return 'info'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'running': return '运行中'
    case 'idle': return '空闲'
    case 'fault': return '故障'
    default: return '未知'
  }
}

onMounted(async () => {
  // 连接WebSocket
  await connect()
  
  // 监听实时数据更新
  on('ReceiveProductionLineData', (data) => {
    store.updateRealtimeData(data)
  })
  
  // 启动时间更新
  const timer = setInterval(updateTime, 1000)
  onUnmounted(() => clearInterval(timer))
  
  updateTime()
})

onUnmounted(() => {
  disconnect()
  store.reset()
})
</script>

<style scoped>
.dashboard-container {
  background: linear-gradient(135deg, #0c1e35 0%, #1a3a52 100%);
  color: #fff;
  font-family: 'Microsoft YaHei', sans-serif;
  overflow: hidden;
  position: relative;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid #00d4ff;
}

.dashboard-title {
  font-size: 36px;
  font-weight: bold;
  background: linear-gradient(90deg, #00d4ff, #00ffc8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.dashboard-time {
  font-size: 24px;
  color: #00d4ff;
  font-family: 'Consolas', monospace;
}

.kpi-section,
.chart-section,
.equipment-section {
  padding: 20px 40px;
}

.chart-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #00d4ff;
  border-radius: 8px;
  padding: 20px;
  height: 400px;
}

.chart-title,
.section-title {
  font-size: 20px;
  color: #00d4ff;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  padding-bottom: 10px;
}

.equipment-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #00d4ff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 10px;
}

.equipment-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.equipment-status {
  margin-bottom: 8px;
}

.equipment-data {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.equipment-card--fault {
  border-color: #f56c6c;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.7);
  }
  50% {
    box-shadow: 0 0 20px 10px rgba(245, 108, 108, 0);
  }
}
</style>
```

---

## 📝 四、开发步骤（5天详细计划）

### Day 1：基础组件和Composables开发（1天）

**任务清单**：
1. 创建useWebSocket.ts（WebSocket客户端）
2. 创建KPICard.vue（KPI卡片组件）
3. 创建RealtimeChart.vue（实时图表组件）
4. 单元测试

**验收标准**：
- ✅ WebSocket连接正常
- ✅ KPI卡片渲染正常
- ✅ ECharts图表渲染正常

### Day 2：Pinia Store开发（1天）

**任务清单**：
1. 创建productionLineRealtimeStore.ts
2. 创建smartConstructionRealtimeStore.ts
3. 实现实时数据更新逻辑
4. 实现趋势计算逻辑

**验收标准**：
- ✅ Store状态管理正常
- ✅ 实时数据更新正常
- ✅ 趋势计算正确

### Day 3：MES产线监控大屏开发（1天）

**任务清单**：
1. 创建ProductionLineDashboard.vue
2. 集成WebSocket客户端
3. 集成KPI卡片
4. 集成实时图表
5. 实现设备状态列表

**验收标准**：
- ✅ 大屏布局正确（1920×1080）
- ✅ WebSocket实时数据推送正常
- ✅ 所有组件渲染正常

### Day 4：智慧工地监控大屏开发（1天）

**任务清单**：
1. 创建SmartConstructionDashboard.vue
2. 实现视频监控组件
3. 实现塔吊/升降机数据展示
4. 实现扬尘监测数据展示

**验收标准**：
- ✅ 智慧工地大屏渲染正常
- ✅ 视频监控集成正常
- ✅ 实时数据展示正常

### Day 5：完整测试和优化（1天）

**任务清单**：
1. 性能优化（ECharts渲染优化）
2. 响应式适配优化
3. WebSocket重连机制测试
4. 文档更新

**验收标准**：
- ✅ 所有测试通过
- ✅ 性能达标（60FPS）
- ✅ 文档完整

---

## ✅ 五、验收标准

### 5.1 功能验收

| 验收项 | 验收标准 | 验收方式 |
|--------|---------|---------|
| WebSocket连接 | 连接正常、自动重连正常 | 集成测试 |
| 实时数据更新 | 数据推送延迟<100ms | 性能测试 |
| ECharts图表 | 图表渲染正常、实时更新 | 功能测试 |
| 大屏布局 | 适配1920×1080、自动缩放 | UI测试 |

### 5.2 性能验收

| 性能指标 | 目标值 | 验收方式 |
|---------|-------|---------|
| 首屏加载 | <2秒 | Chrome DevTools |
| 图表渲染 | 60FPS | Performance Monitor |
| 内存占用 | <300MB | Memory Profiler |
| WebSocket延迟 | <100ms | Network Monitor |

---

## 📦 六、交付清单

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `src/composables/useWebSocket.ts` | WebSocket客户端 | ✅ 新增 |
| `src/stores/productionLineRealtimeStore.ts` | 产线实时数据Store | ✅ 新增 |
| `src/components/dashboard/KPICard.vue` | KPI卡片组件 | ✅ 新增 |
| `src/components/dashboard/RealtimeChart.vue` | 实时图表组件 | ✅ 新增 |
| `src/views/dashboard/ProductionLineDashboard.vue` | 产线监控大屏 | ✅ 新增 |
| `src/views/dashboard/SmartConstructionDashboard.vue` | 智慧工地大屏 | ✅ 新增 |

---

## 🎯 七、成功指标

- ✅ WebSocket实时数据推送正常
- ✅ ECharts图表渲染流畅（60FPS）
- ✅ 大屏布局适配完美（1920×1080）
- ✅ 前端代码质量≥95分

**Phase 2B 完成标志**：
- ✅ 所有代码合并到主分支
- ✅ 所有测试通过
- ✅ MES和智慧工地大屏可正常运行

**下一步**：Phase 3B - UniApp前端链路开发

