#!/usr/bin/env pwsh
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SmartAbp 数据库迁移错误修复脚本
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 
# 修复日期: 2025-10-04
# 问题描述: 数据库迁移失败，多个数据库类型的迁移混淆
# 解决方案: 清理旧的数据库文件，重新执行正确的迁移
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

param(
    [switch]$Force,
    [switch]$BackupFirst
)

$ErrorActionPreference = "Stop"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔧 SmartAbp 数据库迁移错误修复工具" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 步骤1: 检测项目根目录
$projectRoot = Split-Path -Parent $PSScriptRoot | Split-Path -Parent
Set-Location $projectRoot

Write-Host "📂 项目根目录: $projectRoot" -ForegroundColor Gray
Write-Host ""

# 步骤2: 读取数据库配置
$migratorConfig = Get-Content "src/SmartAbp.DbMigrator/appsettings.json" | ConvertFrom-Json
$dbType = $migratorConfig.Database.Type
$connString = $migratorConfig.ConnectionStrings.Default

Write-Host "🔍 当前数据库配置:" -ForegroundColor Cyan
Write-Host "   类型: $dbType" -ForegroundColor White
Write-Host "   连接字符串: $connString" -ForegroundColor White
Write-Host ""

# 步骤3: 检测并清理旧的数据库文件
Write-Host "🗑️  检测旧的数据库文件..." -ForegroundColor Cyan

$sqliteFiles = @(
    "src/SmartAbp.DbMigrator/smartabp.db",
    "src/SmartAbp.DbMigrator/smartabp.db-shm",
    "src/SmartAbp.DbMigrator/smartabp.db-wal",
    "src/smartabp.db",
    "src/smartabp.db-shm",
    "src/smartabp.db-wal"
)

$foundFiles = @()
foreach ($file in $sqliteFiles) {
    if (Test-Path $file) {
        $foundFiles += $file
    }
}

if ($foundFiles.Count -gt 0) {
    Write-Host "   发现 $($foundFiles.Count) 个SQLite数据库文件:" -ForegroundColor Yellow
    foreach ($file in $foundFiles) {
        Write-Host "   • $file" -ForegroundColor Gray
    }
    Write-Host ""
    
    if ($BackupFirst) {
        Write-Host "💾 备份旧的数据库文件..." -ForegroundColor Cyan
        $backupDir = "backups/database_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        
        foreach ($file in $foundFiles) {
            $fileName = Split-Path $file -Leaf
            Copy-Item $file -Destination "$backupDir/$fileName"
            Write-Host "   ✓ 已备份: $fileName" -ForegroundColor Green
        }
        Write-Host ""
    }
    
    if ($Force -or (Read-Host "是否删除这些文件? (y/N)") -eq 'y') {
        foreach ($file in $foundFiles) {
            Remove-Item $file -Force
            Write-Host "   ✓ 已删除: $file" -ForegroundColor Green
        }
        Write-Host ""
    } else {
        Write-Host "⚠️  操作已取消" -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "   ✅ 未发现需要清理的SQLite文件" -ForegroundColor Green
    Write-Host ""
}

# 步骤4: 验证SQL Server连接
if ($dbType -match "LocalDb|SqlServer|MSSQL") {
    Write-Host "🔌 验证SQL Server LocalDB连接..." -ForegroundColor Cyan
    
    try {
        $sqlCmd = "sqllocaldb info MSSQLLocalDB"
        $result = Invoke-Expression $sqlCmd 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ SQL Server LocalDB 实例运行正常" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  SQL Server LocalDB 未运行，正在启动..." -ForegroundColor Yellow
            sqllocaldb start MSSQLLocalDB
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ SQL Server LocalDB 启动成功" -ForegroundColor Green
            } else {
                Write-Host "   ❌ SQL Server LocalDB 启动失败" -ForegroundColor Red
                Write-Host "   💡 请手动检查LocalDB安装: sqllocaldb info" -ForegroundColor Yellow
                exit 1
            }
        }
    } catch {
        Write-Host "   ⚠️  无法检测LocalDB状态: $_" -ForegroundColor Yellow
        Write-Host "   💡 请确保已安装SQL Server LocalDB" -ForegroundColor Yellow
    }
    Write-Host ""
}

# 步骤5: 重新构建DbMigrator项目
Write-Host "🔨 重新构建DbMigrator项目..." -ForegroundColor Cyan
Set-Location "src/SmartAbp.DbMigrator"

dotnet build --configuration Release

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ 构建失败" -ForegroundColor Red
    exit 1
}

Write-Host "   ✅ 构建成功" -ForegroundColor Green
Write-Host ""

# 步骤6: 执行数据库迁移
Write-Host "🚀 执行数据库迁移..." -ForegroundColor Cyan
Write-Host "   目标数据库: $dbType" -ForegroundColor White
Write-Host ""

dotnet run --no-build --configuration Release

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "✅ 数据库迁移修复完成！" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host "❌ 数据库迁移失败" -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 请检查日志文件: src/SmartAbp.DbMigrator/Logs/logs.txt" -ForegroundColor Yellow
    exit 1
}

Set-Location $projectRoot

