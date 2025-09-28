# Cursor IDE Performance Optimizer - 企业级性能优化脚本
# 专为SmartAbp低代码引擎开发环境设计
# 作者: 首席架构师 | 版本: v1.0

param(
    [switch]$Deep = $false,           # 深度清理模式
    [switch]$Backup = $true,          # 备份重要配置
    [switch]$DryRun = $false,         # 预演模式
    [switch]$Restart = $false,        # 清理后重启Cursor
    [switch]$Verbose = $false,        # 详细输出
    [int]$KeepDays = 7               # 保留最近N天的日志
)

# 设置错误处理和安全模式
$ErrorActionPreference = "Continue"

# 安全检查：确保不在管理员模式下运行危险操作
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if ($isAdmin -and $Deep) {
    Write-Log "⚠️ 检测到管理员模式 + 深度清理，建议在普通用户模式下运行" "Warning"
    Write-Log "   深度清理模式已自动降级为标准模式" "Warning"
    $Deep = $false
}

# 全局变量
$Script:TotalCleaned = 0
$Script:FilesProcessed = 0
$Script:BackupPath = ""

# 日志函数
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "Info"
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $colorMap = @{
        "Info" = "Cyan"
        "Success" = "Green"
        "Warning" = "Yellow"
        "Error" = "Red"
        "Progress" = "Magenta"
    }

    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $colorMap[$Level]
}

# 获取文件夹大小
function Get-FolderSize {
    param([string]$Path)

    if (-not (Test-Path $Path)) { return 0 }

    try {
        $size = (Get-ChildItem -Path $Path -Recurse -File -ErrorAction SilentlyContinue |
                Measure-Object -Property Length -Sum).Sum
        return [math]::Round($size / 1MB, 2)
    }
    catch {
        return 0
    }
}

# 安全删除函数
function Remove-SafelyWithBackup {
    param(
        [string]$Path,
        [string]$Description,
        [bool]$BackupFirst = $false
    )

    if (-not (Test-Path $Path)) {
        Write-Log "路径不存在，跳过: $Path" "Warning"
        return
    }

    $sizeMB = Get-FolderSize $Path

    if ($DryRun) {
        Write-Log "[DRY RUN] 将清理 $Description : $Path ($sizeMB MB)" "Progress"
        return
    }

    # 备份重要配置
    if ($BackupFirst -and $Backup -and $sizeMB -gt 0) {
        $backupName = Split-Path $Path -Leaf
        $backupTarget = Join-Path $Script:BackupPath "$backupName-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

        try {
            Copy-Item -Path $Path -Destination $backupTarget -Recurse -Force
            Write-Log "已备份 $Description 到: $backupTarget" "Success"
        }
        catch {
            Write-Log "备份失败: $($_.Exception.Message)" "Error"
        }
    }

    # 执行清理
    try {
        if (Test-Path $Path -PathType Container) {
            Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
        } else {
            Remove-Item -Path $Path -Force -ErrorAction Stop
        }

        Write-Log "✅ 已清理 $Description : $sizeMB MB" "Success"
        $Script:TotalCleaned += $sizeMB
        $Script:FilesProcessed++
    }
    catch {
        Write-Log "清理失败 $Description : $($_.Exception.Message)" "Error"
    }
}

# 清理旧文件
function Clear-OldFiles {
    param(
        [string]$Path,
        [int]$DaysToKeep,
        [string]$Description
    )

    if (-not (Test-Path $Path)) { return }

    $cutoffDate = (Get-Date).AddDays(-$DaysToKeep)

    try {
        $oldFiles = Get-ChildItem -Path $Path -Recurse -File |
                   Where-Object { $_.LastWriteTime -lt $cutoffDate }

        $totalSize = ($oldFiles | Measure-Object -Property Length -Sum).Sum / 1MB
        $totalSize = [math]::Round($totalSize, 2)

        if ($DryRun) {
            Write-Log "[DRY RUN] 将清理 $Description 中 $DaysToKeep 天前的文件: $totalSize MB" "Progress"
            return
        }

        foreach ($file in $oldFiles) {
            Remove-Item -Path $file.FullName -Force -ErrorAction SilentlyContinue
        }

        if ($totalSize -gt 0) {
            Write-Log "✅ 已清理 $Description 旧文件: $totalSize MB" "Success"
            $Script:TotalCleaned += $totalSize
        }
    }
    catch {
        Write-Log "清理旧文件失败: $($_.Exception.Message)" "Error"
    }
}

