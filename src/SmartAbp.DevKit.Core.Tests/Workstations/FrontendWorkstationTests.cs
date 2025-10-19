using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using SmartAbp.DevKit.Core.Types;
using SmartAbp.DevKit.Core.Workstations;
using Xunit;

namespace SmartAbp.DevKit.Core.Tests.Workstations;

public class FrontendWorkstationTests
{
    private readonly Mock<ILogger<FrontendWorkstation>> _loggerMock;
    private readonly FrontendWorkstation _workstation;

    public FrontendWorkstationTests()
    {
        _loggerMock = new Mock<ILogger<FrontendWorkstation>>();
        _workstation = new FrontendWorkstation(_loggerMock.Object);
    }

    [Fact]
    public async Task ExecuteAsync_WithValidEntity_ShouldAttemptGeneration()
    {
        // Arrange
        var entity = new EntitySchema
        {
            Name = "Product",
            DisplayName = "产品",
            Properties = new System.Collections.Generic.List<PropertySchema>
            {
                new PropertySchema { Name = "Id", Type = "Guid", IsKey = true },
                new PropertySchema { Name = "Name", Type = "string", IsRequired = true },
                new PropertySchema { Name = "Price", Type = "decimal", IsRequired = true }
            }
        };

        var input = new WorkstationInput
        {
            Context = new GenerationContext
            {
                EntitySchema = entity,
                TargetFramework = "frontend",
                TemplateEngine = "tsmorph"
            },
            Metadata = entity
        };

        // Act
        var result = await _workstation.ExecuteAsync(input, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("frontend", result.WorkstationId);
        Assert.NotNull(result.Metadata);
        Assert.Equal("Product", result.Metadata.Name);
        Assert.True(result.ExecutionTime > 0);

        // 注意：由于没有实际的Node.js脚本，这个测试可能会返回错误
        // 这是预期的，因为FrontendWorkstation需要外部Node.js环境
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
        Assert.Equal("frontend", result.WorkstationId);
        Assert.Empty(result.Code);
        Assert.True(result.AdditionalData.ContainsKey("errors"));
    }

    [Fact]
    public async Task ExecuteAsync_WithComplexEntity_ShouldSerializeMetadata()
    {
        // Arrange
        var entity = new EntitySchema
        {
            Name = "Customer",
            DisplayName = "客户",
            Properties = new System.Collections.Generic.List<PropertySchema>
            {
                new PropertySchema { Name = "Id", Type = "Guid", IsKey = true },
                new PropertySchema { Name = "Name", Type = "string", IsRequired = true },
                new PropertySchema { Name = "Email", Type = "string", IsRequired = true },
                new PropertySchema { Name = "Phone", Type = "string", IsRequired = false }
            },
            Relationships = new System.Collections.Generic.List<RelationshipSchema>
            {
                new RelationshipSchema
                {
                    Name = "Orders",
                    Type = RelationType.OneToMany,
                    ToEntityId = Guid.NewGuid()
                }
            }
        };

        var input = new WorkstationInput
        {
            Context = new GenerationContext
            {
                EntitySchema = entity,
                TargetFramework = "frontend",
                TemplateEngine = "tsmorph"
            },
            Metadata = entity
        };

        // Act
        var result = await _workstation.ExecuteAsync(input, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("frontend", result.WorkstationId);
        Assert.NotNull(result.Metadata);
        Assert.Equal("Customer", result.Metadata.Name);
        Assert.Equal(4, result.Metadata.Properties.Count);
        Assert.Single(result.Metadata.Relationships);
    }
}

