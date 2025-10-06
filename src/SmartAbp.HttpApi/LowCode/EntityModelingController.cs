using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SmartAbp.Application.Contracts.LowCode;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using Volo.Abp;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartAbp.HttpApi.LowCode
{
    /// <summary>
    /// 🔥 实体建模控制器
    /// 对应前端: entityModeling.ts (Store)
    /// 功能: 暴露实体建模RESTful API
    /// </summary>
    [Area("LowCode")]
    [Route("api/lowcode/entity-modeling")]
    [RemoteService(Name = "LowCode")]
    public class EntityModelingController : AbpControllerBase
    {
        private readonly IEntityModelingAppService _entityModelingService;

        public EntityModelingController(IEntityModelingAppService entityModelingService)
        {
            _entityModelingService = entityModelingService;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 实体定义管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取所有实体定义
        /// </summary>
        [HttpGet("entities")]
        public Task<List<EntityDefinitionDto>> GetAllEntitiesAsync()
        {
            return _entityModelingService.GetAllEntitiesAsync();
        }

        /// <summary>
        /// 根据ID获取实体定义
        /// </summary>
        [HttpGet("entities/{id}")]
        public Task<EntityDefinitionDto> GetEntityByIdAsync(Guid id)
        {
            return _entityModelingService.GetEntityByIdAsync(id);
        }

        /// <summary>
        /// 根据名称获取实体定义
        /// </summary>
        [HttpGet("entities/by-name/{name}")]
        public Task<EntityDefinitionDto> GetEntityByNameAsync(string name)
        {
            return _entityModelingService.GetEntityByNameAsync(name);
        }

        /// <summary>
        /// 创建实体定义
        /// </summary>
        [HttpPost("entities")]
        public Task<EntityDefinitionDto> CreateEntityAsync([FromBody] CreateOrUpdateEntityDefinitionDto input)
        {
            return _entityModelingService.CreateEntityAsync(input);
        }

        /// <summary>
        /// 更新实体定义
        /// </summary>
        [HttpPut("entities/{id}")]
        public Task<EntityDefinitionDto> UpdateEntityAsync(Guid id, [FromBody] CreateOrUpdateEntityDefinitionDto input)
        {
            return _entityModelingService.UpdateEntityAsync(id, input);
        }

        /// <summary>
        /// 删除实体定义
        /// </summary>
        [HttpDelete("entities/{id}")]
        public Task DeleteEntityAsync(Guid id)
        {
            return _entityModelingService.DeleteEntityAsync(id);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 字段管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 添加字段
        /// </summary>
        [HttpPost("fields")]
        public Task<EntityFieldDto> AddFieldAsync([FromBody] CreateOrUpdateEntityFieldDto input)
        {
            return _entityModelingService.AddFieldAsync(input);
        }

        /// <summary>
        /// 更新字段
        /// </summary>
        [HttpPut("fields/{id}")]
        public Task<EntityFieldDto> UpdateFieldAsync(Guid id, [FromBody] CreateOrUpdateEntityFieldDto input)
        {
            return _entityModelingService.UpdateFieldAsync(id, input);
        }

        /// <summary>
        /// 删除字段
        /// </summary>
        [HttpDelete("fields/{id}")]
        public Task DeleteFieldAsync(Guid id)
        {
            return _entityModelingService.DeleteFieldAsync(id);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 关系管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取所有实体关系
        /// </summary>
        [HttpGet("relations")]
        public Task<List<EntityRelationDto>> GetAllRelationsAsync()
        {
            return _entityModelingService.GetAllRelationsAsync();
        }

        /// <summary>
        /// 创建实体关系
        /// </summary>
        [HttpPost("relations")]
        public Task<EntityRelationDto> CreateRelationAsync([FromBody] CreateOrUpdateEntityRelationDto input)
        {
            return _entityModelingService.CreateRelationAsync(input);
        }

        /// <summary>
        /// 更新实体关系
        /// </summary>
        [HttpPut("relations/{id}")]
        public Task<EntityRelationDto> UpdateRelationAsync(Guid id, [FromBody] CreateOrUpdateEntityRelationDto input)
        {
            return _entityModelingService.UpdateRelationAsync(id, input);
        }

        /// <summary>
        /// 删除实体关系
        /// </summary>
        [HttpDelete("relations/{id}")]
        public Task DeleteRelationAsync(Guid id)
        {
            return _entityModelingService.DeleteRelationAsync(id);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 架构验证
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 验证实体架构
        /// </summary>
        [HttpPost("validate-schema")]
        public Task<SchemaValidationResult> ValidateSchemaAsync()
        {
            return _entityModelingService.ValidateSchemaAsync();
        }
    }
}

