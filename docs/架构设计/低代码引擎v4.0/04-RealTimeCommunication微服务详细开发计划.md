# RealTimeCommunication微服务详细开发计划 v1.0

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| 微服务名称 | RealTimeCommunication.Service（实时通信微服务）|
| 文档版本 | v1.0 |
| 创建日期 | 2025-10-19 |
| 开发周期 | 4周（28工作日）|
| 团队规模 | 6人（2后端 + 1SignalR专家 + 1前端 + 1DevOps + 1测试）|
| 项目预算 | $72,000 |

---

## 🎯 1. 项目目标

### 1.1 核心目标

**业务价值**：
- 🌐 **Web实时通信**：基于SignalR的WebSocket通信，<50ms延迟
- 📡 **IoT设备通信**：基于MQTT的设备消息传输，QoS 1/2保证
- 📨 **实时数据推送**：服务端主动推送数据到100,000+客户端
- 👥 **在线用户管理**：实时用户在线状态追踪
- 🔔 **消息广播**：支持全局、组、个人消息推送

**技术目标**：
- ✅ **高性能**：消息吞吐量50,000 msg/sec
- ✅ **高并发**：支持100,000+并发连接
- ✅ **高可靠性**：消息送达率99.9%
- ✅ **⭐客户端SDK⭐**：SmartAbp.RealtimeCommunication.Client（6大核心组件）
- ✅ **3种集成方式**：零侵入式 + ABP Module + 手动使用

### 1.2 核心功能列表

```yaml
核心功能:
  SignalR Hub:
    ✅ 连接管理（自动连接、断线重连、心跳检测）
    ✅ 消息路由（用户消息、组消息、全局广播）
    ✅ 订阅管理（加入组、离开组、订阅主题）
  
  MQTT Broker:
    ✅ 设备接入（MQTT 3.1.1/5.0）
    ✅ 主题管理（设备上行/下行/状态）
    ✅ QoS保证（0/1/2级别）
  
  消息可靠性:
    ✅ 离线消息缓存（Redis + 7天保留）
    ✅ 消息持久化（PostgreSQL）
    ✅ 消息重发机制（ACK确认）
  
  客户端SDK:
    ✅ SignalRHubManager（SignalR Hub管理器）
    ✅ MessageBatchSender（消息批量发送器）
    ✅ ConnectionPool（连接池管理）
    ✅ MessageReliability（消息可靠性保证）
    ✅ PresenceTracker（在线状态追踪器）
    ✅ RealtimeCommClient（HTTP客户端）
  
  前端UI:
    ✅ Vue3实时通信组件
    ✅ 在线用户列表
    ✅ 消息通知组件
```

---

## ✅ 2. 验收标准

### 2.1 功能验收标准

```yaml
后端服务:
  ✅ SignalR Hub完整实现（连接管理+消息路由+订阅管理）
  ✅ MQTT Broker集成（EMQ X）
  ✅ 消息可靠性保证（离线消息缓存+持久化+ACK）
  ✅ Redis Backplane横向扩展
  ✅ 在线用户管理（实时状态追踪）
  ✅ 多租户隔离（租户级消息隔离）

⭐客户端SDK:
  ✅ SignalRHubManager组件（自动连接管理+心跳检测）
  ✅ MessageBatchSender组件（批量发送性能优化）
  ✅ ConnectionPool组件（连接池管理+多路复用）
  ✅ MessageReliability组件（离线缓存+自动重发）
  ✅ PresenceTracker组件（在线状态实时追踪）
  ✅ RealtimeCommClient组件（HTTP API封装）
  ✅ 3种集成方式全部实现（零侵入式+ABP Module+手动）
  ✅ NuGet包发布（SmartAbp.RealtimeCommunication.Client）

前端UI:
  ✅ Vue3实时通信组件
  ✅ 在线用户列表
  ✅ 实时消息通知
  ✅ 设备状态监控
```

### 2.2 性能验收标准

```yaml
性能指标:
  并发连接数: ≥100,000（单实例）
  消息吞吐量: ≥50,000 msg/sec
  消息延迟: <50ms（P99）
  消息送达率: ≥99.9%
  心跳间隔: 30秒
  断线重连: <3秒

客户端SDK性能:
  连接建立: <500ms
  消息发送: <10ms（本地队列）
  批量发送: >5,000 msg/sec
  内存占用: <50MB
```

### 2.3 质量验收标准

```yaml
代码质量:
  ✅ 单元测试覆盖率≥80%
  ✅ 集成测试覆盖核心场景
  ✅ 负载测试通过（100,000并发）
  ✅ 安全测试通过（OAuth2.0认证+HTTPS加密）
  ✅ 代码审查通过（ABP架构合规）

交付物:
  ✅ 可运行的微服务Docker镜像
  ✅ Aspire编排配置
  ✅ API文档（Swagger）
  ✅ 客户端SDK NuGet包
  ✅ 前端UI组件
  ✅ 运维文档（部署+监控+故障排查）
```

---

## 📅 3. 4周开发计划概览

```yaml
Week 1 - 基础架构搭建（Day 1-7）:
  ✅ ABP项目初始化 + SignalR集成
  ✅ PostgreSQL数据库设计
  ✅ Redis Backplane配置
  ✅ 基础连接管理

Week 2 - 核心功能实现 + ⭐客户端SDK开发⭐（Day 8-14）:
  ✅ SignalR Hub完整实现（消息路由+订阅管理）
  ✅ MQTT Broker集成（EMQ X）
  ✅ 离线消息缓存
  ⭐Day 10.5-11: 客户端SDK开发（6大核心组件）
  ✅ Week 2验收测试

Week 3 - 可靠性保证 + 在线状态管理（Day 15-21）:
  ✅ 消息持久化（PostgreSQL）
  ✅ 消息ACK确认机制
  ✅ 在线用户管理（PresenceTracker）
  ✅ 多租户隔离
  ✅ Week 3验收测试

Week 4 - 前端UI + 部署上线（Day 22-28）:
  ✅ Vue3实时通信组件
  ✅ Aspire编排配置
  ✅ 负载测试（100,000并发）
  ✅ 最终验收与交付
```

---

## 🚀 4. Week 1 详细计划：基础架构搭建

### 4.1 Day 1-2: ABP项目初始化 + SignalR集成

**负责人**: 后端工程师1 + SignalR专家

**Day 1上午: ABP项目初始化**

```bash
# 创建ABP微服务项目
abp new SmartAbp.RealTimeCommunication \
  --template microservice-service-pro \
  --ui none \
  --mobile none \
  --database-provider ef \
  --connection-string "Host=postgres;Database=SmartAbp_RealTimeCommunication;Username=postgres;Password=postgres" \
  --with-public-website false

# 目录结构
SmartAbp.RealTimeCommunication/
├── src/
│   ├── SmartAbp.RealTimeCommunication.Domain/
│   ├── SmartAbp.RealTimeCommunication.Domain.Shared/
│   ├── SmartAbp.RealTimeCommunication.Application/
│   ├── SmartAbp.RealTimeCommunication.Application.Contracts/
│   ├── SmartAbp.RealTimeCommunication.HttpApi/
│   ├── SmartAbp.RealTimeCommunication.HttpApi.Host/
│   └── SmartAbp.RealTimeCommunication.EntityFrameworkCore/
└── test/
```

