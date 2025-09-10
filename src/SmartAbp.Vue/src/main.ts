import './styles/design-system/index.css'  // 统一设计系统
import './styles/main.css'                 // 基础样式和工具类
import './plugins/dayjs'

/**
 * 低代码运行时能力注入：
 * - getEnhancedLoggerFactory：提供结构化日志创建工厂
 * - logManager：提供性能跟踪 start/end
 * - trackPerformance：Promise 化的通用性能包装
 * 说明：仅注入接口，不在此处引入低代码源或打破编译边界
 */
(function injectLowcodeRuntime() {
  const rt = (globalThis as any).__lowcodeRuntime || ((globalThis as any).__lowcodeRuntime = {})
  // 引用宿主现有日志系统与性能系统
  try {
    // 延迟读取，保持与项目路径解耦
    const { createLogger } = require('./utils/logging/enhanced-logger') as any
    const logMgrMod = require('./utils/logManager') as any

    rt.getEnhancedLoggerFactory = (opts: { level?: number; context?: Record<string, any>; transports?: any[] }) => {
      // 创建增强日志器实例，使用传入的配置选项
      const logger = createLogger({
        level: opts?.level,
        context: opts?.context,
        transports: opts?.transports
      })
      return { logger }
    }

    rt.logManager = {
      startPerformanceTracking: logMgrMod?.logManager?.startPerformanceTracking,
      endPerformanceTracking: logMgrMod?.logManager?.endPerformanceTracking
    }

    rt.trackPerformance = async <T>(name: string, fn: () => Promise<T> | T): Promise<T> => {
      if (typeof logMgrMod?.trackPerformance === 'function') {
        return await logMgrMod.trackPerformance(name, fn)
      }
      // 回退：直接执行
      return await Promise.resolve().then(fn)
    }
  } catch (e) {
    // 回退注入：仅提供最小能力，避免影响运行
    rt.getEnhancedLoggerFactory = (opts: { level?: number; context?: Record<string, any>; transports?: any[] }) => {
      // 使用console作为回退，忽略opts配置以保持简单性
      const base = console
      void opts // 显式标记参数为已使用但不需要处理
      const logger = {
        debug: base.debug.bind(base),
        info: base.info.bind(base),
        warn: base.warn.bind(base),
        error: (m: string, _err?: Error, ctx?: Record<string, any>) => base.error(m, ctx),
        success: base.info.bind(base),
        fatal: (m: string, _err?: Error, ctx?: Record<string, any>) => base.error(m, ctx),
        child: (_ctx: Record<string, any>) => logger,
        addTransport: (_t: unknown) => {},
        removeTransport: (_n: string) => {},
        getTransports: () => [],
        setLevel: (_: number) => {},
        getLevel: () => 1
      }
      return { logger }
    }
    rt.logManager = {}
    rt.trackPerformance = async <T>(_name: string, fn: () => Promise<T> | T): Promise<T> => Promise.resolve().then(fn)
  }
})()

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores'
import { authService } from '@/utils/auth'
import { globalContentCache } from '@/lowcode/federation/content-cache'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia).use(router)

async function bootstrap() {
  // 低代码：启用IndexedDB持久化并冷启动加载
  try {
    await globalContentCache.enablePersistence('smartabp-content-cache', 'entries')
    await globalContentCache.hydrateFromPersistence(2000)
    globalContentCache.configureQuota({ quotaBytes: 100 * 1024 * 1024, highWatermark: 0.9, lowWatermark: 0.7 })
    console.info('[LowCode] 内容缓存持久化已启用并完成冷启动加载')
  } catch (e) {
    console.warn('[LowCode] 启用内容缓存持久化失败（将仅使用内存缓存）', e)
  }

  // 初始化主题
  const themeStore = useThemeStore()
  themeStore.init()

  // 初始化认证状态（使用TypeScript认证服务）
  try {
    authService.initialize().catch((error) => {
      console.error('认证初始化失败:', error)
    })
  } catch (error) {
    console.error('认证初始化过程中发生错误:', error)
  }

  app.mount('#app')
}

void bootstrap()
