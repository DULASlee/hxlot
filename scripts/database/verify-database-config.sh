#!/bin/bash
# 🔍 跨平台数据库配置验证脚本
# 用途: 验证数据库配置的正确性，确保Mac和Windows都能正常运行

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 SmartAbp 数据库配置验证"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检测操作系统
OS_TYPE="Unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macOS"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS_TYPE="Windows"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_TYPE="Linux"
fi

echo "🖥️  操作系统: $OS_TYPE"
echo ""

# 定义项目路径
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APPSETTINGS_PATH="$PROJECT_ROOT/src/SmartAbp.DbMigrator/appsettings.json"

# 读取配置
if [ ! -f "$APPSETTINGS_PATH" ]; then
    echo "❌ 找不到配置文件: $APPSETTINGS_PATH"
    exit 1
fi

echo "📄 配置文件: $APPSETTINGS_PATH"
echo ""

# 提取配置信息
DB_TYPE=$(grep -A 1 "\"Database\":" "$APPSETTINGS_PATH" | grep "\"Type\":" | sed 's/.*: "\(.*\)".*/\1/')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 数据库配置信息"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "配置的数据库类型: $DB_TYPE"
echo ""

# 根据OS推荐数据库类型
RECOMMENDED_DB="Unknown"
case "$OS_TYPE" in
    "macOS")
        RECOMMENDED_DB="PostgreSQL"
        if [ "$DB_TYPE" == "Auto" ] || [ "$DB_TYPE" == "PostgreSQL" ]; then
            echo "✅ macOS推荐使用PostgreSQL - 配置正确"
        else
            echo "⚠️  macOS推荐使用PostgreSQL，当前配置: $DB_TYPE"
        fi
        
        # 检查PostgreSQL是否安装
        if command -v psql &> /dev/null; then
            PSQL_VERSION=$(psql --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
            echo "✅ PostgreSQL已安装 (版本: $PSQL_VERSION)"
            
            # 检查服务状态
            if brew services list | grep postgresql | grep -q started; then
                echo "✅ PostgreSQL服务正在运行"
            else
                echo "⚠️  PostgreSQL服务未运行"
                echo "   使用以下命令启动:"
                echo "   brew services start postgresql@16"
            fi
        else
            echo "❌ PostgreSQL未安装"
            echo "   使用以下命令安装:"
            echo "   brew install postgresql@16"
            echo "   brew services start postgresql@16"
        fi
        ;;
        
    "Windows")
        RECOMMENDED_DB="LocalDb"
        if [ "$DB_TYPE" == "Auto" ] || [ "$DB_TYPE" == "LocalDb" ] || [ "$DB_TYPE" == "SqlServer" ]; then
            echo "✅ Windows推荐使用SQL Server LocalDB - 配置正确"
        else
            echo "⚠️  Windows推荐使用SQL Server，当前配置: $DB_TYPE"
        fi
        
        # Windows下检查SQL Server
        echo "💡 Windows环境请确保:"
        echo "   1. 已安装SQL Server LocalDB或SQL Server"
        echo "   2. SQL Server服务正在运行"
        ;;
        
    "Linux")
        RECOMMENDED_DB="PostgreSQL"
        if [ "$DB_TYPE" == "Auto" ] || [ "$DB_TYPE" == "PostgreSQL" ]; then
            echo "✅ Linux推荐使用PostgreSQL - 配置正确"
        else
            echo "⚠️  Linux推荐使用PostgreSQL，当前配置: $DB_TYPE"
        fi
        ;;
        
    *)
        echo "⚠️  未识别的操作系统"
        ;;
esac

echo ""

# 检查迁移文件
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 迁移文件检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

MIGRATIONS_PATH="$PROJECT_ROOT/src/SmartAbp.EntityFrameworkCore/Migrations"

check_migrations() {
    local db_folder=$1
    local db_name=$2
    
    if [ -d "$MIGRATIONS_PATH/$db_folder" ]; then
        local migration_count=$(find "$MIGRATIONS_PATH/$db_folder" -name "*.cs" -not -name "*.Designer.cs" | wc -l | tr -d ' ')
        if [ "$migration_count" -gt 0 ]; then
            echo "✅ $db_name: $migration_count 个迁移文件"
        else
            echo "⚠️  $db_name: 无迁移文件"
        fi
    else
        echo "❌ $db_name: 迁移文件夹不存在"
    fi
}

check_migrations "SqlServer" "SQL Server"
check_migrations "PostgreSQL" "PostgreSQL"
check_migrations "SQLite" "SQLite"
echo ""

# 检查.NET环境
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 .NET环境检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v dotnet &> /dev/null; then
    DOTNET_VERSION=$(dotnet --version)
    echo "✅ .NET SDK已安装 (版本: $DOTNET_VERSION)"
    
    # 检查是否为.NET 9
    if [[ "$DOTNET_VERSION" == 9.* ]]; then
        echo "✅ .NET 9.x - 版本正确"
    else
        echo "⚠️  当前版本: $DOTNET_VERSION，项目需要.NET 9.x"
    fi
else
    echo "❌ .NET SDK未安装"
    echo "   请访问: https://dot.net"
fi
echo ""

# 检查Entity Framework工具
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛠️  Entity Framework工具检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if dotnet ef --version &> /dev/null; then
    EF_VERSION=$(dotnet ef --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    echo "✅ EF Core工具已安装 (版本: $EF_VERSION)"
else
    echo "❌ EF Core工具未安装"
    echo "   使用以下命令安装:"
    echo "   dotnet tool install --global dotnet-ef"
fi
echo ""

# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 验证总结"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "操作系统: $OS_TYPE"
echo "推荐数据库: $RECOMMENDED_DB"
echo "当前配置: $DB_TYPE"
echo ""

# 提供建议
if [ "$OS_TYPE" == "macOS" ] && [ "$DB_TYPE" != "PostgreSQL" ] && [ "$DB_TYPE" != "Auto" ]; then
    echo "💡 建议:"
    echo "   1. 将Database:Type改为'PostgreSQL'或'Auto'"
    echo "   2. 运行 ./setup-mac-postgresql.sh 初始化数据库"
    echo ""
elif [ "$OS_TYPE" == "Windows" ] && [ "$DB_TYPE" != "LocalDb" ] && [ "$DB_TYPE" != "SqlServer" ] && [ "$DB_TYPE" != "Auto" ]; then
    echo "💡 建议:"
    echo "   1. 将Database:Type改为'LocalDb'或'Auto'"
    echo "   2. 确保SQL Server LocalDB已安装并运行"
    echo ""
elif [ "$DB_TYPE" == "Auto" ]; then
    echo "✅ 当前使用Auto模式，系统会根据OS自动选择数据库"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

