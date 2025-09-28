#!/bin/bash
# SmartAbp 无损迁移脚本 - 架构整洁和代码去重的生命线

echo "🏗️ SmartAbp 无损迁移系统启动..."
echo "架构整洁和代码去重 - 项目成功的必由之路！"

# 创建迁移工作目录
MIGRATION_DIR="docs/migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$MIGRATION_DIR/backups"
mkdir -p "$MIGRATION_DIR/analysis"
mkdir -p "$MIGRATION_DIR/plans"

echo "📁 迁移工作目录: $MIGRATION_DIR"

# Phase 1: 全面备份当前状态
echo ""
echo "🛡️ Phase 1: 全面备份当前状态..."

# 备份重复组件
echo "备份重复组件..."
find src/SmartAbp.Vue/src src/SmartAbp.Vue/packages -name "*.vue" | sed 's/.*\///' | sort | uniq -d > "$MIGRATION_DIR/analysis/duplicate-components.txt"

# 分析重复组件的详细信息
echo "📊 分析重复组件分布..." 
while read component; do
    echo "=== $component ===" >> "$MIGRATION_DIR/analysis/component-locations.txt"
    find src/SmartAbp.Vue/src src/SmartAbp.Vue/packages -name "$component" >> "$MIGRATION_DIR/analysis/component-locations.txt"
    echo "" >> "$MIGRATION_DIR/analysis/component-locations.txt"
done < "$MIGRATION_DIR/analysis/duplicate-components.txt"

# 备份关键文件
echo "🔄 备份关键配置文件..."
cp src/SmartAbp.Vue/src/router/index.js "$MIGRATION_DIR/backups/router-index.js.backup"
cp src/SmartAbp.Vue/src/config/menus.ts "$MIGRATION_DIR/backups/menus.ts.backup"

# Phase 2: 功能对比分析
echo ""
echo "🔍 Phase 2: 功能对比分析..."

# 对比重复组件的代码量
echo "📈 对比组件代码量..." > "$MIGRATION_DIR/analysis/component-comparison.txt"
while read component; do
    echo "=== $component 代码量对比 ===" >> "$MIGRATION_DIR/analysis/component-comparison.txt"
    find src/SmartAbp.Vue/src src/SmartAbp.Vue/packages -name "$component" -exec wc -l {} \; >> "$MIGRATION_DIR/analysis/component-comparison.txt"
    echo "" >> "$MIGRATION_DIR/analysis/component-comparison.txt"
done < "$MIGRATION_DIR/analysis/duplicate-components.txt"

# Phase 3: 引用关系分析
echo ""
echo "🔗 Phase 3: 引用关系分析..."

# 分析每个重复组件的引用关系
echo "🔍 分析组件引用关系..." > "$MIGRATION_DIR/analysis/component-references.txt"
while read component; do
    component_name=$(basename "$component" .vue)
    echo "=== $component_name 引用关系 ===" >> "$MIGRATION_DIR/analysis/component-references.txt"
    grep -r "$component_name" src/SmartAbp.Vue/src --include="*.ts" --include="*.vue" --include="*.js" >> "$MIGRATION_DIR/analysis/component-references.txt" 2>/dev/null || echo "无引用" >> "$MIGRATION_DIR/analysis/component-references.txt"
    echo "" >> "$MIGRATION_DIR/analysis/component-references.txt"
done < "$MIGRATION_DIR/analysis/duplicate-components.txt"

# Phase 4: 生成迁移计划
echo ""
echo "📋 Phase 4: 生成无损迁移计划..."

cat > "$MIGRATION_DIR/plans/migration-strategy.md" << 'EOF'
# SmartAbp 无损迁移策略

## 🎯 迁移目标
- 架构整洁：遵循黑盒原则，实现packages独立性
- 代码去重：消除重复组件，提升维护性
- 零功能丢失：确保所有辛苦实现的功能完整保留

## 📊 迁移优先级

### P0（核心功能组件）
需要极其谨慎，确保功能100%保留：
- DesignView.vue (主视图)
- EntityModelingView.vue (核心业务)
- ThemeCustomizationView.vue (用户体验)

### P1（工具组件）
相对安全，但需要功能验证：
- ErrorBoundary.vue
- GlobalLoadingOverlay.vue
- WorkspaceContainer.vue

### P2（辅助组件）
可以较为安全地处理：
- 重复的Dashboard组件
- 工具类组件

## 🔄 迁移执行策略

### 策略A：功能合并（推荐）
1. 对比src和packages版本功能差异
2. 将src版本独有功能合并到packages版本
3. 验证功能完整性后删除src版本

### 策略B：渐进替换
1. 逐个组件进行功能验证
2. 确认packages版本功能覆盖后
3. 更新引用路径
4. 安全删除重复

### 策略C：保守保留
对于风险较高的组件，暂时保留重复
等待充分验证时间后再处理

## 🛡️ 安全保障

### 回滚机制
- 每个迁移步骤都创建Git提交
- 可随时回滚到任何安全状态
- 保留完整的功能备份

### 验证机制
- TypeScript编译验证
- 功能完整性测试
- 用户体验验证
- 性能基准测试

EOF

echo "✅ 迁移分析完成！"
echo "📁 详细报告位置: $MIGRATION_DIR"
echo "📋 迁移策略: $MIGRATION_DIR/plans/migration-strategy.md"
echo ""
echo "🎯 下一步："
echo "1. 查看分析报告"
echo "2. 选择迁移策略"
echo "3. 执行无损迁移"
echo ""
echo "💡 原则：宁可保留重复，也不能丢失功能！"
