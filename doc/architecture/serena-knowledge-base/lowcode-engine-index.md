# SmartAbp 全栈低代码引擎 Serena 知识库索引

## 📋 **文档概述**
- **创建时间**: 2025-01-12
- **维护者**: SmartAbp Team  
- **目的**: 为全栈低代码引擎所有相关文件建立完整的Serena索引，支持重构和独立发包
- **范围**: 60个文件，约11,000行代码

## 🏗️ **架构层级索引**

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

├── federation/                 # 联邦化系统
│   ├── index.ts               # 联邦化入口
│   ├── types.ts               # 联邦化类型
│   ├── loader.ts              # 模块加载器
│   ├── content-cache.ts       # 内容缓存
│   └── content-cache-integration.ts # 缓存集成

├── adapters/                   # 适配器层
│   └── logger-adapter.ts      # 日志适配器

├── utils/                      # 工具函数
│   └── realtime-preview.ts    # 实时预览工具

└── templates/                  # 模板系统
    └── crud-basic-template.ts  # 基础CRUD模板
```

**Serena标签**: `#lowcode-core`, `#engine-kernel`, `#runtime-system`, `#plugin-architecture`

#### 🧪 测试文件
```
src/lowcode/__tests__/
├── logger-adapter.test.ts     # 日志适配器测试
└── plugin-manager.test.ts     # 插件管理器测试
```

**Serena标签**: `#unit-tests`, `#lowcode-testing`

### 2️⃣ **可视化设计器层 (Visual Designer)**

#### 🎨 P2 可视化设计器
```
src/views/codegen/designer/
├── Canvas.vue                 # 设计画布 (437行)
├── Palette.vue                # 组件面板 (设计器组件库)
├── Inspector.vue              # 属性检查器容器
└── schema/                    # Schema处理系统
    ├── override.ts            # DesignerOverrideSchema类型定义
    ├── reader.ts              # SFC回读解析器
    ├── merge.ts               # Schema合并引擎
    └── exporter.ts            # Schema导出工具

src/views/codegen/
└── VisualDesignerView.vue     # P2设计器主入口 (增强版)
```

**Serena标签**: `#visual-designer`, `#p2-designer`, `#drag-drop`, `#schema-system`

#### 🧩 设计器核心组件
```
src/components/designer/
├── DraggableComponent.vue     # 可拖拽组件包装器 (388行)
├── PropertyInspector.vue      # 动态属性编辑面板 (786行)
├── dragDropEngine.ts          # 企业级拖拽引擎 (695行)
└── schemaExporter.ts          # 代码生成导出器 (513行)
```

**Serena标签**: `#designer-components`, `#drag-drop-engine`, `#property-inspector`, `#code-generation`

#### 🏗️ 后端实体设计器
```
src/components/CodeGenerator/
├── EntityDesigner.vue         # 实体类拖拽设计器 (944行)
└── CodePreview.vue            # 代码预览组件
```

**Serena标签**: `#entity-designer`, `#backend-codegen`, `#abp-entities`, `#drag-drop-properties`

### 3️⃣ **代码生成层 (Code Generation)**

#### 📄 模板系统
```
templates/
├── index.json                 # 模板索引
├── frontend/
│   ├── components/
│   │   └── CrudManagement.template.vue
│   ├── stores/
│   │   └── EntityStore.template.ts
│   └── designer/
│       ├── DraggableComponent.template.vue
│       ├── PropertyInspector.template.vue
│       └── DragDropEngine.template.ts
├── backend/
│   ├── application/
│   │   └── CrudAppService.template.cs
│   └── contracts/
│       └── EntityDto.template.cs
└── lowcode/
    ├── generators/
    │   └── CodeGenerator.template.ts
    ├── plugins/
    │   └── LowCodePlugin.template.ts
    └── runtime/
        └── RuntimeComponent.template.vue
```

**Serena标签**: `#code-templates`, `#template-system`, `#crud-templates`, `#abp-templates`

#### 🛠️ 工具和脚本
```
src/tools/
├── add-module.ts              # 模块添加工具
├── schema.ts                  # Schema定义和验证
└── writers.ts                 # 代码写入工具

tools/incremental-generation/
├── scripts/
│   ├── analyze-codebase.js    # 代码库分析
│   └── generate-incremental.js # 增量代码生成
└── analyzers/
    ├── pattern-matcher.js     # 模式匹配器
    ├── dependency-graph.js    # 依赖关系分析
    └── refactor-advisor.js    # 重构建议器
```

