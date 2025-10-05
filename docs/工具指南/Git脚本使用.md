# SmartAbp Git版本管理脚本使用说明

## 📋 概述

SmartAbp项目提供了一套企业级的Git版本管理自动化脚本，实现**安全备份→拉取更新→智能合并→推送同步**的完整工作流程，确保团队协作的高效性和代码仓库的完整性。

## 🎯 核心特性

### ✅ 主要功能
- **🛡️ 自动备份**: 操作前创建Git标签备份点，支持完整回滚
- **📥 智能拉取**: 获取并分析远程更新，显示详细变更概要
- **🔄 安全合并**: 自动合并远程更改，冲突时提供专业指导
- **📤 智能推送**: 推送本地提交到远程仓库，保持同步
- **🧹 自动清理**: 自动清理旧备份标签，保留最近10个

### 🔒 安全保障
- **冲突检测**: 自动检测并处理Git合并冲突
- **状态验证**: 操作前检查工作区和暂存区状态
- **回滚机制**: 提供详细的备份恢复指令
- **错误处理**: 完善的错误处理和用户指导

## 🚀 脚本版本

项目提供三个版本的脚本，适应不同的运行环境：

### 1. Shell脚本 (`git-safe-sync.sh`) - **推荐Linux/macOS**
```bash
# 基本使用
./scripts/git-safe-sync.sh

# 无交互模式 (推荐CI/CD)
./scripts/git-safe-sync.sh --non-interactive

# 预演模式 (查看将要执行的操作)
./scripts/git-safe-sync.sh --dry-run

# 查看帮助
./scripts/git-safe-sync.sh --help
```

### 2. PowerShell脚本 (`git-safe-sync.ps1`) - **推荐Windows**
```powershell
# 基本使用
.\scripts\git-safe-sync.ps1

# 自动提交模式 (推荐日常使用)
.\scripts\git-safe-sync.ps1 -AutoCommit

# 预演模式
.\scripts\git-safe-sync.ps1 -DryRun

# 带日志记录
.\scripts\git-safe-sync.ps1 -AutoCommit -LogFile "sync.log"

# 查看帮助
Get-Help .\scripts\git-safe-sync.ps1
```

### 3. Windows批处理脚本 (`git-safe-sync.bat`) - **Windows命令行**
```cmd
REM 基本使用
scripts\git-safe-sync.bat

REM 无交互模式
scripts\git-safe-sync.bat -n

REM 自动提交模式
scripts\git-safe-sync.bat -a

REM 预演模式
scripts\git-safe-sync.bat -d

REM 查看帮助
scripts\git-safe-sync.bat --help
```

## 📖 详细使用指南

### 🛠️ 环境准备

#### 1. Linux/macOS环境
```bash
# 设置执行权限
chmod +x scripts/git-safe-sync.sh

# 验证Git环境
git --version
```

#### 2. Windows PowerShell环境
```powershell
# 设置执行策略（首次运行）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 验证PowerShell版本（需要5.1+）
$PSVersionTable.PSVersion
```

#### 3. Windows命令提示符
```cmd
REM 验证Git安装
git --version

REM 确保在项目根目录运行
cd D:\YourProject\SmartAbp
```

### 🎯 常用场景

#### **场景1: 日常代码同步**
```bash
# Linux/macOS - 自动化同步
./scripts/git-safe-sync.sh --non-interactive

# Windows - PowerShell自动同步
.\scripts\git-safe-sync.ps1 -AutoCommit
```

#### **场景2: 安全预览操作**
```bash
# 预演模式 - 查看将要执行的操作，不实际执行
./scripts/git-safe-sync.sh --dry-run
.\scripts\git-safe-sync.ps1 -DryRun
```

#### **场景3: 有本地未提交更改**
```bash
# 自动提交本地更改
./scripts/git-safe-sync.sh --auto-commit
.\scripts\git-safe-sync.ps1 -AutoCommit

# 或者手动处理
git add .
git commit -m "描述你的更改"
# 然后运行同步脚本
```

#### **场景4: CI/CD自动化集成**
```bash
# 完全无人值守模式
./scripts/git-safe-sync.sh --non-interactive --auto-commit

# 带日志记录
.\scripts\git-safe-sync.ps1 -AutoCommit -LogFile "build-sync.log"
```

## 🔧 工作流程详解

脚本执行的完整6步流程：

### [1/6] 环境检查
- ✅ 验证Git是否正确安装
- ✅ 检查当前目录是否为Git仓库
- ✅ 确认项目根目录位置

### [2/6] 本地状态检查
- ✅ 检测工作区未提交的更改
- ✅ 检测暂存区状态
- ✅ 可选择自动提交或手动处理

### [3/6] 创建本地备份
- ✅ 生成时间戳备份标签 `backup_20241223_143025`
- ✅ 保存当前分支和HEAD信息
- ✅ 创建可回滚的安全点

### [4/6] 拉取远程更新
- ✅ 获取远程仓库最新信息
- ✅ 分析本地与远程的提交差异
- ✅ 显示远程更新概要

### [5/6] 智能合并远程更新
- ✅ 使用merge策略保留完整历史
- ✅ 自动检测并处理合并冲突
- ✅ 提供详细的冲突解决指导

### [6/6] 推送到远程仓库
- ✅ 检查本地待推送的提交
- ✅ 推送到远程仓库
- ✅ 验证推送结果

## 🚨 故障排除

### 常见问题及解决方案

#### 1. 合并冲突
```
[错误] 合并失败! 可能存在冲突

解决步骤:
1. git status                    # 查看冲突文件
2. 手动编辑冲突文件              # 解决<<<< >>>> 标记的冲突
3. git add .                     # 标记冲突已解决
4. git commit                    # 完成合并提交
5. 重新运行同步脚本              # 继续同步流程

备份恢复:
git reset --hard backup_20241223_143025
```

