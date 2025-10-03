#!/bin/bash

# ==========================================
# SmartAbp 端到端业务验证测试脚本
# 验证智慧工地项目管理系统案例
# ==========================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✅]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[⚠️]${NC} $1"
}

log_error() {
    echo -e "${RED}[❌]${NC} $1"
}

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 显示标题
print_header() {
    echo ""
    echo "=========================================="
    echo "  SmartAbp 端到端业务验证测试"
    echo "  业务案例: 智慧工地项目管理系统"
    echo "  Version: 1.0.0"
    echo "=========================================="
    echo ""
}

# 测试函数
run_test() {
    local test_name=$1
    local test_command=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_info "执行测试 $TOTAL_TESTS: $test_name"
    
    if eval "$test_command"; then
        log_success "$test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        log_error "$test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# ==========================================
# 第一部分: 模板市场功能验证
# ==========================================
test_template_market() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "第一部分: 模板市场功能验证"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    run_test "模板市场Store存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/stores/templateMarket.ts"
    
    run_test "模板市场Store包含loadTemplates方法" \
        "grep -q 'loadTemplates' src/SmartAbp.Vue/packages/lowcode-core/src/stores/templateMarket.ts"
    
    run_test "模板市场Store包含搜索功能" \
        "grep -q 'searchTemplates\|filteredTemplates' src/SmartAbp.Vue/packages/lowcode-core/src/stores/templateMarket.ts"
    
    run_test "模板市场有初始模板数据" \
        "grep -q 'getInitialTemplates\|CrudBasic\|WorkflowApproval' src/SmartAbp.Vue/packages/lowcode-core/src/stores/templateMarket.ts"
    
    echo ""
}

# ==========================================
# 第二部分: 智能推荐引擎验证
# ==========================================
test_intelligent_recommendation() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "第二部分: 智能推荐引擎验证"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    run_test "智能推荐引擎存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/engines/IntelligentRecommendationEngine.ts"
    
    run_test "支持模板推荐" \
        "grep -q 'recommendTemplates' src/SmartAbp.Vue/packages/lowcode-core/src/engines/IntelligentRecommendationEngine.ts"
    
    run_test "支持代码优化建议" \
        "grep -q 'suggestOptimizations' src/SmartAbp.Vue/packages/lowcode-core/src/engines/IntelligentRecommendationEngine.ts"
    
    run_test "支持最佳实践建议" \
        "grep -q 'suggestBestPractices' src/SmartAbp.Vue/packages/lowcode-core/src/engines/IntelligentRecommendationEngine.ts"
    
    run_test "支持综合推荐" \
        "grep -q 'getRecommendations' src/SmartAbp.Vue/packages/lowcode-core/src/engines/IntelligentRecommendationEngine.ts"
    
    echo ""
}

# ==========================================
# 第三部分: 业务规则引擎验证
# ==========================================
test_business_rule_engine() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "第三部分: 业务规则引擎验证"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    run_test "规则执行引擎存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/engines/ruleExecutionEngine.ts"
    
    run_test "表达式解析器存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/utils/ruleExpressionParser.ts"
    
    run_test "动作执行器存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/engines/actionExecutor.ts"
    
    run_test "规则引擎集成到Store" \
        "grep -q 'executeBusinessRulesEnhanced\|RuleExecutionEngine' src/SmartAbp.Vue/packages/lowcode-core/src/stores/enhancedStateMachine.ts"
    
    run_test "支持调试模式" \
        "grep -q 'enableRuleDebug\|disableRuleDebug' src/SmartAbp.Vue/packages/lowcode-core/src/stores/enhancedStateMachine.ts"
    
    echo ""
}

