#!/bin/bash

# SmartAbp 架构违规自动修复工具
# 修复packages中的相对路径引用和主应用引用

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️  SmartAbp 架构违规自动修复工具${NC}\n"

# 进入packages目录
cd "$(dirname "$0")/../../src/SmartAbp.Vue/packages"

# 创建备份目录
BACKUP_DIR="../../../reports/quality/arch-fix-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 1. 备份当前代码
echo -e "${BLUE}💾 创建备份...${NC}"
cp -r . "$BACKUP_DIR/"
echo -e "${GREEN}✅ 备份已创建: $BACKUP_DIR${NC}"

# 2. 检测违规
echo -e "\n${BLUE}🔍 检测架构违规...${NC}"

RELATIVE_PATH_COUNT=$(grep -r "'../'" . 2>/dev/null | grep -v "node_modules" | grep -v "/dist/" | wc -l)
MAIN_APP_COUNT=$(grep -r "@/" . 2>/dev/null | grep -v "node_modules" | grep -v "/dist/" | grep -v ".json" | wc -l)

echo -e "${YELLOW}发现违规:${NC}"
echo -e "  - 相对路径引用: ${RED}$RELATIVE_PATH_COUNT 处${NC}"
echo -e "  - 主应用引用: ${RED}$MAIN_APP_COUNT 处${NC}"

if [ "$RELATIVE_PATH_COUNT" -eq 0 ] && [ "$MAIN_APP_COUNT" -eq 0 ]; then
    echo -e "\n${GREEN}✅ 未发现架构违规！${NC}"
    exit 0
fi

# 3. 修复lowcode-api包的相对路径
echo -e "\n${BLUE}🔧 修复 lowcode-api 包...${NC}"
if [ -d "lowcode-api" ]; then
    find lowcode-api/src -type f \( -name "*.ts" -o -name "*.vue" \) 2>/dev/null | while read file; do
        # 备份原文件
        cp "$file" "$file.bak"
        
        # 修复相对路径引用
        sed -i.tmp \
            -e "s|from '\.\./http-client'|from '@smartabp/lowcode-api/http-client'|g" \
            -e "s|from '\.\./code-generator'|from '@smartabp/lowcode-api/code-generator'|g" \
            -e "s|from '\.\./ddd-generator'|from '@smartabp/lowcode-api/ddd-generator'|g" \
            -e "s|from '\.\./generators'|from '@smartabp/lowcode-api/generators'|g" \
            -e "s|from '\.\./composables'|from '@smartabp/lowcode-api/composables'|g" \
            "$file"
        
        # 清理临时文件
        rm -f "$file.tmp"
        
        # 检查是否有修改
        if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} 修复: $file"
        fi
        rm -f "$file.bak"
    done
fi

# 4. 修复lowcode-core包的相对路径
echo -e "\n${BLUE}🔧 修复 lowcode-core 包...${NC}"
if [ -d "lowcode-core" ]; then
    find lowcode-core/src -type f \( -name "*.ts" -o -name "*.vue" \) 2>/dev/null | while read file; do
        cp "$file" "$file.bak"
        
        sed -i.tmp \
            -e "s|from '\.\./components'|from '@smartabp/lowcode-core/components'|g" \
            -e "s|from '\.\./composables'|from '@smartabp/lowcode-core/composables'|g" \
            -e "s|from '\.\./stores'|from '@smartabp/lowcode-core/stores'|g" \
            -e "s|from '\.\./utils'|from '@smartabp/lowcode-core/utils'|g" \
            "$file"
        
        rm -f "$file.tmp"
        
        if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} 修复: $file"
        fi
        rm -f "$file.bak"
    done
fi

# 5. 修复lowcode-designer包的相对路径和主应用引用
echo -e "\n${BLUE}🔧 修复 lowcode-designer 包...${NC}"
if [ -d "lowcode-designer" ]; then
    find lowcode-designer/src -type f \( -name "*.ts" -o -name "*.vue" \) 2>/dev/null | while read file; do
        cp "$file" "$file.bak"
        
        # 修复相对路径
        sed -i.tmp \
            -e "s|from '\.\./components'|from '@smartabp/lowcode-designer/components'|g" \
            -e "s|from '\.\./composables'|from '@smartabp/lowcode-designer/composables'|g" \
            -e "s|from '\.\./utils'|from '@smartabp/lowcode-designer/utils'|g" \
            "$file"
        
        # 修复主应用引用（特定情况）
        # 注意：这里需要根据实际情况调整，可能需要手动review
        # sed -i.tmp "s|from '@/api/\(.*\)'|from '@smartabp/lowcode-api/\1'|g" "$file"
        
        rm -f "$file.tmp"
        
        if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} 修复: $file"
        fi
        rm -f "$file.bak"
    done
fi

# 6. 修复lowcode-shared包的相对路径
echo -e "\n${BLUE}🔧 修复 lowcode-shared 包...${NC}"
if [ -d "lowcode-shared" ]; then
    find lowcode-shared/src -type f \( -name "*.ts" -o -name "*.vue" \) 2>/dev/null | while read file; do
        cp "$file" "$file.bak"
        
        sed -i.tmp \
            -e "s|from '\.\./components'|from '@smartabp/lowcode-shared/components'|g" \
            -e "s|from '\.\./utils'|from '@smartabp/lowcode-shared/utils'|g" \
            -e "s|from '\.\./types'|from '@smartabp/lowcode-shared/types'|g" \
            "$file"
        
        rm -f "$file.tmp"
        
        if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} 修复: $file"
        fi
        rm -f "$file.bak"
    done