**Serena标签**: `#code-tools`, `#incremental-generation`, `#pattern-analysis`, `#dependency-analysis`

### 4️⃣ **用户界面层 (User Interface)**

#### 🖥️ 主要视图
```
src/views/codegen/
├── ModuleWizardView.vue       # P0模块向导
├── LowCodeEngineView.vue      # 低代码引擎控制台 (908行+)
└── PerformanceDashboard.vue   # 性能监控面板

src/views/CodeGenerator/
└── Dashboard.vue              # 代码生成仪表板 (732行+)

src/views/lowcode/
└── QuickStart.vue             # 快速开始指南
```

**Serena标签**: `#ui-views`, `#module-wizard`, `#engine-console`, `#dashboard`

#### 🔧 Vue组合式函数
```
src/composables/
├── useDragDrop.ts             # 拖拽功能组合函数
└── useCodeGenerationProgress.ts # 代码生成进度管理
```

**Serena标签**: `#vue-composables`, `#drag-drop-composable`, `#progress-tracking`

### 5️⃣ **状态管理层 (State Management)**

#### 🗄️ Pinia状态管理
```
src/stores/
├── designer.ts                # 设计器状态管理 (扩展版)
└── index.ts                   # 状态管理统一导出
```

**Serena标签**: `#pinia-stores`, `#designer-state`, `#state-management`

### 6️⃣ **类型定义层 (Type Definitions)**

#### 📝 TypeScript类型
```
src/types/
├── entity-designer.ts         # 实体设计器类型定义
└── manifest.ts                # 模块清单类型定义
```

**Serena标签**: `#typescript-types`, `#entity-types`, `#manifest-types`

### 7️⃣ **API和服务层 (API & Services)**

#### 🌐 API客户端
```
src/api/
└── code-generator.ts          # 代码生成器API客户端
```

**Serena标签**: `#api-client`, `#code-generation-api`

### 8️⃣ **开发工具层 (Development Tools)**

#### 🔌 Vite插件
```
src/plugins/
└── moduleWizardDev.ts         # 模块向导开发插件
```

**Serena标签**: `#vite-plugins`, `#dev-tools`, `#module-wizard-dev`

#### 📝 配置文件
```
tsconfig.lowcode.json          # 低代码专用TypeScript配置
```

**Serena标签**: `#typescript-config`, `#lowcode-config`

### 9️⃣ **示例和文档层 (Examples & Documentation)**

#### 📚 示例代码
```
src/lowcode/examples/
├── basic-usage.ts             # 基础使用示例
├── drag-drop-form-example.ts  # 拖拽表单示例
├── router-store-codegen-demo.ts # 路由状态管理代码生成示例
└── unified-logging-example.ts # 统一日志示例
```

**Serena标签**: `#code-examples`, `#usage-demos`, `#lowcode-examples`

#### 📖 文档文件
```
src/lowcode/README-SFC-Compiler.md # SFC编译器文档
lowcode-integration.md             # 低代码集成文档
```

**Serena标签**: `#documentation`, `#integration-docs`, `#sfc-compiler-docs`

## 🔗 **跨层级关联索引**

### 依赖关系图
```
核心引擎层 (lowcode/kernel/) 
    ↓
可视化设计器层 (designer/)
    ↓  
代码生成层 (templates/, tools/)
    ↓
用户界面层 (views/)
    ↓
状态管理层 (stores/)
```

### 功能模块映射
| 功能模块 | 核心文件 | 依赖文件 | Serena标签 |
|---------|----------|----------|------------|
| **P0模块向导** | `ModuleWizardView.vue` | `moduleWizardDev.ts`, `add-module.ts` | `#p0-wizard`, `#module-generation` |
| **P2可视化设计器** | `VisualDesignerView.vue` | `Canvas.vue`, `Palette.vue`, `Inspector.vue` | `#p2-designer`, `#visual-design` |
| **实体拖拽设计** | `EntityDesigner.vue` | `useDragDrop.ts`, `entity-designer.ts` | `#entity-design`, `#backend-entities` |
| **代码生成引擎** | `schemaExporter.ts` | `templates/`, `code-generator.ts` | `#code-generation`, `#template-engine` |
| **拖拽引擎** | `dragDropEngine.ts` | `DraggableComponent.vue`, `useDragDrop.ts` | `#drag-drop`, `#interaction-engine` |

