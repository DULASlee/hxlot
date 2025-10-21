using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Integration.Services;
using Volo.Abp.Application.Services;
using Volo.Abp.BackgroundJobs;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Application.LowCode
{
    /// <summary>
    /// 异步代码生成服务
    /// 提供异步代码生成API，立即返回taskId，通过SignalR推送进度
    /// </summary>
    public class AsyncCodeGenerationService : ApplicationService, ITransientDependency
    {
        private readonly IBackgroundJobManager _backgroundJobManager;
        private readonly SmartAbpProgressService _progressService; // 恢复进度服务
        private readonly ILogger<AsyncCodeGenerationService> _logger;

        // 任务状态存储 (生产环境应使用Redis或数据库)
        private static readonly ConcurrentDictionary<string, CodeGenerationTaskStatus> _taskStatuses = new();

        public AsyncCodeGenerationService(
            IBackgroundJobManager backgroundJobManager,
            SmartAbpProgressService progressService, // 恢复进度服务注入
            ILogger<AsyncCodeGenerationService> logger)
        {
            _backgroundJobManager = backgroundJobManager;
            _progressService = progressService;
            _logger = logger;
        }

        /// <summary>
        /// 异步生成代码 - 立即返回taskId
        /// </summary>
        /// <param name="entityId">实体ID</param>
        /// <returns>任务ID，用于跟踪进度</returns>
        public async Task<CodeGenerationTaskResponse> GenerateAsync(Guid entityId)
        {
            var taskId = Guid.NewGuid().ToString();

            // 记录任务状态
            var taskStatus = new CodeGenerationTaskStatus
            {
                TaskId = taskId,
                EntityId = entityId,
                Status = "Queued",
                CreatedAt = DateTime.UtcNow,
                Progress = 0
            };

            _taskStatuses[taskId] = taskStatus;

            // 恢复完整的进度追踪功能
            var tracker = _progressService.CreateTracker(taskId, "EntityCodeGeneration");

            try
            {
                // 提交后台任务
                await _backgroundJobManager.EnqueueAsync(new CodeGenerationBackgroundJobArgs
                {
                    TaskId = taskId,
                    EntityId = entityId
                });

                // 恢复进度报告功能
                await tracker.ReportProgress("Queued", 0, "任务已提交到队列");

                _logger.LogInformation("✅ 代码生成任务已提交 | TaskId: {TaskId} | EntityId: {EntityId}", taskId, entityId);

                return new CodeGenerationTaskResponse
                {
                    TaskId = taskId,
                    Status = "Queued",
                    Message = "代码生成任务已提交，请等待处理"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ 代码生成任务提交失败 | TaskId: {TaskId} | EntityId: {EntityId}", taskId, entityId);

                taskStatus.Status = "Failed";
                taskStatus.ErrorMessage = ex.Message;

                // 恢复错误报告功能
                await tracker.ReportError($"任务提交失败: {ex.Message}");

                throw;
            }
        }

        /// <summary>
        /// 获取任务状态
        /// </summary>
        public Task<CodeGenerationTaskStatus> GetTaskStatusAsync(string taskId)
        {
            if (_taskStatuses.TryGetValue(taskId, out var status))
            {
                return Task.FromResult(status);
            }

            return Task.FromResult(new CodeGenerationTaskStatus
            {
                TaskId = taskId,
                Status = "NotFound",
                ErrorMessage = "任务不存在"
            });
        }

        /// <summary>
        /// 获取所有任务状态（管理用）
        /// </summary>
        public Task<CodeGenerationTaskStatus[]> GetAllTaskStatusesAsync()
        {
            return Task.FromResult(_taskStatuses.Values.ToArray());
        }

        /// <summary>
        /// 内部方法：更新任务状态
        /// </summary>
        internal static void UpdateTaskStatus(string taskId, Action<CodeGenerationTaskStatus> updater)
        {
            if (_taskStatuses.TryGetValue(taskId, out var status))
            {
                updater(status);
                status.UpdatedAt = DateTime.UtcNow;
            }
        }

        /// <summary>
        /// 内部方法：设置任务完成
        /// </summary>
        internal static void CompleteTask(string taskId, bool success, object? result = null, string? errorMessage = null)
        {
            if (_taskStatuses.TryGetValue(taskId, out var status))
            {
                status.Status = success ? "Completed" : "Failed";
                status.CompletedAt = DateTime.UtcNow;
                status.Progress = success ? 100 : status.Progress;
                status.Result = result;
                status.ErrorMessage = errorMessage;
            }
        }
    }

    /// <summary>
    /// 异步代码生成响应
    /// </summary>
    public class CodeGenerationTaskResponse
    {
        public string TaskId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// 代码生成任务状态 - 恢复完整属性
    /// </summary>
    public class CodeGenerationTaskStatus
    {
        public string TaskId { get; set; } = string.Empty;
        public Guid EntityId { get; set; }
        public string Status { get; set; } = string.Empty; // Queued, Running, Completed, Failed
        public int Progress { get; set; } // 0-100
        public string CurrentStep { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public object? Result { get; set; }
        public string? ErrorMessage { get; set; }

        // 恢复被删除的属性
        public Dictionary<string, string> GeneratedFiles { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public long ElapsedMilliseconds { get; set; }
    }

    /// <summary>
    /// 代码生成后台任务参数
    /// </summary>
    public class CodeGenerationBackgroundJobArgs
    {
        public string TaskId { get; set; } = string.Empty;
        public Guid EntityId { get; set; }
    }
}
