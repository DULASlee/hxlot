/**
 * Vue SFC编译器插件
 * 支持拖拽式表单开发和实时预览功能
 */

import {
  parse,
  compileScript,
  compileTemplate,
  compileStyle,
  type SFCDescriptor,
} from "@vue/compiler-sfc"
import type {
  CodegenPlugin,
  PluginContext,
  PluginMetadata,
  ValidationResult,
  GeneratedCode,
} from "../../kernel/types"

// ============= 接口定义 =============

export interface SfcCompilerConfig {
  /** 是否启用TypeScript支持 */
  typescript?: boolean
  /** 是否生成Source Map */
  sourceMap?: boolean
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 编译超时时间(ms) */
  timeout?: number
  /** 是否启用热更新 */
  hotReload?: boolean
}

export interface CompileOptions {
  /** 文件名 */
  filename?: string
  /** 是否生成Source Map */
  sourceMap?: boolean
  /** 编译器选项 */
  compilerOptions?: Record<string, any>
  /** 预处理器选项 */
  preprocessOptions?: Record<string, any>
}

export interface CompiledSFC extends GeneratedCode {
  /** 原始SFC内容 */
  source: string
  /** 解析后的SFC描述符 */
  descriptor: SFCDescriptor
  /** 编译后的渲染函数 */
  render: string
  /** 编译后的脚本 */
  script: string
  /** 编译后的样式数组 */
  styles: string[]
  /** Source Map */
  sourceMap?: string
  /** 导出的符号 */
  exports: string[]
  /** 错误信息 */
  errors: string[]
  /** 警告信息 */
  warnings: string[]
}

export interface PreviewContext {
  /** 组件ID */
  id: string
  /** 组件名称 */
  name: string
  /** 父容器 */
  container?: HTMLElement
  /** 上下文数据 */
  data?: Record<string, any>
  /** 事件回调 */
  callbacks?: Record<string, Function>
}

// ============= SFC编译器实现 =============

export class SfcCompilerEngine {
  private config: Required<SfcCompilerConfig>
  private cache = new Map<string, CompiledSFC>()
  private workerPool?: import("../../runtime/worker-pool").WorkerPool

  constructor(config: SfcCompilerConfig = {}) {
    this.config = {
      typescript: true,
      sourceMap: true,
      enableCache: true,
      timeout: 10000,
      hotReload: true,
      ...config,
    }
  }

