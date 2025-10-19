using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Templates;
using SmartAbp.DevKit.Core.Types;
using SmartAbp.DevKit.Core.Workstations;
using Xunit;

namespace SmartAbp.DevKit.Core.Tests.Workstations;

public class BackendWorkstationTests : IDisposable
{
    private readonly IMemoryCache _memoryCache;
    private readonly Mock<ILogger<BackendWorkstation>> _loggerMock;
    private readonly TemplateManager _templateManager;
    private readonly Mock<ILogger<UnifiedMetadataSDK>> _metadataLoggerMock;
    private readonly UnifiedMetadataSDK _metadataSDK;
    private readonly BackendWorkstation _workstation;

    public BackendWorkstationTests()
    {
        _memoryCache = new MemoryCache(new MemoryCacheOptions());
        _loggerMock = new Mock<ILogger<BackendWorkstation>>();
        _templateManager = new TemplateManager(_memoryCache);
        _metadataLoggerMock = new Mock<ILogger<UnifiedMetadataSDK>>();
        _metadataSDK = new UnifiedMetadataSDK(_metadataLoggerMock.Object);
        _workstation = new BackendWorkstation(_loggerMock.Object, _templateManager, _metadataSDK);
    }

    [Fact]
    public async Task ExecuteAsync_WithValidEntity_ShouldGenerateCode()
    {
        // Arrange
        var entity = new EntitySchema
        {
            Name = "User",
            DisplayName = "用户",
            Properties = new System.Collections.Generic.List<PropertySchema>
            {
                new PropertySchema { Name = "Id", Type = "Guid", IsKey = true },
                new PropertySchema { Name = "Name", Type = "string", IsRequired = true },
                new PropertySchema { Name = "Email", Type = "string", IsRequired = true }
            }
        };

        var input = new WorkstationInput
        {
            Context = new GenerationContext
            {
                EntitySchema = entity,
                TargetFramework = "backend",
                TemplateEngine = "handlebars"
            },
            Metadata = entity
        };

        // Act
        var result = await _workstation.ExecuteAsync(input, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("backend", result.WorkstationId);
        Assert.NotNull(result.Metadata);
        Assert.Equal("User", result.Metadata.Name);
        Assert.True(result.ExecutionTime > 0);
        Assert.False(result.AdditionalData.ContainsKey("errors"),
            "应该没有错误，但发现：" + (result.AdditionalData.GetValueOrDefault("errors")?.ToString() ?? ""));
    }

    [Fact]
    public async Task ExecuteAsync_WithNullEntity_ShouldReturnError()
    {
        // Arrange
        var input = new WorkstationInput
        {
            Context = new GenerationContext(),
            Metadata = new EntitySchema() // 空的EntitySchema，没有Name
        };

        // Act
        var result = await _workstation.ExecuteAsync(input, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("backend", result.WorkstationId);
        Assert.Empty(result.Code);
        Assert.True(result.AdditionalData.ContainsKey("errors"));
    }

    [Fact]
    public async Task ExecuteAsync_WithComplexEntity_ShouldGenerateCode()
    {
        // Arrange
        var entity = new EntitySchema
        {
            Name = "Order",
            DisplayName = "订单",
            Properties = new System.Collections.Generic.List<PropertySchema>
            {
                new PropertySchema { Name = "Id", Type = "Guid", IsKey = true },
                new PropertySchema { Name = "OrderNumber", Type = "string", IsRequired = true },
                new PropertySchema { Name = "TotalAmount", Type = "decimal", IsRequired = true },
                new PropertySchema { Name = "Status", Type = "OrderStatus", IsRequired = true },
                new PropertySchema { Name = "CreatedDate", Type = "DateTime", IsRequired = true }
            },
            Relationships = new System.Collections.Generic.List<RelationshipSchema>
            {
                new RelationshipSchema
                {
                    Name = "Customer",
                    Type = RelationType.ManyToOne,
                    ToEntityId = Guid.NewGuid()
                }
            }
        };

        var input = new WorkstationInput
        {
            Context = new GenerationContext
            {
                EntitySchema = entity,
                TargetFramework = "backend",
                TemplateEngine = "handlebars"
            },
            Metadata = entity
        };

        // Act
        var result = await _workstation.ExecuteAsync(input, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("backend", result.WorkstationId);
        Assert.NotNull(result.Metadata);
        Assert.Equal("Order", result.Metadata.Name);
        Assert.Equal(5, result.Metadata.Properties.Count);
        Assert.Single(result.Metadata.Relationships);
    }

    public void Dispose()
    {
        _memoryCache?.Dispose();
    }
}

