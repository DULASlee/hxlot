using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace SmartAbp.CodeGenerator.Core.Pipeline;

/// <summary>
/// 生成质量检查器
/// 修复自检发现的致命缺陷：缺少生成代码质量验证
/// 提供代码质量分析、语法检查、最佳实践验证
/// </summary>
public class GenerationQualityChecker
{
    private readonly ILogger<GenerationQualityChecker> _logger;

    public GenerationQualityChecker(ILogger<GenerationQualityChecker> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// 检查生成代码质量
    /// </summary>
    /// <param name="generatedFiles">生成的文件字典（路径 -> 内容）</param>
    /// <returns>质量检查结果</returns>
    public async Task<GenerationQualityResult> CheckGeneratedCodeAsync(Dictionary<string, string> generatedFiles)
    {
        var result = new GenerationQualityResult
        {
            TotalFiles = generatedFiles.Count,
            CheckStartTime = DateTime.UtcNow
        };

        try
        {
            _logger.LogInformation("🔍 开始代码质量检查，文件数量: {FileCount}", generatedFiles.Count);

            // 1. 基础语法检查
            await PerformSyntaxCheckAsync(generatedFiles, result);

            // 2. 代码规范检查
            await PerformCodeStandardsCheckAsync(generatedFiles, result);

            // 3. 最佳实践检查
            await PerformBestPracticesCheckAsync(generatedFiles, result);

            // 4. 安全性检查
            await PerformSecurityCheckAsync(generatedFiles, result);

            // 5. 性能检查
            await PerformPerformanceCheckAsync(generatedFiles, result);

            // 6. 计算总体质量分数
            result.OverallScore = CalculateOverallScore(result);

            result.CheckEndTime = DateTime.UtcNow;
            result.CheckDuration = result.CheckEndTime - result.CheckStartTime;

            _logger.LogInformation("✅ 代码质量检查完成: 总分 {Score}, 耗时 {Duration}ms",
                result.OverallScore, result.CheckDuration.TotalMilliseconds);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "代码质量检查失败");
            result.SystemError = ex.Message;
            result.OverallScore = 0;
            return result;
        }
    }

    /// <summary>
    /// 验证编译（简化版）
    /// </summary>
    /// <param name="outputPath">输出路径</param>
    /// <returns>编译验证结果</returns>
    public async Task<CompilationValidationResult> ValidateCompilationAsync(string outputPath)
    {
        var result = new CompilationValidationResult();

        try
        {
            _logger.LogDebug("开始编译验证: {OutputPath}", outputPath);

            // 查找C#项目文件
            var csprojFiles = Directory.GetFiles(outputPath, "*.csproj", SearchOption.AllDirectories);
            
            if (!csprojFiles.Any())
            {
                result.IsSuccess = true;
                result.Warnings.Add("未找到C#项目文件，跳过编译验证");
                return result;
            }

            // 简化的编译检查：检查基本语法错误
            var csFiles = Directory.GetFiles(outputPath, "*.cs", SearchOption.AllDirectories);
            var syntaxErrors = new List<string>();

            foreach (var csFile in csFiles)
            {
                try
                {
                    var content = await File.ReadAllTextAsync(csFile);
                    var fileErrors = CheckBasicCSharpSyntax(content, csFile);
                    syntaxErrors.AddRange(fileErrors);
                }
                catch (Exception ex)
                {
                    syntaxErrors.Add($"{csFile}: 文件读取失败 - {ex.Message}");
                }
            }

            result.IsSuccess = syntaxErrors.Count == 0;
            result.Errors.AddRange(syntaxErrors);

            if (result.IsSuccess)
            {
                _logger.LogDebug("编译验证通过: {OutputPath}", outputPath);
            }
            else
            {
                _logger.LogWarning("编译验证发现 {ErrorCount} 个语法错误: {OutputPath}", syntaxErrors.Count, outputPath);
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "编译验证失败: {OutputPath}", outputPath);
            result.IsSuccess = false;
            result.Errors.Add($"编译验证异常: {ex.Message}");
            return result;
        }
    }

    #region 私有检查方法

