# LogManagement微服务详细设计文档 v1.1（新增客户端SDK架构）

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| 文档版本 | v1.1（⭐ 新增客户端SDK架构设计）|
| 创建日期 | 2025-10-19 |
| 最新更新 | 2025-10-19（添加SmartAbp.LogManagement.Client架构）|
| 负责人 | SmartABP架构团队 |
| 状态 | 设计阶段 |
| 架构模式 | ABP模块化 + Aspire + Dapr + ELK + **客户端SDK** |
| **核心升级** | **新增6大核心集成组件 + 3种无缝集成方式** |

---

## 🎯 1. 系统概述

### 1.1 业务目标

LogManagement微服务是SmartABP低代码引擎平台的统一日志管理系统，负责收集、存储、分析和可视化整个平台的日志数据。

### 1.2 核心价值

- **统一日志聚合**：集中管理低代码引擎、MES、智慧工地、DevKit框架的所有日志
- **实时监控告警**：实时监控系统运行状态，异常情况及时告警
- **问题快速定位**：通过日志追踪快速定位和诊断问题
- **审计合规**：完整的操作日志记录，满足审计要求
- **运维决策支持**：基于日志数据分析，支撑运维决策
- **⭐ 零侵入式集成**：通过客户端SDK实现一行代码完成日志集成（**v1.1新增**）
- **⭐ 日志不丢失保证**：本地缓存 + 自动重试机制，网络故障时日志不丢失（**v1.1新增**）
- **⭐ 自动采集能力**：自动拦截AppService方法和HTTP请求，无需手动编码（**v1.1新增**）

### 1.3 日志来源

```yaml
日志来源清单:
  1. 低代码引擎平台:
     - 应用层日志: AppService操作日志、业务逻辑日志
     - API层日志: HTTP请求日志、认证授权日志
     - 领域层日志: 领域事件日志、业务规则日志
     - 基础设施层日志: 数据库操作日志、缓存操作日志
     
  2. MES制造执行系统:
     - 生产订单日志: 订单创建、执行、完成日志
     - 设备运行日志: 设备状态、参数、告警日志
     - 质量检验日志: 质检流程、结果日志
     - 物料管理日志: 物料出入库、消耗日志
     
  3. 智慧工地管理系统:
     - 人员管理日志: 考勤、权限、安全日志
     - 设备监控日志: 塔吊、施工电梯运行日志
     - 材料管理日志: 材料进场、使用日志
     - 质量安全日志: 质量检查、安全巡检日志
     
  4. DevKit框架:
     - 代码生成日志: 生成任务、结果日志
     - 模板管理日志: 模板使用、更新日志
     - AI约束层日志: AI操作审计、行为分析日志
     - 质量检查日志: 代码质量检查结果日志
```

---

## 🏗️ 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      日志源层（Log Sources）                    │
├─────────────────────────────────────────────────────────────┤
│  低代码引擎   │   MES系统   │  智慧工地   │  DevKit框架       │
│  .NET API    │  .NET API   │  .NET API  │  .NET Core       │
└──────┬──────────────┬──────────────┬──────────────┬─────────┘
       │              │              │              │
       │ (Serilog)    │ (Serilog)    │ (Serilog)    │ (Serilog)
       │              │              │              │
┌──────▼──────────────▼──────────────▼──────────────▼─────────┐
│              日志采集层（Log Collection）                       │
├─────────────────────────────────────────────────────────────┤
│  Filebeat Agent 1  │  Filebeat Agent 2  │  Filebeat Agent 3 │
│  (轻量级采集)       │  (轻量级采集)       │  (轻量级采集)      │
└──────┬─────────────────────┬─────────────────────┬──────────┘
       │                     │                     │
       │                     │                     │
┌──────▼─────────────────────▼─────────────────────▼──────────┐
│               日志处理层（Log Processing）                      │
├─────────────────────────────────────────────────────────────┤
│                      Logstash Cluster                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Logstash 1  │  │  Logstash 2  │  │  Logstash 3  │      │
│  │  解析/转换    │  │  解析/转换    │  │  解析/转换    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────┬──────────────────────────────────────────────────────┘
       │
       │ (Bulk API)
       │
┌──────▼──────────────────────────────────────────────────────┐
│               日志存储层（Log Storage）                         │
├─────────────────────────────────────────────────────────────┤
│                  Elasticsearch Cluster                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Master  │  │ Data 1  │  │ Data 2  │  │ Data 3  │        │
│  │  Node   │  │  Node   │  │  Node   │  │  Node   │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                     (分片+副本策略)                            │
└──────┬──────────────────────────────────────────────────────┘
       │
       │
┌──────▼──────────────────────────────────────────────────────┐
│            日志可视化分析层（Log Visualization）                 │
├─────────────────────────────────────────────────────────────┤
│                         Kibana                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  仪表板  │  日志搜索  │  告警规则  │  用户管理         │   │
│  └──────────────────────────────────────────────────────┘   │
└──────┬──────────────────────────────────────────────────────┘
       │
       │ (HTTP API)
       │