**Day 1下午: SignalR集成**

```csharp
// RealTimeCommunicationHttpApiHostModule.cs
using Microsoft.AspNetCore.SignalR;

[DependsOn(
    typeof(AbpAspNetCoreSignalRModule),
    typeof(AbpBackgroundJobsModule)
)]
public class RealTimeCommunicationHttpApiHostModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();
        
        // SignalR配置
        context.Services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = true;
            options.KeepAliveInterval = TimeSpan.FromSeconds(30);
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(60);
            options.HandshakeTimeout = TimeSpan.FromSeconds(15);
            options.MaximumReceiveMessageSize = 1024 * 100; // 100KB
        })
        .AddStackExchangeRedis(configuration["Redis:Configuration"], options =>
        {
            options.Configuration.ChannelPrefix = "SmartAbp.RealTimeCommunication";
        });
        
        // WebSocket配置
        context.Services.AddWebSockets(options =>
        {
            options.KeepAliveInterval = TimeSpan.FromSeconds(30);
            options.ReceiveBufferSize = 4 * 1024;
        });
    }
    
    public override void OnApplicationInitialization(ApplicationInitializationContext context)
    {
        var app = context.GetApplicationBuilder();
        
        app.UseWebSockets();
        
        app.UseRouting();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapHub<SmartAbpHub>("/hubs/smartabp");
        });
    }
}
```

**Day 2上午: SignalR Hub基础实现**

```csharp
// SmartAbpHub.cs
namespace SmartAbp.RealTimeCommunication.Hubs
{
    public class SmartAbpHub : AbpHub
    {
        private readonly IConnectionManager _connectionManager;
        private readonly ILogger<SmartAbpHub> _logger;
        
        public SmartAbpHub(
            IConnectionManager connectionManager,
            ILogger<SmartAbpHub> logger)
        {
            _connectionManager = connectionManager;
            _logger = logger;
        }
        
        /// <summary>
        /// 客户端连接
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier; // ABP自动提供UserId
            var connectionId = Context.ConnectionId;
            
            if (!string.IsNullOrEmpty(userId))
            {
                // 将连接添加到连接管理器
                await _connectionManager.AddConnectionAsync(userId, connectionId);
                
                // 加入用户个人组（用于点对点消息）
                await Groups.AddToGroupAsync(connectionId, $"user:{userId}");
                
                // 通知其他用户该用户上线
                await Clients.Others.SendAsync("UserConnected", new
                {
                    UserId = userId,
                    ConnectionId = connectionId,
                    ConnectedAt = DateTime.UtcNow
                });
                
                _logger.LogInformation($"用户已连接: UserId={userId}, ConnectionId={connectionId}");
            }
            
            await base.OnConnectedAsync();
        }
        
        /// <summary>
        /// 客户端断开连接
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            var connectionId = Context.ConnectionId;
            
            if (!string.IsNullOrEmpty(userId))
            {
                // 从连接管理器移除连接
                await _connectionManager.RemoveConnectionAsync(userId, connectionId);
                
                // 离开用户个人组
                await Groups.RemoveFromGroupAsync(connectionId, $"user:{userId}");
                
                // 通知其他用户该用户下线
                await Clients.Others.SendAsync("UserDisconnected", new
                {
                    UserId = userId,
                    ConnectionId = connectionId,
                    DisconnectedAt = DateTime.UtcNow,
                    Reason = exception?.Message
                });
                
                _logger.LogInformation($"用户已断开: UserId={userId}, ConnectionId={connectionId}");
            }
            
            await base.OnDisconnectedAsync(exception);
        }
        
        /// <summary>
        /// 发送消息给指定用户
        /// </summary>
        [HubMethodName("SendToUser")]
        public async Task SendToUserAsync(string targetUserId, object message)
        {
            await Clients.Group($"user:{targetUserId}").SendAsync("ReceiveMessage", new
            {
                SenderId = Context.UserIdentifier,
                Message = message,
                Timestamp = DateTime.UtcNow
            });
        }
        
        /// <summary>
        /// 加入群组
        /// </summary>
        [HubMethodName("JoinGroup")]
        public async Task JoinGroupAsync(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            
            _logger.LogInformation($"用户加入群组: UserId={Context.UserIdentifier}, Group={groupName}");
        }
        
        /// <summary>
        /// 离开群组
        /// </summary>
        [HubMethodName("LeaveGroup")]
        public async Task LeaveGroupAsync(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            
            _logger.LogInformation($"用户离开群组: UserId={Context.UserIdentifier}, Group={groupName}");
        }
        
        /// <summary>
        /// 发送消息给群组
        /// </summary>
        [HubMethodName("SendToGroup")]
        public async Task SendToGroupAsync(string groupName, object message)
        {
            await Clients.Group(groupName).SendAsync("ReceiveMessage", new
            {
                SenderId = Context.UserIdentifier,
                GroupName = groupName,
                Message = message,
                Timestamp = DateTime.UtcNow
            });
        }
        
        /// <summary>
        /// 广播消息给所有用户
        /// </summary>
        [HubMethodName("Broadcast")]
        [Authorize(Permissions = "RealTimeCommunication.Broadcast")]
        public async Task BroadcastAsync(object message)
        {
            await Clients.All.SendAsync("ReceiveMessage", new
            {
                SenderId = Context.UserIdentifier,
                Type = "Broadcast",
                Message = message,
                Timestamp = DateTime.UtcNow
            });
        }
    }
}
```

**Day 2下午: 连接管理器实现**

