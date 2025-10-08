#!/usr/bin/env pwsh
<#
.SYNOPSIS
    SmartAbp 文档自动归档工具

.DESCRIPTION
    自动将旧的、非核心的文档迁移到 .archive/ 目录
    减少 docs/ 目录的文档数量，提升项目可维护性

.PARAMETER DryRun
    模拟运行，不实际移动文件

.PARAMETER Force
    强制执行，不需要确认

.EXAMPLE
    .\archive-old-docs.ps1 -DryRun
    .\archive-old-docs.ps1 -Force

.NOTES
    Author: SmartAbp Team
    Version: 1.0
    Date: 2025-10-08
#>

param(
    [switch]$DryRun,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   SmartAbp 文档自动归档工具 v1.0                         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 配置
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$docsDir = Join-Path $projectRoot "docs"
$archiveDir = Join-Path $projectRoot ".archive"

# 需要归档的目录
$archiveDirs = @(
    "工作计划",
    "紧急修复",
    "测试验证",
    "项目报告",
    "架构重构",
    "架构审查",
    "战略升级"
)

# 统计信息
$stats = @{
    TotalFiles = 0
    MovedFiles = 0
    TotalSizeMB = 0
    Errors = 0
}

# 创建归档目录
if (-not (Test-Path $archiveDir)) {
    Write-Host "📁 创建归档目录: .archive/" -ForegroundColor Yellow
    if (-not $DryRun) {
        New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
    }
}

# 确保 .gitignore 包含 .archive/
$gitignorePath = Join-Path $projectRoot ".gitignore"
if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content $gitignorePath -Raw
    if ($gitignoreContent -notmatch "\.archive/") {
        Write-Host "📝 添加 .archive/ 到 .gitignore" -ForegroundColor Yellow
        if (-not $DryRun) {
            Add-Content -Path $gitignorePath -Value "`n# 文档归档（不纳入版本控制）`n.archive/"
        }
    }
}

# 遍历需要归档的目录
foreach ($dir in $archiveDirs) {
    $sourcePath = Join-Path $docsDir $dir
    
    if (-not (Test-Path $sourcePath)) {
        Write-Host "⏭️  跳过: $dir (目录不存在)" -ForegroundColor Gray
        continue
    }
    
    $files = Get-ChildItem -Path $sourcePath -Recurse -File -Filter "*.md"
    $fileCount = $files.Count
    $totalSize = ($files | Measure-Object -Property Length -Sum).Sum / 1MB
    
    $stats.TotalFiles += $fileCount
    $stats.TotalSizeMB += $totalSize
    
    Write-Host ""
    Write-Host "📂 处理目录: $dir" -ForegroundColor Cyan
    Write-Host "   文件数: $fileCount" -ForegroundColor White
    Write-Host "   大小: $([math]::Round($totalSize, 2)) MB" -ForegroundColor White
    
    if ($fileCount -eq 0) {
        Write-Host "   ⏭️  跳过（无文件）" -ForegroundColor Gray
        continue
    }
    
    # 询问确认
    if (-not $DryRun -and -not $Force) {
        $confirm = Read-Host "   是否归档? (Y/N)"
        if ($confirm -ne 'Y') {
            Write-Host "   ⏭️  已跳过" -ForegroundColor Gray
            continue
        }
    }
    
    # 创建目标目录
    $targetPath = Join-Path $archiveDir $dir
    if (-not $DryRun) {
        New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
    }
    
    # 移动文件
    try {
        if ($DryRun) {
            Write-Host "   🔄 [DRY RUN] 将移动 $fileCount 个文件到 .archive/$dir/" -ForegroundColor Yellow
        } else {
            Write-Host "   🔄 正在移动文件..." -ForegroundColor Yellow
            Move-Item -Path $sourcePath -Destination $targetPath -Force
            Write-Host "   ✅ 已移动 $fileCount 个文件" -ForegroundColor Green
        }
        $stats.MovedFiles += $fileCount
    } catch {
        Write-Host "   ❌ 错误: $_" -ForegroundColor Red
        $stats.Errors++
    }
}

