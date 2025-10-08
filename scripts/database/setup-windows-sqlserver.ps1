# 🔷 Windows SQL Server 数据库设置脚本
# 用途: 在Windows上初始化SQL Server数据库，确保迁移文件完整

param(
    [switch]$UseLocalDb = $true,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔷 SmartAbp SQL Server 数据库设置（Windows专用）" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 检测操作系统
if ($PSVersionTable.Platform -and $PSVersionTable.Platform -ne "Win32NT") {
    Write-Host "⚠️  此脚本仅适用于Windows系统" -ForegroundColor Yellow
    exit 1
}

# 定义变量
$DB_NAME = "SmartAbp"
$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
$EF_PROJECT = Join-Path $PROJECT_ROOT "src\SmartAbp.EntityFrameworkCore"
$MIGRATOR_PROJECT = Join-Path $PROJECT_ROOT "src\SmartAbp.DbMigrator"

Write-Host "📁 项目路径: $PROJECT_ROOT" -ForegroundColor White
Write-Host "🗄️  数据库名: $DB_NAME" -ForegroundColor White
Write-Host "🔧 使用: $(if ($UseLocalDb) {'LocalDB'} else {'SQL Server'})" -ForegroundColor White
Write-Host ""

# 步骤1: 检查.NET SDK
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 步骤1: 检查.NET SDK" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

try {
    $dotnetVersion = dotnet --version
    Write-Host "✅ .NET SDK已安装" -ForegroundColor Green
    Write-Host "   版本: $dotnetVersion" -ForegroundColor White
    
    if (-not $dotnetVersion.StartsWith("9.")) {
        Write-Host "⚠️  当前版本: $dotnetVersion，项目需要.NET 9.x" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ 未检测到.NET SDK" -ForegroundColor Red
    Write-Host "   请访问: https://dot.net 下载安装" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 步骤2: 检查EF Core工具
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 步骤2: 检查EF Core工具" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

try {
    $efVersion = dotnet ef --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ EF Core工具已安装" -ForegroundColor Green
        Write-Host "   $efVersion" -ForegroundColor White
    } else {
        throw "EF Core工具未安装"
    }
} catch {
    Write-Host "❌ EF Core工具未安装" -ForegroundColor Red
    Write-Host "⏳ 正在安装..." -ForegroundColor Yellow
    dotnet tool install --global dotnet-ef
    Write-Host "✅ EF Core工具安装完成" -ForegroundColor Green
}
Write-Host ""

# 步骤3: 检查SQL Server
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 步骤3: 检查SQL Server" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if ($UseLocalDb) {
    # 检查LocalDB
    try {
        $localDbInfo = SqlLocalDB.exe info MSSQLLocalDB 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ SQL Server LocalDB已安装" -ForegroundColor Green
            
            # 检查是否运行
            $status = SqlLocalDB.exe info MSSQLLocalDB | Select-String "State:"
            if ($status -match "Running") {
                Write-Host "✅ LocalDB实例正在运行" -ForegroundColor Green
            } else {
                Write-Host "⏳ 正在启动LocalDB实例..." -ForegroundColor Yellow
                SqlLocalDB.exe start MSSQLLocalDB
                Start-Sleep -Seconds 2
                Write-Host "✅ LocalDB实例已启动" -ForegroundColor Green
            }
        } else {
            throw "LocalDB未安装"
        }
    } catch {
        Write-Host "❌ SQL Server LocalDB未安装" -ForegroundColor Red
        Write-Host "   请安装Visual Studio或SQL Server Express" -ForegroundColor Yellow
        Write-Host "   下载地址: https://go.microsoft.com/fwlink/?linkid=866662" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "⏳ 检查SQL Server服务..." -ForegroundColor Yellow
    $sqlService = Get-Service -Name "MSSQLSERVER" -ErrorAction SilentlyContinue
    
    if ($sqlService) {
        if ($sqlService.Status -eq "Running") {
            Write-Host "✅ SQL Server服务正在运行" -ForegroundColor Green
        } else {
            Write-Host "⚠️  SQL Server服务未运行" -ForegroundColor Yellow
            Write-Host "   请启动SQL Server服务" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  未检测到SQL Server服务" -ForegroundColor Yellow
        Write-Host "   请确保SQL Server已安装" -ForegroundColor Yellow
    }
}
Write-Host ""

# 步骤4: 生成迁移文件
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 步骤4: 检查SQL Server迁移文件" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Set-Location $EF_PROJECT

$migrationsPath = Join-Path $EF_PROJECT "Migrations\SqlServer"
$migrationFiles = Get-ChildItem -Path $migrationsPath -Filter "*.cs" -Exclude "*.Designer.cs" -ErrorAction SilentlyContinue

if ($migrationFiles) {
    Write-Host "✅ SQL Server迁移文件已存在" -ForegroundColor Green
    Write-Host "   迁移数量: $($migrationFiles.Count)" -ForegroundColor White
    
    if (-not $Force) {
        Write-Host "   使用 -Force 参数可重新生成迁移" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  SQL Server迁移文件不存在" -ForegroundColor Yellow
    $Force = $true
}

if ($Force) {
    Write-Host "⏳ 正在生成SQL Server迁移..." -ForegroundColor Yellow
    Write-Host "   注意: 这可能需要几分钟..." -ForegroundColor Gray
    
    # 设置环境变量
    $env:Database__Type = "SqlServer"
    
    # 生成迁移
    dotnet ef migrations add "SqlServer_CompleteSchema" `
        --context SmartAbpDbContext `
        --output-dir "Migrations\SqlServer" `
        -- --Database:Type=SqlServer
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SQL Server迁移生成成功" -ForegroundColor Green
    } else {
        Write-Host "❌ SQL Server迁移生成失败" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# 步骤5: 更新配置文件
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 步骤5: 更新配置文件" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$appsettingsPath = Join-Path $MIGRATOR_PROJECT "appsettings.json"

$connectionString = if ($UseLocalDb) {
    "Server=(localdb)\\MSSQLLocalDB;Database=SmartAbp;Trusted_Connection=True;TrustServerCertificate=true"
} else {
    "Server=localhost;Database=SmartAbp;User Id=sa;Password=YourPassword123!;TrustServerCertificate=true"
}

$appsettingsContent = @"
{
  "Database": {
    "Type": "SqlServer",
    "Note": "数据库迁移工具 - 使用SQL Server"
  },
  "ConnectionStrings": {
    "Default": "$connectionString",
    "LocalDb": "Server=(localdb)\\MSSQLLocalDB;Database=SmartAbp;Trusted_Connection=True;TrustServerCertificate=true",
    "SqlServer": "Server=localhost;Database=SmartAbp;User Id=sa;Password=YourPassword123!;TrustServerCertificate=true"
  }
}
"@

$appsettingsContent | Out-File -FilePath $appsettingsPath -Encoding UTF8
Write-Host "✅ 配置文件已更新" -ForegroundColor Green
Write-Host ""

# 步骤6: 运行数据库迁移
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 步骤6: 运行数据库迁移" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Set-Location $MIGRATOR_PROJECT

Write-Host "⏳ 正在运行数据库迁移..." -ForegroundColor Yellow
dotnet run

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 数据库迁移完成" -ForegroundColor Green
} else {
    Write-Host "❌ 数据库迁移失败" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 完成
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 SQL Server数据库设置完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 连接信息:" -ForegroundColor White
if ($UseLocalDb) {
    Write-Host "   服务器: (localdb)\MSSQLLocalDB" -ForegroundColor White
    Write-Host "   认证: Windows身份验证" -ForegroundColor White
} else {
    Write-Host "   服务器: localhost" -ForegroundColor White
    Write-Host "   用户名: sa" -ForegroundColor White
}
Write-Host "   数据库: $DB_NAME" -ForegroundColor White
Write-Host ""
Write-Host "💡 提示:" -ForegroundColor White
Write-Host "   1. 使用SQL Server Management Studio (SSMS)连接数据库" -ForegroundColor Gray
Write-Host "   2. 使用Visual Studio的SQL Server对象资源管理器查看数据" -ForegroundColor Gray
Write-Host ""

