using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.Domain.Entities.LowCode
{
    /// <summary>
    /// 🔥 实体定义聚合根
    /// 对应前端: EntityDefinition (entityModeling.ts)
    /// 用途: 低代码引擎的实体建模核心领域对象
    /// </summary>
    public class EntityDefinition : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        /// <summary>
        /// 实体名称（PascalCase，如：User, Order）
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 数据库表名（如：Users, Orders）
        /// </summary>
        public string TableName { get; set; }

        /// <summary>
        /// 显示名称（中文，如：用户、订单）
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
        /// 命名空间（用于代码生成）
        /// </summary>
        public string Namespace { get; set; }

        /// <summary>
        /// 实体类别：core, relation, config, log（保留用于分类）
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// 所属模块（用于代码生成，如：Identity, Catalog）
        /// </summary>
        public string Module { get; set; }

        /// <summary>
        /// 是否启用软删除
        /// </summary>
        public bool EnableSoftDelete { get; set; }

        /// <summary>
        /// 是否启用审计
        /// </summary>
        public bool EnableAudit { get; set; }

        /// <summary>
        /// 是否启用多租户
        /// </summary>
        public bool EnableMultiTenant { get; set; }

        /// <summary>
        /// 是否已完成（至少2个字段 + 1个主键）
        /// </summary>
        public bool IsCompleted { get; set; }

        /// <summary>
        /// 租户ID（多租户支持）
        /// </summary>
        public Guid? TenantId { get; set; }

        /// <summary>
        /// 导航属性：实体字段列表
        /// </summary>
        public virtual ICollection<EntityField> Fields { get; set; }

        /// <summary>
        /// 导航属性：验证规则列表
        /// </summary>
        public virtual ICollection<ValidationRule> ValidationRules { get; set; }

        /// <summary>
        /// 导航属性：关系列表
        /// </summary>
        public virtual ICollection<EntityRelation> Relationships { get; set; }

        // ══════════════════════════════════════════════════════
        // 统一Schema补充字段（与DTO对齐）
        // ══════════════════════════════════════════════════════
        
        public string Schema { get; set; }
        public bool IsAggregateRoot { get; set; }
        public string BaseClass { get; set; }
        public bool IsAudited { get; set; }
        public bool IsSoftDelete { get; set; }
        public bool IsMultiTenant { get; set; }
        public string SchemaVersion { get; set; }
        public string Version { get; set; }

        /// <summary>
        /// 构造函数（EF Core需要）
        /// </summary>
        public EntityDefinition()
        {
            Fields = new List<EntityField>();
            ValidationRules = new List<ValidationRule>();
            Relationships = new List<EntityRelation>();
        }

        /// <summary>
        /// 创建实体定义
        /// </summary>
        public EntityDefinition(
            Guid id,
            string name,
            string tableName,
            string displayName,
            string description,
            string category,
            string module,
            bool enableSoftDelete = true,
            bool enableAudit = true,
            bool enableMultiTenant = false)
            : base(id)
        {
            Name = name;
            TableName = tableName;
            DisplayName = displayName;
            Description = description;
            Category = category;
            Module = module;
            EnableSoftDelete = enableSoftDelete;
            EnableAudit = enableAudit;
            EnableMultiTenant = enableMultiTenant;
            IsCompleted = false;

            Fields = new List<EntityField>();
            ValidationRules = new List<ValidationRule>();
        }

        /// <summary>
        /// 添加字段
        /// </summary>
        public void AddField(EntityField field)
        {
            Fields.Add(field);
            CheckCompletion();
        }

        /// <summary>
        /// 移除字段
        /// </summary>
        public void RemoveField(EntityField field)
        {
            Fields.Remove(field);
            CheckCompletion();
        }

        /// <summary>
        /// 添加验证规则
        /// </summary>
        public void AddValidationRule(ValidationRule rule)
        {
            ValidationRules.Add(rule);
        }

        /// <summary>
        /// 检查完成状态
        /// 完成条件：至少1个主键 + 至少2个字段
        /// </summary>
        private void CheckCompletion()
        {
            var hasPrimaryKey = false;
            var fieldCount = 0;

            foreach (var field in Fields)
            {
                fieldCount++;
                if (field.IsPrimaryKey)
                {
                    hasPrimaryKey = true;
                }
            }

            IsCompleted = hasPrimaryKey && fieldCount >= 2;
        }
    }
}

