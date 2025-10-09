# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AI执行引擎 - 自动规则加载提醒器 (Windows PowerShell版)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 功能：每30分钟提醒AI加载最新规则文件
# 原理：定时器 + 状态管理 + 彩色提醒界面
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

param(
    [Parameter(Position=0)]
    [ValidateSet("monitor", "now", "status")]
    [string]$Mode = "now"
)

$ErrorActionPreference = "Stop"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 配置区
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $PROJECT_ROOT

$REMINDER_INTERVAL = 1800  # 30分钟 = 1800秒
$STATE_FILE = Join-Path $PROJECT_ROOT ".ai-rule-reminder-state.json"
$LOG_FILE = Join-Path $PROJECT_ROOT "logs/ai-rule-reminder.log"

# 规则文件列表（按优先级排序）
$RULE_FILES = @(
    ".cursor/rules/00_执行引擎.mdc",
    ".cursor/rules/00_核心原则.mdc",
    ".cursor/rules/01_开发指南.mdc",
    ".cursor/rules/02_最佳实践.mdc",
    ".cursor/rules/03_项目架构指南.mdc",
    "docs/项目开发规范总览.md"
)

# 创建日志目录
$logDir = Split-Path $LOG_FILE
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 工具函数
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Write-Log {
    param([string]$Level, [string]$Message)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Write-Header {
    param([string]$Text)
    
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host $Text -ForegroundColor Magenta
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host ""
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ️  $Text" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "✅ $Text" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠️  $Text" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor Red
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 状态管理
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Initialize-State {
    if (-not (Test-Path $STATE_FILE)) {
        $state = @{
            lastReminderTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
            reminderCount = 0
            sessionStartTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        }
        $state | ConvertTo-Json | Set-Content $STATE_FILE
        Write-Log "INFO" "状态文件已初始化: $STATE_FILE"
    }
}

function Get-State {
    if (Test-Path $STATE_FILE) {
        Get-Content $STATE_FILE | ConvertFrom-Json
    } else {
        Initialize-State
        Get-Content $STATE_FILE | ConvertFrom-Json
    }
}

function Update-State {
    param([int]$Count)
    
    $state = @{
        lastReminderTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        reminderCount = $Count
        sessionStartTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
    $state | ConvertTo-Json | Set-Content $STATE_FILE
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 核心功能
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Test-RuleFiles {
    $missingFiles = @()
    $existingFiles = 0
    
    foreach ($ruleFile in $RULE_FILES) {
        $fullPath = Join-Path $PROJECT_ROOT $ruleFile
        if (Test-Path $fullPath) {
            $existingFiles++
        } else {
            $missingFiles += $ruleFile
        }
    }
    
    if ($missingFiles.Count -gt 0) {
        Write-Warning "发现 $($missingFiles.Count) 个规则文件缺失:"
        foreach ($file in $missingFiles) {
            Write-Host "   ❌ $file" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    Write-Host "   📊 规则文件状态: $existingFiles/$($RULE_FILES.Count) 存在" -ForegroundColor Cyan
}

function Show-LoadCommands {
    Write-Host ""
    Write-Header "📋 AI规则加载命令"
    
    Write-Host "请AI执行以下命令加载规则:" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($ruleFile in $RULE_FILES) {
        $fullPath = Join-Path $PROJECT_ROOT $ruleFile
        if (Test-Path $fullPath) {
            Write-Host "  read_file(`"$ruleFile`")" -ForegroundColor White
        }
    }
    
    Write-Host ""
}

function Show-Reminder {
    param([int]$Count)
    
    Clear-Host
    
    Write-Header "⏰ AI规则加载提醒 #$Count"
    
    Write-Info "当前时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Info "提醒次数: $Count"
    Write-Host ""
    
    Write-Warning "📢 重要提醒: AI需要重新加载规则文件！"
    Write-Host ""
    
    Write-Host "为什么需要重新加载？" -ForegroundColor Yellow
    Write-Host "   1. AI无法跨会话保持状态"
    Write-Host "   2. 规则文件可能已更新"
    Write-Host "   3. 确保AI始终遵循最新规范"
    Write-Host ""
    
    Test-RuleFiles
    
    Show-LoadCommands
    
    Write-Header "🔥 强制启动声明模板"
    
    Write-Host "AI必须在聊天响应开头输出:" -ForegroundColor Green
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "🔥 AI编程铁律执行引擎 v10.0 + 架构三大铁律 已启动！" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Info "下次提醒: 30分钟后"
    Write-Host ""
    
    Write-Log "INFO" "已显示第 $Count 次提醒"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 监控模式：持续运行
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Start-MonitorMode {
    Write-Log "INFO" "启动规则加载提醒监控模式..."
    Write-Log "INFO" "提醒间隔: $REMINDER_INTERVAL 秒 (30分钟)"
    
    Initialize-State
    
    $state = Get-State
    $count = $state.reminderCount
    
    # 立即显示一次提醒
    $count++
    Show-Reminder -Count $count
    Update-State -Count $count
    
    # 持续监控
    while ($true) {
        Start-Sleep -Seconds $REMINDER_INTERVAL
        
        $count++
        Show-Reminder -Count $count
        Update-State -Count $count
        
        # 发送Windows通知
        try {
            $notification = New-Object -ComObject Wscript.Shell
            $notification.Popup("AI需要重新加载规则文件", 10, "AI规则提醒", 64)
        } catch {
            # 忽略通知错误
        }
    }
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 其他模式
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Start-NowMode {
    Initialize-State
    $state = Get-State
    $count = $state.reminderCount + 1
    Show-Reminder -Count $count
    Update-State -Count $count
}

function Show-Status {
    if (-not (Test-Path $STATE_FILE)) {
        Write-Info "尚未启动提醒系统"
        return
    }
    
    $state = Get-State
    
    Write-Host ""
    Write-Header "📊 规则提醒系统状态"
    
    Write-Info "上次提醒时间: $($state.lastReminderTime)"
    Write-Info "累计提醒次数: $($state.reminderCount)"
    Write-Info "提醒间隔: 30分钟"
    Write-Host ""
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 主函数
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

switch ($Mode) {
    "monitor" {
        Start-MonitorMode
    }
    "now" {
        Start-NowMode
    }
    "status" {
        Show-Status
    }
    default {
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
        Write-Host "AI执行引擎 - 自动规则加载提醒器" -ForegroundColor Magenta
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "用法: .\auto-rule-reminder.ps1 {monitor|now|status}" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "模式说明:"
        Write-Host "  monitor - 后台监控模式（每30分钟自动提醒）"
        Write-Host "  now     - 立即显示提醒"
        Write-Host "  status  - 查看提醒系统状态"
        Write-Host ""
        Write-Host "示例:"
        Write-Host "  # 启动后台监控"
        Write-Host "  .\auto-rule-reminder.ps1 monitor"
        Write-Host ""
        Write-Host "  # 立即提醒AI加载规则"
        Write-Host "  .\auto-rule-reminder.ps1 now"
        Write-Host ""
    }
}

