# SmartAbp DevKit 代码生成脚本（PowerShell版本）
# 用途：批量生成实体代码到项目

param(
    [Parameter(Position=0)]
    [string]$InputFile = "entities\current-sprint.json",
    
    [Parameter(Position=1)]
    [string]$OutputDir = "",
    
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$DevKitCli = Join-Path $ProjectRoot "src\SmartAbp.DevKit.Cli"

if ($OutputDir -eq "") {
    $Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $OutputDir = Join-Path $ProjectRoot "src\generated\$Timestamp"
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 SmartAbp DevKit 代码生成脚本" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📁 输入文件: $InputFile" -ForegroundColor White
Write-Host "📂 输出目录: $OutputDir" -ForegroundColor White
Write-Host ""

# 检查DevKit CLI是否存在
if (!(Test-Path $DevKitCli)) {
    Write-Host "❌ 错误：DevKit CLI目录不存在" -ForegroundColor Red
    Write-Host "   路径: $DevKitCli" -ForegroundColor Gray
    exit 1
}

# 检查输入文件
$InputFilePath = Join-Path $ProjectRoot $InputFile
if (!(Test-Path $InputFilePath)) {
    Write-Host "❌ 错误：输入文件不存在" -ForegroundColor Red
    Write-Host "   路径: $InputFilePath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 使用方法:" -ForegroundColor Yellow
    Write-Host "   .\scripts\devkit-generate.ps1 <输入JSON文件> [输出目录]" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📝 示例:" -ForegroundColor Yellow
    Write-Host "   .\scripts\devkit-generate.ps1 entities\my-entities.json .\src\generated" -ForegroundColor Gray
    exit 1
}

# 创建输出目录
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# 构建命令
$VerboseFlag = if ($Verbose) { "-v" } else { "" }

# 执行代码生成
Write-Host "🔧 开始生成代码..." -ForegroundColor Cyan
Write-Host ""

$StartTime = Get-Date

Push-Location $DevKitCli
try {
    $RelativeInput = Resolve-Path -Path $InputFilePath -Relative
    $RelativeOutput = Resolve-Path -Path $OutputDir -Relative
    
    dotnet run -- batch -i $RelativeInput -o $RelativeOutput $VerboseFlag
    
    $ExitCode = $LASTEXITCODE
}
finally {
    Pop-Location
}

$EndTime = Get-Date
$Duration = ($EndTime - $StartTime).TotalSeconds

Write-Host ""
if ($ExitCode -eq 0) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "✅ 代码生成成功！" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "⏱️  总耗时: $([Math]::Round($Duration, 2))秒" -ForegroundColor Cyan
    Write-Host "📂 输出目录: $OutputDir" -ForegroundColor White
    Write-Host ""
    Write-Host "📁 生成的文件:" -ForegroundColor Yellow
    Get-ChildItem -Path $OutputDir -Filter "*.cs" -Recurse | ForEach-Object {
        Write-Host "   - $($_.Name) ($([Math]::Round($_.Length/1KB, 1))KB)" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "📝 下一步操作:" -ForegroundColor Yellow
    Write-Host "   1. 检查生成的代码质量" -ForegroundColor Gray
    Write-Host "   2. 复制到实际项目目录:" -ForegroundColor Gray
    Write-Host "      Copy-Item $OutputDir\*.cs src\SmartAbp.Domain\Entities\" -ForegroundColor DarkGray
    Write-Host "   3. 添加业务逻辑" -ForegroundColor Gray
    Write-Host "   4. 运行测试" -ForegroundColor Gray
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
}
else {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host "❌ 代码生成失败！" -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host "⏱️  耗时: $([Math]::Round($Duration, 2))秒" -ForegroundColor Cyan
    Write-Host "📝 请检查错误日志并修复问题" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    exit 1
}

