# SmartAbpV2.0渐进式混合策略 - DevKit框架孵化详细开发方案

**文档版本**: v1.0
**创建日期**: 2025-10-17
**执行周期**: 6周（Week 3-8）
**执行优先级**: 🔥 P1高优先级（并行开发）
**前置依赖**: Phase 1快速止血方案已完成

---

## 📋 目录

1. [方案总览](#方案总览)
2. [资源规划矩阵](#资源规划矩阵)
3. [Week 3-4: DevKit核心SDK](#week-3-4-devkit核心sdk)
4. [Week 5-6: DevKit后端工具链](#week-5-6-devkit后端工具链)
5. [Week 7-8: DevKit前端工具链](#week-7-8-devkit前端工具链)

---

## 一、方案总览

### 1.1 核心目标

```yaml
战略目标:
  建立统一生成器框架，封装所有工具，提供统一接口

量化指标:
  ✅ DevKit核心SDK完成率: 100%
  ✅ 单元测试覆盖率: ≥80%
  ✅ API文档完整度: ≥95%
  ✅ AI约束层有效率: ≥90%
  ✅ 性能基准: 单实体生成≤800ms

技术方案:
  1. @smartabp/devkit-core（核心SDK）
  2. @smartabp/devkit-backend（后端工具链）
  3. @smartabp/devkit-frontend（前端工具链）
  4. AIConstraintLayer（革命性创新）⭐⭐⭐
```

### 1.2 执行时间表

```mermaid
gantt
    title Phase 2 DevKit框架孵化 - 6周详细排期
    dateFormat  YYYY-MM-DD
    section Week 3-4: 核心SDK
    项目初始化           :a1, 2025-10-28, 2d
    UnifiedMetadataSDK  :a2, after a1, 3d
    CodeGeneratorFramework :a3, after a2, 3d
    AIConstraintLayer   :a4, after a3, 4d

    section Week 5-6: 后端工具链
    HandlebarsEngine    :b1, 2025-11-11, 4d
    NSwagIntegration    :b2, after b1, 3d
    RoslynCodeFixer     :b3, after b2, 3d

    section Week 7-8: 前端工具链
    TsMorphEngine       :c1, 2025-11-25, 4d
    VueGenerator        :c2, after c1, 3d
    FormSchemaAdapter   :c3, after c2, 3d
```

### 1.3 关键里程碑

| 里程碑 | 时间节点 | 量化验收标准 | 负责人 |
|--------|---------|-------------|--------|
| **M1: 核心SDK完成** | Week 4末 | ✅ UnifiedMetadataSDK API完整<br>✅ AIConstraintLayer沙箱验证<br>✅ 单元测试覆盖率≥80% | 架构师 |
| **M2: 后端工具链完成** | Week 6末 | ✅ Handlebars模板渲染成功<br>✅ NSwag集成测试通过<br>✅ Roslyn代码修复验证 | 后端开发 |
| **M3: 前端工具链完成** | Week 8末 | ✅ ts-morph AST操作成功<br>✅ Vue组件生成验证<br>✅ form-create适配完成 | 前端开发 |
| **M4: DevKit完整验收** | Week 8末 | ✅ 完整生成流程验证<br>✅ 性能基准达标<br>✅ 文档100%完整 | 架构师 |

---

## 二、资源规划矩阵

### 2.1 人力资源分配

| 角色 | 人数 | 技能要求 | 投入时间 | Week 3-4任务 | Week 5-6任务 | Week 7-8任务 |
|------|------|---------|----------|------------|------------|------------|
| **架构师** | 1人 | 框架设计<br>API设计<br>技术决策 | 全职<br>（240小时） | 核心SDK设计<br>AIConstraintLayer | 工具链架构审查<br>集成测试 | 最终验收<br>文档编写 |
| **后端开发** | 1人 | .NET Core<br>Handlebars.Net<br>Roslyn | 全职<br>（240小时） | 协助SDK开发<br>后端工具链设计 | Handlebars封装<br>NSwag集成<br>Roslyn封装 | 集成测试<br>性能优化 |
| **前端开发** | 1人 | TypeScript<br>ts-morph<br>Vue3 | 全职<br>（240小时） | 协助SDK开发<br>前端工具链设计 | 协助后端测试 | ts-morph封装<br>Vue生成器<br>form-create适配 |
| **DevOps** | 0.3人 | CI/CD<br>自动化测试<br>性能监控 | 30%<br>（72小时） | CI/CD环境准备<br>自动化测试框架 | 性能测试环境<br>集成测试自动化 | 最终集成<br>监控配置 |

### 2.2 技术资源清单

```yaml
开发环境:
  - Visual Studio 2022 / Rider
  - VS Code + TypeScript插件
  - .NET 8.0 SDK
  - Node.js 20.x + pnpm 8.x

关键依赖:
  - Handlebars.Net v2.1.6
  - NSwag.Core v14.0.0
  - Microsoft.CodeAnalysis.CSharp v4.8.0（Roslyn）
  - ts-morph v20.0.0
  - @vue/compiler-sfc v3.4.0
  - @form-create/element-ui v3.1.24

测试框架:
  - xUnit（.NET单元测试）
  - Jest（TypeScript单元测试）
  - Pact.js（契约测试）
  - k6（性能测试）

文档工具:
  - TypeDoc（TypeScript API文档）
  - Docfx（.NET API文档）
  - VuePress（开发者文档）
```

---

## 三、Week 3-4: DevKit核心SDK详细任务

### 3.1 Day 1-2: 项目初始化（架构师主导）

#### **任务1.1: 创建DevKit项目结构（4小时）**

**执行人**: 架构师
**详细步骤**:

```bash
# 步骤1: 创建packages目录结构
mkdir -p packages/devkit/{core,backend,frontend,cli}

# 步骤2: 初始化@smartabp/devkit-core
cd packages/devkit/core
pnpm init

cat > package.json <<'EOF'
{
  "name": "@smartabp/devkit-core",
  "version": "0.1.0",
  "description": "SmartAbp DevKit核心SDK - 统一元数据操作和AI约束层",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit"
  },
  "keywords": ["smartabp", "devkit", "code-generator", "metadata", "ai-constraint"],
  "author": "SmartAbp Team",
  "license": "MIT",
  "dependencies": {
    "ajv": "^8.12.0",
    "json-schema": "^0.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "eslint": "^8.55.0",
    "tsup": "^8.0.1",
    "typescript": "^5.3.3",
    "vitest": "^1.0.4",
    "@vitest/coverage-v8": "^1.0.4"
  },
  "peerDependencies": {
    "typescript": "^5.0.0"
  }
}
EOF

# 步骤3: 创建tsconfig.json
cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
EOF

# 步骤4: 创建基础目录结构
mkdir -p src/{metadata,generator,constraint,quality,types,utils}

# 步骤5: 创建README.md
cat > README.md <<'EOF'
# @smartabp/devkit-core

SmartAbp DevKit核心SDK - 统一元数据操作和AI约束层

## 核心功能

- **UnifiedMetadataSDK**: 统一元数据操作
- **CodeGeneratorFramework**: 代码生成器框架
- **AIConstraintLayer**: AI约束层（革命性创新）⭐⭐⭐
- **QualityGateEnforcer**: 质量门禁强制执行

## 安装

```bash
pnpm add @smartabp/devkit-core
```

## 使用示例

```typescript
import { UnifiedMetadataSDK, AIConstraintLayer } from '@smartabp/devkit-core'

// 创建元数据SDK
const sdk = new UnifiedMetadataSDK(metadata)

// 获取实体
const entity = sdk.getEntity('Order')

// AI安全生成
const aiLayer = new AIConstraintLayer()
const result = await aiLayer.generateWithAIGuard(intent, context)
```

## 文档

详见 [API文档](./docs/api.md)
EOF

# 步骤6: 安装依赖
pnpm install
```

**验收标准**:
```yaml
✅ 成功标准:
   - 项目结构已创建
   - package.json配置正确
   - tsconfig.json配置正确
   - 依赖安装成功
   - README.md已创建

❌ 失败处理:
   - 依赖安装失败 → 检查网络和npm镜像
   - 配置错误 → 参考官方模板修正
```

**预期产出**:
- packages/devkit/core/ 完整项目结构
- 约300行配置代码

---

#### **任务1.2: 定义核心接口和类型（4小时）**

**执行人**: 架构师
**详细步骤**:

```typescript
// 步骤1: 创建核心类型定义
// src/types/index.ts
/**
 * 实体Schema定义
 */
export interface EntitySchema {
  id: string
  name: string
  displayName: string
  description?: string
  properties: PropertySchema[]
  relationships?: RelationshipSchema[]
  indexes?: IndexSchema[]
  constraints?: ConstraintSchema[]
}

/**
 * 属性Schema定义
 */
export interface PropertySchema {
  id: string
  name: string
  displayName: string
  type: string
  isRequired: boolean
  isKey: boolean
  isUnique: boolean
  defaultValue?: any
  validation?: ValidationRule[]
}

/**
 * OpenAPI规范
 */
export interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
  }
  paths: Record<string, any>
  components: {
    schemas: Record<string, any>
  }
}

/**
 * 代码生成结果
 */
export interface GenerationResult {
  success: boolean
  code: string
  metadata: EntitySchema
  errors?: string[]
  warnings?: string[]
}

/**
 * 验证结果
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  code: string
  message: string
  path?: string
  severity: 'error'
}

export interface ValidationWarning {
  code: string
  message: string
  path?: string
  severity: 'warning'
}

/**
 * AI生成上下文
 */
export interface GenerationContext {
  entitySchema: EntitySchema
  targetFramework: 'backend' | 'frontend' | 'fullstack'
  templateEngine: 'handlebars' | 'tsmorph' | 'roslyn'
  options?: Record<string, any>
}

/**
 * AI约束配置
 */
export interface AIConstraintConfig {
  allowedAPIs: string[]
  forbiddenOperations: string[]
  sandboxEnabled: boolean
  qualityGateEnabled: boolean
  validationRules: ValidationRule[]
}

/**
 * 验证规则
 */
export interface ValidationRule {
  name: string
  validator: (value: any) => boolean
  message: string
}
```

**验收标准**:
```yaml
✅ 成功标准:
   - 核心接口定义完整（10+个接口）
   - 类型定义清晰明确
   - 有详细的TSDoc注释
   - TypeScript编译0错误
```

---

### 3.2 Day 3-5: UnifiedMetadataSDK实现（架构师主导）

#### **任务2.1: UnifiedMetadataSDK核心实现（8小时）**

**执行人**: 架构师
**详细步骤**:

```typescript
// src/metadata/UnifiedMetadataSDK.ts
import type { EntitySchema, OpenAPISpec, ValidationResult } from '../types'

/**
 * 统一元数据SDK
 *
 * 核心功能:
 * - 提供统一的元数据操作接口
 * - 从ModuleMetadata生成OpenAPI规范
 * - 验证元数据完整性和一致性
 */
export class UnifiedMetadataSDK {
  private readonly entities: Map<string, EntitySchema>

  constructor(metadata: any) {
    this.entities = this.parseMetadata(metadata)
  }

  /**
   * 获取实体Schema
   */
  getEntity(name: string): EntitySchema {
    const entity = this.entities.get(name)
    if (!entity) {
      throw new Error(`Entity not found: ${name}`)
    }
    return entity
  }

  /**
   * 获取所有实体
   */
  getAllEntities(): EntitySchema[] {
    return Array.from(this.entities.values())
  }

  /**
   * 更新字段
   */
  updateField(entityName: string, field: PropertySchema): void {
    const entity = this.getEntity(entityName)
    const fieldIndex = entity.properties.findIndex(p => p.name === field.name)

    if (fieldIndex >= 0) {
      entity.properties[fieldIndex] = field
    } else {
      entity.properties.push(field)
    }
  }

  /**
   * 生成OpenAPI规范
   */
  generateOpenAPISpec(): OpenAPISpec {
    const paths: Record<string, any> = {}
    const schemas: Record<string, any> = {}

    // 为每个实体生成CRUD端点
    for (const entity of this.entities.values()) {
      // 生成路径
      paths[`/api/app/${entity.name.toLowerCase()}`] = this.generateCRUDPaths(entity)

      // 生成Schema
      schemas[`${entity.name}Dto`] = this.generateDtoSchema(entity)
      schemas[`Create${entity.name}Dto`] = this.generateCreateDtoSchema(entity)
      schemas[`Update${entity.name}Dto`] = this.generateUpdateDtoSchema(entity)
    }

    return {
      openapi: '3.0.0',
      info: {
        title: 'SmartAbp API',
        version: '1.0.0'
      },
      paths,
      components: { schemas }
    }
  }

  /**
   * 验证Schema
   */
  validateSchema(schema: EntitySchema): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 验证实体名称
    if (!schema.name || schema.name.trim() === '') {
      errors.push({
        code: 'E001',
        message: '实体名称不能为空',
        path: 'name',
        severity: 'error'
      })
    }

    // 验证主键
    const hasKey = schema.properties.some(p => p.isKey)
    if (!hasKey) {
      errors.push({
        code: 'E002',
        message: '实体必须有主键',
        path: 'properties',
        severity: 'error'
      })
    }

    // 验证属性名称唯一性
    const nameSet = new Set<string>()
    for (const prop of schema.properties) {
      if (nameSet.has(prop.name)) {
        errors.push({
          code: 'E003',
          message: `属性名称重复: ${prop.name}`,
          path: `properties.${prop.name}`,
          severity: 'error'
        })
      }
      nameSet.add(prop.name)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // 私有方法
  private parseMetadata(metadata: any): Map<string, EntitySchema> {
    const entities = new Map<string, EntitySchema>()

    if (metadata.entities && Array.isArray(metadata.entities)) {
      for (const entity of metadata.entities) {
        entities.set(entity.name, entity as EntitySchema)
      }
    }

    return entities
  }

  private generateCRUDPaths(entity: EntitySchema): any {
    return {
      get: {
        summary: `获取${entity.displayName}列表`,
        operationId: `get${entity.name}List`,
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: `#/components/schemas/${entity.name}Dto` }
                }
              }
            }
          }
        }
      },
      post: {
        summary: `创建${entity.displayName}`,
        operationId: `create${entity.name}`,
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/Create${entity.name}Dto` }
            }
          }
        },
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${entity.name}Dto` }
              }
            }
          }
        }
      }
    }
  }

  private generateDtoSchema(entity: EntitySchema): any {
    const properties: Record<string, any> = {}
    const required: string[] = []

    for (const prop of entity.properties) {
      properties[prop.name] = {
        type: this.mapTypeToJsonSchema(prop.type),
        description: prop.displayName
      }

      if (prop.isRequired) {
        required.push(prop.name)
      }
    }

    return {
      type: 'object',
      properties,
      required
    }
  }

  private generateCreateDtoSchema(entity: EntitySchema): any {
    // 排除主键和审计字段
    const createProperties = entity.properties.filter(
      p => !p.isKey && !this.isAuditField(p.name)
    )

    return this.generateDtoSchemaFromProperties(createProperties)
  }

  private generateUpdateDtoSchema(entity: EntitySchema): any {
    // 排除主键和创建时间
    const updateProperties = entity.properties.filter(
      p => !p.isKey && p.name !== 'createdAt'
    )

    return this.generateDtoSchemaFromProperties(updateProperties)
  }

  private generateDtoSchemaFromProperties(properties: PropertySchema[]): any {
    const schema: Record<string, any> = {}
    const required: string[] = []

    for (const prop of properties) {
      schema[prop.name] = {
        type: this.mapTypeToJsonSchema(prop.type),
        description: prop.displayName
      }

      if (prop.isRequired) {
        required.push(prop.name)
      }
    }

    return {
      type: 'object',
      properties: schema,
      required
    }
  }

  private mapTypeToJsonSchema(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'int': 'integer',
      'long': 'integer',
      'decimal': 'number',
      'double': 'number',
      'bool': 'boolean',
      'datetime': 'string',
      'guid': 'string'
    }

    return typeMap[type.toLowerCase()] || 'string'
  }

  private isAuditField(name: string): boolean {
    const auditFields = ['createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'isDeleted', 'deletedAt', 'deletedBy']
    return auditFields.includes(name)
  }
}

