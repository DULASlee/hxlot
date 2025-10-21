using System;
using System.CommandLine;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Cli.Commands;
using SmartAbp.DevKit.Cli.Plugins;
using SmartAbp.DevKit.Core;
using Volo.Abp;

namespace SmartAbp.DevKit.Cli;

class Program
{
    static async Task<int> Main(string[] args)
    {
        // 创建根命令
        var rootCommand = new RootCommand("SmartAbp DevKit - 企业级代码生成工具");

        // 创建generate命令
        var generateCommand = new Command("generate", "生成代码");
        var inputOption = new Option<string?>(
            aliases: new[] { "-i", "--input" },
            description: "输入文件路径（JSON格式）");
        var outputOption = new Option<string?>(
            aliases: new[] { "-o", "--output" },
            description: "输出目录路径",
            getDefaultValue: () => "./output");
        var platformOption = new Option<string?>(
            aliases: new[] { "-p", "--platform" },
            description: "目标平台：web（默认）| dashboard | uniapp",
            getDefaultValue: () => "web");
        var verboseOption = new Option<bool>(
            aliases: new[] { "-v", "--verbose" },
            description: "显示详细信息");

        generateCommand.AddOption(inputOption);
        generateCommand.AddOption(outputOption);
        generateCommand.AddOption(platformOption);
        generateCommand.AddOption(verboseOption);

        generateCommand.SetHandler(async (inputFile, outputDir, platform, verbose) =>
        {
            await RunWithHostAsync(async (host, exitCode) =>
            {
                var logger = host.Services.GetRequiredService<ILogger<GenerateCommandHandler>>();
                var commandService = host.Services.GetRequiredService<DevKitCommandService>();
                var handler = new GenerateCommandHandler(logger, commandService, inputFile, outputDir, platform, verbose);
                exitCode.Value = await handler.ExecuteAsync();
            });
        }, inputOption, outputOption, platformOption, verboseOption);

        rootCommand.AddCommand(generateCommand);

        // 创建config命令
        var configCommand = new Command("config", "配置管理");
        var actionArgument = new Argument<string?>(
            name: "action",
            description: "操作类型: list, show, get, set, init");
        var keyOption = new Option<string?>(
            aliases: new[] { "-k", "--key" },
            description: "配置键");
        var valueOption = new Option<string?>(
            aliases: new[] { "--value" },
            description: "配置值");

        configCommand.AddArgument(actionArgument);
        configCommand.AddOption(keyOption);
        configCommand.AddOption(valueOption);

        configCommand.SetHandler(async (action, key, value) =>
        {
            await RunWithHostAsync(async (host, exitCode) =>
            {
                var logger = host.Services.GetRequiredService<ILogger<ConfigCommandHandler>>();
                var configuration = host.Services.GetRequiredService<IConfiguration>();
                var handler = new ConfigCommandHandler(logger, configuration, action, key, value);
                exitCode.Value = await handler.ExecuteAsync();
            });
        }, actionArgument, keyOption, valueOption);

        rootCommand.AddCommand(configCommand);

        // 创建init命令（初始化项目）
        var initCommand = new Command("init", "初始化DevKit项目（创建.lowcode/目录）");
        var moduleNameOption = new Option<string>(
            aliases: new[] { "-m", "--module-name" },
            description: "模块名称",
            getDefaultValue: () => "SampleModule");
        var pathOption = new Option<string>(
            aliases: new[] { "-p", "--path" },
            description: "项目路径",
            getDefaultValue: () => Directory.GetCurrentDirectory());
        var sampleOption = new Option<bool>(
            aliases: new[] { "-s", "--sample" },
            description: "创建示例配置",
            getDefaultValue: () => false);
        var forceOption = new Option<bool>(
            aliases: new[] { "-f", "--force" },
            description: "强制覆盖",
            getDefaultValue: () => false);

        initCommand.AddOption(moduleNameOption);
        initCommand.AddOption(pathOption);
        initCommand.AddOption(sampleOption);
        initCommand.AddOption(forceOption);

        initCommand.SetHandler(async (moduleName, path, sample, force) =>
        {
            await RunWithHostAsync(async (host, exitCode) =>
            {
                var logger = host.Services.GetRequiredService<ILogger<InitCommandHandler>>();
                var directoryManager = host.Services.GetRequiredService<Core.Config.LowCodeDirectoryManager>();
                var handler = new InitCommandHandler(logger, directoryManager);
                var command = handler.GetCommand();
                // 直接执行
                exitCode.Value = await handler.ExecuteAsync(moduleName, path, sample, force);
            });
        }, moduleNameOption, pathOption, sampleOption, forceOption);

        rootCommand.AddCommand(initCommand);

        // 创建interactive命令（交互式模式）
        var interactiveCommand = new Command("interactive", "交互式代码生成");
        interactiveCommand.SetHandler(async () =>
        {
            await RunWithHostAsync(async (host, exitCode) =>
            {
                var logger = host.Services.GetRequiredService<ILogger<InteractiveCommandHandler>>();
                var commandService = host.Services.GetRequiredService<DevKitCommandService>();
                var handler = new InteractiveCommandHandler(logger, commandService);
                exitCode.Value = await handler.ExecuteAsync();
            });
        });

        rootCommand.AddCommand(interactiveCommand);

        // 创建batch命令（批量生成）
        var batchCommand = new Command("batch", "批量生成多个实体");
        batchCommand.AddOption(inputOption);
        batchCommand.AddOption(outputOption);
        batchCommand.AddOption(verboseOption);

        batchCommand.SetHandler(async (inputFile, outputDir, verbose) =>
        {
            await RunWithHostAsync(async (host, exitCode) =>
            {
                var logger = host.Services.GetRequiredService<ILogger<BatchGenerateCommandHandler>>();
                var commandService = host.Services.GetRequiredService<DevKitCommandService>();
                var handler = new BatchGenerateCommandHandler(logger, commandService, inputFile ?? "input.json", outputDir ?? "./output-batch", verbose);
                exitCode.Value = await handler.ExecuteAsync();
            });
        }, inputOption, outputOption, verboseOption);

        rootCommand.AddCommand(batchCommand);

        // 创建template命令（模板管理）
        var templateCommand = new Command("template", "模板管理");
        var templateActionArg = new Argument<string>(
            name: "action",
            description: "操作类型: list, add, remove, show, validate");
        var templateNameOption = new Option<string?>(
            aliases: new[] { "-n", "--name" },
            description: "模板名称");
        var templatePathOption = new Option<string?>(
            aliases: new[] { "-p", "--path" },
            description: "模板文件路径");

        templateCommand.AddArgument(templateActionArg);
        templateCommand.AddOption(templateNameOption);
        templateCommand.AddOption(templatePathOption);

        templateCommand.SetHandler(async (action, name, path) =>
        {
            await RunWithHostAsync(async (host, exitCode) =>
            {
                var logger = host.Services.GetRequiredService<ILogger<TemplateCommandHandler>>();
                var handler = new TemplateCommandHandler(logger, action, name, path);
                exitCode.Value = await handler.ExecuteAsync();
            });
        }, templateActionArg, templateNameOption, templatePathOption);

        rootCommand.AddCommand(templateCommand);

        // 创建plugin命令（插件管理）
        var pluginCommand = new Command("plugin", "插件管理");
        var pluginActionArg = new Argument<string>(
            name: "action",
            description: "操作类型: list, run");
        var pluginNameOption = new Option<string?>(
            aliases: new[] { "-n", "--name" },
            description: "插件名称");

        pluginCommand.AddArgument(pluginActionArg);
        pluginCommand.AddOption(pluginNameOption);

        pluginCommand.SetHandler(async (action, name) =>
        {
            await RunWithHostAsync(async (host, exitCode) =>
            {
                var logger = host.Services.GetRequiredService<ILogger<PluginManager>>();
                var pluginManager = new PluginManager(logger);

                await pluginManager.LoadPluginsAsync();

                if (action == "list")
                {
                    pluginManager.ListPlugins();
                    exitCode.Value = 0;
                }
                else if (action == "run" && !string.IsNullOrEmpty(name))
                {
                    exitCode.Value = await pluginManager.ExecutePluginAsync(name, Array.Empty<string>());
                }
                else
                {
                    logger.LogError("无效的操作");
                    exitCode.Value = 1;
                }

                await pluginManager.CleanupAsync();
            });
        }, pluginActionArg, pluginNameOption);

        rootCommand.AddCommand(pluginCommand);

        // 创建partial命令（Partial类管理，DevKit v2.0 Day 15）
        var partialCommand = new Command("partial", "Partial类管理（用户代码保护机制）");
        partialCommand.SetHandler(async () =>
        {
            await RunWithHostAsync(async (host, exitCode) =>
            {
                var logger = host.Services.GetRequiredService<ILogger<PartialClassCommandHandler>>();
                var partialClassManager = host.Services.GetRequiredService<Core.CodeMerge.PartialClassManager>();
                var handler = new PartialClassCommandHandler(logger, partialClassManager);

                // 获取完整命令并执行
                var command = handler.GetCommand();
                Console.WriteLine("使用 'devkit partial --help' 查看详细帮助");
                exitCode.Value = 0;
            });
        });

        rootCommand.AddCommand(partialCommand);

        // 创建quality命令（质量门禁，DevKit v2.0 Day 16）
        var qualityCommand = new Command("quality", "质量门禁检查（五关强制门禁）");
        qualityCommand.SetHandler(async () =>
        {
            await RunWithHostAsync(async (host, exitCode) =>
            {
                var logger = host.Services.GetRequiredService<ILogger<QualityCommandHandler>>();
                var handler = new QualityCommandHandler(logger);
                var command = handler.GetCommand();
                Console.WriteLine("使用 'devkit quality --help' 查看详细帮助");
                exitCode.Value = 0;
            });
        });

        rootCommand.AddCommand(qualityCommand);

        // 创建version命令
        var versionCommand = new Command("version", "显示版本信息");
        versionCommand.SetHandler(() =>
        {
            Console.WriteLine("SmartAbp DevKit v1.0.0");
            Console.WriteLine("企业级代码生成工具");
            Console.WriteLine("https://github.com/smartabp/devkit");
        });

        rootCommand.AddCommand(versionCommand);

        // 执行命令
        return await rootCommand.InvokeAsync(args);
    }

