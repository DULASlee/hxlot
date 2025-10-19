using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Types;

namespace SmartAbp.DevKit.Core.Workstations;

/// <summary>
/// 前端代码生成工位
/// 职责：根据元数据和前端模板/ts-morph操作生成前端代码（Vue组件、TS接口等）
/// ⭐ D爷建议：通过Process调用Node.js脚本来集成ts-morph
/// </summary>
public class FrontendWorkstation
{
    private readonly ILogger<FrontendWorkstation> _logger;
    private readonly string _nodeScriptPath; // Node.js脚本路径

    public FrontendWorkstation(ILogger<FrontendWorkstation> logger)
    {
        _logger = logger;
        // 假设Node.js脚本位于Scripts目录下
        _nodeScriptPath = Path.Combine(AppContext.BaseDirectory, "Scripts", "tsMorphGenerator.js");

        if (!File.Exists(_nodeScriptPath))
        {
            _logger.LogWarning("⚠️ Node.js脚本未找到: {NodeScriptPath}", _nodeScriptPath);
            // 可以在这里抛出异常或采取其他错误处理措施
        }
    }

    /// <summary>
    /// 执行前端代码生成
    /// </summary>
    /// <param name="input">工位输入，包含GenerationContext</param>
    /// <param name="cancellationToken"></param>
    /// <returns>工位输出，包含生成的代码</returns>
    public async Task<WorkstationOutput> ExecuteAsync(WorkstationInput input, CancellationToken cancellationToken)
    {
        var startTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        _logger.LogInformation("🚀 前端工位启动: {WorkstationId}", "frontend");

        var entity = input.Context?.EntitySchema ?? input.Metadata;

        if (entity == null || string.IsNullOrEmpty(entity.Name))
        {
            _logger.LogError("❌ 前端工位失败: 缺少实体元数据");
            return new WorkstationOutput
            {
                WorkstationId = "frontend",
                Code = string.Empty,
                Metadata = new EntitySchema(),
                ExecutionTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - startTime,
                AdditionalData = new()
                {
                    ["errors"] = new[] { "缺少实体元数据" }
                }
            };
        }

        var generatedCode = new StringBuilder();

        try
        {
            // 将实体元数据序列化为JSON，作为参数传递给Node.js脚本
            var entityJson = JsonSerializer.Serialize(entity);

            // 启动Node.js进程
            var startInfo = new ProcessStartInfo
            {
                FileName = "node", // 确保node在PATH中
                Arguments = $"\"{_nodeScriptPath}\" \"{entityJson.Replace("\"", "\\\"")}\"", // 传递JSON字符串作为参数
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using (var process = new Process { StartInfo = startInfo })
            {
                process.Start();

                // 读取标准输出和错误输出
                string output = await process.StandardOutput.ReadToEndAsync(cancellationToken);
                string error = await process.StandardError.ReadToEndAsync(cancellationToken);

                await process.WaitForExitAsync(cancellationToken);

                if (process.ExitCode == 0)
                {
                    // ✅ 只提取JSON输出，忽略日志
                    // 从输出中提取最后一个JSON对象（从最后一个{到最后一个}）
                    int lastOpenBrace = output.LastIndexOf('{');
                    int lastCloseBrace = output.LastIndexOf('}');
                    
                    if (lastOpenBrace >= 0 && lastCloseBrace > lastOpenBrace)
                    {
                        string jsonOutput = output.Substring(lastOpenBrace, lastCloseBrace - lastOpenBrace + 1);
                        generatedCode.AppendLine(jsonOutput);
                        _logger.LogInformation("✅ 前端工位完成: {WorkstationId}", "frontend");
                        _logger.LogDebug("Node.js JSON Output Extracted Successfully");
                    }
                    else
                    {
                        _logger.LogError("❌ 无法从Node.js输出中提取JSON");
                        generatedCode.AppendLine(output); // 降级：使用全部输出
                    }
                }
                else
                {
                    _logger.LogError("❌ 前端工位Node.js脚本执行失败: {WorkstationId} - Exit Code: {ExitCode}, Error: {Error}",
                        "frontend", process.ExitCode, error);
                    return new WorkstationOutput
                    {
                        WorkstationId = "frontend",
                        Code = string.Empty,
                        Metadata = entity,
                        ExecutionTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - startTime,
                        AdditionalData = new()
                        {
                            ["errors"] = new[] { $"Node.js脚本执行失败: {error}" }
                        }
                    };
                }
            }

            return new WorkstationOutput
            {
                WorkstationId = "frontend",
                Code = generatedCode.ToString(),
                Metadata = entity,
                ExecutionTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - startTime,
                AdditionalData = new()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 前端工位执行失败: {WorkstationId} - {Message}", "frontend", ex.Message);
            return new WorkstationOutput
            {
                WorkstationId = "frontend",
                Code = string.Empty,
                Metadata = entity,
                ExecutionTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - startTime,
                AdditionalData = new()
                {
                    ["errors"] = new[] { ex.Message }
                }
            };
        }
    }
}
