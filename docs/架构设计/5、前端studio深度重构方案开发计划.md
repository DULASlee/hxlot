# SmartAbp Studio 深度重构 - 详细开发计划

根据 `4、前端studio页面重构方案.md`，制定以下详细、可执行的开发计划，旨在将LowCode Studio重构成一个具有企业级稳定性、可维护性和用户体验的顶级应用。

---

## 🚀 作战计划概览

整个重构过程分解为四个关键阶段，共13个可量化、可验证的任务。

### **第一阶段：核心架构重构 (任务 1-4)**
> **目标**: 奠定坚实的架构基础，解决最核心的状态管理和布局问题。

-   [ ] **任务 1**: 创建 Git 分支并奠定 Pinia 基础 (`feat/studio-refactor-vue3`)
-   [ ] **任务 2**: 创建 `useWorkspaceStore` 以实现统一状态管理
-   [ ] **任务 3**: 创建所有新布局组件的占位符文件
-   [ ] **任务 4**: 重构 `LowCodeStudioView.vue` 为主框架布局

### **第二阶段：组件体系优化 (任务 5-7)**
> **目标**: 构建可复用、高内聚的组件系统，解决组件通信混乱的问题。

-   [ ] **任务 5**: 实现 `ErrorBoundary.vue` 组件逻辑
-   [ ] **任务 6**: 实现 `WorkspaceContainer.vue` 统一布局容器
-   [ ] **任务 7**: 建立全局事件总线 `eventBus.ts` (using mitt)

### **第三阶段：性能与交互优化 (任务 8-9)**
> **目标**: 提升应用的性能和用户体验。

-   [ ] **任务 8**: 重构 `el-menu` 以修复菜单显示问题
-   [ ] **任务 9**: 为低代码模块实现路由懒加载

### **第四阶段：全面集成与验证 (任务 10-13)**
> **目标**: 填充所有组件实现，全面集成新架构，并进行最终验证。

-   [ ] **任务 10**: 填充所有占位符组件的基础实现
-   [ ] **任务 11**: 集成事件总线以优化组件通信
-   [ ] **任务 12**: 全面测试重构后的 Studio 页面
-   [ ] **任务 13**: 执行最终构建验证

---

## 📋 详细任务分解

### **第一阶段：核心架构重构**

1.  **创建 Git 分支并奠定 Pinia 基础**
    -   **行动**: 创建 `feat/studio-refactor-vue3` 分支。
    -   **验证**: 确认 Pinia 状态管理已正确配置，为 `useWorkspaceStore` 的引入做准备。

2.  **创建 `useWorkspaceStore`**
    -   **行动**: 在 `src/stores/modules/` 目录下创建 `workspace.ts`。
    -   **实现**: 根据方案，实现统一状态管理，包括全局加载状态、错误收集、当前激活模块等核心数据。
    -   **验证**: 单元测试 `useWorkspaceStore` 的基本功能。

3.  **创建布局组件占位符**
    -   **行动**: 在 `src/components/common` 和 `src/components/layout` 目录下，批量创建以下空壳Vue文件：
        -   `ErrorBoundary.vue`
        -   `GlobalLoadingOverlay.vue`
        -   `StudioHeader.vue`
        -   `StudioSidebar.vue`
        -   `StudioPropertyPanel.vue`
        -   `StudioFooter.vue`
        -   `NotificationCenter.vue`
        -   `ModuleLoadingState.vue`
    -   **验证**: 确保文件创建成功，包含基本的 `<template>` 和 `<script setup>` 结构。

4.  **重构 `LowCodeStudioView.vue`**
    -   **行动**: 将 `LowCodeStudioView.vue` 彻底重构为方案中设计的“增强主框架组件”。
    -   **实现**: 集成新的布局组件、`ErrorBoundary`、`Suspense` 和 `KeepAlive`。
    -   **验证**: 页面能够渲染新的布局结构，即使子组件都是空的。

### **第二阶段：组件体系优化**

5.  **实现 `ErrorBoundary.vue`**
    -   **行动**: 填充 `ErrorBoundary.vue` 的逻辑。
    -   **实现**: 使用 `onErrorCaptured` 钩子捕获并处理子组件的渲染错误，提供UI降级和重试功能。
    -   **验证**: 编写一个会主动抛出渲染错误的测试组件，验证 `ErrorBoundary` 能否成功捕获并显示备用UI。

6.  **实现 `WorkspaceContainer.vue`**
    -   **行动**: 填充 `WorkspaceContainer.vue` 的逻辑。
    -   **实现**: 使用插槽（slots）为 `toolbar`, `aside`, `properties`, `footer` 提供扩展点，实现一个高度可复用的三栏式布局容器。
    -   **验证**: 在Storybook或测试页面中，验证不同布局模式下的显示是否正确。

7.  **建立全局事件总线 `eventBus.ts`**
    -   **行动**: 在 `src/utils/` 目录下创建 `eventBus.ts`。
    -   **实现**: 引入 `mitt` 库，建立一个轻量、类型安全的全局事件总线。
    -   **验证**: 编写单元测试，验证事件的发送 (`emit`) 和监听 (`on`) 功能正常。

### **第三阶段：性能与交互优化**

8.  **重构 `el-menu`**
    -   **行动**: 找到并重构现有的菜单组件。
    -   **实现**: 根据方案，优化 `el-menu` 的属性绑定，确保 `router` 模式、`:default-active` 和 `:collapse` 等交互与 `useWorkspaceStore` 的状态同步。
    -   **验证**: 手动测试菜单的点击跳转、激活状态高亮、展开/折叠功能是否符合预期。

9.  **实现路由懒加载**
    -   **行动**: 修改 `src/router/index.js` 中关于 lowcode 模块的路由配置。
    -   **实现**: 对 `EntityModelingView`, `DesignView` 等重量级组件采用 `() => import(...)` 的方式进行动态导入。
    -   **验证**: 在浏览器开发者工具的Network面板中，确认切换到相应路由时，对应的JS chunk文件是按需加载的。

### **第四阶段：全面集成与验证**

10. **填充占位符组件**
    -   **行动**: 为 `StudioHeader`, `StudioSidebar`, `StudioFooter` 等组件添加基础的UI和逻辑。
    -   **实现**: 连接 `useWorkspaceStore`，实现模块切换、菜单折叠等交互。
    -   **验证**: UI界面基本可用，核心交互功能正常。

11. **集成事件总线**
    -   **行动**: 审查代码，找到需要跨层级或跨模块通信的场景。
    -   **实现**: 用 `eventBus` 替换掉不合理的 `props` 深层传递或 `emit` 链。
    -   **验证**: 确保重构后的组件通信功能正常。

12. **全面测试**
    -   **行动**: 对重构后的整个Studio进行完整的功能回归测试。
    -   **验证**: 实体建模、页面设计、主题定制等核心功能在新架构下正常工作，无功能退化。

13. **最终构建验证**
    -   **行动**: 运行 `npm run build`。
    -   **验证**: 生产构建**必须成功**，无任何类型错误或打包错误。

---

此计划确保了每一步都有明确的目标和验证标准，可确保重构工作高质量、按计划完成。
