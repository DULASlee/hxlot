# SmartAbp 低代码引擎 Packages 完整架构索引

## 🏗️ 核心架构概览

### Monorepo 结构
```
src/SmartAbp.Vue/packages/
├── lowcode-core/           # 核心引擎
├── lowcode-designer/       # 可视化设计器
├── lowcode-codegen/        # 代码生成器
├── lowcode-api/           # API 接口层
├── lowcode-ui-vue/        # Vue UI 组件库
└── lowcode-tools/         # 工具集合
```

## 📦 Package 详细说明

### 1. lowcode-core (核心引擎)
**路径**: `packages/lowcode-core/src/`
**职责**: 提供低代码引擎的核心功能和基础设施
**关键文件**:
- `index.ts` - 核心导出
- `types/` - 类型定义
- `utils/` - 工具函数
- `constants/` - 常量定义

### 2. lowcode-designer (可视化设计器)
**路径**: `packages/lowcode-designer/src/`
**职责**: 提供企业级可视化设计器界面和交互
**关键模块**:

#### 核心引擎 (`core/`)
- `AdvancedCanvas.ts` - WebGL/Canvas2D 高性能画布引擎
- `EnterpriseDesigner.ts` - 企业级设计器主控制器
- `ExtensibleComponentLibrary.ts` - 可扩展组件库系统
- `AIDesignAssistant.ts` - AI 设计助手
- `DesignVersionControl.ts` - 设计版本控制与时间旅行
- `RealTimeCollaboration.ts` - 实时协作功能
- `PerformanceOptimizer.ts` - 性能优化器

#### 视图组件 (`views/`)
- `VisualDesignerView.vue` - 主设计器界面
- `designer/ComponentPalette.vue` - 组件面板
- `designer/LayerManager.vue` - 图层管理器
- `designer/PropertyInspector.vue` - 属性检查器
- `designer/StyleEditor.vue` - 样式编辑器
- `designer/VersionHistory.vue` - 版本历史面板
- `designer/AIAssistantPanel.vue` - AI 助手面板
- `codegen/ModuleWizardView.vue` - 模块生成向导

#### 高级组件 (`views/designer/`)
- `AdvancedCanvasComponent.vue` - 高级画布组件
- `MinimapComponent.vue` - 缩略图组件
- `ExportDialog.vue` - 导出对话框
- `ImportDialog.vue` - 导入对话框
- `PreviewModal.vue` - 预览模态框

### 3. lowcode-codegen (代码生成器)
**路径**: `packages/lowcode-codegen/src/`
**职责**: 提供多语言、多框架的代码生成能力
**关键模块**:
- `plugins/vue3/` - Vue 3 代码生成插件
- `plugins/sfc-compiler/` - SFC 编译器插件
- `generators/` - 各种代码生成器
- `templates/` - 代码模板系统

### 4. lowcode-api (API 接口层)
**路径**: `packages/lowcode-api/src/`
**职责**: 提供统一的 API 接口和数据管理
**功能**: API 封装、数据持久化、远程服务集成

### 5. lowcode-ui-vue (Vue UI 组件库)
**路径**: `packages/lowcode-ui-vue/src/`
**职责**: 提供 Vue 专用的 UI 组件库
**功能**: 组件注册、主题系统、响应式设计

### 6. lowcode-tools (工具集合)
**路径**: `packages/lowcode-tools/src/`
**职责**: 提供开发工具和构建脚本
**关键工具**:
- `template-management/build-template-index.js` - 模板索引构建器
- `template-management/simple-template-index.js` - 简化模板索引
- `dev-tools/` - 开发工具集
- `build-scripts/` - 构建脚本

## 🔧 技术栈与依赖

### 前端技术栈
- **Vue 3.5.13** + Composition API
- **TypeScript 5.8** 严格模式
- **Element Plus 2.8.8** UI 组件库
- **Pinia 3.0.3** 状态管理
- **Vite 7.0.6** 构建工具

### 渲染引擎
- **WebGL** 高性能 3D 渲染
- **Canvas 2D** 备用渲染方案
- **虚拟化渲染** 支持大量组件

### AI 集成
- **设计分析** 智能布局建议
- **样式优化** 自动样式调整
- **组件推荐** 基于上下文的组件建议
- **智能问答** 设计相关问题解答

## 📋 开发规范

### 模块化原则
1. **单一职责** - 每个 package 专注特定功能域
2. **松耦合** - packages 间通过接口通信
3. **高内聚** - 相关功能集中在同一 package
4. **可扩展** - 支持插件化扩展

### 代码质量
- **TypeScript 严格模式** 确保类型安全
- **ESLint + Prettier** 代码风格统一
- **Vitest** 单元测试覆盖
- **性能监控** 运行时性能跟踪

### 构建与部署
- **Monorepo 管理** 统一依赖版本
- **增量构建** 只构建变更的 packages
- **模块联邦** 支持独立部署
- **CDN 优化** 静态资源分发

## 🚀 核心特性

### 企业级功能
- **实时协作** 多人同时编辑
- **版本控制** 设计历史管理
- **权限管理** 细粒度访问控制
- **模板系统** 可复用设计模板

### 性能优化
- **虚拟滚动** 支持大量组件
- **懒加载** 按需加载组件
- **缓存策略** 智能缓存管理
- **WebGL 加速** 硬件加速渲染

### AI 辅助设计
- **布局分析** 自动布局优化
- **组件推荐** 智能组件建议
- **样式生成** 自动样式调整
- **无障碍检查** 可访问性验证

## 📁 文件组织规范

### 目录结构标准
```
packages/{package-name}/
├── src/
│   ├── index.ts          # 主入口
│   ├── types/           # 类型定义
│   ├── components/      # 组件
│   ├── utils/          # 工具函数
│   ├── styles/         # 样式文件
│   └── __tests__/      # 测试文件
├── package.json        # 包配置
├── tsconfig.json      # TypeScript 配置
└── README.md          # 包说明文档
```

### 导入路径规范
- 使用 `@smartabp/lowcode-*` 别名
- 相对路径用于包内引用
- 绝对路径用于跨包引用

## 🔄 开发流程

### 本地开发
1. `npm run dev` - 启动开发服务器 (端口 11369)
2. `npm run type-check` - TypeScript 类型检查
3. `npm run lint` - 代码质量检查
4. `npm run test` - 运行测试套件

### 构建部署
1. `npm run build` - 生产构建
2. 构建产物输出到 `SmartAbp.Web/wwwroot/dist`
3. 支持热模块替换和增量构建

### 质量保证
- **类型检查** 严格的 TypeScript 检查
- **单元测试** 80% 代码覆盖率要求
- **E2E 测试** 关键用户流程测试
- **性能测试** 渲染性能基准测试

这个架构为 SmartAbp 低代码平台提供了完整的企业级解决方案，支持高性能渲染、实时协作、AI 辅助设计等先进功能。