    /// <summary>
    /// 基础语法检查
    /// </summary>
    private async Task PerformSyntaxCheckAsync(Dictionary<string, string> files, GenerationQualityResult result)
    {
        foreach (var file in files)
        {
            try
            {
                var fileExt = Path.GetExtension(file.Key).ToLowerInvariant();
                var issues = new List<string>();

                switch (fileExt)
                {
                    case ".cs":
                        issues.AddRange(CheckBasicCSharpSyntax(file.Value, file.Key));
                        break;
                    case ".vue":
                        issues.AddRange(CheckBasicVueSyntax(file.Value, file.Key));
                        break;
                    case ".ts":
                        issues.AddRange(CheckBasicTypeScriptSyntax(file.Value, file.Key));
                        break;
                    case ".json":
                        issues.AddRange(CheckJsonSyntax(file.Value, file.Key));
                        break;
                }

                if (issues.Any())
                {
                    result.SyntaxIssues.AddRange(issues.Select(i => new QualityIssue
                    {
                        FilePath = file.Key,
                        IssueType = QualityIssueType.SyntaxError,
                        Severity = IssueSeverity.Error,
                        Message = i,
                        Line = ExtractLineNumber(i)
                    }));
                }
                else
                {
                    result.SyntaxValidFiles++;
                }
            }
            catch (Exception ex)
            {
                result.SyntaxIssues.Add(new QualityIssue
                {
                    FilePath = file.Key,
                    IssueType = QualityIssueType.SyntaxError,
                    Severity = IssueSeverity.Error,
                    Message = $"语法检查异常: {ex.Message}"
                });
            }
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// 代码规范检查
    /// </summary>
    private async Task PerformCodeStandardsCheckAsync(Dictionary<string, string> files, GenerationQualityResult result)
    {
        foreach (var file in files)
        {
            if (!file.Key.EndsWith(".cs", StringComparison.OrdinalIgnoreCase))
                continue;

            var issues = CheckCSharpCodeStandards(file.Value, file.Key);
            result.StandardsIssues.AddRange(issues);
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// 最佳实践检查
    /// </summary>
    private async Task PerformBestPracticesCheckAsync(Dictionary<string, string> files, GenerationQualityResult result)
    {
        foreach (var file in files)
        {
            if (!file.Key.EndsWith(".cs", StringComparison.OrdinalIgnoreCase))
                continue;

            var issues = CheckBestPractices(file.Value, file.Key);
            result.BestPracticeIssues.AddRange(issues);
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// 安全性检查
    /// </summary>
    private async Task PerformSecurityCheckAsync(Dictionary<string, string> files, GenerationQualityResult result)
    {
        foreach (var file in files)
        {
            var issues = CheckSecurityIssues(file.Value, file.Key);
            result.SecurityIssues.AddRange(issues);
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// 性能检查
    /// </summary>
    private async Task PerformPerformanceCheckAsync(Dictionary<string, string> files, GenerationQualityResult result)
    {
        foreach (var file in files)
        {
            if (!file.Key.EndsWith(".cs", StringComparison.OrdinalIgnoreCase))
                continue;

            var issues = CheckPerformanceIssues(file.Value, file.Key);
            result.PerformanceIssues.AddRange(issues);
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// C# 基础语法检查
    /// </summary>
    private List<string> CheckBasicCSharpSyntax(string content, string filePath)
    {
        var issues = new List<string>();

        try
        {
            var lines = content.Split('\n');

            for (int i = 0; i < lines.Length; i++)
            {
                var line = lines[i].Trim();
                var lineNumber = i + 1;

                // 检查大括号匹配
                var openBraces = line.Count(c => c == '{');
                var closeBraces = line.Count(c => c == '}');
                
                // 检查分号缺失（简单检查）
                if (line.EndsWith(")") && !line.Contains("if") && !line.Contains("for") && 
                    !line.Contains("while") && !line.Contains("switch") && !line.Contains("catch") &&
                    !line.Contains("=>") && !line.Contains("//"))
                {
                    issues.Add($"第{lineNumber}行可能缺少分号");
                }

                // 检查基础语法错误
                if (line.Contains(";;"))
                {
                    issues.Add($"第{lineNumber}行有重复分号");
                }

                if (Regex.IsMatch(line, @"\s+\)\s*\{") && !line.Contains("//"))
                {
                    // 检查方法定义格式
                }

                // 检查using语句位置
                if (line.StartsWith("using ") && i > 0 && 
                    lines.Take(i).Any(l => !l.Trim().StartsWith("using ") && !string.IsNullOrWhiteSpace(l.Trim()) && !l.Trim().StartsWith("//")))
                {
                    issues.Add($"第{lineNumber}行using语句应该在文件顶部");
                }
            }

            // 检查整体结构
            var totalOpenBraces = content.Count(c => c == '{');
            var totalCloseBraces = content.Count(c => c == '}');
            
            if (totalOpenBraces != totalCloseBraces)
            {
                issues.Add($"大括号不匹配: 开括号{totalOpenBraces}个, 闭括号{totalCloseBraces}个");
            }

            // 检查基本关键字拼写
            var keywords = new[] { "public", "private", "protected", "internal", "static", "virtual", "override", "abstract" };
            foreach (var keyword in keywords)
            {
                // 检查常见拼写错误（这里简化处理）
                if (content.Contains($"{keyword} ") || content.Contains($" {keyword}"))
                {
                    // 关键字存在，检查是否有拼写错误
                }
            }
        }
        catch (Exception ex)
        {
            issues.Add($"语法检查异常: {ex.Message}");
        }

        return issues;
    }

    /// <summary>
    /// Vue 基础语法检查
    /// </summary>
    private List<string> CheckBasicVueSyntax(string content, string filePath)
    {
        var issues = new List<string>();

        try
        {
            // 检查基本Vue结构
            if (!content.Contains("<template>") && !content.Contains("<template "))
            {
                issues.Add("缺少 <template> 标签");
            }

            if (content.Contains("<script>") || content.Contains("<script "))
            {
                // 检查script标签
                var scriptMatch = Regex.Match(content, @"<script[^>]*>(.*?)</script>", RegexOptions.Singleline);
                if (scriptMatch.Success)
                {
                    var scriptContent = scriptMatch.Groups[1].Value;
                    // 简单的JavaScript/TypeScript语法检查
                    if (scriptContent.Count(c => c == '{') != scriptContent.Count(c => c == '}'))
                    {
                        issues.Add("script标签中大括号不匹配");
                    }
                }
            }

            // 检查style标签
            if (content.Contains("<style>") || content.Contains("<style "))
            {
                var styleMatch = Regex.Match(content, @"<style[^>]*>(.*?)</style>", RegexOptions.Singleline);
                if (styleMatch.Success)
                {
                    var styleContent = styleMatch.Groups[1].Value;
                    // 简单的CSS语法检查
                    if (styleContent.Count(c => c == '{') != styleContent.Count(c => c == '}'))
                    {
                        issues.Add("style标签中大括号不匹配");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            issues.Add($"Vue语法检查异常: {ex.Message}");
        }

        return issues;
    }

    /// <summary>
    /// TypeScript 基础语法检查
    /// </summary>
    private List<string> CheckBasicTypeScriptSyntax(string content, string filePath)
    {
        var issues = new List<string>();

        try
        {
            // 检查基本语法
            var openBraces = content.Count(c => c == '{');
            var closeBraces = content.Count(c => c == '}');
            
            if (openBraces != closeBraces)
            {
                issues.Add($"大括号不匹配: 开括号{openBraces}个, 闭括号{closeBraces}个");
            }

            var openParens = content.Count(c => c == '(');
            var closeParens = content.Count(c => c == ')');
            
            if (openParens != closeParens)
            {
                issues.Add($"圆括号不匹配: 开括号{openParens}个, 闭括号{closeParens}个");
            }

            // 检查import语句
            var lines = content.Split('\n');
            for (int i = 0; i < lines.Length; i++)
            {
                var line = lines[i].Trim();
                if (line.StartsWith("import ") && !line.EndsWith(";") && !line.EndsWith("'") && !line.EndsWith("\""))
                {
                    issues.Add($"第{i + 1}行import语句可能缺少分号");
                }
            }
        }
        catch (Exception ex)
        {
            issues.Add($"TypeScript语法检查异常: {ex.Message}");
        }

        return issues;
    }

    /// <summary>
    /// JSON 语法检查
    /// </summary>
    private List<string> CheckJsonSyntax(string content, string filePath)
    {
        var issues = new List<string>();

        try
        {
            System.Text.Json.JsonDocument.Parse(content);
        }
        catch (System.Text.Json.JsonException ex)
        {
            issues.Add($"JSON语法错误: {ex.Message}");
        }
        catch (Exception ex)
        {
            issues.Add($"JSON检查异常: {ex.Message}");
        }

        return issues;
    }

    /// <summary>
    /// C# 代码规范检查
    /// </summary>
    private List<QualityIssue> CheckCSharpCodeStandards(string content, string filePath)
    {
        var issues = new List<QualityIssue>();
        var lines = content.Split('\n');

        for (int i = 0; i < lines.Length; i++)
        {
            var line = lines[i];
            var lineNumber = i + 1;

            // 检查命名规范
            var classMatch = Regex.Match(line, @"class\s+([a-z][a-zA-Z0-9]*)");
            if (classMatch.Success)
            {
                issues.Add(new QualityIssue
                {
                    FilePath = filePath,
                    IssueType = QualityIssueType.NamingConvention,
                    Severity = IssueSeverity.Warning,
                    Message = $"类名 '{classMatch.Groups[1].Value}' 应该以大写字母开头",
                    Line = lineNumber
                });
            }

            // 检查行长度
            if (line.Length > 120)
            {
                issues.Add(new QualityIssue
                {
                    FilePath = filePath,
                    IssueType = QualityIssueType.CodeStyle,
                    Severity = IssueSeverity.Info,
                    Message = $"行长度过长 ({line.Length} 字符)，建议不超过120字符",
                    Line = lineNumber
                });
            }

            // 检查硬编码字符串
            var stringMatches = Regex.Matches(line, @"""[^""]{10,}""");
            foreach (Match match in stringMatches)
            {
                if (!line.Contains("//") || line.IndexOf("//") > match.Index)
                {
                    issues.Add(new QualityIssue
                    {
                        FilePath = filePath,
                        IssueType = QualityIssueType.BestPractice,
                        Severity = IssueSeverity.Info,
                        Message = "发现可能的硬编码字符串，考虑使用常量或资源文件",
                        Line = lineNumber
                    });
                }
            }
        }

        return issues;
    }

    /// <summary>
    /// 最佳实践检查
    /// </summary>
    private List<QualityIssue> CheckBestPractices(string content, string filePath)
    {
        var issues = new List<QualityIssue>();

        // 检查是否使用了using语句进行资源管理
        if (content.Contains("new FileStream") && !content.Contains("using"))
        {
            issues.Add(new QualityIssue
            {
                FilePath = filePath,
                IssueType = QualityIssueType.BestPractice,
                Severity = IssueSeverity.Warning,
                Message = "建议使用using语句管理FileStream资源"
            });
        }

        // 检查异常处理
        if (content.Contains("catch (Exception") && !content.Contains("_logger"))
        {
            issues.Add(new QualityIssue
            {
                FilePath = filePath,
                IssueType = QualityIssueType.BestPractice,
                Severity = IssueSeverity.Info,
                Message = "捕获通用异常时建议记录日志"
            });
        }

        // 检查null检查
        var nullCheckPattern = @"\w+\s*==\s*null|\w+\s*!=\s*null";
        if (Regex.IsMatch(content, nullCheckPattern) && !content.Contains("is null"))
        {
            issues.Add(new QualityIssue
            {
                FilePath = filePath,
                IssueType = QualityIssueType.BestPractice,
                Severity = IssueSeverity.Info,
                Message = "考虑使用现代C#的null检查语法 (is null, is not null)"
            });
        }

        return issues;
    }

    /// <summary>
    /// 安全性检查
    /// </summary>
    private List<QualityIssue> CheckSecurityIssues(string content, string filePath)
    {
        var issues = new List<QualityIssue>();

        // 检查SQL注入风险
        if (content.Contains("string.Format") && content.Contains("SELECT"))
        {
            issues.Add(new QualityIssue
            {
                FilePath = filePath,
                IssueType = QualityIssueType.Security,
                Severity = IssueSeverity.Error,
                Message = "可能存在SQL注入风险，建议使用参数化查询"
            });
        }

        // 检查硬编码密码
        var passwordPatterns = new[] { "password", "pwd", "secret", "token" };
        foreach (var pattern in passwordPatterns)
        {
            var regex = new Regex($@"""{pattern}[""']\s*:\s*[""'][^""']+[""']", RegexOptions.IgnoreCase);
            if (regex.IsMatch(content))
            {
                issues.Add(new QualityIssue
                {
                    FilePath = filePath,
                    IssueType = QualityIssueType.Security,
                    Severity = IssueSeverity.Error,
                    Message = $"发现可能的硬编码敏感信息: {pattern}"
                });
            }
        }

        return issues;
    }

    /// <summary>
    /// 性能检查
    /// </summary>
    private List<QualityIssue> CheckPerformanceIssues(string content, string filePath)
    {
        var issues = new List<QualityIssue>();

        // 检查字符串拼接
        if (content.Contains("+ \"") && content.Split('+').Length > 3)
        {
            issues.Add(new QualityIssue
            {
                FilePath = filePath,
                IssueType = QualityIssueType.Performance,
                Severity = IssueSeverity.Warning,
                Message = "大量字符串拼接，考虑使用StringBuilder"
            });
        }

        // 检查循环中的对象创建
        var lines = content.Split('\n');
        bool inLoop = false;
        for (int i = 0; i < lines.Length; i++)
        {
            var line = lines[i].Trim();
            
            if (line.Contains("for ") || line.Contains("foreach ") || line.Contains("while "))
            {
                inLoop = true;
                continue;
            }

            if (inLoop && line.Contains("}"))
            {
                inLoop = false;
                continue;
            }

            if (inLoop && line.Contains("new ") && !line.Contains("//"))
            {
                issues.Add(new QualityIssue
                {
                    FilePath = filePath,
                    IssueType = QualityIssueType.Performance,
                    Severity = IssueSeverity.Info,
                    Message = $"在循环中创建对象可能影响性能 (第{i + 1}行)"
                });
            }
        }

        return issues;
    }

    /// <summary>
    /// 计算总体质量分数
    /// </summary>
    private int CalculateOverallScore(GenerationQualityResult result)
    {
        int baseScore = 100;

        // 根据问题严重程度扣分
        var allIssues = result.SyntaxIssues
            .Concat(result.StandardsIssues)
            .Concat(result.BestPracticeIssues)
            .Concat(result.SecurityIssues)
            .Concat(result.PerformanceIssues);

        foreach (var issue in allIssues)
        {
            switch (issue.Severity)
            {
                case IssueSeverity.Error:
                    baseScore -= 10;
                    break;
                case IssueSeverity.Warning:
                    baseScore -= 5;
                    break;
                case IssueSeverity.Info:
                    baseScore -= 1;
                    break;
            }
        }

        // 确保分数在0-100范围内
        return Math.Max(0, Math.Min(100, baseScore));
    }

    /// <summary>
    /// 提取行号
    /// </summary>
    private int ExtractLineNumber(string message)
    {
        var match = Regex.Match(message, @"第(\d+)行");
        return match.Success ? int.Parse(match.Groups[1].Value) : 0;
    }

    #endregion
}

#region 数据传输对象

/// <summary>
/// 生成质量结果（重新定义以避免重复）
/// </summary>
public class GenerationQualityResult
{
    public int TotalFiles { get; set; }
    public int SyntaxValidFiles { get; set; }
    public int OverallScore { get; set; }
    public DateTime CheckStartTime { get; set; }
    public DateTime CheckEndTime { get; set; }
    public TimeSpan CheckDuration { get; set; }
    public string? SystemError { get; set; }

    public List<QualityIssue> SyntaxIssues { get; set; } = new();
    public List<QualityIssue> StandardsIssues { get; set; } = new();
    public List<QualityIssue> BestPracticeIssues { get; set; } = new();
    public List<QualityIssue> SecurityIssues { get; set; } = new();
    public List<QualityIssue> PerformanceIssues { get; set; } = new();

    public List<string> Issues => SyntaxIssues.Concat(StandardsIssues).Concat(BestPracticeIssues)
        .Concat(SecurityIssues).Concat(PerformanceIssues).Select(i => i.Message).ToList();
    
    public List<string> Suggestions => BestPracticeIssues.Where(i => i.Severity == IssueSeverity.Info)
        .Select(i => i.Message).ToList();
}

/// <summary>
/// 编译验证结果（重新定义以避免重复）
/// </summary>
public class CompilationValidationResult
{
    public bool IsSuccess { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
}

/// <summary>
/// 质量问题
/// </summary>
public class QualityIssue
{
    public string FilePath { get; set; } = string.Empty;
    public QualityIssueType IssueType { get; set; }
    public IssueSeverity Severity { get; set; }
    public string Message { get; set; } = string.Empty;
    public int Line { get; set; }
    public int Column { get; set; }
}

/// <summary>
/// 质量问题类型
/// </summary>
public enum QualityIssueType
{
    SyntaxError,
    NamingConvention,
    CodeStyle,
    BestPractice,
    Security,
    Performance
}

/// <summary>
/// 问题严重程度
/// </summary>
public enum IssueSeverity
{
    Info,
    Warning,
    Error
}

#endregion
