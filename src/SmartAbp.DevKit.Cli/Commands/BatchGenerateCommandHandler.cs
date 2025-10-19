using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core;
using SmartAbp.DevKit.Core.Types;

namespace SmartAbp.DevKit.Cli.Commands;

/// <summary>
/// 批量生成命令处理器
/// 支持从JSON文件批量生成多个实体
/// </summary>
public class BatchGenerateCommandHandler : ICommandHandler
{
    private readonly ILogger<BatchGenerateCommandHandler> _logger;
    private readonly DevKitCommandService _commandService;
    private readonly string _inputFile;
    private readonly string _outputDir;
    private readonly bool _verbose;

    public BatchGenerateCommandHandler(
        ILogger<BatchGenerateCommandHandler> logger,
        DevKitCommandService commandService,
        string inputFile,
        string outputDir,
        bool verbose)
    {
        _logger = logger;
        _commandService = commandService;
        _inputFile = inputFile;
        _outputDir = outputDir;
        _verbose = verbose;
    }

    public async Task<int> ExecuteAsync()
    {
        try
        {
            _logger.LogInformation("🚀 DevKit批量生成启动...");

            // 读取输入文件
            if (!File.Exists(_inputFile))
            {
                _logger.LogError($"❌ 输入文件不存在: {_inputFile}");
                return 1;
            }

            _logger.LogInformation($"📖 读取输入文件: {_inputFile}");
            var jsonContent = await File.ReadAllTextAsync(_inputFile);

            // 解析JSON（支持数组格式，不区分大小写）
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var entities = JsonSerializer.Deserialize<List<EntityWrapper>>(jsonContent, options);

            if (entities == null || entities.Count == 0)
            {
                _logger.LogError("❌ 文件内容无效或为空");
                return 1;
            }

            _logger.LogInformation($"📦 发现 {entities.Count} 个实体");

            // 创建输出目录
            if (!Directory.Exists(_outputDir))
            {
                Directory.CreateDirectory(_outputDir);
                _logger.LogInformation($"📁 创建输出目录: {_outputDir}");
            }

            // 批量生成
            var successCount = 0;
            var failureCount = 0;
            var startTime = DateTime.Now;

            foreach (var wrapper in entities)
            {
                var entity = wrapper.EntitySchema;
                _logger.LogInformation($"\n⚙️  正在生成: {entity.Name}");

                try
                {
                    var result = await _commandService.GenerateEntityAsync(
                        entity.Name,
                        entity.DisplayName ?? entity.Name,
                        entity.Properties);

                    if (result.Success)
                    {
                        // 保存生成的代码
                        var outputFile = Path.Combine(_outputDir, $"{entity.Name}_Generated.cs");
                        await File.WriteAllTextAsync(outputFile, result.Code);

                        successCount++;
                        _logger.LogInformation($"✅ {entity.Name} 生成成功: {outputFile}");

                        if (_verbose && result.Performance != null)
                        {
                            _logger.LogInformation($"   - 耗时: {result.Performance.TotalTime}ms");
                            _logger.LogInformation($"   - 代码行数: {result.Code.Split('\n').Length}");
                        }
                    }
                    else
                    {
                        failureCount++;
                        _logger.LogError($"❌ {entity.Name} 生成失败");
                        foreach (var error in result.Errors)
                        {
                            _logger.LogError($"   - {error}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    failureCount++;
                    _logger.LogError(ex, $"❌ {entity.Name} 生成异常");
                }
            }

            var totalTime = (DateTime.Now - startTime).TotalMilliseconds;

            // 显示统计信息
            _logger.LogInformation("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            _logger.LogInformation($"📊 批量生成完成");
            _logger.LogInformation($"   - 总数: {entities.Count}");
            _logger.LogInformation($"   - 成功: {successCount} ✅");
            _logger.LogInformation($"   - 失败: {failureCount} ❌");
            _logger.LogInformation($"   - 成功率: {(successCount * 100.0 / entities.Count):F1}%");
            _logger.LogInformation($"   - 总耗时: {totalTime:F0}ms");
            _logger.LogInformation($"   - 平均: {(totalTime / entities.Count):F0}ms/实体");
            _logger.LogInformation($"   - 输出目录: {Path.GetFullPath(_outputDir)}");
            _logger.LogInformation("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            return failureCount == 0 ? 0 : 1;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 批量生成失败");
            return 1;
        }
    }

    // 辅助类
    private class EntityWrapper
    {
        public EntitySchema EntitySchema { get; set; } = null!;
    }
}

