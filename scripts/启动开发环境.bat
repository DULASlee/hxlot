@echo off
setlocal
title SmartAbp Development Environment Launcher
color 0F

REM --- 确保脚本从项目根目录运行 (脚本文件所在目录的上一级)
cd /d "%~dp0..\"

echo ========================================
echo    SmartAbp 企业级开发环境启动器
echo ========================================
echo.
echo 正在准备启动开发环境...
echo 当前工作目录: %cd%
echo.

REM --- 环境检查 ---
if not exist "src\SmartAbp.Web" (
    echo [错误] 后端项目目录 "src\SmartAbp.Web" 不存在!
    goto :error
)
if not exist "src\SmartAbp.Vue" (
    echo [错误] 前端项目目录 "src\SmartAbp.Vue" 不存在!
    goto :error
)

echo [1/3] 检查前端依赖...
if not exist "src\SmartAbp.Vue\node_modules" (
    echo [警告] 未在 "src\SmartAbp.Vue" 目录中找到 node_modules。
    echo      请先在该目录手动运行 "npm install" 安装依赖。
    echo      脚本将继续，但前端服务可能启动失败。
) else (
    echo      前端依赖检查通过。
)
echo.

echo [2/3] 启动后端服务 (ASP.NET Core)...
start "SmartAbp Backend" cmd /k "title SmartAbp Backend && cd /d src\SmartAbp.Web && dotnet run --urls=https://localhost:44379"

echo      等待后端服务预热 (10 秒)...
timeout /t 10 /nobreak > nul
echo.

echo [3/3] 启动前端服务 (Vue.js)...
start "SmartAbp Frontend" cmd /k "title SmartAbp Frontend && cd /d src\SmartAbp.Vue && npm run dev"

echo.
echo ========================================
echo      开发环境启动指令已发出!
echo ========================================
echo.
echo 请在新打开的 "SmartAbp Backend" 和 "SmartAbp Frontend" 窗口中查看服务状态。
echo.
echo 后端服务: https://localhost:44379
echo 前端服务: http://localhost:11369
echo.
echo 默认登录信息:
echo 租户: 留空 (主机租户)
echo 用户名: admin
echo 密码: 1q2w3E*
echo.
goto :eof

:error
echo.
echo [致命错误] 脚本因环境检查失败而中止。请修复问题后重试。
echo.

:eof
echo 按任意键退出此启动器...
pause > nul
