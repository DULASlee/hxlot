# BigDataAnalytics微服务无缝集成方案 v1.0

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| 文档版本 | v1.0 |
| 创建日期 | 2025-10-19 |
| 负责人 | SmartABP架构团队 |
| 优先级 | P2（中优先级）|
| 客户端SDK | SmartAbp.BigDataAnalytics.Client |

---

## 🎯 1. 系统概述

**核心价值**：
- **业务数据自动上报**：零侵入式数据采集
- **用户行为追踪**：完整用户行为路径分析
- **性能指标收集**：实时性能监控
- **报表数据准备**：自动化报表生成
- **数据清洗管道**：数据质量保证

**技术栈**：
- **Hadoop HDFS**：分布式存储（历史数据）
- **Apache Spark**：批量计算和流式计算
- **Apache Hive**：数据仓库（SQL查询）
- **ClickHouse**：OLAP分析数据库
- **Spark MLlib**：机器学习

**应用场景**：
- 业务数据分析（销售分析、生产分析、质量分析）
- 用户行为分析（访问路径、操作热度、用户画像）
- 性能分析（接口性能、数据库性能、缓存性能）
- 预测分析（需求预测、故障预测、质量预测）

---

## 🏗️ 2. 6大核心组件

### 组件1：AnalyticsDataCollector（分析数据采集器）

```csharp
/// <summary>
/// 分析数据采集器
/// 自动采集业务数据、用户行为、性能指标
/// </summary>
public class AnalyticsDataCollector
{
    private readonly Channel<AnalyticsEvent> _eventChannel;
    private readonly AnalyticsOptions _options;
    
    /// <summary>
    /// 记录业务事件
    /// </summary>
    public async Task TrackBusinessEventAsync(BusinessEvent businessEvent)
    {
        var analyticsEvent = new AnalyticsEvent
        {
            EventId = Guid.NewGuid(),
            EventType = EventType.Business,
            Timestamp = DateTime.UtcNow,
            ServiceName = _options.ServiceName,
            Data = JsonSerializer.Serialize(businessEvent)
        };
        
        await _eventChannel.Writer.WriteAsync(analyticsEvent);
    }
    
    /// <summary>
    /// 记录用户行为
    /// </summary>
    public async Task TrackUserBehaviorAsync(UserBehavior behavior)
    {
        var analyticsEvent = new AnalyticsEvent
        {
            EventId = Guid.NewGuid(),
            EventType = EventType.UserBehavior,
            Timestamp = DateTime.UtcNow,
            UserId = behavior.UserId,
            Data = JsonSerializer.Serialize(behavior)
        };
        
        await _eventChannel.Writer.WriteAsync(analyticsEvent);
    }
    
    /// <summary>
    /// 记录性能指标
    /// </summary>
    public async Task TrackPerformanceAsync(PerformanceMetric metric)
    {
        var analyticsEvent = new AnalyticsEvent
        {
            EventId = Guid.NewGuid(),
            EventType = EventType.Performance,
            Timestamp = DateTime.UtcNow,
            Data = JsonSerializer.Serialize(metric)
        };
        
        await _eventChannel.Writer.WriteAsync(analyticsEvent);
    }
}

/// <summary>
/// 业务事件示例：订单创建
/// </summary>
public class OrderCreatedEvent : BusinessEvent
{
    public Guid OrderId { get; set; }
    public Guid CustomerId { get; set; }
    public decimal TotalAmount { get; set; }
    public int ItemCount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime CreatedTime { get; set; }
}

/// <summary>
/// 用户行为示例：页面访问
/// </summary>
public class PageViewBehavior : UserBehavior
{
    public Guid UserId { get; set; }
    public string PageUrl { get; set; } = string.Empty;
    public string PageTitle { get; set; } = string.Empty;
    public string Referrer { get; set; } = string.Empty;
    public int Duration { get; set; } // 停留时间（秒）
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// 性能指标示例：API响应时间
/// </summary>
public class ApiPerformanceMetric : PerformanceMetric
{
    public string ApiPath { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public int ResponseTime { get; set; } // 毫秒
    public int StatusCode { get; set; }
    public bool IsSuccess { get; set; }
    public DateTime Timestamp { get; set; }
}
```

