#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Git 强制推送脚本 - 用本地代码覆盖远程仓库
# ⚠️ 危险操作：此脚本会永久删除远程提交！
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e  # 遇到错误立即退出

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚨 Git 强制推送脚本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 步骤1：确认操作
echo "⚠️  此操作将用本地代码强制覆盖远程仓库！"
echo "⚠️  远程仓库的所有不同提交将被永久删除！"
echo ""
read -p "🔴 您确定要继续吗？(输入 'YES' 确认): " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "❌ 操作已取消"
    exit 1
fi

# 步骤2：创建远程备份
echo ""
echo "📦 步骤1/5: 创建远程备份分支..."
BACKUP_BRANCH="backup-before-force-$(date +%Y%m%d-%H%M%S)"
git fetch origin
git push origin origin/main:refs/heads/$BACKUP_BRANCH
echo "✅ 备份分支已创建: $BACKUP_BRANCH"

# 步骤3：查看本地状态
echo ""
echo "📊 步骤2/5: 检查本地状态..."
git status

# 步骤4：提交本地修改
echo ""
echo "💾 步骤3/5: 提交本地所有修改..."
if [[ -n $(git status -s) ]]; then
    git add .
    git commit -m "fix: 本地正确版本 - 准备强制覆盖远程 [$(date '+%Y-%m-%d %H:%M:%S')]"
    echo "✅ 本地修改已提交"
else
    echo "✅ 本地无未提交修改"
fi

# 步骤5：最后确认
echo ""
echo "🔴 最后确认："
echo "   本地分支: $(git rev-parse --abbrev-ref HEAD)"
echo "   本地提交: $(git rev-parse --short HEAD)"
echo "   远程仓库: origin/main"
echo ""
read -p "🔴 确认用本地代码覆盖远程？(输入 'FORCE' 确认): " FINAL_CONFIRM

if [ "$FINAL_CONFIRM" != "FORCE" ]; then
    echo "❌ 操作已取消"
    exit 1
fi

# 步骤6：执行强制推送
echo ""
echo "🚀 步骤4/5: 执行强制推送..."
echo "   尝试使用 --force-with-lease（更安全）..."

if git push origin main --force-with-lease; then
    echo "✅ 强制推送成功（使用 --force-with-lease）"
else
    echo ""
    echo "⚠️  --force-with-lease 失败"
    echo "   原因：远程可能有其他新提交"
    echo ""
    read -p "🔴 是否使用 --force 强制覆盖？(输入 'FORCE' 确认): " ULTIMATE_CONFIRM

    if [ "$ULTIMATE_CONFIRM" != "FORCE" ]; then
        echo "❌ 操作已取消"
        exit 1
    fi

    echo "🚀 使用 --force 强制推送..."
    git push origin main --force
    echo "✅ 强制推送成功（使用 --force）"
fi

# 步骤7：验证结果
echo ""
echo "🔍 步骤5/5: 验证推送结果..."
git fetch origin
LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse origin/main)

if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
    echo "✅ 验证成功：本地和远程代码完全一致"
    echo "   本地哈希:   $LOCAL_HASH"
    echo "   远程哈希:   $REMOTE_HASH"
else
    echo "❌ 验证失败：本地和远程代码不一致！"
    echo "   本地哈希:   $LOCAL_HASH"
    echo "   远程哈希:   $REMOTE_HASH"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 强制推送完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 重要信息："
echo "   ✅ 远程仓库已被本地代码覆盖"
echo "   ✅ 备份分支: $BACKUP_BRANCH"
echo ""
echo "🔄 如需恢复远程代码，执行："
echo "   git push origin $BACKUP_BRANCH:main --force"
echo ""

