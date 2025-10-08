#!/bin/bash
# 🐘 Mac PostgreSQL 数据库设置脚本
# 用途: 在Mac上初始化PostgreSQL数据库，生成完整的迁移文件

set -e  # 遇到错误立即退出

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐘 SmartAbp PostgreSQL 数据库设置（Mac专用）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检测操作系统
if [[ "$(uname)" != "Darwin" ]]; then
    echo "⚠️  此脚本仅适用于macOS系统"
    exit 1
fi

# 定义变量
DB_NAME="smartabp"
DB_USER="smartabp_user"
DB_PASSWORD="SmartAbp123!"
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EF_PROJECT="$PROJECT_ROOT/src/SmartAbp.EntityFrameworkCore"
MIGRATOR_PROJECT="$PROJECT_ROOT/src/SmartAbp.DbMigrator"

echo ""
echo "📁 项目路径: $PROJECT_ROOT"
echo "🗄️  数据库名: $DB_NAME"
echo "👤 用户名: $DB_USER"
echo ""

# 步骤1: 检查PostgreSQL是否安装
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 步骤1: 检查PostgreSQL安装状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! command -v psql &> /dev/null; then
    echo "❌ 未检测到PostgreSQL"
    echo ""
    echo "请使用以下命令安装PostgreSQL:"
    echo "  brew install postgresql@16"
    echo "  brew services start postgresql@16"
    echo ""
    exit 1
fi

echo "✅ PostgreSQL已安装"
POSTGRES_VERSION=$(psql --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
echo "   版本: PostgreSQL $POSTGRES_VERSION"
echo ""

# 步骤2: 检查PostgreSQL服务状态
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 步骤2: 检查PostgreSQL服务状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if brew services list | grep postgresql | grep -q started; then
    echo "✅ PostgreSQL服务正在运行"
else
    echo "⚠️  PostgreSQL服务未运行，正在启动..."
    brew services start postgresql@16
    sleep 3
    echo "✅ PostgreSQL服务已启动"
fi
echo ""

# 步骤3: 创建数据库用户
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 步骤3: 创建数据库用户"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查用户是否存在
if psql -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    echo "✅ 用户 $DB_USER 已存在"
else
    echo "⏳ 正在创建用户 $DB_USER..."
    psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    psql -U postgres -c "ALTER USER $DB_USER CREATEDB;"
    echo "✅ 用户创建成功"
fi
echo ""

# 步骤4: 创建数据库
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 步骤4: 创建数据库"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查数据库是否存在
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "⚠️  数据库 $DB_NAME 已存在"
    read -p "是否删除并重新创建? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "⏳ 正在删除数据库 $DB_NAME..."
        psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
        echo "✅ 数据库已删除"
    else
        echo "保留现有数据库"
    fi
fi

# 创建数据库
if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "⏳ 正在创建数据库 $DB_NAME..."
    psql -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    psql -U postgres -d $DB_NAME -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    psql -U postgres -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
    echo "✅ 数据库创建成功"
fi
echo ""

# 步骤5: 生成PostgreSQL迁移文件
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 步骤5: 生成PostgreSQL迁移文件"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$EF_PROJECT"

# 设置环境变量，强制使用PostgreSQL
export Database__Type="PostgreSQL"

echo "⏳ 正在生成PostgreSQL迁移..."
echo "   注意: 这可能需要几分钟..."

# 删除现有的PostgreSQL迁移（如果需要重新生成）
if [ -d "Migrations/PostgreSQL" ]; then
    echo "⚠️  检测到现有PostgreSQL迁移文件"
    read -p "是否删除并重新生成? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf Migrations/PostgreSQL/*
        echo "✅ 已删除现有迁移文件"
    fi
fi

# 生成新的迁移
dotnet ef migrations add "PostgreSQL_CompleteSchema" \
    --context SmartAbpDbContext \
    --output-dir "Migrations/PostgreSQL" \
    -- --Database:Type=PostgreSQL

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL迁移生成成功"
else
    echo "❌ PostgreSQL迁移生成失败"
    exit 1
fi
echo ""

# 步骤6: 运行数据库迁移
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 步骤6: 运行数据库迁移"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$MIGRATOR_PROJECT"

# 确保appsettings.json配置正确
cat > appsettings.json << 'EOF'
{
  "Database": {
    "Type": "PostgreSQL",
    "Note": "数据库迁移工具 - 使用PostgreSQL"
  },
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=smartabp;Username=smartabp_user;Password=SmartAbp123!;Include Error Detail=true;Search Path=public",
    "PostgreSQL": "Host=localhost;Port=5432;Database=smartabp;Username=smartabp_user;Password=SmartAbp123!;Include Error Detail=true;Search Path=public"
  }
}
EOF

echo "⏳ 正在运行数据库迁移..."
dotnet run --no-build

if [ $? -eq 0 ]; then
    echo "✅ 数据库迁移完成"
else
    echo "❌ 数据库迁移失败"
    exit 1
fi
echo ""

# 步骤7: 验证数据库
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 步骤7: 验证数据库"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "⏳ 正在检查数据库表..."
TABLE_COUNT=$(psql -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';")

echo "✅ 数据库验证完成"
echo "   数据表数量: $TABLE_COUNT"
echo ""

# 完成
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 PostgreSQL数据库设置完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 连接信息:"
echo "   主机: localhost"
echo "   端口: 5432"
echo "   数据库: $DB_NAME"
echo "   用户名: $DB_USER"
echo "   密码: $DB_PASSWORD"
echo ""
echo "🔗 连接字符串:"
echo "   Host=localhost;Port=5432;Database=$DB_NAME;Username=$DB_USER;Password=$DB_PASSWORD"
echo ""
echo "💡 提示:"
echo "   1. 使用 'psql -U $DB_USER -d $DB_NAME' 连接数据库"
echo "   2. 使用 'brew services stop postgresql@16' 停止PostgreSQL服务"
echo "   3. 使用 'brew services restart postgresql@16' 重启PostgreSQL服务"
echo ""

