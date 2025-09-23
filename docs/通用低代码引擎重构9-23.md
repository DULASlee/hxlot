## TDD 开发计划 — 低代码引擎重构与 LowCode Studio 一体化

> 目的：以测试驱动开发（TDD）全面重构并整合现有低代码引擎，实现“强大且易用”的一体化产品体验。在保证企业级质量与安全的前提下，逐步落地数据建模、页面设计、主题定制、流程/规则、代码生成、预览发布等核心能力。

---

## 一、范围与目标（Scope & Objectives）

- 统一产品入口：LowCode Studio（壳层 + 导航 + 工作区 + 底栏日志/校验）
- 企业级 UI 定制：三层设计令牌（基础Token → 主题语义变量 → 组件消费），可视化主题编辑器
- 复杂业务支撑：流程/状态机、策略规则编排器（前后端联动）
- 代码生成闭环：模板强制匹配、参数自动映射、并发受控、进度上报、产物校验
- 安全预览与发布：iframe/Worker + CSP 沙箱、危险 API 禁止（eval/new Function/innerHTML）
- 体验目标：3 步完成（建模 → 设计页面 → 生成预览），关键操作≤3次点击，高可发现性

验收高线（Definition of Awesome）：
- 95+ 质量门控分；TDD遵循率≥90%；覆盖率≥80%；零编译错误
- 关键交互延迟 ≤ 100ms；Studio 首屏 ≤ 2s；预览热更新 ≤ 500ms
- A11y 基线达成（可聚焦、可读性、对比度、键盘可操作）

---

## 二、质量门控与规范（Quality Gates & Standards）

- 前端（根/SmartAbp.Vue）
  - npm run type-check（Strict）
  - npm run lint（ESLint 9，零错误）
  - npm run test:coverage（Vitest ≥80% 覆盖）
  - npm run test:tdd-compliance（TDD≥90%）
  - npm run build（Vite 零错误）

- 后端（.NET / ABP）
  - dotnet build（零编译错误）
  - dotnet test --collect:"XPlat Code Coverage"（≥80% 覆盖）
  - Roslyn 分析（CodeQualityGenerator 标准）

- 架构与模板强制
  - ADR 查阅并遵循（docs/architecture/adr/*）
  - 模板强制匹配（templates/**/*），参数映射：EntityName、entityName、ModuleName、entityDisplayName、kebab-case-name
  - 预览沙箱 + CSP，禁止 innerHTML/eval/new Function

---

## 三、测试层级与工具（Test Matrix）

- 单元测试（Vitest / xUnit）：
  - 纯函数、Store、服务、规则计算、模板参数映射、并发控制器
- 组件测试（@testing-library/vue）：
  - Studio 壳、侧栏导航、属性面板、主题编辑器、表单联动
- 集成测试（Vitest + jsdom / .NET 集成测试）：
  - Router + Store + 组件协作、生成器与模板交互、后端服务边界
- 端到端（Cypress）：
  - Studio 关键路径（建模→设计→生成→预览）、主题切换、流程编排与校验、发布预览
- 性能/可用性：
  - 组件装载与交互基准（performance.now/自定义埋点）
  - 设计令牌切换批量影响的渲染耗时
  - A11y 断言（对比度、tab 顺序、aria 标签）

---

## 四、里程碑与TDD计划（Phased TDD Plan）

### Phase 0：基线与准备（1-2天）
1) 建立基线覆盖率与门控脚本（若已存在则校验并补齐报告上传）
2) ADR/模板清单核对；列出受影响区域
3) 初始失败用例（红）：
   - 现有设计器关键场景回归用例（渲染/交互/生成）
   - 模板发现与参数映射的边界输入

交付：覆盖与失败清单、风险列表、修复优先级

### Phase 1：LowCode Studio 一体化工作台（3-5天）
- 目标：统一入口 + 导航 + Workspace Store + 基础路由
- 先写测试（红）：
  - Router 存在 /studio，左侧导航项完整可点；首次进入默认打开“项目概览”
  - Workspace 初始 state 正确；新建/打开/保存 Project 成功（使用本地临时存储/Mock）
  - Studio 壳：顶部操作按钮、右侧属性区、底部日志面板可折叠
  - 性能阈值：首屏渲染 < 2000ms，导航切换 < 100ms（打点断言）
- 实现（绿）：最小功能满足用例
- 重构：抽离可复用布局、无副作用的导航守卫、日志总线

验收：Cypress 场景“进入Studio→新建项目→保存→打开成功”；A11y 快速检查通过

### Phase 2：主题定制（Theme Designer）（3-5天）
- 先写测试（红）：
  - 基础Token→主题变量→组件消费层三段联动，一处修改全局生效
  - 颜色/字体/间距/圆角/阴影批量调整预览及时更新（≤500ms）
  - 对比度阈值合格（WCAG AA），主题快照可回滚
- 实现（绿）：主题编辑器 + CSS 变量写入 + 预览联动 + 快照管理
- 重构：主题包导出（json + css），可一键应用/回滚

