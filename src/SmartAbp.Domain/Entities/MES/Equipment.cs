using System;
using Volo.Abp.Domain.Entities.Auditing;
using Volo.Abp.MultiTenancy;

namespace SmartAbp.Domain.Entities.MES
{
    /// <summary>
    /// ⚙️ 设备实体
    /// 用途: MES设备监控领域对象
    /// </summary>
    public class Equipment : FullAuditedAggregateRoot<Guid>, IMultiTenant
    {
        // ══════════════════════════════════════════════════════
        // 基本信息
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 设备名称（如：自动焊接机1号）
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 设备编号（如：EQ-001）
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// 设备描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 设备类型（如：焊接机、冲压机、检测设备）
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// 品牌/制造商
        /// </summary>
        public string Manufacturer { get; set; }

        /// <summary>
        /// 型号
        /// </summary>
        public string Model { get; set; }

        /// <summary>
        /// 序列号
        /// </summary>
        public string SerialNumber { get; set; }

        /// <summary>
        /// 位置（如：车间A-工位01）
        /// </summary>
        public string Location { get; set; }

        // ══════════════════════════════════════════════════════
        // 状态信息
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 设备状态：running（运行中）、stopped（已停止）、fault（故障）、maintenance（维护中）
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// 健康状态：healthy（健康）、warning（警告）、critical（严重）
        /// </summary>
        public string HealthStatus { get; set; }

        /// <summary>
        /// 温度（°C）
        /// </summary>
        public double Temperature { get; set; }

        /// <summary>
        /// 压力（MPa）
        /// </summary>
        public double Pressure { get; set; }

        /// <summary>
        /// 振动（mm/s）
        /// </summary>
        public double Vibration { get; set; }

        /// <summary>
        /// 转速（RPM）
        /// </summary>
        public double Speed { get; set; }

        /// <summary>
        /// 功率（kW）
        /// </summary>
        public double Power { get; set; }

        /// <summary>
        /// 电流（A）
        /// </summary>
        public double Current { get; set; }

        /// <summary>
        /// 电压（V）
        /// </summary>
        public double Voltage { get; set; }

        /// <summary>
        /// 最后更新时间
        /// </summary>
        public DateTime LastUpdateTime { get; set; }

        // ══════════════════════════════════════════════════════
        // 统计信息
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 累计运行时间（小时）
        /// </summary>
        public double TotalRunningHours { get; set; }

        /// <summary>
        /// 本日运行时间（小时）
        /// </summary>
        public double DailyRunningHours { get; set; }

        /// <summary>
        /// 累计生产数量（件）
        /// </summary>
        public int TotalProduction { get; set; }

        /// <summary>
        /// 本日生产数量（件）
        /// </summary>
        public int DailyProduction { get; set; }

        /// <summary>
        /// 故障次数
        /// </summary>
        public int FaultCount { get; set; }

        /// <summary>
        /// 设备利用率（%）
        /// </summary>
        public double UtilizationRate { get; set; }

        /// <summary>
        /// OEE（Overall Equipment Effectiveness，综合设备效率，%）
        /// </summary>
        public double OEE { get; set; }

        // ══════════════════════════════════════════════════════
        // 维护信息
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 上次维护日期
        /// </summary>
        public DateTime? LastMaintenanceDate { get; set; }

        /// <summary>
        /// 下次维护日期
        /// </summary>
        public DateTime? NextMaintenanceDate { get; set; }

        /// <summary>
        /// 维护周期（天）
        /// </summary>
        public int MaintenanceCycle { get; set; }

        /// <summary>
        /// 维护负责人
        /// </summary>
        public string MaintenanceResponsible { get; set; }

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
        /// 租户ID（多租户支持）
        /// </summary>
        public Guid? TenantId { get; set; }

        // ══════════════════════════════════════════════════════
        // 配置信息
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 是否启用
        /// </summary>
        public bool IsEnabled { get; set; }

        /// <summary>
        /// 是否在线（PLC连接状态）
        /// </summary>
        public bool IsOnline { get; set; }

        /// <summary>
        /// PLC地址
        /// </summary>
        public string PLCAddress { get; set; }

        /// <summary>
        /// PLC端口
        /// </summary>
        public int? PLCPort { get; set; }

