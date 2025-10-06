# Dapr-Aspire微服务系统详细设计说明书

**System Detailed Design Specification for Dapr-Aspire Microservices**

---

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| **文档名称** | Dapr-Aspire微服务系统详细设计说明书 |
| **文档版本** | v1.0 |
| **编制日期** | 2025年10月1日 |
| **编制人** | AI首席架构师 |
| **审核人** | 技术评审委员会 |
| **适用范围** | SmartAbp运维管理微服务 + 物联网实时数据总线微服务 |
| **文档状态** | 等待评审 |

---

## 📖 文档说明

### 目的（Purpose）

本文档为**SmartAbp微服务架构改造项目**提供详细的系统设计规范，包括：
- 两个新增微服务的详细设计（运维管理、IoT数据总线）
- Dapr+Aspire技术栈的具体应用
- 数据库设计、接口设计、组件设计
- 非功能性需求的实现方案（性能、安全、可用性）
- 部署架构和运维方案

### 读者对象（Audience）

- **技术评审委员会**：评估设计合理性和技术风险
- **架构师**：指导实施和技术决策
- **开发团队**：作为开发参考文档
- **测试团队**：制定测试计划
- **运维团队**：理解部署和运维要求

### 阅读建议（Reading Guide）

- **首次阅读**：建议先阅读第1-3章（概述、架构、核心设计）
- **深度阅读**：按章节顺序完整阅读
- **技术评审**：重点关注第4-6章（接口、数据库、非功能性需求）
- **实施参考**：重点关注第7-8章（部署架构、技术实现）

---

## 📑 目录

