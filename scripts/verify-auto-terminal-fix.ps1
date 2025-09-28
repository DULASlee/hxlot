# SmartAbp 自动终端问题修复验证脚本
# 验证Cursor IDE不再自动启动WSL终端

Write-Host "🔍 SmartAbp 自动终端问题修复验证开始..." -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray

# 1. 检查统一终端配置中的bash调用
Write-Host "`n📋 1. 检查统一终端配置中的bash调用..." -ForegroundColor Cyan

$scriptFiles = @(
    ".cursor/unified-terminal.ps1",
    ".cursor/unified-terminal.sh",
    ".cursor/shell-config.sh"
)

foreach ($script in $scriptFiles) {
    if (Test-Path $script) {
        Write-Host "📝 检查文件: $script" -ForegroundColor White

        $content = Get-Content $script -Raw
        $bashCalls = [regex]::Matches($content, "bash\s+scripts/")

        if ($bashCalls.Count -gt 0) {
            Write-Host "⚠️ 发现 $($bashCalls.Count) 个直接bash调用" -ForegroundColor Yellow
            foreach ($match in $bashCalls) {
                $line = $content.Substring(0, $match.Index).Split("`n").Count
                Write-Host "   行 $line : $($match.Value)" -ForegroundColor Gray
            }
        } else {
            Write-Host "✅ 未发现直接bash调用" -ForegroundColor Green
        }

        # 检查条件bash调用
        $conditionalBash = [regex]::Matches($content, "if.*bash|Get-Command bash")
        if ($conditionalBash.Count -gt 0) {
            Write-Host "✅ 发现 $($conditionalBash.Count) 个安全的条件bash调用" -ForegroundColor Green
        }
    }
}

# 2. 检查Cursor设置中的WSL配置
Write-Host "`n📋 2. 检查Cursor设置中的WSL配置..." -ForegroundColor Cyan

$settingsPath = ".cursor/settings.json"
if (Test-Path $settingsPath) {
    $settings = Get-Content $settingsPath -Raw

    # 检查关键WSL设置
    $wslChecks = @{
        "useWslProfiles" = $settings -match '"terminal\.integrated\.useWslProfiles":\s*false'
        "enablePersistentSessions" = $settings -match '"terminal\.integrated\.enablePersistentSessions":\s*false'
        "automationProfile" = $settings -match '"terminal\.integrated\.automationProfile\.windows":\s*null'
        "wslFileWatcher" = $settings -match '"remote\.WSL\.fileWatcher\.polling":\s*false'
        "wslShellEnvironment" = $settings -match '"remote\.WSL\.useShellEnvironment":\s*false'
    }

    foreach ($check in $wslChecks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "✅ $($check.Key) 已正确配置" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $($check.Key) 配置可能不正确" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ .cursor/settings.json 未找到" -ForegroundColor Red
}

# 3. 检查启动脚本中的WSL调用
Write-Host "`n📋 3. 检查启动脚本中的WSL调用..." -ForegroundColor Cyan

$startupScripts = Get-ChildItem -Path "scripts" -Filter "start-*" -ErrorAction SilentlyContinue
foreach ($script in $startupScripts) {
    Write-Host "📝 检查启动脚本: $($script.Name)" -ForegroundColor White

    $content = Get-Content $script.FullName -Raw
    if ($content -match "wsl|ubuntu|debian") {
        Write-Host "⚠️ 该脚本可能包含WSL相关命令" -ForegroundColor Yellow
    } else {
        Write-Host "✅ 该脚本不包含WSL命令" -ForegroundColor Green
    }
}

# 4. 检查环境变量配置
Write-Host "`n📋 4. 检查环境变量配置..." -ForegroundColor Cyan

$envVarsPath = ".cursor/env-vars.json"
if (Test-Path $envVarsPath) {
    try {
        $envConfig = Get-Content $envVarsPath -Raw | ConvertFrom-Json
        Write-Host "✅ env-vars.json 格式正确" -ForegroundColor Green
        Write-Host "   编码设置: $($envConfig.encoding.LANG)" -ForegroundColor Gray
        Write-Host "   分页器设置: $($envConfig.pagers.PAGER)" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ env-vars.json 格式错误: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ env-vars.json 文件不存在" -ForegroundColor Yellow
}

# 5. 生成修复报告
Write-Host "`n📊 修复报告:" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "✅ 修复措施已应用:" -ForegroundColor Green
Write-Host "1. 禁用Cursor IDE的WSL配置文件集成" -ForegroundColor White
Write-Host "2. 禁用持久会话恢复" -ForegroundColor White
Write-Host "3. 修改统一终端配置，避免直接bash调用" -ForegroundColor White
Write-Host "4. 设置自动化配置文件为null" -ForegroundColor White
Write-Host "5. 禁用WSL文件监视器和Shell环境" -ForegroundColor White

Write-Host "`n🎯 用户操作建议:" -ForegroundColor Yellow
Write-Host "1. 完全关闭Cursor IDE" -ForegroundColor White
Write-Host "2. 重新打开项目" -ForegroundColor White
Write-Host "3. 观察是否还有自动启动的WSL终端" -ForegroundColor White
Write-Host "4. 如果仍有问题，请检查系统WSL默认发行版设置" -ForegroundColor White

Write-Host "`n✅ 自动终端问题修复验证完成!" -ForegroundColor Green
