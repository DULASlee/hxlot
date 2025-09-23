@echo off
setlocal enabledelayedexpansion
title Cursor IDE Performance Optimizer - 企业级性能优化工具
color 0F

REM Cursor IDE Performance Optimizer - 企业级性能优化脚本 (Windows批处理版本)
REM 专为SmartAbp低代码引擎开发环境设计
REM 作者: 首席架构师 | 版本: v1.0

REM 参数处理
set "DEEP_CLEAN=0"
set "BACKUP=1"
set "DRY_RUN=0"
set "RESTART_CURSOR=0"
set "VERBOSE=0"
set "KEEP_DAYS=7"

:parse_args
if "%~1"=="" goto :args_done
if /i "%~1"=="--deep" set "DEEP_CLEAN=1"
if /i "%~1"=="--no-backup" set "BACKUP=0"
if /i "%~1"=="--dry-run" set "DRY_RUN=1"
if /i "%~1"=="--restart" set "RESTART_CURSOR=1"
if /i "%~1"=="--verbose" set "VERBOSE=1"
if /i "%~1"=="--keep-days" (
    set "KEEP_DAYS=%~2"
    shift
)
if /i "%~1"=="--help" goto :show_help
shift
goto :parse_args

:show_help
echo Cursor IDE Performance Optimizer
echo 用法: %~nx0 [选项]
echo 选项:
echo   --deep          深度清理模式
echo   --no-backup     不备份配置文件
echo   --dry-run       预演模式（不执行实际清理）
echo   --restart       清理后重启Cursor
echo   --verbose       详细输出
echo   --keep-days N   保留最近N天的日志（默认7天）
echo   --help          显示此帮助信息
goto :eof

:args_done

REM 全局变量
set "TOTAL_CLEANED=0"
set "FILES_PROCESSED=0"
set "BACKUP_PATH="

echo ========================================
echo    Cursor IDE 企业级性能优化工具
echo ========================================
echo.
echo 开始时间: %date% %time%
if "%DEEP_CLEAN%"=="1" (
    echo 清理模式: 深度清理
) else (
    echo 清理模式: 标准清理
)
if "%DRY_RUN%"=="1" (
    echo 执行模式: 预演模式
) else (
    echo 执行模式: 实际清理
)
echo.

REM 创建备份目录
if "%BACKUP%"=="1" if "%DRY_RUN%"=="0" (
    set "BACKUP_PATH=%TEMP%\CursorBackup-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%"
    set "BACKUP_PATH=!BACKUP_PATH: =0!"
    mkdir "!BACKUP_PATH!" 2>nul
    echo 备份目录: !BACKUP_PATH!
    echo.
)

REM 检测Cursor进程
tasklist /FI "IMAGENAME eq Cursor.exe" 2>nul | find /I "Cursor.exe" >nul
if !errorlevel! equ 0 (
    echo ⚠️  检测到Cursor进程正在运行
    if "%DRY_RUN%"=="0" (
        set /p "CLOSE_CURSOR=是否关闭Cursor进程以进行清理? (y/N): "
        if /i "!CLOSE_CURSOR!"=="y" (
            taskkill /F /IM Cursor.exe 2>nul
            echo 已关闭Cursor进程
            timeout /t 3 /nobreak >nul
        ) else (
            echo ⚠️  在Cursor运行时清理可能效果有限
        )
    )
)

REM Cursor配置路径
set "APPDATA_CURSOR=%APPDATA%\Cursor"
set "LOCALAPPDATA_CURSOR=%LOCALAPPDATA%\Cursor"

echo 🧹 开始清理Cursor IDE文件...
echo.

REM 标准清理项目
call :cleanup_folder "%APPDATA_CURSOR%\logs" "应用日志" "0"
call :cleanup_folder "%APPDATA_CURSOR%\CachedExtensions" "扩展缓存" "0"
call :cleanup_folder "%APPDATA_CURSOR%\CachedExtensionVSIXs" "扩展安装包缓存" "0"
call :cleanup_folder "%LOCALAPPDATA_CURSOR%\GPUCache" "GPU缓存" "0"
call :cleanup_folder "%LOCALAPPDATA_CURSOR%\ShaderCache" "着色器缓存" "0"
call :cleanup_folder "%LOCALAPPDATA_CURSOR%\User\CachedData" "Web缓存数据" "0"

REM 备份重要配置后清理
call :cleanup_folder "%LOCALAPPDATA_CURSOR%\User\workspaceStorage" "工作区存储" "1"

