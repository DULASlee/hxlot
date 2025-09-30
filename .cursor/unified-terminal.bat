@echo off
REM SmartAbp 统一终端配置 - Windows CMD版本
REM 基于 .cursor/env-vars.json 配置，确保与PowerShell/Bash完全一致
REM 版本: v2.1
REM 更新日期: 2025-09-30

REM 统一编码配置
chcp 65001 >nul
set LANG=C.UTF-8
set LC_ALL=C.UTF-8
set LESSCHARSET=utf-8
set TERM=xterm-256color

REM 统一分页器配置
set PAGER=cat
set MANPAGER=cat
set LESS=
set SYSTEMD_PAGER=
set GIT_PAGER=cat

REM 统一MSYS配置
set MSYS_NO_PATHCONV=1
set MSYS2_ARG_CONV_EXCL=*

REM SmartAbp 项目特定环境变量
set SMARTABP_PROJECT_ROOT=%CD%
set SMARTABP_QUALITY_THRESHOLD=95

REM 设置窗口标题
title SmartAbp - 统一CMD终端 v2.1

REM CMD 统一别名（通过doskey）
doskey ll=dir $*
doskey la=dir /a $*
doskey l=dir $*

REM Git 统一别名
doskey gs=git status --short
doskey gl=git log --oneline --graph --decorate --all -10
doskey gd=git --no-pager diff $*
doskey gb=git --no-pager branch $*

REM dotnet 统一别名
doskey dnr=dotnet run $*
doskey dnb=dotnet build $*
doskey dnt=dotnet test $*

REM SmartAbp 专用别名 (符合架构铁律-质量门禁要求)
doskey smartabp-sync=bash scripts/git/git-safe-sync.sh --non-interactive --auto-commit
doskey smartabp-check=bash scripts/ci-quality-check.sh
doskey smartabp-dev=powershell scripts/dev/start-dev.ps1

REM 快速导航别名
doskey smartabp-vue=cd src\SmartAbp.Vue
doskey smartabp-packages=cd src\SmartAbp.Vue\packages
doskey smartabp-backend=cd src\SmartAbp.Application

REM 质量检查别名
doskey smartabp-lint=cd src\SmartAbp.Vue ^&^& npm run lint ^&^& cd ..\..
doskey smartabp-type=cd src\SmartAbp.Vue ^&^& npm run type-check ^&^& cd ..\..
doskey smartabp-build=cd src\SmartAbp.Vue ^&^& npm run build ^&^& cd ..\..

echo.
echo ✅ SmartAbp 统一CMD终端配置已加载 (v2.1)
echo 📁 项目根目录: %SMARTABP_PROJECT_ROOT%
echo 🎯 质量阈值: %SMARTABP_QUALITY_THRESHOLD% 分
echo.
echo 💡 可用的SmartAbp命令:
echo    • smartabp-sync      - Git安全同步
echo    • smartabp-check     - 质量检查
echo    • smartabp-dev       - 启动开发环境
echo    • smartabp-vue       - 进入Vue项目目录
echo    • smartabp-packages  - 进入packages目录
echo    • smartabp-lint      - 运行ESLint检查
echo    • smartabp-type      - 运行TypeScript类型检查
echo.
