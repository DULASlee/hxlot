# SmartAbp统一类型系统 - 二次开发手册

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| **文档名称** | SmartAbp统一类型系统二次开发手册 |
| **版本** | v2.0.0 |
| **创建日期** | 2025-10-07 |
| **文档类型** | 开发者指南 |
| **目标读者** | 中高级开发工程师、技术团队负责人 |
| **复杂度** | 中级到高级 |
| **预计学习时长** | 4-6小时 |

---

## 🎯 快速开始

### 环境准备

**系统要求**:
- Node.js >= 16.0.0
- npm >= 7.0.0 或 pnpm >= 7.0.0
- TypeScript >= 5.0.0

**开发工具推荐**:
- IDE: Visual Studio Code with TypeScript extensions
- 调试工具: Chrome DevTools
- 版本控制: Git

### 项目结构理解

```
src/SmartAbp.Vue/packages/metadata-core/
├── src/
│   ├── types/              # 核心类型定义
│   │   ├── index.ts        # 统一导出
│   │   ├── entity.ts       # 实体相关类型
│   │   ├── property.ts     # 属性相关类型
│   │   └── validation.ts   # 验证规则类型
│   ├── validators/         # 验证器实现
│   │   ├── index.ts        # 验证器导出
│   │   ├── entity-validator.ts
│   │   └── property-validator.ts
│   ├── converters/         # 转换器实现
│   │   ├── index.ts        # 转换器导出
│   │   ├── backend-dto-converter.ts
│   │   └── legacy-entity-converter.ts
│   └── utils/              # 工具函数
│       ├── index.ts
│       └── schema-utils.ts
├── demo/                   # 演示示例
├── __tests__/             # 单元测试
└── package.json
```

### 第一个集成示例

#### 1. 安装依赖
```bash
# 在你的包中添加依赖
npm install @smartabp/metadata-core
```

#### 2. 定义实体元数据
```typescript
import type { EntityMetadata } from '@smartabp/metadata-core'

const userEntityMetadata: EntityMetadata = {
  name: 'User',
  displayName: '用户',
  module: 'Identity',
  keyType: 'Guid',
  isAggregateRoot: true,
  isMultiTenant: true,
  isSoftDelete: true,
  hasExtraProperties: false,
  properties: [
    {
      name: 'userName',
      type: 'string',
      displayName: '用户名',
      isRequired: true,
      maxLength: 64,
      isUnique: true
    },
    {
      name: 'email',
      type: 'string',
      displayName: '邮箱',
      isRequired: true,
      maxLength: 256,
      validationRules: [
        {
          field: 'email',
          rule: 'pattern',
          params: { pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
          message: '请输入有效的邮箱地址'
        }
      ]
    }
  ]
}
```

#### 3. 验证与使用
```typescript
import { 
  validateEntityMetadata, 
  getEntityMetadataErrors,
  toEntityMetadataDto 
} from '@smartabp/metadata-core'

// 验证元数据
const isValid = validateEntityMetadata(userEntityMetadata)
if (!isValid) {
  const errors = getEntityMetadataErrors(userEntityMetadata)
  console.error('验证失败:', errors)
  return
}

// 转换为后端DTO
const userDto = toEntityMetadataDto(userEntityMetadata, {
  databaseType: 'SqlServer',
  generateAuditFields: true
})

console.log('✅ 用户实体元数据已就绪:', userDto.name)
```

---

## 🔧 核心开发模式

### 类型系统扩展

#### 扩展EntityMetadata
```typescript
import type { EntityMetadata } from '@smartabp/metadata-core'

// ✅ 推荐：通过继承扩展
interface CustomEntityMetadata extends EntityMetadata {
  // 业务特有字段
  businessCategory?: string
  priority?: 'low' | 'medium' | 'high'
  
  // 自定义验证规则
  customValidationRules?: CustomValidationRule[]
}

interface CustomValidationRule {
  ruleName: string
  ruleType: 'business' | 'security' | 'performance'
  implementation: (entity: EntityMetadata) => boolean
  errorMessage: string
}
```

