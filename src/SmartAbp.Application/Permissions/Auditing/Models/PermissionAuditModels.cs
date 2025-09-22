using System;
using System.Collections.Generic;

namespace SmartAbp.Application.Permissions.Auditing.Models
{
    /// <summary>
    /// Permission Audit Log Model for Elasticsearch Storage
    /// Stage 5.1 Implementation - Enterprise Permission Management System
    /// </summary>
    public class PermissionAuditLog
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string SessionId { get; set; }
        public string Permission { get; set; }
        public string Resource { get; set; }
        public string Action { get; set; }
        public AuditResult Result { get; set; }
        public DateTime Timestamp { get; set; }
        public string ClientIP { get; set; }
        public string UserAgent { get; set; }
        
        // Enriched Information
        public UserInfo UserInfo { get; set; }
        public SessionInfo SessionInfo { get; set; }
        public PermissionContext PermissionContext { get; set; }
        public GeoLocation GeoLocation { get; set; }
        public RiskLevel RiskLevel { get; set; }
        
        // Additional Metadata
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
        public string CorrelationId { get; set; }
        public string TenantId { get; set; }
        public int RiskScore { get; set; }
    }

    public class UserInfo
    {
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
        public bool IsSystemUser { get; set; }
        public DateTime LastLoginTime { get; set; }
    }

    public class SessionInfo
    {
        public string SessionId { get; set; }
        public string DeviceInfo { get; set; }
        public string Browser { get; set; }
        public string OperatingSystem { get; set; }
        public DateTime SessionStartTime { get; set; }
        public bool IsSecureConnection { get; set; }
        public string RefererUrl { get; set; }
    }

    public class PermissionContext
    {
        public string PermissionName { get; set; }
        public string ResourceType { get; set; }
        public string ResourceId { get; set; }
        public bool IsDataPermission { get; set; }
        public bool IsSensitive { get; set; }
        public List<string> RequiredRoles { get; set; } = new List<string>();
        public Dictionary<string, object> PolicyContext { get; set; } = new Dictionary<string, object>();
    }

    public class GeoLocation
    {
        public string Country { get; set; }
        public string Region { get; set; }
        public string City { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string TimeZone { get; set; }
        public string ISP { get; set; }
        public bool IsVPN { get; set; }
        public bool IsTor { get; set; }
    }

    public class SecurityAlert
    {
        public Guid Id { get; set; }
        public SecurityAlertType Type { get; set; }
        public RiskLevel Severity { get; set; }
        public Guid UserId { get; set; }
        public string Description { get; set; }
        public DateTime Timestamp { get; set; }
        public PermissionAuditLog Context { get; set; }
        public bool IsAcknowledged { get; set; }
        public string AcknowledgedBy { get; set; }
        public DateTime? AcknowledgedAt { get; set; }
        public List<string> RecommendedActions { get; set; } = new List<string>();
    }

    public class ApprovalInfo
    {
        public Guid? ApproverId { get; set; }
        public string ApproverName { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string BusinessJustification { get; set; }
        public string ApprovalTicketId { get; set; }
        public bool IsEmergencyApproval { get; set; }
    }

    public enum AuditResult
    {
        Success = 0,
        Failed = 1,
        Denied = 2,
        Error = 3
    }

    public enum RiskLevel
    {
        Low = 0,
        Medium = 1, 
        High = 2,
        Critical = 3
    }

    public enum SecurityAlertType
    {
        HighRiskPermissionAccess = 0,
        UnusualLocationAccess = 1,
        OffHoursAccess = 2,
        PermissionEscalation = 3,
        MultipleFailedAttempts = 4,
        SensitiveDataAccess = 5,
        SuspiciousActivity = 6
    }
}