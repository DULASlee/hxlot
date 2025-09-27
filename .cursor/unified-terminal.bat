@echo off
REM SmartAbp 统一终端配置 - Windows CMD版本
REM 基于 .cursor/env-vars.json 配置，确保与PowerShell/Bash完全一致

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

REM 设置窗口标题
title SmartAbp - 统一CMD终端

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

REM SmartAbp 专用别名
doskey smartabp-sync=bash scripts/git-safe-sync.sh --non-interactive --auto-commit
doskey smartabp-check=bash scripts/ci-quality-check.sh
doskey smartabp-dev=powershell scripts/start-dev.ps1

echo ✅ SmartAbp 统一CMD终端配置已加载
