// AutoMapper Profile
using AutoMapper;

namespace .Application.AutoMapper
{
    public class SensorDataMapProfile : Profile
    {
        public SensorDataMapProfile()
        {
            CreateMap<SensorData, SensorDataDto>();
            CreateMap<CreateSensorDataDto, SensorData>();
            CreateMap<UpdateSensorDataDto, SensorData>();
        }
    }
}