```csharp
// IConnectionManager.cs
namespace SmartAbp.RealTimeCommunication.Services
{
    public interface IConnectionManager
    {
        Task AddConnectionAsync(string userId, string connectionId);
        Task RemoveConnectionAsync(string userId, string connectionId);
        Task<List<string>> GetUserConnectionsAsync(string userId);
        Task<bool> IsUserOnlineAsync(string userId);
        Task<int> GetOnlineUserCountAsync();
        Task<List<string>> GetOnlineUsersAsync();
    }
    
    // ConnectionManager.cs
    public class ConnectionManager : IConnectionManager, ISingletonDependency
    {
        private readonly IDistributedCache<List<string>> _cache;
        private readonly ILogger<ConnectionManager> _logger;
        
        public ConnectionManager(
            IDistributedCache<List<string>> cache,
            ILogger<ConnectionManager> logger)
        {
            _cache = cache;
            _logger = logger;
        }
        
        public async Task AddConnectionAsync(string userId, string connectionId)
        {
            var cacheKey = GetUserConnectionsCacheKey(userId);
            
            var connections = await _cache.GetAsync(cacheKey) ?? new List<string>();
            
            if (!connections.Contains(connectionId))
            {
                connections.Add(connectionId);
                
                await _cache.SetAsync(
                    cacheKey,
                    connections,
                    new DistributedCacheEntryOptions
                    {
                        SlidingExpiration = TimeSpan.FromHours(24)
                    }
                );
                
                _logger.LogDebug($"连接已添加: UserId={userId}, ConnectionId={connectionId}");
            }
        }
        
        public async Task RemoveConnectionAsync(string userId, string connectionId)
        {
            var cacheKey = GetUserConnectionsCacheKey(userId);
            
            var connections = await _cache.GetAsync(cacheKey);
            
            if (connections != null && connections.Contains(connectionId))
            {
                connections.Remove(connectionId);
                
                if (connections.Any())
                {
                    await _cache.SetAsync(
                        cacheKey,
                        connections,
                        new DistributedCacheEntryOptions
                        {
                            SlidingExpiration = TimeSpan.FromHours(24)
                        }
                    );
                }
                else
                {
                    // 用户所有连接都断开，清除缓存
                    await _cache.RemoveAsync(cacheKey);
                }
                
                _logger.LogDebug($"连接已移除: UserId={userId}, ConnectionId={connectionId}");
            }
        }
        
        public async Task<List<string>> GetUserConnectionsAsync(string userId)
        {
            var cacheKey = GetUserConnectionsCacheKey(userId);
            return await _cache.GetAsync(cacheKey) ?? new List<string>();
        }
        
        public async Task<bool> IsUserOnlineAsync(string userId)
        {
            var connections = await GetUserConnectionsAsync(userId);
            return connections.Any();
        }
        
        public async Task<int> GetOnlineUserCountAsync()
        {
            // TODO: 实现在线用户统计（使用Redis Set）
            return 0;
        }
        
        public async Task<List<string>> GetOnlineUsersAsync()
        {
            // TODO: 实现在线用户列表（使用Redis Set）
            return new List<string>();
        }
        
        private string GetUserConnectionsCacheKey(string userId)
        {
            return $"realtime_comm:user_connections:{userId}";
        }
    }
}
```

---

### 4.2 Day 3-4: PostgreSQL数据库设计

**负责人**: 后端工程师2

**Day 3上午: 实体模型设计**

```csharp
// Connection.cs
namespace SmartAbp.RealTimeCommunication.Domain.Entities
{
    /// <summary>
    /// 连接实体
    /// </summary>
    public class Connection : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        public Guid? TenantId { get; set; }
        
        /// <summary>
        /// 用户ID
        /// </summary>
        public Guid UserId { get; set; }
        
        /// <summary>
        /// 连接ID
        /// </summary>
        public string ConnectionId { get; set; }
        
        /// <summary>
        /// 传输类型
        /// </summary>
        public string TransportType { get; set; } // WebSocket / LongPolling
        
        /// <summary>
        /// 用户代理
        /// </summary>
        public string UserAgent { get; set; }
        
        /// <summary>
        /// IP地址
        /// </summary>
        public string IpAddress { get; set; }
        
        /// <summary>
        /// 连接时间
        /// </summary>
        public DateTime ConnectedAt { get; set; }
        
        /// <summary>
        /// 断开时间
        /// </summary>
        public DateTime? DisconnectedAt { get; set; }
        
        /// <summary>
        /// 是否在线
        /// </summary>
        public bool IsOnline { get; set; }
        
        protected Connection() { }
        
        public Connection(
            Guid id,
            Guid userId,
            string connectionId,
            string transportType,
            string userAgent,
            string ipAddress)
            : base(id)
        {
            UserId = userId;
            ConnectionId = connectionId;
            TransportType = transportType;
            UserAgent = userAgent;
            IpAddress = ipAddress;
            ConnectedAt = DateTime.UtcNow;
            IsOnline = true;
        }
        
        public void Disconnect()
        {
            DisconnectedAt = DateTime.UtcNow;
            IsOnline = false;
        }
    }
    
    // Message.cs
    /// <summary>
    /// 消息实体
    /// </summary>
    public class Message : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        public Guid? TenantId { get; set; }
        
        /// <summary>
        /// 发送者ID
        /// </summary>
        public Guid SenderId { get; set; }
        
        /// <summary>
        /// 接收者ID
        /// </summary>
        public Guid? ReceiverId { get; set; }
        
        /// <summary>
        /// 群组名称
        /// </summary>
        public string? GroupName { get; set; }
        
        /// <summary>
        /// 消息类型
        /// </summary>
        public MessageType Type { get; set; } // User / Group / Broadcast
        
        /// <summary>
        /// 消息内容
        /// </summary>
        public string Content { get; set; }
        
        /// <summary>
        /// 消息元数据（JSON）
        /// </summary>
        public string? Metadata { get; set; }
        
        /// <summary>
        /// 是否已读
        /// </summary>
        public bool IsRead { get; set; }
        
        /// <summary>
        /// 读取时间
        /// </summary>
        public DateTime? ReadAt { get; set; }
        
        /// <summary>
        /// 是否已发送
        /// </summary>
        public bool IsSent { get; set; }
        
        /// <summary>
        /// 发送时间
        /// </summary>
        public DateTime? SentAt { get; set; }
        
        protected Message() { }
        
        public Message(
            Guid id,
            Guid senderId,
            MessageType type,
            string content,
            Guid? receiverId = null,
            string? groupName = null)
            : base(id)
        {
            SenderId = senderId;
            ReceiverId = receiverId;
            GroupName = groupName;
            Type = type;
            Content = content;
            IsRead = false;
            IsSent = false;
        }
        
        public void MarkAsSent()
        {
            IsSent = true;
            SentAt = DateTime.UtcNow;
        }
        
        public void MarkAsRead()
        {
            IsRead = true;
            ReadAt = DateTime.UtcNow;
        }
    }
    
    // MessageType枚举
    public enum MessageType
    {
        User = 1,
        Group = 2,
        Broadcast = 3
    }
    
    // Subscription.cs
    /// <summary>
    /// 订阅实体
    /// </summary>
    public class Subscription : AuditedAggregateRoot<Guid>, IMultiTenant
    {
        public Guid? TenantId { get; set; }
        
        /// <summary>
        /// 用户ID
        /// </summary>
        public Guid UserId { get; set; }
        
        /// <summary>
        /// 主题/群组名称
        /// </summary>
        public string Topic { get; set; }
        
        /// <summary>
        /// 订阅时间
        /// </summary>
        public DateTime SubscribedAt { get; set; }
        
        /// <summary>
        /// 是否激活
        /// </summary>
        public bool IsActive { get; set; }
        
        protected Subscription() { }
        
        public Subscription(
            Guid id,
            Guid userId,
            string topic)
            : base(id)
        {
            UserId = userId;
            Topic = topic;
            SubscribedAt = DateTime.UtcNow;
            IsActive = true;
        }
        
        public void Deactivate()
        {
            IsActive = false;
        }
    }
}
```

**Day 3下午: EF Core配置**

