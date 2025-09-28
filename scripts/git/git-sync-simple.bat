@echo off
chcp 65001 >nul
echo 🚀 Git自动同步脚本 (简化版)
echo ================================

:: 检查Git仓库
if not exist ".git" (
    echo ❌ 错误: 当前目录不是Git仓库
    pause
    exit /b 1
)

:: 显示当前状态
echo ℹ️  当前Git状态:
git status --short

:: 询问是否继续
set /p continue="是否继续同步？(y/n): "
if /i not "%continue%"=="y" (
    echo 操作已取消
    pause
    exit /b 0
)

:: 创建备份分支
for /f "tokens=2 delims= " %%i in ('date /t') do set mydate=%%i
for /f "tokens=1 delims= " %%i in ('time /t') do set mytime=%%i
set mytime=%mytime::=%
set backup_branch=backup-%mydate%-%mytime%
set backup_branch=%backup_branch: =%
set backup_branch=%backup_branch:/=-%

echo ℹ️  创建备份分支: %backup_branch%
git branch %backup_branch%
if errorlevel 1 (
    echo ❌ 创建备份分支失败
    pause
    exit /b 1
)

:: 切换到main分支
echo ℹ️  切换到main分支...
git checkout main
if errorlevel 1 (
    echo ⚠️  main分支不存在，尝试创建...
    git checkout -b main
    if errorlevel 1 (
        echo ❌ 无法创建main分支
        pause
        exit /b 1
    )
)

:: 拉取远程更新
echo ℹ️  拉取远程更新...
git fetch origin
if errorlevel 1 (
    echo ❌ 拉取远程更新失败
    pause
    exit /b 1
)

:: 合并远程更改
echo ℹ️  合并远程更改...
git merge origin/main --no-edit
if errorlevel 1 (
    echo ⚠️  合并出现冲突，请手动解决
    echo 备份分支: %backup_branch%
    pause
    exit /b 1
)

:: 推送到远程
echo ℹ️  推送到远程...
git push origin main
if errorlevel 1 (
    echo ❌ 推送失败
    pause
    exit /b 1
)

echo ✅ Git同步完成！
echo 备份分支: %backup_branch%
pause