using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    /// <summary>
    /// 🔥 实体关系DTO
    /// 对应前端: EntityRelation (entityModeling.ts)
    /// 对应后端: EntityRelation (Domain)
    /// </summary>
    public class EntityRelationDto : FullAuditedEntityDto<Guid>
    {
        /// <summary>
        /// 源实体名称
        /// </summary>
        public required string FromEntity { get; set; }

        /// <summary>
        /// 目标实体名称
        /// </summary>
        public required string ToEntity { get; set; }

        /// <summary>
        /// 关系类型：one-to-one, one-to-many, many-to-many
        /// </summary>
        public required string RelationType { get; set; }

        /// <summary>
        /// 外键字段名
        /// </summary>
        public required string ForeignKey { get; set; }

        /// <summary>
        /// 导航属性名称
        /// </summary>
        public required string NavigationProperty { get; set; }

        /// <summary>
        /// 中间表名（仅many-to-many）
        /// </summary>
        public required string JoinTable { get; set; }

        /// <summary>
        /// 级联删除
        /// </summary>
        public bool CascadeDelete { get; set; }

        /// <summary>
        /// 租户ID（可选）
        /// </summary>
        public Guid? TenantId { get; set; }
    }

    /// <summary>
    /// 🔥 创建/更新关系DTO
    /// </summary>
    public class CreateOrUpdateEntityRelationDto
    {
        public required string FromEntity { get; set; }
        public required string ToEntity { get; set; }
        public required string RelationType { get; set; }
        public required string ForeignKey { get; set; }
        public required string NavigationProperty { get; set; }
        public required string JoinTable { get; set; }
        public bool CascadeDelete { get; set; }
    }
}

