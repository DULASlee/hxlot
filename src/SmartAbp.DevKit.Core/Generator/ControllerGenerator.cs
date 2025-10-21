using System;
using System.Threading.Tasks;
using HandlebarsDotNet;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Templates;
using SmartAbp.DevKit.Core.Helpers;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// Controller生成器
/// Phase 2核心组件 - 生成RESTful API控制器
/// </summary>
public class ControllerGenerator : CodeGeneratorFramework<Guid, string>
{
    private readonly UnifiedMetadataSDK _metadataSDK;
    private readonly TemplateManager _templateManager;

    public ControllerGenerator(
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

        // 4. 生成Controller代码
        return GenerateController(templateData);
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
        var entityNamePlural = StringHelper.Pluralize(entityName);
        var entityNameCamel = StringHelper.ToCamelCase(entityName);
        var entityNameKebab = StringHelper.ToKebabCase(entityName);

        return new
        {
            EntityName = entityName,
            EntityNamePlural = entityNamePlural,
            EntityNameCamel = entityNameCamel,
            EntityNameKebab = entityNameKebab,
            PrimaryKeyType = primaryKeyType,

            // 命名空间
            Namespace = $"SmartAbp.HttpApi.Controllers.{entityName}",
            ContractsNamespace = $"SmartAbp.Application.Contracts.{entityName}",

            // DTO命名
            DtoName = $"{entityName}Dto",
            CreateDtoName = $"Create{entityName}Dto",
            UpdateDtoName = $"Update{entityName}Dto",
            GetListInputName = $"Get{entityNamePlural}Input",

            // 路由配置
            RoutePrefix = $"api/app/{StringHelper.ToKebabCase(entityNamePlural)}",

            // 描述
            Description = entity.Description ?? $"{entityName} RESTful API",

            // 时间戳
            GeneratedTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            Year = DateTime.Now.Year
        };
    }

    /// <summary>
    /// 生成Controller代码
    /// </summary>
    private string GenerateController(object templateData)
    {
        var templateSource = @"using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using {{ContractsNamespace}};
using {{ContractsNamespace}}.Dtos;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;

namespace {{Namespace}}
{
    /// <summary>
    /// {{EntityName}} RESTful API 控制器
    /// 生成时间: {{GeneratedTime}}
    /// </summary>
    [Area(""app"")]
    [RemoteService(Name = ""SmartAbp"")]
    [Route(""{{RoutePrefix}}"")]
    public partial class {{EntityName}}Controller : AbpControllerBase, I{{EntityName}}AppService
    {
        private readonly I{{EntityName}}AppService _{{EntityNameCamel}}AppService;

        public {{EntityName}}Controller(I{{EntityName}}AppService {{EntityNameCamel}}AppService)
        {
            _{{EntityNameCamel}}AppService = {{EntityNameCamel}}AppService;
        }

        /// <summary>
        /// 获取{{EntityName}}列表（分页）
        /// </summary>
        /// <param name=""input"">查询参数</param>
        /// <returns>分页结果</returns>
        [HttpGet]
        public virtual Task<PagedResultDto<{{DtoName}}>> GetListAsync({{GetListInputName}} input)
        {
            return _{{EntityNameCamel}}AppService.GetListAsync(input);
        }

        /// <summary>
        /// 根据ID获取{{EntityName}}
        /// </summary>
        /// <param name=""id"">实体ID</param>
        /// <returns>实体详情</returns>
        [HttpGet(""{id}"")]
        public virtual Task<{{DtoName}}> GetAsync({{PrimaryKeyType}} id)
        {
            return _{{EntityNameCamel}}AppService.GetAsync(id);
        }

        /// <summary>
        /// 创建{{EntityName}}
        /// </summary>
        /// <param name=""input"">创建数据</param>
        /// <returns>创建的实体</returns>
        [HttpPost]
        public virtual Task<{{DtoName}}> CreateAsync({{CreateDtoName}} input)
        {
            return _{{EntityNameCamel}}AppService.CreateAsync(input);
        }

        /// <summary>
        /// 更新{{EntityName}}
        /// </summary>
        /// <param name=""id"">实体ID</param>
        /// <param name=""input"">更新数据</param>
        /// <returns>更新后的实体</returns>
        [HttpPut(""{id}"")]
        public virtual Task<{{DtoName}}> UpdateAsync({{PrimaryKeyType}} id, {{UpdateDtoName}} input)
        {
            return _{{EntityNameCamel}}AppService.UpdateAsync(id, input);
        }

        /// <summary>
        /// 删除{{EntityName}}
        /// </summary>
        /// <param name=""id"">实体ID</param>
        [HttpDelete(""{id}"")]
        public virtual Task DeleteAsync({{PrimaryKeyType}} id)
        {
            return _{{EntityNameCamel}}AppService.DeleteAsync(id);
        }
    }
}
";

        var template = _templateManager.CompileTemplate(templateSource);
        return template(templateData);
    }
}

