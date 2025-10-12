using System;
using Volo.Abp.Domain.Entities;

namespace SmartAbp.Domain.Entities.LowCode
{
    /// <summary>
    /// 🔥 实体字段
    /// 对应前端: EntityField (entityModeling.ts)
    /// 用途: 实体的字段定义
    /// </summary>
    public class EntityField : Entity<Guid>
    {
        /// <summary>
        /// 所属实体ID
        /// </summary>
        public Guid EntityDefinitionId { get; set; }

        /// <summary>
        /// 字段名称（PascalCase，如：UserName, OrderDate）
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 显示名称（中文，如：用户名、订单日期）
        /// </summary>
        public string DisplayName { get; set; }

        /// <summary>
        /// 字段类型（string, int, Guid, DateTime, bool等）
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// 字段长度（仅string类型）
        /// </summary>
        public int? Length { get; set; }

        /// <summary>
        /// 是否必填
        /// </summary>
        public bool IsRequired { get; set; }

        /// <summary>
        /// 是否主键
        /// </summary>
        public bool IsPrimaryKey { get; set; }

        /// <summary>
        /// 是否唯一约束
        /// </summary>
        public bool IsUnique { get; set; }

        /// <summary>
        /// 是否创建索引
        /// </summary>
        public bool IsIndexed { get; set; }

        /// <summary>
        /// 默认值
        /// </summary>
        public string DefaultValue { get; set; }

        /// <summary>
        /// 字段注释（数据库注释）
        /// </summary>
        public string? Comment { get; set; }

        /// <summary>
        /// 字段描述（业务描述）
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 显示顺序
        /// </summary>
        public int Order { get; set; }

        /// <summary>
        /// 导航属性：所属实体
        /// </summary>
        public virtual EntityDefinition EntityDefinition { get; set; }

        /// <summary>
        /// 构造函数（EF Core需要）
        /// </summary>
        public EntityField()
        {
            Name = string.Empty;
            DisplayName = string.Empty;
            Type = string.Empty;
            DefaultValue = string.Empty;
            Comment = string.Empty;
            Description = string.Empty;
            EntityDefinition = null!;
        }

        /// <summary>
        /// 创建实体字段
        /// </summary>
        public EntityField(
            Guid id,
            Guid entityDefinitionId,
            string name,
            string displayName,
            string type,
            bool isRequired,
            bool isPrimaryKey,
            int? length = null,
            string defaultValue = null,
            string description = null,
            int displayOrder = 0)
            : base(id)
        {
            EntityDefinitionId = entityDefinitionId;
            Name = name;
            DisplayName = displayName;
            Type = type;
            IsRequired = isRequired;
            IsPrimaryKey = isPrimaryKey;
            Length = length;
            DefaultValue = defaultValue;
            Description = description;
            Order = displayOrder;
        }
    }
}

