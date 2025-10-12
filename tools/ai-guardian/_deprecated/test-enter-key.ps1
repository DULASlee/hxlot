# 修复回车键问题的测试
# 测试不同的回车键发送方式

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🔧 修复回车键问题测试"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

Add-Type -AssemblyName System.Windows.Forms

Write-Host "📋 测试说明："
Write-Host "  1. 请打开记事本"
Write-Host "  2. 确保记事本是活动窗口"
Write-Host "  3. 脚本将测试多种回车键发送方式"
Write-Host ""

Write-Host "⏳ 5秒后开始测试..."
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎯 开始测试..."

# 测试1: 发送文字
Write-Host "1️⃣ 发送测试文字..."
[System.Windows.Forms.SendKeys]::SendWait("测试文字1")
Start-Sleep -Milliseconds 500

# 测试2: 尝试不同的回车方式
Write-Host "2️⃣ 尝试第一种回车方式: {ENTER}"
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
Start-Sleep -Milliseconds 500

Write-Host "3️⃣ 发送第二行文字..."
[System.Windows.Forms.SendKeys]::SendWait("测试文字2")
Start-Sleep -Milliseconds 500

# 测试3: 尝试第二种回车方式
Write-Host "4️⃣ 尝试第二种回车方式: ~"
[System.Windows.Forms.SendKeys]::SendWait("~")
Start-Sleep -Milliseconds 500

Write-Host "5️⃣ 发送第三行文字..."
[System.Windows.Forms.SendKeys]::SendWait("测试文字3")
Start-Sleep -Milliseconds 500

# 测试4: 尝试第三种回车方式
Write-Host "6️⃣ 尝试第三种回车方式: {RETURN}"
[System.Windows.Forms.SendKeys]::SendWait("{RETURN}")
Start-Sleep -Milliseconds 500

Write-Host "7️⃣ 发送第四行文字..."
[System.Windows.Forms.SendKeys]::SendWait("测试文字4")
Start-Sleep -Milliseconds 500

# 测试5: 尝试第四种回车方式
Write-Host "8️⃣ 尝试第四种回车方式: 直接回车字符"
[System.Windows.Forms.SendKeys]::SendWait("`r")
Start-Sleep -Milliseconds 500

Write-Host "9️⃣ 发送第五行文字..."
[System.Windows.Forms.SendKeys]::SendWait("测试文字5")
Start-Sleep -Milliseconds 500

# 测试6: 尝试第五种回车方式
Write-Host "🔟 尝试第五种回车方式: 换行符"
[System.Windows.Forms.SendKeys]::SendWait("`n")
Start-Sleep -Milliseconds 500

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "✅ 回车键测试完成！"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "📋 请检查记事本，看看哪种回车方式有效："
Write-Host "  - 测试文字1 后面是否有换行？"
Write-Host "  - 测试文字2 后面是否有换行？"
Write-Host "  - 测试文字3 后面是否有换行？"
Write-Host "  - 测试文字4 后面是否有换行？"
Write-Host "  - 测试文字5 后面是否有换行？"
Write-Host ""
Write-Host "💡 请告诉我哪种回车方式有效，我将修复脚本"
Write-Host ""
