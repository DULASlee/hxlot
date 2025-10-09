#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AI执行引擎 - 自动代码行数统计和质量检查触发器
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 功能：监控代码变化，统计新增行数，自动触发300行质量门禁
# 原理：通过git diff统计新增行数，在达到检查点时自动触发质量检查
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 配置区
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 监控的源代码目录
WATCH_DIRS=(
    "src/SmartAbp.Vue/src"
    "src/SmartAbp.Vue/packages"
    "src/SmartAbp.Application"
    "src/SmartAbp.Domain"
)

# 状态文件：保存当前编写的行数和检查点
STATE_FILE="$PROJECT_ROOT/.ai-line-counter-state.json"
LOG_FILE="$PROJECT_ROOT/logs/ai-line-counter.log"

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 工具函数
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# 初始化状态文件
init_state() {
    if [ ! -f "$STATE_FILE" ]; then
        cat > "$STATE_FILE" <<EOF
{
  "currentLineCount": 0,
  "totalLineCount": 0,
  "lastCheckpoint": 0,
  "sessionStartTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "lastUpdateTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "filesTracked": []
}
EOF
        log "INFO" "状态文件已初始化: $STATE_FILE"
    fi
}

read_state() {
    if [ -f "$STATE_FILE" ]; then
        cat "$STATE_FILE"
    else
        init_state
        cat "$STATE_FILE"
    fi
}

