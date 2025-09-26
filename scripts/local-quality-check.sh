#!/bin/bash
# SmartAbp 本地质量检查脚本
# 开发者在提交前可手动执行的完整质量检查

echo "🏗️ SmartAbp 本地质量检查开始..."
echo "模拟CI/CD环境的完整质量检查"

# 检查是否在项目根目录
if [ ! -f ".cursorrules" ]; then
    echo "❌ 请在项目根目录执行此脚本"
    exit 1
fi

# 执行四重质量检查
echo ""
echo "🚨 执行四重质量检查门禁..."

# 调用CI质量检查脚本
bash scripts/ci-quality-check.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 本地质量检查全部通过！"
    echo "💡 建议：现在可以安全提交代码"
    echo "🚀 执行：git add . && git commit -m \"your message\""
    echo "或使用：bash scripts/git-safe-sync.sh --non-interactive --auto-commit"
else
    echo ""
    echo "❌ 本地质量检查失败！"
    echo "💡 建议：请修复所有问题后重新运行检查"
    echo "📚 参考：查看 .cursor/rules/ 下的相关规则文件"
    exit 1
fi
