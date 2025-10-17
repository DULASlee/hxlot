using System;
using System.Collections.Generic;
using SmartAbp.Domain.Entities.LowCode;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    // ══════════════════════════════════════════════════════
    // 强类型枚举（与前端统一）
    // ══════════════════════════════════════════════════════
    // 注：RelationType已在EntityRelationDto.cs定义
    // 注：FieldType、ValidationRuleType在FieldAndRuleEnums.cs定义

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

        // ───────── 统一Schema新增字段（逐步对齐，向后兼容） ─────────

        /// <summary>
        /// 数据库Schema（如 dbo）
        /// </summary>
        public string Schema { get; set; }

        /// <summary>
        /// 是否聚合根
        /// </summary>
        public bool IsAggregateRoot { get; set; }

        /// <summary>
        /// 基类（如 FullAuditedAggregateRoot<Guid>）
        /// </summary>
        public string BaseClass { get; set; }

        /// <summary>
        /// 实现的接口
        /// </summary>
        public List<string> Interfaces { get; set; } = new();

        /// <summary>
        /// ABP特性：审计、软删、多租户
        /// </summary>
        public bool IsAudited { get; set; }
        public bool IsSoftDelete { get; set; }
        public bool IsMultiTenant { get; set; }

        /// <summary>
        /// 实体字段集合
        /// </summary>
        public List<EntityFieldDto> Fields { get; set; } = new();

        /// <summary>
        /// 关系列表
        /// </summary>
        public List<EntityRelationDto> Relationships { get; set; } = new();

        /// <summary>
        /// 验证/业务规则、索引、约束
        /// </summary>
        public List<ValidationRuleDto> ValidationRules { get; set; } = new();
        public List<SmartAbp.Application.Contracts.BusinessRules.Dtos.BusinessRuleDto> BusinessRules { get; set; } = new();
        public List<EntityIndexDto> Indexes { get; set; } = new();
        public List<EntityConstraintDto> Constraints { get; set; } = new();

        /// <summary>
        /// 权限与UI、代码生成配置
        /// </summary>
        public List<EntityPermissionDto> Permissions { get; set; } = new();

        /// <summary>
        /// 页面配置（引用Domain层完整类型）- Phase 1B架构修正
        /// </summary>
        public PageConfigDto? PageConfig { get; set; }

        public CodeGenerationConfigDto CodeGeneration { get; set; }

        /// <summary>
        /// 租户ID（可选）
        /// </summary>
        public Guid? TenantId { get; set; }

        /// <summary>
        /// 状态与版本
        /// </summary>
        public bool IsCompleted { get; set; }
        public List<string> Tags { get; set; } = new();
        public string SchemaVersion { get; set; }
        public string Version { get; set; }
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
        // 可渐进补充：Relationships/Validation/UI/CodeGeneration 等
    }
}

