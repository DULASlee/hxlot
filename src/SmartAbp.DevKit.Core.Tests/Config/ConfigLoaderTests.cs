using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using SmartAbp.DevKit.Core.Config;
using SmartAbp.DevKit.Core.Models;
using Xunit;

namespace SmartAbp.DevKit.Core.Tests.Config;

/// <summary>
/// ConfigLoader单元测试
/// DevKit v2.0 Day 1-2核心组件测试
/// </summary>
public class ConfigLoaderTests : IDisposable
{
    private readonly ILogger<ConfigLoader> _logger;
    private readonly ConfigLoader _configLoader;
    private readonly string _testProjectPath;

    public ConfigLoaderTests()
    {
        _logger = NullLoggerFactory.Instance.CreateLogger<ConfigLoader>();
        _configLoader = new ConfigLoader(_logger);
        _testProjectPath = Path.Combine(Path.GetTempPath(), $"DevKitTest_{Guid.NewGuid():N}");
        Directory.CreateDirectory(_testProjectPath);
    }

    public void Dispose()
    {
        if (Directory.Exists(_testProjectPath))
        {
            Directory.Delete(_testProjectPath, true);
        }
    }

    [Fact]
    public async Task LoadConfigAsync_ValidConfig_ShouldSucceed()
    {
        // Arrange
        var config = CreateValidConfig();
        await SaveConfigAsync(config);

        // Act
        var loadedConfig = await _configLoader.LoadConfigAsync(_testProjectPath);

        // Assert
        Assert.NotNull(loadedConfig);
        Assert.Equal("Product", loadedConfig.ModuleName);
        Assert.Equal("SmartAbp", loadedConfig.Namespace);
        Assert.Single(loadedConfig.Entities);
        Assert.Equal("Product", loadedConfig.Entities[0].EntityName);
    }

    [Fact]
    public async Task LoadConfigAsync_MissingConfigFile_ShouldThrowException()
    {
        // Arrange
        // 不创建配置文件

        // Act & Assert
        await Assert.ThrowsAsync<FileNotFoundException>(
            () => _configLoader.LoadConfigAsync(_testProjectPath));
    }

    [Fact]
    public async Task LoadConfigAsync_InvalidJson_ShouldThrowException()
    {
        // Arrange
        var configFilePath = Path.Combine(_testProjectPath, ".lowcode", "config.json");
        Directory.CreateDirectory(Path.GetDirectoryName(configFilePath)!);
        await File.WriteAllTextAsync(configFilePath, "{ invalid json }");

        // Act & Assert
        await Assert.ThrowsAsync<JsonException>(
            () => _configLoader.LoadConfigAsync(_testProjectPath));
    }

    [Fact]
    public async Task LoadConfigAsync_EmptyEntities_ShouldReturnConfig()
    {
        // Arrange
        var config = CreateValidConfig();
        config.Entities.Clear();
        await SaveConfigAsync(config);

        // Act
        var loadedConfig = await _configLoader.LoadConfigAsync(_testProjectPath);

        // Assert
        Assert.NotNull(loadedConfig);
        Assert.Empty(loadedConfig.Entities);
    }

    [Fact]
    public async Task LoadConfigAsync_MultipleEntities_ShouldLoadAll()
    {
        // Arrange
        var config = CreateValidConfig();
        config.Entities.Add(new EntityDefinitionDto
        {
            EntityName = "Order",
            DisplayName = "订单",
            TableName = "Orders",
            Fields = new System.Collections.Generic.List<FieldDefinitionDto>
            {
                new FieldDefinitionDto
                {
                    FieldName = "OrderNumber",
                    DataType = "string",
                    IsRequired = true,
                    MaxLength = 50
                }
            }
        });
        await SaveConfigAsync(config);

        // Act
        var loadedConfig = await _configLoader.LoadConfigAsync(_testProjectPath);

        // Assert
        Assert.NotNull(loadedConfig);
        Assert.Equal(2, loadedConfig.Entities.Count);
        Assert.Contains(loadedConfig.Entities, e => e.EntityName == "Product");
        Assert.Contains(loadedConfig.Entities, e => e.EntityName == "Order");
    }

