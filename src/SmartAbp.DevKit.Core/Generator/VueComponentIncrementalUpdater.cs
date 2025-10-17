using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// Vue组件增量更新器
/// 使用ts-morph进行AST级别的增量更新，保护手动编写的代码
/// </summary>
public class VueComponentIncrementalUpdater : CodeGeneratorFramework<VueComponentUpdateInput, string>
{
    private readonly ILogger<VueComponentIncrementalUpdater> _logger;
    private readonly string _tsMorphScriptPath;

    public VueComponentIncrementalUpdater(ILogger<VueComponentIncrementalUpdater> logger)
    {
        _logger = logger;
        // ts-morph脚本路径（Node.js脚本）
        _tsMorphScriptPath = Path.Combine(AppContext.BaseDirectory, "Scripts", "vue-updater.js");
    }

    public override async Task<string> GenerateAsync(VueComponentUpdateInput input)
    {
        _logger.LogInformation("开始增量更新Vue组件: {FilePath}", input.FilePath);

        // 验证输入
        var validation = await ValidateInputAsync(input);
        if (!validation.IsValid)
        {
            throw new InvalidOperationException($"输入验证失败: {validation.ErrorMessage}");
        }

        // 调用Node.js脚本执行ts-morph更新
        var result = await ExecuteTsMorphUpdateAsync(input);

        _logger.LogInformation("Vue组件增量更新完成");
        return result;
    }

    public override Task<ValidationResult> ValidateInputAsync(VueComponentUpdateInput input)
    {
        if (string.IsNullOrWhiteSpace(input.FilePath))
            return Task.FromResult(ValidationResult.Fail("FilePath不能为空"));

        if (string.IsNullOrWhiteSpace(input.ComponentName))
            return Task.FromResult(ValidationResult.Fail("ComponentName不能为空"));

        if (input.Properties == null || input.Properties.Count == 0)
            return Task.FromResult(ValidationResult.Fail("Properties不能为空"));

        return Task.FromResult(ValidationResult.Success());
    }

    /// <summary>
    /// 执行ts-morph更新（调用Node.js脚本）
    /// </summary>
    private async Task<string> ExecuteTsMorphUpdateAsync(VueComponentUpdateInput input)
    {
        // 构建Node.js脚本参数
        var args = BuildScriptArguments(input);

        // 执行Node.js脚本
        var processInfo = new System.Diagnostics.ProcessStartInfo
        {
            FileName = "node",
            Arguments = $"\"{_tsMorphScriptPath}\" {args}",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = System.Diagnostics.Process.Start(processInfo);
        if (process == null)
            throw new InvalidOperationException("无法启动Node.js进程");

        var output = await process.StandardOutput.ReadToEndAsync();
        var error = await process.StandardError.ReadToEndAsync();

        await process.WaitForExitAsync();

        if (process.ExitCode != 0)
        {
            _logger.LogError("ts-morph更新失败: {Error}", error);
            throw new InvalidOperationException($"ts-morph更新失败: {error}");
        }

        _logger.LogInformation("ts-morph更新成功: {Output}", output);
        return output;
    }

    private string BuildScriptArguments(VueComponentUpdateInput input)
    {
        var sb = new StringBuilder();
        sb.Append($"--file \"{input.FilePath}\" ");
        sb.Append($"--component \"{input.ComponentName}\" ");
        sb.Append($"--mode {input.UpdateMode} ");

        // 属性列表（JSON格式）
        var propsJson = System.Text.Json.JsonSerializer.Serialize(input.Properties);
        sb.Append($"--props '{propsJson}' ");

        return sb.ToString();
    }
}

/// <summary>
/// Vue组件更新输入
/// </summary>
public class VueComponentUpdateInput
{
    /// <summary>
    /// 组件文件路径
    /// </summary>
    public string FilePath { get; set; } = default!;

    /// <summary>
    /// 组件名称
    /// </summary>
    public string ComponentName { get; set; } = default!;

    /// <summary>
    /// 更新模式：merge（合并） | replace（替换）
    /// </summary>
    public string UpdateMode { get; set; } = "merge";

    /// <summary>
    /// 属性列表
    /// </summary>
    public List<VuePropertyInfo> Properties { get; set; } = new();
}

/// <summary>
/// Vue组件属性信息
/// </summary>
public class VuePropertyInfo
{
    public string Name { get; set; } = default!;
    public string Type { get; set; } = default!;
    public string? DefaultValue { get; set; }
    public bool Required { get; set; }
}

