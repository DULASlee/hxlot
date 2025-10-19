# IoTDataManagement微服务详细设计文档

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| 文档版本 | v1.0 |
| 创建日期 | 2025-10-19 |
| 负责人 | SmartABP架构团队 |
| 状态 | 设计阶段 |
| 架构模式 | ABP模块化 + Aspire + Dapr + Lambda架构 |

---

## 🎯 1. 系统概述

### 1.1 业务目标

IoTDataManagement微服务是SmartABP低代码引擎平台的物联网工业生产数据管理和大数据分析系统，负责：
- **设备数据采集**：实时采集工业设备运行数据
- **时序数据存储**：高效存储海量时序数据
- **流式数据处理**：实时数据清洗、转换和计算
- **批量数据分析**：离线批量数据挖掘和分析
- **数据可视化**：实时数据监控和历史数据分析

### 1.2 Lambda架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    数据源层（IoT Devices）                     │
├─────────────────────────────────────────────────────────────┤
│  工业设备   │  传感器   │  PLC控制器  │  SCADA系统  │  边缘网关 │
└──────┬──────────────┬──────────────┬──────────────┬─────────┘
       │              │              │              │
       │ (MQTT)       │ (OPC UA)     │ (Modbus)     │ (HTTP)
       │              │              │              │
┌──────▼──────────────▼──────────────▼──────────────▼─────────┐
│              数据采集层（Data Ingestion）                      │
├─────────────────────────────────────────────────────────────┤
│  边缘计算网关  │  协议转换器  │  数据预处理  │  MQTT Broker   │
└──────┬──────────────────────────────────────────────────────┘
       │
       │ (Kafka Producer)
       │
┌──────▼──────────────────────────────────────────────────────┐
│                数据流层（Apache Kafka）                        │
├─────────────────────────────────────────────────────────────┤
│  Topic: iot.device.raw（原始数据）                            │
│  Topic: iot.device.processed（处理后数据）                    │
│  Topic: iot.device.alert（告警数据）                          │
└──────┬────────────┬─────────────────────────────────────────┘
       │            │
       │ Speed      │ Batch
       │ Layer      │ Layer
       │            │
┌──────▼────────┐  ┌▼──────────────────────────────────────────┐
│  流处理层      │  │        批处理层                             │
│ (Speed Layer) │  │    (Batch Layer)                          │
├───────────────┤  ├───────────────────────────────────────────┤
│ Apache Flink  │  │ Apache Hadoop + Spark                     │
│ 实时计算引擎  │  │ 离线批量分析引擎                            │
│               │  │                                            │
│ - 实时聚合    │  │ - 历史数据统计                              │
│ - 实时告警    │  │ - 数据挖掘分析                              │
│ - 流式ETL     │  │ - 机器学习训练                              │
│ - CEP规则引擎 │  │ - 批量预测                                 │
└──────┬────────┘  └┬──────────────────────────────────────────┘
       │            │
       │            │
┌──────▼────────────▼─────────────────────────────────────────┐
│              服务层（Serving Layer）                           │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ 实时视图        │  │ 批处理视图      │  │ 统一查询API   │  │
│  │ (Real-time)    │  │ (Batch)        │  │ (Unified API) │  │
│  │ InfluxDB       │  │ PostgreSQL     │  │ GraphQL       │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 核心价值

```yaml
业务价值:
  实时监控: 设备运行状态实时监控，故障及时发现
  预测性维护: 基于历史数据预测设备故障，提前维护
  生产优化: 数据驱动的生产流程优化
  能耗管理: 能源消耗监控和优化
  质量追溯: 完整的生产数据追溯

技术价值:
  海量数据处理: 支持百万级设备，亿级数据量
  实时性: 毫秒级数据采集和处理
  可扩展性: 横向扩展支持业务增长
  高可用性: 99.99%系统可用性
  智能分析: 机器学习驱动的数据分析
```

---

## 🏗️ 2. 架构设计

### 2.1 整体架构（Lambda架构）

Lambda架构由三个核心层组成：

**Speed Layer（速度层）**：
- 实时流处理（Apache Flink）
- 低延迟（毫秒级）
- 近期数据（最近24小时）
- 实时视图（InfluxDB）

**Batch Layer（批处理层）**：
- 离线批处理（Hadoop + Spark）
- 高吞吐量
- 历史数据（全量数据）
- 批处理视图（PostgreSQL + HDFS）

