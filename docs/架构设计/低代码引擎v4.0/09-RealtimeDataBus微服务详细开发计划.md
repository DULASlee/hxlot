# RealtimeDataBus微服务详细开发计划 v1.1（基于无缝集成方案升级）

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| 文档版本 | v1.1（⭐ 新增客户端SDK开发）|
| 创建日期 | 2025-10-19 |
| 最新更新 | 2025-10-20（添加SmartAbp.RealtimeDataBus.Client SDK开发）|
| 开发周期 | 5周（35个工作日）|
| 团队规模 | 8人（3后端+2中间件+2DevOps+1架构师）|
| 预算 | $120,000 |
| **核心升级** | **Week 2新增Day 11-12专门开发客户端SDK（6大核心集成组件）** |

---

## 🎯 1. 项目概述

### 1.1 项目目标

完成SmartABP平台实时数据总线微服务的开发、测试和部署，实现：
- ✅ Kafka集群搭建（5节点高可用）
- ✅ 事件驱动架构（Event-Driven Architecture）
- ✅ 多协议消息支持（Kafka/Redis Stream/RabbitMQ）
- ✅ 消息路由与转换
- ✅ **⭐ SmartAbp.RealtimeDataBus.Client SDK开发（6大核心集成组件）** ← **核心新增**
- ✅ **⭐ 3种无缝集成方式（EventPublisher/EventSubscriber/手动API）** ← **核心新增**
- ✅ 事件溯源（Event Sourcing）
- ✅ Saga分布式事务

### 1.2 验收标准

```yaml
功能验收:
  ✅ 消息发布订阅: 支持多Topic
  ✅ 消息路由: 基于规则智能路由
  ✅ 消息转换: JSON/Protobuf/Avro格式
  ✅ 事件溯源: 完整事件历史
  ✅ 分布式追踪: OpenTelemetry集成
  ✅ **⭐ 客户端SDK: SmartAbp.RealtimeDataBus.Client NuGet包发布成功** ← **核心新增**
  ✅ **⭐ 零侵入集成: builder.Services.AddRealtimeDataBusClient()一行代码完成集成** ← **核心新增**
  ✅ **⭐ 高性能消息: >50,000 msg/sec吞吐量** ← **核心新增**
  ✅ **⭐ 消息可靠性: 至少一次语义+重试机制** ← **核心新增**
  
性能验证:
  ✅ 消息吞吐量: ≥100,000 msg/sec
  ✅ 端到端延迟: <10ms
  ✅ 消息持久化: 7天保留
  ✅ 并发消费者: ≥1,000
  ✅ 系统可用性: ≥99.99%
  
质量验证:
  ✅ 代码质量: ≥95分
  ✅ 单元测试覆盖率: ≥80%
  ✅ 消息零丢失: 100%
  ✅ 文档完整性: 100%
```

---

## 📅 2. 五周开发计划总览

```yaml
Week 1: Kafka集群搭建 + Dapr集成
  Day 1-2: Kafka Cluster搭建（5节点）
  Day 3-4: Dapr Pub/Sub组件配置
  Day 5: 消息Topic设计与创建

Week 2: 核心消息功能开发 + ⭐客户端SDK开发⭐
  Day 6-7: 消息发布订阅服务
  Day 8-9: 消息路由与转换
  Day 10: 消息持久化存储
  Day 11-12: ⭐ 客户端SDK开发（6大核心集成组件）← **核心新增**

Week 3: 事件溯源与Saga事务
  Day 13-14: Event Sourcing实现
  Day 15-16: Saga分布式事务
  Day 17: 分布式追踪（OpenTelemetry）

Week 4: 性能优化与监控
  Day 18-19: 消息批处理优化
  Day 20-21: 背压与流控
  Day 22: Kafka监控与告警

Week 5: 集成测试与部署
  Day 23-24: 集成测试
  Day 25-26: 压力测试与优化
  Day 27: 生产环境部署
```

---

## 🔧 3. Week 1 详细计划：Kafka集群搭建 + Dapr集成

### 3.1 Day 1-2: Kafka Cluster搭建（5节点）

**负责人**: 中间件工程师1 + DevOps工程师1

**任务清单**:

