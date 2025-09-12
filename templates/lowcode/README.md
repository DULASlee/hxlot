# 低代码引擎开发模板库

本目录包含了用于SmartAbp低代码引擎开发的专业模板集合，涵盖插件开发、代码生成器、运行时组件等核心功能。

## 📁 模板结构

```
lowcode/
├── plugins/                    # 插件开发模板
│   ├── LowCodePlugin.template.ts
│   └── LowCodePlugin.template.meta.yml
├── generators/                 # 代码生成器模板
│   ├── CodeGenerator.template.ts
│   └── CodeGenerator.template.meta.yml
├── runtime/                    # 运行时组件模板
│   ├── RuntimeComponent.template.vue
│   └── RuntimeComponent.template.meta.yml
└── README.md                   # 本文档
```

## 🔧 模板说明

### 1. 低代码引擎插件模板 (LowCodePlugin.template.ts)

**用途**: 创建低代码引擎的功能插件
**适用场景**: 
- 数据可视化插件
- 表单设计器插件  
- 图表组件插件
- 自定义功能扩展

**核心特性**:
- 完整的插件生命周期管理
- 事件系统集成
- 依赖注入支持
- 配置管理
- 代码生成能力

**使用示例**:
```typescript
// 创建数据可视化插件
const dataVisualizationPlugin = new DataVisualizationPlugin()
await dataVisualizationPlugin.install(app, context)
```

### 2. 代码生成器模板 (CodeGenerator.template.ts)

**用途**: 创建特定类型的代码生成器
**适用场景**:
- Vue组件生成器
- API服务生成器
- 表单生成器
- 页面生成器

**核心特性**:
- 模式验证机制
- 模板引擎集成
- 多文件生成支持
- 代码验证
- 后处理管道

**使用示例**:
```typescript
// 生成Vue组件
const generator = new VueComponentGenerator()
const result = await generator.generate(schema, context, options)
```

### 3. 运行时组件模板 (RuntimeComponent.template.vue)

**用途**: 创建可在低代码引擎中运行的Vue组件
**适用场景**:
- 数据展示组件
- 交互组件
- 容器组件
- 业务组件

**核心特性**:
- 运行时数据绑定
- 编辑模式支持
- 事件处理机制
- 样式配置
- 响应式设计

**使用示例**:
```vue
<DataTableComponent
  :data-source="tableData"
  :data-binding="{ items: 'data.list' }"
  @interaction="handleInteraction"
/>
```

## 🎯 AI识别标识

每个模板都包含 `AI_TEMPLATE_INFO` 注释块，用于AI自动识别和使用：

```typescript
/**
 * AI_TEMPLATE_INFO:
 * 模板类型: 低代码引擎插件
 * 适用场景: 创建低代码引擎的功能插件
 * 依赖项: Vue 3, SmartAbp低代码内核
 * 权限要求: 无
 * 生成规则: ...
 */
```

## 🚀 快速开始

### 1. 创建插件

当需要为低代码引擎创建新插件时，AI会自动识别并使用插件模板：

```
用户: "创建一个数据可视化插件"
AI: 自动使用 LowCodePlugin.template.ts 生成代码
```

### 2. 创建代码生成器

当需要创建代码生成器时：

```
用户: "创建一个Vue组件生成器"
AI: 自动使用 CodeGenerator.template.ts 生成代码
```

### 3. 创建运行时组件

当需要创建可在引擎中运行的组件时：

```
用户: "创建一个数据表格运行时组件"
AI: 自动使用 RuntimeComponent.template.vue 生成代码
```

## 📋 模板参数

### 插件模板参数
- `PluginName`: 插件名称（PascalCase）
- `pluginName`: 插件名称（camelCase）
- `PluginDescription`: 插件描述
- `PluginVersion`: 插件版本

### 生成器模板参数
- `GeneratorName`: 生成器名称（PascalCase）
- `generatorName`: 生成器名称（camelCase）
- `GeneratorDescription`: 生成器描述
- `TargetType`: 目标代码类型

### 运行时组件参数
- `ComponentName`: 组件名称（PascalCase）
- `componentName`: 组件名称（camelCase）
- `ComponentDescription`: 组件描述
- `ComponentCategory`: 组件分类

## 🔍 AI触发关键词

AI会根据以下关键词自动选择相应的模板：

**插件开发**:
- "创建插件"
- "低代码插件"
- "引擎插件"
- "插件开发"
- "功能插件"

**代码生成器**:
- "创建生成器"
- "代码生成器"
- "低代码生成器"
- "模板生成器"
- "自动生成代码"

**运行时组件**:
- "创建运行时组件"
- "低代码组件"
- "运行时组件"
- "可视化组件"
- "引擎组件"

## 🛠️ 技术栈

- **前端框架**: Vue 3 + Composition API
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **类型系统**: TypeScript
- **构建工具**: Vite
- **低代码内核**: SmartAbp LowCode Engine

## 📝 开发规范

1. **命名规范**: 使用PascalCase和camelCase
2. **类型安全**: 充分利用TypeScript类型系统
3. **组件设计**: 遵循单一职责原则
4. **事件处理**: 使用标准的Vue事件机制
5. **样式规范**: 使用CSS变量和响应式设计
6. **文档注释**: 提供完整的JSDoc注释

## 🔗 相关文档

- [SmartAbp低代码引擎文档](../../../doc/lowcode-engine.md)
- [插件开发指南](../../../doc/plugin-development.md)
- [代码生成器开发指南](../../../doc/generator-development.md)
- [运行时组件开发指南](../../../doc/runtime-component.md)