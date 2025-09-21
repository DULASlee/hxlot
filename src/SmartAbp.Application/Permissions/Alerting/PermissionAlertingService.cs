using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Emailing;
using Volo.Abp.EventBus.Local;

namespace SmartAbp.Permissions.Alerting
{
    /// <summary>
    /// 告警级别
    /// </summary>
    public enum AlertLevel
    {
        Info,
        Warning,
        Error,
        Critical
    }

    /// <summary>
    /// 告警类型
    /// </summary>
    public enum AlertType
    {
        Performance,
        Memory,
        Cache,
        DistributedLock,
        Configuration,
        Security,
        System,
        Documentation,
        Testing,
        Analytics,
        Health
    }

    /// <summary>
    /// 告警状态
    /// </summary>
    public enum AlertStatus
    {
        Active,
        Acknowledged,
        Resolved,
        Suppressed
    }

    /// <summary>
    /// 告警事件
    /// </summary>
    public class PermissionAlertEvent
    {
        /// <summary>
        /// 告警ID
        /// </summary>
        public string AlertId { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// 告警级别
        /// </summary>
        public AlertLevel Level { get; set; }

        /// <summary>
        /// 告警类型
        /// </summary>
        public AlertType Type { get; set; }

        /// <summary>
        /// 告警标题
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// 告警描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 告警来源
        /// </summary>
        public string Source { get; set; }

        /// <summary>
        /// 相关数据
        /// </summary>
        public Dictionary<string, object> Data { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// 状态
        /// </summary>
        public AlertStatus Status { get; set; } = AlertStatus.Active;

        /// <summary>
        /// 确认时间
        /// </summary>
        public DateTime? AcknowledgedAt { get; set; }

        /// <summary>
        /// 确认人
        /// </summary>
        public string AcknowledgedBy { get; set; }

        /// <summary>
        /// 解决时间
        /// </summary>
        public DateTime? ResolvedAt { get; set; }

        /// <summary>
        /// 解决人
        /// </summary>
        public string ResolvedBy { get; set; }

        /// <summary>
        /// 重复次数
        /// </summary>
        public int RepeatCount { get; set; } = 1;

        /// <summary>
        /// 最后重复时间
        /// </summary>
        public DateTime? LastRepeatAt { get; set; }

        /// <summary>
        /// 标签
        /// </summary>
        public List<string> Tags { get; set; } = new List<string>();

        /// <summary>
        /// 是否已发送通知
        /// </summary>
        public bool NotificationSent { get; set; }

        /// <summary>
        /// 通知时间
        /// </summary>
        public DateTime? NotificationSentAt { get; set; }

        /// <summary>
        /// 获取告警键（用于去重）
        /// </summary>
        public string GetAlertKey()
        {
            return $"{Type}:{Level}:{Source}:{Title}";
        }
    }

    /// <summary>
    /// 告警通知配置
    /// </summary>
    public class AlertNotificationOptions
    {
        /// <summary>
        /// 是否启用邮件通知
        /// </summary>
        public bool EnableEmailNotification { get; set; } = true;

        /// <summary>
        /// 是否启用Webhook通知
        /// </summary>
        public bool EnableWebhookNotification { get; set; } = false;

        /// <summary>
        /// 是否启用短信通知
        /// </summary>
        public bool EnableSmsNotification { get; set; } = false;

        /// <summary>
        /// 告警抑制时间（分钟）
        /// </summary>
        public int AlertSuppressionMinutes { get; set; } = 5;

        /// <summary>
        /// 最大重复次数
        /// </summary>
        public int MaxRepeatCount { get; set; } = 10;

        /// <summary>
        /// 通知级别阈值
        /// </summary>
        public AlertLevel NotificationLevelThreshold { get; set; } = AlertLevel.Warning;

        /// <summary>
        /// 邮件收件人
        /// </summary>
        public List<string> EmailRecipients { get; set; } = new List<string>();

        /// <summary>
        /// Webhook URL
        /// </summary>
        public string WebhookUrl { get; set; }

        /// <summary>
        /// 通知模板
        /// </summary>
        public Dictionary<string, string> NotificationTemplates { get; set; } = new Dictionary<string, string>();
    }

    /// <summary>
    /// 告警统计信息
    /// </summary>
    public class AlertStatistics
    {
        /// <summary>
        /// 总告警数
        /// </summary>
        public int TotalAlerts { get; set; }

        /// <summary>
        /// 活跃告警数
        /// </summary>
        public int ActiveAlerts { get; set; }

        /// <summary>
        /// 已确认告警数
        /// </summary>
        public int AcknowledgedAlerts { get; set; }

        /// <summary>
        /// 已解决告警数
        /// </summary>
        public int ResolvedAlerts { get; set; }

        /// <summary>
        /// 按级别统计
        /// </summary>
        public Dictionary<AlertLevel, int> AlertsByLevel { get; set; } = new Dictionary<AlertLevel, int>();

        /// <summary>
        /// 按类型统计
        /// </summary>
        public Dictionary<AlertType, int> AlertsByType { get; set; } = new Dictionary<AlertType, int>();

        /// <summary>
        /// 最后告警时间
        /// </summary>
        public DateTime? LastAlertAt { get; set; }

        /// <summary>
        /// 统计时间
        /// </summary>
        public DateTime StatisticsTime { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 权限告警服务接口
    /// </summary>
    public interface IPermissionAlertingService
    {
        /// <summary>
        /// 创建告警
        /// </summary>
        /// <param name="level">告警级别</param>
        /// <param name="type">告警类型</param>
        /// <param name="title">告警标题</param>
        /// <param name="description">告警描述</param>
        /// <param name="source">告警来源</param>
        /// <param name="data">相关数据</param>
        /// <returns>告警事件</returns>
        Task<PermissionAlertEvent> CreateAlertAsync(AlertLevel level, AlertType type, string title, 
            string description, string source, Dictionary<string, object> data = null);

        /// <summary>
        /// 确认告警
        /// </summary>
        /// <param name="alertId">告警ID</param>
        /// <param name="acknowledgedBy">确认人</param>
        /// <returns>是否成功</returns>
        Task<bool> AcknowledgeAlertAsync(string alertId, string acknowledgedBy);

        /// <summary>
        /// 解决告警
        /// </summary>
        /// <param name="alertId">告警ID</param>
        /// <param name="resolvedBy">解决人</param>
        /// <returns>是否成功</returns>
        Task<bool> ResolveAlertAsync(string alertId, string resolvedBy);

        /// <summary>
        /// 获取活跃告警
        /// </summary>
        /// <returns>活跃告警列表</returns>
        Task<List<PermissionAlertEvent>> GetActiveAlertsAsync();

        /// <summary>
        /// 获取告警历史
        /// </summary>
        /// <param name="timeWindow">时间窗口</param>
        /// <returns>告警历史</returns>
        Task<List<PermissionAlertEvent>> GetAlertHistoryAsync(TimeSpan timeWindow);

        /// <summary>
        /// 获取告警统计
        /// </summary>
        /// <returns>告警统计</returns>
        Task<AlertStatistics> GetAlertStatisticsAsync();

        /// <summary>
        /// 抑制告警
        /// </summary>
        /// <param name="alertId">告警ID</param>
        /// <param name="suppressionMinutes">抑制时间（分钟）</param>
        /// <returns>是否成功</returns>
        Task<bool> SuppressAlertAsync(string alertId, int suppressionMinutes);

        /// <summary>
        /// 批量处理告警
        /// </summary>
        /// <param name="alertIds">告警ID列表</param>
        /// <param name="action">处理动作</param>
        /// <param name="performedBy">执行人</param>
        /// <returns>处理结果</returns>
        Task<Dictionary<string, bool>> BatchProcessAlertsAsync(List<string> alertIds, string action, string performedBy);

        /// <summary>
        /// 清除已解决告警
        /// </summary>
        /// <param name="olderThan">清除时间阈值</param>
        /// <returns>清除数量</returns>
        Task<int> ClearResolvedAlertsAsync(DateTime olderThan);

        /// <summary>
        /// 获取告警趋势
        /// </summary>
        /// <param name="timeRange">时间范围</param>
        /// <param name="groupBy">分组方式</param>
        /// <returns>告警趋势数据</returns>
        Task<Dictionary<string, int>> GetAlertTrendAsync(TimeSpan timeRange, string groupBy = "hour");
    }

    /// <summary>
    /// 权限告警服务实现
    /// </summary>
    public class PermissionAlertingService : IPermissionAlertingService, ISingletonDependency
    {
        private readonly ConcurrentDictionary<string, PermissionAlertEvent> _activeAlerts = new ConcurrentDictionary<string, PermissionAlertEvent>();
        private readonly ConcurrentDictionary<string, PermissionAlertEvent> _alertHistory = new ConcurrentDictionary<string, PermissionAlertEvent>();
        private readonly ConcurrentDictionary<string, DateTime> _suppressedAlerts = new ConcurrentDictionary<string, DateTime>();
        private readonly AlertNotificationOptions _options;
        private readonly ILogger<PermissionAlertingService> _logger;
        private readonly ILocalEventBus _eventBus;
        private readonly IEmailSender _emailSender;

        public PermissionAlertingService(
            IOptions<AlertNotificationOptions> options,
            ILogger<PermissionAlertingService> logger,
            ILocalEventBus eventBus,
            IEmailSender emailSender = null)
        {
            _options = options?.Value ?? new AlertNotificationOptions();
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
            _emailSender = emailSender;
        }

        public async Task<PermissionAlertEvent> CreateAlertAsync(AlertLevel level, AlertType type, string title, 
            string description, string source, Dictionary<string, object> data = null)
        {
            try
            {
                var alertKey = $"{type}:{level}:{source}:{title}";
                
                // 检查是否被抑制
                if (_suppressedAlerts.TryGetValue(alertKey, out var suppressionEndTime) && suppressionEndTime > DateTime.UtcNow)
                {
                    _logger.LogDebug("Alert suppressed: {AlertKey}", alertKey);
                    return null;
                }

                // 检查是否已存在相同告警
                if (_activeAlerts.TryGetValue(alertKey, out var existingAlert))
                {
                    // 更新重复计数
                    existingAlert.RepeatCount++;
                    existingAlert.LastRepeatAt = DateTime.UtcNow;
                    
                    // 检查是否超过最大重复次数
                    if (existingAlert.RepeatCount >= _options.MaxRepeatCount)
                    {
                        _logger.LogWarning("Alert reached maximum repeat count: {AlertKey}", alertKey);
                        return existingAlert;
                    }
                    
                    return existingAlert;
                }

                // 创建新告警
                var alert = new PermissionAlertEvent
                {
                    Level = level,
                    Type = type,
                    Title = title,
                    Description = description,
                    Source = source,
                    Data = data ?? new Dictionary<string, object>(),
                    Status = AlertStatus.Active
                };

                // 添加到活跃告警
                _activeAlerts.TryAdd(alertKey, alert);
                
                // 添加到历史记录
                _alertHistory.TryAdd(alert.AlertId, alert);
                
                // 发送通知
                if (ShouldSendNotification(alert))
                {
                    await SendNotificationAsync(alert);
                }
                
                // 发布事件
                await _eventBus.PublishAsync(new PermissionAlertCreatedEvent
                {
                    Alert = alert,
                    Statistics = await GetAlertStatisticsAsync()
                });
                
                _logger.LogInformation("Alert created: {AlertId}, Level: {Level}, Type: {Type}, Title: {Title}", 
                    alert.AlertId, alert.Level, alert.Type, alert.Title);
                
                return alert;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating alert: {Title}", title);
                throw;
            }
        }

        public async Task<bool> AcknowledgeAlertAsync(string alertId, string acknowledgedBy)
        {
            try
            {
                var alert = _alertHistory.Values.FirstOrDefault(a => a.AlertId == alertId);
                if (alert == null)
                {
                    _logger.LogWarning("Alert not found: {AlertId}", alertId);
                    return false;
                }

                alert.Status = AlertStatus.Acknowledged;
                alert.AcknowledgedAt = DateTime.UtcNow;
                alert.AcknowledgedBy = acknowledgedBy;
                
                // 从活跃告警中移除
                var alertKey = alert.GetAlertKey();
                _activeAlerts.TryRemove(alertKey, out _);
                
                _logger.LogInformation("Alert acknowledged: {AlertId} by {AcknowledgedBy}", alertId, acknowledgedBy);
                
                await _eventBus.PublishAsync(new PermissionAlertAcknowledgedEvent
                {
                    Alert = alert,
                    AcknowledgedBy = acknowledgedBy
                });
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error acknowledging alert: {AlertId}", alertId);
                return false;
            }
        }

        public async Task<bool> ResolveAlertAsync(string alertId, string resolvedBy)
        {
            try
            {
                var alert = _alertHistory.Values.FirstOrDefault(a => a.AlertId == alertId);
                if (alert == null)
                {
                    _logger.LogWarning("Alert not found: {AlertId}", alertId);
                    return false;
                }

                alert.Status = AlertStatus.Resolved;
                alert.ResolvedAt = DateTime.UtcNow;
                alert.ResolvedBy = resolvedBy;
                
                // 从活跃告警中移除
                var alertKey = alert.GetAlertKey();
                _activeAlerts.TryRemove(alertKey, out _);
                
                _logger.LogInformation("Alert resolved: {AlertId} by {ResolvedBy}", alertId, resolvedBy);
                
                await _eventBus.PublishAsync(new PermissionAlertResolvedEvent
                {
                    Alert = alert,
                    ResolvedBy = resolvedBy
                });
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving alert: {AlertId}", alertId);
                return false;
            }
        }

        public Task<List<PermissionAlertEvent>> GetActiveAlertsAsync()
        {
            try
            {
                var alerts = _activeAlerts.Values
                    .OrderByDescending(a => a.CreatedAt)
                    .ToList();
                
                return Task.FromResult(alerts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active alerts");
                throw;
            }
        }

        public Task<List<PermissionAlertEvent>> GetAlertHistoryAsync(TimeSpan timeWindow)
        {
            try
            {
                var cutoffTime = DateTime.UtcNow - timeWindow;
                var alerts = _alertHistory.Values
                    .Where(a => a.CreatedAt >= cutoffTime)
                    .OrderByDescending(a => a.CreatedAt)
                    .ToList();
                
                return Task.FromResult(alerts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting alert history");
                throw;
            }
        }

        public Task<AlertStatistics> GetAlertStatisticsAsync()
        {
            try
            {
                var allAlerts = _alertHistory.Values.ToList();
                var activeAlerts = _activeAlerts.Values.ToList();
                
                var statistics = new AlertStatistics
                {
                    TotalAlerts = allAlerts.Count,
                    ActiveAlerts = activeAlerts.Count,
                    AcknowledgedAlerts = allAlerts.Count(a => a.Status == AlertStatus.Acknowledged),
                    ResolvedAlerts = allAlerts.Count(a => a.Status == AlertStatus.Resolved),
                    LastAlertAt = allAlerts.Any() ? allAlerts.Max(a => a.CreatedAt) : (DateTime?)null
                };
                
                // 按级别统计
                statistics.AlertsByLevel = allAlerts
                    .GroupBy(a => a.Level)
                    .ToDictionary(g => g.Key, g => g.Count());
                
                // 按类型统计
                statistics.AlertsByType = allAlerts
                    .GroupBy(a => a.Type)
                    .ToDictionary(g => g.Key, g => g.Count());
                
                return Task.FromResult(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting alert statistics");
                throw;
            }
        }

        public async Task<bool> SuppressAlertAsync(string alertId, int suppressionMinutes)
        {
            try
            {
                var alert = _alertHistory.Values.FirstOrDefault(a => a.AlertId == alertId);
                if (alert == null)
                {
                    _logger.LogWarning("Alert not found: {AlertId}", alertId);
                    return false;
                }

                var alertKey = alert.GetAlertKey();
                var suppressionEndTime = DateTime.UtcNow.AddMinutes(suppressionMinutes);
                
                _suppressedAlerts.TryAdd(alertKey, suppressionEndTime);
                
                // 从活跃告警中移除
                _activeAlerts.TryRemove(alertKey, out _);
                
                alert.Status = AlertStatus.Suppressed;
                
                _logger.LogInformation("Alert suppressed: {AlertId} for {Minutes} minutes", alertId, suppressionMinutes);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suppressing alert: {AlertId}", alertId);
                return false;
            }
        }

        public async Task<Dictionary<string, bool>> BatchProcessAlertsAsync(List<string> alertIds, string action, string performedBy)
        {
            try
            {
                var results = new Dictionary<string, bool>();
                
                foreach (var alertId in alertIds)
                {
                    bool success = false;
                    
                    switch (action.ToLower())
                    {
                        case "acknowledge":
                            success = await AcknowledgeAlertAsync(alertId, performedBy);
                            break;
                        case "resolve":
                            success = await ResolveAlertAsync(alertId, performedBy);
                            break;
                        case "suppress":
                            success = await SuppressAlertAsync(alertId, _options.AlertSuppressionMinutes);
                            break;
                        default:
                            _logger.LogWarning("Unknown action: {Action}", action);
                            break;
                    }
                    
                    results[alertId] = success;
                }
                
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error batch processing alerts");
                throw;
            }
        }

        public async Task<int> ClearResolvedAlertsAsync(DateTime olderThan)
        {
            try
            {
                var alertsToRemove = _alertHistory.Values
                    .Where(a => a.Status == AlertStatus.Resolved && a.ResolvedAt <= olderThan)
                    .ToList();
                
                int removedCount = 0;
                foreach (var alert in alertsToRemove)
                {
                    if (_alertHistory.TryRemove(alert.AlertId, out _))
                    {
                        removedCount++;
                    }
                }
                
                _logger.LogInformation("Cleared {Count} resolved alerts older than {Date}", removedCount, olderThan);
                
                return removedCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing resolved alerts");
                throw;
            }
        }

        public Task<Dictionary<string, int>> GetAlertTrendAsync(TimeSpan timeRange, string groupBy = "hour")
        {
            try
            {
                var cutoffTime = DateTime.UtcNow - timeRange;
                var alerts = _alertHistory.Values
                    .Where(a => a.CreatedAt >= cutoffTime)
                    .ToList();
                
                var trend = new Dictionary<string, int>();
                
                switch (groupBy.ToLower())
                {
                    case "hour":
                        trend = alerts
                            .GroupBy(a => a.CreatedAt.ToString("yyyy-MM-dd HH:00"))
                            .ToDictionary(g => g.Key, g => g.Count());
                        break;
                    case "day":
                        trend = alerts
                            .GroupBy(a => a.CreatedAt.ToString("yyyy-MM-dd"))
                            .ToDictionary(g => g.Key, g => g.Count());
                        break;
                    case "week":
                        trend = alerts
                            .GroupBy(a => $"{a.CreatedAt.Year}-W{a.CreatedAt.DayOfYear / 7 + 1}")
                            .ToDictionary(g => g.Key, g => g.Count());
                        break;
                    default:
                        _logger.LogWarning("Unknown group by: {GroupBy}", groupBy);
                        break;
                }
                
                return Task.FromResult(trend);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting alert trend");
                throw;
            }
        }

        /// <summary>
        /// 是否应该发送通知
        /// </summary>
        private bool ShouldSendNotification(PermissionAlertEvent alert)
        {
            return alert.Level >= _options.NotificationLevelThreshold && !alert.NotificationSent;
        }

        /// <summary>
        /// 发送通知
        /// </summary>
        private async Task SendNotificationAsync(PermissionAlertEvent alert)
        {
            try
            {
                // 发送邮件通知
                if (_options.EnableEmailNotification && _emailSender != null && _options.EmailRecipients.Any())
                {
                    await SendEmailNotificationAsync(alert);
                }
                
                // 发送Webhook通知
                if (_options.EnableWebhookNotification && !string.IsNullOrEmpty(_options.WebhookUrl))
                {
                    await SendWebhookNotificationAsync(alert);
                }
                
                // 更新通知状态
                alert.NotificationSent = true;
                alert.NotificationSentAt = DateTime.UtcNow;
                
                _logger.LogInformation("Notification sent for alert: {AlertId}", alert.AlertId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification for alert: {AlertId}", alert.AlertId);
            }
        }

        /// <summary>
        /// 发送邮件通知
        /// </summary>
        private async Task SendEmailNotificationAsync(PermissionAlertEvent alert)
        {
            try
            {
                var subject = $"[{alert.Level}] {alert.Title}";
                var body = $@"
                    <h2>权限系统告警</h2>
                    <p><strong>级别:</strong> {alert.Level}</p>
                    <p><strong>类型:</strong> {alert.Type}</p>
                    <p><strong>标题:</strong> {alert.Title}</p>
                    <p><strong>描述:</strong> {alert.Description}</p>
                    <p><strong>来源:</strong> {alert.Source}</p>
                    <p><strong>时间:</strong> {alert.CreatedAt:yyyy-MM-dd HH:mm:ss}</p>
                    <p><strong>告警ID:</strong> {alert.AlertId}</p>
                ";
                
                foreach (var recipient in _options.EmailRecipients)
                {
                    await _emailSender.SendAsync(recipient, subject, body, isBodyHtml: true);
                }
                
                _logger.LogInformation("Email notification sent for alert: {AlertId}", alert.AlertId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email notification for alert: {AlertId}", alert.AlertId);
            }
        }

        /// <summary>
        /// 发送Webhook通知
        /// </summary>
        private async Task SendWebhookNotificationAsync(PermissionAlertEvent alert)
        {
            try
            {
                // TODO: 实现Webhook通知
                _logger.LogInformation("Webhook notification would be sent for alert: {AlertId}", alert.AlertId);
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending webhook notification for alert: {AlertId}", alert.AlertId);
            }
        }
    }

    /// <summary>
    /// 告警创建事件
    /// </summary>
    public class PermissionAlertCreatedEvent
    {
        public PermissionAlertEvent Alert { get; set; }
        public AlertStatistics Statistics { get; set; }
    }

    /// <summary>
    /// 告警确认事件
    /// </summary>
    public class PermissionAlertAcknowledgedEvent
    {
        public PermissionAlertEvent Alert { get; set; }
        public string AcknowledgedBy { get; set; }
    }

    /// <summary>
    /// 告警解决事件
    /// </summary>
    public class PermissionAlertResolvedEvent
    {
        public PermissionAlertEvent Alert { get; set; }
        public string ResolvedBy { get; set; }
    }
}