## 🏷️ **Serena标签分类体系**

### 按功能分类
- `#lowcode-core` - 低代码引擎核心
- `#visual-designer` - 可视化设计器
- `#entity-designer` - 实体设计器  
- `#code-generation` - 代码生成
- `#drag-drop` - 拖拽功能
- `#template-system` - 模板系统

### 按技术栈分类
- `#vue-components` - Vue组件
- `#typescript-types` - TypeScript类型
- `#pinia-stores` - Pinia状态管理
- `#vite-plugins` - Vite插件
- `#api-client` - API客户端

### 按开发阶段分类
- `#p0-wizard` - P0阶段模块向导
- `#p2-designer` - P2阶段可视化设计器
- `#unit-tests` - 单元测试
- `#integration-docs` - 集成文档

### 按重构优先级分类
- `#migration-priority-1` - 最高优先级迁移
- `#migration-priority-2` - 中等优先级迁移  
- `#migration-priority-3` - 低优先级迁移

## 📊 **文件统计和复杂度分析**

| 分类 | 文件数 | 总行数 | 平均复杂度 | 迁移难度 |
|------|--------|--------|------------|----------|
| 核心引擎 | 25 | ~4,000 | 高 | 🔴 困难 |
| 可视化设计器 | 12 | ~3,500 | 中高 | 🟡 中等 |
| 代码生成 | 8 | ~2,000 | 中 | 🟡 中等 |
| UI界面 | 8 | ~1,500 | 低中 | 🟢 简单 |
| 工具脚本 | 7 | ~500 | 低 | 🟢 简单 |

## 🔍 **搜索和查询指南**

### Serena查询示例
```bash
# 查找所有拖拽相关组件
serena search "#drag-drop AND #vue-components"

# 查找代码生成相关文件  
serena search "#code-generation OR #template-system"

# 查找需要优先迁移的文件
serena search "#migration-priority-1"

# 查找实体设计器相关实现
serena search "#entity-designer AND #backend-entities"
```

### 关键词索引
- **拖拽**: dragDrop, draggable, DraggableComponent, dragDropEngine
- **设计器**: designer, Designer, visual-designer, entity-designer
- **代码生成**: codegen, generator, template, schemaExporter
- **低代码**: lowcode, LowCode, low-code
- **模块向导**: module-wizard, ModuleWizard, wizard
- **实体**: entity, Entity, EntityDesigner

## 📝 **维护说明**

1. **更新频率**: 每次重大功能变更后更新索引
2. **标签规范**: 使用kebab-case格式，避免空格和特殊字符
3. **文件路径**: 使用相对路径，保持跨平台兼容性
4. **复杂度评估**: 基于代码行数、依赖关系、业务复杂度综合评估
5. **迁移优先级**: 基于依赖关系、使用频率、重构难度确定

---
*本索引文件由SmartAbp团队维护，最后更新时间: 2025-01-12*

## 📋 **文档概述**
- **创建时间**: 2025-01-12
- **维护者**: SmartAbp Team  
- **目的**: 为全栈低代码引擎所有相关文件建立完整的Serena索引，支持重构和独立发包
- **范围**: 60个文件，约11,000行代码

## 🏗️ **架构层级索引**

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

├── federation/                 # 联邦化系统
│   ├── index.ts               # 联邦化入口
│   ├── types.ts               # 联邦化类型
│   ├── loader.ts              # 模块加载器
│   ├── content-cache.ts       # 内容缓存
│   └── content-cache-integration.ts # 缓存集成

├── adapters/                   # 适配器层
│   └── logger-adapter.ts      # 日志适配器

├── utils/                      # 工具函数
│   └── realtime-preview.ts    # 实时预览工具

└── templates/                  # 模板系统
    └── crud-basic-template.ts  # 基础CRUD模板
```

**Serena标签**: `#lowcode-core`, `#engine-kernel`, `#runtime-system`, `#plugin-architecture`

#### 🧪 测试文件
```
src/lowcode/__tests__/
├── logger-adapter.test.ts     # 日志适配器测试
└── plugin-manager.test.ts     # 插件管理器测试
```

**Serena标签**: `#unit-tests`, `#lowcode-testing`

### 2️⃣ **可视化设计器层 (Visual Designer)**

