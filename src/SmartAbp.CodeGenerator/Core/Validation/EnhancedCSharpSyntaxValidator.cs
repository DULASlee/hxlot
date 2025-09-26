using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.Core.Validation;

/// <summary>
/// 🔥 增强C#语法验证器 - 协助请求2实现
/// 提供深度的C#基础语法错误检测，支持代码生成器质量保证
/// 基于GenerationQualityChecker扩展，专注语法检查精度
/// </summary>
public class EnhancedCSharpSyntaxValidator : ITransientDependency
{
    private readonly ILogger<EnhancedCSharpSyntaxValidator> _logger;

    public EnhancedCSharpSyntaxValidator(ILogger<EnhancedCSharpSyntaxValidator> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// 🔍 深度C#语法验证 - 企业级检查标准
    /// </summary>
    /// <param name="content">C#代码内容</param>
    /// <param name="filePath">文件路径（可选，用于错误报告）</param>
    /// <returns>语法验证结果</returns>
    public CSharpSyntaxValidationResult ValidateSyntax(string content, string? filePath = null)
    {
        var result = new CSharpSyntaxValidationResult
        {
            FilePath = filePath ?? "Unknown",
            Content = content
        };

        if (string.IsNullOrWhiteSpace(content))
        {
            result.AddError("文件内容为空");
            return result;
        }

        try
        {
            _logger.LogDebug("🔍 开始C#语法深度验证: {FilePath}", filePath ?? "内存内容");

            // 🔥 核心语法检查项目
            CheckBasicStructure(content, result);
            CheckBraceMatching(content, result);
            CheckSemicolonUsage(content, result);
            CheckUsingStatements(content, result);
            CheckNamingConventions(content, result);
            CheckCommonSyntaxErrors(content, result);
            CheckModernCSharpFeatures(content, result);
            CheckCodeQuality(content, result);

            _logger.LogDebug("✅ C#语法验证完成: {FilePath}, 发现 {ErrorCount} 个错误, {WarningCount} 个警告", 
                filePath ?? "内存内容", result.Errors.Count, result.Warnings.Count);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ C#语法验证过程异常: {FilePath}", filePath);
            result.AddError($"语法验证异常: {ex.Message}");
            return result;
        }
    }

    /// <summary>
    /// 🏗️ 检查基础文件结构
    /// </summary>
    private void CheckBasicStructure(string content, CSharpSyntaxValidationResult result)
    {
        var lines = content.Split('\n', StringSplitOptions.None);

        // 检查是否包含namespace声明
        if (!Regex.IsMatch(content, @"namespace\s+[\w\.]+"))
        {
            result.AddWarning("缺少namespace声明，建议使用文件范围命名空间");
        }

        // 检查是否有类或接口声明
        if (!Regex.IsMatch(content, @"(class|interface|struct|enum|record)\s+\w+"))
        {
            result.AddWarning("未发现类、接口、结构体或枚举声明");
        }

        // 检查文件编码BOM
        if (content.StartsWith("\ufeff"))
        {
            result.AddInfo("检测到BOM编码标记，建议使用UTF-8无BOM编码");
        }

        // 检查行结束符一致性
        var crlfCount = content.Count(c => c == '\r');
        var lfCount = content.Split('\n').Length - 1;
        if (crlfCount > 0 && crlfCount != lfCount)
        {
            result.AddWarning("混合使用不同的行结束符（CRLF vs LF），建议统一");
        }
    }

    /// <summary>
    /// 🔧 检查大括号匹配
    /// </summary>
    private void CheckBraceMatching(string content, CSharpSyntaxValidationResult result)
    {
        var lines = content.Split('\n');
        var openBraces = 0;
        var closeBraces = 0;
        var braceStack = new Stack<(int Line, char Brace)>();

        for (int i = 0; i < lines.Length; i++)
        {
            var line = lines[i];
            var lineNumber = i + 1;

            for (int j = 0; j < line.Length; j++)
            {
                var ch = line[j];
                
                switch (ch)
                {
                    case '{':
                        openBraces++;
                        braceStack.Push((lineNumber, ch));
                        break;
                        
                    case '}':
                        closeBraces++;
                        if (braceStack.Count == 0)
                        {
                            result.AddError($"第{lineNumber}行: 多余的闭合大括号 '}}' 没有对应的开括号");
                        }
                        else if (braceStack.Peek().Brace != '{')
                        {
                            var (prevLine, prevBrace) = braceStack.Pop();
                            result.AddError($"第{lineNumber}行: 大括号不匹配，期望 '{{' 但找到 '{prevBrace}' (第{prevLine}行)");
                        }
                        else
                        {
                            braceStack.Pop();
                        }
                        break;

                    case '(':
                        braceStack.Push((lineNumber, ch));
                        break;
                        
                    case ')':
                        if (braceStack.Count > 0 && braceStack.Peek().Brace == '(')
                        {
                            braceStack.Pop();
                        }
                        break;

                    case '[':
                        braceStack.Push((lineNumber, ch));
                        break;
                        
                    case ']':
                        if (braceStack.Count > 0 && braceStack.Peek().Brace == '[')
                        {
                            braceStack.Pop();
                        }
                        break;
                }
            }
        }

        // 检查未匹配的大括号
        while (braceStack.Count > 0)
        {
            var (line, brace) = braceStack.Pop();
            if (brace == '{')
            {
                result.AddError($"第{line}行: 未闭合的开括号 '{brace}'");
            }
        }

        if (openBraces != closeBraces)
        {
            result.AddError($"大括号总数不匹配: 开括号{openBraces}个, 闭括号{closeBraces}个");
        }
    }

    /// <summary>
    /// 🔧 检查分号使用
    /// </summary>
    private void CheckSemicolonUsage(string content, CSharpSyntaxValidationResult result)
    {
        var lines = content.Split('\n');

        for (int i = 0; i < lines.Length; i++)
        {
            var line = lines[i].Trim();
            var lineNumber = i + 1;

            // 跳过注释行和空行
            if (string.IsNullOrWhiteSpace(line) || line.StartsWith("//") || line.StartsWith("/*"))
                continue;

            // 检查分号缺失
            if (ShouldEndWithSemicolon(line) && !line.EndsWith(";") && !line.EndsWith("{") && !line.EndsWith("}"))
            {
                result.AddError($"第{lineNumber}行: 可能缺少分号 ';'");
            }

            // 检查多余分号
            if (line.Contains(";;"))
            {
                result.AddWarning($"第{lineNumber}行: 发现多余的分号 ';;'");
            }

            // 检查在控制结构后错误的分号
            if (Regex.IsMatch(line, @"(if|for|while|foreach|switch)\s*\([^)]*\)\s*;"))
            {
                result.AddError($"第{lineNumber}行: 控制结构后不应该有分号");
            }
        }
    }

    /// <summary>
    /// 🔧 检查using语句
    /// </summary>
    private void CheckUsingStatements(string content, CSharpSyntaxValidationResult result)
    {
        var lines = content.Split('\n');
        var foundNonUsingContent = false;
        var usingStatements = new List<(int Line, string Statement)>();

        for (int i = 0; i < lines.Length; i++)
        {
            var line = lines[i].Trim();
            var lineNumber = i + 1;

            if (string.IsNullOrWhiteSpace(line) || line.StartsWith("//"))
                continue;

            if (line.StartsWith("using "))
            {
                usingStatements.Add((lineNumber, line));

                if (foundNonUsingContent)
                {
                    result.AddWarning($"第{lineNumber}行: using语句应该在文件顶部");
                }

                // 检查using语句格式
                if (!line.EndsWith(";"))
                {
                    result.AddError($"第{lineNumber}行: using语句缺少分号");
                }

                // 检查重复using
                var currentUsing = line.Replace("using ", "").Replace(";", "").Trim();
                var duplicates = usingStatements.Where(u => u.Statement.Contains(currentUsing)).ToList();
                if (duplicates.Count > 1)
                {
                    result.AddWarning($"第{lineNumber}行: 重复的using语句: {currentUsing}");
                }
            }
            else if (!line.StartsWith("[") && !line.StartsWith("namespace"))
            {
                foundNonUsingContent = true;
            }
        }

        // 检查using排序（推荐）
        var systemUsings = usingStatements.Where(u => u.Statement.Contains("using System")).ToList();
        var thirdPartyUsings = usingStatements.Where(u => !u.Statement.Contains("using System") && !u.Statement.Contains("using SmartAbp")).ToList();
        var projectUsings = usingStatements.Where(u => u.Statement.Contains("using SmartAbp")).ToList();

        if (systemUsings.Any() && thirdPartyUsings.Any() && 
            systemUsings.Last().Line > thirdPartyUsings.First().Line)
        {
            result.AddInfo("建议按以下顺序排列using语句: System命名空间 → 第三方库 → 项目命名空间");
        }
    }

    /// <summary>
    /// 🔧 检查命名约定
    /// </summary>
    private void CheckNamingConventions(string content, CSharpSyntaxValidationResult result)
    {
        // 检查类名（PascalCase）
        var classMatches = Regex.Matches(content, @"(?:public|private|protected|internal)?\s*(?:static|abstract|sealed)?\s*class\s+([A-Za-z_][A-Za-z0-9_]*)");
        foreach (Match match in classMatches)
        {
            var className = match.Groups[1].Value;
            if (!IsPascalCase(className))
            {
                result.AddWarning($"类名 '{className}' 应使用PascalCase命名约定");
            }
        }

        // 检查接口名（PascalCase + I前缀）
        var interfaceMatches = Regex.Matches(content, @"(?:public|private|protected|internal)?\s*interface\s+([A-Za-z_][A-Za-z0-9_]*)");
        foreach (Match match in interfaceMatches)
        {
            var interfaceName = match.Groups[1].Value;
            if (!interfaceName.StartsWith("I") || !IsPascalCase(interfaceName[1..]))
            {
                result.AddWarning($"接口名 '{interfaceName}' 应以 'I' 开头并使用PascalCase");
            }
        }

        // 检查方法名（PascalCase）
        var methodMatches = Regex.Matches(content, @"(?:public|private|protected|internal)\s+(?:static\s+)?(?:async\s+)?(?:override\s+)?(?:virtual\s+)?[A-Za-z0-9_<>,\s]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(");
        foreach (Match match in methodMatches)
        {
            var methodName = match.Groups[1].Value;
            if (!IsPascalCase(methodName))
            {
                result.AddWarning($"方法名 '{methodName}' 应使用PascalCase命名约定");
            }
        }

        // 检查私有字段（camelCase + _前缀）
        var fieldMatches = Regex.Matches(content, @"private\s+(?:readonly\s+)?[A-Za-z0-9_<>,\s]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*[;=]");
        foreach (Match match in fieldMatches)
        {
            var fieldName = match.Groups[1].Value;
            if (!fieldName.StartsWith("_") || !IsCamelCase(fieldName[1..]))
            {
                result.AddInfo($"私有字段 '{fieldName}' 建议使用 '_' 前缀 + camelCase");
            }
        }
    }

    /// <summary>
    /// 🔧 检查常见语法错误
    /// </summary>
    private void CheckCommonSyntaxErrors(string content, CSharpSyntaxValidationResult result)
    {
        var lines = content.Split('\n');

        for (int i = 0; i < lines.Length; i++)
        {
            var line = lines[i].Trim();
            var lineNumber = i + 1;

            // 检查null检查模式
            if (Regex.IsMatch(line, @"\w+\s*==\s*null") && !line.Contains("is null"))
            {
                result.AddInfo($"第{lineNumber}行: 建议使用现代C#语法 'is null' 而不是 '== null'");
            }

            // 检查字符串连接
            if (Regex.IsMatch(line, @"""[^""]*""\s*\+\s*""[^""]*"""))
            {
                result.AddInfo($"第{lineNumber}行: 建议使用字符串插值 $\"\" 而不是字符串连接");
            }

            // 检查var关键字滥用
            if (line.Contains("var ") && Regex.IsMatch(line, @"var\s+\w+\s*=\s*(new\s+\w+\(|""|\d|\w+\.\w+)"))
            {
                // 当类型明显时建议显式类型
                if (Regex.IsMatch(line, @"var\s+\w+\s*=\s*new\s+(\w+)\("))
                {
                    var match = Regex.Match(line, @"var\s+\w+\s*=\s*new\s+(\w+)\(");
                    result.AddInfo($"第{lineNumber}行: 建议使用显式类型 '{match.Groups[1].Value}' 而不是 'var'");
                }
            }

            // 检查异常处理最佳实践
            if (line.Contains("catch (Exception") && !line.Contains("catch (Exception ex)"))
            {
                result.AddWarning($"第{lineNumber}行: 捕获Exception时建议命名异常变量为 'ex'");
            }

            // 检查async/await模式
            if (line.Contains("async ") && !content.Contains("await "))
            {
                result.AddWarning($"第{lineNumber}行: async方法中未发现await关键字，可能应该是同步方法");
            }

            // 检查ConfigureAwait使用
            if (line.Contains("await ") && !line.Contains("ConfigureAwait(false)") && 
                !line.Contains(".Result") && !line.Contains("Task."))
            {
                result.AddInfo($"第{lineNumber}行: 库代码中建议使用 .ConfigureAwait(false)");
            }
        }
    }

    /// <summary>
    /// 🔧 检查现代C#特性使用
    /// </summary>
    private void CheckModernCSharpFeatures(string content, CSharpSyntaxValidationResult result)
    {
        // 检查记录类型使用机会
        if (content.Contains("class ") && 
            Regex.IsMatch(content, @"public\s+string\s+\w+\s*{\s*get;\s*set;\s*}") &&
            !content.Contains("record"))
        {
            result.AddInfo("检测到纯属性类，考虑使用 record 类型简化代码");
        }

        // 检查switch表达式使用机会
        if (Regex.IsMatch(content, @"switch\s*\([^)]+\)\s*\{[^}]*case[^}]*:\s*return[^}]*\}"))
        {
            result.AddInfo("检测到简单switch语句，考虑使用switch表达式简化代码");
        }

        // 检查空值合并运算符使用
        if (Regex.IsMatch(content, @"if\s*\([^)]*!=\s*null\)\s*return[^;]*;\s*return"))
        {
            result.AddInfo("检测到null检查模式，考虑使用空值合并运算符 ?? 简化代码");
        }

        // 检查模式匹配使用机会
        if (Regex.IsMatch(content, @"if\s*\([^)]*is\s+\w+\)"))
        {
            result.AddInfo("检测到类型检查，考虑使用模式匹配和声明模式");
        }

        // 检查文件范围命名空间
        if (Regex.IsMatch(content, @"namespace\s+[\w\.]+\s*\{"))
        {
            result.AddInfo("考虑使用文件范围命名空间简化代码结构");
        }
    }

    /// <summary>
    /// 🔧 检查代码质量问题
    /// </summary>
    private void CheckCodeQuality(string content, CSharpSyntaxValidationResult result)
    {
        // 检查方法长度
        var methodMatches = Regex.Matches(content, @"(?:public|private|protected|internal)[^{]*\{[^}]*\}", RegexOptions.Singleline);
        foreach (Match match in methodMatches)
        {
            var methodContent = match.Value;
            var lineCount = methodContent.Split('\n').Length;
            if (lineCount > 50)
            {
                result.AddWarning($"方法过长 ({lineCount} 行)，建议拆分为更小的方法");
            }
        }

        // 检查硬编码字符串
        var stringMatches = Regex.Matches(content, @"""[^""]{20,}""");
        foreach (Match match in stringMatches)
        {
            if (!Regex.IsMatch(content.Substring(0, match.Index), @"//.*$", RegexOptions.Multiline))
            {
                result.AddInfo("发现长字符串常量，考虑使用资源文件或常量定义");
            }
        }

        // 检查魔法数字
        var numberMatches = Regex.Matches(content, @"\b((?<![\w\.])\d{2,}(?![\w\.]))\b");
        foreach (Match match in numberMatches)
        {
            var number = match.Groups[1].Value;
            if (number != "0" && number != "1" && !IsCommonNumber(number))
            {
                result.AddInfo($"发现魔法数字 '{number}'，建议使用命名常量");
            }
        }
    }

    #region 私有辅助方法

    /// <summary>
    /// 检查是否应该以分号结尾
    /// </summary>
    private bool ShouldEndWithSemicolon(string line)
    {
        // 排除控制结构、类声明、命名空间等
        var excludePatterns = new[]
        {
            @"^\s*(if|for|while|foreach|switch|try|catch|finally)\s*\(",
            @"^\s*(class|interface|struct|enum|namespace)\s+",
            @"^\s*(public|private|protected|internal)\s+(class|interface|struct|enum)",
            @"\{$", @"\}$", @"=>", @"//", @"/\*", @"\*/"
        };

        if (excludePatterns.Any(pattern => Regex.IsMatch(line, pattern)))
        {
            return false;
        }

        // 应该以分号结尾的语句模式
        var shouldEndPatterns = new[]
        {
            @"^\s*\w+\s*\([^)]*\)$", // 方法调用
            @"^\s*var\s+\w+\s*=", // 变量声明
            @"^\s*\w+\s*=", // 赋值语句
            @"^\s*return\s+", // return语句
            @"^\s*throw\s+", // throw语句
            @"^\s*break$", // break语句
            @"^\s*continue$" // continue语句
        };

        return shouldEndPatterns.Any(pattern => Regex.IsMatch(line, pattern));
    }

    /// <summary>
    /// 检查是否为PascalCase
    /// </summary>
    private bool IsPascalCase(string name)
    {
        if (string.IsNullOrEmpty(name)) return false;
        return char.IsUpper(name[0]) && !name.Contains('_') && name.All(c => char.IsLetterOrDigit(c));
    }

    /// <summary>
    /// 检查是否为camelCase
    /// </summary>
    private bool IsCamelCase(string name)
    {
        if (string.IsNullOrEmpty(name)) return false;
        return char.IsLower(name[0]) && !name.Contains('_') && name.All(c => char.IsLetterOrDigit(c));
    }

    /// <summary>
    /// 检查是否为常见数字（不需要常量化）
    /// </summary>
    private bool IsCommonNumber(string number)
    {
        var commonNumbers = new[] { "10", "100", "1000", "24", "60", "365", "7", "30", "12" };
        return commonNumbers.Contains(number);
    }

    #endregion
}

/// <summary>
/// 🔧 C#语法验证结果
/// </summary>
public class CSharpSyntaxValidationResult
{
    public string FilePath { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public List<string> Infos { get; set; } = new();
    public DateTime ValidatedAt { get; set; } = DateTime.UtcNow;

    public bool IsValid => Errors.Count == 0;
    public int TotalIssues => Errors.Count + Warnings.Count + Infos.Count;

    public void AddError(string message) => Errors.Add(message);
    public void AddWarning(string message) => Warnings.Add(message);
    public void AddInfo(string message) => Infos.Add(message);

    public string GetSummary()
    {
        var status = IsValid ? "✅有效" : "❌无效";
        return $"{status} - 错误: {Errors.Count}, 警告: {Warnings.Count}, 建议: {Infos.Count}";
    }
}
