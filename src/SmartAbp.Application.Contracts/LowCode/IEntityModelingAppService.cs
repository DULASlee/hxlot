using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using Volo.Abp.Application.Services;

namespace SmartAbp.Application.Contracts.LowCode
{
    /// <summary>
    /// 🔥 实体建模应用服务接口
    /// 对应前端: entityModeling.ts (Store)
    /// 功能: 低代码引擎的实体建模管理
    /// </summary>
    public interface IEntityModelingAppService : IApplicationService
    {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 实体定义管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取所有实体定义
        /// </summary>
        Task<List<EntityDefinitionDto>> GetAllEntitiesAsync();

        /// <summary>
        /// 根据ID获取实体定义
        /// </summary>
        Task<EntityDefinitionDto> GetEntityByIdAsync(Guid id);

        /// <summary>
        /// 根据名称获取实体定义
        /// </summary>
        Task<EntityDefinitionDto> GetEntityByNameAsync(string name);

        /// <summary>
        /// 创建实体定义
        /// </summary>
        Task<EntityDefinitionDto> CreateEntityAsync(CreateOrUpdateEntityDefinitionDto input);

        /// <summary>
        /// 更新实体定义
        /// </summary>
        Task<EntityDefinitionDto> UpdateEntityAsync(Guid id, CreateOrUpdateEntityDefinitionDto input);

        /// <summary>
        /// 删除实体定义
        /// </summary>
        Task DeleteEntityAsync(Guid id);

        /// <summary>
        /// 批量删除实体定义
        /// </summary>
        Task BatchDeleteEntitiesAsync(List<Guid> ids);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 字段管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 为实体添加字段
        /// </summary>
        Task<EntityFieldDto> AddFieldAsync(CreateOrUpdateEntityFieldDto input);

        /// <summary>
        /// 更新字段
        /// </summary>
        Task<EntityFieldDto> UpdateFieldAsync(Guid id, CreateOrUpdateEntityFieldDto input);

        /// <summary>
        /// 删除字段
        /// </summary>
        Task DeleteFieldAsync(Guid id);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 关系管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取所有关系
        /// </summary>
        Task<List<EntityRelationDto>> GetAllRelationsAsync();

        /// <summary>
        /// 创建关系
        /// </summary>
        Task<EntityRelationDto> CreateRelationAsync(CreateOrUpdateEntityRelationDto input);

        /// <summary>
        /// 更新关系
        /// </summary>
        Task<EntityRelationDto> UpdateRelationAsync(Guid id, CreateOrUpdateEntityRelationDto input);

        /// <summary>
        /// 删除关系
        /// </summary>
        Task DeleteRelationAsync(Guid id);

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 架构验证
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 验证实体架构
        /// </summary>
        Task<SchemaValidationResult> ValidateSchemaAsync();
    }

    /// <summary>
    /// 架构验证结果
    /// </summary>
    public class SchemaValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }
}