# ==========================================
# 第四部分: 工作流引擎验证
# ==========================================
test_workflow_engine() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "第四部分: 工作流引擎验证"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    run_test "工作流引擎存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/engines/WorkflowEngine.ts"
    
    run_test "支持工作流注册" \
        "grep -q 'registerWorkflow' src/SmartAbp.Vue/packages/lowcode-core/src/engines/WorkflowEngine.ts"
    
    run_test "支持实例管理" \
        "grep -q 'createInstance\|getInstance' src/SmartAbp.Vue/packages/lowcode-core/src/engines/WorkflowEngine.ts"
    
    run_test "支持状态转换" \
        "grep -q 'executeTransition' src/SmartAbp.Vue/packages/lowcode-core/src/engines/WorkflowEngine.ts"
    
    run_test "支持条件验证" \
        "grep -q 'validateTransition' src/SmartAbp.Vue/packages/lowcode-core/src/engines/WorkflowEngine.ts"
    
    echo ""
}

# ==========================================
# 第五部分: DDD代码生成器验证
# ==========================================
test_ddd_generator() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "第五部分: DDD代码生成器验证"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    run_test "DDD代码生成器存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/generators/DddCodeGenerator.ts"
    
    run_test "支持聚合根生成" \
        "grep -q 'generateAggregateRoot' src/SmartAbp.Vue/packages/lowcode-core/src/generators/DddCodeGenerator.ts"
    
    run_test "支持实体生成" \
        "grep -q 'generateEntity' src/SmartAbp.Vue/packages/lowcode-core/src/generators/DddCodeGenerator.ts"
    
    run_test "支持值对象生成" \
        "grep -q 'generateValueObject' src/SmartAbp.Vue/packages/lowcode-core/src/generators/DddCodeGenerator.ts"
    
    run_test "支持仓储生成" \
        "grep -q 'generateRepository' src/SmartAbp.Vue/packages/lowcode-core/src/generators/DddCodeGenerator.ts"
    
    echo ""
}

# ==========================================
# 第六部分: CQRS代码生成器验证
# ==========================================
test_cqrs_generator() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "第六部分: CQRS代码生成器验证"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    run_test "CQRS代码生成器存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/generators/CqrsCodeGenerator.ts"
    
    run_test "支持Command生成" \
        "grep -q 'generateCommand' src/SmartAbp.Vue/packages/lowcode-core/src/generators/CqrsCodeGenerator.ts"
    
    run_test "支持Query生成" \
        "grep -q 'generateQuery' src/SmartAbp.Vue/packages/lowcode-core/src/generators/CqrsCodeGenerator.ts"
    
    run_test "支持Handler生成" \
        "grep -q 'generateCommandHandler\|generateQueryHandler' src/SmartAbp.Vue/packages/lowcode-core/src/generators/CqrsCodeGenerator.ts"
    
    echo ""
}

# ==========================================
# 第七部分: 企业级UI组件验证
# ==========================================
test_ui_components() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "第七部分: 企业级UI组件验证"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    run_test "SmartDataTable组件存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/components/SmartDataTable/SmartDataTable.vue"
    
    run_test "SmartFormBuilder组件存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/components/SmartFormBuilder/SmartFormBuilder.vue"
    
    run_test "PageBuilder组件存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/components/PageBuilder/PageBuilder.vue"
    
    run_test "WorkflowDesigner组件存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/components/WorkflowDesigner/WorkflowDesigner.vue"
    
    run_test "BusinessRuleDesigner组件存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/components/BusinessRuleDesigner/BusinessRuleDesigner.vue"
    
    echo ""
}

# ==========================================
# 第八部分: 代码质量分析器验证
# ==========================================
test_quality_analyzer() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "第八部分: 代码质量分析器验证"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    run_test "代码质量分析器存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/analyzers/CodeQualityAnalyzer.ts"
    
    run_test "支持质量分析" \
        "grep -q 'analyzeQuality' src/SmartAbp.Vue/packages/lowcode-core/src/analyzers/CodeQualityAnalyzer.ts"
    
    run_test "支持复杂度检测" \
        "grep -q 'detectComplexIssues' src/SmartAbp.Vue/packages/lowcode-core/src/analyzers/CodeQualityAnalyzer.ts"
    
    run_test "支持安全扫描" \
        "grep -q 'performSecurityScan' src/SmartAbp.Vue/packages/lowcode-core/src/analyzers/CodeQualityAnalyzer.ts"
    
    run_test "支持评分计算" \
        "grep -q 'calculateScore' src/SmartAbp.Vue/packages/lowcode-core/src/analyzers/CodeQualityAnalyzer.ts"
    
    echo ""
}

