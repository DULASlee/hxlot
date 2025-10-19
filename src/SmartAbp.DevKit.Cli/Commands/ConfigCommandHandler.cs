using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Config;

namespace SmartAbp.DevKit.Cli.Commands;

/// <summary>
/// config命令处理器
/// 负责配置管理
/// </summary>
public class ConfigCommandHandler : ICommandHandler
{
    private readonly ILogger<ConfigCommandHandler> _logger;
    private readonly IConfiguration _configuration;
    private readonly string? _action;
    private readonly string? _key;
    private readonly string? _value;

    public ConfigCommandHandler(
        ILogger<ConfigCommandHandler> logger,
        IConfiguration configuration,
        string? action,
        string? key,
        string? value)
    {
        _logger = logger;
        _configuration = configuration;
        _action = action;
        _key = key;
        _value = value;
    }

    public async Task<int> ExecuteAsync()
    {
        try
        {
            _logger.LogInformation("⚙️  DevKit配置管理");

            switch (_action?.ToLower())
            {
                case "list":
                case "show":
                    return await ShowConfigAsync();

                case "set":
                    return await SetConfigAsync();

                case "get":
                    return await GetConfigAsync();

                case "init":
                    return await InitConfigAsync();

                default:
                    _logger.LogError($"❌ 未知的操作: {_action}");
                    _logger.LogInformation("支持的操作: list, show, get, set, init");
                    return 1;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 配置操作失败");
            return 1;
        }
    }

    private async Task<int> ShowConfigAsync()
    {
        _logger.LogInformation("📋 当前配置:");

        var config = _configuration.GetSection("DevKit").Get<DevKitConfig>();
        if (config == null)
        {
            _logger.LogWarning("⚠️ 未找到DevKit配置");
            return 1;
        }

        var json = JsonSerializer.Serialize(config, new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        Console.WriteLine(json);
        return 0;
    }

    private async Task<int> GetConfigAsync()
    {
        if (string.IsNullOrWhiteSpace(_key))
        {
            _logger.LogError("❌ 错误：必须指定配置键 (--key)");
            return 1;
        }

        var value = _configuration[$"DevKit:{_key}"];
        if (value == null)
        {
            _logger.LogWarning($"⚠️ 未找到配置键: {_key}");
            return 1;
        }

        _logger.LogInformation($"✅ {_key} = {value}");
        return 0;
    }

    private async Task<int> SetConfigAsync()
    {
        if (string.IsNullOrWhiteSpace(_key))
        {
            _logger.LogError("❌ 错误：必须指定配置键 (--key)");
            return 1;
        }

        if (string.IsNullOrWhiteSpace(_value))
        {
            _logger.LogError("❌ 错误：必须指定配置值 (--value)");
            return 1;
        }

        var configFile = "devkit.config.json";
        if (!File.Exists(configFile))
        {
            _logger.LogError($"❌ 错误：配置文件不存在: {configFile}");
            return 1;
        }

        // 读取现有配置
        var jsonText = await File.ReadAllTextAsync(configFile);
        using var jsonDoc = JsonDocument.Parse(jsonText);
        var root = jsonDoc.RootElement;

        // 注意：这里应该使用更复杂的JSON修改逻辑
        // 简化实现：提示用户手动修改
        _logger.LogInformation($"ℹ️  请在配置文件中手动设置: DevKit:{_key} = {_value}");
        _logger.LogInformation($"配置文件路径: {Path.GetFullPath(configFile)}");

        return 0;
    }

    private async Task<int> InitConfigAsync()
    {
        var configFile = "devkit.config.json";
        if (File.Exists(configFile))
        {
            _logger.LogWarning($"⚠️ 配置文件已存在: {configFile}");
            _logger.LogInformation("提示：使用 --force 参数覆盖现有配置");
            return 1;
        }

        // 创建默认配置
        var defaultConfig = new DevKitConfig
        {
            AIFlow = new AIFlowConfigSection
            {
                TimeoutSeconds = 300,
                MaxRetries = 3,
                EnableMiddlewarePipeline = true,
                EnableLoggingMiddleware = true,
                EnablePerformanceMiddleware = true,
                EnableErrorHandlingMiddleware = true,
                EnableValidationMiddleware = true,
                EnableCachingMiddleware = true
            },
            TemplateEngine = new TemplateEngineConfigSection
            {
                // 使用默认配置
            },
            QualityGate = new QualityGateConfigSection
            {
                Enabled = true,
                StrictMode = true,
                EnableMetadataConsistencyCheck = true,
                EnableTypeConsistencyCheck = true,
                EnableTemplateOutputCheck = true,
                EnableCompilationCheck = true,
                EnableArchitectureConstraintsCheck = true
            },
            Performance = new PerformanceConfigSection
            {
                // 使用默认配置
            }
        };

        var json = JsonSerializer.Serialize(new { DevKit = defaultConfig }, new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await File.WriteAllTextAsync(configFile, json);
        _logger.LogInformation($"✅ 配置文件已创建: {configFile}");

        return 0;
    }
}

