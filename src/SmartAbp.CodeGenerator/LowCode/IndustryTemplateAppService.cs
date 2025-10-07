using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp.CodeGenerator.Services;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp.Application.Services;

namespace SmartAbp.CodeGenerator.LowCode
{
    public class IndustryTemplateAppService : ApplicationService, IIndustryTemplateAppService
    {
        private readonly ICodeGenerationAppService _codeGenerationService;

        public IndustryTemplateAppService(ICodeGenerationAppService codeGenerationService)
        {
            _codeGenerationService = codeGenerationService;
        }

        public async Task<IndustryTemplateGenerationResultDto> GenerateAsync(IndustryTemplateConfigDto input)
        {
            var moduleMetadata = new ModuleMetadataDto();

            switch (input.TemplateId)
            {
                case "saas-mes":
                    moduleMetadata = BuildMesMetadata(input);
                    break;
                case "smart-construction":
                    moduleMetadata = BuildConstructionMetadata(input);
                    break;
                default:
                    throw new ArgumentException("Invalid template ID");
            }
            
            var result = await _codeGenerationService.GenerateModuleAsync(moduleMetadata);

            var resultDto = new IndustryTemplateGenerationResultDto
            {
                Success = result.Success,
                GeneratedFiles = result.GeneratedFiles.Select(f => new SmartAbp.Application.Contracts.LowCode.Dtos.GeneratedFileDto
                {
                    Path = f,
                    Content = "" // Content is not provided by this service method
                }).ToList()
            };

            if (!result.Success && !string.IsNullOrEmpty(result.Message))
            {
                resultDto.Errors = new List<string> { result.Message };
            }

            return resultDto;
        }

        private ModuleMetadataDto BuildMesMetadata(IndustryTemplateConfigDto input)
        {
            var metadata = CreateBaseMetadata(input, "MES");
            
            // Add WorkOrder Entity
            var workOrderEntity = new EnhancedEntityModelDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "WorkOrder",
                DisplayName = "工单",
                Description = "生产工单",
                Module = metadata.Name,
                Namespace = metadata.Namespace,
                TableName = "WorkOrders",
                IsAggregateRoot = true,
                BaseClass = "FullAuditedAggregateRoot<Guid>",
                Properties = new List<EntityPropertyDto>
                {
                    new EntityPropertyDto { Name = "OrderNo", Type = "string", IsRequired = true, MaxLength = 64 },
                    new EntityPropertyDto { Name = "ProductCode", Type = "string", IsRequired = true, MaxLength = 128 },
                    new EntityPropertyDto { Name = "Quantity", Type = "int", IsRequired = true },
                    new EntityPropertyDto { Name = "Status", Type = "string", IsRequired = true, MaxLength = 32 }
                }
            };

            metadata.Entities.Add(workOrderEntity);
            
            // TODO: Add other entities based on selected modules (quality, equipment, etc.)

            return metadata;
        }

        private ModuleMetadataDto BuildConstructionMetadata(IndustryTemplateConfigDto input)
        {
             var metadata = CreateBaseMetadata(input, "Construction");
             // TODO: Add entities for smart construction
             return metadata;
        }
        
        private ModuleMetadataDto CreateBaseMetadata(IndustryTemplateConfigDto input, string modulePrefix)
        {
            return new ModuleMetadataDto
            {
                Id = Guid.NewGuid().ToString(),
                SystemName = "SmartAbp",
                Name = $"{input.SystemName}{modulePrefix}",
                DisplayName = input.SystemName,
                Description = input.Description,
                Version = "1.0.0",
                Author = input.CompanyName,
                Namespace = $"SmartAbp.{input.SystemName.Replace(" ", "")}{modulePrefix}",
                ArchitecturePattern = "Crud",
                DatabaseInfo = new DatabaseConfigDto { ConnectionStringName = "Default", Provider = "SqlServer", Schema = "dbo" },
                Frontend = new FrontendConfigDto { ParentId = "", RoutePrefix = $"{input.SystemName.ToLower()}-{modulePrefix.ToLower()}" },
                GenerateMobilePages = false,
                FeatureManagement = new FeatureManagementDto { IsEnabled = true, DefaultPolicy = "RequiresAuthentication" },
                Dependencies = new List<string>(),
                Entities = new List<EnhancedEntityModelDto>(),
                PermissionConfig = new PermissionConfigDto(),
                MenuConfig = new List<MenuConfigDto>()
            };
        }
    }
}