┌──────▼──────────────────────────────────────────────────────┐
│          LogManagement微服务（ABP + Aspire + Dapr）           │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐     │
│  │         LogManagement.Application                  │     │
│  │  - LogQueryAppService (日志查询服务)               │     │
│  │  - LogAlertAppService (告警管理服务)               │     │
│  │  - LogStatisticsAppService (统计分析服务)          │     │
│  │  - LogConfigAppService (配置管理服务)              │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │         LogManagement.Domain                       │     │
│  │  - LogQuery (日志查询聚合根)                       │     │
│  │  - LogAlert (告警规则聚合根)                       │     │
│  │  - LogStatistics (统计分析聚合根)                  │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Aspire Integration                         │     │
│  │  - 服务发现、健康检查、配置管理                     │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Dapr Integration                           │     │
│  │  - Pub/Sub (日志事件发布)                          │     │
│  │  - State Management (告警状态管理)                 │     │
│  │  - Bindings (ELK绑定)                              │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技术架构分层

```yaml
架构分层（ABP DDD架构）:
  
  表现层（Presentation）:
    - LogManagement.HttpApi: RESTful API
    - LogManagement.Web: 管理后台（Vue3）
    
  应用层（Application）:
    - LogManagement.Application: 应用服务
      - LogQueryAppService: 日志查询服务
      - LogAlertAppService: 告警管理服务
      - LogStatisticsAppService: 统计分析服务
      - LogConfigAppService: 配置管理服务
    - LogManagement.Application.Contracts: 应用服务契约
      - DTOs: 数据传输对象
      - Interfaces: 服务接口
      
  领域层（Domain）:
    - LogManagement.Domain: 领域模型
      - Aggregates: 聚合根
        - LogQuery: 日志查询
        - LogAlert: 告警规则
        - LogStatistics: 统计分析
      - DomainServices: 领域服务
        - LogProcessingDomainService: 日志处理
        - AlertNotificationDomainService: 告警通知
      - DomainEvents: 领域事件
        - LogReceivedEvent: 日志接收事件
        - AlertTriggeredEvent: 告警触发事件
    - LogManagement.Domain.Shared: 领域共享
      - Enums: 枚举
      - Constants: 常量
      
  基础设施层（Infrastructure）:
    - LogManagement.EntityFrameworkCore: EF Core持久化
    - LogManagement.ElasticsearchIntegration: ES集成
    - LogManagement.DaprIntegration: Dapr集成
    - LogManagement.AspireIntegration: Aspire集成
    
  ⭐ 客户端SDK层（Client SDK - v1.1新增）:
    - LogManagement.Client: 客户端SDK NuGet包
      - LogManagementSink: Serilog自定义Sink
      - LogBatchProcessor: 批量处理器
      - LogLocalCache: 本地缓存
      - LoggingInterceptor: ABP自动拦截器
      - RequestLoggingMiddleware: HTTP请求中间件
      - LogManagementClient: HTTP客户端
```

### 2.3 客户端SDK架构（⭐ v1.1新增）

**SmartAbp.LogManagement.Client架构设计**

```
┌─────────────────────────────────────────────────────────────────┐
│                    应用层（Application Layer）                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ 低代码引擎     │  │   MES系统    │  │  智慧工地     │          │
│  │ SmartAbp.LowCode│ │ SmartAbp.MES│  │SmartAbp.Site │          │
│  └────────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└───────────┼──────────────────┼──────────────────┼─────────────────┘
            │                  │                  │
            │ (集成方式1: Serilog Sink - 零侵入)   │
            │ builder.Host.UseSerilog(           │
            │   .UseLogManagementSink(...))       │
            │                                     │
┌───────────▼─────────────────────────────────────▼─────────────────┐
│           SmartAbp.LogManagement.Client SDK（NuGet包）             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  1. LogManagementSink（Serilog自定义Sink）                 │   │
│  │     - 实现 IBatchedLogEventSink                            │   │
│  │     - 自动拦截所有Serilog日志事件                           │   │
│  │     - 批量异步上报（100条/批，5秒/次）                       │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                            │
│  ┌──────────────────▼───────────────────────────────────────┐   │
│  │  2. LogBatchProcessor（批量处理器）                         │   │
│  │     - Channel<LogEntry>本地队列缓存                        │   │
│  │     - 批量处理（100条/批，5秒间隔）                          │   │
│  │     - 网络故障自动重试（指数退避）                           │   │
│  │     - 断线重连保证                                          │   │
│  └──────────────────┬───────────────────────────────────────┘   │
│                     │                                            │
│  ┌──────────────────▼───────────────────────────────────────┐   │
│  │  3. LogLocalCache（本地缓存）                               │   │
│  │     - 网络故障时保存到本地文件                               │   │
│  │     - 7天本地持久化                                         │   │
│  │     - 网络恢复自动补发                                       │   │
│  │     - 日志不丢失100%保证                                     │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  4. LoggingInterceptor（ABP自动拦截器）                     │   │
│  │     - 继承 AbpInterceptor                                   │   │
│  │     - 自动拦截所有AppService方法                             │   │
│  │     - 自动记录方法名、参数、执行时间、异常                     │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  5. RequestLoggingMiddleware（HTTP中间件）                  │   │
│  │     - ASP.NET Core中间件                                    │   │
│  │     - 自动记录HTTP请求/响应                                  │   │
│  │     - 自动记录客户端信息（IP/UserAgent）                      │   │
│  │     - 自动记录执行时间                                        │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  6. LogManagementClient（HTTP客户端）                       │   │
│  │     - HTTP批量上报API                                        │   │
│  │     - 日志查询API                                            │   │
│  │     - 统计分析API                                            │   │
│  │     - 后台任务：定期发送缓存的日志                             │   │
│  └──────────────────┬───────────────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────────────┘
                      │
                      │ HTTP/JSON（批量上报）
                      │
┌─────────────────────▼──────────────────────────────────────────────┐
│              LogManagement微服务（服务端）                           │
│  ┌────────────────────────────────────────────────────────┐       │
│  │  POST /api/log-management/logs/batch                   │       │
│  │  {                                                      │       │
│  │    "serviceName": "SmartAbp.LowCode",                 │       │
│  │    "environment": "Production",                        │       │
│  │    "logs": [...]                                       │       │
│  │  }                                                      │       │
│  └────────────────────────────────────────────────────────┘       │
└────────────────────────────────────────────────────────────────────┘
```

