using System;
using System.CommandLine;
using System.CommandLine.Invocation;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Config;

namespace SmartAbp.DevKit.Cli.Commands;

/// <summary>
/// devkit init 命令处理器
/// 初始化.lowcode/目录和配置文件
/// </summary>
public class InitCommandHandler : ICommandHandler
{
    private readonly ILogger<InitCommandHandler> _logger;
    private readonly LowCodeDirectoryManager _directoryManager;

    public InitCommandHandler(
        ILogger<InitCommandHandler> logger,
        LowCodeDirectoryManager directoryManager)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _directoryManager = directoryManager ?? throw new ArgumentNullException(nameof(directoryManager));
    }

    /// <summary>
    /// 注册命令
    /// </summary>
    public Command GetCommand()
    {
        var initCommand = new Command("init", "初始化DevKit项目（创建.lowcode/目录和配置文件）");

        // 添加选项：模块名称
        var moduleNameOption = new Option<string>(
            aliases: new[] { "--module-name", "-m" },
            description: "模块名称（默认：SampleModule）",
            getDefaultValue: () => "SampleModule");

        // 添加选项：项目路径
        var projectPathOption = new Option<string>(
            aliases: new[] { "--path", "-p" },
            description: "项目根路径（默认：当前目录）",
            getDefaultValue: () => Directory.GetCurrentDirectory());

        // 添加选项：是否创建示例配置
        var sampleOption = new Option<bool>(
            aliases: new[] { "--sample", "-s" },
            description: "是否创建示例配置（包含Blog示例实体）",
            getDefaultValue: () => false);

        // 添加选项：是否强制覆盖
        var forceOption = new Option<bool>(
            aliases: new[] { "--force", "-f" },
            description: "强制覆盖已存在的配置文件",
            getDefaultValue: () => false);

        initCommand.AddOption(moduleNameOption);
        initCommand.AddOption(projectPathOption);
        initCommand.AddOption(sampleOption);
        initCommand.AddOption(forceOption);

        initCommand.SetHandler(ExecuteAsync, moduleNameOption, projectPathOption, sampleOption, forceOption);

        return initCommand;
    }

    /// <summary>
    /// 执行init命令
    /// </summary>
    public async Task<int> ExecuteAsync(
        string moduleName,
        string projectPath,
        bool createSample,
        bool force)
    {
        try
        {
            Console.WriteLine();
            Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            Console.WriteLine("🚀 DevKit v2.0 - 项目初始化");
            Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            Console.WriteLine();

            // 验证项目路径
            if (!Directory.Exists(projectPath))
            {
                Console.WriteLine($"❌ 错误：项目路径不存在: {projectPath}");
                return 1;
            }

            var lowcodeDir = Path.Combine(projectPath, ".lowcode");
            var configPath = Path.Combine(lowcodeDir, "config.json");

            // 检查是否已初始化
            if (Directory.Exists(lowcodeDir) && File.Exists(configPath) && !force)
            {
                Console.WriteLine("⚠️  警告：项目已初始化！");
                Console.WriteLine($"   .lowcode/目录已存在: {lowcodeDir}");
                Console.WriteLine();
                Console.WriteLine("   如需重新初始化，请使用 --force 选项：");
                Console.WriteLine("   devkit init --force");
                Console.WriteLine();
                return 1;
            }

            // 显示初始化信息
            Console.WriteLine($"📁 项目路径: {projectPath}");
            Console.WriteLine($"📦 模块名称: {moduleName}");
            Console.WriteLine($"📋 配置类型: {(createSample ? "示例配置（包含Blog实体）" : "空白配置")}");
            Console.WriteLine();

            // 执行初始化
            Console.WriteLine("⏳ 正在初始化...");
            Console.WriteLine();

            await _directoryManager.InitializeAsync(projectPath, moduleName, createSample);

            // 显示成功信息
            Console.WriteLine();
            Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            Console.WriteLine("✅ 初始化成功！");
            Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            Console.WriteLine();
            Console.WriteLine("📂 已创建以下文件和目录：");
            Console.WriteLine($"   └─ .lowcode/");
            Console.WriteLine($"      ├─ config.json          (主配置文件)");
            Console.WriteLine($"      ├─ hashes.json          (增量生成缓存)");
            Console.WriteLine($"      ├─ .lowcode-version     (版本: 2.0.0)");
            Console.WriteLine($"      ├─ templates/           (自定义模板目录)");
            Console.WriteLine($"      └─ schemas/             (JSON Schema验证)");
            Console.WriteLine($"         └─ config.schema.json");
            Console.WriteLine();

            // 显示下一步操作
            Console.WriteLine("📖 下一步操作：");
            Console.WriteLine();
            Console.WriteLine($"   1. 编辑配置文件：");
            Console.WriteLine($"      {configPath}");
            Console.WriteLine();
            Console.WriteLine($"   2. 生成代码：");
            Console.WriteLine($"      devkit generate");
            Console.WriteLine();

            if (createSample)
            {
                Console.WriteLine("   💡 提示：当前配置包含示例实体（Post和Comment），");
                Console.WriteLine("      可以直接运行 'devkit generate' 查看效果");
                Console.WriteLine();
            }

            _logger.LogInformation("项目初始化成功: {ProjectPath}, 模块: {ModuleName}", projectPath, moduleName);

            return 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine();
            Console.WriteLine("❌ 初始化失败！");
            Console.WriteLine($"   错误信息: {ex.Message}");
            Console.WriteLine();

            _logger.LogError(ex, "项目初始化失败");

            return 1;
        }
    }
}

