using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    public class BusinessRuleDto : EntityDto<Guid>
    {
        public Guid EntityDefinitionId { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string RuleType { get; set; }
        public string Condition { get; set; }
        public string Action { get; set; }
        public int Priority { get; set; }
        public bool IsActive { get; set; }
    }
}