    private static async Task RunWithHostAsync(Func<IHost, ExitCodeContainer, Task> action)
    {
        var exitCode = new ExitCodeContainer();

        var host = Host.CreateDefaultBuilder()
            .ConfigureAppConfiguration((context, config) =>
            {
                config.SetBasePath(Directory.GetCurrentDirectory());
                config.AddJsonFile("appsettings.json", optional: true);
                config.AddJsonFile("devkit.config.json", optional: true);
                config.AddEnvironmentVariables(prefix: "DEVKIT_");
            })
            .ConfigureServices((context, services) =>
            {
                // 注册DevKit核心模块（简化版，不使用ABP）
                services.AddLogging(builder =>
                {
                    builder.AddConsole();
                    builder.SetMinimumLevel(LogLevel.Information);
                });

                // 手动注册DevKit核心服务
                services.Configure<Core.Config.DevKitConfig>(context.Configuration.GetSection("DevKit"));
                services.AddSingleton<Microsoft.Extensions.Caching.Memory.IMemoryCache, Microsoft.Extensions.Caching.Memory.MemoryCache>();

                // 注册Config相关服务（DevKit v2.0核心组件）
                services.AddSingleton<Core.Config.ConfigLoader>();
                services.AddSingleton<Core.Config.ConfigValidator>();
                services.AddSingleton<Core.Config.DefaultConfigProvider>();
                services.AddSingleton<Core.Config.LowCodeDirectoryManager>();

                // 注册CodeMerge相关服务（DevKit v2.0 Day 15: Partial类机制）
                services.AddSingleton<Core.CodeMerge.PartialClassManager>();

                services.AddSingleton<Core.Templates.TemplateManager>();
                services.AddSingleton<Core.Quality.QualityGateEnforcer>();
                services.AddSingleton<Core.Monitoring.MetricsCollector>();
                services.AddSingleton<Core.Metadata.UnifiedMetadataSDK>();
                services.AddSingleton<Core.Workstations.BackendWorkstation>();
                services.AddSingleton<Core.Workstations.FrontendWorkstation>();

                // 注册GeneratorOrchestrator（DevKit v2.0核心组件）
                services.AddSingleton<Core.Generator.GeneratorOrchestrator>();

                // 注册AIFlowController（DevKit v2.0：不再预注册工位）
                services.AddSingleton<Core.Flow.AIFlowController>(sp =>
                {
                    var logger = sp.GetRequiredService<ILogger<Core.Flow.AIFlowController>>();
                    var metricsCollector = sp.GetRequiredService<Core.Monitoring.MetricsCollector>();

                    var flowController = new Core.Flow.AIFlowController(
                        logger,
                        metricsCollector
                    );

                    // v2.0: 工位注册延迟到实际执行时（需要projectPath参数）
                    // 由GenerateCommandHandler调用flowController.RegisterRealGenerators()

                    return flowController;
                });

                // 注册DevKitCommandService
                services.AddTransient<DevKitCommandService>(sp =>
                {
                    var flowController = sp.GetRequiredService<Core.Flow.AIFlowController>();
                    var metadataSDK = sp.GetRequiredService<Core.Metadata.UnifiedMetadataSDK>();
                    var logger = sp.GetRequiredService<ILogger<DevKitCommandService>>();
                    return new DevKitCommandService(flowController, metadataSDK, logger);
                });
            })
            .Build();

        try
        {
            await action(host, exitCode);
            Environment.Exit(exitCode.Value);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"致命错误: {ex.Message}");
            if (ex.StackTrace != null)
            {
                Console.Error.WriteLine(ex.StackTrace);
            }
            Environment.Exit(1);
        }
    }

    private class ExitCodeContainer
    {
        public int Value { get; set; }
    }
}

