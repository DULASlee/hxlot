# SmartAbp Git钩子使用指南

## 🎯 Git钩子体系概述

SmartAbp项目配置了完整的Git钩子体系，实现企业级代码质量自动保证。

### 📋 已配置的Git钩子

| 钩子名称 | 触发时机 | 检查内容 | 失败后果 |
|----------|----------|----------|----------|
| `pre-commit` | git commit前 | 四重质量检查 | 阻止提交 |
| `pre-push` | git push前 | 最终安全检查 | 阻止推送 |
| `commit-msg` | 提交消息验证 | Conventional Commits格式 | 阻止提交 |

## 🏗️ pre-commit 钩子（最重要）

### 四重强制检查门禁
1. **架构整洁检查（0违规）**
   - 检查相对路径违规：`grep -r "'../'" src/SmartAbp.Vue/packages/`
   - 检查@/引用违规：`grep -r "@/" src/SmartAbp.Vue/packages/`
   - 检查类型绕过：`grep -r "as any\|@ts-ignore" src/`

2. **代码去重检查（0重复）**
   - 检查重复Vue组件
   - 检查重复方法名  
   - 检查重复类名/接口

3. **TypeScript类型检查（0错误）**
   - 执行：`npm run type-check`
   - 必须0个类型错误

4. **构建编译检查（必须成功）**
   - 前端：`npm run build`
   - 后端：`dotnet build`

### 钩子测试结果 ✅
- **架构检测**: 成功检测到25处@/引用违规并阻止提交
- **消息验证**: 成功验证提交消息格式并阻止不规范提交
- **执行正常**: 钩子脚本运行稳定，反馈清晰

## 🚀 钩子管理脚本

### 启用所有钩子
```bash
bash scripts/setup-git-hooks.sh
```

### 手动控制
```bash
# 启用pre-commit钩子
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit

# 禁用pre-commit钩子  
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled

# 启用commit-msg钩子
mv .git/hooks/commit-msg.disabled .git/hooks/commit-msg
```

## 💡 开发者使用建议

### 提交前本地检查
```bash
# 手动执行质量检查（推荐）
bash scripts/local-quality-check.sh

# 通过后再提交
bash scripts/git-safe-sync.sh --non-interactive --auto-commit
```

### 修复常见违规
1. **@/引用违规**：替换为`@smartabp/lowcode-*`别名
2. **相对路径违规**：使用别名通信代替`../`
3. **类型安全违规**：补充正确类型定义，移除`as any`

### 提交消息规范
```bash
# 正确格式
git commit -m "feat: 添加用户管理功能"
git commit -m "fix: 修复登录验证BUG"
git commit -m "docs: 更新架构设计文档"

# 错误格式（会被拒绝）
git commit -m "更新代码"
git commit -m "修复问题"
```

Git钩子是保证代码质量的第一道防线，确保每次提交都符合企业级标准！