**Serving Layer（服务层）**：
- 统一查询接口
- 合并实时视图和批处理视图
- 提供统一数据服务

### 2.2 技术架构分层（ABP DDD架构）

```yaml
架构分层:
  
  表现层（Presentation）:
    - IoTDataManagement.HttpApi:
      - DeviceController: 设备管理API
      - DataQueryController: 数据查询API
      - AlertController: 告警管理API
      - AnalyticsController: 数据分析API
    - IoTDataManagement.Web:
      - Vue3可视化监控台
    
  应用层（Application）:
    - IoTDataManagement.Application:
      - DeviceAppService: 设备管理服务
      - DataIngestionAppService: 数据采集服务
      - DataQueryAppService: 数据查询服务
      - StreamProcessingAppService: 流处理服务
      - BatchProcessingAppService: 批处理服务
      - AnalyticsAppService: 数据分析服务
      - AlertAppService: 告警管理服务
      
  领域层（Domain）:
    - IoTDataManagement.Domain:
      - Aggregates:
        - IoTDevice: IoT设备聚合根
        - DataStream: 数据流聚合根
        - Alert: 告警聚合根
        - AnalyticsJob: 分析任务聚合根
      - DomainServices:
        - DeviceManagementDomainService
        - DataProcessingDomainService
        - AlertRuleDomainService
      - DomainEvents:
        - DeviceDataReceivedEvent
        - DeviceOfflineEvent
        - AlertTriggeredEvent
        
  基础设施层（Infrastructure）:
    - IoTDataManagement.Kafka: Kafka集成
    - IoTDataManagement.Flink: Flink流处理
    - IoTDataManagement.Hadoop: Hadoop批处理
    - IoTDataManagement.InfluxDB: 时序数据库
    - IoTDataManagement.TimescaleDB: 时序数据库
    - IoTDataManagement.EntityFrameworkCore: EF Core持久化
```

---

## 💻 3. 技术栈

### 3.1 核心技术栈

```yaml
数据采集:
  - MQTT: 物联网通信协议
  - OPC UA: 工业自动化协议
  - Modbus: 工业现场总线协议
  - 边缘计算网关: EMQ X / ThingsBoard
  
消息队列:
  - Apache Kafka: 分布式流处理平台
  - Kafka Connect: 数据集成框架
  - Kafka Streams: 流处理库
  
流处理:
  - Apache Flink: 实时流处理引擎
  - Flink SQL: SQL流处理
  - Flink CEP: 复杂事件处理
  
批处理:
  - Apache Hadoop: 分布式存储和计算
  - Apache Spark: 大数据处理引擎
  - Spark SQL: SQL批处理
  - Spark MLlib: 机器学习库
  
时序数据库:
  - InfluxDB 2.x: 高性能时序数据库
  - TimescaleDB: PostgreSQL时序扩展
  
大数据存储:
  - HDFS: Hadoop分布式文件系统
  - Apache Parquet: 列式存储格式
  - PostgreSQL: 关系型数据库
  
微服务框架:
  - .NET 8.0
  - ABP Framework 8.0
  - Aspire
  - Dapr 1.12
```

---

## 🔧 4. 核心功能

### 4.1 设备管理

```csharp
/// <summary>
/// IoT设备聚合根
/// </summary>
public class IoTDevice : AggregateRoot<Guid>, IMultiTenant
{
    public Guid? TenantId { get; protected set; }
    
    /// <summary>
    /// 设备编号
    /// </summary>
    public string DeviceCode { get; set; }
    
    /// <summary>
    /// 设备名称
    /// </summary>
    public string DeviceName { get; set; }
    
    /// <summary>
    /// 设备类型
    /// </summary>
    public DeviceType Type { get; set; }
    
    /// <summary>
    /// 通信协议
    /// </summary>
    public string Protocol { get; set; }
    
    /// <summary>
    /// 设备状态
    /// </summary>
    public DeviceStatus Status { get; set; }
    
    /// <summary>
    /// 最后在线时间
    /// </summary>
    public DateTime? LastOnlineTime { get; set; }
    
    /// <summary>
    /// 设备属性（JSON）
    /// </summary>
    public string PropertiesJson { get; set; }
    
    /// <summary>
    /// 数据点配置（JSON）
    /// </summary>
    public string DataPointsJson { get; set; }
}

/// <summary>
/// 设备类型
/// </summary>
public enum DeviceType
{
    Sensor = 1,        // 传感器
    PLC = 2,           // 可编程逻辑控制器
    SCADA = 3,         // 数据采集与监视控制系统
    Robot = 4,         // 机器人
    CNC = 5,           // 数控机床
    EdgeGateway = 6    // 边缘网关
}

/// <summary>
/// 设备状态
/// </summary>
public enum DeviceStatus
{
    Online = 1,    // 在线
    Offline = 2,   // 离线
    Fault = 3,     // 故障
    Maintenance = 4 // 维护中
}
```

