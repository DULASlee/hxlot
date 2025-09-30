<#
.SYNOPSIS
    SmartAbp AI编程架构保护守卫
.DESCRIPTION
    防止AI编程破坏工程化架构优化成果
    版本: v1.0
#>

param(
    [switch]$Verbose = $false
)

Write-Host "🛡️  SmartAbp AI编程架构保护守卫启动..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$script:Violations = 0
$script:Warnings = 0

function Write-CheckHeader {
    param([string]$Message)
    Write-Host "`n🔍 $Message" -ForegroundColor Blue
}

function Write-Pass {
    param([string]$Message)
    Write-Host "✅ 通过：$Message" -ForegroundColor Green
}

function Write-Fail {
    param([string]$Message, [int]$Count = 1)
    Write-Host "❌ $Message" -ForegroundColor Red
    $script:Violations += $Count
}

function Write-Warn {
    param([string]$Message, [int]$Count = 1)
    Write-Host "⚠️  警告：$Message" -ForegroundColor Yellow
    $script:Warnings += $Count
}

# 第一关：packages相对路径违规检查
Write-CheckHeader "第一关：packages相对路径违规检查..."

$relativePathFiles = Get-ChildItem -Path "src\SmartAbp.Vue\packages" -Recurse -Include "*.ts","*.vue" -File -ErrorAction SilentlyContinue | 
    Select-String -Pattern "from ['\""]\.\./\.\./" -ErrorAction SilentlyContinue

$relativePathCount = ($relativePathFiles | Measure-Object).Count

if ($relativePathCount -gt 0) {
    Write-Fail "发现 $relativePathCount 个相对路径违规！" $relativePathCount
    if ($Verbose) {
        $relativePathFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    }
} else {
    Write-Pass "无相对路径违规"
}

# 第二关：packages主应用引用违规检查
Write-CheckHeader "第二关：packages主应用引用违规检查..."

$mainAppRefFiles = Get-ChildItem -Path "src\SmartAbp.Vue\packages" -Recurse -Include "*.ts","*.vue" -File -ErrorAction SilentlyContinue | 
    Select-String -Pattern "from ['\""」@/" -ErrorAction SilentlyContinue

$mainAppRefCount = ($mainAppRefFiles | Measure-Object).Count

if ($mainAppRefCount -gt 0) {
    Write-Fail "发现 $mainAppRefCount 个主应用引用违规！" $mainAppRefCount
    if ($Verbose) {
        $mainAppRefFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    }
} else {
    Write-Pass "无主应用引用违规"
}

# 第三关：类型安全绕过检查
Write-CheckHeader "第三关：类型安全绕过检查..."

$asAnyFiles = Get-ChildItem -Path "src\SmartAbp.Vue\packages" -Recurse -Include "*.ts","*.vue" -File -ErrorAction SilentlyContinue | 
    Select-String -Pattern " as any" -ErrorAction SilentlyContinue

$tsIgnoreFiles = Get-ChildItem -Path "src\SmartAbp.Vue\packages" -Recurse -Include "*.ts","*.vue" -File -ErrorAction SilentlyContinue | 
    Select-String -Pattern "@ts-ignore" -ErrorAction SilentlyContinue

$asAnyCount = ($asAnyFiles | Measure-Object).Count
$tsIgnoreCount = ($tsIgnoreFiles | Measure-Object).Count

if ($asAnyCount -gt 0) {
    Write-Fail "发现 $asAnyCount 个 'as any' 使用！" $asAnyCount
}

if ($tsIgnoreCount -gt 0) {
    Write-Fail "发现 $tsIgnoreCount 个 '@ts-ignore' 使用！" $tsIgnoreCount
}

if ($asAnyCount -eq 0 -and $tsIgnoreCount -eq 0) {
    Write-Pass "无类型安全绕过"
}

# 第四关：重复组件检查
Write-CheckHeader "第四关：重复组件检查..."

