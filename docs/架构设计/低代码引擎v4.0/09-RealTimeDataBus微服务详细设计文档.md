# RealTimeDataBus微服务详细设计文档 v1.0

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| 微服务名称 | RealTimeDataBus.Service |
| 文档版本 | v1.0 |
| 创建日期 | 2025-10-19 |
| 技术栈 | Apache Kafka + Kafka Streams + .NET 8 + Dapr |

---


---

## 📖 无缝集成方案说明（⭐ v1.1新增）

本文档为实时数据总线微服务的详细技术设计文档。关于客户端SDK的无缝集成方案（6大核心组件 + 3种集成方式），请参阅：

**👉 [09-RealtimeDataBus微服务无缝集成方案.md](./09-RealtimeDataBus微服务无缝集成方案.md)**

**核心亮点**：
- ✅ **零侵入式集成**：一行代码完成实时数据总线集成
- ✅ **多协议支持**：Redis Stream + Kafka + RabbitMQ
- ✅ **高性能消息**：>50,000 msg/sec吞吐量
- ✅ **智能路由**：基于规则的消息路由
- ✅ **数据转换**：自动格式转换（JSON/Protobuf/Avro）
- ✅ **QoS保证**：消息可靠性和顺序性保证

**客户端SDK组件（SmartAbp.DataBus.Client）**：
1. **DataBusPublisher**：数据总线发布器（多协议发布）
2. **DataBusSubscriber**：数据总线订阅器（多协议订阅）
3. **MessageRouter**：消息路由器（智能路由）
4. **DataFormatConverter**：数据格式转换器（格式转换）
5. **QosManager**：QoS管理器（服务质量保证）
6. **DataBusClient**：HTTP客户端（RESTful API封装）

**3种集成方式**：
- **方式1（推荐）**：`builder.Services.AddRealtimeDataBusClient(serviceUrl, serviceName)` - 零侵入式
- **方式2（企业级）**：`options` 精细化配置
- **方式3（手动）**：直接使用 `RealtimeDataBusClient` API

详细的集成代码示例、API文档、架构图，请参阅无缝集成方案文档。

---
## 🎯 1. 系统概述

### 1.1 业务定位

实时数据总线微服务是SmartABP平台的统一数据传输中枢：
- 🚀 **实时数据采集**：支持多数据源实时采集
- 📡 **数据路由分发**：基于规则的智能路由
- 🔄 **数据转换**：数据格式转换和富化
- 📊 **数据质量监控**：实时数据质量检查
- ⚡ **背压处理**：智能流量控制

### 1.2 核心价值

```yaml
业务价值:
  实时性: 端到端延迟<10ms
  可靠性: 至少一次消息语义
  扩展性: 支持水平扩展
  高吞吐: ≥1,000,000 消息/秒

技术价值:
  统一总线: 所有微服务数据传输
  解耦能力: 发布/订阅模式
  流处理: Kafka Streams实时计算
  监控完善: 全链路追踪
```

---

## 🏗️ 2. 系统架构设计

### 2.1 分层架构

```
┌────────────────────────────────────────────────────────┐
│           数据生产者层（Data Producers）                 │
├────────────────────────────────────────────────────────┤
│  MES  │  ERP  │  IoT  │  日志  │  实时通信  │  第三方   │
└────┬───────┬────────┬────────┬──────────┬─────────────┘
     │       │        │        │          │
     │       │        │        │          │
┌────▼───────▼────────▼────────▼──────────▼─────────────┐
│         数据采集层（Data Collection Layer）              │
├────────────────────────────────────────────────────────┤
│  Filebeat │  Logstash │  自定义采集器  │  Dapr Pub/Sub │
└────┬───────┬────────┬────────┬──────────┬─────────────┘
     │       │        │        │          │
┌────▼───────▼────────▼────────▼──────────▼─────────────┐
│              Kafka Cluster（核心消息总线）               │
├────────────────────────────────────────────────────────┤
│  Topic: mes-events                                     │
│  Topic: iot-data                                       │
│  Topic: system-logs                                    │
│  Topic: realtime-messages                              │
│  Partitions: 32 │ Replication: 3 │ Retention: 7天     │
└────┬───────┬────────┬────────┬──────────┬─────────────┘
     │       │        │        │          │
┌────▼───────▼────────▼────────▼──────────▼─────────────┐
│         流处理层（Stream Processing Layer）              │
├────────────────────────────────────────────────────────┤
│  Kafka Streams  │  数据转换  │  数据富化  │  质量检查  │
└────┬───────┬────────┬────────┬──────────┬─────────────┘
     │       │        │        │          │
┌────▼───────▼────────▼────────▼──────────▼─────────────┐
│           数据消费者层（Data Consumers）                 │
├────────────────────────────────────────────────────────┤
│  实时分析  │  数据仓库  │  告警系统  │  第三方系统     │
└────────────────────────────────────────────────────────┘
```

### 2.2 Kafka集群配置

