#!/bin/bash
# SmartAbp 统一终端配置 - Bash版本
# 基于 .cursor/env-vars.json 配置，确保与PowerShell完全一致
# 版本: v2.2
# 更新日期: 2025-01-02

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 读取统一环境配置
ENV_CONFIG_FILE="$SCRIPT_DIR/env-vars.json"

# 检查配置文件存在性
if [ ! -f "$ENV_CONFIG_FILE" ]; then
    echo "⚠️ 警告: 未找到环境配置文件 $ENV_CONFIG_FILE"
    echo "🔄 使用默认配置..."
fi

# 检查jq依赖
JQ_AVAILABLE=false
if command -v jq >/dev/null 2>&1; then
    JQ_AVAILABLE=true
    echo "✅ jq已安装，使用JSON解析"
else
    echo "⚠️ jq未安装，使用手动解析"
fi

if [ -f "$ENV_CONFIG_FILE" ]; then
  # 从JSON读取配置 (兼容无jq环境)
  if [ "$JQ_AVAILABLE" = true ]; then
    # 使用jq解析JSON（增强错误处理）
    if ! export LANG=$(jq -r '.encoding.LANG' "$ENV_CONFIG_FILE" 2>/dev/null) || [ "$LANG" = "null" ]; then
        echo "⚠️ JSON解析失败，使用默认LANG"
        export LANG="C.UTF-8"
    fi
    
    if ! export LC_ALL=$(jq -r '.encoding.LC_ALL' "$ENV_CONFIG_FILE" 2>/dev/null) || [ "$LC_ALL" = "null" ]; then
        export LC_ALL="C.UTF-8"
    fi
    
    if ! export LESSCHARSET=$(jq -r '.encoding.LESSCHARSET' "$ENV_CONFIG_FILE" 2>/dev/null) || [ "$LESSCHARSET" = "null" ]; then
        export LESSCHARSET="utf-8"
    fi
    
    if ! export TERM=$(jq -r '.encoding.TERM' "$ENV_CONFIG_FILE" 2>/dev/null) || [ "$TERM" = "null" ]; then
        export TERM="xterm-256color"
    fi
    
    if ! export PAGER=$(jq -r '.pagers.PAGER' "$ENV_CONFIG_FILE" 2>/dev/null) || [ "$PAGER" = "null" ]; then
        export PAGER="cat"
    fi
    
    if ! export MANPAGER=$(jq -r '.pagers.MANPAGER' "$ENV_CONFIG_FILE" 2>/dev/null) || [ "$MANPAGER" = "null" ]; then
        export MANPAGER="cat"
    fi
    
    if ! export LESS=$(jq -r '.pagers.LESS' "$ENV_CONFIG_FILE" 2>/dev/null) || [ "$LESS" = "null" ]; then
        export LESS=""
    fi
    
    if ! export SYSTEMD_PAGER=$(jq -r '.pagers.SYSTEMD_PAGER' "$ENV_CONFIG_FILE" 2>/dev/null) || [ "$SYSTEMD_PAGER" = "null" ]; then
        export SYSTEMD_PAGER=""
    fi
    
    if ! export GIT_PAGER=$(jq -r '.pagers.GIT_PAGER' "$ENV_CONFIG_FILE" 2>/dev/null) || [ "$GIT_PAGER" = "null" ]; then
        export GIT_PAGER="cat"
    fi
    
    if ! export MSYS_NO_PATHCONV=$(jq -r '.msys.MSYS_NO_PATHCONV' "$ENV_CONFIG_FILE" 2>/dev/null) || [ "$MSYS_NO_PATHCONV" = "null" ]; then
        export MSYS_NO_PATHCONV="1"
    fi
    
    if ! export MSYS2_ARG_CONV_EXCL=$(jq -r '.msys.MSYS2_ARG_CONV_EXCL' "$ENV_CONFIG_FILE" 2>/dev/null) || [ "$MSYS2_ARG_CONV_EXCL" = "null" ]; then
        export MSYS2_ARG_CONV_EXCL="*"
    fi
    
    if ! HISTSIZE=$(jq -r '.terminal.maxHistoryCount' "$ENV_CONFIG_FILE" 2>/dev/null) || [ "$HISTSIZE" = "null" ]; then
        HISTSIZE=10000
    fi
    export HISTSIZE
    export HISTFILESIZE=$((HISTSIZE * 2))
    
    echo "✅ 环境配置已加载"
  else
    # 手动解析 (fallback - 当jq不可用时)
    echo "🔄 使用手动解析配置..."
    export LANG="C.UTF-8"
    export LC_ALL="C.UTF-8"
    export LESSCHARSET="utf-8"
    export TERM="xterm-256color"
    
    export PAGER="cat"
    export MANPAGER="cat"
    export LESS=""
    export SYSTEMD_PAGER=""
    export GIT_PAGER="cat"
    
    export MSYS_NO_PATHCONV="1"
    export MSYS2_ARG_CONV_EXCL="*"
    
    export HISTSIZE=10000
    export HISTFILESIZE=20000
  fi