#### 🎨 P2 可视化设计器
```
src/views/codegen/designer/
├── Canvas.vue                 # 设计画布 (437行)
├── Palette.vue                # 组件面板 (设计器组件库)
├── Inspector.vue              # 属性检查器容器
└── schema/                    # Schema处理系统
    ├── override.ts            # DesignerOverrideSchema类型定义
    ├── reader.ts              # SFC回读解析器
    ├── merge.ts               # Schema合并引擎
    └── exporter.ts            # Schema导出工具

src/views/codegen/
└── VisualDesignerView.vue     # P2设计器主入口 (增强版)
```

**Serena标签**: `#visual-designer`, `#p2-designer`, `#drag-drop`, `#schema-system`

#### 🧩 设计器核心组件
```
src/components/designer/
├── DraggableComponent.vue     # 可拖拽组件包装器 (388行)
├── PropertyInspector.vue      # 动态属性编辑面板 (786行)
├── dragDropEngine.ts          # 企业级拖拽引擎 (695行)
└── schemaExporter.ts          # 代码生成导出器 (513行)
```

**Serena标签**: `#designer-components`, `#drag-drop-engine`, `#property-inspector`, `#code-generation`

#### 🏗️ 后端实体设计器
```
src/components/CodeGenerator/
├── EntityDesigner.vue         # 实体类拖拽设计器 (944行)
└── CodePreview.vue            # 代码预览组件
```

**Serena标签**: `#entity-designer`, `#backend-codegen`, `#abp-entities`, `#drag-drop-properties`

### 3️⃣ **代码生成层 (Code Generation)**

#### 📄 模板系统
```
templates/
├── index.json                 # 模板索引
├── frontend/
│   ├── components/
│   │   └── CrudManagement.template.vue
│   ├── stores/
│   │   └── EntityStore.template.ts
│   └── designer/
│       ├── DraggableComponent.template.vue
│       ├── PropertyInspector.template.vue
│       └── DragDropEngine.template.ts
├── backend/
│   ├── application/
│   │   └── CrudAppService.template.cs
│   └── contracts/
│       └── EntityDto.template.cs
└── lowcode/
    ├── generators/
    │   └── CodeGenerator.template.ts
    ├── plugins/
    │   └── LowCodePlugin.template.ts
    └── runtime/
        └── RuntimeComponent.template.vue
```

**Serena标签**: `#code-templates`, `#template-system`, `#crud-templates`, `#abp-templates`

#### 🛠️ 工具和脚本
```
src/tools/
├── add-module.ts              # 模块添加工具
├── schema.ts                  # Schema定义和验证
└── writers.ts                 # 代码写入工具

tools/incremental-generation/
├── scripts/
│   ├── analyze-codebase.js    # 代码库分析
│   └── generate-incremental.js # 增量代码生成
└── analyzers/
    ├── pattern-matcher.js     # 模式匹配器
    ├── dependency-graph.js    # 依赖关系分析
    └── refactor-advisor.js    # 重构建议器
```

**Serena标签**: `#code-tools`, `#incremental-generation`, `#pattern-analysis`, `#dependency-analysis`

### 4️⃣ **用户界面层 (User Interface)**

#### 🖥️ 主要视图
```
src/views/codegen/
├── ModuleWizardView.vue       # P0模块向导
├── LowCodeEngineView.vue      # 低代码引擎控制台 (908行+)
└── PerformanceDashboard.vue   # 性能监控面板

src/views/CodeGenerator/
└── Dashboard.vue              # 代码生成仪表板 (732行+)

src/views/lowcode/
└── QuickStart.vue             # 快速开始指南
```

**Serena标签**: `#ui-views`, `#module-wizard`, `#engine-console`, `#dashboard`

#### 🔧 Vue组合式函数
```
src/composables/
├── useDragDrop.ts             # 拖拽功能组合函数
└── useCodeGenerationProgress.ts # 代码生成进度管理
```

**Serena标签**: `#vue-composables`, `#drag-drop-composable`, `#progress-tracking`

### 5️⃣ **状态管理层 (State Management)**

#### 🗄️ Pinia状态管理
```
src/stores/
├── designer.ts                # 设计器状态管理 (扩展版)
└── index.ts                   # 状态管理统一导出
```

**Serena标签**: `#pinia-stores`, `#designer-state`, `#state-management`

