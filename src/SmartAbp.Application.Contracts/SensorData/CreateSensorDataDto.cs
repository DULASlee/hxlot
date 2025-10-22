using System;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.Application.Contracts.SensorData
{
    public class CreateSensorDataDto
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

        [Required]
        public Guid ProductionLineId { get; set; }

        [Required]
        public Guid EquipmentId { get; set; }

        public double? MinValue { get; set; }
        public double? MaxValue { get; set; }
        public double? WarningThreshold { get; set; }
        public double? AlarmThreshold { get; set; }

        [MaxLength(4000)]
        public string RawData { get; set; }
    }
}