REM 深度清理项目
if "%DEEP_CLEAN%"=="1" (
    echo 🔍 深度清理模式：清理更多缓存文件...
    call :cleanup_folder "%LOCALAPPDATA_CURSOR%\Crashpad\reports" "崩溃转储文件" "0"
    call :cleanup_folder "%LOCALAPPDATA_CURSOR%\User\tmp" "临时文件" "0"
    
    REM 清理Node.js缓存
    call :cleanup_folder "%APPDATA%\npm-cache" "NPM缓存" "0"
    call :cleanup_folder "%LOCALAPPDATA%\npm-cache" "本地NPM缓存" "0"
    call :cleanup_folder "%USERPROFILE%\.npm" "用户NPM缓存" "0"
    call :cleanup_folder "%USERPROFILE%\.node-gyp" "Node-gyp缓存" "0"
)

REM 清理扩展相关过期文件
echo 🔌 清理扩展相关缓存...
call :cleanup_folder "%APPDATA_CURSOR%\User\extensions\.obsolete" "过期扩展文件" "0"
call :cleanup_folder "%APPDATA_CURSOR%\User\extensions\.tmp" "临时扩展文件" "0"
call :cleanup_folder "%LOCALAPPDATA_CURSOR%\User\extensions\.obsolete" "本地过期扩展文件" "0"

REM 清理旧日志文件
echo 📋 清理旧日志文件...
call :cleanup_old_files "%APPDATA_CURSOR%\logs" "%KEEP_DAYS%" "Cursor日志"
call :cleanup_old_files "%LOCALAPPDATA_CURSOR%\logs" "%KEEP_DAYS%" "本地Cursor日志"

REM 清理系统临时文件中的Cursor相关文件
echo 🗑️  清理系统临时文件中的Cursor数据...
for /f "tokens=*" %%a in ('dir /b "%TEMP%\cursor*" 2^>nul') do (
    call :cleanup_folder "%TEMP%\%%a" "临时Cursor文件" "0"
)

echo.
echo ========================================
echo           🎉 清理完成!
echo ========================================
echo.
echo 📊 清理统计:
echo    💾 释放磁盘空间: %TOTAL_CLEANED% MB
echo    📁 处理项目数: %FILES_PROCESSED% 个

if defined BACKUP_PATH if exist "%BACKUP_PATH%" (
    echo    💼 备份位置: %BACKUP_PATH%
)

echo    ⏰ 完成时间: %date% %time%
echo.

REM 性能优化建议
call :show_performance_recommendations

REM 重启Cursor
call :restart_cursor

echo ✅ Cursor IDE 性能优化完成!
goto :eof

REM ===== 子程序 =====

:cleanup_folder
set "FOLDER_PATH=%~1"
set "DESCRIPTION=%~2"
set "NEED_BACKUP=%~3"

REM 移除引号
set "FOLDER_PATH=%FOLDER_PATH:"=%"

if not exist "%FOLDER_PATH%" (
    if "%VERBOSE%"=="1" echo [跳过] 路径不存在: %FOLDER_PATH%
    goto :eof
)

REM 计算文件夹大小
call :get_folder_size "%FOLDER_PATH%" FOLDER_SIZE

if "%DRY_RUN%"=="1" (
    echo [DRY RUN] 将清理 %DESCRIPTION% : %FOLDER_PATH% ^(%FOLDER_SIZE% MB^)
    goto :eof
)

REM 备份重要配置
if "%NEED_BACKUP%"=="1" if "%BACKUP%"=="1" if %FOLDER_SIZE% gtr 0 (
    if defined BACKUP_PATH (
        set "BACKUP_NAME=%~n1%~x1"
        set "BACKUP_TARGET=%BACKUP_PATH%\!BACKUP_NAME!-%date:~0,4%%date:~5,2%%date:~8,2%-%time:~0,2%%time:~3,2%%time:~6,2%"
        set "BACKUP_TARGET=!BACKUP_TARGET: =0!"
        
        xcopy "%FOLDER_PATH%" "!BACKUP_TARGET!" /E /I /H /Y >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✅ 已备份 %DESCRIPTION% 到: !BACKUP_TARGET!
        ) else (
            echo ❌ 备份失败: %DESCRIPTION%
        )
    )
)

REM 执行清理
rmdir /S /Q "%FOLDER_PATH%" >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ 已清理 %DESCRIPTION% : %FOLDER_SIZE% MB
    set /a "TOTAL_CLEANED+=!FOLDER_SIZE!"
    set /a "FILES_PROCESSED+=1"
) else (
    echo ❌ 清理失败 %DESCRIPTION% : %FOLDER_PATH%
)
goto :eof

