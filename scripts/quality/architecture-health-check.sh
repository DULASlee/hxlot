#!/bin/bash

# SmartAbp 架构健康检查脚本
# 检查架构完整性、依赖关系、模块化原则遵循情况

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}🏗️ SmartAbp 架构健康检查${NC}"
echo "========================================"
echo "📅 执行时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 切换到项目根目录
cd "$(dirname "$0")/../.."

# 检查计数器
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# 检查结果记录
check_result() {
    local status=$1
    local message=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    case $status in
        "PASS")
            echo -e "  ✅ ${GREEN}${message}${NC}"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            ;;
        "FAIL")
            echo -e "  ❌ ${RED}${message}${NC}"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            ;;
        "WARN")
            echo -e "  ⚠️  ${YELLOW}${message}${NC}"
            WARNING_CHECKS=$((WARNING_CHECKS + 1))
            ;;
    esac
}

echo -e "${PURPLE}📦 包结构和依赖检查${NC}"
echo "----------------------------------------"

# 1. 检查packages目录结构
echo "🔍 包目录结构检查:"
EXPECTED_PACKAGES=("lowcode-shared" "lowcode-core" "lowcode-api" "lowcode-tools" "lowcode-designer")
EXISTING_PACKAGES=($(ls src/SmartAbp.Vue/packages/))

for package in "${EXPECTED_PACKAGES[@]}"; do
    if [[ " ${EXISTING_PACKAGES[@]} " =~ " ${package} " ]]; then
        check_result "PASS" "包 ${package} 存在"
    else
        check_result "FAIL" "缺少关键包: ${package}"
    fi
done

# 2. 检查TypeScript配置覆盖
echo ""
echo "🔍 TypeScript配置检查:"
for package in "${EXPECTED_PACKAGES[@]}"; do
    if [ -f "src/SmartAbp.Vue/packages/${package}/tsconfig.json" ]; then
        check_result "PASS" "${package} 有TypeScript配置"
    else
        check_result "WARN" "${package} 缺少TypeScript配置"
    fi
done

# 3. 检查package.json文件
echo ""
echo "🔍 包配置文件检查:"
for package in "${EXPECTED_PACKAGES[@]}"; do
    if [ -f "src/SmartAbp.Vue/packages/${package}/package.json" ]; then
        check_result "PASS" "${package} 有package.json"
    else
        check_result "FAIL" "${package} 缺少package.json"
    fi
done

echo ""
echo -e "${PURPLE}🔗 依赖关系检查${NC}"
echo "----------------------------------------"

# 4. 检查相对路径违规
echo "🔍 相对路径违规检查:"
RELATIVE_VIOLATIONS=$(grep -r "'../'" src/SmartAbp.Vue/packages/ --include="*.ts" --include="*.vue" 2>/dev/null | wc -l | tr -d ' ')
if [ "$RELATIVE_VIOLATIONS" -eq 0 ]; then
    check_result "PASS" "无相对路径违规 (${RELATIVE_VIOLATIONS}个)"
else
    check_result "FAIL" "发现相对路径违规 (${RELATIVE_VIOLATIONS}个)"
    echo "    违规文件:"
    grep -r "'../'" src/SmartAbp.Vue/packages/ --include="*.ts" --include="*.vue" 2>/dev/null | head -5 | sed 's/^/      /'
fi

# 5. 检查主应用引用违规
echo ""
echo "🔍 主应用引用检查:"
MAIN_APP_REFS=$(grep -r "@/" src/SmartAbp.Vue/packages/ --include="*.ts" --include="*.vue" 2>/dev/null | grep -v "dist/" | wc -l | tr -d ' ')
if [ "$MAIN_APP_REFS" -le 2 ]; then
    check_result "PASS" "主应用引用控制良好 (${MAIN_APP_REFS}个，主要为文档注释)"
else
    check_result "WARN" "主应用引用需要检查 (${MAIN_APP_REFS}个)"
fi

# 6. 检查循环依赖
echo ""
echo "🔍 循环依赖检查:"
# 简化的循环依赖检测
CIRCULAR_DEPS=0

