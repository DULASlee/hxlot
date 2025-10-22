using System;
using System.ComponentModel.DataAnnotations;

namespace SmartAbp.Application.Contracts.ProductionLine
{
    /// <summary>
    /// 更新生产线DTO
    /// 用途：更新生产线时的输入参数
    /// 符合铁律5：DTO一致性
    /// </summary>
    public class UpdateProductionLineDto
    {
        // ══════════════════════════════════════════════════════
        // 基本信息
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 生产线名称（如：智能生产线A）
        /// </summary>
        [Required(ErrorMessage = "生产线名称不能为空")]
        [MaxLength(200, ErrorMessage = "生产线名称最多200个字符")]
        public string Name { get; set; }

        /// <summary>
        /// 生产线编号（如：PL-001）
        /// </summary>
        [Required(ErrorMessage = "生产线编号不能为空")]
        [MaxLength(50, ErrorMessage = "生产线编号最多50个字符")]
        [RegularExpression(@"^[A-Z0-9-]+$", ErrorMessage = "生产线编号只能包含大写字母、数字和连字符")]
        public string Code { get; set; }

        /// <summary>
        /// 描述
        /// </summary>
        [MaxLength(1000, ErrorMessage = "描述最多1000个字符")]
        public string Description { get; set; }

        /// <summary>
        /// 位置（如：车间A-1楼）
        /// </summary>
        [Required(ErrorMessage = "位置不能为空")]
        [MaxLength(500, ErrorMessage = "位置最多500个字符")]
        public string Location { get; set; }

        /// <summary>
        /// 生产线状态：running（运行中）、stopped（已停止）、maintenance（维护中）
        /// </summary>
        [MaxLength(50, ErrorMessage = "状态最多50个字符")]
        public string Status { get; set; }

        /// <summary>
        /// 生产线类型（如：装配线、包装线、测试线）
        /// </summary>
        [MaxLength(100, ErrorMessage = "生产线类型最多100个字符")]
        public string Type { get; set; }

        // ══════════════════════════════════════════════════════
        // 生产数据（可由后台服务更新）
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 总产量（件）
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "总产量不能为负数")]
        public int TotalProduction { get; set; }

        /// <summary>
        /// 本日产量（件）
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "本日产量不能为负数")]
        public int DailyProduction { get; set; }

        /// <summary>
        /// 本日目标产量（件）
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "本日目标产量不能为负数")]
        public int DailyTarget { get; set; }

        /// <summary>
        /// 当前效率（%）
        /// </summary>
        [Range(0, 100, ErrorMessage = "效率必须在0-100之间")]
        public double CurrentEfficiency { get; set; }

        /// <summary>
        /// 设备利用率（%）
        /// </summary>
        [Range(0, 100, ErrorMessage = "设备利用率必须在0-100之间")]
        public double EquipmentUtilization { get; set; }

        /// <summary>
        /// 合格率（%）
        /// </summary>
        [Range(0, 100, ErrorMessage = "合格率必须在0-100之间")]
        public double QualifiedRate { get; set; }

        // ══════════════════════════════════════════════════════
        // 配置信息
        // ══════════════════════════════════════════════════════

        /// <summary>
        /// 班次（如：早班、中班、晚班）
        /// </summary>
        [MaxLength(50, ErrorMessage = "班次最多50个字符")]
        public string Shift { get; set; }

        /// <summary>
        /// 班组长
        /// </summary>
        [MaxLength(100, ErrorMessage = "班组长姓名最多100个字符")]
        public string Supervisor { get; set; }

        /// <summary>
        /// 工作模式（如：单班、双班、三班倒）
        /// </summary>
        [MaxLength(50, ErrorMessage = "工作模式最多50个字符")]
        public string WorkMode { get; set; }

        /// <summary>
        /// 是否启用
        /// </summary>
        public bool IsEnabled { get; set; }
    }
}