$vueFiles = Get-ChildItem -Path "src\SmartAbp.Vue\packages" -Recurse -Filter "*.vue" -File -ErrorAction SilentlyContinue
$vueFileNames = $vueFiles | Select-Object -ExpandProperty Name
$duplicateComponents = $vueFileNames | Group-Object | Where-Object { $_.Count -gt 1 }
$duplicateCount = ($duplicateComponents | Measure-Object).Count

if ($duplicateCount -gt 0) {
    Write-Warn "发现 $duplicateCount 个重复组件名" $duplicateCount
    if ($Verbose) {
        $duplicateComponents | ForEach-Object { Write-Host "  $($_.Name) (出现 $($_.Count) 次)" -ForegroundColor Yellow }
    }
} else {
    Write-Pass "无重复组件"
}

# 第五关：packages依赖层级检查
Write-CheckHeader "第五关：packages依赖层级检查..."

$sharedPath = "src\SmartAbp.Vue\packages\lowcode-shared"
if (Test-Path $sharedPath) {
    $sharedViolations = Get-ChildItem -Path $sharedPath -Recurse -Include "*.ts","*.vue" -File -ErrorAction SilentlyContinue | 
        Select-String -Pattern "from ['\""]@smartabp/lowcode-(core|api|designer|tools)" -ErrorAction SilentlyContinue
    
    $sharedViolationCount = ($sharedViolations | Measure-Object).Count
    
    if ($sharedViolationCount -gt 0) {
        Write-Fail "lowcode-shared违规依赖其他package！" $sharedViolationCount
        if ($Verbose) {
            $sharedViolations | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        }
    } else {
        Write-Pass "lowcode-shared保持零依赖"
    }
} else {
    Write-Warn "lowcode-shared目录不存在" 1
}

# 第六关：packages架构完整性检查
Write-CheckHeader "第六关：packages架构完整性检查..."

$requiredPackages = @("lowcode-shared", "lowcode-core", "lowcode-designer", "lowcode-api", "lowcode-tools")
$missingPackages = @()

foreach ($package in $requiredPackages) {
    $packagePath = "src\SmartAbp.Vue\packages\$package"
    if (-not (Test-Path $packagePath)) {
        $missingPackages += $package
        Write-Fail "缺少关键package: $package" 1
    }
}

if ($missingPackages.Count -eq 0) {
    Write-Pass "所有关键packages都存在"
}

# 汇总结果
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "📊 架构保护检查汇总" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "关卡1 - 相对路径违规: $relativePathCount"
Write-Host "关卡2 - 主应用引用违规: $mainAppRefCount"
Write-Host "关卡3 - 类型安全绕过: $($asAnyCount + $tsIgnoreCount)"
Write-Host "关卡4 - 重复组件: $duplicateCount (警告)"
Write-Host "关卡5 - 依赖层级违规: $sharedViolationCount"
Write-Host "关卡6 - 架构完整性问题: $($missingPackages.Count)"
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "总违规数: " -NoNewline
Write-Host "$script:Violations" -ForegroundColor Red
Write-Host "总警告数: " -NoNewline
Write-Host "$script:Warnings" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

if ($script:Violations -gt 0) {
    Write-Host "`n🚨 架构保护检查失败！发现 $script:Violations 个违规！" -ForegroundColor Red
    Write-Host "💡 请修复上述违规后重试" -ForegroundColor Yellow
    Write-Host "📚 参考文档: .cursor\rules\07_AI编程架构自动识别保护铁律.mdc" -ForegroundColor Blue
    exit 1
}

if ($script:Warnings -gt 0) {
    Write-Host "`n⚠️  架构保护检查通过，但有 $script:Warnings 个警告" -ForegroundColor Yellow
    Write-Host "💡 建议检查并消除警告项" -ForegroundColor Blue
}

Write-Host "`n✅ 架构保护检查全部通过！" -ForegroundColor Green
Write-Host "🛡️  SmartAbp架构受到良好保护" -ForegroundColor Cyan
exit 0