#### 2. 网络连接问题
```
[错误] 推送失败! 无法连接到远程仓库

可能解决方案:
1. 检查网络连接到GitHub
2. 验证SSH密钥或HTTPS认证
   git config --list | grep user
3. 检查远程仓库URL配置
   git remote -v
4. 尝试使用VPN或代理
```

#### 3. 权限问题
```
[错误] Git未安装或不在PATH中

解决方案:
1. 安装Git: https://git-scm.com/downloads
2. 将Git添加到系统PATH环境变量
3. 重启命令行终端
4. 验证安装: git --version
```

#### 4. PowerShell执行策略问题
```powershell
# 错误: 无法执行脚本，因为在此系统上禁止运行脚本
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 验证策略设置
Get-ExecutionPolicy -List
```

### 🔄 备份恢复操作

#### 查看可用备份
```bash
# 查看所有备份标签
git tag -l "backup_*" --sort=-creatordate

# 输出示例:
# backup_20241223_143025
# backup_20241223_120430
# backup_20241222_173215
```

#### 恢复到备份点
```bash
# 恢复到指定备份点
git reset --hard backup_20241223_143025

# 如果需要强制推送到远程 (谨慎使用)
git push origin main --force
```

#### 清理损坏状态
```bash
# 完全重置到远程状态
git fetch origin
git reset --hard origin/main

# 清理未跟踪文件
git clean -fd
```

## 📅 定期执行设置

### Linux/macOS - Crontab设置
```bash
# 编辑crontab
crontab -e

# 添加每日9点自动同步
0 9 * * * cd /path/to/smartabp && ./scripts/git-safe-sync.sh --non-interactive >> sync.log 2>&1

# 添加每周一9点自动同步
0 9 * * 1 cd /path/to/smartabp && ./scripts/git-safe-sync.sh --non-interactive
```

### Windows - 任务计划程序
```xml
任务名称: SmartAbp Git Sync
触发器: 每日上午9:00
操作: 启动程序
  程序/脚本: powershell.exe
  添加参数: -File "D:\Projects\SmartAbp\scripts\git-safe-sync.ps1" -AutoCommit -LogFile "auto-sync.log"
  起始于: D:\Projects\SmartAbp
```

### GitHub Actions集成
```yaml
# .github/workflows/auto-sync.yml
name: Auto Git Sync
on:
  schedule:
    - cron: '0 9 * * *'  # 每日9点UTC
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Run Git Sync
        run: |
          chmod +x scripts/git-safe-sync.sh
          ./scripts/git-safe-sync.sh --non-interactive
```

## 📊 输出示例

### 成功执行示例
```
========================================
   SmartAbp 企业级Git安全同步工具
========================================

功能: 备份 → 拉取 → 合并 → 推送
时间: 2024-12-23 14:30:25
模式: 非交互模式

[1/6] 环境检查... ✅ Git环境检查通过
[2/6] 检查本地Git状态... ✅ 本地工作区干净
[3/6] 创建本地Git备份... ✅ 备份已创建: backup_20241223_143025
[4/6] 拉取远程仓库更新... 📥 发现 3 个远程提交需要合并
[5/6] 合并远程更新到本地... ✅ 远程更新合并成功
[6/6] 推送合并后版本... 📤 推送 2 个本地提交成功

========================================
          🎉 Git同步完成!
========================================

📊 同步统计:
   📥 远程提交合并: 3 个
   📤 本地提交推送: 2 个
   💾 备份标签: backup_20241223_143025
   🌿 当前分支: main
   🔄 同步结果: 本地与远程仓库完全同步
   ⏰ 完成时间: 2024-12-23 14:30:45

🧹 清理旧备份 (保留最近10个)...
✅ Git同步脚本执行完成!
```

## 🎯 最佳实践

### 使用建议
1. **定期执行**: 建议每日至少同步一次，避免冲突累积
2. **提交规范**: 保持良好的提交信息格式和原子性提交
3. **分支管理**: 主要在main/master分支使用，功能分支手动管理
4. **备份监控**: 定期检查备份标签数量，确保清理机制正常
5. **日志审查**: 查看同步日志识别潜在问题

### 团队协作
1. **统一脚本**: 团队成员使用相同版本的脚本
2. **约定时间**: 避免多人同时推送造成冲突
3. **冲突处理**: 建立冲突解决流程和责任人制度
4. **权限管理**: 确保所有成员都有仓库的推送权限

### 安全注意事项
1. **敏感信息**: 确保不提交密码、API密钥等敏感信息
2. **备份验证**: 定期验证备份标签的有效性
3. **权限控制**: 限制脚本执行权限，避免误操作
4. **审计日志**: 保留操作日志用于问题追踪和审计

## 📞 技术支持

### 获取帮助
```bash
# 查看脚本内置帮助
./scripts/git-safe-sync.sh --help
.\scripts\git-safe-sync.ps1 -?
scripts\git-safe-sync.bat --help
```

### 报告问题
如遇到问题，请提供以下信息：
- 操作系统版本和环境
- Git版本 (`git --version`)
- 脚本版本和执行参数
- 完整的错误信息和日志
- 问题复现步骤

### 联系方式
- **技术文档**: `scripts/README-Git-Scripts.md`
- **项目仓库**: GitHub Issues
- **团队支持**: SmartAbp开发团队

---

**📝 文档版本**: v1.0
**🗓️ 最后更新**: 2024-12-23
**👥 维护团队**: SmartAbp开发团队