else
  # 环境配置文件不存在时的默认配置
  echo "🔄 使用默认配置..."
  export LANG="C.UTF-8"
  export LC_ALL="C.UTF-8"
  export LESSCHARSET="utf-8"
  export TERM="xterm-256color"
  
  export PAGER="cat"
  export MANPAGER="cat"
  export LESS=""
  export SYSTEMD_PAGER=""
  export GIT_PAGER="cat"
  
  export MSYS_NO_PATHCONV="1"
  export MSYS2_ARG_CONV_EXCL="*"
  
  export HISTSIZE=10000
  export HISTFILESIZE=20000
fi

# SmartAbp 项目特定环境变量
export SMARTABP_PROJECT_ROOT="$PROJECT_ROOT"
export SMARTABP_QUALITY_THRESHOLD=95

# 统一别名（增强错误处理）
alias ll='ls -la' 2>/dev/null || echo "⚠️ ll别名设置失败"
alias la='ls -la' 2>/dev/null || echo "⚠️ la别名设置失败"
alias l='ls -CF' 2>/dev/null || echo "⚠️ l别名设置失败"
alias grep='grep --color=auto' 2>/dev/null || echo "⚠️ grep别名设置失败"
alias fgrep='fgrep --color=auto' 2>/dev/null || echo "⚠️ fgrep别名设置失败"
alias egrep='egrep --color=auto' 2>/dev/null || echo "⚠️ egrep别名设置失败"

# Git 统一别名（增强错误处理）
alias gs='git status --short' 2>/dev/null || echo "⚠️ gs别名设置失败"
alias gl='git log --oneline --graph --decorate --all -10' 2>/dev/null || echo "⚠️ gl别名设置失败"
alias gd='git --no-pager diff' 2>/dev/null || echo "⚠️ gd别名设置失败"
alias gb='git --no-pager branch' 2>/dev/null || echo "⚠️ gb别名设置失败"

# dotnet 统一别名（增强错误处理）
alias dnr='dotnet run' 2>/dev/null || echo "⚠️ dnr别名设置失败"
alias dnb='dotnet build' 2>/dev/null || echo "⚠️ dnb别名设置失败"
alias dnt='dotnet test' 2>/dev/null || echo "⚠️ dnt别名设置失败"

# SmartAbp 专用别名 (符合架构铁律-质量门禁要求)
smartabp-sync() {
    echo "🔄 检查Git同步脚本..."
    if [ -f "scripts/git/git-safe-sync.sh" ]; then
        echo "🚀 使用Bash版本同步..."
        bash scripts/git/git-safe-sync.sh --non-interactive --auto-commit
    else
        echo "❌ 未找到Git同步脚本: scripts/git/git-safe-sync.sh"
        echo "💡 可用的替代方案:"
        echo "   • git add . && git commit -m 'Auto commit' && git push"
    fi
}

