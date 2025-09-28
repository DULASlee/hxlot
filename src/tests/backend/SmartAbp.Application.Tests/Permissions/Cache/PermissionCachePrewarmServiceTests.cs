using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using SmartAbp.Permissions.Models;
using StackExchange.Redis;

namespace SmartAbp.Permissions.Cache.Tests
{
    [TestFixture]
    public class PermissionCachePrewarmServiceTests
    {
        private Mock<IConnectionMultiplexer> _mockRedis;
        private Mock<IDatabase> _mockDatabase;
        private Mock<IMemoryCache> _mockMemoryCache;
        private Mock<ILogger<PermissionCachePrewarmService>> _mockLogger;
        private Mock<IOptions<PermissionCacheOptions>> _mockOptions;
        private PermissionCacheOptions _options;
        private PermissionCachePrewarmService _service;

        [SetUp]
        public void Setup()
        {
            _mockRedis = new Mock<IConnectionMultiplexer>();
            _mockDatabase = new Mock<IDatabase>();
            _mockMemoryCache = new Mock<IMemoryCache>();
            _mockLogger = new Mock<ILogger<PermissionCachePrewarmService>>();
            _mockOptions = new Mock<IOptions<PermissionCacheOptions>>();
            _options = new PermissionCacheOptions
            {
                DefaultExpiration = TimeSpan.FromMinutes(30),
                SlidingExpiration = TimeSpan.FromMinutes(15),
                MaxRetryAttempts = 3,
                RetryDelay = TimeSpan.FromSeconds(1),
                EnableCompression = true,
                EnableEncryption = true
            };

            _mockOptions.Setup(x => x.Value).Returns(_options);
            _mockRedis.Setup(x => x.GetDatabase(It.IsAny<int>(), It.IsAny<object>())).Returns(_mockDatabase.Object);
            _mockRedis.Setup(x => x.IsConnected).Returns(true);

            _service = new PermissionCachePrewarmService(
                _mockRedis.Object,
                _mockMemoryCache.Object,
                _mockLogger.Object,
                _mockOptions.Object);
        }

        [Test]
        public async Task PrewarmActiveUserPermissionsAsync_WithValidUsers_ShouldPrewarmSuccessfully()
        {
            // Arrange
            var activeUsers = new List<UserActivity>
            {
                new UserActivity { Id = "user1", TenantId = "tenant1", LastActivityTime = DateTime.UtcNow.AddHours(-1) },
                new UserActivity { Id = "user2", TenantId = "tenant1", LastActivityTime = DateTime.UtcNow.AddHours(-2) }
            };

            _mockDatabase.Setup(x => x.StringSetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<TimeSpan?>(), It.IsAny<bool>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            object memoryCacheValue = null;
            _mockMemoryCache.Setup(x => x.CreateEntry(It.IsAny<object>()))
                .Returns(Mock.Of<ICacheEntry>);

            // Act
            await _service.PrewarmActiveUserPermissionsAsync(activeUsers);

            // Assert
            _mockDatabase.Verify(x => x.StringSetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<TimeSpan?>(), It.IsAny<bool>(), It.IsAny<When>(), It.IsAny<CommandFlags>()), Times.AtLeastOnce);
            _mockMemoryCache.Verify(x => x.CreateEntry(It.IsAny<object>()), Times.AtLeastOnce);
            
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Cache prewarming completed")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        [Test]
        public async Task PrewarmActiveUserPermissionsAsync_WithEmptyUsers_ShouldLogWarning()
        {
            // Arrange
            var emptyUsers = new List<UserActivity>();

            // Act
            await _service.PrewarmActiveUserPermissionsAsync(emptyUsers);

            // Assert
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Warning,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("No active users provided")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        [Test]
        public async Task PrewarmActiveUserPermissionsAsync_WithNullUsers_ShouldLogWarning()
        {
            // Act
            await _service.PrewarmActiveUserPermissionsAsync(null);

            // Assert
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Warning,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("No active users provided")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }

        [Test]
        public async Task PrewarmActiveUserPermissionsAsync_WithRedisFailure_ShouldHandleGracefully()
        {
            // Arrange
            var activeUsers = new List<UserActivity>
            {
                new UserActivity { Id = "user1", TenantId = "tenant1", LastActivityTime = DateTime.UtcNow }
            };

            _mockDatabase.Setup(x => x.StringSetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<TimeSpan?>(), It.IsAny<bool>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
                .ThrowsAsync(new RedisException("Redis connection failed"));

            // Act & Assert (should not throw)
            Assert.DoesNotThrowAsync(async () => await _service.PrewarmActiveUserPermissionsAsync(activeUsers));

            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Error,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Failed to prewarm permissions")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.AtLeastOnce);
        }

        [Test]
        public async Task GetPrewarmStatisticsAsync_WithConnectedRedis_ShouldReturnValidStatistics()
        {
            // Arrange
            _mockDatabase.Setup(x => x.ExecuteAsync("INFO", "stats", It.IsAny<CommandFlags>()))
                .ReturnsAsync(RedisResult.Create((RedisValue)"redis_stats_info"));

            // Act
            var result = await _service.GetPrewarmStatisticsAsync();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.TotalPrewarmedUsers, Is.GreaterThanOrEqualTo(0));
            Assert.That(result.RedisConnectionStatus, Is.Not.Null);
            Assert.That(result.AveragePrewarmTimeMs, Is.GreaterThanOrEqualTo(0));
            Assert.That(result.SuccessRate, Is.GreaterThanOrEqualTo(0));
            Assert.That(result.SuccessRate, Is.GreaterThanOrEqualTo(0.0));
            Assert.That(result.SuccessRate, Is.LessThanOrEqualTo(1.0));
        }

        [Test]
        public async Task GetPrewarmStatisticsAsync_WithRedisDisconnected_ShouldHandleGracefully()
        {
            // Arrange
            _mockRedis.Setup(x => x.IsConnected).Returns(false);

            // Act
            var result = await _service.GetPrewarmStatisticsAsync();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.RedisConnectionStatus, Is.EqualTo("Disconnected"));
        }

        [Test]
        public async Task GetPrewarmStatisticsAsync_WithRedisException_ShouldReturnDefaultValues()
        {
            // Arrange
            _mockDatabase.Setup(x => x.ExecuteAsync("INFO", "stats", It.IsAny<CommandFlags>()))
                .ThrowsAsync(new RedisException("Redis command failed"));

            // Act
            var result = await _service.GetPrewarmStatisticsAsync();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.TotalPrewarmedUsers, Is.GreaterThanOrEqualTo(0));
            Assert.That(result.AveragePrewarmTimeMs, Is.GreaterThanOrEqualTo(0));
            Assert.That(result.SuccessRate, Is.GreaterThanOrEqualTo(0));
            Assert.That(result.MemoryUsageBytes, Is.GreaterThanOrEqualTo(0));
            Assert.That(result.RedisConnectionStatus, Is.EqualTo("Connected"));
        }

