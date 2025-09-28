@echo off
chcp 65001 > nul

echo ========================================
echo    SmartAbp 开发环境启动器
echo ========================================
echo.

echo 启动后端服务...
start "SmartAbp Backend" cmd /k "cd /d "%~dp0..\src\SmartAbp.Web" && dotnet run --urls=https://localhost:44379"

timeout /t 5 /nobreak > nul

echo 启动前端服务...
start "SmartAbp Frontend" cmd /k "cd /d "%~dp0..\src\SmartAbp.Vue" && npm run dev"

echo.
echo 服务启动完成！
echo 后端: https://localhost:44379
echo 前端: http://localhost:11369
echo.
pause