**3种集成方式**:

```yaml
方式1: Serilog Sink（推荐，零侵入）:
  代码示例:
    builder.Host.UseSerilog((context, services, configuration) => 
      configuration.UseLogManagementSink(
        serviceUrl: "http://logmanagement-api:5000",
        serviceName: "SmartAbp.LowCode",
        environment: "Production"
      )
    );
  
  特点:
    ✅ 一行代码完成集成
    ✅ 自动拦截所有Serilog日志
    ✅ 无需修改现有代码
    ✅ 零侵入式集成
    
方式2: ABP Module（企业级）:
  代码示例:
    builder.Services.AddLogManagementClient(options =>
    {
        options.ServiceUrl = "http://logmanagement-api:5000";
        options.ServiceName = "SmartAbp.LowCode";
        options.EnableAutoInterceptor = true;
        options.EnableRequestLogging = true;
    });
    
    app.UseLogManagement();
  
  特点:
    ✅ 完整的ABP集成
    ✅ 自动拦截AppService方法
    ✅ 自动拦截HTTP请求
    ✅ 企业级功能完整
    
方式3: HttpClient SDK（通用）:
  代码示例:
    var httpClient = new HttpClient();
    var client = new LogManagementClient(httpClient, options);
    await client.SendBatchAsync(batch);
  
  特点:
    ✅ 灵活的手动控制
    ✅ 适用于任何.NET应用
    ✅ 不依赖ABP框架
    ✅ 适合微服务场景
```

**核心特性**:

```yaml
性能特性:
  ✅ 批量处理: 100条/批，5秒/次
  ✅ 本地队列性能: >10,000 logs/sec
  ✅ 网络上报性能: >1,000 logs/sec
  ✅ 异步处理: 不阻塞主线程
  ✅ 内存占用: <100MB

可靠性特性:
  ✅ 日志不丢失: 100%保证
  ✅ 本地持久化: 7天缓存保留
  ✅ 断线重连: 自动
  ✅ 网络故障保护: 本地缓存
  ✅ 指数退避重试: 3次重试

易用性特性:
  ✅ 零侵入集成: 一行代码
  ✅ 自动采集: AppService + HTTP
  ✅ 类型安全: 100%
  ✅ 依赖最小: 仅4个NuGet包
```

---

## 💻 3. 技术栈

### 3.1 后端技术栈

```yaml
核心框架:
  - .NET 8.0: 最新LTS版本
  - ABP Framework 8.0: 企业级应用框架
  - Aspire: 微服务编排和可观测性
  - Dapr 1.12: 分布式应用运行时
  
日志技术栈:
  - Serilog: .NET日志框架
  - Filebeat 8.x: 轻量级日志采集
  - Logstash 8.x: 日志处理和转换
  - Elasticsearch 8.x: 分布式搜索引擎
  - Kibana 8.x: 日志可视化分析
  
数据存储:
  - PostgreSQL 15: 配置数据存储
  - Redis 7.0: 缓存和会话管理
  - Elasticsearch 8.x: 日志数据存储
  
消息队列:
  - Apache Kafka: 日志事件流
  - Dapr Pub/Sub: 微服务消息
```

### 3.2 前端技术栈

```yaml
核心框架:
  - Vue 3.4: 渐进式框架
  - TypeScript 5.0: 类型安全
  - Vite 5.0: 构建工具
  
UI组件:
  - Element Plus: UI组件库
  - ECharts: 数据可视化
  
状态管理:
  - Pinia: 状态管理
  
路由:
  - Vue Router 4: 路由管理
```

### 3.3 客户端SDK技术栈（⭐ v1.1新增）

