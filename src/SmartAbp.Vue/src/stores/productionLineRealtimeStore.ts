// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 生产线实时数据Store
// 用于数字大屏实时数据状态管理
// 创建日期: 2025-10-21
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 生产线实时数据
 */
export interface ProductionLineRealtimeData {
  /** 产线ID */
  productionLineId: string
  /** 产线名称 */
  productionLineName: string
  /** 时间戳 */
  timestamp: Date
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // KPI指标
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /** 总产量 */
  totalProduction: number
  /** 当前效率（%） */
  currentEfficiency: number
  /** 设备利用率（%） */
  equipmentUtilization: number
  /** 合格率（%） */
  qualifiedRate: number
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 设备状态
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /** 运行中设备数 */
  runningEquipmentCount: number
  /** 待机设备数 */
  idleEquipmentCount: number
  /** 故障设备数 */
  faultEquipmentCount: number
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 生产数据
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /** 当前批次号 */
  currentBatchNo: string
  /** 当前产品型号 */
  currentProductModel: string
  /** 当前产量 */
  currentProduction: number
  /** 目标产量 */
  targetProduction: number
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 质量数据
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /** 合格数 */
  qualifiedCount: number
  /** 不合格数 */
  unqualifiedCount: number
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 能耗数据
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /** 当前功率（kW） */
  currentPower: number
  /** 累计能耗（kWh） */
  totalEnergy: number
}

/**
 * 时序数据点（用于图表）
 */
export interface TimeSeriesDataPoint {
  /** 时间戳 */
  timestamp: Date
  /** 数值 */
  value: number
}

/**
 * 趋势数据（用于实时图表）
 */
export interface ProductionLineTrendData {
  /** 产线ID */
  productionLineId: string
  
  /** 产量趋势（最近30个数据点） */
  productionTrend: TimeSeriesDataPoint[]
  
  /** 效率趋势（最近30个数据点） */
  efficiencyTrend: TimeSeriesDataPoint[]
  
