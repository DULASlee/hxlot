#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 SmartAbp服务状态检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 数据库
echo "📦 PostgreSQL:"
if brew services list | grep postgresql@15 | grep started > /dev/null; then
    echo "  ✅ 运行中"
else
    echo "  ❌ 未运行"
fi

# 后端
echo ""
echo "🔧 后端服务 (44379):"
if ps aux | grep "dotnet run" | grep -v grep > /dev/null; then
    if curl -s http://localhost:44379/health-status > /dev/null 2>&1; then
        echo "  ✅ 运行中且健康"
    else
        echo "  ⏳ 正在启动..."
    fi
else
    echo "  ❌ 未运行"
fi

# 前端
echo ""
echo "🎨 前端服务 (11369):"
if ps aux | grep "npm run dev" | grep -v grep > /dev/null; then
    if curl -s http://localhost:11369 > /dev/null 2>&1; then
        echo "  ✅ 运行中"
    else
        echo "  ⏳ 正在启动..."
    fi
else
    echo "  ❌ 未运行"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
