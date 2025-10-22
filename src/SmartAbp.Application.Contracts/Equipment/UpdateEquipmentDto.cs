using System;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.Application.Contracts.Equipment
{
    public class UpdateEquipmentDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; }

        [MaxLength(1000)]
        public string Description { get; set; }

        [Required]
        [MaxLength(100)]
        public string Type { get; set; }

        [MaxLength(200)]
        public string Manufacturer { get; set; }

        [MaxLength(100)]
        public string Model { get; set; }

        [MaxLength(100)]
        public string SerialNumber { get; set; }

        [Required]
        [MaxLength(500)]
        public string Location { get; set; }

        [MaxLength(50)]
        public string Status { get; set; }

        [MaxLength(50)]
        public string HealthStatus { get; set; }

        public Guid ProductionLineId { get; set; }

        [Range(1, 365)]
        public int MaintenanceCycle { get; set; }

        [MaxLength(100)]
        public string MaintenanceResponsible { get; set; }

        [MaxLength(100)]
        public string PLCAddress { get; set; }

        public int? PLCPort { get; set; }

        public bool IsEnabled { get; set; }
        public bool IsOnline { get; set; }
    }
}