### 6️⃣ **类型定义层 (Type Definitions)**

#### 📝 TypeScript类型
```
src/types/
├── entity-designer.ts         # 实体设计器类型定义
└── manifest.ts                # 模块清单类型定义
```

**Serena标签**: `#typescript-types`, `#entity-types`, `#manifest-types`

### 7️⃣ **API和服务层 (API & Services)**

#### 🌐 API客户端
```
src/api/
└── code-generator.ts          # 代码生成器API客户端
```

**Serena标签**: `#api-client`, `#code-generation-api`

### 8️⃣ **开发工具层 (Development Tools)**

#### 🔌 Vite插件
```
src/plugins/
└── moduleWizardDev.ts         # 模块向导开发插件
```

**Serena标签**: `#vite-plugins`, `#dev-tools`, `#module-wizard-dev`

#### 📝 配置文件
```
tsconfig.lowcode.json          # 低代码专用TypeScript配置
```

**Serena标签**: `#typescript-config`, `#lowcode-config`

### 9️⃣ **示例和文档层 (Examples & Documentation)**

#### 📚 示例代码
```
src/lowcode/examples/
├── basic-usage.ts             # 基础使用示例
├── drag-drop-form-example.ts  # 拖拽表单示例
├── router-store-codegen-demo.ts # 路由状态管理代码生成示例
└── unified-logging-example.ts # 统一日志示例
```

**Serena标签**: `#code-examples`, `#usage-demos`, `#lowcode-examples`

#### 📖 文档文件
```
src/lowcode/README-SFC-Compiler.md # SFC编译器文档
lowcode-integration.md             # 低代码集成文档
```

**Serena标签**: `#documentation`, `#integration-docs`, `#sfc-compiler-docs`

## 🔗 **跨层级关联索引**

### 依赖关系图
```
核心引擎层 (lowcode/kernel/) 
    ↓
可视化设计器层 (designer/)
    ↓  
代码生成层 (templates/, tools/)
    ↓
用户界面层 (views/)
    ↓
状态管理层 (stores/)
```

### 功能模块映射
| 功能模块 | 核心文件 | 依赖文件 | Serena标签 |
|---------|----------|----------|------------|
| **P0模块向导** | `ModuleWizardView.vue` | `moduleWizardDev.ts`, `add-module.ts` | `#p0-wizard`, `#module-generation` |
| **P2可视化设计器** | `VisualDesignerView.vue` | `Canvas.vue`, `Palette.vue`, `Inspector.vue` | `#p2-designer`, `#visual-design` |
| **实体拖拽设计** | `EntityDesigner.vue` | `useDragDrop.ts`, `entity-designer.ts` | `#entity-design`, `#backend-entities` |
| **代码生成引擎** | `schemaExporter.ts` | `templates/`, `code-generator.ts` | `#code-generation`, `#template-engine` |
| **拖拽引擎** | `dragDropEngine.ts` | `DraggableComponent.vue`, `useDragDrop.ts` | `#drag-drop`, `#interaction-engine` |

## 🏷️ **Serena标签分类体系**

### 按功能分类
- `#lowcode-core` - 低代码引擎核心
- `#visual-designer` - 可视化设计器
- `#entity-designer` - 实体设计器  
- `#code-generation` - 代码生成
- `#drag-drop` - 拖拽功能
- `#template-system` - 模板系统

### 按技术栈分类
- `#vue-components` - Vue组件
- `#typescript-types` - TypeScript类型
- `#pinia-stores` - Pinia状态管理
- `#vite-plugins` - Vite插件
- `#api-client` - API客户端

### 按开发阶段分类
- `#p0-wizard` - P0阶段模块向导
- `#p2-designer` - P2阶段可视化设计器
- `#unit-tests` - 单元测试
- `#integration-docs` - 集成文档

### 按重构优先级分类
- `#migration-priority-1` - 最高优先级迁移
- `#migration-priority-2` - 中等优先级迁移  
- `#migration-priority-3` - 低优先级迁移

## 📊 **文件统计和复杂度分析**

| 分类 | 文件数 | 总行数 | 平均复杂度 | 迁移难度 |
|------|--------|--------|------------|----------|
| 核心引擎 | 25 | ~4,000 | 高 | 🔴 困难 |
| 可视化设计器 | 12 | ~3,500 | 中高 | 🟡 中等 |
| 代码生成 | 8 | ~2,000 | 中 | 🟡 中等 |
| UI界面 | 8 | ~1,500 | 低中 | 🟢 简单 |
| 工具脚本 | 7 | ~500 | 低 | 🟢 简单 |

