using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Nest;
using SmartAbp.Application.Permissions.Auditing.Models;
using SmartAbp.Application.Permissions.Compliance.Models;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Application.Permissions.Compliance.Services
{
    /// <summary>
    /// SOX Compliance Report Generator Implementation
    /// Stage 5.2 - Enterprise Permission Management System
    /// Provides comprehensive Sarbanes-Oxley compliance reporting and analysis
    /// </summary>
    public class SOXComplianceReportGenerator : ISOXComplianceReportGenerator, ITransientDependency
    {
        private readonly IElasticClient _elasticClient;
        private readonly ILogger<SOXComplianceReportGenerator> _logger;

        public SOXComplianceReportGenerator(
            IElasticClient elasticClient,
            ILogger<SOXComplianceReportGenerator> logger)
        {
            _elasticClient = elasticClient;
            _logger = logger;
        }

        /// <summary>
        /// Generates comprehensive SOX compliance report for specified period
        /// </summary>
        public async Task<SOXComplianceReport> GenerateSOXReportAsync(DateTime startDate, DateTime endDate, Guid? tenantId = null)
        {
            try
            {
                _logger.LogInformation("Generating SOX compliance report for period {StartDate} to {EndDate}, Tenant: {TenantId}", 
                    startDate, endDate, tenantId);

                // Build Elasticsearch query for audit data
                var query = BuildSOXQueryAsync(startDate, endDate, tenantId);
                var auditData = await _elasticClient.SearchAsync<PermissionAuditLog>(query);

                if (!auditData.IsValid)
                {
                    _logger.LogError("Failed to retrieve audit data: {Error}", auditData.OriginalException?.Message);
                    throw new Exception($"Failed to retrieve audit data: {auditData.OriginalException?.Message}");
                }

                var auditLogs = auditData.Documents.ToList();

                // Generate comprehensive SOX report
                var report = new SOXComplianceReport
                {
                    ReportPeriod = new DateRange(startDate, endDate),
                    TenantId = tenantId,
                    GeneratedAt = DateTime.UtcNow,

                    // Core SOX analysis components
                    AccessControlChanges = await AnalyzeAccessControlChangesAsync(auditLogs),
                    PrivilegedUserAccess = await AnalyzePrivilegedUserAccessAsync(auditLogs),
                    DataAccessPatterns = await AnalyzeDataAccessPatternsAsync(auditLogs),
                    SecurityIncidents = await AnalyzeSecurityIncidentsAsync(auditLogs),

                    // Compliance evaluation
                    ComplianceStatus = await EvaluateSOXComplianceAsync(auditLogs),
                    Recommendations = await GenerateSOXRecommendationsAsync(auditLogs),

                    // SOX metrics calculation
                    Metrics = CalculateSOXMetrics(auditLogs)
                };

                _logger.LogInformation("SOX compliance report generated successfully. Status: {Status}, Recommendations: {Count}", 
                    report.ComplianceStatus, report.Recommendations.Count);

                return report;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating SOX compliance report");
                throw;
            }
        }

        /// <summary>
        /// Analyzes access control changes for SOX compliance
        /// </summary>
        public async Task<List<AccessControlChange>> AnalyzeAccessControlChangesAsync(IEnumerable<PermissionAuditLog> auditLogs)
        {
            try
            {
                var changes = auditLogs
                    .Where(log => log.Action.StartsWith("Permission.") || log.Action.StartsWith("Role."))
                    .Select(log => new AccessControlChange
                    {
                        Timestamp = log.Timestamp,
                        UserId = log.UserId,
                        Action = log.Action,
                        Target = log.Resource ?? "Unknown",
                        ApproverId = log.ApprovalInfo?.ApproverId,
                        BusinessJustification = log.ApprovalInfo?.BusinessJustification ?? "Not provided",
                        RiskLevel = log.RiskLevel,
                        ChangeType = DetermineChangeType(log.Action),
                        IsApprovalRequired = IsApprovalRequired(log.Action),
                        ApprovalStatus = GetApprovalStatus(log.ApprovalInfo)
                    })
                    .OrderByDescending(change => change.Timestamp)
                    .ToList();

                _logger.LogDebug("Analyzed {Count} access control changes", changes.Count);
                return changes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing access control changes");
                return new List<AccessControlChange>();
            }
        }

        /// <summary>
        /// Analyzes privileged user access patterns
        /// </summary>
        public async Task<List<PrivilegedUserAccess>> AnalyzePrivilegedUserAccessAsync(IEnumerable<PermissionAuditLog> auditLogs)
        {
            try
            {
                var privilegedUsers = auditLogs
                    .Where(log => IsPrivilegedUser(log.UserInfo))
                    .GroupBy(log => log.UserId)
                    .Select(group => new PrivilegedUserAccess
                    {
                        UserId = group.Key,
                        UserName = group.First().UserInfo?.DisplayName ?? "Unknown",
                        UserRoles = group.First().UserInfo?.Roles ?? new List<string>(),
                        AccessCount = group.Count(),
                        LastAccessTime = group.Max(log => log.Timestamp),
                        AccessedResources = group.Select(log => log.Resource).Distinct().ToList(),
                        HighestRiskLevel = group.Max(log => log.RiskLevel),
                        RequiresReview = group.Any(log => log.RiskLevel >= RiskLevel.High)
                    })
                    .OrderByDescending(user => user.HighestRiskLevel)
                    .ThenByDescending(user => user.AccessCount)
                    .ToList();

                _logger.LogDebug("Analyzed {Count} privileged users", privilegedUsers.Count);
                return privilegedUsers;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing privileged user access");
                return new List<PrivilegedUserAccess>();
            }
        }

        /// <summary>
        /// Analyzes data access patterns for anomalies
        /// </summary>
        public async Task<List<DataAccessPattern>> AnalyzeDataAccessPatternsAsync(IEnumerable<PermissionAuditLog> auditLogs)
        {
            try
            {
                var patterns = auditLogs
                    .Where(log => !string.IsNullOrEmpty(log.Resource))
                    .GroupBy(log => GetDataTypeFromResource(log.Resource))
                    .Select(group => new DataAccessPattern
                    {
                        DataType = group.Key,
                        AccessCount = group.Count(),
                        UniqueUsers = group.Select(log => log.UserId).Distinct().ToList(),
                        PeakAccessTime = group.GroupBy(log => log.Timestamp.Hour)
                                            .OrderByDescending(hourGroup => hourGroup.Count())
                                            .First().Key.ToString() + ":00",
                        IsUnusualPattern = IsUnusualAccessPattern(group),
                        PatternDescription = GeneratePatternDescription(group)
                    })
                    .ToList();

                _logger.LogDebug("Analyzed {Count} data access patterns", patterns.Count);
                return patterns;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing data access patterns");
                return new List<DataAccessPattern>();
            }
        }

        /// <summary>
        /// Analyzes security incidents from audit logs
        /// </summary>
        public async Task<List<SecurityIncident>> AnalyzeSecurityIncidentsAsync(IEnumerable<PermissionAuditLog> auditLogs)
        {
            try
            {
                var incidents = auditLogs
                    .Where(log => log.RiskLevel >= RiskLevel.High || log.Result == AuditResult.Failed)
                    .Select(log => new SecurityIncident
                    {
                        IncidentId = Guid.NewGuid(),
                        IncidentTime = log.Timestamp,
                        Type = DetermineIncidentType(log),
                        Severity = log.RiskLevel,
                        AffectedUserId = log.UserId,
                        Description = GenerateIncidentDescription(log),
                        Status = IncidentStatus.Open,
                        ResolvedAt = null,
                        Resolution = null
                    })
                    .OrderByDescending(incident => incident.Severity)
                    .ThenByDescending(incident => incident.IncidentTime)
                    .ToList();

                _logger.LogDebug("Identified {Count} security incidents", incidents.Count);
                return incidents;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing security incidents");
                return new List<SecurityIncident>();
            }
        }

        /// <summary>
        /// Evaluates overall SOX compliance status
        /// </summary>
        public async Task<ComplianceStatus> EvaluateSOXComplianceAsync(IEnumerable<PermissionAuditLog> auditLogs)
        {
            try
            {
                var logs = auditLogs.ToList();
                var complianceScore = 0;
                var maxScore = 100;

                // Access control segregation (25 points)
                var accessControlChanges = await AnalyzeAccessControlChangesAsync(logs);
                var unauthorizedChanges = accessControlChanges.Count(c => string.IsNullOrEmpty(c.BusinessJustification));
                complianceScore += Math.Max(0, 25 - (unauthorizedChanges * 5));

                // Privileged access monitoring (25 points)
                var privilegedAccess = await AnalyzePrivilegedUserAccessAsync(logs);
                var unmonitoredPrivilegedAccess = privilegedAccess.Count(p => !p.RequiresReview);
                complianceScore += Math.Max(0, 25 - (unmonitoredPrivilegedAccess * 3));

                // Security incident response (25 points)
                var securityIncidents = await AnalyzeSecurityIncidentsAsync(logs);
                var unresolvedIncidents = securityIncidents.Count(i => i.Status == IncidentStatus.Open);
                complianceScore += Math.Max(0, 25 - (unresolvedIncidents * 5));

                // Data access governance (25 points)
                var dataPatterns = await AnalyzeDataAccessPatternsAsync(logs);
                var unusualPatterns = dataPatterns.Count(p => p.IsUnusualPattern);
                complianceScore += Math.Max(0, 25 - (unusualPatterns * 5));

                // Determine compliance status based on score
                var compliancePercentage = (double)complianceScore / maxScore * 100;

                return compliancePercentage switch
                {
                    >= 90 => ComplianceStatus.Compliant,
                    >= 70 => ComplianceStatus.PartiallyCompliant,
                    _ => ComplianceStatus.NonCompliant
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error evaluating SOX compliance");
                return ComplianceStatus.Unknown;
            }
        }

        /// <summary>
        /// Generates actionable SOX compliance recommendations
        /// </summary>
        public async Task<List<ComplianceRecommendation>> GenerateSOXRecommendationsAsync(IEnumerable<PermissionAuditLog> auditLogs)
        {
            var recommendations = new List<ComplianceRecommendation>();

            try
            {
                var logs = auditLogs.ToList();

                // Analyze for recommendation opportunities
                var accessControlChanges = await AnalyzeAccessControlChangesAsync(logs);
                var privilegedAccess = await AnalyzePrivilegedUserAccessAsync(logs);
                var securityIncidents = await AnalyzeSecurityIncidentsAsync(logs);

                // Access control recommendations
                if (accessControlChanges.Any(c => string.IsNullOrEmpty(c.BusinessJustification)))
                {
                    recommendations.Add(new ComplianceRecommendation
                    {
                        Title = "Implement Mandatory Business Justification",
                        Description = "All access control changes must include proper business justification",
                        Priority = RecommendationPriority.High,
                        Category = RecommendationCategory.Process,
                        ActionRequired = "Configure system to require business justification for all access changes",
                        DueDate = DateTime.UtcNow.AddDays(30),
                        Owner = "IT Security Team",
                        Status = RecommendationStatus.Open
                    });
                }

                // Privileged access recommendations
                if (privilegedAccess.Any(p => p.RequiresReview))
                {
                    recommendations.Add(new ComplianceRecommendation
                    {
                        Title = "Enhanced Privileged User Monitoring",
                        Description = "Implement additional monitoring for high-risk privileged user activities",
                        Priority = RecommendationPriority.High,
                        Category = RecommendationCategory.Security,
                        ActionRequired = "Deploy advanced monitoring tools and establish review procedures",
                        DueDate = DateTime.UtcNow.AddDays(45),
                        Owner = "Security Operations Center",
                        Status = RecommendationStatus.Open
                    });
                }

                // Security incident recommendations
                if (securityIncidents.Any(i => i.Status == IncidentStatus.Open))
                {
                    recommendations.Add(new ComplianceRecommendation
                    {
                        Title = "Accelerate Incident Response",
                        Description = "Resolve open security incidents to maintain SOX compliance",
                        Priority = RecommendationPriority.Critical,
                        Category = RecommendationCategory.Security,
                        ActionRequired = "Investigate and resolve all open security incidents",
                        DueDate = DateTime.UtcNow.AddDays(7),
                        Owner = "Incident Response Team",
                        Status = RecommendationStatus.Open
                    });
                }

                _logger.LogDebug("Generated {Count} SOX compliance recommendations", recommendations.Count);
                return recommendations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating SOX recommendations");
                return recommendations;
            }
        }

        #region Private Helper Methods

        private ISearchRequest BuildSOXQueryAsync(DateTime startDate, DateTime endDate, Guid? tenantId)
        {
            var mustQueries = new List<QueryContainer>
            {
                new DateRangeQuery
                {
                    Field = Infer.Field<PermissionAuditLog>(f => f.Timestamp),
                    GreaterThanOrEqualTo = startDate,
                    LessThanOrEqualTo = endDate
                }
            };

            if (tenantId.HasValue)
            {
                mustQueries.Add(new TermQuery
                {
                    Field = Infer.Field<PermissionAuditLog>(f => f.TenantId),
                    Value = tenantId.Value.ToString()
                });
            }

            return new SearchRequest<PermissionAuditLog>
            {
                Query = new BoolQuery { Must = mustQueries },
                Size = 10000,
                Sort = new List<ISort>
                {
                    new FieldSort { Field = Infer.Field<PermissionAuditLog>(f => f.Timestamp), Order = SortOrder.Descending }
                }
            };
        }

        private SOXMetrics CalculateSOXMetrics(List<PermissionAuditLog> auditLogs)
        {
            return new SOXMetrics
            {
                TotalAccessAttempts = auditLogs.Count,
                FailedAccessAttempts = auditLogs.Count(log => log.Result == AuditResult.Failed),
                PrivilegedUserAccess = auditLogs.Count(log => IsPrivilegedUser(log.UserInfo)),
                AccessControlChanges = auditLogs.Count(log => log.Action.StartsWith("Permission.") || log.Action.StartsWith("Role.")),
                SecurityIncidents = auditLogs.Count(log => log.RiskLevel >= RiskLevel.High),
                ComplianceScore = CalculateComplianceScore(auditLogs),
                AverageResponseTime = TimeSpan.FromMilliseconds(auditLogs.Any() ? auditLogs.Average(log => 50) : 0) // Placeholder
            };
        }

        private double CalculateComplianceScore(List<PermissionAuditLog> auditLogs)
        {
            if (!auditLogs.Any()) return 100.0;

            var totalEvents = auditLogs.Count;
            var riskEvents = auditLogs.Count(log => log.RiskLevel >= RiskLevel.Medium);
            var failedEvents = auditLogs.Count(log => log.Result == AuditResult.Failed);

            var riskScore = Math.Max(0, 100 - (riskEvents * 100.0 / totalEvents * 0.5));
            var failureScore = Math.Max(0, 100 - (failedEvents * 100.0 / totalEvents * 0.3));

            return (riskScore + failureScore) / 2;
        }

        private bool IsPrivilegedUser(UserInfo userInfo)
        {
            if (userInfo?.Roles == null) return false;
            
            var privilegedRoles = new[] { "Admin", "SuperUser", "SecurityAdmin", "SystemAdmin" };
            return userInfo.Roles.Any(role => privilegedRoles.Contains(role, StringComparer.OrdinalIgnoreCase));
        }

        private string DetermineChangeType(string action)
        {
            return action switch
            {
                var a when a.Contains("Grant") => "Grant",
                var a when a.Contains("Revoke") => "Revoke",
                var a when a.Contains("Assign") => "Assignment",
                var a when a.Contains("Remove") => "Removal",
                _ => "Other"
            };
        }

        private bool IsApprovalRequired(string action)
        {
            var approvalRequiredActions = new[] { "Permission.Grant", "Role.Assign", "Permission.Escalate" };
            return approvalRequiredActions.Contains(action);
        }

        private string GetApprovalStatus(ApprovalInfo approvalInfo)
        {
            if (approvalInfo == null) return "Not Required";
            if (approvalInfo.ApproverId.HasValue) return "Approved";
            return "Pending";
        }

        private string GetDataTypeFromResource(string resource)
        {
            if (string.IsNullOrEmpty(resource)) return "Unknown";
            
            if (resource.Contains("User", StringComparison.OrdinalIgnoreCase)) return "User Data";
            if (resource.Contains("Financial", StringComparison.OrdinalIgnoreCase)) return "Financial Data";
            if (resource.Contains("HR", StringComparison.OrdinalIgnoreCase)) return "HR Data";
            if (resource.Contains("Customer", StringComparison.OrdinalIgnoreCase)) return "Customer Data";
            
            return "System Data";
        }

        private bool IsUnusualAccessPattern(IGrouping<string, PermissionAuditLog> group)
        {
            var accessCount = group.Count();
            var uniqueUsers = group.Select(log => log.UserId).Distinct().Count();
            var offHoursAccess = group.Count(log => log.Timestamp.Hour < 8 || log.Timestamp.Hour > 18);

            // Consider unusual if high volume, few users, or significant off-hours access
            return accessCount > 100 && uniqueUsers < 5 || offHoursAccess > accessCount * 0.3;
        }

        private string GeneratePatternDescription(IGrouping<string, PermissionAuditLog> group)
        {
            var accessCount = group.Count();
            var uniqueUsers = group.Select(log => log.UserId).Distinct().Count();
            var peakHour = group.GroupBy(log => log.Timestamp.Hour)
                              .OrderByDescending(hourGroup => hourGroup.Count())
                              .First().Key;

            return $"{accessCount} accesses by {uniqueUsers} users, peak at {peakHour}:00";
        }

        private SecurityIncidentType DetermineIncidentType(PermissionAuditLog log)
        {
            if (log.Result == AuditResult.Failed) return SecurityIncidentType.UnauthorizedAccess;
            if (log.RiskLevel == RiskLevel.Critical) return SecurityIncidentType.SuspiciousActivity;
            if (log.Action.Contains("Escalate")) return SecurityIncidentType.PermissionEscalation;
            
            return SecurityIncidentType.PolicyViolation;
        }

        private string GenerateIncidentDescription(PermissionAuditLog log)
        {
            return $"{log.Action} by user {log.UserInfo?.DisplayName ?? log.UserId.ToString()} " +
                   $"on resource {log.Resource} with risk level {log.RiskLevel}";
        }

        #endregion
    }
}