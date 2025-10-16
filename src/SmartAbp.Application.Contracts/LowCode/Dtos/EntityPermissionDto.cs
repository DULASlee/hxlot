using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.LowCode.Dtos
{
    public class EntityPermissionDto : EntityDto<Guid>
    {
        public Guid EntityDefinitionId { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public bool IsGranted { get; set; }
    }
}


