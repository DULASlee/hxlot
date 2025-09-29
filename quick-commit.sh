#!/bin/bash
# 快速开发提交脚本 - 绕过所有质量检查

echo "🚀 快速开发模式提交..."

# 设置环境变量
export SKIP_GIT_HOOKS=true
export SKIP_QUALITY_CHECK=true
export DEV_MODE=true

# 添加所有更改
git add .

# 提交 (绕过hooks)
git commit --no-verify -m "${1:-feat: 快速开发提交 - $(date '+%Y-%m-%d %H:%M:%S')}"

# 推送
git push origin main

echo "✅ 快速提交完成！"