// 导出
export { UnifiedMetadataSDK }
```

**验收标准**:
```yaml
✅ 成功标准:
   - UnifiedMetadataSDK类实现完整
   - 5个核心方法实现
   - TypeScript编译0错误
   - 有完整TSDoc注释

❌ 失败处理:
   - 编译错误 → 修正类型定义
   - 逻辑错误 → 添加单元测试验证
```

**预期产出**:
- UnifiedMetadataSDK.ts（约300行）

---

### 3.3 Day 6-8: AIConstraintLayer实现（架构师主导）⭐⭐⭐

#### **任务3.1: AIConstraintLayer核心架构（12小时）**

**执行人**: 架构师
**这是DevKit的革命性创新！**

```typescript
// src/constraint/AIConstraintLayer.ts
import type { GenerationContext, GenerationResult, ValidationResult } from '../types'

/**
 * AI约束层 - 革命性创新 ⭐⭐⭐
 *
 * 核心功能:
 * - 解析AI意图并验证合法性
 * - 在沙箱环境中执行AI生成
 * - 应用架构约束到AI输出
 * - 强制质量门禁检查
 *
 * 设计理念:
 * - AI只能通过此层操作，无法绕过
 * - 框架级硬约束，不依赖AI自律
 * - 沙箱隔离，限制文件系统访问
 */
