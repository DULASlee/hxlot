# @smartabp/lowcode-core

> SmartAbp低代码引擎核心包 - 企业级低代码平台核心引擎

## 📦 安装

```bash
npm install @smartabp/lowcode-core
# 或
pnpm add @smartabp/lowcode-core
# 或
yarn add @smartabp/lowcode-core
```

## 🚀 快速开始

```typescript
import { registerCoreComponents } from '@smartabp/lowcode-core'
import { useEntityModelingStore, usePageDesignStore } from '@smartabp/lowcode-core'

// 注册核心组件
registerCoreComponents()

// 使用Store
const entityStore = useEntityModelingStore()
const pageStore = usePageDesignStore()
```

## 📚 核心功能

### 1. 组件注册系统

所有核心组件通过统一的ComponentRegistry注册：

- SmartFormBuilder - 智能表单构建器
- SmartFormDesigner - 智能表单设计器
- BusinessRuleDesigner - 业务规则设计器
- WorkflowDesigner - 工作流设计器
- StateMachineDesigner - 状态机设计器
- EntityDesigner - 实体设计器
- PageDesigner - 页面设计器
- ThemeDesigner - 主题设计器
- TemplateManager - 模板管理器
- CodeGenerator - 代码生成器
- MonitoringDashboard - 监控面板

### 2. 状态管理

基于Pinia的企业级状态管理：

```typescript
import { 
  useEntityModelingStore,
  usePageDesignStore,
  useCodeGenerationStore,
  useWorkspaceStore,
  useStateMachineStore,
  useBusinessRuleStore,
  useTemplateStore,
  useThemeStore,
  useEnhancedThemeStore,
  useEnhancedStateMachineStore
} from '@smartabp/lowcode-core'
```

### 3. 代码生成引擎

强大的代码生成能力：

```typescript
import { CodeGenerator } from '@smartabp/lowcode-core'

const generator = new CodeGenerator()
const code = generator.generate(schema)
```

## 🔧 依赖关系

```json
{
  "peerDependencies": {
    "@smartabp/metadata-core": "^1.0.0",
    "@smartabp/lowcode-shared": "^1.0.0",
    "@smartabp/lowcode-api": "^1.0.0",
    "vue": "^3.3.0"
  }
}
```

## 📖 文档

- [完整文档](https://docs.smartabp.com/lowcode-core)
- [API参考](https://docs.smartabp.com/api/lowcode-core)
- [示例代码](https://github.com/smartabp/examples)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md)

## 📄 许可证

MIT © SmartAbp Team