    [Fact]
    public async Task LoadConfigAsync_WithOutputPaths_ShouldLoadCorrectly()
    {
        // Arrange
        var config = CreateValidConfig();
        config.OutputPaths = new OutputPathsConfig
        {
            DomainPath = "custom/domain",
            ApplicationPath = "custom/application",
            FrontendPath = "custom/frontend"
        };
        await SaveConfigAsync(config);

        // Act
        var loadedConfig = await _configLoader.LoadConfigAsync(_testProjectPath);

        // Assert
        Assert.NotNull(loadedConfig.OutputPaths);
        Assert.Equal("custom/domain", loadedConfig.OutputPaths.DomainPath);
        Assert.Equal("custom/application", loadedConfig.OutputPaths.ApplicationPath);
        Assert.Equal("custom/frontend", loadedConfig.OutputPaths.FrontendPath);
    }

    [Fact]
    public async Task LoadConfigAsync_WithTemplateConfig_ShouldLoadCorrectly()
    {
        // Arrange
        var config = CreateValidConfig();
        config.TemplateConfig = new Models.TemplateConfig
        {
            TemplateDirectory = "custom/templates",
            UseBuiltinTemplates = false,
            TemplateExtension = ".mustache"
        };
        await SaveConfigAsync(config);

        // Act
        var loadedConfig = await _configLoader.LoadConfigAsync(_testProjectPath);

        // Assert
        Assert.NotNull(loadedConfig.TemplateConfig);
        Assert.Equal("custom/templates", loadedConfig.TemplateConfig.TemplateDirectory);
        Assert.False(loadedConfig.TemplateConfig.UseBuiltinTemplates);
        Assert.Equal(".mustache", loadedConfig.TemplateConfig.TemplateExtension);
    }

    [Fact]
    public async Task LoadConfigAsync_WithComplexFields_ShouldLoadCorrectly()
    {
        // Arrange
        var config = CreateValidConfig();
        config.Entities[0].Fields.Add(new FieldDefinitionDto
        {
            FieldName = "CreatedDate",
            DisplayName = "创建日期",
            DataType = "datetime",
            IsRequired = true
        });
        config.Entities[0].Fields.Add(new FieldDefinitionDto
        {
            FieldName = "IsActive",
            DisplayName = "是否启用",
            DataType = "bool",
            IsRequired = true
        });
        await SaveConfigAsync(config);

        // Act
        var loadedConfig = await _configLoader.LoadConfigAsync(_testProjectPath);

        // Assert
        Assert.NotNull(loadedConfig);
        var entity = loadedConfig.Entities[0];
        Assert.Contains(entity.Fields, f => f.FieldName == "CreatedDate" && f.DataType == "datetime");
        Assert.Contains(entity.Fields, f => f.FieldName == "IsActive" && f.DataType == "bool");
    }

    /// <summary>
    /// 创建有效的配置对象
    /// </summary>
    private LowCodeConfig CreateValidConfig()
    {
        return new LowCodeConfig
        {
            ModuleName = "Product",
            Namespace = "SmartAbp",
            Entities = new System.Collections.Generic.List<EntityDefinitionDto>
            {
                new EntityDefinitionDto
                {
                    EntityName = "Product",
                    DisplayName = "产品",
                    TableName = "Products",
                    GenerateCrud = true,
                    Fields = new System.Collections.Generic.List<FieldDefinitionDto>
                    {
                        new FieldDefinitionDto
                        {
                            FieldName = "Name",
                            DisplayName = "产品名称",
                            DataType = "string",
                            IsRequired = true,
                            MaxLength = 100
                        },
                        new FieldDefinitionDto
                        {
                            FieldName = "Price",
                            DisplayName = "价格",
                            DataType = "decimal",
                            IsRequired = true
                        }
                    }
                }
            }
        };
    }

    /// <summary>
    /// 保存配置到测试项目路径
    /// </summary>
    private async Task SaveConfigAsync(LowCodeConfig config)
    {
        var configFilePath = Path.Combine(_testProjectPath, ".lowcode", "config.json");
        var directory = Path.GetDirectoryName(configFilePath);
        if (!string.IsNullOrEmpty(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var json = JsonSerializer.Serialize(config, new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await File.WriteAllTextAsync(configFilePath, json);
    }
}
