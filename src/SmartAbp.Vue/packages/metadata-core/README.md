# @smartabp/metadata-core

> SmartAbp元数据核心系统 - 企业级元数据管理和Schema定义

## 📦 安装

```bash
npm install @smartabp/metadata-core
# 或
pnpm add @smartabp/metadata-core
# 或
yarn add @smartabp/metadata-core
```

## 🚀 快速开始

```typescript
import type {
  EntityMetadata,
  ModuleMetadata,
  PropertyMetadata,
  ValidationRule
} from '@smartabp/metadata-core'

// 定义实体元数据
const userEntity: EntityMetadata = {
  name: 'User',
  displayName: '用户',
  tableName: 'users',
  properties: [
    {
      name: 'id',
      type: 'string',
      isRequired: true,
      isPrimaryKey: true
    },
    {
      name: 'name',
      type: 'string',
      isRequired: true,
      maxLength: 100
    }
  ]
}
```

## 📚 核心功能

### 1. 实体元数据

完整的实体定义系统：

```typescript
import type { EntityMetadata, PropertyMetadata } from '@smartabp/metadata-core'

interface EntityMetadata {
  name: string
  displayName: string
  tableName: string
  properties: PropertyMetadata[]
  navigationProperties?: NavigationPropertyMetadata[]
  validationRules?: ValidationRule[]
}
```

### 2. 模块元数据

模块化的元数据管理：

```typescript
import type { ModuleMetadata } from '@smartabp/metadata-core'

interface ModuleMetadata {
  name: string
  displayName: string
  entities: EntityMetadata[]
  routes: RouteMetadata[]
  menus: MenuConfig[]
}
```

### 3. Aspire解决方案元数据

微服务架构支持：

```typescript
import type { AspireSolutionMetadata, MicroserviceMetadata } from '@smartabp/metadata-core'

interface AspireSolutionMetadata {
  name: string
  microservices: MicroserviceMetadata[]
  infrastructure: InfrastructureConfig
}
```

### 4. 验证规则

强大的验证系统：

```typescript
import type { ValidationRule } from '@smartabp/metadata-core'

const rules: ValidationRule[] = [
  {
    type: 'required',
    message: '此字段为必填项'
  },
  {
    type: 'maxLength',
    value: 100,
    message: '最大长度为100个字符'
  },
  {
    type: 'pattern',
    value: /^[a-zA-Z0-9]+$/,
    message: '只能包含字母和数字'
  }
]
```

## 🔧 类型导出

```typescript
// 实体相关
export type {
  EntityMetadata,
  PropertyMetadata,
  NavigationPropertyMetadata
}

// 模块相关
export type {
  ModuleMetadata,
  RouteMetadata,
  MenuConfig
}

// Aspire相关
export type {
  AspireSolutionMetadata,
  MicroserviceMetadata,
  EndpointMetadata
}

// 配置相关
export type {
  UIConfig,
  BackendConfig,
  FeatureConfig
}

// 验证相关
export type {
  ValidationRule
}
```

## 📖 文档

- [完整文档](https://docs.smartabp.com/metadata-core)
- [元数据设计指南](https://docs.smartabp.com/guides/metadata-design)
- [Schema定义规范](https://docs.smartabp.com/guides/schema-definition)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md)

## 📄 许可证

MIT © SmartAbp Team
