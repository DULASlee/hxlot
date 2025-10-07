import { defineStore } from 'pinia'
import { ref, computed, type Ref, type ComputedRef } from 'vue'

/**
 * 系统健康状态
 */
export type SystemHealth = 'healthy' | 'warning' | 'critical' | 'unknown'

/**
 * 系统设置接口
 */
export interface SystemSettings {
  maintenanceMode: boolean
  [key: string]: any
}

/**
 * 角色接口
 */
export interface Role {
  id: string
  name: string
  isDefault: boolean
  [key: string]: any
}

/**
 * 权限接口
 */
export interface Permission {
  id: string
  name: string
  isGranted: boolean
  [key: string]: any
}

/**
 * 系统信息接口
 */
export interface SystemInfo {
  memoryUsage: {
    percentage: number
    used: number
    total: number
  }
  cpuUsage?: number
  diskUsage?: {
    percentage: number
    used: number
    total: number
  }
  [key: string]: any
}

/**
 * 系统Store
 * 负责管理系统设置、角色、权限和系统信息
 */
export const useSystemStore = defineStore('system', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 状态定义
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const settings: Ref<SystemSettings | null> = ref(null)
  const roles: Ref<Role[]> = ref([])
  const permissions: Ref<Permission[]> = ref([])
  const systemInfo: Ref<SystemInfo | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 计算属性
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 是否维护模式
   */
  const isMaintenanceMode: ComputedRef<boolean> = computed(
    () => settings.value?.maintenanceMode ?? false
  )

  /**
   * 默认角色列表
   */
  const defaultRoles: ComputedRef<Role[]> = computed(() =>
    roles.value.filter(role => role.isDefault)
  )

  /**
   * 自定义角色列表
   */
  const customRoles: ComputedRef<Role[]> = computed(() =>
    roles.value.filter(role => !role.isDefault)
  )

  /**
   * 已授权权限列表
   */
  const grantedPermissions: ComputedRef<Permission[]> = computed(() =>
    permissions.value.filter(permission => permission.isGranted)
  )

  /**
   * 系统健康状态
   */
  const systemHealth: ComputedRef<SystemHealth> = computed(() => {
    if (!systemInfo.value) return 'unknown'
    
    const memoryPercentage = systemInfo.value.memoryUsage.percentage
    
    if (memoryPercentage > 90) return 'critical'
    if (memoryPercentage > 75) return 'warning'
    return 'healthy'
  })

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Actions
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 获取系统设置
   */
  const fetchSettings = async (): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      // TODO: 实现获取系统设置的API调用
      // const response = await systemApi.getSettings()
      // settings.value = response.data
    } catch (err) {
      error.value = '获取系统设置失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新系统设置
   */
  const updateSettings = async (_newSettings: Partial<SystemSettings>): Promise<void> => {
    try {
      // TODO: 实现更新系统设置的API调用
      // const response = await systemApi.updateSettings(_newSettings)
      // settings.value = response.data
      // return response.data
    } catch (err) {
      error.value = '更新系统设置失败'
      throw err
    }
  }

  /**
   * 获取角色列表
   */
  const fetchRoles = async (): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      // TODO: 实现获取角色列表的API调用
      // const response = await systemApi.getRoles()
      // roles.value = response.data
    } catch (err) {
      error.value = '获取角色列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取权限列表
   */
  const fetchPermissions = async (): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      // TODO: 实现获取权限列表的API调用
      // const response = await systemApi.getPermissions()
      // permissions.value = response.data
    } catch (err) {
      error.value = '获取权限列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取系统信息
   */
  const fetchSystemInfo = async (): Promise<void> => {
    try {
      // TODO: 实现获取系统信息的API调用
      // const response = await systemApi.getSystemInfo()
      // systemInfo.value = response.data
    } catch (err) {
      error.value = '获取系统信息失败'
      throw err
    }
  }

  /**
   * 切换维护模式
   */
  const toggleMaintenanceMode = async (_enabled: boolean): Promise<void> => {
    try {
      // TODO: 实现切换维护模式的API调用
      // await systemApi.setMaintenanceMode(_enabled)
      // if (settings.value) {
      //   settings.value.maintenanceMode = _enabled
      // }
    } catch (err) {
      error.value = '切换维护模式失败'
      throw err
    }
  }

  /**
   * 清除错误信息
   */
  const clearError = (): void => {
    error.value = null
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 返回Store接口
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  return {
    // 状态
    settings,
    roles,
    permissions,
    systemInfo,
    loading,
    error,

    // 计算属性
    isMaintenanceMode,
    defaultRoles,
    customRoles,
    grantedPermissions,
    systemHealth,

    // 方法
    fetchSettings,
    updateSettings,
    fetchRoles,
    fetchPermissions,
    fetchSystemInfo,
    toggleMaintenanceMode,
    clearError
  }
})
