#!/usr/bin/env pwsh
<#
.SYNOPSIS
    一键运行Layer1/2/3集成测试（前后端联调）

.DESCRIPTION
    自动启动后端服务、等待就绪、运行Playwright测试、生成报告

.EXAMPLE
    pwsh -File scripts/testing/run-integration-tests.ps1
#>

param(
    [switch]$SkipBackendStart = $false,  # 跳过后端启动（如果已经启动）
    [switch]$Headed = $false,             # 是否显示浏览器（调试用）
    [int]$Timeout = 120                   # 后端启动超时时间（秒）
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 Layer1/2/3集成测试执行器" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 步骤1: 检查后端服务状态
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "🔍 步骤1: 检查后端服务状态..." -ForegroundColor Yellow
Write-Host ""

$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9002/swagger/v1/swagger.json" `
        -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $backendRunning = $true
        Write-Host "   ✅ 后端服务已运行" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  后端服务未运行" -ForegroundColor Yellow
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 步骤2: 启动后端服务（如果需要）
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$backendProcess = $null

if (-not $backendRunning -and -not $SkipBackendStart) {
    Write-Host "🚀 步骤2: 启动后端服务..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "   📋 启动命令: dotnet run --project src/SmartAbp.Web" -ForegroundColor White
    Write-Host "   ⏱️  超时时间: $Timeout 秒" -ForegroundColor White
    Write-Host ""
    
    # 启动后端服务（后台进程）
    $backendProcess = Start-Process -FilePath "dotnet" `
        -ArgumentList "run --project src/SmartAbp.Web --verbosity quiet" `
        -NoNewWindow `
        -PassThru `
        -RedirectStandardOutput "logs/backend-test.log" `
        -RedirectStandardError "logs/backend-test-error.log"
    
    Write-Host "   ⏱️  等待后端服务就绪..." -ForegroundColor Cyan
    
    # 等待后端服务就绪（最多等待Timeout秒）
    $startTime = Get-Date
    $ready = $false
    
    while (-not $ready -and ((Get-Date) - $startTime).TotalSeconds -lt $Timeout) {
        Start-Sleep -Seconds 2
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:9002/swagger/v1/swagger.json" `
                -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $ready = $true
                Write-Host "   ✅ 后端服务已就绪" -ForegroundColor Green
            }
        } catch {
            Write-Host "   ⏳ 等待中..." -ForegroundColor Gray -NoNewline
            Write-Host "`r" -NoNewline
        }
    }
    
    if (-not $ready) {
        Write-Host ""
        Write-Host "   ❌ 后端服务启动超时（$Timeout 秒）" -ForegroundColor Red
        Write-Host ""
        Write-Host "   💡 请检查日志:" -ForegroundColor Yellow
        Write-Host "      • logs/backend-test.log" -ForegroundColor White
        Write-Host "      • logs/backend-test-error.log" -ForegroundColor White
        Write-Host ""
        if ($backendProcess) {
            Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        }
        exit 1
    }
    
    Write-Host ""
} elseif ($SkipBackendStart) {
    Write-Host "⏭️  步骤2: 跳过后端启动（--SkipBackendStart）" -ForegroundColor Yellow
    Write-Host ""
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 步骤3: 运行Playwright测试
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "🧪 步骤3: 运行Playwright测试..." -ForegroundColor Yellow
Write-Host ""

Write-Host "   📋 测试范围:" -ForegroundColor White
Write-Host "      • 用户登录流程" -ForegroundColor White
Write-Host "      • Portal工作台页面" -ForegroundColor White
Write-Host "      • Layer1 - UltraSimpleStudio" -ForegroundColor White
Write-Host "      • Layer2 - SmartStudioLite" -ForegroundColor White
Write-Host "      • Layer3 - Studio Pro" -ForegroundColor White
Write-Host "      • 前后端API联调" -ForegroundColor White
Write-Host "      • Console错误检查" -ForegroundColor White
Write-Host ""

# 切换到前端目录
Set-Location -Path "src/SmartAbp.Vue"

# 运行Playwright测试
$testArgs = @("test", "--project=chromium")
if ($Headed) {
    $testArgs += "--headed"
}

Write-Host "   ⏱️  开始测试..." -ForegroundColor Cyan
Write-Host ""

$testExitCode = 0
try {
    npx playwright @testArgs
    $testExitCode = $LASTEXITCODE
} catch {
    Write-Host "   ❌ 测试执行失败: $_" -ForegroundColor Red
    $testExitCode = 1
}

Write-Host ""

# 返回根目录
Set-Location -Path "../.."

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 步骤4: 生成测试报告
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "📊 步骤4: 生成测试报告..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "src/SmartAbp.Vue/playwright-report") {
    Write-Host "   ✅ HTML报告已生成" -ForegroundColor Green
    Write-Host "      位置: src/SmartAbp.Vue/playwright-report/index.html" -ForegroundColor White
    Write-Host ""
    Write-Host "   💡 查看报告:" -ForegroundColor Yellow
    Write-Host "      cd src/SmartAbp.Vue" -ForegroundColor White
    Write-Host "      npx playwright show-report" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "   ⚠️  未找到测试报告" -ForegroundColor Yellow
    Write-Host ""
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 步骤5: 清理（停止后端服务）
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if ($backendProcess) {
    Write-Host "🧹 步骤5: 清理后端服务..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ 后端服务已停止" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  后端服务停止失败（可能已停止）" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 最终总结
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 测试执行总结" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if ($testExitCode -eq 0) {
    Write-Host "   ✅ 测试全部通过" -ForegroundColor Green
    Write-Host ""
    Write-Host "   🎉 Layer1/2/3集成测试成功！" -ForegroundColor Green
    Write-Host "   🎉 前后端联调验证通过！" -ForegroundColor Green
} else {
    Write-Host "   ❌ 测试失败（退出码: $testExitCode）" -ForegroundColor Red
    Write-Host ""
    Write-Host "   💡 请查看测试报告了解详情" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

exit $testExitCode