```yaml
核心依赖:
  - .NET 8.0: 目标框架
  - Serilog.Sinks.PeriodicBatching: Serilog批量Sink
  - Microsoft.Extensions.DependencyInjection: 依赖注入
  - Microsoft.Extensions.Options: 选项模式
  - Volo.Abp.Core: ABP核心框架
  - Newtonsoft.Json: JSON序列化
  
核心组件:
  - LogManagementSink: Serilog自定义Sink
  - LogBatchProcessor: 批量处理器（基于System.Threading.Channels）
  - LogLocalCache: 本地文件缓存
  - LoggingInterceptor: ABP拦截器（基于Volo.Abp.DynamicProxy）
  - RequestLoggingMiddleware: ASP.NET Core中间件
  - LogManagementClient: HTTP客户端（基于System.Net.Http）
  
NuGet包信息:
  - 包名: SmartAbp.LogManagement.Client
  - 版本: 1.0.0
  - 目标框架: net8.0
  - 许可证: MIT
  - 依赖项: 4个（精简依赖）
```

---

## 🔧 4. 核心功能

### 4.1 日志收集功能

```csharp
/// <summary>
/// 日志收集配置
/// </summary>
public class LogCollectionConfig
{
    /// <summary>
    /// 日志源标识
    /// </summary>
    public string SourceId { get; set; }
    
    /// <summary>
    /// 日志源名称
    /// </summary>
    public string SourceName { get; set; }
    
    /// <summary>
    /// 日志类型（LowCodeEngine/MES/SmartSite/DevKit）
    /// </summary>
    public LogSourceType SourceType { get; set; }
    
    /// <summary>
    /// 采集配置
    /// </summary>
    public FilebeatConfig FilebeatConfig { get; set; }
    
    /// <summary>
    /// 过滤规则
    /// </summary>
    public List<LogFilterRule> FilterRules { get; set; }
    
    /// <summary>
    /// 采样率（0.0-1.0）
    /// </summary>
    public double SamplingRate { get; set; }
}

/// <summary>
/// Filebeat采集配置
/// </summary>
public class FilebeatConfig
{
    /// <summary>
    /// 日志文件路径
    /// </summary>
    public List<string> Paths { get; set; }
    
    /// <summary>
    /// 多行日志模式
    /// </summary>
    public MultilinePattern MultilinePattern { get; set; }
    
    /// <summary>
    /// 输出目标（Logstash地址）
    /// </summary>
    public string LogstashHost { get; set; }
    
    /// <summary>
    /// 缓冲区大小
    /// </summary>
    public int BufferSize { get; set; }
}
```

### 4.2 日志查询功能

```csharp
/// <summary>
/// 日志查询应用服务
/// </summary>
public class LogQueryAppService : CrudAppService<
    LogQuery,
    LogQueryDto,
    Guid,
    LogQueryRequestDto,
    CreateLogQueryDto,
    UpdateLogQueryDto>,
    ILogQueryAppService
{
    private readonly IElasticsearchClient _esClient;
    private readonly IDistributedCache<LogQueryResultDto> _cache;
    
    /// <summary>
    /// 查询日志
    /// </summary>
    public async Task<PagedResultDto<LogEntryDto>> QueryLogsAsync(LogQueryRequestDto input)
    {
        // 构建ES查询
        var searchRequest = new SearchRequest<LogEntryDto>
        {
            Query = BuildQuery(input),
            Sort = BuildSort(input),
            From = input.SkipCount,
            Size = input.MaxResultCount
        };
        
        // 执行查询
        var response = await _esClient.SearchAsync<LogEntryDto>(searchRequest);
        
        // 返回结果
        return new PagedResultDto<LogEntryDto>
        {
            TotalCount = response.Total,
            Items = response.Documents.ToList()
        };
    }
    
    /// <summary>
    /// 全文搜索
    /// </summary>
    public async Task<List<LogEntryDto>> FullTextSearchAsync(string keyword)
    {
        var searchRequest = new SearchRequest<LogEntryDto>
        {
            Query = new MatchQuery
            {
                Field = "message",
                Query = keyword
            }
        };
        
        var response = await _esClient.SearchAsync<LogEntryDto>(searchRequest);
        return response.Documents.ToList();
    }
}
```

### 4.3 日志告警功能

