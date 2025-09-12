# P2 可视化设计器实施检查清单（Serena专用）

用于 Serena 在分析/生成/审查时的强制核对点：

## 架构与数据
- [ ] 是否坚持 Schema 唯一来源（无直接修改 *.generated.ts）
- [ ] 是否支持从既有页面回读增量Schema（Block 标记/元数据）
- [ ] 输出是否包含：增量Schema + 变更回执（routes/menu/policies/files）+ snapshot

## 预览与安全
- [ ] 预览是否在 iframe/Worker + 严格 CSP 沙箱中运行
- [ ] 是否禁用 eval/new Function 等动态执行（生产态）
- [ ] 跨上下文通信是否仅通过受控 postMessage

## 生成与注入
- [ ] 是否调用既有 writers 生成 appshell 聚合（router/store/lifecycle/policies/menu）
- [ ] appshell 注入后路由/菜单是否即时生效

## 质量门与可观测
- [ ] 是否通过 lint/type/test/build 四连
- [ ] CI 是否启用 OpenAPI 漂移检测与 Danger 回执校验
- [ ] 是否埋点生成/预览/增量再生成（时延、错误、吞吐、内存）

## 性能与协作指标
- [ ] 实时预览渲染 ≤ 100ms；帧率 60fps
- [ ] 协作同步延迟 < 50ms；并发协作者 ≤ 50

> 参考：ADR-0015 可视化设计器架构、.cursor/rules/lowcode-engine-rules.mdc（P2细化）、project-development-rules.mdc（P2工作流）。
