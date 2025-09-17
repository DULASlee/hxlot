# 项目全栈低代码引擎技术架构和功能模块说明书 (V2 - 详细版)

## 1. 概述与核心架构思想

本说明书旨在全面、系统地阐述 SmartAbp 项目现有全栈低代码引擎的技术架构、核心功能模块、关键组件及文件路径，为后续的重构和迭代提供坚实的、达成共识的工程基准。

**核心架构思想：混合模式驱动**

项目当前的低代码引擎在事实上已经形成了一种先进的“混合模式”架构：
*   **后端：企业级代码生成引擎**: 一个以**领域驱动设计（DDD）**为核心、基于 **Roslyn AST（抽象语法树）操作**的强大后端代码生成器。
*   **前端：全栈元数据可视化设计器**: 一个以**元数据驱动**为核心、具备**运行时元数据加载和实时预览能力**的可视化设计界面。

**核心现状：两强并立，但连接薄弱**
我们拥有一个强大的后端和一个思想先进的前端，但连接两者的API层目前是一个**信息瓶颈**，导致前端丰富的元数据无法被后端完全理解和利用。

---

## 2. 后端引擎：`SmartAbp.CodeGenerator`

### 2.1. 技术架构核心
*   **核心技术**: C# .NET + **Roslyn API**。
*   **架构剖析**: 引擎的核心是 `RoslynCodeEngine`，它通过直接操作C#代码的**抽象语法树（AST）**来生成代码，确保了生成代码的**高质量和可维护性**。
*   **关键文件**:
    *   **服务实现**: `src/SmartAbp.CodeGenerator/Services/CodeGenerationAppService.cs`

### 2.2. 核心服务与DTOs
*   **服务接口 (`ICodeGenerationAppService`)**:
    *   **文件路径**: `src/SmartAbp.CodeGenerator/Services/ICodeGenerationAppService.cs`
    *   **功能模块**: 定义了引擎的全部生成能力，包括 `GenerateEntityAsync`, `GenerateDddDomainAsync`, `GenerateCqrsAsync`, `GenerateEnterpriseSolutionAsync` 等，覆盖了从单一实体到完整企业级解决方案的生成。
*   **数据输入模型 (DTOs)**:
    *   **文件路径**: `src/SmartAbp.CodeGenerator/Services/Dtos.cs`
    *   **功能模块**: 定义了引擎的输入“语言”。
        *   `EntityDefinitionDto`: 描述实体核心特性。
        *   `PropertyDefinitionDto`: 描述属性基础信息（类型、长度、是否必须）。
        *   `NavigationPropertyDefinitionDto`: 描述实体间关系。
    *   **功能边界与缺陷**: 当前DTOs**完全聚焦于后端领域模型**，**严重缺失**对**UI、高级校验、权限、菜单**等全栈概念的描述能力。

---

## 3. 前端引擎 (`packages` monorepo)

### 3.1. 核心数据模型 (`@smartabp/lowcode-designer`)
这是前端引擎的灵魂，定义了前端“说”的全栈语言。
*   **文件路径**: `src/SmartAbp.Vue/packages/lowcode-designer/src/types/index.ts`
*   **核心接口**:
    *   **`EnhancedEntityModel`**: 远超后端DTO的“超级模型”，是所有可视化设计的核心产出。
    *   **`EntityUIConfig`**: 定义了列表页 (`listConfig`)、表单 (`formConfig`)、详情页 (`detailConfig`，**支持Tabs布局**)的完整UI元数据。
    *   **`EntityPermission`**: 定义了角色权限乃至字段级的细粒度权限。
    *   **`ValidationRule`**: 定义了`pattern` (正则)、`range` (范围)等高级校验规则。

### 3.2. 可视化设计器 (`@smartabp/lowcode-designer`)
这是用户与引擎交互的核心界面。
*   **主视图**:
    *   **`VisualDesignerView.vue`**: 承载整个设计器UI的主视图。
    *   **文件路径**: `src/SmartAbp.Vue/packages/lowcode-designer/src/views/VisualDesignerView.vue`
*   **核心功能组件**:
    *   **`EntityDesigner.vue`**: 单个实体设计的核心工作台，负责管理实体的基础信息和属性列表。
        *   **文件路径**: `src/SmartAbp.Vue/packages/lowcode-designer/src/components/CodeGenerator/EntityDesigner.vue`
    *   **`RelationshipDesigner.vue`**: 可视化关系建模画布，允许用户通过拖拽和连线定义实体关系。
        *   **文件路径**: `src/SmartAbp.Vue/packages/lowcode-designer/src/components/CodeGenerator/RelationshipDesigner.vue`
        *   **关联逻辑**: `src/SmartAbp.Vue/packages/lowcode-designer/src/composables/useRelationshipDesigner.ts`
    *   **`ValidationRuleDesigner.vue`**: 属性级校验规则配置器。
        *   **文件路径**: `src/SmartAbp.Vue/packages/lowcode-designer/src/components/CodeGenerator/ValidationRuleDesigner.vue`

### 3.3. 核心与运行时 (`@smartabp/lowcode-core`)
这是引擎的“内核”，提供了底层支持和运行时能力。
*   **文件路径**: `src/SmartAbp.Vue/packages/lowcode-core/src/`
*   **核心模块**:
    *   **`kernel/`**: 包含插件管理器(`plugins.ts`)、事件总线(`events.ts`)、缓存(`cache.ts`)等底层核心。
    *   **`runtime/`**: **运行时引擎**所在，是实现实时预览和元数据驱动UI的关键。
        *   **`runtime/workers/sfc.worker.ts`**: 表明具备在浏览器端实时编译Vue单文件组件的能力。
        *   **`runtime/workers/metadata.worker.ts`**: 表明具备在Worker中处理元数据的能力，以避免UI阻塞。

### 3.4. API适配层 (`@smartabp/lowcode-api`)
这是连接前后端的桥梁，也是当前的核心瓶颈。
*   **文件路径**: `src/SmartAbp.Vue/packages/lowcode-api/src/code-generator.ts`
*   **核心瓶颈：信息降级 (Information Downgrade)**:
    *   此文件中的 `generateEntity` 方法，其参数类型 `EntityDefinition` 是一个简化的接口，其结构与后端的 `EntityDefinitionDto` 对齐。
    *   在调用此方法前，前端必须将内容极其丰富的 `EnhancedEntityModel` **“降级”** 为贫瘠的 `EntityDefinition`，导致所有**UI、权限、高级校验**的元数据**全部丢失**。

---

## 4. 总结与后续迭代方向

本说明书通过深入到具体文件和组件，更加清晰地揭示了项目低代码引擎的现状：
*   我们拥有两个**各自领域内都非常强大**的前后端引擎。
*   我们拥有一个**具备运行时能力**的先进前端架构。
*   我们面临一个由 `lowcode-api` 造成的、清晰的**“元数据信息鸿沟”**。

这份详尽的分析报告为 **V9开发计划** 提供了坚实的、代码级的实施依据。V9计划的核心，正是为了精准地解决上述“元数据信息鸿沟”，其所有阶段性目标——从扩展后端DTO，到实现运行时渲染器，再到最终的实时元数据编辑器——都是为了**加宽前后端的“信息大桥”**，让前端的全栈元数据能够顺畅地流动，并最终驱动整个全栈应用的生成与实时调整。