#### 扩展PropertyMetadata
```typescript
import type { PropertyMetadata } from '@smartabp/metadata-core'

interface UIPropertyMetadata extends PropertyMetadata {
  // UI相关扩展
  uiComponent?: 'input' | 'select' | 'textarea' | 'datepicker'
  uiProps?: Record<string, any>
  placeholder?: string
  helpText?: string
  
  // 权限控制
  readRoles?: string[]
  writeRoles?: string[]
  
  // 显示控制
  showInList?: boolean
  showInDetail?: boolean
  sortable?: boolean
  filterable?: boolean
}
```

### 自定义验证器开发

#### 创建业务验证器
```typescript
import { z } from 'zod'
import type { EntityMetadata, ValidationRule } from '@smartabp/metadata-core'

class BusinessEntityValidator {
  // 业务实体验证schema
  private businessEntitySchema = z.object({
    name: z.string().regex(/^[A-Z][a-zA-Z]*$/, '实体名必须是PascalCase'),
    module: z.string().min(1, '模块名不能为空'),
    properties: z.array(z.object({
      name: z.string().regex(/^[a-z][a-zA-Z]*$/, '属性名必须是camelCase')
    })).min(1, '实体必须至少有一个属性')
  })
  
  validate(entity: EntityMetadata): boolean {
    try {
      this.businessEntitySchema.parse(entity)
      return this.validateBusinessRules(entity)
    } catch (error) {
      console.error('业务验证失败:', error)
      return false
    }
  }
  
  private validateBusinessRules(entity: EntityMetadata): boolean {
    // 业务规则1: 聚合根实体必须有Id属性
    if (entity.isAggregateRoot) {
      const hasId = entity.properties.some(p => p.name === 'id')
      if (!hasId) {
        throw new Error('聚合根实体必须包含Id属性')
      }
    }
    
    // 业务规则2: 多租户实体必须有TenantId
    if (entity.isMultiTenant) {
      const hasTenantId = entity.properties.some(p => p.name === 'tenantId')
      if (!hasTenantId) {
        throw new Error('多租户实体必须包含TenantId属性')
      }
    }
    
    return true
  }
  
  getValidationErrors(entity: EntityMetadata): string[] {
    const errors: string[] = []
    
    try {
      this.businessEntitySchema.parse(entity)
      this.validateBusinessRules(entity)
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => e.message))
      } else {
        errors.push(error.message)
      }
    }
    
    return errors
  }
}
```

#### 集成自定义验证器
```typescript
import { validateEntityMetadata } from '@smartabp/metadata-core'

class EnhancedMetadataValidator {
  private businessValidator = new BusinessEntityValidator()
  
  async validateEntity(entity: EntityMetadata): Promise<ValidationResult> {
    // 1. 基础验证（metadata-core）
    const basicValid = validateEntityMetadata(entity)
    if (!basicValid) {
      return {
        isValid: false,
        errors: ['基础元数据验证失败'],
        level: 'error'
      }
    }
    
    // 2. 业务验证（自定义）
    const businessValid = this.businessValidator.validate(entity)
    if (!businessValid) {
      return {
        isValid: false,
        errors: this.businessValidator.getValidationErrors(entity),
        level: 'business'
      }
    }
    
    // 3. 性能检查（可选）
    const performanceIssues = await this.checkPerformance(entity)
    
    return {
      isValid: true,
      errors: [],
      warnings: performanceIssues,
      level: 'success'
    }
  }
  
  private async checkPerformance(entity: EntityMetadata): Promise<string[]> {
    const warnings: string[] = []
    
    // 检查属性数量
    if (entity.properties.length > 50) {
      warnings.push('实体属性过多（>50），建议拆分')
    }
    
    // 检查字符串长度
    const longStrings = entity.properties.filter(p => 
      p.type === 'string' && (p.maxLength || 0) > 4000
    )
    if (longStrings.length > 0) {
      warnings.push('存在超长字符串字段，考虑使用LOB类型')
    }
    
    return warnings
  }
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
  level: 'error' | 'business' | 'success'
}
```

