# 实体设计器2025：企业级可视化建模增强计划 (Enterprise Visual Modeler Enhancement Plan)

**核心愿景**：构建一个集 **智能化**、**协同化** 与 **企业级治理** 于一体的可视化实体建模平台，使其不仅是代码生成工具，更是团队进行领域驱动设计（DDD）的核心协作枢- Hub。

---

### **第一阶段：夯实基础 & 统一模型 (Phase 1: Solidify the Foundation & Unify Models)**

本阶段的核心是**纠偏、补全、统一**，将现有实现与架构蓝图完全对齐，并补齐关键短板。

*   **任务1.1: 统一数据模型为唯一事实来源 (Unify Data Model as Single Source of Truth)**
    *   **行动**: 正式确立 `src/types/entity.ts` 中定义的 `EnhancedEntityModel` 为核心模型。
    *   **增强**: 废弃设计文档中旧的模型定义，并反向更新文档，确保 `entity.ts` 成为所有开发的基石和唯一参考。
    *   **目标**: 消除模型定义分歧，为后续所有功能提供一个稳定、统一的数据结构。

*   **任务1.2: 补全后端代码生成能力 (Complete Backend Code Generation)**
    *   **行动**: 立即启动 `EnhancedEntityTemplate.cs` 模板的开发。这是当前最紧迫的任务。
    *   **增强**: 模板必须能完全解析 `EnhancedEntityModel`，特别是 `relationships` 和 `validationRules` 数组，并生成符合ABP框架规范的、包含导航属性和数据注解（Data Annotations）的C#实体类。同时创建 `DbContext` 的配置模板，以支持实体关系的Fluent API配置。
    *   **目标**: 打通前后端，使设计器真正具备端到端生成高质量代码的能力。

*   **任务1.3: 激活核心可视化组件 (Activate Core Visual Components)**
    *   **行动**: 为 `RelationshipDesigner.vue` 注入实际的渲染和交互逻辑。实现实体的拖拽、连接线的创建与删除，并与 `EnhancedEntityModel.relationships` 双向绑定。
    *   **增强**: `ValidationRuleDesigner.vue` 需要根据属性类型（如 `string`, `number`）动态渲染可用的验证规则，并将配置结果实时同步到 `EntityProperty.validationRules`。
    *   **目标**: 将静态的UI骨架转化为功能完整的、可交互的可视化设计工具。

---

### **第二阶段：迈向智能与协同 (Phase 2: Embrace Intelligence & Collaboration)**

本阶段将引入**AI**和**实时协同**，实现从“工具”到“智能伙伴”的跨越。

*   **任务2.1: 植入AI设计助理 (Integrate AI Design Assistant)**
    *   **行动**: 利用已有的 `AIDesignAssistant.ts` 桩代码，集成大语言模型（LLM）。
    *   **增强**:
        *   **智能推荐**: 根据实体和属性的命名（如`Email`），自动推荐`[RegularExpression]`验证规则。
        *   **关系推断**: AI分析多个实体，自动推荐可能存在的一对多、多对多关系。
        *   **模型生成**: 支持通过自然语言（如“创建一个订单，包含订单号、金额和客户信息”）直接生成基础实体模型。
    *   **目标**: 降低建模门槛，提升设计效率和准确性，让AI成为架构师的副驾驶。

*   **任务2.2: 实现实时协同建模 (Enable Real-time Collaborative Modeling)**
    *   **行动**: 基于 `RealTimeCollaboration.ts` 实现WebSocket或WebRTC连接，将实体模型的变更实时同步给所有在线用户。
    *   **增强**: 在画布上显示其他协作者的光标和当前正在编辑的实体，实现类似Figma的体验。引入评论和标记功能，方便团队成员就特定属性或关系进行异步讨论。
    *   **目标**: 破除单人设计的孤岛，使实体建模成为一个透明、高效的团队协作过程。

*   **任务2.3: 引入模型版本控制 (Introduce Model Version Control)**
    *   **行动**: 激活 `DesignVersionControl.ts`，为实体模型提供Git-like的版本管理能力。
    *   **增强**: 支持提交（Commit）、历史记录查看、版本对比（Diff）和回滚（Revert）。未来可扩展至分支（Branch）和合并（Merge），允许团队并行探索不同的设计方案。
    *   **目标**: 为设计资产提供企业级的安全与管理能力，让每一次变更都有迹可循。

---

### **第三阶段：赋能企业级治理与扩展 (Phase 3: Empower Enterprise Governance & Extensibility)**

本阶段聚焦于大型企业所需的安全、合规、扩展和性能。

*   **任务3.1: 构建企业级治理引擎 (Build Enterprise Governance Engine)**
    *   **行动**: 设计并实现一个策略引擎，允许企业设定全局建模规则。
    *   **增强**:
        *   **命名规范**: 强制实体、属性采用统一的命名法（PascalCase/camelCase）。
        *   **复杂度约束**: 限制单个实体的属性数量或关系复杂度，防止模型过于臃肿。
        *   **禁用模式**: 禁止使用某些数据类型或关系类型。
    *   **目标**: 确保在大型团队中，所有模型产出都符合企业架构的统一标准。

*   **任务3.2: 打造可扩展插件架构 (Create an Extensible Plugin Architecture)**
    *   **行动**: 基于 `ExtensibleComponentLibrary.ts` 将设计器的核心功能插件化。
    *   **增强**: 允许开发者通过插件形式，向设计器中添加新的**自定义属性类型**、**自定义验证规则UI**、甚至**全新的代码生成器**（如生成GraphQL Schema、Protobuf文件等）。
    *   **目标**: 将设计器从一个封闭工具变为一个开放平台，使其具备无限的扩展能力以适应未来的技术演进。

*   **任务3.3: 极限性能与压力测试 (Extreme Performance & Stress Testing)**
    *   **行动**: 激活 `PerformanceOptimizer.ts`，并制定专项测试计划。
    *   **增强**: 使用虚拟化渲染技术（Virtual Rendering）确保在加载包含**超过500个实体、数千条关系**的超大型模型时，画布的拖拽、缩放等操作依然流畅，响应时间低于100ms。
    *   **目标**: 确保平台能够承载超大规模企业级项目的建模需求。
