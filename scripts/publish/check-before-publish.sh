#!/bin/bash
# check-before-publish.sh - NPM发布前检查脚本
# 用法: ./check-before-publish.sh [包目录]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 NPM发布前检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 如果提供了目录参数，切换到该目录
if [ -n "$1" ]; then
    cd "$1"
    echo "📁 检查目录: $1"
    echo ""
fi

# 1. 检查package.json
echo "📦 检查 package.json..."
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json 不存在${NC}"
    exit 1
fi
echo -e "${GREEN}✅ package.json 存在${NC}"

# 2. 检查必要字段
echo ""
echo "📋 检查必要字段..."
for field in name version description main types; do
    value=$(node -p "try { require('./package.json').$field } catch(e) { 'undefined' }")
    if [ "$value" = "undefined" ]; then
        echo -e "${RED}❌ 缺少字段: $field${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ $field:${NC} $value"
    fi
done

# 3. 检查dist目录
echo ""
echo "📁 检查构建产物..."
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ dist 目录不存在，请先运行 npm run build${NC}"
    exit 1
else
    echo -e "${GREEN}✅ dist 目录存在${NC}"
    # 统计dist文件数量
    file_count=$(find dist -type f | wc -l)
    echo "   包含 $file_count 个文件"
fi

# 4. 检查.npmignore或files字段
echo ""
echo "📝 检查发布文件配置..."
if [ -f ".npmignore" ]; then
    echo -e "${GREEN}✅ .npmignore 存在${NC}"
elif grep -q '"files"' package.json; then
    echo -e "${GREEN}✅ package.json 中配置了 files 字段${NC}"
    files=$(node -p "JSON.stringify(require('./package.json').files || [])")
    echo "   配置: $files"
else
    echo -e "${YELLOW}⚠️  建议配置 .npmignore 或 files 字段${NC}"
fi

# 5. 检查README
echo ""
echo "📖 检查文档..."
if [ ! -f "README.md" ]; then
    echo -e "${YELLOW}⚠️  README.md 不存在，建议添加${NC}"
else
    echo -e "${GREEN}✅ README.md 存在${NC}"
    lines=$(wc -l < README.md)
    echo "   文档行数: $lines"
fi

# 6. 检查LICENSE
echo ""
echo "⚖️  检查许可证..."
if [ ! -f "LICENSE" ]; then
    echo -e "${YELLOW}⚠️  LICENSE 文件不存在，建议添加${NC}"
else
    echo -e "${GREEN}✅ LICENSE 文件存在${NC}"
fi

# 7. 检查是否已登录
echo ""
echo "🔐 检查NPM登录状态..."
if npm whoami &>/dev/null; then
    username=$(npm whoami)
    echo -e "${GREEN}✅ 已登录，用户名: $username${NC}"
else
    echo -e "${RED}❌ 未登录，请先执行: npm login${NC}"
    exit 1
fi

# 8. 检查包名是否已存在
echo ""
echo "🔍 检查包名和版本..."
package_name=$(node -p "require('./package.json').name")
local_version=$(node -p "require('./package.json').version")

if npm view "$package_name" &>/dev/null; then
    current_version=$(npm view "$package_name" version)
    echo -e "${YELLOW}⚠️  包 $package_name 已存在${NC}"
    echo "   远程版本: $current_version"
    echo "   本地版本: $local_version"
    
    if [ "$current_version" = "$local_version" ]; then
        echo -e "${RED}❌ 版本号相同，无法发布！请先升级版本${NC}"
        echo ""
        echo "💡 升级版本命令:"
        echo "   npm version patch  # 修订版 ($local_version → $(node -p "require('semver').inc('$local_version', 'patch')"))"
        echo "   npm version minor  # 次版本 ($local_version → $(node -p "require('semver').inc('$local_version', 'minor')"))"
        echo "   npm version major  # 主版本 ($local_version → $(node -p "require('semver').inc('$local_version', 'major')"))"
        exit 1
    else
        echo -e "${GREEN}✅ 版本号已升级，可以发布${NC}"
    fi
else
    echo -e "${GREEN}✅ 包名 $package_name 可用（首次发布）${NC}"
    echo "   本地版本: $local_version"
fi

# 9. 检查publishConfig
echo ""
echo "🌐 检查发布配置..."
access=$(node -p "require('./package.json').publishConfig?.access || 'undefined'")
if [ "$access" = "public" ]; then
    echo -e "${GREEN}✅ publishConfig.access = public${NC}"
elif [ "$access" = "undefined" ]; then
    echo -e "${YELLOW}⚠️  未配置 publishConfig.access，建议设置为 'public'${NC}"
else
    echo -e "${YELLOW}⚠️  publishConfig.access = $access${NC}"
fi

# 10. 预览将要发布的文件
echo ""
echo "📦 预览发布内容..."
echo "运行: npm pack --dry-run"
echo ""
npm pack --dry-run 2>&1 | head -20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ 检查完成！可以发布${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📤 发布命令:"
echo "   npm publish --access public"
echo ""

