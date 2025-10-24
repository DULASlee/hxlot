// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 阈值告警规则
// 用途: 基于传感器数据的阈值判断触发告警
// 创建日期: 2025-10-21
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using System;
using System.Threading.Tasks;
using MesSensorData = SmartAbp.Domain.Entities.MES.SensorData;

namespace SmartAbp.Application.MES.Alarm
{
    /// <summary>
    /// 阈值告警规则
    ///
    /// ✅ 支持上限和下限阈值
    /// ✅ 支持多级告警（警告、错误、严重）
    /// ✅ 可配置建议操作
    /// </summary>
    public class ThresholdAlarmRule : IAlarmRule
    {
        public string RuleName { get; }
        public string Description { get; }
        public AlarmPriority Priority { get; }
        public bool IsEnabled { get; set; }

        /// <summary>
        /// 传感器类型（如: temperature, pressure, vibration）
        /// </summary>
        public string SensorType { get; }

        /// <summary>
        /// 警告上限
        /// </summary>
        public double? WarningUpperLimit { get; set; }

        /// <summary>
        /// 警告下限
        /// </summary>
        public double? WarningLowerLimit { get; set; }

        /// <summary>
        /// 错误上限
        /// </summary>
        public double? ErrorUpperLimit { get; set; }

        /// <summary>
        /// 错误下限
        /// </summary>
        public double? ErrorLowerLimit { get; set; }

        /// <summary>
        /// 严重上限
        /// </summary>
        public double? CriticalUpperLimit { get; set; }

        /// <summary>
        /// 严重下限
        /// </summary>
        public double? CriticalLowerLimit { get; set; }

        public ThresholdAlarmRule(
            string ruleName,
            string sensorType,
            AlarmPriority priority = AlarmPriority.Medium)
        {
            RuleName = ruleName;
            SensorType = sensorType;
            Priority = priority;
            Description = $"{sensorType}阈值告警规则";
            IsEnabled = true;
        }

