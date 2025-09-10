# Pull Request Checklist

请在提交前逐项确认（未满足项请勿提 PR）：

## 🚨 BUG修复铁律（绝对禁令）
- [ ] 未删除代码来掩盖错误
- [ ] 未使用 `as any` 绕过类型检查
- [ ] 未用 `_parameter` 规避未使用参数警告
- [ ] 未注释掉报错代码
- [ ] 已深入分析错误根因（Root Cause），并提供功能性修复（非规避）
- [ ] 已在描述中附上修复策略（Fix Strategy）、风险评估（Risk）与验证方式（Validation）

## ✅ 质量门禁（本地自检）
- [ ] npm run type-check 通过（或 type-check:lowcode 对低代码子模块）
- [ ] npm run lint --fix 通过
- [ ] npm run test 或 npm run test:lowcode 通过
- [ ] npm run build 通过（或 build:lowcode 对低代码子模块）
- [ ] 无引入重复代码，遵循架构合规性规则
- [ ] 文档已更新（如需），并链接到 doc/engineering-rules.md

## 变更说明
- 背景与问题（Background/Issue）：
- 根因分析（Root Cause）：
- 修复策略（Fix Strategy）：
- 风险与回滚预案（Risk & Rollback）：
- 验证方式（Validation：用例、截图、指标）：

## 关联
- 相关 Issue/任务编号：