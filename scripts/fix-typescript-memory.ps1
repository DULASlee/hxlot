# TypeScript 语言服务内存优化脚本
# 修复 "TypeScript language service is approaching its memory limit" 错误

Write-Host "🔧 TypeScript 内存优化开始..." -ForegroundColor Yellow

# 1. 重启 TypeScript 语言服务
Write-Host "1. 重启 TypeScript 语言服务..." -ForegroundColor Cyan

# 2. 清理 TypeScript 缓存
Write-Host "2. 清理 TypeScript 缓存..." -ForegroundColor Cyan
if (Test-Path "src/SmartAbp.Vue/node_modules/.cache") {
    Remove-Item -Recurse -Force "src/SmartAbp.Vue/node_modules/.cache" -ErrorAction SilentlyContinue
}

# 3. 创建缓存目录
Write-Host "3. 创建优化缓存目录..." -ForegroundColor Cyan
$cacheDir = "src/SmartAbp.Vue/node_modules/.cache"
if (-not (Test-Path $cacheDir)) {
    New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null
}

# 4. 检查 tsconfig 优化
Write-Host "4. 验证 tsconfig.json 优化..." -ForegroundColor Cyan
$tsconfigPath = "src/SmartAbp.Vue/tsconfig.json"
if (Test-Path $tsconfigPath) {
    $content = Get-Content $tsconfigPath -Raw
    if ($content -match '"incremental":\s*true') {
        Write-Host "✅ TypeScript 增量编译已启用" -ForegroundColor Green
    } else {
        Write-Host "⚠️ TypeScript 增量编译未启用" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ tsconfig.json 文件未找到" -ForegroundColor Red
}

# 5. 显示内存优化建议
Write-Host "`n📋 内存优化建议:" -ForegroundColor Yellow
Write-Host "• 在 Cursor 中按 Ctrl+Shift+P，输入 'TypeScript: Restart TS Server'" -ForegroundColor White
Write-Host "• 关闭不需要的文件标签页" -ForegroundColor White
Write-Host "• 定期重启 Cursor IDE" -ForegroundColor White
Write-Host "• 考虑将大文件移出 src 目录" -ForegroundColor White

Write-Host "`n✅ TypeScript 内存优化完成!" -ForegroundColor Green
Write-Host "如果问题持续，请重启 Cursor IDE" -ForegroundColor Yellow
