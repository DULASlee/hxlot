using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Nest;
using Shouldly;
using SmartAbp.Application.Permissions.Auditing.Models;
using SmartAbp.Application.Permissions.Auditing.Services;
using Volo.Abp.Testing;
using Xunit;

namespace SmartAbp.Application.Tests.Permissions.Auditing
{
    /// <summary>
    /// Unit Tests for Elasticsearch Audit Log Store
    /// Stage 5.1 TDD Implementation - Week 17-18
    /// </summary>
    public class ElasticsearchAuditLogStoreTests : AbpIntegratedTest<SmartAbpTestModule>
    {
        private readonly Mock<IElasticClient> _mockElasticClient;
        private readonly Mock<ILogger<ElasticsearchAuditLogStore>> _mockLogger;
        private readonly Mock<IRiskAnalysisService> _mockRiskAnalysisService;
        private readonly Mock<IGeoLocationService> _mockGeoLocationService;
        private readonly ElasticsearchAuditLogStore _auditLogStore;

        public ElasticsearchAuditLogStoreTests()
        {
            _mockElasticClient = new Mock<IElasticClient>();
            _mockLogger = new Mock<ILogger<ElasticsearchAuditLogStore>>();
            _mockRiskAnalysisService = new Mock<IRiskAnalysisService>();
            _mockGeoLocationService = new Mock<IGeoLocationService>();

            _auditLogStore = new ElasticsearchAuditLogStore(
                _mockElasticClient.Object,
                _mockLogger.Object,
                _mockRiskAnalysisService.Object,
                _mockGeoLocationService.Object
            );
        }

        [Fact]
        public async Task SaveAuditLogAsync_ShouldEnrichAndStoreAuditLog_WhenValidLogProvided()
        {
            // Arrange
            var auditLog = CreateTestAuditLog();
            var expectedRiskLevel = RiskLevel.Medium;
            var expectedGeoLocation = new GeoLocation { Country = "US", City = "New York" };

            _mockRiskAnalysisService
                .Setup(x => x.CalculateRiskLevelAsync(It.IsAny<PermissionAuditLog>()))
                .ReturnsAsync(expectedRiskLevel);

            _mockGeoLocationService
                .Setup(x => x.GetGeoLocationAsync(It.IsAny<string>()))
                .ReturnsAsync(expectedGeoLocation);

            _mockElasticClient
                .Setup(x => x.IndexAsync(
                    It.IsAny<PermissionAuditLog>(),
                    It.IsAny<Func<IndexDescriptor<PermissionAuditLog>, IIndexRequest<PermissionAuditLog>>>(),
                    default))
                .ReturnsAsync(new IndexResponse());

            // Act
            await _auditLogStore.SaveAuditLogAsync(auditLog);

            // Assert
            _mockElasticClient.Verify(x => x.IndexAsync(
                It.Is<PermissionAuditLog>(log =>
                    log.RiskLevel == expectedRiskLevel &&
                    log.GeoLocation != null &&
                    log.GeoLocation.Country == "US"
                ),
                It.IsAny<Func<IndexDescriptor<PermissionAuditLog>, IIndexRequest<PermissionAuditLog>>>(),
                default
            ), Times.Once);
        }

