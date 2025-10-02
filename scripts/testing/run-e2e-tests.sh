#!/bin/bash

# ============================================================================
# 低代码生成器端到端测试运行脚本
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/src/SmartAbp.Vue"
BACKEND_DIR="$PROJECT_ROOT/src/SmartAbp.Web"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 低代码生成器端到端测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ============================================================================
# 第一步：环境检查
# ============================================================================

echo ""
echo "📋 第一步：环境检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 未安装"
        return 1
    else
        echo "✅ $1 已安装"
        return 0
    fi
}

check_command "node" || exit 1
check_command "npm" || exit 1
check_command "dotnet" || exit 1

# ============================================================================
# 第二步：服务状态检查
# ============================================================================

echo ""
echo "📡 第二步：检查服务状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_service() {
    local url=$1
    local name=$2
    local max_attempts=3
    
    for i in $(seq 1 $max_attempts); do
        if curl -s -f -o /dev/null "$url"; then
            echo "✅ $name 服务正在运行: $url"
            return 0
        else
            echo "⏳ $name 服务检查 ($i/$max_attempts)..."
            sleep 2
        fi
    done
    
    echo "❌ $name 服务未运行: $url"
    return 1
}

BACKEND_RUNNING=false
FRONTEND_RUNNING=false

if check_service "http://localhost:44379/health" "后端"; then
    BACKEND_RUNNING=true
fi

if check_service "http://localhost:5173" "前端"; then
    FRONTEND_RUNNING=true
fi

# ============================================================================
# 第三步：启动服务（如果未运行）
# ============================================================================

if [ "$BACKEND_RUNNING" = false ]; then
    echo ""
    echo "🚀 启动后端服务..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  请在另一个终端手动运行:"
    echo "   cd $BACKEND_DIR"
    echo "   dotnet run"
    echo ""
    read -p "按回车键继续（确保后端已启动）..."
fi

if [ "$FRONTEND_RUNNING" = false ]; then
    echo ""
    echo "🚀 启动前端服务..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  请在另一个终端手动运行:"
    echo "   cd $FRONTEND_DIR"
    echo "   npm run dev"
    echo ""
    read -p "按回车键继续（确保前端已启动）..."
fi

# ============================================================================
# 第四步：运行测试
# ============================================================================

echo ""
echo "🧪 第四步：运行端到端测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$FRONTEND_DIR"

# 创建测试报告目录
REPORT_DIR="$PROJECT_ROOT/docs/testing/e2e-reports"
mkdir -p "$REPORT_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$REPORT_DIR/lowcode-generator-e2e-$TIMESTAMP.json"

echo "📊 测试报告将保存到: $REPORT_FILE"

# 运行测试
npm run test:e2e -- --reporter=json --outputFile="$REPORT_FILE"

TEST_EXIT_CODE=$?

# ============================================================================
# 第五步：生成测试报告
# ============================================================================

echo ""
echo "📄 第五步：生成测试报告"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ 所有测试通过！"
    
    # 生成成功报告
    cat > "$REPORT_DIR/latest-success.md" << EOF
# 低代码生成器E2E测试报告

**测试时间**: $(date '+%Y-%m-%d %H:%M:%S')
**测试结果**: ✅ 通过
**退出代码**: 0

## 测试覆盖

- ✅ 基础API连接测试
- ✅ 模块验证功能测试
- ✅ 核心代码生成功能测试
- ✅ 数据库反查功能测试
- ✅ UI配置功能测试
- ✅ 性能基准测试
- ✅ 错误处理与边界条件测试

## 结论

所有功能测试通过，低代码生成器工作正常！

EOF

    cat "$REPORT_DIR/latest-success.md"
    
else
    echo "❌ 测试失败！退出代码: $TEST_EXIT_CODE"
    
    # 生成失败报告
    cat > "$REPORT_DIR/latest-failure.md" << EOF
# 低代码生成器E2E测试报告

**测试时间**: $(date '+%Y-%m-%d %H:%M:%S')
**测试结果**: ❌ 失败
**退出代码**: $TEST_EXIT_CODE

## 问题

测试执行失败，请查看详细日志: $REPORT_FILE

## 建议

1. 检查后端服务是否正常运行
2. 检查前端服务是否正常运行
3. 查看详细错误日志
4. 检查API端点是否可访问

EOF

    cat "$REPORT_DIR/latest-failure.md"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 测试运行完成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $TEST_EXIT_CODE

