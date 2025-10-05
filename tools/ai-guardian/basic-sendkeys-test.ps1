# 最基础的SendKeys测试
# 测试PowerShell能否向当前活动窗口发送按键

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🔬 最基础SendKeys功能测试"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

# 加载SendKeys
Add-Type -AssemblyName System.Windows.Forms

Write-Host "📋 测试说明："
Write-Host "  1. 请打开一个文本编辑器（如记事本）"
Write-Host "  2. 确保文本编辑器是活动窗口"
Write-Host "  3. 脚本将向文本编辑器发送'Hello World'"
Write-Host ""

Write-Host "⏳ 10秒后开始测试..."
Write-Host "💡 请在这10秒内："
Write-Host "  - 打开记事本"
Write-Host "  - 点击记事本窗口，确保它是活动窗口"
Write-Host ""

for ($i = 10; $i -gt 0; $i--) {
    Write-Host "⏰ $i 秒后开始..." -NoNewline
    Start-Sleep -Seconds 1
    Write-Host "`r" -NoNewline
}

Write-Host ""
Write-Host "🎯 开始发送测试文字..."

try {
    # 发送测试文字
    [System.Windows.Forms.SendKeys]::SendWait("Hello World - AI Guardian Test")
    Write-Host "✅ 文字发送成功"
    
    Start-Sleep -Milliseconds 500
    
    # 发送回车
    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
    Write-Host "✅ 回车发送成功"
    
} catch {
    Write-Host "❌ 发送失败: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "📋 请检查记事本是否收到了'Hello World - AI Guardian Test'"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "💡 如果记事本收到了文字，说明SendKeys功能正常"
Write-Host "💡 如果记事本没有收到文字，说明是权限或系统问题"
Write-Host ""
