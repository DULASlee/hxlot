using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartAbp.Application.Permissions.Auditing.Models;
using SmartAbp.Application.Permissions.Compliance.Models;

namespace SmartAbp.Application.Permissions.Compliance.Services
{
    /// <summary>
    /// Interface for SOX Compliance Report Generator
    /// Stage 5.2 - Enterprise Permission Management System
    /// </summary>
    public interface ISOXComplianceReportGenerator
    {
        Task<SOXComplianceReport> GenerateSOXReportAsync(DateTime startDate, DateTime endDate, Guid? tenantId = null);
        Task<List<AccessControlChange>> AnalyzeAccessControlChangesAsync(IEnumerable<PermissionAuditLog> auditLogs);
        Task<List<PrivilegedUserAccess>> AnalyzePrivilegedUserAccessAsync(IEnumerable<PermissionAuditLog> auditLogs);
        Task<List<DataAccessPattern>> AnalyzeDataAccessPatternsAsync(IEnumerable<PermissionAuditLog> auditLogs);
        Task<List<SecurityIncident>> AnalyzeSecurityIncidentsAsync(IEnumerable<PermissionAuditLog> auditLogs);
        Task<ComplianceStatus> EvaluateSOXComplianceAsync(IEnumerable<PermissionAuditLog> auditLogs);
        Task<List<ComplianceRecommendation>> GenerateSOXRecommendationsAsync(IEnumerable<PermissionAuditLog> auditLogs);
    }

    /// <summary>
    /// Interface for GDPR Data Report Generator
    /// Provides comprehensive data processing and rights management reporting
    /// </summary>
    public interface IGDPRDataReportGenerator
    {
        Task<GDPRDataReport> GenerateGDPRReportAsync(Guid userId);
        Task<UserPortableData> GenerateDataPortabilityReportAsync(Guid userId);
        Task<List<GDPRViolation>> ValidateDataMinimizationAsync(Guid userId);
        Task<List<GDPRViolation>> ValidateConsentComplianceAsync(Guid userId);
        Task<List<GDPRViolation>> ValidateRetentionComplianceAsync(Guid userId);
        Task<GDPRComplianceStatus> EvaluateOverallComplianceAsync(Guid userId);
    }

    /// <summary>
    /// Interface for GDPR Data Service
    /// Provides access to user data for GDPR reporting
    /// </summary>
    public interface IGDPRDataService
    {
        Task<List<DataProcessingActivity>> GetUserDataProcessingActivitiesAsync(Guid userId);
        Task<List<DataAccessRecord>> GetUserDataAccessRecordsAsync(Guid userId);
        Task<List<DataSharingRecord>> GetUserDataSharingRecordsAsync(Guid userId);
        Task<List<DataDeletionRecord>> GetUserDataDeletionRecordsAsync(Guid userId);
        Task<List<ConsentRecord>> GetUserConsentRecordsAsync(Guid userId);
        Task<List<RightsExerciseRecord>> GetUserRightsExerciseRecordsAsync(Guid userId);
        Task<UserPortableData> GetPortableUserDataAsync(Guid userId);
        Task<bool> ValidateDataMinimizationAsync(List<DataProcessingActivity> activities);
        Task<bool> ValidateConsentValidityAsync(List<ConsentRecord> consents);
    }

    /// <summary>
    /// Interface for Compliance Report Service
    /// Coordinates multiple compliance report generators
    /// </summary>
    public interface IComplianceReportService
    {
        Task<SOXComplianceReport> GenerateSOXReportAsync(DateTime startDate, DateTime endDate, Guid? tenantId = null);
        Task<GDPRDataReport> GenerateGDPRReportAsync(Guid userId);
        Task<ComplianceReport> GenerateComprehensiveComplianceReportAsync(DateTime startDate, DateTime endDate, Guid? tenantId = null);
        Task<List<ComplianceRecommendation>> GetOverallComplianceRecommendationsAsync(Guid? tenantId = null);
        Task<ComplianceScore> CalculateComplianceScoreAsync(Guid? tenantId = null);
    }

    /// <summary>
    /// Interface for Compliance Validation Service
    /// Validates compliance against regulatory requirements
    /// </summary>
    public interface IComplianceValidationService
    {
        Task<ValidationResult> ValidateSOXComplianceAsync(SOXComplianceReport report);
        Task<ValidationResult> ValidateGDPRComplianceAsync(GDPRDataReport report);
        Task<List<ComplianceGap>> IdentifyComplianceGapsAsync(DateTime startDate, DateTime endDate, Guid? tenantId = null);
        Task<List<ComplianceRecommendation>> GenerateRemediationPlanAsync(List<ComplianceGap> gaps);
    }

