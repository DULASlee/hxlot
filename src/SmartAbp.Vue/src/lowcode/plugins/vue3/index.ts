/**
 * Vue3 代码生成插件
 * 支持组合式API、TypeScript、单文件组件
 */

import type {
  CodegenPlugin,
  PluginContext,
  ValidationResult,
  Schema,
  GeneratedCode,
} from "../../kernel/types"
import {
  SfcCompilerPlugin,
  type CompiledSFC,
  type SfcCompilerConfig,
  type PreviewContext,
} from "../sfc-compiler/index"

// ============= Vue3 相关类型 =============

export interface Vue3Schema extends Schema {
  type: "component" | "page" | "layout"
  template: TemplateDefinition
  script?: ScriptDefinition
  style?: StyleDefinition
  props?: PropDefinition[]
  emits?: EmitDefinition[]
}

export interface TemplateDefinition {
  type: "jsx" | "template"
  content: string | ElementNode
  directives?: DirectiveDefinition[]
}

export interface ElementNode {
  tag: string
  props?: Record<string, any>
  children?: Array<ElementNode | string>
  key?: string
  ref?: string
}

export interface ScriptDefinition {
  lang: "ts" | "js"
  setup?: boolean
  imports?: ImportStatement[]
  composables?: ComposableDefinition[]
  computed?: ComputedDefinition[]
  methods?: MethodDefinition[]
  lifecycle?: LifecycleDefinition[]
}

export interface StyleDefinition {
  lang: "css" | "scss" | "less"
  scoped?: boolean
  module?: boolean
  content: string | StyleRules
}

export interface StyleRules {
  [selector: string]: Record<string, string>
}

export interface PropDefinition {
  name: string
  type: string
  required?: boolean
  default?: any
  validator?: string
  description?: string
}

export interface EmitDefinition {
  name: string
  payload?: string
  description?: string
}

export interface ImportStatement {
  specifiers: string[]
  source: string
  isDefault?: boolean
  isNamespace?: boolean
}

export interface ComposableDefinition {
  name: string
  source: string
  destructured: string[]
}

export interface ComputedDefinition {
  name: string
  get: string
  set?: string
  type?: string
}

export interface MethodDefinition {
  name: string
  params: Array<{ name: string; type?: string }>
  returnType?: string
  body: string
  async?: boolean
}

export interface LifecycleDefinition {
  hook: "onMounted" | "onUnmounted" | "onUpdated" | "onBeforeMount" | "onBeforeUnmount"
  body: string
}

export interface DirectiveDefinition {
  name: string
  value?: string
  argument?: string
  modifiers?: string[]
}

export interface Vue3GeneratedCode extends GeneratedCode {
  sfc: string // 单文件组件内容
  template: string
  script: string
  style: string
  exports: string[]
  /** 编译后的结果，仅在启用编译时存在 */
  compiled?: CompiledSFC
}

export interface Vue3Config {
  typescript?: boolean
  compositionApi?: boolean
  scoped?: boolean
  cssModule?: boolean
  prettier?: boolean
  eslint?: boolean
  /** 是否启用SFC编译功能，支持实时预览 */
  enableCompilation?: boolean
  /** SFC编译器配置 */
  compilerConfig?: SfcCompilerConfig
}

// ============= Vue3 代码生成器 =============

export class Vue3CodeGenerator {
  private config: Required<Vue3Config>

  constructor(config: Vue3Config = {}) {
    this.config = {
      typescript: true,
      compositionApi: true,
      scoped: true,
      cssModule: false,
      prettier: true,
      eslint: true,
      enableCompilation: false,
      compilerConfig: {},
      ...config,
    }
  }

