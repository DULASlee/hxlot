# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Git 强制推送脚本 - 用本地代码覆盖远程仓库
# ⚠️ 危险操作：此脚本会永久删除远程提交！
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

param(
    [switch]$Force  # 跳过确认（危险！）
)

$ErrorActionPreference = "Stop"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "🚨 Git 强制推送脚本" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

# 步骤1：确认操作
if (-not $Force) {
    Write-Host "⚠️  此操作将用本地代码强制覆盖远程仓库！" -ForegroundColor Red
    Write-Host "⚠️  远程仓库的所有不同提交将被永久删除！" -ForegroundColor Red
    Write-Host ""
    $confirm = Read-Host "🔴 您确定要继续吗？(输入 'YES' 确认)"

    if ($confirm -ne "YES") {
        Write-Host "❌ 操作已取消" -ForegroundColor Red
        exit 1
    }
}

# 步骤2：创建远程备份
Write-Host ""
Write-Host "📦 步骤1/5: 创建远程备份分支..." -ForegroundColor Cyan
$backupBranch = "backup-before-force-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git fetch origin
git push origin origin/main:refs/heads/$backupBranch
Write-Host "✅ 备份分支已创建: $backupBranch" -ForegroundColor Green

# 步骤3：查看本地状态
Write-Host ""
Write-Host "📊 步骤2/5: 检查本地状态..." -ForegroundColor Cyan
git status

# 步骤4：提交本地修改
Write-Host ""
Write-Host "💾 步骤3/5: 提交本地所有修改..." -ForegroundColor Cyan
$status = git status --short
if ($status) {
    git add .
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "fix: 本地正确版本 - 准备强制覆盖远程 [$timestamp]"
    Write-Host "✅ 本地修改已提交" -ForegroundColor Green
} else {
    Write-Host "✅ 本地无未提交修改" -ForegroundColor Green
}

# 步骤5：最后确认
if (-not $Force) {
    Write-Host ""
    Write-Host "🔴 最后确认：" -ForegroundColor Red
    $currentBranch = git rev-parse --abbrev-ref HEAD
    $localHash = git rev-parse --short HEAD
    Write-Host "   本地分支: $currentBranch"
    Write-Host "   本地提交: $localHash"
    Write-Host "   远程仓库: origin/main"
    Write-Host ""
    $finalConfirm = Read-Host "🔴 确认用本地代码覆盖远程？(输入 'FORCE' 确认)"

    if ($finalConfirm -ne "FORCE") {
        Write-Host "❌ 操作已取消" -ForegroundColor Red
        exit 1
    }
}

# 步骤6：执行强制推送
Write-Host ""
Write-Host "🚀 步骤4/5: 执行强制推送..." -ForegroundColor Cyan
Write-Host "   尝试使用 --force-with-lease（更安全）..." -ForegroundColor Yellow

try {
    git push origin main --force-with-lease 2>&1 | Out-Null
    Write-Host "✅ 强制推送成功（使用 --force-with-lease）" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "⚠️  --force-with-lease 失败" -ForegroundColor Yellow
    Write-Host "   原因：远程可能有其他新提交"

    if (-not $Force) {
        Write-Host ""
        $ultimateConfirm = Read-Host "🔴 是否使用 --force 强制覆盖？(输入 'FORCE' 确认)"

        if ($ultimateConfirm -ne "FORCE") {
            Write-Host "❌ 操作已取消" -ForegroundColor Red
            exit 1
        }
    }

    Write-Host "🚀 使用 --force 强制推送..." -ForegroundColor Yellow
    git push origin main --force
    Write-Host "✅ 强制推送成功（使用 --force）" -ForegroundColor Green
}

# 步骤7：验证结果
Write-Host ""
Write-Host "🔍 步骤5/5: 验证推送结果..." -ForegroundColor Cyan
git fetch origin
$localHash = git rev-parse HEAD
$remoteHash = git rev-parse origin/main

if ($localHash -eq $remoteHash) {
    Write-Host "✅ 验证成功：本地和远程代码完全一致" -ForegroundColor Green
    Write-Host "   本地哈希:   $localHash"
    Write-Host "   远程哈希:   $remoteHash"
} else {
    Write-Host "❌ 验证失败：本地和远程代码不一致！" -ForegroundColor Red
    Write-Host "   本地哈希:   $localHash"
    Write-Host "   远程哈希:   $remoteHash"
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "🎉 强制推送完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📋 重要信息："
Write-Host "   ✅ 远程仓库已被本地代码覆盖" -ForegroundColor Green
Write-Host "   ✅ 备份分支: $backupBranch" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 如需恢复远程代码，执行：" -ForegroundColor Yellow
Write-Host "   git push origin ${backupBranch}:main --force" -ForegroundColor Yellow
Write-Host ""

