using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.Domain.Entities.MES
{
    /// <summary>
    /// 🏭 生产线聚合根
    /// 用途: MES生产线监控核心领域对象
    /// </summary>
    public class ProductionLine : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        // ══════════════════════════════════════════════════════
        // 基本信息
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 生产线名称（如：智能生产线A）
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 生产线编号（如：PL-001）
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// 描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 位置（如：车间A-1楼）
        /// </summary>
        public string Location { get; set; }

        /// <summary>
        /// 生产线状态：running（运行中）、stopped（已停止）、maintenance（维护中）
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// 生产线类型（如：装配线、包装线、测试线）
        /// </summary>
        public string Type { get; set; }

        // ══════════════════════════════════════════════════════
        // 生产数据（实时统计）
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 总产量（件）
        /// </summary>
        public int TotalProduction { get; set; }

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

        /// <summary>
        /// 本日产量（件）
        /// </summary>
        public int DailyProduction { get; set; }

        /// <summary>
        /// 本日目标产量（件）
        /// </summary>
        public int DailyTarget { get; set; }

        /// <summary>
        /// 最后更新时间
        /// </summary>
        public DateTime LastUpdateTime { get; set; }

        // ══════════════════════════════════════════════════════
        // 配置信息
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 班次（如：早班、中班、晚班）
        /// </summary>
        public string Shift { get; set; }

        /// <summary>
        /// 班组长
        /// </summary>
        public string Supervisor { get; set; }

        /// <summary>
        /// 工作模式（如：单班、双班、三班倒）
        /// </summary>
        public string WorkMode { get; set; }

        /// <summary>
        /// 是否启用
        /// </summary>
        public bool IsEnabled { get; set; }

        /// <summary>
        /// 租户ID（多租户支持）
        /// </summary>
        public Guid? TenantId { get; set; }

        // ══════════════════════════════════════════════════════
        // 导航属性
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 导航属性：设备列表
        /// </summary>
        public virtual ICollection<Equipment> Equipments { get; set; }

        /// <summary>
        /// 导航属性：传感器数据列表
        /// </summary>
        public virtual ICollection<SensorData> SensorDataList { get; set; }

        // ══════════════════════════════════════════════════════
        // 构造函数
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 构造函数（EF Core需要）
        /// </summary>
        public ProductionLine()
        {
            Equipments = new List<Equipment>();
            SensorDataList = new List<SensorData>();
            LastUpdateTime = DateTime.Now;
            IsEnabled = true;
            Status = "stopped";
        }

        /// <summary>
        /// 创建生产线
        /// </summary>
        public ProductionLine(
            Guid id,
            string name,
            string code,
            string description,
            string location,
            string type,
            int dailyTarget)
            : base(id)
        {
            Name = name;
            Code = code;
            Description = description;
            Location = location;
            Type = type;
            DailyTarget = dailyTarget;
            
            Status = "stopped";
            IsEnabled = true;
            LastUpdateTime = DateTime.Now;
            TotalProduction = 0;
            DailyProduction = 0;
            CurrentEfficiency = 0;
            EquipmentUtilization = 0;
            QualifiedRate = 100.0;

            Equipments = new List<Equipment>();
            SensorDataList = new List<SensorData>();
        }

        // ══════════════════════════════════════════════════════
        // 业务方法
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 启动生产线
        /// </summary>
        public void Start()
        {
            Status = "running";
            LastUpdateTime = DateTime.Now;
        }

        /// <summary>
        /// 停止生产线
        /// </summary>
        public void Stop()
        {
            Status = "stopped";
            LastUpdateTime = DateTime.Now;
        }

        /// <summary>
        /// 进入维护模式
        /// </summary>
        public void StartMaintenance()
        {
            Status = "maintenance";
            LastUpdateTime = DateTime.Now;
        }

        /// <summary>
        /// 更新生产数据
        /// </summary>
        public void UpdateProductionData(
            int totalProduction,
            int dailyProduction,
            double currentEfficiency,
            double equipmentUtilization,
            double qualifiedRate)
        {
            TotalProduction = totalProduction;
            DailyProduction = dailyProduction;
            CurrentEfficiency = currentEfficiency;
            EquipmentUtilization = equipmentUtilization;
            QualifiedRate = qualifiedRate;
            LastUpdateTime = DateTime.Now;
        }

        /// <summary>
        /// 重置本日产量
        /// </summary>
        public void ResetDailyProduction()
        {
            DailyProduction = 0;
            LastUpdateTime = DateTime.Now;
        }
    }
}

