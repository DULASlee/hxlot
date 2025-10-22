using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.SensorData
{
    public class GetSensorDataListInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }
        public string SensorType { get; set; }
        public Guid? ProductionLineId { get; set; }
        public Guid? EquipmentId { get; set; }
        public bool? IsAlarm { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
    }
}