# 主清理函数
function Start-CursorCleanup {
    Write-Log "========================================" "Progress"
    Write-Log "   Cursor IDE 企业级性能优化工具" "Progress"
    Write-Log "========================================" "Progress"
    Write-Log "开始时间: $(Get-Date)" "Info"
    Write-Log "清理模式: $(if ($Deep) { '深度清理' } else { '标准清理' })" "Info"
    Write-Log "执行模式: $(if ($DryRun) { '预演模式' } else { '实际清理' })" "Info"
    Write-Log "" "Info"

    # 创建备份目录
    if ($Backup -and -not $DryRun) {
        $Script:BackupPath = Join-Path $env:TEMP "CursorBackup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        New-Item -ItemType Directory -Path $Script:BackupPath -Force | Out-Null
        Write-Log "备份目录: $Script:BackupPath" "Info"
    }

    # 检测Cursor进程
    $cursorProcesses = Get-Process -Name "Cursor*" -ErrorAction SilentlyContinue
    if ($cursorProcesses) {
        Write-Log "⚠️  检测到 $($cursorProcesses.Count) 个Cursor进程正在运行" "Warning"
        if (-not $DryRun) {
            $response = Read-Host "是否关闭Cursor进程以进行清理? (y/N)"
            if ($response -eq "y" -or $response -eq "Y") {
                $cursorProcesses | Stop-Process -Force
                Write-Log "已关闭Cursor进程" "Success"
                Start-Sleep -Seconds 3
            } else {
                Write-Log "⚠️  在Cursor运行时清理可能效果有限" "Warning"
            }
        }
    }

    # Cursor安装和配置路径
    $userProfile = $env:USERPROFILE
    $appData = $env:APPDATA
    $localAppData = $env:LOCALAPPDATA

    $cursorPaths = @{
        # 用户配置和缓存
        "UserData" = @{
            "Path" = "$appData\Cursor\User"
            "Description" = "用户配置数据"
            "Backup" = $true
            "DeepOnly" = $false
        }
        "Logs" = @{
            "Path" = "$appData\Cursor\logs"
            "Description" = "应用日志"
            "Backup" = $false
            "DeepOnly" = $false
        }
        "CachedExtensions" = @{
            "Path" = "$appData\Cursor\CachedExtensions"
            "Description" = "扩展缓存"
            "Backup" = $false
            "DeepOnly" = $false
        }
        "ExtensionHost" = @{
            "Path" = "$appData\Cursor\CachedExtensionVSIXs"
            "Description" = "扩展安装包缓存"
            "Backup" = $false
            "DeepOnly" = $false
        }

        # 本地应用数据
        "LocalStorage" = @{
            "Path" = "$localAppData\Cursor\User\workspaceStorage"
            "Description" = "工作区存储"
            "Backup" = $true
            "DeepOnly" = $false
        }
        "GPUCache" = @{
            "Path" = "$localAppData\Cursor\GPUCache"
            "Description" = "GPU缓存"
            "Backup" = $false
            "DeepOnly" = $false
        }
        "ShaderCache" = @{
            "Path" = "$localAppData\Cursor\ShaderCache"
            "Description" = "着色器缓存"
            "Backup" = $false
            "DeepOnly" = $false
        }
        "WebCache" = @{
            "Path" = "$localAppData\Cursor\User\CachedData"
            "Description" = "Web缓存数据"
            "Backup" = $false
            "DeepOnly" = $false
        }

        # 深度清理项目
        "CrashDumps" = @{
            "Path" = "$localAppData\Cursor\Crashpad\reports"
            "Description" = "崩溃转储文件"
            "Backup" = $false
            "DeepOnly" = $true
        }
        "TempFiles" = @{
            "Path" = "$localAppData\Cursor\User\tmp"
            "Description" = "临时文件"
            "Backup" = $false
            "DeepOnly" = $true
        }
    }

    # 执行清理
    Write-Log "🧹 开始清理Cursor IDE文件..." "Progress"

    foreach ($item in $cursorPaths.GetEnumerator()) {
        $config = $item.Value

        # 检查是否需要深度清理
        if ($config.DeepOnly -and -not $Deep) {
            continue
        }

        Remove-SafelyWithBackup -Path $config.Path -Description $config.Description -BackupFirst $config.Backup
    }

    # 清理扩展市场缓存
    Write-Log "🔌 清理扩展相关缓存..." "Progress"
    $extensionPaths = @(
        "$appData\Cursor\User\extensions\.obsolete",
        "$appData\Cursor\User\extensions\.tmp",
        "$localAppData\Cursor\User\extensions\.obsolete"
    )

    foreach ($path in $extensionPaths) {
        if (Test-Path $path) {
            Remove-SafelyWithBackup -Path $path -Description "过期扩展文件"
        }
    }

    # 清理旧日志文件
    Write-Log "📋 清理旧日志文件..." "Progress"
    $logPaths = @(
        "$appData\Cursor\logs",
        "$localAppData\Cursor\logs"
    )

    foreach ($path in $logPaths) {
        Clear-OldFiles -Path $path -DaysToKeep $KeepDays -Description "Cursor日志"
    }

    # 清理Node.js和npm缓存（如果存在）
    if ($Deep) {
        Write-Log "🟢 深度清理模式：清理Node.js相关缓存..." "Progress"

        $nodeCachePaths = @(
            "$appData\npm-cache",
            "$localAppData\npm-cache",
            "$userProfile\.npm",
            "$userProfile\.node-gyp"
        )

        foreach ($path in $nodeCachePaths) {
            if (Test-Path $path) {
                $size = Get-FolderSize $path
                if ($size -gt 100) {  # 只清理大于100MB的缓存
                    Remove-SafelyWithBackup -Path $path -Description "Node.js缓存 ($size MB)"
                }
            }
        }
    }

    # 清理Windows临时文件中的Cursor相关文件
    Write-Log "🗑️  清理系统临时文件中的Cursor数据..." "Progress"
    $tempCursorPath = "$env:TEMP\cursor*"
    Get-ChildItem -Path $env:TEMP -Filter "cursor*" -ErrorAction SilentlyContinue |
        ForEach-Object {
            Remove-SafelyWithBackup -Path $_.FullName -Description "临时Cursor文件"
        }

    # 注册表清理（深度模式 - 仅备份，避免系统不稳定）
    if ($Deep -and -not $DryRun) {
        Write-Log "📝 深度清理模式：备份注册表项（避免系统不稳定）..." "Progress"
        try {
            $regPaths = @(
                "HKCU:\Software\Cursor"
            )

            foreach ($regPath in $regPaths) {
                if (Test-Path $regPath) {
                    if ($Backup) {
                        $regBackup = Join-Path $Script:BackupPath "registry-$(Split-Path $regPath -Leaf).reg"
                        reg export $regPath.Replace(":", "") $regBackup /y 2>$null
                        Write-Log "注册表已备份: $regPath -> $regBackup" "Success"
                    }
                }
            }
            Write-Log "⚠️ 跳过HKLM注册表清理以避免系统不稳定" "Warning"
        }
        catch {
            Write-Log "注册表备份失败: $($_.Exception.Message)" "Error"
        }
    }
}

