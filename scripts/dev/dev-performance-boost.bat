@echo off
chcp 65001 > nul

echo ========================================
echo    SmartAbp 开发性能提升工具
echo ========================================
echo.
set "EXITCODE=0"

REM 自动检测项目根目录：向上搜索包含 package.json 的目录（带诊断信息）
set "CURRENT_DIR=%~dp0"
echo 🔎 脚本所在目录: %CURRENT_DIR%
:find_root
if exist "%CURRENT_DIR%package.json" (
    set "PROJECT_ROOT=%CURRENT_DIR%"
    goto got_root
) else (
    set "PREV_DIR=%CURRENT_DIR%"
    for %%I in ("%CURRENT_DIR%..") do set "CURRENT_DIR=%%~fI\"
    if /I "%CURRENT_DIR%"=="%PREV_DIR%" (
        echo ❌ 错误: 未找到项目根目录，请在项目目录内运行脚本！
        echo    起始目录: %~dp0
        echo    最后检测: %PREV_DIR%
        set "EXITCODE=1"
        goto end
    )
    goto find_root
)
:got_root
echo 🏁 项目根目录: %PROJECT_ROOT%
set "FRONTEND_PATH=%PROJECT_ROOT%\src\SmartAbp.Vue"

:: 检查前端路径是否存在
if not exist "%FRONTEND_PATH%" (
    echo ❌ 错误: 前端路径不存在: %FRONTEND_PATH%
    set "EXITCODE=1"
    goto end
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
for /d %%i in ("%FRONTEND_PATH%\packages\*") do (
    if exist "%%i\dist" (
        rmdir /s /q "%%i\dist"
        echo   ✅ 已清理 %%~ni 包缓存
    )
)

echo.
echo 🚀 设置性能优化环境变量...

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
:end
if not defined NOPAUSE pause
exit /b %EXITCODE%
