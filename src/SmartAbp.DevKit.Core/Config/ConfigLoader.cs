using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Config;

/// <summary>
/// 配置加载器 - DevKit v2.0核心组件1
/// 负责从.lowcode/config.json加载配置
/// </summary>
public class ConfigLoader
{
    private readonly ILogger<ConfigLoader> _logger;
    private readonly ConfigValidator _validator;
    private const string LowCodeDirectory = ".lowcode";
    private const string ConfigFileName = "config.json";
    private const string SchemaFileName = "schemas/config.schema.json";

    public ConfigLoader(ILogger<ConfigLoader> logger, ConfigValidator? validator = null)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _validator = validator ?? new ConfigValidator(
            Microsoft.Extensions.Logging.Abstractions.NullLoggerFactory.Instance
                .CreateLogger<ConfigValidator>());
    }

    /// <summary>
    /// 异步加载配置
    /// </summary>
    /// <param name="projectPath">项目根路径</param>
    /// <returns>模块元数据配置</returns>
    public async Task<LowCodeConfig> LoadConfigAsync(string projectPath)
    {
        if (string.IsNullOrWhiteSpace(projectPath))
        {
            throw new ArgumentException("项目路径不能为空", nameof(projectPath));
        }

        var configPath = GetConfigPath(projectPath);

        _logger.LogInformation("正在加载配置文件: {ConfigPath}", configPath);

        // 检查配置文件是否存在
        if (!File.Exists(configPath))
        {
            var errorMessage = $"配置文件不存在: {configPath}。请先运行 'devkit init' 初始化项目。";
            _logger.LogError(errorMessage);
            throw new FileNotFoundException(errorMessage, configPath);
        }

        try
        {
            // 读取JSON文件
            var json = await File.ReadAllTextAsync(configPath);

            if (string.IsNullOrWhiteSpace(json))
            {
                throw new InvalidOperationException($"配置文件为空: {configPath}");
            }

            // ✅ Step 1: JSON Schema验证（可选）
            var schemaPath = Path.Combine(projectPath, LowCodeDirectory, SchemaFileName);
            if (File.Exists(schemaPath))
            {
                var schemaValidation = await _validator.ValidateWithSchemaAsync(json, schemaPath);
                if (!schemaValidation.IsValid)
                {
                    var errors = string.Join(", ", schemaValidation.Errors.Select(e => e.Message));
                    throw new InvalidOperationException($"配置文件Schema验证失败: {errors}");
                }
                _logger.LogDebug("✅ JSON Schema验证通过");
            }

            // ✅ Step 2: 反序列化为配置对象
            var config = JsonSerializer.Deserialize<LowCodeConfig>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                AllowTrailingCommas = true,
                ReadCommentHandling = JsonCommentHandling.Skip
            });

            if (config == null)
            {
                throw new InvalidOperationException($"配置文件反序列化失败: {configPath}");
            }

            // ✅ Step 3: 业务规则验证
            var businessValidation = await _validator.ValidateAsync(config);
            if (!businessValidation.IsValid)
            {
                var errors = string.Join("; ", businessValidation.Errors.Select(e => $"{e.PropertyName}: {e.Message}"));
                _logger.LogError("配置验证失败: {Errors}", errors);
                throw new InvalidOperationException($"配置文件验证失败: {errors}");
            }

            _logger.LogInformation("✅ 配置加载成功 - 模块: {ModuleName}, 实体数: {EntityCount}, 层级: {Layer}",
                config.ModuleName,
                config.Entities?.Count ?? 0,
                config.CurrentLayer);

            return config;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "配置文件JSON格式错误: {ConfigPath}", configPath);
            throw new InvalidOperationException($"配置文件格式错误: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "加载配置文件失败: {ConfigPath}", configPath);
            throw;
        }
    }

    /// <summary>
    /// 同步加载配置（向后兼容）
    /// </summary>
    public LowCodeConfig LoadConfig(string projectPath)
    {
        return LoadConfigAsync(projectPath).GetAwaiter().GetResult();
    }

    /// <summary>
    /// 检查配置文件是否存在
    /// </summary>
    public bool ConfigExists(string projectPath)
    {
        var configPath = GetConfigPath(projectPath);
        return File.Exists(configPath);
    }

    /// <summary>
    /// 获取配置文件完整路径
    /// </summary>
    public string GetConfigPath(string projectPath)
    {
        return Path.Combine(projectPath, LowCodeDirectory, ConfigFileName);
    }

    /// <summary>
    /// 获取.lowcode目录路径
    /// </summary>
    public string GetLowCodeDirectory(string projectPath)
    {
        return Path.Combine(projectPath, LowCodeDirectory);
    }
}