**Day 1上午: ZooKeeper集群部署**
```yaml
# zookeeper-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: zookeeper
spec:
  serviceName: zookeeper
  replicas: 3
  selector:
    matchLabels:
      app: zookeeper
  template:
    spec:
      containers:
      - name: zookeeper
        image: zookeeper:3.9
        ports:
        - containerPort: 2181
          name: client
        - containerPort: 2888
          name: server
        - containerPort: 3888
          name: leader-election
        env:
        - name: ZOO_MY_ID
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: ZOO_SERVERS
          value: "server.1=zookeeper-0:2888:3888;2181 server.2=zookeeper-1:2888:3888;2181 server.3=zookeeper-2:2888:3888;2181"
        volumeMounts:
        - name: zk-storage
          mountPath: /data
  volumeClaimTemplates:
  - metadata:
      name: zk-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 100Gi
```

**Day 1下午-Day 2上午: Kafka Broker集群部署**
```yaml
# kafka-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: kafka
spec:
  serviceName: kafka
  replicas: 5 # 5个Broker节点
  selector:
    matchLabels:
      app: kafka
  template:
    spec:
      containers:
      - name: kafka
        image: apache/kafka:3.7.0
        ports:
        - containerPort: 9092
          name: plaintext
        - containerPort: 9093
          name: ssl
        env:
        - name: KAFKA_BROKER_ID
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: KAFKA_ZOOKEEPER_CONNECT
          value: "zookeeper-0:2181,zookeeper-1:2181,zookeeper-2:2181"
        - name: KAFKA_ADVERTISED_LISTENERS
          value: "PLAINTEXT://$(POD_NAME).kafka:9092"
        - name: KAFKA_NUM_PARTITIONS
          value: "32" # 默认32分区
        - name: KAFKA_DEFAULT_REPLICATION_FACTOR
          value: "3" # 3副本
        - name: KAFKA_LOG_RETENTION_HOURS
          value: "168" # 7天保留
        - name: KAFKA_LOG_SEGMENT_BYTES
          value: "1073741824" # 1GB
        - name: KAFKA_COMPRESSION_TYPE
          value: "lz4" # LZ4压缩
        resources:
          requests:
            memory: "16Gi"
            cpu: "8"
          limits:
            memory: "16Gi"
            cpu: "8"
        volumeMounts:
        - name: kafka-storage
          mountPath: /var/lib/kafka/data
  volumeClaimTemplates:
  - metadata:
      name: kafka-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 2Ti # 每个Broker 2TB
```

**Day 2下午: Kafka集群验证**
```bash
# 创建测试Topic
kubectl exec -it kafka-0 -- kafka-topics.sh \
  --create \
  --topic test-topic \
  --bootstrap-server kafka-0:9092 \
  --partitions 32 \
  --replication-factor 3

# 生产消息
kubectl exec -it kafka-0 -- kafka-console-producer.sh \
  --broker-list kafka-0:9092 \
  --topic test-topic

# 消费消息
kubectl exec -it kafka-0 -- kafka-console-consumer.sh \
  --bootstrap-server kafka-0:9092 \
  --topic test-topic \
  --from-beginning

# 查看集群状态
kubectl exec -it kafka-0 -- kafka-broker-api-versions.sh \
  --bootstrap-server kafka-0:9092
```

**验收标准**: 
- ✅ Kafka集群5个Broker全部在线
- ✅ 测试Topic创建成功（32分区3副本）
- ✅ 消息生产消费正常

---

### 3.2 Day 3-4: Dapr Pub/Sub组件配置

**负责人**: 中间件工程师2 + 后端开发1

**Day 3: Dapr Kafka Pub/Sub组件**
```yaml
# dapr-pubsub-kafka.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: realtimebus-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "kafka-0:9092,kafka-1:9092,kafka-2:9092,kafka-3:9092,kafka-4:9092"
  - name: authType
    value: "none" # 生产环境使用SASL_SSL
  - name: maxMessageBytes
    value: "10485760" # 10MB
  - name: consumerGroup
    value: "smartabp-databus"
  - name: clientId
    value: "smartabp-databus-client"
---
# Redis Stream备用组件
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: realtimebus-redis-stream
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: "redis-cluster:6379"
  - name: redisPassword
    secretKeyRef:
      name: redis-secret
      key: password
  - name: enableTLS
    value: "false"
```

