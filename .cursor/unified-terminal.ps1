<#
  SmartAbp 统一终端配置 - PowerShell版本
  基于 .cursor/env-vars.json 配置，确保与其他Shell完全一致
#>

# 读取统一环境配置
$EnvConfig = Get-Content -Path ".cursor/env-vars.json" | ConvertFrom-Json

try {
  # 统一控制台编码
  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
  $OutputEncoding = [System.Text.UTF8Encoding]::new()
} catch {}

# 应用编码配置
$env:LANG = $EnvConfig.encoding.LANG
$env:LC_ALL = $EnvConfig.encoding.LC_ALL
$env:LESSCHARSET = $EnvConfig.encoding.LESSCHARSET
$env:TERM = $EnvConfig.encoding.TERM

# 应用分页器配置
$env:PAGER = $EnvConfig.pagers.PAGER
$env:MANPAGER = $EnvConfig.pagers.MANPAGER
$env:LESS = $EnvConfig.pagers.LESS
$env:SYSTEMD_PAGER = $EnvConfig.pagers.SYSTEMD_PAGER
$env:GIT_PAGER = $EnvConfig.pagers.GIT_PAGER

# 应用MSYS配置
$env:MSYS_NO_PATHCONV = $EnvConfig.msys.MSYS_NO_PATHCONV
$env:MSYS2_ARG_CONV_EXCL = $EnvConfig.msys.MSYS2_ARG_CONV_EXCL

# PowerShell 交互优化
try {
  if (Get-Module -ListAvailable -Name PSReadLine) {
    Set-PSReadLineOption -PredictionSource None -HistoryNoDuplicates -EditMode Windows -ErrorAction SilentlyContinue
  }
} catch {}

# 历史记录配置
$MaximumHistoryCount = $EnvConfig.terminal.maxHistoryCount
try { $host.UI.RawUI.WindowTitle = 'SmartAbp – 统一PowerShell终端' } catch {}

# 统一别名
Set-Alias ll Get-ChildItem
Set-Alias la Get-ChildItem
Set-Alias l  Get-ChildItem

# Git 统一函数
function global:gs { git status --short }
function global:gl { git log --oneline --graph --decorate --all -10 }
function global:gd { git --no-pager diff }
function global:gb { git --no-pager branch }

# dotnet 统一函数
function global:dnr { dotnet run }
function global:dnb { dotnet build }
function global:dnt { dotnet test }

# SmartAbp 专用函数（智能跨平台，保持完整功能）
function global:smartabp-sync {
  # 智能选择最佳执行方式，保持脚本完整功能
  if (Test-Path "scripts/git-safe-sync.ps1") {
    Write-Host "🚀 使用PowerShell版本同步..." -ForegroundColor Green
    & "scripts/git-safe-sync.ps1" --non-interactive --auto-commit
  } elseif (Test-Path "scripts/git-safe-sync.bat") {
    Write-Host "🚀 使用批处理版本同步..." -ForegroundColor Green
    & "scripts/git-safe-sync.bat"
  } elseif (Test-Path "scripts/git-safe-sync.sh") {
    Write-Host "🚀 使用Bash版本同步（可能启动WSL）..." -ForegroundColor Yellow
    # 延迟执行bash，避免IDE启动时触发
    Start-Process powershell -ArgumentList "-NoProfile", "-Command", "bash scripts/git-safe-sync.sh --non-interactive --auto-commit; Read-Host '按Enter继续...'"
  } else {
    Write-Host "❌ 未找到Git同步脚本" -ForegroundColor Red
  }
}

function global:smartabp-check {
  # 智能选择最佳执行方式，保持脚本完整功能
  if (Test-Path "scripts/local-quality-check.ps1") {
    Write-Host "🔍 使用PowerShell版本质量检查..." -ForegroundColor Green
    & "scripts/local-quality-check.ps1"
  } elseif (Test-Path "scripts/ci-quality-check.sh") {
    Write-Host "🔍 使用Bash版本质量检查（可能启动WSL）..." -ForegroundColor Yellow
    # 延迟执行bash，避免IDE启动时触发
    Start-Process powershell -ArgumentList "-NoProfile", "-Command", "bash scripts/ci-quality-check.sh; Read-Host '按Enter继续...'"
  } else {
    Write-Host "📋 手动质量检查选项：" -ForegroundColor Cyan
    Write-Host "1. cd src/SmartAbp.Vue && npm run type-check" -ForegroundColor White
    Write-Host "2. dotnet build" -ForegroundColor White
    Write-Host "3. cd src/SmartAbp.Vue && npm run lint" -ForegroundColor White
  }
}
function global:smartabp-dev {
  Write-Host "🚀 启动SmartAbp开发环境..." -ForegroundColor Green
  & "scripts/start-dev.ps1"
}

Write-Host '✅ SmartAbp 统一PowerShell终端配置已加载' -ForegroundColor Green