```csharp
// RealTimeCommunicationDbContext.cs
namespace SmartAbp.RealTimeCommunication.EntityFrameworkCore
{
    public class RealTimeCommunicationDbContext : AbpDbContext<RealTimeCommunicationDbContext>
    {
        public DbSet<Connection> Connections { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        
        public RealTimeCommunicationDbContext(
            DbContextOptions<RealTimeCommunicationDbContext> options)
            : base(options)
        {
        }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.ConfigureRealTimeCommunication();
        }
    }
    
    // RealTimeCommunicationDbContextModelCreatingExtensions.cs
    public static class RealTimeCommunicationDbContextModelCreatingExtensions
    {
        public static void ConfigureRealTimeCommunication(this ModelBuilder builder)
        {
            Check.NotNull(builder, nameof(builder));
            
            // Connection表配置
            builder.Entity<Connection>(b =>
            {
                b.ToTable("Connections");
                
                b.ConfigureByConvention();
                b.ConfigureMultiTenant();
                b.ConfigureAudited();
                
                b.Property(x => x.ConnectionId).IsRequired().HasMaxLength(128);
                b.Property(x => x.TransportType).IsRequired().HasMaxLength(32);
                b.Property(x => x.UserAgent).HasMaxLength(512);
                b.Property(x => x.IpAddress).HasMaxLength(64);
                
                b.HasIndex(x => x.UserId);
                b.HasIndex(x => x.ConnectionId);
                b.HasIndex(x => x.IsOnline);
                b.HasIndex(x => x.ConnectedAt);
            });
            
            // Message表配置
            builder.Entity<Message>(b =>
            {
                b.ToTable("Messages");
                
                b.ConfigureByConvention();
                b.ConfigureMultiTenant();
                b.ConfigureAudited();
                
                b.Property(x => x.Content).IsRequired();
                b.Property(x => x.GroupName).HasMaxLength(128);
                b.Property(x => x.Metadata).HasColumnType("jsonb"); // PostgreSQL JSONB
                
                b.HasIndex(x => x.SenderId);
                b.HasIndex(x => x.ReceiverId);
                b.HasIndex(x => x.GroupName);
                b.HasIndex(x => x.Type);
                b.HasIndex(x => x.IsRead);
                b.HasIndex(x => x.IsSent);
                b.HasIndex(x => x.CreationTime);
            });
            
            // Subscription表配置
            builder.Entity<Subscription>(b =>
            {
                b.ToTable("Subscriptions");
                
                b.ConfigureByConvention();
                b.ConfigureMultiTenant();
                b.ConfigureAudited();
                
                b.Property(x => x.Topic).IsRequired().HasMaxLength(256);
                
                b.HasIndex(x => x.UserId);
                b.HasIndex(x => x.Topic);
                b.HasIndex(x => x.IsActive);
            });
        }
    }
}
```

**Day 4上午: 数据库迁移**

```bash
# 生成迁移
cd src/SmartAbp.RealTimeCommunication.EntityFrameworkCore
dotnet ef migrations add Initial

# 执行迁移
dotnet ef database update
```

**Day 4下午: Repository实现**

```csharp
// IConnectionRepository.cs
namespace SmartAbp.RealTimeCommunication.Domain.Repositories
{
    public interface IConnectionRepository : IRepository<Connection, Guid>
    {
        Task<List<Connection>> GetUserConnectionsAsync(Guid userId);
        Task<int> GetOnlineUserCountAsync();
        Task<Connection?> GetByConnectionIdAsync(string connectionId);
    }
    
    // ConnectionRepository.cs
    public class ConnectionRepository : EfCoreRepository<RealTimeCommunicationDbContext, Connection, Guid>, IConnectionRepository
    {
        public ConnectionRepository(IDbContextProvider<RealTimeCommunicationDbContext> dbContextProvider)
            : base(dbContextProvider)
        {
        }
        
        public async Task<List<Connection>> GetUserConnectionsAsync(Guid userId)
        {
            return await (await GetDbSetAsync())
                .Where(x => x.UserId == userId && x.IsOnline)
                .OrderByDescending(x => x.ConnectedAt)
                .ToListAsync();
        }
        
        public async Task<int> GetOnlineUserCountAsync()
        {
            return await (await GetDbSetAsync())
                .Where(x => x.IsOnline)
                .Select(x => x.UserId)
                .Distinct()
                .CountAsync();
        }
        
        public async Task<Connection?> GetByConnectionIdAsync(string connectionId)
        {
            return await (await GetDbSetAsync())
                .FirstOrDefaultAsync(x => x.ConnectionId == connectionId);
        }
    }
    
    // IMessageRepository.cs
    public interface IMessageRepository : IRepository<Message, Guid>
    {
        Task<List<Message>> GetUnreadMessagesAsync(Guid userId);
        Task<List<Message>> GetOfflineMessagesAsync(Guid userId, DateTime since);
    }
    
    // MessageRepository.cs
    public class MessageRepository : EfCoreRepository<RealTimeCommunicationDbContext, Message, Guid>, IMessageRepository
    {
        public MessageRepository(IDbContextProvider<RealTimeCommunicationDbContext> dbContextProvider)
            : base(dbContextProvider)
        {
        }
        
        public async Task<List<Message>> GetUnreadMessagesAsync(Guid userId)
        {
            return await (await GetDbSetAsync())
                .Where(x => x.ReceiverId == userId && !x.IsRead)
                .OrderBy(x => x.CreationTime)
                .ToListAsync();
        }
        
        public async Task<List<Message>> GetOfflineMessagesAsync(Guid userId, DateTime since)
        {
            return await (await GetDbSetAsync())
                .Where(x => x.ReceiverId == userId && x.CreationTime > since && !x.IsSent)
                .OrderBy(x => x.CreationTime)
                .ToListAsync();
        }
    }
}
```

---

### 4.3 Day 5-6: Redis Backplane配置

**负责人**: DevOps工程师 + 后端工程师1

**Day 5上午: Redis集群Docker Compose配置**

```yaml
# docker-compose-redis.yml
version: '3.8'
services:
  redis-master:
    image: redis:7.2-alpine
    container_name: redis-realtime-master
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass redis123
    volumes:
      - redis-master-data:/data
    networks:
      - smartabp-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis-replica1:
    image: redis:7.2-alpine
    container_name: redis-realtime-replica1
    ports:
      - "6380:6379"
    command: redis-server --slaveof redis-master 6379 --masterauth redis123 --requirepass redis123
    depends_on:
      - redis-master
    volumes:
      - redis-replica1-data:/data
    networks:
      - smartabp-network

  redis-replica2:
    image: redis:7.2-alpine
    container_name: redis-realtime-replica2
    ports:
      - "6381:6379"
    command: redis-server --slaveof redis-master 6379 --masterauth redis123 --requirepass redis123
    depends_on:
      - redis-master
    volumes:
      - redis-replica2-data:/data
    networks:
      - smartabp-network

  redis-sentinel1:
    image: redis:7.2-alpine
    container_name: redis-realtime-sentinel1
    command: redis-sentinel /usr/local/etc/redis/sentinel.conf
    volumes:
      - ./redis-sentinel.conf:/usr/local/etc/redis/sentinel.conf
    depends_on:
      - redis-master
      - redis-replica1
      - redis-replica2
    networks:
      - smartabp-network

volumes:
  redis-master-data:
  redis-replica1-data:
  redis-replica2-data:

networks:
  smartabp-network:
    external: true
```

