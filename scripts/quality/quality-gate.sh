#!/bin/bash

# 企业级质量门禁脚本 v1.0
# 基于2025年业界最佳实践设计

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置参数
PROJECT_ROOT=${1:-$(pwd)}
STRICT_MODE=${2:-true}
AI_ENABLED=${3:-true}
REPORT_FORMAT=${4:-json}

# 质量门禁配置
P0_THRESHOLD=90  # P0级门禁阈值
P1_THRESHOLD=80  # P1级门禁阈值
P2_THRESHOLD=70  # P2级门禁阈值

# 报告目录
REPORT_DIR="$PROJECT_ROOT/reports/quality"
mkdir -p "$REPORT_DIR"

echo -e "${BLUE}🔍 启动企业级质量门禁检查...${NC}"
echo -e "${BLUE}项目根目录: $PROJECT_ROOT${NC}"
echo -e "${BLUE}严格模式: $STRICT_MODE${NC}"
echo -e "${BLUE}AI辅助: $AI_ENABLED${NC}"
echo ""

# 检查必要工具
check_dependencies() {
    echo -e "${BLUE}🔧 检查依赖工具...${NC}"
    
    local missing_tools=()
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi
    
    # 检查dotnet
    if ! command -v dotnet &> /dev/null; then
        missing_tools+=("dotnet")
    fi
    
    # 检查git
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        echo -e "${RED}❌ 缺少必要工具: ${missing_tools[*]}${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 依赖检查通过${NC}"
}

# 前端质量检查
check_frontend_quality() {
    echo -e "${BLUE}🎨 执行前端质量检查...${NC}"
    
    cd "$PROJECT_ROOT/src/SmartAbp.Vue"
    
    # 检查package.json是否存在
    if [ ! -f "package.json" ]; then
        echo -e "${YELLOW}⚠️ 未找到前端项目，跳过前端检查${NC}"
        return 0
    fi
    
    # 安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}📦 安装前端依赖...${NC}"
        npm install --silent
    fi
    
    # TypeScript类型检查
    echo -e "${BLUE}🔒 执行TypeScript类型检查...${NC}"
    if npm run type-check 2>/dev/null; then
        echo -e "${GREEN}✅ TypeScript类型检查通过${NC}"
    else
        echo -e "${RED}❌ TypeScript类型检查失败${NC}"
        return 1
    fi
    
    # ESLint代码风格检查
    echo -e "${BLUE}🎨 执行ESLint代码风格检查...${NC}"
    if npm run lint 2>/dev/null; then
        echo -e "${GREEN}✅ ESLint代码风格检查通过${NC}"
    else
        echo -e "${YELLOW}⚠️ ESLint代码风格检查发现问题${NC}"
        if [ "$STRICT_MODE" = "true" ]; then
            return 1
        fi
    fi
    
    # 架构合规检查
    echo -e "${BLUE}🏗️ 执行架构合规检查...${NC}"
    
    # 检查packages相对路径违规
    local relative_path_violations=$(grep -r "'../'" packages/ 2>/dev/null | wc -l)
    if [ "$relative_path_violations" -gt 0 ]; then
        echo -e "${RED}❌ 发现 $relative_path_violations 个相对路径违规${NC}"
        if [ "$STRICT_MODE" = "true" ]; then
            return 1
        fi
    else
        echo -e "${GREEN}✅ 相对路径检查通过${NC}"
    fi
    
    # 检查主应用引用违规
    local main_app_violations=$(grep -r "@/" packages/ 2>/dev/null | wc -l)
    if [ "$main_app_violations" -gt 0 ]; then
        echo -e "${RED}❌ 发现 $main_app_violations 个主应用引用违规${NC}"
        if [ "$STRICT_MODE" = "true" ]; then
            return 1
        fi
    else
        echo -e "${GREEN}✅ 主应用引用检查通过${NC}"
    fi
    
    # 检查类型绕过
    local type_bypass=$(grep -r "as any\|@ts-ignore" src/ packages/ 2>/dev/null | wc -l)
    if [ "$type_bypass" -gt 0 ]; then
        echo -e "${RED}❌ 发现 $type_bypass 个类型绕过${NC}"
        if [ "$STRICT_MODE" = "true" ]; then
            return 1
        fi
    else
        echo -e "${GREEN}✅ 类型安全检查通过${NC}"
    fi
    
    echo -e "${GREEN}✅ 前端质量检查完成${NC}"
    return 0
}

