# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎨 设计系统合规性检查脚本 (PowerShell版本)
# 文件: scripts/quality/design-system-check.ps1
# 用途: 自动检查前端代码是否符合设计系统规范
# 更新: 2025-10-22
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

param(
    [switch]$NonInteractive
)

# 设置错误处理
$ErrorActionPreference = "Stop"

# 检查目标目录
$TargetDir = "src/SmartAbp.Vue/src/views"

if (-not (Test-Path $TargetDir)) {
    Write-Host "❌ 目标目录不存在: $TargetDir" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "🎨 设计系统合规性检查" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

# 总违规数
$TotalViolations = 0

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 第一关：硬编码颜色检查
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "🔍 第一关：检查硬编码颜色..." -ForegroundColor Blue

# 检查hex颜色和rgb颜色
$ColorPattern = '#[0-9A-Fa-f]{3,8}|rgb\(|rgba\('
$ColorViolations = Get-ChildItem -Path $TargetDir -Recurse -Include *.vue,*.ts,*.js | 
    Select-String -Pattern $ColorPattern | 
    Measure-Object | 
    Select-Object -ExpandProperty Count

if ($ColorViolations -gt 0) {
    Write-Host "❌ 发现 $ColorViolations 处硬编码颜色！" -ForegroundColor Red
    Write-Host ""
    Write-Host "违规示例：" -ForegroundColor Yellow
    
    # 显示前5个违规
    Get-ChildItem -Path $TargetDir -Recurse -Include *.vue,*.ts,*.js | 
        Select-String -Pattern $ColorPattern | 
        Select-Object -First 5
    
    Write-Host ""
    Write-Host "✅ 修复建议：" -ForegroundColor Green
    Write-Host "  - 将硬编码颜色替换为设计令牌"
    Write-Host "  - 例如: #409EFF → var(--color-primary-500)"
    Write-Host "  - 例如: rgb(64, 158, 255) → var(--color-primary-500)"
    Write-Host ""
    
    $TotalViolations += $ColorViolations
} else {
    Write-Host "✅ 颜色检查通过（0违规）" -ForegroundColor Green
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 第二关：硬编码间距检查
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "🔍 第二关：检查硬编码间距..." -ForegroundColor Blue

# 检查padding/margin/gap中的px值
$SpacingPattern = '(padding|margin|gap):\s*[^;]*[0-9]+px'
$SpacingViolations = Get-ChildItem -Path $TargetDir -Recurse -Include *.vue,*.ts,*.js | 
    Select-String -Pattern $SpacingPattern | 
    Measure-Object | 
    Select-Object -ExpandProperty Count

if ($SpacingViolations -gt 0) {
    Write-Host "❌ 发现 $SpacingViolations 处硬编码间距！" -ForegroundColor Red
    Write-Host ""
    Write-Host "违规示例：" -ForegroundColor Yellow
    
    # 显示前5个违规
    Get-ChildItem -Path $TargetDir -Recurse -Include *.vue,*.ts,*.js | 
        Select-String -Pattern $SpacingPattern | 
        Select-Object -First 5
    
    Write-Host ""
    Write-Host "✅ 修复建议：" -ForegroundColor Green
    Write-Host "  - 使用8px栅格系统的间距令牌"
    Write-Host "  - 例如: padding: 16px → padding: var(--spacing-4)"
    Write-Host "  - 例如: margin: 12px 20px → margin: var(--spacing-3) var(--spacing-5)"
    Write-Host ""
    Write-Host "间距令牌对照表：" -ForegroundColor Blue
    Write-Host "  --spacing-1: 4px   --spacing-2: 8px   --spacing-3: 12px"
    Write-Host "  --spacing-4: 16px  --spacing-5: 20px  --spacing-6: 24px"
    Write-Host "  --spacing-8: 32px  --spacing-12: 48px --spacing-16: 64px"
    Write-Host ""
    
    $TotalViolations += $SpacingViolations
} else {
    Write-Host "✅ 间距检查通过（0违规）" -ForegroundColor Green
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 第三关：Element Plus组件直接使用检查
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "🔍 第三关：检查Element Plus组件直接使用..." -ForegroundColor Blue

# 检查常用Element Plus组件
$ComponentPattern = '<el-(button|card|input|icon|form|table|dialog|select)'
$ComponentViolations = Get-ChildItem -Path $TargetDir -Recurse -Include *.vue | 
    Select-String -Pattern $ComponentPattern | 
    Measure-Object | 
    Select-Object -ExpandProperty Count

if ($ComponentViolations -gt 0) {
    Write-Host "❌ 发现 $ComponentViolations 处直接使用Element Plus组件！" -ForegroundColor Red
    Write-Host ""
    Write-Host "违规示例：" -ForegroundColor Yellow
    
    # 显示前5个违规
    Get-ChildItem -Path $TargetDir -Recurse -Include *.vue | 
        Select-String -Pattern $ComponentPattern | 
        Select-Object -First 5
    
    Write-Host ""
    Write-Host "✅ 修复建议：" -ForegroundColor Green
    Write-Host "  - 使用SmartComponents封装的企业级组件"
    Write-Host "  - <el-button> → <SmartButton>"
    Write-Host "  - <el-card> → <SmartCard>"
    Write-Host "  - <el-input> → <SmartInput>"
    Write-Host "  - <el-icon> → <SmartIcon>"
    Write-Host ""
    
    $TotalViolations += $ComponentViolations
} else {
    Write-Host "✅ 组件检查通过（0违规）" -ForegroundColor Green
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 第四关：图标系统检查
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "🔍 第四关：检查图标使用规范..." -ForegroundColor Blue

# 检查Element Plus图标和Font Awesome图标
$IconPattern = '<el-icon|<i class="(fa|el-icon)'
$IconViolations = Get-ChildItem -Path $TargetDir -Recurse -Include *.vue | 
    Select-String -Pattern $IconPattern | 
    Measure-Object | 
    Select-Object -ExpandProperty Count

if ($IconViolations -gt 0) {
    Write-Host "❌ 发现 $IconViolations 处图标使用不规范！" -ForegroundColor Red
    Write-Host ""
    Write-Host "违规示例：" -ForegroundColor Yellow
    
    # 显示前5个违规
    Get-ChildItem -Path $TargetDir -Recurse -Include *.vue | 
        Select-String -Pattern $IconPattern | 
        Select-Object -First 5
    
    Write-Host ""
    Write-Host "✅ 修复建议：" -ForegroundColor Green
    Write-Host "  - 统一使用Carbon Design Icons"
    Write-Host "  - <el-icon><Edit /></el-icon> → <SmartIcon icon=`"carbon:edit`" />"
    Write-Host "  - <i class=`"fa fa-user`"></i> → <SmartIcon icon=`"carbon:user`" />"
    Write-Host ""
    Write-Host "常用图标速查：" -ForegroundColor Blue
    Write-Host "  carbon:add     carbon:edit    carbon:delete  carbon:save"
    Write-Host "  carbon:user    carbon:search  carbon:filter  carbon:home"
    Write-Host ""
    
    $TotalViolations += $IconViolations
} else {
    Write-Host "✅ 图标检查通过（0违规）" -ForegroundColor Green
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 汇总报告
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue

if ($TotalViolations -gt 0) {
    Write-Host "🚫 设计系统检查未通过！" -ForegroundColor Red
    Write-Host ""
    Write-Host "检查结果汇总：" -ForegroundColor Yellow
    Write-Host "  🎨 颜色违规: $ColorViolations 处"
    Write-Host "  📏 间距违规: $SpacingViolations 处"
    Write-Host "  🧩 组件违规: $ComponentViolations 处"
    Write-Host "  🎯 图标违规: $IconViolations 处"
    Write-Host "  ━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host "  总违规数: $TotalViolations 处" -ForegroundColor Red
    Write-Host ""
    Write-Host "请修复上述问题后重试。" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host ""
    
    exit 1
} else {
    Write-Host "🎉 设计系统合规性检查全部通过！" -ForegroundColor Green
    Write-Host ""
    Write-Host "检查结果汇总：" -ForegroundColor Green
    Write-Host "  ✅ 颜色检查: 0违规"
    Write-Host "  ✅ 间距检查: 0违规"
    Write-Host "  ✅ 组件检查: 0违规"
    Write-Host "  ✅ 图标检查: 0违规"
    Write-Host ""
    Write-Host "代码符合企业级设计系统规范！" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host ""
    
    exit 0
}

