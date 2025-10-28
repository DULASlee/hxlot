#!/usr/bin/env pwsh
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🧹 清理API生成文件中的错误导入
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 用途：移除带版本号后缀的重复导入和模型引用
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🧹 清理API生成文件" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 定义要清理的目录
$generatedDir = "src/SmartAbp.Vue/src/api/generated"

# 检查目录是否存在
if (-not (Test-Path $generatedDir)) {
    Write-Host "❌ 目录不存在: $generatedDir" -ForegroundColor Red
    exit 1
}

# 定义匹配模式：带版本号的长文件名
$versionPattern = "_Version_\d+_\d+_\d+_\d+_Culture_neutral_PublicKeyToken_\w+_"
$systemStringPattern = "System_String_System_Private_CoreLib_Version_\d+_\d+_\d+_\d+_Culture_neutral_PublicKeyToken_\w+_"

Write-Host "📋 步骤1: 扫描需要清理的文件..." -ForegroundColor Yellow
Write-Host ""

# 获取所有需要清理的文件
$filesToClean = Get-ChildItem -Path $generatedDir -Recurse -Filter "*.ts" | Where-Object {
    $content = Get-Content $_.FullName -Raw
    $content -match $versionPattern -or $content -match $systemStringPattern
}

Write-Host "  找到 $($filesToClean.Count) 个需要清理的文件" -ForegroundColor White
Write-Host ""

if ($filesToClean.Count -eq 0) {
    Write-Host "✅ 没有需要清理的文件" -ForegroundColor Green
    exit 0
}

Write-Host "📋 步骤2: 清理文件..." -ForegroundColor Yellow
Write-Host ""

$cleanedCount = 0
$errorCount = 0

foreach ($file in $filesToClean) {
    try {
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content

        # 移除带版本号的导入语句（逐行处理）
        $lines = $content -split "`r?`n"
        $cleanedLines = $lines | Where-Object {
            $_ -notmatch $versionPattern -and $_ -notmatch $systemStringPattern
        }
        $content = $cleanedLines -join "`r`n"

        # 移除空行（多余的）
        $content = $content -replace "(`r?`n){3,}", "`r`n`r`n"

        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            Write-Host "  ✅ 已清理: $($file.Name)" -ForegroundColor Green
            $cleanedCount++
        }
    }
    catch {
        Write-Host "  ❌ 清理失败: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ 清理完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 清理统计:" -ForegroundColor Yellow
Write-Host "   • 已清理: $cleanedCount 个文件" -ForegroundColor White
Write-Host "   • 失败: $errorCount 个文件" -ForegroundColor White
Write-Host ""

if ($errorCount -gt 0) {
    exit 1
}

