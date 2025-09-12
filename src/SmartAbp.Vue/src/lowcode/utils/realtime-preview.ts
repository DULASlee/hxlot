/**
 * 实时预览工具类
 * 专门用于拖拽式表单开发和实时预览功能
 */

import { Vue3Plugin, type Vue3Schema, type Vue3Config } from "../plugins/vue3/index"
import type { PreviewContext, CompiledSFC } from "../plugins/sfc-compiler/index"
import type { PluginContext } from "../kernel/types"

// ============= 预览管理器接口 =============

export interface PreviewOptions {
  /** 预览容器选择器 */
  container: string | HTMLElement
  /** 是否启用热更新 */
  hotReload?: boolean
  /** 预览更新防抖时间(ms) */
  debounceTime?: number
  /** 错误处理回调 */
  onError?: (error: Error) => void
  /** 更新成功回调 */
  onUpdate?: (instance: any) => void
  /** 编译成功回调 */
  onCompiled?: (compiled: CompiledSFC) => void
}

export interface DragDropFormContext {
  /** 表单配置 */
  formConfig: any
  /** 字段列表 */
  fields: FormField[]
  /** 验证规则 */
  validation?: Record<string, any>
  /** 事件处理器 */
  handlers?: Record<string, Function>
  /** 自定义组件 */
  customComponents?: Record<string, any>
}

export interface FormField {
  id: string
  type: "input" | "select" | "textarea" | "radio" | "checkbox" | "date" | "custom"
  label: string
  prop: string
  required?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: any }>
  component?: string // 自定义组件名
  props?: Record<string, any>
  rules?: any[]
}

// ============= 实时预览管理器 =============

export class RealtimePreviewManager {
  private vue3Plugin: Vue3Plugin
  private context: PluginContext
  private currentInstance: any = null
  private updateTimer: number | null = null
  private previewContainer: HTMLElement | null = null
  private options: Required<Omit<PreviewOptions, "container">> & { container: HTMLElement }

  constructor(context: PluginContext, options: PreviewOptions) {
    this.context = context
    this.options = {
      hotReload: true,
      debounceTime: 300,
      onError: () => {},
      onUpdate: () => {},
      onCompiled: () => {},
      ...options,
      container:
        typeof options.container === "string"
          ? (document.querySelector(options.container) as HTMLElement)
          : options.container,
    }

    if (!this.options.container) {
      throw new Error("预览容器未找到")
    }

    this.previewContainer = this.options.container

    // 初始化Vue3插件，启用编译功能
    this.vue3Plugin = new Vue3Plugin({
      enableCompilation: true,
      typescript: true,
      compositionApi: true,
      scoped: true,
      compilerConfig: {
        hotReload: true,
        enableCache: true,
        sourceMap: true,
      },
    })
  }

  /**
   * 初始化预览管理器
   */
  async initialize(): Promise<void> {
    try {
      await this.vue3Plugin.onInit?.()
      this.context.logger.info("实时预览管理器初始化完成")
    } catch (error) {
      this.context.logger.error("预览管理器初始化失败", error as Error)
      throw error
    }
  }

  /**
   * 创建或更新预览
   */
  async updatePreview(schema: Vue3Schema, config?: Vue3Config): Promise<void> {
    // 防抖处理
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
    }

