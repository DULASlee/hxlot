using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.Equipment
{
    /// <summary>
    /// 设备DTO
    /// 用途：数据传输对象，与前端TypeScript类型100%一致
    /// 符合铁律5：DTO一致性
    /// </summary>
    public class EquipmentDto : FullAuditedEntityDto<Guid>
    {
        // 基本信息
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string Manufacturer { get; set; }
        public string Model { get; set; }
        public string SerialNumber { get; set; }
        public string Location { get; set; }

        // 状态信息
        public string Status { get; set; }
        public string HealthStatus { get; set; }
        public double Temperature { get; set; }
        public double Pressure { get; set; }
        public double Vibration { get; set; }
        public double Speed { get; set; }
        public double Power { get; set; }
        public double Current { get; set; }
        public double Voltage { get; set; }
        public DateTime LastUpdateTime { get; set; }

        // 统计信息
        public double TotalRunningHours { get; set; }
        public double DailyRunningHours { get; set; }
        public int TotalProduction { get; set; }
        public int DailyProduction { get; set; }
        public int FaultCount { get; set; }
        public double UtilizationRate { get; set; }
        public double OEE { get; set; }

        // 维护信息
        public DateTime? LastMaintenanceDate { get; set; }
        public DateTime? NextMaintenanceDate { get; set; }
        public int MaintenanceCycle { get; set; }
        public string MaintenanceResponsible { get; set; }

        // 外键关系
        public Guid ProductionLineId { get; set; }
        public Guid? TenantId { get; set; }

        // 配置信息
        public bool IsEnabled { get; set; }
        public bool IsOnline { get; set; }
        public string PLCAddress { get; set; }
        public int? PLCPort { get; set; }
    }
}

