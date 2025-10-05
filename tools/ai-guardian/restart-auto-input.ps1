# AI Guardian重启后自动输入脚本
# 此脚本在IDE重启后自动执行，向聊天框输入并发送"请继续推进"

param(
    [int]$DelaySeconds = 8,  # 等待IDE完全启动的时间
    [ValidateSet("normal", "newSession")]
    [string]$Mode = "normal"  # 发送模式：normal=正常聊天框，newSession=新会话对话框
)

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🔄 AI Guardian重启后自动输入脚本"
Write-Host "📋 模式: $Mode"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

# 步骤1: 等待IDE完全启动
Write-Host "⏳ 等待 $DelaySeconds 秒，等待Cursor IDE完全启动..."
Start-Sleep -Seconds $DelaySeconds

# 步骤2: 查找Cursor窗口
Write-Host "🔍 查找Cursor窗口..."
Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    public class Win32 {
        [DllImport("user32.dll")]
        public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
        
        [DllImport("user32.dll")]
        public static extern bool SetForegroundWindow(IntPtr hWnd);
        
        [DllImport("user32.dll")]
        public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
        
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
        
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        public static extern int GetWindowTextLength(IntPtr hWnd);
        
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
        
        public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
        
        public const int SW_RESTORE = 9;
    }
"@

# 枚举所有窗口，查找Cursor
$cursorWindow = $null
$callback = {
    param($hwnd, $lParam)
    $length = [Win32]::GetWindowTextLength($hwnd)
    if ($length -gt 0) {
        $sb = New-Object System.Text.StringBuilder -ArgumentList ($length + 1)
        [Win32]::GetWindowText($hwnd, $sb, $sb.Capacity) | Out-Null
        $title = $sb.ToString()
        
        if ($title -like "*Cursor*") {
            $script:cursorWindow = $hwnd
            Write-Host "✅ 找到Cursor窗口: $title"
            return $false  # 停止枚举
        }
    }
    return $true  # 继续枚举
}

$delegateType = [Win32+EnumWindowsProc]
$callbackDelegate = [System.Delegate]::CreateDelegate($delegateType, $callback.GetNewClosure())
[Win32]::EnumWindows($callbackDelegate, [IntPtr]::Zero) | Out-Null

if ($cursorWindow -eq $null) {
    Write-Host "❌ 未找到Cursor窗口，尝试通过进程启动..."
    
    # 尝试启动Cursor
    $cursorProcess = Get-Process -Name "Cursor" -ErrorAction SilentlyContinue
    if ($cursorProcess) {
        Write-Host "✅ Cursor进程正在运行"
        Start-Sleep -Seconds 3
    } else {
        Write-Host "❌ Cursor未运行"
        exit 1
    }
}

# 步骤3: 激活Cursor窗口
if ($cursorWindow) {
    Write-Host "🎯 激活Cursor窗口..."
    [Win32]::ShowWindow($cursorWindow, [Win32]::SW_RESTORE) | Out-Null
    [Win32]::SetForegroundWindow($cursorWindow) | Out-Null
    Start-Sleep -Milliseconds 500
}

# 步骤4: 使用PowerShell SendKeys直接发送按键
Write-Host "⌨️ 使用PowerShell SendKeys发送按键..."

# 加载SendKeys
Add-Type -AssemblyName System.Windows.Forms

# 连按两次 Ctrl+L 确保焦点在聊天框
Write-Host "📱 发送第一次 Ctrl+L..."
[System.Windows.Forms.SendKeys]::SendWait("^l")
Start-Sleep -Milliseconds 1000

Write-Host "📱 发送第二次 Ctrl+L..."
[System.Windows.Forms.SendKeys]::SendWait("^l")
Start-Sleep -Milliseconds 1500

# 输入消息
Write-Host "📝 输入消息..."
[System.Windows.Forms.SendKeys]::SendWait("请继续推进")
Start-Sleep -Milliseconds 500

# 发送回车
Write-Host "📤 发送回车..."
[System.Windows.Forms.SendKeys]::SendWait("~")
Start-Sleep -Milliseconds 200

# 再次确认发送
Write-Host "📤 再次确认发送..."
[System.Windows.Forms.SendKeys]::SendWait("~")

Write-Host "✅ PowerShell SendKeys执行完成"

# 步骤5: 验证结果
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "✅ AI Guardian重启恢复脚本执行完成"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "📋 执行步骤:"
Write-Host "  1. ✅ 等待IDE启动"
Write-Host "  2. ✅ 查找Cursor窗口"
Write-Host "  3. ✅ 激活窗口"
Write-Host "  4. ✅ 发送 Ctrl+L"
Write-Host "  5. ✅ 输入'请继续推进'"
Write-Host "  6. ✅ 发送回车"
Write-Host ""
Write-Host "💡 请检查Cursor聊天框，确认消息已发送"
Write-Host ""

