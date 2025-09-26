using System;
using System.Threading;

namespace SmartAbp.CodeGenerator.Core.Reliability
{
    /// <summary>
    /// 并发锁守卫
    /// 确保信号量在使用完成后正确释放
    /// </summary>
    public class ConcurrencyLockGuard : IDisposable
    {
        private readonly SemaphoreSlim _semaphore;
        private bool _disposed = false;

        public ConcurrencyLockGuard(SemaphoreSlim semaphore)
        {
            _semaphore = semaphore ?? throw new ArgumentNullException(nameof(semaphore));
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed && disposing)
            {
                try
                {
                    _semaphore?.Release();
                }
                catch
                {
                    // 忽略释放信号量时的异常，避免在Dispose中抛出异常
                }
                _disposed = true;
            }
        }
    }
}