        [Fact]
        public async Task SaveAuditLogAsync_ShouldLogError_WhenElasticsearchFails()
        {
            // Arrange
            var auditLog = CreateTestAuditLog();
            var expectedException = new Exception("Elasticsearch connection failed");

            _mockElasticClient
                .Setup(x => x.IndexAsync(
                    It.IsAny<PermissionAuditLog>(),
                    It.IsAny<Func<IndexDescriptor<PermissionAuditLog>, IIndexRequest<PermissionAuditLog>>>(),
                    default))
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Should.ThrowAsync<Exception>(
                () => _auditLogStore.SaveAuditLogAsync(auditLog)
            );

            exception.Message.ShouldBe("Elasticsearch connection failed");
            
            // Verify error logging
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Error,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("审计日志保存失败")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        [Fact]
        public async Task CalculateRiskLevelAsync_ShouldReturnLow_WhenNoRiskFactorsPresent()
        {
            // Arrange
            var auditLog = CreateLowRiskAuditLog();

            _mockRiskAnalysisService
                .Setup(x => x.IsOutsideBusinessHours(It.IsAny<DateTime>()))
                .Returns(false);

            _mockRiskAnalysisService
                .Setup(x => x.IsUnusualLocationAsync(It.IsAny<Guid>(), It.IsAny<string>()))
                .ReturnsAsync(false);

            _mockRiskAnalysisService
                .Setup(x => x.IsHighFrequencyAccessAsync(It.IsAny<Guid>(), It.IsAny<string>()))
                .ReturnsAsync(false);

            // Act
            var riskLevel = await _mockRiskAnalysisService.Object.CalculateRiskLevelAsync(auditLog);

            // Assert
            riskLevel.ShouldBe(RiskLevel.Low);
        }

        [Fact]
        public async Task CalculateRiskLevelAsync_ShouldReturnCritical_WhenMultipleRiskFactorsPresent()
        {
            // Arrange
            var auditLog = CreateHighRiskAuditLog();

            _mockRiskAnalysisService
                .Setup(x => x.IsOutsideBusinessHours(It.IsAny<DateTime>()))
                .Returns(true); // +20 points

            _mockRiskAnalysisService
                .Setup(x => x.IsUnusualLocationAsync(It.IsAny<Guid>(), It.IsAny<string>()))
                .ReturnsAsync(true); // +30 points

            _mockRiskAnalysisService
                .Setup(x => x.IsHighFrequencyAccessAsync(It.IsAny<Guid>(), It.IsAny<string>()))
                .ReturnsAsync(true); // +15 points

            _mockRiskAnalysisService
                .Setup(x => x.GetRecentFailuresAsync(It.IsAny<Guid>()))
                .ReturnsAsync(5); // +50 points (5 * 10, capped at 50)

            _mockRiskAnalysisService
                .Setup(x => x.CalculateRiskLevelAsync(It.IsAny<PermissionAuditLog>()))
                .ReturnsAsync(RiskLevel.Critical); // Total: 115+ points = Critical

            // Act
            var riskLevel = await _mockRiskAnalysisService.Object.CalculateRiskLevelAsync(auditLog);

            // Assert
            riskLevel.ShouldBe(RiskLevel.Critical);
        }

        [Fact]
        public async Task SaveAuditLogAsync_ShouldCreateCorrectIndexName_BasedOnCurrentMonth()
        {
            // Arrange
            var auditLog = CreateTestAuditLog();
            var expectedIndexName = $"permission-audit-{DateTime.UtcNow:yyyy-MM}";

            _mockElasticClient
                .Setup(x => x.IndexAsync(
                    It.IsAny<PermissionAuditLog>(),
                    It.IsAny<Func<IndexDescriptor<PermissionAuditLog>, IIndexRequest<PermissionAuditLog>>>(),
                    default))
                .ReturnsAsync(new IndexResponse());

            // Act
            await _auditLogStore.SaveAuditLogAsync(auditLog);

            // Assert
            _mockElasticClient.Verify(x => x.IndexAsync(
                It.IsAny<PermissionAuditLog>(),
                It.Is<Func<IndexDescriptor<PermissionAuditLog>, IIndexRequest<PermissionAuditLog>>>(
                    func => VerifyIndexName(func, expectedIndexName)),
                default
            ), Times.Once);
        }

        [Theory]
        [InlineData(0, RiskLevel.Low)]      // 0-29 points
        [InlineData(29, RiskLevel.Low)]
        [InlineData(30, RiskLevel.Medium)]  // 30-59 points
        [InlineData(59, RiskLevel.Medium)]
        [InlineData(60, RiskLevel.High)]    // 60-79 points
        [InlineData(79, RiskLevel.High)]
        [InlineData(80, RiskLevel.Critical)] // 80+ points
        [InlineData(100, RiskLevel.Critical)]
        public void GetRiskLevelFromScore_ShouldReturnCorrectLevel_ForGivenScore(int score, RiskLevel expectedLevel)
        {
            // Act
            var actualLevel = ElasticsearchAuditLogStore.GetRiskLevelFromScore(score);

            // Assert
            actualLevel.ShouldBe(expectedLevel);
        }

        [Fact]
        public async Task ProcessRealTimeRiskAnalysis_ShouldTriggerAlert_WhenHighRiskDetected()
        {
            // Arrange
            var auditLog = CreateHighRiskAuditLog();
            auditLog.RiskLevel = RiskLevel.High;

            var mockAlertService = new Mock<IRealTimeRiskAlertService>();
            _auditLogStore.SetAlertService(mockAlertService.Object);

            // Act
            await _auditLogStore.ProcessRealTimeRiskAnalysis(auditLog);

            // Assert
            mockAlertService.Verify(x => x.ProcessRiskAlertAsync(auditLog), Times.Once);
        }

        [Fact]
        public async Task EnrichAuditLogAsync_ShouldAddUserAndSessionInfo()
        {
            // Arrange
            var auditLog = CreateTestAuditLog();
            var expectedUserInfo = new UserInfo { DisplayName = "Test User", Email = "test@example.com" };
            var expectedSessionInfo = new SessionInfo { SessionId = "session123", DeviceInfo = "Windows 10" };

            var mockUserService = new Mock<IUserService>();
            var mockSessionService = new Mock<ISessionService>();

            mockUserService
                .Setup(x => x.GetUserInfoAsync(auditLog.UserId))
                .ReturnsAsync(expectedUserInfo);

            mockSessionService
                .Setup(x => x.GetSessionInfoAsync(auditLog.SessionId))
                .ReturnsAsync(expectedSessionInfo);

            _auditLogStore.SetUserService(mockUserService.Object);
            _auditLogStore.SetSessionService(mockSessionService.Object);

            // Act
            var enrichedLog = await _auditLogStore.EnrichAuditLogAsync(auditLog);

            // Assert
            enrichedLog.UserInfo.ShouldNotBeNull();
            enrichedLog.UserInfo.DisplayName.ShouldBe("Test User");
            enrichedLog.SessionInfo.ShouldNotBeNull();
            enrichedLog.SessionInfo.DeviceInfo.ShouldBe("Windows 10");
        }

        // Performance Test
        [Fact]
        public async Task SaveAuditLogAsync_ShouldMeetPerformanceTargets_UnderLoad()
        {
            // Arrange
            var auditLogs = GenerateAuditLogs(100);
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            _mockElasticClient
                .Setup(x => x.IndexAsync(
                    It.IsAny<PermissionAuditLog>(),
                    It.IsAny<Func<IndexDescriptor<PermissionAuditLog>, IIndexRequest<PermissionAuditLog>>>(),
                    default))
                .ReturnsAsync(new IndexResponse());

            // Act
            var tasks = auditLogs.Select(log => _auditLogStore.SaveAuditLogAsync(log));
            await Task.WhenAll(tasks);
            stopwatch.Stop();

            // Assert - Performance requirement: <10ms per audit log
            var avgTimePerLog = stopwatch.ElapsedMilliseconds / auditLogs.Count;
            avgTimePerLog.ShouldBeLessThan(10, "Average audit log save time should be less than 10ms");
        }

        #region Helper Methods

        private PermissionAuditLog CreateTestAuditLog()
        {
            return new PermissionAuditLog
            {
                Id = Guid.NewGuid(),
                UserId = Guid.NewGuid(),
                SessionId = "session123",
                Permission = "User.Read",
                Resource = "User:123",
                Action = "Permission.Check",
                Result = AuditResult.Success,
                Timestamp = DateTime.UtcNow,
                ClientIP = "192.168.1.100",
                UserAgent = "Mozilla/5.0"
            };
        }

        private PermissionAuditLog CreateLowRiskAuditLog()
        {
            var log = CreateTestAuditLog();
            log.Timestamp = DateTime.UtcNow.Date.AddHours(10); // Business hours
            log.Result = AuditResult.Success;
            return log;
        }

        private PermissionAuditLog CreateHighRiskAuditLog()
        {
            var log = CreateTestAuditLog();
            log.Timestamp = DateTime.UtcNow.Date.AddHours(2); // Outside business hours
            log.Result = AuditResult.Failed;
            log.Permission = "Admin.Delete"; // Sensitive permission
            return log;
        }

        private List<PermissionAuditLog> GenerateAuditLogs(int count)
        {
            var logs = new List<PermissionAuditLog>();
            for (int i = 0; i < count; i++)
            {
                logs.Add(CreateTestAuditLog());
            }
            return logs;
        }

        private bool VerifyIndexName(Func<IndexDescriptor<PermissionAuditLog>, IIndexRequest<PermissionAuditLog>> func, string expectedIndexName)
        {
            var descriptor = new IndexDescriptor<PermissionAuditLog>();
            var request = func(descriptor);
            return request.Index.Name == expectedIndexName;
        }

        #endregion
    }
}