// EnhancedEntityTemplate.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

{{#each Interfaces}}
using {{this}};
{{/each}}

namespace {{ Namespace }}.{{ ModuleName }}
{
    /// <summary>
    /// {{ Description }}
    /// </summary>
    {{#if IsAggregateRoot}}
    public class {{ EntityName }} : FullAuditedAggregateRoot<Guid>{{#if IsMultiTenant}}, IMultiTenant{{/if}}{{#each Interfaces}}, {{this}}{{/each}}
    {{else}}
    public class {{ EntityName }} : FullAuditedEntity<Guid>{{#if IsMultiTenant}}, IMultiTenant{{/if}}{{#each Interfaces}}, {{this}}{{/each}}
    {{/if}}
    {
        {{#each Properties}}
        /// <summary>
        /// {{ Description }}
        /// {{#if HelpText}}/// {{HelpText}}{{/if}}
        /// </summary>
        {{#each ValidationRules}}
        {{#if (eq Type 'Required')}}
        [Required(ErrorMessage = "{{ErrorMessage}}")]
        {{/if}}
        {{#if (eq Type 'StringLength')}}
        [StringLength({{Parameters.MaxLength}}{{#if Parameters.MinLength}}, MinimumLength = {{Parameters.MinLength}}{{/if}}{{#if ErrorMessage}}, ErrorMessage = "{{ErrorMessage}}"{{/if}})]
        {{/if}}
        {{#if (eq Type 'Range')}}
        [Range({{Parameters.Minimum}}, {{Parameters.Maximum}}{{#if ErrorMessage}}, ErrorMessage = "{{ErrorMessage}}"{{/if}})]
        {{/if}}
        {{#if (eq Type 'RegularExpression')}}
        [RegularExpression(@"{{Parameters.Pattern}}"{{#if ErrorMessage}}, ErrorMessage = "{{ErrorMessage}}"{{/if}})]
        {{/if}}
        {{/each}}
        {{#if DisplayName}}
        [Display(Name = "{{DisplayName}}")]
        {{/if}}
        public virtual {{Type}}{{#unless IsRequired}}?{{/unless}} {{Name}} { get; set; }
        
        {{/each}}
        
        {{#each Relationships}}
        {{#if (eq Type 'OneToMany')}}
        /// <summary>
        /// 导航属性：{{TargetEntity}}
        /// </summary>
        public virtual ICollection<{{TargetEntity}}> {{TargetNavigationProperty}} { get; set; } = new List<{{TargetEntity}}>();
        {{/if}}
        {{#if (eq Type 'ManyToOne')}}
        /// <summary>
        /// 外键：{{TargetEntity}}
        /// </summary>
        {{#if ForeignKeyProperty}}
        public virtual Guid? {{ForeignKeyProperty}} { get; set; }
        {{/if}}
        /// <summary>
        /// 导航属性：{{TargetEntity}}
        /// </summary>
        public virtual {{TargetEntity}} {{TargetNavigationProperty}} { get; set; }
        {{/if}}
        {{#if (eq Type 'OneToOne')}}
        /// <summary>
        /// 外键：{{TargetEntity}}
        /// </summary>
        {{#if ForeignKeyProperty}}
        public virtual Guid? {{ForeignKeyProperty}} { get; set; }
        {{/if}}
        /// <summary>
        /// 导航属性：{{TargetEntity}}
        /// </summary>
        public virtual {{TargetEntity}} {{TargetNavigationProperty}} { get; set; }
        {{/if}}
        {{#if (eq Type 'ManyToMany')}}
        /// <summary>
        /// 导航属性：{{TargetEntity}}
        /// </summary>
        public virtual ICollection<{{TargetEntity}}> {{TargetNavigationProperty}} { get; set; } = new List<{{TargetEntity}}>();
        {{/if}}
        {{/each}}
        
        {{#if IsMultiTenant}}
        public virtual Guid? TenantId { get; set; }
        {{/if}}

        protected {{ EntityName }}()
        {
        }

        public {{ EntityName }}(Guid id) : base(id)
        {
        }
    }
}
