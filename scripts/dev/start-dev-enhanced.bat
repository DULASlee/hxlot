@echo off
chcp 65001 > nul
setlocal

echo ========================================
echo    SmartAbp 企业级开发环境启动器
echo ========================================
echo.

REM 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "BACKEND_PATH=%PROJECT_ROOT%\src\SmartAbp.Web"
set "FRONTEND_PATH=%PROJECT_ROOT%\src\SmartAbp.Vue"

echo 正在检查项目环境...
echo.

REM 检查后端路径
if not exist "%BACKEND_PATH%" (
    echo ❌ 错误: 后端项目路径不存在: %BACKEND_PATH%
    goto :error_exit
)

REM 检查前端路径
if not exist "%FRONTEND_PATH%" (
    echo ❌ 错误: 前端项目路径不存在: %FRONTEND_PATH%
    goto :error_exit
)

REM 检查dotnet
dotnet --version > nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 .NET SDK
    echo 请从 https://dotnet.microsoft.com/download 下载安装
    goto :error_exit
)

REM 检查npm
npm --version > nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 npm
    echo 请从 https://nodejs.org/ 下载安装 Node.js
    goto :error_exit
)

echo ✅ 环境检查通过
echo.

REM 检查前端依赖
echo 🔍 检查前端依赖...
if not exist "%FRONTEND_PATH%\node_modules" (
    echo 📦 正在安装前端依赖，请稍候...
    cd /d "%FRONTEND_PATH%"
    npm install
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败
        goto :error_exit
    )
    echo ✅ 前端依赖安装完成
) else (
    echo ✅ 前端依赖已存在
)

echo.
echo 🚀 启动开发服务...
echo.

echo [1/2] 启动后端服务 (ASP.NET Core)...
start "SmartAbp Backend" cmd /k "cd /d "%BACKEND_PATH%" && echo 🔧 后端服务启动中... && dotnet run --urls=https://localhost:44379"

echo ⏳ 等待后端服务启动 (10秒)...
timeout /t 10 /nobreak > nul

echo [2/2] 启动前端服务 (Vue.js)...
start "SmartAbp Frontend" cmd /k "cd /d "%FRONTEND_PATH%" && echo 🎨 前端服务启动中... && npm run dev"

echo.
echo ========================================
echo 🎉 开发环境启动完成！
echo ========================================
echo.
echo 🌐 服务地址:
echo   后端服务: https://localhost:44379
echo   前端服务: http://localhost:11369
echo.
echo 👤 默认登录信息:
echo   租户: 留空 (主机租户)
echo   用户名: admin
echo   密码: 1q2w3E*
echo.
echo 💡 提示:
echo   - 如果服务启动失败，请检查新打开的命令行窗口
echo   - 确保端口 44379 和 11369 没有被占用
echo   - 首次运行可能需要较长时间编译
echo.
echo 按任意键退出...
pause > nul
exit /b 0

:error_exit
echo.
echo ❌ 启动失败，请检查上述错误信息
echo.
echo 按任意键退出...
pause > nul
exit /b 1