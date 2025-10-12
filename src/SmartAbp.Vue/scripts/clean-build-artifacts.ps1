#!/usr/bin/env pwsh
# 清理编译产物脚本 - 清理源码目录中的编译文件
# 使用方法: pwsh scripts/clean-build-artifacts.ps1

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$srcDir = Join-Path $projectRoot "src"

Write-Host "🧹 清理编译产物..." -ForegroundColor Cyan
Write-Host "项目根目录: $projectRoot" -ForegroundColor Gray

# 1. 清理 .js 文件（保留配置文件）
Write-Host "`n📦 清理 .js 编译产物..." -ForegroundColor Yellow
$jsFiles = Get-ChildItem -Path $srcDir -Filter "*.js" -Recurse -ErrorAction SilentlyContinue |
    Where-Object {
        $_.FullName -notmatch "node_modules" -and
        $_.FullName -notmatch "dist" -and
        $_.FullName -notmatch "\.vite" -and
        $_.Name -notmatch "\.config\.js$" -and
        $_.Name -notmatch "\.setup\.js$"
    }

$jsCount = ($jsFiles | Measure-Object).Count
Write-Host "  找到 $jsCount 个 .js 文件" -ForegroundColor Gray
if ($jsCount -gt 0) {
    $jsFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ 已删除 $jsCount 个 .js 文件" -ForegroundColor Green
}

# 2. 清理 .d.ts 类型声明文件（保留手写的）
Write-Host "`n📦 清理 .d.ts 声明文件..." -ForegroundColor Yellow
$dtsFiles = Get-ChildItem -Path $srcDir -Filter "*.d.ts" -Recurse -ErrorAction SilentlyContinue |
    Where-Object {
        $_.FullName -notmatch "node_modules" -and
        $_.FullName -notmatch "dist" -and
        $_.FullName -notmatch "types" -and
        $_.Name -notmatch "^env\.d\.ts$" -and
        $_.Name -notmatch "^vite-env\.d\.ts$" -and
        $_.Name -notmatch "^components\.d\.ts$" -and
        $_.Name -notmatch "^auto-imports\.d\.ts$"
    }

$dtsCount = ($dtsFiles | Measure-Object).Count
Write-Host "  找到 $dtsCount 个 .d.ts 文件" -ForegroundColor Gray
if ($dtsCount -gt 0) {
    $dtsFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ 已删除 $dtsCount 个 .d.ts 文件" -ForegroundColor Green
}

# 3. 清理 .map 源码映射文件
Write-Host "`n📦 清理 .map 源码映射..." -ForegroundColor Yellow
$mapFiles = Get-ChildItem -Path $srcDir -Filter "*.map" -Recurse -ErrorAction SilentlyContinue |
    Where-Object {
        $_.FullName -notmatch "node_modules" -and
        $_.FullName -notmatch "dist"
    }

$mapCount = ($mapFiles | Measure-Object).Count
Write-Host "  找到 $mapCount 个 .map 文件" -ForegroundColor Gray
if ($mapCount -gt 0) {
    $mapFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ 已删除 $mapCount 个 .map 文件" -ForegroundColor Green
}

# 4. 清理 .backup 备份文件
Write-Host "`n📦 清理 .backup 备份文件..." -ForegroundColor Yellow
$backupFiles = Get-ChildItem -Path $srcDir -Filter "*.backup" -Recurse -ErrorAction SilentlyContinue

$backupCount = ($backupFiles | Measure-Object).Count
Write-Host "  找到 $backupCount 个 .backup 文件" -ForegroundColor Gray
if ($backupCount -gt 0) {
    $backupFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ 已删除 $backupCount 个 .backup 文件" -ForegroundColor Green
}

# 5. 清理 .tsbuildinfo 增量编译缓存
Write-Host "`n📦 清理 TypeScript 增量编译缓存..." -ForegroundColor Yellow
$tsbuildInfoFiles = Get-ChildItem -Path $srcDir -Filter "*.tsbuildinfo" -Recurse -ErrorAction SilentlyContinue

$tsbuildCount = ($tsbuildInfoFiles | Measure-Object).Count
Write-Host "  找到 $tsbuildCount 个 .tsbuildinfo 文件" -ForegroundColor Gray
if ($tsbuildCount -gt 0) {
    $tsbuildInfoFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ 已删除 $tsbuildCount 个 .tsbuildinfo 文件" -ForegroundColor Green
}

# 6. 清理 node_modules 缓存
Write-Host "`n📦 清理 node_modules 缓存..." -ForegroundColor Yellow
$cacheDir = Join-Path $projectRoot "node_modules/.cache"
$viteDir = Join-Path $projectRoot "node_modules/.vite"

if (Test-Path $cacheDir) {
    Remove-Item -Path $cacheDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ 已删除 node_modules/.cache" -ForegroundColor Green
}

if (Test-Path $viteDir) {
    Remove-Item -Path $viteDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✅ 已删除 node_modules/.vite" -ForegroundColor Green
}

# 7. 统计清理结果
Write-Host "`n📊 清理统计:" -ForegroundColor Cyan
$totalCleaned = $jsCount + $dtsCount + $mapCount + $backupCount + $tsbuildCount
Write-Host "  ✅ 总计清理: $totalCleaned 个文件" -ForegroundColor Green
Write-Host "  📦 预计释放空间: $(($totalCleaned * 5) / 1024) MB" -ForegroundColor Green

# 8. 建议下一步操作
Write-Host "`n💡 建议下一步操作:" -ForegroundColor Cyan
Write-Host "  1. 运行 'npm run type-check' 验证TypeScript" -ForegroundColor Gray
Write-Host "  2. 运行 'npm run dev' 测试开发环境" -ForegroundColor Gray
Write-Host "  3. 运行 'npm run build' 测试生产构建" -ForegroundColor Gray

Write-Host "`n✅ 清理完成！" -ForegroundColor Green

