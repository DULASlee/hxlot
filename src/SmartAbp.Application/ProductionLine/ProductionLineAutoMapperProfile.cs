using AutoMapper;
using SmartAbp.Application.Contracts.ProductionLine;
using SmartAbp.Domain.Entities.MES;

namespace SmartAbp.Application.ProductionLine
{
    /// <summary>
    /// 生产线AutoMapper配置
    /// 用途：Entity ↔ DTO 映射配置
    /// 符合铁律5：DTO一致性
    /// </summary>
    public class ProductionLineAutoMapperProfile : Profile
    {
        public ProductionLineAutoMapperProfile()
        {
            // ══════════════════════════════════════════════════════
            // Entity → Dto
            // ══════════════════════════════════════════════════════

            CreateMap<Domain.Entities.MES.ProductionLine, ProductionLineDto>();

            // ══════════════════════════════════════════════════════
            // CreateDto → Entity
            // ══════════════════════════════════════════════════════

            CreateMap<CreateProductionLineDto, Domain.Entities.MES.ProductionLine>()
                // 忽略审计属性（由ABP自动处理）
                .ForMember(dest => dest.CreationTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
                .ForMember(dest => dest.LastModificationTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifierId, opt => opt.Ignore())
                .ForMember(dest => dest.DeletionTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeleterId, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                // 忽略导航属性
                .ForMember(dest => dest.Equipments, opt => opt.Ignore())
                .ForMember(dest => dest.SensorDataList, opt => opt.Ignore())
                // 忽略Entity的其他属性
                .ForMember(dest => dest.ExtraProperties, opt => opt.Ignore())
                .ForMember(dest => dest.ConcurrencyStamp, opt => opt.Ignore())
                // 设置初始值
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "stopped"))
                .ForMember(dest => dest.TotalProduction, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.DailyProduction, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.CurrentEfficiency, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.EquipmentUtilization, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.QualifiedRate, opt => opt.MapFrom(src => 100.0))
                .ForMember(dest => dest.LastUpdateTime, opt => opt.MapFrom(src => System.DateTime.Now));

            // ══════════════════════════════════════════════════════
            // UpdateDto → Entity
            // ══════════════════════════════════════════════════════

            CreateMap<UpdateProductionLineDto, Domain.Entities.MES.ProductionLine>()
                // 忽略审计属性（由ABP自动处理）
                .ForMember(dest => dest.CreationTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
                .ForMember(dest => dest.LastModificationTime, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifierId, opt => opt.Ignore())
                .ForMember(dest => dest.DeletionTime, opt => opt.Ignore())
                .ForMember(dest => dest.DeleterId, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                // 忽略导航属性
                .ForMember(dest => dest.Equipments, opt => opt.Ignore())
                .ForMember(dest => dest.SensorDataList, opt => opt.Ignore())
                // 忽略Entity的其他属性
                .ForMember(dest => dest.ExtraProperties, opt => opt.Ignore())
                .ForMember(dest => dest.ConcurrencyStamp, opt => opt.Ignore())
                // 更新LastUpdateTime
                .ForMember(dest => dest.LastUpdateTime, opt => opt.MapFrom(src => System.DateTime.Now));
        }
    }
}

