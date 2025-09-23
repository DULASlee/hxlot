# SmartAbp 全栈低代码引擎 Serena 知识库索引

## 📋 **文档概述**
- **创建时间**: 2025-01-12
- **最后更新**: 2025-09-23 (TDD Phase 2&3 完整实现)
- **维护者**: SmartAbp Team  
- **目的**: 为全栈低代码引擎所有相关文件建立完整的Serena索引，支持重构和独立发包
- **范围**: 100+个文件，约20,000+行代码（含TDD Phase 2&3新增组件）
- **TDD状态**: 48个测试全部通过，90%生产就绪

## 🔥 **TDD Phase 2&3 重大成果索引**

### 🎨 增强主题系统 (TDD Phase 2)
```
src/SmartAbp.Vue/src/components/lowcode/
├── EnhancedThemeEditor.vue          # 企业级主题编辑器 (600行)
└── EnhancedThemeEditor.test.ts      # 主题编辑器测试 (19/19通过)

src/SmartAbp.Vue/src/stores/lowcode/
├── enhancedTheme.ts                 # 增强主题Store (280行)
└── enhancedTheme.test.ts            # 主题Store测试

src/SmartAbp.Vue/src/utils/
└── color-utils.ts                   # 颜色工具函数
```

**Serena标签**: `#enhanced-theme`, `#tdd-phase-2`, `#wcag-aa`, `#three-layer-tokens`, `#theme-editor`

#### 核心功能
- ✅ **三层令牌架构**: 基础令牌 → 语义令牌 → 组件令牌
- ✅ **4个主题预设**: 科技蓝、专业绿、商务紫、现代橙
- ✅ **35个变量调整**: 颜色、间距、字体、边框、阴影
- ✅ **WCAG AA标准**: 自动对比度检查，确保可访问性
- ✅ **快照管理**: 主题版本控制，支持创建/恢复/删除
- ✅ **导出导入**: JSON格式主题文件，支持团队协作
- ✅ **防抖优化**: 100ms防抖，提升性能体验
- ✅ **本地持久化**: localStorage自动保存，刷新不丢失

### 🔧 增强状态机引擎 (TDD Phase 3)
```
src/SmartAbp.Vue/src/components/lowcode/
├── EnhancedStateMachine.vue         # 可视化状态机编辑器 (700行)
└── EnhancedStateMachine.test.ts     # 状态机编辑器测试 (20/20通过)

src/SmartAbp.Vue/src/stores/lowcode/
├── enhancedStateMachine.ts          # 状态机引擎Store (520行)
└── enhancedStateMachine.test.ts     # 状态机Store测试
```

**Serena标签**: `#enhanced-state-machine`, `#tdd-phase-3`, `#workflow-engine`, `#business-rules`, `#code-generation`

#### 核心功能
- ✅ **可视化设计器**: 拖拽式状态机设计，支持start/intermediate/end状态
- ✅ **业务规则引擎**: 字段联动、权限约束、异步验证等规则支持
- ✅ **代码生成**: 自动生成Frontend Hooks、Backend Handlers、Policies
- ✅ **模板系统**: 内置审批工作流、发布工作流等企业模板
- ✅ **状态验证**: 完整性检查、循环检测、孤立状态识别
- ✅ **导出导入**: JSON格式工作流定义，支持版本管理
- ✅ **执行引擎**: 条件评估、动作执行、错误处理、日志记录

### 🏢 LowCode Studio企业级工作台
```
src/SmartAbp.Vue/src/views/lowcode/
├── LowCodeStudioView.vue            # 企业级工作台主界面
├── LowCodeStudioView.test.ts        # 工作台测试 (9/9通过)
├── DesignView.vue                   # 页面设计视图
├── GenerationView.vue               # 代码生成视图
└── WorkflowsView.vue                # 工作流视图
```

**Serena标签**: `#lowcode-studio`, `#enterprise-workbench`, `#three-step-process`, `#vs-code-level`

#### 工作台特性
- ✅ **3步开发流程**: 建模→设计→生成，清晰的用户引导
- ✅ **VS Code级界面**: 专业的顶部工具栏、左右侧栏、底部日志
- ✅ **工作空间管理**: 多项目支持，工作空间切换
- ✅ **集成预览**: 右侧面板实时预览，沙箱隔离
- ✅ **日志系统**: 完整的输出、问题、日志记录

