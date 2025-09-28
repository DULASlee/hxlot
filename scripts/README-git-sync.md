# Git自动同步脚本使用说明

## 脚本概述

本目录包含两个Git自动同步脚本，用于安全地备份本地版本、拉取远程更新并同步到远程仓库。

## 脚本文件

### 1. `git-auto-sync.ps1` (PowerShell版本 - 推荐)
功能完整的PowerShell脚本，支持高级功能和错误处理。

### 2. `git-sync-simple.bat` (批处理版本)
简化版本，适合快速使用。

## 使用方法

### PowerShell脚本使用

```powershell
# 基本使用
.\scripts\git-auto-sync.ps1

# 指定远程仓库名称和分支
.\scripts\git-auto-sync.ps1 -RemoteName "origin" -MainBranch "main"

# 强制执行（跳过工作区检查）
.\scripts\git-auto-sync.ps1 -Force
```

### 批处理脚本使用

```cmd
# 直接运行
.\scripts\git-sync-simple.bat
```

## 脚本执行流程

1. **环境检查**
   - 验证当前目录是Git仓库
   - 检查工作区状态

2. **备份创建**
   - 创建时间戳命名的备份分支
   - 格式：`backup-YYYYMMDD-HHMMSS`

3. **分支管理**
   - 切换到主分支（默认main）
   - 如果主分支不存在则创建

4. **远程同步**
   - 获取远程更新 (`git fetch`)
   - 合并远程更改 (`git merge`)
   - 推送到远程 (`git push`)

5. **冲突处理**
   - 自动检测合并冲突
   - 提供手动解决指导

6. **清理选项**
   - 可选择删除备份分支

## 安全特性

- ✅ **自动备份**: 每次同步前创建备份分支
- ✅ **状态检查**: 检查未提交更改
- ✅ **冲突检测**: 自动检测并提示解决冲突
- ✅ **错误处理**: 完整的错误处理和回滚机制
- ✅ **用户确认**: 关键操作需要用户确认

## 常见使用场景

### 场景1: 日常同步
```powershell
# 每日工作开始前同步
.\scripts\git-auto-sync.ps1
```

### 场景2: 团队协作
```powershell
# 推送前先同步远程更改
.\scripts\git-auto-sync.ps1
```

### 场景3: 紧急备份
```powershell
# 强制备份当前状态
.\scripts\git-auto-sync.ps1 -Force
```

## 故障排除

### 问题1: 合并冲突
```
⚠️  合并过程中出现冲突
```
**解决方案:**
1. 手动编辑冲突文件
2. 运行 `git add .`
3. 运行 `git commit -m "Resolve merge conflicts"`
4. 运行 `git push origin main`

### 问题2: 远程分支不存在
```
⚠️  远程分支 origin/main 不存在
```
**解决方案:**
脚本会提示是否创建远程分支，选择 'y' 即可。

### 问题3: 权限问题
```
❌ 推送到远程失败
```
**解决方案:**
1. 检查Git凭据
2. 确认仓库推送权限
3. 检查网络连接

## 备份分支管理

### 查看所有备份分支
```bash
git branch | grep backup-
```

### 删除旧备份分支
```bash
# 删除特定备份分支
git branch -d backup-20241228-143022

# 批量删除7天前的备份分支
git for-each-ref --format='%(refname:short) %(committerdate)' refs/heads/backup-* | 
awk '$2 < "'$(date -d '7 days ago' '+%Y-%m-%d')'"' | 
cut -d' ' -f1 | 
xargs -r git branch -d
```

## 配置建议

### 设置Git别名
```bash
# 添加到 ~/.gitconfig
[alias]
    sync = "!powershell -ExecutionPolicy Bypass -File ./scripts/git-auto-sync.ps1"
    quick-sync = "!./scripts/git-sync-simple.bat"
```

使用别名：
```bash
git sync
git quick-sync
```

### PowerShell执行策略
如果遇到执行策略问题：
```powershell
# 临时允许脚本执行
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# 或者直接运行
powershell -ExecutionPolicy Bypass -File .\scripts\git-auto-sync.ps1
```

## 注意事项

1. **备份重要性**: 脚本会自动创建备份，但建议定期清理旧备份分支
2. **网络要求**: 需要稳定的网络连接访问远程仓库
3. **权限要求**: 需要对远程仓库有推送权限
4. **冲突处理**: 遇到复杂冲突时建议手动处理
5. **定期维护**: 建议定期检查和清理备份分支

## 版本历史

- v1.0: 初始版本，基本同步功能
- v1.1: 添加备份机制和错误处理
- v1.2: 增强用户交互和冲突处理