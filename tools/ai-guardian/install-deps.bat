@echo off
REM AI Guardian Python依赖安装脚本

echo ========================================
echo   AI Guardian 依赖安装
echo ========================================
echo.

echo [1/2] 安装 psutil...
pip install psutil

echo.
echo [2/2] 安装 pyautogui...
pip install pyautogui

echo.
echo ========================================
echo   安装完成！
echo ========================================
echo.
echo 使用方法:
echo   python tools/ai-guardian/guardian-daemon.py
echo.
pause