### 自定义转换器开发

#### 创建多目标转换器
```typescript
import type { EntityMetadata, PropertyMetadata } from '@smartabp/metadata-core'

interface ConversionTarget {
  framework: 'EntityFramework' | 'Dapper' | 'MyBatis' | 'JPA'
  language: 'CSharp' | 'Java' | 'TypeScript'
  database: 'SqlServer' | 'MySQL' | 'PostgreSQL' | 'Oracle'
}

class MultiTargetConverter {
  
  convertToEntityClass(
    entity: EntityMetadata, 
    target: ConversionTarget
  ): string {
    switch (target.language) {
      case 'CSharp':
        return this.toCSharpEntity(entity, target)
      case 'Java':
        return this.toJavaEntity(entity, target)
      case 'TypeScript':
        return this.toTypeScriptEntity(entity, target)
      default:
        throw new Error(`不支持的语言: ${target.language}`)
    }
  }
  
  private toCSharpEntity(entity: EntityMetadata, target: ConversionTarget): string {
    const properties = entity.properties
      .map(p => this.toCSharpProperty(p, target))
      .join('\n    ')
    
    const baseClass = entity.isAggregateRoot ? 'AggregateRoot' : 'Entity'
    const keyType = entity.keyType === 'Guid' ? 'Guid' : 'int'
    
    return `
namespace ${entity.module}.Entities
{
    public class ${entity.name} : ${baseClass}<${keyType}>
    {
        ${properties}
        
        ${this.generateCSharpConstructor(entity)}
        
        ${this.generateCSharpMethods(entity)}
    }
}`.trim()
  }
  
  private toCSharpProperty(property: PropertyMetadata, target: ConversionTarget): string {
    const csharpType = this.mapToCSharpType(property.type)
    const nullable = property.isRequired ? '' : '?'
    
    let attributes: string[] = []
    
    // 添加验证特性
    if (property.isRequired) {
      attributes.push('[Required]')
    }
    
    if (property.maxLength) {
      attributes.push(`[MaxLength(${property.maxLength})]`)
    }
    
    // Entity Framework特性
    if (target.framework === 'EntityFramework') {
      if (property.isUnique) {
        attributes.push('[Index(IsUnique = true)]')
      }
    }
    
    const attributeString = attributes.length > 0 
      ? attributes.join('\n        ') + '\n        '
      : ''
    
    return `${attributeString}public ${csharpType}${nullable} ${this.toPascalCase(property.name)} { get; set; }`
  }
  
  private mapToCSharpType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'int': 'int',
      'long': 'long',
      'decimal': 'decimal',
      'boolean': 'bool',
      'datetime': 'DateTime',
      'guid': 'Guid'
    }
    return typeMap[type.toLowerCase()] || 'object'
  }
  
  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}
```

---

## 🚀 高级开发模式

### 插件式架构开发

#### 元数据处理插件接口
```typescript
interface MetadataPlugin {
  name: string
  version: string
  priority: number  // 执行优先级，数字越小优先级越高
  
  // 生命周期钩子
  beforeValidation?(entity: EntityMetadata): EntityMetadata
  afterValidation?(entity: EntityMetadata, result: boolean): void
  beforeConversion?(entity: EntityMetadata, target: ConversionTarget): void
  afterConversion?(result: string, entity: EntityMetadata): string
}

class MetadataPluginManager {
  private plugins: MetadataPlugin[] = []
  
  register(plugin: MetadataPlugin): void {
    this.plugins.push(plugin)
    // 按优先级排序
    this.plugins.sort((a, b) => a.priority - b.priority)
  }
  
  async processEntity(entity: EntityMetadata): Promise<EntityMetadata> {
    let processedEntity = { ...entity }
    
    // 执行beforeValidation钩子
    for (const plugin of this.plugins) {
      if (plugin.beforeValidation) {
        processedEntity = plugin.beforeValidation(processedEntity)
      }
    }
    
    return processedEntity
  }
}
```