```csharp
/// <summary>
/// 告警规则
/// </summary>
public class LogAlert : AggregateRoot<Guid>
{
    /// <summary>
    /// 规则名称
    /// </summary>
    public string RuleName { get; set; }
    
    /// <summary>
    /// 触发条件
    /// </summary>
    public AlertCondition Condition { get; set; }
    
    /// <summary>
    /// 告警级别
    /// </summary>
    public AlertLevel Level { get; set; }
    
    /// <summary>
    /// 通知方式
    /// </summary>
    public List<NotificationChannel> NotificationChannels { get; set; }
    
    /// <summary>
    /// 检查周期（秒）
    /// </summary>
    public int CheckIntervalSeconds { get; set; }
    
    /// <summary>
    /// 是否启用
    /// </summary>
    public bool IsEnabled { get; set; }
}

/// <summary>
/// 告警条件
/// </summary>
public class AlertCondition
{
    /// <summary>
    /// 日志级别过滤
    /// </summary>
    public List<LogLevel> LogLevels { get; set; }
    
    /// <summary>
    /// 关键词匹配
    /// </summary>
    public List<string> Keywords { get; set; }
    
    /// <summary>
    /// 阈值条件
    /// </summary>
    public ThresholdCondition Threshold { get; set; }
    
    /// <summary>
    /// 时间窗口（分钟）
    /// </summary>
    public int TimeWindowMinutes { get; set; }
}

/// <summary>
/// 告警应用服务
/// </summary>
public class LogAlertAppService : ApplicationService, ILogAlertAppService
{
    private readonly IRepository<LogAlert, Guid> _alertRepository;
    private readonly IDistributedEventBus _eventBus;
    
    /// <summary>
    /// 检查告警
    /// </summary>
    public async Task CheckAlertsAsync()
    {
        var alerts = await _alertRepository.GetListAsync(a => a.IsEnabled);
        
        foreach (var alert in alerts)
        {
            if (await ShouldTriggerAlertAsync(alert))
            {
                await TriggerAlertAsync(alert);
            }
        }
    }
    
    /// <summary>
    /// 触发告警
    /// </summary>
    private async Task TriggerAlertAsync(LogAlert alert)
    {
        // 发布告警事件
        await _eventBus.PublishAsync(new AlertTriggeredEvent
        {
            AlertId = alert.Id,
            AlertName = alert.RuleName,
            Level = alert.Level,
            TriggeredAt = Clock.Now
        });
        
        // 发送通知
        foreach (var channel in alert.NotificationChannels)
        {
            await SendNotificationAsync(channel, alert);
        }
    }
}
```

### 4.4 日志统计分析功能

```csharp
/// <summary>
/// 日志统计分析服务
/// </summary>
public class LogStatisticsAppService : ApplicationService, ILogStatisticsAppService
{
    private readonly IElasticsearchClient _esClient;
    
    /// <summary>
    /// 获取日志统计
    /// </summary>
    public async Task<LogStatisticsDto> GetStatisticsAsync(LogStatisticsRequestDto input)
    {
        // 按时间分组统计
        var timeSeriesAgg = await GetTimeSeriesAggregationAsync(input);
        
        // 按级别分组统计
        var levelAgg = await GetLevelAggregationAsync(input);
        
        // 按来源分组统计
        var sourceAgg = await GetSourceAggregationAsync(input);
        
        return new LogStatisticsDto
        {
            TimeSeries = timeSeriesAgg,
            LevelDistribution = levelAgg,
            SourceDistribution = sourceAgg,
            TotalCount = await GetTotalCountAsync(input)
        };
    }
    
    /// <summary>
    /// 时间序列聚合
    /// </summary>
    private async Task<List<TimeSeriesPoint>> GetTimeSeriesAggregationAsync(
        LogStatisticsRequestDto input)
    {
        var searchRequest = new SearchRequest<LogEntryDto>
        {
            Query = BuildQuery(input),
            Aggregations = new DateHistogramAggregation("time_series")
            {
                Field = "timestamp",
                Interval = input.TimeInterval,
                MinDocCount = 0
            }
        };
        
        var response = await _esClient.SearchAsync<LogEntryDto>(searchRequest);
        var buckets = response.Aggregations.DateHistogram("time_series").Buckets;
        
        return buckets.Select(b => new TimeSeriesPoint
        {
            Timestamp = b.Key,
            Count = b.DocCount
        }).ToList();
    }
}
```

---

## 📡 5. API接口设计

### 5.1 日志查询API

```csharp
/// <summary>
/// 日志查询API控制器
/// </summary>
[Route("api/log-management/logs")]
[ApiController]
public class LogsController : AbpController
{
    private readonly ILogQueryAppService _logQueryService;
    
    /// <summary>
    /// 查询日志列表
    /// </summary>
    /// <param name="input">查询条件</param>
    [HttpGet]
    public async Task<PagedResultDto<LogEntryDto>> GetListAsync(
        [FromQuery] LogQueryRequestDto input)
    {
        return await _logQueryService.QueryLogsAsync(input);
    }
    
    /// <summary>
    /// 全文搜索
    /// </summary>
    /// <param name="keyword">关键词</param>
    [HttpGet("search")]
    public async Task<List<LogEntryDto>> SearchAsync([FromQuery] string keyword)
    {
        return await _logQueryService.FullTextSearchAsync(keyword);
    }
    
    /// <summary>
    /// 获取日志详情
    /// </summary>
    /// <param name="id">日志ID</param>
    [HttpGet("{id}")]
    public async Task<LogEntryDto> GetAsync(string id)
    {
        return await _logQueryService.GetLogByIdAsync(id);
    }
}
```

### 5.2 告警管理API

```csharp
/// <summary>
/// 告警管理API控制器
/// </summary>
[Route("api/log-management/alerts")]
[ApiController]
public class AlertsController : AbpController
{
    private readonly ILogAlertAppService _alertService;
    
    /// <summary>
    /// 获取告警规则列表
    /// </summary>
    [HttpGet]
    public async Task<PagedResultDto<LogAlertDto>> GetListAsync(
        [FromQuery] PagedAndSortedResultRequestDto input)
    {
        return await _alertService.GetListAsync(input);
    }
    
    /// <summary>
    /// 创建告警规则
    /// </summary>
    [HttpPost]
    public async Task<LogAlertDto> CreateAsync([FromBody] CreateLogAlertDto input)
    {
        return await _alertService.CreateAsync(input);
    }
    
    /// <summary>
    /// 更新告警规则
    /// </summary>
    [HttpPut("{id}")]
    public async Task<LogAlertDto> UpdateAsync(
        Guid id,
        [FromBody] UpdateLogAlertDto input)
    {
        return await _alertService.UpdateAsync(id, input);
    }
    
    /// <summary>
    /// 删除告警规则
    /// </summary>
    [HttpDelete("{id}")]
    public async Task DeleteAsync(Guid id)
    {
        await _alertService.DeleteAsync(id);
    }
}
```