  /** 能耗趋势（最近30个数据点） */
  energyTrend: TimeSeriesDataPoint[]
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Pinia Store定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 生产线实时数据Store
 * 
 * ✅ 基于SignalR实现实时数据推送
 * ✅ 自动管理WebSocket连接生命周期
 * ✅ 支持多产线数据订阅
 * ✅ 内置趋势数据管理（最近30个数据点）
 * ✅ 自动计算派生指标
 * 
 * @example
 * ```typescript
 * const store = useProductionLineRealtimeStore()
 * 
 * // 连接并订阅产线
 * await store.connectAndSubscribe('line-001')
 * 
 * // 获取实时数据
 * const data = store.getProductionLineData('line-001')
 * 
 * // 获取趋势数据
 * const trend = store.getTrendData('line-001')
 * 
 * // 断开连接
 * await store.disconnectAndUnsubscribe('line-001')
 * ```
 */
export const useProductionLineRealtimeStore = defineStore('productionLineRealtime', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 状态管理
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /** 产线实时数据映射（productionLineId → realtimeData） */
  const productionLineDataMap = ref<Map<string, ProductionLineRealtimeData>>(new Map())
  
  /** 趋势数据映射（productionLineId → trendData） */
  const trendDataMap = ref<Map<string, ProductionLineTrendData>>(new Map())
  
  /** 已订阅的产线ID列表 */
  const subscribedProductionLines = ref<Set<string>>(new Set())
  
  /** WebSocket连接状态 */
  const isWebSocketConnected = ref(false)
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WebSocket客户端
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const {
    connect: wsConnect,
    disconnect: wsDisconnect,
    on: wsOn,
    off: wsOff,
    invoke: wsInvoke,
    isConnected: wsIsConnected
  } = useWebSocket({
    url: `${import.meta.env.VITE_API_BASE_URL}/hubs/production-line`,
    onConnected: () => {
      console.log('[ProductionLineRealtimeStore] WebSocket连接成功')
      isWebSocketConnected.value = true
    },
    onDisconnected: () => {
      console.log('[ProductionLineRealtimeStore] WebSocket连接断开')
      isWebSocketConnected.value = false
    },
    onReconnected: async () => {
      console.log('[ProductionLineRealtimeStore] WebSocket重连成功，重新订阅产线数据')
      // 重连后重新订阅所有产线
      for (const productionLineId of subscribedProductionLines.value) {
        await wsInvoke('SubscribeProductionLine', productionLineId)
      }
    }
  })
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 事件处理
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 处理产线实时数据推送
   */
  const handleProductionLineDataUpdated = (data: ProductionLineRealtimeData) => {
    const productionLineId = data.productionLineId
    
    // 更新实时数据
    productionLineDataMap.value.set(productionLineId, data)
    
    // 更新趋势数据
    updateTrendData(productionLineId, data)
    
    console.log(`[ProductionLineRealtimeStore] 收到产线 ${productionLineId} 实时数据`, data)
  }
  
  /**
   * 更新趋势数据
   */
  const updateTrendData = (productionLineId: string, data: ProductionLineRealtimeData) => {
    let trendData = trendDataMap.value.get(productionLineId)
    
    if (!trendData) {
      trendData = {
        productionLineId,
        productionTrend: [],
        efficiencyTrend: [],
        energyTrend: []
      }
      trendDataMap.value.set(productionLineId, trendData)
    }
    
    const timestamp = data.timestamp
    
    // 添加新数据点
    trendData.productionTrend.push({ timestamp, value: data.totalProduction })
    trendData.efficiencyTrend.push({ timestamp, value: data.currentEfficiency })
    trendData.energyTrend.push({ timestamp, value: data.totalEnergy })
    
    // 保留最近30个数据点
    const maxDataPoints = 30
    if (trendData.productionTrend.length > maxDataPoints) {
      trendData.productionTrend = trendData.productionTrend.slice(-maxDataPoints)
      trendData.efficiencyTrend = trendData.efficiencyTrend.slice(-maxDataPoints)
      trendData.energyTrend = trendData.energyTrend.slice(-maxDataPoints)
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Actions（业务逻辑）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 连接并订阅产线实时数据
   * 
   * @param productionLineId 产线ID
   */
  const connectAndSubscribe = async (productionLineId: string) => {
    try {
      // 1. 如果WebSocket未连接，先连接
      if (!wsIsConnected.value) {
        await wsConnect()
        
        // 注册实时数据推送事件
        wsOn('ProductionLineDataUpdated', handleProductionLineDataUpdated)
      }
      
      // 2. 订阅产线数据
      await wsInvoke('SubscribeProductionLine', productionLineId)
      subscribedProductionLines.value.add(productionLineId)
      
      console.log(`[ProductionLineRealtimeStore] 已订阅产线 ${productionLineId}`)
    } catch (error) {
      console.error(`[ProductionLineRealtimeStore] 订阅产线 ${productionLineId} 失败`, error)
      throw error
    }
  }
  
  /**
   * 断开并取消订阅产线实时数据
   * 
   * @param productionLineId 产线ID
   */
  const disconnectAndUnsubscribe = async (productionLineId: string) => {
    try {
      // 1. 取消订阅产线数据
      await wsInvoke('UnsubscribeProductionLine', productionLineId)
      subscribedProductionLines.value.delete(productionLineId)
      
      console.log(`[ProductionLineRealtimeStore] 已取消订阅产线 ${productionLineId}`)
      
      // 2. 如果没有订阅的产线了，断开WebSocket
      if (subscribedProductionLines.value.size === 0) {
        await wsDisconnect()
        wsOff('ProductionLineDataUpdated')
      }
    } catch (error) {
      console.error(`[ProductionLineRealtimeStore] 取消订阅产线 ${productionLineId} 失败`, error)
      throw error
    }
  }
  
  /**
   * 获取产线实时数据
   * 
   * @param productionLineId 产线ID
   * @returns 实时数据或null
   */
  const getProductionLineData = (productionLineId: string): ProductionLineRealtimeData | null => {
    return productionLineDataMap.value.get(productionLineId) || null
  }
  
  /**
   * 获取趋势数据
   * 
   * @param productionLineId 产线ID
   * @returns 趋势数据或null
   */
  const getTrendData = (productionLineId: string): ProductionLineTrendData | null => {
    return trendDataMap.value.get(productionLineId) || null
  }
  
  /**
   * 清空所有数据
   */
  const clearAllData = () => {
    productionLineDataMap.value.clear()
    trendDataMap.value.clear()
    subscribedProductionLines.value.clear()
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Getters（计算属性）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 所有产线实时数据列表
   */
  const allProductionLinesData = computed(() => {
    return Array.from(productionLineDataMap.value.values())
  })
  
  /**
   * 已订阅的产线数量
   */
  const subscribedCount = computed(() => {
    return subscribedProductionLines.value.size
  })
  
  /**
   * 总产量（所有产线）
   */
  const totalProduction = computed(() => {
    return allProductionLinesData.value.reduce((sum, data) => sum + data.totalProduction, 0)
  })
  
  /**
   * 平均效率（所有产线）
   */
  const averageEfficiency = computed(() => {
    const count = allProductionLinesData.value.length
    if (count === 0) return 0
    
    const sum = allProductionLinesData.value.reduce((sum, data) => sum + data.currentEfficiency, 0)
    return sum / count
  })
  
  /**
   * 运行中设备总数（所有产线）
   */
  const totalRunningEquipment = computed(() => {
    return allProductionLinesData.value.reduce((sum, data) => sum + data.runningEquipmentCount, 0)
  })
  
  /**
   * 故障设备总数（所有产线）
   */
  const totalFaultEquipment = computed(() => {
    return allProductionLinesData.value.reduce((sum, data) => sum + data.faultEquipmentCount, 0)
  })
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 返回Store API
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  return {
    // 状态
    isWebSocketConnected,
    subscribedProductionLines,
    
    // Actions
    connectAndSubscribe,
    disconnectAndUnsubscribe,
    getProductionLineData,
    getTrendData,
    clearAllData,
    
    // Getters
    allProductionLinesData,
    subscribedCount,
    totalProduction,
    averageEfficiency,
    totalRunningEquipment,
    totalFaultEquipment
  }
})