    this.updateTimer = window.setTimeout(async () => {
      try {
        await this._performUpdate(schema, config)
      } catch (error) {
        this.options.onError(error as Error)
        this.context.logger.error("预览更新失败", error as Error)
      }
    }, this.options.debounceTime)
  }

  /**
   * 执行预览更新
   */
  private async _performUpdate(schema: Vue3Schema, config?: Vue3Config): Promise<void> {
    this.context.logger.info("开始更新预览", { component: schema.metadata?.name })

    // 合并配置
    const mergedConfig: Vue3Config = {
      enableCompilation: true,
      typescript: true,
      compositionApi: true,
      scoped: true,
      ...config,
    }

    // 生成代码
    const generatedCode = await this.vue3Plugin.generate(schema, mergedConfig, this.context)

    if (!generatedCode.compiled) {
      throw new Error("代码编译失败，无法创建预览")
    }

    this.options.onCompiled(generatedCode.compiled)

    // 创建预览上下文
    const previewContext: PreviewContext = {
      id: `preview-${Date.now()}`,
      name: schema.metadata?.name || "PreviewComponent",
      container: this.previewContainer!,
      data: this.extractPreviewData(schema),
      callbacks: this.createPreviewCallbacks(schema),
    }

    if (this.currentInstance && this.options.hotReload) {
      // 热更新现有实例
      await this.vue3Plugin.updatePreview(generatedCode, this.currentInstance)
      this.context.logger.info("预览热更新完成")
    } else {
      // 创建新实例
      this.currentInstance = await this.vue3Plugin.createPreview(generatedCode, previewContext)
      this.context.logger.info("预览实例创建完成")
    }

    this.options.onUpdate(this.currentInstance)
  }

  /**
   * 专门用于拖拽式表单的预览更新
   */
  async updateFormPreview(formContext: DragDropFormContext): Promise<void> {
    const formSchema = this.generateFormSchema(formContext)
    await this.updatePreview(formSchema)
  }

  /**
   * 根据表单上下文生成Vue3 Schema
   */
  private generateFormSchema(formContext: DragDropFormContext): Vue3Schema {
    const { formConfig, fields, validation, handlers } = formContext

    return {
      id: `drag-drop-form-${Date.now()}`,
      version: "1.0.0",
      type: "component",
      metadata: {
        name: `DragDropForm_${Date.now()}`,
        version: "1.0.0",
      },
      template: {
        type: "template",
        content: this.generateFormTemplate(fields, formConfig),
      },
      script: {
        lang: "ts",
        setup: true,
        imports: [
          {
            specifiers: ["ref", "reactive"],
            source: "vue",
          },
          {
            specifiers: ["ElForm", "ElFormItem", "ElInput", "ElSelect", "ElOption", "ElButton"],
            source: "element-plus",
          },
        ],
        methods: [
          // 数据初始化方法 - 替代reactive配置
          {
            name: "setupFormData",
            params: [],
            returnType: "object",
            body: `
              const formData = reactive(${JSON.stringify(this.generateFormDefaultData(fields))});
              const formRules = reactive(${JSON.stringify(validation || {})});
              return { formData, formRules };
            `,
          },
          ...this.generateFormMethods(handlers || {}),
        ],
      },
      style: {
        lang: "css",
        scoped: true,
        content: this.generateFormStyles(),
      },
      props: [],
      emits: [
        {
          name: "submit",
          payload: "any",
          description: "表单提交事件",
        },
        {
          name: "fieldChange",
          payload: "{ field: string; value: any }",
          description: "字段变化事件",
        },
      ],
    }
  }

  /**
   * 生成表单模板
   */
  private generateFormTemplate(fields: FormField[], config: any = {}): string {
    const formItems = fields.map((field) => this.generateFieldTemplate(field)).join("\n    ")

    // 使用config配置表单属性
    const labelWidth = config.labelWidth || "120px"
    const formSize = config.size || "default"
    const formClass = config.class || "form-container"
    const showResetButton = config.showResetButton !== false
    const submitText = config.submitText || "提交"
    const resetText = config.resetText || "重置"

    return `
  <div class="drag-drop-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="${labelWidth}"
      size="${formSize}"
      class="${formClass}"
      ${config.inline ? "inline" : ""}
      ${config.disabled ? "disabled" : ""}
    >
      ${formItems}

      <el-form-item class="form-actions">
        <el-button type="primary" @click="handleSubmit" ${config.submitLoading ? ':loading="submitLoading"' : ""}>
          ${submitText}
        </el-button>
        ${
          showResetButton
            ? `
        <el-button @click="handleReset">
          ${resetText}
        </el-button>`
            : ""
        }
        ${
          config.customButtons
            ? config.customButtons
                .map(
                  (btn: any) =>
                    `<el-button type="${btn.type || "default"}" @click="handle${btn.name}">
            ${btn.text}
          </el-button>`,
                )
                .join("\n        ")
            : ""
        }
      </el-form-item>
    </el-form>
  </div>`
  }

  /**
   * 生成单个字段模板
   */
  private generateFieldTemplate(field: FormField): string {
    switch (field.type) {
      case "input":
        return `
      <el-form-item label="${field.label}" prop="${field.prop}">
        <el-input
          v-model="formData.${field.prop}"
          placeholder="${field.placeholder || ""}"
          @change="handleFieldChange('${field.prop}', $event)"
        />
      </el-form-item>`

      case "select":
        const options =
          field.options
            ?.map((opt) => `<el-option label="${opt.label}" value="${opt.value}" />`)
            .join("\n            ") || ""

        return `
      <el-form-item label="${field.label}" prop="${field.prop}">
        <el-select
          v-model="formData.${field.prop}"
          placeholder="${field.placeholder || "请选择"}"
          @change="handleFieldChange('${field.prop}', $event)"
        >
          ${options}
        </el-select>
      </el-form-item>`

      case "textarea":
        return `
      <el-form-item label="${field.label}" prop="${field.prop}">
        <el-input
          type="textarea"
          v-model="formData.${field.prop}"
          placeholder="${field.placeholder || ""}"
          :rows="3"
          @change="handleFieldChange('${field.prop}', $event)"
        />
      </el-form-item>`

      case "custom":
        if (field.component) {
          const propsStr = Object.entries(field.props || {})
            .map(([key, value]) => `:${key}="${JSON.stringify(value)}"`)
            .join(" ")

          return `
      <el-form-item label="${field.label}" prop="${field.prop}">
        <${field.component}
          v-model="formData.${field.prop}"
          ${propsStr}
          @change="handleFieldChange('${field.prop}', $event)"
        />
      </el-form-item>`
        }
        break

      default:
        return `
      <el-form-item label="${field.label}" prop="${field.prop}">
        <el-input
          v-model="formData.${field.prop}"
          placeholder="${field.placeholder || ""}"
          @change="handleFieldChange('${field.prop}', $event)"
        />
      </el-form-item>`
    }

    return ""
  }

  /**
   * 生成表单默认数据
   */
  private generateFormDefaultData(fields: FormField[]): any {
    const defaultData: any = {}
    fields.forEach((field) => {
      defaultData[field.prop] = this.getFieldDefaultValue(field)
    })
    return defaultData
  }

  /**
   * 获取字段默认值
   */
  private getFieldDefaultValue(field: FormField): any {
    switch (field.type) {
      case "select":
        return field.options?.[0]?.value || ""
      case "checkbox":
        return false
      case "radio":
        return field.options?.[0]?.value || ""
      default:
        return ""
    }
  }

  /**
   * 生成表单方法
   */
  private generateFormMethods(customHandlers: Record<string, Function>): any[] {
    return [
      {
        name: "handleSubmit",
        params: [],
        returnType: "void",
        body: `
          console.log('表单提交:', formData);
          emit('submit', formData);
          ${customHandlers.onSubmit ? "await customHandlers.onSubmit(formData);" : ""}
        `,
      },
      {
        name: "handleReset",
        params: [],
        returnType: "void",
        body: `
          Object.keys(formData).forEach(key => {
            formData[key] = '';
          });
          ${customHandlers.onReset ? "await customHandlers.onReset();" : ""}
        `,
      },
      {
        name: "handleFieldChange",
        params: [
          { name: "field", type: "string" },
          { name: "value", type: "any" },
        ],
        returnType: "void",
        body: `
          console.log('字段变化:', field, value);
          emit('fieldChange', { field, value });
          ${customHandlers.onFieldChange ? "await customHandlers.onFieldChange(field, value);" : ""}
        `,
      },
    ]
  }

  /**
   * 生成表单样式
   */
  private generateFormStyles(): string {
    return `
.drag-drop-form {
  padding: 20px;
  background: var(--theme-bg-component);
  border-radius: var(--radius-md);
  border: 1px solid var(--theme-border-base);
}

.form-container {
  max-width: 600px;
}

.form-actions {
  margin-top: 20px;
}

.form-actions .el-button {
  margin-right: 10px;
}

.el-form-item {
  margin-bottom: 18px;
}
`
  }

  /**
   * 提取预览数据
   */
  private extractPreviewData(schema: Vue3Schema): Record<string, any> {
    // 从schema中提取用于预览的数据
    return {
      componentName: schema.metadata?.name,
      timestamp: Date.now(),
    }
  }

  /**
   * 创建预览回调函数
   */
  private createPreviewCallbacks(schema: Vue3Schema): Record<string, Function> {
    return {
      onMounted: () => {
        console.log(`预览组件 ${schema.metadata?.name} 已挂载`)
      },
      onUnmounted: () => {
        console.log(`预览组件 ${schema.metadata?.name} 已卸载`)
      },
      onError: (error: Error) => {
        console.error("预览组件错误:", error)
        this.options.onError(error)
      },
    }
  }

  /**
   * 销毁预览管理器
   */
  async destroy(): Promise<void> {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
    }

    if (this.currentInstance) {
      // 销毁当前实例
      this.currentInstance = null
    }

    await this.vue3Plugin.onDestroy?.()

    // 清空容器
    if (this.previewContainer) {
      this.previewContainer.innerHTML = ""
    }

    this.context.logger.info("实时预览管理器已销毁")
  }

  /**
   * 获取当前预览实例
   */
  getCurrentInstance(): any {
    return this.currentInstance
  }

  /**
   * 获取编译器统计信息
   */
  getStats(): any {
    return this.vue3Plugin.getCompilerStats()
  }
}

