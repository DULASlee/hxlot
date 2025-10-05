#!/bin/bash

# SmartAbp 包依赖管理脚本
# 统一管理和更新包间依赖关系，确保版本一致性

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📦 SmartAbp 包依赖管理器${NC}"
echo "========================================"

# 切换到项目根目录
cd "$(dirname "$0")/../.."
FRONTEND_DIR="src/SmartAbp.Vue"

# 显示帮助信息
show_help() {
    echo "用法: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "命令:"
    echo "  check           检查包依赖状态"
    echo "  sync            同步包版本号"
    echo "  install         安装所有包依赖"
    echo "  update          更新包依赖"
    echo "  validate        验证依赖完整性"
    echo "  graph           显示依赖关系图"
    echo "  scan            扫描依赖健康度（新增）⭐"
    echo "  report          生成详细依赖报告（新增）⭐"
    echo "  outdated        检查过时的依赖（新增）⭐"
    echo "  security        执行安全漏洞扫描（新增）⭐"
    echo ""
    echo "选项:"
    echo "  --fix           自动修复发现的问题"
    echo "  --dry-run       仅显示变更，不执行"
    echo "  -h, --help      显示帮助信息"
}

# 记录函数
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 获取包列表
get_packages() {
    find "$FRONTEND_DIR/packages" -name "package.json" -exec dirname {} \; | sort
}

# 检查包依赖状态
check_dependencies() {
    log "检查包依赖状态..."
    
    local issues=0
    local packages=($(get_packages))
    
    echo ""
    echo "📋 包依赖状态报告:"
    echo "----------------------------------------"
    
    for package_dir in "${packages[@]}"; do
        local package_name=$(basename "$package_dir")
        local package_json="$package_dir/package.json"
        
        echo ""
        echo "📦 $package_name:"
        
        # 检查package.json是否存在
        if [ ! -f "$package_json" ]; then
            error "  ❌ 缺少 package.json"
            issues=$((issues + 1))
            continue
        fi
        
        # 检查基本字段
        local name=$(jq -r '.name // empty' "$package_json")
        local version=$(jq -r '.version // empty' "$package_json")
        local main=$(jq -r '.main // empty' "$package_json")
        local types=$(jq -r '.types // empty' "$package_json")
        
        if [ -z "$name" ]; then
            warn "  ⚠️  缺少 name 字段"
            issues=$((issues + 1))
        else
            echo "  ✅ name: $name"
        fi
        
        if [ -z "$version" ]; then
            warn "  ⚠️  缺少 version 字段"
            issues=$((issues + 1))
        else
            echo "  ✅ version: $version"
        fi
        
        if [ -z "$main" ]; then
            warn "  ⚠️  缺少 main 字段"
        else
            echo "  ✅ main: $main"
        fi
        
        if [ -z "$types" ]; then
            warn "  ⚠️  缺少 types 字段"
        else
            echo "  ✅ types: $types"
        fi
        
        # 检查依赖
        local deps=$(jq -r '.dependencies // {} | keys[]' "$package_json" 2>/dev/null)
        local peer_deps=$(jq -r '.peerDependencies // {} | keys[]' "$package_json" 2>/dev/null)
        
        if [ -n "$deps" ]; then
            echo "  📦 dependencies: $(echo $deps | tr '\n' ', ' | sed 's/, $//')"
        fi
        
        if [ -n "$peer_deps" ]; then
            echo "  🔗 peerDependencies: $(echo $peer_deps | tr '\n' ', ' | sed 's/, $//')"
        fi
        
        # 检查构建产物
        local dist_dir="$package_dir/dist"
        if [ -d "$dist_dir" ]; then
            echo "  ✅ 构建产物存在"
        else
            warn "  ⚠️  缺少构建产物"
        fi
    done
    
    echo ""
    if [ $issues -eq 0 ]; then
        success "所有包依赖状态正常"
    else
        warn "发现 $issues 个问题需要处理"
    fi
    
    return $issues
}