# 检查lowcode-shared是否依赖高级包
if grep -r "lowcode-core\|lowcode-designer\|lowcode-api" src/SmartAbp.Vue/packages/lowcode-shared/ --include="*.ts" 2>/dev/null | grep -v "dist/" > /dev/null; then
    CIRCULAR_DEPS=$((CIRCULAR_DEPS + 1))
    check_result "FAIL" "lowcode-shared 不应依赖高级包"
fi

# 检查lowcode-core是否依赖designer
if grep -r "lowcode-designer" src/SmartAbp.Vue/packages/lowcode-core/ --include="*.ts" 2>/dev/null | grep -v "dist/" > /dev/null; then
    CIRCULAR_DEPS=$((CIRCULAR_DEPS + 1))
    check_result "FAIL" "lowcode-core 不应依赖 lowcode-designer"
fi

if [ "$CIRCULAR_DEPS" -eq 0 ]; then
    check_result "PASS" "未发现循环依赖"
fi

echo ""
echo -e "${PURPLE}🎯 TypeScript项目引用检查${NC}"
echo "----------------------------------------"

# 7. 检查项目引用配置
echo "🔍 项目引用配置检查:"
if [ -f "src/SmartAbp.Vue/tsconfig.references.json" ]; then
    check_result "PASS" "项目引用配置文件存在"
    
    # 检查引用的包是否都有对应的tsconfig.json
    REFERENCED_PACKAGES=$(grep -o '"./packages/[^"]*"' src/SmartAbp.Vue/tsconfig.references.json | sed 's/"\.\/packages\///; s/"//')
    for package in $REFERENCED_PACKAGES; do
        if [ -f "src/SmartAbp.Vue/packages/${package}/tsconfig.json" ]; then
            check_result "PASS" "引用包 ${package} 配置完整"
        else
            check_result "FAIL" "引用包 ${package} 缺少配置"
        fi
    done
else
    check_result "FAIL" "缺少项目引用配置文件"
fi

# 8. 检查增量编译状态
echo ""
echo "🔍 增量编译检查:"
cd src/SmartAbp.Vue
if npx tsc --build tsconfig.references.json --dry > /dev/null 2>&1; then
    check_result "PASS" "增量编译配置正确"
else
    check_result "WARN" "增量编译可能有问题"
fi
cd ../..

echo ""
echo -e "${PURPLE}📁 文件组织检查${NC}"
echo "----------------------------------------"

# 9. 检查生成代码隔离
echo "🔍 生成代码隔离检查:"
if [ -d ".generated" ]; then
    check_result "PASS" "生成代码隔离目录存在"
else
    check_result "WARN" "建议创建生成代码隔离目录"
fi

if grep -q ".generated" .gitignore 2>/dev/null; then
    check_result "PASS" "生成代码已从版本控制排除"
else
    check_result "WARN" "建议将生成代码从版本控制排除"
fi

# 10. 检查IDE配置
echo ""
echo "🔍 IDE配置检查:"
if [ -f ".vscode/settings.json" ]; then
    check_result "PASS" "IDE配置文件存在"
    
    if grep -q ".generated" .vscode/settings.json 2>/dev/null; then
        check_result "PASS" "IDE已配置排除生成代码"
    else
        check_result "WARN" "建议配置IDE排除生成代码"
    fi
else
    check_result "WARN" "建议创建IDE配置文件"
fi

echo ""
echo -e "${PURPLE}🔐 架构安全检查${NC}"
echo "----------------------------------------"

# 11. 检查敏感文件
echo "🔍 敏感文件检查:"
SENSITIVE_PATTERNS=("password" "secret" "api_key" "private_key" "token")
SENSITIVE_FILES=0

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    MATCHES=$(grep -r -i "$pattern" src/ --include="*.ts" --include="*.vue" --include="*.js" 2>/dev/null | grep -v ".git" | grep -v "node_modules" | grep -v "test" | wc -l | tr -d ' ')
    if [ "$MATCHES" -gt 10 ]; then
        SENSITIVE_FILES=$((SENSITIVE_FILES + 1))
        check_result "WARN" "发现可能的敏感信息: ${pattern} (${MATCHES}处)"
    fi
