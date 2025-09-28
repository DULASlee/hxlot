# SmartAbp Git 企业级版本管理脚本

## 🎯 概述

这是一套企业级的Git版本管理自动化脚本，实现**安全的备份→拉取→合并→推送**工作流程，确保代码仓库的完整性和团队协作的高效性。

## 📋 功能特性

### ✅ 核心功能
- **🛡️ 自动备份**: 在任何操作前创建本地标签备份
- **📥 智能拉取**: 获取并显示远程更新概要
- **🔄 安全合并**: 自动合并远程更改，冲突时提供详细指导
- **📤 智能推送**: 推送本地提交到远程仓库
- **🧹 备份清理**: 自动清理旧备份，保留最近10个

### 🔒 安全保障
- **冲突检测**: 自动检测并处理Git合并冲突
- **状态验证**: 操作前检查工作区状态
- **回滚机制**: 提供详细的备份恢复指令
- **错误处理**: 完善的错误处理和用户指导

### 📊 智能特性
- **统计报告**: 详细的同步统计和操作日志
- **彩色输出**: 清晰的彩色命令行界面
- **进度提示**: 6步骤清晰的执行流程
- **环境检测**: 自动检测Git环境和仓库状态

## 🚀 脚本版本

### 1. Windows批处理版本 (`git-safe-sync.bat`)
```bash
# 直接运行
scripts\git-safe-sync.bat

# 特性
- Windows 命令提示符兼容
- 彩色输出界面
- 自动环境检测
- 详细的错误提示
```

### 2. Unix/Linux Shell版本 (`git-safe-sync.sh`)
```bash
# 设置执行权限
chmod +x scripts/git-safe-sync.sh

# 运行脚本
./scripts/git-safe-sync.sh

# 特性
- 跨平台兼容 (Linux/macOS)
- ANSI彩色输出
- 完善的错误处理
- 符合Unix标准
```

### 3. PowerShell增强版本 (`git-safe-sync.ps1`)
```powershell
# 基本运行
.\scripts\git-safe-sync.ps1

# 高级参数
.\scripts\git-safe-sync.ps1 -AutoCommit -Verbose -LogFile "sync.log"

# 预演模式 (不执行实际操作)
.\scripts\git-safe-sync.ps1 -DryRun

# 参数说明
-AutoCommit  # 自动提交本地更改，无需交互
-Verbose     # 详细输出模式
-LogFile     # 指定日志文件路径
-DryRun      # 预演模式，显示将要执行的操作但不实际执行
```

## 📖 使用指南

### 🛠️ 安装配置

1. **下载脚本到项目根目录的scripts文件夹**
2. **设置执行权限** (Unix/Linux)：
   ```bash
   chmod +x scripts/git-safe-sync.sh
   ```
3. **PowerShell执行策略** (Windows)：
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### 🎯 日常使用

#### 基本同步操作
```bash
# Windows
scripts\git-safe-sync.bat

# Linux/macOS  
./scripts/git-safe-sync.sh

# PowerShell
.\scripts\git-safe-sync.ps1
```

#### 自动化场景
```bash
# 自动提交未暂存的更改
.\scripts\git-safe-sync.ps1 -AutoCommit

# 带日志记录的同步
.\scripts\git-safe-sync.ps1 -LogFile "daily-sync.log"

# 预览模式（查看将要执行的操作）
.\scripts\git-safe-sync.ps1 -DryRun
```

### 📅 定期执行

#### Windows任务计划程序
```xml
<!-- 创建每日自动同步任务 -->
任务名称: SmartAbp Git Sync
触发器: 每日 09:00
操作: 运行程序
程序: powershell.exe
参数: -File "D:\Projects\SmartAbp\scripts\git-safe-sync.ps1" -AutoCommit -LogFile "auto-sync.log"
```

#### Linux/macOS Crontab
```bash
# 编辑crontab
crontab -e

# 添加每日9点自动同步
0 9 * * * cd /path/to/smartabp && ./scripts/git-safe-sync.sh >> sync.log 2>&1
```

## 🔧 工作流程详解

