using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Tests.Abstractions;

/// <summary>
/// ICodeGenerator接口测试
/// 测试代码生成器的核心功能
/// </summary>
public class ICodeGeneratorTests
{
    private readonly Mock<ILogger<TestCodeGenerator>> _mockLogger;
    private readonly TestCodeGenerator _generator;

    public ICodeGeneratorTests()
    {
        _mockLogger = new Mock<ILogger<TestCodeGenerator>>();
        _generator = new TestCodeGenerator(_mockLogger.Object);
    }

    [Fact]
    public async Task GenerateAsync_WithValidInput_ShouldReturnSuccess()
    {
        // Arrange
        var config = CreateValidLowCodeConfig();
        var context = new GenerationContext
        {
            Config = config,
            OutputPath = "output",
            TargetLayer = TargetLayer.Layer1,
            GenerationMode = GenerationMode.Create
        };

        // Act
        var result = await _generator.GenerateAsync(context);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.GeneratedFiles.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GenerateAsync_WithNullConfig_ShouldReturnFailure()
    {
        // Arrange
        var context = new GenerationContext
        {
            Config = null!,
            OutputPath = "output",
            TargetLayer = TargetLayer.Layer1
        };

        // Act
        var result = await _generator.GenerateAsync(context);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("配置对象不能为空");
    }

    [Fact]
    public async Task ValidateAsync_WithEmptyModuleName_ShouldReturnInvalid()
    {
        // Arrange
        var config = CreateValidLowCodeConfig();
        config.ModuleName = "";
        var context = new GenerationContext { Config = config };

        // Act
        var result = await _generator.ValidateAsync(context);

        // Assert
        result.Should().NotBeNull();
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.Contains("模块名称不能为空"));
    }

    [Fact]
    public async Task GenerateAsync_WithEmptyEntities_ShouldReturnFailure()
    {
        // Arrange
        var config = CreateValidLowCodeConfig();
        config.Entities.Clear();
        var context = new GenerationContext
        {
            Config = config,
            OutputPath = "output",
            TargetLayer = TargetLayer.Layer1
        };

        // Act
        var result = await _generator.GenerateAsync(context);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Contain("至少需要定义一个实体");
    }

    [Theory]
    [InlineData(TargetLayer.Layer1)]
    [InlineData(TargetLayer.Layer2)]
    [InlineData(TargetLayer.Layer3)]
    public async Task GenerateAsync_WithDifferentTargetLayers_ShouldGenerateCorrectly(TargetLayer targetLayer)
    {
        // Arrange
        var config = CreateValidLowCodeConfig();
        var context = new GenerationContext
        {
            Config = config,
            OutputPath = "output",
            TargetLayer = targetLayer
        };

        // Act
        var result = await _generator.GenerateAsync(context);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.GeneratedFiles.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GenerateAsync_ShouldLogInformationMessages()
    {
        // Arrange
        var config = CreateValidLowCodeConfig();
        var context = new GenerationContext
        {
            Config = config,
            OutputPath = "output",
            TargetLayer = TargetLayer.Layer1
        };

        // Act
        await _generator.GenerateAsync(context);

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("开始生成代码")),
                It.IsAny<Exception>(),
                It.Is<Func<It.IsAnyType, Exception?, string>>((v, t) => true)),
            Times.AtLeastOnce);
    }

    [Fact]
    public async Task GenerateAsync_WithMicroserviceMode_ShouldGenerateMicroserviceFiles()
    {
        // Arrange
        var config = CreateValidLowCodeConfig();
        config.IsMicroservice = true;
        config.MicroserviceConfig = new MicroserviceConfig
        {
            ServiceName = "TestService",
            HttpPort = 5000,
            GrpcPort = 5001
        };
        var context = new GenerationContext
        {
            Config = config,
            OutputPath = "output",
            TargetLayer = TargetLayer.Layer1
        };

        // Act
        var result = await _generator.GenerateAsync(context);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.GeneratedFiles.Should().Contain(f => f.Path.Contains("MicroserviceConfig"));
    }

    #region Helper Methods

    private LowCodeConfig CreateValidLowCodeConfig()
    {
        return new LowCodeConfig
        {
            ModuleName = "TestModule",
            CurrentLayer = TargetLayer.Layer1,
            Entities = new List<EntityDefinition>
            {
                new EntityDefinition
                {
                    EntityName = "TestEntity",
                    GenerateCrud = true,
                    Properties = new List<EntityProperty>
                    {
                        new EntityProperty
                        {
                            Name = "Name",
                            Type = "string",
                            IsRequired = true,
                            MaxLength = 50
                        }
                    }
                }
            },
            OutputPaths = new OutputPathConfig
            {
                DomainPath = "Domain",
                ApplicationPath = "Application"
            }
        };
    }

    #endregion
}

/// <summary>
/// 测试用的CodeGenerator实现
/// </summary>
public class TestCodeGenerator : ICodeGenerator
{
    private readonly ILogger<TestCodeGenerator> _logger;

    public TestCodeGenerator(ILogger<TestCodeGenerator> logger)
    {
        _logger = logger;
    }

    // 实现接口属性
    public string Name => "TestGenerator";
    public string Description => "Test Code Generator";
    public TargetLayer SupportedLayer => TargetLayer.Layer1;
    public int Priority => 100;
    public bool IsEnabled => true;

    public async Task<GenerationResult> GenerateAsync(GenerationContext context, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("开始生成代码: {ModuleName}", context.Config?.ModuleName);

        var validation = await ValidateAsync(context);
        if (!validation.IsValid)
        {
            return new GenerationResult
            {
                IsSuccess = false,
                ErrorMessage = string.Join("; ", validation.Errors)
            };
        }

        var result = new GenerationResult
        {
            IsSuccess = true,
            GeneratedFiles = new List<GeneratedFile>
            {
                new GeneratedFile
                {
                    Path = "TestEntity.cs",
                    Content = "public class TestEntity {}",
                    FileType = FileType.CSharp
                }
            }
        };

        if (context.Config!.IsMicroservice)
        {
            result.GeneratedFiles.Add(new GeneratedFile
            {
                Path = "MicroserviceConfig.cs",
                Content = "public class ServiceConfig {}",
                FileType = FileType.CSharp
            });
        }

        return await Task.FromResult(result);
    }

    public Task<ValidationResult> ValidateAsync(GenerationContext context)
    {
        var result = new ValidationResult();

        if (context.Config == null)
        {
            result.IsValid = false;
            result.Errors.Add("配置对象不能为空");
            return Task.FromResult(result);
        }

        if (string.IsNullOrWhiteSpace(context.Config.ModuleName))
        {
            result.IsValid = false;
            result.Errors.Add("模块名称不能为空");
            return Task.FromResult(result);
        }

        if (context.Config.Entities == null || !context.Config.Entities.Any())
        {
            result.IsValid = false;
            result.Errors.Add("至少需要定义一个实体");
            return Task.FromResult(result);
        }

        return Task.FromResult(result);
    }

    public string[] GetDependencies()
    {
        return Array.Empty<string>();
    }
}

