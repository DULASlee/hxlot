# RealTimeCommunication微服务详细设计文档 v1.0

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| 微服务名称 | RealTimeCommunication.Service |
| 文档版本 | v1.0 |
| 创建日期 | 2025-10-19 |
| 技术栈 | .NET 8 + SignalR + MQTT + Redis + Dapr |

---

## 🎯 1. 系统概述

### 1.1 业务定位

实时通信微服务是SmartABP平台的统一实时通信基础设施，提供：
- 🌐 **Web实时通信**：基于SignalR的WebSocket通信
- 📡 **IoT设备通信**：基于MQTT的设备消息传输
- 📨 **实时数据推送**：服务端主动推送数据到客户端
- 👥 **在线用户管理**：用户在线状态和会话管理
- 🔔 **消息广播**：支持全局、组、个人消息推送

### 1.2 核心价值

```yaml
业务价值:
  实时性: 消息延迟<50ms
  可靠性: 消息送达率99.9%
  扩展性: 支持100,000并发连接
  统一性: Web+IoT统一通信平台

技术价值:
  高性能: Redis Backplane横向扩展
  低延迟: WebSocket全双工通信
  高可用: 多实例负载均衡
  易集成: 标准化API接口
```

---

## 🏗️ 2. 系统架构设计

### 2.1 分层架构

```
┌────────────────────────────────────────────────────────┐
│         客户端层（Web + Mobile + IoT Device）            │
├────────────────────────────────────────────────────────┤
│  Vue3+SignalR  │  移动App+SignalR  │  IoT设备+MQTT      │
└────────┬───────────────┬──────────────┬────────────────┘
         │ (WebSocket)   │ (WebSocket)  │ (MQTT)
         │               │              │
┌────────▼───────────────▼──────────────▼────────────────┐
│              API层（RealTimeCommunication.HttpApi）      │
├────────────────────────────────────────────────────────┤
│  SignalR Hub   │  MQTT Broker   │  REST API            │
│  连接管理      │  主题订阅      │  消息发送            │
└────────┬───────────────┬──────────────┬────────────────┘
         │               │              │
┌────────▼───────────────▼──────────────▼────────────────┐
│           应用服务层（RealTimeCommunication.Application） │
├────────────────────────────────────────────────────────┤
│  消息路由   │  会话管理   │  订阅管理   │  权限验证     │
└────────┬───────────────┬──────────────┬────────────────┘
         │               │              │
┌────────▼───────────────▼──────────────▼────────────────┐
│         领域层（RealTimeCommunication.Domain）           │
├────────────────────────────────────────────────────────┤
│  Connection  │  Message   │  Subscription  │  Topic    │
│  实体        │  实体      │  实体          │  实体     │
└────────┬───────────────┬──────────────┬────────────────┘
         │               │              │
┌────────▼───────────────▼──────────────▼────────────────┐
│         基础设施层（PostgreSQL + Redis + MQTT Broker）    │
└────────────────────────────────────────────────────────┘
```

### 2.2 核心组件

**SignalR Hub（Web实时通信）**:
```csharp
public class SmartAbpHub : Hub
{
    // 连接管理
    public override async Task OnConnectedAsync()
    public override async Task OnDisconnectedAsync(Exception exception)
    
    // 消息发送
    public async Task SendMessage(string user, string message)
    public async Task SendToGroup(string groupName, string message)
    public async Task BroadcastMessage(string message)
    
    // 订阅管理
    public async Task JoinGroup(string groupName)
    public async Task LeaveGroup(string groupName)
}
```

**MQTT Broker（IoT设备通信）**:
```yaml
选型: EMQ X（高性能MQTT消息服务器）
协议: MQTT 3.1.1 / MQTT 5.0
QoS级别: 0（至多一次）/ 1（至少一次）/ 2（精确一次）
主题设计:
  设备上行: smartabp/device/{deviceId}/up
  设备下行: smartabp/device/{deviceId}/down
  设备状态: smartabp/device/{deviceId}/status
```

**Redis Backplane（横向扩展）**:
```csharp
services.AddSignalR()
    .AddStackExchangeRedis(options =>
    {
        options.Configuration.ChannelPrefix = "SmartAbp.SignalR";
    });
```

---

## 💻 3. 核心功能实现

### 3.1 连接管理

