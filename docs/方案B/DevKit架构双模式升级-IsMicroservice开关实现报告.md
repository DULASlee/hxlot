# DevKit架构双模式升级 - IsMicroservice开关实现报告

**日期**: 2025-01-19
**版本**: v1.0
**实施人**: AI Chief Architect

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 核心架构特性：IsMicroservice开关

### 设计理念

DevKit低代码引擎现在支持**架构双模式**设计：

```yaml
架构模式选择:
  IsMicroservice = false（默认）:
    模式名称: 传统单体应用架构
    适用场景: 中小型项目、快速原型、单体部署
    技术栈: ABP vNext + Layer1/2/3分层架构

  IsMicroservice = true:
    模式名称: Aspire微服务编排架构
    适用场景: 大型项目、高并发、分布式系统
    技术栈: ABP vNext + Aspire + 微服务
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📋 实现内容

### 1. LowCodeConfig扩展

**新增属性**:

```csharp
/// <summary>
/// 🔥 是否启用微服务模式（关键架构开关）
/// </summary>
public bool IsMicroservice { get; set; } = false;

/// <summary>
/// 微服务配置（仅当IsMicroservice=true时有效）
/// </summary>
public MicroserviceConfig? MicroserviceConfig { get; set; }
```

### 2. MicroserviceConfig配置类

**核心配置项**:

```csharp
public class MicroserviceConfig
{
    // 基础配置
    public string ServiceName { get; set; }        // 服务名称
    public int HttpPort { get; set; } = 5000;      // HTTP端口
    public int GrpcPort { get; set; } = 5001;      // gRPC端口

    // 功能开关
    public bool EnableServiceDiscovery { get; set; } = true;     // 服务发现
    public bool EnableDistributedTracing { get; set; } = true;   // 分布式追踪
    public bool EnableHealthChecks { get; set; } = true;         // 健康检查

    // 服务依赖
    public List<string> DependentServices { get; set; }  // 依赖的其他服务
    public bool IsApiGateway { get; set; } = false;      // 是否为网关服务

    // Aspire资源
    public AspireResourceConfig AspireConfig { get; set; }
}
```

### 3. AspireResourceConfig资源配置

**Aspire集成资源**:

```csharp
public class AspireResourceConfig
{
    // 基础设施资源
    public bool EnableRedis { get; set; } = false;         // Redis缓存
    public bool EnableRabbitMQ { get; set; } = false;      // RabbitMQ消息队列
    public bool EnablePostgreSQL { get; set; } = false;    // PostgreSQL数据库
    public bool EnableSqlServer { get; set; } = true;      // SQL Server数据库
    public bool EnableSeq { get; set; } = true;            // Seq日志

    // 容器编排配置
    public int Replicas { get; set; } = 1;                 // 副本数量
    public double? CpuLimit { get; set; }                  // CPU限制
    public int? MemoryLimit { get; set; }                  // 内存限制
}
```

### 4. OutputPathConfig路径配置扩展

**新增路径配置**:

```csharp
/// <summary>
/// Aspire编排项目输出路径
/// </summary>
public string AspireHostPath { get; set; } = "src/SmartAbp.AspireHost";

/// <summary>
/// 微服务输出根路径
/// </summary>
public string MicroserviceRootPath { get; set; } = "src/services";
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🏗️ 架构对比

### 传统模式（IsMicroservice = false）

```
项目结构:
SmartAbp/
├── src/
│   ├── SmartAbp.Domain/             # 领域层
│   ├── SmartAbp.Application/        # 应用服务层
│   ├── SmartAbp.HttpApi/            # HTTP API层
│   ├── SmartAbp.EntityFrameworkCore/  # 数据访问层
│   └── SmartAbp.Vue/                # 前端Vue项目
└── test/

部署方式:
- 单体应用部署
- 一个进程、一个数据库
- 简单、快速、适合中小型项目
```

### 微服务模式（IsMicroservice = true）

