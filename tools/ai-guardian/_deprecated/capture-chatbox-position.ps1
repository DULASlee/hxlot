# ============================================================================
# AI Guardian - 聊天框坐标捕获工具（简化版）
# ============================================================================
# 功能：锁定屏幕，通过鼠标拉框捕获聊天框区域的坐标
# 使用：pwsh -File capture-chatbox-position.ps1
# ============================================================================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🎯 AI Guardian - 聊天框区域捕获工具"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "📋 使用说明:"
Write-Host "  1. 屏幕将被半透明遮罩锁定"
Write-Host "  2. 按住鼠标左键并拖动，框选聊天框输入框区域"
Write-Host "  3. 松开鼠标即可记录矩形区域的四个角坐标"
Write-Host "  4. 坐标将自动保存到 chatbox-config.json"
Write-Host "  5. 按 ESC 键可以取消操作"
Write-Host ""
Write-Host "⏳ 3秒后启动..."
Write-Host ""

Start-Sleep -Seconds 3

# ============================================================================
# 全局变量
# ============================================================================

$script:isDragging = $false
$script:startX = 0
$script:startY = 0
$script:endX = 0
$script:endY = 0

# ============================================================================
# 创建全屏窗体
# ============================================================================

$form = New-Object System.Windows.Forms.Form
$form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::None
$form.WindowState = [System.Windows.Forms.FormWindowState]::Maximized
$form.StartPosition = [System.Windows.Forms.FormStartPosition]::Manual
$form.Location = New-Object System.Drawing.Point(0, 0)
$form.Size = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Size
$form.BackColor = [System.Drawing.Color]::Black
$form.Opacity = 0.3
$form.TopMost = $true
$form.Cursor = [System.Windows.Forms.Cursors]::Cross
$form.KeyPreview = $true

# ============================================================================
# 窗体绘图事件
# ============================================================================

$form.Add_Paint({
    param($sender, $e)
    
    if ($script:isDragging) {
        $g = $e.Graphics
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        
        # 计算矩形参数
        $x = [Math]::Min($script:startX, $script:endX)
        $y = [Math]::Min($script:startY, $script:endY)
        $width = [Math]::Abs($script:endX - $script:startX)
        $height = [Math]::Abs($script:endY - $script:startY)
        
        if ($width -gt 0 -and $height -gt 0) {
            # 绘制半透明填充
            $fillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 0, 255, 0))
            $g.FillRectangle($fillBrush, $x, $y, $width, $height)
            $fillBrush.Dispose()
            
            # 绘制边框
            $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Lime, 4)
            $g.DrawRectangle($pen, $x, $y, $width, $height)
            $pen.Dispose()
            
            # 绘制四个角标记
            $cornerSize = 16
            $cornerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Red)
            
            $g.FillEllipse($cornerBrush, $x - $cornerSize/2, $y - $cornerSize/2, $cornerSize, $cornerSize)
            $g.FillEllipse($cornerBrush, $x + $width - $cornerSize/2, $y - $cornerSize/2, $cornerSize, $cornerSize)
            $g.FillEllipse($cornerBrush, $x - $cornerSize/2, $y + $height - $cornerSize/2, $cornerSize, $cornerSize)
            $g.FillEllipse($cornerBrush, $x + $width - $cornerSize/2, $y + $height - $cornerSize/2, $cornerSize, $cornerSize)
            
            $cornerBrush.Dispose()
            
            # 绘制坐标文本
            $font = New-Object System.Drawing.Font("Consolas", 12, [System.Drawing.FontStyle]::Bold)
            $textBrush = [System.Drawing.Brushes]::Yellow
            $backBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 0, 0, 0))
            
            # 左上角坐标
            $text = "($x, $y)"
            $textSize = $g.MeasureString($text, $font)
            $g.FillRectangle($backBrush, $x + 5, $y + 5, $textSize.Width, $textSize.Height)
            $g.DrawString($text, $font, $textBrush, $x + 5, $y + 5)
            
            # 右下角坐标
            $text2 = "($($x + $width), $($y + $height))"
            $textSize2 = $g.MeasureString($text2, $font)
            $g.FillRectangle($backBrush, $x + $width - $textSize2.Width - 5, $y + $height - $textSize2.Height - 5, $textSize2.Width, $textSize2.Height)
            $g.DrawString($text2, $font, $textBrush, $x + $width - $textSize2.Width - 5, $y + $height - $textSize2.Height - 5)
            
            # 中心信息
            $centerX = [int]($x + $width / 2)
            $centerY = [int]($y + $height / 2)
            $info = "宽:$width 高:$height 中心:($centerX, $centerY)"
            $infoSize = $g.MeasureString($info, $font)
            $g.FillRectangle($backBrush, $centerX - $infoSize.Width/2, $centerY - $infoSize.Height/2, $infoSize.Width, $infoSize.Height)
            $g.DrawString($info, $font, $textBrush, $centerX - $infoSize.Width/2, $centerY - $infoSize.Height/2)
            
            $font.Dispose()
            $backBrush.Dispose()
        }
    }
})

# ============================================================================
# 鼠标按下事件
# ============================================================================

