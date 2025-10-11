# @smartabp/lowcode-core

> SmartAbp 低代码核心引擎 - 状态管理、核心逻辑、生成器和安全模块

## 📦 安装

```bash
npm install @smartabp/lowcode-core
# 或
pnpm add @smartabp/lowcode-core
# 或
yarn add @smartabp/lowcode-core
```

## 🎯 功能特性

### 1. 状态管理
- **Pinia Stores**: 基于 Pinia 的响应式状态管理
- **主题管理**: 增强的主题系统，支持暗黑模式
- **状态机管理**: 业务流程状态机
- **实体建模Store**: 实体定义和关系管理
- **页面设计Store**: 可视化页面设计状态

### 2. 核心逻辑
- **SmartForm构建器**: 动态表单生成和验证
- **业务规则设计器**: 可视化业务规则引擎
- **错误边界**: Vue错误捕获和处理
- **主从表单**: 复杂表单关系管理

### 3. 代码生成器
- **前端代码生成**: Vue组件、路由、Store
- **后端代码生成**: Controller、Service、Repository
- **全栈脚手架**: 完整的CRUD代码生成
- **模板引擎**: 可扩展的代码模板系统

### 4. 安全模块
- **权限管理**: RBAC权限控制
- **安全仪表板**: 实时安全监控
- **审计日志**: 操作审计追踪

### 5. 测试工具
- **单元测试**: 组件和逻辑单元测试
- **集成测试**: 端到端测试工具

## 📚 使用示例

### 基础导入

```typescript
import {
  // Stores
  useEnhancedThemeStore,
  useEnhancedStateMachineStore,
  useEntityModelingStore,
  usePageDesignStore,
  
  // Components
  SmartFormDesigner,
  BusinessRuleDesigner,
  ErrorBoundary,
  
  // Composables
  useMasterDetail,
  
  // Types
  EntityDefinition,
  EntityRelation,
  EntityField
} from '@smartabp/lowcode-core'
```

### 使用主题管理

```typescript
import { useEnhancedThemeStore } from '@smartabp/lowcode-core'

const themeStore = useEnhancedThemeStore()

// 切换暗黑模式
themeStore.toggleDarkMode()

// 更新主题变量
themeStore.updateThemeVariable('--primary-color', '#1890ff')
```

### 使用实体建模

```typescript
import { useEntityModelingStore } from '@smartabp/lowcode-core'
import type { EntityDefinition } from '@smartabp/lowcode-core'

const entityStore = useEntityModelingStore()

// 创建实体
const entity: EntityDefinition = {
  id: 'user-001',
  name: 'User',
  tableName: 'Users',
  fields: [
    { name: 'Id', type: 'Guid', isPrimaryKey: true },
    { name: 'Name', type: 'string', isRequired: true },
    { name: 'Email', type: 'string', isRequired: true }
  ]
}

await entityStore.addEntity(entity)
```

### 使用SmartForm构建器

```typescript
import { SmartFormDesigner } from '@smartabp/lowcode-core'

// 在Vue组件中使用
<template>
  <SmartFormDesigner
    v-model:schema="formSchema"
    @save="handleSave"
  />
</template>
```

## 🔧 子模块导出

### `/generators` - 代码生成器

```typescript
import {
  CodeGenerator,
  TemplateEngine,
  FrontendGenerator,
  BackendGenerator
} from '@smartabp/lowcode-core/generators'
```

### `/engines` - 引擎模块

```typescript
import {
  RuleEngine,
  WorkflowEngine
} from '@smartabp/lowcode-core/engines'
```

### `/security` - 安全模块

```typescript
import {
  PermissionManager,
  SecurityDashboard
} from '@smartabp/lowcode-core/security'
```

### `/testing` - 测试工具

```typescript
import {
  TestUtils,
  MockDataGenerator
} from '@smartabp/lowcode-core/testing'
```

## 📋 Peer Dependencies

本包需要以下依赖：

```json
{
  "@smartabp/metadata-core": "^1.0.0",
  "@smartabp/lowcode-shared": "^1.0.0",
  "@smartabp/lowcode-api": "^1.0.0",
  "vue": "^3.3.0"
}
```

## 🏗️ 架构说明

`@smartabp/lowcode-core` 位于架构的**Layer 1（中间层）**：

```
Layer -1: metadata-core (元数据Schema)
           ↓
Layer 0:  lowcode-shared (共享基础)
           ↓
Layer 1:  lowcode-api → lowcode-core ← (当前包)
           ↓              ↓
Layer 2:  lowcode-designer
```

## 🛡️ 三大架构铁律

本包严格遵循SmartAbp三大架构铁律：

1. **统一类型系统**: 所有类型从 `lowcode-shared/types` 导入
2. **组件注册系统**: 所有组件注册到 `ComponentRegistry`
3. **严格层级依赖**: 只向下依赖，无循环依赖

## 📖 API文档

详细API文档请访问: [SmartAbp文档中心](https://docs.smartabp.io)

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 License

MIT License - Copyright (c) 2025 SmartAbp Team

## 🔗 相关包

- [@smartabp/metadata-core](../metadata-core) - 元数据Schema定义
- [@smartabp/lowcode-shared](../lowcode-shared) - 共享基础库
- [@smartabp/lowcode-api](../lowcode-api) - API层
- [@smartabp/lowcode-designer](../lowcode-designer) - 可视化设计器
- [@smartabp/lowcode-tools](../lowcode-tools) - 开发工具

## 📞 联系方式

- **官网**: https://smartabp.io
- **文档**: https://docs.smartabp.io
- **GitHub**: https://github.com/smartabp/smartabp
- **Email**: team@smartabp.io

