using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.Domain.Entities.LowCode
{
    /// <summary>
    /// 🔥 实体关系
    /// 对应前端: EntityRelation (entityModeling.ts)
    /// 用途: 定义实体之间的关系（1:1, 1:N, N:M）
    /// </summary>
    public class EntityRelation : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        /// <summary>
        /// 源实体名称
        /// </summary>
        public string FromEntity { get; set; }

        /// <summary>
        /// 目标实体名称
        /// </summary>
        public string ToEntity { get; set; }

        /// <summary>
        /// 关系类型：one-to-one, one-to-many, many-to-many
        /// </summary>
        public string RelationType { get; set; }

        /// <summary>
        /// 外键字段名
        /// </summary>
        public string ForeignKey { get; set; }

        /// <summary>
        /// 导航属性名称
        /// </summary>
        public string NavigationProperty { get; set; }

        /// <summary>
        /// 中间表名（仅多对多关系）
        /// </summary>
        public string JoinTable { get; set; }

        /// <summary>
        /// 关系描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 是否级联删除
        /// </summary>
        public bool CascadeDelete { get; set; }

        /// <summary>
        /// 租户ID
        /// </summary>
        public Guid? TenantId { get; set; }

        /// <summary>
        /// 构造函数（EF Core需要）
        /// </summary>
        public EntityRelation()
        {
        }

        /// <summary>
        /// 创建实体关系
        /// </summary>
        public EntityRelation(
            Guid id,
            string fromEntity,
            string toEntity,
            string relationType,
            string foreignKey,
            string navigationProperty = null,
            string description = null,
            bool cascadeDelete = false)
            : base(id)
        {
            FromEntity = fromEntity;
            ToEntity = toEntity;
            RelationType = relationType;
            ForeignKey = foreignKey;
            NavigationProperty = navigationProperty;
            Description = description;
            CascadeDelete = cascadeDelete;
        }
    }
}