---

## 📊 6. 数据模型

### 6.1 日志条目模型

```csharp
/// <summary>
/// 日志条目（存储在Elasticsearch）
/// </summary>
public class LogEntry
{
    /// <summary>
    /// 日志ID（ES文档ID）
    /// </summary>
    public string Id { get; set; }
    
    /// <summary>
    /// 时间戳
    /// </summary>
    public DateTime Timestamp { get; set; }
    
    /// <summary>
    /// 日志级别
    /// </summary>
    public LogLevel Level { get; set; }
    
    /// <summary>
    /// 日志消息
    /// </summary>
    public string Message { get; set; }
    
    /// <summary>
    /// 日志来源
    /// </summary>
    public LogSource Source { get; set; }
    
    /// <summary>
    /// 应用名称
    /// </summary>
    public string Application { get; set; }
    
    /// <summary>
    /// 服务器主机名
    /// </summary>
    public string Hostname { get; set; }
    
    /// <summary>
    /// 异常信息
    /// </summary>
    public ExceptionInfo Exception { get; set; }
    
    /// <summary>
    /// 请求上下文
    /// </summary>
    public RequestContext RequestContext { get; set; }
    
    /// <summary>
    /// 自定义属性
    /// </summary>
    public Dictionary<string, object> Properties { get; set; }
}

/// <summary>
/// 日志来源
/// </summary>
public class LogSource
{
    public string System { get; set; }     // LowCodeEngine/MES/SmartSite/DevKit
    public string Module { get; set; }     // 具体模块名
    public string Component { get; set; }  // 具体组件名
}

/// <summary>
/// 异常信息
/// </summary>
public class ExceptionInfo
{
    public string Type { get; set; }
    public string Message { get; set; }
    public string StackTrace { get; set; }
    public ExceptionInfo InnerException { get; set; }
}

/// <summary>
/// 请求上下文
/// </summary>
public class RequestContext
{
    public string UserId { get; set; }
    public string TenantId { get; set; }
    public string RequestId { get; set; }
    public string RequestPath { get; set; }
    public string HttpMethod { get; set; }
    public int StatusCode { get; set; }
    public long ElapsedMilliseconds { get; set; }
}
```

### 6.2 数据库模型（PostgreSQL）

```csharp
/// <summary>
/// 告警规则（存储在PostgreSQL）
/// </summary>
public class LogAlert : FullAuditedAggregateRoot<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    
    public string RuleName { get; set; }
    
    public string Description { get; set; }
    
    /// <summary>
    /// 条件（JSON存储）
    /// </summary>
    public string ConditionJson { get; set; }
    
    public AlertLevel Level { get; set; }
    
    /// <summary>
    /// 通知渠道（JSON存储）
    /// </summary>
    public string NotificationChannelsJson { get; set; }
    
    public int CheckIntervalSeconds { get; set; }
    
    public bool IsEnabled { get; set; }
    
    public DateTime? LastCheckedTime { get; set; }
    
    public DateTime? LastTriggeredTime { get; set; }
}

/// <summary>
/// 告警历史（存储在PostgreSQL）
/// </summary>
public class LogAlertHistory : CreationAuditedEntity<Guid>, IMultiTenant
{
    public Guid? TenantId { get; set; }
    
    public Guid AlertId { get; set; }
    
    public string AlertName { get; set; }
    
    public AlertLevel Level { get; set; }
    
    public DateTime TriggeredAt { get; set; }
    
    public string TriggerReasonJson { get; set; }
    
    public bool IsAcknowledged { get; set; }
    
    public Guid? AcknowledgedBy { get; set; }
    
    public DateTime? AcknowledgedAt { get; set; }
}
```

---

## 🚀 7. 部署方案

### 7.1 Aspire编排配置

```csharp
/// <summary>
/// Aspire应用程序主机配置
/// </summary>
public class Program
{
    public static void Main(string[] args)
    {
        var builder = DistributedApplication.CreateBuilder(args);
        
        // Redis缓存
        var redis = builder.AddRedis("redis")
            .WithRedisCommander();
        
        // PostgreSQL数据库
        var postgres = builder.AddPostgres("postgres")
            .WithPgAdmin()
            .AddDatabase("logmanagement-db");
        
        // Elasticsearch
        var elasticsearch = builder.AddElasticsearch("elasticsearch")
            .WithKibana();
        
        // Kafka
        var kafka = builder.AddKafka("kafka");
        
        // LogManagement微服务
        var logManagement = builder.AddProject<Projects.LogManagement_HttpApi_Host>(
            "logmanagement-api")
            .WithReference(postgres)
            .WithReference(redis)
            .WithReference(elasticsearch)
            .WithReference(kafka)
            .WithDaprSidecar();
        
        builder.Build().Run();
    }
}
```

