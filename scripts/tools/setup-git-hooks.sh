#!/bin/bash
# SmartAbp Git Hooks 安装脚本

echo "🔧 SmartAbp Git Hooks 安装程序"
echo "安装企业级质量门禁Git钩子"

# 检查是否在项目根目录
if [ ! -f ".cursorrules" ]; then
    echo "❌ 请在项目根目录执行此脚本"
    exit 1
fi

# 启用Git钩子
echo ""
echo "🔥 启用Git Hooks..."

# 启用pre-commit钩子
if [ -f ".git/hooks/pre-commit.disabled" ]; then
    mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
    echo "✅ 启用 pre-commit 钩子"
else
    echo "⚠️ pre-commit 钩子已启用或不存在"
fi

# 确保所有钩子有执行权限
chmod +x .git/hooks/pre-commit 2>/dev/null
chmod +x .git/hooks/pre-push 2>/dev/null  
chmod +x .git/hooks/commit-msg 2>/dev/null

echo ""
echo "📋 已安装的Git钩子："
ls -la .git/hooks/ | grep -v sample | grep -v disabled

echo ""
echo "🎯 Git钩子功能："
echo "   pre-commit  : 提交前四重质量检查（架构+去重+类型+编译）"
echo "   pre-push    : 推送前最终安全检查（保护main分支）"
echo "   commit-msg  : 提交消息格式验证（Conventional Commits）"

echo ""
echo "🚨 重要提醒："
echo "   Git钩子已启用，所有提交都将强制执行质量检查！"
echo "   如需修复架构违规，请参考 .cursor/rules/3、架构整洁铁律.mdc"
echo "   如需修复代码重复，请参考 .cursor/rules/2、增量开发与代码去重铁律.mdc"

echo ""
echo "✅ Git Hooks 安装完成！"
