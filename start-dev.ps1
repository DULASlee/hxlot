Write-Host "启动 SmartAbp 开发环境..." -ForegroundColor Green

Write-Host ""
Write-Host "1. 启动后端 API 服务..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'src\SmartAbp.Web'; dotnet run"

Write-Host ""
Write-Host "2. 等待 5 秒后启动前端 Vue 服务..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'src\SmartAbp.Vue'; npm run dev"

Write-Host ""
Write-Host "开发环境启动完成！" -ForegroundColor Green
Write-Host "后端服务: https://localhost:44300 (或查看后端控制台输出)" -ForegroundColor Cyan
Write-Host "前端服务: http://localhost:11369" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")