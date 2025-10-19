using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using SmartAbp.DevKit.Core.Quality;
using SmartAbp.DevKit.Core.Types;
using Xunit;

namespace SmartAbp.DevKit.Core.Tests;

/// <summary>
/// QualityGateEnforcer集成测试
///
/// 测试目标：
/// - 五关质量门禁检查
/// - 断路器模式
/// - 验证结果汇总
/// </summary>
public class QualityGateEnforcerTests
{
    private readonly Mock<ILogger<QualityGateEnforcer>> _mockLogger;

    public QualityGateEnforcerTests()
    {
        _mockLogger = new Mock<ILogger<QualityGateEnforcer>>();
    }

    /// <summary>
    /// 测试：完美代码通过所有五关检查
    /// </summary>
    [Fact]
    public async Task EnforceStandardsAsync_PerfectCode_ShouldPassAllGates()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var result = CreatePerfectGenerationResult();

        // Act
        var validationResult = await enforcer.EnforceStandardsAsync(result);

        // Assert
        validationResult.Should().NotBeNull();
        validationResult.IsValid.Should().BeTrue();
        validationResult.Errors.Should().BeEmpty();
    }

    /// <summary>
    /// 测试：第一关 - 元数据一致性检查（实体名称为空）
    /// </summary>
    [Fact]
    public async Task EnforceStandardsAsync_EmptyEntityName_ShouldFail()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var result = CreateGenerationResult(metadata =>
        {
            metadata.Name = ""; // 故意留空
        });

        // Act
        var validationResult = await enforcer.EnforceStandardsAsync(result);

        // Assert
        validationResult.Should().NotBeNull();
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().ContainSingle(e => e.Code == "E001");
        validationResult.Errors.Should().ContainSingle(e => e.Message.Contains("实体名称不能为空"));
    }

    /// <summary>
    /// 测试：第一关 - 元数据一致性检查（缺少主键）
    /// </summary>
    [Fact]
    public async Task EnforceStandardsAsync_MissingPrimaryKey_ShouldFail()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var result = CreateGenerationResult(metadata =>
        {
            metadata.Properties.Clear();
            metadata.Properties.Add(new PropertySchema
            {
                Name = "Name",
                Type = "string",
                IsKey = false // 没有主键
            });
        });

        // Act
        var validationResult = await enforcer.EnforceStandardsAsync(result);

        // Assert
        validationResult.Should().NotBeNull();
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().ContainSingle(e => e.Code == "E002");
        validationResult.Errors.Should().ContainSingle(e => e.Message.Contains("实体必须有主键"));
    }

    /// <summary>
    /// 测试：第一关 - 元数据一致性检查（属性名称重复）
    /// </summary>
    [Fact]
    public async Task EnforceStandardsAsync_DuplicatePropertyNames_ShouldFail()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var result = CreateGenerationResult(metadata =>
        {
            metadata.Properties.Add(new PropertySchema
            {
                Name = "Id", // 重复属性名
                Type = "int",
                IsKey = false
            });
        });

        // Act
        var validationResult = await enforcer.EnforceStandardsAsync(result);

        // Assert
        validationResult.Should().NotBeNull();
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().ContainSingle(e => e.Code == "E003");
        validationResult.Errors.Should().ContainSingle(e => e.Message.Contains("属性名称重复"));
    }

    /// <summary>
    /// 测试：第二关 - 类型一致性检查（发现as any）
    /// </summary>
    [Fact]
    public async Task EnforceStandardsAsync_ContainsAsAny_ShouldFail()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var result = CreateGenerationResult(code: "const x = data as any; // 类型绕过");

        // Act
        var validationResult = await enforcer.EnforceStandardsAsync(result);

        // Assert
        validationResult.Should().NotBeNull();
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().ContainSingle(e => e.Code == "E010");
        validationResult.Errors.Should().ContainSingle(e => e.Message.Contains("as any"));
    }

    /// <summary>
    /// 测试：第二关 - 类型一致性检查（发现@ts-ignore）
    /// </summary>
    [Fact]
    public async Task EnforceStandardsAsync_ContainsTsIgnore_ShouldFail()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var result = CreateGenerationResult(code: "// @ts-ignore\nconst x = 123;");

        // Act
        var validationResult = await enforcer.EnforceStandardsAsync(result);

        // Assert
        validationResult.Should().NotBeNull();
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().ContainSingle(e => e.Code == "E011");
        validationResult.Errors.Should().ContainSingle(e => e.Message.Contains("@ts-ignore"));
    }

    /// <summary>
    /// 测试：第二关 - 类型一致性检查（发现any类型）
    /// </summary>
    [Fact]
    public async Task EnforceStandardsAsync_ContainsAnyType_ShouldFail()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var result = CreateGenerationResult(code: "function test(param: any) { return param; }");

        // Act
        var validationResult = await enforcer.EnforceStandardsAsync(result);

        // Assert
        validationResult.Should().NotBeNull();
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().ContainSingle(e => e.Code == "E012");
        validationResult.Errors.Should().ContainSingle(e => e.Message.Contains("any类型"));
    }

    /// <summary>
    /// 测试：第三关 - 模板输出检查（代码为空）
    /// </summary>
    [Fact]
    public async Task EnforceStandardsAsync_EmptyCode_ShouldFail()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var result = CreateGenerationResult(code: "");

        // Act
        var validationResult = await enforcer.EnforceStandardsAsync(result);

        // Assert
        validationResult.Should().NotBeNull();
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().ContainSingle(e => e.Code == "E020");
        validationResult.Errors.Should().ContainSingle(e => e.Message.Contains("生成的代码为空"));
    }

    /// <summary>
    /// 测试：第三关 - 模板输出检查（未替换的模板变量）
    /// </summary>
    [Fact]
    public async Task EnforceStandardsAsync_UnreplacedTemplateVariables_ShouldFail()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var result = CreateGenerationResult(code: "class {{EntityName}} { }");

        // Act
        var validationResult = await enforcer.EnforceStandardsAsync(result);

        // Assert
        validationResult.Should().NotBeNull();
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().ContainSingle(e => e.Code == "E021");
        validationResult.Errors.Should().ContainSingle(e => e.Message.Contains("未替换的模板变量"));
    }

    /// <summary>
    /// 测试：第四关 - 编译检查（花括号不匹配）
    /// </summary>
    [Fact]
    public async Task EnforceStandardsAsync_MismatchedBraces_ShouldFail()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var result = CreateGenerationResult(code: "class Test { function test() {  }");

        // Act
        var validationResult = await enforcer.EnforceStandardsAsync(result);

        // Assert
        validationResult.Should().NotBeNull();
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().ContainSingle(e => e.Code == "E030");
        validationResult.Errors.Should().ContainSingle(e => e.Message.Contains("花括号不匹配"));
    }

    /// <summary>
    /// 测试：第四关 - 编译检查（缺少代码结构）
    /// </summary>
    [Fact]
    public async Task EnforceStandardsAsync_NoCodeStructure_ShouldFail()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var result = CreateGenerationResult(code: "const x = 123; const y = 456;");

        // Act
        var validationResult = await enforcer.EnforceStandardsAsync(result);

        // Assert
        validationResult.Should().NotBeNull();
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().ContainSingle(e => e.Code == "E031");
        validationResult.Errors.Should().ContainSingle(e => e.Message.Contains("未发现有效的代码结构"));
    }

    /// <summary>
    /// 测试：第五关 - 架构约束检查（发现相对路径）
    /// ✅ 已优化：使用精确的正则表达式匹配import语句中的相对路径
    /// </summary>
    [Fact]
    public async Task EnforceStandardsAsync_RelativePath_ShouldFail()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        // 使用原始字符串字面量确保包含 "../" 模式
        var result = CreateGenerationResult(code: @"import { Test } from '../../../src/test'; class MyClass { }");

        // Act
        var validationResult = await enforcer.EnforceStandardsAsync(result);

        // Assert
        validationResult.Should().NotBeNull();
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().ContainSingle(e => e.Code == "E040");
        validationResult.Errors.Should().ContainSingle(e => e.Message.Contains("相对路径引用"));
    }

    /// <summary>
    /// 测试：第五关 - 架构约束检查（packages中使用@/别名）
    /// </summary>
    [Fact]
    public async Task EnforceStandardsAsync_PackagesUsingAtAlias_ShouldFail()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var result = CreateGenerationResult(code: "// packages/lowcode-core/src/test.ts\nimport { Test } from '@/api/generated'; class MyClass { }");

        // Act
        var validationResult = await enforcer.EnforceStandardsAsync(result);

        // Assert
        validationResult.Should().NotBeNull();
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().ContainSingle(e => e.Code == "E041");
        validationResult.Errors.Should().ContainSingle(e => e.Message.Contains("@/别名"));
    }

    /// <summary>
    /// 测试：ValidateAsync - 正常的WorkstationOutput
    /// </summary>
    [Fact]
    public async Task ValidateAsync_ValidOutput_ShouldPass()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var output = CreatePerfectWorkstationOutput();

        // Act
        var result = await enforcer.ValidateAsync(output);

        // Assert
        result.Should().NotBeNull();
        result.Passed.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    /// <summary>
    /// 测试：ValidateAsync - 包含错误的WorkstationOutput
    /// </summary>
    [Fact]
    public async Task ValidateAsync_InvalidOutput_ShouldFail()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var output = new WorkstationOutput
        {
            Code = "", // 空代码
            Metadata = CreatePerfectEntitySchema()
        };

        // Act
        var result = await enforcer.ValidateAsync(output);

        // Assert
        result.Should().NotBeNull();
        result.Passed.Should().BeFalse();
        result.Errors.Should().NotBeEmpty();
    }

    /// <summary>
    /// 测试：断路器 - 多次失败后打开断路器
    /// </summary>
    [Fact]
    public async Task CircuitBreaker_MultipleFailures_ShouldOpenCircuit()
    {
        // Arrange
        var mockLogger = new Mock<ILogger>();
        var circuitBreaker = new CircuitBreaker(
            failureThreshold: 3,
            resetTimeout: TimeSpan.FromSeconds(10),
            mockLogger.Object
        );

        // Act - 触发3次失败
        for (int i = 0; i < 3; i++)
        {
            try
            {
                await circuitBreaker.ExecuteAsync<int>(() => Task.FromException<int>(new InvalidOperationException("Test error")));
            }
            catch (InvalidOperationException)
            {
                // 预期的异常
            }
        }

        // Assert - 第4次尝试应该抛出CircuitBreakerOpenException
        Func<Task> act = async () => await circuitBreaker.ExecuteAsync<int>(() => Task.FromResult(42));
        await act.Should().ThrowAsync<CircuitBreakerOpenException>();
    }

    /// <summary>
    /// 测试：断路器 - 成功执行后保持关闭
    /// </summary>
    [Fact]
    public async Task CircuitBreaker_SuccessfulExecution_ShouldRemainClosed()
    {
        // Arrange
        var mockLogger = new Mock<ILogger>();
        var circuitBreaker = new CircuitBreaker(
            failureThreshold: 3,
            resetTimeout: TimeSpan.FromSeconds(10),
            mockLogger.Object
        );

        // Act
        var result = await circuitBreaker.ExecuteAsync(() => Task.FromResult(42));

        // Assert
        result.Should().Be(42);

        // 再次执行应该仍然成功
        var result2 = await circuitBreaker.ExecuteAsync(() => Task.FromResult(100));
        result2.Should().Be(100);
    }

    /// <summary>
    /// 测试：断路器 - 超时后尝试恢复（半开状态）
    /// </summary>
    [Fact]
    public async Task CircuitBreaker_AfterTimeout_ShouldAttemptRecovery()
    {
        // Arrange
        var mockLogger = new Mock<ILogger>();
        var circuitBreaker = new CircuitBreaker(
            failureThreshold: 2,
            resetTimeout: TimeSpan.FromMilliseconds(100), // 短超时用于测试
            mockLogger.Object
        );

        // Act - 触发2次失败打开断路器
        for (int i = 0; i < 2; i++)
        {
            try
            {
                await circuitBreaker.ExecuteAsync<int>(() => Task.FromException<int>(new InvalidOperationException("Test error")));
            }
            catch (InvalidOperationException)
            {
                // 预期的异常
            }
        }

        // 断路器应该已打开
        Func<Task> actOpen = async () => await circuitBreaker.ExecuteAsync<int>(() => Task.FromResult(42));
        await actOpen.Should().ThrowAsync<CircuitBreakerOpenException>();

        // 等待超时
        await Task.Delay(150);

        // 再次尝试（应该进入半开状态并尝试执行）
        var result = await circuitBreaker.ExecuteAsync(() => Task.FromResult(42));
        result.Should().Be(42);
    }

    /// <summary>
    /// 测试：完整集成测试 - 多个错误同时存在
    /// </summary>
    [Fact]
    public async Task EnforceStandardsAsync_MultipleErrors_ShouldAggregateAll()
    {
        // Arrange
        var enforcer = new QualityGateEnforcer(_mockLogger.Object);
        var result = CreateGenerationResult(
            metadata =>
            {
                metadata.Name = ""; // 第一关错误：实体名称为空
                metadata.Properties.Clear(); // 第一关错误：缺少主键
            },
            code: "const x = data as any; {{Template}} { // 第二关错误：as any，第三关错误：未替换模板，第四关错误：花括号不匹配"
        );

        // Act
        var validationResult = await enforcer.EnforceStandardsAsync(result);

        // Assert
        validationResult.Should().NotBeNull();
        validationResult.IsValid.Should().BeFalse();
        validationResult.Errors.Should().HaveCountGreaterThan(1); // 应该有多个错误
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 辅助方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private GenerationResult CreatePerfectGenerationResult()
    {
        return new GenerationResult
        {
            Success = true,
            Code = "class TestEntity { constructor() { this.id = 0; } }",
            Metadata = CreatePerfectEntitySchema()
        };
    }

    private WorkstationOutput CreatePerfectWorkstationOutput()
    {
        return new WorkstationOutput
        {
            Code = "class TestEntity { constructor() { this.id = 0; } }",
            Metadata = CreatePerfectEntitySchema()
        };
    }

    private EntitySchema CreatePerfectEntitySchema()
    {
        return new EntitySchema
        {
            Name = "TestEntity",
            DisplayName = "测试实体",
            Properties = new List<PropertySchema>
            {
                new()
                {
                    Name = "Id",
                    Type = "Guid",
                    IsKey = true,
                    IsRequired = true
                },
                new()
                {
                    Name = "Name",
                    Type = "string",
                    IsRequired = true
                }
            }
        };
    }

    private GenerationResult CreateGenerationResult(
        Action<EntitySchema>? metadataModifier = null,
        string? code = null)
    {
        var metadata = CreatePerfectEntitySchema();
        metadataModifier?.Invoke(metadata);

        return new GenerationResult
        {
            Success = true,
            Code = code ?? "class TestEntity { constructor() { this.id = 0; } }",
            Metadata = metadata
        };
    }
}

