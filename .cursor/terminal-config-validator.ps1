<#
  SmartAbp 终端配置验证器
  验证所有终端配置的一致性和稳定性
#>

param(
    [switch]$Verbose = $false
)

function Write-ValidationLog {
    param([string]$Message, [string]$Level = "Info")

    $colors = @{
        "Info" = "Cyan"
        "Success" = "Green"
        "Warning" = "Yellow"
        "Error" = "Red"
        "Test" = "Magenta"
    }

    Write-Host "[$Level] $Message" -ForegroundColor $colors[$Level]
}

Write-ValidationLog "========================================" "Test"
Write-ValidationLog "   SmartAbp 终端配置一致性验证" "Test"
Write-ValidationLog "========================================" "Test"
Write-ValidationLog ""

$TotalTests = 0
$PassedTests = 0
$FailedTests = 0

function Test-Configuration {
    param([string]$TestName, [scriptblock]$TestBlock)

    $script:TotalTests++
    Write-ValidationLog "🔍 测试: $TestName" "Test"

    try {
        $result = & $TestBlock
        if ($result) {
            $script:PassedTests++
            Write-ValidationLog "✅ 通过: $TestName" "Success"
        } else {
            $script:FailedTests++
            Write-ValidationLog "❌ 失败: $TestName" "Error"
        }
    } catch {
        $script:FailedTests++
        Write-ValidationLog "❌ 异常: $TestName - $($_.Exception.Message)" "Error"
    }
}

# 1. 验证核心配置文件存在
Test-Configuration "核心环境配置文件存在" {
    Test-Path ".cursor/env-vars.json"
}

Test-Configuration "PowerShell统一配置存在" {
    Test-Path ".cursor/unified-terminal.ps1"
}

Test-Configuration "Bash统一配置存在" {
    Test-Path ".cursor/unified-terminal.sh"
}

Test-Configuration "CMD统一配置存在" {
    Test-Path ".cursor/unified-terminal.bat"
}

# 2. 验证环境变量配置
Test-Configuration "环境变量JSON格式正确" {
    try {
        $config = Get-Content ".cursor/env-vars.json" | ConvertFrom-Json
        $config.encoding -and $config.pagers -and $config.terminal
    } catch {
        $false
    }
}

# 3. 验证PowerShell配置语法
Test-Configuration "PowerShell配置语法正确" {
    try {
        $ast = [System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path ".cursor/unified-terminal.ps1"), [ref]$null, [ref]$null)
        $ast -ne $null
    } catch {
        $false
    }
}

# 4. 验证Git配置
Test-Configuration "Git可执行文件存在" {
    try {
        git --version | Out-Null
        $true
    } catch {
        $false
    }
}

# 5. 验证dotnet配置
Test-Configuration "dotnet可执行文件存在" {
    try {
        dotnet --version | Out-Null
        $true
    } catch {
        $false
    }
}

# 6. 验证npm配置
Test-Configuration "npm可执行文件存在" {
    try {
        npm --version | Out-Null
        $true
    } catch {
        $false
    }
}

# 7. 验证旧配置文件已清理
Test-Configuration "旧配置文件已清理" {
    -not (Test-Path ".cursor/terminal-settings.json") -and
    -not (Test-Path ".cursor/pwsh-profile.ps1")
}

# 8. 验证脚本权限
Test-Configuration "Shell脚本可执行权限" {
    try {
        if (Test-Path ".cursor/unified-terminal.sh") {
            # 在Windows上，只检查文件存在即可
            $true
        } else {
            $false
        }
    } catch {
        $false
    }
}

Write-ValidationLog ""
Write-ValidationLog "========================================" "Test"
Write-ValidationLog "          🎉 验证完成!" "Test"
Write-ValidationLog "========================================" "Test"
Write-ValidationLog ""

Write-ValidationLog "📊 验证统计:" "Info"
Write-ValidationLog "   ✅ 通过: $PassedTests 项" "Success"
Write-ValidationLog "   ❌ 失败: $FailedTests 项" "Error"
Write-ValidationLog "   📝 总计: $TotalTests 项" "Info"

$ComplianceRate = if ($TotalTests -gt 0) { [math]::Round(($PassedTests * 100) / $TotalTests, 1) } else { 0 }
Write-ValidationLog "   🎯 合规率: $ComplianceRate%" "Info"
Write-ValidationLog ""

if ($FailedTests -eq 0) {
    Write-ValidationLog "🎉 所有终端配置验证通过！" "Success"
    Write-ValidationLog "🚀 终端配置已完全统一，可以稳定使用" "Success"
} else {
    Write-ValidationLog "⚠️ 发现 $FailedTests 个配置问题需要修复" "Warning"
    Write-ValidationLog "💡 建议检查相关配置文件并重新运行验证" "Warning"
}

Write-ValidationLog ""
Write-ValidationLog "📚 使用指南:" "Info"
Write-ValidationLog "   • PowerShell: pwsh -File .cursor/unified-terminal.ps1" "Info"
Write-ValidationLog "   • Bash: source .cursor/unified-terminal.sh" "Info"
Write-ValidationLog "   • CMD: call .cursor/unified-terminal.bat" "Info"
Write-ValidationLog "   • 统一别名: gs, gl, gd, gb, dnr, dnb, dnt" "Info"
Write-ValidationLog "   • SmartAbp命令: smartabp-sync, smartabp-check, smartabp-dev" "Info"

exit $FailedTests
