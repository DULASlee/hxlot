using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using SmartAbp.DevKit.Core.Config;
using SmartAbp.DevKit.Core.Generator;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Models;
using SmartAbp.DevKit.Core.Templates;
using Xunit;

namespace SmartAbp.DevKit.Core.Tests.Integration;

/// <summary>
/// GeneratorOrchestrator集成测试
/// DevKit v2.0 Day 10-11核心组件集成测试
/// </summary>
public class GeneratorOrchestratorTests : IDisposable
{
    private readonly ILogger<GeneratorOrchestrator> _logger;
    private readonly string _testProjectPath;
    private readonly GeneratorOrchestrator _orchestrator;

    public GeneratorOrchestratorTests()
    {
        _logger = NullLoggerFactory.Instance.CreateLogger<GeneratorOrchestrator>();
        _testProjectPath = Path.Combine(Path.GetTempPath(), $"DevKitOrchestratorTest_{Guid.NewGuid():N}");
        SetupTestProject();

        var configLoaderLogger = NullLoggerFactory.Instance.CreateLogger<ConfigLoader>();
        var configLoader = new ConfigLoader(configLoaderLogger);

        var metadataLogger = NullLoggerFactory.Instance.CreateLogger<UnifiedMetadataSDK>();
        var metadataSDK = new UnifiedMetadataSDK(metadataLogger);

        var templateLogger = NullLoggerFactory.Instance.CreateLogger<TemplateManager>();
        var templateManager = new TemplateManager(templateLogger);

        _orchestrator = new GeneratorOrchestrator(_logger, configLoader, metadataSDK, templateManager);
    }

    public void Dispose()
    {
        if (Directory.Exists(_testProjectPath))
        {
            Directory.Delete(_testProjectPath, true);
        }
    }

    private void SetupTestProject()
    {
        Directory.CreateDirectory(_testProjectPath);
        Directory.CreateDirectory(Path.Combine(_testProjectPath, ".lowcode"));
        Directory.CreateDirectory(Path.Combine(_testProjectPath, ".lowcode/templates"));
        CreateTestConfig();
        CreateTestTemplates();
    }

