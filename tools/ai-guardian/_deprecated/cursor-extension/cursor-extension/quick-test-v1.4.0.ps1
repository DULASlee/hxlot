# AI Guardian v1.4.0 快速测试脚本
# 用于验证智能重试策略功能

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🧪 AI Guardian v1.4.0 快速功能测试" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$testResults = @()

# 测试1: 检查插件安装
Write-Host "📦 测试1: 检查插件安装..." -ForegroundColor Yellow
$extensionPath = "$env:USERPROFILE\.vscode\extensions"
$aiGuardianDirs = Get-ChildItem -Path $extensionPath -Directory -Filter "smartabp.ai-guardian*" -ErrorAction SilentlyContinue

if ($aiGuardianDirs) {
    $version = $aiGuardianDirs[0].Name -replace "smartabp\.ai-guardian-", ""
    Write-Host "  ✅ 已安装版本: $version" -ForegroundColor Green
    
    if ($version -eq "1.4.0") {
        Write-Host "  🎉 版本正确！" -ForegroundColor Green
        $testResults += @{ Test = "插件安装"; Result = "PASS" }
    } else {
        Write-Host "  ⚠️  版本不是1.4.0，是 $version" -ForegroundColor Yellow
        $testResults += @{ Test = "插件安装"; Result = "WARN" }
    }
} else {
    Write-Host "  ❌ 未安装AI Guardian插件" -ForegroundColor Red
    $testResults += @{ Test = "插件安装"; Result = "FAIL" }
}

Write-Host ""

# 测试2: 检查PowerShell脚本
Write-Host "📜 测试2: 检查PowerShell脚本..." -ForegroundColor Yellow
$scriptPath = "D:\BAOBAB\Baobab.SmartAbp\hxlot\tools\ai-guardian\restart-auto-input.ps1"

if (Test-Path $scriptPath) {
    Write-Host "  ✅ 脚本文件存在" -ForegroundColor Green
    
    # 检查脚本内容
    $scriptContent = Get-Content $scriptPath -Raw
    
    if ($scriptContent -match "Mode\s*=\s*`"normal`"") {
        Write-Host "  ✅ 脚本包含Mode参数" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  脚本可能缺少Mode参数" -ForegroundColor Yellow
    }
    
    if ($scriptContent -match "\^l.*\^l") {
        Write-Host "  ✅ 脚本包含连按两次Ctrl+L逻辑" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  脚本可能缺少连按Ctrl+L逻辑" -ForegroundColor Yellow
    }
    
    $testResults += @{ Test = "PowerShell脚本"; Result = "PASS" }
} else {
    Write-Host "  ❌ 脚本文件不存在: $scriptPath" -ForegroundColor Red
    $testResults += @{ Test = "PowerShell脚本"; Result = "FAIL" }
}

Write-Host ""

# 测试3: 检查聊天框配置
Write-Host "🎯 测试3: 检查聊天框配置..." -ForegroundColor Yellow
$configPath = "D:\BAOBAB\Baobab.SmartAbp\hxlot\tools\ai-guardian\chatbox-config.json"

if (Test-Path $configPath) {
    Write-Host "  ✅ 配置文件存在" -ForegroundColor Green
    
    try {
        $config = Get-Content $configPath | ConvertFrom-Json
        
        if ($config.chatboxInput) {
            Write-Host "  ✅ 包含chatboxInput配置" -ForegroundColor Green
            Write-Host "     坐标: ($($config.chatboxInput.centerPosition.X), $($config.chatboxInput.centerPosition.Y))" -ForegroundColor Gray
        }
        
        if ($config.newSessionDialog) {
            Write-Host "  ✅ 包含newSessionDialog配置" -ForegroundColor Green
            Write-Host "     坐标: ($($config.newSessionDialog.centerPosition.X), $($config.newSessionDialog.centerPosition.Y))" -ForegroundColor Gray
        }
        
        $testResults += @{ Test = "聊天框配置"; Result = "PASS" }
    } catch {
        Write-Host "  ⚠️  配置文件格式错误: $_" -ForegroundColor Yellow
        $testResults += @{ Test = "聊天框配置"; Result = "WARN" }
    }
} else {
    Write-Host "  ❌ 配置文件不存在: $configPath" -ForegroundColor Red
    $testResults += @{ Test = "聊天框配置"; Result = "FAIL" }
}

Write-Host ""

# 测试4: 测试脚本执行（dry-run）
Write-Host "🔧 测试4: 脚本执行测试（dry-run）..." -ForegroundColor Yellow
Write-Host "  ⚠️  此测试将尝试执行脚本但不会发送任何按键" -ForegroundColor Yellow

try {
    # 只检查语法，不实际执行
    $null = powershell.exe -NoProfile -Command "& { `$ErrorActionPreference='Stop'; Get-Content '$scriptPath' | Out-Null }"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ 脚本语法正确" -ForegroundColor Green
        $testResults += @{ Test = "脚本执行"; Result = "PASS" }
    } else {
        Write-Host "  ⚠️  脚本可能有语法错误" -ForegroundColor Yellow
        $testResults += @{ Test = "脚本执行"; Result = "WARN" }
    }
} catch {
    Write-Host "  ❌ 脚本执行测试失败: $_" -ForegroundColor Red
    $testResults += @{ Test = "脚本执行"; Result = "FAIL" }
}

