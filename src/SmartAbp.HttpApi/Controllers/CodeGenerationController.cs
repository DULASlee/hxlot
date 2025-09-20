using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.CodeGenerator.Services;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.Controllers
{
    [RemoteService]
    [Area("app")]
    [Route("api/code-generator")] 
    public class CodeGenerationController : AbpController
    {
        private readonly ICodeGenerationAppService _service;

        public CodeGenerationController(ICodeGenerationAppService service)
        {
            _service = service;
        }

        [HttpGet("connection-strings")]
        public Task<List<string>> GetConnectionStringNamesAsync()
        {
            return _service.GetConnectionStringNamesAsync();
        }

        [HttpGet("menus")]
        public Task<List<MenuItemDto>> GetMenuTreeAsync()
        {
            return _service.GetMenuTreeAsync();
        }

        [HttpPost("generate-module")]
        public Task<GeneratedModuleDto> GenerateModuleAsync([FromBody] ModuleMetadataDto input)
        {
            return _service.GenerateModuleAsync(input);
        }

        [HttpPost("unified/generate-module")]
        public Task<GeneratedModuleDto> GenerateFromUnifiedSchemaAsync([FromBody] UnifiedModuleSchemaDto unified)
        {
            return _service.GenerateFromUnifiedSchemaAsync(unified);
        }

        [HttpPost("validate")]
        public Task<ValidationReportDto> ValidateModuleAsync([FromBody] ModuleMetadataDto input)
        {
            return _service.ValidateModuleAsync(input);
        }

        [HttpPost("dry-run")]
        public Task<GenerationDryRunResultDto> DryRunGenerateAsync([FromBody] ModuleMetadataDto input)
        {
            return _service.DryRunGenerateAsync(input);
        }

        [HttpPost("unified/validate")]
        public Task<ValidationReportDto> ValidateUnifiedAsync([FromBody] UnifiedModuleSchemaDto unified)
        {
            return _service.ValidateUnifiedAsync(unified);
        }

        [HttpPost("unified/dry-run")]
        public Task<GenerationDryRunResultDto> DryRunUnifiedAsync([FromBody] UnifiedModuleSchemaDto unified)
        {
            return _service.DryRunUnifiedAsync(unified);
        }

        [HttpGet("schema-version-manifest")]
        public Task<SchemaVersionManifestDto> GetSchemaVersionManifestAsync()
        {
            return _service.GetSchemaVersionManifestAsync();
        }

        [HttpPost("introspect-db")]
        public Task<DatabaseSchemaDto> IntrospectDatabaseAsync([FromBody] DatabaseIntrospectionRequestDto request)
        {
            return _service.IntrospectDatabaseAsync(request);
        }

        [HttpGet("ui-config")]
        public Task<EntityUIConfigDto> GetUiConfigAsync([FromQuery] string module, [FromQuery] string entity)
        {
            return _service.GetUiConfigAsync(module, entity);
        }

        [HttpPost("ui-config")]
        public Task SaveUiConfigAsync([FromQuery] string module, [FromQuery] string entity, [FromBody] EntityUIConfigDto config)
        {
            return _service.SaveUiConfigAsync(module, entity, config);
        }
    }
}


