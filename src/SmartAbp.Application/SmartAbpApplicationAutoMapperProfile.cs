using AutoMapper;

namespace SmartAbp;

public class SmartAbpApplicationAutoMapperProfile : Profile
{
    public SmartAbpApplicationAutoMapperProfile()
    {
        // 🔥 ABP集成修复：完善AutoMapper配置，支持代码生成器DTO映射

        // 代码生成器相关映射（基于V9 DTO结构）
        CreateCodeGeneratorMappings();

        // 企业级权限系统映射
        CreatePermissionSystemMappings();

        // 低代码引擎映射
        CreateLowCodeEngineMappings();
    }

    /// <summary>
    /// 代码生成器DTO映射配置
    /// </summary>
    private void CreateCodeGeneratorMappings()
    {
        // ========== CodeGenEntrance用户功能映射 ==========
        // 用户配置映射
        CreateMap<global::SmartAbp.CodeGenerator.UserProfile, global::SmartAbp.CodeGenerator.Dtos.UserProfileDto>();

        // 统计数据映射
        CreateMap<global::SmartAbp.CodeGenerator.CodeGenStat, global::SmartAbp.CodeGenerator.Dtos.CodeGenStatsDto>();

        // 生成历史映射
        CreateMap<global::SmartAbp.CodeGenerator.GenerationHistory, global::SmartAbp.CodeGenerator.Dtos.GenerationHistoryDto>();

        // ========== V9元数据映射（待实现）==========
        // 🔧 基于SmartAbp.CodeGenerator.Services.V9命名空间的DTO映射
        // TODO: 当V9 DTO与领域实体定义完善后，添加具体映射配置
        // 例如：CreateMap<Entity, EntityDto>();
        // 例如：CreateMap<CreateEntityDto, Entity>();
        // 例如：CreateMap<UpdateEntityDto, Entity>();

        // 元数据相关映射
        // CreateMap<ModuleMetadata, ModuleMetadataDto>();
        // CreateMap<EnhancedEntityModel, EnhancedEntityModelDto>();
        // CreateMap<EntityProperty, EntityPropertyDto>();
    }

    /// <summary>
    /// 权限系统映射配置
    /// </summary>
    private void CreatePermissionSystemMappings()
    {
        // 🛡️ 企业级权限系统映射配置
        // 当权限相关实体定义完善后，添加映射配置
        // 例如：CreateMap<PermissionGroup, PermissionGroupDto>();
        // 例如：CreateMap<PermissionDefinition, PermissionDefinitionDto>();
    }

    /// <summary>
    /// 低代码引擎映射配置
    /// </summary>
    private void CreateLowCodeEngineMappings()
    {
        // 🎨 低代码引擎相关映射配置

        // ========== Phase 3B：后端SSOT完整性补强 ==========

        // 低代码模块映射
        CreateMap<global::SmartAbp.Domain.Entities.LowCode.LowCodeModule, global::SmartAbp.Application.Contracts.LowCode.Dtos.ModuleDto>()
            .ForMember(dest => dest.Entities, opt => opt.Ignore()); // Entities手动处理

        CreateMap<global::SmartAbp.Application.Contracts.LowCode.Dtos.CreateOrUpdateModuleDto, global::SmartAbp.Domain.Entities.LowCode.LowCodeModule>();

        // 实体定义映射
        CreateMap<global::SmartAbp.Domain.Entities.LowCode.LowCodeEntity, global::SmartAbp.Application.Contracts.LowCode.Dtos.EntityDefinitionDto>();
        CreateMap<global::SmartAbp.Application.Contracts.LowCode.Dtos.CreateOrUpdateEntityDefinitionDto, global::SmartAbp.Domain.Entities.LowCode.LowCodeEntity>();

        // 实体字段映射
        CreateMap<global::SmartAbp.Domain.Entities.LowCode.EntityField, global::SmartAbp.Application.Contracts.LowCode.Dtos.EntityFieldDto>();
        CreateMap<global::SmartAbp.Application.Contracts.LowCode.Dtos.CreateOrUpdateEntityFieldDto, global::SmartAbp.Domain.Entities.LowCode.EntityField>();

        // ========== Phase 3B：配置类映射 ==========

        // 权限配置映射
        CreateMap<global::SmartAbp.Domain.Entities.LowCode.ModulePermissionConfig, global::SmartAbp.Application.Contracts.LowCode.Dtos.ModulePermissionConfigDto>();
        CreateMap<global::SmartAbp.Application.Contracts.LowCode.Dtos.ModulePermissionConfigDto, global::SmartAbp.Domain.Entities.LowCode.ModulePermissionConfig>();

        CreateMap<global::SmartAbp.Domain.Entities.LowCode.PermissionGroupConfig, global::SmartAbp.Application.Contracts.LowCode.Dtos.PermissionGroupConfigDto>();
        CreateMap<global::SmartAbp.Application.Contracts.LowCode.Dtos.PermissionGroupConfigDto, global::SmartAbp.Domain.Entities.LowCode.PermissionGroupConfig>();

        // 特性管理配置映射
        CreateMap<global::SmartAbp.Domain.Entities.LowCode.ModuleFeatureManagement, global::SmartAbp.Application.Contracts.LowCode.Dtos.ModuleFeatureManagementDto>();
        CreateMap<global::SmartAbp.Application.Contracts.LowCode.Dtos.ModuleFeatureManagementDto, global::SmartAbp.Domain.Entities.LowCode.ModuleFeatureManagement>();
    }
}