### 4.2 实时数据采集

```csharp
/// <summary>
/// 数据采集服务
/// </summary>
public class DataIngestionAppService : ApplicationService, IDataIngestionAppService
{
    private readonly IProducer<string, DeviceDataMessage> _kafkaProducer;
    private readonly IDistributedEventBus _eventBus;
    private readonly ILogger<DataIngestionAppService> _logger;
    
    /// <summary>
    /// 接收设备数据
    /// </summary>
    public async Task IngestDataAsync(DeviceDataDto data)
    {
        // 数据验证
        await ValidateDataAsync(data);
        
        // 构造Kafka消息
        var message = new DeviceDataMessage
        {
            DeviceId = data.DeviceId,
            Timestamp = data.Timestamp,
            DataPoints = data.DataPoints,
            TenantId = CurrentTenant.Id
        };
        
        // 发送到Kafka
        await _kafkaProducer.ProduceAsync(
            "iot.device.raw",
            new Message<string, DeviceDataMessage>
            {
                Key = data.DeviceId.ToString(),
                Value = message
            });
        
        // 发布领域事件
        await _eventBus.PublishAsync(new DeviceDataReceivedEvent
        {
            DeviceId = data.DeviceId,
            Timestamp = data.Timestamp,
            TenantId = CurrentTenant.Id
        });
        
        _logger.LogInformation(
            "设备数据已采集: DeviceId={DeviceId}, Timestamp={Timestamp}",
            data.DeviceId,
            data.Timestamp);
    }
    
    /// <summary>
    /// 批量接收设备数据
    /// </summary>
    public async Task BatchIngestDataAsync(List<DeviceDataDto> dataList)
    {
        var messages = dataList.Select(data => new Message<string, DeviceDataMessage>
        {
            Key = data.DeviceId.ToString(),
            Value = new DeviceDataMessage
            {
                DeviceId = data.DeviceId,
                Timestamp = data.Timestamp,
                DataPoints = data.DataPoints,
                TenantId = CurrentTenant.Id
            }
        }).ToList();
        
        // 批量发送到Kafka
        await _kafkaProducer.ProduceAsync("iot.device.raw", messages);
        
        _logger.LogInformation(
            "批量设备数据已采集: Count={Count}",
            dataList.Count);
    }
}
```

### 4.3 实时流处理（Apache Flink）

```java
// Flink流处理Job示例（Java）
public class DeviceDataStreamJob {
    
    public static void main(String[] args) throws Exception {
        // 创建执行环境
        StreamExecutionEnvironment env = 
            StreamExecutionEnvironment.getExecutionEnvironment();
        
        // 配置Kafka源
        FlinkKafkaConsumer<DeviceDataMessage> kafkaSource = 
            new FlinkKafkaConsumer<>(
                "iot.device.raw",
                new DeviceDataMessageDeserializer(),
                properties);
        
        // 创建数据流
        DataStream<DeviceDataMessage> stream = env.addSource(kafkaSource);
        
        // 数据清洗和转换
        DataStream<ProcessedDeviceData> processedStream = stream
            .filter(data -> data.getDataPoints() != null)
            .map(new DataCleansingFunction())
            .keyBy(ProcessedDeviceData::getDeviceId);
        
        // 实时聚合（1分钟滚动窗口）
        DataStream<DeviceAggregation> aggregatedStream = processedStream
            .timeWindowAll(Time.minutes(1))
            .aggregate(new DeviceAggregationFunction());
        
        // 实时告警检测
        DataStream<Alert> alertStream = processedStream
            .filter(data -> checkAlertRules(data))
            .map(new AlertGenerationFunction());
        
        // 写入InfluxDB（实时视图）
        aggregatedStream.addSink(new InfluxDBSink<>());
        
        // 写入Kafka（告警主题）
        alertStream.addSink(new FlinkKafkaProducer<>(
            "iot.device.alert",
            new AlertSerializer(),
            properties));
        
        // 启动执行
        env.execute("Device Data Stream Processing Job");
    }
}
```

