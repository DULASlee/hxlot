# Cursor IDE 配置修复指南

## 问题
Cursor IDE 的集成终端中，Git 命令和其他需要分页器的命令会卡死在分页器界面。

## 解决方案

### 1. 自动配置（推荐）
配置已自动应用，每次打开新终端会自动加载：
```bash
source .cursor/shell-config.sh
```

### 2. 手动配置
如需手动配置，运行以下命令：
```bash
# 设置环境变量
export PAGER=cat
export GIT_PAGER=cat
export MANPAGER=cat
export SYSTEMD_PAGER=""

# Git 全局配置
git config --global core.pager "cat"
```

### 3. 配置文件说明

- **shell-config.sh**: Shell 环境配置，包含别名和环境变量
- **terminal-settings.json**: Cursor IDE 终端配置建议
- **README-cursor-config.md**: 本配置说明文档

### 4. 验证配置
测试以下命令确保不会卡死：
```bash
git log --oneline -5    # 应该直接显示，不进入分页器
git status              # 正常显示状态
git diff                # 正常显示差异
```

### 5. 有用的别名
配置包含以下便捷别名：
```bash
gs    # git status --short
gl    # git log --oneline --graph --decorate --all -10
gd    # git diff --no-pager
gb    # git branch --no-pager
dnr   # dotnet run
dnb   # dotnet build
dnt   # dotnet test
```

## 重要提示
- 此配置专门针对 Cursor IDE 集成终端优化
- 配置会在每次启动新终端时自动加载
- 如遇问题，可以重新运行 `source .cursor/shell-config.sh`
