# SmartAbp 企业级数据库一键切换工具 (Windows版)
# 支持：SQLite, PostgreSQL, MySQL, SQL Server
# 作者：AI首席架构师
# 版本：v1.0

param(
    [Parameter(Position=0)]
    [ValidateSet('sqlite', 'postgresql', 'mysql', 'sqlserver', '')]
    [string]$DatabaseType = '',
    
    [Parameter(Position=1)]
    [string]$Param1 = '',
    
    [Parameter(Position=2)]
    [string]$Param2 = '',
    
    [Parameter(Position=3)]
    [string]$Param3 = '',
    
    [Parameter(Position=4)]
    [string]$Param4 = '',
    
    [Parameter(Position=5)]
    [string]$Param5 = ''
)

# 项目根目录
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$WebConfig = Join-Path $ProjectRoot "src\SmartAbp.Web\appsettings.json"
$MigratorConfig = Join-Path $ProjectRoot "src\SmartAbp.DbMigrator\appsettings.json"

function Write-ColoredLine {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Show-Header {
    Write-Host ""
    Write-ColoredLine "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
    Write-ColoredLine "🚀 SmartAbp 企业级数据库一键切换工具" "Cyan"
    Write-ColoredLine "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
    Write-Host ""
}

function Show-CurrentConfig {
    Write-ColoredLine "📊 当前数据库配置:" "Blue"
    Write-Host ""
    
    if (Test-Path $WebConfig) {
        $config = Get-Content $WebConfig | ConvertFrom-Json
        $dbType = $config.Database.Type
        $connStr = $config.ConnectionStrings.Default
        
        Write-Host "  " -NoNewline
        Write-ColoredLine "✓" "Green" -NoNewline
        Write-Host " Web应用:"
        Write-Host "    数据库类型: " -NoNewline
        Write-ColoredLine $dbType "Yellow"
        Write-Host "    连接字符串: " -NoNewline
        Write-ColoredLine ($connStr.Substring(0, [Math]::Min(50, $connStr.Length)) + "...") "Yellow"
    }
    
    Write-Host ""
}

function New-DatabaseConfig {
    param(
        [string]$Type,
        [string]$ConnectionString
    )
    
    return @{
        Database = @{
            Type = $Type
        }
        ConnectionStrings = @{
            Default = $ConnectionString
        }
    } | ConvertTo-Json -Depth 10
}

function Apply-Config {
    param(
        [string]$ConfigFile,
        [string]$DbType,
        [string]$ConnectionString
    )
    
    # 备份原配置
    $backupFile = "$ConfigFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $ConfigFile $backupFile
    
    # 读取现有配置
    $config = Get-Content $ConfigFile | ConvertFrom-Json
    
    # 更新数据库配置
    $config.Database.Type = $DbType
    $config.ConnectionStrings.Default = $ConnectionString
    
    # 保存配置
    $config | ConvertTo-Json -Depth 100 | Set-Content $ConfigFile
    
    Write-Host "  " -NoNewline
    Write-ColoredLine "✓" "Green" -NoNewline
    Write-Host " 已更新: $ConfigFile"
}

function Configure-SQLite {
    param([string]$DbFile = "smartabp.db")
    
    Write-Host ""
    Write-ColoredLine "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
    Write-ColoredLine "📦 SQLite 配置" "Cyan"
    Write-ColoredLine "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
    Write-Host ""
    
    $connStr = "Data Source=$DbFile"
    
    Write-ColoredLine "  数据库文件: $DbFile" "Yellow"
    Write-Host ""
    
    return @{
        Type = "SQLite"
        ConnectionString = $connStr
    }
}

function Configure-PostgreSQL {
    param(
        [string]$Host = "localhost",
        [string]$Port = "5432",
        [string]$Database = "smartabp",
        [string]$Username = "smartabp_user",
        [string]$Password = "SmartAbp@2025"
    )
    
    Write-Host ""
    Write-ColoredLine "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
    Write-ColoredLine "🐘 PostgreSQL 配置" "Cyan"
    Write-ColoredLine "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
    Write-Host ""
    
    $connStr = "Host=$Host;Database=$Database;Username=$Username;Password=$Password;Port=$Port"
    
    Write-ColoredLine "  连接: $Username@$Host:$Port/$Database" "Yellow"
    Write-Host ""
    
    return @{
        Type = "PostgreSQL"
        ConnectionString = $connStr
    }
}

function Configure-MySQL {
    param(
        [string]$Host = "localhost",
        [string]$Port = "3306",
        [string]$Database = "smartabp",
        [string]$Username = "root",
        [string]$Password = "SmartAbp@2025"
    )
    
    Write-Host ""
    Write-ColoredLine "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
    Write-ColoredLine "🐬 MySQL 配置" "Cyan"
    Write-ColoredLine "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
    Write-Host ""
    
    $connStr = "Server=$Host;Port=$Port;Database=$Database;User=$Username;Password=$Password;"
    
    Write-ColoredLine "  连接: $Username@$Host:$Port/$Database" "Yellow"
    Write-Host ""
    
    return @{
        Type = "MySQL"
        ConnectionString = $connStr
    }
}

function Configure-SQLServer {
    param(
        [string]$Host = "localhost",
        [string]$Database = "SmartAbp",
        [string]$Username = "sa",
        [string]$Password = "SmartAbp@2025"
    )
    
    Write-Host ""
    Write-ColoredLine "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
    Write-ColoredLine "🔷 SQL Server 配置" "Cyan"
    Write-ColoredLine "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
    Write-Host ""
    
    $connStr = "Server=$Host;Database=$Database;User Id=$Username;Password=$Password;TrustServerCertificate=True"
    
    Write-ColoredLine "  连接: $Username@$Host/$Database" "Yellow"
    Write-Host ""
    
    return @{
        Type = "SqlServer"
        ConnectionString = $connStr
    }
}

function Show-Menu {
    Write-ColoredLine "请选择数据库类型:" "Magenta"
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-ColoredLine "1)" "Cyan" -NoNewline
    Write-Host " SQLite        " -NoNewline
    Write-ColoredLine "[零配置，开发推荐]" "Yellow"
    
    Write-Host "  " -NoNewline
    Write-ColoredLine "2)" "Cyan" -NoNewline
    Write-Host " PostgreSQL    " -NoNewline
    Write-ColoredLine "[生产推荐，开源免费]" "Yellow"
    
    Write-Host "  " -NoNewline
    Write-ColoredLine "3)" "Cyan" -NoNewline
    Write-Host " MySQL         " -NoNewline
    Write-ColoredLine "[高性价比]" "Yellow"
    
    Write-Host "  " -NoNewline
    Write-ColoredLine "4)" "Cyan" -NoNewline
    Write-Host " SQL Server    " -NoNewline
    Write-ColoredLine "[企业版，Windows推荐]" "Yellow"
    
    Write-Host "  " -NoNewline
    Write-ColoredLine "5)" "Cyan" -NoNewline
    Write-Host " 显示当前配置"
    
    Write-Host "  " -NoNewline
    Write-ColoredLine "0)" "Cyan" -NoNewline
    Write-Host " 退出"
    
    Write-Host ""
    Write-Host "请输入选项 [0-5]: " -NoNewline
}

function Confirm-Apply {
    param($Config)
    
    Write-Host ""
    Write-ColoredLine "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Yellow"
    Write-ColoredLine "⚠️  确认应用配置" "Yellow"
    Write-ColoredLine "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Yellow"
    Write-Host ""
    Write-Host "将更新以下配置文件:"
    Write-Host "  • src\SmartAbp.Web\appsettings.json"
    Write-Host "  • src\SmartAbp.DbMigrator\appsettings.json"
    Write-Host ""
    Write-ColoredLine "原配置将自动备份（.backup文件）" "Yellow"
    Write-Host ""
    
    $confirm = Read-Host "是否继续? [y/N]"
    
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        Write-Host ""
        Write-ColoredLine "🔄 正在应用配置..." "Blue"
        Write-Host ""
        
        Apply-Config $WebConfig $Config.Type $Config.ConnectionString
        Apply-Config $MigratorConfig $Config.Type $Config.ConnectionString
        
        Write-Host ""
        Write-ColoredLine "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Green"
        Write-ColoredLine "✅ 数据库配置已成功切换！" "Green"
        Write-ColoredLine "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Green"
        Write-Host ""
        Write-ColoredLine "📝 下一步操作:" "Cyan"
        Write-Host "  1. 运行数据库迁移:"
        Write-ColoredLine "     cd src\SmartAbp.DbMigrator; dotnet run" "Yellow"
        Write-Host "  2. 启动后端服务:"
        Write-ColoredLine "     cd src\SmartAbp.Web; dotnet run" "Yellow"
        Write-Host "  3. 启动前端服务:"
        Write-ColoredLine "     cd src\SmartAbp.Vue; npm run dev" "Yellow"
        Write-Host ""
    } else {
        Write-Host ""
        Write-ColoredLine "⚠️  操作已取消" "Yellow"
    }
    
    Read-Host "按任意键继续..."
}

