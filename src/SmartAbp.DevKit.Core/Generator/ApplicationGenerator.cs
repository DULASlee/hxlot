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
/// Application应用服务生成器
/// Phase 2核心组件 - 生成Application层AppService代码（支持单体/微服务双模式）
/// </summary>
public class ApplicationGenerator : CodeGeneratorFramework<ApplicationGeneratorInput, ApplicationGeneratorOutput>
{
    private readonly ILogger<ApplicationGenerator> _logger;
    private readonly UnifiedMetadataSDK _metadataSDK;
    private readonly TemplateManager _templateManager;

    public ApplicationGenerator(
        ILogger<ApplicationGenerator> logger,
        UnifiedMetadataSDK metadataSDK,
        TemplateManager templateManager)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _metadataSDK = metadataSDK ?? throw new ArgumentNullException(nameof(metadataSDK));
        _templateManager = templateManager ?? throw new ArgumentNullException(nameof(templateManager));

        // 注册自定义Helpers
        _templateManager.RegisterHelpers();
    }

    public override async Task<ApplicationGeneratorOutput> GenerateAsync(ApplicationGeneratorInput input)
    {
        _logger.LogInformation(
            "开始生成Application层代码，模块: {ModuleName}, 模式: {Mode}",
            input.Config.ModuleName,
            input.Config.IsMicroservice ? "微服务" : "单体");

        // 1. 验证输入
        var validation = await ValidateInputAsync(input);
        if (!validation.IsValid)
        {
            throw new InvalidOperationException($"输入验证失败: {validation.ErrorMessage}");
        }

        var generatedFiles = new Dictionary<string, string>();

        // 2. 生成每个实体的AppService代码
        foreach (var entity in input.Config.Entities)
        {
            if (!entity.GenerateCrud)
            {
                _logger.LogDebug("实体 {EntityName} 标记为不生成CRUD，跳过", entity.EntityName);
                continue;
            }

            _logger.LogDebug("正在生成AppService: {EntityName}", entity.EntityName);

            // 准备模板数据
            var templateData = PrepareTemplateData(entity, input.Config);

            // 生成IAppService接口
            var interfaceCode = await GenerateInterfaceAsync(templateData);
            var interfacePath = GetInterfaceFilePath(entity, input.Config);
            generatedFiles[interfacePath] = interfaceCode;

            // 生成AppService实现类
            var implementationCode = await GenerateImplementationAsync(templateData);
            var implementationPath = GetImplementationFilePath(entity, input.Config);
            generatedFiles[implementationPath] = implementationCode;

            _logger.LogDebug(
                "实体 {EntityName} 的AppService生成完成，接口: {InterfacePath}, 实现: {ImplPath}",
                entity.EntityName,
                interfacePath,
                implementationPath);
        }

        // 3. 如果是微服务模式，生成额外的配置文件
        if (input.Config.IsMicroservice && input.Config.MicroserviceConfig != null)
        {
            var appHostConfigCode = await GenerateMicroserviceAppConfigAsync(input.Config);
            var configPath = GetMicroserviceAppConfigFilePath(input.Config);
            generatedFiles[configPath] = appHostConfigCode;

            _logger.LogInformation(
                "微服务Application配置文件已生成: {FilePath}",
                configPath);
        }

        _logger.LogInformation(
            "Application层代码生成完成，共生成 {Count} 个文件",
            generatedFiles.Count);

        return new ApplicationGeneratorOutput
        {
            GeneratedFiles = generatedFiles,
            AppServiceCount = input.Config.Entities.Count(e => e.GenerateCrud),
            Namespace = GetApplicationNamespace(input.Config),
            ContractsNamespace = GetContractsNamespace(input.Config),
            IsMicroserviceMode = input.Config.IsMicroservice
        };
    }

    public override Task<ValidationResult> ValidateInputAsync(ApplicationGeneratorInput input)
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

        // 验证每个需要生成CRUD的实体
        foreach (var entity in input.Config.Entities.Where(e => e.GenerateCrud))
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
        var entityNamePlural = Pluralize(entityName);
        var entityNameCamel = ToCamelCase(entityName);
        var moduleName = config.ModuleName;
        var isMicroservice = config.IsMicroservice;

        // 处理属性列表
        var properties = entity.Properties.Select(p => new
        {
            Name = p.Name,
            Type = MapToCSharpType(p.Type),
            IsRequired = p.IsRequired,
            MaxLength = p.MaxLength,
            HasMaxLength = p.MaxLength.HasValue && p.MaxLength.Value > 0
        }).ToList();

        // 主键类型（默认Guid）
        var primaryKeyType = "Guid";

        return new
        {
            EntityName = entityName,
            EntityNamePlural = entityNamePlural,
            EntityNameCamel = entityNameCamel,
            ModuleName = moduleName,
            PrimaryKeyType = primaryKeyType,

            // 命名空间
            Namespace = GetApplicationNamespace(config),
            ContractsNamespace = GetContractsNamespace(config),
            DomainNamespace = GetDomainNamespace(config),

            // DTO命名
            DtoName = $"{entityName}Dto",
            CreateDtoName = $"Create{entityName}Dto",
            UpdateDtoName = $"Update{entityName}Dto",
            GetListInputName = $"Get{entityNamePlural}Input",

            // 属性列表
            Properties = properties,
            HasProperties = properties.Any(),
            FirstProperty = properties.FirstOrDefault()?.Name ?? "Name",

            // 微服务标识
            IsMicroservice = isMicroservice,
            ServiceName = config.MicroserviceConfig?.ServiceName ?? moduleName,

            // 时间戳
            GeneratedTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            Year = DateTime.Now.Year
        };
    }

    /// <summary>
    /// 生成AppService接口代码
    /// </summary>
    private async Task<string> GenerateInterfaceAsync(object templateData)
    {
        try
        {
            return await _templateManager.RenderTemplateAsync("AppServiceInterface", templateData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "生成AppService接口代码失败");
            throw;
        }
    }

    /// <summary>
    /// 生成AppService实现类代码
    /// </summary>
    private async Task<string> GenerateImplementationAsync(object templateData)
    {
        try
        {
            return await _templateManager.RenderTemplateAsync("AppServiceImplementation", templateData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "生成AppService实现类代码失败");
            throw;
        }
    }

    /// <summary>
    /// 生成微服务Application配置代码
    /// </summary>
    private async Task<string> GenerateMicroserviceAppConfigAsync(LowCodeConfig config)
    {
        var templateData = new
        {
            ServiceName = config.MicroserviceConfig!.ServiceName,
            Namespace = GetApplicationNamespace(config),
            ModuleName = config.ModuleName,
            GeneratedTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
        };

        return await _templateManager.RenderTemplateAsync("MicroserviceAppConfig", templateData);
    }

    /// <summary>
    /// 获取接口文件路径
    /// </summary>
    private string GetInterfaceFilePath(EntityDefinition entity, LowCodeConfig config)
    {
        if (config.IsMicroservice)
        {
            // 微服务模式：src/services/{ServiceName}/{ServiceName}.Application.Contracts/{EntityName}/I{EntityName}AppService.cs
            var serviceName = config.MicroserviceConfig!.ServiceName;
            return System.IO.Path.Combine(
                config.OutputPaths.MicroserviceRootPath,
                serviceName,
                $"{serviceName}.Application.Contracts",
                entity.EntityName,
                $"I{entity.EntityName}AppService.cs");
        }
        else
        {
            // 单体模式：src/SmartAbp.Application.Contracts/{EntityName}/I{EntityName}AppService.cs
            return System.IO.Path.Combine(
                config.OutputPaths.ApplicationPath.Replace("Application", "Application.Contracts"),
                entity.EntityName,
                $"I{entity.EntityName}AppService.cs");
        }
    }

    /// <summary>
    /// 获取实现类文件路径
    /// </summary>
    private string GetImplementationFilePath(EntityDefinition entity, LowCodeConfig config)
    {
        if (config.IsMicroservice)
        {
            // 微服务模式：src/services/{ServiceName}/{ServiceName}.Application/{EntityName}/{EntityName}AppService.cs
            var serviceName = config.MicroserviceConfig!.ServiceName;
            return System.IO.Path.Combine(
                config.OutputPaths.MicroserviceRootPath,
                serviceName,
                $"{serviceName}.Application",
                entity.EntityName,
                $"{entity.EntityName}AppService.cs");
        }
        else
        {
            // 单体模式：src/SmartAbp.Application/{EntityName}/{EntityName}AppService.cs
            return System.IO.Path.Combine(
                config.OutputPaths.ApplicationPath,
                entity.EntityName,
                $"{entity.EntityName}AppService.cs");
        }
    }

    /// <summary>
    /// 获取微服务Application配置文件路径
    /// </summary>
    private string GetMicroserviceAppConfigFilePath(LowCodeConfig config)
    {
        var serviceName = config.MicroserviceConfig!.ServiceName;
        return System.IO.Path.Combine(
            config.OutputPaths.MicroserviceRootPath,
            serviceName,
            $"{serviceName}.Application",
            "ApplicationServiceConfiguration.cs");
    }

    /// <summary>
    /// 获取Application命名空间
    /// </summary>
    private string GetApplicationNamespace(LowCodeConfig config)
    {
        if (config.IsMicroservice)
        {
            return $"{config.MicroserviceConfig!.ServiceName}.Application";
        }
        else
        {
            return "SmartAbp.Application";
        }
    }

    /// <summary>
    /// 获取Contracts命名空间
    /// </summary>
    private string GetContractsNamespace(LowCodeConfig config)
    {
        if (config.IsMicroservice)
        {
            return $"{config.MicroserviceConfig!.ServiceName}.Application.Contracts";
        }
        else
        {
            return "SmartAbp.Application.Contracts";
        }
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
            _ => "string"
        };
    }

    /// <summary>
    /// 简单的复数化实现
    /// </summary>
    private string Pluralize(string word)
    {
        if (string.IsNullOrWhiteSpace(word))
            return word;

        // 简单规则
        if (word.EndsWith("y", StringComparison.OrdinalIgnoreCase) && !IsVowel(word[^2]))
        {
            return word[..^1] + "ies";
        }
        else if (word.EndsWith("s", StringComparison.OrdinalIgnoreCase) ||
                 word.EndsWith("x", StringComparison.OrdinalIgnoreCase) ||
                 word.EndsWith("ch", StringComparison.OrdinalIgnoreCase) ||
                 word.EndsWith("sh", StringComparison.OrdinalIgnoreCase))
        {
            return word + "es";
        }
        else
        {
            return word + "s";
        }
    }

    /// <summary>
    /// 转换为驼峰命名
    /// </summary>
    private string ToCamelCase(string str)
    {
        if (string.IsNullOrWhiteSpace(str) || str.Length == 0)
            return str;

        return char.ToLowerInvariant(str[0]) + str.Substring(1);
    }

    /// <summary>
    /// 判断是否为元音字母
    /// </summary>
    private bool IsVowel(char c)
    {
        return "aeiouAEIOU".Contains(c);
    }
}

/// <summary>
/// Application生成器输入
/// </summary>
public class ApplicationGeneratorInput
{
    /// <summary>
    /// 低代码配置
    /// </summary>
    public required LowCodeConfig Config { get; set; }
}

/// <summary>
/// Application生成器输出
/// </summary>
public class ApplicationGeneratorOutput
{
    /// <summary>
    /// 生成的文件 (文件路径 -> 文件内容)
    /// </summary>
    public Dictionary<string, string> GeneratedFiles { get; set; } = new();

    /// <summary>
    /// 生成的AppService数量
    /// </summary>
    public int AppServiceCount { get; set; }

    /// <summary>
    /// Application命名空间
    /// </summary>
    public string Namespace { get; set; } = string.Empty;

    /// <summary>
    /// Contracts命名空间
    /// </summary>
    public string ContractsNamespace { get; set; } = string.Empty;

    /// <summary>
    /// 是否微服务模式
    /// </summary>
    public bool IsMicroserviceMode { get; set; }
}

