using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using SmartAbp.DevKit.Core.Quality;
using Xunit;

namespace SmartAbp.DevKit.Core.Tests.Quality;

/// <summary>
/// QualityGateExecutor单元测试
/// DevKit v2.0 Day 16核心组件测试（五关质量门禁）
/// </summary>
public class QualityGateExecutorTests : IDisposable
{
    private readonly ILogger<QualityGateExecutor> _logger;
    private readonly string _testProjectPath;

    public QualityGateExecutorTests()
    {
        _logger = NullLoggerFactory.Instance.CreateLogger<QualityGateExecutor>();
        _testProjectPath = Path.Combine(Path.GetTempPath(), $"DevKitQualityTest_{Guid.NewGuid():N}");
        SetupTestProject();
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
        Directory.CreateDirectory(Path.Combine(_testProjectPath, "src"));
        Directory.CreateDirectory(Path.Combine(_testProjectPath, "src/SmartAbp.Vue"));
        Directory.CreateDirectory(Path.Combine(_testProjectPath, "src/SmartAbp.Vue/packages"));
    }

    [Fact]
    public async Task ExecuteAllGatesAsync_EmptyProject_ShouldPass()
    {
        // Arrange
        var executor = new QualityGateExecutor(_logger, _testProjectPath);

        // Act
        var result = await executor.ExecuteAllGatesAsync();

        // Assert
        Assert.NotNull(result);
        // 空项目应该通过大部分检查（可能会失败在编译检查）
        Assert.True(result.Gate1_ArchitectureIntegrity.Passed);
        Assert.True(result.Gate2_CodeDuplication.Passed);
    }

    [Fact]
    public async Task ExecuteGate1_ArchitectureIntegrity_NoViolations_ShouldPass()
    {
        // Arrange
        var executor = new QualityGateExecutor(_logger, _testProjectPath);
        CreateCleanPackageFile();

        // Act
        var result = await executor.ExecuteAllGatesAsync();

        // Assert
        Assert.True(result.Gate1_ArchitectureIntegrity.Passed);
        Assert.Empty(result.Gate1_ArchitectureIntegrity.Errors);
    }

    [Fact]
    public async Task ExecuteGate1_ArchitectureIntegrity_WithRelativePathViolation_ShouldFail()
    {
        // Arrange
        var executor = new QualityGateExecutor(_logger, _testProjectPath);
        CreateViolatingPackageFile_RelativePath();

        // Act
        var result = await executor.ExecuteAllGatesAsync();

        // Assert
        Assert.False(result.Gate1_ArchitectureIntegrity.Passed);
        Assert.Contains(result.Gate1_ArchitectureIntegrity.Errors,
            e => e.Contains("相对路径违规"));
    }

    [Fact]
    public async Task ExecuteGate1_ArchitectureIntegrity_WithAtAliasViolation_ShouldFail()
    {
        // Arrange
        var executor = new QualityGateExecutor(_logger, _testProjectPath);
        CreateViolatingPackageFile_AtAlias();

        // Act
        var result = await executor.ExecuteAllGatesAsync();

        // Assert
        Assert.False(result.Gate1_ArchitectureIntegrity.Passed);
        Assert.Contains(result.Gate1_ArchitectureIntegrity.Errors,
            e => e.Contains("@别名违规"));
    }

    [Fact]
    public async Task ExecuteGate2_CodeDuplication_NoDuplicates_ShouldPass()
    {
        // Arrange
        var executor = new QualityGateExecutor(_logger, _testProjectPath);
        CreateUniqueVueFiles();

        // Act
        var result = await executor.ExecuteAllGatesAsync();

        // Assert
        Assert.True(result.Gate2_CodeDuplication.Passed);
        Assert.Empty(result.Gate2_CodeDuplication.Errors);
    }

    [Fact]
    public async Task ExecuteGate2_CodeDuplication_WithDuplicates_ShouldFail()
    {
        // Arrange
        var executor = new QualityGateExecutor(_logger, _testProjectPath);
        CreateDuplicateVueFiles();

        // Act
        var result = await executor.ExecuteAllGatesAsync();

        // Assert
        Assert.False(result.Gate2_CodeDuplication.Passed);
        Assert.Contains(result.Gate2_CodeDuplication.Errors,
            e => e.Contains("重复文件名"));
    }

    [Fact]
    public async Task ExecuteGate5_TechnicalDebt_LowDebt_ShouldPass()
    {
        // Arrange
        var executor = new QualityGateExecutor(_logger, _testProjectPath);
        CreateLowDebtFiles();

        // Act
        var result = await executor.ExecuteAllGatesAsync();

        // Assert
        Assert.True(result.Gate5_TechnicalDebt.Passed);
        Assert.Contains("技术债务评分", result.Gate5_TechnicalDebt.Message);
    }

    [Fact]
    public async Task ExecuteGate5_TechnicalDebt_HighDebt_ShouldWarn()
    {
        // Arrange
        var executor = new QualityGateExecutor(_logger, _testProjectPath);
        CreateHighDebtFiles();

        // Act
        var result = await executor.ExecuteAllGatesAsync();

        // Assert
        // 技术债务不阻断，但会有警告
        Assert.NotEmpty(result.Gate5_TechnicalDebt.Errors);
    }