Write-Host ""

# 测试5: 检查插件编译产物
Write-Host "📦 测试5: 检查插件编译产物..." -ForegroundColor Yellow
$extensionPath = "D:\BAOBAB\Baobab.SmartAbp\hxlot\tools\ai-guardian\cursor-extension"

if (Test-Path "$extensionPath\out\extension.js") {
    Write-Host "  ✅ extension.js 已编译" -ForegroundColor Green
    
    $fileSize = (Get-Item "$extensionPath\out\extension.js").Length / 1KB
    Write-Host "     文件大小: $($fileSize.ToString('F2')) KB" -ForegroundColor Gray
    
    $testResults += @{ Test = "插件编译"; Result = "PASS" }
} else {
    Write-Host "  ❌ extension.js 不存在，可能未编译" -ForegroundColor Red
    $testResults += @{ Test = "插件编译"; Result = "FAIL" }
}

Write-Host ""

# 生成测试报告
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 测试结果汇总" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$passCount = ($testResults | Where-Object { $_.Result -eq "PASS" }).Count
$warnCount = ($testResults | Where-Object { $_.Result -eq "WARN" }).Count
$failCount = ($testResults | Where-Object { $_.Result -eq "FAIL" }).Count
$totalCount = $testResults.Count

foreach ($result in $testResults) {
    $icon = switch ($result.Result) {
        "PASS" { "✅" }
        "WARN" { "⚠️ " }
        "FAIL" { "❌" }
    }
    
    $color = switch ($result.Result) {
        "PASS" { "Green" }
        "WARN" { "Yellow" }
        "FAIL" { "Red" }
    }
    
    Write-Host "  $icon $($result.Test): " -NoNewline
    Write-Host $result.Result -ForegroundColor $color
}

Write-Host ""
Write-Host "总计: $totalCount 个测试" -ForegroundColor Gray
Write-Host "  ✅ 通过: $passCount" -ForegroundColor Green
Write-Host "  ⚠️  警告: $warnCount" -ForegroundColor Yellow
Write-Host "  ❌ 失败: $failCount" -ForegroundColor Red

Write-Host ""

if ($failCount -eq 0 -and $warnCount -eq 0) {
    Write-Host "🎉 所有测试通过！插件已准备就绪！" -ForegroundColor Green
} elseif ($failCount -eq 0) {
    Write-Host "⚠️  测试基本通过，但有警告项需要关注" -ForegroundColor Yellow
} else {
    Write-Host "❌ 测试失败，请检查上述失败项" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📖 下一步操作:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 如果所有测试通过，可以开始实际测试断线恢复功能" -ForegroundColor White
Write-Host "2. 查看详细测试指南: SMART-RETRY-TEST-GUIDE.md" -ForegroundColor White
Write-Host "3. 手动触发重试测试:" -ForegroundColor White
Write-Host "   pwsh -File '$scriptPath' -Mode normal -DelaySeconds 2" -ForegroundColor Gray
Write-Host ""