### 执行步骤
```
[1/6] 环境检查
├── 验证Git安装
├── 检查Git仓库
└── 确认项目目录

[2/6] 本地状态检查  
├── 检测未提交更改
├── 可选自动提交
└── 验证工作区状态

[3/6] 创建本地备份
├── 生成时间戳标签
├── 保存分支信息
└── 创建备份文件

[4/6] 拉取远程更新
├── 获取远程信息
├── 分析提交差异
└── 显示更新概要

[5/6] 合并远程更新
├── 智能合并策略
├── 冲突检测处理
└── 合并结果验证

[6/6] 推送到远程仓库
├── 检查本地提交
├── 推送到远程
└── 验证推送结果
```

### 备份机制
```
备份标签格式: backup_20241223_143025
备份信息文件:
├── backup_20241223_143025_branch.txt  # 当前分支
├── backup_20241223_143025_head.txt    # 当前HEAD
└── Git标签: backup_20241223_143025    # Git标签备份点
```

## 🚨 故障排除

### 常见问题

#### 1. 合并冲突
```
[ERROR] 合并失败! 可能存在冲突

解决步骤:
1. git status                    # 查看冲突文件
2. 手动编辑冲突文件               # 解决冲突内容
3. git add .                     # 标记已解决
4. git commit                    # 完成合并提交
5. 重新运行同步脚本               # 继续同步流程

备份恢复:
git reset --hard backup_20241223_143025
```

#### 2. 网络连接问题
```
[ERROR] 推送失败!

可能解决方案:
1. 检查网络连接到GitHub
2. 验证SSH密钥或HTTPS认证
3. 检查远程仓库URL配置
4. 使用VPN或代理
```

#### 3. 权限问题
```
[ERROR] Git未安装或不在PATH中!

解决方案:
1. 安装Git: https://git-scm.com
2. 添加Git到系统PATH
3. 重启命令行终端
4. 验证: git --version
```

### 恢复操作

#### 从备份恢复
```bash
# 查看可用备份
git tag -l "backup_*" --sort=-creatordate

# 恢复到指定备份点
git reset --hard backup_20241223_143025

# 强制推送 (慎用)
git push origin main --force
```

#### 清理损坏状态
```bash
# 重置到远程状态
git fetch origin
git reset --hard origin/main

# 清理未跟踪文件
git clean -fd
```

## 📈 高级功能

### 日志记录
```powershell
# 启用详细日志
.\git-safe-sync.ps1 -LogFile "sync-$(Get-Date -Format 'yyyyMMdd').log" -Verbose

# 日志格式
[2024-12-23 14:30:25] [Info] 项目根目录: D:\SmartAbp
[2024-12-23 14:30:26] [Success] Git环境检查通过 ✓
[2024-12-23 14:30:27] [Info] 📥 发现 3 个远程提交需要合并
```

### 自定义配置
```bash
# 修改备份保留数量 (在脚本中)
BACKUP_RETENTION=20  # 保留20个备份

# 修改合并策略
git config merge.tool vimdiff  # 设置合并工具
```

### 集成CI/CD
```yaml
# GitHub Actions示例
name: Auto Sync
on:
  schedule:
    - cron: '0 9 * * *'  # 每日9点
  
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Git Sync
        run: ./scripts/git-safe-sync.sh
```

## 🎯 最佳实践

### 使用建议
1. **定期执行**: 建议每日至少同步一次
2. **提交规范**: 保持良好的提交信息格式
3. **分支管理**: 主要在main/master分支使用
4. **备份监控**: 定期检查备份标签数量
5. **日志审查**: 查看同步日志识别潜在问题

### 团队协作
1. **统一脚本**: 团队成员使用相同版本脚本
2. **约定时间**: 避免同时推送造成冲突
3. **冲突处理**: 建立冲突解决流程和责任人
4. **备份策略**: 重要分支创建额外备份

## 🔐 安全注意事项

1. **敏感信息**: 确保不提交密码、API密钥等敏感信息
2. **权限控制**: 限制脚本执行权限，避免误操作
3. **备份清理**: 定期清理本地备份，避免磁盘空间问题
4. **审计日志**: 保留操作日志用于问题追踪

## 📞 技术支持

如遇到问题，请提供以下信息：
- 操作系统版本
- Git版本 (`git --version`)
- 错误信息截图
- 操作日志文件

**联系方式**: 技术支持团队
**文档版本**: v1.0
**最后更新**: 2024-12-23
