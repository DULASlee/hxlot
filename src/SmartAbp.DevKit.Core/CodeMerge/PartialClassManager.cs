using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Core.CodeMerge;

/// <summary>
/// Partial类管理器 - DevKit v2.0 核心组件 ⭐⭐⭐
///
/// 核心理念:
/// - 使用C# partial机制分离自动生成代码和用户自定义代码
/// - 自动生成的代码放在 *.Generated.cs 文件中（每次会覆盖）
/// - 用户自定义代码放在 *.cs 文件中（永久保留）
/// - 提供代码区域标记，明确哪些部分是自动生成的
///
/// 文件命名约定:
/// - Entity.Generated.cs     → 自动生成，每次覆盖
/// - Entity.cs               → 用户自定义，永久保留
/// - EntityDto.Generated.cs  → 自动生成，每次覆盖
/// - EntityDto.cs            → 用户自定义，永久保留
///
/// 代码区域标记:
/// - // ⚙️ 自动生成区域开始 - 请勿修改
/// - // ⚙️ 自动生成区域结束
/// - // ✍️ 用户自定义代码 - 安全保护
/// </summary>
public class PartialClassManager
{
    private readonly ILogger<PartialClassManager> _logger;

    // 代码区域标记常量
    private const string AutoGenRegionStart = "// ⚙️ 自动生成区域开始 - 请勿修改";
    private const string AutoGenRegionEnd = "// ⚙️ 自动生成区域结束";
    private const string UserCodeRegion = "// ✍️ 用户自定义代码 - 安全保护";

    // 文件名后缀
    private const string GeneratedFileSuffix = ".Generated.cs";
    private const string UserFileSuffix = ".cs";

