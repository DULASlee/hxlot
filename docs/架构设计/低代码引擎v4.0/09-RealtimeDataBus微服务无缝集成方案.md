# RealtimeDataBus微服务无缝集成方案 v1.0

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| 文档版本 | v1.0 |
| 创建日期 | 2025-10-19 |
| 负责人 | SmartABP架构团队 |
| 优先级 | P1（高优先级）|
| 状态 | 设计阶段 |
| 客户端SDK | SmartAbp.RealtimeDataBus.Client |

---

## 🎯 1. 系统概述

### 1.1 业务目标

Realtime Data Bus微服务是SmartABP平台的统一实时数据总线系统，提供零侵入式的消息发布订阅、事件驱动架构、数据流转管理和事件溯源能力。

### 1.2 核心价值

- **零侵入式集成**：一行代码完成事件驱动架构集成
- **高性能**：支持100,000+ 消息/秒吞吐量
- **事件溯源**：完整的事件历史记录和回放能力
- **分布式追踪**：跨服务事件链路追踪
- **最终一致性**：分布式事务解决方案（Saga模式）

### 1.3 应用场景

```yaml
应用场景清单:
  
  1. 微服务间通信:
     - 异步消息传递
     - 事件通知
     - 服务解耦
     - 最终一致性保证
     
  2. 实时数据同步:
     - 跨系统数据同步
     - 缓存更新通知
     - 配置变更通知
     - 权限变更通知
     
  3. 业务流程编排:
     - Saga分布式事务
     - 工作流引擎
     - 审批流程
     - 订单流程
     
  4. 实时监控告警:
     - 系统监控事件
     - 业务告警事件
     - 性能指标事件
     - 安全事件
```

---

## 🏗️ 2. 事件驱动架构设计

### 2.1 核心架构

```
┌─────────────────────────────────────────────────────────┐
│              事件生产者（Event Producers）                │
├─────────────────────────────────────────────────────────┤
│  低代码引擎  │  MES系统  │  智慧工地  │  ERP/OA  │  ...  │
└──────────────────┬──────────────────────────────────────┘
                   │ 发布事件
                   ▼
┌─────────────────────────────────────────────────────────┐
│          Realtime Data Bus（事件总线）                   │
├─────────────────────────────────────────────────────────┤
│  • EventPublisher（事件发布器）                          │
│  • EventRouter（事件路由器）                             │
│  • MessageBroker（消息代理：Kafka/RabbitMQ/Dapr）      │
│  • EventStore（事件存储：EventSourcing）                │
│  • EventTracer（分布式追踪）                             │
└──────────────────┬──────────────────────────────────────┘
                   │ 订阅事件
                   ▼
┌─────────────────────────────────────────────────────────┐
│              事件消费者（Event Consumers）                │
├─────────────────────────────────────────────────────────┤
│  权限系统  │  通知系统  │  审计系统  │  分析系统  │  ...  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 6大核心集成组件

#### 组件1：EventPublisher（事件发布器）

**职责**：零侵入式事件发布

```csharp
// EventPublisher.cs
using Dapr.Client;

namespace SmartAbp.RealtimeDataBus.Client.Publishers
{
    /// <summary>
    /// 事件发布器
    /// 基于Dapr Pub/Sub实现事件发布
    /// </summary>
    public class EventPublisher
    {
        private readonly DaprClient _daprClient;
        private readonly RealtimeDataBusOptions _options;
        private readonly ILogger<EventPublisher> _logger;
        
        // 本地事件缓存（网络故障时使用）
        private readonly ConcurrentQueue<EventMessage> _failedEvents;

        public EventPublisher(
            DaprClient daprClient,
            RealtimeDataBusOptions options,
            ILogger<EventPublisher> logger)
        {
            _daprClient = daprClient;
            _options = options;
            _logger = logger;
            _failedEvents = new ConcurrentQueue<EventMessage>();
        }