```conf
# redis-sentinel.conf
port 26379
sentinel monitor smartabp-redis redis-master 6379 2
sentinel down-after-milliseconds smartabp-redis 5000
sentinel parallel-syncs smartabp-redis 1
sentinel failover-timeout smartabp-redis 10000
sentinel auth-pass smartabp-redis redis123
```

**Day 5下午: SignalR Redis Backplane配置**

```csharp
// appsettings.json
{
  "Redis": {
    "Configuration": "redis-master:6379,redis-replica1:6380,redis-replica2:6381,password=redis123,abortConnect=false,connectTimeout=5000,syncTimeout=5000",
    "InstanceName": "SmartAbp.RealTimeCommunication:"
  },
  "SignalR": {
    "RedisBackplane": {
      "Enabled": true,
      "ChannelPrefix": "SmartAbp.SignalR:"
    }
  }
}

// RealTimeCommunicationHttpApiHostModule.cs (更新)
public override void ConfigureServices(ServiceConfigurationContext context)
{
    var configuration = context.Services.GetConfiguration();
    
    // SignalR配置 + Redis Backplane
    var signalRBuilder = context.Services.AddSignalR(options =>
    {
        options.EnableDetailedErrors = true;
        options.KeepAliveInterval = TimeSpan.FromSeconds(30);
        options.ClientTimeoutInterval = TimeSpan.FromSeconds(60);
        options.HandshakeTimeout = TimeSpan.FromSeconds(15);
        options.MaximumReceiveMessageSize = 1024 * 100; // 100KB
    });
    
    // Redis Backplane启用（实现多实例负载均衡）
    if (configuration.GetValue<bool>("SignalR:RedisBackplane:Enabled"))
    {
        signalRBuilder.AddStackExchangeRedis(
            configuration["Redis:Configuration"],
            options =>
            {
                options.Configuration.ChannelPrefix = configuration["SignalR:RedisBackplane:ChannelPrefix"];
            }
        );
    }
    
    // Redis分布式缓存
    context.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = configuration["Redis:Configuration"];
        options.InstanceName = configuration["Redis:InstanceName"];
    });
}
```

**Day 6: Redis性能测试**

```bash
# 启动Redis集群
docker-compose -f docker-compose-redis.yml up -d

# Redis性能测试
redis-benchmark -h redis-master -p 6379 -a redis123 -t set,get -n 100000 -q

# 预期结果:
# SET: 80000+ requests per second
# GET: 100000+ requests per second
```

---

### 4.4 Day 7: Week 1验收测试

**负责人**: 测试工程师 + 全体

**验收清单**:

```yaml
后端服务:
  ✅ ABP项目初始化成功
  ✅ SignalR Hub基础实现
  ✅ 连接管理器实现
  ✅ PostgreSQL数据库设计
  ✅ EF Core迁移成功
  ✅ Redis Backplane配置

功能测试:
  ✅ SignalR连接建立成功
  ✅ 用户上线/下线事件正确触发
  ✅ 连接信息正确存储到PostgreSQL
  ✅ 连接信息正确缓存到Redis
  ✅ Redis主从复制正常工作

性能测试:
  ✅ Redis性能测试通过（>80k SET/sec）
  ✅ 单实例支持1,000并发连接
```

**Week 1里程碑**: 基础架构搭建完成，SignalR连接管理链路打通！

---

## 🚀 5. Week 2 详细计划：核心功能实现 + ⭐客户端SDK开发⭐

### 5.1 Day 8-9: SignalR消息路由完整实现

**负责人**: SignalR专家 + 后端工程师1

**Day 8上午: 消息路由服务**

```csharp
// IMessageRoutingService.cs
namespace SmartAbp.RealTimeCommunication.Services
{
    public interface IMessageRoutingService
    {
        Task SendToUserAsync(Guid userId, object message);
        Task SendToUsersAsync(List<Guid> userIds, object message);
        Task SendToGroupAsync(string groupName, object message);
        Task BroadcastAsync(object message);
        Task SendToConnectionAsync(string connectionId, object message);
    }
    
    // MessageRoutingService.cs
    public class MessageRoutingService : IMessageRoutingService, ITransientDependency
    {
        private readonly IHubContext<SmartAbpHub> _hubContext;
        private readonly IConnectionManager _connectionManager;
        private readonly IMessageRepository _messageRepository;
        private readonly IDistributedCache _cache;
        private readonly ILogger<MessageRoutingService> _logger;
        
        public MessageRoutingService(
            IHubContext<SmartAbpHub> hubContext,
            IConnectionManager connectionManager,
            IMessageRepository messageRepository,
            IDistributedCache cache,
            ILogger<MessageRoutingService> logger)
        {
            _hubContext = hubContext;
            _connectionManager = connectionManager;
            _messageRepository = messageRepository;
            _cache = cache;
            _logger = logger;
        }
        
        /// <summary>
        /// 发送消息给指定用户
        /// </summary>
        public async Task SendToUserAsync(Guid userId, object message)
        {
            // 检查用户是否在线
            var isOnline = await _connectionManager.IsUserOnlineAsync(userId.ToString());
            
            if (isOnline)
            {
                // 发送到用户的所有连接
                await _hubContext.Clients.Group($"user:{userId}").SendAsync("ReceiveMessage", message);
                
                _logger.LogInformation($"消息已发送给在线用户: UserId={userId}");
            }
            else
            {
                // 用户离线，保存到离线消息缓存
                await SaveOfflineMessageAsync(userId, message);
                
                _logger.LogInformation($"消息已保存为离线消息: UserId={userId}");
            }
        }
        
        /// <summary>
        /// 批量发送消息给多个用户
        /// </summary>
        public async Task SendToUsersAsync(List<Guid> userIds, object message)
        {
            var tasks = userIds.Select(userId => SendToUserAsync(userId, message));
            await Task.WhenAll(tasks);
        }
        
        /// <summary>
        /// 发送消息给群组
        /// </summary>
        public async Task SendToGroupAsync(string groupName, object message)
        {
            await _hubContext.Clients.Group(groupName).SendAsync("ReceiveMessage", message);
            
            _logger.LogInformation($"消息已发送给群组: GroupName={groupName}");
        }
        
        /// <summary>
        /// 全局广播
        /// </summary>
        public async Task BroadcastAsync(object message)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", message);
            
            _logger.LogInformation("消息已全局广播");
        }
        
        /// <summary>
        /// 发送消息给指定连接
        /// </summary>
        public async Task SendToConnectionAsync(string connectionId, object message)
        {
            await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveMessage", message);
            
            _logger.LogInformation($"消息已发送给连接: ConnectionId={connectionId}");
        }
        
        /// <summary>
        /// 保存离线消息到Redis
        /// </summary>
        private async Task SaveOfflineMessageAsync(Guid userId, object message)
        {
            var cacheKey = $"offline_messages:{userId}";
            
            // 从缓存获取现有离线消息
            var existingJson = await _cache.GetStringAsync(cacheKey);
            var messages = string.IsNullOrEmpty(existingJson)
                ? new List<object>()
                : JsonSerializer.Deserialize<List<object>>(existingJson)!;
            
            // 添加新消息
            messages.Add(new
            {
                Message = message,
                Timestamp = DateTime.UtcNow
            });
            
            // 保存到Redis（保留7天）
            var json = JsonSerializer.Serialize(messages);
            await _cache.SetStringAsync(
                cacheKey,
                json,
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(7)
                }
            );
        }
    }
}
```

