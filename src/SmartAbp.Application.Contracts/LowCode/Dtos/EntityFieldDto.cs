using System;
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

