# SmartAbp Cursor IDE 终端修复脚本
# 解决终端卡住和进程冲突问题

Write-Host "🔧 SmartAbp Cursor IDE 终端修复工具" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# 1. 停止所有相关进程
Write-Host "1️⃣ 清理现有进程..." -ForegroundColor Yellow

# 停止所有dotnet进程（保留系统关键进程）
$dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*SmartAbp*" -or
    $_.ProcessName -eq "dotnet" -and $_.WorkingSet -gt 50MB
}

if ($dotnetProcesses) {
    Write-Host "发现 $($dotnetProcesses.Count) 个dotnet进程，正在停止..." -ForegroundColor Red
    $dotnetProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Write-Host "✅ 已停止进程 ID: $($_.Id)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ 无法停止进程 ID: $($_.Id)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✅ 未发现需要清理的dotnet进程" -ForegroundColor Green
}

# 停止node进程
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.WorkingSet -gt 30MB
}

if ($nodeProcesses) {
    Write-Host "发现 $($nodeProcesses.Count) 个node进程，正在停止..." -ForegroundColor Red
    $nodeProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Write-Host "✅ 已停止Node进程 ID: $($_.Id)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ 无法停止Node进程 ID: $($_.Id)" -ForegroundColor Yellow
        }
    }
}

# 2. 清理端口占用
Write-Host "`n2️⃣ 检查端口占用..." -ForegroundColor Yellow

$ports = @(44379, 11369, 44300, 5000, 5001)
foreach ($port in $ports) {
    $connections = netstat -ano | Select-String ":$port "
    if ($connections) {
        Write-Host "端口 $port 被占用:" -ForegroundColor Red
        $connections | ForEach-Object {
            $line = $_.Line
            if ($line -match "\s+(\d+)$") {
                $pid = $matches[1]
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "  进程: $($process.ProcessName) (PID: $pid)" -ForegroundColor Yellow
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        Write-Host "  ✅ 已释放端口 $port" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "  ⚠️ 无法停止占用端口 $port 的进程" -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Host "✅ 端口 $port 空闲" -ForegroundColor Green
    }
}

# 3. 清理临时文件和缓存
Write-Host "`n3️⃣ 清理缓存和临时文件..." -ForegroundColor Yellow

# 清理node_modules/.cache
$cacheDir = "src/SmartAbp.Vue/node_modules/.cache"
if (Test-Path $cacheDir) {
    Remove-Item $cacheDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ 已清理 Vite 缓存" -ForegroundColor Green
}

# 清理.vite缓存
$viteCache = "src/SmartAbp.Vue/node_modules/.vite"
if (Test-Path $viteCache) {
    Remove-Item $viteCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ 已清理 Vite 构建缓存" -ForegroundColor Green
}

# 清理dotnet临时文件
$tempDirs = @(
    "src/SmartAbp.Web/bin",
    "src/SmartAbp.Web/obj",
    "src/SmartAbp.Application/bin",
    "src/SmartAbp.Application/obj"
)

foreach ($dir in $tempDirs) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✅ 已清理 $dir" -ForegroundColor Green
    }
}

# 4. 重置网络配置
Write-Host "`n4️⃣ 重置网络配置..." -ForegroundColor Yellow

try {
    # 刷新DNS缓存
    ipconfig /flushdns | Out-Null
    Write-Host "✅ 已刷新DNS缓存" -ForegroundColor Green

    # 重置Winsock
    netsh winsock reset | Out-Null
    Write-Host "✅ 已重置网络堆栈" -ForegroundColor Green
} catch {
    Write-Host "⚠️ 网络重置需要管理员权限" -ForegroundColor Yellow
}

Write-Host "`n🎉 修复完成！建议重启Cursor IDE后再启动项目" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# 等待用户确认
Write-Host "`n按任意键继续..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