  generate(schema: Vue3Schema): Vue3GeneratedCode {
    // 生成各个部分
    const template = this.generateTemplate(schema.template)
    const script = this.generateScript(schema.script, schema)
    const style = this.generateStyle(schema.style)

    // 组合SFC
    const sfc = this.combineSFC(template, script, style)

    // 计算依赖
    const dependencies = this.extractDependencies(schema)

    // 创建结果
    const code = this.config.prettier ? this.formatCode(sfc) : sfc
    const checksum = this.generateChecksum(code)

    return {
      code,
      sfc,
      template,
      script,
      style,
      dependencies,
      exports: this.extractExports(schema),
      metadata: {
        framework: "vue3",
        language: this.config.typescript ? "typescript" : "javascript",
        generatedAt: Date.now(),
        checksum,
        size: code.length,
      },
    }
  }

  // ============= 模板生成 =============

  private generateTemplate(template: TemplateDefinition): string {
    if (template.type === "jsx") {
      return this.generateJSXTemplate(template)
    }

    if (typeof template.content === "string") {
      return template.content
    }

    return this.renderElement(template.content as ElementNode)
  }

  private generateJSXTemplate(template: TemplateDefinition): string {
    // JSX 模板生成逻辑
    return `<div>JSX Template: ${template.content}</div>`
  }

  private renderElement(node: ElementNode, indent = 2): string {
    const spaces = " ".repeat(indent)
    const props = this.renderProps(node.props || {})

    if (!node.children || node.children.length === 0) {
      return `${spaces}<${node.tag}${props ? " " + props : ""} />`
    }

    const children = node.children
      .map((child) => {
        if (typeof child === "string") {
          return `${spaces}  ${child}`
        }
        return this.renderElement(child, indent + 2)
      })
      .join("\n")

    return `${spaces}<${node.tag}${props ? " " + props : ""}>
${children}
${spaces}</${node.tag}>`
  }

  private renderProps(props: Record<string, any>): string {
    return Object.entries(props)
      .map(([key, value]) => {
        if (value === true) return key
        if (typeof value === "string") return `${key}="${value}"`
        if (key.startsWith(":") || key.startsWith("v-") || key.startsWith("@")) {
          return `${key}="${value}"`
        }
        return `:${key}="${JSON.stringify(value)}"`
      })
      .join(" ")
  }

  // ============= 脚本生成 =============

  private generateScript(script: ScriptDefinition | undefined, schema: Vue3Schema): string {
    if (!script) {
      return this.generateDefaultScript(schema)
    }

    const parts: string[] = []

    // 生成导入
    if (script.imports) {
      parts.push(...script.imports.map((imp) => this.generateImport(imp)))
    }

    // 添加Vue导入
    if (script.setup) {
      const vueImports = this.generateVueImports(script)
      if (vueImports) {
        parts.push(vueImports)
      }
    }

    // 生成Props
    if (schema.props && schema.props.length > 0) {
      parts.push(this.generateProps(schema.props))
    }

    // 生成Emits
    if (schema.emits && schema.emits.length > 0) {
      parts.push(this.generateEmits(schema.emits))
    }

    // 生成Composables
    if (script.composables) {
      parts.push(...script.composables.map((comp) => this.generateComposable(comp)))
    }

    // 生成计算属性
    if (script.computed) {
      parts.push(...script.computed.map((comp) => this.generateComputed(comp)))
    }

    // 生成方法
    if (script.methods) {
      parts.push(...script.methods.map((method) => this.generateMethod(method)))
    }

    // 生成生命周期
    if (script.lifecycle) {
      parts.push(...script.lifecycle.map((hook) => this.generateLifecycle(hook)))
    }

    return parts.join("\n\n")
  }

  private generateDefaultScript(schema: Vue3Schema): string {
    const imports = [`import { defineComponent } from 'vue';`]

    return (
      imports.join("\n") +
      "\n\nexport default defineComponent({\n  name: '" +
      schema.metadata?.name +
      "'\n});"
    )
  }

  private generateVueImports(script: ScriptDefinition): string {
    const imports: string[] = []

    // 基础导入
    if (script.setup) {
      imports.push("ref", "reactive")
    }

    // 计算属性
    if (script.computed && script.computed.length > 0) {
      imports.push("computed")
    }

    // 生命周期
    if (script.lifecycle && script.lifecycle.length > 0) {
      const hooks = script.lifecycle.map((l) => l.hook)
      imports.push(...[...new Set(hooks)])
    }

    if (imports.length === 0) return ""

    return `import { ${imports.join(", ")} } from 'vue';`
  }