$form.Add_MouseDown({
    param($sender, $e)
    
    if ($e.Button -eq [System.Windows.Forms.MouseButtons]::Left) {
        $script:isDragging = $true
        $script:startX = $e.X
        $script:startY = $e.Y
        $script:endX = $e.X
        $script:endY = $e.Y
        
        Write-Host "🖱️ 开始框选: ($($e.X), $($e.Y))"
    }
})

# ============================================================================
# 鼠标移动事件
# ============================================================================

$form.Add_MouseMove({
    param($sender, $e)
    
    if ($script:isDragging) {
        $script:endX = $e.X
        $script:endY = $e.Y
        $form.Invalidate()  # 触发重绘
    }
})

# ============================================================================
# 鼠标松开事件
# ============================================================================

$form.Add_MouseUp({
    param($sender, $e)
    
    if ($e.Button -eq [System.Windows.Forms.MouseButtons]::Left -and $script:isDragging) {
        $script:isDragging = $false
        
        # 计算最终坐标
        $x1 = [Math]::Min($script:startX, $script:endX)
        $y1 = [Math]::Min($script:startY, $script:endY)
        $x2 = [Math]::Max($script:startX, $script:endX)
        $y2 = [Math]::Max($script:startY, $script:endY)
        $width = $x2 - $x1
        $height = $y2 - $y1
        
        Write-Host "🖱️ 框选完成: ($x1, $y1) -> ($x2, $y2)"
        Write-Host "📏 区域大小: $width x $height"
        
        # 检查区域大小
        if ($width -lt 10 -or $height -lt 10) {
            Write-Host "⚠️ 区域太小，请重新框选"
            return
        }
        
        # 计算中心点
        $centerX = [int]($x1 + $width / 2)
        $centerY = [int]($y1 + $height / 2)
        
        Write-Host "📍 中心点: ($centerX, $centerY)"
        
        # 创建配置对象
        $config = @{
            chatboxPosition = @{
                X = $centerX
                Y = $centerY
            }
            chatboxRegion = @{
                TopLeft = @{ X = $x1; Y = $y1 }
                TopRight = @{ X = $x2; Y = $y1 }
                BottomLeft = @{ X = $x1; Y = $y2 }
                BottomRight = @{ X = $x2; Y = $y2 }
                Width = $width
                Height = $height
            }
            capturedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            screenResolution = @{
                Width = $form.Width
                Height = $form.Height
            }
            description = "Cursor聊天框输入框区域坐标"
        }
        
        # 保存到JSON文件
        $configPath = Join-Path $PSScriptRoot "chatbox-config.json"
        $config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
        
        Write-Host ""
        Write-Host "✅ 坐标已保存到: $configPath"
        Write-Host ""
        Write-Host "📊 保存的配置:"
        Write-Host "   左上角: ($x1, $y1)"
        Write-Host "   右上角: ($x2, $y1)"
        Write-Host "   左下角: ($x1, $y2)"
        Write-Host "   右下角: ($x2, $y2)"
        Write-Host "   中心点: ($centerX, $centerY)"
        Write-Host "   区域: $width x $height"
        Write-Host ""
        
        # 显示成功消息框
        [System.Windows.Forms.MessageBox]::Show(
            "✅ 聊天框区域坐标已成功保存！`n`n" +
            "📍 四个角坐标:`n" +
            "   左上角: ($x1, $y1)`n" +
            "   右上角: ($x2, $y1)`n" +
            "   左下角: ($x1, $y2)`n" +
            "   右下角: ($x2, $y2)`n`n" +
            "📏 区域尺寸: $width x $height`n" +
            "📍 中心点: ($centerX, $centerY)`n`n" +
            "💡 下次IDE重启时，将自动点击中心点坐标来定位聊天框",
            "🎉 坐标捕获成功",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information
        ) | Out-Null
        
        $form.Close()
    }
})

# ============================================================================
# 键盘事件 - ESC退出
# ============================================================================

$form.Add_KeyDown({
    param($sender, $e)
    
    if ($e.KeyCode -eq [System.Windows.Forms.Keys]::Escape) {
        Write-Host "❌ 用户取消操作"
        $form.Close()
    }
})

# ============================================================================
# 显示提示标签
# ============================================================================

$label = New-Object System.Windows.Forms.Label
$label.Text = @"
🎯 AI Guardian 区域捕获工具

按住鼠标左键并拖动，框选聊天框输入框区域
按 ESC 键取消操作
"@
$label.AutoSize = $false
$label.Size = New-Object System.Drawing.Size(600, 100)
$label.Location = New-Object System.Drawing.Point(
    [int](($form.Width - 600) / 2),
    50
)
$label.ForeColor = [System.Drawing.Color]::White
$label.BackColor = [System.Drawing.Color]::FromArgb(220, 0, 100, 200)
$label.Font = New-Object System.Drawing.Font("Microsoft YaHei", 14, [System.Drawing.FontStyle]::Bold)
$label.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
$form.Controls.Add($label)

# ============================================================================
# 显示窗体
# ============================================================================

Write-Host "✅ 锁屏工具已启动"
Write-Host "   屏幕分辨率: $($form.Width) x $($form.Height)"
Write-Host "   请按住鼠标左键并拖动框选聊天框区域..."
Write-Host ""

$form.ShowDialog() | Out-Null
$form.Dispose()

Write-Host "✅ 坐标捕获工具已退出"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
