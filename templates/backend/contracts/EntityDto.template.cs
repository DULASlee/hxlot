/*
 * AI_TEMPLATE_INFO: {"version":"1.1","type":"C#","handler":"None"}
 * TEMPLATE_DESCRIPTION: 为实体生成标准的Data Transfer Object (DTO)，包含审计字段和常用属性。
 * USAGE_GUIDE:
 * 1. 替换 {{entityName}} 为实体名 (如 'Product')。
 * 2. 替换 {{primaryKeyType}} 为实体主键类型 (如 'Guid')。
 */
using System;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts
{
    public class {{entityName}}Dto : AuditedEntityDto<{{primaryKeyType}}>
    {
        [Required]
        [StringLength(128)]
        public string Name { get; set; }

        [StringLength(256)]
        public string DisplayName { get; set; }

        [StringLength(512)]
        public string Description { get; set; }

        public bool IsEnabled { get; set; }

        public int Sort { get; set; }
    }
}