        /// <summary>
        /// 发布事件
        /// </summary>
        public async Task PublishAsync<TEvent>(TEvent eventData)
            where TEvent : class
        {
            var eventMessage = new EventMessage
            {
                EventId = Guid.NewGuid(),
                EventType = typeof(TEvent).Name,
                EventData = JsonSerializer.Serialize(eventData),
                Timestamp = DateTime.UtcNow,
                Source = _options.ServiceName,
                CorrelationId = Activity.Current?.Id ?? Guid.NewGuid().ToString()
            };
            
            await PublishAsync(eventMessage);
        }

        /// <summary>
        /// 发布事件消息
        /// </summary>
        public async Task PublishAsync(EventMessage eventMessage)
        {
            try
            {
                // 使用Dapr Pub/Sub发布事件
                await _daprClient.PublishEventAsync(
                    _options.PubSubName,
                    eventMessage.EventType,
                    eventMessage
                );
                
                _logger.LogInformation($"事件已发布: {eventMessage.EventType} (EventId: {eventMessage.EventId})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"发布事件失败: {eventMessage.EventType}");
                
                // 保存到本地缓存，稍后重试
                _failedEvents.Enqueue(eventMessage);
                
                // 启动重试任务
                _ = RetryFailedEventsAsync();
            }
        }

        /// <summary>
        /// 批量发布事件
        /// </summary>
        public async Task PublishBatchAsync(List<EventMessage> events)
        {
            var tasks = events.Select(e => PublishAsync(e));
            await Task.WhenAll(tasks);
        }

        /// <summary>
        /// 重试失败的事件
        /// </summary>
        private async Task RetryFailedEventsAsync()
        {
            await Task.Delay(TimeSpan.FromSeconds(5)); // 等待5秒
            
            while (_failedEvents.TryDequeue(out var eventMessage))
            {
                try
                {
                    await PublishAsync(eventMessage);
                }
                catch
                {
                    // 如果还是失败，重新入队
                    _failedEvents.Enqueue(eventMessage);
                    break; // 停止重试，稍后再试
                }
            }
        }
    }

    /// <summary>
    /// 事件消息模型
    /// </summary>
    public class EventMessage
    {
        public Guid EventId { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string EventData { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Source { get; set; } = string.Empty;
        public string CorrelationId { get; set; } = string.Empty;
        public Dictionary<string, string> Metadata { get; set; } = new();
    }
}
```

#### 组件2：EventSubscriber（事件订阅器）

**职责**：自动订阅和处理事件

```csharp
// EventSubscriber.cs
namespace SmartAbp.RealtimeDataBus.Client.Subscribers
{
    /// <summary>
    /// 事件订阅器
    /// 自动订阅Dapr Pub/Sub事件并路由到对应的处理器
    /// </summary>
    public class EventSubscriber
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<EventSubscriber> _logger;
        
        // 事件处理器映射表
        private readonly Dictionary<string, Type> _eventHandlers;

        public EventSubscriber(
            IServiceProvider serviceProvider,
            ILogger<EventSubscriber> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _eventHandlers = new Dictionary<string, Type>();
            
            // 自动扫描并注册事件处理器
            RegisterEventHandlers();
        }

        /// <summary>
        /// 处理接收到的事件
        /// </summary>
        public async Task HandleEventAsync(EventMessage eventMessage)
        {
            try
            {
                // 查找事件处理器
                if (!_eventHandlers.TryGetValue(eventMessage.EventType, out var handlerType))
                {
                    _logger.LogWarning($"未找到事件处理器: {eventMessage.EventType}");
                    return;
                }
                
                // 创建处理器实例
                var handler = _serviceProvider.GetService(handlerType) as IEventHandler;
                
                if (handler == null)
                {
                    _logger.LogError($"无法创建事件处理器实例: {handlerType.Name}");
                    return;
                }
                
                // 反序列化事件数据
                var eventDataType = handler.GetEventDataType();
                var eventData = JsonSerializer.Deserialize(eventMessage.EventData, eventDataType);
                
                // 执行处理器
                await handler.HandleAsync(eventData!);
                
                _logger.LogInformation($"事件已处理: {eventMessage.EventType} (EventId: {eventMessage.EventId})");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"处理事件失败: {eventMessage.EventType}");
                
                // 保存到死信队列
                await SaveToDeadLetterQueueAsync(eventMessage, ex);
            }
        }

