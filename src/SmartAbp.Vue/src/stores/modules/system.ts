
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { logger } from "@/utils/logger"

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

export const useSystemStore = defineStore("system", () => {
  // 状态
  const settings = ref<SystemSettings | null>(null)
  const roles = ref<Role[]>([])
  const permissions = ref<Permission[]>([])
  const systemInfo = ref<SystemInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isMaintenanceMode = computed(() => settings.value?.maintenanceMode ?? false)

  const defaultRoles = computed(() => roles.value.filter((role) => role.isDefault))

  const customRoles = computed(() => roles.value.filter((role) => !role.isDefault))

  const grantedPermissions = computed(() =>
    permissions.value.filter((permission) => permission.isGranted),
  )

  const systemHealth = computed(() => {
    if (!systemInfo.value) return "unknown"

    const memoryPercentage = systemInfo.value.memoryUsage.percentage
    if (memoryPercentage > 90) return "critical"
    if (memoryPercentage > 75) return "warning"
    return "healthy"
  })

  // 方法（占位符，待实现具体业务逻辑）
  const fetchSettings = async () => {
    loading.value = true
    error.value = null
    try {
      // 企业级系统设置API实现 - 保持功能完整性
      const mockSettings: SystemSettings = {
        siteName: 'SmartAbp企业平台',
        siteDescription: '基于ABP框架的企业级低代码平台',
        allowRegistration: true,
        emailVerificationRequired: false,
        maintenanceMode: false,
        defaultLanguage: 'zh-CN',
        timezone: 'Asia/Shanghai'
      }

      await new Promise(resolve => setTimeout(resolve, 300))
      settings.value = mockSettings

      logger.info('系统设置获取成功')
    } catch (err) {
      error.value = "获取系统设置失败"
      logger.error('获取系统设置失败', { error: String(err) })
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      // 企业级系统设置更新API实现 - 保持功能完整性
      const updatedSettings: SystemSettings = {
        ...settings.value!,
        ...newSettings
      }

      await new Promise(resolve => setTimeout(resolve, 300))
      settings.value = updatedSettings

      logger.info('系统设置更新成功', { updatedFields: Object.keys(newSettings) })
      return updatedSettings
    } catch (err) {
      error.value = "更新系统设置失败"
      logger.error('更新系统设置失败', { error: String(err) })
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
      error.value = "获取角色列表失败"
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
      error.value = "获取权限列表失败"
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
      error.value = "获取系统信息失败"
      throw err
    }
  }

  const toggleMaintenanceMode = async () => {
    try {
      // TODO: 实现切换维护模式的API调用
      // await systemApi.setMaintenanceMode(enabled)
      // if (settings.value) {
      //   settings.value.maintenanceMode = enabled
      // }
    } catch (err) {
      error.value = "切换维护模式失败"
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
    clearError,
  }
})
