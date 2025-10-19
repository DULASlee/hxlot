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
    private readonly bool _verbose;

    public GenerateCommandHandler(
        ILogger<GenerateCommandHandler> logger,
        DevKitCommandService commandService,
        string? inputFile,
        string? outputDir,
        bool verbose)
    {
        _logger = logger;
        _commandService = commandService;
        _inputFile = inputFile;
        _outputDir = outputDir ?? "./output";
        _verbose = verbose;
    }

    public async Task<int> ExecuteAsync()
    {
        try
        {
            _logger.LogInformation("🚀 DevKit代码生成启动...");

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
            _logger.LogInformation($"📊 代码行数: {result.Code.Split('\n').Length}");

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
}

