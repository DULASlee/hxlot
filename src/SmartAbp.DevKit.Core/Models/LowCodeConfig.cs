using System;
using System.Collections.Generic;
using SmartAbp.DevKit.Core.Abstractions;

namespace SmartAbp.DevKit.Core.Models;

/// <summary>
/// 低代码配置模型
/// </summary>
public class LowCodeConfig
{
    /// <summary>
    /// 配置唯一标识符
    /// </summary>
    public Guid ConfigId { get; set; } = Guid.NewGuid();

    /// <summary>
    /// 模块名称（如：UserManagement）
    /// </summary>
    public string ModuleName { get; set; } = string.Empty;

    /// <summary>
    /// 当前目标层级
    /// </summary>
    public TargetLayer CurrentLayer { get; set; } = TargetLayer.Layer1;

    /// <summary>
    /// 🔥 是否启用微服务模式（关键架构开关）
    /// </summary>
    /// <remarks>
    /// 【架构双模式设计】
    /// - false（默认）: 生成传统ABP单体应用架构（Layer1/2/3）
    ///   • Layer1: 基础CRUD（Domain + Application + HttpApi）
    ///   • Layer2: 完整功能（+ 前端Vue页面）
    ///   • Layer3: 企业级特性（+ 多租户 + 缓存 + 审计）
    ///
    /// - true: 生成Aspire微服务编排架构
    ///   • 每个模块独立为一个微服务
    ///   • Aspire编排：服务发现、配置管理、分布式追踪
    ///   • API Gateway：统一网关、认证授权
    ///   • 服务间通信：gRPC + HTTP
    /// </remarks>
    public bool IsMicroservice { get; set; } = false;

    /// <summary>
    /// 微服务配置（仅当IsMicroservice=true时有效）
    /// </summary>
    public MicroserviceConfig? MicroserviceConfig { get; set; }

    /// <summary>
    /// 实体定义列表
    /// </summary>
    public List<EntityDefinition> Entities { get; set; } = new();

    /// <summary>
    /// 模板配置
    /// </summary>
    public TemplateConfig TemplateConfig { get; set; } = new();

    /// <summary>
    /// 输出路径配置
    /// </summary>
    public OutputPathConfig OutputPaths { get; set; } = new();

    /// <summary>
    /// 创建时间
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// 最后更新时间
    /// </summary>
    public DateTime LastModifiedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// 实体定义
/// </summary>
public class EntityDefinition
{
    /// <summary>
    /// 实体名称（如：User）
    /// </summary>
    public string EntityName { get; set; } = string.Empty;

    /// <summary>
    /// 实体属性列表
    /// </summary>
    public List<EntityProperty> Properties { get; set; } = new();

    /// <summary>
    /// 实体关系列表
    /// </summary>
    public List<EntityRelation> Relations { get; set; } = new();

    /// <summary>
    /// 是否生成CRUD操作
    /// </summary>
    public bool GenerateCrud { get; set; } = true;
}

/// <summary>
/// 实体属性
/// </summary>
public class EntityProperty
{
    /// <summary>
    /// 属性名称
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// 属性类型（如：string, int, DateTime）
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// 是否必填
    /// </summary>
    public bool IsRequired { get; set; }

    /// <summary>
    /// 最大长度（仅用于string类型）
    /// </summary>
    public int? MaxLength { get; set; }

    /// <summary>
    /// 默认值
    /// </summary>
    public string? DefaultValue { get; set; }
}

/// <summary>
/// 实体关系
/// </summary>
public class EntityRelation
{
    /// <summary>
    /// 关系类型
    /// </summary>
    public RelationType Type { get; set; }

    /// <summary>
    /// 目标实体名称
    /// </summary>
    public string TargetEntity { get; set; } = string.Empty;

    /// <summary>
    /// 导航属性名称
    /// </summary>
    public string NavigationProperty { get; set; } = string.Empty;

