using System;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.Application.Contracts.Equipment
{
    public class CreateEquipmentDto
    {
        [Required(ErrorMessage = "设备名称不能为空")]
        [MaxLength(200)]
        public string Name { get; set; }

        [Required(ErrorMessage = "设备编号不能为空")]
        [MaxLength(50)]
        [RegularExpression(@"^[A-Z0-9-]+$", ErrorMessage = "设备编号只能包含大写字母、数字和连字符")]
        public string Code { get; set; }

        [MaxLength(1000)]
        public string Description { get; set; }

        [Required(ErrorMessage = "设备类型不能为空")]
        [MaxLength(100)]
        public string Type { get; set; }

        [MaxLength(200)]
        public string Manufacturer { get; set; }

        [MaxLength(100)]
        public string Model { get; set; }

        [MaxLength(100)]
        public string SerialNumber { get; set; }

        [Required(ErrorMessage = "位置不能为空")]
        [MaxLength(500)]
        public string Location { get; set; }

        [Required(ErrorMessage = "所属生产线不能为空")]
        public Guid ProductionLineId { get; set; }

        [Range(1, 365)]
        public int MaintenanceCycle { get; set; } = 30;

        [MaxLength(100)]
        public string MaintenanceResponsible { get; set; }

        [MaxLength(100)]
        public string PLCAddress { get; set; }

        public int? PLCPort { get; set; }

        public bool IsEnabled { get; set; } = true;
    }
}

