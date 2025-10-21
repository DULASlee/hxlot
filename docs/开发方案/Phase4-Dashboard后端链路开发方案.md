# Phase 4: Dashboard后端链路开发方案

**项目**: SmartAbp低代码引擎平台扩展
**阶段**: Phase 4 - 数字大屏后端完整链路开发
**工期**: 1周（5个工作日）
**负责人**: 后端架构师 + 2名后端开发
**依赖**: Phase 2（Dashboard前端生成器）已完成
**文档版本**: v1.0
**更新日期**: 2025-10-21

---

## 📋 一、项目背景和目标

### 1.1 业务场景

**数字大屏后端需求**：
- MES大屏：PLC数据实时采集、产线数据聚合、设备状态监控
- 智慧工地大屏：视频流处理、塔吊数据采集、扬尘监测数据聚合

### 1.2 技术挑战

**数字大屏后端 vs 传统CRUD后端差异**：

| 维度 | 传统CRUD | 数字大屏后端 | 差异程度 |
|------|---------|-------------|---------|
| **数据流** | HTTP请求/响应 | SignalR实时推送 | ⭐⭐⭐⭐⭐ 极高 |
| **业务逻辑** | 增删改查 | 数据聚合+实时计算 | ⭐⭐⭐⭐⭐ 极高 |
| **性能要求** | 响应时间<500ms | 推送延迟<100ms | ⭐⭐⭐⭐ 高 |
| **并发** | 100-1000用户 | 100-10000连接 | ⭐⭐⭐⭐ 高 |
| **数据源** | 数据库 | 数据库+PLC+传感器+视频流 | ⭐⭐⭐⭐⭐ 极高 |

### 1.3 Phase 4目标

**核心目标**：
1. ✅ 实现SignalR Hub（实时数据推送）
2. ✅ 实现数据聚合服务（实时计算KPI）
3. ✅ 实现数据采集服务（PLC、传感器、视频流）
4. ✅ 实现后台任务（定时数据聚合）
5. ✅ 100%复用现有后端生成器（Domain/Service/Controller/DTO）

**成功标准**：
- SignalR实时推送延迟<100ms
- 支持10000+并发连接
- 数据聚合性能优化
- 后端代码质量≥95分

---

## 🏗️ 二、技术架构设计

### 2.1 整体架构

```
┌──────────────────────────────────────────────────────┐
│         Presentation Layer（呈现层）                   │
│  ┌────────────────────────────────────────────────┐  │
│  │  SignalR Hub（实时推送）                         │  │
│  │  - ProductionLineHub                           │  │
│  │  - EquipmentStatusHub                          │  │
│  │  - TowerCraneHub                               │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         ↓ 调用
┌──────────────────────────────────────────────────────┐
│         Application Layer（应用层）                    │
│  ┌────────────────────────────────────────────────┐  │
│  │  RealtimeDataAggregatorService                 │  │
│  │  - 实时数据聚合                                  │  │
│  │  - KPI计算                                      │  │
│  │  - 趋势分析                                      │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────┐  │
│  │  DataCollectionService                         │  │
│  │  - PLC数据采集                                  │  │
│  │  - 传感器数据采集                               │  │
│  │  - 视频流处理                                    │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         ↓ 调用
┌──────────────────────────────────────────────────────┐
│         Domain Layer（领域层 - 100%复用现有）           │
│  ┌────────────────────────────────────────────────┐  │
│  │  ProductionLineEntity（产线实体）                │  │
│  │  EquipmentEntity（设备实体）                     │  │
│  │  SensorDataEntity（传感器数据实体）              │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         ↓ 持久化
┌──────────────────────────────────────────────────────┐
│         Infrastructure Layer（基础设施层）             │
│  ┌────────────────────────────────────────────────┐  │
│  │  SQL Server（关系型数据库）                      │  │
│  │  Redis（缓存 + SignalR BackPlane）              │  │
│  │  TimescaleDB（时序数据库 - 可选）                │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### 2.2 SignalR Hub设计

```csharp
// SignalR Hub架构
ProductionLineHub : Hub<IProductionLineClient>
├── OnConnectedAsync()          ← 连接建立
├── OnDisconnectedAsync()       ← 连接断开
├── SubscribeProductionLine()   ← 订阅产线数据
├── UnsubscribeProductionLine() ← 取消订阅
└── GetCurrentData()            ← 获取当前数据
```

### 2.3 数据流

```
[数据源] → [数据采集服务] → [数据聚合服务] → [SignalR Hub] → [前端]
   ↓             ↓                  ↓              ↓
 PLC/传感器    定时采集           KPI计算         实时推送      Dashboard
