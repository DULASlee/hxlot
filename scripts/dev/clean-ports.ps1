#!/usr/bin/env pwsh
<#
.SYNOPSIS
    清理SmartAbp项目占用的端口

.DESCRIPTION
    自动检测并终止占用以下端口的进程：
    - 前端开发服务器：5173 (Vite)
    - 后端API服务器：5000, 5001, 7296
    - 数据库端口：1433 (SQL Server), 3306 (MySQL), 5432 (PostgreSQL)

.EXAMPLE
    .\clean-ports.ps1
    清理所有SmartAbp相关端口

.EXAMPLE
    .\clean-ports.ps1 -Port 5173
    只清理指定端口
#>

param(
    [int[]]$Port = @(5173, 5000, 5001, 7296),
    [switch]$Force
)

$ErrorActionPreference = 'Continue'

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔧 SmartAbp 端口清理工具" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 端口名称映射
$portNames = @{
    5173 = "前端开发服务器 (Vite)"
    5000 = "后端API服务器 (HTTP)"
    5001 = "后端API服务器 (HTTPS)"
    7296 = "后端API服务器 (Aspire)"
    1433 = "SQL Server"
    3306 = "MySQL"
    5432 = "PostgreSQL"
}

# 检查是否有管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  警告：未以管理员身份运行，某些进程可能无法终止" -ForegroundColor Yellow
    Write-Host "   建议：右键点击PowerShell，选择'以管理员身份运行'" -ForegroundColor Yellow
    Write-Host ""
}

$killedCount = 0
$totalProcesses = 0

foreach ($p in $Port) {
    $portName = if ($portNames.ContainsKey($p)) { $portNames[$p] } else { "端口 $p" }

    Write-Host "🔍 检查 $portName ..." -ForegroundColor Cyan

    try {
        # 查找占用端口的进程
        $connections = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue

        if ($connections) {
            $totalProcesses += $connections.Count

            foreach ($conn in $connections) {
                $processId = $conn.OwningProcess

                try {
                    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue

                    if ($process) {
                        $processName = $process.ProcessName
                        $processPath = try { $process.Path } catch { "未知路径" }

                        Write-Host "   ⚠️  发现进程：" -ForegroundColor Yellow
                        Write-Host "      - PID: $processId" -ForegroundColor Gray
                        Write-Host "      - 名称: $processName" -ForegroundColor Gray
                        Write-Host "      - 路径: $processPath" -ForegroundColor Gray
                        Write-Host "      - 状态: $($conn.State)" -ForegroundColor Gray

                        # 询问是否终止（除非使用-Force）
                        $shouldKill = $Force

                        if (-not $Force) {
                            $response = Read-Host "      是否终止此进程？(Y/N)"
                            $shouldKill = $response -eq 'Y' -or $response -eq 'y'
                        }

                        if ($shouldKill) {
                            try {
                                Stop-Process -Id $processId -Force -ErrorAction Stop
                                Write-Host "      ✅ 已终止进程 PID: $processId" -ForegroundColor Green
                                $killedCount++
                                Start-Sleep -Milliseconds 500
                            } catch {
                                Write-Host "      ❌ 终止失败：$($_.Exception.Message)" -ForegroundColor Red

                                if (-not $isAdmin) {
                                    Write-Host "      💡 提示：请以管理员身份运行此脚本" -ForegroundColor Yellow
                                }
                            }
                        } else {
                            Write-Host "      ⏭️  跳过此进程" -ForegroundColor Gray
                        }
                    }
                } catch {
                    Write-Host "   ❌ 无法获取进程信息：$($_.Exception.Message)" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "   ✅ 端口空闲" -ForegroundColor Green
        }
    } catch {
        # 端口未被占用或其他错误
        Write-Host "   ✅ 端口空闲" -ForegroundColor Green
    }

    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 清理完成" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "   发现进程数：$totalProcesses" -ForegroundColor White
Write-Host "   已终止进程：$killedCount" -ForegroundColor $(if ($killedCount -gt 0) { 'Green' } else { 'Gray' })
Write-Host ""

if ($killedCount -gt 0) {
    Write-Host "✅ 端口已清理，可以启动服务了！" -ForegroundColor Green
} else {
    Write-Host "ℹ️  所有端口都是空闲的，可以直接启动服务！" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "💡 下一步：" -ForegroundColor Yellow
Write-Host "   • 启动前端：cd src/SmartAbp.Vue && npm run dev" -ForegroundColor Gray
Write-Host "   • 启动后端：dotnet run --project src/SmartAbp.Web" -ForegroundColor Gray
Write-Host ""

