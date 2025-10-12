# 详细调试版本 - 测试聊天框输入功能
# 添加更多调试信息和错误处理

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🔍 详细调试：聊天框输入功能测试"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

# 检查System.Windows.Forms是否可用
try {
    Add-Type -AssemblyName System.Windows.Forms
    Write-Host "✅ System.Windows.Forms 加载成功"
} catch {
    Write-Host "❌ System.Windows.Forms 加载失败: $($_.Exception.Message)"
    exit 1
}

# 检查当前活动窗口
Write-Host "🔍 检查当前活动窗口..."
Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    public class Win32 {
        [DllImport("user32.dll")]
        public static extern IntPtr GetForegroundWindow();
        
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder lpString, int nMaxCount);
        
        [DllImport("user32.dll")]
        public static extern int GetWindowTextLength(IntPtr hWnd);
    }
"@

$activeWindow = [Win32]::GetForegroundWindow()
$length = [Win32]::GetWindowTextLength($activeWindow)
if ($length -gt 0) {
    $sb = New-Object System.Text.StringBuilder -ArgumentList ($length + 1)
    [Win32]::GetWindowText($activeWindow, $sb, $sb.Capacity) | Out-Null
    $windowTitle = $sb.ToString()
    Write-Host "📋 当前活动窗口: $windowTitle"
} else {
    Write-Host "⚠️ 无法获取当前活动窗口标题"
}

Write-Host ""
Write-Host "⏳ 5秒后开始测试，请确保Cursor聊天框可见并处于活动状态..."
Write-Host "💡 提示：请先手动点击Cursor窗口，确保它是活动窗口"
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎯 开始发送按键..."

# 步骤1: 发送Ctrl+L
Write-Host "1️⃣ 发送第一次 Ctrl+L..."
try {
    [System.Windows.Forms.SendKeys]::SendWait("^l")
    Write-Host "   ✅ 第一次 Ctrl+L 发送成功"
} catch {
    Write-Host "   ❌ 第一次 Ctrl+L 发送失败: $($_.Exception.Message)"
}

Start-Sleep -Milliseconds 1000

# 步骤2: 发送第二次Ctrl+L
Write-Host "2️⃣ 发送第二次 Ctrl+L..."
try {
    [System.Windows.Forms.SendKeys]::SendWait("^l")
    Write-Host "   ✅ 第二次 Ctrl+L 发送成功"
} catch {
    Write-Host "   ❌ 第二次 Ctrl+L 发送失败: $($_.Exception.Message)"
}

Start-Sleep -Milliseconds 1500

# 步骤3: 输入测试消息
Write-Host "3️⃣ 输入测试消息..."
try {
    [System.Windows.Forms.SendKeys]::SendWait("测试消息：AI Guardian功能正常")
    Write-Host "   ✅ 测试消息输入成功"
} catch {
    Write-Host "   ❌ 测试消息输入失败: $($_.Exception.Message)"
}

Start-Sleep -Milliseconds 500

# 步骤4: 发送回车
Write-Host "4️⃣ 发送回车..."
try {
    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
    Write-Host "   ✅ 回车发送成功"
} catch {
    Write-Host "   ❌ 回车发送失败: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "✅ 详细调试测试完成！"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "📋 请检查："
Write-Host "  1. Cursor聊天框是否打开了？"
Write-Host "  2. 是否看到了'测试消息：AI Guardian功能正常'？"
Write-Host "  3. 消息是否已发送？"
Write-Host ""
Write-Host "💡 如果没有看到消息，可能的原因："
Write-Host "  - Cursor窗口不是活动窗口"
Write-Host "  - 聊天框快捷键不是Ctrl+L"
Write-Host "  - 系统权限问题"
Write-Host ""
