using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartAbp.Application.Permissions.Auditing.Models;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Caching;

namespace SmartAbp.Application.Permissions.Auditing.Services
{
    /// <summary>
    /// Risk Analysis Service Implementation
    /// Stage 5.1 - Intelligent Risk Assessment for Audit Logs
    /// </summary>
    public class RiskAnalysisService : IRiskAnalysisService, ITransientDependency
    {
        private readonly ILogger<RiskAnalysisService> _logger;
        private readonly IDistributedCache<UserLocationCache> _locationCache;
        private readonly IDistributedCache<UserAccessPatternCache> _accessPatternCache;
        private readonly RiskAnalysisOptions _options;
        private readonly IAuditLogStore _auditLogStore;

        public RiskAnalysisService(
            ILogger<RiskAnalysisService> logger,
            IDistributedCache<UserLocationCache> locationCache,
            IDistributedCache<UserAccessPatternCache> accessPatternCache,
            IOptionsSnapshot<RiskAnalysisOptions> options,
            IAuditLogStore auditLogStore)
        {
            _logger = logger;
            _locationCache = locationCache;
            _accessPatternCache = accessPatternCache;
            _options = options.Value;
            _auditLogStore = auditLogStore;
        }

        /// <summary>
        /// Calculates comprehensive risk level for audit log
        /// </summary>
        public async Task<RiskLevel> CalculateRiskLevelAsync(PermissionAuditLog auditLog)
        {
            try
            {
                var riskScore = 0;

                // Time-based risk factor (20 points max)
                if (IsOutsideBusinessHours(auditLog.Timestamp))
                {
                    riskScore += 20;
                    _logger.LogDebug("Outside business hours risk factor applied: +20 points");
                }

                // Geographic location risk factor (30 points max)
                if (await IsUnusualLocationAsync(auditLog.UserId, auditLog.ClientIP))
                {
                    riskScore += 30;
                    _logger.LogDebug("Unusual location risk factor applied: +30 points");
                }

                // Permission sensitivity risk factor (25 points max)
                if (await IsSensitivePermissionAsync(auditLog.Permission))
                {
                    riskScore += 25;
                    _logger.LogDebug("Sensitive permission risk factor applied: +25 points");
                }

                // Access frequency risk factor (15 points max)
                if (await IsHighFrequencyAccessAsync(auditLog.UserId, auditLog.Permission))
                {
                    riskScore += 15;
                    _logger.LogDebug("High frequency access risk factor applied: +15 points");
                }

                // Failed attempts risk factor (50 points max)
                if (auditLog.Result == AuditResult.Failed)
                {
                    var recentFailures = await GetRecentFailuresAsync(auditLog.UserId);
                    var failurePoints = Math.Min(recentFailures * 10, 50);
                    riskScore += failurePoints;
                    _logger.LogDebug("Failed attempts risk factor applied: +{Points} points ({Failures} failures)", 
                        failurePoints, recentFailures);
                }

                // Device/session risk factors (10 points max)
                if (auditLog.SessionInfo != null)
                {
                    if (!auditLog.SessionInfo.IsSecureConnection)
                    {
                        riskScore += 5;
                        _logger.LogDebug("Insecure connection risk factor applied: +5 points");
                    }

                    if (IsUnusualDevice(auditLog.SessionInfo))
                    {
                        riskScore += 5;
                        _logger.LogDebug("Unusual device risk factor applied: +5 points");
                    }
                }

                // Convert score to risk level
                var riskLevel = GetRiskLevelFromScore(riskScore);

                _logger.LogInformation("Risk analysis completed for user {UserId}: Score={Score}, Level={Level}", 
                    auditLog.UserId, riskScore, riskLevel);

                return riskLevel;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating risk level for audit log {AuditLogId}", auditLog.Id);
                return RiskLevel.Medium; // Default to medium risk on error
            }
        }

