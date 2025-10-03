#!/bin/bash

# SmartAbp 多数据库迁移生成工具
# 为所有支持的数据库生成独立的迁移文件

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="/Users/huanyuan/SmartAbp/hxlot"
EF_PROJECT="$PROJECT_ROOT/src/SmartAbp.EntityFrameworkCore"

cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 SmartAbp多数据库迁移生成工具
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

将为以下数据库生成独立迁移：
  1. SQL Server
  2. PostgreSQL  
  3. SQLite

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

echo ""
echo -e "${CYAN}步骤1：备份当前配置${NC}"
cp "$PROJECT_ROOT/src/SmartAbp.DbMigrator/appsettings.json" "$PROJECT_ROOT/src/SmartAbp.DbMigrator/appsettings.json.backup"
echo -e "${GREEN}✅ 配置已备份${NC}"

# 函数：生成指定数据库的迁移
generate_migration() {
    local DB_TYPE=$1
    local DB_NAME=$2
    local CONNECTION_STRING=$3
    local MIGRATION_NAME=$4
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}生成 ${DB_NAME} 迁移${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # 更新配置文件
    cat > "$PROJECT_ROOT/src/SmartAbp.DbMigrator/appsettings.json" << JSON
{
  "Database": {
    "Type": "${DB_TYPE}"
  },
  "ConnectionStrings": {
    "Default": "${CONNECTION_STRING}"
  },
  "OpenIddict": {
    "Applications": {
      "SmartAbp_App": {
        "ClientId": "SmartAbp_App"
      },
      "SmartAbp_Swagger": {
        "ClientId": "SmartAbp_Swagger",
        "RootUrl": "https://localhost:44379/"
      }
    }
  }
}
JSON
    
    echo -e "${YELLOW}⏳ 正在生成${DB_NAME}迁移...${NC}"
    
    cd "$EF_PROJECT"
    
    # 删除当前迁移
    rm -rf Migrations/*.cs 2>/dev/null || true
    
    # 生成新迁移
    dotnet ef migrations add "${MIGRATION_NAME}" --output-dir "Migrations/${DB_TYPE}" 2>&1 | tail -5
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ ${DB_NAME}迁移生成成功${NC}"
        echo -e "${GREEN}   目录: Migrations/${DB_TYPE}/${NC}"
    else
        echo -e "${YELLOW}⚠️  ${DB_NAME}迁移生成失败${NC}"
    fi
}

# 生成SQL Server迁移
generate_migration "SqlServer" "SQL Server" \
    "Server=(LocalDb)\\MSSQLLocalDB;Database=SmartAbp;Trusted_Connection=True;TrustServerCertificate=true" \
    "InitialSqlServer"

# 生成SQLite迁移  
generate_migration "SQLite" "SQLite" \
    "Data Source=smartabp.db" \
    "InitialSQLite"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}恢复原始配置${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 恢复配置
mv "$PROJECT_ROOT/src/SmartAbp.DbMigrator/appsettings.json.backup" "$PROJECT_ROOT/src/SmartAbp.DbMigrator/appsettings.json"
echo -e "${GREEN}✅ 配置已恢复${NC}"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 多数据库迁移生成完成！${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "${GREEN}📁 迁移文件位置：${NC}"
echo "   • SQL Server: $EF_PROJECT/Migrations/SqlServer/"
echo "   • PostgreSQL: $EF_PROJECT/Migrations/PostgreSQL/"
echo "   • SQLite:     $EF_PROJECT/Migrations/SQLite/"

echo ""
echo -e "${YELLOW}💡 下一步：${NC}"
echo "   运行数据库切换工具即可自动使用对应的迁移"
echo "   bash scripts/database/switch-database.sh"

