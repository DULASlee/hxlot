#!/usr/bin/env pwsh
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🚀 前端API Client自动生成脚本
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 用途：从后端Swagger文档生成TypeScript API Client
# 前置条件：后端服务已启动（http://localhost:9002）
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

param(
    [string]$BackendUrl = "http://localhost:9002",
    [switch]$SkipServiceCheck
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 前端API Client自动生成" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 步骤1：检查后端服务状态
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (-not $SkipServiceCheck) {
    Write-Host "📋 步骤1: 检查后端服务状态..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        $swaggerUrl = "$BackendUrl/swagger/v1/swagger.json"
        $response = Invoke-WebRequest -Uri $swaggerUrl -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ 后端服务已启动" -ForegroundColor Green
            Write-Host "  ✅ Swagger文档可访问: $swaggerUrl" -ForegroundColor Green
            Write-Host ""
        }
    }
    catch {
        Write-Host "  ❌ 后端服务未启动或不可访问" -ForegroundColor Red
        Write-Host "  📝 错误: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "💡 请先启动后端服务：" -ForegroundColor Cyan
        Write-Host "   cd src/SmartAbp.Web" -ForegroundColor White
        Write-Host "   dotnet run --urls $BackendUrl" -ForegroundColor White
        Write-Host ""
        exit 1
    }
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 步骤2：生成API Client
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "📋 步骤2: 生成前端API Client..." -ForegroundColor Yellow
Write-Host ""

# 进入前端项目目录
Push-Location "src/SmartAbp.Vue"

try {
    Write-Host "  🔧 使用openapi-typescript-codegen生成..." -ForegroundColor White
    Write-Host ""
    
    # 生成API Client
    npx openapi-typescript-codegen `
        --input "$BackendUrl/swagger/v1/swagger.json" `
        --output "src/api/generated" `
        --client axios `
        --useOptions `
        --useUnionTypes
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "  ✅ API Client生成成功" -ForegroundColor Green
        Write-Host "  📁 输出目录: src/api/generated" -ForegroundColor Cyan
        Write-Host ""
    }
    else {
        throw "API Client生成失败（退出码: $LASTEXITCODE）"
    }
}
catch {
    Write-Host "  ❌ API Client生成失败" -ForegroundColor Red
    Write-Host "  📝 错误: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Pop-Location
    exit 1
}
finally {
    Pop-Location
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 步骤3: 统计生成的文件
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "📋 步骤3: 统计生成的文件..." -ForegroundColor Yellow
Write-Host ""

$generatedDir = "src/SmartAbp.Vue/src/api/generated"
if (Test-Path $generatedDir) {
    $models = Get-ChildItem "$generatedDir/models" -Filter "*.ts" -ErrorAction SilentlyContinue | Measure-Object
    $services = Get-ChildItem "$generatedDir/services" -Filter "*.ts" -ErrorAction SilentlyContinue | Measure-Object
    
    Write-Host "  📊 生成统计:" -ForegroundColor Cyan
    Write-Host "     • Models: $($models.Count) 个" -ForegroundColor White
    Write-Host "     • Services: $($services.Count) 个" -ForegroundColor White
    Write-Host ""
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 步骤4: 提示后续步骤
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ API Client生成完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 后续步骤:" -ForegroundColor Yellow
Write-Host "   1. 检查生成的Layer2 DTOs（SimplifiedModuleCreationDto等）" -ForegroundColor White
Write-Host "   2. 如果frontend contracts需要更新，手动同步到backend-contracts.ts" -ForegroundColor White
Write-Host "   3. 进行集成测试（Layer1/Layer2/Layer3）" -ForegroundColor White
Write-Host ""
Write-Host "🌐 相关链接:" -ForegroundColor Yellow
Write-Host "   • Swagger文档: $BackendUrl/swagger" -ForegroundColor Cyan
Write-Host "   • API Client: src/SmartAbp.Vue/src/api/generated" -ForegroundColor Cyan
Write-Host ""

