@echo off
chcp 65001 > nul
setlocal

echo ========================================
echo    SmartAbp 企业级开发环境启动器
echo ========================================
echo.

:: 设置项目根目录
set "PROJECT_ROOT=%~dp0..\.."
set "BACKEND_PATH=%PROJECT_ROOT%\src\SmartAbp.Web"
set "FRONTEND_PATH=%PROJECT_ROOT%\src\SmartAbp.Vue"

:: 检查路径是否存在
if not exist "%BACKEND_PATH%" (
    echo ❌ 错误: 后端路径不存在: %BACKEND_PATH%
    pause
    exit /b 1
)

if not exist "%FRONTEND_PATH%" (
    echo ❌ 错误: 前端路径不存在: %FRONTEND_PATH%
    pause
    exit /b 1
)

:: 检查依赖环境
echo 🔍 检查环境依赖...

dotnet --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 .NET，请安装 .NET 9 SDK
    echo 📥 下载地址: https://dotnet.microsoft.com/download
    pause
    exit /b 1
) else (
    echo ✅ .NET 环境已安装
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Node.js，请安装 Node.js 18+
    echo 📥 下载地址: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js 环境已安装
)

:: 检查前端依赖
echo 📦 检查前端依赖...
if not exist "%FRONTEND_PATH%\node_modules" (
    echo ⚠️  前端依赖未安装，正在安装...
    cd /d "%FRONTEND_PATH%"
    npm install
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
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
echo 🌐 访问地址：
echo   后端API: https://localhost:44379
echo   前端页面: http://localhost:11369
echo.
echo 👤 默认登录信息:
echo   租户: 留空 (主机租户)
echo   用户名: admin
echo   密码: 1q2w3E*
echo.
echo 💡 提示：
echo   - 后端和前端将在新窗口中启动
echo   - 首次启动可能需要几分钟时间
echo   - 如果端口被占用，请检查是否有其他服务在运行
echo.
echo 🔧 如果遇到问题：
echo   1. 确保已安装 .NET 9 和 Node.js
echo   2. 检查防火墙和端口占用
echo   3. 运行 dev-performance-boost.bat 清理缓存
echo.
pause
pause > nul