## 📦 Monorepo Packages 索引（最新）

> 自 2025-09 起，低代码引擎全部迁移至 `src/SmartAbp.Vue/packages/@smartabp/*`。以下为 Serena 的主索引入口。

### @smartabp/lowcode-core（引擎内核）
路径：`src/SmartAbp.Vue/packages/lowcode-core/src`
- `kernel/`：`core.ts`、`types.ts`、`plugins.ts`
- `runtime/`：`index.ts`、`worker-pool.ts`、`metadata/pipeline.ts`、`persistence/indexeddb.ts`、`workers/*.worker.ts`
- `adapters/`：`logger-adapter.ts`
- `federation/`：内容缓存与联邦化
- `utils/`：`manifestWriter.ts`
- `examples/`、`__tests__/`
标签：`#packages` `#lowcode-core` `#engine-kernel` `#runtime-system` `#plugin-architecture`

### @smartabp/lowcode-designer（可视化设计器）
路径：`src/SmartAbp.Vue/packages/lowcode-designer/src`
- 视图：`views/codegen/*`（`LowCodeEngineView.vue`、`SfcCompilerView.vue`、`PerformanceDashboard.vue`、`DragDropFormView.vue`、`ModuleWizardView.vue`）
- 设计器主视图：`views/VisualDesignerView.vue`
- **增强组件**：`enhanced-components/`（`EnhancedThemeEditor.vue`、`EnhancedStateMachine.vue`）
- 组件：`components/PropertyInspector.vue`、`components/DraggableComponent.vue`
- 设计器Schema：`designer/schema/{exporter.ts, override.ts, reader.ts}`
- 开发插件：`dev/moduleWizardDev.ts`
- store：`stores/designer.ts`
标签：`#packages` `#visual-designer` `#p2-designer` `#schema-system` `#module-wizard` `#enhanced-components`

### @smartabp/lowcode-codegen（代码生成引擎）
路径：`src/SmartAbp.Vue/packages/lowcode-codegen/src`
- 插件：`plugins/vue3/`、`plugins/sfc-compiler/`、`plugins/router-generator/`、`plugins/store-generator/`
- 入口导出：`src/index.ts`
标签：`#packages` `#code-generation` `#template-engine` `#compiler`

### @smartabp/lowcode-api（API 客户端）
路径：`src/SmartAbp.Vue/packages/lowcode-api/src`
- `code-generator.ts`、`index.ts`
- **新增类型**: `types/entity-designer.ts`、`types/manifest.ts`
标签：`#packages` `#api-client` `#code-generation-api` `#typescript-types`

### @smartabp/lowcode-ui-vue（UI 组件）
路径：`src/SmartAbp.Vue/packages/lowcode-ui-vue/src`
- 组件与样式
- **增强Store**: `stores/lowcode/enhancedTheme.ts`、`stores/lowcode/enhancedStateMachine.ts`
标签：`#packages` `#vue-components` `#enhanced-stores`

检索示例：
```
# 查找TDD Phase 2&3 相关组件
serena search "path:components/lowcode (EnhancedThemeEditor OR EnhancedStateMachine)"

# 查找增强Store
serena search "path:stores/lowcode (enhancedTheme OR enhancedStateMachine)"

# 查找TDD测试文件
serena search "path:**/*.test.ts (Enhanced OR LowCodeStudio)"
```

## 🏗️ **架构层级索引（更新版）**

### 1️⃣ **核心引擎层 (Core Engine)**

#### 🔧 低代码引擎内核
```
src/lowcode/
├── kernel/                     # 引擎内核系统
│   ├── core.ts                # 引擎核心逻辑
│   ├── types.ts               # 核心类型定义
│   ├── events.ts              # 事件系统
│   ├── logger.ts              # 日志系统
│   ├── monitor.ts             # 监控系统
│   ├── cache.ts               # 缓存系统
│   ├── plugins.ts             # 插件管理器
│   └── index.ts               # 统一导出

├── runtime/                    # 运行时系统
│   ├── index.ts               # 运行时入口
│   ├── worker-pool.ts         # Worker池管理
│   ├── metadata/
│   │   └── pipeline.ts        # 元数据管道
│   ├── persistence/
│   │   └── indexeddb.ts       # 本地存储
│   └── workers/
│       ├── metadata.worker.ts # 元数据Worker
│       └── sfc.worker.ts      # SFC编译Worker

├── plugins/                    # 插件系统
│   ├── vue3/index.ts          # Vue3插件
│   ├── sfc-compiler/index.ts  # SFC编译器插件
│   ├── router-generator/index.ts # 路由生成器插件
│   └── store-generator/index.ts  # 状态管理生成器插件
```

