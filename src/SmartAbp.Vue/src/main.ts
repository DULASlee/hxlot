
import './plugins/dayjs'
import './styles/main-theme.css' // 设计令牌系统（必须最先导入）
import './styles/design-system/index.css' // 统一设计系统
import './styles/enterprise-icons.css' // 企业级图标系统样式
import './styles/main.css' // 基础样式和工具类

/**
 * 全局Promise rejection处理器
 * 防止未处理的Promise rejection导致控制台错误
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  // 记录错误但不阻止默认行为
  if (typeof event.reason?.message === 'string') {
    console.warn('Promise rejection details:', event.reason.message)
  }
  // 可以选择preventDefault()来阻止默认的错误报告
  // event.preventDefault()
})

  /**
   * 低代码运行时能力注入：
   * - getEnhancedLoggerFactory：提供结构化日志创建工厂
   * - logManager：提供性能跟踪 start/end
   * - trackPerformance：Promise 化的通用性能包装
   * 说明：仅注入接口，不在此处引入低代码源或打破编译边界
   */
  ; (function injectLowcodeRuntime() {
    const rt = (globalThis as unknown as { __lowcodeRuntime?: any }).__lowcodeRuntime || ((globalThis as unknown as { __lowcodeRuntime: any }).__lowcodeRuntime = {})
    // 引用宿主现有日志系统与性能系统
    try {
      // 延迟读取，保持与项目路径解耦
      const { createLogger } = require("./utils/logging/enhanced-logger") as { createLogger: any }
      const logMgrMod = require("./utils/logManager") as { default: any }

      rt.getEnhancedLoggerFactory = (opts: {
        level?: number
        context?: Record<string, any>
        transports?: any[]
      }) => {
        // 创建增强日志器实例，使用传入的配置选项
        const logger = createLogger({
          level: opts?.level,
          context: opts?.context,
          transports: opts?.transports,
        })
        return { logger }
      }

      rt.logManager = {
        startPerformanceTracking: logMgrMod?.default?.logManager?.startPerformanceTracking,
        endPerformanceTracking: logMgrMod?.default?.logManager?.endPerformanceTracking,
      }

      rt.trackPerformance = async <T>(name: string, fn: () => Promise<T> | T): Promise<T> => {
        if (typeof logMgrMod?.default?.trackPerformance === "function") {
          return await logMgrMod.default.trackPerformance(name, fn)
        }
        // 回退：直接执行
        return await Promise.resolve().then(fn)
      }
    } catch (e) {
      // 回退注入：仅提供最小能力，避免影响运行
      rt.getEnhancedLoggerFactory = (opts: {
        level?: number
        context?: Record<string, any>
        transports?: any[]
      }) => {
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
          addTransport: (_t: unknown) => { },
          removeTransport: (_n: string) => { },
          getTransports: () => [],
          setLevel: (_: number) => { },
          getLevel: () => 1,
        }
        return { logger }
      }
      rt.logManager = {}
      rt.trackPerformance = async <T>(_name: string, fn: () => Promise<T> | T): Promise<T> =>
        Promise.resolve().then(fn)
    }
  })()

import { createPinia } from "pinia";
import { createApp } from "vue";
// pinia-plugin-persistedstate插件
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";
import { i18n } from "./plugins/i18n";
import router from "./router";
import { logger } from "./utils/logger";
// 🔥 【架构铁律二】统一组件注册系统
// 使用ComponentRegistry替代Vue原生注册
import { registerCoreComponents } from '@smartabp/lowcode-core';
import { registerDesignerComponents } from '@smartabp/lowcode-designer';
import { registerSharedComponents } from '@smartabp/lowcode-shared';
import ComponentRegistryBridge from './plugins/component-registry-bridge';
// import { createEnterpriseIconSystem } from "./plugins/enterpriseIcons" // TODO: enterpriseIcons.ts 文件不存在，暂时注释
// Element Plus message在此文件不强依赖，避免类型噪声
// 低代码设计器 store 暂未对外导出，先移除硬依赖

// Highlight.js for code syntax highlighting
import hljs from "highlight.js/lib/core";
import "highlight.js/styles/vs2015.css";
// Import specific languages
import csharp from "highlight.js/lib/languages/csharp";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";

// Register languages
hljs.registerLanguage("csharp", csharp)
hljs.registerLanguage("typescript", typescript)
hljs.registerLanguage("javascript", javascript)
hljs.registerLanguage("json", json)
hljs.registerLanguage("xml", xml)
hljs.registerLanguage("sql", sql)

// Vue plugin for highlight.js
import hljsVuePlugin from "@highlightjs/vue-plugin";

// 引入 appshell 聚合产物
import { runInit, runPostInit, runPreInit } from "@/appshell/lifecycle.generated";
import { generatedMenus } from "@/appshell/menu/menu.generated";
import { generatedRoutes } from "@/appshell/router/routes.generated";
import { generatedStores } from "@/appshell/stores/stores.generated";
import { menuConfig } from "@/config/menus";
import type { MenuItem } from "@/types/menu";

// 动态注册路由
if (Array.isArray(generatedRoutes) && generatedRoutes.length > 0) {
  generatedRoutes.forEach((r) => router.addRoute(r as import('vue-router').RouteRecordRaw))
}

// 合并菜单（运行时注入）
if (Array.isArray(generatedMenus) && generatedMenus.length > 0) {
  try {
    menuConfig.menus.push(...(generatedMenus as MenuItem[]))
  } catch (_) {
    // Ignore menu merge errors
  }
}

// 🗄️ 配置Pinia持久化插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const storesFactory = generatedStores?.()
if (storesFactory && typeof storesFactory === "object") {
  // 占位
}

// 运行生命周期占位（忽略错误）
(async () => {
  try {
    await runPreInit?.({ app: null })
    await runInit?.({ app: null })
    await runPostInit?.({ app: null })
  } catch (_e) {
    // Ignore lifecycle errors
  }
})()

const app = createApp(App)

// 🛡️ 配置全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Global Error]', {
    error: err,
    componentName: instance?.$options.name || 'Unknown',
    info
  })

  // 记录到日志系统
  logger.error('Vue组件错误', {
    error: err,
    component: instance?.$options.name || 'Unknown',
    lifecycle: info,
    stack: (err as Error)?.stack
  })

  // 在开发环境显示友好的错误提示
  // 开发环境控制台提示（避免在入口耦合UI提示）
  if (import.meta.env.DEV) {
    console.error('[UI Error]', (err as Error)?.message)
  }
}

// 配置全局警告处理（开发环境）
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('[Vue Warning]', {
      message: msg,
      component: instance?.$options.name || 'Unknown',
      trace
    })
  }
}

// 🎨 配置企业级图标系统 - TODO: 暂时注释，等待enterpriseIcons.ts实现
// const enterpriseIconSystem = createEnterpriseIconSystem({
//   theme: {
//     name: 'smartabp-enterprise',
//     colors: {
//       primary: '#409EFF',
//       success: '#67C23A',
//       warning: '#E6A23C',
//       danger: '#F56C6C',
//       info: '#909399',
//       text: '#303133'
//     }
//   },
//   preloadIcons: [
//     'dashboard', 'user', 'users', 'settings', 'business',
//     'project', 'order', 'customer', 'lowcode', 'code',
//     'add', 'edit', 'delete', 'search', 'refresh'
//   ],
//   enableCache: true,
//   debug: import.meta.env.DEV
// })

// 🔥 【架构铁律二】统一组件注册 - 按依赖顺序注册
console.log('🚀 开始统一组件注册系统初始化...')
registerSharedComponents()   // 1. 基础组件（无依赖）
registerCoreComponents()     // 2. 核心组件（依赖shared）
registerDesignerComponents(app) // 3. 设计器组件（依赖core+shared）
console.log('✅ 所有组件已注册到ComponentRegistry')

app.use(pinia).use(router).use(i18n).use(ElementPlus).use(hljsVuePlugin).use(ComponentRegistryBridge)
// .use(enterpriseIconSystem) // TODO: 暂时注释

async function bootstrap() {
  // 低代码：启用IndexedDB持久化并冷启动加载
  try {
    const anyRt: any = (globalThis as unknown as { __lowcodeRuntime?: any }).__lowcodeRuntime
    const cache = anyRt?.contentCache
    if (cache?.enablePersistence) {
      await cache.enablePersistence("smartabp-content-cache", "entries")
      await cache.hydrateFromPersistence(2000)
      cache.configureQuota?.({
        quotaBytes: 100 * 1024 * 1024,
        highWatermark: 0.9,
        lowWatermark: 0.7,
      })
      logger.info("[LowCode] 内容缓存持久化已启用并完成冷启动加载")
    }
  } catch (e) {
    logger.warn("[LowCode] 启用内容缓存持久化失败（将仅使用内存缓存）", { error: e })
  }

  // 初始化性能监控
  const { performanceMonitor } = await import("./utils/performance/monitor")
  performanceMonitor.init()
  logger.info("[Performance Monitor] 性能监控已启动")

  // 初始化主题
  // 主题初始化暂时跳过外部store强依赖

  // 🔐 初始化认证状态 - 从localStorage恢复登录信息
  const { useAuthStore } = await import("./stores/modules/auth")
  const authStore = useAuthStore()
  await authStore.initialize()
  logger.info("[Auth] 认证状态已初始化", {
    isAuthenticated: authStore.isAuthenticated,
    hasUser: !!authStore.userInfo
  })

  // 🔥 初始化实体建模API桥接 - 修复花瓶式实现
  const { initializeEntityModelingApiBridge } = await import("./core/api/entity-modeling-bridge")
  initializeEntityModelingApiBridge()
  logger.info("[EntityModeling] API桥接已初始化，Store现在使用真实API")

  // 🎨 初始化图标风格 - 从localStorage恢复图标风格偏好
  const { useIconStyleStore } = await import("./stores/modules/iconStyle")
  const iconStyleStore = useIconStyleStore()
  iconStyleStore.loadIconStyle()
  logger.info("[IconStyle] 图标风格已加载", {
    currentStyle: iconStyleStore.currentStyle
  })

  app.mount("#app")

  // 首屏加载完成后记录性能指标
  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = performanceMonitor.getMetrics()
      const cwv = performanceMonitor.getCoreWebVitals()
      logger.info("[Performance Monitor] 首屏加载完成", {
        metrics,
        coreWebVitals: cwv,
        rating: cwv.rating
      })
    }, 0)
  })
}

void bootstrap()