# 同步包版本号
sync_versions() {
    log "同步包版本号..."
    
    local fix_mode=${1:-false}
    local packages=($(get_packages))
    local base_version="1.0.0"
    
    echo ""
    echo "🔄 版本同步操作:"
    echo "----------------------------------------"
    
    for package_dir in "${packages[@]}"; do
        local package_name=$(basename "$package_dir")
        local package_json="$package_dir/package.json"
        
        if [ ! -f "$package_json" ]; then
            warn "跳过 $package_name (无 package.json)"
            continue
        fi
        
        local current_version=$(jq -r '.version // empty' "$package_json")
        
        if [ "$current_version" != "$base_version" ]; then
            echo "📦 $package_name: $current_version → $base_version"
            
            if [ "$fix_mode" = true ]; then
                jq ".version = \"$base_version\"" "$package_json" > "$package_json.tmp"
                mv "$package_json.tmp" "$package_json"
                success "  ✅ 已更新版本号"
            else
                echo "  🔍 (dry-run) 将更新版本号"
            fi
        else
            echo "📦 $package_name: ✅ 版本号已同步"
        fi
    done
}

# 安装依赖
install_dependencies() {
    log "安装包依赖..."
    
    cd "$FRONTEND_DIR"
    
    # 安装主应用依赖
    echo ""
    echo "📦 安装主应用依赖:"
    npm ci
    
    # 构建packages（这会处理内部依赖）
    echo ""
    echo "🔨 构建packages:"
    if npx tsc --build tsconfig.references.json; then
        success "packages构建成功"
    else
        warn "packages构建有警告，但继续"
    fi
    
    cd - > /dev/null
}

