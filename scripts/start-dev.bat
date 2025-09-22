@echo off
echo 启动 SmartAbp 开发环境...

echo.
echo 1. 启动后端 API 服务...
start "SmartAbp Backend" cmd /k "cd src\SmartAbp.Web && dotnet run"

echo.
echo 2. 等待 5 秒后启动前端 Vue 服务...
timeout /t 5 /nobreak > nul

start "SmartAbp Frontend" cmd /k "cd src\SmartAbp.Vue && npm run dev"

echo.
echo 开发环境启动完成！
echo 后端服务: https://localhost:44300 (或查看后端控制台输出)
echo 前端服务: http://localhost:11369
echo.
pause