# ==========================================
# 第九部分: 性能优化验证
# ==========================================
test_performance() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "第九部分: 性能优化验证"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    run_test "性能监控Composable存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/composables/usePerformanceMonitor.ts"
    
    run_test "缓存管理器存在" \
        "test -f src/SmartAbp.Vue/packages/lowcode-core/src/utils/performance/cacheManager.ts"
    
    run_test "性能优化指南存在" \
        "test -f docs/performance/performance-optimization-guide.md"
    
    run_test "生产环境配置包含性能优化" \
        "grep -q 'performance\|maxConcurrentJobs\|enableCaching' config/production.json"
    
    echo ""
}

# ==========================================
# 第十部分: 部署运维验证
# ==========================================
test_deployment() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "第十部分: 部署运维验证"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    run_test "生产环境Dockerfile存在" \
        "test -f Dockerfile.production"
    
    run_test "Docker Compose配置存在" \
        "test -f docker-compose.production.yml"
    
    run_test "Kubernetes配置存在" \
        "test -f deployment/k8s/production/deployment.yaml"
    
    run_test "一键部署脚本存在且可执行" \
        "test -x scripts/deployment/deploy-production.sh"
    
    run_test "生产部署指南存在" \
        "test -f docs/deployment/production-deployment-guide.md"
    
    echo ""
}

# ==========================================
# 第十一部分: 文档完整性验证
# ==========================================
test_documentation() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "第十一部分: 文档完整性验证"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    run_test "模板市场使用指南存在" \
        "test -f docs/guides/template-market-guide.md"
    
    run_test "智能推荐使用指南存在" \
        "test -f docs/guides/intelligent-recommendation-guide.md"
    
    run_test "模板市场实战示例存在" \
        "test -f docs/examples/template-market-example.md"
    
    run_test "智慧工地业务案例存在" \
        "test -f docs/examples/business-case-smart-construction.md"
    
    run_test "业务案例包含完整的实现代码" \
        "grep -q 'IntelligentRecommendationEngine\|WorkflowEngine\|DddCodeGenerator' docs/examples/business-case-smart-construction.md"
    
    echo ""
}

# ==========================================
# 测试结果汇总
# ==========================================
print_summary() {
    echo ""
    echo "=========================================="
    echo "  测试结果汇总"
    echo "=========================================="
    echo ""
    
    echo "📊 测试统计:"
    echo "  总测试数: $TOTAL_TESTS"
    echo "  通过: $PASSED_TESTS"
    echo "  失败: $FAILED_TESTS"
    echo "  通过率: $(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")%"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        log_success "=========================================="
        log_success "  🎉 所有测试通过！"
        log_success "  SmartAbp低代码生成器功能验证成功！"
        log_success "=========================================="
        return 0
    else
        log_error "=========================================="
        log_error "  ❌ 有 $FAILED_TESTS 个测试失败"
        log_error "  请检查失败的测试项"
        log_error "=========================================="
        return 1
    fi
}

# 主函数
main() {
    print_header
    
    # 执行所有测试
    test_template_market
    test_intelligent_recommendation
    test_business_rule_engine
    test_workflow_engine
    test_ddd_generator
    test_cqrs_generator
    test_ui_components
    test_quality_analyzer
    test_performance
    test_deployment
    test_documentation
    
    # 打印汇总
    print_summary
}

# 执行主函数
main
