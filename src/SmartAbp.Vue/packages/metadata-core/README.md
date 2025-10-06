# @smartabp/metadata-core

SmartAbp统一元数据模型核心包 - 企业级Schema-First元数据定义

## ✨ 特性

- ✅ **类型安全**：100% TypeScript严格模式
- ✅ **Zod验证**：运行时类型验证，错误提前发现
- ✅ **零依赖**：仅依赖`zod`和`nanoid`
- ✅ **企业级**：完整的验证规则和错误提示
- ✅ **前后端一致**：与后端C#模型保持一致
- ✅ **简单易用**：API简洁，学习成本低

## 📦 安装

```bash
npm install @smartabp/metadata-core
```

## 🚀 快速开始

### 基础使用

```typescript
import { 
  type EntityMetadata,
  validateEntityMetadata 
} from '@smartabp/metadata-core'

// 定义实体元数据
const bookEntity: EntityMetadata = {
  name: 'Book',
  module: 'Library',
  keyType: 'Guid',
  isAggregateRoot: true,
  isMultiTenant: true,
  isSoftDelete: true,
  hasExtraProperties: true,
  properties: [
    {
      name: 'title',
      type: 'string',
      isRequired: true,
      isReadOnly: false,
      isUnique: false,
      maxLength: 200,
      description: '书籍标题'
    },
    {
      name: 'author',
      type: 'string',
      isRequired: true,
      isReadOnly: false,
      isUnique: false,
      maxLength: 100,
      description: '作者'
    }
  ]
}

// 验证元数据（会抛出异常）
try {
  const validated = validateEntityMetadata(bookEntity)
  console.log('✅ 验证通过:', validated)
} catch (error) {
  console.error('❌ 验证失败:', error)
}
```

### 安全验证（不抛出异常）

```typescript
import { safeValidateEntityMetadata } from '@smartabp/metadata-core'

const result = safeValidateEntityMetadata(bookEntity)

if (result.success) {
  console.log('✅ 验证通过:', result.data)
} else {
  console.error('❌ 验证失败:', result.error.errors)
}
```

### 获取格式化错误信息

```typescript
import { getEntityMetadataErrors } from '@smartabp/metadata-core'

const errors = getEntityMetadataErrors(invalidEntity)

if (errors.length > 0) {
  errors.forEach(err => console.error(err))
}
```

## 📖 API文档

### 实体元数据

```typescript
import {
  type EntityMetadata,
  validateEntityMetadata,
  safeValidateEntityMetadata,
  getEntityMetadataErrors,
  validateEntityMetadataAsync
} from '@smartabp/metadata-core'
```

### 模块元数据

```typescript
import {
  type ModuleMetadata,
  validateModuleMetadata,
  safeValidateModuleMetadata,
  getModuleMetadataErrors,
  validateModuleMetadataAsync
} from '@smartabp/metadata-core'
```

### Aspire微服务方案

```typescript
import {
  type AspireSolutionMetadata,
  validateAspireSolutionMetadata,
  safeValidateAspireSolutionMetadata,
  getAspireSolutionMetadataErrors,
  validateAspireSolutionMetadataAsync
} from '@smartabp/metadata-core'
```

### 子路径导入

```typescript
// 仅导入类型
import type { EntityMetadata } from '@smartabp/metadata-core/types'

// 仅导入验证器
import { validateEntityMetadata } from '@smartabp/metadata-core/validators'
```

## 🎯 验证规则

### 实体元数据

- ✅ 实体名称必须是PascalCase格式
- ✅ 实体名称不能超过128个字符
- ✅ 至少需要一个属性
- ✅ 属性名称不能重复
- ✅ 属性名称必须是有效的标识符
- ✅ minLength ≤ maxLength
- ✅ minValue ≤ maxValue

### 模块元数据

- ✅ 模块名称必须是有效的标识符
- ✅ 版本号必须符合SemVer格式
- ✅ 路由路径必须以`/`开头
- ✅ entity类型的Store必须指定entityName

### Aspire方案

- ✅ 方案名称必须是PascalCase格式
- ✅ 至少需要一个微服务
- ✅ 微服务名称不能重复
- ✅ 微服务端口号不能重复
- ✅ 端口号必须在1000-65535之间

## 💡 最佳实践

### 1. 使用TypeScript类型推导

```typescript
import type { EntityMetadata } from '@smartabp/metadata-core'

// ✅ 类型推导
const entity: EntityMetadata = {
  // TypeScript会自动提示和检查
}
```

### 2. 结合Zod的错误信息

```typescript
import { safeValidateEntityMetadata } from '@smartabp/metadata-core'

const result = safeValidateEntityMetadata(data)

if (!result.success) {
  // Zod提供了详细的错误路径和信息
  result.error.errors.forEach(err => {
    console.log(`字段: ${err.path.join('.')}`)
    console.log(`错误: ${err.message}`)
  })
}
```

### 3. 异步验证（支持扩展）

```typescript
import { validateEntityMetadataAsync } from '@smartabp/metadata-core'

// 支持异步验证逻辑（如数据库检查）
const validated = await validateEntityMetadataAsync(entity)
```

## 📊 性能指标

- ⚡ 包加载时间: < 100ms
- ⚡ 验证性能: < 1ms/次
- ⚡ 包大小(gzip): < 20KB
- ⚡ 内存占用: < 5MB

## 🔗 相关包

- `@smartabp/lowcode-shared` - 低代码共享工具
- `@smartabp/lowcode-api` - 低代码API客户端
- `@smartabp/lowcode-core` - 低代码核心引擎

## 📝 License

MIT

## 🤝 贡献

欢迎提交Issue和Pull Request！