（由于长度限制，这里只展示核心代码框架，完整的Day 10-14内容包括：订阅管理、REST API、MQTT Broker、⭐客户端SDK 6大组件⭐、NuGet发布、验收测试）

---

**Week 2里程碑**: 核心功能完成，⭐客户端SDK开发完成⭐！

---

## 📊 6. Week 3 详细计划：可靠性保证 + 在线状态管理

### 6.1 Day 15-16: 消息持久化（PostgreSQL）

**负责人**: 后端工程师2

**Day 15上午: 消息持久化服务**

```csharp
// MessagePersistenceService.cs
namespace SmartAbp.RealTimeCommunication.Services
{
    public class MessagePersistenceService : IMessagePersistenceService, ITransientDependency
    {
        private readonly IMessageRepository _messageRepository;
        private readonly ILogger<MessagePersistenceService> _logger;
        
        /// <summary>
        /// 持久化消息到PostgreSQL
        /// </summary>
        public async Task SaveMessageAsync(Message message)
        {
            await _messageRepository.InsertAsync(message);
            await CurrentUnitOfWork.SaveChangesAsync();
            
            _logger.LogInformation($"消息已持久化: MessageId={message.Id}");
        }
        
        /// <summary>
        /// 获取未读消息
        /// </summary>
        public async Task<List<Message>> GetUnreadMessagesAsync(Guid userId)
        {
            return await _messageRepository.GetUnreadMessagesAsync(userId);
        }
        
        /// <summary>
        /// 标记消息已读
        /// </summary>
        public async Task MarkAsReadAsync(Guid messageId)
        {
            var message = await _messageRepository.GetAsync(messageId);
            message.MarkAsRead();
            await _messageRepository.UpdateAsync(message);
        }
    }
}
```

**Day 15下午: 消息统计API**

```csharp
// MessageController.cs (新增API)
[HttpGet("messages/unread-count")]
public async Task<int> GetUnreadCountAsync()
{
    var messages = await _persistenceService.GetUnreadMessagesAsync(CurrentUser.GetId());
    return messages.Count;
}

[HttpGet("messages/unread")]
public async Task<List<MessageDto>> GetUnreadMessagesAsync()
{
    var messages = await _persistenceService.GetUnreadMessagesAsync(CurrentUser.GetId());
    return ObjectMapper.Map<List<Message>, List<MessageDto>>(messages);
}

[HttpPost("messages/{id}/mark-as-read")]
public async Task MarkAsReadAsync(Guid id)
{
    await _persistenceService.MarkAsReadAsync(id);
}
```

**Day 16: 消息历史查询优化（PostgreSQL分区表）**

```sql
-- 按月份分区
CREATE TABLE messages_partition (
    id UUID NOT NULL,
    sender_id UUID NOT NULL,
    receiver_id UUID,
    content TEXT NOT NULL,
    creation_time TIMESTAMP NOT NULL,
    PRIMARY KEY (id, creation_time)
) PARTITION BY RANGE (creation_time);

-- 创建分区
CREATE TABLE messages_2025_01 PARTITION OF messages_partition
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE messages_2025_02 PARTITION OF messages_partition
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- 索引优化
CREATE INDEX idx_messages_receiver_creation ON messages_partition (receiver_id, creation_time DESC);
CREATE INDEX idx_messages_sender_creation ON messages_partition (sender_id, creation_time DESC);
```

---

### 6.2 Day 17-18: 消息ACK确认机制

**负责人**: SignalR专家

**Day 17上午: ACK消息模型**

```csharp
// MessageAck.cs
public class MessageAck : Entity<Guid>
{
    public Guid MessageId { get; set; }
    public Guid UserId { get; set; }
    public DateTime AckTime { get; set; }
    public string? ClientInfo { get; set; } // 客户端信息
}

// 消息发送带ACK
public class ReliableMessageSender
{
    private readonly IHubContext<SmartAbpHub> _hubContext;
    private readonly IDistributedCache _cache;
    
    public async Task<string> SendWithAckAsync(Guid userId, object message)
    {
        var messageId = Guid.NewGuid().ToString();
        
        // 保存到待确认缓存
        await _cache.SetStringAsync(
            $"message_pending_ack:{messageId}",
            JsonSerializer.Serialize(new
            {
                UserId = userId,
                Message = message,
                SendTime = DateTime.UtcNow
            }),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            }
        );
        
        // 发送消息
        await _hubContext.Clients.Group($"user:{userId}").SendAsync("ReceiveMessage", new
        {
            MessageId = messageId,
            Message = message,
            RequireAck = true
        });
        
        return messageId;
    }
    
    public async Task ConfirmAckAsync(string messageId)
    {
        await _cache.RemoveAsync($"message_pending_ack:{messageId}");
        _logger.LogInformation($"消息ACK已确认: MessageId={messageId}");
    }
}
```

**Day 17下午: 超时重发机制**

```csharp
// MessageRetryService.cs
public class MessageRetryService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RetryPendingMessagesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "重发消息失败");
            }
            
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
    
    private async Task RetryPendingMessagesAsync()
    {
        // 获取所有待确认消息
        var keys = await _cache.GetKeysAsync("message_pending_ack:*");
        
        foreach (var key in keys)
        {
            var json = await _cache.GetStringAsync(key);
            if (string.IsNullOrEmpty(json))
                continue;
            
            var pendingMessage = JsonSerializer.Deserialize<PendingMessage>(json);
            
            // 如果超过1分钟未确认，重发
            if (DateTime.UtcNow - pendingMessage.SendTime > TimeSpan.FromMinutes(1))
            {
                await _messageSender.SendWithAckAsync(pendingMessage.UserId, pendingMessage.Message);
                _logger.LogWarning($"消息重发: UserId={pendingMessage.UserId}");
            }
        }
    }
}
```

**Day 18: 客户端ACK实现**

```typescript
// SignalR客户端自动ACK
connection.on("ReceiveMessage", (data) => {
  if (data.RequireAck) {
    // 自动发送ACK
    connection.invoke("AckMessage", data.MessageId);
  }
  
  // 处理消息
  handleMessage(data.Message);
});
```

---

### 6.3 Day 19-20: 在线用户管理完善

**负责人**: 后端工程师1

**Day 19上午: 在线状态追踪（Redis Set）**

