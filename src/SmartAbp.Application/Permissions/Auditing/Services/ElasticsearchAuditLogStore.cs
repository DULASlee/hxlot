using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Nest;
using SmartAbp.Application.Permissions.Auditing.Models;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EventBus.Local;

namespace SmartAbp.Application.Permissions.Auditing.Services
{
    /// <summary>
    /// Elasticsearch Audit Log Store Implementation
    /// Stage 5.1 - Enterprise Permission Management System
    /// Provides high-performance audit log storage with real-time risk analysis
    /// </summary>
    public class ElasticsearchAuditLogStore : IAuditLogStore, ITransientDependency
    {
        private readonly IElasticClient _elasticClient;
        private readonly ILogger<ElasticsearchAuditLogStore> _logger;
        private readonly IRiskAnalysisService _riskAnalysisService;
        private readonly IGeoLocationService _geoLocationService;
        private readonly ILocalEventBus _eventBus;

        // Injectable services for testing
        private IUserService _userService;
        private ISessionService _sessionService;
        private IPermissionContextService _permissionContextService;
        private IRealTimeRiskAlertService _alertService;

        public ElasticsearchAuditLogStore(
            IElasticClient elasticClient,
            ILogger<ElasticsearchAuditLogStore> logger,
            IRiskAnalysisService riskAnalysisService,
            IGeoLocationService geoLocationService)
        {
            _elasticClient = elasticClient;
            _logger = logger;
            _riskAnalysisService = riskAnalysisService;
            _geoLocationService = geoLocationService;
        }

        /// <summary>
        /// Saves audit log with enrichment and real-time risk analysis
        /// Performance Target: <10ms per audit log
        /// </summary>
        public async Task SaveAuditLogAsync(PermissionAuditLog auditLog)
        {
            try
            {
                _logger.LogDebug("Saving audit log for user {UserId}, action {Action}", 
                    auditLog.UserId, auditLog.Action);

                // 1. Enrich audit log information
                var enrichedLog = await EnrichAuditLogAsync(auditLog);

                // 2. Calculate risk level
                enrichedLog.RiskLevel = await _riskAnalysisService.CalculateRiskLevelAsync(enrichedLog);
                enrichedLog.RiskScore = CalculateRiskScore(enrichedLog);

                // 3. Get geographical location information
                if (!string.IsNullOrEmpty(enrichedLog.ClientIP))
                {
                    enrichedLog.GeoLocation = await _geoLocationService.GetGeoLocationAsync(enrichedLog.ClientIP);
                }

                // 4. Save to Elasticsearch with monthly index pattern
                var indexName = $"permission-audit-{DateTime.UtcNow:yyyy-MM}";
                var response = await _elasticClient.IndexAsync(enrichedLog, idx => idx.Index(indexName));

                if (!response.IsValid)
                {
                    _logger.LogError("Failed to index audit log: {Error}", response.OriginalException?.Message);
                    throw new Exception($"Failed to index audit log: {response.OriginalException?.Message}");
                }

                // 5. Process real-time risk analysis
                await ProcessRealTimeRiskAnalysis(enrichedLog);

                _logger.LogDebug("Successfully saved audit log {AuditLogId} with risk level {RiskLevel}", 
                    enrichedLog.Id, enrichedLog.RiskLevel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "审计日志保存失败: {AuditLog}", auditLog);
                throw;
            }
        }

        /// <summary>
        /// Enriches audit log with additional context information
        /// </summary>
        public async Task<PermissionAuditLog> EnrichAuditLogAsync(PermissionAuditLog auditLog)
        {
            try
            {
                // User information enrichment
                if (_userService != null)
                {
                    auditLog.UserInfo = await _userService.GetUserInfoAsync(auditLog.UserId);
                }

                // Session information enrichment
                if (_sessionService != null && !string.IsNullOrEmpty(auditLog.SessionId))
                {
                    auditLog.SessionInfo = await _sessionService.GetSessionInfoAsync(auditLog.SessionId);
                }

                // Permission context enrichment
                if (_permissionContextService != null)
                {
                    auditLog.PermissionContext = await _permissionContextService.GetPermissionContextAsync(
                        auditLog.UserId, auditLog.Permission, auditLog.Resource);
                }

                // Add correlation ID if not present
                if (string.IsNullOrEmpty(auditLog.CorrelationId))
                {
                    auditLog.CorrelationId = Guid.NewGuid().ToString();
                }

                return auditLog;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to enrich audit log, using original log");
                return auditLog;
            }
        }

