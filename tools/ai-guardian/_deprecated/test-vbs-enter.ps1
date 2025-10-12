# 测试VBS脚本的回车功能
# 创建临时VBS脚本测试不同的回车方式

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🔧 测试VBS脚本回车功能"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

Write-Host "📋 测试说明："
Write-Host "  1. 请打开记事本"
Write-Host "  2. 确保记事本是活动窗口"
Write-Host "  3. 脚本将测试VBS中的不同回车方式"
Write-Host ""

Write-Host "⏳ 5秒后开始测试..."
Start-Sleep -Seconds 5

# 创建测试VBS脚本
$vbsScript = @"
Set WshShell = CreateObject("WScript.Shell")

' 等待窗口激活
WScript.Sleep 500

' 发送测试文字
WshShell.SendKeys "VBS测试文字1"
WScript.Sleep 500

' 测试第一种回车方式: {ENTER}
WshShell.SendKeys "{ENTER}"
WScript.Sleep 500

' 发送第二行文字
WshShell.SendKeys "VBS测试文字2"
WScript.Sleep 500

' 测试第二种回车方式: ~
WshShell.SendKeys "~"
WScript.Sleep 500

' 发送第三行文字
WshShell.SendKeys "VBS测试文字3"
WScript.Sleep 500

' 测试第三种回车方式: vbCrLf
WshShell.SendKeys vbCrLf
WScript.Sleep 500

' 发送第四行文字
WshShell.SendKeys "VBS测试文字4"
WScript.Sleep 500

' 测试第四种回车方式: Chr(13)
WshShell.SendKeys Chr(13)
WScript.Sleep 500

' 发送第五行文字
WshShell.SendKeys "VBS测试文字5"

WScript.Echo "✅ VBS回车测试完成"
"@

$vbsFile = "$env:TEMP\vbs-enter-test.vbs"
$vbsScript | Out-File -FilePath $vbsFile -Encoding ASCII

Write-Host "🎯 执行VBS测试脚本..."
$process = Start-Process -FilePath "cscript.exe" -ArgumentList "//Nologo", $vbsFile -Wait -PassThru -WindowStyle Hidden

if ($process.ExitCode -eq 0) {
    Write-Host "✅ VBS脚本执行成功"
} else {
    Write-Host "⚠️ VBS脚本执行返回代码: $($process.ExitCode)"
}

# 清理临时文件
Remove-Item -Path $vbsFile -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "📋 请检查记事本，看看哪种VBS回车方式有效："
Write-Host "  - VBS测试文字1 后面是否有换行？"
Write-Host "  - VBS测试文字2 后面是否有换行？"
Write-Host "  - VBS测试文字3 后面是否有换行？"
Write-Host "  - VBS测试文字4 后面是否有换行？"
Write-Host "  - VBS测试文字5 后面是否有换行？"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "💡 请告诉我哪种VBS回车方式有效，我将修复主脚本"
Write-Host ""
