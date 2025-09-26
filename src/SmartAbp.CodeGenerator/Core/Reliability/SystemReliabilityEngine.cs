using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.CodeGenerator.Core.Reliability
{
    /// <summary>
    /// 系统可靠性引擎 - 对标奔驰跑车工程品质
    /// 目标: 99.9%可用性，平均故障恢复时间小于10秒
    /// </summary>
    public class SystemReliabilityEngine : ITransientDependency
    {
        private readonly ILogger<SystemReliabilityEngine> _logger;
        private readonly ConcurrentDictionary<string, SemaphoreSlim> _concurrencyLocks;
        private readonly ConcurrentDictionary<string, int> _operationRetryCount;
        private readonly ResourceAvailabilityChecker _resourceChecker;
        private readonly AutoRecoveryManager _autoRecoveryManager;

        public SystemReliabilityEngine(
            ILogger<SystemReliabilityEngine> logger,
            ResourceAvailabilityChecker resourceChecker,
            AutoRecoveryManager autoRecoveryManager)
        {
            _logger = logger;
            _resourceChecker = resourceChecker;
            _autoRecoveryManager = autoRecoveryManager;
            _concurrencyLocks = new ConcurrentDictionary<string, SemaphoreSlim>();
            _operationRetryCount = new ConcurrentDictionary<string, int>();
        }

        /// <summary>
        /// 🛡️ 五层防护机制执行操作
        /// </summary>
        public async Task<OperationResult<T>> ExecuteWithFullProtection<T>(
            string operationId,
            Func<Task<T>> operation,
            CancellationToken cancellationToken = default)
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            try 
            {
                _logger.LogInformation("🚀 启动五层防护执行: {OperationId}", operationId);

                // 🛡️ 第一层: 输入验证防护
                await ValidateInputs(operationId, operation);
                
                // 🛡️ 第二层: 资源可用性检查
                await CheckResourceAvailability(operationId);
                
                // 🛡️ 第三层: 并发控制保护
                using var concurrencyGuard = await AcquireConcurrencyLock(operationId);
                
                // 🛡️ 第四层: 事务性执行
                using var transaction = await BeginReliableTransaction(operationId);
                
                // 🛡️ 第五层: 异常恢复机制  
                var result = await ExecuteWithAutoRecovery(operationId, operation, cancellationToken);
                
                await transaction.CommitAsync();
                
                stopwatch.Stop();
                _logger.LogInformation("✅ 五层防护执行成功: {OperationId}, 耗时: {ElapsedMs}ms", 
                    operationId, stopwatch.ElapsedMilliseconds);
                    
                return OperationResult<T>.Success(result);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(ex, "❌ 五层防护执行失败: {OperationId}, 耗时: {ElapsedMs}ms", 
                    operationId, stopwatch.ElapsedMilliseconds);
                    
                var gracefulResult = await HandleExceptionGracefully(operationId, ex);
                return OperationResult<T>.Failure(gracefulResult.ErrorMessage, gracefulResult.ErrorCode);
            }
        }

        /// <summary>
        /// 第一层: 输入验证防护
        /// </summary>
        private async Task ValidateInputs<T>(string operationId, Func<Task<T>> operation)
        {
            if (string.IsNullOrWhiteSpace(operationId))
                throw new ArgumentException("操作ID不能为空", nameof(operationId));
                
            if (operation == null)
                throw new ArgumentNullException(nameof(operation), "操作函数不能为空");

            // 检查操作ID是否包含非法字符
            if (operationId.Contains("..") || operationId.Contains("/") || operationId.Contains("\\"))
                throw new ArgumentException("操作ID包含非法字符", nameof(operationId));

            await Task.CompletedTask;
            _logger.LogDebug("🔍 第一层防护通过: 输入验证 - {OperationId}", operationId);
        }

        /// <summary>
        /// 第二层: 资源可用性检查
        /// </summary>
        private async Task CheckResourceAvailability(string operationId)
        {
            var availability = await _resourceChecker.CheckSystemResourcesAsync();
            
            if (!availability.IsAvailable)
            {
                throw new SystemResourceUnavailableException(
                    $"系统资源不足: {availability.ErrorMessage}");
            }

            _logger.LogDebug("🔍 第二层防护通过: 资源可用性 - {OperationId}", operationId);
        }

        /// <summary>
        /// 第三层: 并发控制保护
        /// </summary>
        private async Task<IDisposable> AcquireConcurrencyLock(string operationId)
        {
            var lockKey = GetLockKey(operationId);
            var semaphore = _concurrencyLocks.GetOrAdd(lockKey, _ => new SemaphoreSlim(1, 1));
            
            var acquired = await semaphore.WaitAsync(TimeSpan.FromSeconds(30));
            if (!acquired)
            {
                throw new ConcurrencyLimitExceededException(
                    $"并发锁获取超时: {operationId}");
            }

            _logger.LogDebug("🔍 第三层防护通过: 并发控制 - {OperationId}", operationId);
            return new ConcurrencyLockGuard(semaphore);
        }

        /// <summary>
        /// 第四层: 事务性执行
        /// </summary>
        private async Task<IReliableTransaction> BeginReliableTransaction(string operationId)
        {
            var transaction = new ReliableTransaction(operationId, _logger);
            await transaction.BeginAsync();
            
            _logger.LogDebug("🔍 第四层防护通过: 事务开始 - {OperationId}", operationId);
            return transaction;
        }

        /// <summary>
        /// 第五层: 异常恢复机制
        /// </summary>
        private async Task<T> ExecuteWithAutoRecovery<T>(
            string operationId, 
            Func<Task<T>> operation,
            CancellationToken cancellationToken)
        {
            const int maxRetries = 3;
            var retryCount = 0;

            while (retryCount < maxRetries)
            {
                try
                {
                    var result = await operation();
                    
                    // 重置重试计数
                    _operationRetryCount.TryRemove(operationId, out _);
                    
                    _logger.LogDebug("🔍 第五层防护通过: 操作执行成功 - {OperationId}", operationId);
                    return result;
                }
                catch (Exception ex) when (IsRetriableException(ex) && retryCount < maxRetries - 1)
                {
                    retryCount++;
                    _operationRetryCount.AddOrUpdate(operationId, retryCount, (_, count) => retryCount);
                    
                    var delay = CalculateExponentialBackoff(retryCount);
                    _logger.LogWarning("⚠️ 操作失败，{Delay}ms后重试({Retry}/{MaxRetries}): {OperationId} - {Error}", 
                        delay, retryCount, maxRetries, operationId, ex.Message);
                        
                    await Task.Delay(delay, cancellationToken);
                    
                    // 尝试自动恢复
                    await _autoRecoveryManager.AttemptRecoveryAsync(operationId, ex);
                }
            }

            // 所有重试都失败，抛出最后一次异常
            throw new OperationFailedException(
                $"操作在{maxRetries}次重试后仍然失败: {operationId}");
        }

        /// <summary>
        /// 优雅异常处理
        /// </summary>
        private async Task<ErrorResult> HandleExceptionGracefully(string operationId, Exception exception)
        {
            var errorCode = GenerateErrorCode(exception);
            var userFriendlyMessage = GenerateUserFriendlyMessage(exception);
            
            // 记录详细错误信息用于排查
            _logger.LogError(exception, 
                "🚨 系统可靠性引擎异常处理: {OperationId} | ErrorCode: {ErrorCode}", 
                operationId, errorCode);
            
            // 尝试系统自愈
            await _autoRecoveryManager.TriggerEmergencyRecoveryAsync(operationId, exception);
            
            return new ErrorResult 
            { 
                ErrorCode = errorCode, 
                ErrorMessage = userFriendlyMessage,
                OperationId = operationId,
                Timestamp = DateTime.UtcNow
            };
        }

        #region Private Helper Methods

        private string GetLockKey(string operationId)
        {
            // 根据操作类型对锁进行分组，避免过度串行化
            return operationId.Split(':')[0];
        }

        private bool IsRetriableException(Exception exception)
        {
            return exception is TimeoutException ||
                   exception is TaskCanceledException ||
                   exception is SystemResourceUnavailableException ||
                   (exception is SystemException && !exception.Message.Contains("致命"));
        }

        private int CalculateExponentialBackoff(int retryCount)
        {
            // 指数退避: 100ms, 200ms, 400ms
            return (int)(100 * Math.Pow(2, retryCount - 1));
        }

        private string GenerateErrorCode(Exception exception)
        {
            return exception.GetType().Name.Replace("Exception", "").ToUpperInvariant();
        }

        private string GenerateUserFriendlyMessage(Exception exception)
        {
            return exception switch
            {
                ArgumentException => "输入参数不正确，请检查后重试",
                SystemResourceUnavailableException => "系统资源暂时不可用，请稍后重试",
                ConcurrencyLimitExceededException => "系统繁忙，请稍后重试",
                OperationFailedException => "操作失败，系统正在尝试自动恢复",
                TimeoutException => "操作超时，请检查网络连接后重试",
                _ => "系统遇到了预期外的问题，我们已经记录并将尽快修复"
            };
        }

        #endregion
    }

    /// <summary>
    /// 操作结果
    /// </summary>
    public class OperationResult<T>
    {
        public bool IsSuccess { get; set; }
        public T? Data { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public string? ErrorCode { get; set; }

        public static OperationResult<T> Success(T data)
        {
            return new OperationResult<T> 
            { 
                IsSuccess = true, 
                Data = data 
            };
        }

        public static OperationResult<T> Failure(string errorMessage, string? errorCode = null)
        {
            return new OperationResult<T> 
            { 
                IsSuccess = false, 
                ErrorMessage = errorMessage,
                ErrorCode = errorCode
            };
        }
    }

    /// <summary>
    /// 错误结果
    /// </summary>
    public class ErrorResult
    {
        public string? ErrorCode { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public string OperationId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    #region Custom Exceptions

    public class SystemResourceUnavailableException : Exception
    {
        public SystemResourceUnavailableException(string message) : base(message) { }
    }

    public class ConcurrencyLimitExceededException : Exception
    {
        public ConcurrencyLimitExceededException(string message) : base(message) { }
    }

    public class OperationFailedException : Exception
    {
        public OperationFailedException(string message) : base(message) { }
    }

    #endregion
}