// ============= 拖拽表单构建器 =============

export class DragDropFormBuilder {
  private fields: FormField[] = []
  private formConfig: any = {}
  private validation: Record<string, any> = {}
  private handlers: Record<string, Function> = {}

  /**
   * 添加字段
   */
  addField(field: FormField): this {
    this.fields.push(field)
    return this
  }

  /**
   * 移除字段
   */
  removeField(fieldId: string): this {
    this.fields = this.fields.filter((field) => field.id !== fieldId)
    return this
  }

  /**
   * 更新字段
   */
  updateField(fieldId: string, updates: Partial<FormField>): this {
    const index = this.fields.findIndex((field) => field.id === fieldId)
    if (index >= 0) {
      this.fields[index] = { ...this.fields[index], ...updates }
    }
    return this
  }

  /**
   * 设置表单配置
   */
  setFormConfig(config: any): this {
    this.formConfig = { ...this.formConfig, ...config }
    return this
  }

  /**
   * 设置验证规则
   */
  setValidation(rules: Record<string, any>): this {
    this.validation = { ...this.validation, ...rules }
    return this
  }

  /**
   * 设置事件处理器
   */
  setHandlers(handlers: Record<string, Function>): this {
    this.handlers = { ...this.handlers, ...handlers }
    return this
  }

  /**
   * 构建表单上下文
   */
  build(): DragDropFormContext {
    return {
      formConfig: this.formConfig,
      fields: [...this.fields],
      validation: { ...this.validation },
      handlers: { ...this.handlers },
    }
  }

  /**
   * 重置构建器
   */
  reset(): this {
    this.fields = []
    this.formConfig = {}
    this.validation = {}
    this.handlers = {}
    return this
  }
}

// 导出便利函数
export const createRealtimePreview = (
  context: PluginContext,
  options: PreviewOptions,
): RealtimePreviewManager => {
  return new RealtimePreviewManager(context, options)
}

export const createFormBuilder = (): DragDropFormBuilder => {
  return new DragDropFormBuilder()
}