smartabp-check() {
    echo "🔍 检查质量检查脚本..."
    if [ -f "scripts/quality/local-quality-check.sh" ]; then
        echo "🔍 使用Bash版本质量检查（推荐）..."
        bash scripts/quality/local-quality-check.sh
    elif [ -f "scripts/ci-quality-check.sh" ]; then
        echo "🔍 使用CI质量检查脚本..."
        bash scripts/ci-quality-check.sh
    else
        echo "📋 手动质量检查选项（符合架构铁律）："
        echo "1. cd src/SmartAbp.Vue && npm run type-check"
        echo "2. dotnet build"
        echo "3. cd src/SmartAbp.Vue && npm run lint"
        echo "4. bash scripts/quality-gate.sh"
    fi
}

smartabp-dev() {
    echo "🚀 启动SmartAbp开发环境..."
    echo "🔍 检查开发启动脚本..."
    if [ -f "scripts/dev/start-dev.sh" ]; then
        bash scripts/dev/start-dev.sh
    elif [ -f "scripts/dev/start-dev.ps1" ]; then
        echo "🔄 使用PowerShell版本..."
        powershell scripts/dev/start-dev.ps1
    else
        echo "❌ 未找到开发启动脚本"
        echo "💡 手动启动选项:"
        echo "   • cd src/SmartAbp.Vue && npm run dev"
        echo "   • dotnet run --project src/SmartAbp.Web"
    fi
}

# 快速导航别名（增强错误处理）
smartabp-vue() {
    if [ -d "src/SmartAbp.Vue" ]; then
        cd src/SmartAbp.Vue
        echo "✅ 已进入Vue项目目录"
    else
        echo "❌ Vue项目目录不存在: src/SmartAbp.Vue"
    fi
}

smartabp-packages() {
    if [ -d "src/SmartAbp.Vue/packages" ]; then
        cd src/SmartAbp.Vue/packages
        echo "✅ 已进入packages目录"
    else
        echo "❌ packages目录不存在: src/SmartAbp.Vue/packages"
    fi
}

smartabp-backend() {
    if [ -d "src/SmartAbp.Application" ]; then
        cd src/SmartAbp.Application
        echo "✅ 已进入后端应用目录"
    else
        echo "❌ 后端应用目录不存在: src/SmartAbp.Application"
    fi
}

# 质量检查别名（增强错误处理）
smartabp-lint() {
    if [ -d "src/SmartAbp.Vue" ]; then
        cd src/SmartAbp.Vue
        echo "🔍 运行ESLint检查..."
        npm run lint
        cd - >/dev/null
    else
        echo "❌ Vue项目目录不存在: src/SmartAbp.Vue"
    fi
}

smartabp-type() {
    if [ -d "src/SmartAbp.Vue" ]; then
        cd src/SmartAbp.Vue
        echo "🔍 运行TypeScript类型检查..."
        npm run type-check
        cd - >/dev/null
    else
        echo "❌ Vue项目目录不存在: src/SmartAbp.Vue"
    fi
}

smartabp-build() {
    if [ -d "src/SmartAbp.Vue" ]; then
        cd src/SmartAbp.Vue
        echo "🔨 运行前端构建..."
        npm run build
        cd - >/dev/null
    else
        echo "❌ Vue项目目录不存在: src/SmartAbp.Vue"
    fi
}

# 显示加载成功消息
echo ""
echo "✅ SmartAbp 统一Bash终端配置已加载 (v2.2)"
echo "📁 项目根目录: $SMARTABP_PROJECT_ROOT"
echo "🎯 质量阈值: $SMARTABP_QUALITY_THRESHOLD 分"
echo ""
echo "💡 可用的SmartAbp命令:"
echo "   • smartabp-sync      - Git安全同步"
echo "   • smartabp-check     - 质量检查"
echo "   • smartabp-dev       - 启动开发环境"
echo "   • smartabp-vue       - 进入Vue项目目录"
echo "   • smartabp-packages  - 进入packages目录"
echo "   • smartabp-lint      - 运行ESLint检查"
echo "   • smartabp-type      - 运行TypeScript类型检查"
echo ""
echo "🔧 配置版本: v2.2"
echo "📅 更新日期: 2025-01-02"