# 非交互模式
if ($DatabaseType) {
    Show-Header
    
    $config = switch ($DatabaseType.ToLower()) {
        'sqlite' { Configure-SQLite $Param1 }
        'postgresql' { Configure-PostgreSQL $Param1 $Param2 $Param3 $Param4 $Param5 }
        'mysql' { Configure-MySQL $Param1 $Param2 $Param3 $Param4 $Param5 }
        'sqlserver' { Configure-SQLServer $Param1 $Param2 $Param3 $Param4 }
    }
    
    Apply-Config $WebConfig $config.Type $config.ConnectionString
    Apply-Config $MigratorConfig $config.Type $config.ConnectionString
    
    Write-ColoredLine "✓ 已切换到 $($config.Type)" "Green"
    Write-Host ""
    exit 0
}

# 交互模式
while ($true) {
    Clear-Host
    Show-Header
    Show-Menu
    
    $choice = Read-Host
    
    $config = $null
    
    switch ($choice) {
        '1' {
            $dbFile = Read-Host "数据库文件名 [默认: smartabp.db]"
            if (!$dbFile) { $dbFile = "smartabp.db" }
            $config = Configure-SQLite $dbFile
            Confirm-Apply $config
        }
        '2' {
            $host = Read-Host "主机地址 [默认: localhost]"
            if (!$host) { $host = "localhost" }
            $port = Read-Host "端口 [默认: 5432]"
            if (!$port) { $port = "5432" }
            $database = Read-Host "数据库名 [默认: smartabp]"
            if (!$database) { $database = "smartabp" }
            $username = Read-Host "用户名 [默认: smartabp_user]"
            if (!$username) { $username = "smartabp_user" }
            $password = Read-Host "密码 [默认: SmartAbp@2025]" -AsSecureString
            if ($password.Length -eq 0) {
                $password = "SmartAbp@2025"
            } else {
                $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
            }
            $config = Configure-PostgreSQL $host $port $database $username $password
            Confirm-Apply $config
        }
        '3' {
            $host = Read-Host "主机地址 [默认: localhost]"
            if (!$host) { $host = "localhost" }
            $port = Read-Host "端口 [默认: 3306]"
            if (!$port) { $port = "3306" }
            $database = Read-Host "数据库名 [默认: smartabp]"
            if (!$database) { $database = "smartabp" }
            $username = Read-Host "用户名 [默认: root]"
            if (!$username) { $username = "root" }
            $password = Read-Host "密码 [默认: SmartAbp@2025]" -AsSecureString
            if ($password.Length -eq 0) {
                $password = "SmartAbp@2025"
            } else {
                $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
            }
            $config = Configure-MySQL $host $port $database $username $password
            Confirm-Apply $config
        }
        '4' {
            $host = Read-Host "主机地址 [默认: localhost]"
            if (!$host) { $host = "localhost" }
            $database = Read-Host "数据库名 [默认: SmartAbp]"
            if (!$database) { $database = "SmartAbp" }
            $username = Read-Host "用户名 [默认: sa]"
            if (!$username) { $username = "sa" }
            $password = Read-Host "密码 [默认: SmartAbp@2025]" -AsSecureString
            if ($password.Length -eq 0) {
                $password = "SmartAbp@2025"
            } else {
                $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
            }
            $config = Configure-SQLServer $host $database $username $password
            Confirm-Apply $config
        }
        '5' {
            Show-CurrentConfig
            Read-Host "按任意键继续..."
        }
        '0' {
            Write-Host ""
            Write-ColoredLine "👋 再见！" "Green"
            Write-Host ""
            exit 0
        }
        default {
            Write-Host ""
            Write-ColoredLine "❌ 无效选项，请重新选择" "Red"
            Start-Sleep -Seconds 2
        }
    }
}