#### 自定义插件示例
```typescript
class AuditFieldsPlugin implements MetadataPlugin {
  name = 'AuditFieldsPlugin'
  version = '1.0.0'
  priority = 10
  
  beforeValidation(entity: EntityMetadata): EntityMetadata {
    // 为聚合根自动添加审计字段
    if (entity.isAggregateRoot) {
      const auditFields: PropertyMetadata[] = [
        {
          name: 'creationTime',
          type: 'datetime',
          displayName: '创建时间',
          isRequired: true,
          isReadOnly: true
        },
        {
          name: 'creatorId',
          type: 'guid',
          displayName: '创建者ID',
          isRequired: false,
          isReadOnly: true
        },
        {
          name: 'lastModificationTime',
          type: 'datetime',
          displayName: '最后修改时间',
          isRequired: false,
          isReadOnly: true
        },
        {
          name: 'lastModifierId',
          type: 'guid',
          displayName: '最后修改者ID',
          isRequired: false,
          isReadOnly: true
        }
      ]
      
      // 检查是否已存在审计字段
      const existingAuditFields = entity.properties.filter(p => 
        ['creationTime', 'creatorId', 'lastModificationTime', 'lastModifierId']
          .includes(p.name)
      )
      
      if (existingAuditFields.length === 0) {
        entity.properties.push(...auditFields)
      }
    }
    
    return entity
  }
}

// 使用插件
const pluginManager = new MetadataPluginManager()
pluginManager.register(new AuditFieldsPlugin())
```

### 缓存与性能优化

#### 智能缓存系统
```typescript
interface CacheOptions {
  ttl?: number      // 缓存存活时间（毫秒）
  maxSize?: number  // 最大缓存条目数
  strategy?: 'LRU' | 'LFU' | 'FIFO'
}

class MetadataCache {
  private validationCache = new Map<string, { result: boolean, timestamp: number }>()
  private conversionCache = new Map<string, { result: string, timestamp: number }>()
  
  constructor(private options: CacheOptions = {}) {
    this.options = {
      ttl: 5 * 60 * 1000,  // 默认5分钟
      maxSize: 1000,        // 默认1000条
      strategy: 'LRU',      // 默认LRU策略
      ...options
    }
  }
  
  getCachedValidation(entity: EntityMetadata): boolean | null {
    const key = this.generateEntityKey(entity)
    const cached = this.validationCache.get(key)
    
    if (!cached) return null
    
    // 检查TTL
    if (Date.now() - cached.timestamp > this.options.ttl!) {
      this.validationCache.delete(key)
      return null
    }
    
    return cached.result
  }
  
  setCachedValidation(entity: EntityMetadata, result: boolean): void {
    const key = this.generateEntityKey(entity)
    
    // 检查缓存大小限制
    if (this.validationCache.size >= this.options.maxSize!) {
      this.evictOldest()
    }
    
    this.validationCache.set(key, {
      result,
      timestamp: Date.now()
    })
  }
  
  private generateEntityKey(entity: EntityMetadata): string {
    // 生成基于内容的稳定哈希
    const content = JSON.stringify({
      name: entity.name,
      module: entity.module,
      properties: entity.properties.map(p => ({
        name: p.name,
        type: p.type,
        isRequired: p.isRequired
      }))
    })
    
    return this.simpleHash(content)
  }
  
  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return hash.toString(36)
  }
  
  private evictOldest(): void {
    let oldestKey = ''
    let oldestTime = Date.now()
    
    for (const [key, value] of this.validationCache.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.validationCache.delete(oldestKey)
    }
  }
}
```

### 异步处理与并发

