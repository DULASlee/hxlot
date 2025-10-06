# SmartAbp企业级低代码引擎架构优化方案终极版开发计划

> **文档版本**: v1.0
> **面向读者**: 中高级架构研发工程师
> **核心目标**: 提供一份清晰、可量化、风险可控的详细执行路线图。
> **前置要求**: 在执行前，请务必完整阅读《SmartAbp企业级低代码引擎架构优化方案终极版.md》。

---

## 🚀 序章：准备工作 (预计：0.5天)

### 1. 建立架构决策记录 (ADR)

-   **任务**: 在 `docs/architecture/` 目录下创建 `adr` 文件夹。
-   **交付物**:
    -   创建 `0000-use-architectural-decision-records.md` 模板文件。
    -   后续所有关键决策都必须在此目录创建新的ADR文档。
-   **验收标准**: `adr` 目录和模板文件已创建并提交到版本库。

---

## ✅ 第一阶段：紧急止血 - 隔离污染源，拯救开发体验 (周期：1周)

**阶段目标**: **IDE内存占用降低70%，热更新时间缩短到3秒内，开发体验得到质的提升。**

### **任务1.1: 创建代码生成隔离区 (预计：1天)**

-   **目标**: 将所有机器生成代码与手写源码物理隔离。
-   **执行步骤**:
    1.  在项目根目录创建 `.generated` 文件夹。
    2.  修改 `SmartAbp.CodeGenerator` 项目中的所有文件输出逻辑，将根路径指向 `.generated`。
    3.  将 `.generated/` 添加到项目根目录的 `.gitignore` 文件中。
-   **代码指令**:
    ```bash
    # 1. 创建目录
    mkdir .generated

    # 2. 更新 .gitignore
    echo "" >> .gitignore
    echo "# Generated code isolation area" >> .gitignore
    echo ".generated/" >> .gitignore
    ```
-   **验收标准**:
    -   [ ] 运行代码生成器后，所有新文件均出现在 `.generated` 目录内。
    -   [ ] `src/` 目录下不再有任何机器生成的文件。
    -   [ ] `.gitignore` 已更新。

### **任务1.2: 建立IDE性能保护铁律 (预计：0.5天)**

-   **目标**: 指示IDE（VSCode/Cursor）忽略对生成代码区的监听，从根源上降低IDE负载。
-   **执行步骤**:
    1.  在项目根目录创建或更新 `.vscode/settings.json` 文件。
-   **配置代码**:
    ```json
    // .vscode/settings.json
    {
      "files.watcherExclude": {
        "**/.git/objects/**": true,
        "**/node_modules/**": true,
        "**/dist/**": true,
        "**/.generated/**": true
      },
      "search.exclude": {
        "**/node_modules": true,
        "**/.generated": true
      },
      "typescript.tsserver.watchOptions": {
        "exclude": [
          "**/node_modules",
          "**/dist",
          "**/.generated"
        ]
      }
    }
    ```
-   **验收标准**:
    -   [ ] `.vscode/settings.json` 已创建并配置完毕。
    -   [ ] 重启IDE后，通过任务管理器/活动监视器确认IDE的CPU和内存占用显著下降。

### **任务1.3: 修复高危内存泄露 (预计：3.5天)**

-   **目标**: 解决最常见的事件监听器泄露问题。
-   **执行步骤**:
    1.  在 `packages/lowcode-shared/src/composables/` (若无则创建) 目录下，创建 `useSafeEventListener.ts`。
    2.  使用 `grep` 或 IDE 全局搜索，找出所有 `window.addEventListener`, `document.addEventListener` 以及 `bus.on` 的调用。
    3.  逐个将它们替换为 `useSafeEventListener` 的使用方式。
-   **代码实现 (`useSafeEventListener.ts`)**:
    ```typescript
    import { onUnmounted, onMounted } from 'vue';

    export function useSafeEventListener(
      target: EventTarget,
      event: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      onMounted(() => {
        target.addEventListener(event, listener, options);
      });

      onUnmounted(() => {
        target.removeEventListener(event, listener, options);
      });
    }
    ```
-   **验收标准**:
    -   [ ] `useSafeEventListener` 已创建并测试通过。
    -   [ ] 项目中所有手动的全局事件监听都已被替换。
    -   [ ] 通过Code Review确认所有调用都在 `onUnmounted` 中自动清理。
-   **ADR记录**:
    -   [ ] 创建 `docs/architecture/adr/0006-code-generation-output-isolation.md`。

---

## ✅ 第二阶段：架构边界清晰化 - 根除耦合，实现真模块化 (周期：2周)

**阶段目标**: **消除所有跨`packages`的非法引用，`tsc --build` 可成功执行，为真正的模块化奠定基础。**

### **任务2.1: 实施TypeScript项目引用 (预计：3天)**

-   **目标**: 建立`packages`间的官方依赖关系，启用增量编译。
-   **执行步骤**:
    1.  **根 `tsconfig`**: 在 `src/SmartAbp.Vue/` 目录下创建 `tsconfig.references.json` (或类似名称)。
    2.  **包 `tsconfig`**: 为 `packages/` 下的每一个包（`lowcode-core`, `lowcode-designer`等）创建或修改其 `tsconfig.json`，添加 `composite: true` 和 `declaration: true`，并定义 `references` 字段指向其依赖的兄弟包。