### 7.2 Dapr配置

```yaml
# dapr-logmanagement.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: logmanagement-statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: redis:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
---
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: logmanagement-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: kafka:9092
  - name: consumerGroup
    value: logmanagement
---
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: elasticsearch-binding
spec:
  type: bindings.elasticsearch
  version: v1
  metadata:
  - name: url
    value: http://elasticsearch:9200
  - name: index
    value: logs
```

### 7.3 Docker Compose部署

```yaml
version: '3.8'

services:
  # Elasticsearch
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    networks:
      - smartabp-network
  
  # Kibana
  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - smartabp-network
  
  # Logstash
  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: logstash
    volumes:
      - ./logstash/config:/usr/share/logstash/config
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      - "5044:5044"
      - "9600:9600"
    depends_on:
      - elasticsearch
    networks:
      - smartabp-network
  
  # LogManagement API
  logmanagement-api:
    image: smartabp/logmanagement-api:latest
    container_name: logmanagement-api
    ports:
      - "5100:80"
    environment:
      - ConnectionStrings__Default=Host=postgres;Database=LogManagement;Username=postgres;Password=postgres
      - Redis__Configuration=redis:6379
      - Elasticsearch__Url=http://elasticsearch:9200
    depends_on:
      - elasticsearch
      - postgres
      - redis
    networks:
      - smartabp-network

volumes:
  elasticsearch-data:

networks:
  smartabp-network:
    external: true
```

---

## 📈 8. 性能指标

### 8.1 性能目标

```yaml
日志采集性能:
  吞吐量: ≥100,000 条/秒
  延迟: < 100ms（端到端）
  丢失率: < 0.01%
  
日志查询性能:
  简单查询: < 500ms
  复杂查询: < 2s
  聚合查询: < 3s
  并发查询: ≥1000 QPS
  
日志存储性能:
  写入吞吐: ≥50,000 条/秒
  索引延迟: < 1s
  存储压缩比: ≥5:1
  数据保留期: 90天（热数据） + 1年（冷数据）
  
告警响应性能:
  检测延迟: < 60s
  通知延迟: < 10s
  误报率: < 1%
```

### 8.2 容量规划

```yaml
日志量估算:
  低代码引擎: 10,000 条/分钟
  MES系统: 20,000 条/分钟
  智慧工地: 15,000 条/分钟
  DevKit框架: 5,000 条/分钟
  总计: 50,000 条/分钟 ≈ 72,000,000 条/天
  
存储容量估算:
  单条日志大小: ≈ 2KB（压缩后）
  日存储量: 72M × 2KB = 144GB/天
  月存储量: 144GB × 30 = 4.32TB/月
  年存储量: 4.32TB × 12 = 51.84TB/年
  
硬件资源需求:
  Elasticsearch集群:
    节点数: 3个Data节点 + 1个Master节点
    每节点配置: 16C/64GB/2TB SSD
    总存储: 6TB（热数据）
  
  Logstash集群:
    节点数: 3个
    每节点配置: 8C/32GB
  
  LogManagement API:
    节点数: 2个（高可用）
    每节点配置: 4C/16GB
```

---

## 🔒 9. 安全方案

### 9.1 认证授权

```csharp
/// <summary>
/// 日志查询权限
/// </summary>
public static class LogManagementPermissions
{
    public const string GroupName = "LogManagement";
    
    public static class Logs
    {
        public const string Default = GroupName + ".Logs";
        public const string Query = Default + ".Query";
        public const string Export = Default + ".Export";
        public const string Delete = Default + ".Delete";
    }
    
    public static class Alerts
    {
        public const string Default = GroupName + ".Alerts";
        public const string Create = Default + ".Create";
        public const string Update = Default + ".Update";
        public const string Delete = Default + ".Delete";
    }
}

/// <summary>
/// 权限定义提供者
/// </summary>
public class LogManagementPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var logManagementGroup = context.AddGroup(LogManagementPermissions.GroupName);
        
        var logsPermission = logManagementGroup.AddPermission(
            LogManagementPermissions.Logs.Default);
        logsPermission.AddChild(LogManagementPermissions.Logs.Query);
        logsPermission.AddChild(LogManagementPermissions.Logs.Export);
        logsPermission.AddChild(LogManagementPermissions.Logs.Delete);
        
        var alertsPermission = logManagementGroup.AddPermission(
            LogManagementPermissions.Alerts.Default);
        alertsPermission.AddChild(LogManagementPermissions.Alerts.Create);
        alertsPermission.AddChild(LogManagementPermissions.Alerts.Update);
        alertsPermission.AddChild(LogManagementPermissions.Alerts.Delete);
    }
}
```

### 9.2 数据安全