    [Fact]
    public async Task ExecuteAllGatesAsync_MeasurePerformance_ShouldBeUnder30Seconds()
    {
        // Arrange
        var executor = new QualityGateExecutor(_logger, _testProjectPath);
        CreateCompleteTestProject();

        // Act
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var result = await executor.ExecuteAllGatesAsync();
        stopwatch.Stop();

        // Assert
        Assert.True(stopwatch.ElapsedMilliseconds < 30000,
            $"质量门禁执行时间 {stopwatch.ElapsedMilliseconds}ms 超过30秒阈值");
        Assert.True(result.TotalElapsedMilliseconds < 30000);
    }

    #region Helper Methods

    private void CreateCleanPackageFile()
    {
        var packagesPath = Path.Combine(_testProjectPath, "src/SmartAbp.Vue/packages/lowcode-core");
        Directory.CreateDirectory(packagesPath);

        var testFile = Path.Combine(packagesPath, "test.ts");
        File.WriteAllText(testFile, @"
import { SomeType } from '@smartabp/lowcode-shared';

export function test() {
    return new SomeType();
}
");
    }

    private void CreateViolatingPackageFile_RelativePath()
    {
        var packagesPath = Path.Combine(_testProjectPath, "src/SmartAbp.Vue/packages/lowcode-core");
        Directory.CreateDirectory(packagesPath);

        var testFile = Path.Combine(packagesPath, "test.ts");
        File.WriteAllText(testFile, @"
import { SomeType } from '../lowcode-shared'; // 相对路径违规

export function test() {
    return new SomeType();
}
");
    }

    private void CreateViolatingPackageFile_AtAlias()
    {
        var packagesPath = Path.Combine(_testProjectPath, "src/SmartAbp.Vue/packages/lowcode-core");
        Directory.CreateDirectory(packagesPath);

        var testFile = Path.Combine(packagesPath, "test.ts");
        File.WriteAllText(testFile, @"
import { SomeType } from '@/api/generated'; // @别名违规

export function test() {
    return new SomeType();
}
");
    }

    private void CreateUniqueVueFiles()
    {
        var srcPath = Path.Combine(_testProjectPath, "src/views");
        Directory.CreateDirectory(srcPath);

        File.WriteAllText(Path.Combine(srcPath, "Home.vue"), "<template><div>Home</div></template>");
        File.WriteAllText(Path.Combine(srcPath, "About.vue"), "<template><div>About</div></template>");
        File.WriteAllText(Path.Combine(srcPath, "Contact.vue"), "<template><div>Contact</div></template>");
    }

    private void CreateDuplicateVueFiles()
    {
        var srcPath1 = Path.Combine(_testProjectPath, "src/views/module1");
        var srcPath2 = Path.Combine(_testProjectPath, "src/views/module2");
        Directory.CreateDirectory(srcPath1);
        Directory.CreateDirectory(srcPath2);

        // 创建重复的文件名
        File.WriteAllText(Path.Combine(srcPath1, "Index.vue"), "<template><div>Module1 Index</div></template>");
        File.WriteAllText(Path.Combine(srcPath2, "Index.vue"), "<template><div>Module2 Index</div></template>");
    }

    private void CreateLowDebtFiles()
    {
        var srcPath = Path.Combine(_testProjectPath, "src");
        Directory.CreateDirectory(srcPath);

        // 创建一些小文件
        for (int i = 0; i < 5; i++)
        {
            var filePath = Path.Combine(srcPath, $"Small{i}.ts");
            File.WriteAllText(filePath, "export function test() { return true; }");
        }

        // 添加少量TODO
        var fileWithTodo = Path.Combine(srcPath, "WithTodo.ts");
        File.WriteAllText(fileWithTodo, @"
export function test() {
    // TODO: implement this
    return true;
}
");
    }

    private void CreateHighDebtFiles()
    {
        var srcPath = Path.Combine(_testProjectPath, "src");
        Directory.CreateDirectory(srcPath);

        // 创建多个大文件
        for (int i = 0; i < 15; i++)
        {
            var filePath = Path.Combine(srcPath, $"Large{i}.ts");
            var lines = new string[250]; // 超过200行的大文件
            for (int j = 0; j < 250; j++)
            {
                lines[j] = $"export const var{j} = {j};";
            }
            File.WriteAllLines(filePath, lines);
        }

        // 添加大量TODO
        for (int i = 0; i < 60; i++)
        {
            var filePath = Path.Combine(srcPath, $"Todo{i}.ts");
            File.WriteAllText(filePath, $@"
// TODO: implement feature {i}
// FIXME: fix bug {i}
export function test{i}() {{
    return true;
}}
");
        }
    }

    private void CreateCompleteTestProject()
    {
        CreateCleanPackageFile();
        CreateUniqueVueFiles();
        CreateLowDebtFiles();
    }

    #endregion
}

