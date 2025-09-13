import { promises as fs } from "fs"
import path from "node:path"

/**
 * 模板参数接口 - 强制执行命名规范
 */
export interface TemplateParameters {
  EntityName: string // PascalCase: Product, User, Order
  entityName: string // camelCase: product, user, order
  ModuleName: string // 模块名: Catalog, Identity, Sales
  entityDisplayName: string // 显示名: 产品, 用户, 订单
  "kebab-case-name": string // 短横线: product-management
}

/**
 * 模板渲染引擎
 * 基于项目编程规则中的模板库强制执行机制
 */
export class TemplateRenderer {
  private readonly templatesDir: string
  private readonly templateCache = new Map<string, string>()

  constructor(rootDir: string) {
    // 🔧 修复路径：确保指向项目根目录的templates
    // 如果是在src/SmartAbp.Vue下运行，向上两级找templates
    let templatesPath = path.join(rootDir, "templates")

    // 检查是否在src/SmartAbp.Vue目录下
    if (rootDir.endsWith("src/SmartAbp.Vue") || rootDir.includes("SmartAbp.Vue")) {
      // 向上两级到项目根目录
      templatesPath = path.join(rootDir, "../..", "templates")
    }

    this.templatesDir = path.resolve(templatesPath)
    console.log("📂 模板目录路径:", this.templatesDir)
  }

  /**
   * 🔥 强制模板发现 - 基于关键词映射
   */
  async findTemplateByKeywords(keywords: string[]): Promise<string | null> {
    const keywordMap: Record<string, string> = {
      crud: "templates/frontend/components/CrudManagement.template.vue",
      management: "templates/frontend/components/CrudManagement.template.vue",
      list: "templates/frontend/components/CrudManagement.template.vue",
      store: "templates/frontend/stores/EntityStore.template.ts",
      pinia: "templates/frontend/stores/EntityStore.template.ts",
      service: "templates/backend/application/CrudAppService.template.cs",
      dto: "templates/backend/contracts/EntityDto.template.cs",
    }

    for (const keyword of keywords) {
      const templatePath = keywordMap[keyword.toLowerCase()]
      if (templatePath) {
        // 🔧 修复：使用正确的模板目录路径
        const fullPath = path.join(this.templatesDir, templatePath.replace("templates/", ""))
        try {
          await fs.access(fullPath)
          console.log(`✅ 找到模板文件: ${fullPath}`)
          return fullPath
        } catch {
          console.warn(`⚠️ 模板文件不存在: ${fullPath}`)
        }
      }
    }

    return null
  }

  /**
   * 🎯 智能模板匹配 - 基于组件路径
   */
  async getTemplateForComponent(componentPath: string): Promise<string | null> {
    // 提取组件类型关键词
    const keywords: string[] = []

    if (componentPath.includes("Management") || componentPath.includes("List")) {
      keywords.push("crud", "management")
    }
    if (componentPath.includes("store") || componentPath.includes("Store")) {
      keywords.push("store", "pinia")
    }
    if (componentPath.includes("Service")) {
      keywords.push("service")
    }
    if (componentPath.includes("Dto")) {
      keywords.push("dto")
    }

    // 默认使用CRUD管理模板
    if (keywords.length === 0) {
      keywords.push("crud")
    }

    return await this.findTemplateByKeywords(keywords)
  }

  /**
   * 📋 加载模板内容（带缓存）
   */
  async loadTemplate(templatePath: string): Promise<string> {
    if (this.templateCache.has(templatePath)) {
      return this.templateCache.get(templatePath)!
    }

    try {
      const content = await fs.readFile(templatePath, "utf-8")
      this.templateCache.set(templatePath, content)
      return content
    } catch (error) {
      throw new Error(`❌ 无法加载模板: ${templatePath} - ${error}`)
    }
  }

  /**
   * ⚙️ 渲染模板 - 参数替换
   */
  renderTemplate(template: string, params: TemplateParameters): string {
    let rendered = template

    // 🔥 强制参数验证
    const requiredParams = ["EntityName", "entityName", "ModuleName", "entityDisplayName"]
    for (const param of requiredParams) {
      if (!params[param as keyof TemplateParameters]) {
        throw new Error(`❌ 缺少必需的模板参数: ${param}`)
      }
    }

    // 参数替换 - 使用双花括号语法
    Object.entries(params).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g")
      rendered = rendered.replace(regex, value)
    })

    // 兼容旧语法的参数替换
    Object.entries(params).forEach(([key, value]) => {
      const regex = new RegExp(key, "g")
      rendered = rendered.replace(regex, value)
    })

    // 添加生成标识
    const banner = `<!--
AI_GENERATED_COMPONENT: true
Generated at: ${new Date().toISOString()}
Template parameters: ${JSON.stringify(params)}
Based on SmartAbp template library
DO NOT EDIT MANUALLY - Regenerate using module wizard
-->\n\n`

    return banner + rendered
  }

  /**
   * 🏗️ 完整的组件生成流程
   */
  async generateComponent(
    componentPath: string,
    params: TemplateParameters,
  ): Promise<{ content: string; templateUsed: string }> {
    console.log(`🔍 正在为组件生成代码: ${componentPath}`)

    // 1. 查找合适的模板
    const templatePath = await this.getTemplateForComponent(componentPath)
    if (!templatePath) {
      throw new Error(`❌ 无法找到适合的模板: ${componentPath}`)
    }

    console.log(`📋 使用模板: ${templatePath}`)

    // 2. 加载模板内容
    const template = await this.loadTemplate(templatePath)

    // 3. 渲染模板
    const content = this.renderTemplate(template, params)

    return {
      content,
      templateUsed: templatePath,
    }
  }

  /**
   * 📊 生成报告
   */
  generateReport(
    results: Array<{
      component: string
      templateUsed: string
      success: boolean
      error?: string
    }>,
  ): string {
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    let report = `
📊 **组件生成报告**
✅ 成功生成: ${successful} 个组件
❌ 生成失败: ${failed} 个组件

📋 **生成详情**:
`

    results.forEach((result) => {
      const status = result.success ? "✅" : "❌"
      report += `${status} ${result.component}\n`
      report += `   模板: ${result.templateUsed}\n`
      if (result.error) {
        report += `   错误: ${result.error}\n`
      }
      report += `\n`
    })

    return report
  }
}

/**
 * 🎯 智能参数生成 - 从Manifest推导模板参数
 */
export function generateTemplateParams(
  manifestName: string,
  displayName?: string,
): TemplateParameters {
  const EntityName = manifestName.charAt(0).toUpperCase() + manifestName.slice(1)
  const entityName = manifestName.charAt(0).toLowerCase() + manifestName.slice(1)
  const kebabCaseName = manifestName
    .toLowerCase()
    .replace(/([A-Z])/g, "-$1")
    .replace(/^-/, "")

  return {
    EntityName,
    entityName,
    ModuleName: EntityName,
    entityDisplayName: displayName || EntityName,
    "kebab-case-name": kebabCaseName,
  }
}
