// AutoMapper Profile
using AutoMapper;

namespace .Application.AutoMapper
{
    public class EquipmentMapProfile : Profile
    {
        public EquipmentMapProfile()
        {
            CreateMap<Equipment, EquipmentDto>();
            CreateMap<CreateEquipmentDto, Equipment>();
            CreateMap<UpdateEquipmentDto, Equipment>();
        }
    }
}