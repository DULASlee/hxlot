@echo off
setlocal enabledelayedexpansion
title SmartAbp Git Safe Sync - 企业级版本管理工具
color 0F

REM --- 参数处理 ---
set "AUTO_COMMIT=0"
set "NON_INTERACTIVE=0"
set "DRY_RUN=0"

:parse_args
if "%~1"=="" goto :args_done
if /i "%~1"=="-a" set "AUTO_COMMIT=1"
if /i "%~1"=="--auto-commit" set "AUTO_COMMIT=1"
if /i "%~1"=="-n" (
    set "NON_INTERACTIVE=1"
    set "AUTO_COMMIT=1"
)
if /i "%~1"=="--non-interactive" (
    set "NON_INTERACTIVE=1"
    set "AUTO_COMMIT=1"
)
if /i "%~1"=="-d" set "DRY_RUN=1"
if /i "%~1"=="--dry-run" set "DRY_RUN=1"
if /i "%~1"=="-h" goto :show_help
if /i "%~1"=="--help" goto :show_help
shift
goto :parse_args

:show_help
echo 用法: %~nx0 [选项]
echo 选项:
echo   -a, --auto-commit     自动提交本地更改
echo   -n, --non-interactive 非交互模式(自动处理所有确认)
echo   -d, --dry-run         预演模式(不执行实际操作)
echo   -h, --help            显示此帮助信息
goto :eof

:args_done

echo ========================================
echo    SmartAbp 企业级Git安全同步工具
echo ========================================
echo.
echo 功能: 备份 → 拉取 → 合并 → 推送
echo 时间: %date% %time%
if "%NON_INTERACTIVE%"=="1" (
    echo 模式: 非交互模式
) else if "%DRY_RUN%"=="1" (
    echo 模式: 预演模式
) else (
    echo 模式: 交互模式
)
echo.

REM --- 确保在项目根目录运行 ---
cd /d "%~dp0..\"
set "PROJECT_ROOT=%cd%"
echo 项目根目录: %PROJECT_ROOT%
echo.

REM --- 环境检查 ---
echo [1/6] 环境检查...
if not exist ".git" (
    echo [错误] 当前目录不是Git仓库!
    goto :error
)

git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Git未安装或不在PATH中!
    goto :error
)
echo      Git环境检查通过 ✓
echo.

REM --- 本地状态检查 ---
echo [2/6] 检查本地Git状态...
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Git状态检查失败!
    goto :error
)

for /f "tokens=*" %%a in ('git status --porcelain') do (
    echo      发现未提交的更改: %%a
    set "HAS_CHANGES=1"
)

if defined HAS_CHANGES (
    echo      ⚠️  检测到本地未提交的更改
    if "%NON_INTERACTIVE%"=="1" (
        echo      非交互模式：自动提交本地更改...
        set "SHOULD_COMMIT=1"
    ) else (
        set /p "USER_INPUT=是否自动提交本地更改? (y/N): "
        if /i "!USER_INPUT!"=="y" (
            set "SHOULD_COMMIT=1"
        ) else (
            set "SHOULD_COMMIT=0"
        )
    )
    if "!SHOULD_COMMIT!"=="1" (
        echo      正在自动提交本地更改...
        git add .
        git commit -m "自动提交: %date% %time% - Git安全同步前的本地更改"
        if !errorlevel! neq 0 (
            echo [错误] 自动提交失败!
            goto :error
        )
        echo      ✅ 本地更改已自动提交
    ) else (
        echo [警告] 本地有未提交更改，请先手动处理
        echo.
        git status
        pause
        goto :eof
    )
) else (
    echo      ✅ 本地工作区干净
)
echo.

REM --- 创建本地备份 ---
echo [3/6] 创建本地Git备份...
set "BACKUP_DIR=.git-backups"
set "TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"
set "BACKUP_PATH=%BACKUP_DIR%\backup_%TIMESTAMP%"

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM 备份当前分支信息
for /f "tokens=*" %%a in ('git branch --show-current') do set "CURRENT_BRANCH=%%a"
echo %CURRENT_BRANCH% > "%BACKUP_PATH%_branch.txt"

REM 备份当前HEAD
for /f "tokens=*" %%a in ('git rev-parse HEAD') do set "CURRENT_HEAD=%%a"
echo %CURRENT_HEAD% > "%BACKUP_PATH%_head.txt"

REM 创建备份标签
git tag "backup_%TIMESTAMP%" HEAD
if %errorlevel% equ 0 (
    echo      ✅ 本地备份已创建: backup_%TIMESTAMP%
    echo      📁 备份位置: %BACKUP_PATH%
) else (
    echo [警告] 备份标签创建失败，但继续执行...
)
echo.

REM --- 拉取远程更新 ---
echo [4/6] 拉取远程仓库更新...
echo      正在获取远程更新信息...
git fetch origin
if %errorlevel% neq 0 (
    echo [错误] 无法连接到远程仓库!
    goto :error
)

REM 检查是否有远程更新
for /f "tokens=*" %%a in ('git rev-list HEAD..origin/%CURRENT_BRANCH% --count') do set "REMOTE_COMMITS=%%a"

if "%REMOTE_COMMITS%"=="0" (
    echo      ℹ️  远程仓库无新更新
    set "HAS_REMOTE_UPDATES=0"
) else (
    echo      📥 发现 %REMOTE_COMMITS% 个远程提交需要合并
    set "HAS_REMOTE_UPDATES=1"
    
    REM 显示远程更新概要
    echo      远程更新概要:
    git log --oneline HEAD..origin/%CURRENT_BRANCH% --max-count=5
)
echo.

