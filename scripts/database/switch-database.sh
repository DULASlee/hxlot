#!/bin/bash

# SmartAbp 企业级数据库一键切换工具
# 支持：SQLite, PostgreSQL, MySQL, SQL Server
# 作者：AI首席架构师
# 版本：v1.0

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# 配置文件路径
WEB_CONFIG="$PROJECT_ROOT/src/SmartAbp.Web/appsettings.json"
MIGRATOR_CONFIG="$PROJECT_ROOT/src/SmartAbp.DbMigrator/appsettings.json"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 SmartAbp 企业级数据库一键切换工具${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 显示当前数据库配置
show_current_config() {
    echo -e "${BLUE}📊 当前数据库配置:${NC}"
    echo ""
    
    if [ -f "$WEB_CONFIG" ]; then
        local db_type=$(grep -A 1 '"Database"' "$WEB_CONFIG" | grep '"Type"' | sed 's/.*: "\(.*\)".*/\1/')
        local conn_str=$(grep -A 2 '"ConnectionStrings"' "$WEB_CONFIG" | grep '"Default"' | sed 's/.*: "\(.*\)".*/\1/')
        
        echo -e "  ${GREEN}✓${NC} Web应用:"
        echo -e "    数据库类型: ${YELLOW}$db_type${NC}"
        echo -e "    连接字符串: ${YELLOW}${conn_str:0:50}...${NC}"
    fi
    
    echo ""
}

# 数据库配置模板
configure_sqlite() {
    local db_file=${1:-"smartabp.db"}
    
    cat > /tmp/db_config.json <<EOF
{
  "Database": {
    "Type": "SQLite"
  },
  "ConnectionStrings": {
    "Default": "Data Source=$db_file"
  }
}
EOF
}

configure_postgresql() {
    local host=${1:-"localhost"}
    local port=${2:-"5432"}
    local database=${3:-"smartabp"}
    local username=${4:-"smartabp_user"}
    local password=${5:-"SmartAbp@2025"}
    
    cat > /tmp/db_config.json <<EOF
{
  "Database": {
    "Type": "PostgreSQL"
  },
  "ConnectionStrings": {
    "Default": "Host=$host;Database=$database;Username=$username;Password=$password;Port=$port"
  }
}
EOF
}

configure_mysql() {
    local host=${1:-"localhost"}
    local port=${2:-"3306"}
    local database=${3:-"smartabp"}
    local username=${4:-"root"}
    local password=${5:-"SmartAbp@2025"}
    
    cat > /tmp/db_config.json <<EOF
{
  "Database": {
    "Type": "MySQL"
  },
  "ConnectionStrings": {
    "Default": "Server=$host;Port=$port;Database=$database;User=$username;Password=$password;"
  }
}
EOF
}

configure_sqlserver() {
    local host=${1:-"localhost"}
    local database=${2:-"SmartAbp"}
    local username=${3:-"sa"}
    local password=${4:-"SmartAbp@2025"}
    
    cat > /tmp/db_config.json <<EOF
{
  "Database": {
    "Type": "SqlServer"
  },
  "ConnectionStrings": {
    "Default": "Server=$host;Database=$database;User Id=$username;Password=$password;TrustServerCertificate=True"
  }
}
EOF
}

# 应用配置
apply_config() {
    local config_file=$1
    local temp_config="/tmp/db_config.json"
    
    if [ ! -f "$temp_config" ]; then
        echo -e "${RED}❌ 配置文件不存在${NC}"
        return 1
    fi
    
    # 备份原配置
    cp "$config_file" "${config_file}.backup.$(date +%Y%m%d-%H%M%S)"
    
    # 读取新配置
    local db_type=$(grep '"Type"' "$temp_config" | sed 's/.*: "\(.*\)".*/\1/')
    local conn_str=$(grep '"Default"' "$temp_config" | sed 's/.*: "\(.*\)".*/\1/')
    
    # 使用jq更新配置（如果有的话），否则使用sed
    if command -v jq &> /dev/null; then
        jq --arg type "$db_type" --arg conn "$conn_str" \
           '.Database.Type = $type | .ConnectionStrings.Default = $conn' \
           "$config_file" > /tmp/updated_config.json
        mv /tmp/updated_config.json "$config_file"
    else
        # 简单的sed替换（不够完美，但能用）
        sed -i.tmp -e "s|\"Type\": \".*\"|\"Type\": \"$db_type\"|" \
                   -e "s|\"Default\": \".*\"|\"Default\": \"$conn_str\"|" \
           "$config_file"
        rm -f "${config_file}.tmp"
    fi
    
    echo -e "${GREEN}✓${NC} 已更新: $config_file"
}

# 主菜单
show_menu() {
    echo -e "${PURPLE}请选择数据库类型:${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC} SQLite        ${YELLOW}[零配置，开发推荐]${NC}"
    echo -e "  ${CYAN}2)${NC} PostgreSQL    ${YELLOW}[生产推荐，开源免费]${NC}"
    echo -e "  ${CYAN}3)${NC} MySQL         ${YELLOW}[高性价比]${NC}"
    echo -e "  ${CYAN}4)${NC} SQL Server    ${YELLOW}[企业版，Windows推荐]${NC}"
    echo -e "  ${CYAN}5)${NC} 显示当前配置"
    echo -e "  ${CYAN}0)${NC} 退出"
    echo ""
    echo -n -e "${BLUE}请输入选项 [0-5]: ${NC}"
}

# SQLite配置向导
wizard_sqlite() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📦 SQLite 配置向导${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    read -p "数据库文件名 [默认: smartabp.db]: " db_file
    db_file=${db_file:-"smartabp.db"}
    
    configure_sqlite "$db_file"
    
    echo ""
    echo -e "${GREEN}✓${NC} SQLite配置已生成"
    echo -e "  数据库文件: ${YELLOW}$db_file${NC}"
}

# PostgreSQL配置向导
wizard_postgresql() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🐘 PostgreSQL 配置向导${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    read -p "主机地址 [默认: localhost]: " host
    host=${host:-"localhost"}
    
    read -p "端口 [默认: 5432]: " port
    port=${port:-"5432"}
    
    read -p "数据库名 [默认: smartabp]: " database
    database=${database:-"smartabp"}
    
    read -p "用户名 [默认: smartabp_user]: " username
    username=${username:-"smartabp_user"}
    
    read -s -p "密码 [默认: SmartAbp@2025]: " password
    password=${password:-"SmartAbp@2025"}
    echo ""
    
    configure_postgresql "$host" "$port" "$database" "$username" "$password"
    
    echo ""
    echo -e "${GREEN}✓${NC} PostgreSQL配置已生成"
    echo -e "  连接: ${YELLOW}$username@$host:$port/$database${NC}"
}

# MySQL配置向导
wizard_mysql() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🐬 MySQL 配置向导${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    read -p "主机地址 [默认: localhost]: " host
    host=${host:-"localhost"}
    
    read -p "端口 [默认: 3306]: " port
    port=${port:-"3306"}
    
    read -p "数据库名 [默认: smartabp]: " database
    database=${database:-"smartabp"}
    
    read -p "用户名 [默认: root]: " username
    username=${username:-"root"}
    
    read -s -p "密码 [默认: SmartAbp@2025]: " password
    password=${password:-"SmartAbp@2025"}
    echo ""
    
    configure_mysql "$host" "$port" "$database" "$username" "$password"
    
    echo ""
    echo -e "${GREEN}✓${NC} MySQL配置已生成"
    echo -e "  连接: ${YELLOW}$username@$host:$port/$database${NC}"
}

# SQL Server配置向导
wizard_sqlserver() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🔷 SQL Server 配置向导${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    read -p "主机地址 [默认: localhost]: " host
    host=${host:-"localhost"}
    
    read -p "数据库名 [默认: SmartAbp]: " database
    database=${database:-"SmartAbp"}
    
    read -p "用户名 [默认: sa]: " username
    username=${username:-"sa"}
    
    read -s -p "密码 [默认: SmartAbp@2025]: " password
    password=${password:-"SmartAbp@2025"}
    echo ""
    
    configure_sqlserver "$host" "$database" "$username" "$password"
    
    echo ""
    echo -e "${GREEN}✓${NC} SQL Server配置已生成"
    echo -e "  连接: ${YELLOW}$username@$host/$database${NC}"
}

# 确认应用配置
confirm_apply() {
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  确认应用配置${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "将更新以下配置文件:"
    echo -e "  • src/SmartAbp.Web/appsettings.json"
    echo -e "  • src/SmartAbp.DbMigrator/appsettings.json"
    echo ""
    echo -e "${YELLOW}原配置将自动备份（.backup文件）${NC}"
    echo ""
    read -p "是否继续? [y/N]: " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${BLUE}🔄 正在应用配置...${NC}"
        echo ""
        
        apply_config "$WEB_CONFIG"
        apply_config "$MIGRATOR_CONFIG"
        
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ 数据库配置已成功切换！${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${CYAN}📝 下一步操作:${NC}"
        echo -e "  1. 运行数据库迁移:"
        echo -e "     ${YELLOW}cd src/SmartAbp.DbMigrator && dotnet run${NC}"
        echo -e "  2. 启动后端服务:"
        echo -e "     ${YELLOW}cd src/SmartAbp.Web && dotnet run${NC}"
        echo -e "  3. 启动前端服务:"
        echo -e "     ${YELLOW}cd src/SmartAbp.Vue && npm run dev${NC}"
        echo ""
    else
        echo ""
        echo -e "${YELLOW}⚠️  操作已取消${NC}"
    fi
}

# 主循环
main() {
    while true; do
        clear
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${CYAN}🚀 SmartAbp 企业级数据库一键切换工具${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        
        show_menu
        read choice
        
        case $choice in
            1)
                wizard_sqlite
                confirm_apply
                read -p "按任意键继续..." -n 1
                ;;
            2)
                wizard_postgresql
                confirm_apply
                read -p "按任意键继续..." -n 1
                ;;
            3)
                wizard_mysql
                confirm_apply
                read -p "按任意键继续..." -n 1
                ;;
            4)
                wizard_sqlserver
                confirm_apply
                read -p "按任意键继续..." -n 1
                ;;
            5)
                show_current_config
                read -p "按任意键继续..." -n 1
                ;;
            0)
                echo ""
                echo -e "${GREEN}👋 再见！${NC}"
                echo ""
                exit 0
                ;;
            *)
                echo ""
                echo -e "${RED}❌ 无效选项，请重新选择${NC}"
                sleep 2
                ;;
        esac
    done
}

