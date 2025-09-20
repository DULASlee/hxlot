/**
 * Schema导出器 - 将设计器状态导出为可用于代码生成的Schema
 * 支持DesignerOverrideSchema格式和Vue SFC生成
 */

import type { DesignerComponent } from '../../types/designer'
// 临时占位：最小化 DesignerOverrideSchema 定义，避免断链
export interface DesignerOverrideSchema {
  metadata: {
    schemaVersion: string
    moduleName: string
    pageName: string
    timestamp: string
    author?: string
  }
  selectors: { byBlockId?: Record<string, string>; byDataNodeId?: Record<string, string> }
  operations: Array<any>
  constraints?: { version: string; compatibility: string; checksum: string }
}

// 类型定义
export interface ExportOptions {
  moduleName: string
  pageName: string
  author?: string
  includeEvents?: boolean
  includeValidation?: boolean
  format?: 'vue-sfc' | 'designer-schema' | 'both'
}

export interface VueSFCTemplate {
  template: string
  script: string
  style: string
  imports: string[]
  dependencies: string[]
}

export interface CodeGenerationResult {
  vueSFC?: VueSFCTemplate
  designerSchema?: DesignerOverrideSchema
  routes?: Array<{ path: string; name: string; component: string }>
  menuItems?: Array<{ key: string; title: string; path: string }>
}

// 类型守卫
const isValidComponent = (component: unknown): component is DesignerComponent => {
  return (
    typeof component === 'object' &&
    component !== null &&
    'id' in component &&
    'type' in component &&
    'props' in component &&
    'position' in component
  )
}

const isValidPosition = (position: unknown): position is { x: number; y: number } => {
  return (
    typeof position === 'object' &&
    position !== null &&
    'x' in position &&
    'y' in position &&
    typeof (position as any).x === 'number' &&
    typeof (position as any).y === 'number'
  )
}

// Schema导出器类
export class SchemaExporter {
  private components: DesignerComponent[]
  private options: ExportOptions

  constructor(components: DesignerComponent[], options: ExportOptions) {
    this.components = components.filter(isValidComponent)
    this.options = options
  }

  // 导出为DesignerOverrideSchema
  public exportToDesignerSchema(): DesignerOverrideSchema {
    const selectors: DesignerOverrideSchema['selectors'] = {
      byBlockId: {},
      byDataNodeId: {}
    }

    const operations: DesignerOverrideSchema['operations'] = []

    // 处理每个组件
    this.components.forEach((component, index) => {
      const blockId = `block-${component.id}`
      const nodeId = component.id

      // 添加选择器
      selectors.byBlockId![blockId] = `[data-block-id="${blockId}"]`
      selectors.byDataNodeId![nodeId] = `[data-node-id="${nodeId}"]`

      // 添加操作
      operations.push({
        type: 'add',
        targetSelector: {
          blockId,
          dataNodeId: nodeId
        },
        componentType: component.type,
        props: this.sanitizeProps(component.props || {}),
        position: {
          index
        }
      })

      // 处理样式操作
      if (component.props?.style) {
        operations.push({
          type: 'update',
          targetSelector: {
            dataNodeId: nodeId
          },
          propPatches: {
            style: component.props.style
          }
        })
      }

      // 处理事件绑定
      if (this.options.includeEvents && component.props?._events) {
        const events = component.props._events as Array<{ type: string; handler: string }>
        events.forEach(event => {
          operations.push({
            type: 'update',
            targetSelector: {
              dataNodeId: nodeId
            },
            eventPatches: {
              [event.type]: event.handler
            }
          })
        })
      }
    })

    return {
      metadata: {
        schemaVersion: '0.1.0',
        moduleName: this.options.moduleName,
        pageName: this.options.pageName,
        timestamp: new Date().toISOString(),
        author: this.options.author || 'P2 Visual Designer'
      },
      selectors,
      operations,
      constraints: {
        version: '1.0.0',
        compatibility: 'vue3-element-plus',
        checksum: this.generateChecksum()
      }
    }
  }

  // 导出为Vue SFC
  public exportToVueSFC(): VueSFCTemplate {
    const template = this.generateTemplate()
    const script = this.generateScript()
    const style = this.generateStyle()
    const imports = this.generateImports()
    const dependencies = this.generateDependencies()

    return {
      template,
      script,
      style,
      imports,
      dependencies
    }
  }

