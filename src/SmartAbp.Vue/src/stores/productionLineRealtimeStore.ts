/**
 * 生产线实时数据 Pinia Store
 * 管理MES生产线监控大屏的所有实时数据
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface EquipmentStatus {
  equipmentId: string
  equipmentName: string
  status: 'running' | 'stopped' | 'fault' | 'maintenance'
  temperature: number
  pressure: number
  vibration: number
}

interface SensorDataPoint {
  timestamp: Date
  value: number
}

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
  // 传感器历史数据（用于曲线图）
  sensorDataHistory: {
    temperature: SensorDataPoint[]
    pressure: SensorDataPoint[]
    vibration: SensorDataPoint[]
  }
}

interface AlarmData {
  id: string
  productionLineId: string
  message: string
  level: string
  priority: string
  timestamp: Date
  triggerValue: number
  thresholdValue?: number
  suggestedAction?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Store定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const useProductionLineRealtimeStore = defineStore('productionLineRealtime', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // State
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const realtimeData = ref<ProductionLineRealtimeData>({
    productionLineId: '',
    productionLineName: '加载中...',
    timestamp: new Date(),
    totalProduction: 0,
    currentEfficiency: 0,
    equipmentUtilization: 0,
    qualifiedRate: 0,
    equipmentStatuses: [],
    sensorDataHistory: {
      temperature: [],
      pressure: [],
      vibration: []
    }
  })

  const alarmHistory = ref<AlarmData[]>([])

  // 最大历史数据点数（曲线图）
  const MAX_HISTORY_POINTS = 60 // 保留最近60个数据点（约1分钟）

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Getters (Computed)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 设备状态汇总
   */
  const equipmentStatusSummary = computed(() => {
    const statuses = realtimeData.value.equipmentStatuses
    return {
      total: statuses.length,
      running: statuses.filter(e => e.status === 'running').length,
      stopped: statuses.filter(e => e.status === 'stopped').length,
      fault: statuses.filter(e => e.status === 'fault').length,
      maintenance: statuses.filter(e => e.status === 'maintenance').length
    }
  })

  /**
   * 温度趋势数据（ECharts格式）
   */
  const temperatureTrendData = computed(() => {
    const history = realtimeData.value.sensorDataHistory.temperature
    return {
      xAxis: history.map(item => new Date(item.timestamp).toLocaleTimeString('zh-CN', { hour12: false })),
      series: history.map(item => item.value)
    }
  })

  /**
   * 压力趋势数据（ECharts格式）
   */
  const pressureTrendData = computed(() => {
    const history = realtimeData.value.sensorDataHistory.pressure
    return {
      xAxis: history.map(item => new Date(item.timestamp).toLocaleTimeString('zh-CN', { hour12: false })),
      series: history.map(item => item.value)
    }
  })

  /**
   * 振动趋势数据（ECharts格式）
   */
  const vibrationTrendData = computed(() => {
    const history = realtimeData.value.sensorDataHistory.vibration
    return {
      xAxis: history.map(item => new Date(item.timestamp).toLocaleTimeString('zh-CN', { hour12: false })),
      series: history.map(item => item.value)
    }
  })

  /**
   * 最新告警（最近10条）
   */
  const latestAlarms = computed(() => {
    return alarmHistory.value.slice(0, 10)
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Actions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 更新实时数据
   * @param data 从SignalR接收的生产线数据
   */
  const updateRealtimeData = (data: any) => {
    console.log('[Store] 更新实时数据:', data)

    // 更新基本信息
    realtimeData.value.productionLineId = data.productionLineId
    realtimeData.value.productionLineName = data.productionLineName
    realtimeData.value.timestamp = new Date(data.timestamp)

    // 更新KPI指标
    realtimeData.value.totalProduction = data.totalProduction
    realtimeData.value.currentEfficiency = data.currentEfficiency
    realtimeData.value.equipmentUtilization = data.equipmentUtilization
    realtimeData.value.qualifiedRate = data.qualifiedRate

    // 更新设备状态
    if (data.equipmentStatuses && Array.isArray(data.equipmentStatuses)) {
      realtimeData.value.equipmentStatuses = data.equipmentStatuses
    }

    // 更新传感器历史数据（用于曲线图）
    if (data.equipmentStatuses && data.equipmentStatuses.length > 0) {
      const timestamp = new Date(data.timestamp)

      // 温度数据
      const avgTemperature = data.equipmentStatuses.reduce((sum: number, eq: any) => sum + eq.temperature, 0) / data.equipmentStatuses.length
      addSensorDataPoint('temperature', { timestamp, value: avgTemperature })

      // 压力数据
      const avgPressure = data.equipmentStatuses.reduce((sum: number, eq: any) => sum + eq.pressure, 0) / data.equipmentStatuses.length
      addSensorDataPoint('pressure', { timestamp, value: avgPressure })

      // 振动数据
      const avgVibration = data.equipmentStatuses.reduce((sum: number, eq: any) => sum + eq.vibration, 0) / data.equipmentStatuses.length
      addSensorDataPoint('vibration', { timestamp, value: avgVibration })
    }
  }

  /**
   * 添加传感器数据点（内部方法）
   */
  const addSensorDataPoint = (sensorType: 'temperature' | 'pressure' | 'vibration', dataPoint: SensorDataPoint) => {
    const history = realtimeData.value.sensorDataHistory[sensorType]
    
    // 添加新数据点
    history.push(dataPoint)
    
    // 保持最大数据点数量
    if (history.length > MAX_HISTORY_POINTS) {
      history.shift() // 移除最旧的数据点
    }
  }

  /**
   * 添加告警
   * @param alarm 从SignalR接收的告警数据
   */
  const addAlarm = (alarm: AlarmData) => {
    console.log('[Store] 收到告警:', alarm)
    
    // 添加到告警历史（最新的在前面）
    alarmHistory.value.unshift(alarm)
    
    // 保留最近50条告警
    if (alarmHistory.value.length > 50) {
      alarmHistory.value = alarmHistory.value.slice(0, 50)
    }
  }

  /**
   * 清空告警历史
   */
  const clearAlarms = () => {
    alarmHistory.value = []
  }

  /**
   * 重置所有数据
   */
  const reset = () => {
    realtimeData.value = {
      productionLineId: '',
      productionLineName: '加载中...',
      timestamp: new Date(),
      totalProduction: 0,
      currentEfficiency: 0,
      equipmentUtilization: 0,
      qualifiedRate: 0,
      equipmentStatuses: [],
      sensorDataHistory: {
        temperature: [],
        pressure: [],
        vibration: []
      }
    }
    alarmHistory.value = []
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 返回
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return {
    // State
    realtimeData,
    alarmHistory,
    
    // Getters
    equipmentStatusSummary,
    temperatureTrendData,
    pressureTrendData,
    vibrationTrendData,
    latestAlarms,
    
    // Actions
    updateRealtimeData,
    addAlarm,
    clearAlarms,
    reset
  }
})