### 组件2：AnalyticsBatchProcessor（分析批量处理器）

```csharp
/// <summary>
/// 分析批量处理器
/// 批量处理分析事件，上报到大数据平台
/// </summary>
public class AnalyticsBatchProcessor : BackgroundService
{
    private readonly Channel<AnalyticsEvent> _eventChannel;
    private readonly BigDataAnalyticsClient _client;
    private readonly AnalyticsOptions _options;
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var batch = new List<AnalyticsEvent>(_options.BatchSize);
        var batchTimeout = TimeSpan.FromSeconds(_options.BatchIntervalSeconds);
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                batch.Clear();
                var batchStartTime = DateTime.UtcNow;
                
                // 读取一批事件
                while (batch.Count < _options.BatchSize &&
                       DateTime.UtcNow - batchStartTime < batchTimeout)
                {
                    if (_eventChannel.Reader.TryRead(out var analyticsEvent))
                    {
                        batch.Add(analyticsEvent);
                    }
                    else
                    {
                        await Task.Delay(100, stoppingToken);
                    }
                }
                
                // 发送批次
                if (batch.Count > 0)
                {
                    await SendBatchAsync(batch, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "批量处理分析事件失败");
                await Task.Delay(1000, stoppingToken);
            }
        }
    }
    
    private async Task SendBatchAsync(
        List<AnalyticsEvent> batch,
        CancellationToken cancellationToken)
    {
        // 数据清洗
        var cleanedBatch = CleanData(batch);
        
        // 发送到大数据平台
        await _client.SendBatchAsync(cleanedBatch, cancellationToken);
        
        _logger.LogInformation($"已上报 {batch.Count} 个分析事件");
    }
    
    private List<AnalyticsEvent> CleanData(List<AnalyticsEvent> batch)
    {
        // 数据清洗逻辑
        // - 去除重复数据
        // - 去除异常数据
        // - 数据格式标准化
        // - 数据脱敏（敏感信息）
        
        return batch
            .Where(e => IsValidEvent(e))
            .Select(e => NormalizeEvent(e))
            .ToList();
    }
}
```

### 组件3：UserBehaviorInterceptor（用户行为拦截器）

```csharp
/// <summary>
/// 用户行为拦截器
/// 自动拦截用户操作，记录用户行为
/// </summary>
public class UserBehaviorInterceptor : AbpInterceptor
{
    private readonly AnalyticsDataCollector _collector;
    private readonly ICurrentUser _currentUser;
    
    public override async Task InterceptAsync(IAbpMethodInvocation invocation)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            await invocation.ProceedAsync();
        }
        finally
        {
            stopwatch.Stop();
            
            // 记录用户行为
            if (_currentUser.IsAuthenticated)
            {
                await _collector.TrackUserBehaviorAsync(new MethodCallBehavior
                {
                    UserId = _currentUser.Id!.Value,
                    MethodName = invocation.Method.Name,
                    ClassName = invocation.Method.DeclaringType?.Name ?? string.Empty,
                    Duration = (int)stopwatch.ElapsedMilliseconds,
                    Timestamp = DateTime.UtcNow
                });
            }
        }
    }
}
```

### 组件4：DataCleaningPipeline（数据清洗管道）

