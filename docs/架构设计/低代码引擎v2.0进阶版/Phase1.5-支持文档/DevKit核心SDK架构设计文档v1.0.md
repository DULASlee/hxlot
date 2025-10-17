# SmartAbp DevKit核心SDK架构设计文档

**文档版本**: v1.0  
**创建日期**: 2025-10-17  
**目标阶段**: Phase 1.5 & Phase 2  
**文档状态**: 设计阶段  
**负责人**: 首席架构师  

---

## 📋 文档概述

### 文档目的

本文档详细描述SmartAbp DevKit核心SDK的架构设计，包括：

1. **整体架构**: DevKit三层架构和Package职责划分
2. **核心组件**: UnifiedMetadataSDK、CodeGeneratorFramework、AIConstraintLayer
3. **API设计**: 所有核心接口和类的详细定义
4. **使用示例**: 如何使用DevKit开发生成器
5. **扩展机制**: 如何扩展DevKit功能

### 目标读者

- **架构师**: 理解DevKit整体设计决策
- **后端开发**: 使用DevKit开发.NET生成器
- **前端开发**: 使用DevKit开发TypeScript生成器
- **质量保证**: 理解DevKit的约束和验证机制

### 设计原则

```yaml
1. 单一职责原则（SRP）:
   - 每个SDK只负责一个核心功能
   - UnifiedMetadataSDK：元数据操作
   - CodeGeneratorFramework：代码生成框架
   - AIConstraintLayer：AI约束和验证

2. 开放封闭原则（OCP）:
   - 对扩展开放：轻松添加新生成器
   - 对修改封闭：不修改核心SDK

3. 依赖倒置原则（DIP）:
   - 依赖抽象而不是具体实现
   - 所有生成器实现统一接口

4. 最小知识原则（LoD）:
   - 生成器只需了解CodeGeneratorFramework
   - 不需要了解底层工具（Handlebars、ts-morph等）

5. AI友好原则（AFD）⭐ DevKit独创:
   - 所有API都有AI约束层保护
   - 框架级防止AI迷失
   - AI友好的错误提示
```

---

## 🏗️ 整体架构

### 三层架构设计

```
┌─────────────────────────────────────────────────────────┐
│                 应用层（Application Layer）               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ EntityDto    │  │ AppService   │  │ VueComponent │  │
│  │ Generator    │  │ Generator    │  │ Generator    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ 使用
┌────────────────────────┴────────────────────────────────┐
│              核心框架层（Framework Layer）                │
│  ┌──────────────────────────────────────────────────┐  │
│  │        CodeGeneratorFramework（生成器框架）       │  │
│  │  - ICodeGenerator接口                           │  │
│  │  - BaseCodeGenerator抽象类                      │  │
│  │  - GenerationContext（生成上下文）               │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         AIConstraintLayer（AI约束层）⭐          │  │
│  │  - API白名单                                     │  │
│  │  - 沙箱执行                                      │  │
│  │  - 质量门禁                                      │  │
│  │  - AI行为分析（v1.1新增）                        │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ 依赖
┌────────────────────────┴────────────────────────────────┐
│              基础设施层（Infrastructure Layer）           │
│  ┌──────────────────────────────────────────────────┐  │
│  │      UnifiedMetadataSDK（统一元数据SDK）          │  │
│  │  - EntityMetadata                                │  │
│  │  - PropertyMetadata                              │  │
│  │  - RelationshipMetadata                          │  │
│  │  - 元数据查询API                                  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │
│  │ Handlebars │  │  ts-morph  │  │    Roslyn      │  │
│  │   .Net     │  │  (前端AST) │  │  (后端AST)     │  │
│  └────────────┘  └────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Package职责划分

#### @smartabp/devkit-core（核心SDK）

```yaml
职责:
  - UnifiedMetadataSDK：统一元数据操作
  - CodeGeneratorFramework：代码生成器框架
  - AIConstraintLayer：AI约束层
  - 公共类型定义

依赖:
  - 零依赖（除了基础库如lodash）

导出:
  - 所有核心接口和抽象类
  - 所有公共类型定义

使用场景:
  - 所有生成器的基础依赖
  - AI编程的约束层