  private generateImport(imp: ImportStatement): string {
    if (imp.isDefault) {
      return `import ${imp.specifiers[0]} from '${imp.source}';`
    }

    if (imp.isNamespace) {
      return `import * as ${imp.specifiers[0]} from '${imp.source}';`
    }

    return `import { ${imp.specifiers.join(", ")} } from '${imp.source}';`
  }

  private generateProps(props: PropDefinition[]): string {
    if (!this.config.typescript) {
      const propNames = props.map((p) => `'${p.name}'`).join(", ")
      return `const props = defineProps([${propNames}]);`
    }

    const propDefs = props
      .map((prop) => {
        const required = prop.required ? "" : "?"
        const defaultValue = prop.default !== undefined ? ` = ${JSON.stringify(prop.default)}` : ""
        return `  ${prop.name}${required}: ${prop.type}${defaultValue};`
      })
      .join("\n")

    return `interface Props {\n${propDefs}\n}\n\nconst props = defineProps<Props>();`
  }

  private generateEmits(emits: EmitDefinition[]): string {
    if (!this.config.typescript) {
      const emitNames = emits.map((e) => `'${e.name}'`).join(", ")
      return `const emit = defineEmits([${emitNames}]);`
    }

    const emitDefs = emits
      .map((emit) => {
        const payload = emit.payload || "void"
        return `  ${emit.name}: [payload: ${payload}];`
      })
      .join("\n")

    return `interface Emits {\n${emitDefs}\n}\n\nconst emit = defineEmits<Emits>();`
  }

  private generateComposable(comp: ComposableDefinition): string {
    const destructured = comp.destructured.join(", ")
    return `const { ${destructured} } = ${comp.name}();`
  }

  private generateComputed(comp: ComputedDefinition): string {
    const type = this.config.typescript && comp.type ? `<${comp.type}>` : ""

    if (comp.set) {
      return `const ${comp.name} = computed${type}({
  get: () => ${comp.get},
  set: (value) => { ${comp.set} }
});`
    }

    return `const ${comp.name} = computed${type}(() => ${comp.get});`
  }

  private generateMethod(method: MethodDefinition): string {
    const params = method.params.map((p) => (p.type ? `${p.name}: ${p.type}` : p.name)).join(", ")

    const returnType = this.config.typescript && method.returnType ? `: ${method.returnType}` : ""

    const asyncKeyword = method.async ? "async " : ""

    return `const ${method.name} = ${asyncKeyword}(${params})${returnType} => {
  ${method.body}
};`
  }

  private generateLifecycle(hook: LifecycleDefinition): string {
    return `${hook.hook}(() => {
  ${hook.body}
});`
  }

  // ============= 样式生成 =============

  private generateStyle(style: StyleDefinition | undefined): string {
    if (!style) return ""

    if (typeof style.content === "string") {
      return style.content
    }

    return this.generateStyleRules(style.content as StyleRules)
  }

  private generateStyleRules(rules: StyleRules): string {
    return Object.entries(rules)
      .map(([selector, properties]) => {
        const props = Object.entries(properties)
          .map(([prop, value]) => `  ${prop}: ${value};`)
          .join("\n")
        return `${selector} {\n${props}\n}`
      })
      .join("\n\n")
  }

  // ============= SFC 组合 =============

  private combineSFC(template: string, script: string, style: string): string {
    const parts: string[] = []

    // 模板部分
    if (template.trim()) {
      parts.push(`<template>\n${template}\n</template>`)
    }

    // 脚本部分
    if (script.trim()) {
      const lang = this.config.typescript ? ' lang="ts"' : ""
      const setup = this.config.compositionApi ? " setup" : ""
      parts.push(`<script${setup}${lang}>\n${script}\n</script>`)
    }

    // 样式部分
    if (style.trim()) {
      const scoped = this.config.scoped ? " scoped" : ""
      const module = this.config.cssModule ? " module" : ""
      parts.push(`<style${scoped}${module}>\n${style}\n</style>`)
    }

    return parts.join("\n\n")
  }