-   **配置示例**:
    ```json
    // src/SmartAbp.Vue/tsconfig.references.json
    {
      "files": [],
      "include": [],
      "references": [
        { "path": "packages/lowcode-shared" },
        { "path": "packages/lowcode-core" },
        { "path": "packages/lowcode-designer" }
      ]
    }

    // packages/lowcode-designer/tsconfig.json
    {
      "extends": "../../tsconfig.base.json",
      "compilerOptions": {
        "composite": true,
        "outDir": "dist",
        "rootDir": "src"
      },
      "include": ["src"],
      "references": [
        { "path": "../lowcode-shared" },
        { "path": "../lowcode-core" }
      ]
    }
    ```
-   **验收标准**:
    -   [ ] 在 `src/SmartAbp.Vue/` 目录下运行 `npx tsc --build tsconfig.references.json` 命令，所有包都能成功编译，并生成 `.tsbuildinfo` 文件。
    -   [ ] 修改一个底层包（如`lowcode-shared`），再次运行构建命令，只有该包和依赖它的包被重新编译。

### **任务2.2: 创建共享库并修复架构违规 (预计：7天)**

-   **目标**: 根除`'../'`和`@/'`非法引用，强制执行单向依赖。
-   **执行步骤**:
    1.  **创建 `lowcode-shared`**: 在`packages/`下创建`lowcode-shared`目录，用于存放所有共享的`types`, `utils`, `constants`, `errors`等。
    2.  **迁移代码**: 识别出`lowcode-core`等包中的通用代码，将其迁移至`lowcode-shared`。
    3.  **扫描违规**:
        ```bash
        grep -r -E "'\.\./|'@/" src/SmartAbp.Vue/packages/ --include="*.ts" --include="*.vue"
        ```
    4.  **逐个重构**: 将所有扫描到的非法引用，重构为从`@smartabp/lowcode-shared` (需在`tsconfig.base.json`中配置paths别名) 或其他合法的兄弟包中导入。
-   **验收标准**:
    -   [ ] `lowcode-shared` 包已建立并包含所有共享代码。
    -   [ ] 上述`grep`命令运行结果为空。
    -   [ ] 所有 `packages` 依然可以独立构建成功。
-   **ADR记录**:
    -   [ ] 创建 `docs/architecture/adr/0007-typescript-project-references.md`。

---

## ✅ 第三阶段：运行时性能革命 - 解决内存与卡顿 (周期：2-3周)

**阶段目标**: **复杂页面（如设计器）的初始加载时间减少50%，运行时内存峰值降低50%。**

### **任务3.1: 实施组件懒加载与内存分页管理 (预计：10-12天)**

-   **目标**: 按需加载组件，并对不活跃的组件进行内存回收。
-   **执行步骤**:
    1.  **设计与实现**: 在 `lowcode-core` 中，实现 `ComponentLazyLoader` 和 `MemoryManager` (含LRU策略) 两个核心类。
    2.  **重构组件注册表**: 改造项目中原有的组件注册/加载机制。将所有组件的注册从静态`import`改为一个包含动态`import()`函数的定义对象。
    3.  **应用懒加载**: 在设计器画布等需要动态渲染组件的地方，通过`ComponentLazyLoader`来加载和渲染组件。
    4.  **集成内存管理器**: `ComponentLazyLoader`在加载组件后，将其注册到`MemoryManager`。当内存压力达到阈值时，`MemoryManager`应能触发淘汰策略。
-   **代码示例**:
    ```typescript
    // ComponentRegistry.ts
    export const componentRegistry = {
      'Button': () => import('@/components/Button.vue'),
      'Input': () => import('@/components/Input.vue'),
      // ... 124 components
    };

    // ComponentLazyLoader.ts
    class ComponentLazyLoader {
      async load(componentName: string) {
        if (!componentRegistry[componentName]) throw new Error('...');
        const componentModule = await componentRegistry[componentName]();
        // ... register to MemoryManager ...
        return componentModule.default;
      }
    }
    ```
-   **验收标准**:
    -   [ ] 使用浏览器开发者工具的 "Performance" 和 "Memory" 面板进行分析。
    -   [ ] 对比重构前后，设计器页面的初始加载JS大小显著减少。
    -   [ ] 对比重构前后，长时间使用后的内存快照（Heap Snapshot）显示分离的DOM树和组件实例数量减少。
-   **ADR记录**:
    -   [ ] 创建 `docs/architecture/adr/0008-component-lazy-loading-and-memory-paging.md`。

---

## ✅ 第四阶段：战略演进 - 智能化代码生成 (长期规划)

**阶段目标**: **为代码生成器建立缓存机制，实现修改元数据后的快速、增量生成。**

### **任务4.1: 重构代码生成器为增量模式 (预计：需单独规划)**

-   **目标**: 避免每次都全量生成代码，只重新生成变更所影响的文件。
-   **技术方向**:
    1.  **输入哈希计算**: 对每个生成任务的输入（如模板文件内容 + JSON元数据）计算一个稳定的哈希值 (如SHA-256)。
    2.  **状态缓存**: 在`.generated`目录中维护一个状态文件（如`generation-manifest.json`），记录每个输出文件对应的输入哈希。
    3.  **增量逻辑**:
        -   生成前，为当前任务计算新哈希。
        -   与状态文件中记录的旧哈希对比。
        -   如果哈希值相同，跳过该文件的生成。
        -   如果不同，则执行生成，并更新状态文件中的哈希。
-   **验收标准**:
    -   [ ] 修改一个实体的某个字段描述（不影响结构），再次运行生成器，只有该实体相关的少数文件被重新生成，而不是全部。
    -   [ ] 首次运行和清空缓存后运行，行为应与原全量生成一致。
-   **ADR记录**:
    -   [ ] 创建 `docs/architecture/adr/0009-incremental-code-generation.md`。
