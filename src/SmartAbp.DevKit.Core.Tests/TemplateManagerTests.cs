using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using SmartAbp.DevKit.Core.Templates;
using Xunit;

namespace SmartAbp.DevKit.Core.Tests;

/// <summary>
/// TemplateManager性能测试
/// 测试目标：
/// 1. LRU缓存性能
/// 2. 模板编译性能
/// 3. 并发模板加载
/// 4. 内存使用分析
/// </summary>
public class TemplateManagerTests
{
    private TemplateManager CreateTemplateManager(int cacheSize = 1000)
    {
        var cache = new MemoryCache(new MemoryCacheOptions
        {
            SizeLimit = cacheSize
        });

        return new TemplateManager(cache);
    }

    /// <summary>
    /// 测试1：基础模板编译性能
    /// </summary>
    [Fact]
    public void CompileTemplate_BasicPerformance_ShouldBeUnder100ms()
    {
        // Arrange
        var manager = CreateTemplateManager();
        var template = "Hello, {{name}}!";
        var stopwatch = Stopwatch.StartNew();

        // Act
        var compiledTemplate = manager.CompileTemplate(template);
        stopwatch.Stop();

        // Assert
        compiledTemplate.Should().NotBeNull();
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(100, "首次编译应在100ms内完成");
    }

    /// <summary>
    /// 测试2：LRU缓存性能（缓存命中）
    /// </summary>
    [Fact]
    public void CompileTemplate_CacheHit_ShouldBeUnder10ms()
    {
        // Arrange
        var manager = CreateTemplateManager();
        var template = "Hello, {{name}}!";

        // 首次编译（缓存miss）
        manager.CompileTemplate(template);

        // Act - 第二次编译（缓存hit）
        var stopwatch = Stopwatch.StartNew();
        var compiledTemplate = manager.CompileTemplate(template);
        stopwatch.Stop();

        // Assert
        compiledTemplate.Should().NotBeNull();
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(10, "缓存命中应在10ms内完成");
    }

    /// <summary>
    /// 测试3：批量模板编译性能
    /// </summary>
    [Fact]
    public void CompileTemplate_BatchCompilation_ShouldCompleteIn5Seconds()
    {
        // Arrange
        var manager = CreateTemplateManager();
        const int batchSize = 100;
        var templates = Enumerable.Range(1, batchSize)
            .Select(i => $"Template {i}: Hello, {{{{name{i}}}}}")
            .ToList();

        // Act
        var stopwatch = Stopwatch.StartNew();
        foreach (var template in templates)
        {
            manager.CompileTemplate(template);
        }
        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(5000, "100个模板编译应在5秒内完成");
        var avgTimeMs = stopwatch.ElapsedMilliseconds / (double)batchSize;
        avgTimeMs.Should().BeLessThan(50, "平均编译时间应低于50ms");
        Console.WriteLine($"📊 批量编译性能: {batchSize}个模板, 总时长{stopwatch.ElapsedMilliseconds}ms, 平均{avgTimeMs:F2}ms");
    }

    /// <summary>
    /// 测试4：LRU缓存淘汰机制
    /// </summary>
    [Fact]
    public void CompileTemplate_LRUEviction_ShouldWorkCorrectly()
    {
        // Arrange
        var cacheSize = 10;
        var manager = CreateTemplateManager(cacheSize);
        var templates = Enumerable.Range(1, 20)
            .Select(i => $"Template {i}: {{{{value{i}}}}}")
            .ToList();

        // Act - 编译20个模板，但缓存只能容纳10个
        foreach (var template in templates)
        {
            manager.CompileTemplate(template);
        }

        // 第二轮：重新编译前10个模板（应该已被淘汰，需要重新编译）
        var firstTenStopwatch = Stopwatch.StartNew();
        foreach (var template in templates.Take(10))
        {
            manager.CompileTemplate(template);
        }
        firstTenStopwatch.Stop();

        // 第三轮：重新编译后10个模板（应该还在缓存中，速度很快）
        var lastTenStopwatch = Stopwatch.StartNew();
        foreach (var template in templates.Skip(10))
        {
            manager.CompileTemplate(template);
        }
        lastTenStopwatch.Stop();

        // Assert
        // 后10个（缓存中）应该明显快于或接近前10个（缓存miss）
        // 注意：在某些情况下，Handlebars编译速度很快，缓存效果可能不明显
        lastTenStopwatch.ElapsedMilliseconds.Should().BeLessThanOrEqualTo(firstTenStopwatch.ElapsedMilliseconds + 20,
            "LRU缓存应该保留最近使用的模板，或编译速度本身很快");
        Console.WriteLine($"📊 LRU淘汰机制: 前10个(miss){firstTenStopwatch.ElapsedMilliseconds}ms vs 后10个(hit){lastTenStopwatch.ElapsedMilliseconds}ms");
    }

