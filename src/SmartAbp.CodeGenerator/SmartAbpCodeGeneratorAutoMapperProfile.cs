using System;
using System.Collections.Generic;
using AutoMapper;
using SmartAbp.CodeGenerator.CQRS;
using SmartAbp.CodeGenerator.DDD;
using SmartAbp.CodeGenerator.Core;
using SmartAbp.CodeGenerator.Services;

namespace SmartAbp.CodeGenerator
{
    /// <summary>
    /// AutoMapper profile for SmartAbp Code Generator
    /// Maps between DTOs and domain classes for code generation
    /// </summary>
    public class SmartAbpCodeGeneratorAutoMapperProfile : Profile
    {
        public SmartAbpCodeGeneratorAutoMapperProfile()
        {
            CreateEntityMappings();
            CreateDddMappings();
            CreateCqrsMappings();
            CreateGeneratedCodeMappings();
        }

        private void CreateEntityMappings()
        {
            CreateMap<EntityDefinitionDto, Core.EntityDefinition>()
                .ForMember(dest => dest.Properties, opt => opt.MapFrom(src => src.Properties))
                .ForMember(dest => dest.NavigationProperties, opt => opt.MapFrom(src => src.NavigationProperties))
                .ForMember(dest => dest.Collections, opt => opt.MapFrom(src => src.Collections))
                .ForMember(dest => dest.DomainMethods, opt => opt.MapFrom(src => src.DomainMethods));

            CreateMap<PropertyDefinitionDto, Core.PropertyDefinition>().ReverseMap();
            CreateMap<NavigationPropertyDefinitionDto, Core.NavigationPropertyDefinition>().ReverseMap();
            CreateMap<CollectionDefinitionDto, Core.CollectionDefinition>().ReverseMap();
            CreateMap<DomainMethodDefinitionDto, Core.DomainMethodDefinition>().ReverseMap();
            CreateMap<ParameterDefinitionDto, Core.ParameterDefinition>().ReverseMap();
        }

        private void CreateDddMappings()
        {
            // DDD Definition mappings
            CreateMap<DddDefinitionDto, DddDefinition>()
                .ForMember(dest => dest.Aggregates, opt => opt.MapFrom(src => src.Aggregates))
                .ForMember(dest => dest.ValueObjects, opt => opt.MapFrom(src => src.ValueObjects))
                .ForMember(dest => dest.DomainEvents, opt => opt.MapFrom(src => src.DomainEvents))
                .ForMember(dest => dest.Specifications, opt => opt.MapFrom(src => src.Specifications))
                .ForMember(dest => dest.DomainServices, opt => opt.MapFrom(src => src.DomainServices));

            CreateMap<AggregateDefinitionDto, AggregateDefinition>().ReverseMap();
            CreateMap<ValueObjectDefinitionDto, ValueObjectDefinition>().ReverseMap();
            CreateMap<DomainEventDefinitionDto, DomainEventDefinition>().ReverseMap();
            CreateMap<SpecificationDefinitionDto, SpecificationDefinition>().ReverseMap();
            CreateMap<DomainServiceDefinitionDto, DomainServiceDefinition>().ReverseMap();

            // Generated DDD Solution mappings
            CreateMap<GeneratedDddSolution, GeneratedDddSolutionDto>()
                .ForMember(dest => dest.GeneratedAt, opt => opt.MapFrom(src => src.GeneratedAt))
                .ForMember(dest => dest.Files, opt => opt.MapFrom(src => src.Files))
                .ForMember(dest => dest.AggregateCount, opt => opt.MapFrom(src => src.AggregateCount))
                .ForMember(dest => dest.ValueObjectCount, opt => opt.MapFrom(src => src.ValueObjectCount))
                .ForMember(dest => dest.DomainEventCount, opt => opt.MapFrom(src => src.DomainEventCount));
        }

        private void CreateCqrsMappings()
        {
            // CQRS Definition mappings
            CreateMap<CqrsDefinitionDto, CqrsDefinition>()
                .ForMember(dest => dest.Commands, opt => opt.MapFrom(src => src.Commands))
                .ForMember(dest => dest.Queries, opt => opt.MapFrom(src => src.Queries))
                .ForMember(dest => dest.DTOs, opt => opt.Ignore());

            CreateMap<CommandDefinitionDto, CommandDefinition>().ReverseMap();
            CreateMap<QueryDefinitionDto, QueryDefinition>().ReverseMap();

            // Generated CQRS Solution mappings
            CreateMap<GeneratedCqrsLayer, GeneratedCqrsSolutionDto>()
                .ForMember(dest => dest.ModuleName, opt => opt.MapFrom(src => src.AggregateName))
                .ForMember(dest => dest.Files, opt => opt.MapFrom(src => src.Files))
                .ForMember(dest => dest.CommandCount, opt => opt.MapFrom(src => src.CommandCount))
                .ForMember(dest => dest.QueryCount, opt => opt.MapFrom(src => src.QueryCount))
                .ForMember(dest => dest.EventCount, opt => opt.MapFrom(src => src.DtoCount)) // Map DtoCount to EventCount for compatibility
                .ForMember(dest => dest.GeneratedAt, opt => opt.MapFrom(src => src.GeneratedAt));
        }

        private void CreateGeneratedCodeMappings()
        {
            // Core generated code mappings
            CreateMap<GeneratedCode, GeneratedCodeDto>()
                .ForMember(dest => dest.Code, opt => opt.MapFrom(src => src.SourceCode))
                .ForMember(dest => dest.Metadata, opt => opt.MapFrom(src => new CodeMetadataDto
                {
                    GeneratedAt = src.Metadata.GeneratedAt,
                    GeneratorVersion = src.Metadata.GeneratorVersion,
                    LinesOfCode = src.Metadata.LinesOfCode,
                    AdditionalProperties = new Dictionary<string, object>(src.Metadata.AdditionalProperties)
                }))
                .ForMember(dest => dest.GenerationTime, opt => opt.MapFrom(src => new TimeSpanDto
                {
                    TotalMilliseconds = src.GenerationTime.TotalMilliseconds
                }));

            CreateMap<CodeMetadata, CodeMetadataDto>().ReverseMap();
        }
    }

    /// <summary>
    /// TimeSpan DTO for API responses
    /// </summary>
    public class TimeSpanDto
    {
        public double TotalMilliseconds { get; set; }
        public double TotalSeconds => TotalMilliseconds / 1000;
        public double TotalMinutes => TotalSeconds / 60;
        public double TotalHours => TotalMinutes / 60;
    }
}