        [Test]
        public void Constructor_WithNullRedis_ShouldThrowArgumentNullException()
        {
            // Act & Assert
            var exception = Assert.Throws<ArgumentNullException>(() =>
                new PermissionCachePrewarmService(
                    null,
                    _mockMemoryCache.Object,
                    _mockLogger.Object,
                    _mockOptions.Object));

            Assert.That(exception.ParamName, Is.EqualTo("redis"));
        }

        [Test]
        public void Constructor_WithNullMemoryCache_ShouldThrowArgumentNullException()
        {
            // Act & Assert
            var exception = Assert.Throws<ArgumentNullException>(() =>
                new PermissionCachePrewarmService(
                    _mockRedis.Object,
                    null,
                    _mockLogger.Object,
                    _mockOptions.Object));

            Assert.That(exception.ParamName, Is.EqualTo("memoryCache"));
        }

        [Test]
        public void Constructor_WithNullLogger_ShouldThrowArgumentNullException()
        {
            // Act & Assert
            var exception = Assert.Throws<ArgumentNullException>(() =>
                new PermissionCachePrewarmService(
                    _mockRedis.Object,
                    _mockMemoryCache.Object,
                    null,
                    _mockOptions.Object));

            Assert.That(exception.ParamName, Is.EqualTo("logger"));
        }

        [Test]
        public void Constructor_WithNullOptions_ShouldThrowArgumentNullException()
        {
            // Act & Assert
            var exception = Assert.Throws<ArgumentNullException>(() =>
                new PermissionCachePrewarmService(
                    _mockRedis.Object,
                    _mockMemoryCache.Object,
                    _mockLogger.Object,
                    null));

            Assert.That(exception.ParamName, Is.EqualTo("options"));
        }

        [Test]
        public async Task PrewarmActiveUserPermissionsAsync_PerformanceTest_ShouldCompleteWithinTimeLimit()
        {
            // Arrange
            var activeUsers = new List<UserActivity>();
            for (int i = 0; i < 100; i++)
            {
                activeUsers.Add(new UserActivity 
                { 
                    Id = $"user{i}", 
                    TenantId = "tenant1", 
                    LastActivityTime = DateTime.UtcNow.AddHours(-i) 
                });
            }

            _mockDatabase.Setup(x => x.StringSetAsync(It.IsAny<RedisKey>(), It.IsAny<RedisValue>(), It.IsAny<TimeSpan?>(), It.IsAny<bool>(), It.IsAny<When>(), It.IsAny<CommandFlags>()))
                .ReturnsAsync(true);

            object memoryCacheValue = null;
            var mockCacheEntry = new Mock<ICacheEntry>();
            _mockMemoryCache.Setup(x => x.CreateEntry(It.IsAny<object>()))
                .Returns(mockCacheEntry.Object);

            // Act
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            await _service.PrewarmActiveUserPermissionsAsync(activeUsers);
            stopwatch.Stop();

            // Assert
            Assert.That(stopwatch.ElapsedMilliseconds, Is.LessThan(5000), "Prewarming 100 users should complete within 5 seconds");
            
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Cache prewarming completed")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.Once);
        }
    }
}