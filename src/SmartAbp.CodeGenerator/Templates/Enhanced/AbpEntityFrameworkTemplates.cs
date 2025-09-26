using System;
using System.Linq;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Templates.Enhanced
{
    /// <summary>
    /// 🔥 ABP + Entity Framework 增强模板库
    /// 提供企业级、高质量的代码生成模板
    /// </summary>
    public static class AbpEntityFrameworkTemplates
    {
        /// <summary>
        /// 生成企业级ABP实体模板
        /// </summary>
        public static string GenerateEnterpriseEntity(EnhancedEntityModelDto entity)
        {
            return $@"using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.Domain.Entities.Events.Distributed;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.Domain.{entity.Module ?? "Entities"}
{{
    /// <summary>
    /// {entity.DisplayName ?? entity.Name} - 企业级ABP实体
    /// 支持完整的审计、多租户、领域事件功能
    /// 生成时间: {DateTime.Now:yyyy-MM-dd HH:mm:ss}
    /// 技术栈: ABP Framework + Entity Framework Core
    /// </summary>
    [Serializable]
    public class {entity.Name} : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {{
        /// <summary>
        /// 租户ID - 多租户支持
        /// </summary>
        public virtual Guid? TenantId {{ get; protected set; }}

{GenerateEntityProperties(entity)}

        /// <summary>
        /// 私有构造函数 - DDD最佳实践
        /// </summary>
        protected {entity.Name}()
        {{
        }}

        /// <summary>
        /// 领域工厂方法 - 创建实体的唯一入口
        /// </summary>
        public {entity.Name}(
            Guid id{GenerateFactoryMethodParams(entity)},
            Guid? tenantId = null) : base(id)
        {{
            TenantId = tenantId;
{GenerateFactoryMethodBody(entity)}

            // 🔥 ABP领域事件 - 实体创建事件
            AddDistributedEvent(new {entity.Name}CreatedEvent
            {{
                EntityId = id,
                EntityName = ""{entity.Name}"",
                TenantId = tenantId,
                CreatedAt = Clock.Now
            }});
        }}

{GenerateBusinessMethods(entity)}

        /// <summary>
        /// 领域规则验证
        /// </summary>
        public override void Validate()
        {{
            base.Validate();
{GenerateValidationRules(entity)}
        }}
    }}

    /// <summary>
    /// {entity.Name} 创建领域事件
    /// </summary>
    [Serializable]
    public class {entity.Name}CreatedEvent : EtoBase
    {{
        public Guid EntityId {{ get; set; }}
        public string EntityName {{ get; set; }} = string.Empty;
        public Guid? TenantId {{ get; set; }}
        public DateTime CreatedAt {{ get; set; }}
    }}
}}";
        }

        /// <summary>
        /// 生成企业级ABP应用服务模板
        /// </summary>
        public static string GenerateEnterpriseAppService(EnhancedEntityModelDto entity)
        {
            return $@"using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.EventBus.Local;
using Volo.Abp.Uow;

namespace SmartAbp.Application.Services.{entity.Module ?? "Entities"}
{{
    /// <summary>
    /// {entity.DisplayName ?? entity.Name} 企业级应用服务
    /// 提供完整的CRUD操作、权限控制、事件处理
    /// 支持: 自动API、权限验证、审计日志、事务管理
    /// </summary>
    [RemoteService(Name = ""{entity.Name}"")]
    [Authorize(SmartAbpPermissions.{entity.Name}.Default)]
    public class {entity.Name}AppService : ApplicationService, I{entity.Name}AppService
    {{
        private readonly IRepository<{entity.Name}, Guid> _repository;
        private readonly ILocalEventBus _eventBus;

        public {entity.Name}AppService(
            IRepository<{entity.Name}, Guid> repository,
            ILocalEventBus eventBus)
        {{
            _repository = repository;
            _eventBus = eventBus;
        }}

        /// <summary>
        /// 获取{entity.DisplayName ?? entity.Name}详情
        /// </summary>
        [Authorize(SmartAbpPermissions.{entity.Name}.Default)]
        public virtual async Task<{entity.Name}Dto> GetAsync(Guid id)
        {{
            var entity = await _repository.GetAsync(id);
            return ObjectMapper.Map<{entity.Name}, {entity.Name}Dto>(entity);
        }}

        /// <summary>
        /// 获取{entity.DisplayName ?? entity.Name}分页列表
        /// </summary>
        [Authorize(SmartAbpPermissions.{entity.Name}.Default)]
        public virtual async Task<PagedResultDto<{entity.Name}Dto>> GetListAsync(Get{entity.Name}ListInput input)
        {{
            var totalCount = await _repository.GetCountAsync();
            var entities = await _repository.GetPagedListAsync(
                input.SkipCount, 
                input.MaxResultCount, 
                input.Sorting ?? nameof({entity.Name}.CreationTime));
            
            return new PagedResultDto<{entity.Name}Dto>(
                totalCount,
                ObjectMapper.Map<List<{entity.Name}>, List<{entity.Name}Dto>>(entities)
            );
        }}

        /// <summary>
        /// 创建{entity.DisplayName ?? entity.Name}
        /// </summary>
        [Authorize(SmartAbpPermissions.{entity.Name}.Create)]
        [UnitOfWork] // 自动事务管理
        public virtual async Task<{entity.Name}Dto> CreateAsync(Create{entity.Name}Dto input)
        {{
            // ABP自动验证输入参数
            var entity = new {entity.Name}(
                GuidGenerator.Create(){GenerateCreateMethodParams(entity)},
                CurrentTenant.Id);

            await _repository.InsertAsync(entity);

            // 发布创建完成事件
            await _eventBus.PublishAsync(new {entity.Name}CreatedApplicationEvent
            {{
                EntityId = entity.Id,
                CreatedBy = CurrentUser.Id ?? Guid.Empty
            }});

            return ObjectMapper.Map<{entity.Name}, {entity.Name}Dto>(entity);
        }}

        /// <summary>
        /// 更新{entity.DisplayName ?? entity.Name}
        /// </summary>
        [Authorize(SmartAbpPermissions.{entity.Name}.Update)]
        [UnitOfWork]
        public virtual async Task<{entity.Name}Dto> UpdateAsync(Guid id, Update{entity.Name}Dto input)
        {{
            var entity = await _repository.GetAsync(id);
            
            // 使用AutoMapper自动映射
            ObjectMapper.Map(input, entity);
            
            await _repository.UpdateAsync(entity);

            // 发布更新完成事件
            await _eventBus.PublishAsync(new {entity.Name}UpdatedApplicationEvent
            {{
                EntityId = entity.Id,
                UpdatedBy = CurrentUser.Id ?? Guid.Empty
            }});

            return ObjectMapper.Map<{entity.Name}, {entity.Name}Dto>(entity);
        }}

        /// <summary>
        /// 删除{entity.DisplayName ?? entity.Name}
        /// </summary>
        [Authorize(SmartAbpPermissions.{entity.Name}.Delete)]
        [UnitOfWork]
        public virtual async Task DeleteAsync(Guid id)
        {{
            var entity = await _repository.GetAsync(id);
            
            await _repository.DeleteAsync(entity);

            // 发布删除完成事件
            await _eventBus.PublishAsync(new {entity.Name}DeletedApplicationEvent
            {{
                EntityId = id,
                DeletedBy = CurrentUser.Id ?? Guid.Empty
            }});
        }}

{GenerateCustomBusinessMethods(entity)}
    }}

    // 应用层事件定义
    public class {entity.Name}CreatedApplicationEvent
    {{
        public Guid EntityId {{ get; set; }}
        public Guid CreatedBy {{ get; set; }}
        public DateTime OccurredAt {{ get; set; }} = DateTime.UtcNow;
    }}

    public class {entity.Name}UpdatedApplicationEvent
    {{
        public Guid EntityId {{ get; set; }}
        public Guid UpdatedBy {{ get; set; }}
        public DateTime OccurredAt {{ get; set; }} = DateTime.UtcNow;
    }}

    public class {entity.Name}DeletedApplicationEvent
    {{
        public Guid EntityId {{ get; set; }}
        public Guid DeletedBy {{ get; set; }}
        public DateTime OccurredAt {{ get; set; }} = DateTime.UtcNow;
    }}
}}";
        }

        /// <summary>
        /// 生成企业级DTO模板
        /// </summary>
        public static string GenerateEnterpriseDtos(EnhancedEntityModelDto entity)
        {
            return $@"using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.Application.Contracts.{entity.Module ?? "Entities"}
{{
    /// <summary>
    /// {entity.DisplayName ?? entity.Name} DTO - 企业级数据传输对象
    /// 支持完整的审计字段、多租户、验证规则
    /// </summary>
    public class {entity.Name}Dto : FullAuditedEntityDto<Guid>, IMultiTenant
    {{
        public Guid? TenantId {{ get; set; }}

{GenerateDtoProperties(entity)}
    }}

    /// <summary>
    /// 创建{entity.DisplayName ?? entity.Name}请求DTO
    /// </summary>
    public class Create{entity.Name}Dto : IValidatableObject
    {{
{GenerateCreateDtoProperties(entity)}

        /// <summary>
        /// 自定义验证规则
        /// </summary>
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {{
{GenerateCustomValidationRules(entity)}
            yield break;
        }}
    }}

    /// <summary>
    /// 更新{entity.DisplayName ?? entity.Name}请求DTO
    /// </summary>
    public class Update{entity.Name}Dto : IValidatableObject
    {{
{GenerateUpdateDtoProperties(entity)}

        /// <summary>
        /// 自定义验证规则
        /// </summary>
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {{
{GenerateCustomValidationRules(entity)}
            yield break;
        }}
    }}

    /// <summary>
    /// {entity.DisplayName ?? entity.Name}查询输入DTO
    /// </summary>
    public class Get{entity.Name}ListInput : PagedAndSortedResultRequestDto
    {{
        /// <summary>
        /// 搜索关键词
        /// </summary>
        public string? Filter {{ get; set; }}

{GenerateSearchProperties(entity)}
    }}
}}";
        }

        /// <summary>
        /// 生成AutoMapper配置模板
        /// </summary>
        public static string GenerateAutoMapperProfile(EnhancedEntityModelDto entity)
        {
            return $@"using AutoMapper;
using SmartAbp.Domain.{entity.Module ?? "Entities"};
using SmartAbp.Application.Contracts.{entity.Module ?? "Entities"};

namespace SmartAbp.Application
{{
    /// <summary>
    /// {entity.Name} AutoMapper配置 - 企业级对象映射
    /// </summary>
    public class {entity.Name}AutoMapperProfile : Profile
    {{
        public {entity.Name}AutoMapperProfile()
        {{
            // 实体到DTO的映射
            CreateMap<{entity.Name}, {entity.Name}Dto>()
{GenerateEntityToDtoMapping(entity)};

            // 创建DTO到实体的映射
            CreateMap<Create{entity.Name}Dto, {entity.Name}>()
                .ConstructUsing(src => new {entity.Name}(
                    Guid.NewGuid(){GenerateCreateConstructorMapping(entity)}))
{GenerateCreateDtoToEntityMapping(entity)};

            // 更新DTO到实体的映射
            CreateMap<Update{entity.Name}Dto, {entity.Name}>()
{GenerateUpdateDtoToEntityMapping(entity)};
        }}
    }}
}}";
        }

        // 辅助方法
        private static string GenerateEntityProperties(EnhancedEntityModelDto entity)
        {
            var properties = entity.Properties.Select(p =>
            {
                var validations = GeneratePropertyValidations(p);
                var documentation = !string.IsNullOrEmpty(p.Description) ? 
                    $"\n        /// <summary>\n        /// {p.Description}\n        /// </summary>" : "";
                
                return $@"{documentation}{validations}
        public virtual {GetCSharpType(p.Type)}{(p.IsRequired ? "" : "?")} {p.Name} {{ get; protected set; }}";
            });

            return string.Join("\n\n", properties);
        }

        private static string GeneratePropertyValidations(EntityPropertyDto property)
        {
            var validations = new List<string>();
            
            if (property.IsRequired)
                validations.Add("\n        [Required]");
            
            if (property.MaxLength > 0)
                validations.Add($"\n        [MaxLength({property.MaxLength})]");
            
            if (property.MinLength > 0)
                validations.Add($"\n        [MinLength({property.MinLength})]");

            return string.Join("", validations);
        }

        private static string GenerateFactoryMethodParams(EnhancedEntityModelDto entity)
        {
            var required = entity.Properties.Where(p => p.IsRequired && p.Name != "Id");
            return required.Any() ? ",\n            " + string.Join(",\n            ", 
                required.Select(p => $"{GetCSharpType(p.Type)} {ToCamelCase(p.Name)}")) : "";
        }

        private static string GenerateFactoryMethodBody(EnhancedEntityModelDto entity)
        {
            var required = entity.Properties.Where(p => p.IsRequired && p.Name != "Id");
            return string.Join("\n", required.Select(p => $"            Set{p.Name}({ToCamelCase(p.Name)});"));
        }

        private static string GenerateBusinessMethods(EnhancedEntityModelDto entity)
        {
            var methods = entity.Properties.Where(p => p.IsRequired).Select(p => $@"
        /// <summary>
        /// 设置{p.Name} - 业务规则验证
        /// </summary>
        public virtual void Set{p.Name}({GetCSharpType(p.Type)} {ToCamelCase(p.Name)})
        {{
            Check.NotNull({ToCamelCase(p.Name)}, nameof({ToCamelCase(p.Name)}));
            {(p.Type == "string" && p.MaxLength > 0 ? $"Check.Length({ToCamelCase(p.Name)}, nameof({ToCamelCase(p.Name)}), maxLength: {p.MaxLength});" : "")}
            
            {p.Name} = {ToCamelCase(p.Name)};
        }}");

            return string.Join("\n", methods);
        }

        private static string GenerateValidationRules(EnhancedEntityModelDto entity)
        {
            var rules = entity.Properties.Where(p => p.IsRequired).Select(p => 
                $"            Check.NotNull({p.Name}, nameof({p.Name}));");
            
            return string.Join("\n", rules);
        }

        private static string GenerateDtoProperties(EnhancedEntityModelDto entity)
        {
            return string.Join("\n\n", entity.Properties.Select(p =>
                $@"        /// <summary>
        /// {p.Description ?? p.Name}
        /// </summary>
        public {GetCSharpType(p.Type)}{(p.IsRequired ? "" : "?")} {p.Name} {{ get; set; }}"));
        }

        private static string GenerateCreateDtoProperties(EnhancedEntityModelDto entity)
        {
            var required = entity.Properties.Where(p => p.IsRequired && p.Name != "Id");
            return string.Join("\n\n", required.Select(p =>
            {
                var validations = new List<string>();
                if (p.IsRequired) validations.Add("        [Required]");
                if (p.MaxLength > 0) validations.Add($"        [MaxLength({p.MaxLength})]");
                if (p.MinLength > 0) validations.Add($"        [MinLength({p.MinLength})]");

                var validationStr = validations.Any() ? string.Join("\n", validations) + "\n" : "";
                
                return $@"{validationStr}        public {GetCSharpType(p.Type)} {p.Name} {{ get; set; }}";
            }));
        }

        private static string GenerateUpdateDtoProperties(EnhancedEntityModelDto entity)
        {
            var updateable = entity.Properties.Where(p => p.Name != "Id");
            return string.Join("\n\n", updateable.Select(p =>
                $"        public {GetCSharpType(p.Type)}{(p.IsRequired ? "" : "?")} {p.Name} {{ get; set; }}"));
        }

        private static string GenerateCustomValidationRules(EnhancedEntityModelDto entity)
        {
            // 生成自定义验证规则示例
            var nameProperty = entity.Properties.FirstOrDefault(p => p.Name.Contains("Name"));
            if (nameProperty != null)
            {
                return $@"            // 示例：自定义验证规则
            if (string.IsNullOrWhiteSpace({nameProperty.Name}))
            {{
                yield return new ValidationResult(
                    ""{nameProperty.Name}不能为空"",
                    new[] {{ nameof({nameProperty.Name}) }});
            }}";
            }
            return "            // 在此添加自定义验证规则";
        }

        private static string GenerateSearchProperties(EnhancedEntityModelDto entity)
        {
            var searchable = entity.Properties.Where(p => 
                p.Type == "string" || p.Type == "DateTime" || p.Type == "bool");
            
            return string.Join("\n\n", searchable.Select(p =>
                $@"        /// <summary>
        /// 按{p.Name}筛选
        /// </summary>
        public {GetCSharpType(p.Type)}? {p.Name}Filter {{ get; set; }}"));
        }

        private static string GenerateEntityToDtoMapping(EnhancedEntityModelDto entity)
        {
            // 如果有复杂映射规则，在这里添加
            return entity.Properties.Any(p => p.Type.Contains("Enum")) 
                ? "\n                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))" 
                : "";
        }

        private static string GenerateCreateConstructorMapping(EnhancedEntityModelDto entity)
        {
            var required = entity.Properties.Where(p => p.IsRequired && p.Name != "Id");
            return required.Any() ? ",\n                    " + string.Join(",\n                    ", 
                required.Select(p => $"src.{p.Name}")) : "";
        }

        private static string GenerateCreateDtoToEntityMapping(EnhancedEntityModelDto entity)
        {
            return ""; // 构造函数映射已处理
        }

        private static string GenerateUpdateDtoToEntityMapping(EnhancedEntityModelDto entity)
        {
            // 忽略只读属性
            var ignored = new[] { "Id", "CreationTime", "CreatorId" };
            var ignoreRules = ignored.Select(prop => 
                $"\n                .ForMember(dest => dest.{prop}, opt => opt.Ignore())");
            
            return string.Join("", ignoreRules);
        }

        private static string GenerateCreateMethodParams(EnhancedEntityModelDto entity)
        {
            var required = entity.Properties.Where(p => p.IsRequired && p.Name != "Id");
            return required.Any() ? ",\n                " + string.Join(",\n                ", 
                required.Select(p => $"input.{p.Name}")) : "";
        }

        private static string GenerateCustomBusinessMethods(EnhancedEntityModelDto entity)
        {
            // 根据业务规则生成自定义方法
            if (entity.BusinessRules?.Any() == true)
            {
                return $@"
        /// <summary>
        /// 自定义业务方法示例
        /// </summary>
        [Authorize(SmartAbpPermissions.{entity.Name}.Custom)]
        public virtual async Task<bool> ExecuteCustomBusinessLogicAsync(Guid id)
        {{
            var entity = await _repository.GetAsync(id);
            
            // 在此实现自定义业务逻辑
            // 基于entity.BusinessRules生成具体逻辑
            
            await _repository.UpdateAsync(entity);
            return true;
        }}";
            }
            return "";
        }

        private static string GetCSharpType(string type)
        {
            return type switch
            {
                "string" => "string",
                "int" => "int",
                "long" => "long",
                "decimal" => "decimal",
                "bool" => "bool", 
                "DateTime" => "DateTime",
                "Guid" => "Guid",
                _ => type
            };
        }

        private static string ToCamelCase(string input)
        {
            if (string.IsNullOrEmpty(input)) return input;
            return char.ToLowerInvariant(input[0]) + input.Substring(1);
        }
    }
}
