using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Config;

/// <summary>
/// .lowcode/目录管理器 - DevKit v2.0核心组件
/// 负责.lowcode/目录的初始化、验证和管理
/// </summary>
public class LowCodeDirectoryManager
{
    private readonly ILogger<LowCodeDirectoryManager> _logger;
    private readonly DefaultConfigProvider _defaultConfigProvider;
    private const string LowCodeDirectory = ".lowcode";
    private const string ConfigFileName = "config.json";
    private const string HashesFileName = "hashes.json";
    private const string VersionFileName = ".lowcode-version";
    private const string CurrentVersion = "2.0.0";

    public LowCodeDirectoryManager(ILogger<LowCodeDirectoryManager> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        // 创建DefaultConfigProvider专用的logger
        var loggerFactory = Microsoft.Extensions.Logging.Abstractions.NullLoggerFactory.Instance;
        var configProviderLogger = loggerFactory.CreateLogger<DefaultConfigProvider>();
        _defaultConfigProvider = new DefaultConfigProvider(configProviderLogger);
    }

    /// <summary>
    /// 初始化.lowcode/目录
    /// </summary>
    /// <param name="projectPath">项目根路径</param>
    /// <param name="moduleName">模块名称（可选，默认为SampleModule）</param>
    /// <param name="createSampleConfig">是否创建示例配置</param>
    public async Task InitializeAsync(string projectPath, string moduleName = "SampleModule", bool createSampleConfig = false)
    {
        if (string.IsNullOrWhiteSpace(projectPath))
        {
            throw new ArgumentException("项目路径不能为空", nameof(projectPath));
        }

        _logger.LogInformation("开始初始化.lowcode/目录: {ProjectPath}", projectPath);

        var lowcodeDir = Path.Combine(projectPath, LowCodeDirectory);

        // 1. 创建目录结构
        await CreateDirectoryStructureAsync(lowcodeDir);

        // 2. 创建配置文件
        var configPath = Path.Combine(lowcodeDir, ConfigFileName);
        if (!File.Exists(configPath))
        {
            await CreateDefaultConfigAsync(configPath, moduleName, createSampleConfig);
        }
        else
        {
            _logger.LogWarning("配置文件已存在，跳过创建: {ConfigPath}", configPath);
        }

        // 3. 创建版本文件
        await CreateVersionFileAsync(lowcodeDir);

        // 4. 创建空的哈希文件（用于增量生成）
        await CreateHashesFileAsync(lowcodeDir);

        // 5. 创建JSON Schema文件
        await CreateSchemaFileAsync(lowcodeDir);

        _logger.LogInformation("✅ .lowcode/目录初始化完成");
        _logger.LogInformation("   - 目录: {LowCodeDir}", lowcodeDir);
        _logger.LogInformation("   - 配置文件: {ConfigFile}", Path.Combine(lowcodeDir, ConfigFileName));
        _logger.LogInformation("   - 版本: {Version}", CurrentVersion);
    }

    /// <summary>
    /// 创建目录结构
    /// </summary>
    private async Task CreateDirectoryStructureAsync(string lowcodeDir)
    {
        _logger.LogInformation("创建目录结构...");

        // 创建主目录
        Directory.CreateDirectory(lowcodeDir);

        // 创建子目录
        var templatesDir = Path.Combine(lowcodeDir, "templates");
        Directory.CreateDirectory(templatesDir);

        var schemasDir = Path.Combine(lowcodeDir, "schemas");
        Directory.CreateDirectory(schemasDir);

        _logger.LogInformation("目录结构创建完成");

        await Task.CompletedTask;
    }

    /// <summary>
    /// 创建默认配置文件
    /// </summary>
    private async Task CreateDefaultConfigAsync(string configPath, string moduleName, bool createSampleConfig)
    {
        _logger.LogInformation("创建配置文件: {ConfigPath}", configPath);

        var config = createSampleConfig
            ? _defaultConfigProvider.CreateSampleConfig(moduleName)
            : _defaultConfigProvider.GetDefaultConfig();

        var json = JsonSerializer.Serialize(config, new JsonSerializerOptions
        {
            WriteIndented = true,
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        });

        await File.WriteAllTextAsync(configPath, json);

        _logger.LogInformation("配置文件创建成功");
    }

    /// <summary>
    /// 创建版本文件
    /// </summary>
    private async Task CreateVersionFileAsync(string lowcodeDir)
    {
        var versionPath = Path.Combine(lowcodeDir, VersionFileName);

        await File.WriteAllTextAsync(versionPath, CurrentVersion);

        _logger.LogInformation("版本文件创建完成: v{Version}", CurrentVersion);
    }

    /// <summary>
    /// 创建空的哈希文件
    /// </summary>
    private async Task CreateHashesFileAsync(string lowcodeDir)
    {
        var hashesPath = Path.Combine(lowcodeDir, HashesFileName);

        if (!File.Exists(hashesPath))
        {
            var emptyHashes = new System.Collections.Generic.Dictionary<string, ulong>();
            var json = JsonSerializer.Serialize(emptyHashes, new JsonSerializerOptions
            {
                WriteIndented = true
            });

            await File.WriteAllTextAsync(hashesPath, json);

            _logger.LogInformation("哈希文件创建完成（用于增量生成）");
        }
    }