    public PartialClassManager(ILogger<PartialClassManager> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// 生成Partial类文件对（*.Generated.cs + *.cs）
    /// </summary>
    /// <param name="className">类名（如：BlogPost）</param>
    /// <param name="generatedCode">自动生成的代码</param>
    /// <param name="baseOutputPath">基础输出路径</param>
    /// <returns>生成的文件字典（路径 → 内容）</returns>
    public Dictionary<string, string> GeneratePartialFiles(
        string className,
        string generatedCode,
        string baseOutputPath)
    {
        var files = new Dictionary<string, string>();

        // 1. 生成 *.Generated.cs 文件（自动生成部分，每次覆盖）
        var generatedFilePath = Path.Combine(baseOutputPath, $"{className}{GeneratedFileSuffix}");
        var generatedFileContent = WrapWithAutoGenRegion(generatedCode, className);
        files[generatedFilePath] = generatedFileContent;

        _logger.LogDebug("生成自动生成文件: {FilePath}", generatedFilePath);

        // 2. 生成 *.cs 文件（用户自定义部分，仅首次创建）
        var userFilePath = Path.Combine(baseOutputPath, $"{className}{UserFileSuffix}");

        // 仅当文件不存在时才创建（保护用户代码）
        if (!File.Exists(userFilePath))
        {
            var userFileContent = GenerateUserPartialTemplate(className);
            files[userFilePath] = userFileContent;
            _logger.LogInformation("首次创建用户自定义文件: {FilePath}", userFilePath);
        }
        else
        {
            _logger.LogDebug("用户自定义文件已存在，跳过创建: {FilePath}", userFilePath);
        }

        return files;
    }

    /// <summary>
    /// 包装代码为自动生成区域
    /// </summary>
    private string WrapWithAutoGenRegion(string code, string className)
    {
        // 提取命名空间和类声明之前的内容
        var lines = code.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
        var result = new StringBuilder();

        // 添加自动生成警告头部
        result.AppendLine("// ==============================================================");
        result.AppendLine("// ⚙️ 此文件由DevKit自动生成，请勿手动修改！");
        result.AppendLine($"// ⚙️ 生成时间: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
        result.AppendLine("// ⚙️ 如需自定义代码，请在对应的 .cs 文件中编写");
        result.AppendLine("// ==============================================================");
        result.AppendLine();

        // 添加原始代码
        result.AppendLine(code);

        return result.ToString();
    }

    /// <summary>
    /// 生成用户自定义Partial类模板
    /// </summary>
    private string GenerateUserPartialTemplate(string className)
    {
        var template = new StringBuilder();

        template.AppendLine("// ==============================================================");
        template.AppendLine("// ✍️ 此文件用于编写用户自定义代码");
        template.AppendLine("// ✍️ 此文件不会被DevKit覆盖，您的代码100%安全");
        template.AppendLine($"// ✍️ 创建时间: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
        template.AppendLine("// ==============================================================");
        template.AppendLine();

        // 提取命名空间（假设遵循标准命名约定）
        var defaultNamespace = "SmartAbp.Domain"; // 可以从配置中读取

        template.AppendLine($"namespace {defaultNamespace};");
        template.AppendLine();
        template.AppendLine("/// <summary>");
        template.AppendLine($"/// {className} - 用户自定义代码部分");
        template.AppendLine("/// </summary>");
        template.AppendLine($"public partial class {className}");
        template.AppendLine("{");
        template.AppendLine("    // ✍️ 在此编写您的自定义方法、属性和逻辑");
        template.AppendLine("    // ✍️ 此部分代码不会被DevKit覆盖");
        template.AppendLine();
        template.AppendLine("    // 示例: 自定义方法");
        template.AppendLine("    // public string GetCustomInfo()");
        template.AppendLine("    // {");
        template.AppendLine("    //     return \"Custom logic here\";");
        template.AppendLine("    // }");
        template.AppendLine("}");

        return template.ToString();
    }

    /// <summary>
    /// 检测文件是否为自动生成文件
    /// </summary>
    public bool IsGeneratedFile(string filePath)
    {
        return filePath.EndsWith(GeneratedFileSuffix, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// 检测文件是否为用户自定义文件
    /// </summary>
    public bool IsUserFile(string filePath)
    {
        return filePath.EndsWith(UserFileSuffix, StringComparison.OrdinalIgnoreCase)
            && !filePath.EndsWith(GeneratedFileSuffix, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// 智能合并：保留用户代码，更新自动生成代码
    /// </summary>
    /// <param name="existingContent">现有文件内容</param>
    /// <param name="newGeneratedContent">新的自动生成内容</param>
    /// <returns>合并后的内容</returns>
    public string SmartMerge(string existingContent, string newGeneratedContent)
    {
        // 提取现有文件中的用户自定义区域
        var userRegions = ExtractUserRegions(existingContent);

        // 生成新的自动生成区域
        var newAutoGenRegion = ExtractAutoGenRegion(newGeneratedContent);

        // 合并：自动生成区域 + 用户自定义区域
        return MergeRegions(newAutoGenRegion, userRegions);
    }

    /// <summary>
    /// 提取用户自定义区域
    /// </summary>
    private List<string> ExtractUserRegions(string content)
    {
        var userRegions = new List<string>();

        // 使用正则表达式提取用户自定义区域
        var pattern = $@"{Regex.Escape(UserCodeRegion)}(.*?)(?={Regex.Escape(AutoGenRegionStart)}|$)";
        var matches = Regex.Matches(content, pattern, RegexOptions.Singleline);

        foreach (Match match in matches)
        {
            if (match.Groups.Count > 1)
            {
                userRegions.Add(match.Groups[1].Value.Trim());
            }
        }

        return userRegions;
    }

    /// <summary>
    /// 提取自动生成区域
    /// </summary>
    private string ExtractAutoGenRegion(string content)
    {
        var pattern = $@"{Regex.Escape(AutoGenRegionStart)}(.*?){Regex.Escape(AutoGenRegionEnd)}";
        var match = Regex.Match(content, pattern, RegexOptions.Singleline);

        if (match.Success && match.Groups.Count > 1)
        {
            return match.Groups[1].Value.Trim();
        }

        // 如果没有找到标记，则返回整个内容（兼容旧代码）
        return content;
    }

    /// <summary>
    /// 合并自动生成区域和用户自定义区域
    /// </summary>
    private string MergeRegions(string autoGenRegion, List<string> userRegions)
    {
        var result = new StringBuilder();

        // 1. 自动生成区域
        result.AppendLine(AutoGenRegionStart);
        result.AppendLine(autoGenRegion);
        result.AppendLine(AutoGenRegionEnd);

        // 2. 用户自定义区域
        if (userRegions.Any())
        {
            result.AppendLine();
            result.AppendLine(UserCodeRegion);
            foreach (var userRegion in userRegions)
            {
                result.AppendLine(userRegion);
            }
        }

        return result.ToString();
    }

    /// <summary>
    /// 验证Partial类机制是否正确配置
    /// </summary>
    /// <param name="outputPath">输出路径</param>
    /// <param name="className">类名</param>
    /// <returns>验证结果</returns>
    public PartialClassValidationResult ValidatePartialClassSetup(string outputPath, string className)
    {
        var result = new PartialClassValidationResult { ClassName = className };

        var generatedFilePath = Path.Combine(outputPath, $"{className}{GeneratedFileSuffix}");
        var userFilePath = Path.Combine(outputPath, $"{className}{UserFileSuffix}");

        // 检查自动生成文件
        result.GeneratedFileExists = File.Exists(generatedFilePath);
        if (result.GeneratedFileExists)
        {
            var content = File.ReadAllText(generatedFilePath);
            result.HasAutoGenRegion = content.Contains(AutoGenRegionStart)
                && content.Contains(AutoGenRegionEnd);
        }

        // 检查用户自定义文件
        result.UserFileExists = File.Exists(userFilePath);
        if (result.UserFileExists)
        {
            var content = File.ReadAllText(userFilePath);
            result.HasUserCode = content.Length > 500; // 简单判断：超过500字符认为有用户代码
        }

        // 综合判断
        result.IsValid = result.GeneratedFileExists && result.HasAutoGenRegion;

        return result;
    }

    /// <summary>
    /// 批量转换现有代码为Partial类机制
    /// </summary>
    /// <param name="sourceDirectory">源代码目录</param>
    /// <param name="filePattern">文件匹配模式（如：*Entity.cs）</param>
    /// <returns>转换结果</returns>
    public async Task<PartialClassMigrationResult> MigrateToPartialClassAsync(
        string sourceDirectory,
        string filePattern = "*.cs")
    {
        var result = new PartialClassMigrationResult();

        var files = Directory.GetFiles(sourceDirectory, filePattern, SearchOption.AllDirectories);

        foreach (var filePath in files)
        {
            // 跳过已经是Partial文件的
            if (IsGeneratedFile(filePath))
            {
                result.SkippedFiles.Add(filePath);
                continue;
            }

            try
            {
                var content = await File.ReadAllTextAsync(filePath);
                var className = Path.GetFileNameWithoutExtension(filePath);

                // 创建Partial文件对
                var partialFiles = GeneratePartialFiles(className, content, Path.GetDirectoryName(filePath)!);

                foreach (var (path, code) in partialFiles)
                {
                    await File.WriteAllTextAsync(path, code);
                    result.MigratedFiles.Add(path);
                    _logger.LogInformation("成功迁移文件: {FilePath}", path);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "迁移文件失败: {FilePath}", filePath);
                result.FailedFiles.Add(filePath);
            }
        }

        _logger.LogInformation(
            "Partial类迁移完成: 成功={SuccessCount}, 跳过={SkippedCount}, 失败={FailedCount}",
            result.MigratedFiles.Count,
            result.SkippedFiles.Count,
            result.FailedFiles.Count);

        return result;
    }
}

/// <summary>
/// Partial类验证结果
/// </summary>
public class PartialClassValidationResult
{
    /// <summary>
    /// 类名
    /// </summary>
    public string ClassName { get; set; } = string.Empty;

    /// <summary>
    /// 自动生成文件是否存在
    /// </summary>
    public bool GeneratedFileExists { get; set; }

    /// <summary>
    /// 用户自定义文件是否存在
    /// </summary>
    public bool UserFileExists { get; set; }

    /// <summary>
    /// 是否包含自动生成区域标记
    /// </summary>
    public bool HasAutoGenRegion { get; set; }

    /// <summary>
    /// 是否包含用户代码
    /// </summary>
    public bool HasUserCode { get; set; }

    /// <summary>
    /// 是否有效
    /// </summary>
    public bool IsValid { get; set; }
}

/// <summary>
/// Partial类迁移结果
/// </summary>
public class PartialClassMigrationResult
{
    /// <summary>
    /// 成功迁移的文件
    /// </summary>
    public List<string> MigratedFiles { get; set; } = new();

    /// <summary>
    /// 跳过的文件
    /// </summary>
    public List<string> SkippedFiles { get; set; } = new();

    /// <summary>
    /// 失败的文件
    /// </summary>
    public List<string> FailedFiles { get; set; } = new();

    /// <summary>
    /// 是否全部成功
    /// </summary>
    public bool IsFullySuccessful => FailedFiles.Count == 0;
}

