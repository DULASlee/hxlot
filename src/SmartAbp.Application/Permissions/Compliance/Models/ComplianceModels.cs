using System;
using System.Collections.Generic;
using SmartAbp.Application.Permissions.Auditing.Models;

namespace SmartAbp.Application.Permissions.Compliance.Models
{
    /// <summary>
    /// SOX Compliance Report Model
    /// Stage 5.2 Implementation - Enterprise Permission Management System
    /// </summary>
    public class SOXComplianceReport
    {
        public DateRange ReportPeriod { get; set; }
        public Guid? TenantId { get; set; }
        public DateTime GeneratedAt { get; set; }

        // Key SOX Control Analysis
        public List<AccessControlChange> AccessControlChanges { get; set; } = new List<AccessControlChange>();
        public List<PrivilegedUserAccess> PrivilegedUserAccess { get; set; } = new List<PrivilegedUserAccess>();
        public List<DataAccessPattern> DataAccessPatterns { get; set; } = new List<DataAccessPattern>();
        public List<SecurityIncident> SecurityIncidents { get; set; } = new List<SecurityIncident>();

        // Compliance Status and Recommendations
        public ComplianceStatus ComplianceStatus { get; set; }
        public List<ComplianceRecommendation> Recommendations { get; set; } = new List<ComplianceRecommendation>();

        // SOX-Specific Metrics
        public SOXMetrics Metrics { get; set; } = new SOXMetrics();
        public string ReportId { get; set; } = Guid.NewGuid().ToString();
        public string Version { get; set; } = "1.0";
    }

    /// <summary>
    /// GDPR Data Report Model
    /// Comprehensive data processing and rights management report
    /// </summary>
    public class GDPRDataReport
    {
        public Guid SubjectUserId { get; set; }
        public DateTime GeneratedAt { get; set; }

        // Data Processing Activities
        public List<DataProcessingActivity> DataCollectionActivities { get; set; } = new List<DataProcessingActivity>();
        public List<DataAccessRecord> DataAccessRecords { get; set; } = new List<DataAccessRecord>();
        public List<DataSharingRecord> DataSharingRecords { get; set; } = new List<DataSharingRecord>();
        public List<DataDeletionRecord> DataDeletionRecords { get; set; } = new List<DataDeletionRecord>();

        // Consent and Rights Management
        public List<ConsentRecord> ConsentRecords { get; set; } = new List<ConsentRecord>();
        public List<RightsExerciseRecord> RightsExerciseRecords { get; set; } = new List<RightsExerciseRecord>();

        // GDPR Compliance Status
        public GDPRComplianceStatus ComplianceStatus { get; set; }
        public List<GDPRViolation> Violations { get; set; } = new List<GDPRViolation>();
        public TimeSpan DataRetentionPeriod { get; set; }
    }

    /// <summary>
    /// Access Control Change Model for SOX Analysis
    /// </summary>
    public class AccessControlChange
    {
        public DateTime Timestamp { get; set; }
        public Guid UserId { get; set; }
        public string Action { get; set; }
        public string Target { get; set; }
        public Guid? ApproverId { get; set; }
        public string BusinessJustification { get; set; }
        public RiskLevel RiskLevel { get; set; }
        public string ChangeType { get; set; }
        public bool IsApprovalRequired { get; set; }
        public string ApprovalStatus { get; set; }
    }