```

---

## 💻 三、核心组件实现

### 3.1 SignalR Hub实现

```csharp
// src/SmartAbp.HttpApi.Host/Hubs/ProductionLineHub.cs
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace SmartAbp.HttpApi.Host.Hubs
{
    /// <summary>
    /// 产线实时数据推送Hub
    /// </summary>
    public class ProductionLineHub : Hub<IProductionLineClient>
    {
        private readonly ILogger<ProductionLineHub> _logger;
        private readonly RealtimeDataAggregatorService _aggregatorService;
        
        // 连接管理（用户ID → 连接ID列表）
        private static readonly ConcurrentDictionary<string, HashSet<string>> 
            UserConnections = new();
        
        // 订阅管理（产线ID → 连接ID列表）
        private static readonly ConcurrentDictionary<string, HashSet<string>> 
            ProductionLineSubscriptions = new();
        
        public ProductionLineHub(
            ILogger<ProductionLineHub> logger,
            RealtimeDataAggregatorService aggregatorService)
        {
            _logger = logger;
            _aggregatorService = aggregatorService;
        }
        
        /// <summary>
        /// 连接建立
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.Identity?.Name ?? "Anonymous";
            var connectionId = Context.ConnectionId;
            
            // 记录连接
            UserConnections.AddOrUpdate(
                userId,
                new HashSet<string> { connectionId },
                (key, set) => { set.Add(connectionId); return set; }
            );
            
            _logger.LogInformation("用户 {UserId} 连接SignalR，连接ID: {ConnectionId}",
                userId, connectionId);
            
            await base.OnConnectedAsync();
        }
        
        /// <summary>
        /// 连接断开
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.Identity?.Name ?? "Anonymous";
            var connectionId = Context.ConnectionId;
            
            // 移除连接
            if (UserConnections.TryGetValue(userId, out var connections))
            {
                connections.Remove(connectionId);
                if (connections.Count == 0)
                {
                    UserConnections.TryRemove(userId, out _);
                }
            }
            
            // 移除订阅
            foreach (var (productionLineId, subscribers) in ProductionLineSubscriptions)
            {
                subscribers.Remove(connectionId);
            }
            
            _logger.LogInformation("用户 {UserId} 断开SignalR，连接ID: {ConnectionId}",
                userId, connectionId);
            
            await base.OnDisconnectedAsync(exception);
        }
        
        /// <summary>
        /// 订阅产线数据
        /// </summary>
        public async Task SubscribeProductionLine(string productionLineId)
        {
            var connectionId = Context.ConnectionId;
            
            ProductionLineSubscriptions.AddOrUpdate(
                productionLineId,
                new HashSet<string> { connectionId },
                (key, set) => { set.Add(connectionId); return set; }
            );
            
            _logger.LogInformation("连接 {ConnectionId} 订阅产线 {ProductionLineId}",
                connectionId, productionLineId);
            
            // 立即推送当前数据
            var currentData = await _aggregatorService.GetCurrentDataAsync(productionLineId);
            await Clients.Caller.ReceiveProductionLineData(currentData);
        }
        
        /// <summary>
        /// 取消订阅产线数据
        /// </summary>
        public Task UnsubscribeProductionLine(string productionLineId)
        {
            var connectionId = Context.ConnectionId;
            
            if (ProductionLineSubscriptions.TryGetValue(productionLineId, out var subscribers))
            {
                subscribers.Remove(connectionId);
            }
            
            _logger.LogInformation("连接 {ConnectionId} 取消订阅产线 {ProductionLineId}",
                connectionId, productionLineId);
            
            return Task.CompletedTask;
        }
        
        /// <summary>
        /// 推送数据到订阅者（由后台服务调用）
        /// </summary>
        public static async Task PushDataToSubscribers(
            IHubContext<ProductionLineHub, IProductionLineClient> hubContext,
            string productionLineId,
            ProductionLineRealtimeData data)
        {
            if (ProductionLineSubscriptions.TryGetValue(productionLineId, out var subscribers))
            {
                foreach (var connectionId in subscribers)
                {
                    await hubContext.Clients.Client(connectionId)
                        .ReceiveProductionLineData(data);
                }
            }
        }
    }
    
    /// <summary>
    /// 客户端接口
    /// </summary>
    public interface IProductionLineClient
    {
        Task ReceiveProductionLineData(ProductionLineRealtimeData data);
        Task ReceiveAlert(AlertDto alert);
    }
}
```

### 3.2 数据聚合服务

```csharp
// src/SmartAbp.Application/RealtimeData/RealtimeDataAggregatorService.cs
using Microsoft.Extensions.Caching.Distributed;