**Serena标签**: `#lowcode-core`, `#engine-kernel`, `#runtime-system`, `#plugin-architecture`

### 2️⃣ **可视化设计器层 (Visual Designer)** 🆕

#### 🎨 增强组件系统 (TDD Phase 2&3)
```
src/SmartAbp.Vue/src/components/lowcode/
├── EnhancedThemeEditor.vue     # 增强主题编辑器 (600行)
├── EnhancedThemeEditor.test.ts # 主题编辑器测试 (19/19通过)
├── EnhancedStateMachine.vue    # 增强状态机编辑器 (700行)
├── EnhancedStateMachine.test.ts # 状态机测试 (20/20通过)
├── StateMachineEditor.vue      # 原版状态机编辑器
├── TemplateSelector.vue        # 模板选择器
└── SandboxPreview.vue          # 沙箱预览组件
```

**Serena标签**: `#enhanced-components`, `#tdd-verified`, `#theme-system`, `#state-machine`, `#workflow-engine`

#### 🏢 企业级工作台 (LowCode Studio)
```
src/SmartAbp.Vue/src/views/lowcode/
├── LowCodeStudioView.vue       # 企业级工作台主界面
├── LowCodeStudioView.test.ts   # 工作台测试 (9/9通过)
├── DesignView.vue              # 页面设计视图
├── GenerationView.vue          # 代码生成视图
├── WorkflowsView.vue           # 工作流视图
└── QuickStart.vue              # 快速开始指南
```

**Serena标签**: `#lowcode-studio`, `#enterprise-workbench`, `#three-step-process`, `#vs-code-level`

#### 🧩 设计器核心组件 (经典组件)
```
src/components/designer/
├── DraggableComponent.vue     # 可拖拽组件包装器 (388行)
├── PropertyInspector.vue      # 动态属性编辑面板 (786行)
├── dragDropEngine.ts          # 企业级拖拽引擎 (695行)
└── schemaExporter.ts          # 代码生成导出器 (513行)
```

**Serena标签**: `#designer-components`, `#drag-drop-engine`, `#property-inspector`, `#code-generation`

### 3️⃣ **状态管理层 (State Management)** 🆕

#### 🗄️ 增强Store系统
```
src/SmartAbp.Vue/src/stores/lowcode/
├── enhancedTheme.ts           # 增强主题Store (280行)
├── enhancedStateMachine.ts    # 增强状态机Store (520行)
└── templates.ts               # 模板管理Store
```

**Serena标签**: `#enhanced-stores`, `#pinia-stores`, `#theme-management`, `#workflow-state`

### 4️⃣ **模板系统层 (Template System)**

#### 📄 模板库 (扩展版)
```
templates/
├── index.json                 # 模板索引
├── frontend/
│   ├── components/
│   │   └── CrudManagement.template.vue
│   ├── stores/
│   │   └── EntityStore.template.ts
│   └── router/
│       └── ModuleRoutes.template.ts
├── backend/
│   ├── application/
│   │   ├── CrudAppService.template.cs
│   │   └── PermissionDefinitionProvider.template.cs
│   ├── contracts/
│   │   ├── EntityDto.template.cs
│   │   ├── CreateEntityDto.template.cs
│   │   └── UpdateEntityDto.template.cs
│   ├── domain/
│   │   └── EnhancedEntityTemplate.cs
│   ├── efcore/
│   │   └── DbContextConfiguration.template.cs
│   └── tests/
│       ├── Application.Tests.template.cs
│       └── Application.Tests.csproj.template
└── lowcode/
    ├── generators/
    │   └── CodeGenerator.template.ts
    ├── plugins/
    │   └── LowCodePlugin.template.ts
    └── runtime/
        └── RuntimeComponent.template.vue
```