```csharp
// OnlineUserTracker.cs
public class OnlineUserTracker : IOnlineUserTracker, ISingletonDependency
{
    private readonly IDistributedCache _cache;
    private readonly IDatabase _redis; // StackExchange.Redis
    
    public async Task AddOnlineUserAsync(Guid userId)
    {
        await _redis.SetAddAsync("online_users", userId.ToString());
        
        // 设置用户在线时间
        await _cache.SetStringAsync(
            $"user_online_time:{userId}",
            DateTime.UtcNow.ToString("O"),
            new DistributedCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromHours(24)
            }
        );
    }
    
    public async Task RemoveOnlineUserAsync(Guid userId)
    {
        await _redis.SetRemoveAsync("online_users", userId.ToString());
    }
    
    public async Task<int> GetOnlineUserCountAsync()
    {
        return (int)await _redis.SetLengthAsync("online_users");
    }
    
    public async Task<List<Guid>> GetOnlineUsersAsync(int skip = 0, int take = 100)
    {
        var values = await _redis.SetMembersAsync("online_users");
        
        return values
            .Skip(skip)
            .Take(take)
            .Select(x => Guid.Parse(x!))
            .ToList();
    }
}
```

**Day 19下午: 用户在线状态变更事件**

```csharp
// UserPresenceChangedEvent.cs
public class UserPresenceChangedEvent
{
    public Guid UserId { get; set; }
    public bool IsOnline { get; set; }
    public DateTime ChangedAt { get; set; }
}

// UserPresenceEventHandler.cs
public class UserPresenceEventHandler : IDistributedEventHandler<UserPresenceChangedEvent>, ITransientDependency
{
    private readonly IMessageRoutingService _routingService;
    
    public async Task HandleEventAsync(UserPresenceChangedEvent eventData)
    {
        // 广播用户状态变更
        await _routingService.BroadcastAsync(new
        {
            Type = eventData.IsOnline ? "UserOnline" : "UserOffline",
            UserId = eventData.UserId,
            Timestamp = eventData.ChangedAt
        });
    }
}

// SmartAbpHub.cs (更新)
public override async Task OnConnectedAsync()
{
    // ... 现有代码 ...
    
    // 发布用户上线事件
    await LocalEventBus.PublishAsync(new UserPresenceChangedEvent
    {
        UserId = Guid.Parse(Context.UserIdentifier),
        IsOnline = true,
        ChangedAt = DateTime.UtcNow
    });
}
```

**Day 20: 在线用户列表API + 前端实时展示**

```csharp
// OnlineUsersController.cs
[HttpGet("online-users")]
public async Task<PagedResultDto<OnlineUserDto>> GetOnlineUsersAsync(PagedAndSortedResultRequestDto input)
{
    var totalCount = await _onlineUserTracker.GetOnlineUserCountAsync();
    var userIds = await _onlineUserTracker.GetOnlineUsersAsync(input.SkipCount, input.MaxResultCount);
    
    // 获取用户详细信息
    var users = await _identityUserAppService.GetListByIdsAsync(userIds);
    
    return new PagedResultDto<OnlineUserDto>(
        totalCount,
        ObjectMapper.Map<List<IdentityUserDto>, List<OnlineUserDto>>(users)
    );
}
```

---

### 6.4 Day 21: Week 3验收测试

**验收清单**:

```yaml
消息可靠性:
  ✅ 消息持久化到PostgreSQL
  ✅ 消息历史查询优化（分区表）
  ✅ 消息ACK确认机制
  ✅ 超时自动重发
  ✅ 客户端自动ACK

在线状态管理:
  ✅ Redis Set实时追踪
  ✅ 用户上线/下线事件
  ✅ 在线用户列表API
  ✅ 实时状态变更广播

性能测试:
  ✅ 消息送达率≥99.9%
  ✅ ACK确认<100ms
  ✅ 在线用户统计<10ms
```

**Week 3里程碑**: 消息可靠性保证完成，在线状态管理完善！

---

## 🎨 7. Week 4 详细计划：前端UI + 部署上线

### 7.1 Day 22-24: Vue3实时通信组件

**负责人**: 前端工程师

**Day 22上午: SignalR连接Hook**

```vue
<!-- useSignalR.ts -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr'

export function useSignalR(hubUrl: string, accessToken: string) {
  const connection = ref<HubConnection>()
  const isConnected = ref(false)
  const messages = ref<any[]>([])
  
  const connect = async () => {
    connection.value = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => accessToken
      })
      .withAutomaticReconnect()
      .build()
    
    connection.value.on('ReceiveMessage', (message: any) => {
      messages.value.push(message)
      
      // 自动ACK
      if (message.RequireAck) {
        connection.value!.invoke('AckMessage', message.MessageId)
      }
    })
    
    await connection.value.start()
    isConnected.value = true
  }
  
  const disconnect = async () => {
    if (connection.value) {
      await connection.value.stop()
      isConnected.value = false
    }
  }
  
  const sendToUser = async (userId: string, message: any) => {
    await connection.value!.invoke('SendToUser', userId, message)
  }
  
  const joinGroup = async (groupName: string) => {
    await connection.value!.invoke('JoinGroup', groupName)
  }
  
  onMounted(connect)
  onUnmounted(disconnect)
  
  return {
    isConnected,
    messages,
    sendToUser,
    joinGroup
  }
}
</script>
```

**Day 22下午: 实时消息通知组件**

```vue
<!-- RealTimeNotification.vue -->
<template>
  <div class="realtime-notification">
    <el-badge :value="unreadCount" :hidden="unreadCount === 0">
      <el-button @click="showMessages" :icon="Bell">
        通知
      </el-button>
    </el-badge>
    
    <el-drawer v-model="drawerVisible" title="实时消息" size="400px">
      <div v-for="message in messages" :key="message.id" class="message-item">
        <div class="message-header">
          <span class="sender">{{ message.sender }}</span>
          <span class="time">{{ formatTime(message.timestamp) }}</span>
        </div>
        <div class="message-content">
          {{ message.content }}
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { useSignalR } from './useSignalR'

const { messages } = useSignalR('http://realtime-api:5000/hubs/smartabp', 'your-access-token')

const drawerVisible = ref(false)

const unreadCount = computed(() => messages.value.filter(m => !m.isRead).length)

const showMessages = () => {
  drawerVisible.value = true
}

const formatTime = (timestamp: Date) => {
  return new Date(timestamp).toLocaleTimeString()
}
</script>
```

**Day 23: 在线用户列表组件**

```vue
<!-- OnlineUserList.vue -->
<template>
  <el-card title="在线用户">
    <el-table :data="onlineUsers" height="600">
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="onlineTime" label="在线时长">
        <template #default="{ row }">
          {{ formatDuration(row.onlineTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button size="small" @click="sendMessage(row.id)">
            发送消息
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      @current-change="loadOnlineUsers"
    />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getOnlineUsers } from '@/api/realtime-communication'

const onlineUsers = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const loadOnlineUsers = async () => {
  const result = await getOnlineUsers({
    skipCount: (currentPage.value - 1) * pageSize.value,
    maxResultCount: pageSize.value
  })
  
  onlineUsers.value = result.items
  total.value = result.totalCount
}

onMounted(loadOnlineUsers)
</script>
```

**Day 24: 设备状态监控组件**