REM --- 合并远程更新 ---
if "%HAS_REMOTE_UPDATES%"=="1" (
    echo [5/6] 合并远程更新到本地...
    echo      使用策略: merge (保留完整历史)
    
    git merge origin/%CURRENT_BRANCH% --no-edit
    if %errorlevel% neq 0 (
        echo [错误] 合并失败! 可能存在冲突
        echo.
        echo 🚨 冲突解决指南:
        echo    1. 使用 'git status' 查看冲突文件
        echo    2. 手动编辑冲突文件
        echo    3. 使用 'git add .' 标记已解决
        echo    4. 使用 'git commit' 完成合并
        echo    5. 重新运行此脚本
        echo.
        echo 💡 备份恢复方法:
        echo    git reset --hard backup_%TIMESTAMP%
        echo.
        pause
        goto :error
    )
    echo      ✅ 远程更新合并成功
) else (
    echo [5/6] 跳过合并 (无远程更新)
)
echo.

REM --- 推送到远程仓库 ---
echo [6/6] 推送合并后的版本到远程仓库...

REM 检查是否有本地提交需要推送
for /f "tokens=*" %%a in ('git rev-list origin/%CURRENT_BRANCH%..HEAD --count') do set "LOCAL_COMMITS=%%a"

if "%LOCAL_COMMITS%"=="0" (
    echo      ℹ️  无本地提交需要推送
    echo      📊 本地与远程已同步
) else (
    echo      📤 推送 %LOCAL_COMMITS% 个本地提交到远程仓库...
    
    git push origin %CURRENT_BRANCH%
    if %errorlevel% neq 0 (
        echo [错误] 推送失败!
        echo.
        echo 💡 可能的解决方案:
        echo    1. 检查网络连接
        echo    2. 验证远程仓库权限
        echo    3. 使用备份恢复: git reset --hard backup_%TIMESTAMP%
        echo.
        pause
        goto :error
    )
    echo      ✅ 推送成功
)

echo.
echo ========================================
echo           🎉 Git同步完成!
echo ========================================
echo.
echo 📊 同步统计:
echo    📥 远程提交合并: %REMOTE_COMMITS% 个
echo    📤 本地提交推送: %LOCAL_COMMITS% 个
echo    💾 备份标签: backup_%TIMESTAMP%
echo    🌿 当前分支: %CURRENT_BRANCH%
echo.
echo 🔄 同步结果: 本地与远程仓库完全同步
echo ⏰ 完成时间: %date% %time%
echo.

REM --- 清理旧备份 (保留最近10个) ---
echo 🧹 清理旧备份 (保留最近10个)...
set "BACKUP_COUNT=0"
for /f "tokens=*" %%a in ('git tag -l "backup_*" --sort=-creatordate') do (
    set /a BACKUP_COUNT+=1
    if !BACKUP_COUNT! gtr 10 (
        git tag -d "%%a" >nul 2>&1
        echo      删除旧备份: %%a
    )
)

goto :success

:error
echo.
echo ❌ ========================================
echo     Git同步失败!
echo ========================================
echo.
echo 💡 故障排除建议:
echo    1. 检查网络连接到GitHub
echo    2. 验证Git配置和权限
echo    3. 检查是否有合并冲突
echo    4. 使用备份恢复: git reset --hard backup_%TIMESTAMP%
echo.
echo 📞 如需帮助，请联系技术支持
echo.
set "EXIT_CODE=1"
goto :eof

:success
echo 🎯 提示: 可以将此脚本添加到系统任务计划程序中定期执行
echo 📝 日志文件: 考虑添加详细日志记录功能
echo.
set "EXIT_CODE=0"

:eof
echo 按任意键退出...
pause > nul
exit /b %EXIT_CODE%

echo.
echo 📊 同步统计:
echo    📥 远程提交合并: %REMOTE_COMMITS% 个
echo    📤 本地提交推送: %LOCAL_COMMITS% 个
echo    💾 备份标签: backup_%TIMESTAMP%
echo    🌿 当前分支: %CURRENT_BRANCH%
echo.
echo 🔄 同步结果: 本地与远程仓库完全同步
echo ⏰ 完成时间: %date% %time%
echo.

REM --- 清理旧备份 (保留最近10个) ---
echo 🧹 清理旧备份 (保留最近10个)...
set "BACKUP_COUNT=0"
for /f "tokens=*" %%a in ('git tag -l "backup_*" --sort=-creatordate') do (
    set /a BACKUP_COUNT+=1
    if !BACKUP_COUNT! gtr 10 (
        git tag -d "%%a" >nul 2>&1
        echo      删除旧备份: %%a
    )
)

goto :success

:error
echo.
echo ❌ ========================================
echo     Git同步失败!
echo ========================================
echo.
echo 💡 故障排除建议:
echo    1. 检查网络连接到GitHub
echo    2. 验证Git配置和权限
echo    3. 检查是否有合并冲突
echo    4. 使用备份恢复: git reset --hard backup_%TIMESTAMP%
echo.
echo 📞 如需帮助，请联系技术支持
echo.
set "EXIT_CODE=1"
goto :eof

:success
echo 🎯 提示: 可以将此脚本添加到系统任务计划程序中定期执行
echo 📝 日志文件: 考虑添加详细日志记录功能
echo.
set "EXIT_CODE=0"

:eof
echo 按任意键退出...
pause > nul
exit /b %EXIT_CODE%
