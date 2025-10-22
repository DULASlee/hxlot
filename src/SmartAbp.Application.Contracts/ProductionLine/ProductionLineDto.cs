using System;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.ProductionLine
{
    /// <summary>
    /// 生产线DTO
    /// 用途：数据传输对象，与前端TypeScript类型100%一致
    /// 符合铁律5：DTO一致性
    /// </summary>
    public class ProductionLineDto : FullAuditedEntityDto<Guid>
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
    }
}

