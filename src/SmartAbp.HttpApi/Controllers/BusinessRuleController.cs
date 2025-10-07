using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.Application.BusinessRules;
using SmartAbp.Application.BusinessRules.Services;
using SmartAbp.Application.Contracts.BusinessRules.Dtos;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using Volo.Abp.Application.Dtos;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.HttpApi.Controllers
{
    /// <summary>
    /// 业务规则控制器
    /// 提供业务规则的完整CRUD API和规则执行功能
    /// </summary>
    [ApiController]
    [Route("api/business-rules")]
    public class BusinessRuleController : AbpControllerBase
    {
        private readonly IBusinessRuleAppService _businessRuleAppService;

        public BusinessRuleController(IBusinessRuleAppService businessRuleAppService)
        {
            _businessRuleAppService = businessRuleAppService;
        }

        /// <summary>
        /// 获取业务规则列表
        /// </summary>
        /// <param name="input">查询输入参数</param>
        /// <returns>分页的业务规则列表</returns>
        [HttpGet]
        public async Task<PagedResultDto<BusinessRuleDto>> GetListAsync([FromQuery] GetBusinessRulesInput input)
        {
            return await _businessRuleAppService.GetListAsync(input);
        }

        /// <summary>
        /// 根据ID获取业务规则
        /// </summary>
        /// <param name="id">规则ID</param>
        /// <returns>业务规则详情</returns>
        [HttpGet("{id}")]
        public async Task<BusinessRuleDto> GetAsync(Guid id)
        {
            return await _businessRuleAppService.GetAsync(id);
        }

        /// <summary>
        /// 创建业务规则
        /// </summary>
        /// <param name="input">创建输入参数</param>
        /// <returns>创建的业务规则</returns>
        [HttpPost]
        public async Task<BusinessRuleDto> CreateAsync([FromBody] CreateBusinessRuleDto input)
        {
            return await _businessRuleAppService.CreateAsync(input);
        }

        /// <summary>
        /// 更新业务规则
        /// </summary>
        /// <param name="id">规则ID</param>
        /// <param name="input">更新输入参数</param>
        /// <returns>更新后的业务规则</returns>
        [HttpPut("{id}")]
        public async Task<BusinessRuleDto> UpdateAsync(Guid id, [FromBody] UpdateBusinessRuleDto input)
        {
            return await _businessRuleAppService.UpdateAsync(id, input);
        }

        /// <summary>
        /// 删除业务规则
        /// </summary>
        /// <param name="id">规则ID</param>
        [HttpDelete("{id}")]
        public async Task DeleteAsync(Guid id)
        {
            await _businessRuleAppService.DeleteAsync(id);
        }

        /// <summary>
        /// 执行业务规则
        /// </summary>
        /// <param name="input">执行输入参数</param>
        /// <returns>执行结果列表</returns>
        [HttpPost("execute")]
        public async Task<List<BusinessRuleExecutionResultDto>> ExecuteRulesAsync([FromBody] ExecuteBusinessRuleDto input)
        {
            return await _businessRuleAppService.ExecuteRulesAsync(input);
        }

        /// <summary>
        /// 验证业务规则
        /// </summary>
        /// <param name="id">规则ID</param>
        /// <returns>验证结果</returns>
        [HttpPost("{id}/validate")]
        public async Task<BusinessRuleValidationResultDto> ValidateRuleAsync(Guid id)
        {
            return await _businessRuleAppService.ValidateRuleAsync(id);
        }

        /// <summary>
        /// 批量验证所有业务规则
        /// </summary>
        /// <returns>所有规则的验证结果</returns>
        [HttpPost("validate-all")]
        public async Task<List<BusinessRuleValidationResultDto>> ValidateAllRulesAsync()
        {
            return await _businessRuleAppService.ValidateAllRulesAsync();
        }

        /// <summary>
        /// 获取业务规则统计信息
        /// </summary>
        /// <returns>统计信息</returns>
        [HttpGet("stats")]
        public async Task<BusinessRuleStatsDto> GetStatsAsync()
        {
            return await _businessRuleAppService.GetStatsAsync();
        }

        /// <summary>
        /// 获取可用实体列表
        /// </summary>
        /// <returns>实体定义列表</returns>
        [HttpGet("entities")]
        public async Task<List<EntityDefinitionDto>> GetAvailableEntitiesAsync()
        {
            return await _businessRuleAppService.GetAvailableEntitiesAsync();
        }

        /// <summary>
        /// 获取指定实体的字段列表
        /// </summary>
        /// <param name="entityName">实体名称</param>
        /// <returns>实体字段列表</returns>
        [HttpGet("entities/{entityName}/fields")]
        public async Task<List<EntityFieldDto>> GetEntityFieldsAsync(string entityName)
        {
            return await _businessRuleAppService.GetEntityFieldsAsync(entityName);
        }

        /// <summary>
        /// 批量更新规则状态
        /// </summary>
        /// <param name="input">批量更新输入</param>
        [HttpPut("batch-status")]
        public async Task BatchUpdateStatusAsync([FromBody] BatchUpdateStatusInput input)
        {
            await _businessRuleAppService.BatchUpdateStatusAsync(input.RuleIds, input.IsActive);
        }

        /// <summary>
        /// 复制规则
        /// </summary>
        /// <param name="id">原规则ID</param>
        /// <returns>复制的新规则</returns>
        [HttpPost("{id}/duplicate")]
        public async Task<BusinessRuleDto> DuplicateRuleAsync(Guid id)
        {
            return await _businessRuleAppService.DuplicateRuleAsync(id);
        }

        /// <summary>
        /// 验证脚本语法
        /// </summary>
        /// <param name="input">脚本验证输入</param>
        /// <returns>验证结果</returns>
        [HttpPost("validate-script")]
        public async Task<ScriptValidationResult> ValidateScriptAsync([FromBody] ValidateScriptInput input)
        {
            return await _businessRuleAppService.ValidateScriptAsync(input.Script, input.ScriptType);
        }

        /// <summary>
        /// 获取支持的脚本类型
        /// </summary>
        /// <returns>支持的脚本类型列表</returns>
        [HttpGet("script-types")]
        public IEnumerable<string> GetSupportedScriptTypes()
        {
            return _businessRuleAppService.GetSupportedScriptTypes();
        }

        /// <summary>
        /// 批量删除规则
        /// </summary>
        /// <param name="input">批量删除输入</param>
        [HttpDelete("batch")]
        public async Task BatchDeleteAsync([FromBody] BatchDeleteInput input)
        {
            foreach (var id in input.RuleIds)
            {
                await _businessRuleAppService.DeleteAsync(id);
            }
        }

        /// <summary>
        /// 导出规则配置
        /// </summary>
        /// <param name="ruleIds">要导出的规则ID列表</param>
        /// <returns>规则配置JSON</returns>
        [HttpPost("export")]
        public async Task<IActionResult> ExportRulesAsync([FromBody] List<Guid> ruleIds)
        {
            var rules = new List<BusinessRuleDto>();
            
            foreach (var id in ruleIds)
            {
                var rule = await _businessRuleAppService.GetAsync(id);
                rules.Add(rule);
            }

            var exportData = new
            {
                ExportTime = DateTime.UtcNow,
                Version = "1.0",
                Rules = rules
            };

            return Ok(exportData);
        }

        /// <summary>
        /// 导入规则配置
        /// </summary>
        /// <param name="input">导入输入</param>
        /// <returns>导入结果</returns>
        [HttpPost("import")]
        public async Task<ImportRulesResultDto> ImportRulesAsync([FromBody] ImportRulesInput input)
        {
            var result = new ImportRulesResultDto
            {
                TotalCount = input.Rules.Count,
                SuccessCount = 0,
                FailureCount = 0,
                Errors = new List<string>()
            };

            foreach (var ruleData in input.Rules)
            {
                try
                {
                    var createInput = new CreateBusinessRuleDto
                    {
                        Name = ruleData.Name,
                        EntityName = ruleData.EntityName,
                        Description = ruleData.Description,
                        Type = ruleData.Type,
                        Priority = ruleData.Priority,
                        Conditions = ruleData.Conditions,
                        Actions = ruleData.Actions,
                        ExecutionTiming = ruleData.ExecutionTiming
                    };

                    await _businessRuleAppService.CreateAsync(createInput);
                    result.SuccessCount++;
                }
                catch (Exception ex)
                {
                    result.FailureCount++;
                    result.Errors.Add($"Rule '{ruleData.Name}': {ex.Message}");
                }
            }

            return result;
        }
    }

    /// <summary>
    /// 批量更新状态输入DTO
    /// </summary>
    public class BatchUpdateStatusInput
    {
        /// <summary>
        /// 规则ID列表
        /// </summary>
        public List<Guid> RuleIds { get; set; } = new();

        /// <summary>
        /// 目标状态
        /// </summary>
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// 批量删除输入DTO
    /// </summary>
    public class BatchDeleteInput
    {
        /// <summary>
        /// 规则ID列表
        /// </summary>
        public List<Guid> RuleIds { get; set; } = new();
    }

    /// <summary>
    /// 导入规则输入DTO
    /// </summary>
    public class ImportRulesInput
    {
        /// <summary>
        /// 规则列表
        /// </summary>
        public List<ImportRuleData> Rules { get; set; } = new();
    }

    /// <summary>
    /// 导入规则数据DTO
    /// </summary>
    public class ImportRuleData
    {
        public string Name { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Priority { get; set; }
        public List<BusinessRuleConditionDto> Conditions { get; set; } = new();
        public List<BusinessRuleActionDto> Actions { get; set; } = new();
        public List<string> ExecutionTiming { get; set; } = new();
    }

    /// <summary>
    /// 导入结果DTO
    /// </summary>
    public class ImportRulesResultDto
    {
        /// <summary>
        /// 总数量
        /// </summary>
        public int TotalCount { get; set; }

        /// <summary>
        /// 成功数量
        /// </summary>
        public int SuccessCount { get; set; }

        /// <summary>
        /// 失败数量
        /// </summary>
        public int FailureCount { get; set; }

        /// <summary>
        /// 错误信息列表
        /// </summary>
        public List<string> Errors { get; set; } = new();
    }
}