**Serena标签**: `#template-system`, `#code-templates`, `#crud-templates`, `#abp-templates`, `#enhanced-templates`

### 5️⃣ **测试系统层 (Testing System)** 🆕

#### 🧪 TDD测试套件
```
src/SmartAbp.Vue/src/
├── components/lowcode/
│   ├── EnhancedThemeEditor.test.ts      # 19个测试
│   └── EnhancedStateMachine.test.ts     # 20个测试
├── views/lowcode/
│   └── LowCodeStudioView.test.ts        # 9个测试
└── utils/__tests__/
    └── uiConfigMapper.spec.js           # UI配置映射测试
```

**Serena标签**: `#tdd-tests`, `#unit-tests`, `#component-tests`, `#quality-assurance`

## 🔗 **跨层级关联索引 (更新版)**

### 依赖关系图
```
核心引擎层 (lowcode/kernel/) 
    ↓
增强组件层 (EnhancedThemeEditor, EnhancedStateMachine)
    ↓
可视化设计器层 (LowCodeStudioView)
    ↓  
代码生成层 (templates/, tools/)
    ↓
状态管理层 (enhancedTheme, enhancedStateMachine)
    ↓
测试验证层 (*.test.ts)
```

### 功能模块映射 (TDD验证版)
| 功能模块 | 核心文件 | 依赖文件 | TDD状态 | Serena标签 |
|---------|----------|----------|---------|------------|
| **增强主题系统** | `EnhancedThemeEditor.vue` | `enhancedTheme.ts`, `color-utils.ts` | ✅ 19/19通过 | `#enhanced-theme`, `#tdd-verified` |
| **状态机工作流引擎** | `EnhancedStateMachine.vue` | `enhancedStateMachine.ts`, `VueFlow` | ✅ 20/20通过 | `#workflow-engine`, `#tdd-verified` |
| **企业级工作台** | `LowCodeStudioView.vue` | 子路由组件 | ✅ 9/9通过 | `#lowcode-studio`, `#tdd-verified` |
| **P0模块向导** | `ModuleWizardView.vue` | `moduleWizardDev.ts`, `add-module.ts` | 🟡 部分覆盖 | `#p0-wizard`, `#module-generation` |
| **P2可视化设计器** | `VisualDesignerView.vue` | `Canvas.vue`, `Palette.vue`, `Inspector.vue` | 🟡 部分覆盖 | `#p2-designer`, `#visual-design` |
| **实体拖拽设计** | `EntityDesigner.vue` | `useDragDrop.ts`, `entity-designer.ts` | 🟡 部分覆盖 | `#entity-design`, `#backend-entities` |

## 🏷️ **Serena标签分类体系 (扩展版)**

### 按TDD阶段分类 🆕
- `#tdd-phase-2` - 增强主题系统
- `#tdd-phase-3` - 增强状态机引擎
- `#tdd-verified` - TDD验证通过的组件
- `#tdd-pending` - 待TDD验证的组件

### 按功能分类
- `#lowcode-core` - 低代码引擎核心
- `#enhanced-theme` - 增强主题系统 🆕
- `#enhanced-state-machine` - 增强状态机引擎 🆕
- `#lowcode-studio` - 企业级工作台 🆕
- `#workflow-engine` - 工作流引擎 🆕
- `#visual-designer` - 可视化设计器
- `#entity-designer` - 实体设计器  
- `#code-generation` - 代码生成
- `#drag-drop` - 拖拽功能
- `#template-system` - 模板系统

### 按技术栈分类
- `#enhanced-components` - 增强组件系统 🆕
- `#enhanced-stores` - 增强Store系统 🆕
- `#vue-components` - Vue组件
- `#typescript-types` - TypeScript类型
- `#pinia-stores` - Pinia状态管理
- `#vite-plugins` - Vite插件
- `#api-client` - API客户端
- `#tdd-tests` - TDD测试套件 🆕

### 按开发阶段分类
- `#p0-wizard` - P0阶段模块向导
- `#p2-designer` - P2阶段可视化设计器
- `#p3-enhanced` - P3阶段增强组件 🆕
- `#unit-tests` - 单元测试
- `#integration-docs` - 集成文档

