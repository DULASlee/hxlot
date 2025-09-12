# ADR-0015: 可视化设计器（P2）架构决策

- 状态: 已接受
- 日期: 2025-09-11
- 作者: SmartAbp 架构组

## 背景
P0/P1 已打通“模板驱动的全栈代码生成”（前端Manifest→appshell聚合产物；后端ABP vNext代码生成）。为实现“所见即所得”的可视化生产力，需在 P2 引入独立的“拖拽可视化设计器”模块：既可作为生成前的“可视化定制→再生成”，也可作为生成后的“加载既有路由页面→可视化调整→回写增量Schema→增量再生成”。

## 决策
1) 设计器为独立模块/子系统，面向 Schema↔代码双向通道：
- Schema 是唯一真实来源；支持从已生成代码回读“增量Schema（overrides）”。
- 生成物一律进入 appshell/*.generated.ts，禁止直接人工改写。

2) 预览环境沙箱化与安全约束：
- 预览运行时采用 iframe/Worker + 严格 CSP 隔离；生产禁用动态执行。
- 只允许受控消息通道（postMessage）与受限 API 访问；切断宿主敏感上下文。

3) 双工作流并行支持：
- 生成前：Designer 装配 → 导出 Schema → 调用既有模板/生成链 → appshell 生效。
- 生成后：载入路由页面 → 解析 Block 标记/元数据 → 生成增量Schema → 增量再生成。

4) 可回滚与回执：
- 生成前后均产出 snapshot 与 diff 回执（文件清单、路由、菜单、权限影响）。
- 失败时支持回滚至上一次稳定基线；回执进入 PR 检查与 CI 漂移检测。

5) 与 ABP vNext 深度绑定：
- 字段/校验/权限/DTO 映射从 OpenAPI 契约自动推断；允许在 Designer 中微调。
- 事件/动作与服务调用遵循统一 Service 层封装，权限名与前端策略一致。

6) 契约来源与职责边界（P2特化）：
- 后端契约仅来源于现有 Swagger/OpenAPI；设计器与生成链仅生成“调用这些接口的前端代码”，后端接口生成仍由 P1 负责。
- 前端调用通过统一 Service/客户端封装，参与 CI 漂移检测以确保契约一致性。

## 约束
- 生成文件含头标“// AUTO-GENERATED FILE – DO NOT EDIT.”；任何定制通过 Schema/overrides 完成。
- 设计器遵循设计系统 Token；Palette/Inspector 不暴露非合规样式与不安全能力。
- 性能目标：实时预览渲染 ≤ 100ms；帧率 60fps；协作延迟 < 50ms；并发协作者 ≤ 50。
- 可观测性：生成/预览/增量再生成需埋点（时延、错误、吞吐、内存）；输出质量门需达标。
- 仅消费 OpenAPI 契约，禁止在 P2 生成任何后端接口；OpenAPI 客户端或 HTTP 封装为唯一调用入口。

## 备选方案
- 仅代码→不提供可视化：放弃所见即所得与非工程用户；不采纳。
- 直接编辑生成物：易分叉且不可控；违背“Schema唯一源”；不采纳。

## 影响
- 引入 Designer→Schema→Generator 的闭环；强化与模板库、appshell 聚合链路、一致性校验的协同。
- 提升新手“10分钟上线”的可操作体验，并保留资深工程师的深度可定制路径。

## 实施要点
- 模块路由：`/CodeGen/visual-designer` 入口；支持“从已有模块加载并定制”。
- 数据形态：ModuleSchema + PageSchema + ComponentSchema + EventSchema + Overrides。
- 输出机制：增量Schema + 变更回执（routes/menu/policies/files）。
- 质量门：lint/type/test/build 必须绿；CI 漂移检测 + Danger 回执检查。

## 迁移与兼容
- 既有模块不需重写；通过“生成后定制”在不破坏代码的前提下叠加增量。
- 若历史生成物无 Block 标记，采用最小回读策略+人工确认以保证安全。

## 实施要点（补充）
- Schema 桥接层：
  - DesignerOverrideSchema：增量描述（add/remove/update），携带稳定锚点与版本信息；
  - SchemaReader：从 *.vue 回读 UI 结构→生成增量；依赖稳定 Block/数据属性标记与 AST 解析；
  - MergeEngine：基于 baseline snapshot 的三方合并；锚点优先、显式冲突清单、幂等。
