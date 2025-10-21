using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using SmartAbp.DevKit.Core.Incremental;
using Xunit;

namespace SmartAbp.DevKit.Core.Tests.Incremental;

/// <summary>
/// IncrementalHashCache单元测试
/// DevKit v2.0 Day 3-4核心组件测试（增量生成哈希缓存）
/// </summary>
public class IncrementalHashCacheTests : IDisposable
{
    private readonly ILogger<IncrementalHashCache> _logger;
    private readonly string _testProjectPath;
    private readonly IncrementalHashCache _hashCache;

    public IncrementalHashCacheTests()
    {
        _logger = NullLoggerFactory.Instance.CreateLogger<IncrementalHashCache>();
        _testProjectPath = Path.Combine(Path.GetTempPath(), $"DevKitHashTest_{Guid.NewGuid():N}");
        Directory.CreateDirectory(_testProjectPath);
        Directory.CreateDirectory(Path.Combine(_testProjectPath, ".lowcode"));

        _hashCache = new IncrementalHashCache(_logger, _testProjectPath);
    }

    public void Dispose()
    {
        if (Directory.Exists(_testProjectPath))
        {
            Directory.Delete(_testProjectPath, true);
        }
    }

    [Fact]
    public async Task LoadHashesAsync_EmptyCache_ShouldCreateEmptyDictionary()
    {
        // Act
        await _hashCache.LoadHashesAsync();

        // Assert
        var changedFiles = _hashCache.FilterChangedFiles(new Dictionary<string, string>());
        Assert.Empty(changedFiles);
    }

    [Fact]
    public async Task SaveHashesAsync_ShouldCreateHashFile()
    {
        // Arrange
        await _hashCache.LoadHashesAsync();
        _hashCache.UpdateHash("test/file1.cs", "content1");

        // Act
        await _hashCache.SaveHashesAsync();

        // Assert
        var hashFilePath = Path.Combine(_testProjectPath, ".lowcode", "hashes.json");
        Assert.True(File.Exists(hashFilePath));
    }

    [Fact]
    public async Task CalculateFileHash_SameContent_ShouldReturnSameHash()
    {
        // Arrange
        var filePath = "test/file1.cs";
        var content = "public class Test { }";

        // Act
        var hash1 = _hashCache.CalculateFileHash(filePath, content);
        var hash2 = _hashCache.CalculateFileHash(filePath, content);

        // Assert
        Assert.Equal(hash1, hash2);
    }

    [Fact]
    public async Task CalculateFileHash_DifferentContent_ShouldReturnDifferentHash()
    {
        // Arrange
        var filePath = "test/file1.cs";
        var content1 = "public class Test1 { }";
        var content2 = "public class Test2 { }";

        // Act
        var hash1 = _hashCache.CalculateFileHash(filePath, content1);
        var hash2 = _hashCache.CalculateFileHash(filePath, content2);

        // Assert
        Assert.NotEqual(hash1, hash2);
    }

    [Fact]
    public void HasFileChanged_NewFile_ShouldReturnTrue()
    {
        // Arrange
        var filePath = "test/newfile.cs";
        var content = "public class NewFile { }";

        // Act
        var hasChanged = _hashCache.HasFileChanged(filePath, content);

        // Assert
        Assert.True(hasChanged);
    }

    [Fact]
    public void HasFileChanged_UnchangedFile_ShouldReturnFalse()
    {
        // Arrange
        var filePath = "test/file1.cs";
        var content = "public class Test { }";
        _hashCache.UpdateHash(filePath, content);

        // Act
        var hasChanged = _hashCache.HasFileChanged(filePath, content);

        // Assert
        Assert.False(hasChanged);
    }

    [Fact]
    public void HasFileChanged_ModifiedFile_ShouldReturnTrue()
    {
        // Arrange
        var filePath = "test/file1.cs";
        var oldContent = "public class Test { }";
        var newContent = "public class Test { public void Method() { } }";
        _hashCache.UpdateHash(filePath, oldContent);

        // Act
        var hasChanged = _hashCache.HasFileChanged(filePath, newContent);

        // Assert
        Assert.True(hasChanged);
    }

    [Fact]
    public void UpdateHash_ShouldUpdateHashValue()
    {
        // Arrange
        var filePath = "test/file1.cs";
        var content1 = "content1";
        var content2 = "content2";

        // Act
        _hashCache.UpdateHash(filePath, content1);
        var changed1 = _hashCache.HasFileChanged(filePath, content1);

        _hashCache.UpdateHash(filePath, content2);
        var changed2 = _hashCache.HasFileChanged(filePath, content2);

        // Assert
        Assert.False(changed1); // content1未变更
        Assert.False(changed2); // content2未变更（因为已更新哈希）
    }

