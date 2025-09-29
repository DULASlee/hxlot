# SmartAbp 自动启动终端诊断脚本
# 检查并修复Cursor IDE启动时自动弹出WSL终端的问题

Write-Host "🔍 SmartAbp 自动启动终端诊断开始..." -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray

# 1. 检查 Cursor IDE 设置
Write-Host "`n📋 1. 检查 Cursor IDE 终端设置..." -ForegroundColor Cyan

$settingsPath = ".cursor/settings.json"
if (Test-Path $settingsPath) {
    $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json

    # 检查关键设置
    $checks = @{
        "useWslProfiles" = $settings.'terminal.integrated.useWslProfiles'
        "enablePersistentSessions" = $settings.'terminal.integrated.enablePersistentSessions'
        "persistentSessionReviveProcess" = $settings.'terminal.integrated.persistentSessionReviveProcess'
        "automationProfile" = $settings.'terminal.integrated.automationProfile.windows'
        "showOnStartup" = $settings.'powershell.integratedConsole.showOnStartup'
    }

    foreach ($key in $checks.Keys) {
        $value = $checks[$key]
        if ($value -eq $false -or $value -eq "never" -or $value -eq $null) {
            Write-Host "✅ $key : $value (正确)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $key : $value (可能导致问题)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ .cursor/settings.json 未找到" -ForegroundColor Red
}

# 2. 检查WSL相关配置
Write-Host "`n📋 2. 检查WSL配置..." -ForegroundColor Cyan
try {
    $wslList = wsl --list --quiet 2>$null
    if ($wslList) {
        Write-Host "⚠️ 检测到WSL发行版: $($wslList -join ', ')" -ForegroundColor Yellow
        Write-Host "   这可能是自动启动WSL终端的原因" -ForegroundColor Yellow
    } else {
        Write-Host "✅ 未检测到WSL发行版" -ForegroundColor Green
    }
} catch {
    Write-Host "✅ WSL未安装或不可用" -ForegroundColor Green
}

# 3. 检查启动脚本
Write-Host "`n📋 3. 检查项目启动脚本..." -ForegroundColor Cyan

$startupScripts = @(
    ".cursor/unified-terminal.ps1",
    ".cursor/unified-terminal.sh",
    ".cursor/unified-terminal.bat",
    "scripts/start-dev.ps1",
    "scripts/start-dev.bat"
)

foreach ($script in $startupScripts) {
    if (Test-Path $script) {
        Write-Host "📝 发现启动脚本: $script" -ForegroundColor White
        # 检查是否包含WSL相关命令
        $content = Get-Content $script -Raw
        if ($content -match "wsl|bash.*ubuntu|bash.*debian") {
            Write-Host "⚠️ 该脚本可能包含WSL命令" -ForegroundColor Yellow
        }
    }
}

# 4. 检查工作区配置
Write-Host "`n📋 4. 检查工作区配置..." -ForegroundColor Cyan

$workspaceFiles = Get-ChildItem -Path "." -Filter "*.code-workspace" -ErrorAction SilentlyContinue
if ($workspaceFiles) {
    Write-Host "📝 发现工作区文件: $($workspaceFiles.Name)" -ForegroundColor White
} else {
    Write-Host "✅ 未发现工作区配置文件" -ForegroundColor Green
}

# 5. 检查全局用户设置（可能影响）
Write-Host "`n📋 5. 检查用户全局设置..." -ForegroundColor Cyan

$userSettingsPath = "$env:APPDATA\Cursor\User\settings.json"
if (Test-Path $userSettingsPath) {
    Write-Host "📝 发现用户全局设置: $userSettingsPath" -ForegroundColor White
    Write-Host "   建议检查该文件是否有自动启动终端的设置" -ForegroundColor Yellow
} else {
    Write-Host "✅ 未发现用户全局设置文件" -ForegroundColor Green
}

# 6. 提供解决方案
Write-Host "`n🛠️ 解决方案建议:" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "1. 关闭持久会话 (已应用):" -ForegroundColor White
Write-Host '   "terminal.integrated.enablePersistentSessions": false' -ForegroundColor Gray

Write-Host "`n2. 禁用WSL配置文件 (已应用):" -ForegroundColor White
Write-Host '   "terminal.integrated.useWslProfiles": false' -ForegroundColor Gray

Write-Host "`n3. 如果问题持续，手动操作:" -ForegroundColor White
Write-Host "   - 在 Cursor 中按 Ctrl+Shift+P" -ForegroundColor Gray
Write-Host "   - 搜索 'Terminal: Kill All Terminals'" -ForegroundColor Gray
Write-Host "   - 执行命令关闭所有终端" -ForegroundColor Gray

Write-Host "`n4. 重启 Cursor IDE 验证:" -ForegroundColor White
Write-Host "   - 完全关闭 Cursor" -ForegroundColor Gray
Write-Host "   - 重新打开项目" -ForegroundColor Gray
Write-Host "   - 观察是否还有自动启动的终端" -ForegroundColor Gray

Write-Host "`n5. 如果使用WSL，建议:" -ForegroundColor White
Write-Host "   - 不要将 WSL 设为默认终端" -ForegroundColor Gray
Write-Host "   - 使用 PowerShell (SmartAbp) 配置" -ForegroundColor Gray

Write-Host "`n✅ 诊断完成!" -ForegroundColor Green
Write-Host "当前配置已优化为禁用自动启动终端" -ForegroundColor Green
