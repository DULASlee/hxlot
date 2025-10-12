#!/usr/bin/env pwsh
# 清理项目根目录脚本

$ErrorActionPreference = "Stop"

Write-Host "🧹 开始清理项目根目录..." -ForegroundColor Cyan

# 需要保留的文件（白名单）
$keepFiles = @(
  'ai-guardian-3.0.2.vsix'  # 最新插件副本，方便用户安装
)

# 需要删除的文件模式（黑名单）
$deletePatterns = @(
  'ai-guardian-plugin*.vsix',
  'ai-guardian-2.0.0.vsix',
  'base.d.ts',
  'ours.d.ts',
  'theirs.d.ts',
  'extension.js',
  'package.json'  # 根目录不应有这个文件
)

$deletedCount = 0

foreach ($pattern in $deletePatterns) {
  $files = Get-ChildItem -Path . -File -Filter $pattern -ErrorAction SilentlyContinue
  foreach ($file in $files) {
    if ($keepFiles -notcontains $file.Name) {
      try {
        Remove-Item $file.FullName -Force
        Write-Host "  ✔ 已删除: $($file.Name)" -ForegroundColor Green
        $deletedCount++
      } catch {
        Write-Warning "  ⚠ 无法删除: $($file.Name) - $($_.Exception.Message)"
      }
    } else {
      Write-Host "  ⊙ 保留: $($file.Name)" -ForegroundColor Yellow
    }
  }
}

Write-Host ""
Write-Host "✅ 清理完成！删除了 $deletedCount 个文件" -ForegroundColor Green
Write-Host ""
Write-Host "📋 当前根目录文件清单:" -ForegroundColor Cyan
Get-ChildItem -Path . -File | Select-Object Name, Length | Format-Table -AutoSize