**Day 4: Dapr订阅配置**
```yaml
# subscription.yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: mes-events-subscription
spec:
  pubsubname: realtimebus-pubsub
  topic: mes-events
  routes:
    default: /api/realtime-databus/events/mes
---
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: iot-data-subscription
spec:
  pubsubname: realtimebus-pubsub
  topic: iot-data
  routes:
    default: /api/realtime-databus/events/iot
```

**验收标准**: 
- ✅ Dapr Pub/Sub组件注册成功
- ✅ Kafka连接测试通过
- ✅ 订阅配置生效

---

### 3.3 Day 5: 消息Topic设计与创建

**负责人**: 架构师 + 中间件工程师1

**Day 5上午: Topic规划设计**
```yaml
Topic设计方案:

业务领域Topic（按微服务划分）:
  - lowcode-events: 低代码引擎事件（32分区）
  - mes-events: MES系统事件（32分区）
  - erp-events: ERP系统事件（16分区）
  - iot-data: IoT设备数据（64分区）
  - realtime-messages: 实时通讯消息（32分区）
  - system-logs: 系统日志（16分区）

技术Topic:
  - dead-letter-queue: 死信队列（8分区）
  - retry-queue: 重试队列（8分区）
  - event-sourcing: 事件溯源存储（32分区）
  - saga-transactions: Saga事务协调（16分区）
```

**Day 5下午: 批量创建Topic**
```bash
#!/bin/bash
# create-topics.sh

KAFKA_BROKER="kafka-0:9092"

# 创建业务Topic
kubectl exec -it kafka-0 -- kafka-topics.sh \
  --create --topic lowcode-events \
  --bootstrap-server $KAFKA_BROKER \
  --partitions 32 --replication-factor 3 \
  --config retention.ms=604800000 # 7天

kubectl exec -it kafka-0 -- kafka-topics.sh \
  --create --topic mes-events \
  --bootstrap-server $KAFKA_BROKER \
  --partitions 32 --replication-factor 3

kubectl exec -it kafka-0 -- kafka-topics.sh \
  --create --topic iot-data \
  --bootstrap-server $KAFKA_BROKER \
  --partitions 64 --replication-factor 3 \
  --config compression.type=lz4

# 创建技术Topic
kubectl exec -it kafka-0 -- kafka-topics.sh \
  --create --topic dead-letter-queue \
  --bootstrap-server $KAFKA_BROKER \
  --partitions 8 --replication-factor 3

kubectl exec -it kafka-0 -- kafka-topics.sh \
  --create --topic event-sourcing \
  --bootstrap-server $KAFKA_BROKER \
  --partitions 32 --replication-factor 3 \
  --config cleanup.policy=compact # 压缩存储
```

**验收标准**: 
- ✅ 所有Topic创建成功
- ✅ 分区和副本配置正确
- ✅ Topic列表验证通过

---

## 🚀 4. Week 2 详细计划：核心消息功能开发 + 客户端SDK开发

### 4.1 Day 6-10: 消息发布订阅与路由转换

*(详细实现省略)*

---

### 4.2 Day 11-12: ⭐ 客户端SDK开发（6大核心集成组件）← **核心新增**

**负责人**: 后端开发1 + 后端开发2 + 中间件工程师1

**任务清单**:

**Day 11上午: 创建Client SDK项目**
```bash
# 创建Class Library项目
dotnet new classlib -n SmartAbp.RealtimeDataBus.Client
cd SmartAbp.RealtimeDataBus.Client

# 添加依赖包
dotnet add package Dapr.Client
dotnet add package Microsoft.Extensions.DependencyInjection
dotnet add package Microsoft.Extensions.Logging
dotnet add package System.Threading.Channels
```

**Day 11上午-下午: 组件1 - EventPublisher（事件发布器）**
```csharp
// EventPublisher.cs
using Dapr.Client;

public class EventPublisher
{
    private readonly DaprClient _daprClient;
    private readonly RealtimeDataBusOptions _options;
    private readonly ConcurrentQueue<EventMessage> _failedEvents;
    
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
}
```

