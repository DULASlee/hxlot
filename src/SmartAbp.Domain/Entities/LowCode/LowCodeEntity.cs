using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.Domain.Entities.LowCode
{
    /// <summary>
    /// 🔥 低代码实体聚合根（Phase 1 核心表）
    /// 对应表名: LC_Entities
    /// 用途: 定义业务实体（如User, Order, Project）
    /// 架构决策: 后端SSOT，通过NSwag生成前端TypeScript类型
    /// </summary>
    [Table("LC_Entities")]
    public class LowCodeEntity : AuditedAggregateRoot<Guid>, IMultiTenant
    {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 外键关系
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 所属模块ID
        /// </summary>
        public Guid ModuleId { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 基础信息
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 实体名称（PascalCase，如：User, Order）
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = default!;

        /// <summary>
        /// 显示名称（中文，如：用户、订单）
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string DisplayName { get; set; } = default!;

        /// <summary>
        /// 实体描述
        /// </summary>
        [MaxLength(500)]
        public string? Description { get; set; }

        /// <summary>
        /// 复数名称（如：Users, Orders）
        /// </summary>
        [MaxLength(100)]
        public string? PluralName { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 数据库映射
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 数据库表名（如：Users, Orders）
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string TableName { get; set; } = default!;

        /// <summary>
        /// 数据库Schema（如：dbo, app）
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string Schema { get; set; } = "dbo";

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // JSON配置（强类型DTO）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 实体配置（JSON存储）
        /// </summary>
        public EntityConfig? EntityConfig { get; set; }

        /// <summary>
        /// UI配置（JSON存储）
        /// </summary>
        public EntityUIConfig? UIConfig { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 排序和分组
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 显示顺序
        /// </summary>
        public int DisplayOrder { get; set; }

        /// <summary>
        /// 分组名称（用于组织实体）
        /// </summary>
        [MaxLength(100)]
        public string? GroupName { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 状态管理
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 是否激活
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// 租户ID（多租户支持）
        /// </summary>
        public Guid? TenantId { get; set; }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 导航属性
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 所属模块
        /// </summary>
        public virtual LowCodeModule Module { get; set; } = default!;

        /// <summary>
        /// 实体属性列表
        /// </summary>
        public virtual ICollection<LowCodeProperty> Properties { get; set; } = new List<LowCodeProperty>();

        /// <summary>
        /// 页面配置列表
        /// </summary>
        public virtual ICollection<LowCodePageConfig> PageConfigs { get; set; } = new List<LowCodePageConfig>();

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 构造函数
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        protected LowCodeEntity()
        {
            // EF Core需要无参构造函数
        }

        public LowCodeEntity(
            Guid id,
            Guid moduleId,
            string name,
            string displayName,
            string tableName) : base(id)
        {
            ModuleId = moduleId;
            Name = name;
            DisplayName = displayName;
            TableName = tableName;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 强类型DTO（JSON配置）- 后端SSOT核心
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 实体配置
    /// </summary>
    public class EntityConfig
    {
        /// <summary>
        /// 是否聚合根
        /// </summary>
        public bool IsAggregateRoot { get; set; } = true;

        /// <summary>
        /// 基类名称（如：AuditedAggregateRoot, Entity）
        /// </summary>
        public string BaseClass { get; set; } = "AuditedAggregateRoot";

        /// <summary>
        /// 实现的接口列表（如：IMultiTenant, ISoftDelete）
        /// </summary>
        public List<string> Interfaces { get; set; } = new List<string>();

        /// <summary>
        /// 是否审计
        /// </summary>
        public bool IsAudited { get; set; } = true;

        /// <summary>
        /// 是否软删除
        /// </summary>
        public bool IsSoftDelete { get; set; } = true;

        /// <summary>
        /// 是否多租户
        /// </summary>
        public bool IsMultiTenant { get; set; } = false;

        /// <summary>
        /// 是否可缓存
        /// </summary>
        public bool IsCacheable { get; set; } = false;
    }

    /// <summary>
    /// 实体UI配置
    /// </summary>
    public class EntityUIConfig
    {
        /// <summary>
        /// 图标
        /// </summary>
        public string? Icon { get; set; }

        /// <summary>
        /// 颜色
        /// </summary>
        public string? Color { get; set; }

        /// <summary>
        /// 列表页分页大小
        /// </summary>
        public int ListPageSize { get; set; } = 20;

        /// <summary>
        /// 是否启用导出
        /// </summary>
        public bool EnableExport { get; set; } = true;

        /// <summary>
        /// 是否启用导入
        /// </summary>
        public bool EnableImport { get; set; } = true;

        /// <summary>
        /// 是否启用批量删除
        /// </summary>
        public bool EnableBatchDelete { get; set; } = true;
    }
}