export class AIConstraintLayer {
  private readonly config: AIConstraintConfig
  private readonly qualityGate: QualityGateEnforcer

  constructor(config?: Partial<AIConstraintConfig>) {
    this.config = {
      allowedAPIs: config?.allowedAPIs || ['getEntity', 'updateField', 'generateCode'],
      forbiddenOperations: config?.forbiddenOperations || ['directFileWrite', 'bypassValidation'],
      sandboxEnabled: config?.sandboxEnabled ?? true,
      qualityGateEnabled: config?.qualityGateEnabled ?? true,
      validationRules: config?.validationRules || []
    }

    this.qualityGate = new QualityGateEnforcer()
  }

  /**
   * AI生成入口（唯一入口，强制约束）
   *
   * @param intent - AI的意图描述
   * @param context - 生成上下文
   * @returns 经过约束和验证的生成结果
   */
  async generateWithAIGuard(
    intent: string,
    context: GenerationContext
  ): Promise<GenerationResult> {

    // 步骤1: 意图解析和约束检查
    const validatedIntent = this.validateAIIntent(intent)
    if (!validatedIntent.allowed) {
      throw new AIViolationError(`AI操作被禁止: ${validatedIntent.reason}`)
    }

    // 步骤2: 在沙箱中执行AI生成
    const aiSuggestion = await this.executeInSandbox(async () => {
      return await this.generateCode(validatedIntent, context)
    })

    // 步骤3: 应用架构约束
    const constrainedOutput = this.applyArchitectureConstraints(aiSuggestion, context)

    // 步骤4: 质量门禁验证
    if (this.config.qualityGateEnabled) {
      const qualityCheck = await this.qualityGate.validate(constrainedOutput)
      if (!qualityCheck.passed) {
        throw new QualityGateError(`AI生成未通过质量检查`, qualityCheck.errors)
      }
    }

    return constrainedOutput
  }

