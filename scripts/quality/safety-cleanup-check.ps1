# SmartAbp 安全清理检查脚本
# 确保清理操作不会产生过度清理或系统不稳定

Write-Host "🛡️ SmartAbp 安全清理检查工具" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# 1. 检查清理脚本的安全性
Write-Host "`n1️⃣ 检查清理脚本安全性..." -ForegroundColor Yellow

$cleanupScripts = @(
    "scripts/fix-cursor-terminal.ps1",
    "scripts/cursor-performance-optimizer.ps1"
)

foreach ($script in $cleanupScripts) {
    if (Test-Path $script) {
        Write-Host "`n📝 检查脚本: $script" -ForegroundColor Cyan
        
        $content = Get-Content $script -Raw
        
        # 检查危险操作
        $dangerousOps = @{
            "删除系统文件" = $content -match "Remove-Item.*System32|Remove-Item.*Windows"
            "修改注册表" = $content -match "Set-ItemProperty.*HKLM|New-Item.*HKLM"
            "停止系统服务" = $content -match "Stop-Service.*System|Stop-Service.*Windows"
            "删除用户数据" = $content -match "Remove-Item.*Documents|Remove-Item.*Desktop"
            "网络重置" = $content -match "netsh winsock reset"
        }
        
        $hasDangerous = $false
        foreach ($op in $dangerousOps.GetEnumerator()) {
            if ($op.Value) {
                Write-Host "⚠️ 发现潜在危险操作: $($op.Key)" -ForegroundColor Yellow
                $hasDangerous = $true
            }
        }
        
        if (-not $hasDangerous) {
            Write-Host "✅ 脚本安全性检查通过" -ForegroundColor Green
        }
        
        # 检查安全措施
        $safetyMeasures = @{
            "错误处理" = $content -match "try\s*\{|catch\s*\{" 
            "备份机制" = $content -match "backup|Backup"
            "确认提示" = $content -match "Read-Host|Confirm"
            "路径验证" = $content -match "Test-Path"
        }
        
        Write-Host "   安全措施检查:" -ForegroundColor Gray
        foreach ($measure in $safetyMeasures.GetEnumerator()) {
            if ($measure.Value) {
                Write-Host "   ✅ $($measure.Key)" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️ $($measure.Key) (建议添加)" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "❌ 脚本不存在: $script" -ForegroundColor Red
    }
}

# 2. 检查清理范围
Write-Host "`n2️⃣ 检查清理范围..." -ForegroundColor Yellow

$safePaths = @(
    "src/SmartAbp.Vue/node_modules/.cache",
    "src/SmartAbp.Vue/node_modules/.vite", 
    "src/SmartAbp.Web/bin",
    "src/SmartAbp.Web/obj",
    "src/SmartAbp.Application/bin",
    "src/SmartAbp.Application/obj"
)

Write-Host "✅ 安全的清理路径:" -ForegroundColor Green
foreach ($path in $safePaths) {
    if (Test-Path $path) {
        $size = (Get-ChildItem $path -Recurse -File -ErrorAction SilentlyContinue | 
                Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "   📁 $path ($([math]::Round($size, 2)) MB)" -ForegroundColor Gray
    } else {
        Write-Host "   📁 $path (不存在)" -ForegroundColor Gray
    }
}

# 3. 检查系统保护
Write-Host "`n3️⃣ 检查系统保护措施..." -ForegroundColor Yellow

# 检查是否在管理员模式下运行
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if ($isAdmin) {
    Write-Host "⚠️ 当前在管理员模式下运行" -ForegroundColor Yellow
    Write-Host "   建议在普通用户模式下运行清理脚本" -ForegroundColor Gray
} else {
    Write-Host "✅ 当前在普通用户模式下运行" -ForegroundColor Green
}

# 检查关键系统进程
$criticalProcesses = @("explorer", "winlogon", "csrss", "wininit")
$runningCritical = Get-Process -Name $criticalProcesses -ErrorAction SilentlyContinue

if ($runningCritical.Count -eq $criticalProcesses.Count) {
    Write-Host "✅ 关键系统进程正常运行" -ForegroundColor Green
} else {
    Write-Host "⚠️ 部分关键系统进程可能异常" -ForegroundColor Yellow
}

# 4. 提供安全建议
Write-Host "`n4️⃣ 安全建议..." -ForegroundColor Yellow

Write-Host "🛡️ 清理操作安全建议:" -ForegroundColor Cyan
Write-Host "1. 始终在非管理员模式下运行清理脚本" -ForegroundColor White
Write-Host "2. 清理前先备份重要数据" -ForegroundColor White
Write-Host "3. 避免清理系统关键文件和注册表" -ForegroundColor White
Write-Host "4. 定期检查清理脚本的日志输出" -ForegroundColor White
Write-Host "5. 如发现问题，立即停止清理操作" -ForegroundColor White

Write-Host "`n✅ 安全清理检查完成!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# 等待用户确认
Write-Host "`n按任意键继续..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