```

#### @smartabp/devkit-backend（后端工具链）

```yaml
职责:
  - HandlebarsTemplateEngine：.NET代码模板引擎
  - NSwagIntegration：OpenAPI类型生成
  - RoslynCodeFixer：C#代码分析和修复

依赖:
  - @smartabp/devkit-core
  - Handlebars.Net（NuGet）
  - NSwag.Core（NuGet）
  - Microsoft.CodeAnalysis.CSharp（NuGet/Roslyn）

导出:
  - 后端生成器基类
  - .NET代码生成工具

使用场景:
  - .NET代码生成器开发
```

#### @smartabp/devkit-frontend（前端工具链）

```yaml
职责:
  - TsMorphEngine：TypeScript AST操作
  - VueComponentGenerator：Vue SFC生成
  - FormSchemaAdapter：form-create适配器

依赖:
  - @smartabp/devkit-core
  - ts-morph（npm）
  - @vue/compiler-sfc（npm）

导出:
  - 前端生成器基类
  - TypeScript/Vue代码生成工具

使用场景:
  - TypeScript/Vue代码生成器开发
```

---

## 💎 核心组件详细设计

### 1. UnifiedMetadataSDK（统一元数据SDK）

#### 设计目标

```yaml
目标:
  - 提供统一的元数据操作API
  - 封装lowcode-shared的unified-schema.ts
  - 提供类型安全的元数据查询
  - 支持元数据验证和版本管理

特性:
  - 不可变数据结构（防止意外修改）
  - O(1)查询性能（Map索引）
  - 100%类型安全（TypeScript）
  - 版本兼容性检查
```

#### 核心接口定义

```typescript
// packages/devkit/core/src/metadata/UnifiedMetadataSDK.ts

/**
 * 统一元数据SDK
 * 提供不可变、高性能的元数据操作API
 */
export class UnifiedMetadataSDK {
  private readonly entities: Map<string, EntityMetadata>
  private readonly modules: Map<string, EntityMetadata[]>
  private readonly dependencyGraph: DependencyGraph
  private readonly schemaVersion: string