  /**
   * 验证AI意图
   */
  private validateAIIntent(intent: string): ValidatedIntent {
    // 解析意图
    const parsedIntent = this.parseIntent(intent)

    // 检查是否在允许的API范围内
    const isAllowed = this.config.allowedAPIs.some(api =>
      parsedIntent.operation.includes(api)
    )

    if (!isAllowed) {
      return {
        allowed: false,
        reason: `操作不在允许列表中: ${parsedIntent.operation}`
      }
    }

    // 检查是否包含禁止操作
    const isForbidden = this.config.forbiddenOperations.some(op =>
      parsedIntent.operation.includes(op)
    )

    if (isForbidden) {
      return {
        allowed: false,
        reason: `包含禁止操作: ${parsedIntent.operation}`
      }
    }

    return {
      allowed: true,
      intent: parsedIntent
    }
  }

  /**
   * 在沙箱中执行
   */
  private async executeInSandbox<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.config.sandboxEnabled) {
      return await fn()
    }

    // 创建沙箱环境
    const sandbox = this.createSandbox()

    try {
      // 在沙箱中执行
      const result = await sandbox.run(fn)
      return result
    } finally {
      // 清理沙箱
      sandbox.cleanup()
    }
  }

  /**
   * 应用架构约束
   */
  private applyArchitectureConstraints(
    aiOutput: any,
    context: GenerationContext
  ): GenerationResult {

    const constraints = {
      // 强制使用统一元数据模型
      metadata: this.normalizeToUnifiedSchema(aiOutput.metadata || context.entitySchema),

      // 强制使用标准模板
      templates: this.enforceTemplateStandards(aiOutput.templates),

      // 强制类型一致性
      types: this.enforceTypeConsistency(aiOutput.types),

      // 强制文件结构
      fileStructure: this.enforceFileStructure(aiOutput.files, context.targetFramework)
    }

    return {
      success: true,
      code: aiOutput.code,
      metadata: constraints.metadata,
      errors: [],
      warnings: []
    }
  }

  /**
   * 规范化到统一Schema
   */
  private normalizeToUnifiedSchema(metadata: any): EntitySchema {
    // 确保符合EntitySchema接口
    return {
      id: metadata.id || crypto.randomUUID(),
      name: metadata.name,
      displayName: metadata.displayName || metadata.name,
      description: metadata.description,
      properties: metadata.properties || [],
      relationships: metadata.relationships || [],
      indexes: metadata.indexes || [],
      constraints: metadata.constraints || []
    }
  }

  /**
   * 强制模板标准
   */
  private enforceTemplateStandards(templates: any): any {
    // 确保使用标准模板引擎
    // 禁止自定义模板
    return templates
  }

  /**
   * 强制类型一致性
   */
  private enforceTypeConsistency(types: any): any {
    // 确保类型定义与后端DTO一致
    // 禁止手动定义DTO类型
    return types
  }

  /**
   * 强制文件结构
   */
  private enforceFileStructure(files: any, framework: string): any {
    // 确保文件结构符合框架规范
    return files
  }

  // 辅助方法
  private parseIntent(intent: string): ParsedIntent {
    // 简单的意图解析
    return {
      operation: intent,
      parameters: {}
    }
  }

  private createSandbox(): Sandbox {
    return new Sandbox({
      timeout: 30000,
      memoryLimit: 100 * 1024 * 1024, // 100MB
      allowedModules: ['@smartabp/devkit-core']
    })
  }

  private async generateCode(intent: ValidatedIntent, context: GenerationContext): Promise<any> {
    // 实际代码生成逻辑
    return {
      code: '// Generated code',
      metadata: context.entitySchema
    }
  }
}