```vue
<!-- DeviceStatusMonitor.vue -->
<template>
  <div class="device-monitor">
    <div v-for="device in devices" :key="device.id" class="device-card">
      <el-card>
        <template #header>
          <div class="device-header">
            <span>{{ device.name }}</span>
            <el-tag :type="device.status === 'online' ? 'success' : 'danger'">
              {{ device.status }}
            </el-tag>
          </div>
        </template>
        
        <div class="device-data">
          <div v-for="(value, key) in device.data" :key="key" class="data-item">
            <span class="data-label">{{ key }}:</span>
            <span class="data-value">{{ value }}</span>
          </div>
        </div>
        
        <div class="device-actions">
          <el-button size="small" @click="sendCommandToDevice(device.id)">
            发送指令
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSignalR } from './useSignalR'

const { joinGroup, messages } = useSignalR('http://realtime-api:5000/hubs/smartabp', 'token')

const devices = ref([])

onMounted(async () => {
  // 加入设备监控组
  await joinGroup('device:all')
})

// 监听设备消息
watch(messages, (newMessages) => {
  const deviceMessage = newMessages[newMessages.length - 1]
  if (deviceMessage.DeviceId) {
    updateDeviceStatus(deviceMessage)
  }
})
</script>
```

---

### 7.2 Day 25-26: Aspire编排配置 + 负载测试

**Day 25: Aspire配置**

```csharp
// Program.cs
var builder = DistributedApplication.CreateBuilder(args);

var redis = builder.AddRedis("redis")
    .WithRedisCommander();

var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin();

var emqx = builder.AddContainer("emqx", "emqx/emqx", "5.3.0")
    .WithHttpEndpoint(port: 18083, targetPort: 18083, name: "dashboard")
    .WithEndpoint(port: 1883, targetPort: 1883, name: "mqtt");

builder.AddProject<Projects.SmartAbp_RealTimeCommunication_HttpApi_Host>("realtime-api")
    .WithReference(redis)
    .WithReference(postgres)
    .WithReference(emqx)
    .WithReplicas(3); // 3个实例（负载均衡）

builder.Build().Run();
```

**Day 26上午: 负载测试脚本**

```csharp
// LoadTest.cs
public class SignalRLoadTest
{
    [Fact]
    public async Task Test_100K_Concurrent_Connections()
    {
        var connections = new List<HubConnection>();
        
        // 创建100,000个连接
        for (int i = 0; i < 100000; i++)
        {
            var connection = new HubConnectionBuilder()
                .WithUrl("http://realtime-api:5000/hubs/smartabp")
                .Build();
            
            await connection.StartAsync();
            connections.Add(connection);
            
            if (i % 1000 == 0)
            {
                Console.WriteLine($"已连接: {i} / 100,000");
            }
        }
        
        // 验证所有连接正常
        Assert.Equal(100000, connections.Count(c => c.State == HubConnectionState.Connected));
    }
    
    [Fact]
    public async Task Test_50K_Messages_Per_Second()
    {
        var stopwatch = Stopwatch.StartNew();
        var messageCount = 50000;
        
        var tasks = Enumerable.Range(0, messageCount)
            .Select(i => SendMessageAsync(i));
        
        await Task.WhenAll(tasks);
        
        stopwatch.Stop();
        
        var messagesPerSecond = messageCount / stopwatch.Elapsed.TotalSeconds;
        Assert.True(messagesPerSecond >= 50000, $"实际: {messagesPerSecond} msg/sec");
    }
}
```

**Day 26下午: 性能报告生成**

---

### 7.3 Day 27: 安全测试

**负责人**: 测试工程师

```yaml
安全测试项:
  ✅ OAuth2.0认证测试
  ✅ JWT Token过期测试
  ✅ 未授权访问拦截测试
  ✅ HTTPS加密测试
  ✅ XSS攻击防护测试
  ✅ CSRF防护测试
```

---

### 7.4 Day 28: 最终验收与交付

**最终验收清单**:

```yaml
功能验收:
  ✅ SignalR Hub完整实现
  ✅ MQTT Broker集成
  ✅ 消息可靠性保证（ACK + 重发）
  ✅ 在线状态管理
  ✅ ⭐客户端SDK完整（6大组件）
  ✅ Vue3前端组件

性能验收:
  ✅ 100,000并发连接
  ✅ 50,000 msg/sec吞吐量
  ✅ <50ms消息延迟
  ✅ 99.9%消息送达率

质量验收:
  ✅ 单元测试覆盖率≥80%
  ✅ 负载测试通过
  ✅ 安全测试通过
  ✅ 代码审查通过

交付物:
  ✅ Docker镜像
  ✅ Aspire编排配置
  ✅ NuGet包（SmartAbp.RealtimeCommunication.Client）
  ✅ API文档（Swagger）
  ✅ Vue3组件库
  ✅ 运维文档
```

**Week 4里程碑**: RealTimeCommunication微服务全部完成，验收通过！

---

## 📊 8. 成本与资源分配

```yaml
团队配置（6人）:
  后端工程师1: $18,000 (Week 1-4全程)
  后端工程师2: $18,000 (Week 1-4全程)
  SignalR专家: $20,000 (Week 1-4全程，负责SDK开发)
  前端工程师: $10,000 (Week 4专职)
  DevOps工程师: $4,000 (Week 1+4)
  测试工程师: $2,000 (Week 2-4)

总预算: $72,000

资源需求:
  开发服务器: 3台（$1,500/月）
  Redis集群: 3节点（$500/月）
  PostgreSQL: 1主2从（$800/月）
  EMQ X: 1实例（$300/月）
```

---

## 🚨 9. 风险管理

```yaml
技术风险:
  风险1: 100,000并发连接压力
    概率: 中
    影响: 高
    缓解: Redis Backplane横向扩展 + Aspire自动扩容

  风险2: MQTT消息丢失
    概率: 低
    影响: 高
    缓解: QoS 1/2保证 + 消息持久化

资源风险:
  风险3: SignalR专家资源不足
    概率: 中
    影响: 高
    缓解: 提前培训后端工程师SignalR技能

进度风险:
  风险4: 客户端SDK开发延期
    概率: 中
    影响: 中
    缓解: Week 2提前启动SDK开发 + 增加人力
```

---

## 🔄 10. 后续迭代计划

```yaml
V1.1 (Week 5-6):
  ✅ WebRTC视频通话集成
  ✅ 文件传输功能
  ✅ 聊天室功能

V1.2 (Week 7-8):
  ✅ AI智能消息推荐
  ✅ 消息翻译功能
  ✅ 表情包系统
```

---

## ✅ 总结

**RealTimeCommunication微服务详细开发计划已完成！**

**核心亮点**：
- 🌐 **高性能实时通信**：100,000+并发，<50ms延迟
- 📡 **Web + IoT双协议**：SignalR + MQTT统一平台
- ⭐ **企业级客户端SDK**：6大核心组件 + 3种集成方式
- 🔒 **消息可靠性保证**：ACK + 重发 + 持久化
- 📊 **完善的监控体系**：在线状态 + 性能指标

**开发周期**: 4周（28工作日）
**团队规模**: 6人
**项目预算**: $72,000


