#!/bin/bash

# SmartAbp 数据库切换工具 - macOS应用创建脚本
# 运行此脚本将创建一个可以双击的macOS应用程序

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

APP_NAME="SmartAbp数据库切换.app"
APP_PATH="$HOME/Desktop/$APP_NAME"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 创建macOS应用程序"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查是否已存在
if [ -d "$APP_PATH" ]; then
    echo "⚠️  应用已存在，正在删除..."
    rm -rf "$APP_PATH"
fi

# 创建应用包结构
echo "📦 创建应用包结构..."
mkdir -p "$APP_PATH/Contents/MacOS"
mkdir -p "$APP_PATH/Contents/Resources"

# 创建Info.plist
echo "📝 创建应用信息文件..."
cat > "$APP_PATH/Contents/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>SmartAbpDBSwitch</string>
    <key>CFBundleName</key>
    <string>SmartAbp数据库切换</string>
    <key>CFBundleIdentifier</key>
    <string>com.smartabp.database.switcher</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
</dict>
</plist>
EOF

# 创建可执行脚本
echo "🔧 创建可执行脚本..."
cat > "$APP_PATH/Contents/MacOS/SmartAbpDBSwitch" << EOF
#!/bin/bash

# 切换到项目根目录
cd "$PROJECT_ROOT"

# 运行数据库切换工具
bash "$SCRIPT_DIR/switch-database.sh"

# 等待用户按键
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 操作完成！"
echo "按任意键关闭此窗口..."
read -n 1 -s
EOF

chmod +x "$APP_PATH/Contents/MacOS/SmartAbpDBSwitch"

# 创建简单的图标（使用Emoji）
echo "🎨 创建应用图标..."
# 这里可以后续添加自定义图标

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 创建成功！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 应用位置: $APP_PATH"
echo ""
echo "🎯 使用方法:"
echo "  1. 在桌面双击 '$APP_NAME'"
echo "  2. 或者拖到应用程序文件夹"
echo "  3. 或者拖到Dock栏"
echo ""
echo "💡 提示: 首次运行可能需要在'系统偏好设置 → 安全性与隐私'中允许"
echo ""

