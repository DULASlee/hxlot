 
/**
 * SmartAbp 统一日志系统完整使用示例
 * 展示传输器架构、结构化日志、子日志器、性能追踪等功能
 */

import {
  logger,
  lowcodeLogger,
  createAppLogger,
  createComponentLogger,
  createServiceLogger,
  createPluginLogger,
  log,
  perf,
  system,
  userActivity,
  api,
  database,
  useLogger,
  usePerformanceTracking,
  ConsoleTransport,
  FileTransport,
  MemoryTransport,
  NetworkTransport,
  LogLevel,
} from "./index"

/**
 * 示例1: 基础日志使用
 */
export function basicLoggingExample() {
  console.log("=== 基础日志使用示例 ===")

  // 使用全局日志器
  logger.debug("应用启动调试信息", { version: "1.0.0", environment: "development" })
  logger.info("用户登录", { userId: "12345", username: "john.doe", loginTime: new Date() })
  logger.success("数据保存成功", { recordId: "rec_123", tableName: "users" })
  logger.warn("缓存即将过期", { cacheKey: "user_sessions", ttl: 300 })
  logger.error("API调用失败", new Error("网络超时"), { endpoint: "/api/users", timeout: 5000 })
  logger.fatal("系统严重错误", new Error("数据库连接失败"), { database: "main", attempts: 3 })

  // 使用便捷方法
  log.info("这是便捷的日志方法", { module: "example" })
}

/**
 * 示例2: 子日志器使用
 */
export function childLoggerExample() {
  console.log("=== 子日志器示例 ===")

  // 创建应用级日志器
  const appLogger = createAppLogger("SmartAbp")
  appLogger.info("应用初始化完成", { startTime: Date.now(), modules: ["auth", "routing", "ui"] })

  // 创建组件级日志器
  const componentLogger = createComponentLogger("UserManagement")
  componentLogger.debug("组件挂载", { props: { userId: "123" } })
  componentLogger.info("用户数据加载", { userId: "123", loadTime: "245ms" })

  // 创建服务级日志器
  const serviceLogger = createServiceLogger("UserService")
  serviceLogger.info("服务方法调用", { method: "getUserById", params: { id: "123" } })

  // 创建插件级日志器
  const pluginLogger = createPluginLogger("vue3-generator")
  pluginLogger.info("插件执行", { operation: "generateComponent", inputSchema: "ButtonSchema" })

  // 深层子日志器
  const deepChildLogger = componentLogger.child({
    operation: "data-validation",
    validator: "email",
  })
  deepChildLogger.warn("数据验证警告", {
    field: "email",
    value: "invalid-email",
    rule: "email-format",
  })
}

/**
 * 示例3: 传输器架构演示
 */
export function transportExample() {
  console.log("=== 传输器架构示例 ===")

  // 创建自定义日志器，配置多个传输器
  const { createLogger } = require("./enhanced-logger")

  const customLogger = createLogger({
    level: LogLevel.DEBUG,
    context: { service: "transport-demo" },
    transports: [
      // 控制台传输器
      new ConsoleTransport({
        level: LogLevel.DEBUG,
        enableColors: true,
        enableGrouping: true,
      }),

      // 文件传输器
      new FileTransport({
        level: LogLevel.INFO,
        filePath: "logs/transport-demo.log",
        maxFileSize: 1024 * 1024, // 1MB
      }),

      // 内存传输器（用于测试）
      new MemoryTransport({
        level: LogLevel.DEBUG,
        maxEntries: 100,
      }),

      // 网络传输器（发送到远程服务器）
      new NetworkTransport({
        level: LogLevel.ERROR,
        endpoint: "https://api.example.com/logs",
        batchSize: 10,
        flushInterval: 5000,
      }),
    ],
    enableBatching: true,
    batchSize: 5,
    batchTimeout: 200,
  })

  // 测试所有传输器
  customLogger.debug("调试信息 - 只在控制台和内存中")
  customLogger.info("重要信息 - 在所有传输器中记录（除了网络）")
  customLogger.error("错误信息 - 在所有传输器中记录", new Error("测试错误"))

  // 手动刷新传输器
  setTimeout(async () => {
    await customLogger.flush()
    console.log("所有传输器已刷新")
  }, 1000)
}

/**
 * 示例4: 性能追踪
 */
