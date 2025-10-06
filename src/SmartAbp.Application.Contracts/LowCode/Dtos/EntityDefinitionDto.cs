using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    /// <summary>
    /// 🔥 实体定义DTO
    /// 对应前端: EntityDefinition (entityModeling.ts)
    /// 对应后端: EntityDefinition (Domain)
    /// </summary>
    public class EntityDefinitionDto : FullAuditedEntityDto<Guid>
    {
        /// <summary>
        /// 实体名称（PascalCase）
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 数据库表名
        /// </summary>
        public string TableName { get; set; }

        /// <summary>
        /// 显示名称（中文）
        /// </summary>
        public string DisplayName { get; set; }

        /// <summary>
        /// 实体描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 实体类型：aggregate-root, entity, value-object
        /// </summary>
        public string EntityType { get; set; }

        /// <summary>
        /// 基类：Entity, AuditedEntity, FullAuditedEntity
        /// </summary>
        public string BaseType { get; set; }

        /// <summary>
        /// 命名空间
        /// </summary>
        public string Namespace { get; set; }

        /// <summary>
        /// 实体字段集合
        /// </summary>
        public List<EntityFieldDto> Fields { get; set; } = new();

        /// <summary>
        /// 租户ID（可选）
        /// </summary>
        public Guid? TenantId { get; set; }
    }

    /// <summary>
    /// 🔥 创建/更新实体定义DTO
    /// </summary>
    public class CreateOrUpdateEntityDefinitionDto
    {
        public string Name { get; set; }
        public string TableName { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string EntityType { get; set; }
        public string BaseType { get; set; }
        public string Namespace { get; set; }
        public List<EntityFieldDto> Fields { get; set; } = new();
    }
}

