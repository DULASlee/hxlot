# SmartAbp Git Safe Sync - 企业级版本管理工具 (PowerShell版本)
# 功能: 备份 → 拉取 → 合并 → 推送
# 支持: Windows PowerShell 5.1+ / PowerShell Core 6+

param(
    [switch]$AutoCommit = $false,
    [switch]$Verbose = $false,
    [string]$LogFile = "",
    [switch]$DryRun = $false
)

# 设置错误处理
$ErrorActionPreference = "Stop"

# 日志函数
function Write-ColorLog {
    param(
        [string]$Message,
        [string]$Level = "Info"
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"

    switch ($Level) {
        "Info"    { Write-Host $logMessage -ForegroundColor Cyan }
        "Success" { Write-Host $logMessage -ForegroundColor Green }
        "Warning" { Write-Host $logMessage -ForegroundColor Yellow }
        "Error"   { Write-Host $logMessage -ForegroundColor Red }
        "Step"    { Write-Host $logMessage -ForegroundColor Magenta }
    }

    if ($LogFile) {
        Add-Content -Path $LogFile -Value $logMessage
    }
}

function Write-Step {
    param([string]$StepNumber, [string]$Description)
    Write-ColorLog "[$StepNumber] $Description" "Step"
}

# 错误处理函数
function Handle-Error {
    param([string]$ErrorMessage, [string]$BackupTag = "")

    Write-ColorLog $ErrorMessage "Error"
    Write-Host ""
    Write-Host "💡 故障排除建议:" -ForegroundColor Yellow
    Write-Host "   1. 检查网络连接到GitHub"
    Write-Host "   2. 验证Git配置和权限"
    Write-Host "   3. 检查是否有合并冲突"

    if ($BackupTag) {
        Write-Host "   4. 使用备份恢复: git reset --hard $BackupTag"
    }
    Write-Host ""
    exit 1
}

try {
    # 显示标题
    Write-Host "========================================" -ForegroundColor White
    Write-Host "   SmartAbp 企业级Git安全同步工具" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor White
    Write-Host ""
    Write-Host "功能: 备份 → 拉取 → 合并 → 推送"
    Write-Host "时间: $(Get-Date)"
    Write-Host "模式: $(if ($DryRun) { '预演模式 (DRY RUN)' } else { '执行模式' })"
    Write-Host ""

    # 切换到项目根目录
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    $projectRoot = Split-Path -Parent $scriptPath
    Set-Location $projectRoot

    Write-ColorLog "项目根目录: $projectRoot" "Info"
    Write-Host ""

    # [1/6] 环境检查
    Write-Step "1/6" "环境检查..."

    if (-not (Test-Path ".git")) {
        Handle-Error "当前目录不是Git仓库!"
    }

    try {
        git --version | Out-Null
    }
    catch {
        Handle-Error "Git未安装或不在PATH中!"
    }

    Write-ColorLog "Git环境检查通过 ✓" "Success"
    Write-Host ""

    # [2/6] 本地状态检查
    Write-Step "2/6" "检查本地Git状态..."

    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-ColorLog "检测到本地未提交的更改" "Warning"
        foreach ($change in $gitStatus) {
            Write-Host "     发现未提交的更改: $change"
        }

        if ($AutoCommit) {
            Write-ColorLog "自动提交模式：自动提交本地更改..." "Info"
            $shouldCommit = $true
        } else {
            $response = Read-Host "是否自动提交本地更改? (y/N)"
            $shouldCommit = ($response -eq "y" -or $response -eq "Y")
        }

        if ($shouldCommit) {
            Write-ColorLog "正在自动提交本地更改..." "Info"
            if (-not $DryRun) {
                git add .
                git commit -m "自动提交: $(Get-Date) - Git安全同步前的本地更改"
            }
            Write-ColorLog "本地更改已自动提交" "Success"
        }
        else {
            Write-ColorLog "本地有未提交更改，请先手动处理" "Warning"
            Write-Host ""
            git status
            exit 1
        }
    }
    else {
        Write-ColorLog "本地工作区干净 ✓" "Success"
    }
    Write-Host ""

    # [3/6] 创建本地备份
    Write-Step "3/6" "创建本地Git备份..."

    $backupDir = "tools/git/backups"
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = Join-Path $backupDir "backup_$timestamp"
    $backupTag = "backup_$timestamp"

    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
    }

    # 获取当前分支和HEAD
    $currentBranch = git branch --show-current
    $currentHead = git rev-parse HEAD

    # 保存备份信息
    $currentBranch | Out-File "${backupPath}_branch.txt" -Encoding UTF8
    $currentHead | Out-File "${backupPath}_head.txt" -Encoding UTF8

    # 创建备份标签
    if (-not $DryRun) {
        try {
            git tag $backupTag HEAD
            Write-ColorLog "本地备份已创建: $backupTag" "Success"
            Write-ColorLog "📁 备份位置: $backupPath" "Info"
        }
        catch {
            Write-ColorLog "备份标签创建失败，但继续执行..." "Warning"
        }
    }
    else {
        Write-ColorLog "[DRY RUN] 将创建备份标签: $backupTag" "Info"
    }
    Write-Host ""

    # [4/6] 拉取远程更新
    Write-Step "4/6" "拉取远程仓库更新..."

    Write-ColorLog "正在获取远程更新信息..." "Info"
    if (-not $DryRun) {
        git fetch origin
    }

    # 检查是否有远程更新
    $remoteCommits = git rev-list HEAD..origin/$currentBranch --count

    if ($remoteCommits -eq "0") {
        Write-ColorLog "ℹ️  远程仓库无新更新" "Info"
        $hasRemoteUpdates = $false
    }
    else {
        Write-ColorLog "📥 发现 $remoteCommits 个远程提交需要合并" "Info"
        $hasRemoteUpdates = $true

        Write-Host "     远程更新概要:"
        $remoteLog = git log --oneline HEAD..origin/$currentBranch --max-count=5
        foreach ($line in $remoteLog) {
            Write-Host "       $line"
        }
    }
    Write-Host ""

    # [5/6] 合并远程更新
    if ($hasRemoteUpdates) {
        Write-Step "5/6" "合并远程更新到本地..."
        Write-ColorLog "使用策略: merge (保留完整历史)" "Info"

        if (-not $DryRun) {
            try {
                git merge origin/$currentBranch --no-edit
                Write-ColorLog "远程更新合并成功 ✅" "Success"
            }
            catch {
                Write-ColorLog "合并失败! 可能存在冲突" "Error"
                Write-Host ""
                Write-Host "🚨 冲突解决指南:" -ForegroundColor Red
                Write-Host "   1. 使用 'git status' 查看冲突文件"
                Write-Host "   2. 手动编辑冲突文件"
                Write-Host "   3. 使用 'git add .' 标记已解决"
                Write-Host "   4. 使用 'git commit' 完成合并"
                Write-Host "   5. 重新运行此脚本"
                Write-Host ""
                Write-Host "💡 备份恢复方法:" -ForegroundColor Yellow
                Write-Host "   git reset --hard $backupTag"
                Write-Host ""
                throw
            }
        }
        else {
            Write-ColorLog "[DRY RUN] 将合并远程更新" "Info"
        }
    }
    else {
        Write-Step "5/6" "跳过合并 (无远程更新)"
    }
    Write-Host ""

    # [6/6] 推送到远程仓库
    Write-Step "6/6" "推送合并后的版本到远程仓库..."

    # 检查是否有本地提交需要推送
    $localCommits = git rev-list origin/$currentBranch..HEAD --count

    if ($localCommits -eq "0") {
        Write-ColorLog "ℹ️  无本地提交需要推送" "Info"
        Write-ColorLog "📊 本地与远程已同步" "Info"
    }
    else {
        Write-ColorLog "📤 推送 $localCommits 个本地提交到远程仓库..." "Info"

        if (-not $DryRun) {
            try {
                git push origin $currentBranch
                Write-ColorLog "推送成功 ✅" "Success"
            }
            catch {
                Write-ColorLog "推送失败!" "Error"
                Write-Host ""
                Write-Host "💡 可能的解决方案:" -ForegroundColor Yellow
                Write-Host "   1. 检查网络连接"
                Write-Host "   2. 验证远程仓库权限"
                Write-Host "   3. 使用备份恢复: git reset --hard $backupTag"
                Write-Host ""
                throw
            }
        }
        else {
            Write-ColorLog "[DRY RUN] 将推送 $localCommits 个本地提交" "Info"
        }
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "          🎉 Git同步完成!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # 统计信息
    $stats = @{
        "📥 远程提交合并" = "$remoteCommits 个"
        "📤 本地提交推送" = "$localCommits 个"
        "💾 备份标签" = $backupTag
        "🌿 当前分支" = $currentBranch
        "🔄 同步结果" = "本地与远程仓库完全同步"
        "⏰ 完成时间" = Get-Date
    }

    Write-Host "📊 同步统计:"
    foreach ($key in $stats.Keys) {
        Write-Host "   ${key}: $($stats[$key])"
    }
    Write-Host ""

    # 清理旧备份 (保留最近10个)
    Write-ColorLog "🧹 清理旧备份 (保留最近10个)..." "Info"
    if (-not $DryRun) {
        $backupTags = git tag -l "backup_*" --sort=-creatordate
        $backupCount = 0
        foreach ($tag in $backupTags) {
            $backupCount++
            if ($backupCount -gt 10) {
                try {
                    git tag -d $tag | Out-Null
                    Write-Host "     删除旧备份: $tag"
                }
                catch {
                    # 忽略删除失败
                }
            }
        }
    }

    Write-Host ""
    Write-Host "🎯 提示: 可以使用任务计划程序定期执行此脚本" -ForegroundColor Yellow
    Write-Host "📝 使用参数: -AutoCommit -LogFile 'sync.log' -Verbose" -ForegroundColor Yellow
    Write-Host ""
    Write-ColorLog "✅ Git同步脚本执行完成!" "Success"

}
catch {
    Handle-Error "脚本执行失败: $($_.Exception.Message)" $backupTag
}