```csharp
// .NET侧Flink Job管理服务
public class StreamProcessingAppService : ApplicationService, IStreamProcessingAppService
{
    private readonly IFlinkJobManager _flinkJobManager;
    
    /// <summary>
    /// 提交Flink作业
    /// </summary>
    public async Task<FlinkJobDto> SubmitJobAsync(SubmitFlinkJobDto input)
    {
        var job = await _flinkJobManager.SubmitJobAsync(new FlinkJob
        {
            Name = input.JobName,
            MainClass = "com.smartabp.iot.DeviceDataStreamJob",
            JarPath = input.JarPath,
            Arguments = input.Arguments,
            Parallelism = input.Parallelism
        });
        
        return ObjectMapper.Map<FlinkJob, FlinkJobDto>(job);
    }
    
    /// <summary>
    /// 停止Flink作业
    /// </summary>
    public async Task StopJobAsync(string jobId)
    {
        await _flinkJobManager.CancelJobAsync(jobId);
    }
}
```

### 4.4 批量数据分析（Apache Spark）

```scala
// Spark批处理Job示例（Scala）
object DeviceDataBatchJob {
  
  def main(args: Array[String]): Unit = {
    // 创建Spark会话
    val spark = SparkSession.builder()
      .appName("Device Data Batch Analysis")
      .config("spark.master", "yarn")
      .getOrCreate()
    
    // 读取HDFS历史数据
    val deviceData = spark.read
      .parquet("hdfs://namenode:9000/data/iot/device_data")
    
    // 数据清洗
    val cleanedData = deviceData
      .filter($"dataPoints".isNotNull)
      .na.drop()
    
    // 设备运行时长统计
    val deviceUptime = cleanedData
      .groupBy("deviceId", "date")
      .agg(
        count("*").as("dataCount"),
        (max("timestamp") - min("timestamp")).as("uptimeSeconds")
      )
    
    // 能耗分析
    val energyConsumption = cleanedData
      .filter($"dataPointType" === "energy")
      .groupBy("deviceId", "date")
      .agg(sum("value").as("totalEnergy"))
    
    // 设备故障预测（机器学习）
    val featureData = prepareFeatures(cleanedData)
    val model = MLlib.loadModel("hdfs://namenode:9000/models/device_fault_prediction")
    val predictions = model.transform(featureData)
    
    // 写入PostgreSQL（批处理视图）
    deviceUptime.write
      .mode("append")
      .jdbc(jdbcUrl, "device_uptime", jdbcProperties)
    
    energyConsumption.write
      .mode("append")
      .jdbc(jdbcUrl, "device_energy", jdbcProperties)
    
    predictions.write
      .mode("append")
      .jdbc(jdbcUrl, "device_predictions", jdbcProperties)
    
    spark.stop()
  }
}
```

```csharp
// .NET侧Spark Job管理服务
public class BatchProcessingAppService : ApplicationService, IBatchProcessingAppService
{
    private readonly ISparkJobManager _sparkJobManager;
    
    /// <summary>
    /// 提交Spark作业
    /// </summary>
    public async Task<SparkJobDto> SubmitJobAsync(SubmitSparkJobDto input)
    {
        var job = await _sparkJobManager.SubmitJobAsync(new SparkJob
        {
            Name = input.JobName,
            MainClass = "com.smartabp.iot.DeviceDataBatchJob",
            JarPath = input.JarPath,
            Arguments = input.Arguments,
            Master = "yarn",
            Executors = input.Executors,
            ExecutorMemory = input.ExecutorMemory,
            ExecutorCores = input.ExecutorCores
        });
        
        return ObjectMapper.Map<SparkJob, SparkJobDto>(job);
    }
}
```

### 4.5 统一数据查询服务

