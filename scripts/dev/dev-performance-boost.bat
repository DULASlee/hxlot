@echo off
chcp 65001 > nul

echo ========================================
echo    SmartAbp 开发性能提升工具
echo ========================================
echo.

:: 设置项目根目录
set "PROJECT_ROOT=%~dp0..\.."
set "FRONTEND_PATH=%PROJECT_ROOT%\src\SmartAbp.Vue"

:: 检查前端路径是否存在
if not exist "%FRONTEND_PATH%" (
    echo ❌ 错误: 前端路径不存在: %FRONTEND_PATH%
    pause
    exit /b 1
)

echo 🧹 清理开发缓存和临时文件...
echo.

echo 1️⃣ 清理Vite缓存...
if exist "%FRONTEND_PATH%\node_modules\.vite" (
    rmdir /s /q "%FRONTEND_PATH%\node_modules\.vite"
    echo   ✅ Vite缓存已清理
) else (
    echo   ℹ️  Vite缓存不存在
)

echo 2️⃣ 清理TypeScript缓存...
if exist "%FRONTEND_PATH%\tsconfig.tsbuildinfo" (
    del "%FRONTEND_PATH%\tsconfig.tsbuildinfo"
    echo   ✅ TypeScript缓存已清理
) else (
    echo   ℹ️  TypeScript缓存不存在
)

echo 3️⃣ 清理依赖缓存...
if exist "%FRONTEND_PATH%\node_modules\.cache" (
    rmdir /s /q "%FRONTEND_PATH%\node_modules\.cache"
    echo   ✅ 依赖缓存已清理
) else (
    echo   ℹ️  依赖缓存不存在
)

echo 4️⃣ 清理构建产物...
if exist "%FRONTEND_PATH%\dist" (
    rmdir /s /q "%FRONTEND_PATH%\dist"
    echo   ✅ 构建产物已清理
) else (
    echo   ℹ️  构建产物不存在
)

echo 5️⃣ 清理Packages缓存...
if exist "%FRONTEND_PATH%\packages\*\dist" (
    for /d %%i in ("%FRONTEND_PATH%\packages\*") do (
        if exist "%%i\dist" (
            rmdir /s /q "%%i\dist"
            echo   ✅ 已清理 %%~ni 包缓存
        )
    )
) else (
    echo   ℹ️  Packages缓存不存在
)

echo.
echo 🚀 设置性能优化环境变量...

:: 创建环境变量设置脚本
echo @echo off > "%FRONTEND_PATH%\set-dev-env.bat"
echo :: SmartAbp 开发环境优化配置 >> "%FRONTEND_PATH%\set-dev-env.bat"
echo set NODE_OPTIONS=--max-old-space-size=8192 --enable-source-maps >> "%FRONTEND_PATH%\set-dev-env.bat"
echo set VITE_DEV_MODE=true >> "%FRONTEND_PATH%\set-dev-env.bat"
echo set VITE_CACHE_DIR=node_modules/.vite >> "%FRONTEND_PATH%\set-dev-env.bat"

echo   ✅ 已创建 %FRONTEND_PATH%\set-dev-env.bat

echo.
echo ========================================
echo 🎉 性能优化完成！
echo ========================================
echo.
echo 💡 下一步操作：
echo   1. 运行 start-dev.bat 启动开发环境
echo   2. 或者手动执行：
echo      cd "%FRONTEND_PATH%"
echo      call set-dev-env.bat
echo      npm run dev
echo.
echo 🔧 高级优化选项：
echo   - 如果仍然缓慢，修改 NODE_OPTIONS 到 --max-old-space-size=16384
echo   - 考虑升级到更快的SSD硬盘
echo   - 检查杀毒软件是否影响Node.js性能
echo.
pause
