using System;
using System.Threading.Tasks;
using HandlebarsDotNet;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Templates;
using SmartAbp.DevKit.Core.Helpers;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// AppService生成器
/// Phase 2核心组件 - 生成完整的应用服务层代码
/// </summary>
public class AppServiceGenerator : CodeGeneratorFramework<Guid, AppServiceGeneratorOutput>
{
    private readonly UnifiedMetadataSDK _metadataSDK;
    private readonly TemplateManager _templateManager;

    public AppServiceGenerator(
        UnifiedMetadataSDK metadataSDK,
        TemplateManager templateManager)
    {
        _metadataSDK = metadataSDK;
        _templateManager = templateManager;
        
        // 注册自定义Helpers
        _templateManager.RegisterHelpers();
    }

    public override async Task<AppServiceGeneratorOutput> GenerateAsync(Guid entityId)
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

        // 4. 生成代码
        var interfaceCode = GenerateInterface(templateData);
        var implementationCode = GenerateImplementation(templateData);

        return new AppServiceGeneratorOutput
        {
            InterfaceCode = interfaceCode,
            ImplementationCode = implementationCode,
            InterfaceName = $"I{entity.Name}AppService",
            ClassName = $"{entity.Name}AppService",
            Namespace = $"SmartAbp.Application.{entity.Name}",
            ContractsNamespace = $"SmartAbp.Application.Contracts.{entity.Name}"
        };
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

