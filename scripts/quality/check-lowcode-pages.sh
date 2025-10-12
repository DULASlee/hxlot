#!/bin/bash

# 🔥 LowCode页面完整性铁律检查脚本
# 检查所有lowcode目录下的Vue页面是否符合编程完整性铁律

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 LowCode页面完整性铁律检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

LOWCODE_DIR="src/SmartAbp.Vue/src/views/lowcode"
REPORT_FILE="reports/quality/lowcode-pages-check-$(date +%Y%m%d_%H%M%S).md"

# 创建报告目录
mkdir -p reports/quality

# 初始化报告
cat > "$REPORT_FILE" << 'EOF'
# LowCode页面完整性铁律检查报告

**检查日期**: $(date +%Y-%m-%d\ %H:%M:%S)
**检查标准**: AI编程完整性铁律
**检查范围**: src/SmartAbp.Vue/src/views/lowcode/

---

## 📊 检查概览

EOF

# 统计变量
TOTAL_FILES=0
PASSED_FILES=0
FAILED_FILES=0

# 问题计数
JSON_STRINGIFY_COUNT=0
CONSOLE_LOG_COUNT=0
TODO_COUNT=0
EMPTY_METHOD_COUNT=0
MOCK_DATA_COUNT=0

echo "📋 正在扫描页面文件..."
echo ""

# 检查所有Vue文件
for file in $LOWCODE_DIR/*.vue; do
    if [ -f "$file" ]; then
        TOTAL_FILES=$((TOTAL_FILES + 1))
        filename=$(basename "$file")
        
        echo "🔍 检查: $filename"
        
        # 检查JSON.stringify（可能导致页面显示JSON字符串）
        json_count=$(grep -c "JSON.stringify" "$file" || true)
        if [ $json_count -gt 0 ]; then
            echo "   ⚠️  发现 $json_count 处 JSON.stringify"
            JSON_STRINGIFY_COUNT=$((JSON_STRINGIFY_COUNT + json_count))
        fi
        
        # 检查console.log（应该被移除）
        console_count=$(grep -c "console.log" "$file" || true)
        if [ $console_count -gt 0 ]; then
            echo "   ⚠️  发现 $console_count 处 console.log"
            CONSOLE_LOG_COUNT=$((CONSOLE_LOG_COUNT + console_count))
        fi
        
        # 检查TODO/FIXME（未完成的代码）
        todo_count=$(grep -c -E "TODO|FIXME" "$file" || true)
        if [ $todo_count -gt 0 ]; then
            echo "   ⚠️  发现 $todo_count 处 TODO/FIXME"
            TODO_COUNT=$((TODO_COUNT + todo_count))
        fi
        
        # 检查空方法（花瓶实现）
        empty_count=$(grep -c -E "const.*=.*\(\).*=>.*\{\}" "$file" || true)
        if [ $empty_count -gt 0 ]; then
            echo "   ⚠️  发现 $empty_count 处空方法"
            EMPTY_METHOD_COUNT=$((EMPTY_METHOD_COUNT + empty_count))
        fi
        
        # 判断是否通过
        if [ $json_count -eq 0 ] && [ $console_count -eq 0 ] && [ $todo_count -eq 0 ] && [ $empty_count -eq 0 ]; then
            echo "   ✅ 通过"
            PASSED_FILES=$((PASSED_FILES + 1))
        else
            echo "   ❌ 不通过"
            FAILED_FILES=$((FAILED_FILES + 1))
        fi
        
        echo ""
    fi
done

# 生成报告
cat >> "$REPORT_FILE" << EOF
| 指标 | 数量 |
|------|------|
| 总页面数 | $TOTAL_FILES |
| ✅ 通过 | $PASSED_FILES |
| ❌ 不通过 | $FAILED_FILES |
| 通过率 | $((PASSED_FILES * 100 / TOTAL_FILES))% |

---

## 🚨 发现的问题

| 问题类型 | 数量 | 严重度 |
|---------|------|--------|
| JSON.stringify | $JSON_STRINGIFY_COUNT | ⚠️ 高 |
| console.log | $CONSOLE_LOG_COUNT | 🟡 中 |
| TODO/FIXME | $TODO_COUNT | 🟡 中 |
| 空方法 | $EMPTY_METHOD_COUNT | 🔴 高 |

---

## 📋 详细问题列表

### 1️⃣ JSON.stringify问题（可能导致页面显示JSON字符串）

EOF

# 查找JSON.stringify详细位置
echo "### JSON.stringify详细位置:" >> "$REPORT_FILE"
grep -n "JSON.stringify" $LOWCODE_DIR/*.vue >> "$REPORT_FILE" 2>/dev/null || echo "无" >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << 'EOF'

### 2️⃣ console.log问题（调试代码未清理）

EOF

# 查找console.log详细位置
echo "### console.log详细位置:" >> "$REPORT_FILE"
grep -n "console.log" $LOWCODE_DIR/*.vue >> "$REPORT_FILE" 2>/dev/null || echo "无" >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << 'EOF'

### 3️⃣ TODO/FIXME问题（未完成代码）

EOF

# 查找TODO/FIXME详细位置
echo "### TODO/FIXME详细位置:" >> "$REPORT_FILE"
grep -n -E "TODO|FIXME" $LOWCODE_DIR/*.vue >> "$REPORT_FILE" 2>/dev/null || echo "无" >> "$REPORT_FILE"

# 输出总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 检查完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "总页面数: $TOTAL_FILES"
echo "✅ 通过: $PASSED_FILES"
echo "❌ 不通过: $FAILED_FILES"
echo "通过率: $((PASSED_FILES * 100 / TOTAL_FILES))%"
echo ""
echo "🚨 发现的问题:"
echo "   • JSON.stringify: $JSON_STRINGIFY_COUNT 处"
echo "   • console.log: $CONSOLE_LOG_COUNT 处"
echo "   • TODO/FIXME: $TODO_COUNT 处"
echo "   • 空方法: $EMPTY_METHOD_COUNT 处"
echo ""
echo "📄 详细报告: $REPORT_FILE"
echo ""