```csharp
/// <summary>
/// 数据查询服务（合并实时视图和批处理视图）
/// </summary>
public class DataQueryAppService : ApplicationService, IDataQueryAppService
{
    private readonly IInfluxDBClient _influxClient;  // 实时视图
    private readonly IRepository<DeviceUptime, Guid> _uptimeRepository;  // 批处理视图
    private readonly IDistributedCache<DeviceDataCacheItem> _cache;
    
    /// <summary>
    /// 查询设备实时数据
    /// </summary>
    public async Task<DeviceRealtimeDataDto> GetRealtimeDataAsync(Guid deviceId)
    {
        // 从InfluxDB查询最近1小时的实时数据
        var query = $"from(bucket: \"iot_data\") " +
                    $"|> range(start: -1h) " +
                    $"|> filter(fn: (r) => r.deviceId == \"{deviceId}\")";
        
        var tables = await _influxClient.GetQueryApi().QueryAsync(query);
        
        // 转换为DTO
        var dataPoints = new List<DataPointDto>();
        tables.ForEach(table =>
        {
            table.Records.ForEach(record =>
            {
                dataPoints.Add(new DataPointDto
                {
                    Timestamp = record.GetTime(),
                    Field = record.GetField(),
                    Value = record.GetValue()
                });
            });
        });
        
        return new DeviceRealtimeDataDto
        {
            DeviceId = deviceId,
            DataPoints = dataPoints
        };
    }
    
    /// <summary>
    /// 查询设备历史数据（合并实时视图和批处理视图）
    /// </summary>
    public async Task<DeviceHistoricalDataDto> GetHistoricalDataAsync(
        Guid deviceId,
        DateTime startTime,
        DateTime endTime)
    {
        var now = Clock.Now;
        var realtimeBoundary = now.AddHours(-24);  // 24小时以内为实时数据
        
        var result = new DeviceHistoricalDataDto
        {
            DeviceId = deviceId,
            StartTime = startTime,
            EndTime = endTime
        };
        
        // 如果查询时间范围包含实时数据
        if (endTime > realtimeBoundary)
        {
            var realtimeStart = startTime > realtimeBoundary ? startTime : realtimeBoundary;
            var realtimeData = await GetRealtimeDataFromInfluxDBAsync(
                deviceId,
                realtimeStart,
                endTime);
            result.RealtimeData = realtimeData;
        }
        
        // 如果查询时间范围包含历史数据
        if (startTime < realtimeBoundary)
        {
            var historicalEnd = endTime < realtimeBoundary ? endTime : realtimeBoundary;
            var historicalData = await GetHistoricalDataFromPostgreSQLAsync(
                deviceId,
                startTime,
                historicalEnd);
            result.HistoricalData = historicalData;
        }
        
        return result;
    }
    
    /// <summary>
    /// 查询设备聚合统计数据
    /// </summary>
    public async Task<DeviceAggregationDto> GetAggregationAsync(
        Guid deviceId,
        DateTime startTime,
        DateTime endTime,
        AggregationType aggregationType)
    {
        // 从批处理视图查询聚合数据
        var uptimeData = await _uptimeRepository
            .GetQueryableAsync()
            .Where(u => u.DeviceId == deviceId &&
                        u.Date >= startTime.Date &&
                        u.Date <= endTime.Date)
            .ToListAsync();
        
        return new DeviceAggregationDto
        {
            DeviceId = deviceId,
            TotalUptime = uptimeData.Sum(u => u.UptimeSeconds),
            TotalDataCount = uptimeData.Sum(u => u.DataCount),
            AverageUptime = uptimeData.Average(u => u.UptimeSeconds)
        };
    }
}
```

### 4.6 复杂事件处理（Flink CEP）

```java
// Flink CEP规则引擎示例
public class DeviceAlertCEPJob {
    
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = 
            StreamExecutionEnvironment.getExecutionEnvironment();
        
        // 数据流
        DataStream<DeviceDataMessage> stream = env.addSource(kafkaSource);
        
        // 定义CEP模式：连续3次温度超过阈值
        Pattern<DeviceDataMessage, ?> highTempPattern = Pattern
            .<DeviceDataMessage>begin("first")
            .where(new TemperatureHighCondition())
            .next("second")
            .where(new TemperatureHighCondition())
            .next("third")
            .where(new TemperatureHighCondition())
            .within(Time.minutes(5));
        
        // 应用CEP模式
        PatternStream<DeviceDataMessage> patternStream = CEP.pattern(
            stream.keyBy(DeviceDataMessage::getDeviceId),
            highTempPattern);
        
        // 检测到模式后生成告警
        DataStream<Alert> alerts = patternStream.select(
            new PatternSelectFunction<DeviceDataMessage, Alert>() {
                @Override
                public Alert select(Map<String, List<DeviceDataMessage>> pattern) {
                    List<DeviceDataMessage> matches = pattern.get("third");
                    DeviceDataMessage lastEvent = matches.get(0);
                    
                    return Alert.builder()
                        .deviceId(lastEvent.getDeviceId())
                        .alertType("HIGH_TEMPERATURE")
                        .severity(AlertSeverity.HIGH)
                        .message("设备温度连续3次超过阈值")
                        .timestamp(System.currentTimeMillis())
                        .build();
                }
            });
        
        // 发送告警到Kafka
        alerts.addSink(new FlinkKafkaProducer<>("iot.device.alert", ...));
        
        env.execute("Device Alert CEP Job");
    }
}
```