        /// <summary>
        /// Checks if timestamp is outside business hours
        /// </summary>
        public bool IsOutsideBusinessHours(DateTime timestamp)
        {
            var localTime = timestamp.ToLocalTime();
            var businessStart = _options.BusinessHours.StartTime;
            var businessEnd = _options.BusinessHours.EndTime;

            // Check if weekend
            if (localTime.DayOfWeek == DayOfWeek.Saturday || localTime.DayOfWeek == DayOfWeek.Sunday)
            {
                return true;
            }

            // Check if outside business hours
            var timeOfDay = localTime.TimeOfDay;
            return timeOfDay < businessStart || timeOfDay > businessEnd;
        }

        /// <summary>
        /// Determines if access is from unusual location for user
        /// </summary>
        public async Task<bool> IsUnusualLocationAsync(Guid userId, string clientIP)
        {
            try
            {
                if (string.IsNullOrEmpty(clientIP))
                    return false;

                var cacheKey = $"user_locations:{userId}";
                var knownLocations = await _locationCache.GetAsync(cacheKey);

                if (knownLocations == null)
                {
                    // Initialize known locations from recent history
                    knownLocations = await BuildUserLocationHistory(userId);
                    await _locationCache.SetAsync(cacheKey, knownLocations, TimeSpan.FromHours(24));
                }

                // Check if current IP is in known locations
                var isKnownLocation = knownLocations.KnownIPs.Contains(clientIP) ||
                                    knownLocations.KnownCountries.Contains(GetCountryFromIP(clientIP));

                if (!isKnownLocation)
                {
                    _logger.LogWarning("Unusual location detected for user {UserId} from IP {ClientIP}", 
                        userId, clientIP);
                }

                return !isKnownLocation;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking unusual location for user {UserId}", userId);
                return false; // Default to no risk on error
            }
        }

        /// <summary>
        /// Checks if access pattern indicates high frequency (potential automation)
        /// </summary>
        public async Task<bool> IsHighFrequencyAccessAsync(Guid userId, string permission)
        {
            try
            {
                var cacheKey = $"access_pattern:{userId}:{permission}";
                var accessPattern = await _accessPatternCache.GetAsync(cacheKey);

                if (accessPattern == null)
                {
                    accessPattern = new UserAccessPatternCache
                    {
                        AccessCount = 1,
                        FirstAccess = DateTime.UtcNow,
                        LastAccess = DateTime.UtcNow
                    };
                }
                else
                {
                    accessPattern.AccessCount++;
                    accessPattern.LastAccess = DateTime.UtcNow;
                }

                await _accessPatternCache.SetAsync(cacheKey, accessPattern, TimeSpan.FromMinutes(30));

                // Check if access frequency exceeds threshold
                var timeWindow = TimeSpan.FromMinutes(30);
                var accessesInWindow = accessPattern.AccessCount;
                var threshold = _options.HighFrequencyThreshold;

                var isHighFrequency = accessesInWindow > threshold;

                if (isHighFrequency)
                {
                    _logger.LogWarning("High frequency access detected for user {UserId}, permission {Permission}: {Count} accesses", 
                        userId, permission, accessesInWindow);
                }

                return isHighFrequency;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking high frequency access for user {UserId}", userId);
                return false;
            }
        }

        /// <summary>
        /// Gets count of recent failed attempts for user
        /// </summary>
        public async Task<int> GetRecentFailuresAsync(Guid userId)
        {
            try
            {
                var since = DateTime.UtcNow.AddMinutes(-_options.FailureWindowMinutes);
                var recentLogs = await _auditLogStore.GetAuditLogsAsync(since, DateTime.UtcNow, userId);
                
                var failureCount = recentLogs.Count(log => log.Result == AuditResult.Failed);
                
                if (failureCount > 0)
                {
                    _logger.LogDebug("Found {Count} recent failures for user {UserId}", failureCount, userId);
                }

                return failureCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent failures for user {UserId}", userId);
                return 0;
            }
        }