## 🔍 **搜索和查询指南**

### Serena查询示例
```bash
# 查找所有拖拽相关组件
serena search "#drag-drop AND #vue-components"

# 查找代码生成相关文件  
serena search "#code-generation OR #template-system"

# 查找需要优先迁移的文件
serena search "#migration-priority-1"

# 查找实体设计器相关实现
serena search "#entity-designer AND #backend-entities"
```

### 关键词索引
- **拖拽**: dragDrop, draggable, DraggableComponent, dragDropEngine
- **设计器**: designer, Designer, visual-designer, entity-designer
- **代码生成**: codegen, generator, template, schemaExporter
- **低代码**: lowcode, LowCode, low-code
- **模块向导**: module-wizard, ModuleWizard, wizard
- **实体**: entity, Entity, EntityDesigner

## 📝 **维护说明**

1. **更新频率**: 每次重大功能变更后更新索引
2. **标签规范**: 使用kebab-case格式，避免空格和特殊字符
3. **文件路径**: 使用相对路径，保持跨平台兼容性
4. **复杂度评估**: 基于代码行数、依赖关系、业务复杂度综合评估
5. **迁移优先级**: 基于依赖关系、使用频率、重构难度确定

---
*本索引文件由SmartAbp团队维护，最后更新时间: 2025-01-12*

## 📋 **文档概述**
- **创建时间**: 2025-01-12
- **维护者**: SmartAbp Team  
- **目的**: 为全栈低代码引擎所有相关文件建立完整的Serena索引，支持重构和独立发包
- **范围**: 60个文件，约11,000行代码

## 🏗️ **架构层级索引**

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

├── federation/                 # 联邦化系统
│   ├── index.ts               # 联邦化入口
│   ├── types.ts               # 联邦化类型
│   ├── loader.ts              # 模块加载器
│   ├── content-cache.ts       # 内容缓存
│   └── content-cache-integration.ts # 缓存集成

├── adapters/                   # 适配器层
│   └── logger-adapter.ts      # 日志适配器

├── utils/                      # 工具函数
│   └── realtime-preview.ts    # 实时预览工具

└── templates/                  # 模板系统
    └── crud-basic-template.ts  # 基础CRUD模板
```

**Serena标签**: `#lowcode-core`, `#engine-kernel`, `#runtime-system`, `#plugin-architecture`

#### 🧪 测试文件
```
src/lowcode/__tests__/
├── logger-adapter.test.ts     # 日志适配器测试
└── plugin-manager.test.ts     # 插件管理器测试
```

**Serena标签**: `#unit-tests`, `#lowcode-testing`

### 2️⃣ **可视化设计器层 (Visual Designer)**

#### 🎨 P2 可视化设计器
```
src/views/codegen/designer/
├── Canvas.vue                 # 设计画布 (437行)
├── Palette.vue                # 组件面板 (设计器组件库)
├── Inspector.vue              # 属性检查器容器
└── schema/                    # Schema处理系统
    ├── override.ts            # DesignerOverrideSchema类型定义
    ├── reader.ts              # SFC回读解析器
    ├── merge.ts               # Schema合并引擎
    └── exporter.ts            # Schema导出工具

src/views/codegen/
└── VisualDesignerView.vue     # P2设计器主入口 (增强版)
```

**Serena标签**: `#visual-designer`, `#p2-designer`, `#drag-drop`, `#schema-system`

#### 🧩 设计器核心组件
```
src/components/designer/
├── DraggableComponent.vue     # 可拖拽组件包装器 (388行)
├── PropertyInspector.vue      # 动态属性编辑面板 (786行)
├── dragDropEngine.ts          # 企业级拖拽引擎 (695行)
└── schemaExporter.ts          # 代码生成导出器 (513行)
```

**Serena标签**: `#designer-components`, `#drag-drop-engine`, `#property-inspector`, `#code-generation`

#### 🏗️ 后端实体设计器
```
src/components/CodeGenerator/
├── EntityDesigner.vue         # 实体类拖拽设计器 (944行)
└── CodePreview.vue            # 代码预览组件
```

**Serena标签**: `#entity-designer`, `#backend-codegen`, `#abp-entities`, `#drag-drop-properties`