  // 完整的代码生成
  public generateCode(): CodeGenerationResult {
    const result: CodeGenerationResult = {}

    if (
      this.options.format === 'vue-sfc' ||
      this.options.format === 'both' ||
      !this.options.format
    ) {
      result.vueSFC = this.exportToVueSFC()
    }

    if (this.options.format === 'designer-schema' || this.options.format === 'both') {
      result.designerSchema = this.exportToDesignerSchema()
    }

    // 生成路由配置
    result.routes = [
      {
        path: `/${this.options.moduleName.toLowerCase()}/${this.options.pageName.toLowerCase()}`,
        name: `${this.options.moduleName}${this.options.pageName}`,
        component: `@/views/${this.options.moduleName.toLowerCase()}/${this.options.pageName}.vue`
      }
    ]

    // 生成菜单项
    result.menuItems = [
      {
        key: `${this.options.moduleName.toLowerCase()}-${this.options.pageName.toLowerCase()}`,
        title: this.options.pageName,
        path: `/${this.options.moduleName.toLowerCase()}/${this.options.pageName.toLowerCase()}`
      }
    ]

    return result
  }

  // 私有方法
  private sanitizeProps(props: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {}

    Object.entries(props).forEach(([key, value]) => {
      // 排除内部属性
      if (key.startsWith('_')) return

      // 处理样式对象
      if (key === 'style' && typeof value === 'object' && value !== null) {
        sanitized[key] = { ...(value as Record<string, unknown>) }
      } else {
        sanitized[key] = value
      }
    })

    return sanitized
  }

  private generateTemplate(): string {
    let template = '<template>\n  <div class="designer-generated-page">\n'

    // 根据组件位置排序
    const sortedComponents = [...this.components].sort((a, b) => {
      if (!isValidPosition(a.position) || !isValidPosition(b.position)) return 0
      return a.position.y - b.position.y || a.position.x - b.position.x
    })

    sortedComponents.forEach(component => {
      const style = this.generateInlineStyle(component)
      const props = this.generatePropsString(component)

      template += `    <${component.type}\n`
      template += `      data-block-id="block-${component.id}"\n`
      template += `      data-node-id="${component.id}"\n`

      if (style) {
        template += `      style="${style}"\n`
      }

      if (props) {
        template += `      ${props}\n`
      }

      // 处理事件绑定
      if (this.options.includeEvents && component.props?._events) {
        const events = component.props._events as Array<{ type: string; handler: string }>
        events.forEach(event => {
          template += `      @${event.type}="${this.sanitizeEventHandler(event.handler)}"\n`
        })
      }

      template += '    >\n'

      // 添加组件内容
      const content = this.getComponentContent(component)
      if (content) {
        template += `      ${content}\n`
      }

      template += `    </${component.type}>\n`
    })

    template += '  </div>\n</template>'
    return template
  }

  private generateScript(): string {
    const imports = this.generateImports()
    const composables = this.generateComposables()
    const methods = this.generateMethods()
    const lifecycle = this.generateLifecycle()

    return `<script setup lang="ts">
${imports.join('\n')}

// 响应式数据
${composables}

// 方法定义
${methods}

// 生命周期
${lifecycle}
</script>`
  }

  private generateStyle(): string {
    let style = '<style scoped>\n'
    style += '.designer-generated-page {\n'
    style += '  position: relative;\n'
    style += '  min-height: 100vh;\n'
    style += '  padding: 1rem;\n'
    style += '}\n'

    // 为每个组件生成样式
    this.components.forEach(component => {
      if (component.props?.style) {
        style += `[data-node-id="${component.id}"] {\n`
        const styleObj = component.props.style as Record<string, any>
        Object.entries(styleObj).forEach(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
          style += `  ${cssKey}: ${value};\n`
        })
        style += '}\n'
      }
    })

