@echo off
echo ========================================
echo    SmartAbp 企业级用户登录系统
echo ========================================
echo.
echo 正在启动开发环境...
echo.

echo [1/2] 启动后端服务 (ASP.NET Core)...
start "SmartAbp Backend" cmd /k "cd /d src\SmartAbp.Web && dotnet run --urls=https://localhost:44379"

echo 等待后端服务启动...
timeout /t 10 /nobreak > nul

echo [2/2] 启动前端服务 (Vue.js)...
start "SmartAbp Frontend" cmd /k "cd /d src\SmartAbp.Vue && npm run dev"

echo.
echo ========================================
echo 开发环境启动完成！
echo ========================================
echo.
echo 后端服务: https://localhost:44379
echo 前端服务: http://localhost:11369
echo.
echo 默认登录信息:
echo 租户: 留空 (主机租户)
echo 用户名: admin
echo 密码: 1q2w3E*
echo.
echo 按任意键退出...
pause > nul