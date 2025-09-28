# SmartAbp 安全启动脚本 - 解决Cursor IDE终端卡住问题
# 优化版本，避免进程冲突和资源竞争

param(
    [switch]$Clean,
    [switch]$Verbose
)

Write-Host "🚀 SmartAbp 安全启动脚本" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

# 设置错误处理
$ErrorActionPreference = "Continue"

# 1. 预检查
Write-Host "`n1️⃣ 环境预检查..." -ForegroundColor Yellow

# 检查必要工具
$tools = @{
    "dotnet" = "dotnet --version"
    "node" = "node --version"
    "npm" = "npm --version"
}

foreach ($tool in $tools.Keys) {
    try {
        $version = Invoke-Expression $tools[$tool] 2>$null
        Write-Host "✅ $tool : $version" -ForegroundColor Green
    } catch {
        Write-Host "❌ $tool 未安装或不可用" -ForegroundColor Red
        exit 1
    }
}

# 2. 清理现有进程（如果需要）
if ($Clean) {
    Write-Host "`n2️⃣ 清理现有进程..." -ForegroundColor Yellow

    # 优雅停止SmartAbp相关进程
    Get-Process | Where-Object {
        $_.ProcessName -eq "dotnet" -and (
            $_.MainWindowTitle -like "*SmartAbp*" -or
            $_.CommandLine -like "*SmartAbp.Web*"
        )
    } | ForEach-Object {
        Write-Host "停止dotnet进程: $($_.Id)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }

    # 停止Vite开发服务器
    Get-Process | Where-Object {
        $_.ProcessName -eq "node" -and
        $_.CommandLine -like "*vite*"
    } | ForEach-Object {
        Write-Host "停止Vite进程: $($_.Id)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }

    Start-Sleep -Seconds 2
}

# 3. 检查端口可用性
Write-Host "`n3️⃣ 检查端口可用性..." -ForegroundColor Yellow

$requiredPorts = @{
    44379 = "后端API服务"
    11369 = "前端开发服务器"
}

foreach ($port in $requiredPorts.Keys) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "⚠️ 端口 $port ($($requiredPorts[$port])) 被占用" -ForegroundColor Yellow

        # 尝试释放端口
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "   占用进程: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Red
            if ($Clean) {
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                Write-Host "   ✅ 已释放端口" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "✅ 端口 $port 可用" -ForegroundColor Green
    }
}

# 4. 启动后端服务
Write-Host "`n4️⃣ 启动后端服务..." -ForegroundColor Yellow

$backendPath = "src\SmartAbp.Web"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ 后端项目路径不存在: $backendPath" -ForegroundColor Red
    exit 1
}

# 使用新的PowerShell窗口启动后端，避免阻塞
$backendArgs = @(
    "-NoExit"
    "-Command"
    "cd '$backendPath'; Write-Host '🔧 启动后端服务...' -ForegroundColor Green; dotnet run --urls=https://localhost:44379"
)

try {
    $backendProcess = Start-Process -FilePath "pwsh" -ArgumentList $backendArgs -PassThru -WindowStyle Normal
    Write-Host "✅ 后端服务启动中... (PID: $($backendProcess.Id))" -ForegroundColor Green
} catch {
    Write-Host "❌ 后端服务启动失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 5. 等待后端服务就绪
Write-Host "`n5️⃣ 等待后端服务就绪..." -ForegroundColor Yellow

$maxWait = 30
$waited = 0
$backendReady = $false

while ($waited -lt $maxWait -and -not $backendReady) {
    try {
        $response = Invoke-WebRequest -Uri "https://localhost:44379/health-status" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "✅ 后端服务就绪" -ForegroundColor Green
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Yellow
        Start-Sleep -Seconds 1
        $waited++
    }
}

if (-not $backendReady) {
    Write-Host "`n⚠️ 后端服务启动超时，但继续启动前端..." -ForegroundColor Yellow
}

# 6. 启动前端服务
Write-Host "`n6️⃣ 启动前端服务..." -ForegroundColor Yellow

$frontendPath = "src\SmartAbp.Vue"
if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ 前端项目路径不存在: $frontendPath" -ForegroundColor Red
    exit 1
}

# 检查node_modules
if (-not (Test-Path "$frontendPath\node_modules")) {
    Write-Host "📦 安装前端依赖..." -ForegroundColor Yellow
    Set-Location $frontendPath
    npm install
    Set-Location ..\..
}

# 启动前端开发服务器
$frontendArgs = @(
    "-NoExit"
    "-Command"
    "cd '$frontendPath'; Write-Host '🎨 启动前端服务...' -ForegroundColor Green; npm run dev"
)

try {
    $frontendProcess = Start-Process -FilePath "pwsh" -ArgumentList $frontendArgs -PassThru -WindowStyle Normal
    Write-Host "✅ 前端服务启动中... (PID: $($frontendProcess.Id))" -ForegroundColor Green
} catch {
    Write-Host "❌ 前端服务启动失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. 显示启动信息
Write-Host "`n🎉 SmartAbp 开发环境启动完成！" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🌐 后端服务: https://localhost:44379" -ForegroundColor Cyan
Write-Host "🎨 前端服务: http://localhost:11369" -ForegroundColor Cyan
Write-Host "📊 健康检查: https://localhost:44379/health-status" -ForegroundColor Cyan
Write-Host "📚 API文档: https://localhost:44379/swagger" -ForegroundColor Cyan
Write-Host "`n💡 提示:" -ForegroundColor Yellow
Write-Host "   - 使用 Ctrl+C 停止服务" -ForegroundColor Gray
Write-Host "   - 重新运行时使用 -Clean 参数清理进程" -ForegroundColor Gray
Write-Host "   - 如遇问题，先运行 fix-cursor-terminal.ps1" -ForegroundColor Gray

if ($Verbose) {
    Write-Host "`n📋 进程信息:" -ForegroundColor Yellow
    Write-Host "   后端进程 PID: $($backendProcess.Id)" -ForegroundColor Gray
    Write-Host "   前端进程 PID: $($frontendProcess.Id)" -ForegroundColor Gray
}

Write-Host "`n按任意键退出启动脚本..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
