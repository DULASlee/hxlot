/**
 * 🔥 Schema版本检测Hook
 * 
 * 功能:
 * 1. 自动检测服务端版本
 * 2. 监听版本变化
 * 3. 提供版本兼容性状态
 * 
 * @version 1.0.0
 * @author SmartAbp架构团队
 * @date 2025-10-06
 */

import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { CompatibilityResult, VersionInfo } from './SchemaVersionManager'
import { versionManager } from './SchemaVersionManager'

/**
 * Hook返回值
 */
export interface UseSchemaVersionReturn {
    /** 兼容性检查结果 */
    compatibilityResult: Ref<CompatibilityResult | null>
    /** 是否正在检查 */
    isChecking: Ref<boolean>
    /** 客户端版本信息 */
    clientVersion: VersionInfo
    /** 服务端版本字符串 */
    serverVersion: Ref<string | null>
    /** 是否兼容 */
    isCompatible: Ref<boolean>
    /** 是否需要操作 */
    needAction: Ref<boolean>
    /** 手动检查版本 */
    checkVersion: (serverVersion: string) => void
    /** 处理升级 */
    handleUpgrade: () => void
}

/**
 * Hook选项
 */
export interface UseSchemaVersionOptions {
    /** 是否自动检查 */
    autoCheck?: boolean
    /** 检查间隔(毫秒) */
    checkInterval?: number
    /** 版本检查API地址 */
    versionApiUrl?: string
}

/**
 * Schema版本检测Hook
 * @param options Hook选项
 * @returns Hook返回值
 */
export function useSchemaVersion(options: UseSchemaVersionOptions = {}): UseSchemaVersionReturn {
    const {
        autoCheck = false,
        checkInterval = 60000, // 默认1分钟
        versionApiUrl = '/api/lowcode/schema/version'
    } = options

    /** 兼容性检查结果 */
    const compatibilityResult = ref<CompatibilityResult | null>(null)

    /** 是否正在检查 */
    const isChecking = ref(false)

    /** 服务端版本 */
    const serverVersion = ref<string | null>(null)

    /** 定时器ID */
    let intervalId: ReturnType<typeof setInterval> | null = null

    /** 客户端版本信息 */
    const clientVersion = versionManager.parseVersion(
        versionManager.getCurrentVersion()
    )

    /** 是否兼容 */
    const isCompatible = computed(() => {
        if (!compatibilityResult.value) return true
        return compatibilityResult.value.status === 'compatible'
    })

    /** 是否需要操作 */
    const needAction = computed(() => {
        return compatibilityResult.value?.needAction || false
    })

    /**
     * 检查版本兼容性
     * @param serverVer 服务端版本号
     */
    function checkVersion(serverVer: string) {
        serverVersion.value = serverVer
        compatibilityResult.value = versionManager.checkCompatibility(serverVer)
    }

    /**
     * 从服务端获取版本并检查
     */
    async function fetchAndCheckVersion() {
        if (isChecking.value) return

        isChecking.value = true

        try {
            const response = await fetch(versionApiUrl)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const data = await response.json()
            const serverVer = data.version || data.schemaVersion || data.data?.version

            if (serverVer) {
                checkVersion(serverVer)
            } else {
                console.warn('[SchemaVersion] 服务端未返回版本信息:', data)
            }
        } catch (error) {
            console.error('[SchemaVersion] 获取服务端版本失败:', error)
            // 不抛出错误,避免影响应用运行
        } finally {
            isChecking.value = false
        }
    }

    /**
     * 启动自动检查
     */
    function startAutoCheck() {
        if (!autoCheck || intervalId) return

        // 立即检查一次
        fetchAndCheckVersion()

        // 定时检查
        intervalId = setInterval(() => {
            fetchAndCheckVersion()
        }, checkInterval)
    }

    /**
     * 停止自动检查
     */
    function stopAutoCheck() {
        if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
        }
    }

    /**
     * 处理升级 (刷新页面)
     */
    function handleUpgrade() {
        window.location.reload()
    }

    // 生命周期
    onMounted(() => {
        startAutoCheck()
    })

    onUnmounted(() => {
        stopAutoCheck()
    })

    return {
        compatibilityResult,
        isChecking,
        clientVersion,
        serverVersion,
        isCompatible,
        needAction,
        checkVersion,
        handleUpgrade
    }
}

