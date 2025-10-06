# @smartabp/lowcode-api

> 🌐 SmartAbp低代码引擎API客户端 - 统一后端服务调用层

## 📦 包概览

`@smartabp/lowcode-api` 是SmartAbp低代码引擎的**API客户端封装包**，提供统一的后端服务调用接口，支持代码生成、DDD建模、CQRS架构、实体管理等核心功能。

### 🎯 核心定位

- **🌐 HTTP客户端封装**: 统一的请求/响应处理
- **🔧 代码生成器API**: 全栈代码生成调用接口
- **🏗️ DDD生成器API**: 领域驱动设计代码生成
- **⚡ CQRS生成器API**: 命令查询分离架构生成
- **🎨 实体建模API**: 实体和关系管理
- **📊 统计与历史API**: 代码生成统计和历史记录

### 📊 包统计

- **26个源文件**
- **8个核心API模块**
- **6个TODO待优化**
- **100% TypeScript**
- **Tree-Shakable**

## 🚀 快速开始

### 安装

```bash
# 在Monorepo内部使用
pnpm add @smartabp/lowcode-api@workspace:*
```

### 基础使用

```typescript
// 方式1: 导入所有功能
import { http, codeGeneratorApi, dddGeneratorApi } from '@smartabp/lowcode-api'

// 方式2: 按需导入（推荐）
import { http } from '@smartabp/lowcode-api/http-client'
import { codeGeneratorApi } from '@smartabp/lowcode-api/generators'
import { useApiCall } from '@smartabp/lowcode-api/composables'
```

## 📚 模块导出

### 🌐 HTTP客户端 (`/http-client`)

```typescript
import { http, createHttpClient } from '@smartabp/lowcode-api/http-client'

// 使用默认客户端
const response = await http.get('/api/entities')

// 创建自定义客户端
const customHttp = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'X-Custom-Header': 'value',
  },
})
```

### 🔧 代码生成器API (`/generators`)

```typescript
import { codeGeneratorApi, dddGeneratorApi, cqrsGeneratorApi } from '@smartabp/lowcode-api/generators'

// 通用代码生成
const result = await codeGeneratorApi.generate({
  entityName: 'User',
  templateId: 'crud-template',
  options: {
    generateFrontend: true,
    generateBackend: true,
  },
})

// DDD代码生成
const dddResult = await dddGeneratorApi.generateDddSolution({
  aggregates: [
    {
      name: 'Order',
      properties: [
        { name: 'TotalAmount', type: 'decimal' },
      ],
    },
  ],
})

// CQRS代码生成
const cqrsResult = await cqrsGeneratorApi.generateCqrsSolution({
  commands: [
    {
      name: 'CreateOrder',
      parameters: [
        { name: 'customerId', type: 'string' },
      ],
    },
  ],
})
```

### 🎨 实体建模API

```typescript
import {
  createEntity,
  addField,
  createRelation,
  validateSchema,
} from '@smartabp/lowcode-api/generators'

// 创建实体
const entity = await createEntity({
  name: 'User',
  displayName: '用户',
  description: '系统用户实体',
})

// 添加字段
await addField(entity.id, {
  name: 'Email',
  type: 'string',
  required: true,
  maxLength: 256,
})

// 创建关系
await createRelation({
  sourceEntity: 'User',
  targetEntity: 'Role',
  relationType: 'ManyToMany',
})

// 验证Schema
const validation = await validateSchema(entity)
if (!validation.isValid) {
  console.error('Schema验证失败:', validation.errors)
}
```

### 🎣 Composables (`/composables`)

```typescript
import { useApiCall, useApiLoading, useApiError } from '@smartabp/lowcode-api/composables'

// Vue组件中使用
const {
  execute: generateCode,
  loading,
  error,
  data,
} = useApiCall(codeGeneratorApi.generate)

// 调用API
await generateCode({
  entityName: 'Product',
  templateId: 'crud-template',
})

// 全局Loading管理
const { isLoading, startLoading, stopLoading } = useApiLoading()

// 全局错误处理
const { hasError, clearError, formatError } = useApiError()
```

## 🏗️ API模块结构

```
@smartabp/lowcode-api/
├── http-client          # HTTP客户端封装
├── generators/          # 代码生成器API集合
│   ├── code-generator      # 通用代码生成
│   ├── ddd-generator       # DDD生成
│   ├── cqrs-generator      # CQRS生成
│   ├── entity-modeling     # 实体建模
│   ├── code-gen-stats      # 生成统计
│   └── generation-history  # 生成历史
└── composables/         # Vue组合式API
    ├── useApiCall
    ├── useApiLoading
    └── useApiError
```

## 🔧 构建配置

### Tsup配置

本包使用 `tsup` 构建，支持：

- ✅ ESM + CommonJS双格式
- ✅ TypeScript类型声明
- ✅ 代码分割（Code Splitting）
- ✅ Tree-Shaking优化
- ✅ Source Map支持

### 子路径导出 (Subpath Exports)

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./http-client": "./dist/http-client/index.js",
    "./generators": "./dist/generators/index.js",
    "./composables": "./dist/composables/index.js"
  }
}
```

## 📊 性能优化

### Tree-Shaking

```typescript
// ✅ 推荐：只导入需要的API
import { codeGeneratorApi } from '@smartabp/lowcode-api/generators'

// ⚠️ 不推荐：导入整个包
import { codeGeneratorApi } from '@smartabp/lowcode-api'
```

### 请求优化

```typescript
// 使用composables自动管理loading和error
const { execute, loading, error } = useApiCall(codeGeneratorApi.generate)

// 支持请求取消
const { execute, cancel } = useApiCall(api.longRunningTask, {
  cancelable: true,
})
```

## 🧪 测试

```bash
# 运行测试
pnpm test

# 类型检查
pnpm type-check
```

## 📦 依赖关系

### Peer依赖

- `@smartabp/lowcode-shared` (workspace:*) - 共享基础设施包

## 🔗 相关包

- [`@smartabp/lowcode-shared`](../lowcode-shared) - 共享基础设施
- [`@smartabp/lowcode-core`](../lowcode-core) - 核心引擎
- [`@smartabp/metadata-core`](../metadata-core) - 元数据核心

## 📝 开发规范

### API命名规范

- ✅ API对象使用 `xxxApi` 命名（如 `codeGeneratorApi`）
- ✅ DTO类型使用 `XxxDto` 后缀（如 `EntityDefinitionDto`）
- ✅ 请求/响应分离（RequestDto / ResultDto）

### 类型安全

- ✅ 100% TypeScript覆盖
- ✅ 严格类型检查
- ❌ 禁止 `as any`
- ❌ 禁止 `@ts-ignore`

## 📄 License

MIT © SmartAbp Team

---

**🔥 打造业界顶尖的低代码API客户端！**