# 性能优化建议
function Show-PerformanceRecommendations {
    Write-Log "" "Info"
    Write-Log "🚀 性能优化建议:" "Progress"
    Write-Log "1. 定期运行此脚本（建议每周一次）" "Info"
    Write-Log "2. 禁用不必要的扩展以减少内存使用" "Info"
    Write-Log "3. 定期重启Cursor IDE以释放内存" "Info"
    Write-Log "4. 确保有足够的磁盘空间（建议至少5GB）" "Info"
    Write-Log "5. 关闭不必要的文件和标签页" "Info"
    Write-Log "6. 使用排除列表避免索引大型node_modules目录" "Info"
    Write-Log "" "Info"

    # 系统资源检查
    $disk = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 }
    $memory = Get-WmiObject -Class Win32_ComputerSystem

    Write-Log "💻 系统资源状态:" "Progress"
    foreach ($d in $disk) {
        $freeGB = [math]::Round($d.FreeSpace / 1GB, 2)
        $totalGB = [math]::Round($d.Size / 1GB, 2)
        $freePercent = [math]::Round(($d.FreeSpace / $d.Size) * 100, 1)

        $status = if ($freePercent -lt 10) { "Error" } elseif ($freePercent -lt 20) { "Warning" } else { "Success" }
        Write-Log "磁盘 $($d.DeviceID) $freeGB GB 可用 / $totalGB GB 总计 ($freePercent%)" $status
    }

    $totalRAM = [math]::Round($memory.TotalPhysicalMemory / 1GB, 2)
    Write-Log "系统内存: $totalRAM GB" "Info"
}

# 重启Cursor
function Restart-Cursor {
    if ($Restart -and -not $DryRun) {
        Write-Log "🔄 重启Cursor IDE..." "Progress"
        Start-Sleep -Seconds 2

        # 查找Cursor安装路径
        $cursorPaths = @(
            "$env:LOCALAPPDATA\Programs\cursor\Cursor.exe",
            "$env:ProgramFiles\Cursor\Cursor.exe",
            "$env:ProgramFiles(x86)\Cursor\Cursor.exe"
        )

        $cursorExe = $cursorPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

        if ($cursorExe) {
            Start-Process -FilePath $cursorExe -WorkingDirectory (Get-Location)
            Write-Log "✅ Cursor IDE 已重启" "Success"
        } else {
            Write-Log "⚠️  未找到Cursor安装路径，请手动启动" "Warning"
        }
    }
}

# 主执行逻辑
try {
    Start-CursorCleanup

    Write-Log "" "Info"
    Write-Log "========================================" "Success"
    Write-Log "          🎉 清理完成!" "Success"
    Write-Log "========================================" "Success"
    Write-Log "📊 清理统计:" "Info"
    Write-Log "   💾 释放磁盘空间: $Script:TotalCleaned MB" "Success"
    Write-Log "   📁 处理项目数: $Script:FilesProcessed 个" "Success"

    if ($Script:BackupPath -and (Test-Path $Script:BackupPath)) {
        $backupSize = Get-FolderSize $Script:BackupPath
        Write-Log "   💼 备份大小: $backupSize MB" "Info"
        Write-Log "   📂 备份位置: $Script:BackupPath" "Info"
    }

    Write-Log "   ⏰ 完成时间: $(Get-Date)" "Info"
    Write-Log "" "Info"

    Show-PerformanceRecommendations
    Restart-Cursor

    Write-Log "✅ Cursor IDE 性能优化完成!" "Success"
}
catch {
    Write-Log "脚本执行失败: $($_.Exception.Message)" "Error"
    exit 1
}
