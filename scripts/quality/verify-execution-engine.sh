#!/bin/bash
# AI执行引擎关联脚本验证工具
# 用途：验证300行增量编程机制和AI守护机制相关的所有命令和脚本

set -e  # 遇到错误立即退出

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 AI执行引擎 - 关联脚本验证工具"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 切换到项目根目录
cd "$(dirname "$0")/../.."
PROJECT_ROOT=$(pwd)

echo "📁 项目根目录: $PROJECT_ROOT"
echo ""

# 验证计数器
PASS_COUNT=0
FAIL_COUNT=0

# 验证函数
verify_command() {
    local name="$1"
    local command="$2"
    local description="$3"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 验证: $name"
    echo "📝 描述: $description"
    echo "💻 命令: $command"
    echo ""
    
    if eval "$command" > /dev/null 2>&1; then
        echo "✅ 通过"
        ((PASS_COUNT++))
    else
        echo "❌ 失败"
        echo "   错误信息:"
        eval "$command" 2>&1 | sed 's/^/   /' || true
        ((FAIL_COUNT++))
    fi
    echo ""
}

verify_file() {
    local name="$1"
    local file_path="$2"
    local description="$3"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 验证: $name"
    echo "📝 描述: $description"
    echo "📄 文件: $file_path"
    echo ""
    
    if [ -f "$file_path" ]; then
        echo "✅ 文件存在"
        ((PASS_COUNT++))
    else
        echo "❌ 文件不存在"
        ((FAIL_COUNT++))
    fi
    echo ""
}

# ═══════════════════════════════════════════════════════════════
# 第1部分：Git安全脚本验证
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║ 第1部分：Git安全脚本验证                                      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

verify_file \
    "Git安全同步脚本（PowerShell）" \
    "scripts/git/git-safe-sync.ps1" \
    "300行机制第6步：质量门禁后的Git同步"

verify_file \
    "Git安全同步脚本（Bash）" \
    "scripts/git/git-safe-sync.sh" \
    "Linux/Mac环境的Git同步脚本"

verify_command \
    "Git环境检查" \
    "git --version" \
    "验证Git是否已安装"

verify_command \
    "Git仓库检查" \
    "test -d .git && echo 'Git仓库正常'" \
    "验证当前目录是Git仓库"

# ═══════════════════════════════════════════════════════════════
# 第2部分：TypeScript类型检查（守护点3：类型安全守护）
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║ 第2部分：TypeScript类型检查                                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

verify_command \
    "Node.js环境" \
    "node --version" \
    "验证Node.js是否已安装"

verify_command \
    "npm环境" \
    "npm --version" \
    "验证npm是否已安装"

verify_file \
    "前端package.json" \
    "src/SmartAbp.Vue/package.json" \
    "验证前端项目配置文件"

verify_file \
    "前端tsconfig.json" \
    "src/SmartAbp.Vue/tsconfig.json" \
    "验证TypeScript配置文件"

# 注意：实际的type-check命令需要在Vue目录中执行，这里只验证命令存在性
if [ -f "src/SmartAbp.Vue/package.json" ]; then
    if grep -q '"type-check"' src/SmartAbp.Vue/package.json; then
        echo "✅ type-check命令已配置"
        ((PASS_COUNT++))
    else
        echo "❌ type-check命令未配置"
        ((FAIL_COUNT++))
    fi
else
    echo "⚠️  跳过type-check验证（package.json不存在）"
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# 第3部分：ESLint代码规范检查（守护点5：代码质量守护）
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║ 第3部分：ESLint代码规范检查                                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

verify_file \
    "ESLint配置文件" \
    "src/SmartAbp.Vue/.eslintrc.cjs" \
    "验证ESLint配置文件"

if [ -f "src/SmartAbp.Vue/package.json" ]; then
    if grep -q '"lint"' src/SmartAbp.Vue/package.json; then
        echo "✅ lint命令已配置"
        ((PASS_COUNT++))
    else
        echo "❌ lint命令未配置"
        ((FAIL_COUNT++))
    fi