    /// <summary>
    /// 外键属性名称
    /// </summary>
    public string? ForeignKey { get; set; }
}

/// <summary>
/// 关系类型枚举
/// </summary>
public enum RelationType
{
    OneToMany,
    ManyToOne,
    OneToOne,
    ManyToMany
}

/// <summary>
/// 模板配置
/// </summary>
public class TemplateConfig
{
    /// <summary>
    /// 后端模板路径
    /// </summary>
    public string BackendTemplatePath { get; set; } = "templates/backend";

    /// <summary>
    /// 前端模板路径
    /// </summary>
    public string FrontendTemplatePath { get; set; } = "templates/frontend";

    /// <summary>
    /// 自定义模板变量
    /// </summary>
    public Dictionary<string, string> CustomVariables { get; set; } = new();
}

/// <summary>
/// 输出路径配置
/// </summary>
public class OutputPathConfig
{
    /// <summary>
    /// 后端应用服务输出路径
    /// </summary>
    public string ApplicationPath { get; set; } = "src/SmartAbp.Application";

    /// <summary>
    /// 后端HTTP API输出路径
    /// </summary>
    public string HttpApiPath { get; set; } = "src/SmartAbp.HttpApi";

    /// <summary>
    /// 后端Domain输出路径
    /// </summary>
    public string DomainPath { get; set; } = "src/SmartAbp.Domain";

    /// <summary>
    /// 前端输出路径
    /// </summary>
    public string FrontendPath { get; set; } = "src/SmartAbp.Vue/src/views";

    /// <summary>
    /// Aspire编排项目输出路径
    /// </summary>
    public string AspireHostPath { get; set; } = "src/SmartAbp.AspireHost";

    /// <summary>
    /// 微服务输出根路径
    /// </summary>
    public string MicroserviceRootPath { get; set; } = "src/services";
}

/// <summary>
/// 微服务配置（Aspire微服务编排模式）
/// </summary>
public class MicroserviceConfig
{
    /// <summary>
    /// 服务名称（如：UserService）
    /// </summary>
    public string ServiceName { get; set; } = string.Empty;

    /// <summary>
    /// 服务端口（HTTP）
    /// </summary>
    public int HttpPort { get; set; } = 5000;

    /// <summary>
    /// 服务端口（gRPC）
    /// </summary>
    public int GrpcPort { get; set; } = 5001;

    /// <summary>
    /// 是否启用服务发现
    /// </summary>
    public bool EnableServiceDiscovery { get; set; } = true;

    /// <summary>
    /// 是否启用分布式追踪（OpenTelemetry）
    /// </summary>
    public bool EnableDistributedTracing { get; set; } = true;

    /// <summary>
    /// 是否启用健康检查
    /// </summary>
    public bool EnableHealthChecks { get; set; } = true;

    /// <summary>
    /// 依赖的其他服务列表
    /// </summary>
    public List<string> DependentServices { get; set; } = new();

    /// <summary>
    /// 是否作为网关服务
    /// </summary>
    public bool IsApiGateway { get; set; } = false;

    /// <summary>
    /// Aspire资源配置
    /// </summary>
    public AspireResourceConfig AspireConfig { get; set; } = new();
}

/// <summary>
/// Aspire资源配置
/// </summary>
public class AspireResourceConfig
{
    /// <summary>
    /// 是否启用Redis缓存
    /// </summary>
    public bool EnableRedis { get; set; } = false;

    /// <summary>
    /// 是否启用RabbitMQ消息队列
    /// </summary>
    public bool EnableRabbitMQ { get; set; } = false;

    /// <summary>
    /// 是否启用PostgreSQL数据库
    /// </summary>
    public bool EnablePostgreSQL { get; set; } = false;

    /// <summary>
    /// 是否启用SQL Server数据库
    /// </summary>
    public bool EnableSqlServer { get; set; } = true;

    /// <summary>
    /// 是否启用Seq日志
    /// </summary>
    public bool EnableSeq { get; set; } = true;

    /// <summary>
    /// 副本数量（容器编排）
    /// </summary>
    public int Replicas { get; set; } = 1;

    /// <summary>
    /// CPU限制（单位：核心数）
    /// </summary>
    public double? CpuLimit { get; set; }

    /// <summary>
    /// 内存限制（单位：MB）
    /// </summary>
    public int? MemoryLimit { get; set; }
}