        /// <summary>
        /// Checks if permission is classified as sensitive
        /// </summary>
        public async Task<bool> IsSensitivePermissionAsync(string permission)
        {
            try
            {
                if (string.IsNullOrEmpty(permission))
                    return false;

                // Check against sensitive permission patterns
                var sensitivePatterns = _options.SensitivePermissionPatterns;
                var isSensitive = sensitivePatterns.Any(pattern => 
                    permission.Contains(pattern, StringComparison.OrdinalIgnoreCase));

                if (isSensitive)
                {
                    _logger.LogDebug("Sensitive permission detected: {Permission}", permission);
                }

                return isSensitive;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking sensitive permission: {Permission}", permission);
                return false;
            }
        }

        #region Private Helper Methods

        private RiskLevel GetRiskLevelFromScore(int score)
        {
            return score switch
            {
                < 30 => RiskLevel.Low,
                < 60 => RiskLevel.Medium,
                < 80 => RiskLevel.High,
                _ => RiskLevel.Critical
            };
        }

        private async Task<UserLocationCache> BuildUserLocationHistory(Guid userId)
        {
            try
            {
                var since = DateTime.UtcNow.AddDays(-_options.LocationHistoryDays);
                var recentLogs = await _auditLogStore.GetAuditLogsAsync(since, DateTime.UtcNow, userId);

                var knownIPs = recentLogs
                    .Where(log => !string.IsNullOrEmpty(log.ClientIP))
                    .Select(log => log.ClientIP)
                    .Distinct()
                    .ToList();

                var knownCountries = recentLogs
                    .Where(log => log.GeoLocation?.Country != null)
                    .Select(log => log.GeoLocation.Country)
                    .Distinct()
                    .ToList();

                return new UserLocationCache
                {
                    KnownIPs = knownIPs,
                    KnownCountries = knownCountries
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error building location history for user {UserId}", userId);
                return new UserLocationCache(); // Return empty cache on error
            }
        }

        private string GetCountryFromIP(string ipAddress)
        {
            // Simplified country detection - in real implementation would use GeoIP service
            // For now, return placeholder based on IP ranges
            if (ipAddress.StartsWith("192.168.") || ipAddress.StartsWith("10.") || ipAddress.StartsWith("172."))
                return "Internal";
            
            return "Unknown";
        }

        private bool IsUnusualDevice(SessionInfo sessionInfo)
        {
            // Check for suspicious device characteristics
            if (sessionInfo.DeviceInfo?.Contains("Bot", StringComparison.OrdinalIgnoreCase) == true)
                return true;

            if (sessionInfo.Browser?.Contains("Curl", StringComparison.OrdinalIgnoreCase) == true)
                return true;

            return false;
        }

        #endregion
    }

    /// <summary>
    /// Configuration options for risk analysis
    /// </summary>
    public class RiskAnalysisOptions
    {
        public BusinessHoursOptions BusinessHours { get; set; } = new BusinessHoursOptions();
        public int HighFrequencyThreshold { get; set; } = 10;
        public int FailureWindowMinutes { get; set; } = 30;
        public int LocationHistoryDays { get; set; } = 30;
        public string[] SensitivePermissionPatterns { get; set; } = new[] 
        { 
            "Admin", "Delete", "Sensitive", "Financial", "Personal", "Security" 
        };
    }

    public class BusinessHoursOptions
    {
        public TimeSpan StartTime { get; set; } = new TimeSpan(9, 0, 0); // 9 AM
        public TimeSpan EndTime { get; set; } = new TimeSpan(17, 0, 0);  // 5 PM
    }

    /// <summary>
    /// Cache models for risk analysis
    /// </summary>
    public class UserLocationCache
    {
        public List<string> KnownIPs { get; set; } = new List<string>();
        public List<string> KnownCountries { get; set; } = new List<string>();
    }

    public class UserAccessPatternCache
    {
        public int AccessCount { get; set; }
        public DateTime FirstAccess { get; set; }
        public DateTime LastAccess { get; set; }
    }
}