    /// <summary>
    /// Interface for Regulatory Framework Service
    /// Manages different regulatory frameworks and their requirements
    /// </summary>
    public interface IRegulatoryFrameworkService
    {
        Task<List<RegulationRequirement>> GetSOXRequirementsAsync();
        Task<List<RegulationRequirement>> GetGDPRRequirementsAsync();
        Task<bool> IsComplianceRequirementMetAsync(string requirementId, object evidence);
        Task<List<string>> GetApplicableRegulationsAsync(Guid? tenantId = null);
        Task<RegulationFramework> GetRegulationFrameworkAsync(string regulationCode);
    }
}

namespace SmartAbp.Application.Permissions.Compliance.Models
{
    /// <summary>
    /// Comprehensive Compliance Report Model
    /// </summary>
    public class ComplianceReport
    {
        public Guid ReportId { get; set; } = Guid.NewGuid();
        public DateTime GeneratedAt { get; set; }
        public DateRange ReportPeriod { get; set; }
        public Guid? TenantId { get; set; }

        // Individual Compliance Reports
        public SOXComplianceReport SOXReport { get; set; }
        public GDPRDataReport GDPRReport { get; set; }

        // Overall Compliance Assessment
        public ComplianceScore OverallScore { get; set; }
        public List<ComplianceGap> IdentifiedGaps { get; set; } = new List<ComplianceGap>();
        public List<ComplianceRecommendation> ConsolidatedRecommendations { get; set; } = new List<ComplianceRecommendation>();

        // Executive Summary
        public string ExecutiveSummary { get; set; }
        public List<string> KeyFindings { get; set; } = new List<string>();
        public ComplianceStatus OverallStatus { get; set; }
    }

    /// <summary>
    /// Compliance Score Model
    /// </summary>
    public class ComplianceScore
    {
        public double OverallScore { get; set; }
        public double SOXScore { get; set; }
        public double GDPRScore { get; set; }
        public DateTime CalculatedAt { get; set; }
        public string ScoreBreakdown { get; set; }
        public ComplianceGrade Grade { get; set; }
    }

    /// <summary>
    /// Compliance Gap Model
    /// </summary>
    public class ComplianceGap
    {
        public Guid GapId { get; set; } = Guid.NewGuid();
        public string RegulationCode { get; set; }
        public string RequirementId { get; set; }
        public string Description { get; set; }
        public GapSeverity Severity { get; set; }
        public DateTime IdentifiedAt { get; set; }
        public string Impact { get; set; }
        public List<string> Evidence { get; set; } = new List<string>();
        public string RecommendedAction { get; set; }
        public DateTime TargetResolutionDate { get; set; }
    }

    /// <summary>
    /// Validation Result Model
    /// </summary>
    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<ValidationError> Errors { get; set; } = new List<ValidationError>();
        public List<ValidationWarning> Warnings { get; set; } = new List<ValidationWarning>();
        public double CompliancePercentage { get; set; }
        public DateTime ValidatedAt { get; set; }
    }

    /// <summary>
    /// Validation Error Model
    /// </summary>
    public class ValidationError
    {
        public string ErrorCode { get; set; }
        public string Description { get; set; }
        public ErrorSeverity Severity { get; set; }
        public string RequirementId { get; set; }
        public string RecommendedAction { get; set; }
    }

    /// <summary>
    /// Validation Warning Model
    /// </summary>
    public class ValidationWarning
    {
        public string WarningCode { get; set; }
        public string Description { get; set; }
        public string RequirementId { get; set; }
        public string Recommendation { get; set; }
    }

    /// <summary>
    /// Regulation Requirement Model
    /// </summary>
    public class RegulationRequirement
    {
        public string RequirementId { get; set; }
        public string RegulationCode { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public RequirementType Type { get; set; }
        public bool IsMandatory { get; set; }
        public List<string> EvidenceRequired { get; set; } = new List<string>();
        public string ValidationCriteria { get; set; }
    }

    /// <summary>
    /// Regulation Framework Model
    /// </summary>
    public class RegulationFramework
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Jurisdiction { get; set; }
        public DateTime EffectiveDate { get; set; }
        public List<RegulationRequirement> Requirements { get; set; } = new List<RegulationRequirement>();
        public string Version { get; set; }
    }

    #region Additional Enums

    public enum ComplianceGrade
    {
        A = 0,  // Excellent (95-100%)
        B = 1,  // Good (85-94%)
        C = 2,  // Satisfactory (75-84%)
        D = 3,  // Needs Improvement (65-74%)
        F = 4   // Failing (<65%)
    }

    public enum GapSeverity
    {
        Low = 0,
        Medium = 1,
        High = 2,
        Critical = 3
    }

    public enum ErrorSeverity
    {
        Info = 0,
        Warning = 1,
        Error = 2,
        Critical = 3
    }

    public enum RequirementType
    {
        Technical = 0,
        Procedural = 1,
        Documentation = 2,
        Training = 3,
        Monitoring = 4
    }

    #endregion
}