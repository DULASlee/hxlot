#!/bin/bash
# SmartAbp DevKit 代码生成脚本
# 用途：批量生成实体代码到项目

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEVKIT_CLI="$PROJECT_ROOT/src/SmartAbp.DevKit.Cli"
INPUT_FILE="${1:-entities/current-sprint.json}"
OUTPUT_DIR="${2:-./src/generated/$(date +%Y%m%d-%H%M%S)}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 SmartAbp DevKit 代码生成脚本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 输入文件: $INPUT_FILE"
echo "📂 输出目录: $OUTPUT_DIR"
echo ""

# 检查DevKit CLI是否存在
if [ ! -d "$DEVKIT_CLI" ]; then
  echo "❌ 错误：DevKit CLI目录不存在"
  echo "   路径: $DEVKIT_CLI"
  exit 1
fi

# 检查输入文件
if [ ! -f "$INPUT_FILE" ]; then
  echo "❌ 错误：输入文件不存在"
  echo "   路径: $INPUT_FILE"
  echo ""
  echo "💡 使用方法:"
  echo "   $0 <输入JSON文件> [输出目录]"
  echo ""
  echo "📝 示例:"
  echo "   $0 entities/my-entities.json ./src/generated"
  exit 1
fi

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 执行代码生成
echo "🔧 开始生成代码..."
echo ""

START_TIME=$(date +%s)

cd "$DEVKIT_CLI"
dotnet run -- batch \
  -i "../../$INPUT_FILE" \
  -o "../../$OUTPUT_DIR" \
  -v

EXIT_CODE=$?
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

cd "$PROJECT_ROOT"

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ 代码生成成功！"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "⏱️  总耗时: ${DURATION}秒"
  echo "📂 输出目录: $OUTPUT_DIR"
  echo ""
  echo "📁 生成的文件:"
  ls -lh "$OUTPUT_DIR" | grep "\.cs$" || echo "   (无C#文件)"
  echo ""
  echo "📝 下一步操作:"
  echo "   1. 检查生成的代码质量"
  echo "   2. 复制到实际项目目录:"
  echo "      cp $OUTPUT_DIR/*.cs src/SmartAbp.Domain/Entities/"
  echo "   3. 添加业务逻辑"
  echo "   4. 运行测试"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ 代码生成失败！"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "⏱️  耗时: ${DURATION}秒"
  echo "📝 请检查错误日志并修复问题"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi

