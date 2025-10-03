#!/bin/bash

# SmartAbp 数据库切换工具 - 强制打开终端版本
# 这个脚本使用AppleScript确保终端窗口一定会显示

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

# 使用AppleScript打开新的终端窗口并运行脚本
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '$PROJECT_ROOT' && bash '$SCRIPT_DIR/switch-database.sh' && echo '' && echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' && echo '✅ 操作完成！' && echo '💡 可以关闭此窗口，或输入命令继续操作' && echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
end tell
EOF