### 3️⃣ **代码生成层 (Code Generation)**

#### 📄 模板系统
```
templates/
├── index.json                 # 模板索引
├── frontend/
│   ├── components/
│   │   └── CrudManagement.template.vue
│   ├── stores/
│   │   └── EntityStore.template.ts
│   └── designer/
│       ├── DraggableComponent.template.vue
│       ├── PropertyInspector.template.vue
│       └── DragDropEngine.template.ts
├── backend/
│   ├── application/
│   │   └── CrudAppService.template.cs
│   └── contracts/
│       └── EntityDto.template.cs
└── lowcode/
    ├── generators/
    │   └── CodeGenerator.template.ts
    ├── plugins/
    │   └── LowCodePlugin.template.ts
    └── runtime/
        └── RuntimeComponent.template.vue
```

**Serena标签**: `#code-templates`, `#template-system`, `#crud-templates`, `#abp-templates`

#### 🛠️ 工具和脚本
```
src/tools/
├── add-module.ts              # 模块添加工具
├── schema.ts                  # Schema定义和验证
└── writers.ts                 # 代码写入工具

tools/incremental-generation/
├── scripts/
│   ├── analyze-codebase.js    # 代码库分析
│   └── generate-incremental.js # 增量代码生成
└── analyzers/
    ├── pattern-matcher.js     # 模式匹配器
    ├── dependency-graph.js    # 依赖关系分析
    └── refactor-advisor.js    # 重构建议器
```

**Serena标签**: `#code-tools`, `#incremental-generation`, `#pattern-analysis`, `#dependency-analysis`

### 4️⃣ **用户界面层 (User Interface)**

#### 🖥️ 主要视图
```
src/views/codegen/
├── ModuleWizardView.vue       # P0模块向导
├── LowCodeEngineView.vue      # 低代码引擎控制台 (908行+)
└── PerformanceDashboard.vue   # 性能监控面板

src/views/CodeGenerator/
└── Dashboard.vue              # 代码生成仪表板 (732行+)

src/views/lowcode/
└── QuickStart.vue             # 快速开始指南
```

**Serena标签**: `#ui-views`, `#module-wizard`, `#engine-console`, `#dashboard`

#### 🔧 Vue组合式函数
```
src/composables/
├── useDragDrop.ts             # 拖拽功能组合函数
└── useCodeGenerationProgress.ts # 代码生成进度管理
```

**Serena标签**: `#vue-composables`, `#drag-drop-composable`, `#progress-tracking`

### 5️⃣ **状态管理层 (State Management)**

#### 🗄️ Pinia状态管理
```
src/stores/
├── designer.ts                # 设计器状态管理 (扩展版)
└── index.ts                   # 状态管理统一导出
```

**Serena标签**: `#pinia-stores`, `#designer-state`, `#state-management`

### 6️⃣ **类型定义层 (Type Definitions)**

#### 📝 TypeScript类型
```
src/types/
├── entity-designer.ts         # 实体设计器类型定义
└── manifest.ts                # 模块清单类型定义
```

**Serena标签**: `#typescript-types`, `#entity-types`, `#manifest-types`

### 7️⃣ **API和服务层 (API & Services)**

#### 🌐 API客户端
```
src/api/
└── code-generator.ts          # 代码生成器API客户端
```

**Serena标签**: `#api-client`, `#code-generation-api`

### 8️⃣ **开发工具层 (Development Tools)**

#### 🔌 Vite插件
```
src/plugins/
└── moduleWizardDev.ts         # 模块向导开发插件
```

**Serena标签**: `#vite-plugins`, `#dev-tools`, `#module-wizard-dev`

#### 📝 配置文件
```
tsconfig.lowcode.json          # 低代码专用TypeScript配置
```

**Serena标签**: `#typescript-config`, `#lowcode-config`

### 9️⃣ **示例和文档层 (Examples & Documentation)**

#### 📚 示例代码
```
src/lowcode/examples/
├── basic-usage.ts             # 基础使用示例
├── drag-drop-form-example.ts  # 拖拽表单示例
├── router-store-codegen-demo.ts # 路由状态管理代码生成示例
└── unified-logging-example.ts # 统一日志示例
```

**Serena标签**: `#code-examples`, `#usage-demos`, `#lowcode-examples`

