#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# AI执行引擎 - 自动规则加载提醒器
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 功能：每30分钟提醒AI加载最新规则文件
# 原理：定时器 + 状态管理 + 彩色提醒界面
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 配置区
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REMINDER_INTERVAL=1800  # 30分钟 = 1800秒
STATE_FILE="$PROJECT_ROOT/.ai-rule-reminder-state.json"
LOG_FILE="$PROJECT_ROOT/logs/ai-rule-reminder.log"

# 规则文件列表（按优先级排序）
RULE_FILES=(
    ".cursor/rules/00_架构铁律_最高优先级.mdc"
    ".cursor/rules/00_执行引擎.mdc"
    ".cursor/rules/00_核心原则.mdc"
    ".cursor/rules/01_code_standards.mdc"
    ".cursor/rules/02_development_process.mdc"
    ".cursor/rules/03_quality_guardian.mdc"
    ".cursor/rules/04_code_quality_prohibitions.mdc"
    "docs/项目开发规范总览.md"
)

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 颜色定义
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 工具函数
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

print_header() {
    echo -e "${MAGENTA}${BOLD}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 状态管理
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

init_state() {
    if [ ! -f "$STATE_FILE" ]; then
        cat > "$STATE_FILE" <<EOF
{
  "lastReminderTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "reminderCount": 0,
  "sessionStartTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
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
    local count=$1
    cat > "$STATE_FILE" <<EOF
{
  "lastReminderTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "reminderCount": $count,
  "sessionStartTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 核心功能
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

check_rule_files() {
    local missing_files=()
    local total_files=${#RULE_FILES[@]}
    local existing_files=0
    
    for rule_file in "${RULE_FILES[@]}"; do
        if [ -f "$PROJECT_ROOT/$rule_file" ]; then
            ((existing_files++))
        else
            missing_files+=("$rule_file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        print_warning "发现 ${#missing_files[@]} 个规则文件缺失:"
        for file in "${missing_files[@]}"; do
            echo "   ❌ $file"
        done
        echo ""
    fi
    
    echo "   📊 规则文件状态: $existing_files/$total_files 存在"
}

generate_load_commands() {
    echo ""
    print_header "📋 AI规则加载命令"
    echo ""
    
    echo -e "${CYAN}请AI执行以下命令加载规则:${NC}"
    echo ""
    
    for rule_file in "${RULE_FILES[@]}"; do
        if [ -f "$PROJECT_ROOT/$rule_file" ]; then
            echo "  read_file(\"$rule_file\")"
        fi
    done
    
    echo ""
}

show_reminder() {
    local count=$1
    
    clear
    
    print_header "⏰ AI规则加载提醒 #$count"
    
    echo ""
    print_info "当前时间: $(date '+%Y-%m-%d %H:%M:%S')"
    print_info "提醒次数: $count"
    echo ""
    
    print_warning "📢 重要提醒: AI需要重新加载规则文件！"
    echo ""
    
    echo -e "${YELLOW}为什么需要重新加载？${NC}"
    echo "   1. AI无法跨会话保持状态"
    echo "   2. 规则文件可能已更新"
    echo "   3. 确保AI始终遵循最新规范"
    echo ""
    
    check_rule_files
    
    generate_load_commands
    
    print_header "🔥 强制启动声明模板"
    echo ""
    echo -e "${GREEN}AI必须在聊天响应开头输出:${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔥 AI编程铁律执行引擎 v10.0 + 架构三大铁律 已启动！"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    print_info "下次提醒: 30分钟后"
    echo ""
    
    log "INFO" "已显示第 $count 次提醒"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 监控模式：持续运行
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

monitor_mode() {
    log "INFO" "启动规则加载提醒监控模式..."
    log "INFO" "提醒间隔: $REMINDER_INTERVAL 秒 (30分钟)"
    
    init_state
    
    local state=$(read_state)
    local count=$(echo "$state" | grep -o '"reminderCount": [0-9]*' | awk '{print $2}')
    
    # 立即显示一次提醒
    ((count++))
    show_reminder "$count"
    update_state "$count"
    
    # 持续监控
    while true; do
        sleep "$REMINDER_INTERVAL"
        
        ((count++))
        show_reminder "$count"
        update_state "$count"
        
        # 发送系统通知（如果支持）
        if command -v osascript &> /dev/null; then
            # macOS通知
            osascript -e "display notification \"AI需要重新加载规则文件\" with title \"AI规则提醒\" sound name \"Glass\"" 2>/dev/null || true
        elif command -v notify-send &> /dev/null; then
            # Linux通知
            notify-send "AI规则提醒" "AI需要重新加载规则文件" 2>/dev/null || true
        fi
    done
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 其他模式
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

now_mode() {
    init_state
    local state=$(read_state)
    local count=$(echo "$state" | grep -o '"reminderCount": [0-9]*' | awk '{print $2}')
    ((count++))
    show_reminder "$count"
    update_state "$count"
}

status_mode() {
    if [ ! -f "$STATE_FILE" ]; then
        print_info "尚未启动提醒系统"
        return
    fi
    
    local state=$(read_state)
    local last_time=$(echo "$state" | grep -o '"lastReminderTime": "[^"]*"' | cut -d'"' -f4)
    local count=$(echo "$state" | grep -o '"reminderCount": [0-9]*' | awk '{print $2}')
    
    echo ""
    print_header "📊 规则提醒系统状态"
    echo ""
    
    print_info "上次提醒时间: $last_time"
    print_info "累计提醒次数: $count"
    print_info "提醒间隔: 30分钟"
    echo ""
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 主函数
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

main() {
    local mode=${1:-"now"}
    
    case $mode in
        monitor)
            monitor_mode
            ;;
        now)
            now_mode
            ;;
        status)
            status_mode
            ;;
        *)
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "AI执行引擎 - 自动规则加载提醒器"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo "用法: $0 {monitor|now|status}"
            echo ""
            echo "模式说明:"
            echo "  monitor - 后台监控模式（每30分钟自动提醒）"
            echo "  now     - 立即显示提醒"
            echo "  status  - 查看提醒系统状态"
            echo ""
            echo "示例:"
            echo "  # 启动后台监控（推荐在tmux/screen中运行）"
            echo "  $0 monitor"
            echo ""
            echo "  # 立即提醒AI加载规则"
            echo "  $0 now"
            echo ""
            exit 1
            ;;
    esac
}

main "$@"