```yaml
Kafka Cluster:
  节点数: 5个（3 Broker + 2 ZooKeeper）
  配置:
    - Broker 1-3: 16C/64GB
    - ZooKeeper 1-2: 8C/32GB
  
  存储:
    - 每Broker: 2TB SSD
    - 总存储: 6TB
  
  性能:
    - 吞吐量: 1,000,000 消息/秒
    - 延迟: <10ms
    - 可用性: 99.99%
```

---

## 💻 3. 核心功能实现

### 3.1 数据采集服务

```csharp
public class DataCollectionService : IDataCollectionService, ITransientDependency
{
    private readonly IProducer<string, byte[]> _producer;
    
    public async Task PublishAsync<T>(string topic, string key, T data)
    {
        try
        {
            // 1. 数据序列化
            var serialized = JsonSerializer.SerializeToUtf8Bytes(data);
            
            // 2. 构建消息
            var message = new Message<string, byte[]>
            {
                Key = key,
                Value = serialized,
                Headers = new Headers
                {
                    { "source", Encoding.UTF8.GetBytes("SmartABP") },
                    { "timestamp", Encoding.UTF8.GetBytes(DateTime.UtcNow.ToString("o")) },
                    { "version", Encoding.UTF8.GetBytes("1.0") }
                }
            };
            
            // 3. 发送到Kafka
            var result = await _producer.ProduceAsync(topic, message);
            
            _logger.LogInformation(
                "消息已发送 - Topic: {Topic}, Partition: {Partition}, Offset: {Offset}",
                result.Topic, result.Partition.Value, result.Offset.Value
            );
        }
        catch (ProduceException<string, byte[]> ex)
        {
            _logger.LogError(ex, "消息发送失败 - Topic: {Topic}, Key: {Key}", topic, key);
            throw;
        }
    }
}
```

### 3.2 数据路由服务

```csharp
public class DataRoutingService : IDataRoutingService, ITransientDependency
{
    private readonly IConsumer<string, byte[]> _consumer;
    private readonly IRoutingRuleEngine _ruleEngine;
    
    public async Task StartRoutingAsync(CancellationToken cancellationToken)
    {
        _consumer.Subscribe(new[] { "raw-data" });
        
        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                var result = _consumer.Consume(cancellationToken);
                
                // 1. 解析消息
                var data = JsonSerializer.Deserialize<Dictionary<string, object>>(result.Message.Value);
                
                // 2. 匹配路由规则
                var routes = await _ruleEngine.MatchRoutesAsync(data);
                
                // 3. 分发到目标Topic
                foreach (var route in routes)
                {
                    await PublishToTargetAsync(route.TargetTopic, result.Message);
                }
                
                // 4. 提交Offset
                _consumer.Commit(result);
            }
            catch (ConsumeException ex)
            {
                _logger.LogError(ex, "消息消费失败");
            }
        }
    }
}
```

### 3.3 流处理服务（Kafka Streams）

```csharp
public class StreamProcessingService : IStreamProcessingService, ISingletonDependency
{
    public void StartProcessing()
    {
        var config = new StreamsConfig
        {
            ApplicationId = "smartabp-stream-processor",
            BootstrapServers = "kafka1:9092,kafka2:9092,kafka3:9092"
        };
        
        var builder = new StreamsBuilder();
        
        // 1. 数据清洗：过滤无效数据
        var cleanedStream = builder.Stream<string, string>("raw-events")
            .Filter((key, value) => !string.IsNullOrEmpty(value))
            .MapValues(value =>
            {
                var data = JsonSerializer.Deserialize<Dictionary<string, object>>(value);
                // 清洗逻辑
                return JsonSerializer.Serialize(data);
            });
        
        // 2. 数据富化：添加元数据
        var enrichedStream = cleanedStream
            .MapValues(async value =>
            {
                var data = JsonSerializer.Deserialize<Dictionary<string, object>>(value);
                
                // 添加地理位置信息
                if (data.ContainsKey("deviceId"))
                {
                    var location = await _locationService.GetLocationAsync(data["deviceId"].ToString());
                    data["latitude"] = location.Latitude;
                    data["longitude"] = location.Longitude;
                }
                
                return JsonSerializer.Serialize(data);
            });
        
        // 3. 数据聚合：窗口聚合
        var aggregatedStream = enrichedStream
            .GroupByKey()
            .WindowedBy(TimeWindows.Of(TimeSpan.FromMinutes(5)))
            .Aggregate(
                () => new AggregateData(),
                (key, value, aggregate) => aggregate.Add(value)
            );
        
        // 4. 输出到目标Topic
        enrichedStream.To("processed-events");
        aggregatedStream.ToStream().To("aggregated-events");
        
        // 5. 启动流处理
        var streams = new KafkaStreams(builder.Build(), config);
        streams.Start();
    }
}
```

### 3.4 背压处理