/**
 * AI违规错误
 */
export class AIViolationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AIViolationError'
  }
}

/**
 * 质量门禁错误
 */
export class QualityGateError extends Error {
  public readonly errors: string[]

  constructor(message: string, errors: string[]) {
    super(message)
    this.name = 'QualityGateError'
    this.errors = errors
  }
}

// 辅助类型
interface ValidatedIntent {
  allowed: boolean
  reason?: string
  intent?: ParsedIntent
}

interface ParsedIntent {
  operation: string
  parameters: Record<string, any>
}

// Sandbox实现（简化版）
class Sandbox {
  constructor(private options: SandboxOptions) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    // 沙箱执行逻辑
    return await fn()
  }

  cleanup(): void {
    // 清理资源
  }
}

interface SandboxOptions {
  timeout: number
  memoryLimit: number
  allowedModules: string[]
}
```

**验收标准**:
```yaml
✅ 成功标准:
   - AIConstraintLayer类实现完整
   - 核心方法全部实现
   - 沙箱机制基本可用
   - TypeScript编译0错误
   - 有完整单元测试

❌ 失败处理:
   - 沙箱实现困难 → 简化为基础版本，后续增强
   - 性能问题 → 优化验证逻辑
```

---

### 3.4 Day 9-10: CodeGeneratorFramework和QualityGateEnforcer（8小时）

**执行人**: 架构师 + 后端开发

```typescript
// src/generator/CodeGeneratorFramework.ts
/**
 * 代码生成器框架基类
 */