namespace SmartAbp.Application.RealtimeData
{
    /// <summary>
    /// 实时数据聚合服务
    /// </summary>
    public class RealtimeDataAggregatorService : ApplicationService
    {
        private readonly IRepository<ProductionLine, Guid> _productionLineRepository;
        private readonly IRepository<EquipmentStatus, Guid> _equipmentStatusRepository;
        private readonly IRepository<SensorData, Guid> _sensorDataRepository;
        private readonly IDistributedCache _cache;
        
        public RealtimeDataAggregatorService(
            IRepository<ProductionLine, Guid> productionLineRepository,
            IRepository<EquipmentStatus, Guid> equipmentStatusRepository,
            IRepository<SensorData, Guid> sensorDataRepository,
            IDistributedCache cache)
        {
            _productionLineRepository = productionLineRepository;
            _equipmentStatusRepository = equipmentStatusRepository;
            _sensorDataRepository = sensorDataRepository;
            _cache = cache;
        }
        
        /// <summary>
        /// 获取当前数据（带缓存）
        /// </summary>
        public async Task<ProductionLineRealtimeData> GetCurrentDataAsync(string productionLineId)
        {
            // 1. 尝试从缓存获取
            var cacheKey = $"ProductionLine:Realtime:{productionLineId}";
            var cachedData = await _cache.GetStringAsync(cacheKey);
            
            if (!string.IsNullOrEmpty(cachedData))
            {
                return JsonSerializer.Deserialize<ProductionLineRealtimeData>(cachedData);
            }
            
            // 2. 从数据库聚合数据
            var data = await AggregateDataAsync(Guid.Parse(productionLineId));
            
            // 3. 写入缓存（5秒过期）
            await _cache.SetStringAsync(
                cacheKey,
                JsonSerializer.Serialize(data),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(5)
                }
            );
            
            return data;
        }
        
        /// <summary>
        /// 聚合数据
        /// </summary>
        private async Task<ProductionLineRealtimeData> AggregateDataAsync(Guid productionLineId)
        {
            // 1. 获取产线基本信息
            var productionLine = await _productionLineRepository.GetAsync(productionLineId);
            
            // 2. 获取设备状态（最近5分钟）
            var now = DateTime.UtcNow;
            var equipmentStatuses = await _equipmentStatusRepository
                .GetQueryableAsync()
                .Where(e => e.ProductionLineId == productionLineId 
                    && e.CreationTime >= now.AddMinutes(-5))
                .OrderByDescending(e => e.CreationTime)
                .Take(100)
                .ToListAsync();
            
            // 3. 获取传感器数据（最近1分钟）
            var sensorData = await _sensorDataRepository
                .GetQueryableAsync()
                .Where(s => s.ProductionLineId == productionLineId 
                    && s.CreationTime >= now.AddMinutes(-1))
                .OrderByDescending(s => s.CreationTime)
                .ToListAsync();
            
            // 4. 计算KPI
            var kpi = CalculateKPI(productionLine, equipmentStatuses, sensorData);
            
            // 5. 构建实时数据
            return new ProductionLineRealtimeData
            {
                ProductionLineId = productionLineId,
                ProductionLineName = productionLine.Name,
                Timestamp = DateTime.UtcNow,
                
                // KPI指标
                TotalProduction = kpi.TotalProduction,
                CurrentEfficiency = kpi.CurrentEfficiency,
                EquipmentUtilization = kpi.EquipmentUtilization,
                QualifiedRate = kpi.QualifiedRate,
                
                // 设备状态
                EquipmentStatuses = equipmentStatuses
                    .Select(e => new EquipmentStatusDto
                    {
                        EquipmentId = e.EquipmentId,
                        EquipmentName = e.EquipmentName,
                        Status = e.Status,
                        Temperature = e.Temperature,
                        Pressure = e.Pressure
                    })
                    .ToList(),
                
                // 传感器数据（图表用）
                SensorDataHistory = sensorData
                    .Select(s => new SensorDataPoint
                    {
                        Timestamp = s.CreationTime,
                        Value = s.Value,
                        SensorType = s.SensorType
                    })
                    .ToList()
            };
        }
        