done

if [ "$SENSITIVE_FILES" -eq 0 ]; then
    check_result "PASS" "未发现明显的敏感信息泄露"
fi

# 12. 检查hardcoded配置
echo ""
echo "🔍 硬编码配置检查:"
HARDCODED_URLS=$(grep -r "http://\|https://" src/ --include="*.ts" --include="*.vue" 2>/dev/null | grep -v "localhost\|127.0.0.1\|example.com" | wc -l | tr -d ' ')
if [ "$HARDCODED_URLS" -lt 5 ]; then
    check_result "PASS" "硬编码URL数量合理 (${HARDCODED_URLS}个)"
else
    check_result "WARN" "硬编码URL较多，建议使用配置文件 (${HARDCODED_URLS}个)"
fi

echo ""
echo -e "${PURPLE}📈 性能和可维护性检查${NC}"
echo "----------------------------------------"

# 13. 检查大文件
echo "🔍 大文件检查:"
LARGE_FILES=$(find src/ -name "*.ts" -o -name "*.vue" -o -name "*.js" | xargs wc -l 2>/dev/null | sort -nr | head -5 | awk '$1 > 1000 {print $0}' | wc -l | tr -d ' ')
if [ "$LARGE_FILES" -eq 0 ]; then
    check_result "PASS" "无超大文件 (>1000行)"
else
    check_result "WARN" "发现超大文件 (${LARGE_FILES}个 >1000行)"
    find src/ -name "*.ts" -o -name "*.vue" -o -name "*.js" | xargs wc -l 2>/dev/null | sort -nr | head -3 | awk '$1 > 1000 {printf "      %s: %d行\n", $2, $1}'
fi

# 14. 检查TODO和FIXME
echo ""
echo "🔍 待办事项检查:"
TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX" src/ --include="*.ts" --include="*.vue" --include="*.js" 2>/dev/null | wc -l | tr -d ' ')
if [ "$TODO_COUNT" -lt 20 ]; then
    check_result "PASS" "待办事项数量合理 (${TODO_COUNT}个)"
else
    check_result "WARN" "待办事项较多，建议清理 (${TODO_COUNT}个)"
fi

echo ""
echo -e "${BLUE}📊 架构健康总结${NC}"
echo "========================================"

# 计算健康度分数
HEALTH_SCORE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

echo "检查项目总数: $TOTAL_CHECKS"
echo -e "通过检查: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "警告检查: ${YELLOW}$WARNING_CHECKS${NC}"
echo -e "失败检查: ${RED}$FAILED_CHECKS${NC}"
echo ""

if [ "$HEALTH_SCORE" -ge 90 ]; then
    echo -e "架构健康度: ${GREEN}${HEALTH_SCORE}% - 优秀 🎯${NC}"
elif [ "$HEALTH_SCORE" -ge 75 ]; then
    echo -e "架构健康度: ${YELLOW}${HEALTH_SCORE}% - 良好 ⚠️${NC}"
else
    echo -e "架构健康度: ${RED}${HEALTH_SCORE}% - 需要改进 🚨${NC}"
fi

echo ""
echo "📋 改进建议:"
echo "----------------------------------------"

if [ "$FAILED_CHECKS" -gt 0 ]; then
    echo "• 🔴 优先解决失败的检查项目"
fi

if [ "$WARNING_CHECKS" -gt 3 ]; then
    echo "• 🟡 关注警告项目，防止问题累积"
fi

if [ "$HEALTH_SCORE" -lt 85 ]; then
    echo "• 📈 建议制定架构改进计划"
    echo "• 🔄 定期执行架构健康检查"
fi

echo "• 📚 参考架构决策记录(ADR)进行改进"
echo "• 🛠️ 考虑集成到CI/CD流程中"

echo ""
echo "✅ 架构健康检查完成"
