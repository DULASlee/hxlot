// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 告警规则接口
// 用途: 定义统一的告警规则接口，支持多种规则类型
// 创建日期: 2025-10-21
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using System;
using System.Threading.Tasks;
using MesSensorData = SmartAbp.Domain.Entities.MES.SensorData;

namespace SmartAbp.Application.MES.Alarm
{
    /// <summary>
    /// 告警规则接口
    ///
    /// ✅ 策略模式：支持多种告警规则
    /// ✅ 扩展性：新增规则类型只需实现此接口
    /// </summary>
    public interface IAlarmRule
    {
        /// <summary>
        /// 规则名称
        /// </summary>
        string RuleName { get; }

        /// <summary>
        /// 规则描述
        /// </summary>
        string Description { get; }

        /// <summary>
        /// 规则优先级
        /// </summary>
        AlarmPriority Priority { get; }

        /// <summary>
        /// 是否启用
        /// </summary>
        bool IsEnabled { get; set; }

        /// <summary>
        /// 评估传感器数据是否触发告警
        /// </summary>
        /// <param name="sensorData">传感器数据</param>
        /// <returns>告警结果</returns>
        Task<AlarmResult> EvaluateAsync(MesSensorData sensorData);
    }

    /// <summary>
    /// 告警优先级
    /// </summary>
    public enum AlarmPriority
    {
        /// <summary>
        /// 低优先级（提示）
        /// </summary>
        Low = 1,

        /// <summary>
        /// 中优先级（警告）
        /// </summary>
        Medium = 2,

        /// <summary>
        /// 高优先级（严重）
        /// </summary>
        High = 3,

        /// <summary>
        /// 紧急（危急）
        /// </summary>
        Critical = 4
    }

    /// <summary>
    /// 告警结果
    /// </summary>
    public class AlarmResult
    {
        /// <summary>
        /// 是否触发告警
        /// </summary>
        public bool IsTriggered { get; set; }

        /// <summary>
        /// 告警消息
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// 告警级别
        /// </summary>
        public AlarmLevel Level { get; set; }

        /// <summary>
        /// 告警优先级
        /// </summary>
        public AlarmPriority Priority { get; set; }

        /// <summary>
        /// 触发时间
        /// </summary>
        public DateTime Timestamp { get; set; }

        /// <summary>
        /// 触发值
        /// </summary>
        public double TriggerValue { get; set; }

        /// <summary>
        /// 阈值
        /// </summary>
        public double? ThresholdValue { get; set; }

        /// <summary>
        /// 建议操作
        /// </summary>
        public string? SuggestedAction { get; set; }
    }

    /// <summary>
    /// 告警级别
    /// </summary>
    public enum AlarmLevel
    {
        /// <summary>
        /// 信息
        /// </summary>
        Info,

        /// <summary>
        /// 警告
        /// </summary>
        Warning,

        /// <summary>
        /// 错误
        /// </summary>
        Error,

        /// <summary>
        /// 严重
        /// </summary>
        Critical
    }
}

