@echo off
REM SmartAbp 统一终端配置 - Windows CMD版本
REM 基于 .cursor/env-vars.json 配置，确保与PowerShell/Bash完全一致
REM 版本: v2.2
REM 更新日期: 2025-01-02

REM 统一编码配置（增强错误处理）
chcp 65001 >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ 编码设置失败，继续使用默认编码
)

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

REM 设置窗口标题（增强错误处理）
title SmartAbp - 统一CMD终端 v2.2 2>nul || echo ⚠️ 窗口标题设置失败

REM CMD 统一别名（通过doskey，增强错误处理）
doskey ll=dir $* 2>nul || echo ⚠️ ll别名设置失败
doskey la=dir /a $* 2>nul || echo ⚠️ la别名设置失败
doskey l=dir $* 2>nul || echo ⚠️ l别名设置失败

REM Git 统一别名（增强错误处理）
doskey gs=git status --short $* 2>nul || echo ⚠️ gs别名设置失败
doskey gl=git log --oneline --graph --decorate --all -10 $* 2>nul || echo ⚠️ gl别名设置失败
doskey gd=git --no-pager diff $* 2>nul || echo ⚠️ gd别名设置失败
doskey gb=git --no-pager branch $* 2>nul || echo ⚠️ gb别名设置失败

REM dotnet 统一别名（增强错误处理）
doskey dnr=dotnet run $* 2>nul || echo ⚠️ dnr别名设置失败
doskey dnb=dotnet build $* 2>nul || echo ⚠️ dnb别名设置失败
doskey dnt=dotnet test $* 2>nul || echo ⚠️ dnt别名设置失败

REM SmartAbp 专用别名 (符合架构铁律-质量门禁要求)
doskey smartabp-sync=echo 🔄 检查Git同步脚本... ^&^& if exist "scripts\git\git-safe-sync.bat" (echo 🚀 使用批处理版本同步... ^&^& call scripts\git\git-safe-sync.bat) else (echo ❌ 未找到Git同步脚本: scripts\git\git-safe-sync.bat ^&^& echo 💡 可用的替代方案: ^&^& echo    • git add . ^&^& git commit -m "Auto commit" ^&^& git push) 2>nul || echo ⚠️ smartabp-sync别名设置失败

doskey smartabp-check=echo 🔍 检查质量检查脚本... ^&^& if exist "scripts\ci-quality-check.sh" (echo 🔍 使用CI质量检查脚本... ^&^& bash scripts\ci-quality-check.sh) else (echo 📋 手动质量检查选项（符合架构铁律）: ^&^& echo 1. cd src\SmartAbp.Vue ^&^& npm run type-check ^&^& echo 2. dotnet build ^&^& echo 3. cd src\SmartAbp.Vue ^&^& npm run lint) 2>nul || echo ⚠️ smartabp-check别名设置失败

doskey smartabp-dev=echo 🚀 启动SmartAbp开发环境... ^&^& echo 🔍 检查开发启动脚本... ^&^& if exist "scripts\dev\start-dev.bat" (call scripts\dev\start-dev.bat) else (echo ❌ 未找到开发启动脚本 ^&^& echo 💡 手动启动选项: ^&^& echo    • cd src\SmartAbp.Vue ^&^& npm run dev ^&^& echo    • dotnet run --project src\SmartAbp.Web) 2>nul || echo ⚠️ smartabp-dev别名设置失败

REM 快速导航别名（增强错误处理）
doskey smartabp-vue=if exist "src\SmartAbp.Vue" (cd src\SmartAbp.Vue ^&^& echo ✅ 已进入Vue项目目录) else (echo ❌ Vue项目目录不存在: src\SmartAbp.Vue) 2>nul || echo ⚠️ smartabp-vue别名设置失败

doskey smartabp-packages=if exist "src\SmartAbp.Vue\packages" (cd src\SmartAbp.Vue\packages ^&^& echo ✅ 已进入packages目录) else (echo ❌ packages目录不存在: src\SmartAbp.Vue\packages) 2>nul || echo ⚠️ smartabp-packages别名设置失败

doskey smartabp-backend=if exist "src\SmartAbp.Application" (cd src\SmartAbp.Application ^&^& echo ✅ 已进入后端应用目录) else (echo ❌ 后端应用目录不存在: src\SmartAbp.Application) 2>nul || echo ⚠️ smartabp-backend别名设置失败

REM 质量检查别名（增强错误处理）
doskey smartabp-lint=if exist "src\SmartAbp.Vue" (cd src\SmartAbp.Vue ^&^& echo 🔍 运行ESLint检查... ^&^& npm run lint ^&^& cd ..\..) else (echo ❌ Vue项目目录不存在: src\SmartAbp.Vue) 2>nul || echo ⚠️ smartabp-lint别名设置失败

doskey smartabp-type=if exist "src\SmartAbp.Vue" (cd src\SmartAbp.Vue ^&^& echo 🔍 运行TypeScript类型检查... ^&^& npm run type-check ^&^& cd ..\..) else (echo ❌ Vue项目目录不存在: src\SmartAbp.Vue) 2>nul || echo ⚠️ smartabp-type别名设置失败

doskey smartabp-build=if exist "src\SmartAbp.Vue" (cd src\SmartAbp.Vue ^&^& echo 🔨 运行前端构建... ^&^& npm run build ^&^& cd ..\..) else (echo ❌ Vue项目目录不存在: src\SmartAbp.Vue) 2>nul || echo ⚠️ smartabp-build别名设置失败

echo.
echo ✅ SmartAbp 统一CMD终端配置已加载 (v2.2)
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
echo 🔧 配置版本: v2.2
echo 📅 更新日期: 2025-01-02
echo.