fi

# 7. 修复lowcode-tools包的相对路径
echo -e "\n${BLUE}🔧 修复 lowcode-tools 包...${NC}"
if [ -d "lowcode-tools" ]; then
    find lowcode-tools/src -type f \( -name "*.ts" -o -name "*.vue" \) 2>/dev/null | while read file; do
        cp "$file" "$file.bak"
        
        sed -i.tmp \
            -e "s|from '\.\./templates'|from '@smartabp/lowcode-tools/templates'|g" \
            -e "s|from '\.\./utils'|from '@smartabp/lowcode-tools/utils'|g" \
            "$file"
        
        rm -f "$file.tmp"
        
        if ! diff -q "$file" "$file.bak" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} 修复: $file"
        fi
        rm -f "$file.bak"
    done
fi

# 8. 清理所有.bak文件
echo -e "\n${BLUE}🧹 清理临时文件...${NC}"
find . -name "*.bak" -delete
find . -name "*.tmp" -delete
echo -e "${GREEN}✅ 临时文件已清理${NC}"

# 9. 重新检测违规
echo -e "\n${BLUE}🔍 验证修复结果...${NC}"

NEW_RELATIVE_PATH_COUNT=$(grep -r "'../'" . 2>/dev/null | grep -v "node_modules" | grep -v "/dist/" | wc -l)
NEW_MAIN_APP_COUNT=$(grep -r "@/" . 2>/dev/null | grep -v "node_modules" | grep -v "/dist/" | grep -v ".json" | wc -l)

echo -e "\n${BLUE}修复结果:${NC}"
echo -e "  相对路径引用: ${RED}$RELATIVE_PATH_COUNT${NC} → ${GREEN}$NEW_RELATIVE_PATH_COUNT${NC}"
echo -e "  主应用引用: ${RED}$MAIN_APP_COUNT${NC} → ${GREEN}$NEW_MAIN_APP_COUNT${NC}"

# 10. 生成修复报告
REPORT_FILE="../../../reports/quality/arch-fix-report-$(date +%Y%m%d-%H%M%S).md"
cat > "$REPORT_FILE" << EOF
# 架构违规修复报告

**修复时间**: $(date '+%Y-%m-%d %H:%M:%S')

## 修复结果

| 违规类型 | 修复前 | 修复后 | 减少数量 |
|---------|--------|--------|---------|
| 相对路径引用 | $RELATIVE_PATH_COUNT | $NEW_RELATIVE_PATH_COUNT | $((RELATIVE_PATH_COUNT - NEW_RELATIVE_PATH_COUNT)) |
| 主应用引用 | $MAIN_APP_COUNT | $NEW_MAIN_APP_COUNT | $((MAIN_APP_COUNT - NEW_MAIN_APP_COUNT)) |

## 备份位置

\`$BACKUP_DIR\`

## 剩余问题

$(if [ "$NEW_RELATIVE_PATH_COUNT" -gt 0 ]; then
    echo "### 剩余相对路径引用 ($NEW_RELATIVE_PATH_COUNT 处)"
    echo ""
    echo "\`\`\`"
    grep -r "'../'" . 2>/dev/null | grep -v "node_modules" | grep -v "/dist/" | head -10
    echo "\`\`\`"
fi)

$(if [ "$NEW_MAIN_APP_COUNT" -gt 0 ]; then
    echo "### 剩余主应用引用 ($NEW_MAIN_APP_COUNT 处)"
    echo ""
    echo "\`\`\`"
    grep -r "@/" . 2>/dev/null | grep -v "node_modules" | grep -v "/dist/" | grep -v ".json" | head -10
    echo "\`\`\`"
fi)

## 下一步

1. 检查TypeScript编译: \`npm run type-check\`
2. 运行质量检查: \`node scripts/quality/gate.js\`
3. 如有问题可从备份恢复: \`cp -r $BACKUP_DIR/* .\`
EOF

echo -e "\n${GREEN}✅ 修复完成！${NC}"
echo -e "${BLUE}📄 修复报告:${NC} $REPORT_FILE"
echo -e "${BLUE}💾 备份位置:${NC} $BACKUP_DIR"

# 11. 下一步建议
echo -e "\n${BLUE}📋 下一步建议:${NC}"
echo -e "  1. 检查TypeScript编译: ${GREEN}npm run type-check${NC}"
echo -e "  2. 运行质量检查: ${GREEN}node scripts/quality/gate.js${NC}"
echo -e "  3. 如有问题可恢复: ${YELLOW}cp -r $BACKUP_DIR/* .${NC}"
echo ""

if [ "$NEW_RELATIVE_PATH_COUNT" -eq 0 ] && [ "$NEW_MAIN_APP_COUNT" -eq 0 ]; then
    echo -e "${GREEN}🎉 所有架构违规已修复！${NC}\n"
    exit 0
else
    echo -e "${YELLOW}⚠️ 仍有部分违规需要手动修复${NC}\n"
    exit 1
fi

