#!/bin/bash
# SmartAbp 智能合并脚本 - 无损迁移第二阶段

echo "🧠 SmartAbp 智能合并系统启动..."
echo "第二阶段：智能合并（Intelligent Merge）"

MIGRATION_DIR=$(ls -td docs/migration-* | head -1)
echo "📁 使用迁移目录: $MIGRATION_DIR"

# 创建合并工作区
mkdir -p "$MIGRATION_DIR/merge-workspace"
mkdir -p "$MIGRATION_DIR/merge-workspace/src-versions"
mkdir -p "$MIGRATION_DIR/merge-workspace/packages-versions"
mkdir -p "$MIGRATION_DIR/merge-workspace/merged-versions"

echo ""
echo "🔍 第一步：完全相同组件处理..."

# 处理完全相同的组件（可以安全删除src版本）
IDENTICAL_COMPONENTS=(
    "AdvancedEntityRelationshipDesigner.vue"
    "AdvancedFieldTypeDesigner.vue"
    "ComponentPropertyPanel.vue"
)

for component in "${IDENTICAL_COMPONENTS[@]}"; do
    echo "📋 处理完全相同组件: $component"

    # 备份src版本
    src_path=$(find src/SmartAbp.Vue/src -name "$component" | head -1)
    if [ -n "$src_path" ]; then
        cp "$src_path" "$MIGRATION_DIR/merge-workspace/src-versions/"
        echo "  ✅ 已备份src版本: $src_path"
    fi

    # 备份packages版本
    pkg_path=$(find src/SmartAbp.Vue/packages -name "$component" | head -1)
    if [ -n "$pkg_path" ]; then
        cp "$pkg_path" "$MIGRATION_DIR/merge-workspace/packages-versions/"
        echo "  ✅ 已备份packages版本: $pkg_path"
    fi

    # 验证是否真的相同
    if [ -n "$src_path" ] && [ -n "$pkg_path" ]; then
        if diff -q "$src_path" "$pkg_path" > /dev/null; then
            echo "  ✅ 确认完全相同，可安全删除src版本"
            echo "$component: SAFE_TO_DELETE_SRC" >> "$MIGRATION_DIR/merge-workspace/merge-decisions.txt"
        else
            echo "  ⚠️ 发现差异，需要详细分析"
            echo "$component: NEED_ANALYSIS" >> "$MIGRATION_DIR/merge-workspace/merge-decisions.txt"
        fi
    fi
done

echo ""
echo "🔍 第二步：功能差异组件分析..."

# 分析DesignView.vue的4行差异
echo "📊 分析DesignView.vue差异..."
src_design="src/SmartAbp.Vue/src/views/lowcode/DesignView.vue"
pkg_design="src/SmartAbp.Vue/packages/lowcode-designer/src/views/DesignView.vue"

if [ -f "$src_design" ] && [ -f "$pkg_design" ]; then
    echo "  📈 src版本: $(wc -l < "$src_design") 行"
    echo "  📈 packages版本: $(wc -l < "$pkg_design") 行"

    # 生成差异报告
    diff -u "$src_design" "$pkg_design" > "$MIGRATION_DIR/merge-workspace/DesignView-diff.txt" 2>/dev/null || true

    if [ -s "$MIGRATION_DIR/merge-workspace/DesignView-diff.txt" ]; then
        echo "  📄 差异报告已生成: DesignView-diff.txt"
        echo "DesignView.vue: HAS_DIFFERENCES" >> "$MIGRATION_DIR/merge-workspace/merge-decisions.txt"
    else
        echo "  ✅ 实际上完全相同"
        echo "DesignView.vue: IDENTICAL" >> "$MIGRATION_DIR/merge-workspace/merge-decisions.txt"
    fi
fi

echo ""
echo "📋 智能合并分析完成！"
echo "📁 合并工作区: $MIGRATION_DIR/merge-workspace"
echo "📊 合并决策: $MIGRATION_DIR/merge-workspace/merge-decisions.txt"
echo ""
echo "🎯 下一步: 查看合并决策并执行安全迁移"
