#!/bin/bash
# Cursor IDE Shell Configuration
# 防止分页器卡死的配置

# 设置分页器
export PAGER=cat
export MANPAGER=cat
export LESS=""

# Git 特定配置
export GIT_PAGER=cat

# 防止 less 分页器启动
export SYSTEMD_PAGER=""

# 优化终端显示
export TERM=xterm-256color

# 设置历史记录
export HISTSIZE=10000
export HISTFILESIZE=20000

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
