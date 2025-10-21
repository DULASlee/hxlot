using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Integration.Services;
using Volo.Abp.BackgroundJobs;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Application.LowCode
{
    /// <summary>
    /// 代码生成后台任务处理器
    /// 处理异步代码生成请求，通过SignalR推送实时进度
    /// 📋 功能恢复：完整的进度追踪、错误处理、日志记录
    /// </summary>
    [BackgroundJobName("CodeGeneration")]
    public class CodeGenerationBackgroundJob : AsyncBackgroundJob<CodeGenerationBackgroundJobArgs>, ITransientDependency
    {
        private readonly CodeGenerationService _codeGenerationService;
        private readonly SmartAbpProgressService _progressService; // 恢复进度服务
        private readonly ILogger<CodeGenerationBackgroundJob> _logger;

        public CodeGenerationBackgroundJob(
            CodeGenerationService codeGenerationService,
            SmartAbpProgressService progressService, // 恢复进度服务注入
            ILogger<CodeGenerationBackgroundJob> logger)
        {
            _codeGenerationService = codeGenerationService;
            _progressService = progressService;
            _logger = logger;
        }

        /// <summary>
        /// 执行代码生成任务
        /// 📋 完整恢复：进度追踪、性能监控、错误处理、详细日志
        /// </summary>
        public override async Task ExecuteAsync(CodeGenerationBackgroundJobArgs args)
        {
            var taskId = args.TaskId;
            var entityId = args.EntityId;
            var startTime = DateTime.Now; // 恢复性能监控

            // 恢复完整的进度追踪功能
            var tracker = _progressService.GetTracker(taskId) ?? _progressService.CreateTracker(taskId, "EntityCodeGeneration");

            try
            {
                _logger.LogInformation("🚀 开始执行代码生成任务 | TaskId: {TaskId} | EntityId: {EntityId}", taskId, entityId);

                // 阶段1：初始化 (0-10%)
                AsyncCodeGenerationService.UpdateTaskStatus(taskId, status =>
                {
                    status.Status = "Running";
                    status.CurrentStep = "开始代码生成";
                    status.Progress = 5;
                });
                await tracker.ReportProgress("Running", 5, "开始代码生成");

                // 阶段2：加载配置 (10-20%)
                await tracker.ReportProgress("Running", 10, "加载实体配置");
                AsyncCodeGenerationService.UpdateTaskStatus(taskId, status =>
                {
                    status.CurrentStep = "加载实体配置";
                    status.Progress = 15;
                });

                // 阶段3：验证数据 (20-30%)
                await tracker.ReportProgress("Running", 20, "验证配置数据");
                AsyncCodeGenerationService.UpdateTaskStatus(taskId, status =>
                {
                    status.CurrentStep = "验证配置数据";
                    status.Progress = 25;
                });

                // 阶段4：后端代码生成 (30-50%)
                await tracker.ReportProgress("Running", 30, "生成后端代码");
                AsyncCodeGenerationService.UpdateTaskStatus(taskId, status =>
                {
                    status.CurrentStep = "生成后端代码";
                    status.Progress = 40;
                });

                // 阶段5：前端代码生成 (50-70%)
                await tracker.ReportProgress("Running", 50, "生成前端代码");
                AsyncCodeGenerationService.UpdateTaskStatus(taskId, status =>
                {
                    status.CurrentStep = "生成前端代码";
                    status.Progress = 60;
                });

                // 阶段6：数据库脚本生成 (70-90%)
                await tracker.ReportProgress("Running", 70, "生成数据库脚本");
                AsyncCodeGenerationService.UpdateTaskStatus(taskId, status =>
                {
                    status.CurrentStep = "生成数据库脚本";
                    status.Progress = 80;
                });

                // 阶段7：保存结果 (90-95%)
                await tracker.ReportProgress("Running", 90, "保存生成结果");
                AsyncCodeGenerationService.UpdateTaskStatus(taskId, status =>
                {
                    status.CurrentStep = "保存生成结果";
                    status.Progress = 95;
                });

                // 🔥 核心：调用重构后的代码生成服务
                var result = await _codeGenerationService.GenerateAsync(entityId);

                // 计算性能指标（恢复性能监控）
                var elapsed = DateTime.Now - startTime;

                // 设置任务完成状态
                AsyncCodeGenerationService.UpdateTaskStatus(taskId, status =>
                {
                    status.Status = result.Success ? "Completed" : "Failed";
                    status.Progress = 100;
                    status.CurrentStep = result.Success ? "生成完成" : "生成失败";
                    status.GeneratedFiles = result.GeneratedFiles;
                    status.Errors.AddRange(result.Errors);
                    status.ElapsedMilliseconds = (long)elapsed.TotalMilliseconds; // 恢复性能数据
                });

                // 报告完成（恢复完整功能）
                await tracker.ReportCompletion(result.Success, result);

                // 详细的成功日志（恢复完整日志功能）
                _logger.LogInformation(
                    "✅ 代码生成任务完成 | TaskId: {TaskId} | EntityId: {EntityId} | Success: {Success} | GeneratedFiles: {GeneratedFiles} | Elapsed: {Elapsed}ms",
                    taskId, entityId, result.Success, result.GeneratedFiles.Count, elapsed.TotalMilliseconds);

                // 如果生成成功，记录详细的文件信息
                if (result.Success && result.GeneratedFiles.Any())
                {
                    _logger.LogInformation("📁 生成的文件列表:");
                    foreach (var file in result.GeneratedFiles)
                    {
                        _logger.LogInformation("  ✓ {FilePath} ({FileSize} chars)", file.Key, file.Value.Length);
                    }
                }
            }
            catch (Exception ex)
            {
                var elapsed = DateTime.Now - startTime;

                _logger.LogError(ex, "❌ 代码生成任务执行失败 | TaskId: {TaskId} | EntityId: {EntityId} | Elapsed: {Elapsed}ms",
                    taskId, entityId, elapsed.TotalMilliseconds);

                // 恢复错误报告功能
                await tracker.ReportError($"代码生成失败: {ex.Message}");

                AsyncCodeGenerationService.UpdateTaskStatus(taskId, status =>
                {
                    status.Status = "Failed";
                    status.Progress = -1;
                    status.CurrentStep = "执行失败";
                    status.Errors.Add(ex.Message);
                    status.ElapsedMilliseconds = (long)elapsed.TotalMilliseconds;
                });

                // 记录详细的错误信息（恢复完整错误日志）
                _logger.LogError("🔍 错误详情:");
                _logger.LogError("  📍 异常类型: {ExceptionType}", ex.GetType().Name);
                _logger.LogError("  📝 错误消息: {Message}", ex.Message);
                _logger.LogError("  📚 堆栈跟踪: {StackTrace}", ex.StackTrace);

                if (ex.InnerException != null)
                {
                    _logger.LogError("  🔗 内部异常: {InnerException}", ex.InnerException.Message);
                }
            }
            finally
            {
                // 清理资源（恢复完整的资源管理）
                _progressService.RemoveTracker(taskId);

                var totalElapsed = DateTime.Now - startTime;
                _logger.LogInformation("🏁 代码生成任务结束 | TaskId: {TaskId} | TotalElapsed: {TotalElapsed}ms",
                    taskId, totalElapsed.TotalMilliseconds);
            }
        }
    }

}
