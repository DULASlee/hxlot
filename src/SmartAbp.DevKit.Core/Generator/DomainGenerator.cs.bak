using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Models;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Templates;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// Domain实体生成器
/// Phase 2核心组件 - 生成Domain层实体代码（支持单体/微服务双模式）
/// </summary>
public class DomainGenerator : CodeGeneratorFramework<DomainGeneratorInput, DomainGeneratorOutput>
{
    private readonly ILogger<DomainGenerator> _logger;
    private readonly UnifiedMetadataSDK _metadataSDK;
    private readonly TemplateManager _templateManager;

    public DomainGenerator(
        ILogger<DomainGenerator> logger,
        UnifiedMetadataSDK metadataSDK,
        TemplateManager templateManager)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _metadataSDK = metadataSDK ?? throw new ArgumentNullException(nameof(metadataSDK));
        _templateManager = templateManager ?? throw new ArgumentNullException(nameof(templateManager));

        // 注册自定义Helpers
        _templateManager.RegisterHelpers();
    }

    public override async Task<DomainGeneratorOutput> GenerateAsync(DomainGeneratorInput input)
    {
        _logger.LogInformation(
            "开始生成Domain层代码，模块: {ModuleName}, 模式: {Mode}",
            input.Config.ModuleName,
            input.Config.IsMicroservice ? "微服务" : "单体");

        // 1. 验证输入
        var validation = await ValidateInputAsync(input);
        if (!validation.IsValid)
        {
            throw new InvalidOperationException($"输入验证失败: {validation.ErrorMessage}");
        }

        var generatedFiles = new Dictionary<string, string>();

        // 2. 生成每个实体的代码
        foreach (var entity in input.Config.Entities)
        {
            _logger.LogDebug("正在生成实体: {EntityName}", entity.EntityName);

            // 准备模板数据
            var templateData = PrepareTemplateData(entity, input.Config);

            // 生成Entity类
            var entityCode = await GenerateEntityAsync(templateData);

            // 确定输出路径
            var outputPath = GetEntityFilePath(entity, input.Config);
            generatedFiles[outputPath] = entityCode;

            _logger.LogDebug(
                "实体 {EntityName} 生成完成，文件: {FilePath}",
                entity.EntityName,
                outputPath);
        }

        // 3. 如果是微服务模式，生成额外的配置文件
        if (input.Config.IsMicroservice && input.Config.MicroserviceConfig != null)
        {
            var serviceConfigCode = await GenerateMicroserviceConfigAsync(input.Config);
            var configPath = GetMicroserviceConfigFilePath(input.Config);
            generatedFiles[configPath] = serviceConfigCode;

            _logger.LogInformation(
                "微服务配置文件已生成: {FilePath}",
                configPath);
        }

        _logger.LogInformation(
            "Domain层代码生成完成，共生成 {Count} 个文件",
            generatedFiles.Count);

        return new DomainGeneratorOutput
        {
            GeneratedFiles = generatedFiles,
            EntityCount = input.Config.Entities.Count,
            Namespace = GetDomainNamespace(input.Config),
            IsMicroserviceMode = input.Config.IsMicroservice
        };
    }

    public override Task<ValidationResult> ValidateInputAsync(DomainGeneratorInput input)
    {
        if (input == null)
        {
            return Task.FromResult(ValidationResult.Fail("输入不能为空"));
        }

        if (input.Config == null)
        {
            return Task.FromResult(ValidationResult.Fail("LowCodeConfig不能为空"));
        }

        if (string.IsNullOrWhiteSpace(input.Config.ModuleName))
        {
            return Task.FromResult(ValidationResult.Fail("模块名称不能为空"));
        }

        if (input.Config.Entities == null || !input.Config.Entities.Any())
        {
            return Task.FromResult(ValidationResult.Fail("至少需要定义一个实体"));
        }

        // 验证每个实体
        foreach (var entity in input.Config.Entities)
        {
            if (string.IsNullOrWhiteSpace(entity.EntityName))
            {
                return Task.FromResult(ValidationResult.Fail("实体名称不能为空"));
            }

            if (entity.Properties == null || !entity.Properties.Any())
            {
                return Task.FromResult(
                    ValidationResult.Fail($"实体 {entity.EntityName} 至少需要定义一个属性"));
            }
        }

        // 如果是微服务模式，验证微服务配置
        if (input.Config.IsMicroservice && input.Config.MicroserviceConfig == null)
        {
            return Task.FromResult(
                ValidationResult.Fail("微服务模式下必须提供MicroserviceConfig配置"));
        }

        return Task.FromResult(ValidationResult.Success());
    }

    /// <summary>
    /// 准备模板数据
    /// </summary>
    private object PrepareTemplateData(EntityDefinition entity, LowCodeConfig config)
    {
        var entityName = entity.EntityName;
        var moduleName = config.ModuleName;
        var isMicroservice = config.IsMicroservice;

        // 处理属性列表
        var properties = entity.Properties.Select(p => new
        {
            Name = p.Name,
            Type = MapToCSharpType(p.Type),
            IsNullable = false, // 默认为非空（可以根据Type判断）
            IsRequired = p.IsRequired,
            MaxLength = p.MaxLength,
            Comment = string.Empty, // EntityProperty没有Comment属性
            HasComment = false
        }).ToList();

        // 处理关系
        var relationsList = entity.Relations?.Select(r => new
        {
            PropertyName = r.NavigationProperty,
            RelatedEntityName = r.TargetEntity,
            RelationType = r.Type.ToString(),
            IsOneToMany = r.Type == RelationType.OneToMany,
            IsOneToOne = r.Type == RelationType.OneToOne,
            IsManyToOne = r.Type == RelationType.ManyToOne,
            IsManyToMany = r.Type == RelationType.ManyToMany,
            ForeignKeyName = r.ForeignKey ?? string.Empty
        }).ToList();

        var relations = (relationsList != null && relationsList.Any()) ? relationsList.Cast<object>().ToList() : new List<object>();

        return new
        {
            EntityName = entityName,
            ModuleName = moduleName,
            Namespace = GetDomainNamespace(config),
            Properties = properties,
            Relations = relations,
            HasRelations = relations.Any(),
            Comment = $"{entityName}实体", // EntityDefinition没有Comment属性
            HasComment = true,
            IsMicroservice = isMicroservice,
            ServiceName = config.MicroserviceConfig?.ServiceName ?? moduleName,

            // ABP特性
            IsAuditedEntity = true, // 默认使用审计实体
            BaseClass = "AuditedAggregateRoot<Guid>",

            // 命名空间引用
            Usings = GetRequiredUsings(entity, config)
        };
    }

    /// <summary>
    /// 生成实体代码
    /// </summary>
    private async Task<string> GenerateEntityAsync(object templateData)
    {
        try
        {
            // 使用Handlebars模板渲染
            return await _templateManager.RenderTemplateAsync("DomainEntity", templateData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "生成实体代码失败");
            throw;
        }
    }

    /// <summary>
    /// 生成微服务配置代码
    /// </summary>
    private async Task<string> GenerateMicroserviceConfigAsync(LowCodeConfig config)
    {
        var templateData = new
        {
            ServiceName = config.MicroserviceConfig!.ServiceName,
            Namespace = GetDomainNamespace(config),
            ModuleName = config.ModuleName,
            HttpPort = config.MicroserviceConfig.HttpPort,
            GrpcPort = config.MicroserviceConfig.GrpcPort,
            EnableServiceDiscovery = config.MicroserviceConfig.EnableServiceDiscovery,
            EnableDistributedTracing = config.MicroserviceConfig.EnableDistributedTracing,
            EnableHealthChecks = config.MicroserviceConfig.EnableHealthChecks,
            DependentServices = config.MicroserviceConfig.DependentServices,
            AspireConfig = config.MicroserviceConfig.AspireConfig
        };

        return await _templateManager.RenderTemplateAsync("MicroserviceConfig", templateData);
    }

    /// <summary>
    /// 获取实体文件路径
    /// </summary>
    private string GetEntityFilePath(EntityDefinition entity, LowCodeConfig config)
    {
        if (config.IsMicroservice)
        {
            // 微服务模式：src/services/{ServiceName}/{ServiceName}.Domain/Entities/{EntityName}.cs
            var serviceName = config.MicroserviceConfig!.ServiceName;
            return System.IO.Path.Combine(
                config.OutputPaths.MicroserviceRootPath,
                serviceName,
                $"{serviceName}.Domain",
                "Entities",
                $"{entity.EntityName}.cs");
        }
        else
        {
            // 单体模式：src/SmartAbp.Domain/Entities/{EntityName}.cs
            return System.IO.Path.Combine(
                config.OutputPaths.DomainPath,
                "Entities",
                $"{entity.EntityName}.cs");
        }
    }

    /// <summary>
    /// 获取微服务配置文件路径
    /// </summary>
    private string GetMicroserviceConfigFilePath(LowCodeConfig config)
    {
        var serviceName = config.MicroserviceConfig!.ServiceName;
        return System.IO.Path.Combine(
            config.OutputPaths.MicroserviceRootPath,
            serviceName,
            $"{serviceName}.Domain",
            "ServiceConfiguration.cs");
    }

    /// <summary>
    /// 获取Domain命名空间
    /// </summary>
    private string GetDomainNamespace(LowCodeConfig config)
    {
        if (config.IsMicroservice)
        {
            return $"{config.MicroserviceConfig!.ServiceName}.Domain";
        }
        else
        {
            return "SmartAbp.Domain";
        }
    }

    /// <summary>
    /// 获取所需的using语句
    /// </summary>
    private List<string> GetRequiredUsings(EntityDefinition entity, LowCodeConfig config)
    {
        var usings = new List<string>
        {
            "System",
            "Volo.Abp.Domain.Entities.Auditing"
        };

        // 如果有关系，添加集合命名空间
        if (entity.Relations != null && entity.Relations.Any())
        {
            usings.Add("System.Collections.Generic");
        }

        // 如果是微服务模式，可能需要额外的命名空间
        if (config.IsMicroservice)
        {
            // 可以根据需要添加微服务特定的命名空间
        }

        return usings.Distinct().OrderBy(u => u).ToList();
    }

    /// <summary>
    /// 映射数据类型到C#类型
    /// </summary>
    private string MapToCSharpType(string type)
    {
        return type.ToLower() switch
        {
            "string" => "string",
            "text" => "string",
            "int" => "int",
            "integer" => "int",
            "long" => "long",
            "decimal" => "decimal",
            "double" => "double",
            "float" => "float",
            "bool" => "bool",
            "boolean" => "bool",
            "datetime" => "DateTime",
            "date" => "DateTime",
            "time" => "TimeSpan",
            "guid" => "Guid",
            "uuid" => "Guid",
            "byte[]" => "byte[]",
            "binary" => "byte[]",
            _ => "string" // 默认为string
        };
    }
}

/// <summary>
/// Domain生成器输入
/// </summary>
public class DomainGeneratorInput
{
    /// <summary>
    /// 低代码配置
    /// </summary>
    public required LowCodeConfig Config { get; set; }
}

/// <summary>
/// Domain生成器输出
/// </summary>
public class DomainGeneratorOutput
{
    /// <summary>
    /// 生成的文件 (文件路径 -> 文件内容)
    /// </summary>
    public Dictionary<string, string> GeneratedFiles { get; set; } = new();

    /// <summary>
    /// 生成的实体数量
    /// </summary>
    public int EntityCount { get; set; }

    /// <summary>
    /// Domain命名空间
    /// </summary>
    public string Namespace { get; set; } = string.Empty;

    /// <summary>
    /// 是否微服务模式
    /// </summary>
    public bool IsMicroserviceMode { get; set; }
}