#### 批量处理优化
```typescript
class BatchMetadataProcessor {
  private processingQueue: EntityMetadata[] = []
  private results: Map<string, ValidationResult> = new Map()
  private concurrency: number = 5
  
  async processBatch(entities: EntityMetadata[]): Promise<ValidationResult[]> {
    const chunks = this.chunkArray(entities, this.concurrency)
    const allResults: ValidationResult[] = []
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(entity => this.processEntity(entity))
      )
      allResults.push(...chunkResults)
    }
    
    return allResults
  }
  
  private async processEntity(entity: EntityMetadata): Promise<ValidationResult> {
    const startTime = performance.now()
    
    try {
      // 验证
      const isValid = validateEntityMetadata(entity)
      const errors = isValid ? [] : getEntityMetadataErrors(entity)
      
      // 转换（如果验证通过）
      let conversionResult = ''
      if (isValid) {
        conversionResult = toEntityMetadataDto(entity).toString()
      }
      
      const endTime = performance.now()
      
      return {
        entityName: entity.name,
        isValid,
        errors,
        conversionResult,
        processingTime: endTime - startTime
      }
    } catch (error) {
      return {
        entityName: entity.name,
        isValid: false,
        errors: [error.message],
        conversionResult: '',
        processingTime: performance.now() - startTime
      }
    }
  }
  
  private chunkArray<T>(array: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, i * size + size)
    )
  }
}

interface ValidationResult {
  entityName: string
  isValid: boolean
  errors: string[]
  conversionResult: string
  processingTime: number
}
```

---

## 🛠️ 常见问题与解决方案

### 类型错误处理

#### 问题1: 导入类型时报错
```typescript
// ❌ 错误：找不到模块
import { EntityMetadata } from '@smartabp/metadata-core'

// 解决方案：检查package.json配置
{
  "peerDependencies": {
    "@smartabp/metadata-core": "workspace:*"
  },
  "devDependencies": {
    "@smartabp/metadata-core": "file:../metadata-core"
  }
}
```

#### 问题2: 类型不兼容
```typescript
// ❌ 错误：isRequired可能为undefined
const createProperty = (prop: PropertyMetadata) => {
  if (prop.isRequired) {  // TypeScript error
    // ...
  }
}

// ✅ 解决方案：使用类型守卫
const createProperty = (prop: PropertyMetadata) => {
  if (prop.isRequired === true) {  // 明确检查
    // ...
  }
}

// ✅ 或使用默认值
const createProperty = (prop: PropertyMetadata) => {
  const isRequired = prop.isRequired ?? false
  if (isRequired) {
    // ...
  }
}
```

### 验证错误处理

#### 问题3: 验证失败但无错误信息
```typescript
// 可能的原因和解决方案
const debugValidation = (entity: EntityMetadata) => {
  try {
    const result = validateEntityMetadata(entity)
    console.log('验证结果:', result)
    
    if (!result) {
      const errors = getEntityMetadataErrors(entity)
      console.log('详细错误:', errors)
      
      // 调试：检查entity结构
      console.log('实体结构:', JSON.stringify(entity, null, 2))
    }
  } catch (error) {
    console.error('验证异常:', error)
    console.error('堆栈:', error.stack)
  }
}
```

### 性能问题诊断

#### 问题4: 验证性能慢
```typescript
class PerformanceDiagnostics {
  static profileValidation(entity: EntityMetadata): PerformanceReport {
    const report: PerformanceReport = {
      entityName: entity.name,
      propertyCount: entity.properties.length,
      validationSteps: []
    }
    
    // 1. 基础结构验证
    let start = performance.now()
    const basicValid = this.validateBasicStructure(entity)
    report.validationSteps.push({
      step: 'basic',
      duration: performance.now() - start,
      result: basicValid
    })
    
    // 2. 属性验证
    start = performance.now()
    const propertiesValid = this.validateProperties(entity.properties)
    report.validationSteps.push({
      step: 'properties',
      duration: performance.now() - start,
      result: propertiesValid
    })
    
    // 3. 业务规则验证
    start = performance.now()
    const businessValid = this.validateBusinessRules(entity)
    report.validationSteps.push({
      step: 'business',
      duration: performance.now() - start,
      result: businessValid
    })
    
    report.totalDuration = report.validationSteps.reduce((sum, step) => sum + step.duration, 0)
    
    return report
  }
}

interface PerformanceReport {
  entityName: string
  propertyCount: number
  totalDuration: number
  validationSteps: {
    step: string
    duration: number
    result: boolean
  }[]
}
```