# 后端质量检查
check_backend_quality() {
    echo -e "${BLUE}🔨 执行后端质量检查...${NC}"
    
    cd "$PROJECT_ROOT"
    
    # 检查解决方案文件是否存在
    if [ ! -f "src/SmartAbp.sln" ]; then
        echo -e "${YELLOW}⚠️ 未找到后端项目，跳过后端检查${NC}"
        return 0
    fi
    
    # 编译检查
    echo -e "${BLUE}🔨 执行编译检查...${NC}"
    if dotnet build src/SmartAbp.sln --verbosity minimal --no-incremental 2>/dev/null; then
        echo -e "${GREEN}✅ 编译检查通过${NC}"
    else
        echo -e "${RED}❌ 编译检查失败${NC}"
        return 1
    fi
    
    # 代码风格检查
    echo -e "${BLUE}🎨 执行代码风格检查...${NC}"
    if dotnet format src/SmartAbp.sln --verify-no-changes --verbosity diagnostic 2>/dev/null; then
        echo -e "${GREEN}✅ 代码风格检查通过${NC}"
    else
        echo -e "${YELLOW}⚠️ 代码风格检查发现问题${NC}"
        if [ "$STRICT_MODE" = "true" ]; then
            return 1
        fi
    fi
    
    # 运行测试
    echo -e "${BLUE}🧪 执行测试...${NC}"
    if dotnet test src/SmartAbp.sln --logger "console;verbosity=minimal" 2>/dev/null; then
        echo -e "${GREEN}✅ 测试执行通过${NC}"
    else
        echo -e "${YELLOW}⚠️ 测试执行发现问题${NC}"
        if [ "$STRICT_MODE" = "true" ]; then
            return 1
        fi
    fi
    
    echo -e "${GREEN}✅ 后端质量检查完成${NC}"
    return 0
}

# 安全扫描
check_security() {
    echo -e "${BLUE}🔐 执行安全扫描...${NC}"
    
    local security_issues=0
    
    # 检查敏感信息
    local sensitive_data=$(grep -r -i "password\|secret\|api[_-]key\|token" src/ 2>/dev/null | wc -l)
    if [ "$sensitive_data" -gt 0 ]; then
        echo -e "${YELLOW}⚠️ 发现 $sensitive_data 个敏感信息${NC}"
        security_issues=$((security_issues + 1))
    fi
    
    # 检查SQL注入风险
    local sql_injection=$(grep -r -i "select\|insert\|update\|delete" src/ | grep -v "//" | grep "+" | wc -l)
    if [ "$sql_injection" -gt 0 ]; then
        echo -e "${YELLOW}⚠️ 发现 $sql_injection 个潜在SQL注入风险${NC}"
        security_issues=$((security_issues + 1))
    fi
    
    if [ "$security_issues" -eq 0 ]; then
        echo -e "${GREEN}✅ 安全扫描通过${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️ 安全扫描发现 $security_issues 个问题${NC}"
        if [ "$STRICT_MODE" = "true" ]; then
            return 1
        fi
        return 0
    fi
}

# 性能检查
check_performance() {
    echo -e "${BLUE}⚡ 执行性能检查...${NC}"
    
    local performance_issues=0
    
    # 检查大文件
    local large_files=$(find src/ -name "*.cs" -o -name "*.ts" -o -name "*.vue" | xargs wc -l | awk '$1 > 500 {count++} END {print count+0}')
    if [ "$large_files" -gt 0 ]; then
        echo -e "${YELLOW}⚠️ 发现 $large_files 个大文件 (>500行)${NC}"
        performance_issues=$((performance_issues + 1))
    fi
    
    # 检查TODO标记
    local todo_count=$(grep -r "TODO\|FIXME\|XXX" src/ 2>/dev/null | wc -l)
    if [ "$todo_count" -gt 10 ]; then
        echo -e "${YELLOW}⚠️ 发现 $todo_count 个TODO标记${NC}"
        performance_issues=$((performance_issues + 1))
    fi
    
    if [ "$performance_issues" -eq 0 ]; then
        echo -e "${GREEN}✅ 性能检查通过${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️ 性能检查发现 $performance_issues 个问题${NC}"
        return 0
    fi
}

