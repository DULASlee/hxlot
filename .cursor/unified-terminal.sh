#!/bin/bash
# SmartAbp 统一终端配置 - Bash版本
# 基于 .cursor/env-vars.json 配置，确保与PowerShell完全一致

# 读取统一环境配置
ENV_CONFIG_FILE=".cursor/env-vars.json"

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
    # 手动解析 (fallback)
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
fi

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

echo "✅ SmartAbp 统一Bash终端配置已加载"