    style += '</style>'
    return style
  }

  private generateImports(): string[] {
    const imports = new Set<string>()

    // 基础导入
    imports.add("import { ref, reactive, onMounted } from 'vue'")

    // Element Plus 组件导入
    const elementComponents = new Set<string>()
    this.components.forEach(component => {
      if (component.type.startsWith('el-')) {
        const componentName = component.type
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('')
        elementComponents.add(componentName)
      }
    })

    if (elementComponents.size > 0) {
      imports.add(`import { ${Array.from(elementComponents).join(', ')} } from 'element-plus'`)
    }

    return Array.from(imports)
  }

  private generateDependencies(): string[] {
    const deps = new Set<string>()

    // 基础依赖
    deps.add('vue')
    deps.add('element-plus')

    // 根据组件类型添加特定依赖
    this.components.forEach(component => {
      switch (component.type) {
        case 'el-table':
          deps.add('@element-plus/icons-vue')
          break
        case 'el-date-picker':
          deps.add('dayjs')
          break
        case 'el-upload':
          deps.add('axios')
          break
      }
    })

    return Array.from(deps)
  }

  private generateComposables(): string {
    let composables = ''

    // 表单数据
    const hasForm = this.components.some(c => c.type === 'el-form' || c.type === 'el-input')
    if (hasForm) {
      composables += 'const formData = reactive({})\n'
    }

    // 表格数据
    const hasTable = this.components.some(c => c.type === 'el-table')
    if (hasTable) {
      composables += 'const tableData = ref([])\n'
      composables += 'const loading = ref(false)\n'
    }

    return composables
  }

  private generateMethods(): string {
    let methods = ''

    // 根据事件生成方法
    this.components.forEach(component => {
      if (component.props?._events) {
        const events = component.props._events as Array<{ type: string; handler: string }>
        events.forEach(event => {
          const methodName = this.extractMethodName(event.handler)
          if (methodName && !methods.includes(`const ${methodName}`)) {
            methods += `const ${methodName} = () => {\n`
            methods += `  // TODO: 实现 ${event.type} 事件处理\n`
            methods += `  console.log('${event.type} event triggered')\n`
            methods += `}\n\n`
          }
        })
      }
    })

    return methods
  }

  private generateLifecycle(): string {
    let lifecycle = ''

    // 如果有表格，添加数据加载
    const hasTable = this.components.some(c => c.type === 'el-table')
    if (hasTable) {
      lifecycle += 'onMounted(() => {\n'
      lifecycle += '  // TODO: 加载表格数据\n'
      lifecycle += '  loadTableData()\n'
      lifecycle += '})\n\n'

      lifecycle += 'const loadTableData = async () => {\n'
      lifecycle += '  loading.value = true\n'
      lifecycle += '  try {\n'
      lifecycle += '    // TODO: 调用API获取数据\n'
      lifecycle += '    // tableData.value = await api.getData()\n'
      lifecycle += '  } finally {\n'
      lifecycle += '    loading.value = false\n'
      lifecycle += '  }\n'
      lifecycle += '}\n'
    }

    return lifecycle
  }

  private generateInlineStyle(component: DesignerComponent): string {
    if (!component.position) return ''

    const styles: string[] = []

    if (isValidPosition(component.position)) {
      styles.push(`position: absolute`)
      styles.push(`left: ${component.position.x}px`)
      styles.push(`top: ${component.position.y}px`)
    }

    return styles.join('; ')
  }

  private generatePropsString(component: DesignerComponent): string {
    const props: string[] = []

    Object.entries(component.props || {}).forEach(([key, value]) => {
      if (key === 'style' || key.startsWith('_')) return

      if (typeof value === 'string') {
        props.push(`${key}="${value}"`)
      } else if (typeof value === 'boolean') {
        if (value) {
          props.push(key)
        }
      } else if (typeof value === 'number') {
        props.push(`:${key}="${value}"`)
      } else {
        props.push(`:${key}="${JSON.stringify(value).replace(/"/g, "'")}"`)
      }
    })

    return props.join('\n      ')
  }

  private getComponentContent(component: DesignerComponent): string {
    const contentMap: Record<string, string> = {
      'el-button': (component.props?.text as string) || '按钮',
      'el-input': '',
      'el-select': '',
      'el-table': '',
      'el-form': ''
    }

    return contentMap[component.type] || ''
  }

  private sanitizeEventHandler(handler: string): string {
    // 简单的事件处理器清理
    return handler.replace(/[^a-zA-Z0-9_$()]/g, '').substring(0, 50)
  }

  private extractMethodName(handler: string): string | null {
    const match = handler.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/)
    return match ? match[1] : null
  }

  private generateChecksum(): string {
    const content = JSON.stringify({
      components: this.components.length,
      timestamp: new Date().getTime(),
      options: this.options
    })

    // 简单的哈希函数
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }

    return Math.abs(hash).toString(16)
  }
}

// 工厂函数
export function createSchemaExporter(
  components: DesignerComponent[],
  options: ExportOptions
): SchemaExporter {
  return new SchemaExporter(components, options)
}

// 导出工具函数
export function exportDesignerState(
  components: DesignerComponent[],
  options: ExportOptions
): CodeGenerationResult {
  const exporter = createSchemaExporter(components, options)
  return exporter.generateCode()
}