```csharp
/// <summary>
/// 数据清洗管道
/// 多阶段数据清洗和转换
/// </summary>
public class DataCleaningPipeline
{
    private readonly List<IDataCleaningStage> _stages;
    
    public DataCleaningPipeline()
    {
        _stages = new List<IDataCleaningStage>
        {
            new DeduplicationStage(),      // 去重
            new ValidationStage(),         // 验证
            new NormalizationStage(),      // 标准化
            new SensitiveDataMaskingStage(), // 脱敏
            new EnrichmentStage()          // 数据增强
        };
    }
    
    /// <summary>
    /// 执行数据清洗
    /// </summary>
    public async Task<List<AnalyticsEvent>> CleanAsync(List<AnalyticsEvent> events)
    {
        var result = events;
        
        foreach (var stage in _stages)
        {
            result = await stage.ProcessAsync(result);
        }
        
        return result;
    }
}

/// <summary>
/// 数据清洗阶段接口
/// </summary>
public interface IDataCleaningStage
{
    Task<List<AnalyticsEvent>> ProcessAsync(List<AnalyticsEvent> events);
}

/// <summary>
/// 示例：去重阶段
/// </summary>
public class DeduplicationStage : IDataCleaningStage
{
    public Task<List<AnalyticsEvent>> ProcessAsync(List<AnalyticsEvent> events)
    {
        // 根据EventId去重
        var deduplicated = events
            .GroupBy(e => e.EventId)
            .Select(g => g.First())
            .ToList();
        
        return Task.FromResult(deduplicated);
    }
}

/// <summary>
/// 示例：敏感数据脱敏阶段
/// </summary>
public class SensitiveDataMaskingStage : IDataCleaningStage
{
    public Task<List<AnalyticsEvent>> ProcessAsync(List<AnalyticsEvent> events)
    {
        foreach (var evt in events)
        {
            // 脱敏手机号
            evt.Data = Regex.Replace(evt.Data, @"1[3-9]\d{9}", "***********");
            
            // 脱敏邮箱
            evt.Data = Regex.Replace(evt.Data, @"[\w\.-]+@[\w\.-]+\.\w+", "***@***.***");
            
            // 脱敏身份证
            evt.Data = Regex.Replace(evt.Data, @"\d{17}[\dXx]", "******************");
        }
        
        return Task.FromResult(events);
    }
}
```

### 组件5：BigDataAnalyticsMiddleware（中间件）

```csharp
/// <summary>
/// 大数据分析中间件
/// 自动拦截HTTP请求，记录访问数据
/// </summary>
public class BigDataAnalyticsMiddleware
{
    private readonly RequestDelegate _next;
    private readonly AnalyticsDataCollector _collector;
    
    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            
            // 记录HTTP请求行为
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                await _collector.TrackUserBehaviorAsync(new HttpRequestBehavior
                {
                    UserId = Guid.Parse(userId!),
                    Path = context.Request.Path,
                    Method = context.Request.Method,
                    StatusCode = context.Response.StatusCode,
                    Duration = (int)stopwatch.ElapsedMilliseconds,
                    UserAgent = context.Request.Headers["User-Agent"].ToString(),
                    IpAddress = context.Connection.RemoteIpAddress?.ToString(),
                    Timestamp = DateTime.UtcNow
                });
            }
            
            // 记录API性能
            await _collector.TrackPerformanceAsync(new ApiPerformanceMetric
            {
                ApiPath = context.Request.Path,
                Method = context.Request.Method,
                ResponseTime = (int)stopwatch.ElapsedMilliseconds,
                StatusCode = context.Response.StatusCode,
                IsSuccess = context.Response.StatusCode < 400,
                Timestamp = DateTime.UtcNow
            });
        }
    }
}
```

### 组件6：BigDataAnalyticsClient（HTTP客户端）

