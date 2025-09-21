using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Permissions.Alerting
{
    public class EnterpriseAlertingOptions
    {
        public bool EnableEmailAlerts { get; set; } = true;
        public bool EnableSmsAlerts { get; set; } = false;
        public bool EnableWebhookAlerts { get; set; } = true;
        public bool EnableDashboardAlerts { get; set; } = true;
        public int MaxAlertsPerMinute { get; set; } = 10;
        public int AlertCooldownMinutes { get; set; } = 5;
        public int AlertExpirationHours { get; set; } = 24;
        public Dictionary<string, string> EmailSettings { get; set; } = new();
        public Dictionary<string, string> SmsSettings { get; set; } = new();
        public List<string> WebhookUrls { get; set; } = new();
        public List<string> AlertRecipients { get; set; } = new();
        public Dictionary<string, double> SeverityThresholds { get; set; } = new()
        {
            ["Critical"] = 0.9,
            ["High"] = 0.7,
            ["Medium"] = 0.5,
            ["Low"] = 0.3
        };
        public Dictionary<string, string> AlertTemplates { get; set; } = new();
    }

    public enum AlertSeverity
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum AlertCategory
    {
        Performance,
        Security,
        Availability,
        Capacity,
        Configuration,
        Other
    }

    public class AlertRule
    {
        public string RuleId { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public AlertSeverity Severity { get; set; } = AlertSeverity.Medium;
        public AlertCategory Category { get; set; } = AlertCategory.Other;
        public string Condition { get; set; } = string.Empty;
        public string MetricName { get; set; } = string.Empty;
        public double ThresholdValue { get; set; }
        public int DurationMinutes { get; set; } = 5;
        public bool IsEnabled { get; set; } = true;
        public List<string> NotificationChannels { get; set; } = new();
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class AlertIncident
    {
        public string IncidentId { get; set; } = Guid.NewGuid().ToString();
        public string RuleId { get; set; } = string.Empty;
        public string RuleName { get; set; } = string.Empty;
        public AlertSeverity Severity { get; set; }
        public AlertCategory Category { get; set; }
        public AlertStatus Status { get; set; } = AlertStatus.Active;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Dictionary<string, object> Details { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }
        public DateTime? AcknowledgedAt { get; set; }
        public string? AcknowledgedBy { get; set; }
        public string? ResolvedBy { get; set; }
        public List<AlertNotification> Notifications { get; set; } = new();
        public Dictionary<string, object> Context { get; set; } = new();
    }

    public class AlertNotification
    {
        public string NotificationId { get; set; } = Guid.NewGuid().ToString();
        public string IncidentId { get; set; } = string.Empty;
        public string Channel { get; set; } = string.Empty;
        public string Recipient { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsSent { get; set; }
        public string? ErrorMessage { get; set; }
        public int RetryCount { get; set; }
    }

    public interface IEnterpriseAlertingService
    {
        Task<AlertIncident> CreateAlertIncidentAsync(AlertRule rule, Dictionary<string, object> context);
        Task<bool> ProcessAlertAsync(string ruleId, Dictionary<string, object> data);
        Task<bool> SendNotificationAsync(AlertNotification notification);
        Task<bool> AcknowledgeIncidentAsync(string incidentId, string acknowledgedBy);
        Task<bool> ResolveIncidentAsync(string incidentId, string resolvedBy);
        Task<List<AlertIncident>> GetActiveIncidentsAsync();
        Task<List<AlertIncident>> GetIncidentsAsync(DateTime? fromDate = null, AlertSeverity? severity = null);
        Task<List<AlertRule>> GetAlertRulesAsync(bool? enabledOnly = null);
        Task<bool> CreateAlertRuleAsync(AlertRule rule);
        Task<bool> UpdateAlertRuleAsync(AlertRule rule);
        Task<bool> DeleteAlertRuleAsync(string ruleId);
        Task<Dictionary<string, object>> GetAlertStatisticsAsync();
        Task<bool> TestAlertRuleAsync(string ruleId);
    }

    public class EnterpriseAlertingService : IEnterpriseAlertingService, ITransientDependency
    {
        private readonly ILogger<EnterpriseAlertingService> _logger;
        private readonly IOptions<EnterpriseAlertingOptions> _options;
        private readonly HttpClient _httpClient;
        private readonly List<AlertRule> _alertRules;
        private readonly List<AlertIncident> _incidents;
        private readonly Dictionary<string, DateTime> _lastAlertTimes;
        private readonly SemaphoreSlim _alertSemaphore;

        public EnterpriseAlertingService(
            ILogger<EnterpriseAlertingService> logger,
            IOptions<EnterpriseAlertingOptions> options,
            HttpClient httpClient)
        {
            _logger = logger;
            _options = options;
            _httpClient = httpClient;
            _alertRules = new List<AlertRule>();
            _incidents = new List<AlertIncident>();
            _lastAlertTimes = new Dictionary<string, DateTime>();
            _alertSemaphore = new SemaphoreSlim(1, 1);

            InitializeDefaultAlertRules();
        }

        public async Task<AlertIncident> CreateAlertIncidentAsync(AlertRule rule, Dictionary<string, object> context)
        {
            try
            {
                _logger.LogInformation("Creating alert incident for rule: {RuleName}", rule.Name);

                var incident = new AlertIncident
                {
                    RuleId = rule.RuleId,
                    RuleName = rule.Name,
                    Severity = rule.Severity,
                    Category = rule.Category,
                    Title = rule.Name,
                    Description = rule.Description,
                    Details = context,
                    Context = context,
                    CreatedAt = DateTime.UtcNow
                };

                _incidents.Add(incident);

                // 发送通知
                await SendIncidentNotificationsAsync(incident);

                _logger.LogInformation("Alert incident created successfully: {IncidentId}", incident.IncidentId);
                return incident;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create alert incident for rule: {RuleName}", rule.Name);
                throw;
            }
        }

        public async Task<bool> ProcessAlertAsync(string ruleId, Dictionary<string, object> data)
        {
            await _alertSemaphore.WaitAsync();
            try
            {
                _logger.LogInformation("Processing alert for rule: {RuleId}", ruleId);

                var rule = _alertRules.FirstOrDefault(r => r.RuleId == ruleId);
                if (rule == null || !rule.IsEnabled)
                {
                    _logger.LogWarning("Alert rule not found or disabled: {RuleId}", ruleId);
                    return false;
                }

                // 检查告警冷却时间
                if (!await CanSendAlertAsync(rule.RuleId))
                {
                    _logger.LogInformation("Alert skipped due to cooldown: {RuleId}", ruleId);
                    return false;
                }

                // 评估告警条件
                if (!await EvaluateAlertConditionAsync(rule, data))
                {
                    _logger.LogInformation("Alert condition not met for rule: {RuleId}", ruleId);
                    return false;
                }

                // 创建告警事件
                var incident = await CreateAlertIncidentAsync(rule, data);

                _logger.LogInformation("Alert processed successfully for rule: {RuleId}", ruleId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process alert for rule: {RuleId}", ruleId);
                return false;
            }
            finally
            {
                _alertSemaphore.Release();
            }
        }

        public async Task<bool> SendNotificationAsync(AlertNotification notification)
        {
            try
            {
                _logger.LogInformation("Sending notification via channel: {Channel} to recipient: {Recipient}", 
                    notification.Channel, notification.Recipient);

                var success = notification.Channel.ToLower() switch
                {
                    "email" => await SendEmailNotificationAsync(notification),
                    "sms" => await SendSmsNotificationAsync(notification),
                    "webhook" => await SendWebhookNotificationAsync(notification),
                    "dashboard" => await SendDashboardNotificationAsync(notification),
                    _ => false
                };

                notification.IsSent = success;
                notification.SentAt = DateTime.UtcNow;

                if (!success)
                {
                    notification.ErrorMessage = "Failed to send notification";
                    notification.RetryCount++;
                }

                _logger.LogInformation("Notification sent successfully: {Success}", success);
                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send notification via channel: {Channel}", notification.Channel);
                notification.ErrorMessage = ex.Message;
                notification.RetryCount++;
                return false;
            }
        }

        public async Task<bool> AcknowledgeIncidentAsync(string incidentId, string acknowledgedBy)
        {
            try
            {
                var incident = _incidents.FirstOrDefault(i => i.IncidentId == incidentId);
                if (incident == null)
                {
                    _logger.LogWarning("Incident not found for acknowledgment: {IncidentId}", incidentId);
                    return false;
                }

                incident.Status = AlertStatus.Acknowledged;
                incident.AcknowledgedBy = acknowledgedBy;
                incident.AcknowledgedAt = DateTime.UtcNow;

                _logger.LogInformation("Incident acknowledged successfully: {IncidentId} by {AcknowledgedBy}", 
                    incidentId, acknowledgedBy);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to acknowledge incident: {IncidentId}", incidentId);
                return false;
            }
        }

        public async Task<bool> ResolveIncidentAsync(string incidentId, string resolvedBy)
        {
            try
            {
                var incident = _incidents.FirstOrDefault(i => i.IncidentId == incidentId);
                if (incident == null)
                {
                    _logger.LogWarning("Incident not found for resolution: {IncidentId}", incidentId);
                    return false;
                }

                incident.Status = AlertStatus.Resolved;
                incident.ResolvedBy = resolvedBy;
                incident.ResolvedAt = DateTime.UtcNow;

                _logger.LogInformation("Incident resolved successfully: {IncidentId} by {ResolvedBy}", 
                    incidentId, resolvedBy);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to resolve incident: {IncidentId}", incidentId);
                return false;
            }
        }

        public async Task<List<AlertIncident>> GetActiveIncidentsAsync()
        {
            try
            {
                var activeIncidents = _incidents
                    .Where(i => i.Status == AlertStatus.Active)
                    .OrderByDescending(i => i.CreatedAt)
                    .ToList();

                _logger.LogInformation("Retrieved {Count} active incidents", activeIncidents.Count);
                return activeIncidents;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve active incidents");
                return new List<AlertIncident>();
            }
        }

        public async Task<List<AlertIncident>> GetIncidentsAsync(DateTime? fromDate = null, AlertSeverity? severity = null)
        {
            try
            {
                var query = _incidents.AsEnumerable();

                if (fromDate.HasValue)
                {
                    query = query.Where(i => i.CreatedAt >= fromDate.Value);
                }

                if (severity.HasValue)
                {
                    query = query.Where(i => i.Severity == severity.Value);
                }

                var incidents = query.OrderByDescending(i => i.CreatedAt).Take(100).ToList();

                _logger.LogInformation("Retrieved {Count} incidents", incidents.Count);
                return incidents;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve incidents");
                return new List<AlertIncident>();
            }
        }

        public async Task<List<AlertRule>> GetAlertRulesAsync(bool? enabledOnly = null)
        {
            try
            {
                var query = _alertRules.AsEnumerable();

                if (enabledOnly.HasValue && enabledOnly.Value)
                {
                    query = query.Where(r => r.IsEnabled);
                }

                return query.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve alert rules");
                return new List<AlertRule>();
            }
        }

        public async Task<bool> CreateAlertRuleAsync(AlertRule rule)
        {
            try
            {
                rule.RuleId = Guid.NewGuid().ToString();
                _alertRules.Add(rule);

                _logger.LogInformation("Alert rule created successfully: {RuleName}", rule.Name);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create alert rule: {RuleName}", rule.Name);
                return false;
            }
        }

        public async Task<bool> UpdateAlertRuleAsync(AlertRule rule)
        {
            try
            {
                var existingRule = _alertRules.FirstOrDefault(r => r.RuleId == rule.RuleId);
                if (existingRule == null)
                {
                    _logger.LogWarning("Alert rule not found for update: {RuleId}", rule.RuleId);
                    return false;
                }

                var index = _alertRules.IndexOf(existingRule);
                _alertRules[index] = rule;

                _logger.LogInformation("Alert rule updated successfully: {RuleName}", rule.Name);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update alert rule: {RuleName}", rule.Name);
                return false;
            }
        }

        public async Task<bool> DeleteAlertRuleAsync(string ruleId)
        {
            try
            {
                var rule = _alertRules.FirstOrDefault(r => r.RuleId == ruleId);
                if (rule == null)
                {
                    _logger.LogWarning("Alert rule not found for deletion: {RuleId}", ruleId);
                    return false;
                }

                _alertRules.Remove(rule);

                _logger.LogInformation("Alert rule deleted successfully: {RuleName}", rule.Name);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete alert rule: {RuleId}", ruleId);
                return false;
            }
        }

        public async Task<Dictionary<string, object>> GetAlertStatisticsAsync()
        {
            try
            {
                var totalIncidents = _incidents.Count;
                var activeIncidents = _incidents.Count(i => i.Status == AlertStatus.Active);
                var acknowledgedIncidents = _incidents.Count(i => i.Status == AlertStatus.Acknowledged);
                var resolvedIncidents = _incidents.Count(i => i.Status == AlertStatus.Resolved);

                var incidentsBySeverity = _incidents
                    .GroupBy(i => i.Severity)
                    .ToDictionary(g => g.Key.ToString(), g => g.Count());

                var incidentsByCategory = _incidents
                    .GroupBy(i => i.Category)
                    .ToDictionary(g => g.Key.ToString(), g => g.Count());

                var last24Hours = _incidents.Where(i => i.CreatedAt >= DateTime.UtcNow.AddHours(-24)).Count();
                var last7Days = _incidents.Where(i => i.CreatedAt >= DateTime.UtcNow.AddDays(-7)).Count();

                return new Dictionary<string, object>
                {
                    ["TotalIncidents"] = totalIncidents,
                    ["ActiveIncidents"] = activeIncidents,
                    ["AcknowledgedIncidents"] = acknowledgedIncidents,
                    ["ResolvedIncidents"] = resolvedIncidents,
                    ["IncidentsBySeverity"] = incidentsBySeverity,
                    ["IncidentsByCategory"] = incidentsByCategory,
                    ["Last24Hours"] = last24Hours,
                    ["Last7Days"] = last7Days,
                    ["AlertRulesCount"] = _alertRules.Count,
                    ["EnabledAlertRulesCount"] = _alertRules.Count(r => r.IsEnabled)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve alert statistics");
                return new Dictionary<string, object>();
            }
        }

        public async Task<bool> TestAlertRuleAsync(string ruleId)
        {
            try
            {
                var rule = _alertRules.FirstOrDefault(r => r.RuleId == ruleId);
                if (rule == null)
                {
                    _logger.LogWarning("Alert rule not found for testing: {RuleId}", ruleId);
                    return false;
                }

                var testData = new Dictionary<string, object>
                {
                    ["test"] = true,
                    ["timestamp"] = DateTime.UtcNow,
                    ["ruleId"] = ruleId
                };

                var result = await EvaluateAlertConditionAsync(rule, testData);

                _logger.LogInformation("Alert rule test completed: {RuleName}, Result: {Result}", rule.Name, result);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to test alert rule: {RuleId}", ruleId);
                return false;
            }
        }

        private void InitializeDefaultAlertRules()
        {
            var defaultRules = new[]
            {
                new AlertRule
                {
                    Name = "High CPU Usage",
                    Description = "Triggers when CPU usage exceeds 80%",
                    Severity = AlertSeverity.High,
                    Category = AlertCategory.Performance,
                    MetricName = "cpu_usage_percent",
                    ThresholdValue = 80.0,
                    Condition = "cpu_usage_percent > 80",
                    NotificationChannels = new List<string> { "email", "dashboard" }
                },
                new AlertRule
                {
                    Name = "High Memory Usage",
                    Description = "Triggers when memory usage exceeds 85%",
                    Severity = AlertSeverity.High,
                    Category = AlertCategory.Performance,
                    MetricName = "memory_usage_percent",
                    ThresholdValue = 85.0,
                    Condition = "memory_usage_percent > 85",
                    NotificationChannels = new List<string> { "email", "dashboard" }
                },
                new AlertRule
                {
                    Name = "Service Unavailable",
                    Description = "Triggers when service is not responding",
                    Severity = AlertSeverity.Critical,
                    Category = AlertCategory.Availability,
                    Condition = "service_status != 'healthy'",
                    NotificationChannels = new List<string> { "email", "sms", "webhook" }
                }
            };

            foreach (var rule in defaultRules)
            {
                _alertRules.Add(rule);
            }
        }

        private async Task<bool> CanSendAlertAsync(string ruleId)
        {
            if (_lastAlertTimes.TryGetValue(ruleId, out var lastAlertTime))
            {
                var timeSinceLastAlert = DateTime.UtcNow - lastAlertTime;
                if (timeSinceLastAlert.TotalMinutes < _options.Value.AlertCooldownMinutes)
                {
                    return false;
                }
            }

            // 检查告警频率限制
            var recentAlerts = _incidents
                .Where(i => i.CreatedAt >= DateTime.UtcNow.AddMinutes(-1) && i.RuleId == ruleId)
                .Count();

            return recentAlerts < _options.Value.MaxAlertsPerMinute;
        }

        private async Task<bool> EvaluateAlertConditionAsync(AlertRule rule, Dictionary<string, object> data)
        {
            try
            {
                // 简单的条件评估逻辑
                if (!string.IsNullOrEmpty(rule.MetricName) && data.ContainsKey(rule.MetricName))
                {
                    var value = Convert.ToDouble(data[rule.MetricName]);
                    return value > rule.ThresholdValue;
                }

                // 如果指定了条件表达式，可以进行更复杂的评估
                if (!string.IsNullOrEmpty(rule.Condition))
                {
                    return EvaluateConditionExpression(rule.Condition, data);
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to evaluate alert condition for rule: {RuleName}", rule.Name);
                return false;
            }
        }

        private bool EvaluateConditionExpression(string condition, Dictionary<string, object> data)
        {
            // 简单的条件表达式评估
            if (condition.Contains("!="))
            {
                var parts = condition.Split("!=");
                if (parts.Length == 2 && data.ContainsKey(parts[0].Trim()))
                {
                    var value = data[parts[0].Trim()]?.ToString();
                    var expected = parts[1].Trim().Trim('\'');
                    return value != expected;
                }
            }

            return true;
        }

        private async Task SendIncidentNotificationsAsync(AlertIncident incident)
        {
            var rule = _alertRules.FirstOrDefault(r => r.RuleId == incident.RuleId);
            if (rule == null) return;

            var notifications = new List<AlertNotification>();

            foreach (var channel in rule.NotificationChannels)
            {
                foreach (var recipient in _options.Value.AlertRecipients)
                {
                    var notification = new AlertNotification
                    {
                        IncidentId = incident.IncidentId,
                        Channel = channel,
                        Recipient = recipient,
                        Subject = $"[{incident.Severity}] {incident.Title}",
                        Body = FormatAlertMessage(incident)
                    };

                    notifications.Add(notification);
                    incident.Notifications.Add(notification);

                    await SendNotificationAsync(notification);
                }
            }

            _lastAlertTimes[incident.RuleId] = DateTime.UtcNow;
        }

        private async Task<bool> SendEmailNotificationAsync(AlertNotification notification)
        {
            try
            {
                _logger.LogInformation("Sending email notification to: {Recipient}", notification.Recipient);
                // 模拟邮件发送
                await Task.Delay(100);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email notification");
                return false;
            }
        }

        private async Task<bool> SendSmsNotificationAsync(AlertNotification notification)
        {
            try
            {
                _logger.LogInformation("Sending SMS notification to: {Recipient}", notification.Recipient);
                // 模拟短信发送
                await Task.Delay(100);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send SMS notification");
                return false;
            }
        }

        private async Task<bool> SendWebhookNotificationAsync(AlertNotification notification)
        {
            try
            {
                _logger.LogInformation("Sending webhook notification to: {Recipient}", notification.Recipient);

                var payload = new
                {
                    incident_id = notification.IncidentId,
                    subject = notification.Subject,
                    body = notification.Body,
                    timestamp = notification.SentAt,
                    channel = notification.Channel
                };

                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                foreach (var webhookUrl in _options.Value.WebhookUrls)
                {
                    try
                    {
                        var response = await _httpClient.PostAsync(webhookUrl, content);
                        _logger.LogInformation("Webhook notification sent successfully: {StatusCode}", response.StatusCode);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send webhook notification to: {WebhookUrl}", webhookUrl);
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send webhook notification");
                return false;
            }
        }

        private async Task<bool> SendDashboardNotificationAsync(AlertNotification notification)
        {
            try
            {
                _logger.LogInformation("Sending dashboard notification");
                // 模拟仪表板通知
                await Task.Delay(50);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send dashboard notification");
                return false;
            }
        }

        private string FormatAlertMessage(AlertIncident incident)
        {
            var template = _options.Value.AlertTemplates.ContainsKey(incident.Category.ToString())
                ? _options.Value.AlertTemplates[incident.Category.ToString()]
                : "Alert: {Title} - {Description}";

            return template
                .Replace("{Title}", incident.Title)
                .Replace("{Description}", incident.Description)
                .Replace("{Severity}", incident.Severity.ToString())
                .Replace("{Category}", incident.Category.ToString())
                .Replace("{CreatedAt}", incident.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"));
        }
    }

    public static class EnterpriseAlertingServiceExtensions
    {
        public static IServiceCollection AddEnterpriseAlertingService(
            this IServiceCollection services,
            Action<EnterpriseAlertingOptions>? configureOptions = null)
        {
            services.Configure<EnterpriseAlertingOptions>(options =>
            {
                configureOptions?.Invoke(options);
            });

            services.AddHttpClient<EnterpriseAlertingService>();
            services.AddTransient<IEnterpriseAlertingService, EnterpriseAlertingService>();
            
            return services;
        }
    }
}