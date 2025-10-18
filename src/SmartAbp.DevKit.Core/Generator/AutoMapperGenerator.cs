using System;
using System.Linq;
using System.Threading.Tasks;
using HandlebarsDotNet;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Templates;
using SmartAbp.DevKit.Core.Helpers;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// AutoMapper配置生成器
/// Phase 2核心组件 - 生成Entity↔DTO映射配置
/// </summary>
public class AutoMapperGenerator : CodeGeneratorFramework<Guid, string>
{
    private readonly UnifiedMetadataSDK _metadataSDK;
    private readonly TemplateManager _templateManager;

    public AutoMapperGenerator(
        UnifiedMetadataSDK metadataSDK,
        TemplateManager templateManager)
    {
        _metadataSDK = metadataSDK;
        _templateManager = templateManager;
        
        // 注册自定义Helpers
        _templateManager.RegisterHelpers();
    }

    public override async Task<string> GenerateAsync(Guid entityId)
    {
        // 1. 验证输入
        var validation = await ValidateInputAsync(entityId);
        if (!validation.IsValid)
        {
            throw new InvalidOperationException($"输入验证失败: {validation.ErrorMessage}");
        }

        // 2. 获取元数据
        var entity = _metadataSDK.GetEntity(entityId);
        if (entity == null)
            throw new InvalidOperationException($"Entity {entityId} not found");

        var properties = _metadataSDK.GetProperties(entityId);
        var primaryKeyType = _metadataSDK.GetPrimaryKeyType(entityId);

        // 3. 准备模板数据
        var templateData = PrepareTemplateData(entity, properties, primaryKeyType);

        // 4. 生成AutoMapper配置代码
        return GenerateAutoMapperProfile(templateData);
    }

    public override Task<ValidationResult> ValidateInputAsync(Guid entityId)
    {
        if (_metadataSDK.GetEntity(entityId) == null)
        {
            return Task.FromResult(ValidationResult.Fail($"Entity with ID {entityId} not found."));
        }
        return Task.FromResult(ValidationResult.Success());
    }

    /// <summary>
    /// 准备模板数据
    /// </summary>
    private object PrepareTemplateData(dynamic entity, dynamic properties, string primaryKeyType)
    {
        var entityName = entity.Name;

        // 分析需要自定义映射的属性
        var customMappings = ((IEnumerable<dynamic>)properties)
            .Where(p => p.Type == "DateTime" || p.Type == "DateTimeOffset" || p.Type.Contains("[]"))
            .Select(p => new
            {
                p.Name,
                p.Type,
                NeedsCustomMapping = true,
                MappingLogic = GetCustomMappingLogic(p.Type)
            })
            .ToList();

        return new
        {
            EntityName = entityName,
            PrimaryKeyType = primaryKeyType,
            
            // 命名空间
            Namespace = $"SmartAbp.Application.{entityName}",
            ContractsNamespace = $"SmartAbp.Application.Contracts.{entityName}",
            DomainNamespace = $"SmartAbp.Domain.Entities.{entityName}",
            
            // DTO命名
            DtoName = $"{entityName}Dto",
            CreateDtoName = $"Create{entityName}Dto",
            UpdateDtoName = $"Update{entityName}Dto",
            
            // 自定义映射
            HasCustomMappings = customMappings.Any(),
            CustomMappings = customMappings,
            
            // 时间戳
            GeneratedTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            Year = DateTime.Now.Year
        };
    }

    /// <summary>
    /// 获取自定义映射逻辑
    /// </summary>
    private string GetCustomMappingLogic(string propertyType)
    {
        return propertyType switch
        {
            "DateTime" => "使用UTC时间转换",
            "DateTimeOffset" => "时区感知转换",
            _ when propertyType.Contains("[]") => "数组/集合转换",
            _ => "标准映射"
        };
    }

    /// <summary>
    /// 生成AutoMapper Profile代码
    /// </summary>
    private string GenerateAutoMapperProfile(object templateData)
    {
        var templateSource = @"using AutoMapper;
using {{ContractsNamespace}}.Dtos;
using {{DomainNamespace}};

namespace {{Namespace}}
{
    /// <summary>
    /// {{EntityName}} AutoMapper配置
    /// 生成时间: {{GeneratedTime}}
    /// </summary>
    public class {{EntityName}}AutoMapperProfile : Profile
    {
        public {{EntityName}}AutoMapperProfile()
        {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Entity → DTO 映射
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            
            CreateMap<{{EntityName}}, {{DtoName}}>();
{{#if HasCustomMappings}}
                // 自定义映射（如果需要）
                // .ForMember(dest => dest.PropertyName, opt => opt.MapFrom(src => src.CustomLogic));
{{/if}}

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // CreateDTO → Entity 映射
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            
            CreateMap<{{CreateDtoName}}, {{EntityName}}>(MemberList.Source)
                // 忽略由基类或框架管理的属性
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreationTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatorId, opt => opt.Ignore());
{{#if HasCustomMappings}}
                // 自定义创建映射
                // .ForMember(dest => dest.PropertyName, opt => opt.MapFrom(src => src.CustomLogic));
{{/if}}

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // UpdateDTO → Entity 映射
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            
            CreateMap<{{UpdateDtoName}}, {{EntityName}}>(MemberList.Source)
                // 忽略由基类或框架管理的属性
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreationTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
                .ForMember(dest => dest.LastModificationTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifierId, opt => opt.Ignore());
{{#if HasCustomMappings}}
                // 自定义更新映射
                // .ForMember(dest => dest.PropertyName, opt => opt.MapFrom(src => src.CustomLogic));
{{/if}}
        }
    }
}
";

        var template = _templateManager.CompileTemplate(templateSource);
        return template(templateData);
    }
}