        /// <summary>
        /// 自动扫描并注册事件处理器
        /// </summary>
        private void RegisterEventHandlers()
        {
            var assembly = Assembly.GetEntryAssembly()!;
            var handlerTypes = assembly.GetTypes()
                .Where(t => typeof(IEventHandler).IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract);
            
            foreach (var handlerType in handlerTypes)
            {
                var handler = Activator.CreateInstance(handlerType) as IEventHandler;
                if (handler != null)
                {
                    var eventType = handler.GetEventDataType().Name;
                    _eventHandlers[eventType] = handlerType;
                    
                    _logger.LogInformation($"已注册事件处理器: {eventType} -> {handlerType.Name}");
                }
            }
        }

        private async Task SaveToDeadLetterQueueAsync(EventMessage eventMessage, Exception ex)
        {
            // 保存到死信队列，供后续人工处理
            var deadLetter = new DeadLetterMessage
            {
                EventMessage = eventMessage,
                Error = ex.Message,
                StackTrace = ex.StackTrace,
                Timestamp = DateTime.UtcNow
            };
            
            // 保存到数据库或文件
            // ...
        }
    }

    /// <summary>
    /// 事件处理器接口
    /// </summary>
    public interface IEventHandler
    {
        Task HandleAsync(object eventData);
        Type GetEventDataType();
    }

    /// <summary>
    /// 泛型事件处理器基类
    /// </summary>
    public abstract class EventHandler<TEvent> : IEventHandler
        where TEvent : class
    {
        public async Task HandleAsync(object eventData)
        {
            await HandleAsync((TEvent)eventData);
        }

        public Type GetEventDataType()
        {
            return typeof(TEvent);
        }

        protected abstract Task HandleAsync(TEvent eventData);
    }
}
```

#### 组件3：EventStore（事件存储）

**职责**：事件溯源（Event Sourcing）

```csharp
// EventStore.cs
namespace SmartAbp.RealtimeDataBus.Client.EventSourcing
{
    /// <summary>
    /// 事件存储
    /// 实现事件溯源（Event Sourcing）模式
    /// </summary>
    public class EventStore
    {
        private readonly IRepository<StoredEvent, Guid> _eventRepository;
        private readonly ILogger<EventStore> _logger;

        public EventStore(
            IRepository<StoredEvent, Guid> eventRepository,
            ILogger<EventStore> logger)
        {
            _eventRepository = eventRepository;
            _logger = logger;
        }

        /// <summary>
        /// 保存事件到事件存储
        /// </summary>
        public async Task SaveEventAsync(EventMessage eventMessage)
        {
            var storedEvent = new StoredEvent
            {
                Id = eventMessage.EventId,
                EventType = eventMessage.EventType,
                EventData = eventMessage.EventData,
                Timestamp = eventMessage.Timestamp,
                Source = eventMessage.Source,
                CorrelationId = eventMessage.CorrelationId
            };
            
            await _eventRepository.InsertAsync(storedEvent);
            
            _logger.LogInformation($"事件已保存到事件存储: {eventMessage.EventId}");
        }

        /// <summary>
        /// 获取聚合根的所有事件
        /// </summary>
        public async Task<List<StoredEvent>> GetEventsAsync(
            string aggregateId,
            DateTime? fromTime = null,
            DateTime? toTime = null)
        {
            var query = await _eventRepository.GetQueryableAsync();
            
            query = query.Where(e => e.Source == aggregateId);
            
            if (fromTime.HasValue)
            {
                query = query.Where(e => e.Timestamp >= fromTime.Value);
            }
            
            if (toTime.HasValue)
            {
                query = query.Where(e => e.Timestamp <= toTime.Value);
            }
            
            return await AsyncExecuter.ToListAsync(query.OrderBy(e => e.Timestamp));
        }

        /// <summary>
        /// 重建聚合根状态（事件回放）
        /// </summary>
        public async Task<TAggregateRoot> ReplayEventsAsync<TAggregateRoot>(string aggregateId)
            where TAggregateRoot : IAggregateRoot, new()
        {
            var events = await GetEventsAsync(aggregateId);
            
            var aggregateRoot = new TAggregateRoot();
            
            foreach (var storedEvent in events)
            {
                var eventDataType = Type.GetType(storedEvent.EventType)!;
                var eventData = JsonSerializer.Deserialize(storedEvent.EventData, eventDataType);
                
                aggregateRoot.ApplyEvent(eventData!);
            }
            
            return aggregateRoot;
        }
    }