```csharp
public class BackPressureHandler : IBackPressureHandler, ITransientDependency
{
    private readonly SemaphoreSlim _throttle;
    private readonly IRateLimiter _rateLimiter;
    
    public BackPressureHandler()
    {
        _throttle = new SemaphoreSlim(1000); // 最大并发1000
        _rateLimiter = new SlidingWindowRateLimiter(
            permitLimit: 10000,      // 10000个令牌
            window: TimeSpan.FromSeconds(1) // 每秒
        );
    }
    
    public async Task<bool> TryAcquireAsync(CancellationToken cancellationToken)
    {
        // 1. 速率限制
        if (!await _rateLimiter.AcquireAsync(cancellationToken))
        {
            _logger.LogWarning("速率限制触发，丢弃消息");
            return false;
        }
        
        // 2. 并发限制
        await _throttle.WaitAsync(cancellationToken);
        
        return true;
    }
    
    public void Release()
    {
        _throttle.Release();
    }
}
```

---

## 📊 4. 数据模型设计

### 4.1 消息格式标准

```json
{
  "header": {
    "messageId": "uuid",
    "source": "SmartABP.MES",
    "timestamp": "2025-10-19T10:30:00Z",
    "version": "1.0",
    "traceId": "trace-uuid"
  },
  "body": {
    "eventType": "ProductionOrderCreated",
    "data": {
      "orderNo": "PO20251019001",
      "productCode": "P001",
      "quantity": 1000
    }
  },
  "metadata": {
    "tags": ["production", "high-priority"],
    "ttl": 86400
  }
}
```

### 4.2 Topic设计规范

```yaml
Topic命名规范:
  格式: {domain}.{entity}.{action}
  示例:
    - mes.production.order.created
    - iot.device.data.received
    - log.system.error.logged
  
Partition策略:
  - 按业务Key分区（保证顺序性）
  - Partition数量: 32个（可扩展）
  
Replication策略:
  - Replication Factor: 3
  - Min In-Sync Replicas: 2
  
Retention策略:
  - 实时数据: 7天
  - 日志数据: 30天
  - 归档数据: 永久（HDFS）
```

---

## 🚀 5. 性能优化

### 5.1 批量处理

```csharp
public class BatchProducer : IBatchProducer, ITransientDependency
{
    private readonly IProducer<string, byte[]> _producer;
    private readonly List<Message<string, byte[]>> _buffer = new();
    private readonly Timer _flushTimer;
    
    public BatchProducer()
    {
        // 每100ms或100条消息批量发送
        _flushTimer = new Timer(async _ => await FlushAsync(), null, TimeSpan.FromMilliseconds(100), TimeSpan.FromMilliseconds(100));
    }
    
    public async Task AddAsync(string topic, string key, byte[] value)
    {
        _buffer.Add(new Message<string, byte[]> { Key = key, Value = value });
        
        if (_buffer.Count >= 100)
        {
            await FlushAsync();
        }
    }
    
    private async Task FlushAsync()
    {
        if (_buffer.Count == 0) return;
        
        var batch = _buffer.ToArray();
        _buffer.Clear();
        
        // 批量发送
        var tasks = batch.Select(msg => _producer.ProduceAsync("topic", msg));
        await Task.WhenAll(tasks);
    }
}
```

### 5.2 压缩优化

```csharp
var config = new ProducerConfig
{
    BootstrapServers = "kafka1:9092",
    CompressionType = CompressionType.Lz4, // LZ4压缩（速度快）
    BatchSize = 16384,                     // 16KB批量
    LingerMs = 10,                         // 等待10ms聚合批量
    Acks = Acks.Leader                     // 仅Leader确认
};
```

---

## 📈 6. 监控告警

### 6.1 关键指标

```yaml
Kafka指标:
  - Broker CPU/内存使用率
  - 磁盘IO
  - 网络吞吐量
  - Leader选举次数
  
Topic指标:
  - 消息生产速率
  - 消息消费速率
  - 消息堆积数
  - 消费者Lag
  
性能指标:
  - 端到端延迟（P50/P95/P99）
  - 吞吐量（消息/秒）
  - 错误率
```

### 6.2 告警规则

```yaml
告警级别1（Critical）:
  - Broker下线
  - 消费者Lag > 1,000,000
  - 磁盘使用率 > 90%
  
告警级别2（Warning）:
  - 消息堆积 > 100,000
  - 延迟P95 > 50ms
  - 错误率 > 1%
```

---

## ✅ 7. 验收标准

```yaml
功能验收:
  ✅ 数据采集功能正常
  ✅ 数据路由功能正常
  ✅ 流处理功能正常
  ✅ 背压处理正常
  
性能验收:
  ✅ 吞吐量 ≥1,000,000 消息/秒
  ✅ 延迟 <10ms
  ✅ 可用性 ≥99.99%
  ✅ 数据不丢失（至少一次）
  
质量验收:
  ✅ 代码质量 ≥95分
  ✅ 文档完整性 100%
```

---

**文档状态**：✅ 已完成
**关联文档**：00-企业级微服务总体架构设计说明书.md

