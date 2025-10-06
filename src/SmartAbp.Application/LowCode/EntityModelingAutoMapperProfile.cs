using AutoMapper;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp.Domain.Entities.LowCode;

namespace SmartAbp.Application.LowCode
{
    /// <summary>
    /// 🔥 实体建模AutoMapper配置
    /// </summary>
    public class EntityModelingAutoMapperProfile : Profile
    {
        public EntityModelingAutoMapperProfile()
        {
            // EntityDefinition <-> EntityDefinitionDto
            CreateMap<EntityDefinition, EntityDefinitionDto>();
            CreateMap<CreateOrUpdateEntityDefinitionDto, EntityDefinition>()
                .ForMember(dest => dest.Fields, opt => opt.Ignore()); // Fields单独处理

            // EntityField <-> EntityFieldDto
            CreateMap<EntityField, EntityFieldDto>();
            CreateMap<CreateOrUpdateEntityFieldDto, EntityField>();

            // EntityRelation <-> EntityRelationDto
            CreateMap<EntityRelation, EntityRelationDto>();
            CreateMap<CreateOrUpdateEntityRelationDto, EntityRelation>();

            // ValidationRule <-> ValidationRuleDto
            CreateMap<ValidationRule, ValidationRuleDto>();
            CreateMap<ValidationRuleDto, ValidationRule>();
        }
    }
}

