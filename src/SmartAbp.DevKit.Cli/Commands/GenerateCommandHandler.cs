using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core;
using SmartAbp.DevKit.Core.Types;

namespace SmartAbp.DevKit.Cli.Commands;

/// <summary>
/// generate命令处理器
/// 负责代码生成
/// </summary>
public class GenerateCommandHandler : ICommandHandler
{
    private readonly ILogger<GenerateCommandHandler> _logger;
    private readonly DevKitCommandService _commandService;
    private readonly string? _inputFile;
    private readonly string? _outputDir;
    private readonly string? _platform;
    private readonly bool _verbose;

    public GenerateCommandHandler(
        ILogger<GenerateCommandHandler> logger,
        DevKitCommandService commandService,
        string? inputFile,
        string? outputDir,
        string? platform,
        bool verbose)
    {
        _logger = logger;
        _commandService = commandService;
        _inputFile = inputFile;
        _outputDir = outputDir ?? "./output";
        _platform = platform ?? "web";
        _verbose = verbose;
    }

    public async Task<int> ExecuteAsync()
    {
        try
        {
            _logger.LogInformation("🚀 DevKit代码生成启动...");
            _logger.LogInformation($"🎯 目标平台: {_platform}");

            // 验证平台参数
            var validPlatforms = new[] { "web", "dashboard", "uniapp", "backend" };
            if (!validPlatforms.Contains(_platform?.ToLower()))
            {
                _logger.LogError($"❌ 错误：无效的平台参数: {_platform}");
                _logger.LogError($"   支持的平台: {string.Join(", ", validPlatforms)}");
                return 1;
            }

            // 验证输入文件
            if (string.IsNullOrWhiteSpace(_inputFile))
            {
                _logger.LogError("❌ 错误：必须指定输入文件 (-i, --input)");
                return 1;
            }

            if (!File.Exists(_inputFile))
            {
                _logger.LogError($"❌ 错误：输入文件不存在: {_inputFile}");
                return 1;
            }

            // 读取输入文件
            _logger.LogInformation($"📖 读取输入文件: {_inputFile}");
            var inputJson = await File.ReadAllTextAsync(_inputFile);
            var context = JsonSerializer.Deserialize<GenerationContext>(inputJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (context == null)
            {
                _logger.LogError("❌ 错误：无法解析输入文件");
                return 1;
            }

            // 验证上下文
            if (context.EntitySchema == null)
            {
                _logger.LogError("❌ 错误：输入文件缺少EntitySchema");
                return 1;
            }

            _logger.LogInformation($"✅ 实体: {context.EntitySchema.Name}");
            _logger.LogInformation($"✅ 属性数量: {context.EntitySchema.Properties?.Count ?? 0}");

            // 执行代码生成
            _logger.LogInformation("⚙️  执行代码生成...");

            // 创建生成上下文
            var result = await _commandService.GenerateEntityAsync(
                context.EntitySchema.Name,
                context.EntitySchema.DisplayName,
                context.EntitySchema.Properties);

            if (!result.Success)
            {
                _logger.LogError("❌ 代码生成失败:");
                foreach (var error in result.Errors)
                {
                    _logger.LogError($"  - {error}");
                }
                return 1;
            }

            // 创建输出目录
            if (!Directory.Exists(_outputDir))
            {
                Directory.CreateDirectory(_outputDir);
                _logger.LogInformation($"📁 创建输出目录: {_outputDir}");
            }

            // 保存生成的代码
            var outputFileName = $"{context.EntitySchema.Name}_Generated.cs";
            var outputPath = Path.Combine(_outputDir, outputFileName);
            await File.WriteAllTextAsync(outputPath, result.Code);

            _logger.LogInformation($"✅ 代码生成成功: {outputPath}");
            _logger.LogInformation($"🎯 目标平台: {_platform}");
            _logger.LogInformation($"📊 代码行数: {result.Code.Split('\n').Length}");

            // 显示平台特定提示
            DisplayPlatformSpecificHints(_platform);

            // 显示性能指标
            if (result.Performance != null && _verbose)
            {
                _logger.LogInformation("📈 性能指标:");
                _logger.LogInformation($"  - 总耗时: {result.Performance.TotalTime}ms");
                foreach (var ws in result.Performance.WorkstationTimes)
                {
                    _logger.LogInformation($"  - {ws.Key}: {ws.Value}ms");
                }
            }

            // 显示警告
            if (result.Warnings.Count > 0)
            {
                _logger.LogWarning("⚠️ 警告:");
                foreach (var warning in result.Warnings)
                {
                    _logger.LogWarning($"  - {warning}");
                }
            }

            return 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 代码生成失败");
            return 1;
        }
    }

    /// <summary>
    /// 显示平台特定的提示信息
    /// </summary>
    private void DisplayPlatformSpecificHints(string? platform)
    {
        switch (platform?.ToLower())
        {
            case "web":
                _logger.LogInformation("💡 Web平台提示:");
                _logger.LogInformation("   - 生成的代码包含：Vue3页面、API客户端、Pinia Store");
                _logger.LogInformation("   - 依赖：Element Plus组件库");
                _logger.LogInformation("   - 部署到：src/SmartAbp.Vue/src/");
                break;

            case "dashboard":
                _logger.LogInformation("💡 Dashboard平台提示:");
                _logger.LogInformation("   - 生成的代码包含：实时数据大屏、ECharts图表、WebSocket连接");
                _logger.LogInformation("   - 依赖：ECharts、WebSocket");
                _logger.LogInformation("   - 适用场景：MES生产监控、智慧工地可视化");
                break;

            case "uniapp":
                _logger.LogInformation("💡 UniApp平台提示:");
                _logger.LogInformation("   - 生成的代码包含：移动端页面、离线缓存、API客户端");
                _logger.LogInformation("   - 依赖：uni-ui组件库");
                _logger.LogInformation("   - 支持平台：iOS、Android、H5、小程序");
                break;

            case "backend":
                _logger.LogInformation("💡 Backend平台提示:");
                _logger.LogInformation("   - 生成的代码包含：ABP模块、AppService、Controller、Entity");
                _logger.LogInformation("   - 框架：ABP vNext + DDD架构");
                _logger.LogInformation("   - 部署到：src/SmartAbp.Application/");
                break;
        }
    }
}

