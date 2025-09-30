<#
  SmartAbp 统一终端配置 - PowerShell版本
  基于 .cursor/env-vars.json 配置，确保与其他Shell完全一致
  版本: v2.1
  更新日期: 2025-09-30
#>

# 获取脚本所在目录和项目根目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# 读取统一环境配置
$EnvConfigPath = Join-Path $ScriptDir "env-vars.json"

if (-not (Test-Path $EnvConfigPath)) {
    Write-Host "⚠️ 警告: 未找到环境配置文件 $EnvConfigPath" -ForegroundColor Yellow
    Write-Host "🔄 使用默认配置..." -ForegroundColor Yellow
    # 创建默认配置对象
    $EnvConfig = [PSCustomObject]@{
        encoding = [PSCustomObject]@{
            LANG = "C.UTF-8"
            LC_ALL = "C.UTF-8"
            LESSCHARSET = "utf-8"
            TERM = "xterm-256color"
        }
        pagers = [PSCustomObject]@{
            PAGER = "cat"
            MANPAGER = "cat"
            LESS = ""
            SYSTEMD_PAGER = ""
            GIT_PAGER = "cat"
        }
        msys = [PSCustomObject]@{
            MSYS_NO_PATHCONV = "1"
            MSYS2_ARG_CONV_EXCL = "*"
        }
        terminal = [PSCustomObject]@{
            maxHistoryCount = 10000
        }
    }
} else {
    $EnvConfig = Get-Content -Path $EnvConfigPath | ConvertFrom-Json
}

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

# SmartAbp 项目特定环境变量
$env:SMARTABP_PROJECT_ROOT = $ProjectRoot
$env:SMARTABP_QUALITY_THRESHOLD = 95

# PowerShell 交互优化
try {
  if (Get-Module -ListAvailable -Name PSReadLine) {
    Set-PSReadLineOption -PredictionSource None -HistoryNoDuplicates -EditMode Windows -ErrorAction SilentlyContinue
  }
} catch {
  # PSReadLine优化失败时静默继续
}

# 历史记录配置
$MaximumHistoryCount = $EnvConfig.terminal.maxHistoryCount
try { 
  $host.UI.RawUI.WindowTitle = 'SmartAbp – 统一PowerShell终端 v2.1' 
} catch {
  # 窗口标题设置失败时静默继续
}

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

# SmartAbp 专用函数（智能跨平台，符合架构铁律-质量门禁要求）
function global:smartabp-sync {
  # 智能选择最佳执行方式，保持脚本完整功能
  if (Test-Path "scripts/git/git-safe-sync.ps1") {
    Write-Host "🚀 使用PowerShell版本同步..." -ForegroundColor Green
    & "scripts/git/git-safe-sync.ps1" --non-interactive --auto-commit
  } elseif (Test-Path "scripts/git/git-safe-sync.bat") {
    Write-Host "🚀 使用批处理版本同步..." -ForegroundColor Green
    & "scripts/git/git-safe-sync.bat"
  } elseif (Test-Path "scripts/git/git-safe-sync.sh") {
    Write-Host "🚀 使用Bash版本同步（可能启动WSL）..." -ForegroundColor Yellow
    # 延迟执行bash，避免IDE启动时触发
    Start-Process powershell -ArgumentList "-NoProfile", "-Command", "bash scripts/git/git-safe-sync.sh --non-interactive --auto-commit; Read-Host '按Enter继续...'"
  } else {
    Write-Host "❌ 未找到Git同步脚本" -ForegroundColor Red
    Write-Host "📋 检查路径: scripts/git/git-safe-sync.*" -ForegroundColor Yellow
  }
}

function global:smartabp-check {
  # 智能选择最佳执行方式，保持脚本完整功能
  if (Test-Path "scripts/quality/local-quality-check.sh") {
    Write-Host "🔍 使用Bash版本质量检查（推荐）..." -ForegroundColor Green
    bash scripts/quality/local-quality-check.sh
  } elseif (Test-Path "scripts/ci-quality-check.sh") {
    Write-Host "🔍 使用CI质量检查脚本..." -ForegroundColor Green
    bash scripts/ci-quality-check.sh
  } else {
    Write-Host "📋 手动质量检查选项（符合架构铁律）：" -ForegroundColor Cyan
    Write-Host "1. cd src/SmartAbp.Vue && npm run type-check" -ForegroundColor White
    Write-Host "2. dotnet build" -ForegroundColor White
    Write-Host "3. cd src/SmartAbp.Vue && npm run lint" -ForegroundColor White
    Write-Host "4. bash scripts/quality-gate.sh" -ForegroundColor Yellow
  }
}
function global:smartabp-dev {
  Write-Host "🚀 启动SmartAbp开发环境..." -ForegroundColor Green
  if (Test-Path "scripts/dev/start-dev.ps1") {
    & "scripts/dev/start-dev.ps1"
  } elseif (Test-Path "scripts/dev/start-dev.bat") {
    & "scripts/dev/start-dev.bat"
  } else {
    Write-Host "❌ 未找到开发启动脚本" -ForegroundColor Red
    Write-Host "📋 检查路径: scripts/dev/start-dev.*" -ForegroundColor Yellow
  }
}

# 快速导航函数
function global:smartabp-vue { Set-Location "src/SmartAbp.Vue" }
function global:smartabp-packages { Set-Location "src/SmartAbp.Vue/packages" }
function global:smartabp-backend { Set-Location "src/SmartAbp.Application" }

# 质量检查函数
function global:smartabp-lint {
  Push-Location "src/SmartAbp.Vue"
  npm run lint
  Pop-Location
}
function global:smartabp-type {
  Push-Location "src/SmartAbp.Vue"
  npm run type-check
  Pop-Location
}
function global:smartabp-build {
  Push-Location "src/SmartAbp.Vue"
  npm run build
  Pop-Location
}

# 显示加载成功消息
Write-Host ""
Write-Host '✅ SmartAbp 统一PowerShell终端配置已加载 (v2.1)' -ForegroundColor Green
Write-Host "📁 项目根目录: $env:SMARTABP_PROJECT_ROOT" -ForegroundColor Cyan
Write-Host "🎯 质量阈值: $env:SMARTABP_QUALITY_THRESHOLD 分" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 可用的SmartAbp命令:" -ForegroundColor Yellow
Write-Host "   • smartabp-sync      - Git安全同步" -ForegroundColor White
Write-Host "   • smartabp-check     - 质量检查" -ForegroundColor White
Write-Host "   • smartabp-dev       - 启动开发环境" -ForegroundColor White
Write-Host "   • smartabp-vue       - 进入Vue项目目录" -ForegroundColor White
Write-Host "   • smartabp-packages  - 进入packages目录" -ForegroundColor White
Write-Host "   • smartabp-lint      - 运行ESLint检查" -ForegroundColor White
Write-Host "   • smartabp-type      - 运行TypeScript类型检查" -ForegroundColor White
Write-Host ""
