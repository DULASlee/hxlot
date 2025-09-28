#!/bin/bash
# SmartAbp 统一终端配置 - Bash版本
# 基于 .cursor/env-vars.json 配置，确保与PowerShell完全一致

# 读取统一环境配置 (使用jq或手动解析)
ENV_CONFIG_FILE=".cursor/env-vars.json"

if [ -f "$ENV_CONFIG_FILE" ]; then
  # 统一编码配置
  export LANG="C.UTF-8"
  export LC_ALL="C.UTF-8"
  export LESSCHARSET="utf-8"
  export TERM="xterm-256color"

  # 统一分页器配置
  export PAGER="cat"
  export MANPAGER="cat"
  export LESS=""
  export SYSTEMD_PAGER=""
  export GIT_PAGER="cat"

  # 统一MSYS配置
  export MSYS_NO_PATHCONV="1"
  export MSYS2_ARG_CONV_EXCL="*"

  # 统一历史记录配置
  export HISTSIZE=10000
  export HISTFILESIZE=20000
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

# SmartAbp 专用别名
alias smartabp-sync='bash scripts/git-safe-sync.sh --non-interactive --auto-commit'
alias smartabp-check='bash scripts/ci-quality-check.sh'
alias smartabp-dev='bash scripts/start-dev.sh 2>/dev/null || powershell scripts/start-dev.ps1'

echo "✅ SmartAbp 统一Bash终端配置已加载"