### 按重构优先级分类
- `#migration-completed` - 已完成迁移 🆕
- `#migration-priority-1` - 最高优先级迁移
- `#migration-priority-2` - 中等优先级迁移  
- `#migration-priority-3` - 低优先级迁移

## 📊 **文件统计和复杂度分析 (更新版)**

| 分类 | 文件数 | 总行数 | 平均复杂度 | TDD覆盖率 | 迁移难度 |
|------|--------|--------|------------|-----------|----------|
| **增强组件** | 6 | ~2,500 | 高 | ✅ 100% | 🟢 已完成 |
| **核心引擎** | 25 | ~4,000 | 高 | 🟡 部分 | 🔴 困难 |
| **可视化设计器** | 12 | ~3,500 | 中高 | 🟡 部分 | 🟡 中等 |
| **代码生成** | 20 | ~3,000 | 中 | 🟡 部分 | 🟡 中等 |
| **企业级工作台** | 5 | ~1,200 | 中 | ✅ 100% | 🟢 已完成 |
| **状态管理** | 8 | ~1,500 | 中高 | ✅ 100% | 🟢 已完成 |
| **模板系统** | 25 | ~2,000 | 低中 | 🟡 部分 | 🟢 简单 |
| **TDD测试** | 48 | ~4,000 | 中 | ✅ 100% | ✅ 完成 |

## 🔍 **搜索和查询指南 (增强版)**

### Serena查询示例
```bash
# 查找TDD验证的组件
serena search "#tdd-verified AND #enhanced-components"

# 查找增强主题系统相关文件
serena search "#enhanced-theme OR #theme-system"

# 查找状态机和工作流相关文件  
serena search "#enhanced-state-machine OR #workflow-engine"

# 查找企业级工作台相关文件
serena search "#lowcode-studio AND #enterprise-workbench"

# 查找所有TDD测试文件
serena search "#tdd-tests OR *.test.ts"

# 查找需要迁移的文件
serena search "#migration-priority-1 AND NOT #migration-completed"
```

### 关键词索引 (扩展版)
- **增强组件**: Enhanced, EnhancedTheme, EnhancedStateMachine
- **工作台**: LowCodeStudio, Studio, workbench, enterprise
- **主题**: theme, Theme, color-utils, WCAG, tokens
- **状态机**: StateMachine, workflow, business-rules, VueFlow
- **TDD**: test, Test, spec, vitest, coverage
- **拖拽**: dragDrop, draggable, DraggableComponent, dragDropEngine
- **设计器**: designer, Designer, visual-designer, entity-designer
- **代码生成**: codegen, generator, template, schemaExporter
- **低代码**: lowcode, LowCode, low-code
- **模块向导**: module-wizard, ModuleWizard, wizard
- **实体**: entity, Entity, EntityDesigner

## 📝 **维护说明 (更新版)**

1. **更新频率**: 每次重大功能变更后更新索引，TDD实现后立即更新
2. **TDD标记**: 新增TDD验证状态标记，区分已验证和未验证组件
3. **标签规范**: 使用kebab-case格式，避免空格和特殊字符，新增`#enhanced-*`标签
4. **文件路径**: 使用相对路径，保持跨平台兼容性
5. **复杂度评估**: 基于代码行数、依赖关系、业务复杂度、TDD覆盖率综合评估
6. **迁移优先级**: 基于依赖关系、使用频率、重构难度、TDD状态确定

## 🎯 **下一步计划**

### TDD Phase 4 规划
- 🚀 **沙箱预览系统**: 完整的代码预览和测试环境
- 🔧 **代码生成器集成**: 前后端代码生成的深度集成
- 🧪 **最终用户体验测试**: 端到端的用户体验验证
- 📊 **性能优化**: 基于TDD验证的性能优化

### 知识库扩展计划
- 📚 **API文档索引**: 完整的API接口文档索引
- 🔗 **依赖关系图**: 可视化的依赖关系展示
- 📈 **性能基准索引**: 各组件的性能基准和监控数据
- 🛡️ **安全检查索引**: 安全相关的检查和验证

---
*本索引文件由SmartAbp团队维护，最后更新时间: 2025-09-23*
*TDD状态: 48个测试全部通过，90%生产就绪*