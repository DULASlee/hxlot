using AutoMapper;
using SmartAbp.Application.Contracts.Equipment;
using SmartAbp.Domain.Entities.MES;

namespace SmartAbp.Application.Equipment
{
    public class EquipmentAutoMapperProfile : Profile
    {
        public EquipmentAutoMapperProfile()
        {
            CreateMap<Domain.Entities.MES.Equipment, EquipmentDto>();

            CreateMap<CreateEquipmentDto, Domain.Entities.MES.Equipment>()
                .ForMember(dest => dest.CreationTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
                .ForMember(dest => dest.LastModificationTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifierId, opt => opt.Ignore())
                .ForMember(dest => dest.DeletionTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeleterId, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.ProductionLine, opt => opt.Ignore())
                .ForMember(dest => dest.ExtraProperties, opt => opt.Ignore())
                .ForMember(dest => dest.ConcurrencyStamp, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "stopped"))
                .ForMember(dest => dest.HealthStatus, opt => opt.MapFrom(src => "healthy"))
                .ForMember(dest => dest.IsOnline, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.LastUpdateTime, opt => opt.MapFrom(src => System.DateTime.Now));

            CreateMap<UpdateEquipmentDto, Domain.Entities.MES.Equipment>()
                .ForMember(dest => dest.CreationTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
                .ForMember(dest => dest.LastModificationTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifierId, opt => opt.Ignore())
                .ForMember(dest => dest.DeletionTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeleterId, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.ProductionLine, opt => opt.Ignore())
                .ForMember(dest => dest.ExtraProperties, opt => opt.Ignore())
                .ForMember(dest => dest.ConcurrencyStamp, opt => opt.Ignore())
                .ForMember(dest => dest.LastUpdateTime, opt => opt.MapFrom(src => System.DateTime.Now));
        }
    }
}