    /// <summary>
    /// Privileged User Access Model for SOX Analysis
    /// </summary>
    public class PrivilegedUserAccess
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public List<string> UserRoles { get; set; } = new List<string>();
        public int AccessCount { get; set; }
        public DateTime LastAccessTime { get; set; }
        public List<string> AccessedResources { get; set; } = new List<string>();
        public RiskLevel HighestRiskLevel { get; set; }
        public bool RequiresReview { get; set; }
    }

    /// <summary>
    /// Data Access Pattern Model for SOX Analysis
    /// </summary>
    public class DataAccessPattern
    {
        public string DataType { get; set; }
        public int AccessCount { get; set; }
        public List<Guid> UniqueUsers { get; set; } = new List<Guid>();
        public DateTime PeakAccessTime { get; set; }
        public bool IsUnusualPattern { get; set; }
        public string PatternDescription { get; set; }
    }

    /// <summary>
    /// Security Incident Model for SOX Analysis
    /// </summary>
    public class SecurityIncident
    {
        public Guid IncidentId { get; set; }
        public DateTime IncidentTime { get; set; }
        public SecurityIncidentType Type { get; set; }
        public RiskLevel Severity { get; set; }
        public Guid AffectedUserId { get; set; }
        public string Description { get; set; }
        public IncidentStatus Status { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public string Resolution { get; set; }
    }

    /// <summary>
    /// SOX Compliance Metrics
    /// </summary>
    public class SOXMetrics
    {
        public int TotalAccessAttempts { get; set; }
        public int FailedAccessAttempts { get; set; }
        public int PrivilegedUserAccess { get; set; }
        public int AccessControlChanges { get; set; }
        public int SecurityIncidents { get; set; }
        public double ComplianceScore { get; set; }
        public TimeSpan AverageResponseTime { get; set; }
    }

    /// <summary>
    /// Data Processing Activity Model for GDPR
    /// </summary>
    public class DataProcessingActivity
    {
        public Guid ActivityId { get; set; } = Guid.NewGuid();
        public DataProcessingType Type { get; set; }
        public string Purpose { get; set; }
        public DateTime Timestamp { get; set; }
        public List<string> DataCategories { get; set; } = new List<string>();
        public string LegalBasis { get; set; }
        public bool ConsentRequired { get; set; }
        public bool ConsentObtained { get; set; }
        public string ProcessorName { get; set; }
        public string DataLocation { get; set; }
    }

    /// <summary>
    /// Data Access Record Model for GDPR
    /// </summary>
    public class DataAccessRecord
    {
        public Guid AccessId { get; set; } = Guid.NewGuid();
        public DateTime AccessedAt { get; set; }
        public Guid AccessedBy { get; set; }
        public string DataType { get; set; }
        public string Purpose { get; set; }
        public string AccessMethod { get; set; }
        public bool IsAuthorized { get; set; }
        public string LegalBasis { get; set; }
    }

    /// <summary>
    /// Data Sharing Record Model for GDPR
    /// </summary>
    public class DataSharingRecord
    {
        public Guid SharingId { get; set; } = Guid.NewGuid();
        public DateTime SharedAt { get; set; }
        public string RecipientName { get; set; }
        public string RecipientType { get; set; }
        public string Purpose { get; set; }
        public List<string> DataCategories { get; set; } = new List<string>();
        public string LegalBasis { get; set; }
        public bool ConsentObtained { get; set; }
        public string TransferMechanism { get; set; }
    }

    /// <summary>
    /// Data Deletion Record Model for GDPR
    /// </summary>
    public class DataDeletionRecord
    {
        public Guid DeletionId { get; set; } = Guid.NewGuid();
        public DateTime DeletedAt { get; set; }
        public string DataType { get; set; }
        public string DeletionReason { get; set; }
        public string DeletionMethod { get; set; }
        public bool IsVerified { get; set; }
        public Guid RequestedBy { get; set; }
    }

    /// <summary>
    /// Consent Record Model for GDPR
    /// </summary>
    public class ConsentRecord
    {
        public Guid ConsentId { get; set; } = Guid.NewGuid();
        public ConsentType ConsentType { get; set; }
        public bool ConsentGiven { get; set; }
        public DateTime ConsentDate { get; set; }
        public DateTime? WithdrawnDate { get; set; }
        public string Purpose { get; set; }
        public string ConsentMethod { get; set; }
        public bool IsExplicit { get; set; }
        public bool IsInformed { get; set; }
        public string ConsentText { get; set; }
    }

    /// <summary>
    /// Rights Exercise Record Model for GDPR
    /// </summary>
    public class RightsExerciseRecord
    {
        public Guid RequestId { get; set; } = Guid.NewGuid();
        public GDPRRightType RightType { get; set; }
        public DateTime RequestDate { get; set; }
        public DateTime? ResponseDate { get; set; }
        public RightRequestStatus Status { get; set; }
        public string RequestDetails { get; set; }
        public string Response { get; set; }
        public bool IsWithinTimeLimit { get; set; }
    }

    /// <summary>
    /// User Portable Data Model for GDPR Data Portability
    /// </summary>
    public class UserPortableData
    {
        public Guid UserId { get; set; }
        public DateTime ExportedAt { get; set; }
        public DataFormat Format { get; set; }
        public Dictionary<string, object> PersonalData { get; set; } = new Dictionary<string, object>();
        public List<ActivityRecord> ActivityData { get; set; } = new List<ActivityRecord>();
        public List<ConsentRecord> ConsentHistory { get; set; } = new List<ConsentRecord>();
        public string DigitalSignature { get; set; }
    }

    /// <summary>
    /// Activity Record for Data Portability
    /// </summary>
    public class ActivityRecord
    {
        public string Type { get; set; }
        public DateTime Timestamp { get; set; }
        public Dictionary<string, object> Details { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// GDPR Violation Model
    /// </summary>
    public class GDPRViolation
    {
        public Guid ViolationId { get; set; } = Guid.NewGuid();
        public GDPRViolationType ViolationType { get; set; }
        public ViolationSeverity Severity { get; set; }
        public DateTime DetectedAt { get; set; }
        public string Description { get; set; }
        public string AffectedData { get; set; }
        public string RecommendedAction { get; set; }
        public bool RequiresNotification { get; set; }
    }

    /// <summary>
    /// Compliance Recommendation Model
    /// </summary>
    public class ComplianceRecommendation
    {
        public Guid RecommendationId { get; set; } = Guid.NewGuid();
        public string Title { get; set; }
        public string Description { get; set; }
        public RecommendationPriority Priority { get; set; }
        public RecommendationCategory Category { get; set; }
        public string ActionRequired { get; set; }
        public DateTime DueDate { get; set; }
        public string Owner { get; set; }
        public RecommendationStatus Status { get; set; }
    }

    /// <summary>
    /// Date Range Model
    /// </summary>
    public class DateRange
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public DateRange() { }
        
        public DateRange(DateTime startDate, DateTime endDate)
        {
            StartDate = startDate;
            EndDate = endDate;
        }
    }

    #region Enums

    public enum ComplianceStatus
    {
        Compliant = 0,
        PartiallyCompliant = 1,
        NonCompliant = 2,
        Unknown = 3
    }

    public enum DataProcessingType
    {
        Collection = 0,
        Processing = 1,
        Sharing = 2,
        Deletion = 3,
        Storage = 4,
        Analysis = 5
    }

    public enum ConsentType
    {
        DataProcessing = 0,
        Marketing = 1,
        Analytics = 2,
        Sharing = 3,
        Profiling = 4
    }

    public enum GDPRRightType
    {
        Access = 0,          // Article 15
        Rectification = 1,   // Article 16
        Erasure = 2,         // Article 17 (Right to be forgotten)
        Portability = 3,     // Article 20
        Restriction = 4,     // Article 18
        Objection = 5        // Article 21
    }

    public enum RightRequestStatus
    {
        Pending = 0,
        InProgress = 1,
        Completed = 2,
        Rejected = 3,
        PartiallyCompleted = 4
    }

    public enum DataFormat
    {
        JSON = 0,
        XML = 1,
        CSV = 2,
        PDF = 3
    }

    public enum GDPRViolationType
    {
        ExcessiveDataCollection = 0,
        UnauthorizedProcessing = 1,
        MissingConsent = 2,
        DataRetentionViolation = 3,
        UnauthorizedSharing = 4,
        InsecureTransfer = 5,
        RightNotRespected = 6
    }

    public enum ViolationSeverity
    {
        Low = 0,
        Medium = 1,
        High = 2,
        Critical = 3
    }

    public enum RecommendationPriority
    {
        None = 0,
        Low = 1,
        Medium = 2,
        High = 3,
        Critical = 4
    }

    public enum RecommendationCategory
    {
        Security = 0,
        Compliance = 1,
        Process = 2,
        Technical = 3,
        Training = 4
    }

    public enum RecommendationStatus
    {
        Open = 0,
        InProgress = 1,
        Completed = 2,
        Deferred = 3,
        Rejected = 4
    }

    public enum SecurityIncidentType
    {
        UnauthorizedAccess = 0,
        DataBreach = 1,
        PermissionEscalation = 2,
        SuspiciousActivity = 3,
        PolicyViolation = 4
    }

    public enum IncidentStatus
    {
        Open = 0,
        Investigating = 1,
        Resolved = 2,
        Closed = 3
    }

    public enum GDPRComplianceStatus
    {
        Compliant = 0,
        MinorIssues = 1,
        MajorIssues = 2,
        NonCompliant = 3
    }

    #endregion
}