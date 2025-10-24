// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 告警通知服务
// 用途: 通过SignalR推送告警到前端，支持多种告警规则
// 创建日期: 2025-10-21
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EventBus.Local;
using SmartAbp.Domain.Entities.MES;
using MESEntities = SmartAbp.Domain.Entities.MES;

namespace SmartAbp.Application.MES.Alarm
{
    /// <summary>
    /// 告警通知服务
    /// 
    /// ✅ 评估传感器数据是否触发告警
    /// ✅ 管理多个告警规则
    /// ✅ 通过事件总线发布告警事件（由Web层订阅并推送）
    /// ✅ 支持告警历史记录
    /// ✅ 单例模式：整个应用共享一套告警规则
    /// 
    /// 📝 架构说明: 
    ///   - Application层不直接依赖Web层（遵循DDD）
    ///   - 通过ABP事件总线解耦（告警事件由Web层订阅）
    /// </summary>
    public class AlarmNotificationService : ApplicationService, ISingletonDependency
    {
        private readonly ILogger<AlarmNotificationService> _logger;
        private readonly ILocalEventBus _localEventBus;
        private readonly List<IAlarmRule> _alarmRules;

        public AlarmNotificationService(
            ILogger<AlarmNotificationService> logger,
            ILocalEventBus localEventBus)
        {
            _logger = logger;
            _localEventBus = localEventBus;
            _alarmRules = new List<IAlarmRule>();

            // 初始化默认告警规则
            InitializeDefaultRules();
        }

        /// <summary>
        /// 初始化默认告警规则
        /// </summary>
        private void InitializeDefaultRules()
        {
            // 添加温度告警规则
            _alarmRules.Add(ThresholdAlarmRule.CreateTemperatureRule());

            // 添加压力告警规则
            _alarmRules.Add(ThresholdAlarmRule.CreatePressureRule());

            // 添加振动告警规则
            _alarmRules.Add(ThresholdAlarmRule.CreateVibrationRule());

            _logger.LogInformation("[AlarmNotificationService] ✅ 已初始化{Count}条告警规则", _alarmRules.Count);
        }

        /// <summary>
        /// 评估传感器数据并触发告警
        /// </summary>
        /// <param name="sensorData">传感器数据</param>
        public async Task EvaluateAndNotifyAsync(MESEntities.SensorData sensorData)
        {
            try
            {
                // 评估所有告警规则
                var tasks = _alarmRules.Select(rule => rule.EvaluateAsync(sensorData));
                var results = await Task.WhenAll(tasks);

                // 筛选触发的告警
                var triggeredAlarms = results.Where(r => r.IsTriggered).ToList();

                if (triggeredAlarms.Any())
                {
                    _logger.LogWarning(
                        "[AlarmNotificationService] ⚠️ 触发{Count}条告警！传感器: {SensorName}, 值: {Value}",
                        triggeredAlarms.Count,
                        sensorData.SensorName,
                        sensorData.Value
                    );

                    // 推送告警到前端
                    foreach (var alarm in triggeredAlarms)
                    {
                        await PushAlarmToClientsAsync(sensorData.ProductionLineId, alarm);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AlarmNotificationService] ❌ 评估告警规则失败！");
            }
        }

        /// <summary>
        /// 发布告警事件（通过ABP事件总线）
        /// </summary>
        private async Task PushAlarmToClientsAsync(Guid productionLineId, AlarmResult alarm)
        {
            try
            {
                var alarmEvent = new AlarmTriggeredEvent
                {
                    Id = Guid.NewGuid(),
                    ProductionLineId = productionLineId,
                    Message = alarm.Message,
                    Level = alarm.Level.ToString(),
                    Priority = alarm.Priority.ToString(),
                    Timestamp = alarm.Timestamp,
                    TriggerValue = alarm.TriggerValue,
                    ThresholdValue = alarm.ThresholdValue,
                    SuggestedAction = alarm.SuggestedAction
                };

                // 发布告警事件（Web层会订阅此事件并推送到SignalR客户端）
                await _localEventBus.PublishAsync(alarmEvent);

                _logger.LogInformation(
                    "[AlarmNotificationService] ✅ 已发布{Level}级别告警事件: {Message}",
                    alarm.Level,
                    alarm.Message
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[AlarmNotificationService] ❌ 发布告警事件失败！");
            }
        }

        /// <summary>
        /// 添加自定义告警规则
        /// </summary>
        public void AddAlarmRule(IAlarmRule rule)
        {
            _alarmRules.Add(rule);
            _logger.LogInformation("[AlarmNotificationService] ✅ 已添加告警规则: {RuleName}", rule.RuleName);
        }

        /// <summary>
        /// 移除告警规则
        /// </summary>
        public void RemoveAlarmRule(string ruleName)
        {
            var removed = _alarmRules.RemoveAll(r => r.RuleName == ruleName);
            if (removed > 0)
            {
                _logger.LogInformation("[AlarmNotificationService] ✅ 已移除{Count}条告警规则: {RuleName}", removed, ruleName);
            }
        }

        /// <summary>
        /// 获取所有告警规则
        /// </summary>
        public List<IAlarmRule> GetAllRules()
        {
            return _alarmRules.ToList();
        }

        /// <summary>
        /// 启用/禁用告警规则
        /// </summary>
        public void SetRuleEnabled(string ruleName, bool isEnabled)
        {
            var rule = _alarmRules.FirstOrDefault(r => r.RuleName == ruleName);
            if (rule != null)
            {
                rule.IsEnabled = isEnabled;
                _logger.LogInformation(
                    "[AlarmNotificationService] ✅ 告警规则{RuleName}已{Status}",
                    ruleName,
                    isEnabled ? "启用" : "禁用"
                );
            }
        }
    }

    /// <summary>
    /// 告警触发事件（ABP事件总线）
    /// 
    /// ✅ Web层订阅此事件
    /// ✅ Web层通过SignalR推送到前端
    /// </summary>
    public class AlarmTriggeredEvent
    {
        /// <summary>
        /// 事件ID
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// 产线ID
        /// </summary>
        public Guid ProductionLineId { get; set; }

        /// <summary>
        /// 告警消息
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// 告警级别
        /// </summary>
        public string Level { get; set; } = string.Empty;

        /// <summary>
        /// 优先级
        /// </summary>
        public string Priority { get; set; } = string.Empty;

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
}