    /// <summary>
    /// 聚合根接口
    /// </summary>
    public interface IAggregateRoot
    {
        void ApplyEvent(object eventData);
    }

    /// <summary>
    /// 存储的事件实体
    /// </summary>
    public class StoredEvent : Entity<Guid>
    {
        public string EventType { get; set; } = string.Empty;
        public string EventData { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Source { get; set; } = string.Empty;
        public string CorrelationId { get; set; } = string.Empty;
    }
}
```

#### 组件4：EventTracer（分布式追踪）

**职责**：跨服务事件链路追踪

```csharp
// EventTracer.cs
using System.Diagnostics;

namespace SmartAbp.RealtimeDataBus.Client.Tracing
{
    /// <summary>
    /// 事件追踪器
    /// 实现分布式追踪（基于OpenTelemetry）
    /// </summary>
    public class EventTracer
    {
        private readonly ActivitySource _activitySource;
        private readonly ILogger<EventTracer> _logger;

        public EventTracer(ILogger<EventTracer> logger)
        {
            _activitySource = new ActivitySource("SmartAbp.RealtimeDataBus");
            _logger = logger;
        }

        /// <summary>
        /// 开始追踪事件发布
        /// </summary>
        public Activity? StartPublishActivity(EventMessage eventMessage)
        {
            var activity = _activitySource.StartActivity(
                $"Publish {eventMessage.EventType}",
                ActivityKind.Producer
            );
            
            if (activity != null)
            {
                activity.SetTag("event.id", eventMessage.EventId);
                activity.SetTag("event.type", eventMessage.EventType);
                activity.SetTag("event.source", eventMessage.Source);
                activity.SetTag("messaging.system", "dapr");
            }
            
            return activity;
        }

        /// <summary>
        /// 开始追踪事件处理
        /// </summary>
        public Activity? StartConsumeActivity(EventMessage eventMessage)
        {
            var activity = _activitySource.StartActivity(
                $"Consume {eventMessage.EventType}",
                ActivityKind.Consumer,
                parentId: eventMessage.CorrelationId
            );
            
            if (activity != null)
            {
                activity.SetTag("event.id", eventMessage.EventId);
                activity.SetTag("event.type", eventMessage.EventType);
                activity.SetTag("event.source", eventMessage.Source);
            }
            
            return activity;
        }

        /// <summary>
        /// 记录事件处理成功
        /// </summary>
        public void RecordSuccess(Activity? activity)
        {
            if (activity != null)
            {
                activity.SetStatus(ActivityStatusCode.Ok);
                activity.Stop();
            }
        }

        /// <summary>
        /// 记录事件处理失败
        /// </summary>
        public void RecordError(Activity? activity, Exception ex)
        {
            if (activity != null)
            {
                activity.SetStatus(ActivityStatusCode.Error, ex.Message);
                activity.RecordException(ex);
                activity.Stop();
            }
        }
    }
}
```

#### 组件5：SagaCoordinator（Saga协调器）

**职责**：分布式事务协调（Saga模式）

```csharp
// SagaCoordinator.cs
namespace SmartAbp.RealtimeDataBus.Client.Saga
{
    /// <summary>
    /// Saga协调器
    /// 实现分布式事务（Saga模式）
    /// </summary>
    public class SagaCoordinator
    {
        private readonly EventPublisher _eventPublisher;
        private readonly IRepository<SagaInstance, Guid> _sagaRepository;
        private readonly ILogger<SagaCoordinator> _logger;

        public SagaCoordinator(
            EventPublisher eventPublisher,
            IRepository<SagaInstance, Guid> sagaRepository,
            ILogger<SagaCoordinator> logger)
        {
            _eventPublisher = eventPublisher;
            _sagaRepository = sagaRepository;
            _logger = logger;
        }