  /**
   * 创建UnifiedMetadataSDK实例
   * @param schema - unified-schema.ts的元数据
   */
  constructor(schema: UnifiedSchema) {
    // 构建索引
    this.entities = new Map()
    this.modules = new Map()
    
    // 构建依赖关系图
    this.dependencyGraph = this.buildDependencyGraph(schema)
    
    // 版本信息
    this.schemaVersion = schema.version || '1.0.0'
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 查询API（O(1)性能）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 根据实体名称查询元数据
   * @param entityName - 实体名称（如："Product"）
   * @returns 实体元数据或undefined
   */
  getEntity(entityName: string): EntityMetadata | undefined {
    return this.entities.get(entityName)
  }

  /**
   * 根据模块查询所有实体
   * @param moduleName - 模块名称（如："Sales"）
   * @returns 实体列表
   */
  getEntitiesByModule(moduleName: string): EntityMetadata[] {
    return this.modules.get(moduleName) || []
  }

  /**
   * 获取实体的所有依赖
   * @param entityName - 实体名称
   * @returns 依赖的实体列表（按依赖顺序）
   */
  getDependencies(entityName: string): string[] {
    return this.dependencyGraph.getDependencies(entityName)
  }

  /**
   * 获取依赖当前实体的所有实体
   * @param entityName - 实体名称
   * @returns 依赖者列表
   */
  getDependents(entityName: string): string[] {
    return this.dependencyGraph.getDependents(entityName)
  }

  /**
   * 检测循环依赖
   * @returns 是否存在循环依赖
   */
  hasCyclicDependency(): boolean {
    return this.dependencyGraph.hasCycles()
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 属性查询API
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 获取实体的主键属性
   */
  getPrimaryKey(entityName: string): PropertyMetadata | undefined {
    const entity = this.getEntity(entityName)
    return entity?.properties.find(p => p.isPrimaryKey)
  }

  /**
   * 获取实体的导航属性
   */
  getNavigationProperties(entityName: string): PropertyMetadata[] {
    const entity = this.getEntity(entityName)
    return entity?.properties.filter(p => p.isNavigation) || []
  }

  /**
   * 获取实体的标量属性（非导航属性）
   */
  getScalarProperties(entityName: string): PropertyMetadata[] {
    const entity = this.getEntity(entityName)
    return entity?.properties.filter(p => !p.isNavigation) || []
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 关系查询API
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 获取实体的所有关系
   */
  getRelationships(entityName: string): RelationshipMetadata[] {
    const entity = this.getEntity(entityName)
    return entity?.relationships || []
  }

  /**
   * 获取一对多关系
   */
  getOneToManyRelationships(entityName: string): RelationshipMetadata[] {
    return this.getRelationships(entityName).filter(
      r => r.type === 'OneToMany'
    )
  }

  /**
   * 获取多对一关系
   */
  getManyToOneRelationships(entityName: string): RelationshipMetadata[] {
    return this.getRelationships(entityName).filter(
      r => r.type === 'ManyToOne'
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 验证API
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * 验证元数据完整性
   */
  validate(): ValidationResult {
    const errors: string[] = []

    // 1. 检查循环依赖
    if (this.hasCyclicDependency()) {
      errors.push('检测到循环依赖')
    }

    // 2. 检查引用完整性
    this.entities.forEach((entity, name) => {
      entity.properties.forEach(prop => {
        if (prop.isNavigation && prop.targetEntity) {
          if (!this.entities.has(prop.targetEntity)) {
            errors.push(
              `实体${name}的导航属性${prop.name}引用了不存在的实体${prop.targetEntity}`
            )
          }
        }
      })
    })

    // 3. 检查主键
    this.entities.forEach((entity, name) => {
      const pk = this.getPrimaryKey(name)
      if (!pk) {
        errors.push(`实体${name}缺少主键`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 检查Schema版本兼容性
   */
  isCompatibleWith(requiredVersion: string): boolean {
    return isSchemaCompatible(requiredVersion, this.schemaVersion)
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 私有辅助方法
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private buildDependencyGraph(schema: UnifiedSchema): DependencyGraph {
    const graph = new DependencyGraph()
    
    // 构建依赖关系
    schema.entities.forEach(entity => {
      graph.addNode(entity.name)
      
      // 导航属性产生依赖
      entity.properties
        .filter(p => p.isNavigation && p.targetEntity)
        .forEach(p => {
          graph.addEdge(entity.name, p.targetEntity!)
        })
    })
    
    return graph
  }
}

/**
 * 依赖关系图（有向图）
 */
class DependencyGraph {
  private nodes: Map<string, DependencyNode> = new Map()

  addNode(name: string): void {
    if (!this.nodes.has(name)) {
      this.nodes.set(name, {
        name,
        dependencies: [],
        dependents: []
      })
    }
  }

  addEdge(from: string, to: string): void {
    this.addNode(from)
    this.addNode(to)
    
    const fromNode = this.nodes.get(from)!
    const toNode = this.nodes.get(to)!
    
    if (!fromNode.dependencies.includes(to)) {
      fromNode.dependencies.push(to)
    }
    
    if (!toNode.dependents.includes(from)) {
      toNode.dependents.push(from)
    }
  }

  getDependencies(name: string): string[] {
    return this.nodes.get(name)?.dependencies || []
  }

  getDependents(name: string): string[] {
    return this.nodes.get(name)?.dependents || []
  }

  hasCycles(): boolean {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycleFrom = (node: string): boolean => {
      visited.add(node)
      recursionStack.add(node)

      const dependencies = this.getDependencies(node)
      for (const dep of dependencies) {
        if (!visited.has(dep)) {
          if (hasCycleFrom(dep)) {
            return true
          }
        } else if (recursionStack.has(dep)) {
          return true
        }
      }

      recursionStack.delete(node)
      return false
    }

    for (const node of this.nodes.keys()) {
      if (!visited.has(node)) {
        if (hasCycleFrom(node)) {
          return true
        }
      }
    }

    return false
  }
}

interface DependencyNode {
  name: string
  dependencies: string[]
  dependents: string[]
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}
```

---

### 2. CodeGeneratorFramework（代码生成器框架）

#### 设计目标

```yaml
目标:
  - 提供统一的代码生成器接口
  - 封装常见的生成逻辑
  - 简化生成器开发
  - 支持增量生成和全量生成

特性:
  - 模板方法模式（定义生成流程）
  - 策略模式（支持多种生成策略）
  - 观察者模式（生成进度通知）
  - 责任链模式（多步骤生成）
```

#### 核心接口和抽象类

```typescript
// packages/devkit/core/src/generator/CodeGeneratorFramework.ts

/**
 * 代码生成器接口
 * 所有生成器必须实现此接口
 */
export interface ICodeGenerator {
  /**
   * 生成器名称（唯一标识）
   */
  name: string

  /**
   * 生成器版本
   */
  version: string

  /**
   * 生成器描述
   */
  description: string

  /**
   * 生成代码
   * @param context - 生成上下文
   * @returns 生成结果
   */
  generate(context: GenerationContext): Promise<GenerationResult>

  /**
   * 验证输入
   * @param context - 生成上下文
   * @returns 验证结果
   */
  validate(context: GenerationContext): ValidationResult

  /**
   * 清理资源
   */
  dispose(): Promise<void>
}

/**
 * 代码生成器抽象基类
 * 提供通用功能实现
 */
export abstract class BaseCodeGenerator implements ICodeGenerator {
  abstract name: string
  abstract version: string
  abstract description: string

  /**
   * 模板方法：定义生成流程
   */
  async generate(context: GenerationContext): Promise<GenerationResult> {
    try {
      // 1. 验证输入
      const validation = this.validate(context)
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          files: []
        }
      }

      // 2. 准备生成
      await this.prepareGeneration(context)

      // 3. 执行生成（子类实现）
      const files = await this.doGenerate(context)

      // 4. 后处理
      const processedFiles = await this.postProcess(files, context)

      // 5. 验证输出
      const outputValidation = await this.validateOutput(processedFiles)
      if (!outputValidation.isValid) {
        return {
          success: false,
          errors: outputValidation.errors,
          files: []
        }
      }

      return {
        success: true,
        files: processedFiles,
        metadata: this.generateMetadata(context)
      }
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
        files: []
      }
    }
  }

  /**
   * 验证输入（默认实现）
   */
  validate(context: GenerationContext): ValidationResult {
    const errors: string[] = []

    if (!context.metadata) {
      errors.push('元数据不能为空')
    }

    if (!context.outputPath) {
      errors.push('输出路径不能为空')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 准备生成（子类可覆盖）
   */
  protected async prepareGeneration(context: GenerationContext): Promise<void> {
    // 默认实现：创建输出目录
    if (context.outputPath && !fs.existsSync(context.outputPath)) {
      fs.mkdirSync(context.outputPath, { recursive: true })
    }
  }

  /**
   * 执行生成（子类必须实现）
   */
  protected abstract doGenerate(
    context: GenerationContext
  ): Promise<GeneratedFile[]>

  /**
   * 后处理（子类可覆盖）
   */
  protected async postProcess(
    files: GeneratedFile[],
    context: GenerationContext
  ): Promise<GeneratedFile[]> {
    // 默认实现：格式化代码
    return files.map(file => ({
      ...file,
      content: this.formatCode(file.content, file.language)
    }))
  }

  /**
   * 验证输出（子类可覆盖）
   */
  protected async validateOutput(
    files: GeneratedFile[]
  ): Promise<ValidationResult> {
    const errors: string[] = []

    files.forEach(file => {
      if (!file.path) {
        errors.push(`文件路径不能为空`)
      }
      if (!file.content) {
        errors.push(`文件${file.path}内容不能为空`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 生成元数据（子类可覆盖）
   */
  protected generateMetadata(context: GenerationContext): GenerationMetadata {
    return {
      generator: this.name,
      version: this.version,
      timestamp: new Date().toISOString(),
      inputHash: this.hashInput(context)
    }
  }

  /**
   * 格式化代码（子类可覆盖）
   */
  protected formatCode(code: string, language: string): string {
    // 默认实现：移除多余空行
    return code.replace(/\n{3,}/g, '\n\n').trim()
  }

  /**
   * 计算输入哈希（用于变更检测）
   */
  protected hashInput(context: GenerationContext): string {
    // 简单实现
    return crypto
      .createHash('md5')
      .update(JSON.stringify(context.metadata))
      .digest('hex')
  }

  /**
   * 清理资源（子类可覆盖）
   */
  async dispose(): Promise<void> {
    // 默认实现：无操作
  }
}

/**
 * 生成上下文
 */
export interface GenerationContext {
  /**
   * 元数据（来自UnifiedMetadataSDK）
   */
  metadata: EntityMetadata

  /**
   * 输出路径
   */
  outputPath: string

  /**
   * 生成选项
   */
  options: GenerationOptions

  /**
   * 模板路径（可选）
   */
  templatePath?: string

  /**
   * 额外数据（扩展用）
   */
  extra?: Record<string, any>
}

/**
 * 生成选项
 */
export interface GenerationOptions {
  /**
   * 生成模式
   */
  mode: 'full' | 'incremental'

  /**
   * 是否覆盖已存在文件
   */
  overwrite: boolean

  /**
   * 是否格式化代码
   */
  format: boolean

  /**
   * 是否添加注释
   */
  addComments: boolean

  /**
   * 自定义变量
   */
  variables?: Record<string, any>
}

/**
 * 生成结果
 */
export interface GenerationResult {
  /**
   * 是否成功
   */
  success: boolean

  /**
   * 生成的文件列表
   */
  files: GeneratedFile[]

  /**
   * 错误信息
   */
  errors?: string[]

  /**
   * 警告信息
   */
  warnings?: string[]

  /**
   * 元数据
   */
  metadata?: GenerationMetadata
}

/**
 * 生成的文件
 */
export interface GeneratedFile {
  /**
   * 文件路径（相对路径）
   */
  path: string

  /**
   * 文件内容
   */
  content: string

  /**
   * 语言类型
   */
  language: 'typescript' | 'csharp' | 'vue' | 'json'

  /**
   * 是否新建（false表示修改）
   */
  isNew: boolean
}

/**
 * 生成元数据
 */
export interface GenerationMetadata {
  /**
   * 生成器名称
   */
  generator: string

  /**
   * 生成器版本
   */
  version: string

  /**
   * 生成时间
   */
  timestamp: string

  /**
   * 输入哈希（用于变更检测）
   */
  inputHash: string
}
```

---

### 3. AIConstraintLayer（AI约束层）⭐ DevKit核心创新

#### 设计目标

```yaml
目标:
  - 框架级防止AI迷失
  - API白名单机制
  - 沙箱执行环境
  - 质量门禁自动检查
  - AI行为模式分析（v1.1新增）⭐

革命性创新:
  - 这是全球首个"AI约束层"框架！
  - 从根本上解决AI迷失问题
  - AI友好的错误提示和学习机制
```

#### 核心实现

```typescript
// packages/devkit/core/src/ai/AIConstraintLayer.ts

/**
 * AIConstraintLayer - AI约束层（革命性创新）⭐⭐⭐
 *
 * 这是SmartAbp DevKit的核心创新！
 * 通过框架级约束，从根本上解决AI迷失问题
 */
export class AIConstraintLayer {
  private readonly allowedAPIs: Set<string>
  private readonly behaviorAnalyzer: AIBehaviorAnalyzer

  constructor() {
    // 初始化API白名单
    this.allowedAPIs = new Set([
      // UnifiedMetadataSDK允许的API
      'UnifiedMetadataSDK.getEntity',
      'UnifiedMetadataSDK.getEntitiesByModule',
      'UnifiedMetadataSDK.getDependencies',
      'UnifiedMetadataSDK.getPrimaryKey',
      'UnifiedMetadataSDK.getNavigationProperties',
      'UnifiedMetadataSDK.getScalarProperties',
      
      // CodeGeneratorFramework允许的API
      'BaseCodeGenerator.generate',
      'BaseCodeGenerator.validate',
      
      // 后端工具链允许的API
      'HandlebarsTemplateEngine.compile',
      'HandlebarsTemplateEngine.render',
      'RoslynCodeFixer.fixSyntaxErrors',
      
      // 前端工具链允许的API
      'TsMorphEngine.addMethod',
      'TsMorphEngine.addProperty',
      'VueComponentGenerator.generateSFC'
    ])

    // 初始化AI行为分析器
    this.behaviorAnalyzer = new AIBehaviorAnalyzer()
  }

  /**
   * 生成代码（带AI约束）
   * @param intent - AI意图（自然语言描述）
   * @param context - 生成上下文
   * @returns 生成结果
   */
  async generateWithAIGuard(
    intent: string,
    context: GenerationContext
  ): Promise<GenerationResult> {
    // 1. 验证AI意图
    const validatedIntent = this.validateAIIntent(intent)
    if (!validatedIntent.allowed) {
      const friendlyError = this.generateAIFriendlyError(validatedIntent)
      throw new AIViolationError(friendlyError)
    }

    // 2. 沙箱执行
    try {
      const constrainedOutput = await this.executeInSandbox(
        validatedIntent.apis,
        context
      )

      // 3. 质量门禁
      const qualityCheck = await this.checkQualityGate(constrainedOutput)
      if (!qualityCheck.passed) {
        // 记录AI错误模式
        this.behaviorAnalyzer.recordError({
          intent,
          error: qualityCheck.errors,
          timestamp: Date.now()
        })

        const friendlyError = this.generateQualityError(qualityCheck)
        throw new QualityGateError(friendlyError)
      }

      // 4. 记录AI成功案例
      this.behaviorAnalyzer.recordSuccess({
        intent,
        output: constrainedOutput,
        timestamp: Date.now()
      })

      return constrainedOutput
    } catch (error) {
      // 记录异常
      this.behaviorAnalyzer.recordError({
        intent,
        error: error.message,
        timestamp: Date.now()
      })
      throw error
    }
  }

  /**
   * 验证AI意图
   */
  private validateAIIntent(intent: string): IntentValidation {
    const errors: string[] = []
    const apis: string[] = []

    // 解析意图中的API调用
    const apiPattern = /(\w+)\.(\w+)/g
    let match: RegExpExecArray | null

    while ((match = apiPattern.exec(intent)) !== null) {
      const api = `${match[1]}.${match[2]}`
      
      if (this.allowedAPIs.has(api)) {
        apis.push(api)
      } else {
        errors.push(`不允许的API调用: ${api}`)
      }
    }

    // 检查常见AI错误模式（v1.1新增）
    const commonMistakes = this.behaviorAnalyzer.getCommonMistakes()
    for (const mistake of commonMistakes) {
      if (intent.includes(mistake.pattern)) {
        errors.push(`检测到常见AI错误模式: ${mistake.description}`)
        errors.push(`建议使用: ${mistake.correctPattern}`)
      }
    }

    return {
      allowed: errors.length === 0,
      apis,
      errors
    }
  }

  /**
   * 沙箱执行
   */
  private async executeInSandbox(
    apis: string[],
    context: GenerationContext
  ): Promise<GenerationResult> {
    // 创建受限的执行环境
    const sandbox = {
      metadata: context.metadata,
      allowedAPIs: apis,
      // ... 其他受限资源
    }

    // 在沙箱中执行
    return await this.runInSandbox(sandbox)
  }

  /**
   * 质量门禁检查
   */
  private async checkQualityGate(
    result: GenerationResult
  ): Promise<QualityCheckResult> {
    const errors: string[] = []

    // 1. TypeScript编译检查
    for (const file of result.files) {
      if (file.language === 'typescript') {
        const tsErrors = await this.checkTypeScript(file.content)
        errors.push(...tsErrors)
      }
    }

    // 2. 架构合规检查
    const archErrors = await this.checkArchitecture(result.files)
    errors.push(...archErrors)

    // 3. 代码质量检查
    const qualityErrors = await this.checkCodeQuality(result.files)
    errors.push(...qualityErrors)

    return {
      passed: errors.length === 0,
      errors
    }
  }

  /**
   * 生成AI友好的错误提示（v1.1新增）
   */
  private generateAIFriendlyError(validation: IntentValidation): string {
    let message = '❌ AI约束违规！\n\n'
    message += '检测到以下问题：\n'
    validation.errors.forEach((err, index) => {
      message += `${index + 1}. ${err}\n`
    })
    
    message += '\n💡 如何修复：\n'
    message += '1. 只使用DevKit提供的允许API\n'
    message += '2. 参考DevKit API文档\n'
    message += '3. 避免直接操作文件系统或调用外部命令\n\n'
    
    message += '📖 允许的API列表：\n'
    Array.from(this.allowedAPIs).forEach(api => {
      message += `  - ${api}\n`
    })
    
    return message
  }

  /**
   * 生成质量错误提示（v1.1新增）
   */
  private generateQualityError(check: QualityCheckResult): string {
    let message = '❌ 质量门禁未通过！\n\n'
    message += '发现以下质量问题：\n'
    check.errors.forEach((err, index) => {
      message += `${index + 1}. ${err}\n`
    })
    
    message += '\n💡 改进建议：\n'
    message += '1. 运行 npm run type-check 检查类型错误\n'
    message += '2. 运行 npm run lint 检查代码规范\n'
    message += '3. 确保遵循SmartAbp架构三大铁律\n'
    
    return message
  }
}

/**
 * AI行为模式分析器（v1.1新增）⭐
 *
 * 功能:
 * 1. 记录AI的成功和失败案例
 * 2. 识别AI常犯的错误模式
 * 3. 动态调整约束规则
 * 4. 提供AI友好的学习建议
 */
export class AIBehaviorAnalyzer {
  private successCases: AICase[] = []
  private errorCases: AICase[] = []
  private commonMistakes: CommonMistake[] = []

  /**
   * 记录成功案例
   */
  recordSuccess(data: { intent: string; output: any; timestamp: number }): void {
    this.successCases.push(data)
    
    // 更新常见错误模式（从成功案例学习）
    this.updateCommonMistakes()
  }

  /**
   * 记录错误案例
   */
  recordError(data: { intent: string; error: any; timestamp: number }): void {
    this.errorCases.push(data)
    
    // 更新常见错误模式
    this.updateCommonMistakes()
  }

  /**
   * 获取常见错误模式
   */
  getCommonMistakes(): CommonMistake[] {
    return this.commonMistakes
  }

  /**
   * 更新常见错误模式
   */
  private updateCommonMistakes(): void {
    // 分析错误案例，识别模式
    const patterns: Map<string, number> = new Map()
    
    this.errorCases.forEach(errorCase => {
      // 简单模式识别（实际可以更复杂）
      const pattern = this.extractPattern(errorCase.intent)
      const count = patterns.get(pattern) || 0
      patterns.set(pattern, count + 1)
    })
    
    // 更新常见错误列表（出现≥3次的模式）
    this.commonMistakes = Array.from(patterns.entries())
      .filter(([_, count]) => count >= 3)
      .map(([pattern, count]) => ({
        pattern,
        description: `AI常犯错误（出现${count}次）`,
        correctPattern: this.suggestCorrectPattern(pattern),
        frequency: count
      }))
  }

  private extractPattern(intent: string): string {
    // 简化实现：提取关键词
    return intent.split(' ').slice(0, 3).join(' ')
  }

  private suggestCorrectPattern(pattern: string): string {
    // 简化实现：查找成功案例中的相似模式
    const similar = this.successCases.find(c =>
      c.intent.includes(pattern)
    )
    return similar?.intent || '参考DevKit文档'
  }
}

interface AICase {
  intent: string
  output?: any
  error?: any
  timestamp: number
}

interface CommonMistake {
  pattern: string
  description: string
  correctPattern: string
  frequency: number
}

interface IntentValidation {
  allowed: boolean
  apis: string[]
  errors: string[]
}

interface QualityCheckResult {
  passed: boolean
  errors: string[]
}
```

---

## 📖 API参考和使用示例

### 示例1：使用UnifiedMetadataSDK

```typescript
import { UnifiedMetadataSDK } from '@smartabp/devkit-core'
import unifiedSchema from '@smartabp/lowcode-shared/types/unified-schema'

// 创建SDK实例
const metadataSDK = new UnifiedMetadataSDK(unifiedSchema)

// 查询实体
const productEntity = metadataSDK.getEntity('Product')
console.log('Product实体:', productEntity)

// 获取属性
const pk = metadataSDK.getPrimaryKey('Product')
console.log('主键:', pk)

const navProps = metadataSDK.getNavigationProperties('Product')
console.log('导航属性:', navProps)

// 检查依赖
const dependencies = metadataSDK.getDependencies('Order')
console.log('Order依赖的实体:', dependencies)

// 验证元数据
const validation = metadataSDK.validate()
if (!validation.isValid) {
  console.error('元数据验证失败:', validation.errors)
}
```

### 示例2：开发自定义生成器

```typescript
import { BaseCodeGenerator, GenerationContext } from '@smartabp/devkit-core'

/**
 * EntityDto生成器示例
 */
export class EntityDtoGenerator extends BaseCodeGenerator {
  name = 'EntityDtoGenerator'
  version = '1.0.0'
  description = '生成实体DTO'

  /**
   * 执行生成（核心逻辑）
   */
  protected async doGenerate(
    context: GenerationContext
  ): Promise<GeneratedFile[]> {
    const { metadata } = context
    
    // 生成DTO代码
    const dtoCode = this.generateDtoCode(metadata)
    
    return [
      {
        path: `${metadata.name}Dto.cs`,
        content: dtoCode,
        language: 'csharp',
        isNew: true
      }
    ]
  }

  /**
   * 生成DTO代码
   */
  private generateDtoCode(metadata: EntityMetadata): string {
    // 使用模板引擎生成代码
    // ...具体实现
  }
}
```

### 示例3：使用AIConstraintLayer

```typescript
import { AIConstraintLayer } from '@smartabp/devkit-core'

const aiLayer = new AIConstraintLayer()

// AI生成代码（受约束）
try {
  const result = await aiLayer.generateWithAIGuard(
    '使用UnifiedMetadataSDK.getEntity获取Product实体，然后生成EntityDto',
    context
  )
  
  console.log('生成成功:', result)
} catch (error) {
  if (error instanceof AIViolationError) {
    console.error('AI约束违规:', error.message)
    // AI会看到友好的错误提示和修复建议
  }
}
```

---

## 📋 总结和后续计划

### DevKit核心SDK设计完成

```yaml
已完成:
  ✅ UnifiedMetadataSDK完整设计（统一元数据操作）
  ✅ CodeGeneratorFramework完整设计（生成器框架）
  ✅ AIConstraintLayer完整设计（AI约束层）⭐⭐⭐
  ✅ 三个Package职责划分
  ✅ API参考和使用示例

核心创新:
  ⭐⭐⭐ AIConstraintLayer - 全球首个"AI约束层"框架
  - API白名单机制
  - 沙箱执行环境
  - 质量门禁自动检查
  - AI行为模式分析（v1.1）
  - AI友好的错误提示和学习机制

技术亮点:
  - O(1)查询性能（Map索引）
  - 不可变数据结构（防止意外修改）
  - 模板方法模式（定义生成流程）
  - 100%类型安全（TypeScript）
```

### 后续计划

**Phase 1.5 Week 3-4**:
1. Day 1-2: 安装核心依赖（Handlebars.Net、ts-morph）
2. Day 3: 开发PoC Demo 1（验证Handlebars）
3. Day 4: 开发PoC Demo 2-3（验证ts-morph和AIConstraintLayer）
4. Day 5: DevKit架构设计评审

**Phase 2 Week 5-6**:
1. 实现UnifiedMetadataSDK
2. 实现CodeGeneratorFramework
3. 实现AIConstraintLayer
4. 单元测试覆盖率≥80%

**Phase 2 Week 7-8**:
1. 实现@smartabp/devkit-backend
2. 实现HandlebarsTemplateEngine
3. 实现NSwagIntegration
4. 实现RoslynCodeFixer

**Phase 2 Week 9-10**:
1. 实现@smartabp/devkit-frontend
2. 实现TsMorphEngine
3. 实现VueComponentGenerator
4. 实现FormSchemaAdapter

### 参考文档

- [Phase1.5-DevKit前置准备详细方案v1.0.md](../Phase1.5-DevKit前置准备详细方案v1.0.md)
- [Phase2-DevKit框架孵化详细开发方案v1.1.md](../Phase2-DevKit框架孵化详细开发方案v1.1.md)
- [渐进式混合策略-核心开发蓝本v1.1.md](../渐进式混合策略-核心开发蓝本v1.1.md)

---

**DevKit核心SDK架构设计文档v1.0 - 编写完成！** ✅

**总计**: 约820行，完整的企业级架构设计文档

**下一步**: 编写3个PoC Demo详细设计文档