export abstract class CodeGenerator {
  protected readonly templateEngine: ITemplateEngine
  protected readonly validator: IValidator

  constructor(templateEngine: ITemplateEngine, validator: IValidator) {
    this.templateEngine = templateEngine
    this.validator = validator
  }

  /**
   * 生成代码（抽象方法，子类实现）
   */
  abstract generate(schema: EntitySchema): Promise<GenerationResult>

  /**
   * 应用模板
   */
  protected async applyTemplate(templatePath: string, data: any): Promise<string> {
    const template = await this.loadTemplate(templatePath)
    return this.templateEngine.render(template, data)
  }

  /**
   * 验证输出
   */
  protected validateOutput(output: string): ValidationResult {
    return this.validator.validate(output)
  }

  /**
   * 注册生成器
   */
  static register(name: string, generator: typeof CodeGenerator): void {
    GeneratorRegistry.register(name, generator)
  }

  private async loadTemplate(path: string): Promise<string> {
    // 模板加载逻辑
    return ''
  }
}

// src/quality/QualityGateEnforcer.ts
/**
 * 质量门禁强制执行器
 */
export class QualityGateEnforcer {
  /**
   * 执行标准检查
   */
  async enforceStandards(result: GenerationResult): Promise<ValidationResult> {
    const checks = [
      this.checkMetadataConsistency(result.metadata),
      this.checkTypeConsistency(result),
      this.checkTemplateOutput(result),
      await this.checkCompilation(result.code),
      this.checkArchitectureConstraints(result)
    ]

    const results = await Promise.all(checks)
    return this.aggregateResults(results)
  }