    [Fact]
    public void UpdateMultipleHashes_ShouldUpdateAllHashes()
    {
        // Arrange
        var files = new Dictionary<string, string>
        {
            ["test/file1.cs"] = "content1",
            ["test/file2.cs"] = "content2",
            ["test/file3.cs"] = "content3"
        };

        // Act
        _hashCache.UpdateMultipleHashes(files);

        // Assert
        foreach (var (path, content) in files)
        {
            Assert.False(_hashCache.HasFileChanged(path, content));
        }
    }

    [Fact]
    public void FilterChangedFiles_AllNew_ShouldReturnAllFiles()
    {
        // Arrange
        var allFiles = new Dictionary<string, string>
        {
            ["test/file1.cs"] = "content1",
            ["test/file2.cs"] = "content2",
            ["test/file3.cs"] = "content3"
        };

        // Act
        var changedFiles = _hashCache.FilterChangedFiles(allFiles);

        // Assert
        Assert.Equal(3, changedFiles.Count);
        Assert.Equal(allFiles, changedFiles);
    }

    [Fact]
    public void FilterChangedFiles_SomeChanged_ShouldReturnOnlyChanged()
    {
        // Arrange
        _hashCache.UpdateHash("test/file1.cs", "content1"); // 未变更
        _hashCache.UpdateHash("test/file2.cs", "content2"); // 未变更

        var allFiles = new Dictionary<string, string>
        {
            ["test/file1.cs"] = "content1",       // 未变更
            ["test/file2.cs"] = "content2_new",   // 已变更
            ["test/file3.cs"] = "content3"        // 新文件
        };

        // Act
        var changedFiles = _hashCache.FilterChangedFiles(allFiles);

        // Assert
        Assert.Equal(2, changedFiles.Count);
        Assert.Contains("test/file2.cs", changedFiles.Keys);
        Assert.Contains("test/file3.cs", changedFiles.Keys);
        Assert.DoesNotContain("test/file1.cs", changedFiles.Keys);
    }

    [Fact]
    public void FilterChangedFiles_NoneChanged_ShouldReturnEmpty()
    {
        // Arrange
        var allFiles = new Dictionary<string, string>
        {
            ["test/file1.cs"] = "content1",
            ["test/file2.cs"] = "content2"
        };
        _hashCache.UpdateMultipleHashes(allFiles);

        // Act
        var changedFiles = _hashCache.FilterChangedFiles(allFiles);

        // Assert
        Assert.Empty(changedFiles);
    }

    [Fact]
    public void CleanStaleHashes_ShouldRemoveOldHashes()
    {
        // Arrange
        _hashCache.UpdateHash("test/file1.cs", "content1");
        _hashCache.UpdateHash("test/file2.cs", "content2");
        _hashCache.UpdateHash("test/file3.cs", "content3");

        var currentFiles = new List<string>
        {
            "test/file1.cs",
            "test/file2.cs"
            // file3.cs已不存在
        };

        // Act
        _hashCache.CleanStaleHashes(currentFiles);

        // Assert
        Assert.False(_hashCache.HasFileChanged("test/file1.cs", "content1"));
        Assert.False(_hashCache.HasFileChanged("test/file2.cs", "content2"));
        Assert.True(_hashCache.HasFileChanged("test/file3.cs", "content3")); // 已被清理，视为新文件
    }

    [Fact]
    public async Task LoadAndSave_ShouldPersistHashes()
    {
        // Arrange
        var files = new Dictionary<string, string>
        {
            ["test/file1.cs"] = "content1",
            ["test/file2.cs"] = "content2"
        };

        await _hashCache.LoadHashesAsync();
        _hashCache.UpdateMultipleHashes(files);
        await _hashCache.SaveHashesAsync();

        // Act - 创建新的IncrementalHashCache实例并加载
        var newHashCache = new IncrementalHashCache(_logger, _testProjectPath);
        await newHashCache.LoadHashesAsync();

        // Assert
        foreach (var (path, content) in files)
        {
            Assert.False(newHashCache.HasFileChanged(path, content));
        }
    }

    [Fact]
    public async Task PerformanceTest_XxHash3_ShouldBeFast()
    {
        // Arrange
        var largeContent = string.Concat(Enumerable.Repeat("public class Test { }", 10000));
        var filePath = "test/largefile.cs";

        // Act
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        for (int i = 0; i < 1000; i++)
        {
            _hashCache.CalculateFileHash(filePath, largeContent);
        }
        stopwatch.Stop();

        // Assert - 1000次哈希计算应该在100ms内完成
        Assert.True(stopwatch.ElapsedMilliseconds < 100,
            $"XxHash3性能测试失败：1000次哈希计算耗时 {stopwatch.ElapsedMilliseconds}ms，期望<100ms");
    }
}