else
    echo "⚠️  跳过lint验证（package.json不存在）"
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# 第4部分：架构合规检查（守护点2：架构合规守护）
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║ 第4部分：架构合规检查                                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

verify_command \
    "grep命令可用性" \
    "grep --version" \
    "验证grep命令是否可用"

verify_file \
    "packages目录" \
    "src/SmartAbp.Vue/packages" \
    "验证packages目录存在"

echo "🔍 执行架构合规检查示例..."
echo ""

# 检查相对路径违规
echo "  📋 检查相对路径违规（../ 在packages中）:"
if [ -d "src/SmartAbp.Vue/packages" ]; then
    RELATIVE_PATH_COUNT=$(grep -r "'\.\./" src/SmartAbp.Vue/packages/ 2>/dev/null | grep -v node_modules | wc -l || echo "0")
    echo "     发现: $RELATIVE_PATH_COUNT 处"
    if [ "$RELATIVE_PATH_COUNT" = "0" ]; then
        echo "     ✅ 无违规"
        ((PASS_COUNT++))
    else
        echo "     ⚠️  存在违规"
        ((FAIL_COUNT++))
    fi
else
    echo "     ⚠️  packages目录不存在，跳过检查"
fi
echo ""

# 检查主应用引用违规
echo "  📋 检查主应用引用违规（@/ 在packages中）:"
if [ -d "src/SmartAbp.Vue/packages" ]; then
    MAIN_APP_REF_COUNT=$(grep -r "@/" src/SmartAbp.Vue/packages/ 2>/dev/null | grep -v node_modules | grep -v "node_modules" | wc -l || echo "0")
    echo "     发现: $MAIN_APP_REF_COUNT 处"
    if [ "$MAIN_APP_REF_COUNT" = "0" ]; then
        echo "     ✅ 无违规"
        ((PASS_COUNT++))
    else
        echo "     ⚠️  存在违规"
        ((FAIL_COUNT++))
    fi
else
    echo "     ⚠️  packages目录不存在，跳过检查"
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# 第5部分：C#编译检查（后端）
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║ 第5部分：C#编译检查                                            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

verify_command \
    "dotnet环境" \
    "dotnet --version" \
    "验证.NET SDK是否已安装"

verify_file \
    "后端解决方案文件" \
    "src/SmartAbp.sln" \
    "验证后端解决方案文件"

# ═══════════════════════════════════════════════════════════════
# 第6部分：质量检查脚本
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║ 第6部分：质量检查脚本                                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

verify_file \
    "质量门禁脚本" \
    "scripts/quality/quality-gate.sh" \
    "300行机制第4步：质量门禁检查"

verify_file \
    "代码质量检查配置" \
    "config/quality-config.json" \
    "质量检查配置文件"

# ═══════════════════════════════════════════════════════════════
# 汇总报告
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 验证结果汇总"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_COUNT=$((PASS_COUNT + FAIL_COUNT))
PASS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASS_COUNT / $TOTAL_COUNT) * 100}")

echo "   ✅ 通过: $PASS_COUNT"
echo "   ❌ 失败: $FAIL_COUNT"
echo "   📊 总计: $TOTAL_COUNT"
echo "   📈 通过率: $PASS_RATE%"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "🎉 所有验证项全部通过！执行引擎关联脚本可以正常执行。"
    echo ""
    exit 0
else
    echo "⚠️  存在 $FAIL_COUNT 个失败项，请检查上述错误信息。"
    echo ""
    echo "💡 修复建议："
    echo "   1. 确保所有必要的工具已安装（Git, Node.js, npm, dotnet）"
    echo "   2. 在Vue目录中运行 npm install 安装依赖"
    echo "   3. 检查文件路径和权限"
    echo "   4. 修复架构违规问题"
    echo ""
    exit 1
fi