        /// <summary>
        /// 计算KPI
        /// </summary>
        private KPIResult CalculateKPI(
            ProductionLine productionLine,
            List<EquipmentStatus> equipmentStatuses,
            List<SensorData> sensorData)
        {
            // TODO: 根据实际业务逻辑计算KPI
            return new KPIResult
            {
                TotalProduction = equipmentStatuses.Sum(e => e.ProductionCount),
                CurrentEfficiency = equipmentStatuses.Average(e => e.Efficiency),
                EquipmentUtilization = equipmentStatuses.Count(e => e.IsRunning) * 100.0 / equipmentStatuses.Count,
                QualifiedRate = 98.5
            };
        }
    }
}
```

### 3.3 后台任务（定时推送）

```csharp
// src/SmartAbp.HttpApi.Host/BackgroundServices/RealtimeDataPushService.cs
using Microsoft.AspNetCore.SignalR;

namespace SmartAbp.HttpApi.Host.BackgroundServices
{
    /// <summary>
    /// 实时数据推送后台服务
    /// </summary>
    public class RealtimeDataPushService : BackgroundService
    {
        private readonly ILogger<RealtimeDataPushService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IHubContext<ProductionLineHub, IProductionLineClient> _hubContext;
        
        public RealtimeDataPushService(
            ILogger<RealtimeDataPushService> logger,
            IServiceProvider serviceProvider,
            IHubContext<ProductionLineHub, IProductionLineClient> hubContext)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _hubContext = hubContext;
        }
        
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("实时数据推送服务已启动");
            
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var aggregatorService = scope.ServiceProvider
                        .GetRequiredService<RealtimeDataAggregatorService>();
                    
                    // 获取所有活跃的产线订阅
                    var activeProductionLines = ProductionLineHub
                        .ProductionLineSubscriptions.Keys.ToList();
                    