# 生成质量报告
generate_report() {
    echo -e "${BLUE}📊 生成质量报告...${NC}"
    
    local report_file="$REPORT_DIR/quality-report-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "project": "$(basename "$PROJECT_ROOT")",
  "qualityGate": {
    "p0Passed": $P0_PASSED,
    "p1Passed": $P1_PASSED,
    "p2Passed": $P2_PASSED,
    "overallPassed": $OVERALL_PASSED
  },
  "checks": {
    "frontend": $FRONTEND_PASSED,
    "backend": $BACKEND_PASSED,
    "security": $SECURITY_PASSED,
    "performance": $PERFORMANCE_PASSED
  },
  "metrics": {
    "totalFiles": $(find src/ -type f \( -name "*.cs" -o -name "*.ts" -o -name "*.vue" \) | wc -l),
    "totalLines": $(find src/ -type f \( -name "*.cs" -o -name "*.ts" -o -name "*.vue" \) | xargs wc -l | tail -1 | awk '{print $1}'),
    "todoCount": $(grep -r "TODO\|FIXME\|XXX" src/ 2>/dev/null | wc -l)
  }
}
EOF
    
    echo -e "${GREEN}✅ 质量报告已生成: $report_file${NC}"
}

# 主函数
main() {
    echo -e "${BLUE}🚀 企业级质量门禁检查开始${NC}"
    echo "=================================="
    
    # 初始化变量
    P0_PASSED=true
    P1_PASSED=true
    P2_PASSED=true
    OVERALL_PASSED=true
    
    FRONTEND_PASSED=true
    BACKEND_PASSED=true
    SECURITY_PASSED=true
    PERFORMANCE_PASSED=true
    
    # 检查依赖
    check_dependencies
    
    # 执行各项检查
    if ! check_frontend_quality; then
        FRONTEND_PASSED=false
        P0_PASSED=false
    fi
    
    if ! check_backend_quality; then
        BACKEND_PASSED=false
        P0_PASSED=false
    fi
    
    if ! check_security; then
        SECURITY_PASSED=false
        P1_PASSED=false
    fi
    
    if ! check_performance; then
        PERFORMANCE_PASSED=false
        P2_PASSED=false
    fi
    
    # 计算总体结果
    if [ "$P0_PASSED" = "false" ] || [ "$P1_PASSED" = "false" ]; then
        OVERALL_PASSED=false
    fi
    
    # 生成报告
    generate_report
    
    # 输出结果
    echo ""
    echo "=================================="
    echo -e "${BLUE}📊 质量门禁检查结果${NC}"
    echo "=================================="
    echo -e "P0级门禁 (阻断性): $([ "$P0_PASSED" = "true" ] && echo -e "${GREEN}✅ 通过${NC}" || echo -e "${RED}❌ 失败${NC}")"
    echo -e "P1级门禁 (警告性): $([ "$P1_PASSED" = "true" ] && echo -e "${GREEN}✅ 通过${NC}" || echo -e "${YELLOW}⚠️ 警告${NC}")"
    echo -e "P2级门禁 (建议性): $([ "$P2_PASSED" = "true" ] && echo -e "${GREEN}✅ 通过${NC}" || echo -e "${YELLOW}⚠️ 建议${NC}")"
    echo ""
    echo -e "前端检查: $([ "$FRONTEND_PASSED" = "true" ] && echo -e "${GREEN}✅ 通过${NC}" || echo -e "${RED}❌ 失败${NC}")"
    echo -e "后端检查: $([ "$BACKEND_PASSED" = "true" ] && echo -e "${GREEN}✅ 通过${NC}" || echo -e "${RED}❌ 失败${NC}")"
    echo -e "安全扫描: $([ "$SECURITY_PASSED" = "true" ] && echo -e "${GREEN}✅ 通过${NC}" || echo -e "${YELLOW}⚠️ 警告${NC}")"
    echo -e "性能检查: $([ "$PERFORMANCE_PASSED" = "true" ] && echo -e "${GREEN}✅ 通过${NC}" || echo -e "${YELLOW}⚠️ 建议${NC}")"
    echo ""
    
    if [ "$OVERALL_PASSED" = "true" ]; then
        echo -e "${GREEN}🎉 质量门禁检查通过！${NC}"
        exit 0
    else
        echo -e "${RED}❌ 质量门禁检查未通过！${NC}"
        echo -e "${YELLOW}💡 请根据上述检查结果修复问题后重新提交${NC}"
        exit 1
    fi
}

# 执行主函数
main "$@"