:get_folder_size
set "CHECK_PATH=%~1"
set "RETURN_VAR=%~2"

if not exist "%CHECK_PATH%" (
    set "%RETURN_VAR%=0"
    goto :eof
)

REM 使用PowerShell计算文件夹大小
for /f "usebackq" %%a in (`powershell -command "if (Test-Path '%CHECK_PATH%') { [math]::Round((Get-ChildItem -Path '%CHECK_PATH%' -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB, 2) } else { 0 }"`) do (
    set "%RETURN_VAR%=%%a"
)
goto :eof

:cleanup_old_files
set "LOG_PATH=%~1"
set "DAYS=%~2"
set "DESC=%~3"

if not exist "%LOG_PATH%" goto :eof

if "%DRY_RUN%"=="1" (
    echo [DRY RUN] 将清理 %DESC% 中 %DAYS% 天前的文件
    goto :eof
)

REM 使用forfiles删除旧文件
forfiles /p "%LOG_PATH%" /m *.* /d -%DAYS% /c "cmd /c del @path" >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ 已清理 %DESC% 中 %DAYS% 天前的文件
) else (
    if "%VERBOSE%"=="1" echo [信息] %DESC% 中没有 %DAYS% 天前的文件需要清理
)
goto :eof

:show_performance_recommendations
echo.
echo 🚀 性能优化建议:
echo 1. 定期运行此脚本（建议每周一次）
echo 2. 禁用不必要的扩展以减少内存使用
echo 3. 定期重启Cursor IDE以释放内存
echo 4. 确保有足够的磁盘空间（建议至少5GB）
echo 5. 关闭不必要的文件和标签页
echo 6. 使用排除列表避免索引大型node_modules目录
echo.

REM 系统资源检查
echo 💻 系统资源状态:
for /f "tokens=1,2,3,4" %%a in ('wmic logicaldisk get size^,freespace^,caption^,drivetype /format:table ^| findstr /r "^[A-Z]"') do (
    if "%%d"=="3" (
        set /a "FREE_GB=%%b/1024/1024/1024"
        set /a "TOTAL_GB=%%c/1024/1024/1024"
        set /a "FREE_PERCENT=%%b*100/%%c"
        
        if !FREE_PERCENT! lss 10 (
            echo [错误] 磁盘 %%a 可用空间不足: !FREE_GB! GB / !TOTAL_GB! GB ^(!FREE_PERCENT!%%^)
        ) else if !FREE_PERCENT! lss 20 (
            echo [警告] 磁盘 %%a 可用空间较少: !FREE_GB! GB / !TOTAL_GB! GB ^(!FREE_PERCENT!%%^)
        ) else (
            echo [正常] 磁盘 %%a 可用空间: !FREE_GB! GB / !TOTAL_GB! GB ^(!FREE_PERCENT!%%^)
        )
    )
)

REM 内存信息
for /f "tokens=2 delims==" %%a in ('wmic computersystem get TotalPhysicalMemory /format:list ^| findstr "="') do (
    set /a "TOTAL_RAM_GB=%%a/1024/1024/1024"
    echo 系统内存: !TOTAL_RAM_GB! GB
)
goto :eof

:restart_cursor
if "%RESTART_CURSOR%"=="1" if "%DRY_RUN%"=="0" (
    echo 🔄 重启Cursor IDE...
    timeout /t 2 /nobreak >nul
    
    REM 查找Cursor安装路径
    set "CURSOR_EXE="
    
    if exist "%LOCALAPPDATA%\Programs\cursor\Cursor.exe" (
        set "CURSOR_EXE=%LOCALAPPDATA%\Programs\cursor\Cursor.exe"
    ) else if exist "%ProgramFiles%\Cursor\Cursor.exe" (
        set "CURSOR_EXE=%ProgramFiles%\Cursor\Cursor.exe"
    ) else if exist "%ProgramFiles(x86)%\Cursor\Cursor.exe" (
        set "CURSOR_EXE=%ProgramFiles(x86)%\Cursor\Cursor.exe"
    )
    
    if defined CURSOR_EXE (
        start "" "!CURSOR_EXE!" "%CD%"
        echo ✅ Cursor IDE 已重启
    ) else (
        echo ⚠️  未找到Cursor安装路径，请手动启动
    )
)
goto :eof