**在线用户管理**:
```csharp
public class ConnectionManager : IConnectionManager, ISingletonDependency
{
    private readonly IDistributedCache _cache;
    
    public async Task AddConnectionAsync(string userId, string connectionId)
    {
        var connections = await GetUserConnectionsAsync(userId);
        connections.Add(connectionId);
        await _cache.SetAsync(
            $"user:connections:{userId}",
            connections,
            new DistributedCacheEntryOptions { SlidingExpiration = TimeSpan.FromHours(24) }
        );
    }
    
    public async Task<List<string>> GetUserConnectionsAsync(string userId)
    {
        return await _cache.GetAsync<List<string>>($"user:connections:{userId}") 
            ?? new List<string>();
    }
    
    public async Task<bool> IsUserOnlineAsync(string userId)
    {
        var connections = await GetUserConnectionsAsync(userId);
        return connections.Any();
    }
}
```

### 3.2 消息路由

**消息路由服务**:
```csharp
public class MessageRoutingService : IMessageRoutingService, ITransientDependency
{
    private readonly IHubContext<SmartAbpHub> _hubContext;
    private readonly IConnectionManager _connectionManager;
    
    // 发送给指定用户
    public async Task SendToUserAsync(string userId, object message)
    {
        var connections = await _connectionManager.GetUserConnectionsAsync(userId);
        foreach (var connectionId in connections)
        {
            await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveMessage", message);
        }
    }
    
    // 发送给指定组
    public async Task SendToGroupAsync(string groupName, object message)
    {
        await _hubContext.Clients.Group(groupName).SendAsync("ReceiveMessage", message);
    }
    
    // 全局广播
    public async Task BroadcastAsync(object message)
    {
        await _hubContext.Clients.All.SendAsync("ReceiveMessage", message);
    }
}
```

### 3.3 MQTT设备通信

**MQTT消息处理器**:
```csharp
public class MqttMessageHandler : IMqttMessageHandler, ISingletonDependency
{
    private readonly IMqttClient _mqttClient;
    private readonly IMessageRoutingService _routingService;
    
    public async Task InitializeAsync()
    {
        var options = new MqttClientOptionsBuilder()
            .WithTcpServer("emqx.smartabp.local", 1883)
            .WithClientId("SmartAbp.RealTimeCommunication")
            .WithCredentials("admin", "admin123")
            .WithCleanSession()
            .Build();
        
        await _mqttClient.ConnectAsync(options);
        
        // 订阅设备上行主题
        await _mqttClient.SubscribeAsync("smartabp/device/+/up");
        
        _mqttClient.UseApplicationMessageReceivedHandler(async e =>
        {
            var topic = e.ApplicationMessage.Topic;
            var payload = Encoding.UTF8.GetString(e.ApplicationMessage.Payload);
            
            // 解析deviceId
            var deviceId = topic.Split('/')[2];
            
            // 转发到Web客户端
            await _routingService.SendToGroupAsync($"device:{deviceId}", new
            {
                DeviceId = deviceId,
                Data = payload,
                Timestamp = DateTime.UtcNow
            });
        });
    }
    
    // 发送下行消息到设备
    public async Task SendToDeviceAsync(string deviceId, string message)
    {
        var topic = $"smartabp/device/{deviceId}/down";
        await _mqttClient.PublishAsync(topic, message, MqttQualityOfServiceLevel.AtLeastOnce);
    }
}
```

---

## 📊 4. 数据模型设计

### 4.1 领域实体

**连接实体**:
```csharp
public class Connection : AuditedAggregateRoot<Guid>
{
    public string UserId { get; set; }
    public string ConnectionId { get; set; }
    public string TransportType { get; set; } // WebSocket / LongPolling
    public string UserAgent { get; set; }
    public string IpAddress { get; set; }
    public DateTime ConnectedAt { get; set; }
    public DateTime? DisconnectedAt { get; set; }
}
```

**消息实体**:
```csharp
public class Message : AuditedAggregateRoot<Guid>
{
    public string SenderId { get; set; }
    public string ReceiverId { get; set; }
    public MessageType Type { get; set; } // User / Group / Broadcast
    public string Content { get; set; }
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
}
```

**订阅实体**:
```csharp
public class Subscription : AuditedAggregateRoot<Guid>
{
    public string UserId { get; set; }
    public string TopicName { get; set; }
    public DateTime SubscribedAt { get; set; }
}
```

---

## 🚀 5. 性能优化

### 5.1 横向扩展方案

```yaml
Redis Backplane配置:
  模式: Cluster模式
  节点数: 6个（3主3从）
  分片: 16384个哈希槽
  
SignalR实例:
  实例数: 5个
  每实例连接数: 20,000
  总连接数: 100,000
  
负载均衡:
  策略: IP Hash（保证同一用户连接到同一实例）
  健康检查: /health
```

### 5.2 性能优化策略

**1. 连接复用**:
```csharp
services.AddSignalR(options =>
{
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
    options.HandshakeTimeout = TimeSpan.FromSeconds(15);
    options.MaximumReceiveMessageSize = 32 * 1024; // 32KB
});
```

