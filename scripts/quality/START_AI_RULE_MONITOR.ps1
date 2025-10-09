# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AI规则自动加载监控器 - 快速启动脚本
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔥 启动AI规则30分钟自动加载监控器" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏰ 监控模式: 每30分钟自动提醒AI加载规则" -ForegroundColor Yellow
Write-Host "📋 规则文件: 6个核心规则文件" -ForegroundColor Yellow
Write-Host "🔔 通知方式: 终端提示 + 系统通知" -ForegroundColor Yellow
Write-Host ""

Write-Host "按 Ctrl+C 停止监控..." -ForegroundColor Gray
Write-Host ""

# 启动监控模式
& "$PSScriptRoot\auto-rule-reminder.ps1" monitor

