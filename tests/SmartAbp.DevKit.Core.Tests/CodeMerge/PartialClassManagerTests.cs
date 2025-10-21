using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using SmartAbp.DevKit.Core.CodeMerge;
using Xunit;

namespace SmartAbp.DevKit.Core.Tests.CodeMerge;

/// <summary>
/// PartialClassManager单元测试
/// </summary>
public class PartialClassManagerTests
{
    private readonly PartialClassManager _manager;
    private readonly ILogger<PartialClassManager> _logger;

    public PartialClassManagerTests()
    {
        _logger = NullLoggerFactory.Instance.CreateLogger<PartialClassManager>();
        _manager = new PartialClassManager(_logger);
    }

    [Fact]
    public void GeneratePartialFiles_ShouldCreateTwoFiles()
    {
        // Arrange
        var className = "BlogPost";
        var generatedCode = @"
namespace SmartAbp.Domain.Entities;

public partial class BlogPost : FullAuditedAggregateRoot<Guid>
{
    public string Title { get; set; }
    public string Content { get; set; }
}
";
        var baseOutputPath = Path.Combine(Path.GetTempPath(), "DevKitTests", Guid.NewGuid().ToString());
        Directory.CreateDirectory(baseOutputPath);

        try
        {
            // Act
            var files = _manager.GeneratePartialFiles(className, generatedCode, baseOutputPath);

            // Assert
            Assert.Equal(2, files.Count);
            Assert.Contains(files.Keys, k => k.Contains(".Generated.cs"));
            Assert.Contains(files.Keys, k => k.EndsWith($"{className}.cs"));

            // 验证自动生成文件包含警告头部
            var generatedFile = files.Keys.First(k => k.Contains(".Generated.cs"));
            Assert.Contains("⚙️ 此文件由DevKit自动生成，请勿手动修改！", files[generatedFile]);

            // 验证用户自定义文件包含模板
            var userFile = files.Keys.First(k => k.EndsWith($"{className}.cs"));
            Assert.Contains("✍️ 此文件用于编写用户自定义代码", files[userFile]);
            Assert.Contains($"public partial class {className}", files[userFile]);
        }
        finally
        {
            // Cleanup
            if (Directory.Exists(baseOutputPath))
            {
                Directory.Delete(baseOutputPath, true);
            }
        }
    }

    [Fact]
    public void IsGeneratedFile_ShouldDetectCorrectly()
    {
        // Arrange
        var generatedFile = "BlogPost.Generated.cs";
        var userFile = "BlogPost.cs";

        // Act & Assert
        Assert.True(_manager.IsGeneratedFile(generatedFile));
        Assert.False(_manager.IsGeneratedFile(userFile));
    }

    [Fact]
    public void IsUserFile_ShouldDetectCorrectly()
    {
        // Arrange
        var generatedFile = "BlogPost.Generated.cs";
        var userFile = "BlogPost.cs";

        // Act & Assert
        Assert.False(_manager.IsUserFile(generatedFile));
        Assert.True(_manager.IsUserFile(userFile));
    }

    [Fact]
    public void ValidatePartialClassSetup_ShouldReturnCorrectResult()
    {
        // Arrange
        var className = "BlogPost";
        var generatedCode = @"
namespace SmartAbp.Domain.Entities;

public partial class BlogPost
{
    public string Title { get; set; }
}
";
        var baseOutputPath = Path.Combine(Path.GetTempPath(), "DevKitTests", Guid.NewGuid().ToString());
        Directory.CreateDirectory(baseOutputPath);

        try
        {
            // 创建Partial文件对
            var files = _manager.GeneratePartialFiles(className, generatedCode, baseOutputPath);
            foreach (var (path, code) in files)
            {
                File.WriteAllText(path, code);
            }

            // Act
            var result = _manager.ValidatePartialClassSetup(baseOutputPath, className);

            // Assert
            Assert.True(result.GeneratedFileExists);
            Assert.True(result.UserFileExists);
            Assert.True(result.IsValid);
        }
        finally
        {
            // Cleanup
            if (Directory.Exists(baseOutputPath))
            {
                Directory.Delete(baseOutputPath, true);
            }
        }
    }

    [Fact]
    public async Task MigrateToPartialClassAsync_ShouldMigrateExistingFiles()
    {
        // Arrange
        var sourceDirectory = Path.Combine(Path.GetTempPath(), "DevKitTests", Guid.NewGuid().ToString());
        Directory.CreateDirectory(sourceDirectory);

        var existingFile = Path.Combine(sourceDirectory, "BlogPost.cs");
        var existingCode = @"
namespace SmartAbp.Domain.Entities;

public class BlogPost : FullAuditedAggregateRoot<Guid>
{
    public string Title { get; set; }
    public string Content { get; set; }
}
";
        await File.WriteAllTextAsync(existingFile, existingCode);

        try
        {
            // Act
            var result = await _manager.MigrateToPartialClassAsync(sourceDirectory);

            // Assert
            Assert.True(result.IsFullySuccessful);
            Assert.NotEmpty(result.MigratedFiles);
            Assert.Contains(result.MigratedFiles, f => f.Contains(".Generated.cs"));
        }
        finally
        {
            // Cleanup
            if (Directory.Exists(sourceDirectory))
            {
                Directory.Delete(sourceDirectory, true);
            }
        }
    }

    [Fact]
    public void SmartMerge_ShouldPreserveUserCode()
    {
        // Arrange
        var existingContent = @"
// ⚙️ 自动生成区域开始 - 请勿修改
public string Title { get; set; }
// ⚙️ 自动生成区域结束

// ✍️ 用户自定义代码 - 安全保护
public string GetSummary(int length)
{
    return Title?.Substring(0, Math.Min(length, Title.Length)) + ""..."";
}
";

        var newGeneratedContent = @"
// ⚙️ 自动生成区域开始 - 请勿修改
public string Title { get; set; }
public string Content { get; set; }
// ⚙️ 自动生成区域结束
";

        // Act
        var mergedContent = _manager.SmartMerge(existingContent, newGeneratedContent);

        // Assert
        Assert.Contains("public string Content { get; set; }", mergedContent);
        Assert.Contains("GetSummary", mergedContent);
    }
}