**2. 消息批量处理**:
```csharp
public async Task SendBatchMessagesAsync(List<MessageDto> messages)
{
    // 按接收者分组
    var groupedMessages = messages.GroupBy(m => m.ReceiverId);
    
    var tasks = groupedMessages.Select(async group =>
    {
        var userId = group.Key;
        await SendToUserAsync(userId, group.ToList());
    });
    
    await Task.WhenAll(tasks);
}
```

**3. 背压处理**:
```csharp
public class BackPressureHandler
{
    private readonly SemaphoreSlim _semaphore = new(100);
    
    public async Task SendWithBackPressureAsync(string userId, object message)
    {
        await _semaphore.WaitAsync();
        try
        {
            await _routingService.SendToUserAsync(userId, message);
        }
        finally
        {
            _semaphore.Release();
        }
    }
}
```

---

## 🔒 6. 安全设计

### 6.1 认证授权

```csharp
services.AddSignalR()
    .AddHubOptions<SmartAbpHub>(options =>
    {
        options.EnableDetailedErrors = false; // 生产环境关闭详细错误
    });

// JWT认证
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken) &&
                    context.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });
```

### 6.2 访问控制

```csharp
[Authorize]
public class SmartAbpHub : Hub
{
    [Authorize(Policy = "AdminOnly")]
    public async Task BroadcastMessage(string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", message);
    }
    
    public async Task SendToUser(string userId, string message)
    {
        // 验证发送者权限
        if (Context.UserIdentifier == userId || await HasPermissionAsync("SendMessage"))
        {
            await Clients.User(userId).SendAsync("ReceiveMessage", message);
        }
    }
}
```

---

## 📈 7. 监控告警

### 7.1 关键指标

```yaml
连接指标:
  - 当前连接数
  - 每秒新建连接数
  - 每秒断开连接数
  - 平均连接时长
  
消息指标:
  - 每秒消息数
  - 消息延迟（P50/P95/P99）
  - 消息丢失率
  - 消息重试率
  
性能指标:
  - CPU使用率
  - 内存使用率
  - 网络带宽
  - Redis Backplane延迟
```

### 7.2 告警规则

```yaml
告警级别1（Critical）:
  - 消息延迟 > 500ms
  - 消息丢失率 > 1%
  - Redis Backplane不可用
  
告警级别2（Warning）:
  - 消息延迟 > 100ms
  - 连接数超过阈值80%
  - CPU使用率 > 80%
```

---

## 🧪 8. 测试方案

### 8.1 功能测试

```csharp
[Fact]
public async Task Should_Send_Message_To_User()
{
    // Arrange
    var hub = GetRequiredService<IHubContext<SmartAbpHub>>();
    var userId = "user123";
    var message = "Hello, World!";
    
    // Act
    await hub.Clients.User(userId).SendAsync("ReceiveMessage", message);
    
    // Assert
    // 验证消息已发送
}

[Fact]
public async Task Should_Add_Connection_To_Group()
{
    // Arrange
    var connectionId = "connection123";
    var groupName = "TestGroup";
    
    // Act
    await hub.Groups.AddToGroupAsync(connectionId, groupName);
    
    // Assert
    // 验证连接已加入组
}
```

### 8.2 性能测试

```yaml
测试场景:
  场景1: 100,000并发连接
    - 预期: 全部连接成功，连接时间<1s
  
  场景2: 50,000消息/秒
    - 预期: 消息延迟<50ms，丢失率<0.1%
  
  场景3: 1,000设备同时上报
    - 预期: 全部消息送达，延迟<100ms
```

---

## 📅 9. 实施计划

```yaml
Week 1: 基础框架搭建
  - ABP模块创建
  - SignalR Hub实现
  - MQTT Broker集成
  
Week 2: 核心功能开发
  - 连接管理
  - 消息路由
  - 订阅管理
  
Week 3: 测试和优化
  - 单元测试
  - 集成测试
  - 性能测试
  - 优化调优
  
Week 4: 部署上线
  - Kubernetes部署
  - 监控配置
  - 文档完善
```

---

## ✅ 10. 验收标准

```yaml
功能验收:
  ✅ Web客户端实时通信正常
  ✅ IoT设备通信正常
  ✅ 消息广播功能正常
  ✅ 在线用户管理正常
  
性能验收:
  ✅ 并发连接数 ≥100,000
  ✅ 消息延迟 <50ms
  ✅ 消息丢失率 <0.1%
  ✅ 系统可用性 ≥99.9%
  
质量验收:
  ✅ 代码质量 ≥95分
  ✅ 单元测试覆盖率 ≥80%
  ✅ 文档完整性 100%
```

---

**文档状态**：✅ 已完成
**关联文档**：00-企业级微服务总体架构设计说明书.md

