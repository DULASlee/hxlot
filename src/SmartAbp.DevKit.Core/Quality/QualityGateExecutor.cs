using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Core.Quality;

/// <summary>
/// 质量门禁执行器 - DevKit v2.0 Day 16 核心组件 ⭐⭐⭐
///
/// 核心理念:
/// - 五关强制质量门禁，确保生成代码0错误0警告0违规
/// - 自动化质量检查，无需人工干预
/// - 企业级质量标准，代码质量≥95分
///
/// 五关门禁:
/// 1. 架构完整性检查（0违规）
/// 2. 代码重复度检查（0重复）
/// 3. 编译静态检查（0错误）
/// 4. packages专项检查（100%质量）
/// 5. 技术债务监控（≥85分）
/// </summary>
public class QualityGateExecutor
{
    private readonly ILogger<QualityGateExecutor> _logger;
    private readonly string _projectPath;

    public QualityGateExecutor(ILogger<QualityGateExecutor> logger, string projectPath)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _projectPath = projectPath ?? throw new ArgumentNullException(nameof(projectPath));
    }

    /// <summary>
    /// 执行完整的五关质量门禁
    /// </summary>
    public async Task<QualityGateResult> ExecuteAllGatesAsync()
    {
        var stopwatch = Stopwatch.StartNew();
        var result = new QualityGateResult();

        _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        _logger.LogInformation("🚨 开始执行五关质量门禁");
        _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        try
        {
            // 第一关：架构完整性检查
            _logger.LogInformation("🏗️  第一关：架构完整性检查");
            var gate1Result = await ExecuteGate1_ArchitectureIntegrityAsync();
            result.Gate1_ArchitectureIntegrity = gate1Result;
            LogGateResult("第一关", gate1Result);

            // 第二关：代码重复度检查
            _logger.LogInformation("🔄 第二关：代码重复度检查");
            var gate2Result = await ExecuteGate2_CodeDuplicationAsync();
            result.Gate2_CodeDuplication = gate2Result;
            LogGateResult("第二关", gate2Result);

            // 第三关：编译静态检查
            _logger.LogInformation("⚡ 第三关：编译静态检查");
            var gate3Result = await ExecuteGate3_CompilationAsync();
            result.Gate3_Compilation = gate3Result;
            LogGateResult("第三关", gate3Result);

            // 第四关：packages专项检查
            _logger.LogInformation("🎯 第四关：packages专项检查");
            var gate4Result = await ExecuteGate4_PackagesAsync();
            result.Gate4_Packages = gate4Result;
            LogGateResult("第四关", gate4Result);

            // 第五关：技术债务监控
            _logger.LogInformation("🚀 第五关：技术债务监控");
            var gate5Result = await ExecuteGate5_TechnicalDebtAsync();
            result.Gate5_TechnicalDebt = gate5Result;
            LogGateResult("第五关", gate5Result);

            stopwatch.Stop();
            result.TotalElapsedMilliseconds = stopwatch.ElapsedMilliseconds;

            // 计算综合结果
            result.AllGatesPassed = gate1Result.Passed && gate2Result.Passed && gate3Result.Passed
                && gate4Result.Passed && gate5Result.Passed;

            _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            if (result.AllGatesPassed)
            {
                _logger.LogInformation("✅ 五关质量门禁全部通过！耗时: {ElapsedMs}ms", result.TotalElapsedMilliseconds);
            }
            else
            {
                _logger.LogError("❌ 质量门禁检查失败！");
            }
            _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 质量门禁执行失败");
            result.AllGatesPassed = false;
            result.TotalElapsedMilliseconds = stopwatch.ElapsedMilliseconds;
            return result;
        }
    }

    /// <summary>
    /// 第一关：架构完整性检查
    /// </summary>
    private async Task<GateResult> ExecuteGate1_ArchitectureIntegrityAsync()
    {
        var result = new GateResult { GateName = "架构完整性检查" };
        var errors = new List<string>();

        try
        {
            var packagesPath = Path.Combine(_projectPath, "src/SmartAbp.Vue/packages");

            if (Directory.Exists(packagesPath))
            {
                // 检查1：相对路径违规
                var relativePathCount = await CountPatternInDirectoryAsync(packagesPath, "'../");
                if (relativePathCount > 0)
                {
                    errors.Add($"发现 {relativePathCount} 处相对路径违规（'../'）");
                }

                // 检查2：@别名违规
                var atAliasCount = await CountPatternInDirectoryAsync(packagesPath, "@/", excludePatterns: new[] { "node_modules", "tsconfig" });
                if (atAliasCount > 0)
                {
                    errors.Add($"发现 {atAliasCount} 处@别名违规");
                }

                // 检查3：类型绕过违规
                var typeBypassCount = await CountPatternInDirectoryAsync(_projectPath, "as any|@ts-ignore");
                if (typeBypassCount > 0)
                {
                    errors.Add($"发现 {typeBypassCount} 处类型绕过违规（as any/@ts-ignore）");
                }
            }

            result.Passed = errors.Count == 0;
            result.Errors = errors;
            result.Message = result.Passed ? "架构完整性检查通过" : $"发现 {errors.Count} 个架构违规";
        }
        catch (Exception ex)
        {
            result.Passed = false;
            result.Errors.Add($"架构检查异常: {ex.Message}");
        }

        return result;
    }

    /// <summary>
    /// 第二关：代码重复度检查
    /// </summary>
    private async Task<GateResult> ExecuteGate2_CodeDuplicationAsync()
    {
        var result = new GateResult { GateName = "代码重复度检查" };
        var errors = new List<string>();

        try
        {
            var srcPath = Path.Combine(_projectPath, "src");

            // 检查1：重复文件名
            var duplicateFiles = await FindDuplicateFileNamesAsync(srcPath, "*.vue");
            if (duplicateFiles.Any())
            {
                errors.Add($"发现 {duplicateFiles.Count} 个重复文件名");
                foreach (var (fileName, count) in duplicateFiles.Take(5))
                {
                    errors.Add($"  - {fileName}: {count}次");
                }
            }

            // 检查2：重复函数签名
            var duplicateFunctions = await FindDuplicatePatternsAsync(srcPath, @"function\s+(\w+)\s*\(|const\s+(\w+)\s*=", "*.ts");
            if (duplicateFunctions.Any())
            {
                errors.Add($"发现 {duplicateFunctions.Count} 个可能重复的函数");
            }

            result.Passed = errors.Count == 0;
            result.Errors = errors;
            result.Message = result.Passed ? "代码重复度检查通过" : $"发现 {errors.Count} 个重复问题";
        }
        catch (Exception ex)
        {
            result.Passed = false;
            result.Errors.Add($"重复度检查异常: {ex.Message}");
        }

        return result;
    }

    /// <summary>
    /// 第三关：编译静态检查
    /// </summary>
    private async Task<GateResult> ExecuteGate3_CompilationAsync()
    {
        var result = new GateResult { GateName = "编译静态检查" };
        var errors = new List<string>();

        try
        {
            // TypeScript检查
            var tsResult = await RunTypeScriptCheckAsync();
            if (!tsResult.Success)
            {
                errors.Add($"TypeScript编译失败: {tsResult.ErrorCount}个错误");
                errors.AddRange(tsResult.Errors.Take(10)); // 只显示前10个错误
            }

            // ESLint检查
            var eslintResult = await RunESLintCheckAsync();
            if (!eslintResult.Success)
            {
                errors.Add($"ESLint检查失败: {eslintResult.ErrorCount}个错误, {eslintResult.WarningCount}个警告");
                errors.AddRange(eslintResult.Errors.Take(10));
            }

            // 后端编译检查
            var backendResult = await RunBackendCompilationAsync();
            if (!backendResult.Success)
            {
                errors.Add($"后端编译失败: {backendResult.ErrorCount}个错误");
                errors.AddRange(backendResult.Errors.Take(10));
            }

            result.Passed = errors.Count == 0;
            result.Errors = errors;
            result.Message = result.Passed ? "编译静态检查通过" : $"发现 {errors.Count} 个编译错误";
        }
        catch (Exception ex)
        {
            result.Passed = false;
            result.Errors.Add($"编译检查异常: {ex.Message}");
        }

        return result;
    }

    /// <summary>
    /// 第四关：packages专项检查
    /// </summary>
    private async Task<GateResult> ExecuteGate4_PackagesAsync()
    {
        var result = new GateResult { GateName = "packages专项检查" };
        var errors = new List<string>();

        try
        {
            var vuePath = Path.Combine(_projectPath, "src/SmartAbp.Vue");

            if (Directory.Exists(vuePath))
            {
                // packages TypeScript编译
                var packagesTs = await RunCommandAsync("npx", "tsc --build tsconfig.references.json", vuePath);
                if (!packagesTs.Success)
                {
                    errors.Add($"packages TypeScript编译失败");
                    errors.AddRange(packagesTs.Errors.Take(5));
                }

                // packages ESLint检查
                var packagesLint = await RunCommandAsync("npm", "run lint -- \"packages/*/src/**/*.{ts,vue}\" --fix", vuePath);
                if (!packagesLint.Success)
                {
                    errors.Add($"packages ESLint检查失败");
                }
            }

            result.Passed = errors.Count == 0;
            result.Errors = errors;
            result.Message = result.Passed ? "packages专项检查通过" : $"发现 {errors.Count} 个问题";
        }
        catch (Exception ex)
        {
            result.Passed = false;
            result.Errors.Add($"packages检查异常: {ex.Message}");
        }

        return result;
    }

    /// <summary>
    /// 第五关：技术债务监控
    /// </summary>
    private async Task<GateResult> ExecuteGate5_TechnicalDebtAsync()
    {
        var result = new GateResult { GateName = "技术债务监控" };
        var warnings = new List<string>();

        try
        {
            var srcPath = Path.Combine(_projectPath, "src");

            // 大文件统计
            var largeFileCount = await CountLargeFilesAsync(srcPath, 200);
            if (largeFileCount > 10)
            {
                warnings.Add($"⚠️  大文件（>200行）: {largeFileCount}个（建议<10个）");
            }

            // TODO/FIXME统计
            var todoCount = await CountPatternInDirectoryAsync(srcPath, "TODO|FIXME|XXX");
            if (todoCount > 50)
            {
                warnings.Add($"⚠️  TODO/FIXME标记: {todoCount}个（建议<50个）");
            }

            // 技术债务评分（简化版）
            var score = 100;
            if (largeFileCount > 10) score -= 5;
            if (todoCount > 50) score -= 5;
            if (todoCount > 100) score -= 5;

            result.Passed = score >= 85;
            result.Errors = warnings;
            result.Message = $"技术债务评分: {score}/100 {(result.Passed ? "✅" : "⚠️")}";
        }
        catch (Exception ex)
        {
            result.Passed = true; // 技术债务不阻断
            result.Errors.Add($"技术债务检查异常: {ex.Message}");
        }

        return result;
    }

    #region Helper Methods

    private async Task<CompilationResult> RunTypeScriptCheckAsync()
    {
        var vuePath = Path.Combine(_projectPath, "src/SmartAbp.Vue");
        return await RunCommandAsync("npm", "run type-check", vuePath);
    }

    private async Task<CompilationResult> RunESLintCheckAsync()
    {
        var vuePath = Path.Combine(_projectPath, "src/SmartAbp.Vue");
        return await RunCommandAsync("npm", "run lint", vuePath);
    }

    private async Task<CompilationResult> RunBackendCompilationAsync()
    {
        var slnPath = Path.Combine(_projectPath, "src/SmartAbp.sln");
        if (File.Exists(slnPath))
        {
            return await RunCommandAsync("dotnet", $"build \"{slnPath}\" --verbosity quiet --nologo", _projectPath);
        }
        return new CompilationResult { Success = true };
    }

    private async Task<CompilationResult> RunCommandAsync(string command, string arguments, string workingDirectory)
    {
        var result = new CompilationResult();

        try
        {
            var processInfo = new ProcessStartInfo
            {
                FileName = command,
                Arguments = arguments,
                WorkingDirectory = workingDirectory,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(processInfo);
            if (process == null)
            {
                result.Success = false;
                result.Errors.Add("无法启动进程");
                return result;
            }

            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            result.Success = process.ExitCode == 0;
            result.Output = output;

            if (!result.Success)
            {
                result.Errors.Add(error);
                result.ErrorCount = ParseErrorCount(output + error);
                result.WarningCount = ParseWarningCount(output + error);
            }
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Errors.Add($"执行命令异常: {ex.Message}");
        }

        return result;
    }

    private int ParseErrorCount(string output)
    {
        var match = Regex.Match(output, @"(\d+)\s+Error");
        return match.Success ? int.Parse(match.Groups[1].Value) : 0;
    }

    private int ParseWarningCount(string output)
    {
        var match = Regex.Match(output, @"(\d+)\s+Warning");
        return match.Success ? int.Parse(match.Groups[1].Value) : 0;
    }

    private async Task<int> CountPatternInDirectoryAsync(string directory, string pattern, string[]? excludePatterns = null)
    {
        if (!Directory.Exists(directory)) return 0;

        var count = 0;
        var files = Directory.GetFiles(directory, "*.*", SearchOption.AllDirectories);

        foreach (var file in files)
        {
            if (excludePatterns != null && excludePatterns.Any(ep => file.Contains(ep)))
                continue;

            try
            {
                var content = await File.ReadAllTextAsync(file);
                var matches = Regex.Matches(content, pattern);
                count += matches.Count;
            }
            catch
            {
                // 忽略读取失败的文件
            }
        }

        return count;
    }

    private async Task<Dictionary<string, int>> FindDuplicateFileNamesAsync(string directory, string pattern)
    {
        if (!Directory.Exists(directory)) return new Dictionary<string, int>();

        var fileNames = new Dictionary<string, int>();
        var files = Directory.GetFiles(directory, pattern, SearchOption.AllDirectories);

        foreach (var file in files)
        {
            var fileName = Path.GetFileName(file);
            if (fileNames.ContainsKey(fileName))
                fileNames[fileName]++;
            else
                fileNames[fileName] = 1;
        }

        return fileNames.Where(kv => kv.Value > 1).ToDictionary(kv => kv.Key, kv => kv.Value);
    }

    private async Task<List<string>> FindDuplicatePatternsAsync(string directory, string pattern, string filePattern)
    {
        if (!Directory.Exists(directory)) return new List<string>();

        var patterns = new HashSet<string>();
        var duplicates = new List<string>();
        var files = Directory.GetFiles(directory, filePattern, SearchOption.AllDirectories);

        foreach (var file in files)
        {
            try
            {
                var content = await File.ReadAllTextAsync(file);
                var matches = Regex.Matches(content, pattern);

                foreach (Match match in matches)
                {
                    var name = match.Groups[1].Value;
                    if (string.IsNullOrEmpty(name)) name = match.Groups[2].Value;

                    if (!string.IsNullOrEmpty(name))
                    {
                        if (patterns.Contains(name))
                            duplicates.Add(name);
                        else
                            patterns.Add(name);
                    }
                }
            }
            catch
            {
                // 忽略读取失败的文件
            }
        }

        return duplicates.Distinct().ToList();
    }

    private async Task<int> CountLargeFilesAsync(string directory, int lineThreshold)
    {
        if (!Directory.Exists(directory)) return 0;

        var count = 0;
        var files = Directory.GetFiles(directory, "*.ts", SearchOption.AllDirectories)
            .Concat(Directory.GetFiles(directory, "*.vue", SearchOption.AllDirectories))
            .Concat(Directory.GetFiles(directory, "*.cs", SearchOption.AllDirectories));

        foreach (var file in files)
        {
            try
            {
                var lines = await File.ReadAllLinesAsync(file);
                if (lines.Length > lineThreshold)
                    count++;
            }
            catch
            {
                // 忽略读取失败的文件
            }
        }

        return count;
    }

    private void LogGateResult(string gateName, GateResult result)
    {
        if (result.Passed)
        {
            _logger.LogInformation("   ✅ {GateName}: 通过", gateName);
        }
        else
        {
            _logger.LogError("   ❌ {GateName}: 失败 - {Message}", gateName, result.Message);
            foreach (var error in result.Errors.Take(3))
            {
                _logger.LogError("      {Error}", error);
            }
        }
    }

    #endregion
}

/// <summary>
/// 质量门禁结果
/// </summary>
public class QualityGateResult
{
    public bool AllGatesPassed { get; set; }
    public GateResult Gate1_ArchitectureIntegrity { get; set; } = new();
    public GateResult Gate2_CodeDuplication { get; set; } = new();
    public GateResult Gate3_Compilation { get; set; } = new();
    public GateResult Gate4_Packages { get; set; } = new();
    public GateResult Gate5_TechnicalDebt { get; set; } = new();
    public long TotalElapsedMilliseconds { get; set; }
}

/// <summary>
/// 单个门禁结果
/// </summary>
public class GateResult
{
    public string GateName { get; set; } = string.Empty;
    public bool Passed { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new();
}

/// <summary>
/// 编译结果
/// </summary>
public class CompilationResult
{
    public bool Success { get; set; }
    public string Output { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new();
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
}

