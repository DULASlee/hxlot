# SmartAbp Git Scripts 标准化文档

## 📁 脚本架构说明

### 🎯 核心脚本（必须保留）
- **git-safe-sync.sh** - Linux/Mac环境Git同步脚本（企业级标准）
- **git-safe-sync.ps1** - Windows环境Git同步脚本（企业级标准）

### 🛠️ 监控与配置脚本
- **git-config-check.sh** - Git配置检查脚本
- **git-hooks-monitor.sh** - Git hooks监控脚本

## 🚀 使用规范

### Git同步标准流程
```bash
# Windows环境
powershell -File scripts/git/git-safe-sync.ps1 -AutoCommit -Verbose

# Linux/Mac环境
bash scripts/git/git-safe-sync.sh --non-interactive --auto-commit
```

### 质量检查前置原则
**任何Git操作前必须先通过：**
1. 架构整洁检查（0违规）
2. 代码去重检查（0重复）
3. 类型和编译检查（0错误）
4. Git自动同步执行

## ⚠️ 重要说明

### 已清理的冗余脚本
- ~~git-auto-sync.ps1~~ （已删除，功能合并到git-safe-sync.ps1）

### 脚本标准化原则
- **单一职责**：每个脚本只负责一个核心功能
- **跨平台兼容**：Windows使用PowerShell，Linux/Mac使用Bash
- **企业级质量**：所有脚本都包含完整的错误处理和日志记录
- **统一接口**：所有脚本都支持非交互模式和详细模式

## 📋 脚本维护规范

### 禁止事项
- ❌ 不得创建功能重复的Git脚本
- ❌ 不得绕过质量检查直接操作Git
- ❌ 不得修改核心质量门禁逻辑

### 必须遵循
- ✅ 所有Git操作必须通过标准脚本
- ✅ 质量检查前置，Git同步后置
- ✅ 完整的错误处理和状态反馈
- ✅ 跨平台兼容性保证

---
**最后更新**: 2025-09-28
**维护者**: SmartAbp开发团队
**版本**: v1.0 - 脚本标准化版本
