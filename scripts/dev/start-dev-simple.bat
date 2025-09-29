@echo off
chcp 65001 > nul

echo ========================================
echo    SmartAbp 开发环境启动器
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

echo.

echo 启动后端服务...
start "SmartAbp Backend" cmd /k "cd /d "%BACKEND_PATH%" && dotnet run --urls=https://localhost:44379"

timeout /t 5 /nobreak > nul

echo 启动前端服务...
start "SmartAbp Frontend" cmd /k "cd /d "%FRONTEND_PATH%" && npm run dev"

echo.
echo ✅ 服务启动命令已执行！
echo.
echo 🌐 访问地址：
echo   后端API: https://localhost:44379
echo   前端页面: http://localhost:11369
echo.
echo 💡 提示：
echo   - 后端和前端将在新窗口中启动
echo   - 首次启动可能需要几分钟时间
echo   - 如果端口被占用，请检查是否有其他服务在运行
echo.
echo 🔧 如果遇到问题：
echo   1. 确保已安装 .NET 9 和 Node.js
echo   2. 确保已执行 npm install
echo   3. 检查防火墙和端口占用
echo.
pause