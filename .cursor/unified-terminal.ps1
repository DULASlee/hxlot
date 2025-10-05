<#
  SmartAbp 统一终端配置 - PowerShell版本
  基于 .cursor/env-vars.json 配置，确保与其他Shell完全一致
  版本: v2.2
  更新日期: 2025-01-02
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
    try {
        $EnvConfig = Get-Content -Path $EnvConfigPath -Raw | ConvertFrom-Json
        Write-Host "✅ 环境配置已加载" -ForegroundColor Green
    } catch {
        Write-Host "❌ 环境配置文件格式错误: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "🔄 使用默认配置..." -ForegroundColor Yellow
        # 使用默认配置
        $EnvConfig = [PSCustomObject]@{
            encoding = [PSCustomObject]@{ LANG = "C.UTF-8"; LC_ALL = "C.UTF-8"; LESSCHARSET = "utf-8"; TERM = "xterm-256color" }
            pagers = [PSCustomObject]@{ PAGER = "cat"; MANPAGER = "cat"; LESS = ""; SYSTEMD_PAGER = ""; GIT_PAGER = "cat" }
            msys = [PSCustomObject]@{ MSYS_NO_PATHCONV = "1"; MSYS2_ARG_CONV_EXCL = "*" }
            terminal = [PSCustomObject]@{ maxHistoryCount = 10000 }
        }
    }
}

