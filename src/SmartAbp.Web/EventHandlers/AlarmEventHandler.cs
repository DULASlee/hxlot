// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 告警事件处理器
// 用途: 订阅Application层的告警事件，通过SignalR推送到前端
// 创建日期: 2025-10-21
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EventBus;
using SmartAbp.Application.MES.Alarm;
using SmartAbp.Web.Hubs;

namespace SmartAbp.Web.EventHandlers
{
    /// <summary>
    /// 告警事件处理器
    /// 
    /// ✅ 订阅AlarmTriggeredEvent事件
    /// ✅ 通过SignalR推送告警到前端
    /// ✅ 支持产线级别的告警推送
    /// 
    /// 📝 架构说明:
    ///   - Web层订阅Application层的事件
    ///   - 遵循DDD分层架构（Application不依赖Web）
    ///   - 通过ABP事件总线解耦
    /// </summary>
    public class AlarmEventHandler : ILocalEventHandler<AlarmTriggeredEvent>, ITransientDependency
    {
        private readonly IHubContext<ProductionLineHub, IProductionLineClient> _hubContext;
        private readonly ILogger<AlarmEventHandler> _logger;

        public AlarmEventHandler(
            IHubContext<ProductionLineHub, IProductionLineClient> hubContext,
            ILogger<AlarmEventHandler> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        /// <summary>
        /// 处理告警触发事件
        /// </summary>
        public async Task HandleEventAsync(AlarmTriggeredEvent eventData)
        {
            try
            {
                _logger.LogWarning(
                    "[AlarmEventHandler] ⚠️ 接收到{Level}级别告警: {Message}",
                    eventData.Level,
                    eventData.Message
                );

                // 构建告警DTO
                var alertDto = new AlertDto
                {
                    Id = eventData.Id.ToString(),
                    ProductionLineId = eventData.ProductionLineId.ToString(),
                    Message = eventData.Message,
                    Level = eventData.Level,
                    Priority = eventData.Priority,
                    Timestamp = eventData.Timestamp,
                    TriggerValue = eventData.TriggerValue,
                    ThresholdValue = eventData.ThresholdValue,
                    SuggestedAction = eventData.SuggestedAction
                };

                // 推送到所有连接的客户端
                await _hubContext.Clients.All.ReceiveAlert(alertDto);

                _logger.LogInformation(
                    "[AlarmEventHandler] ✅ 已通过SignalR推送{Level}级别告警到前端",
                    eventData.Level
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "[AlarmEventHandler] ❌ 推送告警到SignalR失败！事件ID: {EventId}",
                    eventData.Id
                );
            }
        }
    }

    /// <summary>
    /// 告警DTO（SignalR推送格式）
    /// </summary>
    public class AlertDto
    {
        public string Id { get; set; } = string.Empty;
        public string ProductionLineId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public double TriggerValue { get; set; }
        public double? ThresholdValue { get; set; }
        public string? SuggestedAction { get; set; }
    }
}

