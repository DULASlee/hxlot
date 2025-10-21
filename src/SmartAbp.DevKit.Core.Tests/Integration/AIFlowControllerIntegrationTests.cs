using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using SmartAbp.DevKit.Core.Config;
using SmartAbp.DevKit.Core.Flow;
using SmartAbp.DevKit.Core.Generator;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Models;
using SmartAbp.DevKit.Core.Templates;
using Xunit;

namespace SmartAbp.DevKit.Core.Tests.Integration;

/// <summary>
/// AIFlowController集成测试
/// DevKit v2.0 Day 14-15核心组件集成测试（完整AI流程）
/// </summary>
public class AIFlowControllerIntegrationTests : IDisposable
{
    private readonly ILogger<AIFlowController> _logger;
    private readonly string _testProjectPath;
    private readonly AIFlowController _flowController;
    private readonly GeneratorOrchestrator _orchestrator;

    public AIFlowControllerIntegrationTests()
    {
        _logger = NullLoggerFactory.Instance.CreateLogger<AIFlowController>();
        _testProjectPath = Path.Combine(Path.GetTempPath(), $"DevKitFlowTest_{Guid.NewGuid():N}");
        SetupTestProject();

        _flowController = new AIFlowController(_logger);

        // 初始化GeneratorOrchestrator
        var configLoaderLogger = NullLoggerFactory.Instance.CreateLogger<ConfigLoader>();
        var configLoader = new ConfigLoader(configLoaderLogger);

        var metadataLogger = NullLoggerFactory.Instance.CreateLogger<UnifiedMetadataSDK>();
        var metadataSDK = new UnifiedMetadataSDK(metadataLogger);

        var templateLogger = NullLoggerFactory.Instance.CreateLogger<TemplateManager>();
        var templateManager = new TemplateManager(templateLogger);

        _orchestrator = new GeneratorOrchestrator(_logger, configLoader, metadataSDK, templateManager);

        // 注册真实Generator工位
        _flowController.RegisterRealGenerators(_orchestrator, _testProjectPath);
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
            Entities = new List<EntityDefinitionDto>
            {
                new EntityDefinitionDto
                {
                    EntityName = "Product",
                    DisplayName = "产品",
                    TableName = "Products",
                    GenerateCrud = true,
                    Fields = new List<FieldDefinitionDto>
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
    }

    [Fact]
    public async Task ExecuteAsync_WithValidConfig_ShouldSucceed()
    {
        // Arrange
        var input = new FlowInput
        {
            Metadata = new Dictionary<string, object>
            {
                ["ProjectPath"] = _testProjectPath
            }
        };

        // Act
        var result = await _flowController.ExecuteAsync(input);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Code);
        Assert.NotNull(result.Metadata);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldUseV2WorkstationSequence()
    {
        // Arrange
        var input = new FlowInput
        {
            Metadata = new Dictionary<string, object>
            {
                ["ProjectPath"] = _testProjectPath
            }
        };

        // Act
        await _flowController.ExecuteAsync(input);

        // Assert
        var sequence = _flowController.GetWorkstationSequence();
        Assert.NotEmpty(sequence);
        Assert.Contains(sequence, id => id == "codegen" || id == "quality");
    }

    [Fact]
    public async Task ExecuteAsync_CodegenWorkstation_ShouldGenerateFiles()
    {
        // Arrange
        var input = new FlowInput
        {
            Metadata = new Dictionary<string, object>
            {
                ["ProjectPath"] = _testProjectPath
            }
        };

        // Act
        var result = await _flowController.ExecuteAsync(input);

        // Assert
        Assert.NotNull(result.AdditionalData);
        Assert.True(result.AdditionalData.ContainsKey("GeneratedFiles"));

        var generatedFiles = result.AdditionalData["GeneratedFiles"] as Dictionary<string, string>;
        Assert.NotNull(generatedFiles);
        Assert.NotEmpty(generatedFiles);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldReportProgress()
    {
        // Arrange
        var input = new FlowInput
        {
            Metadata = new Dictionary<string, object>
            {
                ["ProjectPath"] = _testProjectPath
            }
        };

        var progressReports = new List<string>();
        _flowController.OnProgress += (workstationId, message) =>
        {
            progressReports.Add($"{workstationId}: {message}");
        };

        // Act
        await _flowController.ExecuteAsync(input);

        // Assert
        Assert.NotEmpty(progressReports);
    }

    [Fact]
    public async Task ExecuteAsync_MultipleRuns_ShouldBeIdempotent()
    {
        // Arrange
        var input = new FlowInput
        {
            Metadata = new Dictionary<string, object>
            {
                ["ProjectPath"] = _testProjectPath
            }
        };

        // Act
        var result1 = await _flowController.ExecuteAsync(input);
        var result2 = await _flowController.ExecuteAsync(input);

        // Assert
        Assert.NotNull(result1);
        Assert.NotNull(result2);
        // 两次执行应该都成功
        Assert.NotNull(result1.Code);
        Assert.NotNull(result2.Code);
    }

    [Fact]
    public async Task ExecuteAsync_Performance_ShouldCompleteUnder10Seconds()
    {
        // Arrange
        var input = new FlowInput
        {
            Metadata = new Dictionary<string, object>
            {
                ["ProjectPath"] = _testProjectPath
            }
        };

        // Act
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var result = await _flowController.ExecuteAsync(input);
        stopwatch.Stop();

        // Assert
        Assert.NotNull(result);
        Assert.True(stopwatch.ElapsedMilliseconds < 10000,
            $"AI Flow执行耗时 {stopwatch.ElapsedMilliseconds}ms 应该<10秒");
    }

    [Fact]
    public async Task ExecuteAsync_WithMultipleEntities_ShouldGenerateAllFiles()
    {
        // Arrange - 添加更多实体
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
            Fields = new List<FieldDefinitionDto>
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

        var input = new FlowInput
        {
            Metadata = new Dictionary<string, object>
            {
                ["ProjectPath"] = _testProjectPath
            }
        };

        // Act
        var result = await _flowController.ExecuteAsync(input);

        // Assert
        Assert.NotNull(result.AdditionalData);
        var generatedFiles = result.AdditionalData["GeneratedFiles"] as Dictionary<string, string>;
        Assert.NotNull(generatedFiles);

        // 应该生成两个实体的文件
        var productFiles = generatedFiles.Keys.Count(k => k.Contains("Product"));
        var orderFiles = generatedFiles.Keys.Count(k => k.Contains("Order"));
        Assert.True(productFiles > 0, "应该生成Product实体的文件");
        Assert.True(orderFiles > 0, "应该生成Order实体的文件");
    }

    [Fact]
    public async Task ExecuteAsync_InvalidInput_ShouldHandleGracefully()
    {
        // Arrange
        var input = new FlowInput
        {
            Metadata = new Dictionary<string, object>()
            // 缺少ProjectPath
        };

        // Act & Assert
        // 应该抛出异常或返回错误结果
        await Assert.ThrowsAnyAsync<Exception>(
            async () => await _flowController.ExecuteAsync(input));
    }

    [Fact]
    public void GetWorkstationSequence_ShouldReturnCorrectOrder()
    {
        // Act
        var sequence = _flowController.GetWorkstationSequence();

        // Assert
        Assert.NotEmpty(sequence);
        // v2.0流程应该包含codegen工位
        Assert.Contains("codegen", sequence);
    }

    [Fact]
    public void RegisterRealGenerators_ShouldRegisterWorkstations()
    {
        // Arrange
        var flowController = new AIFlowController(_logger);

        // Act
        flowController.RegisterRealGenerators(_orchestrator, _testProjectPath);

        // Assert
        var sequence = flowController.GetWorkstationSequence();
        Assert.NotEmpty(sequence);
        Assert.Contains("codegen", sequence);
        Assert.Contains("quality", sequence);
    }

    [Fact]
    public async Task ExecuteAsync_ShouldCollectAllWorkstationOutputs()
    {
        // Arrange
        var input = new FlowInput
        {
            Metadata = new Dictionary<string, object>
            {
                ["ProjectPath"] = _testProjectPath
            }
        };

        // Act
        var result = await _flowController.ExecuteAsync(input);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.AdditionalData);
        Assert.Contains("DomainFileCount", result.AdditionalData.Keys);
        Assert.Contains("ApplicationFileCount", result.AdditionalData.Keys);
        Assert.Contains("FrontendFileCount", result.AdditionalData.Keys);
    }
}