#### 📖 文档文件
```
src/lowcode/README-SFC-Compiler.md # SFC编译器文档
lowcode-integration.md             # 低代码集成文档
```

**Serena标签**: `#documentation`, `#integration-docs`, `#sfc-compiler-docs`

## 🔗 **跨层级关联索引**

### 依赖关系图
```
核心引擎层 (lowcode/kernel/) 
    ↓
可视化设计器层 (designer/)
    ↓  
代码生成层 (templates/, tools/)
    ↓
用户界面层 (views/)
    ↓
状态管理层 (stores/)
```

### 功能模块映射
| 功能模块 | 核心文件 | 依赖文件 | Serena标签 |
|---------|----------|----------|------------|
| **P0模块向导** | `ModuleWizardView.vue` | `moduleWizardDev.ts`, `add-module.ts` | `#p0-wizard`, `#module-generation` |
| **P2可视化设计器** | `VisualDesignerView.vue` | `Canvas.vue`, `Palette.vue`, `Inspector.vue` | `#p2-designer`, `#visual-design` |
| **实体拖拽设计** | `EntityDesigner.vue` | `useDragDrop.ts`, `entity-designer.ts` | `#entity-design`, `#backend-entities` |
| **代码生成引擎** | `schemaExporter.ts` | `templates/`, `code-generator.ts` | `#code-generation`, `#template-engine` |
| **拖拽引擎** | `dragDropEngine.ts` | `DraggableComponent.vue`, `useDragDrop.ts` | `#drag-drop`, `#interaction-engine` |

## 🏷️ **Serena标签分类体系**

### 按功能分类
- `#lowcode-core` - 低代码引擎核心
- `#visual-designer` - 可视化设计器
- `#entity-designer` - 实体设计器  
- `#code-generation` - 代码生成
- `#drag-drop` - 拖拽功能
- `#template-system` - 模板系统

### 按技术栈分类
- `#vue-components` - Vue组件
- `#typescript-types` - TypeScript类型
- `#pinia-stores` - Pinia状态管理
- `#vite-plugins` - Vite插件
- `#api-client` - API客户端

### 按开发阶段分类
- `#p0-wizard` - P0阶段模块向导
- `#p2-designer` - P2阶段可视化设计器
- `#unit-tests` - 单元测试
- `#integration-docs` - 集成文档

### 按重构优先级分类
- `#migration-priority-1` - 最高优先级迁移
- `#migration-priority-2` - 中等优先级迁移  
- `#migration-priority-3` - 低优先级迁移

## 📊 **文件统计和复杂度分析**

| 分类 | 文件数 | 总行数 | 平均复杂度 | 迁移难度 |
|------|--------|--------|------------|----------|
| 核心引擎 | 25 | ~4,000 | 高 | 🔴 困难 |
| 可视化设计器 | 12 | ~3,500 | 中高 | 🟡 中等 |
| 代码生成 | 8 | ~2,000 | 中 | 🟡 中等 |
| UI界面 | 8 | ~1,500 | 低中 | 🟢 简单 |
| 工具脚本 | 7 | ~500 | 低 | 🟢 简单 |

## 🔍 **搜索和查询指南**

### Serena查询示例
```bash
# 查找所有拖拽相关组件
serena search "#drag-drop AND #vue-components"

# 查找代码生成相关文件  
serena search "#code-generation OR #template-system"

# 查找需要优先迁移的文件
serena search "#migration-priority-1"

# 查找实体设计器相关实现
serena search "#entity-designer AND #backend-entities"
```

### 关键词索引
- **拖拽**: dragDrop, draggable, DraggableComponent, dragDropEngine
- **设计器**: designer, Designer, visual-designer, entity-designer
- **代码生成**: codegen, generator, template, schemaExporter
- **低代码**: lowcode, LowCode, low-code
- **模块向导**: module-wizard, ModuleWizard, wizard
- **实体**: entity, Entity, EntityDesigner

## 📝 **维护说明**

1. **更新频率**: 每次重大功能变更后更新索引
2. **标签规范**: 使用kebab-case格式，避免空格和特殊字符
3. **文件路径**: 使用相对路径，保持跨平台兼容性
4. **复杂度评估**: 基于代码行数、依赖关系、业务复杂度综合评估
5. **迁移优先级**: 基于依赖关系、使用频率、重构难度确定

---
*本索引文件由SmartAbp团队维护，最后更新时间: 2025-01-12*
