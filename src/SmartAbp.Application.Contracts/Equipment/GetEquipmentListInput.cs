using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.Equipment
{
    public class GetEquipmentListInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
        public string Status { get; set; }
        public string Type { get; set; }
        public Guid? ProductionLineId { get; set; }
        public bool? IsEnabled { get; set; }
        public bool? IsOnline { get; set; }
    }
}

