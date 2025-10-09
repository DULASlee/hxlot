# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AI检查点轻量检查脚本
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 功能：AI在280/300行检查点时主动调用此脚本执行轻量检查
# 执行：AI通过 run_terminal_cmd 工具调用
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

param(
    [Parameter(Position=0)]
    [ValidateSet("280", "300", "quick")]
    [string]$Checkpoint = "quick",
    
    [Parameter(Position=1)]
    [int]$LineCount = 0
)

$ErrorActionPreference = "Stop"

$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $PROJECT_ROOT

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 工具函数
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Write-Header {
    param([string]$Text, [string]$Color = "Cyan")
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Color
    Write-Host $Text -ForegroundColor $Color
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Color
}

function Write-CheckItem {
    param([string]$Name, [bool]$Pass, [string]$Message = "")
    if ($Pass) {
        Write-Host "  ✅ $Name" -ForegroundColor Green
        if ($Message) { Write-Host "     $Message" -ForegroundColor Gray }
    } else {
        Write-Host "  ❌ $Name" -ForegroundColor Red
        if ($Message) { Write-Host "     $Message" -ForegroundColor Yellow }
    }
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 检查1: TypeScript类型快速检查
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Test-TypeScriptQuick {
    Write-Host ""
    Write-Host "📋 检查1: TypeScript类型快速扫描" -ForegroundColor Cyan
    
    $issues = @()
    
    # 检查是否有 'as any'
    $asAnyFiles = git diff --cached --name-only --diff-filter=AM | Where-Object { $_ -match '\.(ts|tsx|vue)$' }
    if ($asAnyFiles) {
        foreach ($file in $asAnyFiles) {
            if (Test-Path $file) {
                $content = Get-Content $file -Raw
                if ($content -match '\bas\s+any\b') {
                    $issues += "发现 'as any' 在文件: $file"
                }
                if ($content -match '@ts-ignore') {
                    $issues += "发现 '@ts-ignore' 在文件: $file"
                }
            }
        }
    }
    
    if ($issues.Count -eq 0) {
        Write-CheckItem "类型安全" $true "无 as any/ts-ignore"
        return $true
    } else {
        Write-CheckItem "类型安全" $false
        foreach ($issue in $issues) {
            Write-Host "     ⚠️  $issue" -ForegroundColor Yellow
        }
        return $false
    }
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 检查2: 架构三大铁律快速扫描
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Test-ArchitectureQuick {
    Write-Host ""
    Write-Host "📋 检查2: 架构三大铁律快速扫描" -ForegroundColor Cyan
    
    $violations = @()
    
    # 检查packages中的相对路径引用
    $packageFiles = git diff --cached --name-only --diff-filter=AM | 
                    Where-Object { $_ -match '^src/SmartAbp\.Vue/packages/.*\.(ts|vue)$' }
    
    if ($packageFiles) {
        foreach ($file in $packageFiles) {
            if (Test-Path $file) {
                $content = Get-Content $file -Raw
                
                # 检查相对路径 '../'
                if ($content -match "from\s+['\`"]\.\.\/") {
                    $violations += "相对路径违规: $file"
                }
                
                # 检查主应用引用 '@/'
                if ($content -match "from\s+['\`"]@\/") {
                    $violations += "主应用引用违规: $file"
                }
            }
        }
    }
    
    if ($violations.Count -eq 0) {
        Write-CheckItem "架构合规" $true "无相对路径/主应用引用"
        return $true
    } else {
        Write-CheckItem "架构合规" $false
        foreach ($v in $violations) {
            Write-Host "     ⚠️  $v" -ForegroundColor Yellow
        }
        return $false
    }
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 检查3: 功能完整性快速评估
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Test-FunctionalityQuick {
    Write-Host ""
    Write-Host "📋 检查3: 功能完整性快速评估" -ForegroundColor Cyan
    
    $issues = @()
    
    $files = git diff --cached --name-only --diff-filter=AM | 
             Where-Object { $_ -match '\.(ts|tsx|vue|cs)$' }
    
    if ($files) {
        foreach ($file in $files) {
            if (Test-Path $file) {
                $content = Get-Content $file -Raw
                
                # 检查空方法
                if ($content -match '(function|const)\s+\w+\s*\([^)]*\)\s*\{\s*\}') {
                    $issues += "空方法: $file"
                }
                
                # 检查Mock数据
                if ($content -match '\bmock(Data|Users?|Items?)\b') {
                    $issues += "Mock数据: $file"
                }
                
                # 检查TODO占位符
                if ($content -match '\/\/\s*TODO:?\s*(?!.*已完成)') {
                    $issues += "TODO占位符: $file"
                }
            }
        }
    }
    
    if ($issues.Count -eq 0) {
        Write-CheckItem "功能完整" $true "无空方法/Mock数据/TODO"
        return $true
    } else {
        Write-CheckItem "功能完整" $false
        foreach ($issue in $issues) {
            Write-Host "     ⚠️  $issue" -ForegroundColor Yellow
        }
        return $false
    }
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 检查4: 代码质量自评
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Test-CodeQualityQuick {
    Write-Host ""
    Write-Host "📋 检查4: 代码质量自评" -ForegroundColor Cyan
    
    $warnings = @()
    
    $files = git diff --cached --name-only --diff-filter=AM | 
             Where-Object { $_ -match '\.(ts|tsx|vue)$' }
    
    if ($files) {
        foreach ($file in $files) {
            if (Test-Path $file) {
                $lines = Get-Content $file
                
                # 检查文件行数
                if ($lines.Count -gt 500) {
                    $warnings += "文件过大 ($($lines.Count)行): $file"
                }
                
                # 检查复杂度（简单启发式）
                $complexity = ($lines | Select-String -Pattern '\b(if|for|while|switch|catch)\b').Count
                if ($complexity -gt 50) {
                    $warnings += "圈复杂度高 (~$complexity): $file"
                }
            }
        }
    }
    
    if ($warnings.Count -eq 0) {
        Write-CheckItem "代码质量" $true "无明显问题"
        return $true
    } else {
        Write-CheckItem "代码质量" $false
        foreach ($w in $warnings) {
            Write-Host "     ⚠️  $w" -ForegroundColor Yellow
        }
        return $false
    }
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 主检查流程
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Start-CheckpointCheck {
    param([string]$Checkpoint, [int]$LineCount)
    
    $title = switch ($Checkpoint) {
        "280" { "280行检查点" }
        "300" { "300行检查点" }
        default { "快速检查" }
    }
    
    Write-Header "📊 [$title] 轻量检查执行中..." "Magenta"
    
    if ($LineCount -gt 0) {
        Write-Host "  📝 当前累计代码: $LineCount 行" -ForegroundColor Cyan
    }
    Write-Host ""
    
    # 执行四项检查
    $check1 = Test-TypeScriptQuick
    $check2 = Test-ArchitectureQuick
    $check3 = Test-FunctionalityQuick
    $check4 = Test-CodeQualityQuick
    
    Write-Host ""
    Write-Header "📊 检查结果汇总" "Cyan"
    
    $allPass = $check1 -and $check2 -and $check3 -and $check4
    
    if ($allPass) {
        Write-Host ""
        Write-Host "  ✅ 所有检查通过，继续推进..." -ForegroundColor Green
        Write-Host ""
        return 0
    } else {
        Write-Host ""
        Write-Host "  ⚠️  发现问题，请修复后继续" -ForegroundColor Yellow
        Write-Host ""
        return 1
    }
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 执行检查
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

try {
    $result = Start-CheckpointCheck -Checkpoint $Checkpoint -LineCount $LineCount
    exit $result
} catch {
    Write-Host ""
    Write-Host "❌ 检查执行失败: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}

