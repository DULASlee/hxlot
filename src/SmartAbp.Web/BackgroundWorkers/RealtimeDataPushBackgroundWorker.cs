// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 实时数据推送后台任务
// 定期聚合数据并通过SignalR推送到前端
// 创建日期: 2025-10-21
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SmartAbp.Application.RealtimeData;
using SmartAbp.Web.Hubs;

namespace SmartAbp.Web.BackgroundWorkers
{
    /// <summary>
    /// 实时数据推送后台工作服务
    /// 
    /// ✅ 定期聚合实时数据
    /// ✅ 通过SignalR推送到订阅的客户端
    /// ✅ 支持多产线并发推送
    /// ✅ 异常重试机制
    /// </summary>
    public class RealtimeDataPushBackgroundWorker : BackgroundService
    {
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 依赖注入
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private readonly ILogger<RealtimeDataPushBackgroundWorker> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IHubContext<ProductionLineHub, IProductionLineClient> _hubContext;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 配置
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 推送间隔（毫秒）
        /// </summary>
        private const int PushIntervalMs = 1000; // 1秒

        /// <summary>
        /// 需要监控的产线ID列表（可从配置或数据库读取）
        /// </summary>
        private readonly List<string> _productionLineIds = new()
        {
            "production-line-001",
            "production-line-002",
            "production-line-003"
        };

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 构造函数
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        public RealtimeDataPushBackgroundWorker(
            ILogger<RealtimeDataPushBackgroundWorker> logger,
            IServiceProvider serviceProvider,
            IHubContext<ProductionLineHub, IProductionLineClient> hubContext)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _hubContext = hubContext;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 后台服务主循环
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "[RealtimeDataPushBackgroundWorker] 后台推送任务已启动，推送间隔: {Interval}ms",
                PushIntervalMs
            );

            // 等待应用完全启动
            await Task.Delay(3000, stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // 获取当前时间
                    var startTime = DateTime.UtcNow;

                    // 并发推送所有产线数据
                    await PushAllProductionLinesDataAsync(stoppingToken);

                    // 计算耗时
                    var elapsed = (DateTime.UtcNow - startTime).TotalMilliseconds;

                    // 日志记录（仅在耗时超过500ms时记录）
                    if (elapsed > 500)
                    {
                        _logger.LogWarning(
                            "[RealtimeDataPushBackgroundWorker] 推送耗时: {Elapsed}ms（超过500ms阈值）",
                            elapsed
                        );
                    }

                    // 等待下一次推送
                    var delayMs = Math.Max(0, PushIntervalMs - (int)elapsed);
                    await Task.Delay(delayMs, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    // 正常停止
                    _logger.LogInformation("[RealtimeDataPushBackgroundWorker] 后台推送任务已停止");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "[RealtimeDataPushBackgroundWorker] 推送循环发生异常"
                    );

                    // 异常后等待1秒再重试
                    await Task.Delay(1000, stoppingToken);
                }
            }
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 数据推送逻辑
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 推送所有产线数据
        /// </summary>
        private async Task PushAllProductionLinesDataAsync(CancellationToken cancellationToken)
        {
            // 使用 Scoped 服务
            using var scope = _serviceProvider.CreateScope();
            var aggregatorService = scope.ServiceProvider
                .GetRequiredService<RealtimeDataAggregatorService>();

            // 并发推送所有产线
            var tasks = _productionLineIds.Select(async productionLineId =>
            {
                try
                {
                    await PushProductionLineDataAsync(aggregatorService, productionLineId, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "[RealtimeDataPushBackgroundWorker] 推送产线 {ProductionLineId} 数据失败",
                        productionLineId
                    );
                }
            });

            await Task.WhenAll(tasks);
        }

        /// <summary>
        /// 推送单个产线数据
        /// </summary>
        private async Task PushProductionLineDataAsync(
            RealtimeDataAggregatorService aggregatorService,
            string productionLineId,
            CancellationToken cancellationToken)
        {
            // 1. 聚合实时数据
            var data = await aggregatorService.GetCurrentDataAsync(productionLineId);

            if (data == null)
            {
                _logger.LogWarning(
                    "[RealtimeDataPushBackgroundWorker] 产线 {ProductionLineId} 数据聚合失败",
                    productionLineId
                );
                return;
            }

            // 2. 通过SignalR推送到订阅者
            await ProductionLineHub.PushDataToSubscribers(
                _hubContext,
                productionLineId,
                data
            );

            _logger.LogTrace(
                "[RealtimeDataPushBackgroundWorker] 已推送产线 {ProductionLineId} 数据",
                productionLineId
            );
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 生命周期
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("[RealtimeDataPushBackgroundWorker] 后台推送任务正在启动...");
            return base.StartAsync(cancellationToken);
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("[RealtimeDataPushBackgroundWorker] 后台推送任务正在停止...");
            return base.StopAsync(cancellationToken);
        }
    }
}