```
项目结构:
SmartAbp/
├── src/
│   ├── SmartAbp.AspireHost/         # Aspire编排项目 ⭐新增
│   ├── services/                    # 微服务根目录 ⭐新增
│   │   ├── UserService/             # 用户服务
│   │   │   ├── Domain/
│   │   │   ├── Application/
│   │   │   ├── HttpApi/
│   │   │   └── Host/                # 独立Host
│   │   ├── ProductService/          # 产品服务
│   │   └── OrderService/            # 订单服务
│   └── SmartAbp.Vue/                # 前端Vue项目（BFF模式）
└── test/

部署方式:
- 微服务独立部署
- 多个进程、独立数据库（可选）
- Aspire编排：服务发现、配置管理、分布式追踪
- 适合大型、高并发、分布式系统
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📊 配置示例

### 示例1：传统单体应用

```json
{
  "ModuleName": "UserManagement",
  "CurrentLayer": "Layer2",
  "IsMicroservice": false,
  "Entities": [
    {
      "EntityName": "User",
      "Properties": [...]
    }
  ]
}
```

**生成结果**:
- `src/SmartAbp.Domain/UserManagement/User.cs`
- `src/SmartAbp.Application/UserManagement/UserAppService.cs`
- `src/SmartAbp.HttpApi/UserManagement/UserController.cs`
- `src/SmartAbp.Vue/src/views/user-management/index.vue`

### 示例2：Aspire微服务

```json
{
  "ModuleName": "UserManagement",
  "CurrentLayer": "Layer2",
  "IsMicroservice": true,
  "MicroserviceConfig": {
    "ServiceName": "UserService",
    "HttpPort": 5000,
    "GrpcPort": 5001,
    "EnableServiceDiscovery": true,
    "EnableDistributedTracing": true,
    "DependentServices": ["IdentityService"],
    "AspireConfig": {
      "EnableRedis": true,
      "EnableRabbitMQ": true,
      "EnableSqlServer": true,
      "EnableSeq": true,
      "Replicas": 2
    }
  },
  "Entities": [
    {
      "EntityName": "User",
      "Properties": [...]
    }
  ]
}
```

**生成结果**:
- `src/services/UserService/Domain/User.cs`
- `src/services/UserService/Application/UserAppService.cs`
- `src/services/UserService/HttpApi/UserController.cs`
- `src/services/UserService/Host/Program.cs` ⭐独立Host
- `src/SmartAbp.AspireHost/Program.cs` ⭐Aspire编排配置

**Aspire编排配置**:
```csharp
// src/SmartAbp.AspireHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

// 注册SQL Server
var sqlServer = builder.AddSqlServer("sqlserver");

// 注册Redis
var redis = builder.AddRedis("redis");

// 注册RabbitMQ
var rabbitmq = builder.AddRabbitMQ("rabbitmq");

// 注册用户服务
builder.AddProject<Projects.UserService_Host>("user-service")
    .WithReference(sqlServer)
    .WithReference(redis)
    .WithReference(rabbitmq)
    .WithReplicas(2);

builder.Build().Run();
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 后续任务

### Week 2 Day 2-3: 代码生成器适配

**任务清单**:
1. ✅ **已完成**: LowCodeConfig模型扩展（IsMicroservice + MicroserviceConfig）
2. ⏳ **待实现**: DomainGenerator适配（根据IsMicroservice生成不同结构）
3. ⏳ **待实现**: ApplicationGenerator适配（微服务独立AppService）
4. ⏳ **待实现**: AspireHostGenerator（生成Aspire编排项目）
5. ⏳ **待实现**: MicroserviceHostGenerator（生成独立Host项目）

### Week 2 Day 4-5: Aspire集成

**任务清单**:
1. ⏳ Aspire项目模板创建
2. ⏳ 服务发现配置生成
3. ⏳ 分布式追踪集成（OpenTelemetry）
4. ⏳ 健康检查端点生成
5. ⏳ gRPC服务间通信

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 💡 设计优势

### 1. 灵活性
- 同一套配置，一键切换单体/微服务
- 无需重写代码，只需调整配置

### 2. 渐进式演进
- 初期：单体应用快速开发
- 中期：业务增长后平滑切换微服务
- 后期：Aspire编排优化运维

### 3. 最佳实践
- 单体模式：ABP vNext DDD最佳实践
- 微服务模式：.NET Aspire官方推荐架构

### 4. 企业级特性
- 服务发现、配置管理
- 分布式追踪、健康检查
- 容器编排、资源限制

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📝 总结

✅ **核心成果**:
1. 实现了DevKit架构双模式设计
2. 添加了IsMicroservice关键开关
3. 设计了完整的MicroserviceConfig配置体系
4. 为Aspire微服务编排预留了扩展点

🚀 **下一步**:
1. 继续实现代码生成器适配
2. 根据IsMicroservice生成不同的项目结构
3. 实现Aspire编排项目自动生成

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**这是一个非常重要的架构升级！让DevKit真正具备了双模式能力！** 🎉

