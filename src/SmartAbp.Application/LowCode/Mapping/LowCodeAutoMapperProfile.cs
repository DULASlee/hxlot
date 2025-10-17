using AutoMapper;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp.Domain.Entities.LowCode;
using System;
using System.Linq;

namespace SmartAbp.Application.LowCode.Mapping
{
    /// <summary>
    /// 🔥 LowCode统一Schema AutoMapper配置
    ///
    /// 功能:
    /// 1. EntityDefinitionDto ↔ EntityDefinition (Domain Entity)
    /// 2. EntityFieldDto ↔ EntityField (Domain Entity)
    /// 3. EntityRelationDto ↔ EntityRelation (Domain Entity)
    /// 4. ValidationRuleDto ↔ ValidationRule (Domain Entity)
    ///
    /// 版本: v1.0.0
    /// 作者: SmartAbp架构团队
    /// 日期: 2025-10-06
    /// </summary>
    public class LowCodeAutoMapperProfile : Profile
    {
        public LowCodeAutoMapperProfile()
        {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // Phase 2A: 模块映射
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            CreateMap<LowCodeModule, ModuleDto>();
            CreateMap<CreateOrUpdateModuleDto, LowCodeModule>();
            // ═══════════════════════════════════════════════════════════════════════
            // EntityDefinition 映射配置
            // ═══════════════════════════════════════════════════════════════════════

            // Domain → DTO (查询场景)
            CreateMap<EntityDefinition, EntityDefinitionDto>()
                .ForMember(dest => dest.Fields, opt => opt.MapFrom(src => src.Fields ?? new System.Collections.Generic.List<EntityField>()))
                .ForMember(dest => dest.Relationships, opt => opt.MapFrom(src => src.Relationships ?? new System.Collections.Generic.List<EntityRelation>()))
                .ForMember(dest => dest.ValidationRules, opt => opt.MapFrom(src => src.ValidationRules ?? new System.Collections.Generic.List<ValidationRule>()))
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.CreationTime, opt => opt.MapFrom(src => src.CreationTime))
                .ForMember(dest => dest.CreatorId, opt => opt.MapFrom(src => src.CreatorId))
                .ForMember(dest => dest.LastModificationTime, opt => opt.MapFrom(src => src.LastModificationTime))
                .ForMember(dest => dest.LastModifierId, opt => opt.MapFrom(src => src.LastModifierId))
                .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => src.IsDeleted))
                .ForMember(dest => dest.DeleterId, opt => opt.MapFrom(src => src.DeleterId))
                .ForMember(dest => dest.DeletionTime, opt => opt.MapFrom(src => src.DeletionTime));

            // DTO → Domain (创建/更新场景)
            CreateMap<CreateOrUpdateEntityDefinitionDto, EntityDefinition>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // ID由Domain层生成
                .ForMember(dest => dest.TenantId, opt => opt.Ignore()) // TenantId由ABP自动处理
                .ForMember(dest => dest.CreationTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
                .ForMember(dest => dest.LastModificationTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifierId, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.DeleterId, opt => opt.Ignore())
                .ForMember(dest => dest.DeletionTime, opt => opt.Ignore())
                .ForMember(dest => dest.Fields, opt => opt.Ignore()) // Fields单独处理
                .ForMember(dest => dest.Relationships, opt => opt.Ignore())
                .ForMember(dest => dest.ValidationRules, opt => opt.Ignore());

            // ═══════════════════════════════════════════════════════════════════════
            // EntityField 映射配置
            // ═══════════════════════════════════════════════════════════════════════

            // Domain → DTO (查询场景)
            CreateMap<EntityField, EntityFieldDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.EntityDefinitionId, opt => opt.MapFrom(src => src.EntityDefinitionId))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.DisplayName))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type))
                .ForMember(dest => dest.Length, opt => opt.MapFrom(src => src.Length))
                .ForMember(dest => dest.IsRequired, opt => opt.MapFrom(src => src.IsRequired))
                .ForMember(dest => dest.IsUnique, opt => opt.MapFrom(src => src.IsUnique))
                .ForMember(dest => dest.IsIndexed, opt => opt.MapFrom(src => src.IsIndexed))
                .ForMember(dest => dest.DefaultValue, opt => opt.MapFrom(src => src.DefaultValue))
                .ForMember(dest => dest.Comment, opt => opt.MapFrom(src => src.Comment))
                .ForMember(dest => dest.Order, opt => opt.MapFrom(src => src.Order));

            // DTO → Domain (创建/更新场景)
            CreateMap<CreateOrUpdateEntityFieldDto, EntityField>()
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // ID由Domain层生成
                .ForMember(dest => dest.EntityDefinitionId, opt => opt.MapFrom(src => src.EntityDefinitionId))
                .ForMember(dest => dest.EntityDefinition, opt => opt.Ignore()); // 导航属性由EF Core处理

            CreateMap<EntityFieldDto, EntityField>()
                .ForMember(dest => dest.EntityDefinition, opt => opt.Ignore()); // 导航属性忽略

            // ═══════════════════════════════════════════════════════════════════════
            // EntityRelation 映射配置
            // ═══════════════════════════════════════════════════════════════════════

            // Domain → DTO (查询场景)
            CreateMap<EntityRelation, EntityRelationDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.FromEntity, opt => opt.MapFrom(src => src.FromEntity))
                .ForMember(dest => dest.ToEntity, opt => opt.MapFrom(src => src.ToEntity))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.RelationType))
                .ForMember(dest => dest.ForeignKey, opt => opt.MapFrom(src => src.ForeignKey))
                .ForMember(dest => dest.NavigationProperty, opt => opt.MapFrom(src => src.NavigationProperty))
                .ForMember(dest => dest.JoinTable, opt => opt.MapFrom(src => src.JoinTable))
                .ForMember(dest => dest.CascadeDelete, opt => opt.MapFrom(src => src.CascadeDelete))
                .ForMember(dest => dest.CreationTime, opt => opt.MapFrom(src => src.CreationTime))
                .ForMember(dest => dest.CreatorId, opt => opt.MapFrom(src => src.CreatorId))
                .ForMember(dest => dest.LastModificationTime, opt => opt.MapFrom(src => src.LastModificationTime))
                .ForMember(dest => dest.LastModifierId, opt => opt.MapFrom(src => src.LastModifierId))
                .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => src.IsDeleted))
                .ForMember(dest => dest.DeleterId, opt => opt.MapFrom(src => src.DeleterId))
                .ForMember(dest => dest.DeletionTime, opt => opt.MapFrom(src => src.DeletionTime));

            // DTO → Domain (创建/更新场景)
            CreateMap<CreateOrUpdateEntityRelationDto, EntityRelation>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.TenantId, opt => opt.Ignore())
                .ForMember(dest => dest.CreationTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
                .ForMember(dest => dest.LastModificationTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifierId, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.DeleterId, opt => opt.Ignore())
                .ForMember(dest => dest.DeletionTime, opt => opt.Ignore());

            // ═══════════════════════════════════════════════════════════════════════
            // ValidationRule 映射配置
            // ═══════════════════════════════════════════════════════════════════════

            // Domain → DTO (查询场景)
            CreateMap<ValidationRule, ValidationRuleDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.EntityDefinitionId, opt => opt.MapFrom(src => src.EntityDefinitionId))
                .ForMember(dest => dest.FieldName, opt => opt.MapFrom(src => src.FieldName))
                .ForMember(dest => dest.RuleType, opt => opt.MapFrom(src => src.RuleType))
                .ForMember(dest => dest.RuleValue, opt => opt.MapFrom(src => src.RuleValue))
                .ForMember(dest => dest.ErrorMessage, opt => opt.MapFrom(src => src.ErrorMessage))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.IsEnabled, opt => opt.MapFrom(src => src.IsEnabled))
                .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => src.Priority));

            // DTO → Domain (创建/更新场景)
            CreateMap<ValidationRuleDto, ValidationRule>()
                .ForMember(dest => dest.EntityDefinition, opt => opt.Ignore()); // 导航属性忽略

            // ═══════════════════════════════════════════════════════════════════════
            // SchemaVersionHistory 映射配置
            // ═══════════════════════════════════════════════════════════════════════
            CreateMap<SchemaVersionHistory, SchemaVersionHistoryDto>();
            CreateMap<CreateSchemaVersionHistoryDto, SchemaVersionHistory>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.IsReleased, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.IsDeprecated, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.ReleaseDate, opt => opt.Ignore())
                .ForMember(dest => dest.DeprecatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.ReleasedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ReleaseNotes, opt => opt.Ignore())
                .ForMember(dest => dest.MigrationScriptPath, opt => opt.Ignore())
                .ForMember(dest => dest.RollbackScriptPath, opt => opt.Ignore())
                .ForMember(dest => dest.CreationTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
                .ForMember(dest => dest.LastModificationTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifierId, opt => opt.Ignore());
        }
    }
}

