#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SmartAbp 数据库迁移错误修复脚本 (Linux/Mac)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 
# 修复日期: 2025-10-04
# 问题描述: 数据库迁移失败，多个数据库类型的迁移混淆
# 解决方案: 清理旧的数据库文件，重新执行正确的迁移
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

FORCE=false
BACKUP_FIRST=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE=true
            shift
            ;;
        --backup-first)
            BACKUP_FIRST=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 SmartAbp 数据库迁移错误修复工具"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 步骤1: 检测项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "📂 项目根目录: $PROJECT_ROOT"
echo ""

# 步骤2: 读取数据库配置
DB_TYPE=$(grep -A 1 '"Database"' src/SmartAbp.DbMigrator/appsettings.json | grep '"Type"' | sed 's/.*: "\(.*\)".*/\1/')
CONN_STRING=$(grep -A 2 '"ConnectionStrings"' src/SmartAbp.DbMigrator/appsettings.json | grep '"Default"' | sed 's/.*: "\(.*\)".*/\1/')

echo "🔍 当前数据库配置:"
echo "   类型: $DB_TYPE"
echo "   连接字符串: $CONN_STRING"
echo ""

# 步骤3: 检测并清理旧的数据库文件
echo "🗑️  检测旧的数据库文件..."

SQLITE_FILES=(
    "src/SmartAbp.DbMigrator/smartabp.db"
    "src/SmartAbp.DbMigrator/smartabp.db-shm"
    "src/SmartAbp.DbMigrator/smartabp.db-wal"
    "src/smartabp.db"
    "src/smartabp.db-shm"
    "src/smartabp.db-wal"
)

FOUND_FILES=()
for file in "${SQLITE_FILES[@]}"; do
    if [ -f "$file" ]; then
        FOUND_FILES+=("$file")
    fi
done

if [ ${#FOUND_FILES[@]} -gt 0 ]; then
    echo "   发现 ${#FOUND_FILES[@]} 个SQLite数据库文件:"
    for file in "${FOUND_FILES[@]}"; do
        echo "   • $file"
    done
    echo ""
    
    if [ "$BACKUP_FIRST" = true ]; then
        echo "💾 备份旧的数据库文件..."
        BACKUP_DIR="backups/database_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        for file in "${FOUND_FILES[@]}"; do
            filename=$(basename "$file")
            cp "$file" "$BACKUP_DIR/$filename"
            echo "   ✓ 已备份: $filename"
        done
        echo ""
    fi
    
    if [ "$FORCE" = true ] || [ "$(read -p '是否删除这些文件? (y/N): ' -n 1 -r && echo)" = 'y' ]; then
        for file in "${FOUND_FILES[@]}"; do
            rm -f "$file"
            echo "   ✓ 已删除: $file"
        done
        echo ""
    else
        echo "⚠️  操作已取消"
        exit 0
    fi
else
    echo "   ✅ 未发现需要清理的SQLite文件"
    echo ""
fi

# 步骤4: 重新构建DbMigrator项目
echo "🔨 重新构建DbMigrator项目..."
cd "src/SmartAbp.DbMigrator"

dotnet build --configuration Release

if [ $? -ne 0 ]; then
    echo "   ❌ 构建失败"
    exit 1
fi

echo "   ✅ 构建成功"
echo ""

# 步骤5: 执行数据库迁移
echo "🚀 执行数据库迁移..."
echo "   目标数据库: $DB_TYPE"
echo ""

dotnet run --no-build --configuration Release

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ 数据库迁移修复完成！"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ 数据库迁移失败"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 请检查日志文件: src/SmartAbp.DbMigrator/Logs/logs.txt"
    exit 1
fi

cd "$PROJECT_ROOT"