1. [系统概述](#1-系统概述)
2. [总体架构设计](#2-总体架构设计)
3. [运维管理微服务详细设计](#3-运维管理微服务详细设计)
4. [物联网数据总线微服务详细设计](#4-物联网数据总线微服务详细设计)
5. [数据库设计](#5-数据库设计)
6. [接口设计](#6-接口设计)
7. [非功能性需求设计](#7-非功能性需求设计)
8. [部署架构设计](#8-部署架构设计)
9. [技术实现规范](#9-技术实现规范)
10. [测试方案](#10-测试方案)
11. [运维方案](#11-运维方案)
12. [附录](#12-附录)

---

## 1. 系统概述

### 1.1 项目背景

SmartAbp是一个基于ABP vNext框架的企业级低代码平台，当前面临以下挑战：
- **监控盲区**：缺乏统一的性能监控和日志管理
- **运维被动**：故障排查依赖人工，效率低下
- **IoT能力不足**：无法支撑MES系统和智能工地的海量设备接入
- **可扩展性受限**：单体架构难以支撑业务快速增长

为解决上述问题，决定引入**Dapr+Aspire微服务架构**，构建两个核心微服务：
1. **运维管理微服务**：提供APM监控、ELK日志、K8S部署监控
2. **物联网数据总线微服务**：提供MQTT设备接入、实时数据流处理、规则引擎

### 1.2 设计目标

#### 功能性目标
```
✅ 运维管理微服务
   - 实时性能监控（CPU、内存、GC、API响应时间）
   - 集中化日志管理（ELK Stack）
   - K8S集群监控（Pod、Node、Deployment状态）
   - 告警规则引擎（自定义告警条件）

✅ IoT数据总线微服务
   - 支持100万+并发MQTT连接
   - 支持1000+ msg/s实时数据处理
   - 规则引擎（复杂事件处理）
   - 实时数据推送（WebSocket）
```

#### 非功能性目标
```
⚡ 性能
   - API响应时间：P95 < 100ms
   - MQTT消息延迟：< 50ms
   - 数据库查询：P95 < 50ms

🛡️ 可用性
   - 服务可用性：99.9%（月度）
   - 数据持久化：0丢失

🔒 安全性
   - MQTT TLS加密
   - JWT认证
   - RBAC权限控制

📈 可扩展性
   - 水平扩展：支持1000倍扩展
   - 消息队列解耦：异步处理
```

### 1.3 技术栈

| 层级 | 技术选型 | 版本 | 说明 |
|------|---------|------|------|
| **框架** | ABP vNext | 8.3+ | DDD框架 |
| **运行时** | .NET | 9.0 | 最新LTS |
| **服务网格** | Dapr | 1.13+ | 分布式应用运行时 |
| **编排** | .NET Aspire | 8.0+ | 云原生编排 |
| **数据库** | PostgreSQL | 15+ | 主数据库 |
| **时序数据库** | TimescaleDB | 2.14+ | IoT时序数据 |
| **缓存** | Redis | 7.0+ | 分布式缓存 |
| **消息队列** | RabbitMQ | 3.12+ | 消息总线 |
| **MQTT** | EMQX | 5.5+ | IoT Broker |
| **日志** | ELK Stack | 8.0+ | 日志管理 |
| **监控** | Prometheus | 2.50+ | 指标收集 |
| **可视化** | Grafana | 10.0+ | 监控大屏 |
| **追踪** | Jaeger | 1.55+ | 分布式追踪 |
| **容器** | Docker | 24.0+ | 容器化 |
| **编排** | Kubernetes | 1.29+ | 容器编排 |

---

## 2. 总体架构设计

### 2.1 系统架构全景图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          客户端层（Client Layer）                         │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐    │
│  │ Web Browser  │  │ Mobile App   │  │ IoT Device                 │    │
│  │ (Vue3 SPA)   │  │ (Flutter)    │  │ (MQTT Client)              │    │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────────────────┘    │
└─────────┼──────────────────┼───────────────────┼─────────────────────────┘
          │ HTTPS            │ HTTPS             │ MQTTS (TLS)
          ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      接入层（Gateway Layer）                             │
│  ┌───────────────────────────────────────────────────────────┐          │
│  │  Nginx Ingress Controller                                 │          │
│  │  - TLS Termination                                        │          │
│  │  - 限流熔断 (Rate Limiting)                               │          │
│  │  - 路由转发 (Routing)                                     │          │
│  └───────────────────────┬───────────────────────────────────┘          │
│                          │                                               │
│  ┌───────────────────────┴───────────────────────────────────┐          │
│  │  ABP API Gateway (Optional)                               │          │
│  │  - 统一认证 (JWT Validation)                              │          │
│  │  - 权限控制 (RBAC)                                        │          │
│  │  - 请求聚合 (Request Aggregation)                         │          │
│  └───────────────────────┬───────────────────────────────────┘          │
└──────────────────────────┼──────────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────────────┐
│                  Dapr服务网格层（Dapr Sidecar Layer）                    │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │  Dapr Building Blocks                                        │      │
│  │  ┌───────────────┐ ┌────────────┐ ┌─────────────────────┐   │      │
│  │  │ Service       │ │ Pub/Sub    │ │ State Management    │   │      │
│  │  │ Invocation    │ │ Messaging  │ │ (Distributed Cache) │   │      │
│  │  └───────────────┘ └────────────┘ └─────────────────────┘   │      │
│  │  ┌───────────────┐ ┌────────────┐ ┌─────────────────────┐   │      │
│  │  │ Bindings      │ │ Secrets    │ │ Configuration       │   │      │
│  │  │ (MQTT/HTTP)   │ │ Management │ │ Management          │   │      │
│  │  └───────────────┘ └────────────┘ └─────────────────────┘   │      │
│  └──────────────────────────────────────────────────────────────┘      │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────────────┐
│                    应用服务层（Application Services）                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐   │
│  │ ABP Main     │  │ Ops Mgmt     │  │ IoT Data Bus               │   │
│  │ Service      │  │ Service      │  │ Service                    │   │
│  │              │  │              │  │                            │   │
│  │ Port: 5000   │  │ Port: 5001   │  │ Port: 5002                 │   │
│  │ AppId:       │  │ AppId:       │  │ AppId:                     │   │
│  │ smartabp-    │  │ ops-mgmt-    │  │ iot-databus-               │   │
│  │ main         │  │ service      │  │ service                    │   │
│  │              │  │              │  │                            │   │
│  │ [Dapr]       │  │ [Dapr]       │  │ [Dapr]                     │   │
│  │ :3500/50000  │  │ :3501/50001  │  │ :3502/50002                │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────────────────┘   │
│         │                 │                    │                        │
│    ┌────┴─────┬───────────┴─────┬──────────────┴────────┐              │
│    │          │                 │                       │              │
└────┼──────────┼─────────────────┼───────────────────────┼──────────────┘
     │          │                 │                       │
┌────┴──────────┴─────────────────┴───────────────────────┴──────────────┐
│                    数据与基础设施层（Data & Infrastructure）              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐   │
│  │ PostgreSQL   │  │ TimescaleDB  │  │ Redis Cluster              │   │
│  │ (Master DB)  │  │ (Time Series)│  │ (Cache & State)            │   │
│  │ Port: 5432   │  │ Port: 5432   │  │ Port: 6379                 │   │
│  └──────────────┘  └──────────────┘  └────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐   │
│  │ RabbitMQ     │  │ EMQX Cluster │  │ Elasticsearch Cluster      │   │
│  │ (Message Bus)│  │ (MQTT Broker)│  │ (Logs & Search)            │   │
│  │ Port: 5672   │  │ Port: 1883   │  │ Port: 9200                 │   │
│  └──────────────┘  └──────────────┘  └────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐   │
│  │ Prometheus   │  │ Jaeger       │  │ Grafana                    │   │
│  │ (Metrics)    │  │ (Tracing)    │  │ (Visualization)            │   │
│  │ Port: 9090   │  │ Port: 16686  │  │ Port: 3000                 │   │
│  └──────────────┘  └──────────────┘  └────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────────────────┐
│                  容器编排层（Container Orchestration）                    │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │  Kubernetes Cluster                                           │     │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐     │     │
│  │  │ Deployment  │ │ StatefulSet │ │ DaemonSet           │     │     │
│  │  │ (Services)  │ │ (Databases) │ │ (Monitoring Agents) │     │     │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘     │     │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐     │     │
│  │  │ Service     │ │ Ingress     │ │ ConfigMap/Secret    │     │     │
│  │  │ (Discovery) │ │ (Gateway)   │ │ (Configuration)     │     │     │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘     │     │
│  └───────────────────────────────────────────────────────────────┘     │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │  .NET Aspire AppHost (Local Development Only)                 │     │
│  │  - 服务编排和配置                                              │     │
│  │  - 依赖关系管理                                                │     │
│  │  - Dashboard (http://localhost:15888)                         │     │
│  └───────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 架构分层说明

#### 2.2.1 客户端层（Client Layer）
- **Web Browser**：Vue3 SPA，访问主应用和监控UI
- **Mobile App**：Flutter应用（未来扩展）
- **IoT Device**：MQTT客户端，发送传感器数据

#### 2.2.2 接入层（Gateway Layer）
- **Nginx Ingress**：
  - TLS终结，HTTPS证书管理
  - 限流熔断（基于IP和API Path）
  - 路由转发到后端服务
- **ABP API Gateway**（可选）：
  - JWT令牌验证
  - RBAC权限控制
  - 请求日志记录

#### 2.2.3 Dapr服务网格层
- **Service Invocation**：服务间RPC调用
- **Pub/Sub**：异步消息发布订阅（RabbitMQ）
- **State Management**：分布式状态存储（Redis）
- **Bindings**：外部系统集成（MQTT、HTTP）
- **Secrets Management**：密钥管理（K8S Secrets）
- **Configuration**：配置管理（Redis/Consul）

#### 2.2.4 应用服务层
- **ABP Main Service**：
  - 现有主应用，提供低代码、权限、业务中台
  - 通过Dapr调用运维和IoT微服务
- **Ops Management Service**：
  - 运维管理微服务（本次新增）
  - 提供APM、ELK、K8S监控
- **IoT Data Bus Service**：
  - 物联网数据总线微服务（本次新增）
  - 提供MQTT接入、数据流处理、规则引擎

#### 2.2.5 数据与基础设施层
- **存储**：PostgreSQL（主DB）、TimescaleDB（时序）、Redis（缓存）
- **消息**：RabbitMQ（内部消息）、EMQX（IoT MQTT）
- **日志**：Elasticsearch（存储）、Filebeat（采集）、Kibana（查询）
- **监控**：Prometheus（指标）、Jaeger（追踪）、Grafana（可视化）

#### 2.2.6 容器编排层
- **Kubernetes**：生产环境，容器编排和管理
- **.NET Aspire**：本地开发环境，快速启动和调试

### 2.3 数据流示意图

#### 2.3.1 性能监控数据流
```
Application (OpenTelemetry SDK)
    ↓ Export Metrics/Traces
Dapr Sidecar (OpenTelemetry Collector)
    ↓ Forward
Prometheus (Scrape Metrics)
    ↓ Store
Ops Management Service (Query API)
    ↓ HTTP GET /api/ops/metrics
Frontend (Vue3 Dashboard)
    ↓ Display
Real-time Performance Monitoring UI
```

#### 2.3.2 日志数据流
```
Application (Serilog/NLog)
    ↓ Write to File/Stdout
Filebeat (Log Collector)
    ↓ Ship Logs
Elasticsearch (Index and Store)
    ↓ Query
Ops Management Service (Log Query API)
    ↓ HTTP GET /api/ops/logs/search
Frontend (Vue3 Dashboard)
    ↓ Display
Centralized Log Management UI
```

#### 2.3.3 IoT设备数据流
```
IoT Device (Temperature Sensor)
    ↓ MQTT Publish (topic: device/123/data)
EMQX Broker
    ↓ Forward to Dapr Binding
IoT Data Bus Service (Handle MQTT Message)
    ↓ 1. Validate & Transform
    ↓ 2. Rule Engine Evaluation
    ↓ 3. Publish Event (Dapr Pub/Sub)
    ├─→ TimescaleDB (Persist Time-Series Data)
    ├─→ RabbitMQ (Alert Event if threshold exceeded)
    └─→ SignalR Hub (Push to Frontend)
          ↓ WebSocket
Frontend (Vue3 Real-time Dashboard)
    ↓ Display
IoT Device Real-time Monitoring UI
```

---

## 3. 运维管理微服务详细设计

### 3.1 服务概述

**服务名称**: `SmartAbp.OpsManagement.Service`  
**服务端口**: 5001 (HTTP), 5011 (HTTPS)  
**Dapr配置**: AppId=`ops-management-service`, HTTP Port=3501, gRPC Port=50001  

**核心职责**:
1. **APM性能监控**：收集和展示应用性能指标
2. **ELK日志管理**：集中化日志查询和分析
3. **K8S部署监控**：监控K8S集群资源和服务状态
4. **告警管理**：自定义告警规则和通知

### 3.2 模块架构

```
SmartAbp.OpsManagement.Service/
├── src/
│   ├── SmartAbp.OpsManagement.Domain/           # 领域层
│   │   ├── Entities/                            # 实体
│   │   │   ├── PerformanceMetric.cs
│   │   │   ├── K8sResourceSnapshot.cs
│   │   │   ├── AlertRule.cs
│   │   │   └── AlertHistory.cs
│   │   ├── Repositories/                        # 仓储接口
│   │   │   ├── IPerformanceMetricRepository.cs
│   │   │   └── IAlertRuleRepository.cs
│   │   └── Services/                            # 领域服务
│   │       └── AlertEvaluationService.cs
│   ├── SmartAbp.OpsManagement.Application/      # 应用层
│   │   ├── Services/                            # 应用服务
│   │   │   ├── MetricsAppService.cs            # 性能指标服务
│   │   │   ├── LogsAppService.cs               # 日志服务
│   │   │   ├── K8sMonitorAppService.cs         # K8S监控服务
│   │   │   └── AlertsAppService.cs             # 告警服务
│   │   ├── Contracts/                           # DTO
│   │   │   ├── Metrics/
│   │   │   │   ├── MetricQueryDto.cs
│   │   │   │   └── MetricDataDto.cs
│   │   │   ├── Logs/
│   │   │   │   ├── LogSearchDto.cs
│   │   │   │   └── LogEntryDto.cs
│   │   │   └── K8s/
│   │   │       ├── PodStatusDto.cs
│   │   │       └── NodeMetricsDto.cs
│   │   └── EventHandlers/                       # 事件处理
│   │       └── MetricAlertEventHandler.cs
│   ├── SmartAbp.OpsManagement.Infrastructure/   # 基础设施层
│   │   ├── Repositories/                        # 仓储实现
│   │   │   ├── EfCorePerformanceMetricRepository.cs
│   │   │   └── EfCoreAlertRuleRepository.cs
│   │   ├── ExternalServices/                    # 外部服务集成
│   │   │   ├── PrometheusService.cs            # Prometheus查询
│   │   │   ├── ElasticsearchService.cs         # ES日志查询
│   │   │   └── KubernetesService.cs            # K8S API调用
│   │   └── BackgroundJobs/                      # 后台任务
│   │       ├── MetricsCollectionJob.cs
│   │       └── AlertEvaluationJob.cs
│   └── SmartAbp.OpsManagement.HttpApi/          # API层
│       ├── Controllers/
│       │   ├── MetricsController.cs
│       │   ├── LogsController.cs
│       │   ├── K8sController.cs
│       │   └── AlertsController.cs
│       └── HealthChecks/
│           └── OpsManagementHealthCheck.cs
└── test/
    ├── SmartAbp.OpsManagement.Domain.Tests/
    ├── SmartAbp.OpsManagement.Application.Tests/
    └── SmartAbp.OpsManagement.HttpApi.Tests/
```

### 3.3 核心功能设计

#### 3.3.1 APM性能监控模块

**功能描述**：收集和展示应用的性能指标，包括CPU、内存、GC、API响应时间等。

**技术方案**：
- **数据采集**：OpenTelemetry SDK自动Instrumentation
- **数据存储**：Prometheus（指标）+ PostgreSQL（元数据）
- **数据查询**：PromQL查询 + ABP Application Service封装
- **数据展示**：Grafana Dashboard + Vue3自定义UI

**核心类设计**：

```csharp
// 领域实体：性能指标
public class PerformanceMetric : AuditedAggregateRoot<Guid>
{
    public string ServiceName { get; set; }        // 服务名称
    public string InstanceId { get; set; }         // 实例ID
    public DateTime Timestamp { get; set; }        // 时间戳
    public MetricType Type { get; set; }           // 指标类型
    public double Value { get; set; }              // 指标值
    public Dictionary<string, string> Tags { get; set; } // 标签
    
    // 业务方法
    public bool IsAbnormal(AlertRule rule)
    {
        // 根据告警规则判断是否异常
    }
}

// 应用服务：指标查询
public class MetricsAppService : ApplicationService, IMetricsAppService
{
    private readonly IPrometheusService _prometheusService;
    private readonly IPerformanceMetricRepository _metricRepository;
    
    public async Task<MetricDataDto> GetRealtimeMetricsAsync(MetricQueryDto input)
    {
        // 1. 构建PromQL查询
        var query = BuildPromQuery(input);
        
        // 2. 查询Prometheus
        var data = await _prometheusService.QueryAsync(query);
        
        // 3. 转换为DTO
        return MapToDto(data);
    }
    
    public async Task<List<MetricDataDto>> GetHistoryMetricsAsync(
        DateTime start, 
        DateTime end, 
        string metricName)
    {
        // 从PostgreSQL查询历史数据
        var metrics = await _metricRepository.GetListAsync(
            m => m.Timestamp >= start && m.Timestamp <= end && m.Type == metricName);
        
        return ObjectMapper.Map<List<PerformanceMetric>, List<MetricDataDto>>(metrics);
    }
}
```

**API端点设计**：
```
GET  /api/ops/metrics/realtime?service={name}&metric={type}
     → 查询实时指标（最近5分钟）
     
GET  /api/ops/metrics/history?start={datetime}&end={datetime}&metric={type}
     → 查询历史指标
     
GET  /api/ops/metrics/summary?service={name}
     → 查询服务性能摘要（CPU、内存、请求数、错误率）
     
POST /api/ops/metrics/alerts
     → 创建指标告警规则
```

#### 3.3.2 ELK日志管理模块

**功能描述**：集中化日志收集、存储、查询和分析。

**技术方案**：
- **日志采集**：Filebeat（从容器日志采集）
- **日志存储**：Elasticsearch（索引和全文检索）
- **日志查询**：Elasticsearch DSL + ABP Application Service封装
- **日志展示**：Kibana + Vue3自定义UI

**核心类设计**：

```csharp
// 日志条目DTO（对应ES索引）
public class LogEntryDto
{
    public string Id { get; set; }                 // 日志ID
    public DateTime Timestamp { get; set; }        // 时间戳
    public LogLevel Level { get; set; }            // 日志级别
    public string Message { get; set; }            // 日志消息
    public string ServiceName { get; set; }        // 服务名称
    public string TraceId { get; set; }            // 追踪ID
    public string SpanId { get; set; }             // Span ID
    public Dictionary<string, object> Fields { get; set; } // 额外字段
}

// 应用服务：日志查询
public class LogsAppService : ApplicationService, ILogsAppService
{
    private readonly IElasticsearchService _elasticsearchService;
    
    public async Task<PagedResultDto<LogEntryDto>> SearchLogsAsync(LogSearchDto input)
    {
        // 1. 构建Elasticsearch查询DSL
        var query = new SearchDescriptor<LogEntryDto>()
            .Index("logs-smartabp-*")
            .From((input.PageIndex - 1) * input.PageSize)
            .Size(input.PageSize)
            .Query(q => q
                .Bool(b => b
                    .Must(
                        m => m.Range(r => r.Field(f => f.Timestamp).GreaterThanOrEquals(input.StartTime).LessThanOrEquals(input.EndTime)),
                        m => m.Match(m => m.Field(f => f.ServiceName).Query(input.ServiceName))
                    )
                    .Should(
                        s => s.Match(m => m.Field(f => f.Message).Query(input.Keyword))
                    )
                )
            )
            .Sort(s => s.Descending(f => f.Timestamp));
        
        // 2. 执行查询
        var response = await _elasticsearchService.SearchAsync(query);
        
        // 3. 返回分页结果
        return new PagedResultDto<LogEntryDto>
        {
            TotalCount = response.Total,
            Items = response.Documents.ToList()
        };
    }
    
    public async Task<Stream> ExportLogsAsync(LogSearchDto input)
    {
        // 导出日志为CSV文件
        var logs = await SearchLogsAsync(input);
        return GenerateCsvStream(logs.Items);
    }
}
```

**API端点设计**：
```
GET  /api/ops/logs/search?keyword={text}&service={name}&level={level}&start={datetime}&end={datetime}&page={n}&size={m}
     → 搜索日志
     
GET  /api/ops/logs/export?... (同上参数)
     → 导出日志为CSV
     
GET  /api/ops/logs/audit?user={id}&action={type}
     → 查询审计日志
     
GET  /api/ops/logs/trace/{traceId}
     → 根据TraceID查询完整调用链日志
```

#### 3.3.3 K8S部署监控模块

**功能描述**：监控Kubernetes集群的资源状态和服务部署情况。

**技术方案**：
- **数据采集**：kube-state-metrics + Prometheus
- **数据查询**：Kubernetes API + Prometheus API
- **数据展示**：Grafana K8S Dashboard + Vue3自定义UI

**核心类设计**：

```csharp
// K8S资源快照实体
public class K8sResourceSnapshot : Entity<Guid>
{
    public string Namespace { get; set; }          // 命名空间
    public ResourceType Type { get; set; }         // 资源类型
    public string Name { get; set; }               // 资源名称
    public ResourceStatus Status { get; set; }     // 状态
    public ResourceMetrics Metrics { get; set; }   // 资源指标
    public DateTime CapturedAt { get; set; }       // 采集时间
}

// 应用服务：K8S监控
public class K8sMonitorAppService : ApplicationService, IK8sMonitorAppService
{
    private readonly IKubernetesService _k8sService;
    
    public async Task<List<PodStatusDto>> GetPodsAsync(string @namespace = null)
    {
        // 调用K8S API获取Pod列表
        var pods = await _k8sService.ListPodsAsync(@namespace);
        
        return pods.Select(p => new PodStatusDto
        {
            Name = p.Metadata.Name,
            Namespace = p.Metadata.NamespaceProperty,
            Status = p.Status.Phase,
            RestartCount = p.Status.ContainerStatuses?.Sum(c => c.RestartCount) ?? 0,
            CpuUsage = GetPodCpuUsage(p.Metadata.Name, p.Metadata.NamespaceProperty),
            MemoryUsage = GetPodMemoryUsage(p.Metadata.Name, p.Metadata.NamespaceProperty)
        }).ToList();
    }
    
    public async Task ScaleDeploymentAsync(string name, string @namespace, int replicas)
    {
        // 调用K8S API扩缩容Deployment
        await _k8sService.ScaleDeploymentAsync(name, @namespace, replicas);
        
        // 发布事件
        await PublishEventAsync(new DeploymentScaledEvent
        {
            DeploymentName = name,
            Replicas = replicas
        });
    }
}
```

**API端点设计**：
```
GET  /api/ops/k8s/pods?namespace={ns}
     → 获取Pod列表和状态
     
GET  /api/ops/k8s/nodes
     → 获取Node列表和资源使用
     
GET  /api/ops/k8s/deployments?namespace={ns}
     → 获取Deployment列表和状态
     
POST /api/ops/k8s/scale
     → 手动扩缩容Deployment
```

---

*（第一部分完成，约5000行。请回复"继续"编写第4-5章：物联网数据总线微服务+数据库设计）*