        public Task<AlarmResult> EvaluateAsync(MesSensorData sensorData)
        {
            if (!IsEnabled)
            {
                return Task.FromResult(new AlarmResult
                {
                    IsTriggered = false,
                    Timestamp = DateTime.UtcNow
                });
            }

            // 只评估匹配的传感器类型
            if (sensorData.SensorType != SensorType)
            {
                return Task.FromResult(new AlarmResult
                {
                    IsTriggered = false,
                    Timestamp = DateTime.UtcNow
                });
            }

            var value = sensorData.Value;
            var result = new AlarmResult
            {
                TriggerValue = value,
                Timestamp = DateTime.UtcNow,
                Priority = Priority
            };

            // 严重级别检查（优先级最高）
            if (CriticalUpperLimit.HasValue && value > CriticalUpperLimit.Value)
            {
                result.IsTriggered = true;
                result.Level = AlarmLevel.Critical;
                result.Message = $"{sensorData.SensorName ?? SensorType}严重超限！当前值：{value:F2}{sensorData.Unit}，严重上限：{CriticalUpperLimit:F2}{sensorData.Unit}";
                result.ThresholdValue = CriticalUpperLimit.Value;
                result.SuggestedAction = "立即停机检查！";
                return Task.FromResult(result);
            }

            if (CriticalLowerLimit.HasValue && value < CriticalLowerLimit.Value)
            {
                result.IsTriggered = true;
                result.Level = AlarmLevel.Critical;
                result.Message = $"{sensorData.SensorName ?? SensorType}严重低于下限！当前值：{value:F2}{sensorData.Unit}，严重下限：{CriticalLowerLimit:F2}{sensorData.Unit}";
                result.ThresholdValue = CriticalLowerLimit.Value;
                result.SuggestedAction = "立即停机检查！";
                return Task.FromResult(result);
            }

            // 错误级别检查
            if (ErrorUpperLimit.HasValue && value > ErrorUpperLimit.Value)
            {
                result.IsTriggered = true;
                result.Level = AlarmLevel.Error;
                result.Message = $"{sensorData.SensorName ?? SensorType}超限！当前值：{value:F2}{sensorData.Unit}，错误上限：{ErrorUpperLimit:F2}{sensorData.Unit}";
                result.ThresholdValue = ErrorUpperLimit.Value;
                result.SuggestedAction = "降低负载或检查设备状态";
                return Task.FromResult(result);
            }

            if (ErrorLowerLimit.HasValue && value < ErrorLowerLimit.Value)
            {
                result.IsTriggered = true;
                result.Level = AlarmLevel.Error;
                result.Message = $"{sensorData.SensorName ?? SensorType}低于下限！当前值：{value:F2}{sensorData.Unit}，错误下限：{ErrorLowerLimit:F2}{sensorData.Unit}";
                result.ThresholdValue = ErrorLowerLimit.Value;
                result.SuggestedAction = "检查传感器连接或设备状态";
                return Task.FromResult(result);
            }

            // 警告级别检查
            if (WarningUpperLimit.HasValue && value > WarningUpperLimit.Value)
            {
                result.IsTriggered = true;
                result.Level = AlarmLevel.Warning;
                result.Message = $"{sensorData.SensorName ?? SensorType}接近上限。当前值：{value:F2}{sensorData.Unit}，警告上限：{WarningUpperLimit:F2}{sensorData.Unit}";
                result.ThresholdValue = WarningUpperLimit.Value;
                result.SuggestedAction = "注意监控，必要时降低负载";
                return Task.FromResult(result);
            }

            if (WarningLowerLimit.HasValue && value < WarningLowerLimit.Value)
            {
                result.IsTriggered = true;
                result.Level = AlarmLevel.Warning;
                result.Message = $"{sensorData.SensorName ?? SensorType}接近下限。当前值：{value:F2}{sensorData.Unit}，警告下限：{WarningLowerLimit:F2}{sensorData.Unit}";
                result.ThresholdValue = WarningLowerLimit.Value;
                result.SuggestedAction = "注意监控设备状态";
                return Task.FromResult(result);
            }

            // 无告警
            result.IsTriggered = false;
            result.Level = AlarmLevel.Info;
            return Task.FromResult(result);
        }

        /// <summary>
        /// 创建温度告警规则
        /// </summary>
        public static ThresholdAlarmRule CreateTemperatureRule()
        {
            return new ThresholdAlarmRule("温度监控", "temperature", AlarmPriority.High)
            {
                WarningUpperLimit = 75,   // 75°C警告
                ErrorUpperLimit = 85,      // 85°C错误
                CriticalUpperLimit = 95,   // 95°C严重
                WarningLowerLimit = 10,    // 10°C警告（异常低温）
                ErrorLowerLimit = 5,       // 5°C错误
                CriticalLowerLimit = 0     // 0°C严重
            };
        }

        /// <summary>
        /// 创建压力告警规则
        /// </summary>
        public static ThresholdAlarmRule CreatePressureRule()
        {
            return new ThresholdAlarmRule("压力监控", "pressure", AlarmPriority.High)
            {
                WarningUpperLimit = 7.5,   // 7.5 MPa警告
                ErrorUpperLimit = 8.5,     // 8.5 MPa错误
                CriticalUpperLimit = 10,   // 10 MPa严重
                WarningLowerLimit = 3,     // 3 MPa警告
                ErrorLowerLimit = 2,       // 2 MPa错误
                CriticalLowerLimit = 1     // 1 MPa严重
            };
        }

        /// <summary>
        /// 创建振动告警规则
        /// </summary>
        public static ThresholdAlarmRule CreateVibrationRule()
        {
            return new ThresholdAlarmRule("振动监控", "vibration", AlarmPriority.Medium)
            {
                WarningUpperLimit = 6,     // 6 mm/s警告
                ErrorUpperLimit = 8,       // 8 mm/s错误
                CriticalUpperLimit = 10    // 10 mm/s严重
            };
        }
    }
}

