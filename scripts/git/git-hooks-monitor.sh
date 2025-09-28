#!/bin/bash
# Git质量门禁自动监控脚本
# 基于 .cursor/rules/6、严禁修改git提交质量门禁设置.mdc

echo "��� Git质量门禁监控检查..."

check_git_hooks() {
    local hooks_ok=true
    
    # 检查pre-commit
    if [ ! -x ".git/hooks/pre-commit" ]; then
        echo "��� CRITICAL: pre-commit hook被禁用！"
        if [ -f ".git/hooks/pre-commit.disabled" ]; then
            echo "��� 自动恢复中..."
            mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
            chmod +x .git/hooks/pre-commit
            echo "✅ pre-commit已自动恢复"
        else
            hooks_ok=false
            echo "❌ pre-commit缺失，需要手动恢复"
        fi
    fi
    
    # 检查commit-msg
    if [ ! -x ".git/hooks/commit-msg" ]; then
        echo "��� CRITICAL: commit-msg hook被禁用！"
        if [ -f ".git/hooks/commit-msg.disabled" ]; then
            echo "��� 自动恢复中..."
            mv .git/hooks/commit-msg.disabled .git/hooks/commit-msg
            chmod +x .git/hooks/commit-msg  
            echo "✅ commit-msg已自动恢复"
        else
            hooks_ok=false
            echo "❌ commit-msg缺失，需要手动恢复"
        fi
    fi
    
    # 检查质量检查脚本
    if [ ! -f "scripts/ci-quality-check.sh" ]; then
        hooks_ok=false
        echo "��� CRITICAL: 质量检查脚本缺失！"
    fi
    
    if [ "$hooks_ok" = true ]; then
        echo "✅ Git质量门禁状态正常"
        return 0
    else
        echo "❌ Git质量门禁存在问题，请立即修复"
        return 1
    fi
}

# 执行检查
check_git_hooks
