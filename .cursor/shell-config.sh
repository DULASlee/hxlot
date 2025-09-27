#!/bin/bash
# SmartAbp 统一Shell配置 (Bash fallback)
# 现在统一使用 .cursor/unified-terminal.sh，此文件保留兼容性

echo "⚠️ 此配置文件已废弃，请使用: source .cursor/unified-terminal.sh"
echo "🔄 自动加载统一配置..."

# 自动加载统一配置
if [ -f ".cursor/unified-terminal.sh" ]; then
    source .cursor/unified-terminal.sh
else
    echo "❌ 统一配置文件不存在，使用备用配置"

    # 备用配置（与统一配置保持一致）
    export LANG=C.UTF-8
    export LC_ALL=C.UTF-8
    export LESSCHARSET=utf-8
    export PAGER=cat
    export MANPAGER=cat
    export LESS=""
    export GIT_PAGER=cat
    export SYSTEMD_PAGER=""
    export TERM=xterm-256color
    export HISTSIZE=10000
    export HISTFILESIZE=20000
    export MSYS_NO_PATHCONV=1
    export MSYS2_ARG_CONV_EXCL='*'
fi

# 避免分页的常用命令别名
alias ll='ls -la'
alias la='ls -la'
alias l='ls -CF'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'

# Git 别名（避免分页）
alias gs='git status --short'
alias gl='git log --oneline --graph --decorate --all -10'
alias gd='git diff --no-pager'
alias gb='git branch --no-pager'

# dotnet 命令优化
alias dnr='dotnet run'
alias dnb='dotnet build'
alias dnt='dotnet test'

echo "Cursor IDE Shell Configuration Loaded"
