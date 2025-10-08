#!/usr/bin/env pwsh
<#
.SYNOPSIS
    快速归档非核心文档（一键执行）

.DESCRIPTION
    立即将非核心文档迁移到 .archive/ 目录
    自动处理，无需确认

.EXAMPLE
    .\quick-archive.ps1
#>

Write-Host "🚀 SmartAbp 快速文档归档工具" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$archiveDir = Join-Path $projectRoot ".archive"

# 创建归档目录
if (-not (Test-Path $archiveDir)) {
    Write-Host "📁 创建归档目录..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
}

# 添加到 .gitignore
$gitignorePath = Join-Path $projectRoot ".gitignore"
$gitignoreContent = Get-Content $gitignorePath -Raw -ErrorAction SilentlyContinue
if ($gitignoreContent -notmatch "\.archive/") {
    Write-Host "📝 更新 .gitignore..." -ForegroundColor Yellow
    Add-Content -Path $gitignorePath -Value "`n# 文档归档`n.archive/"
}

# 归档目录列表
$dirs = @("工作计划", "紧急修复", "测试验证", "项目报告", "架构重构", "架构审查")

$totalMoved = 0
foreach ($dir in $dirs) {
    $sourcePath = Join-Path (Join-Path $projectRoot "docs") $dir
    if (Test-Path $sourcePath) {
        $fileCount = (Get-ChildItem -Path $sourcePath -Recurse -File -Filter "*.md").Count
        if ($fileCount -gt 0) {
            Write-Host "📦 归档: $dir ($fileCount 个文件)" -ForegroundColor Green
            Move-Item -Path $sourcePath -Destination $archiveDir -Force -ErrorAction SilentlyContinue
            $totalMoved += $fileCount
        }
    }
}

Write-Host ""
Write-Host "✅ 归档完成! 共移动 $totalMoved 个文件" -ForegroundColor Green
Write-Host "📁 归档位置: .archive/" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 提示: .archive/ 目录不会被Git跟踪" -ForegroundColor Yellow
Write-Host ""

