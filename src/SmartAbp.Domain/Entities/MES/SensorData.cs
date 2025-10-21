using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.Domain.Entities.MES
{
    /// <summary>
    /// 📊 传感器数据实体
    /// 用途: 存储传感器历史数据，用于实时图表和数据分析
    /// </summary>
    public class SensorData : CreationAuditedAggregateRoot<Guid>, IMultiTenant
    {
        // ══════════════════════════════════════════════════════
        // 基本信息
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 传感器类型：temperature（温度）、pressure（压力）、vibration（振动）、speed（转速）、power（功率）、current（电流）、voltage（电压）、production（产量）
        /// </summary>
        public string SensorType { get; set; }

        /// <summary>
        /// 传感器名称（如：温度传感器1）
        /// </summary>
        public string SensorName { get; set; }

        /// <summary>
        /// 传感器编号
        /// </summary>
        public string SensorCode { get; set; }

        /// <summary>
        /// 数据值
        /// </summary>
        public double Value { get; set; }

        /// <summary>
        /// 单位（如：°C、MPa、mm/s、RPM、kW、A、V、件）
        /// </summary>
        public string Unit { get; set; }

        /// <summary>
        /// 时间戳（数据采集时间）
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// 数据质量：good（良好）、warning（警告）、bad（异常）
        /// </summary>
        public string Quality { get; set; }

        /// <summary>
        /// 是否告警
        /// </summary>
        public bool IsAlarm { get; set; }

        /// <summary>
        /// 告警级别：info、warning、error、critical
        /// </summary>
        public string AlarmLevel { get; set; }

        /// <summary>
        /// 告警信息
        /// </summary>
        public string AlarmMessage { get; set; }

        // ══════════════════════════════════════════════════════
        // 外键关系
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 所属生产线ID
        /// </summary>
        public Guid ProductionLineId { get; set; }

        /// <summary>
        /// 导航属性：所属生产线
        /// </summary>
        public virtual ProductionLine ProductionLine { get; set; }

        /// <summary>
        /// 所属设备ID（可选，如果是设备级传感器）
        /// </summary>
        public Guid? EquipmentId { get; set; }

        /// <summary>
        /// 导航属性：所属设备
        /// </summary>
        public virtual Equipment Equipment { get; set; }

        /// <summary>
        /// 租户ID（多租户支持）
        /// </summary>
        public Guid? TenantId { get; set; }

        // ══════════════════════════════════════════════════════
        // 数据分析字段
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 最小值（用于范围检测）
        /// </summary>
        public double? MinValue { get; set; }

        /// <summary>
        /// 最大值（用于范围检测）
        /// </summary>
        public double? MaxValue { get; set; }

        /// <summary>
        /// 平均值（用于趋势分析）
        /// </summary>
        public double? AvgValue { get; set; }

        /// <summary>
        /// 标准差（用于异常检测）
        /// </summary>
        public double? StdDeviation { get; set; }

        /// <summary>
        /// 数据来源：plc（PLC采集）、manual（手动录入）、calculated（计算得出）
        /// </summary>
        public string DataSource { get; set; }

        /// <summary>
        /// 原始数据（JSON格式，存储完整的PLC数据包）
        /// </summary>
        public string RawData { get; set; }

        // ══════════════════════════════════════════════════════
        // 构造函数
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 构造函数（EF Core需要）
        /// </summary>
        public SensorData()
        {
            Timestamp = DateTime.Now;
            Quality = "good";
            IsAlarm = false;
            DataSource = "plc";
        }

        /// <summary>
        /// 创建传感器数据
        /// </summary>
        public SensorData(
            Guid id,
            string sensorType,
            string sensorName,
            double value,
            string unit,
            Guid productionLineId,
            Guid? equipmentId = null)
            : base(id)
        {
            SensorType = sensorType;
            SensorName = sensorName;
            Value = value;
            Unit = unit;
            ProductionLineId = productionLineId;
            EquipmentId = equipmentId;
            
            Timestamp = DateTime.Now;
            Quality = "good";
            IsAlarm = false;
            DataSource = "plc";
            
            // 根据传感器类型和值判断是否需要告警
            CheckAlarm();
        }

        // ══════════════════════════════════════════════════════
        // 业务方法
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 检查是否需要告警
        /// </summary>
        private void CheckAlarm()
        {
            switch (SensorType)
            {
                case "temperature":
                    if (Value > 80)
                    {
                        SetAlarm("critical", $"温度过高：{Value}°C，超过临界值80°C");
                    }
                    else if (Value > 70)
                    {
                        SetAlarm("warning", $"温度偏高：{Value}°C，接近临界值");
                    }
                    break;
                    
                case "pressure":
                    if (Value > 10)
                    {
                        SetAlarm("critical", $"压力过高：{Value}MPa，超过临界值10MPa");
                    }
                    else if (Value > 8)
                    {
                        SetAlarm("warning", $"压力偏高：{Value}MPa，接近临界值");
                    }
                    break;
                    
                case "vibration":
                    if (Value > 10)
                    {
                        SetAlarm("critical", $"振动过大：{Value}mm/s，超过临界值10mm/s");
                    }
                    else if (Value > 7)
                    {
                        SetAlarm("warning", $"振动偏大：{Value}mm/s，接近临界值");
                    }
                    break;
                    
                default:
                    // 其他传感器类型暂不设置告警
                    break;
            }
        }

        /// <summary>
        /// 设置告警
        /// </summary>
        public void SetAlarm(string level, string message)
        {
            IsAlarm = true;
            AlarmLevel = level;
            AlarmMessage = message;
            Quality = level == "critical" ? "bad" : "warning";
        }

        /// <summary>
        /// 清除告警
        /// </summary>
        public void ClearAlarm()
        {
            IsAlarm = false;
            AlarmLevel = null;
            AlarmMessage = null;
            Quality = "good";
        }

        /// <summary>
        /// 更新统计数据
        /// </summary>
        public void UpdateStatistics(double min, double max, double avg, double stdDev)
        {
            MinValue = min;
            MaxValue = max;
            AvgValue = avg;
            StdDeviation = stdDev;
        }

        /// <summary>
        /// 设置原始数据
        /// </summary>
        public void SetRawData(string rawData)
        {
            RawData = rawData;
        }
    }
}