**Day 11下午: 组件2 - EventSubscriber（事件订阅器）**
```csharp
public class EventSubscriber
{
    private readonly DaprClient _daprClient;
    private readonly Dictionary<string, List<Func<EventMessage, Task>>> _handlers;
    
    /// <summary>
    /// 订阅事件
    /// </summary>
    public void Subscribe<TEvent>(Func<TEvent, Task> handler)
        where TEvent : class
    {
        var eventType = typeof(TEvent).Name;
        
        if (!_handlers.ContainsKey(eventType))
        {
            _handlers[eventType] = new List<Func<EventMessage, Task>>();
        }
        
        _handlers[eventType].Add(async (eventMessage) =>
        {
            var eventData = JsonSerializer.Deserialize<TEvent>(eventMessage.EventData);
            if (eventData != null)
            {
                await handler(eventData);
            }
        });
    }
    
    /// <summary>
    /// 处理接收到的事件
    /// </summary>
    public async Task HandleEventAsync(EventMessage eventMessage)
    {
        if (_handlers.TryGetValue(eventMessage.EventType, out var handlers))
        {
            var tasks = handlers.Select(handler => handler(eventMessage));
            await Task.WhenAll(tasks);
        }
    }
}
```

**Day 12上午: 组件3-6实现**
- MessageRouter（消息路由器）
- DataFormatConverter（数据格式转换器）
- QosManager（QoS管理器）
- RealtimeDataBusClient（HTTP客户端）

**Day 12下午: 集成扩展方法**
```csharp
public static class RealtimeDataBusClientExtensions
{
    // 方式1: 零侵入式集成
    public static IServiceCollection AddRealtimeDataBusClient(
        this IServiceCollection services,
        string serviceUrl,
        string serviceName)
    {
        return services.AddRealtimeDataBusClient(options =>
        {
            options.ServiceUrl = serviceUrl;
            options.ServiceName = serviceName;
        });
    }
    
    // 方式2: 详细配置
    public static IServiceCollection AddRealtimeDataBusClient(
        this IServiceCollection services,
        Action<RealtimeDataBusOptions> configure)
    {
        services.Configure(configure);
        services.AddSingleton<EventPublisher>();
        services.AddSingleton<EventSubscriber>();
        services.AddSingleton<MessageRouter>();
        services.AddHttpClient<RealtimeDataBusClient>();
        return services;
    }
}
```

**验收标准**: 
- ✅ 6大组件编译成功
- ✅ NuGet包打包成功
- ✅ 消息吞吐量≥50,000 msg/sec
- ✅ 集成测试通过

---

## 📦 5. Week 3-5 详细计划（事件溯源、Saga事务、性能优化、测试部署）

*(后续周次计划内容省略)*

---

## ✅ 6. 总体验收清单

```yaml
Kafka集群验收:
  ✅ Broker节点: 5个全部在线
  ✅ ZooKeeper节点: 3个健康
  ✅ Topic数量: 10+
  ✅ 总分区数: 256+
  ✅ 存储容量: 10TB

消息功能验收:
  ✅ 发布订阅: 支持多Topic
  ✅ 消息路由: 基于规则智能路由
  ✅ 消息转换: 支持3种格式
  ✅ 消息持久化: 7天保留
  ✅ 死信队列: 自动重试+DLQ

客户端SDK验收:
  ✅ NuGet包发布: SmartAbp.RealtimeDataBus.Client v1.0.0
  ✅ 6大组件实现: EventPublisher等全部完成
  ✅ 3种集成方式: 零侵入/Dapr/手动API全部实现
  ✅ 消息性能: >50,000 msg/sec
  ✅ 消息可靠性: 至少一次语义

性能验收:
  ✅ 消息吞吐量: ≥100,000 msg/sec
  ✅ 端到端延迟: <10ms
  ✅ 并发消费者: ≥1,000
  ✅ 系统可用性: ≥99.99%

事件溯源验收:
  ✅ 事件存储: Event Store实现
  ✅ 事件回放: 支持时间点恢复
  ✅ 快照机制: 性能优化

Saga事务验证:
  ✅ 编排模式: Orchestration实现
  ✅ 补偿事务: 自动回滚
  ✅ 超时处理: 自动超时补偿
```

---

**文档状态**：✅ 已完成
**关联文档**：
- 09-RealtimeDataBus微服务无缝集成方案.md
- 09-RealTimeDataBus微服务详细设计文档.md
- 00-企业级微服务总体架构设计说明书.md