                    foreach (var productionLineId in activeProductionLines)
                    {
                        // 聚合数据
                        var data = await aggregatorService.GetCurrentDataAsync(productionLineId);
                        
                        // 推送给订阅者
                        await ProductionLineHub.PushDataToSubscribers(
                            _hubContext,
                            productionLineId,
                            data
                        );
                        
                        _logger.LogDebug("推送产线 {ProductionLineId} 数据完成", productionLineId);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "实时数据推送失败");
                }
                
                // 每1秒推送一次
                await Task.Delay(1000, stoppingToken);
            }
            
            _logger.LogInformation("实时数据推送服务已停止");
        }
    }
}
```

### 3.4 Startup配置

```csharp
// src/SmartAbp.HttpApi.Host/Startup.cs
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // SignalR配置
        services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = true;
            options.KeepAliveInterval = TimeSpan.FromSeconds(15);
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
        })
        .AddStackExchangeRedis(Configuration["Redis:ConnectionString"]); // BackPlane
        
        // 后台服务
        services.AddHostedService<RealtimeDataPushService>();
        
        // 实时数据聚合服务
        services.AddTransient<RealtimeDataAggregatorService>();
    }
    
    public void Configure(IApplicationBuilder app)
    {
        app.UseRouting();
        
        app.UseEndpoints(endpoints =>
        {
            // SignalR Hub路由
            endpoints.MapHub<ProductionLineHub>("/hubs/production-line");
            endpoints.MapHub<EquipmentStatusHub>("/hubs/equipment-status");
            endpoints.MapHub<TowerCraneHub>("/hubs/tower-crane");
        });
    }
}
```

---

## 📝 四、开发步骤（5天详细计划）

### Day 1：SignalR Hub开发（1天）

**任务清单**：
1. 创建ProductionLineHub.cs
2. 创建IProductionLineClient接口
3. 实现连接管理
4. 实现订阅管理
5. 单元测试

**验收标准**：
- ✅ SignalR Hub正常工作
- ✅ 连接管理正常
- ✅ 订阅管理正常

### Day 2：数据聚合服务开发（1天）

**任务清单**：
1. 创建RealtimeDataAggregatorService
2. 实现数据聚合逻辑
3. 实现KPI计算
4. 实现缓存优化
5. 单元测试

**验收标准**：
- ✅ 数据聚合正确
- ✅ KPI计算正确
- ✅ 缓存优化有效

### Day 3：后台任务开发（1天）

**任务清单**：
1. 创建RealtimeDataPushService
2. 实现定时推送逻辑
3. 实现错误处理
4. 集成测试

**验收标准**：
- ✅ 定时推送正常
- ✅ 错误处理完善

### Day 4：性能优化（1天）

**任务清单**：
1. Redis缓存优化
2. SignalR BackPlane配置
3. 数据库查询优化
4. 压力测试

**验收标准**：
- ✅ 推送延迟<100ms
- ✅ 支持10000+并发连接

### Day 5：完整测试和文档（1天）

**任务清单**：
1. 完整集成测试
2. 性能测试
3. 文档更新

**验收标准**：
- ✅ 所有测试通过
- ✅ 文档完整

---

## ✅ 五、验收标准

### 5.1 功能验收

| 验收项 | 验收标准 | 验收方式 |
|--------|---------|---------|
| SignalR Hub | 连接管理、订阅管理正常 | 集成测试 |
| 数据聚合服务 | 数据聚合正确、KPI计算正确 | 单元测试 |
| 后台任务 | 定时推送正常 | 集成测试 |

### 5.2 性能验收

| 性能指标 | 目标值 | 验收方式 |
|---------|-------|---------|
| 推送延迟 | <100ms | 性能测试 |
| 并发连接数 | ≥10000 | 压力测试 |
| 数据聚合时间 | <50ms | 性能测试 |

---

## 🧪 六、测试方案

### 6.1 单元测试

```csharp
[Fact]
public async Task RealtimeDataAggregatorService_AggregateData_Success()
{
    var service = new RealtimeDataAggregatorService(...);
    var data = await service.GetCurrentDataAsync(productionLineId);
    
    Assert.NotNull(data);
    Assert.True(data.TotalProduction > 0);
}
```

### 6.2 集成测试

**测试步骤**：
```bash
# 1. 启动后端
dotnet run --project src/SmartAbp.HttpApi.Host

# 2. 连接SignalR
# 使用SignalR客户端连接 ws://localhost:5000/hubs/production-line

# 3. 订阅数据
connection.invoke('SubscribeProductionLine', 'production-line-id')

# 4. 验证数据推送
connection.on('ReceiveProductionLineData', (data) => {
  console.log('收到数据', data)
})
```

---

## 📦 七、交付清单

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `src/SmartAbp.HttpApi.Host/Hubs/ProductionLineHub.cs` | SignalR Hub | ✅ 新增 |
| `src/SmartAbp.Application/RealtimeData/RealtimeDataAggregatorService.cs` | 数据聚合服务 | ✅ 新增 |
| `src/SmartAbp.HttpApi.Host/BackgroundServices/RealtimeDataPushService.cs` | 后台任务 | ✅ 新增 |

---

## 🎯 八、成功指标

- ✅ SignalR Hub完整实现
- ✅ 数据聚合服务正常工作
- ✅ 推送延迟<100ms
- ✅ 支持10000+并发连接

**Phase 4 完成标志**：
- ✅ 所有代码合并到主分支
- ✅ 所有测试通过
- ✅ Dashboard实时数据推送正常

**下一步**：Phase 5 - UniApp后端链路开发