```yaml
数据加密:
  传输加密: TLS 1.3
  存储加密: Elasticsearch字段级加密
  敏感信息脱敏: 
    - 密码: ******
    - 手机号: 138****1234
    - 身份证: 110***********1234
    - 银行卡: 6222 **** **** 1234

访问控制:
  多租户隔离: 基于TenantId的数据隔离
  行级安全: Elasticsearch Document-level Security
  字段级安全: Elasticsearch Field-level Security

审计日志:
  记录内容:
    - 用户ID、租户ID
    - 操作类型（查询、导出、删除）
    - 操作时间、IP地址
    - 查询条件、结果数量
  保留期限: 3年
```

---

## 📅 10. 开发计划

### 10.1 里程碑规划

```yaml
阶段1: 基础架构搭建（2周）
  Week 1:
    - [ ] 项目结构创建（ABP模块化）
    - [ ] ELK Stack部署配置
    - [ ] Aspire + Dapr集成
    - [ ] 基础设施代码（Repository、DbContext）
  
  Week 2:
    - [ ] 领域模型设计实现
    - [ ] 应用服务实现
    - [ ] API控制器实现
    - [ ] 单元测试编写

阶段2: 日志采集实现（2周）
  Week 3:
    - [ ] Serilog配置（各日志源）
    - [ ] Filebeat配置和部署
    - [ ] Logstash管道配置
    - [ ] 日志解析和转换规则
  
  Week 4:
    - [ ] 日志采集测试
    - [ ] 性能调优
    - [ ] 监控告警配置

阶段3: 查询分析实现（2周）
  Week 5:
    - [ ] Elasticsearch查询接口
    - [ ] 日志查询API实现
    - [ ] 全文搜索实现
    - [ ] 统计分析实现
  
  Week 6:
    - [ ] 查询性能优化
    - [ ] 缓存策略实现
    - [ ] 集成测试

阶段4: 告警系统实现（1周）
  Week 7:
    - [ ] 告警规则引擎
    - [ ] 告警检测定时任务
    - [ ] 通知渠道集成（邮件、短信、钉钉）
    - [ ] 告警管理界面

阶段5: 前端开发（2周）
  Week 8:
    - [ ] 日志查询界面
    - [ ] 日志详情界面
    - [ ] 告警管理界面
  
  Week 9:
    - [ ] 统计分析仪表板
    - [ ] 数据可视化（ECharts）
    - [ ] 前端集成测试

阶段6: 测试和上线（1周）
  Week 10:
    - [ ] 系统集成测试
    - [ ] 压力测试
    - [ ] 生产环境部署
    - [ ] 文档完善
```

### 10.2 团队配置

```yaml
开发团队:
  后端开发: 2人
  前端开发: 1人
  DevOps: 1人
  测试: 1人
  
技术栈要求:
  后端: .NET 8 + ABP Framework + ELK + Dapr
  前端: Vue3 + TypeScript + Element Plus
  DevOps: Docker + Kubernetes + Aspire
```

---

## 📚 11. 参考资料

```yaml
技术文档:
  - ABP Framework官方文档: https://docs.abp.io/
  - Elastic Stack官方文档: https://www.elastic.co/guide/
  - Dapr官方文档: https://docs.dapr.io/
  - Aspire官方文档: https://learn.microsoft.com/dotnet/aspire/
  
最佳实践:
  - ELK日志管理最佳实践
  - 微服务日志设计模式
  - 分布式追踪最佳实践
  - ABP DDD架构设计指南
```

---

## ✅ 12. 验收标准

```yaml
功能验收:
  ✅ 支持4个日志源的统一采集
  ✅ 日志查询响应时间 < 500ms
  ✅ 全文搜索准确率 > 95%
  ✅ 告警规则正常触发和通知
  ✅ 统计分析数据准确性 100%

性能验收:
  ✅ 日志吞吐量 ≥ 100,000 条/秒
  ✅ 查询并发 ≥ 1000 QPS
  ✅ 端到端延迟 < 100ms
  ✅ 存储压缩比 ≥ 5:1

质量验收:
  ✅ 代码质量 ≥ 95分
  ✅ 单元测试覆盖率 ≥ 80%
  ✅ 集成测试通过率 100%
  ✅ 文档完整性 100%

安全验收:
  ✅ 认证授权机制完善
  ✅ 数据传输加密（TLS 1.3）
  ✅ 敏感信息脱敏
  ✅ 审计日志完整

⭐ 客户端SDK验收（v1.1新增）:
  ✅ NuGet包发布成功（SmartAbp.LogManagement.Client 1.0.0）
  ✅ 零侵入式集成验证（Serilog Sink一行代码完成）
  ✅ 批量处理性能测试（>10,000 logs/sec）
  ✅ 本地缓存验证（网络故障时日志不丢失）
  ✅ 自动拦截器验证（AppService方法自动记录）
  ✅ HTTP中间件验证（请求日志自动记录）
  ✅ 4个系统集成测试（低代码引擎/MES/智慧工地/DevKit）
  ✅ 可靠性测试（断线重连、指数退避重试）
  ✅ 分布式追踪测试（CorrelationId跨服务追踪）
  ✅ SDK文档完整性（使用指南、API文档、集成示例）
```

---

**文档状态**：✅ v1.1已完成（新增客户端SDK架构设计）
**下一步**：开始实现开发（参见《01-LogManagement微服务详细开发计划.md v1.1》）