# 检查是否有命令行参数（非交互模式）
if [ $# -gt 0 ]; then
    case $1 in
        sqlite)
            configure_sqlite "${2:-smartabp.db}"
            apply_config "$WEB_CONFIG"
            apply_config "$MIGRATOR_CONFIG"
            echo -e "${GREEN}✓ 已切换到 SQLite${NC}"
            ;;
        postgresql|postgres)
            configure_postgresql "$2" "$3" "$4" "$5" "$6"
            apply_config "$WEB_CONFIG"
            apply_config "$MIGRATOR_CONFIG"
            echo -e "${GREEN}✓ 已切换到 PostgreSQL${NC}"
            ;;
        mysql)
            configure_mysql "$2" "$3" "$4" "$5" "$6"
            apply_config "$WEB_CONFIG"
            apply_config "$MIGRATOR_CONFIG"
            echo -e "${GREEN}✓ 已切换到 MySQL${NC}"
            ;;
        sqlserver|mssql)
            configure_sqlserver "$2" "$3" "$4" "$5"
            apply_config "$WEB_CONFIG"
            apply_config "$MIGRATOR_CONFIG"
            echo -e "${GREEN}✓ 已切换到 SQL Server${NC}"
            ;;
        --help|-h)
            echo "用法: $0 [数据库类型] [参数...]"
            echo ""
            echo "数据库类型:"
            echo "  sqlite [文件名]"
            echo "  postgresql [主机] [端口] [数据库] [用户名] [密码]"
            echo "  mysql [主机] [端口] [数据库] [用户名] [密码]"
            echo "  sqlserver [主机] [数据库] [用户名] [密码]"
            echo ""
            echo "示例:"
            echo "  $0 sqlite dev.db"
            echo "  $0 postgresql localhost 5432 smartabp user pass"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}❌ 未知的数据库类型: $1${NC}"
            echo "使用 --help 查看帮助"
            exit 1
            ;;
    esac
else
    # 交互模式
    main
fi

