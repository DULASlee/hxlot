## SmartAbp 全栈代码质量检查系统

### 1. 总体目标
- 企业级质量门禁（P0/P1/P2）
- 技术债务量化
- 代码异味检查
- 性能瓶颈识别与优化建议
- 智能重构建议（基于开源规则与提示）
- 依赖安全扫描
- 代码复杂度分析
- 零配置启动
- 性能回归测试能力
- 集成 ESLint + Vue DevTools Quality + Roslyn Analyzers 2025 + 架构分析
- 项目统一类型注册系统违规检查
- 项目统一组件注册违规检查
- 全项目硬编码检测
- 非测试代码 Mock 检查
- TODO 检查
- 空实现检查

### 2. 架构概览
- CLI 工具层：scripts/quality/*
- 规则引擎层：开源规则（ESLint、Roslyn、StyleCop、SecurityCodeScan）+ 自定义规则
- 分析器层：
  - 前端：ESLint、Vue DevTools API（性能指标）、自定义AST
  - 后端：Roslyn Analyzers、dotnet format、SecurityCodeScan
  - 架构：依赖关系与别名规范扫描（grep + AST）
  - 安全：秘密扫描、依赖漏洞（免费源镜像）
- 报告层：JSON/Console/HTML（可选）
- 门禁层：quality-gate.sh（P0/P1/P2）

### 3. 模块设计
- 前端质量模块（eslint-runner、vue-performance-probe）
- 后端质量模块（roslyn-runner、security-scan）
- 架构合规模块（package-deps-check、alias-violation-check）
- 技术债务模块（复杂度、重复、TODO、Mock、空实现）
- 性能模块（大文件、渲染热区、CI对比报告）
- 安全模块（敏感词扫描、注入模式识别、依赖CVE信息抓取）
- 报告与门禁模块（score聚合、P0/P1/P2判定）

### 4. 工具集成（全部免费开源）
- 前端：ESLint + @typescript-eslint + eslint-plugin-vue + eslint-plugin-security
- 后端：Microsoft.CodeAnalysis.NetAnalyzers + StyleCop.Analyzers + SecurityCodeScan
- 脚手架：quality-gate.sh / quality-monitor.js（零配置调用）
- 架构扫描：grep/AST 自定义
- 性能回归：基于前后端构建产物与指标比对（历史报告对比）

### 5. 零配置启动
- npm scripts：`npm run quality` → 调用 scripts/quality/quality-gate.sh
- dotnet 环境自动探测，无需手工配置
- 缺省规则随包内置，可覆盖

### 6. 质量门禁（P0/P1/P2）
- P0：TS 类型检查、.NET 编译、架构违规（相对路径、@/）、类型绕过（as any/@ts-ignore）
- P1：安全扫描（敏感词、注入模式）、代码风格、单元测试
- P2：性能与技术债务（复杂度、行数、TODO 等）

### 7. 评分与技术债务量化
- 维度：正确性（编译/类型）30，安全20，风格10，复杂度15，性能15，架构10
- 分数聚合：0-100；技术债务=100-得分，细分为可跟踪项

### 8. 检查项覆盖（对照15项）
1) 质量门禁：quality-gate.sh 聚合 P0/P1/P2
2) 技术债务量化：scores + debt 指标输出
3) 代码异味检查：ESLint/Roslyn 规则 + 自定义AST
4) 性能瓶颈识别：大文件、复杂度、Vue渲染热区提示
5) 智能重构建议：基于规则的自动建议与提示（非付费AI）
6) 依赖安全扫描：SecurityCodeScan + 敏感词 + 依赖CVE抓取（开源数据库）
7) 代码复杂度分析：ESLint complexity、Roslyn 复杂度分析
8) 零配置启动：脚本与缺省规则内置
9) 性能回归测试：前后两次报告对比关键指标
10) 集成 Elint+Vue DevTools Quality+Roslyn 2025+架构分析：统一入口运行
11) 类型注册系统违规：扫描 `metadata-core`/类型注册处的未注册或误用
12) 组件注册违规：扫描 `lowcode-shared` 的 ComponentRegistry 注册一致性
13) 硬编码：grep 非配置常量（含中文/魔法数字）
14) 非测试代码 Mock 检查：检测 `__mocks__`、mock关键字在非测试路径
15) TODO 检查：grep TODO/FIXME/XXX
16) 空实现检查：检测仅返回默认值/空体的方法（前后端）

### 9. 关键规则（样例）
- 架构：packages 禁止 '../' 与 '@/'; 仅用 @smartabp/* 别名
- 类型：禁止 as any/@ts-ignore；TS 必须通过
- 组件注册：新组件必须在 `lowcode-shared` 的 ComponentRegistry 注册
- 类型注册：实体/DTO 必须在 `metadata-core` 的 Schema 中出现

### 10. 报告规范
- 输出：`reports/quality/quality-report-YYYYMMDD-HHMMSS.json`
- 字段：scores、violations、debt、performanceDelta、securityFindings
- 失败门禁：P0 不通过即退出码 1

### 11. CI/CD 集成
- GitHub Actions/GitLab CI 样例：执行 quality-gate.sh；上传报告
- PR 评论机器人（可选）：解析报告，自动评论问题摘要

### 12. 扩展点
- 自定义AST规则：前端 Babel/TS AST；后端 Roslyn Analyzer（可扩展）
- 指标持久化：推送到自建 Prometheus/ES（可选）
- 报表：HTML 模板（可选）

### 13. 路线图
- v1：规则落地+报告+门禁（当前）
- v1.1：性能基线采集与回归对比
- v1.2：更多项目特定规则（注册系统自动验证）
- v2：可视化 Web 控制台

### 14. 分阶段开发计划与里程碑（6-8周）
- Phase 0（第1周，1-2天）：零配置引导/环境校验
  - 目标：一条命令即可运行全套检查（本地/CI）
  - 任务：
    - 脚本校验：Node、npm、dotnet、grep、bash 可用性检查
    - npm scripts 别名：quality、quality:gate、quality:report
    - 生成默认配置（ESLint、Roslyn、StyleCop、SecurityCodeScan）
  - 产出：可执行脚本、README最简用法
  - 验收：在新克隆环境下“一键通过/失败”门禁可重现

- Phase 1（第1周）：P0 质量门禁搭建
  - 目标：类型/编译/架构违规一票否决
  - 任务：
    - TS noEmit 类型检查接入；dotnet build --verbosity minimal
    - 架构规则：packages 禁止 '../' 与 '@/'; 别名 @smartabp/* 强制
    - 类型绕过扫描：as any/@ts-ignore 统计与阻断
    - 退出码策略：P0 不通过 exit 1
  - 产出：quality-gate.sh 完整P0流程
  - 验收：注入任一P0问题，流水线失败

- Phase 2（第2周）：前端ESLint/Vue质量与复杂度/异味
  - 目标：前端代码风格、复杂度、异味、基础安全
  - 任务：
    - 接入 @typescript-eslint、eslint-plugin-vue、eslint-plugin-security
    - 复杂度阈值：complexity<=10、max-lines-per-function<=50 等
    - Vue 规则：props/emit/未使用资源检测
  - 产出：专业ESLint配置与报告聚合
  - 验收：随机引入异味能被报告；--fix 能自动修复部分问题

- Phase 3（第2-3周）：后端Roslyn/StyleCop/安全分析
  - 目标：.NET 代码规范、复杂度、安全检查
  - 任务：
    - 引入 Microsoft.CodeAnalysis.NetAnalyzers、StyleCop.Analyzers
    - SecurityCodeScan 接入（注入/反序列化等模式）
    - 编译警告视作错误策略（可配置）
  - 产出：后端规则报告与聚合评分
  - 验收：不规范命名/潜在注入可被检测

- Phase 4（第3周）：架构&依赖合规/项目约束规则
  - 目标：项目级硬约束一体化检查
  - 任务：
    - 别名/相对路径/同层依赖/逆向依赖扫描
    - 自定义AST/grep规则库（scripts/quality/rules/*）
  - 产出：架构违规清单与建议修复路径
  - 验收：构造循环依赖/违规别名，门禁失败

- Phase 5（第3-4周）：项目特定规则（注册系统/硬编码/Mock/TODO/空实现）
  - 目标：覆盖低代码平台特色规则
  - 任务：
    - 类型注册违规：扫描 `metadata-core` Schema 与实际实体/DTO 映射差异
    - 组件注册违规：核对 `lowcode-shared` ComponentRegistry 与实际组件导出
    - 硬编码扫描：中文常量/魔法数字/明文地址与凭据（排除 i18n/合法常量）
    - 非测试Mock：检测 mocks/__mocks__/mock* 出现在非测试路径
    - TODO/FIXME/XXX：统计并量化为技术债务
    - 空实现：前端（空handler/空分支）、后端（仅返回默认值）识别
  - 产出：项目规则检测器（Node脚本+Roslyn模式），报告合并
  - 验收：投放若干典型违规样例均被命中

- Phase 6（第4-5周）：性能瓶颈识别与性能回归
  - 目标：建立性能基线与回归对比
  - 任务：
    - 前端：大文件/重渲染热点（静态指标）；构建体积/模块数/首次渲染耗时采样
    - 后端：方法复杂度、潜在N+1/同步等待异步等模式探测
    - 回归对比：当前报告 vs 历史最佳基线，给出Δ与建议
  - 产出：baseline.json、performanceDelta 字段、优化建议生成器
  - 验收：构造性能退化后，报告可见红灯与建议

- Phase 7（第5周）：技术债务量化与评分模型稳定
  - 目标：债务维度与阈值固化
  - 任务：
    - 维度权重校准（正确性/安全/风格/复杂度/性能/架构）
    - 债务字典：每类问题 → 分值与清偿建议
  - 产出：scores 与 debt 字段标准化
  - 验收：同一代码在不同时间评分可比

- Phase 8（第6周）：CI/CD 集成与PR注释
  - 目标：流水线左移质量，PR 直读问题
  - 任务：
    - GitHub Actions/GitLab CI 质量任务与工件上传
    - 失败门禁：P0 fail → 阻断；P1/P2 可警告（可配置）
    - PR 机器人（可选）：汇总 Top N 问题与修复指南
  - 产出：流水线样例、模板、文档
  - 验收：提PR自动出报告，门禁按策略生效

### 15. 任务清单（WBS）
- 基座
  - 脚本：quality-gate.sh、quality-monitor.js、rules/*、报告聚合
  - 配置：ESLint、Roslyn、StyleCop、SecurityCodeScan 缺省模板
- 前端规则
  - TS/ESLint/Vue/security 规则集与阈值
  - 复杂度/函数行数/未使用资源检测
- 后端规则
  - Roslyn/StyleCop 接入与最小规则集
  - 安全模式（注入/同步等待异步/N+1）
- 架构/项目特定
  - 别名/相对路径/依赖方向检查
  - 类型注册一致性、组件注册一致性
  - 硬编码、Mock、TODO、空实现
- 性能/回归
  - 基线采集、Delta 计算、建议模板
- CI/CD
  - Workflow模板、门禁阈值、工件上传

### 16. 验收标准与KPI
- 门禁通过率：主干分支 ≥ 95%
- P0 逃逸率：< 1%（发布后发现的P0问题）
- 技术债务下降：两周内下降 ≥ 20%
- 修复时长：Top 10 问题平均修复 ≤ 2 天
- 性能回归响应：出现红灯 ≤ 1 天内回收

### 17. 风险与应对
- 误报/漏报：
  - 应对：提供 suppress 机制与白名单；分阶段收敛阈值
- 成本上升：
  - 应对：PR 只检变更；主干执行全量
- 规则冲突：
  - 应对：优先P0/P1；提供本地覆盖配置
- 新人学习曲线：
  - 应对：提供常见问题与一键修复脚本/指南

### 18. 启动方式（回顾）
- 本地：
  - `npm run quality` 或 `./scripts/quality/quality-gate.sh`
- CI：
  - 引用模板 workflow，设置阈值变量并上传报告工件