    private void CreateTestConfig()
    {
        var config = new LowCodeConfig
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
            },
            OutputPaths = new OutputPathsConfig
            {
                DomainPath = Path.Combine(_testProjectPath, "src/Domain"),
                ApplicationPath = Path.Combine(_testProjectPath, "src/Application"),
                FrontendPath = Path.Combine(_testProjectPath, "src/Frontend/views")
            }
        };

        var configPath = Path.Combine(_testProjectPath, ".lowcode/config.json");
        var json = JsonSerializer.Serialize(config, new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        File.WriteAllText(configPath, json);
    }

    private void CreateTestTemplates()
    {
        var templatesPath = Path.Combine(_testProjectPath, ".lowcode/templates");

        // Domain Entity模板
        var entityTemplate = @"
namespace {{Namespace}}.Domain.Entities
{
    public class {{EntityName}} : Entity<Guid>
    {
        {{#each Fields}}
        public {{DataType}} {{FieldName}} { get; set; }
        {{/each}}
    }
}
";
        File.WriteAllText(Path.Combine(templatesPath, "Entity.hbs"), entityTemplate);

        // Application Service模板
        var appServiceTemplate = @"
namespace {{Namespace}}.Application
{
    public class {{EntityName}}AppService : ApplicationService
    {
        public Task<{{EntityName}}Dto> GetAsync(Guid id) { }
        public Task<List<{{EntityName}}Dto>> GetListAsync() { }
    }
}
";
        File.WriteAllText(Path.Combine(templatesPath, "AppService.hbs"), appServiceTemplate);

        // Vue Page模板
        var vuePageTemplate = @"
<template>
  <div>
    <h1>{{DisplayName}}</h1>
  </div>
</template>
";
        File.WriteAllText(Path.Combine(templatesPath, "VuePage.hbs"), vuePageTemplate);
    }

    [Fact]
    public async Task GenerateAsync_WithValidConfig_ShouldSucceed()
    {
        // Act
        var result = await _orchestrator.GenerateAsync(_testProjectPath);

        // Assert
        Assert.True(result.Success, "代码生成应该成功");
        Assert.NotEmpty(result.GeneratedFiles);
        Assert.Empty(result.Errors);
    }

    [Fact]
    public async Task GenerateAsync_ShouldGenerateDomainFiles()
    {
        // Act
        var result = await _orchestrator.GenerateAsync(_testProjectPath);

        // Assert
        Assert.True(result.DomainFileCount > 0, "应该生成Domain层文件");
        Assert.Contains(result.AllGeneratedFiles.Keys,
            path => path.Contains("Domain") && path.Contains("Product"));
    }

    [Fact]
    public async Task GenerateAsync_ShouldGenerateApplicationFiles()
    {
        // Act
        var result = await _orchestrator.GenerateAsync(_testProjectPath);

        // Assert
        Assert.True(result.ApplicationFileCount > 0, "应该生成Application层文件");
        Assert.Contains(result.AllGeneratedFiles.Keys,
            path => path.Contains("Application") && path.Contains("Product"));
    }

    [Fact]
    public async Task GenerateAsync_ShouldGenerateFrontendFiles()
    {
        // Act
        var result = await _orchestrator.GenerateAsync(_testProjectPath);

        // Assert
        Assert.True(result.FrontendFileCount > 0, "应该生成Frontend层文件");
        Assert.Contains(result.AllGeneratedFiles.Keys,
            path => path.Contains("Frontend") || path.Contains("views"));
    }

    [Fact]
    public async Task GenerateAsync_IncrementalMode_ShouldSkipUnchangedFiles()
    {
        // Arrange - 第一次生成
        var result1 = await _orchestrator.GenerateAsync(_testProjectPath, enableIncremental: true);
        var initialGeneratedCount = result1.GeneratedFiles.Count;

        // Act - 第二次生成（增量模式）
        var result2 = await _orchestrator.GenerateAsync(_testProjectPath, enableIncremental: true);

        // Assert
        Assert.True(result2.Success);
        Assert.True(result2.SkippedFileCount > 0, "第二次生成应该跳过未变更文件");
        Assert.True(result2.GeneratedFiles.Count < initialGeneratedCount,
            "增量生成应该写入更少的文件");
    }

    [Fact]
    public async Task GenerateAsync_DisabledIncremental_ShouldRegenerateAll()
    {
        // Arrange - 第一次生成
        await _orchestrator.GenerateAsync(_testProjectPath, enableIncremental: true);

        // Act - 第二次生成（禁用增量）
        var result = await _orchestrator.GenerateAsync(_testProjectPath, enableIncremental: false);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(0, result.SkippedFileCount, "禁用增量模式应该重新生成所有文件");
        Assert.NotEmpty(result.GeneratedFiles);
    }

    [Fact]
    public async Task GenerateAsync_Performance_ShouldCompleteUnder5Seconds()
    {
        // Act
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var result = await _orchestrator.GenerateAsync(_testProjectPath);
        stopwatch.Stop();

        // Assert
        Assert.True(result.Success);
        Assert.True(stopwatch.ElapsedMilliseconds < 5000,
            $"代码生成耗时 {stopwatch.ElapsedMilliseconds}ms 应该<5秒");
        Assert.True(result.ElapsedMilliseconds < 5000);
    }

    [Fact]
    public async Task GenerateAsync_IncrementalPerformance_ShouldBe95xFaster()
    {
        // Arrange - 第一次生成（完整）
        var result1 = await _orchestrator.GenerateAsync(_testProjectPath, enableIncremental: false);
        var fullGenerationTime = result1.ElapsedMilliseconds;

        // Act - 第二次生成（增量）
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var result2 = await _orchestrator.GenerateAsync(_testProjectPath, enableIncremental: true);
        stopwatch.Stop();
        var incrementalTime = result2.ElapsedMilliseconds;

        // Assert
        Assert.True(result2.Success);
        Assert.True(result2.SkippedFileCount > 0, "应该跳过未变更文件");

        // 增量生成应该明显快于完整生成（至少快10倍）
        Assert.True(incrementalTime < fullGenerationTime / 10,
            $"增量生成 {incrementalTime}ms 应该比完整生成 {fullGenerationTime}ms 快至少10倍");
    }

    [Fact]
    public async Task GenerateAsync_MultipleEntities_ShouldGenerateAllFiles()
    {
        // Arrange - 添加更多实体到配置
        var configPath = Path.Combine(_testProjectPath, ".lowcode/config.json");
        var json = await File.ReadAllTextAsync(configPath);
        var config = JsonSerializer.Deserialize<LowCodeConfig>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        config!.Entities.Add(new EntityDefinitionDto
        {
            EntityName = "Order",
            DisplayName = "订单",
            TableName = "Orders",
            GenerateCrud = true,
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

        var updatedJson = JsonSerializer.Serialize(config, new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        await File.WriteAllTextAsync(configPath, updatedJson);

        // Act
        var result = await _orchestrator.GenerateAsync(_testProjectPath);

        // Assert
        Assert.True(result.Success);
        Assert.Contains(result.AllGeneratedFiles.Keys, path => path.Contains("Product"));
        Assert.Contains(result.AllGeneratedFiles.Keys, path => path.Contains("Order"));
    }

    [Fact]
    public async Task GenerateAsync_InvalidConfig_ShouldReturnFailure()
    {
        // Arrange - 删除配置文件
        var configPath = Path.Combine(_testProjectPath, ".lowcode/config.json");
        File.Delete(configPath);

        // Act
        var result = await _orchestrator.GenerateAsync(_testProjectPath);

        // Assert
        Assert.False(result.Success);
        Assert.NotEmpty(result.Errors);
    }

    [Fact]
    public async Task GenerateAsync_ShouldReportProgress()
    {
        // Act
        var result = await _orchestrator.GenerateAsync(_testProjectPath);

        // Assert
        Assert.True(result.ElapsedMilliseconds > 0, "应该记录执行时间");
        Assert.Equal(
            result.DomainFileCount + result.ApplicationFileCount + result.FrontendFileCount,
            result.AllGeneratedFiles.Count,
            "文件计数应该一致");
    }
}