# 处理架构设计目录的历史版本
Write-Host ""
Write-Host "📂 处理目录: 架构设计（历史版本）" -ForegroundColor Cyan

$architectureDir = Join-Path $docsDir "架构设计"
if (Test-Path $architectureDir) {
    # 查找历史版本文件（版本号<v17）
    $oldVersionFiles = Get-ChildItem -Path $architectureDir -File -Filter "*v[0-9]*.md" | 
        Where-Object { $_.Name -notmatch "v1[7-9]" -and $_.Name -notmatch "v[2-9][0-9]" }
    
    $fileCount = $oldVersionFiles.Count
    if ($fileCount -gt 0) {
        $totalSize = ($oldVersionFiles | Measure-Object -Property Length -Sum).Sum / 1MB
        $stats.TotalFiles += $fileCount
        $stats.TotalSizeMB += $totalSize
        
        Write-Host "   发现 $fileCount 个历史版本文件" -ForegroundColor White
        Write-Host "   大小: $([math]::Round($totalSize, 2)) MB" -ForegroundColor White
        
        # 询问确认
        if (-not $DryRun -and -not $Force) {
            $confirm = Read-Host "   是否归档? (Y/N)"
            if ($confirm -ne 'Y') {
                Write-Host "   ⏭️  已跳过" -ForegroundColor Gray
            } else {
                $doMove = $true
            }
        } else {
            $doMove = $true
        }
        
        if ($doMove) {
            $targetPath = Join-Path $archiveDir "架构设计_历史版本"
            if (-not $DryRun) {
                New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
            }
            
            foreach ($file in $oldVersionFiles) {
                try {
                    if ($DryRun) {
                        Write-Host "   🔄 [DRY RUN] 将移动: $($file.Name)" -ForegroundColor Yellow
                    } else {
                        Move-Item -Path $file.FullName -Destination $targetPath -Force
                    }
                } catch {
                    Write-Host "   ❌ 错误: $_" -ForegroundColor Red
                    $stats.Errors++
                }
            }
            
            if (-not $DryRun) {
                Write-Host "   ✅ 已移动 $fileCount 个历史版本文件" -ForegroundColor Green
            }
            $stats.MovedFiles += $fileCount
        }
    } else {
        Write-Host "   ⏭️  未发现历史版本文件" -ForegroundColor Gray
    }
}

# 输出统计信息
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   归档统计                                                ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 扫描文件总数: $($stats.TotalFiles)" -ForegroundColor White
Write-Host "📦 已归档文件数: $($stats.MovedFiles)" -ForegroundColor Green
Write-Host "💾 归档总大小: $([math]::Round($stats.TotalSizeMB, 2)) MB" -ForegroundColor White
Write-Host "❌ 错误数: $($stats.Errors)" -ForegroundColor $(if ($stats.Errors -gt 0) { "Red" } else { "Green" })

if ($DryRun) {
    Write-Host ""
    Write-Host "⚠️  这是模拟运行，未实际移动文件" -ForegroundColor Yellow
    Write-Host "💡 使用 -Force 参数执行实际操作" -ForegroundColor Yellow
}

# 输出 docs/ 目录的当前状态
Write-Host ""
Write-Host "📁 当前 docs/ 目录状态:" -ForegroundColor Cyan
$remainingFiles = (Get-ChildItem -Path $docsDir -Recurse -File -Filter "*.md").Count
$remainingSize = (Get-ChildItem -Path $docsDir -Recurse -File -Filter "*.md" | 
    Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "   剩余文件数: $remainingFiles" -ForegroundColor White
Write-Host "   剩余大小: $([math]::Round($remainingSize, 2)) MB" -ForegroundColor White

if ($remainingFiles -gt 100) {
    Write-Host "   ⚠️  警告: 文档数量仍然较多，建议进一步清理" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ 文档数量已优化" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ 归档完成!" -ForegroundColor Green
Write-Host ""

