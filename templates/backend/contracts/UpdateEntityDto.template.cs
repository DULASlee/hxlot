/*
 * AI_TEMPLATE_INFO: {"version":"1.1","type":"C#","handler":"Handlebars"}
 * TEMPLATE_DESCRIPTION: 为实体生成标准的Update DTO。
 * USAGE_GUIDE:
 * 1. 替换 {{entityName}} 为实体名 (如 'Product')。
 */
using System;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.Application.Contracts
{
    public class {{entityName}}UpdateDto
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

        // {{#each properties}}
        // public {{{type}}} {{name}} { get; set; }
        // {{/each}}
    }
}