export async function performanceTrackingExample() {
  console.log("=== 性能追踪示例 ===")

  // 方式1: 使用全局性能追踪
  const result1 = await perf.trackAsync(
    "database-query",
    async () => {
      // 模拟数据库查询
      await new Promise((resolve) => setTimeout(resolve, 150))
      return { rows: 25, queryTime: "150ms" }
    },
    { table: "users", operation: "select" },
  )

  console.log("查询结果:", result1)

  // 方式2: 使用计时器
  const timer = perf.start("complex-calculation", { algorithm: "fibonacci", input: 35 })
  const fibResult = await calculateFibonacci(35)
  timer.end({ result: fibResult, iterations: 35 })

  // 方式3: 使用组件日志器的性能追踪
  const componentLogger = createComponentLogger("DataProcessor")

  const processResult = await componentLogger.trackAsync(
    "data-processing",
    async () => {
      // 模拟数据处理
      await new Promise((resolve) => setTimeout(resolve, 200))
      return { processed: 1000, errors: 0 }
    },
    { batchSize: 1000, processor: "v2" },
  )

  console.log("处理结果:", processResult)

  // 同步性能追踪
  const syncResult = componentLogger.trackSync(
    "sync-operation",
    () => {
      // 模拟同步计算
      return Array.from({ length: 10000 }, (_, i) => i * i).reduce((a, b) => a + b, 0)
    },
    { arraySize: 10000 },
  )

  console.log("同步计算结果:", syncResult)
}

/**
 * 示例5: 系统级日志
 */
export function systemLoggingExample() {
  console.log("=== 系统级日志示例 ===")

  // 系统事件日志
  system.startup({
    version: "1.2.3",
    environment: "production",
    nodeVersion: process.version,
    memory: process.memoryUsage ? process.memoryUsage() : null,
  })

  system.error("系统配置错误", new Error("配置文件缺失"), {
    configFile: "config/database.json",
    component: "database-connection",
  })

  system.security("可疑登录尝试", {
    ip: "192.168.1.100",
    attempts: 5,
    timeWindow: "5分钟",
    blocked: true,
  })

  // 用户活动日志
  userActivity.login("user_12345", {
    ip: "192.168.1.50",
    userAgent: "Mozilla/5.0...",
    device: "desktop",
    location: "北京",
  })

  userActivity.action("user_12345", "数据导出", {
    module: "reports",
    recordCount: 1500,
    format: "excel",
  })

  userActivity.logout("user_12345", {
    sessionDuration: "2小时15分钟",
    lastActivity: new Date(),
  })
}

/**
 * 示例6: API和数据库日志
 */
export async function apiAndDatabaseExample() {
  console.log("=== API和数据库日志示例 ===")

  // API请求日志
  api.request("/api/users", "GET", {
    query: { page: 1, limit: 20 },
    headers: { Authorization: "Bearer ***" },
  })

  // 模拟API响应
  setTimeout(() => {
    api.response("/api/users", "GET", 200, 145, {
      responseSize: "15KB",
      cacheHit: false,
    })
  }, 145)

  // API错误日志
  api.error("/api/users/create", "POST", new Error("验证失败"), {
    validation: {
      email: "邮箱格式不正确",
      password: "密码强度不够",
    },
  })

  // 数据库查询日志
  const sqlQuery = "SELECT * FROM users WHERE status = ? AND created_at > ?"
  database.query(sqlQuery, 89, {
    params: ["active", "2024-01-01"],
    resultCount: 156,
  })

  // 慢查询检测
  database.slowQuery(
    "SELECT u.*, p.* FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.department_id IN (SELECT id FROM departments WHERE region = ?)",
    1250, // 执行时间
    1000, // 阈值
    {
      params: ["华北地区"],
      resultCount: 3456,
      optimization: "建议添加索引",
    },
  )

  // 数据库错误日志
  database.error("UPDATE users SET last_login = ? WHERE id = ?", new Error("Deadlock detected"), {
    params: [new Date(), "user_123"],
    retryable: true,
    transaction: "tx_789",
  })
}

/**
 * 示例7: Vue组合式API
 */
export function vueComposableExample() {
  console.log("=== Vue组合式API示例 ===")

  // 在Vue组件中使用日志器
  const { stats, debug, info, warn } = useLogger({
    component: "UserProfile",
    version: "1.0.0",
  })

  // 使用组件日志方法
  debug("组件调试信息", { props: { userId: "123" } })
  info("组件加载完成", { loadTime: "200ms" })
  warn("数据同步警告", { conflictFields: ["email", "phone"] })

  // 获取日志统计（响应式）
  console.log("当前日志统计:", stats.value)

  // 性能追踪组合式API
  const { startTimer, trackAsync: trackAsyncOp } = usePerformanceTracking({
    component: "DataTable",
  })

  const timer = startTimer("data-loading")
  setTimeout(() => {
    timer.end({ recordsLoaded: 250 })
  }, 300)

  // 异步操作追踪
  trackAsyncOp("api-call", async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return "API调用完成"
  }).then((result) => {
    console.log(result)
  })
}