# 验证依赖完整性
validate_dependencies() {
    log "验证依赖完整性..."
    
    local issues=0
    local packages=($(get_packages))
    
    echo ""
    echo "🔍 依赖完整性检查:"
    echo "----------------------------------------"
    
    # 检查循环依赖
    echo ""
    echo "🔄 循环依赖检查:"
    
    # 简化的循环依赖检测
    for package_dir in "${packages[@]}"; do
        local package_name=$(basename "$package_dir")
        local package_json="$package_dir/package.json"
        
        if [ ! -f "$package_json" ]; then
            continue
        fi
        
        # 检查是否依赖了不应该依赖的包
        case $package_name in
            "lowcode-shared")
                if jq -e '.dependencies | has("@smartabp/lowcode-core") or has("@smartabp/lowcode-designer") or has("@smartabp/lowcode-api")' "$package_json" > /dev/null 2>&1; then
                    error "  ❌ lowcode-shared 不应依赖高级包"
                    issues=$((issues + 1))
                else
                    echo "  ✅ lowcode-shared 依赖正确"
                fi
                ;;
            "lowcode-core")
                if jq -e '.dependencies | has("@smartabp/lowcode-designer")' "$package_json" > /dev/null 2>&1; then
                    error "  ❌ lowcode-core 不应依赖 lowcode-designer"
                    issues=$((issues + 1))
                else
                    echo "  ✅ lowcode-core 依赖正确"
                fi
                ;;
        esac
    done
    
    # 检查版本一致性
    echo ""
    echo "📊 版本一致性检查:"
    
    local versions=()
    for package_dir in "${packages[@]}"; do
        local package_json="$package_dir/package.json"
        if [ -f "$package_json" ]; then
            local version=$(jq -r '.version // empty' "$package_json")
            if [ -n "$version" ]; then
                versions+=("$version")
            fi
        fi
    done
    
    local unique_versions=($(printf '%s\n' "${versions[@]}" | sort -u))
    
    if [ ${#unique_versions[@]} -eq 1 ]; then
        echo "  ✅ 所有包版本一致: ${unique_versions[0]}"
    else
        warn "  ⚠️  发现不同版本: ${unique_versions[*]}"
        issues=$((issues + 1))
    fi
    
    echo ""
    if [ $issues -eq 0 ]; then
        success "依赖完整性验证通过"
    else
        warn "发现 $issues 个完整性问题"
    fi
    
    return $issues
}

# 扫描依赖健康度（新增功能）
scan_dependencies() {
    log "扫描依赖健康度..."
    
    local total_score=0
    local max_score=20
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 外部依赖管理评估"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 1. 检测npm依赖版本新鲜度 (10分)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo "🔍 [1/3] 检测npm依赖版本新鲜度..."
    cd "$FRONTEND_DIR"
    
    if ! command -v npm &> /dev/null; then
        error "npm未安装，无法检测依赖"
        cd - > /dev/null
        return 1
    fi
    
    # 检测过时的依赖
    local outdated_output=$(npm outdated --json 2>/dev/null || echo "{}")
    local outdated_count=$(echo "$outdated_output" | jq -r 'length' 2>/dev/null || echo "0")
    outdated_count=$(echo "$outdated_count" | tr -d '\n' | tr -d ' ')
    
    local freshness_score=0
    if [ "$outdated_count" -eq 0 ] 2>/dev/null; then
        freshness_score=10
        success "  ✅ 所有npm依赖均为最新版本 (+10分)"
    elif [ "$outdated_count" -le 5 ] 2>/dev/null; then
        freshness_score=7
        warn "  ⚠️  发现 $outdated_count 个过时依赖 (+7分)"
        echo "$outdated_output" | jq -r 'to_entries[] | "     - \(.key): \(.value.current) → \(.value.latest)"' 2>/dev/null | head -5
    elif [ "$outdated_count" -le 15 ] 2>/dev/null; then
        freshness_score=4
        warn "  ⚠️  发现 $outdated_count 个过时依赖 (+4分)"
    else
        freshness_score=2
        error "  ❌ 发现 $outdated_count 个过时依赖，严重滞后 (+2分)"
    fi
    
    total_score=$((total_score + freshness_score))
    echo ""
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 2. 检测安全漏洞 (10分)
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo "🔍 [2/3] 检测npm安全漏洞..."
    
    local audit_output=$(npm audit --json 2>/dev/null || echo '{"metadata":{"vulnerabilities":{"total":0}}}')
    local total_vulnerabilities=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.total // 0' 2>/dev/null || echo "0")
    local critical_vulnerabilities=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")
    local high_vulnerabilities=$(echo "$audit_output" | jq -r '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo "0")
    
    # 清理换行符和空格
    total_vulnerabilities=$(echo "$total_vulnerabilities" | tr -d '\n' | tr -d ' ')
    critical_vulnerabilities=$(echo "$critical_vulnerabilities" | tr -d '\n' | tr -d ' ')
    high_vulnerabilities=$(echo "$high_vulnerabilities" | tr -d '\n' | tr -d ' ')
    
    local security_score=0
    if [ "$total_vulnerabilities" -eq 0 ] 2>/dev/null; then
        security_score=10
        success "  ✅ 未发现安全漏洞 (+10分)"
    elif [ "$critical_vulnerabilities" -eq 0 ] 2>/dev/null && [ "$high_vulnerabilities" -eq 0 ] 2>/dev/null; then
        security_score=8
        warn "  ⚠️  发现 $total_vulnerabilities 个低危漏洞 (+8分)"
    elif [ "$critical_vulnerabilities" -eq 0 ] 2>/dev/null; then
        security_score=5
        warn "  ⚠️  发现 $high_vulnerabilities 个高危漏洞 (+5分)"
    else
        security_score=2
        error "  ❌ 发现 $critical_vulnerabilities 个严重漏洞 (+2分)"
    fi
    
    total_score=$((total_score + security_score))
    cd - > /dev/null
    echo ""
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 3. 生成评分和建议
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 外部依赖管理评分: $total_score/$max_score"
    echo ""
    
    # 评级
    if [ $total_score -ge 19 ]; then
        echo "🎉 评级: 卓越 ⭐⭐⭐⭐⭐ (95-100分)"
    elif [ $total_score -ge 16 ]; then
        echo "✅ 评级: 优秀 ⭐⭐⭐⭐ (85-94分)"
    elif [ $total_score -ge 12 ]; then
        echo "⚠️  评级: 良好 ⭐⭐⭐ (70-84分)"
    else
        echo "❌ 评级: 需改进 ⚠️ (<70分)"
    fi
    
    echo ""
    
    # 改进建议
    if [ $total_score -lt 16 ]; then
        echo "💡 改进建议:"
        if [ $freshness_score -lt 7 ]; then
            echo "  1. 更新过时的依赖: npm update"
        fi
        if [ $security_score -lt 8 ]; then
            echo "  2. 修复安全漏洞: npm audit fix"
        fi
        echo "  3. 启用自动化依赖更新: GitHub Dependabot"
        echo "  4. 定期执行: bash scripts/package/dependency-manager.sh scan"
    else
        echo "✅ 依赖管理状况良好，继续保持！"
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    return 0
}

# 生成详细依赖报告（新增功能）
generate_report() {
    log "生成依赖健康度详细报告..."
    
    local report_file="docs/architecture/dependency-health-report-$(date +%Y%m%d).md"
    
    echo "# SmartAbp 依赖健康度报告" > "$report_file"
    echo "" >> "$report_file"
    echo "**生成时间**: $(date '+%Y年%m月%d日 %H:%M:%S')" >> "$report_file"
    echo "**报告类型**: 外部依赖管理评估" >> "$report_file"
    echo "" >> "$report_file"
    
    # 执行扫描并捕获输出
    local scan_output=$(scan_dependencies 2>&1)
    
    echo "## 📊 评估结果" >> "$report_file"
    echo "" >> "$report_file"
    echo '```' >> "$report_file"
    echo "$scan_output" >> "$report_file"
    echo '```' >> "$report_file"
    echo "" >> "$report_file"
    
    # 添加详细的过时依赖列表
    cd "$FRONTEND_DIR"
    local outdated_json=$(npm outdated --json 2>/dev/null || echo "{}")
    local outdated_length=$(echo "$outdated_json" | jq -r 'length' 2>/dev/null || echo "0")
    outdated_length=$(echo "$outdated_length" | tr -d '\n' | tr -d ' ')
    
    if [ "$outdated_length" -gt 0 ] 2>/dev/null; then
        echo "## 📋 过时依赖详情" >> "$report_file"
        echo "" >> "$report_file"
        echo "| 包名 | 当前版本 | 期望版本 | 最新版本 |" >> "$report_file"
        echo "|------|---------|---------|---------|" >> "$report_file"
        echo "$outdated_json" | jq -r 'to_entries[] | "| \(.key) | \(.value.current) | \(.value.wanted) | \(.value.latest) |"' >> "$report_file"
        echo "" >> "$report_file"
    fi
    
    # 添加安全漏洞详情
    local audit_json=$(npm audit --json 2>/dev/null || echo '{"metadata":{"vulnerabilities":{"total":0}}}')
    local vuln_count=$(echo "$audit_json" | jq -r '.metadata.vulnerabilities.total // 0' 2>/dev/null || echo "0")
    vuln_count=$(echo "$vuln_count" | tr -d '\n' | tr -d ' ')
    
    if [ "$vuln_count" -gt 0 ] 2>/dev/null; then
        echo "## 🔒 安全漏洞详情" >> "$report_file"
        echo "" >> "$report_file"
        echo "| 严重程度 | 数量 |" >> "$report_file"
        echo "|---------|------|" >> "$report_file"
        echo "| Critical | $(echo "$audit_json" | jq '.metadata.vulnerabilities.critical' 2>/dev/null || echo "0") |" >> "$report_file"
        echo "| High | $(echo "$audit_json" | jq '.metadata.vulnerabilities.high' 2>/dev/null || echo "0") |" >> "$report_file"
        echo "| Moderate | $(echo "$audit_json" | jq '.metadata.vulnerabilities.moderate' 2>/dev/null || echo "0") |" >> "$report_file"
        echo "| Low | $(echo "$audit_json" | jq '.metadata.vulnerabilities.low' 2>/dev/null || echo "0") |" >> "$report_file"
        echo "" >> "$report_file"
    fi
    
    cd - > /dev/null
    
    echo "## 💡 改进建议" >> "$report_file"
    echo "" >> "$report_file"
    echo "1. **启用GitHub Dependabot**: 自动检测和创建依赖更新PR" >> "$report_file"
    echo "2. **定期执行扫描**: 建议每周执行一次依赖健康度扫描" >> "$report_file"
    echo "3. **及时更新依赖**: 优先更新有安全漏洞的依赖" >> "$report_file"
    echo "4. **版本锁定策略**: 对关键依赖使用锁定策略，防止意外升级" >> "$report_file"
    echo "" >> "$report_file"
    
    success "报告已生成: $report_file"
}

# 检查过时依赖（新增功能）
check_outdated() {
    log "检查过时的依赖..."
    
    cd "$FRONTEND_DIR"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 npm过时依赖检查"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    npm outdated
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd - > /dev/null
}

# 安全漏洞扫描（新增功能）
security_scan() {
    log "执行安全漏洞扫描..."
    
    cd "$FRONTEND_DIR"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔒 npm安全漏洞扫描"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    npm audit
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "💡 修复建议:"
    echo "  • 自动修复: npm audit fix"
    echo "  • 强制修复: npm audit fix --force"
    echo "  • 仅查看: npm audit --json"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd - > /dev/null
}

# 显示依赖关系图
show_dependency_graph() {
    log "生成依赖关系图..."
    
    echo ""
    echo "🌐 SmartAbp 包依赖关系图:"
    echo "========================================"
    echo ""
    echo "  ┌─────────────────┐"
    echo "  │  lowcode-shared │ ← 基础共享库"
    echo "  └─────────────────┘"
    echo "           ↑"
    echo "    ┌──────┴──────┐"
    echo "    │             │"
    echo "  ┌─────────────┐ ┌─────────────┐"
    echo "  │ lowcode-api │ │lowcode-tools│ ← 中间层"
    echo "  └─────────────┘ └─────────────┘"
    echo "           ↑             ↑"
    echo "    ┌──────┴──────┬──────┘"
    echo "    │             │"
    echo "  ┌─────────────┐ ┌──────────────────┐"
    echo "  │lowcode-core │ │ lowcode-designer │ ← 应用层"
    echo "  └─────────────┘ └──────────────────┘"
    echo ""
    echo "📋 依赖原则:"
    echo "• lowcode-shared: 无依赖，被所有包依赖"
    echo "• lowcode-api/tools: 仅依赖 lowcode-shared"
    echo "• lowcode-core/designer: 可依赖下层包"
    echo "• 严禁循环依赖和逆向依赖"
}

# 主函数
main() {
    local command=${1:-check}
    local fix_mode=false
    local dry_run=false
    
    # 解析参数
    shift || true
    while [[ $# -gt 0 ]]; do
        case $1 in
            --fix)
                fix_mode=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查依赖工具
    if ! command -v jq &> /dev/null; then
        error "需要安装 jq 工具: brew install jq"
        exit 1
    fi
    
    case $command in
        check)
            check_dependencies
            ;;
        sync)
            sync_versions $fix_mode
            ;;
        install)
            install_dependencies
            ;;
        update)
            log "更新依赖..."
            sync_versions $fix_mode
            install_dependencies
            ;;
        validate)
            validate_dependencies
            ;;
        graph)
            show_dependency_graph
            ;;
        scan)
            scan_dependencies
            ;;
        report)
            generate_report
            ;;
        outdated)
            check_outdated
            ;;
        security)
            security_scan
            ;;
        *)
            error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
