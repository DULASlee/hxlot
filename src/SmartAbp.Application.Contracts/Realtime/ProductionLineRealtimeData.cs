using System;
using System.Collections.Generic;

namespace SmartAbp.Application.Contracts.Realtime
{
    /// <summary>
    /// 生产线实时数据DTO
    /// 用途：SignalR实时推送的数据格式
    /// 符合铁律3：前端API真实性
    /// </summary>
    public class ProductionLineRealtimeData
    {
        // ══════════════════════════════════════════════════════
        // 基本信息
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 生产线ID
        /// </summary>
        public string ProductionLineId { get; set; }

        /// <summary>
        /// 生产线名称
        /// </summary>
        public string ProductionLineName { get; set; }

        // ══════════════════════════════════════════════════════
        // KPI数据（与Dashboard完全对应）
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 总产量（件）
        /// </summary>
        public int TotalProduction { get; set; }

        /// <summary>
        /// 本日产量（件）
        /// </summary>
        public int DailyProduction { get; set; }

        /// <summary>
        /// 当前效率（%）
        /// </summary>
        public double CurrentEfficiency { get; set; }

        /// <summary>
        /// 设备利用率（%）
        /// </summary>
        public double EquipmentUtilization { get; set; }

        /// <summary>
        /// 合格率（%）
        /// </summary>
        public double QualifiedRate { get; set; }

        // ══════════════════════════════════════════════════════
        // 设备列表（Dashboard右侧设备状态卡片）
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 设备实时数据列表
        /// </summary>
        public List<EquipmentRealtimeData> Equipments { get; set; }

        // ══════════════════════════════════════════════════════
        // 趋势数据（Dashboard ECharts图表）
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 温度趋势数据（最近10分钟）
        /// </summary>
        public TrendData TemperatureTrendData { get; set; }

        /// <summary>
        /// 压力趋势数据（最近10分钟）
        /// </summary>
        public TrendData PressureTrendData { get; set; }

        /// <summary>
        /// 振动趋势数据（最近10分钟）
        /// </summary>
        public TrendData VibrationTrendData { get; set; }

        /// <summary>
        /// 功率趋势数据（最近10分钟）
        /// </summary>
        public TrendData PowerTrendData { get; set; }

        /// <summary>
        /// 能耗趋势数据（最近10分钟）
        /// </summary>
        public TrendData EnergyTrendData { get; set; }

        // ══════════════════════════════════════════════════════
        // 时间戳
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 数据时间戳
        /// </summary>
        public DateTime Timestamp { get; set; }

        public ProductionLineRealtimeData()
        {
            Equipments = new List<EquipmentRealtimeData>();
            Timestamp = DateTime.UtcNow;
        }
    }

    /// <summary>
    /// 设备实时数据
    /// </summary>
    public class EquipmentRealtimeData
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Status { get; set; }
        public string HealthStatus { get; set; }
        public double Temperature { get; set; }
        public double Pressure { get; set; }
        public double Vibration { get; set; }
        public double Power { get; set; }
        public double OEE { get; set; }
    }

    /// <summary>
    /// 趋势数据（ECharts格式）
    /// </summary>
    public class TrendData
    {
        /// <summary>
        /// 时间轴（X轴）
        /// </summary>
        public List<string> TimeLabels { get; set; }

        /// <summary>
        /// 数据值（Y轴）
        /// </summary>
        public List<double> Values { get; set; }

        public TrendData()
        {
            TimeLabels = new List<string>();
            Values = new List<double>();
        }
    }
}

