# 测试聊天框输入功能
# 简化版本，直接测试能否向聊天框输入文字

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🧪 测试聊天框输入功能"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

# 等待3秒让用户准备
Write-Host "⏳ 3秒后开始测试，请确保Cursor聊天框可见..."
Start-Sleep -Seconds 3

# 使用PowerShell的SendKeys直接发送
Write-Host "⌨️ 发送 Ctrl+L 打开聊天框..."
Add-Type -AssemblyName System.Windows.Forms

# 发送Ctrl+L两次
[System.Windows.Forms.SendKeys]::SendWait("^l")
Start-Sleep -Milliseconds 1000
[System.Windows.Forms.SendKeys]::SendWait("^l")
Start-Sleep -Milliseconds 1500

Write-Host "📝 输入测试消息..."
[System.Windows.Forms.SendKeys]::SendWait("测试消息：AI Guardian功能正常")
Start-Sleep -Milliseconds 500

Write-Host "📤 发送消息..."
[System.Windows.Forms.SendKeys]::SendWait("~")

Write-Host ""
Write-Host "✅ 测试完成！请检查聊天框是否收到消息"
Write-Host ""
