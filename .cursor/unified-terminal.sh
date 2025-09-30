#!/bin/bash
# SmartAbp 统一终端配置 - Bash版本
# 基于 .cursor/env-vars.json 配置，确保与PowerShell完全一致
# 版本: v2.1
# 更新日期: 2025-09-30

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 读取统一环境配置
ENV_CONFIG_FILE="$SCRIPT_DIR/env-vars.json"

if [ ! -f "$ENV_CONFIG_FILE" ]; then
    echo "⚠️ 警告: 未找到环境配置文件 $ENV_CONFIG_FILE"
    echo "🔄 使用默认配置..."
fi

if [ -f "$ENV_CONFIG_FILE" ]; then
  # 从JSON读取配置 (兼容无jq环境)
  if command -v jq >/dev/null 2>&1; then
    # 使用jq解析JSON
    export LANG=$(jq -r '.encoding.LANG' "$ENV_CONFIG_FILE")
    export LC_ALL=$(jq -r '.encoding.LC_ALL' "$ENV_CONFIG_FILE")
    export LESSCHARSET=$(jq -r '.encoding.LESSCHARSET' "$ENV_CONFIG_FILE")
    export TERM=$(jq -r '.encoding.TERM' "$ENV_CONFIG_FILE")
    
    export PAGER=$(jq -r '.pagers.PAGER' "$ENV_CONFIG_FILE")
    export MANPAGER=$(jq -r '.pagers.MANPAGER' "$ENV_CONFIG_FILE")
    export LESS=$(jq -r '.pagers.LESS' "$ENV_CONFIG_FILE")
    export SYSTEMD_PAGER=$(jq -r '.pagers.SYSTEMD_PAGER' "$ENV_CONFIG_FILE")
    export GIT_PAGER=$(jq -r '.pagers.GIT_PAGER' "$ENV_CONFIG_FILE")
    
    export MSYS_NO_PATHCONV=$(jq -r '.msys.MSYS_NO_PATHCONV' "$ENV_CONFIG_FILE")
    export MSYS2_ARG_CONV_EXCL=$(jq -r '.msys.MSYS2_ARG_CONV_EXCL' "$ENV_CONFIG_FILE")
    
    HISTSIZE=$(jq -r '.terminal.maxHistoryCount' "$ENV_CONFIG_FILE")
    export HISTSIZE
    export HISTFILESIZE=$((HISTSIZE * 2))
  else
    # 手动解析 (fallback - 当jq不可用时)
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

# 统一别名
alias ll='ls -la'
alias la='ls -la'
alias l='ls -CF'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'

# Git 统一别名
alias gs='git status --short'
alias gl='git log --oneline --graph --decorate --all -10'
alias gd='git --no-pager diff'
alias gb='git --no-pager branch'

# dotnet 统一别名
alias dnr='dotnet run'
alias dnb='dotnet build'
alias dnt='dotnet test'

# SmartAbp 专用别名 (符合架构铁律-质量门禁要求)
alias smartabp-sync='bash scripts/git/git-safe-sync.sh --non-interactive --auto-commit'
alias smartabp-check='bash scripts/ci-quality-check.sh'
alias smartabp-dev='bash scripts/dev/start-dev.sh 2>/dev/null || powershell scripts/dev/start-dev.ps1'

# 快速导航别名
alias smartabp-vue='cd src/SmartAbp.Vue'
alias smartabp-packages='cd src/SmartAbp.Vue/packages'
alias smartabp-backend='cd src/SmartAbp.Application'

# 质量检查别名
alias smartabp-lint='cd src/SmartAbp.Vue && npm run lint'
alias smartabp-type='cd src/SmartAbp.Vue && npm run type-check'
alias smartabp-build='cd src/SmartAbp.Vue && npm run build'

# 显示加载成功消息
echo ""
echo "✅ SmartAbp 统一Bash终端配置已加载 (v2.1)"
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
