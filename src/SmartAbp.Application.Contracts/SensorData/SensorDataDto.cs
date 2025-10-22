using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.SensorData
{
    public class SensorDataDto : FullAuditedEntityDto<Guid>
    {
        public string SensorType { get; set; }
        public string SensorName { get; set; }
        public string SensorCode { get; set; }
        public double Value { get; set; }
        public string Unit { get; set; }
        public DateTime Timestamp { get; set; }
        public Guid ProductionLineId { get; set; }
        public Guid EquipmentId { get; set; }
        public double? MinValue { get; set; }
        public double? MaxValue { get; set; }
        public double? WarningThreshold { get; set; }
        public double? AlarmThreshold { get; set; }
        public bool IsAlarm { get; set; }
        public string AlarmLevel { get; set; }
        public string AlarmMessage { get; set; }
        public string Status { get; set; }
        public double? Accuracy { get; set; }
        public string RawData { get; set; }
        public Guid? TenantId { get; set; }
    }
}