  // ============= 辅助方法 =============

  private extractDependencies(schema: Vue3Schema): string[] {
    const deps = new Set<string>(["vue"])

    // 从导入中提取依赖
    if (schema.script?.imports) {
      schema.script.imports.forEach((imp) => {
        if (!imp.source.startsWith(".") && !imp.source.startsWith("/")) {
          deps.add(imp.source)
        }
      })
    }

    // 从composables中提取依赖
    if (schema.script?.composables) {
      schema.script.composables.forEach((comp) => {
        if (comp.source.startsWith("@/") || comp.source.startsWith("./")) {
          // 本地依赖，不添加到外部依赖
        } else {
          deps.add(comp.source)
        }
      })
    }

    return Array.from(deps)
  }

  private extractExports(schema: Vue3Schema): string[] {
    const exports = [schema.metadata?.name || "Component"]

    // 从脚本中提取导出
    if (schema.script?.methods) {
      exports.push(...schema.script.methods.map((m) => m.name))
    }

    return exports
  }

  private formatCode(code: string): string {
    // 简化的代码格式化，实际项目中应该使用prettier
    return code
      .split("\n")
      .map((line) => line.trimRight())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n") // 最多保留两个连续换行
  }

  private generateChecksum(code: string): string {
    // 简单的checksum计算
    let hash = 0
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(36)
  }
}

// ============= Vue3 插件实现 =============

export class Vue3Plugin implements CodegenPlugin<Vue3Schema, Vue3Config, Vue3GeneratedCode> {
  readonly metadata = {
    name: "vue3-generator",
    version: "1.0.0",
    description: "Vue3 单文件组件生成器，支持实时编译预览",
    author: "SmartAbp Team",
    dependencies: ["@vue/compiler-sfc", "@vue/compiler-dom"],
    peerDependencies: ["vue@^3.0.0"],
    target: ["vue3" as const],
    capabilities: ["generator" as const],
  }

  private generator: Vue3CodeGenerator
  private compiler?: SfcCompilerPlugin

  constructor(config: Vue3Config = {}) {
    this.generator = new Vue3CodeGenerator(config)

    // 如果启用编译功能，初始化编译器
    if (config.enableCompilation) {
      this.compiler = new SfcCompilerPlugin(config.compilerConfig)
    }
  }

  canHandle(schema: any): boolean {
    return schema?.type === "component" || schema?.type === "page" || schema?.type === "layout"
  }