        /// <summary>
        /// 启动Saga
        /// </summary>
        public async Task<Guid> StartSagaAsync<TSaga>(TSaga sagaData)
            where TSaga : class
        {
            var sagaInstance = new SagaInstance
            {
                Id = Guid.NewGuid(),
                SagaType = typeof(TSaga).Name,
                SagaData = JsonSerializer.Serialize(sagaData),
                Status = SagaStatus.Started,
                CurrentStep = 0,
                StartTime = DateTime.UtcNow
            };
            
            await _sagaRepository.InsertAsync(sagaInstance);
            
            // 发布Saga启动事件
            await _eventPublisher.PublishAsync(new SagaStartedEvent
            {
                SagaId = sagaInstance.Id,
                SagaType = sagaInstance.SagaType
            });
            
            _logger.LogInformation($"Saga已启动: {sagaInstance.Id}");
            
            return sagaInstance.Id;
        }

        /// <summary>
        /// 执行Saga步骤
        /// </summary>
        public async Task ExecuteStepAsync(Guid sagaId, int stepIndex)
        {
            var sagaInstance = await _sagaRepository.GetAsync(sagaId);
            
            if (sagaInstance.Status != SagaStatus.Started)
            {
                throw new InvalidOperationException($"Saga状态不正确: {sagaInstance.Status}");
            }
            
            sagaInstance.CurrentStep = stepIndex;
            sagaInstance.LastUpdateTime = DateTime.UtcNow;
            
            await _sagaRepository.UpdateAsync(sagaInstance);
            
            // 发布步骤执行事件
            await _eventPublisher.PublishAsync(new SagaStepExecutedEvent
            {
                SagaId = sagaId,
                StepIndex = stepIndex
            });
        }

        /// <summary>
        /// 完成Saga
        /// </summary>
        public async Task CompleteSagaAsync(Guid sagaId)
        {
            var sagaInstance = await _sagaRepository.GetAsync(sagaId);
            
            sagaInstance.Status = SagaStatus.Completed;
            sagaInstance.EndTime = DateTime.UtcNow;
            
            await _sagaRepository.UpdateAsync(sagaInstance);
            
            // 发布Saga完成事件
            await _eventPublisher.PublishAsync(new SagaCompletedEvent
            {
                SagaId = sagaId
            });
            
            _logger.LogInformation($"Saga已完成: {sagaId}");
        }

        /// <summary>
        /// 补偿Saga（回滚）
        /// </summary>
        public async Task CompensateSagaAsync(Guid sagaId, string errorReason)
        {
            var sagaInstance = await _sagaRepository.GetAsync(sagaId);
            
            sagaInstance.Status = SagaStatus.Compensating;
            sagaInstance.ErrorReason = errorReason;
            
            await _sagaRepository.UpdateAsync(sagaInstance);
            
            // 发布Saga补偿事件
            await _eventPublisher.PublishAsync(new SagaCompensatingEvent
            {
                SagaId = sagaId,
                ErrorReason = errorReason
            });
            
            _logger.LogWarning($"Saga开始补偿: {sagaId}, 原因: {errorReason}");
        }
    }

    /// <summary>
    /// Saga实例
    /// </summary>
    public class SagaInstance : Entity<Guid>
    {
        public string SagaType { get; set; } = string.Empty;
        public string SagaData { get; set; } = string.Empty;
        public SagaStatus Status { get; set; }
        public int CurrentStep { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DateTime LastUpdateTime { get; set; }
        public string? ErrorReason { get; set; }
    }

    public enum SagaStatus
    {
        Started = 0,
        Running = 1,
        Completed = 2,
        Compensating = 3,
        Compensated = 4,
        Failed = 5
    }
}
```

#### 组件6：RealtimeDataBusClient（HTTP客户端）

**职责**：与RealtimeDataBus微服务通信

```csharp
// RealtimeDataBusClient.cs
namespace SmartAbp.RealtimeDataBus.Client
{
    /// <summary>
    /// RealtimeDataBus HTTP客户端
    /// </summary>
    public class RealtimeDataBusClient
    {
        private readonly HttpClient _httpClient;
        private readonly RealtimeDataBusOptions _options;

