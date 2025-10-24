using AutoMapper;
using SmartAbp.Application.Contracts.CodeGeneration.Dtos;
using SmartAbp.Domain.CodeGeneration;

namespace SmartAbp.Application.CodeGeneration
{
    /// <summary>
    /// 代码生成模块AutoMapper配置
    /// </summary>
    public class CodeGenerationAutoMapperProfile : Profile
    {
        public CodeGenerationAutoMapperProfile()
        {
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // CodeGenerationTask 实体映射
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            
            CreateMap<CodeGenerationTask, CodeGenerationTaskDto>()
                .ForMember(dest => dest.GeneratorType, opt => opt.MapFrom(src => src.GeneratorType))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status));

            CreateMap<CreateCodeGenerationTaskDto, CodeGenerationTask>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.TenantId, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.StartTime, opt => opt.Ignore())
                .ForMember(dest => dest.CompletedTime, opt => opt.Ignore())
                .ForMember(dest => dest.ResultJson, opt => opt.Ignore())
                .ForMember(dest => dest.ErrorMessage, opt => opt.Ignore());

            CreateMap<UpdateCodeGenerationTaskDto, CodeGenerationTask>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.TenantId, opt => opt.Ignore())
                .ForMember(dest => dest.GeneratorType, opt => opt.Ignore())
                .ForMember(dest => dest.StartTime, opt => opt.Ignore())
                .ForMember(dest => dest.CompletedTime, opt => opt.Ignore());
        }
    }
}