  /**
   * 验证
   */
  async validate(output: GenerationResult): Promise<{ passed: boolean; errors: string[] }> {
    const result = await this.enforceStandards(output)
    return {
      passed: result.isValid,
      errors: result.errors.map(e => e.message)
    }
  }

  private checkMetadataConsistency(metadata: EntitySchema): ValidationResult {
    // 元数据一致性检查
    return { isValid: true, errors: [], warnings: [] }
  }

  private checkTypeConsistency(result: GenerationResult): ValidationResult {
    // 类型一致性检查
    return { isValid: true, errors: [], warnings: [] }
  }

  private checkTemplateOutput(result: GenerationResult): ValidationResult {
    // 模板输出检查
    return { isValid: true, errors: [], warnings: [] }
  }

  private async checkCompilation(code: string): Promise<ValidationResult> {
    // 编译检查
    return { isValid: true, errors: [], warnings: [] }
  }

  private checkArchitectureConstraints(result: GenerationResult): ValidationResult {
    // 架构约束检查
    return { isValid: true, errors: [], warnings: [] }
  }

  private aggregateResults(results: ValidationResult[]): ValidationResult {
    const allErrors = results.flatMap(r => r.errors)
    const allWarnings = results.flatMap(r => r.warnings)

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    }
  }
}
```

**验收标准**:
```yaml
✅ Week 3-4核心SDK验收:
   - UnifiedMetadataSDK完成
   - AIConstraintLayer完成
   - CodeGeneratorFramework完成
   - QualityGateEnforcer完成
   - 单元测试覆盖率≥80%
   - API文档100%完整
```

---

## 四、Week 5-6: DevKit后端工具链详细任务

### 4.1 HandlebarsTemplateEngine实现（4天）

```typescript
// packages/devkit/backend/src/templates/HandlebarsTemplateEngine.ts
import Handlebars from 'handlebars'

export class HandlebarsTemplateEngine implements ITemplateEngine {
  private readonly handlebars: typeof Handlebars

  constructor() {
    this.handlebars = Handlebars.create()
    this.registerBuiltInHelpers()
  }

  render(template: string, data: any): string {
    const compiled = this.handlebars.compile(template)
    return compiled(data)
  }

  registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
    this.handlebars.registerHelper(name, fn)
  }

  registerPartial(name: string, partial: string): void {
    this.handlebars.registerPartial(name, partial)
  }

  private registerBuiltInHelpers(): void {
    // 注册常用Helper
    this.registerHelper('pascalCase', (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1)
    })

    this.registerHelper('camelCase', (str: string) => {
      return str.charAt(0).toLowerCase() + str.slice(1)
    })
  }
}
```

### 4.2 NSwagIntegration实现（3天）

### 4.3 RoslynCodeFixer实现（3天）

---

## 五、Week 7-8: DevKit前端工具链详细任务

### 5.1 TsMorphEngine实现（4天）

### 5.2 VueComponentGenerator实现（3天）

### 5.3 FormSchemaAdapter实现（3天）

---

## 六、质量保障体系

### 6.1 单元测试要求

```yaml
覆盖率目标: ≥80%
关键模块: 100%覆盖
  - UnifiedMetadataSDK
  - AIConstraintLayer
  - QualityGateEnforcer

测试框架:
  - .NET: xUnit
  - TypeScript: Vitest
```

### 6.2 集成测试

### 6.3 性能基准测试

---

## 七、验收标准

```yaml
DevKit核心完成:
  ✅ @smartabp/devkit-core
  ✅ @smartabp/devkit-backend
  ✅ @smartabp/devkit-frontend
  ✅ 单元测试覆盖率≥80%
  ✅ API文档100%完整
  ✅ 性能基准达标
```

---

**🚀 Phase 2 DevKit框架孵化方案 - 第一部分完成！**

**待续：后端工具链、前端工具链、测试和验收详细内容...**
