import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 系统模块相关类型定义
export interface SystemSettings {
  siteName: string
  siteDescription: string
  allowRegistration: boolean
  emailVerificationRequired: boolean
  maintenanceMode: boolean
  defaultLanguage: string
  timezone: string
}

export interface Permission {
  id: string
  name: string
  displayName: string
  isGranted: boolean
  parentName?: string
}

export interface Role {
  id: string
  name: string
  displayName: string
  description?: string
  isDefault: boolean
  isStatic: boolean
  permissions: Permission[]
}

export interface SystemInfo {
  version: string
  environment: string
  uptime: number
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
  serverTime: string
}

export const useSystemStore = defineStore('system', () => {
  // 状态
  const settings = ref<SystemSettings | null>(null)
  const roles = ref<Role[]>([])
  const permissions = ref<Permission[]>([])
  const systemInfo = ref<SystemInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isMaintenanceMode = computed(() => 
    settings.value?.maintenanceMode ?? false
  )

  const defaultRoles = computed(() =>
    roles.value.filter(role => role.isDefault)
  )

  const customRoles = computed(() =>
    roles.value.filter(role => !role.isDefault)
  )

  const grantedPermissions = computed(() =>
    permissions.value.filter(permission => permission.isGranted)
  )

  const systemHealth = computed(() => {
    if (!systemInfo.value) return 'unknown'
    
    const memoryPercentage = systemInfo.value.memoryUsage.percentage
    if (memoryPercentage > 90) return 'critical'
    if (memoryPercentage > 75) return 'warning'
    return 'healthy'
  })

  // 方法（占位符，待实现具体业务逻辑）
  const fetchSettings = async () => {
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

  const updateSettings = async (_newSettings: Partial<SystemSettings>) => {
    try {
      // TODO: 实现更新系统设置的API调用
      // const response = await systemApi.updateSettings(newSettings)
      // settings.value = response.data
      // return response.data
    } catch (err) {
      error.value = '更新系统设置失败'
      throw err
    }
  }

  const fetchRoles = async () => {
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

  const fetchPermissions = async () => {
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

  const fetchSystemInfo = async () => {
    try {
      // TODO: 实现获取系统信息的API调用
      // const response = await systemApi.getSystemInfo()
      // systemInfo.value = response.data
    } catch (err) {
      error.value = '获取系统信息失败'
      throw err
    }
  }

  const toggleMaintenanceMode = async (_enabled: boolean) => {
    try {
      // TODO: 实现切换维护模式的API调用
      // await systemApi.setMaintenanceMode(enabled)
      // if (settings.value) {
      //   settings.value.maintenanceMode = enabled
      // }
    } catch (err) {
      error.value = '切换维护模式失败'
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

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
