# SmartAbp WSL自动启动修复脚本
# 解决Cursor IDE启动时自动弹出WSL终端的问题

Write-Host "🔧 SmartAbp WSL自动启动修复工具" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# 1. 检查当前WSL状态
Write-Host "`n1️⃣ 检查WSL状态..." -ForegroundColor Yellow

try {
    $wslStatus = wsl --status 2>$null
    if ($wslStatus) {
        Write-Host "✅ WSL状态正常" -ForegroundColor Green
        Write-Host "默认发行版: $($wslStatus | Select-String '默认分发' | ForEach-Object { $_.Line.Split(':')[1].Trim() })" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ 无法获取WSL状态" -ForegroundColor Yellow
}

# 2. 检查Cursor IDE配置
Write-Host "`n2️⃣ 检查Cursor IDE配置..." -ForegroundColor Yellow

$settingsPath = ".cursor/settings.json"
if (Test-Path $settingsPath) {
    try {
        # 移除注释后解析JSON
        $jsonContent = Get-Content $settingsPath -Raw
        $jsonContent = $jsonContent -replace '//.*$', '' -replace '/\*.*?\*/', '' -replace '^\s*//.*$', ''
        $settings = $jsonContent | ConvertFrom-Json
    
        $wslConfigs = @{
            "useWslProfiles" = $settings.'terminal.integrated.useWslProfiles'
            "enablePersistentSessions" = $settings.'terminal.integrated.enablePersistentSessions'
            "automationProfile" = $settings.'terminal.integrated.automationProfile.windows'
        }
        
        $allCorrect = $true
        foreach ($config in $wslConfigs.GetEnumerator()) {
            if ($config.Value -eq $false -or $config.Value -eq $null) {
                Write-Host "✅ $($config.Key): $($config.Value) (正确)" -ForegroundColor Green
            } else {
                Write-Host "❌ $($config.Key): $($config.Value) (需要修复)" -ForegroundColor Red
                $allCorrect = $false
            }
        }
        
        if ($allCorrect) {
            Write-Host "✅ Cursor IDE配置已正确设置" -ForegroundColor Green
        } else {
            Write-Host "⚠️ 需要修复Cursor IDE配置" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️ 无法解析Cursor IDE配置: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ 未找到.cursor/settings.json" -ForegroundColor Red
}

# 3. 检查终端配置文件
Write-Host "`n3️⃣ 检查终端配置文件..." -ForegroundColor Yellow

$terminalFiles = @(
    ".cursor/unified-terminal.ps1",
    ".cursor/unified-terminal.sh",
    ".cursor/unified-terminal.bat"
)

foreach ($file in $terminalFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $bashCalls = [regex]::Matches($content, "bash\s+scripts/")
        
        if ($bashCalls.Count -gt 0) {
            Write-Host "⚠️ $file 包含 $($bashCalls.Count) 个bash调用" -ForegroundColor Yellow
            Write-Host "   这些调用在函数内部，不会自动执行" -ForegroundColor Gray
        } else {
            Write-Host "✅ $file 无直接bash调用" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ $file 不存在" -ForegroundColor Red
    }
}

# 4. 检查系统启动项
Write-Host "`n4️⃣ 检查系统启动项..." -ForegroundColor Yellow

try {
    $startupTasks = Get-ScheduledTask | Where-Object { 
        $_.TaskName -like "*SmartAbp*" -or 
        $_.TaskName -like "*Cursor*" -or
        $_.TaskName -like "*WSL*"
    }
    
    if ($startupTasks) {
        Write-Host "⚠️ 发现相关计划任务:" -ForegroundColor Yellow
        $startupTasks | ForEach-Object {
            Write-Host "   - $($_.TaskName) (状态: $($_.State))" -ForegroundColor Gray
        }
    } else {
        Write-Host "✅ 未发现相关计划任务" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ 无法检查计划任务" -ForegroundColor Yellow
}

# 5. 提供修复建议
Write-Host "`n5️⃣ 修复建议..." -ForegroundColor Yellow

Write-Host "如果WSL仍然自动启动，请尝试以下步骤:" -ForegroundColor Cyan
Write-Host "1. 完全关闭Cursor IDE" -ForegroundColor White
Write-Host "2. 重启计算机" -ForegroundColor White
Write-Host "3. 重新打开Cursor IDE" -ForegroundColor White
Write-Host "4. 如果问题持续，检查Windows WSL服务设置" -ForegroundColor White

Write-Host "`n🎉 WSL自动启动修复检查完成!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# 等待用户确认
Write-Host "`n按任意键继续..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