  /**
   * 编译SFC字符串为可执行代码
   */
  async compile(sfc: string, options: CompileOptions = {}): Promise<CompiledSFC> {
    const cacheKey = this.generateCacheKey(sfc, options)

    // 检查缓存
    if (this.config.enableCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const filename = options.filename || "Anonymous.vue"
    const startTime = Date.now()

    try {
      // 解析SFC
      const { descriptor, errors: parseErrors } = parse(sfc, { filename })

      if (parseErrors.length > 0) {
        throw new Error(`SFC解析错误: ${parseErrors.join(", ")}`)
      }

      // 编译各个部分（优先使用Worker池并行编译脚本/模板/样式）
      const useWorkers = typeof Worker !== "undefined"

      let script: string
      let render: string
      let styles: string[]

      if (useWorkers) {
        // 惰性初始化Worker池
        if (!this.workerPool) {
          const { WorkerPool } = await import("../../runtime/worker-pool")
          const makeUrl = (p: string) => new URL(p, import.meta.url)
          const createWorker = () =>
            new Worker(makeUrl("../../runtime/workers/sfc.worker.ts"), { type: "module" })
          this.workerPool = new WorkerPool(
            {
              name: "sfc",
              size: Math.max(
                2,
                navigator?.hardwareConcurrency ? Math.min(4, navigator.hardwareConcurrency) : 2,
              ),
              timeoutMs: this.config.timeout,
            },
            createWorker,
          )
          // 暴露到全局以便仪表板读取（仅开发调试）
          try {
            ;(globalThis as any).__sfcWorkerPool = this.workerPool
          } catch {}
        }

        const res = await this.workerPool.exec<
          {
            sfc: string
            filename: string
            sourceMap?: boolean
            compilerOptions?: Record<string, any>
            preprocessOptions?: Record<string, any>
          },
          {
            render: string
            script: string
            styles: string[]
            exports: string[]
            dependencies: string[]
          }
        >("compile", {
          sfc,
          filename,
          sourceMap: options.sourceMap,
          compilerOptions: options.compilerOptions,
          preprocessOptions: options.preprocessOptions,
        })

        script = res.script
        render = res.render
        styles = res.styles
      } else {
        // 退化为主线程编译
        script = await this.compileScriptBlock(descriptor, filename, options)
        render = await this.compileTemplateBlock(descriptor, filename, options)
        styles = await this.compileStyleBlocks(descriptor, filename, options)
      }

      // 构建结果
      const result: CompiledSFC = {
        source: sfc,
        descriptor,
        code: sfc, // 保留原始源码
        render,
        script,
        styles,
        dependencies: this.extractDependencies(descriptor),
        exports: this.extractExports(descriptor, script),
        errors: [],
        warnings: [],
        metadata: {
          framework: "vue3",
          language: this.config.typescript ? "typescript" : "javascript",
          generatedAt: Date.now(),
          checksum: this.generateChecksum(sfc),
          size: sfc.length,
        },
      }

      // 生成Source Map
      if (this.config.sourceMap) {
        result.sourceMap = this.generateSourceMap(result, filename)
      }

      // 缓存结果
      if (this.config.enableCache) {
        this.cache.set(cacheKey, result)
      }

      return result
    } catch (error) {
      const compilationTime = Date.now() - startTime
      throw new Error(`SFC编译失败 (${compilationTime}ms): ${(error as Error).message}`)
    }
  }

  /**
   * 编译脚本块
   */
  private async compileScriptBlock(
    descriptor: SFCDescriptor,
    filename: string,
    options: CompileOptions,
  ): Promise<string> {
    if (!descriptor.script && !descriptor.scriptSetup) {
      return ""
    }

    const scriptLang = descriptor.script?.lang || descriptor.scriptSetup?.lang
    const isTS = scriptLang === "ts" || scriptLang === "tsx"

    const compiledScript = compileScript(descriptor, {
      id: this.generateComponentId(filename),
      sourceMap: options.sourceMap,
      genDefaultAs: this.extractComponentName(descriptor),
      // 根据语言类型设置不同的编译选项
      ...(isTS
        ? {
            // TypeScript特有的编译选项
            babelParserPlugins: ["typescript", "decorators-legacy"] as any[],
            propsDestructure: true,
          }
        : {
            // JavaScript的编译选项
            babelParserPlugins: ["decorators-legacy"] as any[],
          }),
      // 生产模式配置
      isProd: false,
      // 启用静态提升优化
      hoistStatic: true,
      // 模板相关选项
      templateOptions: {
        source: descriptor.template?.content || "",
        filename,
        id: this.generateComponentId(filename),
        scoped: descriptor.styles.some((s) => s.scoped),
        ssr: false,
        transformAssetUrls: false,
      },
    })

    return compiledScript.content
  }

  /**
   * 编译模板块
   */
  private async compileTemplateBlock(
    descriptor: SFCDescriptor,
    filename: string,
    options: CompileOptions,
  ): Promise<string> {
    if (!descriptor.template) {
      return ""
    }

    const templateResult = compileTemplate({
      id: this.generateComponentId(filename),
      source: descriptor.template.content,
      filename,
      transformAssetUrls: false,
      ssr: false,
      ssrCssVars: [],
      isProd: false,
      compilerOptions: {
        ...options.compilerOptions,
      },
    })

    if (templateResult.errors.length > 0) {
      throw new Error(`模板编译错误: ${templateResult.errors.join(", ")}`)
    }

    return templateResult.code
  }

  /**
   * 编译样式块
   */
  private async compileStyleBlocks(
    descriptor: SFCDescriptor,
    filename: string,
    options: CompileOptions,
  ): Promise<string[]> {
    if (!descriptor.styles.length) {
      return []
    }

    const compiledStyles: string[] = []

    for (let i = 0; i < descriptor.styles.length; i++) {
      const style = descriptor.styles[i]

      const styleResult = compileStyle({
        filename,
        id: this.generateComponentId(filename),
        source: style.content,
        scoped: style.scoped,
        preprocessLang: style.lang as any,
        trim: true,
        // 使用options中的配置
        isProd: options.compilerOptions?.isProd || false,
        // 如果options中有预处理器配置，使用它
        ...(options.preprocessOptions && {
          preprocessOptions: options.preprocessOptions,
        }),
      })

      if (styleResult.errors.length > 0) {
        throw new Error(`样式编译错误: ${styleResult.errors.join(", ")}`)
      }

      compiledStyles.push(styleResult.code)
    }

    return compiledStyles
  }

  /**
   * 创建实时预览实例
   */
  async createPreviewInstance(compiled: CompiledSFC, context: PreviewContext): Promise<any> {
    try {
      // 创建模块代码
      const moduleCode = this.buildModuleCode(compiled)

      // 在沙箱中执行
      const module = await this.executeInSandbox(moduleCode, context)

      return module
    } catch (error) {
      throw new Error(`创建预览实例失败: ${(error as Error).message}`)
    }
  }

  /**
   * 热更新组件
   */
  async hotUpdate(compiled: CompiledSFC, instance: any): Promise<void> {
    if (!this.config.hotReload) {
      throw new Error("热更新功能未启用")
    }

    try {
      // 更新组件实例
      if (instance && typeof instance.__hmrId === "string") {
        // 触发HMR更新
        const moduleCode = this.buildModuleCode(compiled)
        await this.updateModuleInSandbox(instance.__hmrId, moduleCode)
      }
    } catch (error) {
      throw new Error(`热更新失败: ${(error as Error).message}`)
    }
  }

  // ============= 辅助方法 =============

  private generateCacheKey(sfc: string, options: CompileOptions): string {
    const optionsStr = JSON.stringify(options)
    return `${this.generateChecksum(sfc)}_${this.generateChecksum(optionsStr)}`
  }

  private generateComponentId(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9]/g, "_")
  }

  private extractComponentName(descriptor: SFCDescriptor): string {
    // 尝试从script中提取组件名
    if (descriptor.script?.content) {
      const nameMatch = descriptor.script.content.match(/name\s*:\s*['"]([^'"]+)['"]/)
      if (nameMatch) return nameMatch[1]
    }

    if (descriptor.scriptSetup?.content) {
      const nameMatch = descriptor.scriptSetup.content.match(
        /defineOptions\s*\(\s*{\s*name\s*:\s*['"]([^'"]+)['"]/,
      )
      if (nameMatch) return nameMatch[1]
    }

    return "AnonymousComponent"
  }

  private extractDependencies(descriptor: SFCDescriptor): string[] {
    const deps = new Set<string>(["vue"])

    // 从脚本中提取import语句
    const scriptContent = descriptor.script?.content || descriptor.scriptSetup?.content || ""
    const importMatches = scriptContent.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g)

    if (importMatches) {
      importMatches.forEach((importStatement) => {
        const moduleMatch = importStatement.match(/from\s+['"]([^'"]+)['"]/)
        if (moduleMatch && !moduleMatch[1].startsWith(".") && !moduleMatch[1].startsWith("/")) {
          deps.add(moduleMatch[1])
        }
      })
    }

    return Array.from(deps)
  }

  private extractExports(descriptor: SFCDescriptor, compiledScript: string): string[] {
    const exports: string[] = []

    // 默认导出
    exports.push("default")

    // 从组件名中提取（如果有的话）
    const componentName = this.extractComponentName(descriptor)
    if (componentName && componentName !== "AnonymousComponent") {
      exports.push(componentName)
    }

    // 从编译后的脚本中提取命名导出
    const exportMatches = compiledScript.match(
      /export\s+(?:const|let|var|function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
    )
    if (exportMatches) {
      exportMatches.forEach((exportStatement) => {
        const nameMatch = exportStatement.match(
          /export\s+(?:const|let|var|function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
        )
        if (nameMatch) {
          exports.push(nameMatch[1])
        }
      })
    }

    // 从setup script中提取可能的导出
    if (descriptor.scriptSetup) {
      const setupExportMatches = descriptor.scriptSetup.content.match(
        /(?:export\s+)?(?:const|let|function)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      )
      if (setupExportMatches) {
        setupExportMatches.forEach((match) => {
          const nameMatch = match.match(/(?:const|let|function)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/)
          if (nameMatch) {
            exports.push(nameMatch[1])
          }
        })
      }
    }

    return [...new Set(exports)]
  }

  private buildModuleCode(compiled: CompiledSFC): string {
    const parts: string[] = []

    // 添加导入语句
    parts.push(`import { createVNode, Fragment } from 'vue';`)

    // 添加编译后的脚本
    if (compiled.script) {
      parts.push(compiled.script)
    }

    // 添加渲染函数
    if (compiled.render) {
      parts.push(compiled.render)
    }

    // 添加样式
    if (compiled.styles.length > 0) {
      compiled.styles.forEach((style, index) => {
        parts.push(`\n// Style ${index + 1}\nconst style${index} = \`${style}\`;`)
        parts.push(`if (typeof document !== 'undefined') {`)
        parts.push(`  const styleEl${index} = document.createElement('style');`)
        parts.push(`  styleEl${index}.textContent = style${index};`)
        parts.push(`  document.head.appendChild(styleEl${index});`)
        parts.push(`}`)
      })
    }

    return parts.join("\n")
  }

  private async executeInSandbox(moduleCode: string, context: PreviewContext): Promise<any> {
    // 安全策略：
    // - 生产环境默认禁用动态执行，避免 XSS/任意代码执行风险
    // - 开发环境允许，仅用于本地预览并打印安全警告
    const mode =
      (import.meta as any).env?.MODE ||
      (typeof process !== "undefined" ? process.env?.NODE_ENV || "development" : "development")
    const isProd = mode === "production"

    // 读取可选的安全开关（通过 context.data 或全局配置传入）
    const enableSandbox =
      context?.data && typeof context.data.enableSandbox === "boolean"
        ? context.data.enableSandbox
        : false

    if (isProd && !enableSandbox) {
      throw new Error(
        "出于安全考虑，生产环境已禁用实时预览执行（new Function）。如需启用，请显式设置 enableSandbox=true，并采用 iframe/Worker 沙箱。",
      )
    }

    try {
      if (isProd) {
        // 生产模式且已显式允许，但仍打印强警告
        console.warn(
          "[SFC Preview] Production sandbox execution enabled by configuration. Ensure strict sandbox (iframe/Worker + CSP)!",
        )
      } else {
        console.warn(
          "[SFC Preview] Using dynamic execution (new Function) for development preview only.",
        )
      }

      const func = new Function(
        "context",
        `
        ${moduleCode}
        return { default: typeof _sfc_main !== 'undefined' ? _sfc_main : {} };
      `,
      )

      return func(context)
    } catch (error) {
      throw new Error(`沙箱执行失败: ${(error as Error).message}`)
    }
  }

  private async updateModuleInSandbox(hmrId: string, moduleCode: string): Promise<void> {
    // HMR更新逻辑
    console.log(`Hot updating module ${hmrId}`)

    try {
      // 在实际实现中，这里会执行模块热更新
      // 1. 清理旧模块
      // 2. 执行新模块代码
      // 3. 触发组件重新渲染

      // 模拟执行新的模块代码
      const moduleFunction = new Function(
        "hmrId",
        "console",
        `
        console.log('Updating module:', hmrId);
        ${moduleCode}
        return { updated: true, timestamp: Date.now() };
      `,
      )

      const updateResult = moduleFunction(hmrId, console)
      console.log("Module update result:", updateResult)
    } catch (error) {
      console.error("Failed to update module in sandbox:", error)
      throw error
    }
  }

  private generateSourceMap(compiled: CompiledSFC, filename: string): string {
    // 生成基本的Source Map信息
    const sourceMap = {
      version: 3,
      file: filename,
      sourceRoot: "",
      sources: [filename],
      sourcesContent: [compiled.source],
      names: compiled.exports,
      mappings: this.generateBasicMappings(compiled.source, compiled.code),
    }

    return JSON.stringify(sourceMap)
  }

  private generateBasicMappings(originalCode: string, generatedCode: string): string {
    // 简化的mapping生成，实际项目中应该使用专业的source-map库
    const originalLines = originalCode.split("\n").length
    const generatedLines = generatedCode.split("\n").length

    // 为每一行生成基本的mapping
    const mappings: string[] = []
    for (let i = 0; i < Math.min(originalLines, generatedLines); i++) {
      // 简化的VLQ编码，实际应该使用proper VLQ encoding
      mappings.push("AAAA") // 表示列0映射到源码列0
    }

    return mappings.join(";")
  }

  private generateChecksum(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

// ============= SFC编译器插件 =============

export class SfcCompilerPlugin implements CodegenPlugin<string, SfcCompilerConfig, CompiledSFC> {
  readonly metadata: PluginMetadata = {
    name: "sfc-compiler",
    version: "1.0.0",
    description: "Vue SFC编译器，支持实时预览和拖拽式表单开发",
    author: "SmartAbp Team",
    dependencies: ["@vue/compiler-sfc", "@vue/compiler-dom", "@vue/compiler-core"],
    peerDependencies: ["vue@^3.0.0"],
    target: ["vue3"],
    capabilities: ["generator", "transformer"],
  }

  private compiler: SfcCompilerEngine

  constructor(config: SfcCompilerConfig = {}) {
    this.compiler = new SfcCompilerEngine(config)
  }

  async onInit(): Promise<void> {
    console.log("🔧 SFC编译器插件初始化完成")
  }

  async onDestroy(): Promise<void> {
    this.compiler.clearCache()
    console.log("🔧 SFC编译器插件已销毁")
  }

  canHandle(schema: any): boolean {
    return typeof schema === "string" && schema.includes("<template>")
  }

  async validate(sfc: string): Promise<ValidationResult> {
    try {
      const { errors } = parse(sfc, { filename: "temp.vue" })
      return {
        valid: errors.length === 0,
        errors: errors.map((err) => ({
          code: "SFC_PARSE_ERROR",
          message: err.message,
          path: "sfc",
          severity: "error",
        })),
        warnings: [],
      }
    } catch (error) {
      return {
        valid: false,
        errors: [
          {
            code: "SFC_VALIDATION_ERROR",
            message: (error as Error).message,
            path: "sfc",
            severity: "error",
          },
        ],
        warnings: [],
      }
    }
  }

  async generate(
    sfc: string,
    config: SfcCompilerConfig,
    context: PluginContext,
  ): Promise<CompiledSFC> {
    context.logger.info("开始编译SFC组件", { length: sfc.length })

    const timer = context.monitor.startTimer("sfc.compilation")

    try {
      // 更新编译器配置
      this.compiler = new SfcCompilerEngine(config)

      // 编译SFC
      const result = await this.compiler.compile(sfc, {
        filename: "generated.vue",
        sourceMap: config.sourceMap,
      })

      timer.end({ status: "success" })

      context.logger.info("SFC组件编译成功", {
        size: result.code.length,
        exports: result.exports.length,
        dependencies: result.dependencies.length,
      })

      return result
    } catch (error) {
      timer.end({ status: "error", error: (error as Error).message })
      context.logger.error("SFC编译失败", error as Error)
      throw error
    }
  }

  /**
   * 创建实时预览
   */
  async createPreview(compiled: CompiledSFC, context: PreviewContext): Promise<any> {
    return this.compiler.createPreviewInstance(compiled, context)
  }

  /**
   * 热更新预览
   */
  async updatePreview(compiled: CompiledSFC, instance: any): Promise<void> {
    return this.compiler.hotUpdate(compiled, instance)
  }

  /**
   * 获取编译器统计信息
   */
  getStats(): any {
    return this.compiler.getCacheStats()
  }
}

// 默认导出
export default SfcCompilerPlugin