# 应用编码配置（增强错误处理）
try {
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
    $OutputEncoding = [System.Text.UTF8Encoding]::new()
    Write-Host "✅ 控制台编码已设置为UTF-8" -ForegroundColor Green
} catch {
    Write-Host "⚠️ 控制台编码设置失败: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 应用环境变量配置
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

# PowerShell 交互优化（增强错误处理）
try {
    if (Get-Module -ListAvailable -Name PSReadLine) {
        Set-PSReadLineOption -PredictionSource None -HistoryNoDuplicates -EditMode Windows -ErrorAction SilentlyContinue
        Write-Host "✅ PSReadLine已优化" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ PSReadLine优化失败: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 历史记录配置
$MaximumHistoryCount = $EnvConfig.terminal.maxHistoryCount
try { 
    $host.UI.RawUI.WindowTitle = 'SmartAbp – 统一PowerShell终端 v2.2' 
} catch {
    Write-Host "⚠️ 窗口标题设置失败: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 统一别名
Set-Alias ll Get-ChildItem -ErrorAction SilentlyContinue
Set-Alias la Get-ChildItem -ErrorAction SilentlyContinue
Set-Alias l  Get-ChildItem -ErrorAction SilentlyContinue

# Git 统一函数（增强错误处理）
function global:gs { 
    try { git status --short } 
    catch { Write-Host "❌ Git命令执行失败: $($_.Exception.Message)" -ForegroundColor Red }
}
function global:gl { 
    try { git log --oneline --graph --decorate --all -10 } 
    catch { Write-Host "❌ Git命令执行失败: $($_.Exception.Message)" -ForegroundColor Red }
}
function global:gd { 
    try { git --no-pager diff } 
    catch { Write-Host "❌ Git命令执行失败: $($_.Exception.Message)" -ForegroundColor Red }
}
function global:gb { 
    try { git --no-pager branch } 
    catch { Write-Host "❌ Git命令执行失败: $($_.Exception.Message)" -ForegroundColor Red }
}

# dotnet 统一函数（增强错误处理）
function global:dnr { 
    try { dotnet run } 
    catch { Write-Host "❌ dotnet命令执行失败: $($_.Exception.Message)" -ForegroundColor Red }
}
function global:dnb { 
    try { dotnet build } 
    catch { Write-Host "❌ dotnet命令执行失败: $($_.Exception.Message)" -ForegroundColor Red }
}
function global:dnt { 
    try { dotnet test } 
    catch { Write-Host "❌ dotnet命令执行失败: $($_.Exception.Message)" -ForegroundColor Red }
}

# SmartAbp 专用函数（智能跨平台，符合架构铁律-质量门禁要求）
function global:smartabp-sync {
    Write-Host "🔄 检查Git同步脚本..." -ForegroundColor Cyan
    
    # 智能选择最佳执行方式，保持脚本完整功能
    if (Test-Path "scripts/git/git-safe-sync.ps1") {
        Write-Host "🚀 使用PowerShell版本同步..." -ForegroundColor Green
        try {
            & "scripts/git/git-safe-sync.ps1" --non-interactive --auto-commit
        } catch {
            Write-Host "❌ PowerShell同步脚本执行失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    } elseif (Test-Path "scripts/git/git-safe-sync.bat") {
        Write-Host "🚀 使用批处理版本同步..." -ForegroundColor Green
        try {
            & "scripts/git/git-safe-sync.bat"
        } catch {
            Write-Host "❌ 批处理同步脚本执行失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    } elseif (Test-Path "scripts/git/git-safe-sync.sh") {
        Write-Host "🚀 使用Bash版本同步（可能启动WSL）..." -ForegroundColor Yellow
        try {
            # 延迟执行bash，避免IDE启动时触发
            Start-Process powershell -ArgumentList "-NoProfile", "-Command", "bash scripts/git/git-safe-sync.sh --non-interactive --auto-commit; Read-Host '按Enter继续...'"
        } catch {
            Write-Host "❌ Bash同步脚本执行失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ 未找到Git同步脚本" -ForegroundColor Red
        Write-Host "📋 检查路径: scripts/git/git-safe-sync.*" -ForegroundColor Yellow
        Write-Host "💡 可用的替代方案:" -ForegroundColor Cyan
        Write-Host "   • git add . && git commit -m 'Auto commit' && git push" -ForegroundColor White
    }
}

function global:smartabp-check {
    Write-Host "🔍 检查质量检查脚本..." -ForegroundColor Cyan
    
    # 智能选择最佳执行方式，保持脚本完整功能
    if (Test-Path "scripts/quality/local-quality-check.sh") {
        Write-Host "🔍 使用Bash版本质量检查（推荐）..." -ForegroundColor Green
        try {
            bash scripts/quality/local-quality-check.sh
        } catch {
            Write-Host "❌ Bash质量检查脚本执行失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    } elseif (Test-Path "scripts/ci-quality-check.sh") {
        Write-Host "🔍 使用CI质量检查脚本..." -ForegroundColor Green
        try {
            bash scripts/ci-quality-check.sh
        } catch {
            Write-Host "❌ CI质量检查脚本执行失败: $($_.Exception.Message)" -ForegroundColor Red
        }
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
    Write-Host "🔍 检查开发启动脚本..." -ForegroundColor Cyan
    
    if (Test-Path "scripts/dev/start-dev.ps1") {
        try {
            & "scripts/dev/start-dev.ps1"
        } catch {
            Write-Host "❌ PowerShell开发脚本执行失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    } elseif (Test-Path "scripts/dev/start-dev.bat") {
        try {
            & "scripts/dev/start-dev.bat"
        } catch {
            Write-Host "❌ 批处理开发脚本执行失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ 未找到开发启动脚本" -ForegroundColor Red
        Write-Host "📋 检查路径: scripts/dev/start-dev.*" -ForegroundColor Yellow
        Write-Host "💡 手动启动选项:" -ForegroundColor Cyan
        Write-Host "   • cd src/SmartAbp.Vue && npm run dev" -ForegroundColor White
        Write-Host "   • dotnet run --project src/SmartAbp.Web" -ForegroundColor White
    }
}

# 快速导航函数（增强错误处理）
function global:smartabp-vue { 
    try { 
        if (Test-Path "src/SmartAbp.Vue") {
            Set-Location "src/SmartAbp.Vue"
            Write-Host "✅ 已进入Vue项目目录" -ForegroundColor Green
        } else {
            Write-Host "❌ Vue项目目录不存在: src/SmartAbp.Vue" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ 导航失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function global:smartabp-packages { 
    try { 
        if (Test-Path "src/SmartAbp.Vue/packages") {
            Set-Location "src/SmartAbp.Vue/packages"
            Write-Host "✅ 已进入packages目录" -ForegroundColor Green
        } else {
            Write-Host "❌ packages目录不存在: src/SmartAbp.Vue/packages" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ 导航失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function global:smartabp-backend { 
    try { 
        if (Test-Path "src/SmartAbp.Application") {
            Set-Location "src/SmartAbp.Application"
            Write-Host "✅ 已进入后端应用目录" -ForegroundColor Green
        } else {
            Write-Host "❌ 后端应用目录不存在: src/SmartAbp.Application" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ 导航失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 质量检查函数（增强错误处理）
function global:smartabp-lint {
    try {
        if (Test-Path "src/SmartAbp.Vue") {
            Push-Location "src/SmartAbp.Vue"
            Write-Host "🔍 运行ESLint检查..." -ForegroundColor Cyan
            npm run lint
            Pop-Location
        } else {
            Write-Host "❌ Vue项目目录不存在: src/SmartAbp.Vue" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ ESLint检查失败: $($_.Exception.Message)" -ForegroundColor Red
        Pop-Location -ErrorAction SilentlyContinue
    }
}

function global:smartabp-type {
    try {
        if (Test-Path "src/SmartAbp.Vue") {
            Push-Location "src/SmartAbp.Vue"
            Write-Host "🔍 运行TypeScript类型检查..." -ForegroundColor Cyan
            npm run type-check
            Pop-Location
        } else {
            Write-Host "❌ Vue项目目录不存在: src/SmartAbp.Vue" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ TypeScript类型检查失败: $($_.Exception.Message)" -ForegroundColor Red
        Pop-Location -ErrorAction SilentlyContinue
    }
}

function global:smartabp-build {
    try {
        if (Test-Path "src/SmartAbp.Vue") {
            Push-Location "src/SmartAbp.Vue"
            Write-Host "🔨 运行前端构建..." -ForegroundColor Cyan
            npm run build
            Pop-Location
        } else {
            Write-Host "❌ Vue项目目录不存在: src/SmartAbp.Vue" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ 前端构建失败: $($_.Exception.Message)" -ForegroundColor Red
        Pop-Location -ErrorAction SilentlyContinue
    }
}

# 显示加载成功消息
Write-Host ""
Write-Host '✅ SmartAbp 统一PowerShell终端配置已加载 (v2.2)' -ForegroundColor Green
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
Write-Host "🔧 配置版本: v2.2" -ForegroundColor Cyan
Write-Host "📅 更新日期: 2025-01-02" -ForegroundColor Cyan