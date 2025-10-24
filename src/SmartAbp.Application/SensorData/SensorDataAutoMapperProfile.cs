using AutoMapper;
using SmartAbp.Application.Contracts.SensorData;
using SmartAbp.Domain.Entities.MES;

namespace SmartAbp.Application.SensorData
{
    public class SensorDataAutoMapperProfile : Profile
    {
        public SensorDataAutoMapperProfile()
        {
            CreateMap<Domain.Entities.MES.SensorData, SensorDataDto>();

            CreateMap<CreateSensorDataDto, Domain.Entities.MES.SensorData>()
                .ForMember(dest => dest.CreationTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
                .ForMember(dest => dest.ProductionLine, opt => opt.Ignore())
                .ForMember(dest => dest.Equipment, opt => opt.Ignore())
                .ForMember(dest => dest.ExtraProperties, opt => opt.Ignore())
                .ForMember(dest => dest.ConcurrencyStamp, opt => opt.Ignore())
                .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => System.DateTime.UtcNow))
                .ForMember(dest => dest.Quality, opt => opt.MapFrom(src => "good"))
                .ForMember(dest => dest.IsAlarm, opt => opt.MapFrom(src => false));

            CreateMap<UpdateSensorDataDto, Domain.Entities.MES.SensorData>()
                .ForMember(dest => dest.CreationTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatorId, opt => opt.Ignore())
                .ForMember(dest => dest.ProductionLine, opt => opt.Ignore())
                .ForMember(dest => dest.Equipment, opt => opt.Ignore())
                .ForMember(dest => dest.ExtraProperties, opt => opt.Ignore())
                .ForMember(dest => dest.ConcurrencyStamp, opt => opt.Ignore())
                .ForMember(dest => dest.Timestamp, opt => opt.Ignore());
        }
    }
}