### 最佳实践建议

#### 错误处理最佳实践
```typescript
class RobustMetadataHandler {
  async processEntitySafely(entity: EntityMetadata): Promise<ProcessResult> {
    try {
      // 1. 输入验证
      if (!entity || !entity.name) {
        return {
          success: false,
          error: 'Invalid entity: missing name',
          code: 'INVALID_INPUT'
        }
      }
      
      // 2. 元数据验证
      const isValid = validateEntityMetadata(entity)
      if (!isValid) {
        const errors = getEntityMetadataErrors(entity)
        return {
          success: false,
          error: `Validation failed: ${errors.join(', ')}`,
          code: 'VALIDATION_FAILED',
          details: errors
        }
      }
      
      // 3. 转换处理
      const converted = toEntityMetadataDto(entity)
      
      return {
        success: true,
        data: converted,
        metadata: {
          processingTime: Date.now(),
          entityName: entity.name,
          propertyCount: entity.properties.length
        }
      }
      
    } catch (error) {
      // 4. 异常捕获
      return {
        success: false,
        error: error.message,
        code: 'PROCESSING_ERROR',
        stack: error.stack
      }
    }
  }
}

interface ProcessResult {
  success: boolean
  data?: any
  error?: string
  code?: string
  details?: string[]
  stack?: string
  metadata?: Record<string, any>
}
```

#### 测试策略
```typescript
// 单元测试示例
describe('MetadataCore Integration', () => {
  it('should validate valid entity metadata', () => {
    const validEntity: EntityMetadata = {
      name: 'TestEntity',
      module: 'Test',
      keyType: 'Guid',
      isAggregateRoot: true,
      isMultiTenant: false,
      isSoftDelete: false,
      hasExtraProperties: false,
      properties: [
        {
          name: 'testProperty',
          type: 'string',
          isRequired: true
        }
      ]
    }
    
    expect(validateEntityMetadata(validEntity)).toBe(true)
  })
  
  it('should reject invalid entity metadata', () => {
    const invalidEntity = {
      // 缺少必要字段
      name: '',
      properties: []
    } as EntityMetadata
    
    expect(validateEntityMetadata(invalidEntity)).toBe(false)
    
    const errors = getEntityMetadataErrors(invalidEntity)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toContain('name')
  })
})
```

---

## 📚 总结与展望

### 开发收获

通过本手册的学习，您已经掌握了：

1. **基础集成**: 如何在项目中正确集成metadata-core
2. **类型扩展**: 如何扩展核心类型满足业务需求
3. **自定义验证**: 如何创建业务特定的验证规则
4. **转换器开发**: 如何实现多目标代码生成
5. **性能优化**: 如何通过缓存和批处理提升性能
6. **插件架构**: 如何构建可扩展的元数据处理系统

### 进阶学习路径

**阶段1: 基础掌握（已完成）**
- ✅ 理解统一类型系统架构
- ✅ 掌握基本API使用
- ✅ 实现简单的验证和转换

**阶段2: 深度定制**
- 🎯 开发复杂业务验证器
- 🎯 实现多语言代码生成器
- 🎯 构建性能监控系统

**阶段3: 架构扩展**
- 🚀 设计分布式元数据管理
- 🚀 实现元数据版本控制
- 🚀 构建可视化元数据编辑器

### 社区资源

- **技术文档**: `docs/统一类型系统/`
- **示例代码**: `packages/metadata-core/demo/`
- **单元测试**: `packages/metadata-core/__tests__/`
- **架构决策**: `docs/architecture/adr/`

### 联系与反馈

在使用过程中遇到问题或有改进建议，请通过以下方式联系：

- 创建GitHub Issue
- 提交Pull Request
- 参与架构设计讨论

---

**🎉 恭喜您完成SmartAbp统一类型系统二次开发手册的学习！**

现在您已经具备了在SmartAbp低代码平台上进行高质量元数据驱动开发的能力。记住，优秀的架构需要持续的实践和改进，期待您的精彩作品！
