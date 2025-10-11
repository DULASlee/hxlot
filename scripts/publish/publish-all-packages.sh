#!/bin/bash
# publish-all-packages.sh - 自动发布所有packages
# 用法: ./publish-all-packages.sh [--dry-run]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 是否为试运行模式
DRY_RUN=false
if [ "$1" = "--dry-run" ]; then
    DRY_RUN=true
    echo -e "${YELLOW}🧪 试运行模式（不会实际发布）${NC}"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 开始发布 SmartAbp Packages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 发布顺序（按依赖关系从低到高）
PACKAGES=(
    "metadata-core"
    "lowcode-shared"
    "lowcode-api"
    "lowcode-tools"
    "lowcode-core"
    "lowcode-designer"
)

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PACKAGES_DIR="$PROJECT_ROOT/src/SmartAbp.Vue/packages"

echo "📁 项目根目录: $PROJECT_ROOT"
echo "📦 Packages目录: $PACKAGES_DIR"
echo ""

# 切换到packages目录
cd "$PACKAGES_DIR"

# 检查登录状态
echo "🔐 检查NPM登录状态..."
if ! npm whoami &>/dev/null; then
    echo -e "${RED}❌ 未登录NPM，请先执行: npm login${NC}"
    exit 1
fi

username=$(npm whoami)
echo -e "${GREEN}✅ NPM登录用户: $username${NC}"
echo ""

# 统计变量
SUCCESS_COUNT=0
SKIP_COUNT=0
FAIL_COUNT=0

# 依次发布每个包
for pkg in "${PACKAGES[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}📦 [$((SUCCESS_COUNT + SKIP_COUNT + FAIL_COUNT + 1))/${#PACKAGES[@]}] 发布: @smartabp/$pkg${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd "$PACKAGES_DIR/$pkg"
    
    # 检查package.json
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ package.json 不存在${NC}"
        ((FAIL_COUNT++))
        continue
    fi
    
    # 检查dist目录
    if [ ! -d "dist" ]; then
        echo -e "${RED}❌ dist目录不存在，请先运行构建${NC}"
        echo "   提示: cd $PACKAGES_DIR && npm run build:packages"
        ((FAIL_COUNT++))
        continue
    fi
    
    # 获取包信息
    pkg_name=$(node -p "require('./package.json').name")
    pkg_version=$(node -p "require('./package.json').version")
    
    echo "包名: $pkg_name"
    echo "版本: $pkg_version"
    echo ""
    
    # 检查版本是否已存在
    if npm view "$pkg_name@$pkg_version" &>/dev/null; then
        echo -e "${YELLOW}⚠️  版本 $pkg_version 已存在，跳过发布${NC}"
        ((SKIP_COUNT++))
    else
        # 发布
        if [ "$DRY_RUN" = true ]; then
            echo -e "${YELLOW}🧪 试运行: 将会发布 $pkg_name@$pkg_version${NC}"
            echo "   命令: npm publish --access public"
            ((SUCCESS_COUNT++))
        else
            echo "📤 开始发布..."
            if npm publish --access public; then
                echo -e "${GREEN}✅ 发布成功！${NC}"
                echo "   查看: https://www.npmjs.com/package/$pkg_name"
                ((SUCCESS_COUNT++))
            else
                echo -e "${RED}❌ 发布失败！${NC}"
                ((FAIL_COUNT++))
            fi
        fi
    fi
    
    echo ""
done

# 发布统计
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 发布统计"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ 成功: $SUCCESS_COUNT${NC}"
echo -e "${YELLOW}⏭️  跳过: $SKIP_COUNT${NC}"
echo -e "${RED}❌ 失败: $FAIL_COUNT${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FAIL_COUNT -gt 0 ]; then
    echo ""
    echo -e "${RED}⚠️  有 $FAIL_COUNT 个包发布失败，请检查错误信息${NC}"
    exit 1
elif [ "$DRY_RUN" = true ]; then
    echo ""
    echo -e "${YELLOW}🧪 试运行完成，实际发布请执行:${NC}"
    echo "   ./scripts/publish/publish-all-packages.sh"
else
    echo ""
    echo -e "${GREEN}🎉 所有包发布完成！${NC}"
    echo ""
    echo "📖 后续步骤:"
    echo "   1. 在NPM官网验证: https://www.npmjs.com/settings/smartabp/packages"
    echo "   2. 测试安装: npm install @smartabp/lowcode"
    echo "   3. 更新CHANGELOG.md"
    echo "   4. 创建Git标签: git tag -a v$pkg_version -m 'Release v$pkg_version'"
    echo "   5. 推送标签: git push --tags"
fi

echo ""