    /// <summary>
    /// 创建JSON Schema文件
    /// </summary>
    private async Task CreateSchemaFileAsync(string lowcodeDir)
    {
        var schemaPath = Path.Combine(lowcodeDir, "schemas", "config.schema.json");

        if (!File.Exists(schemaPath))
        {
            var schema = GetConfigSchema();
            await File.WriteAllTextAsync(schemaPath, schema);

            _logger.LogInformation("JSON Schema文件创建完成");
        }
    }

    /// <summary>
    /// 验证.lowcode/目录结构
    /// </summary>
    public bool ValidateStructure(string projectPath)
    {
        var lowcodeDir = Path.Combine(projectPath, LowCodeDirectory);

        if (!Directory.Exists(lowcodeDir))
        {
            _logger.LogWarning(".lowcode/目录不存在");
            return false;
        }

        var configPath = Path.Combine(lowcodeDir, ConfigFileName);
        if (!File.Exists(configPath))
        {
            _logger.LogWarning("配置文件不存在: {ConfigPath}", configPath);
            return false;
        }

        var versionPath = Path.Combine(lowcodeDir, VersionFileName);
        if (!File.Exists(versionPath))
        {
            _logger.LogWarning("版本文件不存在: {VersionPath}", versionPath);
            return false;
        }

        _logger.LogInformation("✅ .lowcode/目录结构验证通过");
        return true;
    }

    /// <summary>
    /// 获取当前版本
    /// </summary>
    public async Task<string?> GetVersionAsync(string projectPath)
    {
        var versionPath = Path.Combine(projectPath, LowCodeDirectory, VersionFileName);

        if (!File.Exists(versionPath))
        {
            return null;
        }

        var version = await File.ReadAllTextAsync(versionPath);
        return version.Trim();
    }

    /// <summary>
    /// 更新版本
    /// </summary>
    public async Task UpdateVersionAsync(string projectPath, string version)
    {
        var versionPath = Path.Combine(projectPath, LowCodeDirectory, VersionFileName);
        await File.WriteAllTextAsync(versionPath, version);

        _logger.LogInformation("版本已更新: {Version}", version);
    }

    /// <summary>
    /// 获取配置JSON Schema
    /// </summary>
    private string GetConfigSchema()
    {
        return @"{
  ""$schema"": ""http://json-schema.org/draft-07/schema#"",
  ""title"": ""LowCodeConfig"",
  ""description"": ""DevKit低代码配置模型"",
  ""type"": ""object"",
  ""required"": [""ModuleName""],
  ""properties"": {
    ""ConfigId"": {
      ""type"": ""string"",
      ""format"": ""uuid"",
      ""description"": ""配置唯一标识符""
    },
    ""ModuleName"": {
      ""type"": ""string"",
      ""minLength"": 1,
      ""pattern"": ""^[A-Za-z_][A-Za-z0-9_]*$"",
      ""description"": ""模块名称（必填）""
    },
    ""CurrentLayer"": {
      ""type"": ""integer"",
      ""enum"": [1, 2, 3],
      ""description"": ""当前目标层级（1=基础CRUD, 2=完整功能, 3=企业级）""
    },
    ""IsMicroservice"": {
      ""type"": ""boolean"",
      ""description"": ""是否启用微服务模式""
    },
    ""Entities"": {
      ""type"": ""array"",
      ""items"": {
        ""$ref"": ""#/definitions/EntityDefinition""
      },
      ""description"": ""实体定义列表""
    },
    ""TemplateConfig"": {
      ""$ref"": ""#/definitions/TemplateConfig""
    },
    ""OutputPaths"": {
      ""$ref"": ""#/definitions/OutputPathConfig""
    }
  },
  ""definitions"": {
    ""EntityDefinition"": {
      ""type"": ""object"",
      ""required"": [""EntityName""],
      ""properties"": {
        ""EntityName"": {
          ""type"": ""string"",
          ""pattern"": ""^[A-Za-z_][A-Za-z0-9_]*$""
        },
        ""Properties"": {
          ""type"": ""array"",
          ""items"": {
            ""$ref"": ""#/definitions/EntityProperty""
          }
        },
        ""GenerateCrud"": {
          ""type"": ""boolean"",
          ""default"": true
        }
      }
    },
    ""EntityProperty"": {
      ""type"": ""object"",
      ""required"": [""Name"", ""Type""],
      ""properties"": {
        ""Name"": {
          ""type"": ""string"",
          ""pattern"": ""^[A-Za-z_][A-Za-z0-9_]*$""
        },
        ""Type"": {
          ""type"": ""string"",
          ""enum"": [""string"", ""int"", ""long"", ""decimal"", ""bool"", ""DateTime"", ""Guid""]
        },
        ""IsRequired"": {
          ""type"": ""boolean"",
          ""default"": false
        },
        ""MaxLength"": {
          ""type"": ""integer"",
          ""minimum"": 1
        }
      }
    },
    ""TemplateConfig"": {
      ""type"": ""object"",
      ""properties"": {
        ""BackendTemplatePath"": {
          ""type"": ""string""
        },
        ""FrontendTemplatePath"": {
          ""type"": ""string""
        }
      }
    },
    ""OutputPathConfig"": {
      ""type"": ""object"",
      ""properties"": {
        ""ApplicationPath"": {
          ""type"": ""string""
        },
        ""DomainPath"": {
          ""type"": ""string""
        },
        ""FrontendPath"": {
          ""type"": ""string""
        }
      }
    }
  }
}";
    }
}