        /// <summary>
        /// Processes real-time risk analysis and alerts
        /// </summary>
        public async Task ProcessRealTimeRiskAnalysis(PermissionAuditLog auditLog)
        {
            try
            {
                // Trigger alert for high-risk activities
                if (auditLog.RiskLevel >= RiskLevel.High && _alertService != null)
                {
                    await _alertService.ProcessRiskAlertAsync(auditLog);
                }

                // Publish audit event for other subscribers
                if (_eventBus != null)
                {
                    await _eventBus.PublishAsync(new PermissionAuditEvent
                    {
                        AuditLog = auditLog,
                        EventTime = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to process real-time risk analysis for audit log {AuditLogId}", 
                    auditLog.Id);
                // Don't throw - this shouldn't block the main audit flow
            }
        }

        /// <summary>
        /// Retrieves audit logs for a date range
        /// </summary>
        public async Task<PermissionAuditLog[]> GetAuditLogsAsync(DateTime startDate, DateTime endDate, Guid? userId = null)
        {
            try
            {
                var searchRequest = new SearchRequest<PermissionAuditLog>
                {
                    Query = new BoolQuery
                    {
                        Must = new QueryContainer[]
                        {
                            new DateRangeQuery
                            {
                                Field = Infer.Field<PermissionAuditLog>(f => f.Timestamp),
                                GreaterThanOrEqualTo = startDate,
                                LessThanOrEqualTo = endDate
                            }
                        }.Concat(userId.HasValue ? new QueryContainer[]
                        {
                            new TermQuery
                            {
                                Field = Infer.Field<PermissionAuditLog>(f => f.UserId),
                                Value = userId.Value
                            }
                        } : Array.Empty<QueryContainer>()).ToArray()
                    },
                    Sort = new List<ISort>
                    {
                        new FieldSort { Field = Infer.Field<PermissionAuditLog>(f => f.Timestamp), Order = SortOrder.Descending }
                    },
                    Size = 10000 // Configure based on needs
                };

                var response = await _elasticClient.SearchAsync<PermissionAuditLog>(searchRequest);
                
                if (!response.IsValid)
                {
                    _logger.LogError("Failed to retrieve audit logs: {Error}", response.OriginalException?.Message);
                    return Array.Empty<PermissionAuditLog>();
                }

                return response.Documents.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving audit logs for date range {StartDate} to {EndDate}", 
                    startDate, endDate);
                return Array.Empty<PermissionAuditLog>();
            }
        }

        /// <summary>
        /// Searches audit logs using query string
        /// </summary>
        public async Task<PermissionAuditLog[]> SearchAuditLogsAsync(string query, int skip = 0, int take = 50)
        {
            try
            {
                var searchRequest = new SearchRequest<PermissionAuditLog>
                {
                    Query = new QueryStringQuery
                    {
                        Query = query,
                        DefaultOperator = Operator.And
                    },
                    From = skip,
                    Size = take,
                    Sort = new List<ISort>
                    {
                        new FieldSort { Field = Infer.Field<PermissionAuditLog>(f => f.Timestamp), Order = SortOrder.Descending }
                    }
                };

                var response = await _elasticClient.SearchAsync<PermissionAuditLog>(searchRequest);
                
                if (!response.IsValid)
                {
                    _logger.LogError("Failed to search audit logs: {Error}", response.OriginalException?.Message);
                    return Array.Empty<PermissionAuditLog>();
                }

                return response.Documents.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching audit logs with query: {Query}", query);
                return Array.Empty<PermissionAuditLog>();
            }
        }

        /// <summary>
        /// Deletes audit logs older than specified date
        /// </summary>
        public async Task DeleteAuditLogsAsync(DateTime beforeDate)
        {
            try
            {
                var deleteRequest = new DeleteByQueryRequest<PermissionAuditLog>
                {
                    Query = new DateRangeQuery
                    {
                        Field = Infer.Field<PermissionAuditLog>(f => f.Timestamp),
                        LessThan = beforeDate
                    }
                };

                var response = await _elasticClient.DeleteByQueryAsync(deleteRequest);
                
                if (!response.IsValid)
                {
                    _logger.LogError("Failed to delete audit logs: {Error}", response.OriginalException?.Message);
                    throw new Exception($"Failed to delete audit logs: {response.OriginalException?.Message}");
                }

                _logger.LogInformation("Deleted {Count} audit logs older than {Date}", 
                    response.Deleted, beforeDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting audit logs before date: {BeforeDate}", beforeDate);
                throw;
            }
        }

        /// <summary>
        /// Calculates numeric risk score from risk factors
        /// </summary>
        private int CalculateRiskScore(PermissionAuditLog auditLog)
        {
            var score = 0;

            // Time-based risk factor
            if (_riskAnalysisService.IsOutsideBusinessHours(auditLog.Timestamp))
                score += 20;

            // Permission sensitivity risk factor  
            if (auditLog.PermissionContext?.IsSensitive == true)
                score += 25;

            // Result-based risk factor
            if (auditLog.Result == AuditResult.Failed)
                score += 30;

            // Add other risk factors as needed

            return score;
        }

        /// <summary>
        /// Converts risk score to risk level enum
        /// </summary>
        public static RiskLevel GetRiskLevelFromScore(int score)
        {
            return score switch
            {
                < 30 => RiskLevel.Low,
                < 60 => RiskLevel.Medium,
                < 80 => RiskLevel.High,
                _ => RiskLevel.Critical
            };
        }

        #region Test Support Methods

        public void SetUserService(IUserService userService)
        {
            _userService = userService;
        }

        public void SetSessionService(ISessionService sessionService)
        {
            _sessionService = sessionService;
        }

        public void SetPermissionContextService(IPermissionContextService permissionContextService)
        {
            _permissionContextService = permissionContextService;
        }

        public void SetAlertService(IRealTimeRiskAlertService alertService)
        {
            _alertService = alertService;
        }

        #endregion
    }

    /// <summary>
    /// Event published when audit log is processed
    /// </summary>
    public class PermissionAuditEvent
    {
        public PermissionAuditLog AuditLog { get; set; }
        public DateTime EventTime { get; set; }
    }
}