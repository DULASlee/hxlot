using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.Application.Contracts.CodeGenerator;
using SmartAbp.Application.LowCode;
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
        private readonly AsyncCodeGenerationService _asyncCodeGenService;

        public CodeGenerationController(
            ICodeGenerationAppService service,
            AsyncCodeGenerationService asyncCodeGenService)
        {
            _service = service;
            _asyncCodeGenService = asyncCodeGenService;
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

        [HttpPost("validate-cqrs-definition")]
        public Task<CqrsValidationResultDto> ValidateCqrsDefinitionAsync([FromBody] CqrsDefinitionDto input)
        {
            return _service.ValidateCqrsDefinitionAsync(input);
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

        [HttpPost("test-connection")]
        public Task<DatabaseConnectionTestResultDto> TestDatabaseConnectionAsync([FromBody] DatabaseConnectionRequestDto request)
        {
            return _service.TestDatabaseConnectionAsync(request);
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

        // 新增：获取代码生成状态端点
        [HttpGet("status/{sessionId}")]
        public async Task<GenerationStatusDto> GetGenerationStatusAsync(string sessionId)
        {
            // 调用业务逻辑服务方法获取生成状态
            var status = await _service.GetGenerationStatusAsync(sessionId);
            return status;
        }

        // 新增：导出生成代码为ZIP
        [HttpGet("export/{sessionId}")]
        public async Task<IActionResult> ExportGeneratedCodeAsync(string sessionId)
        {
            var zipPackage = await _service.ExportGeneratedCodeAsync(sessionId);

            // 返回文件下载
            return File(
                zipPackage.Content,
                "application/zip",
                $"generated-code-{sessionId}.zip");
        }

        // 🔥 CQRS生成API端点
        [HttpPost("generate-cqrs")]
        public Task<GeneratedCqrsSolutionDto> GenerateCqrsAsync([FromBody] CqrsDefinitionDto input)
        {
            return _service.GenerateCqrsAsync(input);
        }

        // ✅ 暂时注释：未在ICodeGenerationAppService中实现，将在CQRS/DDD系统实现时添加
        // [HttpPost("validate-cqrs-definition")]
        // public Task<ValidationReportDto> ValidateCqrsDefinitionAsync([FromBody] CqrsDefinitionDto input)
        // {
        //     return _service.ValidateCqrsDefinitionAsync(input);
        // }

        // ✅ 暂时注释：CqrsTemplateDto未定义，将在CQRS模板系统实现时添加
        // [HttpGet("cqrs-templates")]
        // public Task<List<CqrsTemplateDto>> GetCqrsTemplatesAsync()
        // {
        //     return _service.GetCqrsTemplatesAsync();
        // }

        // ✅ 暂时注释：未在ICodeGenerationAppService中实现
        // [HttpGet("command-template/{commandType}")]
        // public Task<CommandDefinitionDto> GetCommandTemplateAsync(string commandType)
        // {
        //     return _service.GetCommandTemplateAsync(commandType);
        // }

        // ✅ 暂时注释：未在ICodeGenerationAppService中实现
        // [HttpGet("query-template/{queryType}")]
        // public Task<QueryDefinitionDto> GetQueryTemplateAsync(string queryType)
        // {
        //     return _service.GetQueryTemplateAsync(queryType);
        // }

        // ✅ 暂时注释：未在ICodeGenerationAppService中实现，将在DDD生成系统实现时添加
        // [HttpPost("generate-ddd")]
        // public Task<GeneratedDddSolutionDto> GenerateDddAsync([FromBody] DddDefinitionDto input)
        // {
        //     return _service.GenerateDddAsync(input);
        // }

        // ✅ 暂时注释：未在ICodeGenerationAppService中实现
        // [HttpPost("validate-ddd-definition")]
        // public Task<ValidationReportDto> ValidateDddDefinitionAsync([FromBody] DddDefinitionDto input)
        // {
        //     return _service.ValidateDddDefinitionAsync(input);
        // }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 🚀 异步代码生成API (Task 1: 异步模式重构)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 异步生成代码 - 立即返回taskId，通过SignalR推送进度
        /// </summary>
        /// <param name="entityId">实体ID</param>
        /// <returns>任务ID和状态</returns>
        [HttpPost("async/generate-entity/{entityId}")]
        public Task<CodeGenerationTaskResponse> GenerateEntityAsync(Guid entityId)
        {
            return _asyncCodeGenService.GenerateAsync(entityId);
        }

        /// <summary>
        /// 查询异步生成任务状态
        /// </summary>
        /// <param name="taskId">任务ID</param>
        /// <returns>任务状态详情</returns>
        [HttpGet("async/status/{taskId}")]
        public Task<CodeGenerationTaskStatus> GetAsyncTaskStatusAsync(string taskId)
        {
            return _asyncCodeGenService.GetTaskStatusAsync(taskId);
        }

        /// <summary>
        /// 获取所有异步任务状态（管理员接口）
        /// </summary>
        /// <returns>所有任务状态列表</returns>
        [HttpGet("async/all-tasks")]
        public Task<CodeGenerationTaskStatus[]> GetAllAsyncTasksAsync()
        {
            return _asyncCodeGenService.GetAllTaskStatusesAsync();
        }

        /// <summary>
        /// 取消异步生成任务
        /// </summary>
        /// <param name="taskId">任务ID</param>
        /// <returns>取消结果</returns>
        [HttpPost("async/cancel/{taskId}")]
        public async Task<IActionResult> CancelAsyncTaskAsync(string taskId)
        {
            // TODO: 实现任务取消逻辑
            // 这里需要与BackgroundJob框架集成来取消任务

            return Ok(new
            {
                Success = false,
                Message = "任务取消功能正在开发中"
            });
        }
    }
}