/**
 * 示例8: 日志导出和分析
 */
export function loggingAnalysisExample() {
  console.log("=== 日志分析和导出示例 ===")

  // 获取日志统计
  const stats = logger.getStats()
  console.log("全局日志统计:", stats)

  // 导出不同格式的日志
  const jsonLogs = logger.export("json")
  const csvLogs = logger.export("csv")
  const txtLogs = logger.export("txt")

  console.log(
    `导出大小 - JSON: ${jsonLogs.length}字符, CSV: ${csvLogs.length}字符, TXT: ${txtLogs.length}字符`,
  )

  // 导出详细的诊断报告
  const diagnosticReport = logger.exportDiagnosticReport()
  console.log("诊断报告大小:", diagnosticReport.length)

  // 如果需要，可以将报告发送到服务器或下载
  if (typeof window !== "undefined") {
    const blob = new Blob([diagnosticReport], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    console.log("诊断报告下载链接:", url)
  }
}

/**
 * 示例9: 低代码引擎专用日志
 */
export async function lowcodeEngineExample() {
  console.log("=== 低代码引擎日志示例 ===")

  // 使用专用的低代码引擎日志器
  lowcodeLogger.info("低代码引擎初始化", { version: "1.0.0", plugins: 5 })

  // 插件注册日志
  const pluginLogger = lowcodeLogger.child({
    plugin: "vue3-generator",
    version: "2.1.0",
  })

  pluginLogger.info("插件注册成功", {
    capabilities: ["component-generation", "real-time-preview"],
    dependencies: ["@vue/compiler-sfc"],
  })

  // 代码生成性能追踪
  const generationResult = await pluginLogger.trackAsync(
    "component-generation",
    async () => {
      // 模拟组件生成过程
      await new Promise((resolve) => setTimeout(resolve, 120))
      return {
        component: "UserCard.vue",
        lines: 156,
        size: "4.2KB",
      }
    },
    {
      schema: "UserCardSchema",
      target: "vue3",
      optimization: true,
    },
  )

  console.log("代码生成结果:", generationResult)

  // Schema验证日志
  const schemaLogger = lowcodeLogger.child({ module: "schema-validator" })
  schemaLogger.warn("Schema验证警告", {
    schemaId: "ButtonSchema_v1.2",
    warnings: ["缺少必需属性: disabled", "属性类型不匹配: onClick"],
    autoFixed: true,
  })
}

// 辅助函数
async function calculateFibonacci(n: number): Promise<number> {
  if (n <= 1) return n
  // 模拟异步计算
  await new Promise((resolve) => setTimeout(resolve, 10))
  return (await calculateFibonacci(n - 1)) + (await calculateFibonacci(n - 2))
}

/**
 * 运行所有示例
 */
export async function runAllLoggingExamples() {
  console.log("🚀 开始运行SmartAbp统一日志系统示例")

  try {
    basicLoggingExample()
    childLoggerExample()
    transportExample()
    await performanceTrackingExample()
    systemLoggingExample()
    await apiAndDatabaseExample()
    vueComposableExample()
    loggingAnalysisExample()
    await lowcodeEngineExample()

    console.log("✅ 所有日志系统示例运行完成")
    console.log("📊 最终统计:", logger.getStats())
  } catch (error) {
    console.error("❌ 示例运行失败:", error)
  }
}

// 浏览器环境下的便捷访问
if (typeof window !== "undefined") {
  ;(window as any).runLoggingExamples = runAllLoggingExamples
  ;(window as any).loggingExamples = {
    basic: basicLoggingExample,
    childLogger: childLoggerExample,
    transport: transportExample,
    performance: performanceTrackingExample,
    system: systemLoggingExample,
    api: apiAndDatabaseExample,
    vue: vueComposableExample,
    analysis: loggingAnalysisExample,
    lowcode: lowcodeEngineExample,
  }

  console.log("💡 在控制台运行:")
  console.log("  runLoggingExamples() - 运行所有示例")
  console.log("  loggingExamples.basic() - 运行基础示例")
  console.log("  loggingExamples.performance() - 运行性能追踪示例")
}