```csharp
/// <summary>
/// BigDataAnalytics HTTP客户端
/// </summary>
public class BigDataAnalyticsClient
{
    private readonly HttpClient _httpClient;
    
    /// <summary>
    /// 批量发送分析事件
    /// </summary>
    public async Task SendBatchAsync(
        List<AnalyticsEvent> batch,
        CancellationToken cancellationToken = default)
    {
        await _httpClient.PostAsJsonAsync(
            "/api/big-data-analytics/events/batch",
            batch,
            cancellationToken
        );
    }
    
    /// <summary>
    /// 查询分析报表
    /// </summary>
    public async Task<AnalyticsReport> GetReportAsync(
        ReportType reportType,
        DateTime startDate,
        DateTime endDate)
    {
        var response = await _httpClient.GetAsync(
            $"/api/big-data-analytics/reports/{reportType}?start={startDate:O}&end={endDate:O}"
        );
        return await response.Content.ReadFromJsonAsync<AnalyticsReport>();
    }
    
    /// <summary>
    /// 执行自定义SQL查询（Hive）
    /// </summary>
    public async Task<List<Dictionary<string, object>>> QueryAsync(string sql)
    {
        var response = await _httpClient.PostAsJsonAsync(
            "/api/big-data-analytics/query",
            new { Sql = sql }
        );
        return await response.Content.ReadFromJsonAsync<List<Dictionary<string, object>>>();
    }
}
```

---

## 🔌 3. 3种无缝集成方式

### 方式1：零侵入式集成（推荐）

```csharp
// Program.cs
builder.Host.UseBigDataAnalytics(
    serviceUrl: "http://analytics-api:5000",
    serviceName: "SmartAbp.LowCode"
);

// ✅ 自动启用：
// - 业务数据自动上报
// - 用户行为自动追踪
// - 性能指标自动收集
// - HTTP请求自动记录
// - 数据自动清洗
```

### 方式2：ABP Module集成（企业级）

```csharp
builder.Services.AddBigDataAnalyticsClient(options =>
{
    options.ServiceUrl = "http://analytics-api:5000";
    options.ServiceName = "SmartAbp.LowCode";
    
    // 批量处理配置
    options.BatchSize = 1000;
    options.BatchIntervalSeconds = 5;
    
    // 采集配置
    options.EnableUserBehaviorTracking = true;
    options.EnablePerformanceTracking = true;
    options.EnableBusinessEventTracking = true;
    
    // 数据清洗配置
    options.EnableDataCleaning = true;
    options.EnableSensitiveDataMasking = true;
});

app.UseBigDataAnalytics();
```

### 方式3：手动上报

```csharp
// 手动上报业务事件
public class OrderAppService : ApplicationService
{
    private readonly AnalyticsDataCollector _collector;
    
    public async Task<Order> CreateOrderAsync(CreateOrderInput input)
    {
        // 创建订单
        var order = await CreateAsync(input);
        
        // 上报业务事件
        await _collector.TrackBusinessEventAsync(new OrderCreatedEvent
        {
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            TotalAmount = order.TotalAmount,
            ItemCount = order.Items.Count,
            PaymentMethod = order.PaymentMethod,
            CreatedTime = order.CreatedTime
        });
        
        return order;
    }
}
```

---

## 📊 4. 核心特性

```yaml
数据采集:
  ✅ 业务数据: 自动采集业务事件
  ✅ 用户行为: 自动追踪用户操作
  ✅ 性能指标: 自动收集性能数据
  ✅ 日志数据: 集成日志管理系统

数据处理:
  ✅ 批量处理: 高性能批量上报（>10,000 事件/秒）
  ✅ 流式处理: Apache Flink实时流处理
  ✅ 数据清洗: 多阶段数据清洗管道
  ✅ 数据脱敏: 敏感信息自动脱敏

数据存储:
  ✅ HDFS: 分布式历史数据存储
  ✅ Hive: 数据仓库（SQL查询）
  ✅ ClickHouse: OLAP分析
  ✅ Redis: 实时指标缓存

数据分析:
  ✅ 报表生成: 自动化报表生成
  ✅ SQL查询: Hive SQL查询
  ✅ OLAP分析: 多维数据分析
  ✅ 机器学习: Spark MLlib预测分析

可视化:
  ✅ 实时大屏: 实时数据大屏
  ✅ 报表展示: 多种图表展示
  ✅ 自定义看板: 可拖拽配置
  ✅ 告警通知: 异常数据告警
```

---

**文档状态**：✅ 无缝集成方案完成