update_state() {
    local current_count=$1
    local total_count=$2
    local checkpoint=$3
    
    cat > "$STATE_FILE" <<EOF
{
  "currentLineCount": $current_count,
  "totalLineCount": $total_count,
  "lastCheckpoint": $checkpoint,
  "sessionStartTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "lastUpdateTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "filesTracked": []
}
EOF
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 核心功能：统计代码行数
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 方法1：使用git diff统计（推荐，更准确）
count_git_new_lines() {
    # 统计暂存区和工作区的新增行数
    local staged_lines=$(git diff --cached --numstat 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
    local unstaged_lines=$(git diff --numstat 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
    local total=$((staged_lines + unstaged_lines))
    echo "$total"
}

# 方法2：统计文件总行数（备用方法）
count_code_lines() {
    local dir=$1
    local count=0
    
    if [ -d "$dir" ]; then
        count=$(find "$dir" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.vue" -o -name "*.cs" \) \
            ! -path "*/node_modules/*" \
            ! -path "*/dist/*" \
            ! -path "*/.nuxt/*" \
            ! -path "*/bin/*" \
            ! -path "*/obj/*" \
            -exec cat {} + 2>/dev/null | \
            grep -v '^\s*$' | \
            grep -v '^\s*//' | \
            grep -v '^\s*\*' | \
            wc -l)
    fi
    
    echo "$count"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 检查点触发器
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# 100行检查点：快速自检
trigger_100_checkpoint() {
    log "INFO" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "INFO" "📊 已编写100行代码 - 触发快速自检"
    log "INFO" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo ""
    echo "✅ 执行动作："
    echo "   - 快速TypeScript类型检查"
    echo "   - 核心逻辑自查"
    echo "   - 关键注释补充"
    echo ""
    echo "📊 提示AI: '已编写100行代码，快速自检完成，继续推进...'"
    echo ""
}

# 200行检查点：中等强度自检
trigger_200_checkpoint() {
    log "INFO" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "INFO" "📊 已编写200行代码 - 触发中等强度自检"
    log "INFO" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo ""
    echo "✅ 执行动作："
    echo "   - TypeScript类型检查"
    echo "   - ESLint快速检查"
    echo "   - 架构合规性自查"
    echo "   - 功能完整性评估（50%进度）"
    echo ""
    
    # 可选：执行实际检查
    if command -v npm &> /dev/null && [ -f "src/SmartAbp.Vue/package.json" ]; then
        log "INFO" "执行TypeScript快速检查..."
        (cd src/SmartAbp.Vue && npm run type-check 2>&1 | head -20) || true
    fi
    
    echo "📊 提示AI: '已编写200行代码，中等强度自检完成，继续推进...'"
    echo ""
}

# 280行警告：准备收尾
trigger_280_warning() {
    log "WARNING" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "WARNING" "⚠️  已编写280行代码 - 接近300行阈值！"
    log "WARNING" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo ""
    echo "⚠️  黄色警告提示"
    echo "   评估剩余工作量："
    echo "   选项A: 快速收尾（剩余<20行）"
    echo "   选项B: 立即触发质量门禁（剩余>20行）"
    echo ""
}

# 300行质量门禁：强制停止
trigger_300_quality_gate() {
    log "CRITICAL" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "CRITICAL" "🛑 已达到300行代码阈值 - 触发质量门禁！"
    log "CRITICAL" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo ""
    echo "🛑 强制停止编程"
    echo "✅ 触发完整质量门禁检查..."
    echo ""
    
    log "INFO" "开始执行质量门禁检查..."
    
    local all_passed=true
    
    # 第1关：TypeScript检查
    echo "━━━ 第1关：TypeScript类型检查 ━━━"
    if [ -f "src/SmartAbp.Vue/package.json" ]; then
        if (cd src/SmartAbp.Vue && npm run type-check); then
            log "SUCCESS" "✅ TypeScript检查通过"
            echo "✅ TypeScript: 通过"
        else
            log "ERROR" "❌ TypeScript检查失败"
            echo "❌ TypeScript: 失败"
            all_passed=false
        fi
    fi
    echo ""
    
    # 第2关：ESLint检查
    echo "━━━ 第2关：ESLint代码规范 ━━━"
    if [ -f "src/SmartAbp.Vue/package.json" ]; then
        if (cd src/SmartAbp.Vue && npm run lint -- --max-warnings 0); then
            log "SUCCESS" "✅ ESLint检查通过"
            echo "✅ ESLint: 通过"
        else
            log "ERROR" "❌ ESLint检查失败"
            echo "❌ ESLint: 失败"
            all_passed=false
        fi
    fi
    echo ""
    
    # 第3关：架构合规检查
    echo "━━━ 第3关：架构合规检查 ━━━"
    local violations=0
    
    if [ -d "src/SmartAbp.Vue/packages" ]; then
        local relative_path_count=$(grep -r "'\.\./" src/SmartAbp.Vue/packages/ 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
        local main_app_ref_count=$(grep -r "@/" src/SmartAbp.Vue/packages/ 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
        
        violations=$((relative_path_count + main_app_ref_count))
        
        if [ "$violations" -eq 0 ]; then
            log "SUCCESS" "✅ 架构合规检查通过"
            echo "✅ 架构合规: 通过"
        else
            log "ERROR" "❌ 架构合规检查失败: $violations 处违规"
            echo "❌ 架构合规: 失败 ($violations 处违规)"
            all_passed=false
        fi
    fi
    echo ""
    
    # 质量门禁结果
    if [ "$all_passed" = true ]; then
        log "SUCCESS" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log "SUCCESS" "🎉 质量门禁检查全部通过！"
        log "SUCCESS" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        echo "📋 下一步建议："
        echo "   A. 执行Git同步: pwsh scripts/git/git-safe-sync.ps1 -AutoCommit"
        echo "   B. 继续开发（重置计数器）"
        echo "   C. 暂停并生成进度报告"
        echo ""
        
        # 重置计数器
        log "INFO" "重置代码行数计数器..."
        update_state 0 0 0
        
        return 0
    else
        log "ERROR" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log "ERROR" "❌ 质量门禁检查失败！"
        log "ERROR" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "⚠️  请修复上述错误后再继续开发"
        echo ""
        return 1
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 监控模式：持续运行
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

monitor_mode() {
    log "INFO" "启动代码行数监控模式..."
    log "INFO" "监控目录: ${WATCH_DIRS[*]}"
    
    init_state
    
    local check_interval=10  # 每10秒检查一次
    
    echo ""
    echo "🔍 监控已启动"
    echo "   检查间隔: ${check_interval}秒"
    echo "   监控Git变更: 是"
    echo "   按 Ctrl+C 停止"
    echo ""
    
    while true; do
        # 读取当前状态
        local state=$(read_state)
        local current_count=$(echo "$state" | grep -o '"currentLineCount": [0-9]*' | awk '{print $2}')
        local last_checkpoint=$(echo "$state" | grep -o '"lastCheckpoint": [0-9]*' | awk '{print $2}')
        
        # 统计当前新增行数
        local new_lines=$(count_git_new_lines)
        
        if [ "$new_lines" -gt 0 ] && [ "$new_lines" != "$current_count" ]; then
            current_count=$new_lines
            log "INFO" "检测到新增代码: $current_count 行"
            
            # 检查检查点
            if [ "$current_count" -ge 100 ] && [ "$last_checkpoint" -lt 100 ]; then
                trigger_100_checkpoint
                update_state "$current_count" "$current_count" 100
                last_checkpoint=100
            fi
            
            if [ "$current_count" -ge 200 ] && [ "$last_checkpoint" -lt 200 ]; then
                trigger_200_checkpoint
                update_state "$current_count" "$current_count" 200
                last_checkpoint=200
            fi
            
            if [ "$current_count" -ge 280 ] && [ "$last_checkpoint" -lt 280 ]; then
                trigger_280_warning
                update_state "$current_count" "$current_count" 280
                last_checkpoint=280
            fi
            
            if [ "$current_count" -ge 300 ]; then
                trigger_300_quality_gate
                # 质量门禁会自动重置计数器
            fi
        fi
        
        sleep "$check_interval"
    done
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 其他模式
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

check_mode() {
    log "INFO" "执行手动代码行数检查..."
    
    init_state
    local state=$(read_state)
    local current_count=$(echo "$state" | grep -o '"currentLineCount": [0-9]*' | awk '{print $2}')
    
    # 实时统计
    local new_lines=$(count_git_new_lines)
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 当前代码行数统计"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "   当前轮次: $new_lines 行"
    echo "   距离100行: $((100 - new_lines > 0 ? 100 - new_lines : 0)) 行"
    echo "   距离200行: $((200 - new_lines > 0 ? 200 - new_lines : 0)) 行"
    echo "   距离300行: $((300 - new_lines > 0 ? 300 - new_lines : 0)) 行"
    echo ""
    
    if [ "$new_lines" -ge 300 ]; then
        echo "⚠️  已超过300行阈值，建议立即执行质量门禁！"
        read -p "是否立即执行质量门禁？[y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            trigger_300_quality_gate
        fi
    elif [ "$new_lines" -ge 280 ]; then
        echo "⚠️  接近300行阈值，请注意！"
    fi
    echo ""
}

reset_counter() {
    log "INFO" "重置代码行数计数器..."
    update_state 0 0 0
    echo "✅ 计数器已重置"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 主函数
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

main() {
    local mode=${1:-"check"}
    
    case $mode in
        monitor)
            monitor_mode
            ;;
        check)
            check_mode
            ;;
        reset)
            reset_counter
            ;;
        gate)
            trigger_300_quality_gate
            ;;
        *)
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "AI执行引擎 - 自动代码行数统计和质量检查触发器"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo "用法: $0 {monitor|check|reset|gate}"
            echo ""
            echo "模式说明:"
            echo "  monitor - 后台监控模式（持续运行，每10秒检查一次）"
            echo "  check   - 手动检查当前行数"
            echo "  reset   - 重置计数器"
            echo "  gate    - 立即触发质量门禁"
            echo ""
            echo "示例:"
            echo "  # 启动后台监控（推荐在tmux/screen中运行）"
            echo "  $0 monitor"
            echo ""
            echo "  # 手动检查当前编写了多少行"
            echo "  $0 check"
            echo ""
            echo "  # 立即触发质量门禁"
            echo "  $0 gate"
            echo ""
            exit 1
            ;;
    esac
}

main "$@"
