@echo off
chcp 65001 > nul
setlocal

echo ========================================
echo    SmartAbp 企业级用户登录系统
echo ========================================
echo.

REM 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "BACKEND_PATH=%PROJECT_ROOT%\src\SmartAbp.Web"
set "FRONTEND_PATH=%PROJECT_ROOT%\src\SmartAbp.Vue"

echo 正在检查项目路径...
echo 项目根目录: %PROJECT_ROOT%
echo 后端路径: %BACKEND_PATH%
echo 前端路径: %FRONTEND_PATH%
echo.

REM 检查后端路径
if not exist "%BACKEND_PATH%" (
    echo 错误: 后端项目路径不存在: %BACKEND_PATH%
    echo 请确认项目结构是否正确
    echo.
    echo 按任意键退出...
    pause > nul
    exit /b 1
)

REM 检查前端路径
if not exist "%FRONTEND_PATH%" (
    echo 错误: 前端项目路径不存在: %FRONTEND_PATH%
    echo 请确认项目结构是否正确
    echo.
    echo 按任意键退出...
    pause > nul
    exit /b 1
)

REM 检查dotnet是否安装
dotnet --version > nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 .NET SDK，请先安装 .NET SDK
    echo 下载地址: https://dotnet.microsoft.com/download
    echo.
    echo 按任意键退出...
    pause > nul
    exit /b 1
)

REM 检查npm是否安装
npm --version > nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 npm，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    echo.
    echo 按任意键退出...
    pause > nul
    exit /b 1
)

echo 正在启动开发环境...
echo.

echo [1/2] 启动后端服务 (ASP.NET Core)...
echo 执行命令: cd /d "%BACKEND_PATH%" ^&^& dotnet run --urls=https://localhost:44379
start "SmartAbp Backend" cmd /k "cd /d "%BACKEND_PATH%" && echo 当前目录: && cd && echo. && echo 启动后端服务... && dotnet run --urls=https://localhost:44379"

echo 等待后端服务启动...
timeout /t 10 /nobreak > nul

echo [2/2] 启动前端服务 (Vue.js)...
echo 执行命令: cd /d "%FRONTEND_PATH%" ^&^& npm run dev
start "SmartAbp Frontend" cmd /k "cd /d "%FRONTEND_PATH%" && echo 当前目录: && cd && echo. && echo 启动前端服务... && npm run dev"

echo.
echo ========================================
echo 开发环境启动完成！
echo ========================================
echo.
echo 后端服务: https://localhost:44379
echo 前端服务: http://localhost:11369
echo.
echo 默认登录信息:
echo 租户: 留空 (主机租户)
echo 用户名: admin
echo 密码: 1q2w3E*
echo.
echo 提示: 
echo - 如果服务启动失败，请检查新打开的命令行窗口中的错误信息
echo - 确保端口 44379 和 11369 没有被其他程序占用
echo - 首次运行前端可能需要执行 npm install 安装依赖
echo.
echo 按任意键退出...
pause > nul