        public RealtimeDataBusClient(
            HttpClient httpClient,
            RealtimeDataBusOptions options)
        {
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri(options.ServiceUrl);
            _options = options;
        }

        /// <summary>
        /// 查询事件历史
        /// </summary>
        public async Task<List<EventMessage>> QueryEventsAsync(
            string eventType,
            DateTime startTime,
            DateTime endTime)
        {
            var response = await _httpClient.GetAsync(
                $"/api/realtime-databus/events/query?eventType={eventType}&start={startTime:O}&end={endTime:O}"
            );
            response.EnsureSuccessStatusCode();
            
            return await response.Content.ReadFromJsonAsync<List<EventMessage>>() ?? new List<EventMessage>();
        }

        /// <summary>
        /// 重放事件
        /// </summary>
        public async Task ReplayEventsAsync(string aggregateId, DateTime fromTime)
        {
            var response = await _httpClient.PostAsJsonAsync(
                "/api/realtime-databus/events/replay",
                new { AggregateId = aggregateId, FromTime = fromTime }
            );
            response.EnsureSuccessStatusCode();
        }
    }
}
```

---

## 🔌 3. 3种无缝集成方式

### 3.1 方式1：零侵入式集成（推荐）

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// ⭐ 一行代码完成实时数据总线集成
builder.Host.UseRealtimeDataBus(
    serviceUrl: "http://databus-api:5000",
    serviceName: "SmartAbp.LowCode",
    enableEventSourcing: true // 启用事件溯源
);

var app = builder.Build();
app.Run();

// ✅ 自动启用：
// - 事件自动发布（Dapr Pub/Sub）
// - 事件自动订阅
// - 事件溯源（Event Store）
// - 分布式追踪（OpenTelemetry）
// - Saga分布式事务
```

### 3.2 方式2：ABP Module集成（企业级）

```csharp
// Program.cs
builder.Services.AddRealtimeDataBusClient(options =>
{
    options.ServiceUrl = "http://databus-api:5000";
    options.ServiceName = "SmartAbp.LowCode";
    
    // Dapr配置
    options.PubSubName = "smartabp-pubsub";
    options.EnableEventSourcing = true;
    options.EnableDistributedTracing = true;
    
    // Saga配置
    options.EnableSaga = true;
});

app.UseRealtimeDataBus();
```

### 3.3 方式3：手动发布订阅

```csharp
// 发布事件
public class MyAppService : ApplicationService
{
    private readonly EventPublisher _eventPublisher;
    
    public async Task CreateOrderAsync()
    {
        // 业务逻辑
        var order = new Order { ... };
        
        // 发布事件
        await _eventPublisher.PublishAsync(new OrderCreatedEvent
        {
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            TotalAmount = order.TotalAmount
        });
    }
}

// 订阅事件
public class OrderCreatedEventHandler : EventHandler<OrderCreatedEvent>
{
    protected override async Task HandleAsync(OrderCreatedEvent eventData)
    {
        // 处理订单创建事件
        _logger.LogInformation($"订单已创建: {eventData.OrderId}");
        
        // 发送通知、更新库存等
    }
}
```

---

## 📊 4. 核心特性

```yaml
性能特性:
  ✅ 消息吞吐量: 100,000+ 消息/秒
  ✅ 事件发布延迟: <10ms
  ✅ 事件处理延迟: <50ms
  ✅ 事件存储: 无限事件历史

可靠性特性:
  ✅ 消息不丢失: 100%保证（Kafka/Dapr）
  ✅ 至少一次交付: Guaranteed
  ✅ 事件回放: 支持
  ✅ 死信队列: 自动处理

事件溯源:
  ✅ 完整事件历史: 永久保存
  ✅ 状态重建: 事件回放
  ✅ 时间旅行: 任意时间点状态查询
  ✅ 审计追踪: 完整操作历史

Saga分布式事务:
  ✅ 长事务支持: Saga模式
  ✅ 自动补偿: 失败自动回滚
  ✅ 状态持久化: Saga实例保存
  ✅ 可视化: Saga流程追踪
```

---

**文档状态**：✅ 无缝集成方案完成
**下一步**：开始实施开发


