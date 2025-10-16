using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    public class EntityIndexDto : EntityDto<Guid>
    {
        public Guid EntityDefinitionId { get; set; }
        public string Name { get; set; }
        public List<string> Columns { get; set; }
        public bool IsUnique { get; set; }
        public bool IsClustered { get; set; }
    }

    public class EntityConstraintDto : EntityDto<Guid>
    {
        public Guid EntityDefinitionId { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Definition { get; set; }
    }
}


