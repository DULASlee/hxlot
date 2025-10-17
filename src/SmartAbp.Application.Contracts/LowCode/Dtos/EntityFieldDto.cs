using System;
using System.Collections.Generic;
using SmartAbp.Domain.Entities.LowCode;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    /// <summary>
    /// 🔥 实体字段DTO
    /// 对应前端: EntityField (entityModeling.ts)
    /// 对应后端: EntityField (Domain)
    /// </summary>
    public class EntityFieldDto : EntityDto<Guid>
    {
        /// <summary>
        /// 所属实体ID
        /// </summary>
        public Guid EntityDefinitionId { get; set; }

        /// <summary>
        /// 字段名称（PascalCase）
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 显示名称（中文）
        /// </summary>
        public string DisplayName { get; set; }

        /// <summary>
        /// 字段类型
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
        /// 是否唯一
        /// </summary>
        public bool IsUnique { get; set; }

        /// <summary>
        /// 是否索引
        /// </summary>
        public bool IsIndexed { get; set; }

        /// <summary>
        /// 默认值
        /// </summary>
        public string DefaultValue { get; set; }

        /// <summary>
        /// 备注
        /// </summary>
        public string Comment { get; set; }

        /// <summary>
        /// 排序
        /// </summary>
        public int Order { get; set; }

        // ══════════════════════════════════════════════════════
        // 统一Schema补充字段（向后兼容，全部为可选/扩展）
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 是否主键
        /// </summary>
        public bool IsPrimaryKey { get; set; }

        /// <summary>
        /// 最小长度
        /// </summary>
        public int? MinLength { get; set; }

        /// <summary>
        /// 精度（decimal）
        /// </summary>
        public int? Precision { get; set; }

        /// <summary>
        /// 小数位数（decimal）
        /// </summary>
        public int? Scale { get; set; }

        /// <summary>
        /// 最小值（数值）
        /// </summary>
        public decimal? MinValue { get; set; }

        /// <summary>
        /// 最大值（数值）
        /// </summary>
        public decimal? MaxValue { get; set; }

        /// <summary>
        /// 正则表达式
        /// </summary>
        public string Pattern { get; set; }

        /// <summary>
        /// 枚举配置
        /// </summary>
        public List<EnumValueDto> EnumValues { get; set; } = new();

        /// <summary>
        /// 验证规则
        /// </summary>
        public List<ValidationRuleDto> ValidationRules { get; set; } = new();

        // ═════════════════════════════════════════════════════════════
        // Phase 1B架构修正：引用Domain层完整UI配置类型（后端SSOT）
        // ═════════════════════════════════════════════════════════════

        /// <summary>
        /// 完整的UI配置（引用Domain层PropertyUIConfig）
        /// 包含：显示控制、控件类型、数据源配置、验证规则、列表/表单字段配置等
        /// </summary>
        public PropertyUIConfig? UIConfig { get; set; }

        // ───────── 数据库映射（持久化需求） ─────────

        public string ColumnName { get; set; }
        public string ColumnType { get; set; }
        public bool IsAuditField { get; set; }
        public bool IsSoftDeleteField { get; set; }
        public bool IsTenantField { get; set; }
    }

    /// <summary>
    /// 🔥 创建/更新字段DTO
    /// </summary>
    public class CreateOrUpdateEntityFieldDto
    {
        public Guid EntityDefinitionId { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Type { get; set; }
        public int? Length { get; set; }
        public bool IsRequired { get; set; }
        public bool IsUnique { get; set; }
        public bool IsIndexed { get; set; }
        public string DefaultValue { get; set; }
        public string Comment { get; set; }
        public int Order { get; set; }
    }
}