        return new
        {
            EntityName = entityName,
            EntityNamePlural = entityNamePlural,
            EntityNameCamel = entityNameCamel,
            PrimaryKeyType = primaryKeyType,
            Namespace = $"SmartAbp.Application.{entityName}",
            ContractsNamespace = $"SmartAbp.Application.Contracts.{entityName}",
            DomainNamespace = $"SmartAbp.Domain.Entities.{entityName}",
            HasDescription = !string.IsNullOrEmpty(entity.Description),
            Description = entity.Description ?? $"{entityName}应用服务",
            
            // DTO命名
            DtoName = $"{entityName}Dto",
            CreateDtoName = $"Create{entityName}Dto",
            UpdateDtoName = $"Update{entityName}Dto",
            GetListInputName = $"Get{entityNamePlural}Input",
            
            // 属性列表
            Properties = properties,
            
            // 时间戳
            GeneratedTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            Year = DateTime.Now.Year
        };
    }

    /// <summary>
    /// 生成接口代码
    /// </summary>
    private string GenerateInterface(object templateData)
    {
        var templateSource = @"using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using {{ContractsNamespace}}.Dtos;

namespace {{ContractsNamespace}}
{
    /// <summary>
    /// {{EntityName}}应用服务接口
    /// 生成时间: {{GeneratedTime}}
    /// </summary>
    public interface I{{EntityName}}AppService : ICrudAppService<
        {{DtoName}},
        {{PrimaryKeyType}},
        {{GetListInputName}},
        {{CreateDtoName}},
        {{UpdateDtoName}}>
    {
        // 基础CRUD操作已由ICrudAppService提供：
        // - GetAsync({{PrimaryKeyType}} id)
        // - GetListAsync({{GetListInputName}} input)
        // - CreateAsync({{CreateDtoName}} input)
        // - UpdateAsync({{PrimaryKeyType}} id, {{UpdateDtoName}} input)
        // - DeleteAsync({{PrimaryKeyType}} id)

        // 可以在这里添加自定义业务方法
        // 例如：
        // Task<{{DtoName}}> GetByNameAsync(string name);
        // Task BatchDeleteAsync(List<{{PrimaryKeyType}}> ids);
    }
}
";

        var template = _templateManager.CompileTemplate(templateSource);
        return template(templateData);
    }

    /// <summary>
    /// 生成实现类代码
    /// </summary>
    private string GenerateImplementation(object templateData)
    {
        var templateSource = @"using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using {{ContractsNamespace}};
using {{ContractsNamespace}}.Dtos;
using {{DomainNamespace}};
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace {{Namespace}}
{
    /// <summary>
    /// {{EntityName}}应用服务实现
    /// 生成时间: {{GeneratedTime}}
    /// </summary>
    public class {{EntityName}}AppService : CrudAppService<
        {{EntityName}},
        {{DtoName}},
        {{PrimaryKeyType}},
        {{GetListInputName}},
        {{CreateDtoName}},
        {{UpdateDtoName}}>, I{{EntityName}}AppService
    {
        private readonly ILogger<{{EntityName}}AppService> _logger;

        public {{EntityName}}AppService(
            IRepository<{{EntityName}}, {{PrimaryKeyType}}> repository,
            ILogger<{{EntityName}}AppService> logger) : base(repository)
        {
            _logger = logger;
        }

        /// <summary>
        /// 创建查询过滤器
        /// </summary>
        protected override async Task<IQueryable<{{EntityName}}>> CreateFilteredQueryAsync({{GetListInputName}} input)
        {
            var queryable = await Repository.GetQueryableAsync();

            return queryable
                .WhereIf(!string.IsNullOrWhiteSpace(input.Filter),
                    x => x.Name.Contains(input.Filter!));
                // 根据实际属性添加更多过滤条件
        }

        /// <summary>
        /// 创建实体（可重写以添加自定义逻辑）
        /// </summary>
        public override async Task<{{DtoName}}> CreateAsync({{CreateDtoName}} input)
        {
            _logger.LogInformation(""创建{{EntityName}}: {Name}"", input.Name);

            // 调用基类方法
            var result = await base.CreateAsync(input);

            _logger.LogInformation(""{{EntityName}}创建成功: {Id}"", result.Id);
            return result;
        }

        /// <summary>
        /// 更新实体（可重写以添加自定义逻辑）
        /// </summary>
        public override async Task<{{DtoName}}> UpdateAsync({{PrimaryKeyType}} id, {{UpdateDtoName}} input)
        {
            _logger.LogInformation(""更新{{EntityName}}: {Id}"", id);

            // 调用基类方法
            var result = await base.UpdateAsync(id, input);

            _logger.LogInformation(""{{EntityName}}更新成功: {Id}"", id);
            return result;
        }

        /// <summary>
        /// 删除实体（可重写以添加自定义逻辑）
        /// </summary>
        public override async Task DeleteAsync({{PrimaryKeyType}} id)
        {
            _logger.LogInformation(""删除{{EntityName}}: {Id}"", id);

            // 调用基类方法
            await base.DeleteAsync(id);

            _logger.LogInformation(""{{EntityName}}删除成功: {Id}"", id);
        }

        // 在这里添加自定义业务方法
        // 例如：
        // public async Task<{{DtoName}}> GetByNameAsync(string name)
        // {
        //     var query = await Repository.GetQueryableAsync();
        //     var entity = await AsyncExecuter.FirstOrDefaultAsync(
        //         query.Where(x => x.Name == name)
        //     );
        //     
        //     if (entity == null)
        //     {
        //         throw new Volo.Abp.BusinessException($""{{EntityName}} with name '{name}' not found."");
        //     }
        //     
        //     return await MapToGetOutputDtoAsync(entity);
        // }
    }
}
";

        var template = _templateManager.CompileTemplate(templateSource);
        return template(templateData);
    }
}

/// <summary>
/// AppService生成器输出
/// </summary>
public class AppServiceGeneratorOutput
{
    /// <summary>
    /// 接口代码
    /// </summary>
    public string InterfaceCode { get; set; } = default!;

    /// <summary>
    /// 实现类代码
    /// </summary>
    public string ImplementationCode { get; set; } = default!;

    /// <summary>
    /// 接口名称
    /// </summary>
    public string InterfaceName { get; set; } = default!;

    /// <summary>
    /// 类名
    /// </summary>
    public string ClassName { get; set; } = default!;

    /// <summary>
    /// 命名空间
    /// </summary>
    public string Namespace { get; set; } = default!;

    /// <summary>
    /// Contracts命名空间
    /// </summary>
    public string ContractsNamespace { get; set; } = default!;
}

