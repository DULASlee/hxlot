ADR alignment for code generation V4.2 (2025-09-18)
- ADR-0005 低代码引擎架构: Micro-kernel + plugins; strict plugin interface; performance/logging/sandbox requirements → governs lowcode runtime and generator design
- ADR-0012 P1 后端代码生成引擎: Roslyn-based engine; DDD/CQRS readiness; performance + memory optimizations; pipeline orchestration → informs backend generator architecture
- ADR-0015 可视化设计器架构: Designer as independent module; sandbox preview; schema-driven customization → aligns with Live UI Customizer plan
- ADR-0016 Monorepo 重构: lowcode code must live under packages/@smartabp/lowcode-* and be consumed via aliases → impacts where we place new lowcode code and integrations
Implementation guidance
- Backend: keep generators Roslyn/template-driven; push progress via SignalR; respect ABP layering
- Frontend: Composition API, strict TS; generated artifacts under appshell/*.generated.ts; routes/stores generated/aggregated by CLI; AST-safe integrations
- Security/perf: no dynamic eval in prod; add monitoring; concurrency limits; caching