using System;
using System.Threading.Tasks;
using SmartAbp.Application.Permissions.Auditing.Models;

namespace SmartAbp.Application.Permissions.Auditing.Services
{
    /// <summary>
    /// Interface for Audit Log Storage Implementation
    /// Stage 5.1 - Elasticsearch Audit Log Engine
    /// </summary>
    public interface IAuditLogStore
    {
        Task SaveAuditLogAsync(PermissionAuditLog auditLog);
        Task<PermissionAuditLog[]> GetAuditLogsAsync(DateTime startDate, DateTime endDate, Guid? userId = null);
        Task<PermissionAuditLog[]> SearchAuditLogsAsync(string query, int skip = 0, int take = 50);
        Task DeleteAuditLogsAsync(DateTime beforeDate);
    }

    /// <summary>
    /// Interface for Risk Analysis Service
    /// Calculates risk levels and analyzes patterns
    /// </summary>
    public interface IRiskAnalysisService
    {
        Task<RiskLevel> CalculateRiskLevelAsync(PermissionAuditLog auditLog);
        bool IsOutsideBusinessHours(DateTime timestamp);
        Task<bool> IsUnusualLocationAsync(Guid userId, string clientIP);
        Task<bool> IsHighFrequencyAccessAsync(Guid userId, string permission);
        Task<int> GetRecentFailuresAsync(Guid userId);
        Task<bool> IsSensitivePermissionAsync(string permission);
    }

    /// <summary>
    /// Interface for Real-time Risk Alert Service
    /// Handles security alerts and notifications
    /// </summary>
    public interface IRealTimeRiskAlertService
    {
        Task ProcessRiskAlertAsync(PermissionAuditLog auditLog);
        Task SendSecurityAlertAsync(SecurityAlert alert);
        Task SendUrgentSecurityAlertAsync(SecurityAlert alert);
        Task<SecurityAlert[]> GetActiveAlertsAsync();
        Task AcknowledgeAlertAsync(Guid alertId, string acknowledgedBy);
    }

    /// <summary>
    /// Interface for Geo Location Service
    /// Provides geographical information for IP addresses
    /// </summary>
    public interface IGeoLocationService
    {
        Task<GeoLocation> GetGeoLocationAsync(string ipAddress);
        Task<bool> IsKnownLocationAsync(Guid userId, GeoLocation location);
        Task AddKnownLocationAsync(Guid userId, GeoLocation location);
    }

    /// <summary>
    /// Interface for User Service
    /// Provides user information for audit enrichment
    /// </summary>
    public interface IUserService
    {
        Task<UserInfo> GetUserInfoAsync(Guid userId);
        Task<bool> IsSystemUserAsync(Guid userId);
        Task<string[]> GetUserRolesAsync(Guid userId);
    }

    /// <summary>
    /// Interface for Session Service
    /// Provides session information for audit enrichment
    /// </summary>
    public interface ISessionService
    {
        Task<SessionInfo> GetSessionInfoAsync(string sessionId);
        Task<bool> IsValidSessionAsync(string sessionId);
        Task InvalidateSessionAsync(string sessionId);
    }

    /// <summary>
    /// Interface for Permission Context Service
    /// Provides permission context information
    /// </summary>
    public interface IPermissionContextService
    {
        Task<PermissionContext> GetPermissionContextAsync(Guid userId, string permission, string resource);
        Task<bool> IsDataPermissionAsync(string permission);
        Task<bool> IsSensitivePermissionAsync(string permission);
    }

    /// <summary>
    /// Interface for Notification Service
    /// Handles various types of notifications
    /// </summary>
    public interface INotificationService
    {
        Task SendSecurityAlertAsync(SecurityAlert alert);
        Task SendUrgentSecurityAlertAsync(SecurityAlert alert);
        Task SendEmailNotificationAsync(string to, string subject, string body);
        Task SendSlackNotificationAsync(string channel, string message);
        Task SendTeamsNotificationAsync(string webhook, object payload);
    }
}