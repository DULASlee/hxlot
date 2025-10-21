using System;
using System.CommandLine;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.CodeMerge;

namespace SmartAbp.DevKit.Cli.Commands;

/// <summary>
/// Partial类管理命令处理器
/// DevKit v2.0 Day 15功能
/// </summary>
public class PartialClassCommandHandler : ICommandHandler
{
    private readonly ILogger<PartialClassCommandHandler> _logger;
    private readonly PartialClassManager _partialClassManager;

    public PartialClassCommandHandler(
        ILogger<PartialClassCommandHandler> logger,
        PartialClassManager partialClassManager)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _partialClassManager = partialClassManager ?? throw new ArgumentNullException(nameof(partialClassManager));
    }

    public Command GetCommand()
    {
        var partialCommand = new Command("partial", "Partial类管理（用户代码保护机制）");

        // 子命令：validate - 验证Partial类设置
        var validateCommand = new Command("validate", "验证Partial类设置");
        var validatePathOption = new Option<string>(
            aliases: new[] { "-p", "--path" },
            description: "验证路径",
            getDefaultValue: () => System.IO.Directory.GetCurrentDirectory());
        var validateClassOption = new Option<string?>(
            aliases: new[] { "-c", "--class" },
            description: "类名");

        validateCommand.AddOption(validatePathOption);
        validateCommand.AddOption(validateClassOption);

        validateCommand.SetHandler(ExecuteValidateAsync, validatePathOption, validateClassOption);

        // 子命令：migrate - 迁移现有代码到Partial机制
        var migrateCommand = new Command("migrate", "迁移现有代码到Partial机制");
        var migratePathOption = new Option<string>(
            aliases: new[] { "-p", "--path" },
            description: "源代码目录",
            getDefaultValue: () => System.IO.Directory.GetCurrentDirectory());
        var migratePatternOption = new Option<string>(
            aliases: new[] { "--pattern" },
            description: "文件匹配模式",
            getDefaultValue: () => "*.cs");

        migrateCommand.AddOption(migratePathOption);
        migrateCommand.AddOption(migratePatternOption);

        migrateCommand.SetHandler(ExecuteMigrateAsync, migratePathOption, migratePatternOption);

        // 子命令：info - 显示Partial类机制说明
        var infoCommand = new Command("info", "显示Partial类机制说明");
        infoCommand.SetHandler(ExecuteInfoAsync);

        partialCommand.AddCommand(validateCommand);
        partialCommand.AddCommand(migrateCommand);
        partialCommand.AddCommand(infoCommand);

        return partialCommand;
    }

    public Task<int> ExecuteAsync()
    {
        _logger.LogInformation("使用 'devkit partial --help' 查看帮助");
        return Task.FromResult(0);
    }

    /// <summary>
    /// 执行验证命令
    /// </summary>
    private async Task<int> ExecuteValidateAsync(string path, string? className)
    {
        _logger.LogInformation("🔍 验证Partial类设置: {Path}", path);

        try
        {
            if (string.IsNullOrEmpty(className))
            {
                // 验证整个目录
                var csFiles = System.IO.Directory.GetFiles(path, "*.cs", System.IO.SearchOption.AllDirectories);
                var validCount = 0;
                var invalidCount = 0;

                foreach (var file in csFiles)
                {
                    var baseName = System.IO.Path.GetFileNameWithoutExtension(file);
                    if (baseName.EndsWith(".Generated"))
                    {
                        baseName = baseName.Replace(".Generated", "");
                    }

                    var directory = System.IO.Path.GetDirectoryName(file) ?? path;
                    var result = _partialClassManager.ValidatePartialClassSetup(directory, baseName);

                    if (result.IsValid)
                    {
                        validCount++;
                        _logger.LogInformation("✅ {ClassName}: Partial类设置正确", baseName);
                    }
                    else
                    {
                        invalidCount++;
                        _logger.LogWarning("⚠️  {ClassName}: Partial类设置不完整", baseName);
                        _logger.LogWarning("   - 自动生成文件存在: {GeneratedFileExists}", result.GeneratedFileExists);
                        _logger.LogWarning("   - 用户文件存在: {UserFileExists}", result.UserFileExists);
                        _logger.LogWarning("   - 自动生成区域标记: {HasAutoGenRegion}", result.HasAutoGenRegion);
                    }
                }

                _logger.LogInformation("");
                _logger.LogInformation("📊 验证总结:");
                _logger.LogInformation("   ✅ 正确: {ValidCount}", validCount);
                _logger.LogInformation("   ⚠️  需改进: {InvalidCount}", invalidCount);

                return invalidCount > 0 ? 1 : 0;
            }
            else
            {
                // 验证单个类
                var result = _partialClassManager.ValidatePartialClassSetup(path, className);

                _logger.LogInformation("验证结果:");
                _logger.LogInformation("  类名: {ClassName}", result.ClassName);
                _logger.LogInformation("  自动生成文件存在: {GeneratedFileExists}", result.GeneratedFileExists);
                _logger.LogInformation("  用户文件存在: {UserFileExists}", result.UserFileExists);
                _logger.LogInformation("  自动生成区域标记: {HasAutoGenRegion}", result.HasAutoGenRegion);
                _logger.LogInformation("  用户代码: {HasUserCode}", result.HasUserCode);
                _logger.LogInformation("  设置正确: {IsValid}", result.IsValid);

                return result.IsValid ? 0 : 1;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 验证失败: {Message}", ex.Message);
            return 1;
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// 执行迁移命令
    /// </summary>
    private async Task<int> ExecuteMigrateAsync(string path, string pattern)
    {
        _logger.LogInformation("🔄 开始迁移到Partial类机制: {Path}", path);
        _logger.LogInformation("📋 文件匹配模式: {Pattern}", pattern);

        try
        {
            var result = await _partialClassManager.MigrateToPartialClassAsync(path, pattern);

            _logger.LogInformation("");
            _logger.LogInformation("📊 迁移完成:");
            _logger.LogInformation("   ✅ 成功迁移: {Count}个文件", result.MigratedFiles.Count);
            _logger.LogInformation("   ⏭️  跳过: {Count}个文件", result.SkippedFiles.Count);
            _logger.LogInformation("   ❌ 失败: {Count}个文件", result.FailedFiles.Count);

            if (result.MigratedFiles.Any())
            {
                _logger.LogInformation("");
                _logger.LogInformation("成功迁移的文件:");
                foreach (var file in result.MigratedFiles.Take(10))
                {
                    _logger.LogInformation("  • {File}", file);
                }
                if (result.MigratedFiles.Count > 10)
                {
                    _logger.LogInformation("  ... 还有 {Count} 个文件", result.MigratedFiles.Count - 10);
                }
            }

            if (result.FailedFiles.Any())
            {
                _logger.LogWarning("");
                _logger.LogWarning("失败的文件:");
                foreach (var file in result.FailedFiles)
                {
                    _logger.LogWarning("  • {File}", file);
                }
            }

            return result.IsFullySuccessful ? 0 : 1;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 迁移失败: {Message}", ex.Message);
            return 1;
        }
    }

    /// <summary>
    /// 执行信息命令
    /// </summary>
    private Task<int> ExecuteInfoAsync()
    {
        Console.WriteLine();
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("📚 DevKit Partial类机制说明");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine();
        Console.WriteLine("核心理念:");
        Console.WriteLine("  • 使用C# partial机制分离自动生成代码和用户自定义代码");
        Console.WriteLine("  • 自动生成的代码放在 *.Generated.cs 文件中（每次会覆盖）");
        Console.WriteLine("  • 用户自定义代码放在 *.cs 文件中（永久保留）");
        Console.WriteLine();
        Console.WriteLine("文件命名约定:");
        Console.WriteLine("  • Entity.Generated.cs    → 自动生成，每次覆盖");
        Console.WriteLine("  • Entity.cs              → 用户自定义，永久保留");
        Console.WriteLine("  • EntityDto.Generated.cs → 自动生成，每次覆盖");
        Console.WriteLine("  • EntityDto.cs           → 用户自定义，永久保留");
        Console.WriteLine();
        Console.WriteLine("使用示例:");
        Console.WriteLine();
        Console.WriteLine("  // BlogPost.Generated.cs (自动生成，每次会覆盖)");
        Console.WriteLine("  public partial class BlogPost : FullAuditedAggregateRoot<Guid>");
        Console.WriteLine("  {");
        Console.WriteLine("      // ⚙️ 自动生成区域开始 - 请勿修改");
        Console.WriteLine("      public string Title { get; set; }");
        Console.WriteLine("      public string Content { get; set; }");
        Console.WriteLine("      // ⚙️ 自动生成区域结束");
        Console.WriteLine("  }");
        Console.WriteLine();
        Console.WriteLine("  // BlogPost.cs (用户自定义，永久保留)");
        Console.WriteLine("  public partial class BlogPost");
        Console.WriteLine("  {");
        Console.WriteLine("      // ✍️ 用户自定义代码 - 安全保护");
        Console.WriteLine("      public string GetSummary(int length)");
        Console.WriteLine("      {");
        Console.WriteLine("          return Content?.Substring(0, Math.Min(length, Content.Length)) + \"...\";");
        Console.WriteLine("      }");
        Console.WriteLine("  }");
        Console.WriteLine();
        Console.WriteLine("常用命令:");
        Console.WriteLine("  devkit partial validate               # 验证Partial类设置");
        Console.WriteLine("  devkit partial validate -c BlogPost   # 验证特定类");
        Console.WriteLine("  devkit partial migrate                # 迁移现有代码");
        Console.WriteLine("  devkit partial migrate -p ./Domain    # 迁移指定目录");
        Console.WriteLine();
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine();

        return Task.FromResult(0);
    }
}

