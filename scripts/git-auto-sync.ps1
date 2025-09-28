#!/usr/bin/env pwsh
# Git自动同步脚本
# 功能：备份本地版本 -> 拉取远程更新 -> 合并 -> 推送到远程main分支

param(
    [string]$RemoteName = "origin",
    [string]$MainBranch = "main",
    [switch]$Force = $false
)

# 颜色输出函数
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# 错误处理函数
function Handle-Error {
    param([string]$ErrorMessage)
    Write-ColorOutput "❌ 错误: $ErrorMessage" "Red"
    exit 1
}

# 成功信息函数
function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

# 警告信息函数
function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

# 信息函数
function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  $Message" "Cyan"
}

Write-ColorOutput "🚀 开始Git自动同步流程..." "Magenta"
Write-ColorOutput ("=" * 50) "Gray"

# 1. 检查是否在Git仓库中
Write-Info "检查Git仓库状态..."
if (-not (Test-Path ".git")) {
    Handle-Error "当前目录不是Git仓库"
}

# 2. 检查工作区状态
$gitStatus = git status --porcelain
if ($gitStatus -and -not $Force) {
    Write-Warning "工作区有未提交的更改："
    git status --short
    $response = Read-Host "是否要先提交这些更改？(y/n/c=取消)"
    switch ($response.ToLower()) {
        "y" {
            $commitMessage = Read-Host "请输入提交信息"
            if ([string]::IsNullOrWhiteSpace($commitMessage)) {
                $commitMessage = "Auto commit before sync - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            }
            git add .
            git commit -m $commitMessage
            if ($LASTEXITCODE -ne 0) {
                Handle-Error "提交失败"
            }
            Write-Success "更改已提交"
        }
        "n" {
            Write-Warning "继续执行，但未提交的更改可能会丢失"
        }
        "c" {
            Write-Info "操作已取消"
            exit 0
        }
        default {
            Handle-Error "无效选择，操作取消"
        }
    }
}

# 3. 获取当前分支
$currentBranch = git branch --show-current
if ($LASTEXITCODE -ne 0) {
    Handle-Error "无法获取当前分支"
}
Write-Info "当前分支: $currentBranch"

# 4. 创建备份分支
$backupBranch = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Info "创建备份分支: $backupBranch"
git branch $backupBranch
if ($LASTEXITCODE -ne 0) {
    Handle-Error "创建备份分支失败"
}
Write-Success "备份分支创建成功: $backupBranch"

# 5. 切换到主分支（如果不在主分支）
if ($currentBranch -ne $MainBranch) {
    Write-Info "切换到主分支: $MainBranch"
    git checkout $MainBranch
    if ($LASTEXITCODE -ne 0) {
        # 如果主分支不存在，尝试创建
        Write-Warning "主分支不存在，尝试创建..."
        git checkout -b $MainBranch
        if ($LASTEXITCODE -ne 0) {
            Handle-Error "无法切换或创建主分支: $MainBranch"
        }
    }
    Write-Success "已切换到主分支: $MainBranch"
}

# 6. 获取远程更新
Write-Info "获取远程更新..."
git fetch $RemoteName
if ($LASTEXITCODE -ne 0) {
    Handle-Error "获取远程更新失败"
}
Write-Success "远程更新获取成功"

# 7. 检查远程分支是否存在
$remoteBranch = "$RemoteName/$MainBranch"
$remoteBranchExists = git branch -r | Select-String $remoteBranch
if (-not $remoteBranchExists) {
    Write-Warning "远程分支 $remoteBranch 不存在"
    $createRemote = Read-Host "是否要推送当前分支到远程？(y/n)"
    if ($createRemote.ToLower() -eq "y") {
        Write-Info "推送当前分支到远程..."
        git push -u $RemoteName $MainBranch
        if ($LASTEXITCODE -ne 0) {
            Handle-Error "推送到远程失败"
        }
        Write-Success "分支已推送到远程"
        exit 0
    } else {
        Handle-Error "远程分支不存在，操作取消"
    }
}

# 8. 检查是否有冲突
Write-Info "检查本地和远程的差异..."
$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse "$remoteBranch"

if ($localCommit -eq $remoteCommit) {
    Write-Success "本地和远程已同步，无需操作"
    exit 0
}

# 9. 尝试合并远程更改
Write-Info "合并远程更改..."
git merge "$remoteBranch" --no-edit
$mergeResult = $LASTEXITCODE

if ($mergeResult -ne 0) {
    Write-Warning "合并过程中出现冲突"
    Write-Info "请手动解决冲突后运行以下命令："
    Write-ColorOutput "git add ." "Yellow"
    Write-ColorOutput "git commit -m 'Resolve merge conflicts'" "Yellow"
    Write-ColorOutput "git push $RemoteName $MainBranch" "Yellow"
    Write-Info "备份分支: $backupBranch"
    exit 1
}

Write-Success "远程更改合并成功"

# 10. 推送到远程
Write-Info "推送更改到远程..."
git push $RemoteName $MainBranch
if ($LASTEXITCODE -ne 0) {
    Handle-Error "推送到远程失败"
}
Write-Success "更改已推送到远程"

# 11. 清理备份分支（可选）
$cleanupBackup = Read-Host "是否删除备份分支 $backupBranch？(y/n)"
if ($cleanupBackup.ToLower() -eq "y") {
    git branch -d $backupBranch
    if ($LASTEXITCODE -eq 0) {
        Write-Success "备份分支已删除"
    } else {
        Write-Warning "备份分支删除失败，请手动删除"
    }
} else {
    Write-Info "备份分支保留: $backupBranch"
}

Write-ColorOutput ("=" * 50) "Gray"
Write-Success "🎉 Git自动同步完成！"
Write-Info "总结："
Write-Info "- 备份分支: $backupBranch"
Write-Info "- 当前分支: $MainBranch"
Write-Info "- 远程同步: 完成"