        // ══════════════════════════════════════════════════════
        // 构造函数
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 构造函数（EF Core需要）
        /// </summary>
        public Equipment()
        {
            Status = "stopped";
            HealthStatus = "healthy";
            IsEnabled = true;
            IsOnline = false;
            LastUpdateTime = DateTime.Now;
            MaintenanceCycle = 30; // 默认30天维护周期
        }

        /// <summary>
        /// 创建设备
        /// </summary>
        public Equipment(
            Guid id,
            string name,
            string code,
            string type,
            Guid productionLineId)
            : base(id)
        {
            Name = name;
            Code = code;
            Type = type;
            ProductionLineId = productionLineId;
            
            Status = "stopped";
            HealthStatus = "healthy";
            IsEnabled = true;
            IsOnline = false;
            LastUpdateTime = DateTime.Now;
            MaintenanceCycle = 30;
            
            TotalRunningHours = 0;
            DailyRunningHours = 0;
            TotalProduction = 0;
            DailyProduction = 0;
            FaultCount = 0;
            UtilizationRate = 0;
            OEE = 0;
        }

        // ══════════════════════════════════════════════════════
        // 业务方法
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 启动设备
        /// </summary>
        public void Start()
        {
            if (Status == "fault")
            {
                throw new InvalidOperationException($"设备 {Name} 处于故障状态，无法启动");
            }
            
            Status = "running";
            LastUpdateTime = DateTime.Now;
        }

        /// <summary>
        /// 停止设备
        /// </summary>
        public void Stop()
        {
            Status = "stopped";
            LastUpdateTime = DateTime.Now;
        }

        /// <summary>
        /// 标记故障
        /// </summary>
        public void MarkAsFault(string faultReason)
        {
            Status = "fault";
            HealthStatus = "critical";
            FaultCount++;
            LastUpdateTime = DateTime.Now;
        }

        /// <summary>
        /// 进入维护模式
        /// </summary>
        public void StartMaintenance()
        {
            Status = "maintenance";
            LastMaintenanceDate = DateTime.Now;
            LastUpdateTime = DateTime.Now;
        }

        /// <summary>
        /// 完成维护
        /// </summary>
        public void CompleteMaintenance()
        {
            Status = "stopped";
            HealthStatus = "healthy";
            LastMaintenanceDate = DateTime.Now;
            NextMaintenanceDate = DateTime.Now.AddDays(MaintenanceCycle);
            LastUpdateTime = DateTime.Now;
        }

        /// <summary>
        /// 更新实时数据
        /// </summary>
        public void UpdateRealtimeData(
            double temperature,
            double pressure,
            double vibration,
            double speed,
            double power,
            double current,
            double voltage)
        {
            Temperature = temperature;
            Pressure = pressure;
            Vibration = vibration;
            Speed = speed;
            Power = power;
            Current = current;
            Voltage = voltage;
            LastUpdateTime = DateTime.Now;
            
            // 根据传感器数据更新健康状态
            UpdateHealthStatus();
        }

        /// <summary>
        /// 更新健康状态（基于传感器数据）
        /// </summary>
        private void UpdateHealthStatus()
        {
            // 温度阈值检查
            if (Temperature > 80)
            {
                HealthStatus = "critical";
            }
            else if (Temperature > 70)
            {
                HealthStatus = "warning";
            }
            // 振动阈值检查
            else if (Vibration > 10)
            {
                HealthStatus = "critical";
            }
            else if (Vibration > 7)
            {
                HealthStatus = "warning";
            }
            else
            {
                HealthStatus = "healthy";
            }
        }

        /// <summary>
        /// 更新统计数据
        /// </summary>
        public void UpdateStatistics(
            double dailyRunningHours,
            int dailyProduction,
            double utilizationRate,
            double oee)
        {
            TotalRunningHours += dailyRunningHours - DailyRunningHours;
            DailyRunningHours = dailyRunningHours;
            
            TotalProduction += dailyProduction - DailyProduction;
            DailyProduction = dailyProduction;
            
            UtilizationRate = utilizationRate;
            OEE = oee;
            
            LastUpdateTime = DateTime.Now;
        }

        /// <summary>
        /// 重置本日统计
        /// </summary>
        public void ResetDailyStatistics()
        {
            DailyRunningHours = 0;
            DailyProduction = 0;
            LastUpdateTime = DateTime.Now;
        }
    }
}

