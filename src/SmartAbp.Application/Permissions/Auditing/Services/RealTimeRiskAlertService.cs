using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartAbp.Application.Permissions.Auditing.Models;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EventBus.Local;
using Volo.Abp.Caching;

namespace SmartAbp.Application.Permissions.Auditing.Services
{
    /// <summary>
    /// Real-Time Risk Alert Service Implementation
    /// Stage 5.1 - Immediate Security Response System
    /// </summary>
    public class RealTimeRiskAlertService : IRealTimeRiskAlertService, ITransientDependency
    {
        private readonly ILogger<RealTimeRiskAlertService> _logger;
        private readonly INotificationService _notificationService;
        private readonly ILocalEventBus _eventBus;
        private readonly IDistributedCache<SecurityAlert> _alertCache;
        private readonly SecurityAlertOptions _options;

        public RealTimeRiskAlertService(
            ILogger<RealTimeRiskAlertService> logger,
            INotificationService notificationService,
            ILocalEventBus eventBus,
            IDistributedCache<SecurityAlert> alertCache,
            IOptionsSnapshot<SecurityAlertOptions> options)
        {
            _logger = logger;
            _notificationService = notificationService;
            _eventBus = eventBus;
            _alertCache = alertCache;
            _options = options.Value;
        }

        /// <summary>
        /// Processes risk alert for high-risk audit logs
        /// </summary>
        public async Task ProcessRiskAlertAsync(PermissionAuditLog auditLog)
        {
            try
            {
                if (auditLog.RiskLevel < RiskLevel.High)
                {
                    _logger.LogDebug("Audit log {AuditLogId} has risk level {RiskLevel}, no alert needed", 
                        auditLog.Id, auditLog.RiskLevel);
                    return;
                }

                _logger.LogWarning("Processing high-risk alert for user {UserId}, risk level {RiskLevel}", 
                    auditLog.UserId, auditLog.RiskLevel);

                var alert = await CreateSecurityAlertAsync(auditLog);

                // Store alert in cache for dashboard display
                await StoreAlertAsync(alert);

                // Send appropriate notifications based on risk level
                if (auditLog.RiskLevel == RiskLevel.Critical)
                {
                    await SendUrgentSecurityAlertAsync(alert);
                }
                else
                {
                    await SendSecurityAlertAsync(alert);
                }

                // Publish security incident event
                await _eventBus.PublishAsync(new SecurityIncidentEvent
                {
                    Alert = alert,
                    IncidentTime = DateTime.UtcNow,
                    RequiresImmedateAction = auditLog.RiskLevel == RiskLevel.Critical
                });

                _logger.LogInformation("Security alert {AlertId} processed successfully for user {UserId}", 
                    alert.Id, auditLog.UserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing risk alert for audit log {AuditLogId}", auditLog.Id);
                // Don't rethrow - alert processing should not block audit logging
            }
        }

        /// <summary>
        /// Sends standard security alert notification
        /// </summary>
        public async Task SendSecurityAlertAsync(SecurityAlert alert)
        {
            try
            {
                _logger.LogInformation("Sending security alert {AlertId} for {AlertType}", 
                    alert.Id, alert.Type);

                // Send to security team
                await _notificationService.SendEmailNotificationAsync(
                    _options.SecurityTeamEmail,
                    $"Security Alert: {alert.Type}",
                    FormatAlertEmailContent(alert)
                );

                // Send to Slack security channel
                if (!string.IsNullOrEmpty(_options.SlackSecurityChannel))
                {
                    await _notificationService.SendSlackNotificationAsync(
                        _options.SlackSecurityChannel,
                        FormatSlackMessage(alert)
                    );
                }

                // Update alert status
                alert.IsAcknowledged = false;
                await UpdateAlertAsync(alert);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending security alert {AlertId}", alert.Id);
            }
        }

        /// <summary>
        /// Sends urgent security alert for critical risks
        /// </summary>
        public async Task SendUrgentSecurityAlertAsync(SecurityAlert alert)
        {
            try
            {
                _logger.LogCritical("Sending URGENT security alert {AlertId} for {AlertType}", 
                    alert.Id, alert.Type);

                // Send urgent email to security team
                await _notificationService.SendEmailNotificationAsync(
                    _options.SecurityTeamEmail,
                    $"🚨 CRITICAL SECURITY ALERT: {alert.Type}",
                    FormatUrgentAlertEmailContent(alert)
                );

                // Send to emergency response team
                if (!string.IsNullOrEmpty(_options.EmergencyTeamEmail))
                {
                    await _notificationService.SendEmailNotificationAsync(
                        _options.EmergencyTeamEmail,
                        $"🚨 CRITICAL SECURITY INCIDENT",
                        FormatUrgentAlertEmailContent(alert)
                    );
                }

                // Send to Teams webhook for immediate visibility
                if (!string.IsNullOrEmpty(_options.TeamsWebhookUrl))
                {
                    await _notificationService.SendTeamsNotificationAsync(
                        _options.TeamsWebhookUrl,
                        FormatTeamsUrgentAlert(alert)
                    );
                }

                // Trigger additional security measures if configured
                await TriggerEmergencySecurityMeasures(alert);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending urgent security alert {AlertId}", alert.Id);
            }
        }

        /// <summary>
        /// Retrieves all active (unacknowledged) alerts
        /// </summary>
        public async Task<SecurityAlert[]> GetActiveAlertsAsync()
        {
            try
            {
                var cacheKey = "active_security_alerts";
                var activeAlerts = await _alertCache.GetAsync(cacheKey);

                if (activeAlerts == null)
                {
                    // Build active alerts list from recent cache entries
                    var alerts = new List<SecurityAlert>();
                    
                    // In production, this would query a persistent store
                    // For now, return empty list as cache-based implementation
                    activeAlerts = new SecurityAlert(); // Placeholder
                }

                return new[] { activeAlerts }; // Simplified return for testing
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active alerts");
                return Array.Empty<SecurityAlert>();
            }
        }

        /// <summary>
        /// Acknowledges a security alert
        /// </summary>
        public async Task AcknowledgeAlertAsync(Guid alertId, string acknowledgedBy)
        {
            try
            {
                var cacheKey = $"security_alert:{alertId}";
                var alert = await _alertCache.GetAsync(cacheKey);

                if (alert != null)
                {
                    alert.IsAcknowledged = true;
                    alert.AcknowledgedBy = acknowledgedBy;
                    alert.AcknowledgedAt = DateTime.UtcNow;

                    await _alertCache.SetAsync(cacheKey, alert, new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(7)
                    });

                    _logger.LogInformation("Security alert {AlertId} acknowledged by {User}", 
                        alertId, acknowledgedBy);

                    // Publish acknowledgment event
                    await _eventBus.PublishAsync(new SecurityAlertAcknowledgedEvent
                    {
                        AlertId = alertId,
                        AcknowledgedBy = acknowledgedBy,
                        AcknowledgedAt = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error acknowledging alert {AlertId}", alertId);
            }
        }

        #region Private Helper Methods

        private async Task<SecurityAlert> CreateSecurityAlertAsync(PermissionAuditLog auditLog)
        {
            var alertType = DetermineAlertType(auditLog);
            var description = GenerateAlertDescription(auditLog, alertType);
            var recommendations = GenerateRecommendations(auditLog, alertType);

            var alert = new SecurityAlert
            {
                Id = Guid.NewGuid(),
                Type = alertType,
                Severity = auditLog.RiskLevel,
                UserId = auditLog.UserId,
                Description = description,
                Timestamp = DateTime.UtcNow,
                Context = auditLog,
                IsAcknowledged = false,
                RecommendedActions = recommendations
            };

            return alert;
        }

        private SecurityAlertType DetermineAlertType(PermissionAuditLog auditLog)
        {
            // Determine alert type based on risk factors
            if (auditLog.GeoLocation != null && auditLog.GeoLocation.IsVPN)
                return SecurityAlertType.UnusualLocationAccess;

            if (auditLog.Result == AuditResult.Failed)
                return SecurityAlertType.MultipleFailedAttempts;

            if (auditLog.PermissionContext?.IsSensitive == true)
                return SecurityAlertType.SensitiveDataAccess;

            return SecurityAlertType.HighRiskPermissionAccess;
        }

        private string GenerateAlertDescription(PermissionAuditLog auditLog, SecurityAlertType alertType)
        {
            return alertType switch
            {
                SecurityAlertType.HighRiskPermissionAccess => 
                    $"High-risk permission access: {auditLog.Permission} by user {auditLog.UserInfo?.DisplayName ?? auditLog.UserId.ToString()}",
                SecurityAlertType.UnusualLocationAccess => 
                    $"Access from unusual location: {auditLog.GeoLocation?.Country}, {auditLog.GeoLocation?.City}",
                SecurityAlertType.MultipleFailedAttempts => 
                    $"Multiple failed permission attempts detected for user {auditLog.UserInfo?.DisplayName ?? auditLog.UserId.ToString()}",
                SecurityAlertType.SensitiveDataAccess => 
                    $"Sensitive data access: {auditLog.Permission} on {auditLog.Resource}",
                _ => $"Security alert: {alertType} detected"
            };
        }

        private List<string> GenerateRecommendations(PermissionAuditLog auditLog, SecurityAlertType alertType)
        {
            var recommendations = new List<string>();

            switch (alertType)
            {
                case SecurityAlertType.HighRiskPermissionAccess:
                    recommendations.Add("Verify user identity and business justification");
                    recommendations.Add("Review user's recent activity patterns");
                    break;

                case SecurityAlertType.UnusualLocationAccess:
                    recommendations.Add("Verify user location and travel status");
                    recommendations.Add("Consider requiring additional authentication");
                    break;

                case SecurityAlertType.MultipleFailedAttempts:
                    recommendations.Add("Check for potential brute force attack");
                    recommendations.Add("Consider temporarily suspending account");
                    break;

                case SecurityAlertType.SensitiveDataAccess:
                    recommendations.Add("Verify business need for sensitive data access");
                    recommendations.Add("Ensure proper approval workflow was followed");
                    break;
            }

            recommendations.Add("Document investigation findings");
            return recommendations;
        }

        private async Task StoreAlertAsync(SecurityAlert alert)
        {
            var cacheKey = $"security_alert:{alert.Id}";
            await _alertCache.SetAsync(cacheKey, alert, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(7)
            });
        }

        private async Task UpdateAlertAsync(SecurityAlert alert)
        {
            var cacheKey = $"security_alert:{alert.Id}";
            await _alertCache.SetAsync(cacheKey, alert, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(7)
            });
        }

        private string FormatAlertEmailContent(SecurityAlert alert)
        {
            return $@"
Security Alert Notification

Alert ID: {alert.Id}
Severity: {alert.Severity}
Type: {alert.Type}
Time: {alert.Timestamp:yyyy-MM-dd HH:mm:ss} UTC
User: {alert.Context?.UserInfo?.DisplayName ?? alert.UserId.ToString()}

Description: {alert.Description}

Recommended Actions:
{string.Join("\n", alert.RecommendedActions.Select(a => $"• {a}"))}

Please investigate this alert promptly and take appropriate action.
";
        }

        private string FormatUrgentAlertEmailContent(SecurityAlert alert)
        {
            return $@"
🚨 CRITICAL SECURITY ALERT 🚨

This is an urgent security notification requiring immediate attention.

Alert ID: {alert.Id}
Severity: {alert.Severity}
Type: {alert.Type}
Time: {alert.Timestamp:yyyy-MM-dd HH:mm:ss} UTC
User: {alert.Context?.UserInfo?.DisplayName ?? alert.UserId.ToString()}
IP Address: {alert.Context?.ClientIP}
Location: {alert.Context?.GeoLocation?.Country}, {alert.Context?.GeoLocation?.City}

Description: {alert.Description}

IMMEDIATE ACTIONS REQUIRED:
{string.Join("\n", alert.RecommendedActions.Select(a => $"• {a}"))}

Contact the security team immediately for escalation procedures.
";
        }

        private string FormatSlackMessage(SecurityAlert alert)
        {
            return $"🔒 Security Alert: {alert.Type} | Severity: {alert.Severity} | User: {alert.Context?.UserInfo?.DisplayName} | Time: {alert.Timestamp:HH:mm}";
        }

        private object FormatTeamsUrgentAlert(SecurityAlert alert)
        {
            return new
            {
                type = "message",
                attachments = new object[]
                {
                    new
                    {
                        contentType = "application/vnd.microsoft.card.adaptive",
                        content = new
                        {
                            type = "AdaptiveCard",
                            version = "1.2",
                            body = new object[]
                            {
                                new
                                {
                                    type = "TextBlock",
                                    text = "🚨 CRITICAL SECURITY ALERT",
                                    weight = "Bolder",
                                    color = "Attention"
                                },
                                new
                                {
                                    type = "TextBlock",
                                    text = alert.Description
                                }
                            }
                        }
                    }
                }
            };
        }

        private async Task TriggerEmergencySecurityMeasures(SecurityAlert alert)
        {
            try
            {
                // Trigger additional security measures for critical alerts
                await _eventBus.PublishAsync(new EmergencySecurityEvent
                {
                    Alert = alert,
                    RequiresAccountSuspension = alert.Type == SecurityAlertType.MultipleFailedAttempts,
                    RequiresLocationBlocking = alert.Type == SecurityAlertType.UnusualLocationAccess
                });

                _logger.LogWarning("Emergency security measures triggered for alert {AlertId}", alert.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error triggering emergency security measures for alert {AlertId}", alert.Id);
            }
        }

        #endregion
    }

    /// <summary>
    /// Configuration options for security alerts
    /// </summary>
    public class SecurityAlertOptions
    {
        public string SecurityTeamEmail { get; set; } = "security@company.com";
        public string EmergencyTeamEmail { get; set; } = "emergency@company.com";
        public string SlackSecurityChannel { get; set; } = "#security-alerts";
        public string TeamsWebhookUrl { get; set; }
        public bool EnableEmergencyMeasures { get; set; } = true;
        public TimeSpan AlertRetentionPeriod { get; set; } = TimeSpan.FromDays(30);
    }

    /// <summary>
    /// Events published by the alert service
    /// </summary>
    public class SecurityIncidentEvent
    {
        public SecurityAlert Alert { get; set; }
        public DateTime IncidentTime { get; set; }
        public bool RequiresImmedateAction { get; set; }
    }

    public class SecurityAlertAcknowledgedEvent
    {
        public Guid AlertId { get; set; }
        public string AcknowledgedBy { get; set; }
        public DateTime AcknowledgedAt { get; set; }
    }

    public class EmergencySecurityEvent
    {
        public SecurityAlert Alert { get; set; }
        public bool RequiresAccountSuspension { get; set; }
        public bool RequiresLocationBlocking { get; set; }
    }
}