验收：E2E“选择主题 → 修改主色 → 实时预览 → 导出主题 → 回滚成功”

### Phase 3：流程/规则（Workflows & Rules）（5-7天）
- 先写测试（红）：
  - 状态机：起始/中间/终止状态、转换条件与动作、非法转换阻断
  - 策略规则：字段联动、权限约束、异步校验、服务依赖Mock
  - 代码骨架：前端 hooks、后端 Handler/Policy 按模板生成
- 实现（绿）：流程图编辑器、规则面板、校验引擎、模板联动
- 重构：规则执行器可插拔、可观测日志

验收：E2E“配置状态机 → 设置规则 → 保存 → 生成代码 → 单测通过”

### Phase 4：代码生成（Codegen）（5-7天）
- 先写测试（红）：
  - 模板强制匹配（templates/**/*）；参数映射正确
  - 并发度≤5、进度事件上报、产物预览存在 banner // AUTO-GENERATED FILE
  - 产物通过 type-check + lint + build；无 ESLint 错误
- 实现（绿）：生成控制台、模板绑定、参数校验、落盘与回滚
- 重构：生成器解耦、失败重试、产物diff与审计

验收：E2E“选择实体 → 选择模板 → 生成 → 产物通过全部门控 → 可预览”

### Phase 5：预览与发布（Preview & Publish）（3-5天）
- 先写测试（红）：
  - 预览沙箱：iframe/Worker + 严格 CSP；禁止 eval/new Function/innerHTML
  - 仅允许白名单 API；异常隔离不崩溃 Studio
  - 发布产物构建与快照回滚
- 实现（绿）：沙箱预览、发布面板、构建与回滚流程
- 重构：沙箱监控、性能采集、错误上报

验收：E2E“在沙箱中预览 → 恶意脚本被拦截 → 发布 → 回滚成功”

### Phase 6：质量闭环与NFR（2-3天）
- 覆盖率≥80%，TDD≥90%，质量门控≥95 分
- 性能基线：Studio 首屏≤2s、设计器交互≤100ms、预览刷新≤500ms
- A11y：tab 顺序、aria、对比度；国际化基础覆盖

交付：覆盖报告、性能与A11y报告、风险与债务清单、交接文档

---

## 五、关键用例清单（Samples）

1) Studio 导航与工作流
   - 进入 /studio → 左侧导航（概览/建模/页面/主题/流程/生成/预览）可用
   - 新建项目 → 填写名称/描述 → 保存 → 重新打开一致

2) 主题编辑器
   - 修改主题主色 → 所有按钮与链接颜色同步更新（不刷新）
   - 快照保存/还原；对比度断言达标

3) 流程/规则
   - 定义“草稿→审批中→已发布”状态机；非法“已发布→草稿”被阻止
   - 规则：当“价格>10000”时需二次审批；表单验证与后端策略一致

4) 代码生成
   - 为实体 Product 选择 CRUD 模板 → 生成 DTO/Service/Store/RuntimeComponent
   - 产物含 banner，type-check + lint + build 全部通过

5) 预览/发布
   - 在沙箱内运行页面 → 恶意脚本被拒 → 发布成功 → 回滚恢复

---

## 六、测试数据与Fixture

- entities.json：示例实体（Product/User/Order）
- pages.json：页面结构与组件树
- theme.json：主题令牌集合（含边界值）
- workflows.json：状态/转换/规则组合
- codegen-params.json：模板参数边界用例（空、超长、危险字符、重复）

---

## 七、Mock 与隔离策略

- API/权限/存储：使用 MSW（前端）与 TestServer（后端）
- 时间/随机性：时钟冻结与随机种子固定
- 并发：以Fake池与计数器校验“≤5”规则

---

## 八、CI/CD 与度量

- PR 质量门控：type-check、lint、test:coverage、build、test:tdd-compliance 全绿才可合并
- 覆盖率分档：红<70/黄70-80/绿≥80，关键目录需≥85%
- 基准测试：关键交互与预览渲染

---

## 九、风险与回滚

- 风险：模板与现有产物不兼容；预览沙箱策略过严影响特性；主题切换影响性能
- 缓解：灰度开关、双写期、模板版本化、特性Flag、回滚快照

---

## 十、交付物与DoD

- 代码：通过全部门控；无控制台报错；无未处理Promise
- 文档：用户指南、主题系统指南、工作流/规则指南、模板参数表
- 测试：≥80%覆盖与TDD≥90%；E2E 关键路径全绿
- 运营：基线监控仪表、错误上报、性能报表

---

## 附录：命令与脚手架

- 前端
  - npm run type-check
  - npm run lint
  - npm run test:coverage
  - npm run test:tdd-compliance
  - npm run build

- 后端
  - dotnet build
  - dotnet test --collect:"XPlat Code Coverage"

- 建议目录
  - docs/TDD-Plan-LowCode-Studio.md（本文件）
  - docs/QA-Checklist.md（质量清单）
  - docs/Studio-UX-Guidelines.md（Studio 交互规范）


