# Git 版本管理脚本

## 📁 目录说明

本目录包含 SmartAbp 项目的核心 Git 版本管理脚本，专注于安全、可靠的代码同步和质量保障。

## 🔧 核心脚本

### 1. Git 安全同步脚本

#### `git-safe-sync.sh` (Linux/Mac)
- **功能**: 企业级 Git 安全同步工具
- **特性**: 
  - 自动备份 → 拉取 → 合并 → 推送
  - 支持非交互模式
  - 完整的错误处理和恢复机制
  - 自动清理旧备份标签
- **用法**:
  ```bash
  # 交互模式
  bash scripts/git/git-safe-sync.sh
  
  # 自动提交模式
  bash scripts/git/git-safe-sync.sh --auto-commit
  
  # 非交互模式 (CI/CD 环境)
  bash scripts/git/git-safe-sync.sh --non-interactive
  
  # 预演模式 (查看操作但不执行)
  bash scripts/git/git-safe-sync.sh --dry-run
  ```

#### `git-safe-sync.ps1` (Windows PowerShell)
- **功能**: Windows PowerShell 版本的安全同步工具
- **特性**: 
  - 与 Bash 版本功能对等
  - 彩色日志输出
  - 支持日志文件记录
  - Windows 原生通知
- **用法**:
  ```powershell
  # 交互模式
  powershell scripts/git/git-safe-sync.ps1
  
  # 自动提交模式
  powershell scripts/git/git-safe-sync.ps1 -AutoCommit
  
  # 带日志记录
  powershell scripts/git/git-safe-sync.ps1 -AutoCommit -LogFile "sync.log"
  
  # 预演模式
  powershell scripts/git/git-safe-sync.ps1 -DryRun
  ```

#### `git-safe-sync.bat` (Windows 批处理)
- **功能**: Windows 批处理版本的安全同步工具
- **特性**: 
  - 兼容性最强的 Windows 版本
  - 支持所有 Windows 版本
  - 简化的参数处理
- **用法**:
  ```batch
  REM 交互模式
  scripts\git\git-safe-sync.bat
  
  REM 自动提交模式
  scripts\git\git-safe-sync.bat --auto-commit
  
  REM 非交互模式
  scripts\git\git-safe-sync.bat --non-interactive
  ```

### 2. Git 配置检查脚本

#### `git-config-check.sh`
- **功能**: 全面的 Git 配置合规性检查
- **检查项目**:
  - 基础 Git 配置文件
  - Git hooks 安装状态
  - 全局和项目配置
  - .gitignore 内容检查
  - Git 安全设置
  - 工作流配置
  - 性能配置
- **用法**:
  ```bash
  bash scripts/git/git-config-check.sh
  ```
- **输出**: 详细的检查报告和修复建议

## 🎯 使用指南

### 推荐工作流

1. **开始开发前**:
   ```bash
   # 检查 Git 配置
   bash scripts/git/git-config-check.sh
   
   # 拉取最新代码
   bash scripts/git/git-safe-sync.sh
   ```

2. **开发过程中** (每30分钟或重要节点):
   ```bash
   # 自动同步
   bash scripts/git/git-safe-sync.sh --auto-commit
   ```

3. **开发完成后**:
   ```bash
   # 最终同步
   bash scripts/git/git-safe-sync.sh --auto-commit
   ```

### 参数说明

| 参数 | Bash | PowerShell | Batch | 说明 |
|------|------|------------|-------|------|
| 自动提交 | `--auto-commit` / `-a` | `-AutoCommit` | `--auto-commit` / `-a` | 自动提交本地更改 |
| 非交互模式 | `--non-interactive` / `-n` | N/A | `--non-interactive` / `-n` | 无用户交互，自动处理 |
| 预演模式 | `--dry-run` / `-d` | `-DryRun` | `--dry-run` / `-d` | 预览操作，不实际执行 |
| 日志文件 | N/A | `-LogFile "path"` | N/A | 记录详细日志 |
| 帮助 | `--help` / `-h` | N/A | `--help` / `-h` | 显示帮助信息 |

### 平台选择建议

- **Linux/Mac**: 使用 `git-safe-sync.sh` (功能最丰富)
- **Windows PowerShell**: 使用 `git-safe-sync.ps1` (推荐)
- **Windows CMD**: 使用 `git-safe-sync.bat` (兼容性最佳)

## 🛡️ 安全特性

### 自动备份机制
- 每次操作前创建本地备份标签
- 支持快速恢复: `git reset --hard backup_TIMESTAMP`
- 自动清理旧备份 (保留最近10个)

### 错误处理
- 完整的网络连接检查
- 合并冲突检测和指导
- 详细的故障排除建议
- 操作失败时的恢复方案

### 质量保障
- 自动检测未提交更改
- 支持强制质量门禁检查
- 与 `scripts/ci-quality-check.sh` 集成

## 📊 监控和诊断

### 高级监控工具 (已移至 `scripts/tools`)
- `ai-git-sync-monitor.js`: AI 智能同步监控器
- `git-hooks-monitor.sh`: Git hooks 质量门禁监控

### 状态检查
```bash
# 查看 Git 状态
git status

# 查看同步历史
git log --oneline -10

# 查看备份标签
git tag -l "backup_*" --sort=-creatordate | head -5
```

## 🔧 故障排除

### 常见问题

1. **网络连接问题**:
   ```bash
   # 测试连接
   git ls-remote --heads origin
   ```

2. **权限问题**:
   ```bash
   # 检查 SSH 密钥
   ssh -T git@github.com
   ```

3. **合并冲突**:
   ```bash
   # 查看冲突文件
   git status
   
   # 使用备份恢复
   git reset --hard backup_TIMESTAMP
   ```

4. **Hook 失效**:
   ```bash
   # 检查 Hook 状态
   bash scripts/tools/git-hooks-monitor.sh
   ```

## 📚 相关文档

- [项目开发规范总览](../../docs/项目开发规范总览.md)
- [Git 配置指南](../../docs/ci-cd/Git钩子使用指南.md)
- [质量门禁配置](../../docs/ci-cd/质量门禁配置说明.md)
- [环境变量配置](../../docs/environment-variables.md)

## 🎯 最佳实践

1. **定期同步**: 建议每30分钟或重要开发节点执行同步
2. **使用非交互模式**: CI/CD 环境中务必使用 `--non-interactive` 参数
3. **备份意识**: 重要操作前手动创建备份标签
4. **配置检查**: 新环境首次使用前运行配置检查
5. **错误处理**: 遇到错误时仔细阅读提示信息和修复建议

---

**维护**: SmartAbp 开发团队  
**更新日期**: 2025-09-29  
**版本**: v2.0 企业级版本
