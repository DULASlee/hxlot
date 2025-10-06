#!/bin/bash
# UltraSimpleStudio API测试脚本

echo "🚀 开始测试UltraSimpleStudio API连接"
echo "===================================="

# 获取项目根目录
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 检查node是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查node-fetch是否安装
if ! npm list -g node-fetch &> /dev/null; then
    echo "📦 安装node-fetch依赖..."
    npm install -g node-fetch
fi

# 设置API地址环境变量
export API_URL=http://localhost:11369

# 显示测试信息
echo "📡 API基础地址: $API_URL"
echo "📂 项目根目录: $ROOT_DIR"
echo

# 运行测试脚本
echo "🧪 执行API测试..."
node "$ROOT_DIR/src/SmartAbp.Vue/scripts/api-test.js"

# 检查结果
if [ $? -eq 0 ]; then
    echo -e "\n✅ 测试完成"
else
    echo -e "\n❌ 测试失败"
fi
