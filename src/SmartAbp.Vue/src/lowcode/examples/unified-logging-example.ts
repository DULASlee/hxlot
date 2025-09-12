/**
 * 统一日志系统使用示例
 * 展示如何在低代码引擎中使用前端完善的日志系统
 */

import { LowCodeKernel } from "../kernel/core"
import { Vue3Plugin } from "../plugins/vue3/index"
import { createLowCodeLogger } from "../adapters/logger-adapter"
import { logger } from "@/utils/logger"
import { logManager, trackPerformance } from "@/utils/logManager"

/**
 * 示例1: 基础日志记录
 */
export function basicLoggingExample() {
  console.log("=== 基础日志记录示例 ===")

  // 创建低代码引擎专用日志器
  const lowcodeLogger = createLowCodeLogger({
    module: "example",
    version: "1.0.0",
  })

  // 基础日志级别
  lowcodeLogger.debug("调试信息", { userId: 123 })
  lowcodeLogger.info("用户登录", { userId: 123, ip: "192.168.1.1" })
  lowcodeLogger.warn("性能警告", { duration: 1500 })
  lowcodeLogger.error("操作失败", new Error("网络错误"), { operation: "saveData" })

  // 子日志器
  const pluginLogger = lowcodeLogger.child({ plugin: "vue3-generator" })
  pluginLogger.info("插件初始化完成", { pluginVersion: "2.1.0" })
}

/**
 * 示例2: 性能追踪
 */
export async function performanceTrackingExample() {
  console.log("=== 性能追踪示例 ===")

  const logger = createLowCodeLogger({ module: "performance-test" })

  // 方式1: 使用LoggerAdapter的trackOperation方法
  const result1 = logger.trackOperation
    ? await logger.trackOperation("data-processing", async () => {
        // 模拟耗时操作
        await new Promise((resolve) => setTimeout(resolve, 100))
        return { recordsProcessed: 1000, success: true }
      })
    : { recordsProcessed: 0, success: false }

  console.log("操作结果:", result1)

  // 方式2: 使用trackPerformance函数 (推荐)
  const result = await trackPerformance(
    "complex-calculation",
    async () => {
      // 模拟复杂计算
      await new Promise((resolve) => setTimeout(resolve, 200))
      return { result: 42, iterations: 1000 }
    },
    "math", // category参数
  )

  console.log("计算结果:", result)

  // 方式3: 使用组件日志器的trackOperation方法
  const componentLogger = createLowCodeLogger({ module: "DataProcessor" })

  const processResult = componentLogger.trackOperation
    ? await componentLogger.trackOperation("data-processing", async () => {
        // 模拟数据处理
        await new Promise((resolve) => setTimeout(resolve, 200))
        return { processed: 1000, errors: 0 }
      })
    : { processed: 0, errors: 1 }

  console.log("处理结果:", processResult)
}

/**
 * 示例3: 完整的低代码引擎使用场景
 */
export async function fullEngineLoggingExample() {
  console.log("=== 完整引擎日志示例 ===")

  // 创建内核实例
  const kernel = new LowCodeKernel({
    logging: {
      level: "debug",
      enableConsole: true,
    },
  })

  try {
    // 初始化内核
    await kernel.initialize()

    // 注册Vue3插件
    const vue3Plugin = new Vue3Plugin()
    await kernel.registerPlugin(vue3Plugin)

    // 生成组件（会自动记录性能指标）
    const schema: any = {
      id: "test-component",
      version: "1.0.0",
      type: "component" as const,
      metadata: { name: "TestComponent", version: "1.0.0" },
      template: { type: "template" as const, content: "<div>Hello World</div>" },
      script: { lang: "ts" as const, setup: true, imports: [] },
      style: { lang: "css" as const, scoped: true, content: ".hello { color: blue; }" },
      props: [],
      emits: [],
    }

    const result = await kernel.generate(schema)
    console.log("生成结果长度:", result.result?.toString()?.length || 0)

    // 获取性能统计
    console.log("=== 性能统计 ===")
    console.log(logManager.getPerformanceStats())

    // 获取错误统计
    console.log("=== 错误统计 ===")
    console.log(logManager.getErrorStats())

    // 导出诊断报告
    console.log("=== 诊断报告 ===")
    const diagnosticReport = logManager.exportDiagnosticReport()
    console.log("报告大小:", diagnosticReport.length)
  } catch (error) {
    console.error("引擎示例失败:", error)
  } finally {
    await kernel.shutdown()
  }
}

/**
 * 示例4: 日志分析和导出
 */
export function loggingAnalysisExample() {
  console.log("=== 日志分析示例 ===")

  // 获取所有日志
  const allLogs = logger.getLogs()
  console.log(`总日志数: ${allLogs.length}`)

  // 获取统计信息
  const stats = logger.getStats()
  console.log("日志统计:", stats)

  // 导出不同格式的日志
  console.log("=== 日志导出 ===")

  // JSON格式
  const jsonLogs = logger.export("json")
  console.log("JSON导出大小:", jsonLogs.length)

  // CSV格式
  const csvLogs = logger.export("csv")
  console.log("CSV导出大小:", csvLogs.length)

  // 纯文本格式
  const txtLogs = logger.export("txt")
  console.log("TXT导出大小:", txtLogs.length)

  // 完整诊断报告
  const fullReport = logManager.exportDiagnosticReport()
  console.log("完整诊断报告大小:", fullReport.length)
}

/**
 * 示例5: 实时日志监控
 */
export function realtimeLoggingExample() {
  console.log("=== 实时日志监控示例 ===")

  const logger = createLowCodeLogger({ module: "realtime-monitor" })

  // 订阅日志变化 - 使用全局logger的订阅功能
  const globalLogger = require("@/utils/logger").logger
  const unsubscribe = globalLogger.subscribe((logs: any[]) => {
    console.log(`日志更新: 当前总数 ${logs.length}`)

    // 检查最新的错误日志
    const recentErrors = logs
      .filter((log: any) => log.level === 4) // ERROR级别
      .slice(-5) // 最近5条错误

    if (recentErrors.length > 0) {
      console.warn("发现最近错误:", recentErrors.length)
    }
  })

  // 模拟一些日志操作
  logger.info("开始实时监控")
  logger.debug("处理数据包1")
  logger.debug("处理数据包2")
  logger.warn("连接不稳定")
  logger.error("连接失败", new Error("网络超时"))
  logger.info("重新连接成功")

  // 5秒后取消订阅
  setTimeout(() => {
    unsubscribe()
    logger.info("停止实时监控")
  }, 5000)
}

// 辅助函数已移除，因为未使用

/**
 * 运行所有示例
 */
export async function runAllLoggingExamples() {
  console.log("🚀 开始运行统一日志系统示例")

  try {
    // 清空之前的日志
    logger.clear()
    logManager.cleanup()

    basicLoggingExample()
    await performanceTrackingExample()
    await fullEngineLoggingExample()
    loggingAnalysisExample()
    realtimeLoggingExample()

    console.log("✅ 所有日志示例运行完成")
  } catch (error) {
    console.error("❌ 示例运行失败:", error)
  }
}

// 如果直接运行此文件
if (typeof window !== "undefined") {
  // 在浏览器环境中，可以手动调用
  ;(window as any).runLoggingExamples = runAllLoggingExamples
  console.log("💡 在控制台运行: runLoggingExamples()")
}