  async validate(schema: Vue3Schema): Promise<ValidationResult> {
    const errors: any[] = []
    const warnings: any[] = []

    // 验证必需字段
    if (!schema.template) {
      errors.push({
        code: "MISSING_TEMPLATE",
        message: "Template is required for Vue3 components",
        path: "template",
        severity: "error",
      })
    }

    // 验证props类型
    if (schema.props) {
      schema.props.forEach((prop, index) => {
        if (!prop.name) {
          errors.push({
            code: "MISSING_PROP_NAME",
            message: "Prop name is required",
            path: `props[${index}].name`,
            severity: "error",
          })
        }
        if (!prop.type) {
          warnings.push({
            code: "MISSING_PROP_TYPE",
            message: "Prop type is recommended",
            path: `props[${index}].type`,
            severity: "warning",
          })
        }
      })
    }

    // 验证方法语法
    if (schema.script?.methods) {
      schema.script.methods.forEach((method, index) => {
        if (!method.name) {
          errors.push({
            code: "MISSING_METHOD_NAME",
            message: "Method name is required",
            path: `script.methods[${index}].name`,
            severity: "error",
          })
        }
        if (!method.body) {
          errors.push({
            code: "MISSING_METHOD_BODY",
            message: "Method body is required",
            path: `script.methods[${index}].body`,
            severity: "error",
          })
        }
      })
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  async generate(
    schema: Vue3Schema,
    config: Vue3Config,
    context: PluginContext,
  ): Promise<Vue3GeneratedCode> {
    context.logger.info("Generating Vue3 component", {
      name: schema.metadata?.name,
      type: schema.type,
    })

    const timer = context.monitor.startTimer("vue3.generation", {
      component: schema.metadata?.name || "unknown",
    })

    try {
      // 合并配置并重新初始化
      const mergedConfig = { ...config }
      this.generator = new Vue3CodeGenerator(mergedConfig)

      if (mergedConfig.enableCompilation && !this.compiler) {
        this.compiler = new SfcCompilerPlugin(mergedConfig.compilerConfig)
        await this.compiler.onInit?.()
      }

      // 生成代码
      const result = this.generator.generate(schema)

      // 如果启用编译功能，编译生成的SFC
      if (mergedConfig.enableCompilation && this.compiler) {
        context.logger.info("开始编译生成的SFC组件")

        const compileTimer = context.monitor.startTimer("vue3.compilation", {
          component: schema.metadata?.name || "unknown",
        })

        try {
          const compiled = await this.compiler.generate(
            result.sfc,
            mergedConfig.compilerConfig || {},
            context,
          )

          result.compiled = compiled
          compileTimer.end({ status: "success" })

          context.logger.info("Vue3 SFC编译完成", {
            name: schema.metadata?.name,
            renderSize: compiled.render.length,
            compiledScriptSize: compiled.script.length,
            stylesCount: compiled.styles.length,
          })
        } catch (compileError) {
          compileTimer.end({ status: "error" })
          context.logger.warn("SFC编译失败，继续返回源码", {
            error: (compileError as Error).message,
          })
          // 编译失败不阻断生成流程，仅返回源码
        }
      }

      timer.end({ status: "success" })

      context.logger.info("Vue3 component generated successfully", {
        name: schema.metadata?.name,
        size: result.code.length,
        dependencies: result.dependencies.length,
        hasCompiled: !!result.compiled,
      })

      return result
    } catch (error) {
      timer.end({ status: "error" })
      context.logger.error("Vue3 generation failed", error as Error, {
        name: schema.metadata?.name,
      })
      throw error
    }
  }

  async onInit(): Promise<void> {
    console.log("Vue3 plugin initialized")
  }

  async onDestroy(): Promise<void> {
    if (this.compiler) {
      await this.compiler.onDestroy?.()
    }
    console.log("Vue3 plugin destroyed")
  }

  async onError(error: Error): Promise<void> {
    console.error("Vue3 plugin error:", error)
  }

  /**
   * 创建实时预览实例
   * 用于拖拽式表单开发场景
   */
  async createPreview(generatedCode: Vue3GeneratedCode, context: PreviewContext): Promise<any> {
    if (!generatedCode.compiled || !this.compiler) {
      throw new Error("编译功能未启用，无法创建预览实例")
    }

    return this.compiler.createPreview(generatedCode.compiled, context)
  }

  /**
   * 热更新预览实例
   * 用于拖拽编辑时的实时更新
   */
  async updatePreview(generatedCode: Vue3GeneratedCode, previewInstance: any): Promise<void> {
    if (!generatedCode.compiled || !this.compiler) {
      throw new Error("编译功能未启用，无法更新预览实例")
    }

    return this.compiler.updatePreview(generatedCode.compiled, previewInstance)
  }

  /**
   * 快速编译SFC字符串
   * 用于实时预览场景的快速编译
   */
  async quickCompile(
    sfcCode: string,
    context: PluginContext,
    options?: SfcCompilerConfig,
  ): Promise<CompiledSFC> {
    if (!this.compiler) {
      // 创建临时编译器实例
      this.compiler = new SfcCompilerPlugin(options)
      await this.compiler.onInit?.()
    }

    return this.compiler.generate(sfcCode, options || {}, context)
  }

  /**
   * 检查是否支持编译功能
   */
  isCompilationEnabled(): boolean {
    return !!this.compiler
  }

  /**
   * 获取编译器统计信息
   */
  getCompilerStats(): any {
    return this.compiler?.getStats() || null
  }
}

export default Vue3Plugin
