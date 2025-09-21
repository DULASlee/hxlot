@echo off
setlocal
set WORKDIR=D:\BAOBAB\Baobab.SmartAbp
if not exist "%WORKDIR%" (
  echo ❌ 目录不存在: %WORKDIR%
  pause
  exit /b 1
)
cd /d "%WORKDIR%"
"C:\Program Files\Git\bin\bash.exe" --login -i -c "echo '✅ Git Bash已在工作区启动'; pwd; exec bash -i"