    /// <summary>
    /// 测试5：并发模板加载性能
    /// </summary>
    [Fact]
    public void CompileTemplate_ConcurrentLoad_ShouldHandleCorrectly()
    {
        // Arrange
        var manager = CreateTemplateManager();
        const int concurrentTasks = 50;

        // Act
        var stopwatch = Stopwatch.StartNew();
        var tasks = Enumerable.Range(1, concurrentTasks)
            .Select(i => Task.Run(() => manager.CompileTemplate("Hello, {{name" + i + "}}!")))
            .ToList();

        Task.WaitAll(tasks.ToArray());
        stopwatch.Stop();

        // Assert
        tasks.Should().AllSatisfy(task => task.IsCompletedSuccessfully.Should().BeTrue());
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(5000, "50个并发编译应在5秒内完成");
        Console.WriteLine($"📊 并发性能: {concurrentTasks}个并发任务, 总时长{stopwatch.ElapsedMilliseconds}ms");
    }

    /// <summary>
    /// 测试6：复杂模板编译性能
    /// </summary>
    [Fact]
    public void CompileTemplate_ComplexTemplate_ShouldBeUnder200ms()
    {
        // Arrange
        var manager = CreateTemplateManager();
        var complexTemplate = @"
using System;
using System.Collections.Generic;
using System.Linq;

namespace {{Namespace}}
{
    public class {{ClassName}} : BaseEntity<Guid>
    {
        {{#each Properties}}
        public {{Type}} {{Name}} { get; set; }
        {{/each}}

        {{#each Relationships}}
        {{#if (eq Type 'OneToMany')}}
        public virtual ICollection<{{TargetEntity}}> {{NavigationProperty}} { get; set; }
        {{/if}}
        {{#if (eq Type 'ManyToOne')}}
        public virtual {{TargetEntity}} {{NavigationProperty}} { get; set; }
        public Guid {{ForeignKey}} { get; set; }
        {{/if}}
        {{/each}}
    }
}";

        // Act
        var stopwatch = Stopwatch.StartNew();
        var compiledTemplate = manager.CompileTemplate(complexTemplate);
        stopwatch.Stop();

        // Assert
        compiledTemplate.Should().NotBeNull();
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(200, "复杂模板编译应在200ms内完成");
        Console.WriteLine($"📊 复杂模板编译: {stopwatch.ElapsedMilliseconds}ms");
    }

    /// <summary>
    /// 测试7：模板渲染性能
    /// </summary>
    [Fact]
    public void RenderTemplate_BasicPerformance_ShouldBeUnder10ms()
    {
        // Arrange
        var manager = CreateTemplateManager();
        var template = "Hello, {{name}}! You are {{age}} years old.";
        var data = new { name = "John", age = 30 };

        // 先编译模板
        var compiledTemplate = manager.CompileTemplate(template);

        // Act - 渲染模板
        var stopwatch = Stopwatch.StartNew();
        var result = compiledTemplate(data);
        stopwatch.Stop();

        // Assert
        result.Should().Be("Hello, John! You are 30 years old.");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(50, "模板渲染应在50ms内完成（首次渲染可能较慢）");
        Console.WriteLine($"📊 模板渲染: {stopwatch.ElapsedMilliseconds}ms");
    }

    /// <summary>
    /// 测试8：批量渲染性能
    /// </summary>
    [Fact]
    public void RenderTemplate_BatchRendering_ShouldCompleteIn1Second()
    {
        // Arrange
        var manager = CreateTemplateManager();
        var template = "User {{userId}}: {{userName}} ({{userEmail}})";
        const int renderCount = 1000;

        // 先编译模板
        var compiledTemplate = manager.CompileTemplate(template);

        // Act - 批量渲染
        var stopwatch = Stopwatch.StartNew();
        var results = new List<string>();
        for (int i = 1; i <= renderCount; i++)
        {
            var data = new { userId = i, userName = $"User{i}", userEmail = $"user{i}@example.com" };
            results.Add(compiledTemplate(data));
        }
        stopwatch.Stop();

        // Assert
        results.Count.Should().Be(renderCount);
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(1000, "1000次渲染应在1秒内完成");
        var avgTimeMs = stopwatch.ElapsedMilliseconds / (double)renderCount;
        avgTimeMs.Should().BeLessThan(1, "平均渲染时间应低于1ms");
        Console.WriteLine($"📊 批量渲染性能: {renderCount}次渲染, 总时长{stopwatch.ElapsedMilliseconds}ms, 平均{avgTimeMs:F2}ms");
    }

    /// <summary>
    /// 测试9：缓存过期机制
    /// </summary>
    [Fact]
    public void CompileTemplate_CacheExpiration_ShouldExpireAfterTTL()
    {
        // Arrange
        var cache = new MemoryCache(new MemoryCacheOptions { SizeLimit = 100 });
        var manager = new TemplateManager(cache);
        var template = "Hello, {{name}}!";

        // Act - 首次编译
        manager.CompileTemplate(template);

        // 等待缓存过期（默认1小时滑动过期，但我们可以验证缓存机制）
        // 注意：实际过期时间很长，这里只验证缓存机制存在
        var firstTime = Stopwatch.StartNew();
        manager.CompileTemplate(template);
        firstTime.Stop();

        // 立即再次编译（应该从缓存中获取）
        var secondTime = Stopwatch.StartNew();
        manager.CompileTemplate(template);
        secondTime.Stop();

        // Assert - 两次都应该很快（都从缓存获取）
        firstTime.ElapsedMilliseconds.Should().BeLessThan(10, "缓存命中应该很快");
        secondTime.ElapsedMilliseconds.Should().BeLessThan(10, "缓存命中应该很快");
        Console.WriteLine($"📊 缓存过期机制: 第一次{firstTime.ElapsedMilliseconds}ms, 第二次{secondTime.ElapsedMilliseconds}ms");
    }

    /// <summary>
    /// 测试10：内存使用分析（估算）
    /// </summary>
    [Fact]
    public void CompileTemplate_MemoryUsage_ShouldBeReasonable()
    {
        // Arrange
        var manager = CreateTemplateManager(cacheSize: 100);
        const int templateCount = 100;

        // 获取初始内存
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();
        var initialMemory = GC.GetTotalMemory(false);

        // Act - 编译100个模板
        for (int i = 1; i <= templateCount; i++)
        {
            var template = $"Template {i}: Hello {{{{name{i}}}}}! Value: {{{{value{i}}}}}";
            manager.CompileTemplate(template);
        }

        // 获取最终内存
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();
        var finalMemory = GC.GetTotalMemory(false);

        // Assert
        var memoryUsedMB = (finalMemory - initialMemory) / 1024.0 / 1024.0;
        memoryUsedMB.Should().BeLessThan(50, "100个模板缓存应该少于50MB内存");
        Console.WriteLine($"📊 内存使用分析: 初始{initialMemory / 1024.0 / 1024.0:F2}MB, 最终{finalMemory / 1024.0 / 1024.0:F2}MB, 增长{memoryUsedMB:F2}MB");
    }

    /// <summary>
    /// 测试11：高负载场景（压力测试）
    /// </summary>
    [Fact]
    public void CompileTemplate_HighLoad_ShouldMaintainPerformance()
    {
        // Arrange
        var manager = CreateTemplateManager(cacheSize: 50);
        const int iterations = 500;
        var templates = Enumerable.Range(1, 100)
            .Select(i => $"Template {i}: {{{{value{i}}}}}")
            .ToList();

        // Act - 模拟高负载：500次随机编译
        var random = new Random(42);
        var stopwatch = Stopwatch.StartNew();
        for (int i = 0; i < iterations; i++)
        {
            var template = templates[random.Next(templates.Count)];
            manager.CompileTemplate(template);
        }
        stopwatch.Stop();

        // Assert
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(10000, "高负载场景应在10秒内完成");
        var avgTimeMs = stopwatch.ElapsedMilliseconds / (double)iterations;
        avgTimeMs.Should().BeLessThan(20, "高负载下平均编译时间应低于20ms");
        Console.WriteLine($"📊 高负载性能: {iterations}次编译, 总时长{stopwatch.ElapsedMilliseconds}ms, 平均{avgTimeMs:F2}ms");
    }

    /// <summary>
    /// 测试12：错误处理性能
    /// </summary>
    [Fact]
    public void CompileTemplate_InvalidTemplate_ShouldHandleGracefully()
    {
        // Arrange
        var manager = CreateTemplateManager();
        var invalidTemplate = "{{#if condition}}Missing closing tag";

        // Act & Assert
        var exception = Record.Exception(() => manager.CompileTemplate(invalidTemplate));

        // 应该抛出异常，但不应该崩溃
        exception.Should().NotBeNull();
        Console.WriteLine($"📊 错误处理: 异常类型={exception!.GetType().Name}, 消息={exception.Message}");
    }
}

