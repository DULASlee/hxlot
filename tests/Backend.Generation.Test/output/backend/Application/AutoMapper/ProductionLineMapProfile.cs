// AutoMapper Profile
using AutoMapper;

namespace .Application.AutoMapper
{
    public class ProductionLineMapProfile : Profile
    {
        public ProductionLineMapProfile()
        {
            CreateMap<ProductionLine, ProductionLineDto>();
            CreateMap<CreateProductionLineDto, ProductionLine>();
            CreateMap<UpdateProductionLineDto, ProductionLine>();
        }
    }
}