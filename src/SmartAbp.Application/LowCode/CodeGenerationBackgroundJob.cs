using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Services;
using SmartAbp.CodeGenerator.Hubs;
using Volo.Abp.BackgroundJobs;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Application.LowCode
{
    /// <summary>
    /// 代码生成后台任务处理器
    /// 处理异步代码生成请求，通过SignalR推送实时进度
    /// </summary>
    [BackgroundJobName("CodeGeneration")]
    public class CodeGenerationBackgroundJob : AsyncBackgroundJob<CodeGenerationBackgroundJobArgs>, ITransientDependency
    {
        private readonly CodeGenerationService _codeGenerationService;
        private readonly CodeGenerationProgressService _progressService;
        private readonly ILogger<CodeGenerationBackgroundJob> _logger;

        public CodeGenerationBackgroundJob(
            CodeGenerationService codeGenerationService,
            CodeGenerationProgressService progressService,
            ILogger<CodeGenerationBackgroundJob> logger)
        {
            _codeGenerationService = codeGenerationService;
            _progressService = progressService;
            _logger = logger;
        }

        /// <summary>
        /// 执行代码生成任务
        /// </summary>
        public override async Task ExecuteAsync(CodeGenerationBackgroundJobArgs args)
        {
            var taskId = args.TaskId;
            var entityId = args.EntityId;

            // 创建进度跟踪器
            var tracker = _progressService.CreateTracker(taskId, "EntityCodeGeneration");

            try
            {
                _logger.LogInformation("🚀 开始执行代码生成任务 | TaskId: {TaskId} | EntityId: {EntityId}", taskId, entityId);

                // 更新任务状态为运行中
                AsyncCodeGenerationService.UpdateTaskStatus(taskId, status =>
                {
                    status.Status = "Running";
                    status.CurrentStep = "开始代码生成";
                    status.Progress = 5;
                });

                await tracker.ReportProgress("Running", 5, "开始代码生成");

                // 阶段1: 加载和验证配置 (10%)
                await tracker.ReportProgress("Running", 10, "加载实体配置");
                await Task.Delay(500); // 模拟配置加载时间

                AsyncCodeGenerationService.UpdateTaskStatus(taskId, status =>
                {
                    status.CurrentStep = "验证配置数据";
                    status.Progress = 20;
                });

                await tracker.ReportProgress("Running", 20, "验证配置数据");

                // 阶段2: 执行代码生成 (20%-80%)
                await tracker.ReportProgress("Running", 30, "生成后端代码");
                await Task.Delay(1000); // 模拟后端代码生成时间

                AsyncCodeGenerationService.UpdateTaskStatus(taskId, status =>
                {
                    status.CurrentStep = "生成前端代码";
                    status.Progress = 50;
                });

                await tracker.ReportProgress("Running", 50, "生成前端代码");
                await Task.Delay(1500); // 模拟前端代码生成时间

                AsyncCodeGenerationService.UpdateTaskStatus(taskId, status =>
                {
                    status.CurrentStep = "生成数据库脚本";
                    status.Progress = 70;
                });

                await tracker.ReportProgress("Running", 70, "生成数据库脚本");

                // 实际调用同步代码生成服务
                _logger.LogInformation("📝 调用代码生成服务 | TaskId: {TaskId} | EntityId: {EntityId}", taskId, entityId);

                var result = await _codeGenerationService.GenerateAsync(entityId);

                // 阶段3: 完成处理 (80%-100%)
                await tracker.ReportProgress("Running", 90, "保存生成结果");
                await Task.Delay(500);

                AsyncCodeGenerationService.UpdateTaskStatus(taskId, status =>
                {
                    status.CurrentStep = "生成完成";
                    status.Progress = 100;
                });

                // 设置任务完成状态
                AsyncCodeGenerationService.CompleteTask(taskId, true, result);

                // 报告完成
                await tracker.ReportCompletion(true, result);

                _logger.LogInformation("✅ 代码生成任务完成 | TaskId: {TaskId} | EntityId: {EntityId} | FilesGenerated: {FilesGenerated}",
                    taskId, entityId, result.FilesGenerated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ 代码生成任务失败 | TaskId: {TaskId} | EntityId: {EntityId}", taskId, entityId);

                // 设置任务失败状态
                AsyncCodeGenerationService.CompleteTask(taskId, false, null, ex.Message);

                // 报告错误
                await tracker.ReportError($"代码生成失败: {ex.Message}");

                // 重新抛出异常，让BackgroundJob框架处理重试逻辑
                throw;
            }
        }
    }
}
