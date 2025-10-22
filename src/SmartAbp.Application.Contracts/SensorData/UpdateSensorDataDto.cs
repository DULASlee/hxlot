using System;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.Application.Contracts.SensorData
{
    public class UpdateSensorDataDto
    {
        [Required]
        [MaxLength(100)]
        public string SensorType { get; set; }

        [Required]
        [MaxLength(200)]
        public string SensorName { get; set; }

        [Required]
        [MaxLength(50)]
        public string SensorCode { get; set; }

        [Required]
        public double Value { get; set; }

        [Required]
        [MaxLength(20)]
        public string Unit { get; set; }

        public Guid ProductionLineId { get; set; }
        public Guid EquipmentId { get; set; }
        public double? MinValue { get; set; }
        public double? MaxValue { get; set; }
        public double? WarningThreshold { get; set; }
        public double? AlarmThreshold { get; set; }
        public bool IsAlarm { get; set; }

        [MaxLength(50)]
        public string AlarmLevel { get; set; }

        [MaxLength(500)]
        public string AlarmMessage { get; set; }

        [MaxLength(50)]
        public string Status { get; set; }

        [MaxLength(4000)]
        public string RawData { get; set; }
    }
}

