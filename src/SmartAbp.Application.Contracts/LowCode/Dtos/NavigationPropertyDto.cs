using System;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    /// <summary>
    /// 🔥 导航属性DTO（Phase 2A - 后端SSOT）
    /// 用途: 描述实体间的关系（一对一、一对多、多对多）
    /// 架构决策: 100%后端SSOT，通过NSwag生成前端TypeScript类型
    /// </summary>
    public class NavigationPropertyDto
    {
        /// <summary>
        /// 导航属性名称（如：Orders、Customer）
        /// </summary>
        public string Name { get; set; } = default!;

        /// <summary>
        /// 目标实体名称（如：Order、Customer）
        /// </summary>
        public string TargetEntityName { get; set; } = default!;

        /// <summary>
        /// 目标实体ID（关联到LowCodeEntity）
        /// </summary>
        public Guid? TargetEntityId { get; set; }

        /// <summary>
        /// 关系类型：OneToOne | OneToMany | ManyToOne | ManyToMany
        /// </summary>
        public NavigationRelationType RelationType { get; set; }

        /// <summary>
        /// 外键字段名称（如：CustomerId、OrderId）
        /// </summary>
        public string? ForeignKeyName { get; set; }

        /// <summary>
        /// 反向导航属性名称（双向关系时使用，如：Customer.Orders ←→ Order.Customer）
        /// </summary>
        public string? InversePropertyName { get; set; }

        /// <summary>
        /// 级联删除：None | Cascade | SetNull | Restrict
        /// </summary>
        public CascadeDeleteBehavior CascadeDelete { get; set; } = CascadeDeleteBehavior.Restrict;

        /// <summary>
        /// 是否必需关联（外键是否可空）
        /// </summary>
        public bool IsRequired { get; set; } = false;

        /// <summary>
        /// 中间表名称（多对多关系时使用，如：ProductCategory）
        /// </summary>
        public string? JoinTableName { get; set; }

        /// <summary>
        /// 备注说明
        /// </summary>
        public string? Comment { get; set; }

        /// <summary>
        /// 显示顺序
        /// </summary>
        public int Order { get; set; }
    }

    /// <summary>
    /// 导航关系类型枚举
    /// </summary>
    public enum NavigationRelationType
    {
        /// <summary>
        /// 一对一（如：User ←→ UserProfile）
        /// </summary>
        OneToOne = 0,

        /// <summary>
        /// 一对多（如：Customer → Orders）
        /// </summary>
        OneToMany = 1,

        /// <summary>
        /// 多对一（如：Order → Customer）
        /// </summary>
        ManyToOne = 2,

        /// <summary>
        /// 多对多（如：Product ←→ Category）
        /// </summary>
        ManyToMany = 3
    }

    /// <summary>
    /// 级联删除行为枚举
    /// </summary>
    public enum CascadeDeleteBehavior
    {
        /// <summary>
        /// 无操作（默认）
        /// </summary>
        None = 0,

        /// <summary>
        /// 级联删除（删除主实体时自动删除关联实体）
        /// </summary>
        Cascade = 1,

        /// <summary>
        /// 设置为NULL（删除主实体时将外键设为NULL）
        /// </summary>
        SetNull = 2,

        /// <summary>
        /// 限制删除（存在关联时禁止删除主实体）
        /// </summary>
        Restrict = 3
    }

    /// <summary>
    /// 创建或更新导航属性DTO
    /// </summary>
    public class CreateOrUpdateNavigationPropertyDto
    {
        public string Name { get; set; } = default!;
        public string TargetEntityName { get; set; } = default!;
        public Guid? TargetEntityId { get; set; }
        public NavigationRelationType RelationType { get; set; }
        public string? ForeignKeyName { get; set; }
        public string? InversePropertyName { get; set; }
        public CascadeDeleteBehavior CascadeDelete { get; set; } = CascadeDeleteBehavior.Restrict;
        public bool IsRequired { get; set; } = false;
        public string? JoinTableName { get; set; }
        public string? Comment { get; set; }
        public int Order { get; set; }
    }
}