---

## 📡 5. API接口设计

### 5.1 设备管理API

```csharp
[Route("api/iot-data-management/devices")]
[ApiController]
[Authorize]
public class DevicesController : AbpController
{
    private readonly IDeviceAppService _deviceService;
    
    [HttpGet]
    public async Task<PagedResultDto<IoTDeviceDto>> GetListAsync(
        [FromQuery] DeviceQueryDto input)
    {
        return await _deviceService.GetListAsync(input);
    }
    
    [HttpPost]
    public async Task<IoTDeviceDto> CreateAsync([FromBody] CreateDeviceDto input)
    {
        return await _deviceService.CreateAsync(input);
    }
    
    [HttpGet("{id}/realtime-data")]
    public async Task<DeviceRealtimeDataDto> GetRealtimeDataAsync(Guid id)
    {
        return await _deviceService.GetRealtimeDataAsync(id);
    }
}
```

---

## 📊 6. 数据模型

### 6.1 时序数据模型（InfluxDB）

```
Measurement: device_data
Tags:
  - device_id: 设备ID
  - device_type: 设备类型
  - tenant_id: 租户ID
Fields:
  - temperature: 温度
  - pressure: 压力
  - speed: 速度
  - energy: 能耗
  - status: 状态
Timestamp: 时间戳（纳秒精度）
```

---

## 🚀 7. 部署方案

### 7.1 Kubernetes部署（完整集群）

```yaml
# Kafka集群
apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: iot-kafka-cluster
spec:
  kafka:
    version: 3.5.0
    replicas: 3
    listeners:
      - name: plain
        port: 9092
        type: internal
        tls: false
    config:
      offsets.topic.replication.factor: 3
      transaction.state.log.replication.factor: 3
      default.replication.factor: 3
    storage:
      type: jbod
      volumes:
      - id: 0
        type: persistent-claim
        size: 100Gi
  zookeeper:
    replicas: 3
    storage:
      type: persistent-claim
      size: 10Gi

---

# Flink集群
apiVersion: flink.apache.org/v1beta1
kind: FlinkDeployment
metadata:
  name: iot-flink-cluster
spec:
  image: flink:1.17
  flinkVersion: v1_17
  flinkConfiguration:
    taskmanager.numberOfTaskSlots: "4"
  serviceAccount: flink
  jobManager:
    resource:
      memory: "2048m"
      cpu: 2
  taskManager:
    resource:
      memory: "4096m"
      cpu: 4
    replicas: 3

---

# InfluxDB
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: influxdb
spec:
  serviceName: "influxdb"
  replicas: 1
  selector:
    matchLabels:
      app: influxdb
  template:
    metadata:
      labels:
        app: influxdb
    spec:
      containers:
      - name: influxdb
        image: influxdb:2.7
        ports:
        - containerPort: 8086
        volumeMounts:
        - name: data
          mountPath: /var/lib/influxdb2
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 100Gi
```

---

## 📈 8. 性能指标

```yaml
数据采集性能:
  吞吐量: ≥1,000,000 条/秒
  延迟: <10ms（端到端）
  支持设备数: ≥1,000,000
  
流处理性能:
  Flink吞吐量: ≥500,000 事件/秒
  处理延迟: <100ms
  窗口聚合延迟: <1秒
  
批处理性能:
  Spark处理量: ≥1TB/小时
  历史数据查询: <3秒
  
存储性能:
  InfluxDB写入: ≥500,000 点/秒
  InfluxDB查询: <100ms
  HDFS存储: PB级
```

---

## ✅ 9. 验收标准

```yaml
功能验收:
  ✅ 支持百万级设备接入
  ✅ 实时数据采集和处理
  ✅ 历史数据批量分析
  ✅ 复杂事件处理和告警
  ✅ 统一数据查询API

性能验收:
  ✅ 数据采集吞吐量 ≥1,000,000 条/秒
  ✅ 流处理延迟 <100ms
  ✅ 批处理性能 ≥1TB/小时
  ✅ 查询响应时间 <3秒
```

---

**文档状态**：✅ 已完成
**下一步**：开始实现开发

